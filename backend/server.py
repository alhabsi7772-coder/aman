from fastapi import FastAPI, APIRouter, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class DownloadEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    format: str  # "pdf" | "word"
    page_count: Optional[int] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    ip: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DownloadEventCreate(BaseModel):
    format: str
    page_count: Optional[int] = None
    referrer: Optional[str] = None


class DownloadStats(BaseModel):
    total_downloads: int
    pdf_downloads: int
    word_downloads: int
    last_download_at: Optional[datetime] = None


@api_router.get("/")
async def root():
    return {"message": "Aman Modern Exchange — Feasibility Study API"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    rows = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for r in rows:
        if isinstance(r['timestamp'], str):
            r['timestamp'] = datetime.fromisoformat(r['timestamp'])
    return rows


@api_router.post("/analytics/download", response_model=DownloadEvent)
async def log_download(payload: DownloadEventCreate, request: Request):
    fmt = payload.format.lower().strip()
    if fmt not in ("pdf", "word"):
        fmt = "pdf"
    ev = DownloadEvent(
        format=fmt,
        page_count=payload.page_count,
        referrer=payload.referrer,
        user_agent=request.headers.get("user-agent"),
        ip=request.client.host if request.client else None,
    )
    doc = ev.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.download_events.insert_one(doc)
    return ev


@api_router.get("/analytics/stats", response_model=DownloadStats)
async def get_stats():
    total = await db.download_events.count_documents({})
    pdfs = await db.download_events.count_documents({"format": "pdf"})
    words = await db.download_events.count_documents({"format": "word"})
    last_doc = await db.download_events.find_one(
        {}, {"_id": 0, "timestamp": 1}, sort=[("timestamp", -1)]
    )
    last_at = None
    if last_doc and last_doc.get("timestamp"):
        ts = last_doc["timestamp"]
        last_at = datetime.fromisoformat(ts) if isinstance(ts, str) else ts
    return DownloadStats(
        total_downloads=total,
        pdf_downloads=pdfs,
        word_downloads=words,
        last_download_at=last_at,
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
