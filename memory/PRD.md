# PRD — Al MAAN Exchange Feasibility Study (Web Document)

## Original problem statement
استيراد مشروع "أمان" من GitHub (https://github.com/alhabsi7772-coder/aman.git) كما هو، بدون أي تعديل في المنطق أو التصميم، وتشغيله على منصة Emergent. الغرض من المشروع: عرض وتوليد تقرير دراسة جدوى لشركة الأمان (Al MAAN Exchange) بصيغة PDF/Word.

## Architecture
- Frontend React (CRA/craco/Tailwind). `src/doc/blocks.jsx` block builders, `src/doc/part1..5.jsx`, `annexes.jsx`, `content.jsx` (META, buildDocument), `src/doc/Paginator.jsx` (auto-paginates content into A4 pages, sets `window.__docReady`), `src/doc/FrontMatter.jsx` (cover, TOC, back cover).
- `App.js`: toolbar (Contents/Word/PDF), TOC panel, PDF export (html2canvas+jsPDF, ~149 pages ~30MB), Word export (html-docx-js), analytics POST on download.
- Backend FastAPI: GET /api/, POST/GET /api/status, POST /api/analytics/download, GET /api/analytics/stats (MongoDB via motor).
- Images: `/frontend/public/img/*` (kiosk/exchange machine photos, diagrams).

## Implemented (2026-07, this session)
- Imported full repo as-is into /app (rsync excluding .git, .env files preserved from Emergent env).
- Installed backend (pip) and frontend (yarn) dependencies; restarted supervisor services.
- Verified via testing agent: backend 6/6 pytest pass; frontend loads cover page, 150 A4 pages render, TOC opens/scrolls correctly, PDF export (149 pages, ~30MB) and Word export (~1.6MB) both complete without JS errors.
- No functional/design changes made — import preserved original logic and UI exactly.

## Backlog (from original repo, deferred per user request — import as-is only)
- P1: Arabic edition (separate RTL file, same design) — user deferred.
- P1: Company logo (user declined for now).
- P2: Chapter-end pages with low fill could be tightened.
- P2: Reject invalid `format` in analytics endpoint with 400 (currently silently normalized to "pdf").
- P2: Optional lower-resolution "light PDF" toggle (current PDF ~30MB for 149 pages).

## Next tasks
- Awaiting user review/feedback before any further changes (Phase 2/3 out of scope unless requested).
