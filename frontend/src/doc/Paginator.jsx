import React, { useLayoutEffect, useRef, useState } from "react";
import { Page, ChapterDivider } from "../components/Page";
import { md } from "./blocks";
import { Cover, Notice, TocPages, ListPages, ContactPage, BackCover, tocRowCount, LIST_ROWS, TOC_ROWS } from "./FrontMatter";

const MM = 96 / 25.4;
const GAP = 3.5 * MM;
const H2_TOP = 4 * MM;

function splitText(text, remaining, measure) {
  const words = text.split(" ");
  let lo = 0, hi = words.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(words.slice(0, mid).join(" ")) <= remaining) lo = mid; else hi = mid - 1;
  }
  if (lo < 15 || words.length - lo < 15) return null;
  return [words.slice(0, lo).join(" "), words.slice(lo).join(" ")];
}

function layoutChapters(chapters, heights, contentH, startPage, measure) {
  const pages = [];
  const starts = {};
  const tables = [];
  const figures = [];
  let pageNo = startPage;
  const LIMIT = contentH - 14;

  chapters.forEach((ch, ci) => {
    starts[ch.key] = pageNo;
    pages.push({ kind: "divider", ch, n: pageNo });
    pageNo += 1;

    let cur = [];
    let used = 0;
    const flush = () => {
      if (cur.length) {
        pages.push({ kind: "content", ch, n: pageNo, blocks: cur });
        pageNo += 1;
      }
      cur = [];
      used = 0;
    };
    const record = (b, no) => {
      if (b.type === "table") tables.push({ no: b.no, title: b.title, page: no });
      if (b.type === "figure" || b.type === "fullpage") figures.push({ no: b.no, title: b.title, page: no });
    };
    const hOf = (b, k) => (heights[k] || 0) + (b.type === "h2" && cur.length ? H2_TOP : 0);
    const push = (b, k, h) => {
      cur.push({ ...b, _k: k });
      used += h + (cur.length > 1 ? GAP : 0);
    };
    const pNode = (t) => <p>{md(t)}</p>;
    const trySplit = (b, k) => {
      const remaining = LIMIT - used - GAP;
      const parts = splitText(b.text, remaining, measure);
      if (!parts) return null;
      push({ ...b, node: pNode(parts[0]) }, `${k}a`, measure(parts[0]));
      return { ...b, node: pNode(parts[1]), text: parts[1], _k: `${k}b`, _h: measure(parts[1]) };
    };

    const blocks = ch.blocks;
    const consumed = new Set();
    let pendingTail = null;
    for (let i = 0; i < blocks.length; i++) {
      if (consumed.has(i)) continue;
      const b = blocks[i];
      const k = `${ci}-${i}`;

      if (b.type === "fullpage") {
        let headBlocks = null;
        if (cur.length && (cur.every((x) => x.heading) || used <= LIMIT * 0.4)) { headBlocks = cur; cur = []; used = 0; }
        flush();
        pages.push({ kind: "full", ch, n: pageNo, block: b, headBlocks });
        record(b, pageNo);
        pageNo += 1;
        continue;
      }

      const h = hOf(b, k);
      const fits = used + h + (cur.length ? GAP : 0) <= LIMIT;
      if (fits || !cur.length) {
        push(b, k, h);
        record(b, pageNo);
        continue;
      }

      // paragraph: split across pages
      if (b.type === "p" && b.text) {
        const tail = trySplit(b, k);
        if (tail) {
          record(b, pageNo);
          flush();
          push(tail, tail._k, tail._h);
          continue;
        }
      }

      // floatable block: pull following paragraphs forward to fill the page
      if (!b.heading && b.type !== "p") {
        for (let j = i + 1; j < Math.min(i + 4, blocks.length); j++) {
          const nb = blocks[j];
          if (nb.type !== "p" || consumed.has(j)) break;
          const nk = `${ci}-${j}`;
          const nh = hOf(nb, nk);
          if (used + nh + GAP <= LIMIT) { push(nb, nk, nh); consumed.add(j); continue; }
          break;
        }
      }

      // orphan control: carry trailing headings to the next page
      const carried = [];
      while (cur.length && cur[cur.length - 1].heading) carried.unshift(cur.pop());
      flush();
      carried.forEach((c) => push(c, c._k, heights[c._k] || 0));
      push(b, k, hOf(b, k));
      record(b, pageNo);
      if (pendingTail) { push(pendingTail, pendingTail._k, pendingTail._h); pendingTail = null; }
    }
    flush();
  });
  return { pages, starts, tables, figures, endPage: pageNo };
}

