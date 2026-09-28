import React from "react";
import { Page } from "../components/Page";

const BRAND = "الأمان للصرافة";
const FOOTER = "سرّي · الأمان للصرافة · 2026";

export const TOC_ROWS = 10;
export const LIST_ROWS = 24;
export const tocRowCount = (chapters) => chapters.length + 2;

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out.length ? out : [[]];
};

export const Cover = ({ meta }) => (
  <section className="a4 cover" data-page={1} data-testid="page-1" dir="rtl">
    <div className="cover-grid">
      <div className="cover-left">
        <div className="cover-brand"><span className="dot" />{meta.company}</div>
        <div className="cover-kicker" style={{ marginTop: "14mm" }}>دراسة جدوى شاملة · {meta.version}</div>
        <h1 className="cover-title">{meta.title}</h1>
        <p className="cover-sub">{meta.subtitle}</p>
      </div>
      <div className="cover-image-panel">
        <img src="/img/kiosk-hotel-lobby.png" alt="جهاز صرافة ذاتية مُركَّب في بهو فندق" crossOrigin="anonymous" />
      </div>
      <div className="cover-meta">
        <div className="cell"><div className="label">أُعِدَّت لـ</div><div className="value">{meta.company}</div></div>
        <div className="cell"><div className="label">تاريخ الإصدار</div><div className="value">{meta.date}</div></div>
        <div className="cell"><div className="label">التصنيف</div><div className="value">{meta.classification}</div></div>
      </div>
    </div>
    <div className="cover-foot">سلطنة عُمان · مسقط · النسخة العربية</div>
  </section>
);

export const Notice = ({ n, meta }) => (
  <Page n={n} chapter="الاعتماد والإشعار التنظيمي" brand={BRAND} footerText={FOOTER}>
    <div className="eyebrow" dir="rtl">ضبط الوثيقة</div>
    <div className="rule-gold" />
    <h2>صفحة الاعتماد والإشعار التنظيمي</h2>
    <p className="lede">
      هذه الوثيقة دراسة جدوى شاملة أُعدَّت للشركاء المؤسسين لشركة {meta.company} ({meta.companyAr}) بخصوص شبكة مقترحة من أجهزة الصرافة الذاتية للعملات في سلطنة عُمان. تُصدَر بصفتها <strong>{meta.version}</strong> وتُبطِل كل المسودات السابقة.
    </p>
    <table className="tbl" style={{ marginTop: "4mm" }}>
      <thead><tr><th>بند الضبط</th><th>التفاصيل</th></tr></thead>
      <tbody>
        <tr><td>عنوان الوثيقة</td><td>{meta.title}</td></tr>
        <tr><td>الإصدار / الحالة</td><td>{meta.version} وللنظر الاستثماري</td></tr>
        <tr><td>تاريخ الإصدار</td><td>{meta.date}</td></tr>
        <tr><td>التصنيف</td><td>{meta.classification} — التوزيع مقصور على المستلمين المُسمَّين</td></tr>
        <tr><td>عملة الدراسة</td><td>الريال العماني (ر.ع). سعر الدولار المرجعي 1 دولار = 0.3845 ر.ع (ربط البنك المركزي العماني)</td></tr>
        <tr><td>أفق الدراسة</td><td>خمس سنوات مالية من الإطلاق التجاري (السنة 1 – السنة 5)</td></tr>
        <tr><td>الشركاء المؤسسون</td><td>محمد العزري · عمر الحبسي · ناصر الندابي</td></tr>
      </tbody>
    </table>
    <h3 style={{ marginTop: "6mm" }}>نطاق الاستخدام</h3>
    <p>
      تهدف الدراسة إلى دعم (أولاً) قرار استثمار داخلي للشركاء، (ثانياً) مناقشات أولية مع البنك المركزي العماني بشأن ترخيص قناة صرافة ذاتية للعملات الأجنبية، و(ثالثاً) مناقشات تجارية مع شركاء الفنادق والمجمعات في محافظة مسقط. ليست عرضاً لأوراق مالية ولا يجوز الاعتماد عليها من أي طرف ثالث دون موافقة خطية من الشركاء.
    </p>
    <h3>إخلاء المسؤولية</h3>
    <p>
      تعكس بيانات السوق الإحصاءات المتاحة للعموم والمعايير المرجعية للصناعة بتاريخ الإصدار. التوقعات المالية تقديرات استشرافية مبنية على الفروض الواردة في الفصلين 1 و9؛ ستختلف النتائج الفعلية. أسعار العتاد ورسوم البرمجيات وتكاليف الشحن مبنية على عروض أسعار من المُصنّع وردت للشركاء وتخضع للتأكيد عند تاريخ الطلب. أسماء الفنادق المذكورة تعكس موافقة مبدئية شفهية وتبقى مرهونة باتفاقيات تركيب موقَّعة.
    </p>
    <h3>انضباط الإصدارات</h3>
    <p>
      تُشكِّل الفصول 1–18 والملاحق A–H بنية ثابتة. ستحتفظ الإصدارات القادمة بترقيم وعناوين الفصول نفسها؛ الفصل الذي لا يشهد تحديثاً جوهرياً يحمل ملاحظة "تمت المراجعة — دون تغيير جوهري". يُضاف المحتوى الجديد فقط كملحق.
    </p>
  </Page>
);

