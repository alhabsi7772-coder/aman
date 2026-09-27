import React from "react";

/**
 * <Page n={4} chapter="Executive Summary">…</Page>
 * Renders an A4 sheet with header / footer + page number.
 * If `bare` is true (cover, divider) the header/footer chrome is hidden.
 */
export const Page = ({
  n,
  chapter = "",
  className = "",
  bare = false,
  children,
  testId,
}) => {
  return (
    <section
      className={`a4 ${className}`}
      data-page={n}
      data-testid={testId || `page-${n}`}
    >
      {!bare && (
        <header className="page-header">
          <span className="brand">Al MAAN Exchange</span>
          <span className="chapter-tag">{chapter}</span>
        </header>
      )}
      <div className="page-content">{children}</div>
      {!bare && (
        <footer className="page-footer">
          <span>CONFIDENTIAL · AL MAAN EXCHANGE · 2026</span>
          <span className="page-num">{String(n).padStart(3, "0")}</span>
        </footer>
      )}
    </section>
  );
};

/**
 * Full-bleed dark navy chapter divider page.
 */
export const ChapterDivider = ({ n, num, eyebrow, title, tag, testId }) => {
  return (
    <section
      className="a4 dark"
      data-page={n}
      data-testid={testId || `chapter-divider-${num}`}
    >
      <div className="chapter-divider">
        <div className="ch-eye">{eyebrow || `Chapter ${num}`}</div>
        <div className="ch-num">{typeof num === "number" ? String(num).padStart(2, "0") : num}</div>
        <div className="ch-rule" />
        <h2 className="ch-title">{title}</h2>
        {tag && <p className="ch-tag">{tag}</p>}
      </div>
    </section>
  );
};

/* ── Reusable sub-components for content pages ── */

export const Stat = ({ label, value, unit, desc, gold }) => (
  <div className={`stat-card ${gold ? "gold" : ""}`}>
    <div className="label">{label}</div>
    <div className="value">
      <span className="num">{value}</span>{" "}
      {unit && <span className="unit">{unit}</span>}
    </div>
    {desc && <div className="desc">{desc}</div>}
  </div>
);

export const Callout = ({ kicker = "Note", gold = false, children }) => (
  <div className={`callout ${gold ? "gold" : ""}`}>
    <span className="k">{kicker}</span>
    {children}
  </div>
);

export const Synthesis = ({ items = [], title = "Chapter Synthesis" }) => (
  <div className="synthesis">
    <div className="k">For the Management Committee</div>
    <div className="h">{title}</div>
    <ul>
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  </div>
);

export const BarChart = ({ rows = [] }) => (
  <div className="bar-chart">
    {rows.map((r, i) => (
      <div key={i} className={`bar-row ${r.tone || ""}`}>
        <div className="lbl">{r.label}</div>
        <div className="track">
          <div className="fill" style={{ width: `${r.pct}%` }} />
        </div>
        <div className="val">{r.value}</div>
      </div>
    ))}
  </div>
);

export const Table = ({ head = [], rows = [], caption, dense }) => (
  <table className={`tbl ${dense ? "dense" : ""}`}>
    <thead>
      <tr>
        {head.map((h, i) => (
          <th key={i} className={typeof h === "object" && h.num ? "num" : ""}>
            {typeof h === "object" ? h.label : h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={i} className={r._cls || ""}>
          {(r.cells || r).map((c, j) => (
            <td
              key={j}
              className={typeof c === "object" && c.num ? "num" : ""}
            >
              {typeof c === "object" ? c.v : c}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
    {caption && <caption>{caption}</caption>}
  </table>
);

export default Page;
