import React from "react";
import { Table } from "../components/Page";

let T = 0;
let F = 0;
export const resetCounters = () => { T = 0; F = 0; };

const blk = (type, node, extra = {}) => ({ type, node, ...extra });

/* tiny inline markup: **bold** */
export const md = (text) => {
  if (typeof text !== "string") return text;
  const parts = text.split("**");
  return parts.map((s, i) => (i % 2 ? <strong key={i}>{s}</strong> : s));
};

export const P = (text) => blk("p", <p>{md(text)}</p>, { text });
export const Lede = (text) => blk("p", <p className="lede">{md(text)}</p>);
export const Sec = (code, title) =>
  blk("h2", (
    <div className="sec">
      <div className="eyebrow">{code}</div>
      <div className="rule-gold" />
      <h2>{title}</h2>
    </div>
  ), { heading: true });
export const H3 = (t) => blk("h3", <h3>{t}</h3>, { heading: true });

export const Tbl = (title, head, rows, note) => {
  T += 1;
  const n = T;
  return blk("table", (
    <div className="tblwrap">
      <div className="tbl-title"><span className="tno">Table {n}</span>{title}</div>
      <Table head={head} rows={rows} />
      {note && <div className="tbl-note">{note}</div>}
    </div>
  ), { title, no: n });
};

export const Fig = (title, src, h = 80, fit = "contain") => {
  F += 1;
  const n = F;
  return blk("figure", (
    <figure className="fig" style={{ height: `${h}mm` }}>
      <div className="fig-img"><img src={src} alt={title} crossOrigin="anonymous" style={{ objectFit: fit }} /></div>
      <figcaption><span className="fno">Figure {n}</span>{title}</figcaption>
    </figure>
  ), { title, no: n });
};

export const FullFig = (title, src, caption, fit = "contain", dark = false) => {
  F += 1;
  const n = F;
  return blk("fullpage", (
    <div className={`fullfig ${dark ? "dark" : ""}`}>
      <div className="fullfig-img"><img src={src} alt={title} crossOrigin="anonymous" style={{ objectFit: fit }} /></div>
      <div className="fullfig-cap">
        <div className="fno">Figure {n}</div>
        <div className="ft">{title}</div>
        {caption && <div className="fc">{caption}</div>}
      </div>
    </div>
  ), { title, no: n, dark });
};

export const Stats = (items) =>
  blk("stats", (
    <div className={`stat-grid cols-${items.length}`}>
      {items.map((s, i) => (
        <div key={i} className={`stat-card ${s.gold ? "gold" : ""}`}>
          <div className="label">{s.label}</div>
          <div className="value"><span className="num">{s.value}</span> {s.unit && <span className="unit">{s.unit}</span>}</div>
          {s.desc && <div className="desc">{s.desc}</div>}
        </div>
      ))}
    </div>
  ));

export const Note = (kicker, text, gold = false) =>
  blk("callout", (
    <div className={`callout ${gold ? "gold" : ""}`}>
      <span className="k">{kicker}</span>
      {md(text)}
    </div>
  ));

export const Synth = (title, items) =>
  blk("synth", (
    <div className="synthesis">
      <div className="k">For the Investment Committee</div>
      <div className="h">{title}</div>
      <ul>{items.map((it, i) => <li key={i}>{md(it)}</li>)}</ul>
    </div>
  ));

export const Bars = (rows) =>
  blk("bars", (
    <div className="bar-chart">
      {rows.map((r, i) => (
        <div key={i} className={`bar-row ${r.tone || ""}`}>
          <div className="lbl">{r.label}</div>
          <div className="track"><div className="fill" style={{ width: `${r.pct}%` }} /></div>
          <div className="val">{r.value}</div>
        </div>
      ))}
    </div>
  ));

export const Swot = (S, W, O, Th) =>
  blk("swot", (
    <div className="swot">
      {[["S", "Strengths", S], ["W", "Weaknesses", W], ["O", "Opportunities", O], ["T", "Threats", Th]].map(([k, h, items]) => (
        <div key={k} className={`q ${k}`}>
          <div className="h">{h}</div>
          <ul>{items.map((it, i) => <li key={i}>{md(it)}</li>)}</ul>
        </div>
      ))}
    </div>
  ));

export const Steps = (items) =>
  blk("steps", (
    <ol className="steps">
      {items.map(([h, d], i) => (
        <li key={i}><div className="h">{h}</div><div className="d">{md(d)}</div></li>
      ))}
    </ol>
  ));

export const Check = (items) =>
  blk("check", <ul className="check">{items.map((it, i) => <li key={i}>{md(it)}</li>)}</ul>);

export const Bul = (items) =>
  blk("ul", <ul className="bul">{items.map((it, i) => <li key={i}>{md(it)}</li>)}</ul>);

export const Flow = (steps) =>
  blk("flow", (
    <div className="flow">
      {steps.map(([t, d], i) => (
        <div key={i} className="step">
          <div className="n">STEP {String(i + 1).padStart(2, "0")}</div>
          <div className="t">{t}</div>
          <div className="small">{d}</div>
        </div>
      ))}
    </div>
  ));

export const Quote = (text) => blk("quote", <div className="pullquote">{text}</div>);

export const Cards = (items) =>
  blk("cards", (
    <div className={`stat-grid cols-${Math.min(items.length, 4)}`}>
      {items.map(([t, d], i) => (
        <div key={i} className="mini-card">
          <div className="ico">{String(i + 1).padStart(2, "0")}</div>
          <div className="t">{t}</div>
          <div className="d">{md(d)}</div>
        </div>
      ))}
    </div>
  ));

export const Risk = (cells) =>
  blk("risk", (
    <div className="risk-matrix">
      {cells.map(([h, d, lvl], i) => (
        <div key={i} className="risk-cell">
          <div className="h">{h}</div>
          <div className="small">{d}</div>
          <span className={`badge ${lvl}`}>{lvl}</span>
        </div>
      ))}
    </div>
  ));

export const TwoCol = (left, right) =>
  blk("twocol", <div className="two-col"><div>{left}</div><div>{right}</div></div>);

/* numeric cell helper for Table */
export const n = (v) => ({ num: true, v });
export const total = (cells) => ({ _cls: "total", cells });
export const rec = (cells) => ({ _cls: "recommended", cells });

export const mkCh = (num, title, tag, blocks) => {
  const isNum = typeof num === "number";
  const pad = isNum ? String(num).padStart(2, "0") : num;
  const isAnnex = !isNum && num.length === 1;
  return {
    key: isNum ? `ch${pad}` : isAnnex ? `ax${num}` : "conclusion",
    num, title, tag, blocks,
    eyebrow: isNum ? `Chapter ${pad}` : isAnnex ? `Annex ${num}` : "Closing Chapter",
    label: isNum ? `Ch ${pad} · ${title}` : isAnnex ? `Annex ${num} · ${title}` : title,
  };
};
