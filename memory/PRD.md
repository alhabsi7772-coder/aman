# PRD — Al Amaan Exchange Feasibility Study (Web Document)

## Original problem statement
استيراد مشروع "أمان" من GitHub (https://github.com/alhabsi7772-coder/aman.git) وتشغيله على منصة Emergent. الغرض: عرض تقرير دراسة جدوى لشركة Alamaan Exchange، مع إمكانية تحميل صفحات المستند كصور عالية الدقة.

## Architecture
- Frontend React (CRA/craco/Tailwind). `src/doc/*` builds the paginated A4 document; `App.js` toolbar + TOC panel + export triggers.
- Backend FastAPI: GET /api/, POST/GET /api/status (MongoDB via motor). Export pipeline in `backend/exporter.py` using Playwright + system Chromium (`/usr/bin/chromium`) to server-side render and screenshot every `.a4` page from the live frontend (http://localhost:3000) — pixel-perfect, no client-side canvas approximation.
- Images: `/frontend/public/img/*`.

## Implemented
- 2026-07: Re-imported repo as-is, configured env, installed deps, verified.
- 2026-07: Removed "Download PDF"/"Word" buttons and all related export code (html2canvas/jsPDF/html-docx-js/file-saver) + backend analytics endpoints, per user request.
- 2026-07: Added "Download Images" and "Download ZIP" buttons. Initial version used client-side html2canvas — user explicitly rejected this ("never use html2canvas, it distorts pages, I want images identical to the HTML").
- 2026-07 (final): Rebuilt export using **server-side Playwright** (system Chromium, no bundled browser download needed):
  - `POST /api/export/start` → launches a background job (asyncio task) that navigates Playwright's headless Chromium to the frontend, waits for `window.__docReady`, hides toolbar/TOC via `[data-no-export="true"]`, then screenshots each `.doc-shell > .a4` element (device_scale_factor=2) and zips them into `/tmp/aman_exports/{job_id}.zip`.
  - `GET /api/export/status/{job_id}` → polled every 700ms by frontend for live progress (current/total).
  - `GET /api/export/download/{job_id}` → streams the ZIP, deletes temp file after.
  - "Download ZIP" button: waits for job, then navigates to the download URL directly (native browser download).
  - "Download Images" button: waits for job, fetches the same ZIP, unzips client-side with JSZip (only used for unzipping, NOT capturing), then triggers ~146 sequential individual PNG downloads (page-001.png … page-146.png) with 250ms delay between each.
  - Verified end-to-end via curl (job polling, 146-page zip, ~104MB) and frontend testing agent: both buttons work, progress overlay accurate, correct filenames, zero console errors. Full export takes ~90s at scale=2.
  - Env vars added: `FRONTEND_INTERNAL_URL=http://localhost:3000`, `PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium` in backend/.env.

## Backlog
- P2: Arabic edition (RTL) — previously deferred by user.
- P2: Company logo — previously declined by user.
- P2: Could add cancel-job button if user wants to abort a long-running export mid-way.

## Next tasks
- Awaiting further user feedback.
