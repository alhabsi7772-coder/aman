import React, { useState, useEffect, useRef, useMemo } from "react";
import "@/App.css";
import "@/index.css";
import {
  List as ListIcon,
  X,
  ChevronRight,
  ImageDown,
  Archive,
  Loader2,
} from "lucide-react";

import Paginator from "@/doc/Paginator";
import { buildDocument, META } from "@/doc/content";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ask the backend to render every A4 page with a real browser (Playwright)
   and bundle exact, unaltered screenshots into a ZIP — no client-side
   html2canvas involved, so nothing about the page is ever redrawn/approximated */
const startExportJob = async () => {
  const res = await fetch(`${API}/export/start`, { method: "POST" });
  if (!res.ok) throw new Error("Could not start export");
  const data = await res.json();
  return data.job_id;
};

const pollExportJob = async (jobId, onProgress) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await fetch(`${API}/export/status/${jobId}`);
    if (!res.ok) throw new Error("Export status check failed");
    const data = await res.json();
    onProgress(data.current, data.total);
    if (data.status === "done") return;
    if (data.status === "error") throw new Error(data.error || "Export failed");
    await sleep(700);
  }
};

function App() {
  const [tocOpen, setTocOpen] = useState(false);
  const docRef = useRef(null);
  const [chapters, setChapters] = useState([]);
  const doc = useMemo(() => buildDocument(), []);
  const onLayout = (info) => {
    setChapters(doc.map((c) => ({ num: c.num, title: c.title, page: info.starts[c.key], key: c.key })));
  };

  const [imagesBusy, setImagesBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [exportCurrent, setExportCurrent] = useState(0);
  const [exportTotal, setExportTotal] = useState(0);

  /* ── Download every page as separate high-res PNG files (page by page) ── */
  const handleDownloadImages = async () => {
    if (imagesBusy || zipBusy) return;
    setImagesBusy(true);
    try {
      const jobId = await startExportJob();
      await pollExportJob(jobId, (cur, tot) => { setExportCurrent(cur); setExportTotal(tot); });

      const res = await fetch(`${API}/export/download/${jobId}`);
      if (!res.ok) throw new Error("Could not fetch rendered pages");
      const blob = await res.blob();

      const JSZipMod = await import("jszip");
      const JSZip = JSZipMod.default;
      const zip = await JSZip.loadAsync(blob);
      const names = Object.keys(zip.files).sort();

      for (let i = 0; i < names.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const fileBlob = await zip.files[names[i]].async("blob");
        const url = URL.createObjectURL(fileBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = names[i];
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        // small delay between downloads so the browser doesn't block them
        // eslint-disable-next-line no-await-in-loop
        await sleep(250);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Image export failed:", err);
      alert("Image export failed. Please try again.");
    } finally {
      setImagesBusy(false);
      setExportCurrent(0);
      setExportTotal(0);
    }
  };

  /* ── Download every page as a high-res PNG bundled into one ZIP file ── */
  const handleDownloadZip = async () => {
    if (imagesBusy || zipBusy) return;
    setZipBusy(true);
    try {
      const jobId = await startExportJob();
      await pollExportJob(jobId, (cur, tot) => { setExportCurrent(cur); setExportTotal(tot); });

      const a = document.createElement("a");
      a.href = `${API}/export/download/${jobId}`;
      a.download = "Alamaan-Exchange-Pages-Images.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("ZIP export failed:", err);
      alert("ZIP export failed. Please try again.");
    } finally {
      setZipBusy(false);
      setExportCurrent(0);
      setExportTotal(0);
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
          onClick={handleDownloadImages}
          disabled={imagesBusy || zipBusy}
          data-testid="download-images-button"
        >
          {imagesBusy ? <Loader2 size={16} className="spin" /> : <ImageDown size={16} />}
          Download Images
        </button>
        <button
          className="tool-btn"
          onClick={handleDownloadZip}
          disabled={imagesBusy || zipBusy}
          data-testid="download-zip-button"
        >
          {zipBusy ? <Loader2 size={16} className="spin" /> : <Archive size={16} />}
          Download ZIP
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

      {/* EXPORT OVERLAY */}
      {(imagesBusy || zipBusy) && (
        <div className="export-overlay" data-no-export="true" data-testid="export-overlay">
          <div className="export-overlay-card">
            <div className="ico"><Loader2 className="spin" size={24} /></div>
            <h3>{zipBusy ? "Building your ZIP…" : "Preparing images…"}</h3>
            <div className="sub">
              Rendering each A4 page on the server for a pixel-perfect capture. Please keep this tab open.
            </div>
            <div className="export-progress">
              <div
                className="export-progress-bar"
                style={{ width: exportTotal ? `${(exportCurrent / exportTotal) * 100}%` : "0%" }}
              />
            </div>
            <div className="export-counter" data-testid="export-progress-counter">
              {exportCurrent} / {exportTotal} PAGES
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
