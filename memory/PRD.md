# PRD — Al MAAN Exchange Feasibility Study (Web Document)

## Original problem statement
Print-ready web document: "A Comprehensive Feasibility Study of the Self-Service Currency Exchange Machine in the Sultanate of Oman" for **Al MAAN Exchange (الأمان للصرافة)**. 120–150 A4 pages, Big4-style analytical prose, navy/gold theme (Fraunces/Manrope/JetBrains Mono kept per user), toolbar with Contents panel, Word export and direct PDF export; backend analytics for downloads. User communicates in **Arabic**; document is **English** (Arabic edition deferred).

## Fixed structure (never renumber — new content goes into Annexes)
Cover · Approval & Regulatory Notice · TOC · List of Tables · List of Figures ·
Ch 1 Introduction (exec summary, methodology, assumptions) · Ch 2 About Oman & Vision 2040 (geography, population/tourism 2026, tourism & hotel sectors) · Ch 3 Qatar case study (Al Dar for Exchange Works, GCC deployments, QCB rules) · Ch 4 FX & banking in Oman · Ch 5 Implementing the project (KME 12→1 vs OCE 12→12, CBO sandbox route, launch plan, supply chain, cash cycle) · Ch 6 Hotel sector & 7 target hotels · Ch 7 Tourist sites (Muttrah) · Ch 8 Economic value added · Ch 9 Financial calculations & P&L (0.5/0.8/1.2 scenarios, capex, opex, unit economics, break-even) · Ch 10 5-year hotel deployment + hotel-by-hotel model · Ch 11 Projected P&L / CF / BS + NPV/IRR/ROI/payback/break-even · Ch 12 SWOT · Ch 13 Risk assessment · Ch 14 Business plan (ops model, pricing policy, partnerships, Omanisation from Y2, Phase-2 malls) · Ch 15 IT system (+ manufacturer software options $40k / $20k+tiers) · Ch 16 IT infrastructure · Ch 17 AML/CFT + KYC limits, HR policy · Ch 18 Manufacturer profile, SOPs, InfoSec, incident mgmt · Conclusion · Annex A pricing & site agreements · B financial sensitivity · C hotel-by-hotel P&L · D Qatar-inspired regulatory framework · E machine images (unaltered attachments) · F SLA · G consumer protection · H insurance · Contact page (Al Azri 91133302, Al Habsi 99374709 Habsi98@hotmail.com, Al Nadabi 92664287) · Back cover.

## Key figures (model in /app/memory/model.py)
Machines 3,069.75 (3u) / 3,019.75 (5u) / 2,747 (10u) OMR; software 7,654 one-time + 46/machine/month; Phase-1 capex 22,752.75; float 5,000; buffer 3,247.25 → 31,000 ceiling. Opex Y1 22,617. Base 1.200 OMR/100 USD, 15→17.5 txn/day. Fleet 5/10/16/22/28. Revenue 32,850→208,050; NI 5,512→79,617; NPV@10% 83,749; IRR 62.9%; payback ≈29 months; 5-yr ROI 640%. Break-even 11.7 (1.2) / 17.6 (0.8) / 28.1 (0.5) txn/day.

## Architecture
- Frontend React (CRA/craco/Tailwind). `src/doc/blocks.jsx` block builders (P, Sec, Tbl, Fig, FullFig, Stats, Note, Synth, Swot, Risk…), `src/doc/part1..5.jsx`, `annexes.jsx`, `content.jsx` (META, buildDocument), `src/doc/Paginator.jsx` (measures every block in hidden A4 container, packs into pages: tables/figures atomic, paragraphs split across pages, floatable blocks pull following paragraphs forward, orphan-heading control, short content absorbed onto full-page-figure pages; sets `window.__docReady`), `src/doc/FrontMatter.jsx` (cover, notice, TOC, lists, contact, back cover).
- `App.js`: toolbar, TOC panel fed from layout, PDF export (html2canvas scale 1.7, ignoreElements skips other pages → 149 pages in ~40 s, ~30 MB), Word export (html-docx-js), analytics POST.
- Images: `/public/img/*` copied unaltered from user zip; `/public/exchange-machine.jpg` legacy.
- Backend FastAPI: POST /api/analytics/download, GET /api/analytics/stats (Mongo).

## Implemented (2026-06, this session)
- Full rewrite to Al MAAN Exchange content, 18 chapters + Conclusion + Annexes A–H, 149 pages.
- Auto-pagination engine — zero overflow, zero split tables/figures (verified by testing agent iteration_2).
- 21 new attachment images integrated (12 full-page figures incl. KME/OCE spec & parts sheets, Qatar map, factory).
- PDF export speed fix (5+ min → ~40 s) and A4 fidelity verified with pypdf.

## Backlog
- P1: Arabic edition (separate RTL file, same design) — user deferred.
- P1: Company logo (user declined for now).
- P2: Chapter-end pages with low fill (Synth alone) could be tightened.
- P2: Reject invalid `format` in analytics endpoint with 400.
- P2: Optional lower-resolution "light PDF" toggle.
