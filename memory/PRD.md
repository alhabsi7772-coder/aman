# PRD — Al Amaan Exchange Feasibility Study (Web Document)

## Original problem statement
استيراد مشروع "أمان" من GitHub (https://github.com/alhabsi7772-coder/aman.git) كما هو، وتشغيله على منصة Emergent. الغرض: عرض تقرير دراسة جدوى لشركة Alamaan Exchange.

## Architecture
- Frontend React (CRA/craco/Tailwind). `src/doc/*` builds the paginated A4 document; `App.js` toolbar + TOC panel.
- Backend FastAPI: GET /api/, POST/GET /api/status (MongoDB via motor).
- Images: `/frontend/public/img/*`.

## Implemented
- 2026-07: Re-imported repo as-is into /app, configured .env, installed deps, verified via testing agent (backend 6/6 pytest pass; frontend renders 150 pages, TOC works).
- 2026-07 (this session): Removed "Download PDF" and "Word" export buttons and ALL related code per user request:
  - Frontend: removed handleDownloadPDF/handleDownloadWord, jsPDF/html2canvas/html-docx-js/file-saver dynamic imports and usage, pdf-overlay UI, related CSS in index.css.
  - Backend: removed POST /api/analytics/download and GET /api/analytics/stats endpoints + DownloadEvent/DownloadStats models (were only used for tracking PDF/Word downloads).
  - Removed now-unused npm packages: jspdf, html2canvas, html-docx-js, file-saver.
  - Verified via frontend testing agent: toolbar shows only "Contents" button, TOC still works, document renders all 150 pages, no console errors, no leftover PDF UI.

## Backlog
- P2: Arabic edition (RTL) — previously deferred by user.
- P2: Company logo — previously declined by user.

## Next tasks
- Awaiting further user feedback.
