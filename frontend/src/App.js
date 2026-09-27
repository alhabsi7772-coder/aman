import React, { useState, useEffect, useRef, useMemo } from "react";
import "@/App.css";
import "@/index.css";
import {
  List as ListIcon,
  X,
  ChevronRight,
} from "lucide-react";

import Paginator from "@/doc/Paginator";
import { buildDocument, META } from "@/doc/content";

function App() {
  const [tocOpen, setTocOpen] = useState(false);
  const docRef = useRef(null);
  const [chapters, setChapters] = useState([]);
  const doc = useMemo(() => buildDocument(), []);
  const onLayout = (info) => {
    setChapters(doc.map((c) => ({ num: c.num, title: c.title, page: info.starts[c.key], key: c.key })));
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

      {/* DOCUMENT */}
      <div className="doc-shell" ref={docRef} data-testid="document-shell">
        <Paginator chapters={doc} meta={META} onLayout={onLayout} />
      </div>
    </div>
  );
}

export default App;
