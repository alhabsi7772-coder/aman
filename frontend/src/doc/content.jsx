import { resetCounters } from "./blocks";
import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";
import { part4 } from "./part4";
import { part5 } from "./part5";
import { annexes } from "./annexes";

export const META = {
  company: "Al MAAN Exchange",
  companyAr: "الأمان للصرافة",
  title: "A Comprehensive Feasibility Study of the Self-Service Currency Exchange Machine in the Sultanate of Oman",
  subtitle: "Hotel-anchored deployment of AGS-KME-01 / AGS-OCE-01 smart exchange kiosks in Muscat — market context, regulatory pathway, five-year financial model and business plan.",
  version: "Version 2.0 — For Regulatory Review",
  date: "June 2026",
  classification: "Confidential",
};

export const buildDocument = () => {
  resetCounters();
  return [...part1(), ...part2(), ...part3(), ...part4(), ...part5(), ...annexes()];
};
