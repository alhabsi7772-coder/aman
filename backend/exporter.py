import asyncio
import os
import uuid
import zipfile
from pathlib import Path

from playwright.async_api import async_playwright

FRONTEND_URL = os.environ['FRONTEND_INTERNAL_URL']
CHROMIUM_PATH = os.environ['PLAYWRIGHT_CHROMIUM_PATH']
EXPORT_DIR = Path("/tmp/aman_exports")
EXPORT_DIR.mkdir(exist_ok=True)

_jobs = {}
_background_tasks = set()


async def _render_pages(job_id: str, scale: int):
    job = _jobs[job_id]
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            executable_path=CHROMIUM_PATH,
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        try:
            context = await browser.new_context(
                device_scale_factor=scale, viewport={"width": 1200, "height": 1000}
            )
            page = await context.new_page()
            await page.goto(FRONTEND_URL, wait_until="load", timeout=60000)
            await page.wait_for_function("() => window.__docReady === true", timeout=60000)
            await page.evaluate(
                "document.querySelectorAll('[data-no-export=\"true\"]').forEach(el => { el.style.display = 'none'; })"
            )
            elements = await page.query_selector_all(".doc-shell > .a4")
            job["total"] = len(elements)

            zip_path = EXPORT_DIR / f"{job_id}.zip"
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for i, el in enumerate(elements):
                    data = await el.screenshot(type="png")
                    page_num = await el.get_attribute("data-page") or str(i + 1)
                    zf.writestr(f"page-{int(page_num):03d}.png", data)
                    job["current"] = i + 1
            job["file_path"] = str(zip_path)
            job["status"] = "done"
        finally:
            await browser.close()


async def _run_job(job_id: str, scale: int):
    try:
        await _render_pages(job_id, scale)
    except Exception as e:
        _jobs[job_id]["status"] = "error"
        _jobs[job_id]["error"] = str(e)


async def start_export_job(scale: int = 2) -> str:
    job_id = uuid.uuid4().hex
    _jobs[job_id] = {"status": "running", "current": 0, "total": 0, "error": None, "file_path": None}
    task = asyncio.create_task(_run_job(job_id, scale))
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)
    return job_id


def get_job(job_id: str):
    return _jobs.get(job_id)


def cleanup_job(job_id: str):
    job = _jobs.pop(job_id, None)
    if job and job.get("file_path"):
        try:
            os.remove(job["file_path"])
        except OSError:
            pass
