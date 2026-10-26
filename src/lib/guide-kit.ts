/* ---------------------------------------------------------------------------
   Guide kit: types and price helpers shared by content-guides.ts and the
   one-file-per-guide entries in src/lib/guides/. Kept separate so a guide
   file can import the helpers without importing the GUIDES array.

   Inline links: any paragraph, list item, answer or FAQ answer may contain
   [anchor text](kind:id), resolved per language at render time:
     [see our painting page](service:painting)   ServicePageId
     [permit guide](guide:permits)                GuideId
     [cost estimator](page:estimator)             PageKey
     [Opelika](area:opelika)                      AreaId
   Plain https:// links are allowed for sources and open in a new tab.
   ------------------------------------------------------------------------- */
import type { Locale } from "./i18n";
import type { PhotoKey } from "./content";
import type { ServicePageId } from "./content-services";
import { ESTIMATOR, estimate, money, type EstimatorType } from "./estimator";

export type GuideId =
  | "kitchen-cost" | "bathroom-cost" | "permits" | "hire-contractor" | "rental-turnover" | "cabinets-paint-vs-replace"
  | "painting-cost" | "exterior-paint-timing" | "builder-grade-upgrades" | "tub-to-shower" | "flooring-humidity" | "bilingual-contractor" | "student-condo"
  | "deck-repair-vs-replace" | "addition-vs-moving";
export interface GuideSection { h: string; p?: string[]; list?: string[]; table?: { head: string[]; rows: string[][] } }
export interface GuideCopy { title: string; description: string; eyebrow: string; h1: string; lede: string; answer: string; sections: GuideSection[]; faq: { q: string; a: string }[] }
export interface Guide {
  id: GuideId; slug: Record<Locale, string>; photo: PhotoKey; published: string; updated: string; service: ServicePageId; estimator?: EstimatorType;
  /** Other guides worth reading next (shown at the end and in the sidebar). */
  related?: GuideId[];
  /** Third-party sources for figures quoted in the text. Shown as a numbered list; also cited in structured data. */
  sources?: { name: string; url: string }[];
  t: Record<Locale, GuideCopy>;
}

export const range = (type: EstimatorType, tier: 0 | 1 | 2, f: "standard" | "mid" | "premium") => { const r = estimate(type, tier, f); return `${money(r.lo)}–${money(r.hi)}`; };
export function costTable(type: EstimatorType, locale: Locale) {
  const head = locale === "es" ? ["Alcance", "Estándar", "Intermedio", "Premium"] : ["Scope", "Standard", "Mid-range", "Premium"];
  return { head, rows: ESTIMATOR[type].tiers.map((t, i) => [`${t.l[locale]} — ${t.d[locale]}`, range(type, i as 0 | 1 | 2, "standard"), range(type, i as 0 | 1 | 2, "mid"), range(type, i as 0 | 1 | 2, "premium")]) };
}
export const mid = (type: EstimatorType, tier: 0 | 1 | 2) => range(type, tier, "mid");
export { estimate, money };

/** Every string a reader sees in one language, for word counts and reading time. */
export function guideText(t: GuideCopy): string {
  return [t.lede, t.answer, ...t.sections.flatMap((x) => [x.h, ...(x.p ?? []), ...(x.list ?? []), ...(x.table ? x.table.rows.flat() : [])]), ...t.faq.flatMap((f) => [f.q, f.a])].join(" ");
}
export const wordCount = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").split(/\s+/).filter(Boolean).length;
