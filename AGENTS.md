# Base44 Dev Environment

## Stack
- **Frontend**: React 19 via Create React App + craco (`yarn start` / `craco start`), Tailwind, shadcn-style UI. Dev server on port 3000.
- **Backend**: FastAPI + Motor (async MongoDB) in `backend/server.py`. Uvicorn with `--reload` on port 8000.
- **Database**: MongoDB 7 (compose service `mongo`).

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
Frontend (preview entry): http://localhost:3000
Backend API: http://localhost:8000/api/

## Key wiring
- The frontend reaches the backend through `REACT_APP_BACKEND_URL`, set in compose to the backend's public URL (`https://8000-$BASE44_PUBLIC_HOST_SUFFIX`).
- The backend's `CORS_ORIGINS` is set to the frontend's public origin.
- `MONGO_URL` and `DB_NAME` are local-infra values generated in compose (not user secrets). `server.py` reads them with `os.environ[...]` at import time, so the backend will not boot without them.

## Notes / quirks
- `backend/requirements.txt` lists `emergentintegrations` (a private package not on public PyPI), `jq`, `pandas`, `numpy`, and `boto3`, but `server.py` imports none of them. The compose backend service installs only the packages the server actually uses, so the image builds reliably. If you add features that import those packages, extend the `pip install` list in `docker-compose.base44.yml`.
- Frontend host checking is disabled (`DANGEROUSLY_DISABLE_HOST_CHECK=true`) and file watching uses polling (`CHOKIDAR_USEPOLLING=true`) because the source is bind-mounted.
- No external service credentials are required; everything runs locally in compose.

## Verifying it works
- `curl -s localhost:8000/api/` returns a JSON message.
- `curl -s localhost:3000` returns the CRA HTML shell.
- Backend tests: `docker compose -f docker-compose.base44.yml exec -T backend pytest` (requires `REACT_APP_BACKEND_URL` pointing at the backend).
