import React from "react";
import { Page } from "../components/Page";

export const TOC_ROWS = 10;
export const LIST_ROWS = 24;
export const tocRowCount = (chapters) => chapters.length + 2; // + Contact & Back cover rows

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out.length ? out : [[]];
};

export const Cover = ({ meta }) => (
  <section className="a4 cover" data-page={1} data-testid="page-1">
    <div className="cover-grid">
      <div className="cover-left">
        <div className="cover-brand"><span className="dot" />{meta.company}</div>
        <div className="cover-kicker" style={{ marginTop: "14mm" }}>Comprehensive Feasibility Study · {meta.version}</div>
        <h1 className="cover-title">{meta.title}</h1>
        <p className="cover-sub">{meta.subtitle}</p>
      </div>
      <div className="cover-image-panel">
        <img src="/img/kiosk-hotel-lobby.png" alt="Self-service currency exchange kiosk installed in a hotel lobby" crossOrigin="anonymous" />
      </div>
      <div className="cover-meta">
        <div className="cell"><div className="label">Prepared for</div><div className="value">{meta.company}</div></div>
        <div className="cell"><div className="label">Issue date</div><div className="value">{meta.date}</div></div>
        <div className="cell"><div className="label">Classification</div><div className="value">{meta.classification}</div></div>
      </div>
    </div>
    <div className="cover-foot">SULTANATE OF OMAN · MUSCAT · ENGLISH EDITION</div>
  </section>
);

export const Notice = ({ n, meta }) => (
  <Page n={n} chapter="Approval & Regulatory Notice">
    <div className="eyebrow">Document Control</div>
    <div className="rule-gold" />
    <h2>Approval Sheet & Regulatory Notice</h2>
    <p className="lede">
      This document is a comprehensive feasibility study prepared for the founding partners of {meta.company} ({meta.companyAr}) in respect of a proposed network of self-service currency exchange machines in the Sultanate of Oman. It is issued as <strong>{meta.version}</strong> and supersedes all earlier drafts.
    </p>
    <table className="tbl" style={{ marginTop: "4mm" }}>
      <thead><tr><th>Control Item</th><th>Detail</th></tr></thead>
      <tbody>
        <tr><td>Document title</td><td>{meta.title}</td></tr>
        <tr><td>Version / status</td><td>{meta.version} and Investor Consideration</td></tr>
        <tr><td>Issue date</td><td>{meta.date}</td></tr>
        <tr><td>Classification</td><td>{meta.classification} — distribution restricted to named recipients</td></tr>
        <tr><td>Study currency</td><td>Omani Rial (OMR). USD reference rate 1 USD = 0.3845 OMR (Central Bank of Oman peg)</td></tr>
        <tr><td>Study horizon</td><td>Five financial years from commercial launch (Year 1 – Year 5)</td></tr>
        <tr><td>Founding partners</td><td>Mohammad Al Azri · Omar Al Habsi · Nasar Al Nadabi</td></tr>
      </tbody>
    </table>
    <h3 style={{ marginTop: "6mm" }}>Scope of Use</h3>
    <p>
      The study is intended to support (i) an internal investment decision by the partners, (ii) preliminary discussions with the Central Bank of Oman regarding licensing of a self-service foreign-exchange channel, and (iii) commercial discussions with hotel and mall partners in Muscat Governorate. It is not an offer of securities and must not be relied upon by any third party without the written consent of the partners.
    </p>
    <h3>Disclaimer</h3>
    <p>
      Market data reflect publicly available statistics and industry benchmarks as at the issue date. Financial projections are forward-looking estimates built on the assumptions set out in Chapter 1 and Chapter 9; actual results will differ. Hardware pricing, software fees and shipping costs are based on manufacturer quotations received by the partners and are subject to confirmation at order date. Hotel names listed reflect preliminary verbal agreement in principle and remain subject to signed placement agreements.
    </p>
    <h3>Version Discipline</h3>
    <p>
      Chapters 1–18 and Annexes A–H form a fixed structure. Future editions will retain identical chapter numbering and titles; a chapter with no material update will carry the note “Reviewed — no material change”. New content is added only as an Annex.
    </p>
  </Page>
);

