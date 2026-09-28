# PRD — Al Amaan Exchange Feasibility Study (Web Document)

## Original problem statement
استيراد مشروع "أمان" من GitHub وتشغيله على منصة Emergent. الغرض: عرض تقرير دراسة جدوى لشركة Alaman Exchange (146 صفحة)، مع تحميل صفحات المستند كصور عالية الدقة (Playwright)، ونسخة عربية (RTL) كاملة من المستند.

## Architecture
- Frontend React (CRA/craco/Tailwind). `src/doc/*` builds the paginated A4 document; `App.js` toolbar + TOC panel + language toggle + export triggers.
- Backend FastAPI: export pipeline in `backend/exporter.py` using Playwright + system Chromium to server-side render/screenshot every `.a4` page (supports `?lang=ar`).
- Images: `/frontend/public/img/*`.
- English content: `content.jsx` → `part1..5.jsx` + `annexes.jsx`, via `blocks.jsx` (Fig/FullFig default `object-fit: contain`, no cropping).
- Arabic content: `content_ar.jsx` → `part1_ar.jsx` (fully translated) + `blocks_ar.jsx`, `FrontMatter_ar.jsx`, `PaginatorAr.jsx`.

## Implemented
- 2026-07: Re-imported repo, Playwright-based ZIP/image export (no html2canvas), verified end-to-end.
- 2026-08 (session, post filesystem-reset recovery):
  - Restored global company name "ALAMAN EXCHANGE".
  - Chapter 18 (part5.jsx, English) rewritten: brand owner ActPro Co., Ltd. (Japan) + contract manufacturer Shenzhen Hongzhou Smart Technology (China), with company-profile tables and 5 uncropped photos (`actpro-tokyo-hq.jpg`, `actpro-smart-exchange-front.png`, `hongzhou-factory-floor.jpg`, `hongzhou-assembly-line.jpg`, `hongzhou-kiosk-oman-omantel.jpg`) extracted from user PDFs into `public/img/`.
  - Backend `lang` param + frontend language toggle + RTL CSS restored.
  - Arabic scaffolding recreated: `blocks_ar.jsx`, `FrontMatter_ar.jsx`, `content_ar.jsx`, `PaginatorAr.jsx`, `part1_ar.jsx` (Chapter 1 fully translated, high quality).
  - **Critical fix**: `content_ar.jsx` was importing `part2_ar.jsx`…`annexes_ar.jsx` which don't exist yet → entire app (both EN and AR) failed to compile (blank/error screen). Fixed by temporarily aliasing English `part2`–`part5`/`annexes` as fallback in `content_ar.jsx` (commented as TODO) so the app runs while translation is pending.
  - Verified via screenshot (EN + AR toggle): app compiles, Chapter 18 images (ActPro/Hongzhou) render fully uncropped (`object-fit: contain` already correct, letterboxed not cropped).
  - User explicitly deferred (for now): full Arabic translation of Ch.2–18/Annexes, deleting page 104, and Arabic ZIP button validation.

## Implemented (cont.)
- 2026-08: Deleted the "2.3 · Oman Vision 2040 — The Policy Frame" section/page (heading + 2 paragraphs + Cards) from Chapter 2 in both `part1.jsx` and `part1_ar.jsx`, per user's visual-edit request targeting that exact rendered page. Document re-paginates automatically (was 126 pages, now 125); verified via screenshot before/after.

## Backlog (deferred by user, awaiting go-ahead)
- P0: Translate `part2_ar.jsx`…`annexes_ar.jsx` (real Arabic, replacing the temporary English fallback in `content_ar.jsx`).
- P0: Delete "page 104" — page numbers are computed dynamically by `Paginator.jsx` (not hardcoded); need user to specify which content is on page 104, or agent to screenshot that exact page to identify it before removing.
- P1: Validate Arabic "Download ZIP" button end-to-end (backend `?lang=ar` export).
- P2: Company logo, direct share link, in-document search, export UX polish (cancel button, thumbnails).

## Next tasks
- Awaiting user go-ahead to resume Arabic translation (part2–annexes) and page-104 deletion.
