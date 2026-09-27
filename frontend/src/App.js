import React, { useState, useEffect, useRef, useMemo } from "react";
import "@/App.css";
import "@/index.css";
import axios from "axios";
import {
  Download,
  FileText,
  List as ListIcon,
  X,
  Loader2,
  ChevronRight,
} from "lucide-react";

import Paginator from "@/doc/Paginator";
import { buildDocument, META } from "@/doc/content";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;


function App() {
  const [tocOpen, setTocOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfCurrent, setPdfCurrent] = useState(0);
  const [pdfTotal, setPdfTotal] = useState(0);
  const [wordBusy, setWordBusy] = useState(false);
  const docRef = useRef(null);
  const [chapters, setChapters] = useState([]);
  const doc = useMemo(() => buildDocument(), []);
  const onLayout = (info) => {
    setChapters(doc.map((c) => ({ num: c.num, title: c.title, page: info.starts[c.key], key: c.key })));
  };

  /* helper: log analytics (best-effort, never blocks UX) */
  const logDownload = async (format, pageCount) => {
    try {
      await axios.post(`${API}/analytics/download`, {
        format,
        page_count: pageCount,
        referrer: typeof document !== "undefined" ? document.referrer : null,
      });
    } catch (e) {
      // analytics errors are silent
    }
  };

  /* ── TOC: smooth scroll ── */
  const goToPage = (pageNum) => {
    setTocOpen(false);
    const el = document.querySelector(`[data-page="${pageNum}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* ── PDF EXPORT ── */
  const handleDownloadPDF = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);

    try {
      // dynamic imports to keep first paint fast
      const [{ default: jsPDF }, html2canvasMod] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const html2canvas = html2canvasMod.default;

      // wait for fonts
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // make sure every image is decoded before capture
      await Promise.all(
        Array.from(document.images).map((im) =>
          im.complete ? Promise.resolve() : new Promise((r) => { im.onload = r; im.onerror = r; })
        )
      );

      const pages = Array.from(document.querySelectorAll(".doc-shell .a4")).filter((el) => !el.closest(".measure"));
      setPdfTotal(pages.length);
      setPdfCurrent(0);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      for (let i = 0; i < pages.length; i++) {
        const el = pages[i];

        // snapshot original inline styles
        const original = {
          height: el.style.height,
          minHeight: el.style.minHeight,
          maxHeight: el.style.maxHeight,
          overflow: el.style.overflow,
          boxShadow: el.style.boxShadow,
        };

        // lock to exact A4 dims
        el.style.height = "297mm";
        el.style.minHeight = "297mm";
        el.style.maxHeight = "297mm";
        el.style.overflow = "hidden";
        el.style.boxShadow = "none";

        // capture
        // eslint-disable-next-line no-await-in-loop
        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 15000,
          letterRendering: true,
          ignoreElements: (node) => {
            if (!node.getAttribute) return false;
            if (node.getAttribute("data-no-export") === "true") return true;
            // skip every other page so html2canvas clones only the page being captured
            return node.classList.contains("a4") && node !== el;
          },
        });

        // restore
        el.style.height = original.height;
        el.style.minHeight = original.minHeight;
        el.style.maxHeight = original.maxHeight;
        el.style.overflow = original.overflow;
        el.style.boxShadow = original.boxShadow;

        const imgData = canvas.toDataURL("image/jpeg", 0.97);
        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "NONE");

        setPdfCurrent(i + 1);
      }

      pdf.save("Alamaan-Exchange-Feasibility-Study.pdf");
      logDownload("pdf", pages.length);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setPdfBusy(false);
      setPdfCurrent(0);
      setPdfTotal(0);
    }
  };

  /* ── WORD EXPORT ── */
  const handleDownloadWord = async () => {
    if (wordBusy) return;
    setWordBusy(true);
    try {
      const [{ default: htmlDocx }, fileSaverMod] = await Promise.all([
        import("html-docx-js/dist/html-docx"),
        import("file-saver"),
      ]);
      const { saveAs } = fileSaverMod;

      const doc = document.querySelector(".doc-shell");
      if (!doc) return;

      // clone and strip non-export elements
      const clone = doc.cloneNode(true);
      clone.querySelectorAll('[data-no-export="true"]').forEach((n) => n.remove());

      const inlineCss = `
        body { font-family: Manrope, Calibri, Arial, sans-serif; color: #0f172a; }
        h1 { font-family: Fraunces, Georgia, serif; color: #0b2545; font-size: 28pt; margin-bottom: 6mm; }
        h2 { font-family: Fraunces, Georgia, serif; color: #0b2545; font-size: 20pt; }
        h3 { color: #1e4d8c; font-size: 14pt; }
        .a4 { padding: 20mm 18mm; page-break-after: always; }
        .a4.cover, .a4.dark { background: #0b2545; color: #fff; }
        .a4.cover h1, .a4.dark h1, .a4.cover h2, .a4.dark h2 { color: #fff; }
        .stat-grid { display: table; width: 100%; }
        .stat-card { display: table-cell; padding: 4mm; border: 1px solid #d8e0ec; }
        .stat-card .label { font-size: 8pt; letter-spacing: 2pt; color: #475569; }
        .stat-card .value { font-size: 22pt; color: #0b2545; font-weight: 700; }
        .tbl { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 4mm 0; }
        .tbl th { background: #0b2545; color: #fff; padding: 3mm; text-align: left; }
        .tbl td { border: 1px solid #d8e0ec; padding: 2mm 3mm; }
        .callout { border-left: 3px solid #3b82f6; background: #eff6ff; padding: 4mm; margin: 3mm 0; }
        .callout.gold { border-left-color: #d4a017; background: #fff7e6; }
        .badge { display: inline-block; padding: 1mm 3mm; border-radius: 8pt; font-size: 8pt; font-weight: 700; }
        .badge.high { background: #fee2e2; color: #991b1b; }
        .badge.med { background: #fef3c7; color: #92400e; }
        .badge.low { background: #d1fae5; color: #065f46; }
      `;

      const html =
        `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${inlineCss}</style></head>` +
        `<body>${clone.innerHTML}</body></html>`;

      const blob = htmlDocx.asBlob(html, { orientation: "portrait", margins: { top: 720, bottom: 720, left: 720, right: 720 } });
      saveAs(blob, "Alamaan-Exchange-Feasibility-Study.docx");
      logDownload("word", clone.querySelectorAll(".a4").length);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Word export failed:", err);
      alert("Word export failed. Please try again.");
    } finally {
      setWordBusy(false);
    }
  };

  // ESC closes TOC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setTocOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="App">
      {/* TOOLBAR */}
      <div className="toolbar" data-no-export="true">
        <button
          className="tool-btn secondary"
          onClick={() => setTocOpen((v) => !v)}
          data-testid="toc-toggle-button"
          aria-label="Open Contents"
        >
          <ListIcon size={16} /> Contents
        </button>
        <button
          className="tool-btn secondary"
          onClick={handleDownloadWord}
          disabled={wordBusy}
          data-testid="word-download-button"
        >
          {wordBusy ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
          Word
        </button>
        <button
          className="tool-btn"
          onClick={handleDownloadPDF}
          disabled={pdfBusy}
          data-testid="pdf-download-button"
        >
          {pdfBusy ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          Download PDF
        </button>
      </div>

      {/* TOC PANEL */}
      <aside
        className={`toc-panel ${tocOpen ? "open" : ""}`}
        data-no-export="true"
        data-testid="toc-panel"
        aria-hidden={!tocOpen}
      >
        <div className="toc-panel-head">
          <h3>Document Contents</h3>
          <button
            className="tool-btn secondary"
            onClick={() => setTocOpen(false)}
            aria-label="Close Contents"
            data-testid="toc-close-button"
            style={{ padding: "6px 10px" }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="toc-panel-body">
          {chapters.map((c) => (
            <button
              key={c.key}
              className="toc-item"
              onClick={() => goToPage(c.page)}
              data-testid={`toc-item-${c.key}`}
              title={c.title}
            >
              <span className="num">{typeof c.num === "number" ? String(c.num).padStart(2, "0") : c.num}</span>
              <span className="ti">
                {c.title}
                <ChevronRight size={12} style={{ display: "inline", marginLeft: 4, color: "#64748b" }} />
              </span>
              <span className="pg">{String(c.page).padStart(3, "0")}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* PDF OVERLAY */}
      {pdfBusy && (
        <div className="pdf-overlay" data-no-export="true" data-testid="pdf-overlay">
          <div className="pdf-overlay-card">
            <div className="ico"><Loader2 className="spin" size={24} /></div>
            <h3>Building your PDF…</h3>
            <div className="sub">
              Rendering each A4 page at high fidelity. Please keep this tab focused.
            </div>
            <div className="pdf-progress">
              <div
                className="pdf-progress-bar"
                style={{ width: pdfTotal ? `${(pdfCurrent / pdfTotal) * 100}%` : "0%" }}
              />
            </div>
            <div className="pdf-counter" data-testid="pdf-progress-counter">
              {pdfCurrent} / {pdfTotal} PAGES
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT */}
      <div className="doc-shell" ref={docRef} data-testid="document-shell">
        <Paginator chapters={doc} meta={META} onLayout={onLayout} />
      </div>
    </div>
  );
}

export default App;
