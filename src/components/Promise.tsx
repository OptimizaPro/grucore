import { Check } from "./Icons";
import { CONTENT } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/* Sits beside every estimate form. Every line is a commitment the business
   already makes elsewhere on the site, gathered where the decision happens. */
export default function Promise({ locale, dark = false }: { locale: Locale; dark?: boolean }) {
  const p = CONTENT[locale].promise;
  return (
    <div className={`rounded-card border p-6 ${dark ? "border-hairline-d bg-bone/[.04] text-bone" : "border-hairline bg-bone-2"}`}>
      <h3 className={`font-mono font-normal text-[.74rem] tracking-[.14em] uppercase mb-4 ${dark ? "text-bone/70" : "text-muted"}`}>{p.h}</h3>
      <ul className="grid gap-2.5">{p.items.map((x) => <li key={x} className="flex gap-3 items-start text-step--1"><Check className={`w-4 h-4 shrink-0 mt-[.3em] ${dark ? "text-amber" : "text-amber-deep"}`} /><span>{x}</span></li>)}</ul>
    </div>
  );
}