export default function Paginator({ chapters, meta, onLayout }) {
  const measureRef = useRef(null);
  const probeRef = useRef(null);
  const textRef = useRef(null);
  const [layout, setLayout] = useState(null);

  const nTables = chapters.reduce((a, c) => a + c.blocks.filter((b) => b.type === "table").length, 0);
  const nFigs = chapters.reduce((a, c) => a + c.blocks.filter((b) => b.type === "figure" || b.type === "fullpage").length, 0);
  const tocPages = Math.ceil(tocRowCount(chapters) / TOC_ROWS);
  const tblPages = Math.ceil(nTables / LIST_ROWS);
  const figPages = Math.ceil(nFigs / LIST_ROWS);
  const frontCount = 2 + tocPages + tblPages + figPages;

  useLayoutEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled || !measureRef.current || !probeRef.current) return;
      const contentH = probeRef.current.getBoundingClientRect().height;
      const heights = {};
      measureRef.current.querySelectorAll("[data-k]").forEach((el) => {
        heights[el.getAttribute("data-k")] = el.getBoundingClientRect().height;
      });
      const measure = (t) => { textRef.current.textContent = t; return textRef.current.getBoundingClientRect().height; };
      const res = layoutChapters(chapters, heights, contentH, frontCount + 1, measure);
      setLayout(res);
      if (onLayout) onLayout({ ...res, frontCount });
      window.__docReady = true;
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    else run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const measurer = (
    <div className="measure" aria-hidden="true" data-no-export="true">
      <section className="a4">
        <header className="page-header"><span className="brand">x</span><span className="chapter-tag">x</span></header>
        <div className="page-content" ref={probeRef}>
          <div className="blk first"><p ref={textRef} /></div>
        </div>
        <footer className="page-footer"><span>x</span><span className="page-num">000</span></footer>
      </section>
      {!layout && (
        <section className="a4">
          <div className="page-content measure-col" ref={measureRef}>
            {chapters.map((ch, ci) =>
              ch.blocks.map((b, i) =>
                b.type === "fullpage" ? null : (
                  <div key={`${ci}-${i}`} data-k={`${ci}-${i}`} className={`blk blk-${b.type} first`}>{b.node}</div>
                )
              )
            )}
          </div>
        </section>
      )}
    </div>
  );

  if (!layout) return measurer;

  const total = layout.endPage + 1; // + contact/back pages
  return (
    <>
      {measurer}
      <Cover meta={meta} />
      <Notice n={2} meta={meta} />
      <TocPages start={3} chapters={chapters} starts={layout.starts} backStart={layout.endPage} />
      <ListPages start={3 + tocPages} title="List of Tables" prefix="Table" items={layout.tables} />
      <ListPages start={3 + tocPages + tblPages} title="List of Figures" prefix="Figure" items={layout.figures} />
      {layout.pages.map((pg) => {
        if (pg.kind === "divider") {
          return (
            <ChapterDivider key={pg.n} n={pg.n} num={pg.ch.num} eyebrow={pg.ch.eyebrow} title={pg.ch.title} tag={pg.ch.tag} testId={`divider-${pg.ch.key}`} />
          );
        }
        if (pg.kind === "full") {
          return (
            <Page key={pg.n} n={pg.n} chapter={pg.ch.label} className={pg.block.dark ? "dark" : ""}>
              {pg.headBlocks && pg.headBlocks.map((b, i) => (
                <div key={i} className={`blk blk-${b.type} ${i === 0 ? "first" : ""}`}>{b.node}</div>
              ))}
              {pg.block.node}
            </Page>
          );
        }
        return (
          <Page key={pg.n} n={pg.n} chapter={pg.ch.label}>
            {pg.blocks.map((b, i) => (
              <div key={i} className={`blk blk-${b.type} ${i === 0 ? "first" : ""}`}>{b.node}</div>
            ))}
          </Page>
        );
      })}
      <ContactPage n={layout.endPage} meta={meta} />
      <BackCover n={total} meta={meta} />
    </>
  );
}