export const TocPages = ({ start, chapters, starts, backStart }) => {
  const rows = [
    ...chapters.map((c) => ({ num: c.num, title: c.title, sub: c.tag, page: starts[c.key] })),
    { num: "—", title: "التواصل والمراسلات", sub: "الشركاء المؤسسون ومكتب المشروع", page: backStart },
    { num: "—", title: "الغلاف الخلفي", sub: "الجهاز في بيئة تشغيله", page: backStart + 1 },
  ];
  return chunk(rows, TOC_ROWS).map((rs, pi) => (
    <Page key={pi} n={start + pi} chapter="فهرس المحتويات" testId={`toc-page-${pi + 1}`} brand={BRAND} footerText={FOOTER}>
      {pi === 0 ? (
        <>
          <div className="eyebrow">المحتويات</div>
          <div className="rule-gold" />
          <h2>فهرس المحتويات</h2>
        </>
      ) : (
        <h3>فهرس المحتويات (تابع)</h3>
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
    <Page key={pi} n={start + pi} chapter={title} brand={BRAND} footerText={FOOTER}>
      {pi === 0 ? (
        <>
          <div className="eyebrow">المحتويات</div>
          <div className="rule-gold" />
          <h2>{title}</h2>
        </>
      ) : (
        <h3>{title} (تابع)</h3>
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
  <Page n={n} chapter="التواصل والمراسلات" testId="contact-page" brand={BRAND} footerText={FOOTER}>
    <div className="eyebrow">المراسلات</div>
    <div className="rule-gold" />
    <h2>التواصل مع الشركاء المؤسسين</h2>
    <p className="lede">
      يُرجى توجيه الاستفسارات بخصوص هذه الدراسة، أو طلب الترخيص، أو اتفاقيات تركيب الفنادق والمجمعات، أو المشاركة الاستثمارية إلى الشركاء المؤسسين لشركة {meta.company} ({meta.companyAr}).
    </p>
    <div className="stat-grid cols-3" style={{ marginTop: "6mm" }}>
      <div className="mini-card"><div className="ico">01</div><div className="t">محمد العزري</div><div className="d">شريك مؤسس</div><div className="d num">+968 9113 3302</div></div>
      <div className="mini-card"><div className="ico">02</div><div className="t">عمر الحبسي</div><div className="d">شريك مؤسس</div><div className="d num">+968 9937 4709</div><div className="d">Habsi98@hotmail.com</div></div>
      <div className="mini-card"><div className="ico">03</div><div className="t">ناصر الندابي</div><div className="d">شريك مؤسس</div><div className="d num">+968 9266 4287</div></div>
    </div>
    <h3 style={{ marginTop: "8mm" }}>مكتب المشروع</h3>
    <p>محافظة مسقط، سلطنة عُمان. عنوان المكتب المسجَّل سيُؤكَّد عند التسجيل التجاري لدى وزارة التجارة والصناعة وترويج الاستثمار.</p>
    <div className="callout gold" style={{ marginTop: "6mm" }}>
      <span className="k">الخطوة التالية</span>
      يدعو الشركاء البنك المركزي العماني، والسبعة فنادق المذكورة في الفصل 6، ومُشغِّلَي المجمعَّين المذكورَين في الفصل 14 إلى جلسة إحاطة مشتركة حول البرنامج التجريبي الموصوف في الفصل 5.
    </div>
    <div className="fig" style={{ height: "82mm", marginTop: "8mm" }}>
      <div className="fig-img"><img src="/img/kiosk-touch.png" alt="ضيف يستخدم جهاز صرافة ذاتية" crossOrigin="anonymous" style={{ objectFit: "cover" }} /></div>
    </div>
  </Page>
);

export const BackCover = ({ n, meta }) => (
  <section className="a4 cover backcover" data-page={n} data-testid="back-cover" dir="rtl">
    <div className="backcover-img">
      <img src="/img/kiosk-hall.png" alt="جهاز صرافة ذاتية للعملات في قاعة عامة" crossOrigin="anonymous" />
    </div>
    <div className="backcover-text">
      <div className="cover-brand"><span className="dot" />{meta.company}</div>
      <h2 style={{ marginTop: "6mm" }}>صرافة أذكى. سفر أفضل.</h2>
      <p>{meta.title} — {meta.version}، {meta.date}. {meta.classification}.</p>
    </div>
  </section>
);