export const TocPages = ({ start, chapters, starts, backStart }) => {
  const rows = [
    ...chapters.map((c) => ({ num: c.num, title: c.title, sub: c.tag, page: starts[c.key] })),
    { num: "—", title: "Contact & Correspondence", sub: "Founding partners and project office", page: backStart },
    { num: "—", title: "Back Cover", sub: "The machine in its operating environment", page: backStart + 1 },
  ];
  return chunk(rows, TOC_ROWS).map((rs, pi) => (
    <Page key={pi} n={start + pi} chapter="Table of Contents" testId={`toc-page-${pi + 1}`}>
      {pi === 0 ? (
        <>
          <div className="eyebrow">Contents</div>
          <div className="rule-gold" />
          <h2>Table of Contents</h2>
        </>
      ) : (
        <h3>Table of Contents (continued)</h3>
      )}
      <div className="toc-list">
        {rs.map((r, i) => (
          <div key={i} className="toc-row">
            <span className="nm">{typeof r.num === "number" ? String(r.num).padStart(2, "0") : r.num}</span>
            <span className="ti">{r.title}{r.sub && <span className="sub">{r.sub}</span>}</span>
            <span className="pg">{String(r.page).padStart(3, "0")}</span>
          </div>
        ))}
      </div>
    </Page>
  ));
};

export const ListPages = ({ start, title, prefix, items }) =>
  chunk(items, LIST_ROWS).map((rs, pi) => (
    <Page key={pi} n={start + pi} chapter={title}>
      {pi === 0 ? (
        <>
          <div className="eyebrow">Contents</div>
          <div className="rule-gold" />
          <h2>{title}</h2>
        </>
      ) : (
        <h3>{title} (continued)</h3>
      )}
      <div className="list-compact">
        {rs.map((r) => (
          <div key={r.no} className="lrow">
            <span className="nm">{prefix} {r.no}</span>
            <span className="ti">{r.title}</span>
            <span className="pg">{String(r.page).padStart(3, "0")}</span>
          </div>
        ))}
      </div>
    </Page>
  ));

export const ContactPage = ({ n, meta }) => (
  <Page n={n} chapter="Contact & Correspondence" testId="contact-page">
    <div className="eyebrow">Correspondence</div>
    <div className="rule-gold" />
    <h2>Contact the Founding Partners</h2>
    <p className="lede">
      Enquiries regarding this study, the licensing application, hotel and mall placement agreements or investment participation should be addressed to the founding partners of {meta.company} ({meta.companyAr}).
    </p>
    <div className="stat-grid cols-3" style={{ marginTop: "6mm" }}>
      <div className="mini-card"><div className="ico">01</div><div className="t">Mohammad Al Azri</div><div className="d">Founding Partner</div><div className="d num">+968 9113 3302</div></div>
      <div className="mini-card"><div className="ico">02</div><div className="t">Omar Al Habsi</div><div className="d">Founding Partner</div><div className="d num">+968 9937 4709</div><div className="d">Habsi98@hotmail.com</div></div>
      <div className="mini-card"><div className="ico">03</div><div className="t">Nasar Al Nadabi</div><div className="d">Founding Partner</div><div className="d num">+968 9266 4287</div></div>
    </div>
    <h3 style={{ marginTop: "8mm" }}>Project Office</h3>
    <p>Muscat Governorate, Sultanate of Oman. Registered office address to be confirmed upon commercial registration with the Ministry of Commerce, Industry and Investment Promotion.</p>
    <div className="callout gold" style={{ marginTop: "6mm" }}>
      <span className="k">Next Step</span>
      The partners invite the Central Bank of Oman, the seven hotels named in Chapter 6 and the two mall operators named in Chapter 14 to a joint briefing on the pilot programme described in Chapter 5.
    </div>
    <div className="fig" style={{ height: "82mm", marginTop: "8mm" }}>
      <div className="fig-img"><img src="/img/kiosk-touch.png" alt="Guest using a self-service exchange kiosk" crossOrigin="anonymous" style={{ objectFit: "cover" }} /></div>
    </div>
  </Page>
);

export const BackCover = ({ n, meta }) => (
  <section className="a4 cover backcover" data-page={n} data-testid="back-cover">
    <div className="backcover-img">
      <img src="/img/kiosk-hall.png" alt="Self-service currency exchange kiosk in a public hall" crossOrigin="anonymous" />
    </div>
    <div className="backcover-text">
      <div className="cover-brand"><span className="dot" />{meta.company}</div>
      <h2 style={{ marginTop: "6mm" }}>Exchange smarter. Travel better.</h2>
      <p>{meta.title} — {meta.version}, {meta.date}. {meta.classification}.</p>
    </div>
  </section>
);
