import { resetCountersAr } from "./blocks_ar";
import { part1Ar } from "./part1_ar";
/* TODO: part2_ar–annexes_ar not yet translated; using English fallback so the app compiles */
import { part2 as part2Ar } from "./part2";
import { part3 as part3Ar } from "./part3";
import { part4 as part4Ar } from "./part4";
import { part5 as part5Ar } from "./part5";
import { annexes as annexesAr } from "./annexes";

export const METAAr = {
  company: "الأمان للصرافة",
  companyAr: "Alaman Exchange",
  title: "دراسة جدوى شاملة لجهاز الصرافة الذاتية للعملات في سلطنة عُمان",
  subtitle: "انتشار قائم على الفنادق لأجهزة الصرافة الذكية AGS-KME-01 / AGS-OCE-01 في مسقط — سياق السوق، المسار التنظيمي، النموذج المالي الخمسي وخطة العمل.",
  version: "الإصدار 2.0 — للمراجعة التنظيمية",
  date: "سبتمبر 2026",
  classification: "سرّي",
};

export const buildDocumentAr = () => {
  resetCountersAr();
  return [...part1Ar(), ...part2Ar(), ...part3Ar(), ...part4Ar(), ...part5Ar(), ...annexesAr()];
};
