"use client";
/* Three taps to a planning range. The CTA carries the choice into the quote
   form (?service=&note=), so the lead arrives already qualified: the owner
   sees "Kitchen · full remodel · mid-range · $25k–$45k" before calling. */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Arrow } from "./Icons";
import type { SiteContent } from "@/lib/content";
import { ESTIMATOR, estimate, money, type EstimatorType, type Finish } from "@/lib/estimator";
import { href, type Locale } from "@/lib/i18n";
import { track } from "@/lib/track";
import QuickLead from "./QuickLead";

const TYPES = Object.keys(ESTIMATOR) as EstimatorType[];
const FINISHES: Finish[] = ["standard", "mid", "premium"];

export default function CostEstimator({ locale, t }: { locale: Locale; t: Pick<SiteContent, "estimator" | "funnel" | "contact"> }) {
  const e = t.estimator;
  const q = useSearchParams().get("type") as EstimatorType | null;
  const [type, setType] = useState<EstimatorType>(q && ESTIMATOR[q] ? q : "kitchen");
  const [tier, setTier] = useState<0 | 1 | 2>(1);
  const [finish, setFinish] = useState<Finish>("mid");
  const touched = useRef(false);
  const r = estimate(type, tier, finish);
  const def = ESTIMATOR[type];

  useEffect(() => {
    if (!touched.current) return;
    const id = setTimeout(() => track("estimator_result", { type, tier, finish, lo: r.lo, hi: r.hi }), 600);
    return () => clearTimeout(id);
  }, [type, tier, finish, r.lo, r.hi]);

  const pick = <T,>(set: (v: T) => void) => (v: T) => { touched.current = true; set(v); };
  const note = `${e.result}: ${def.l[locale]} · ${def.tiers[tier].l[locale]} · ${e.finish[finish].l} · ${money(r.lo)}–${money(r.hi)}\n\n`;
  const cta = `${href(locale, "contact")}?service=${def.form}&note=${encodeURIComponent(note)}#quote`;

  const chip = (active: boolean) => `text-left rounded-card border p-4 transition-colors ${active ? "border-navy bg-navy text-bone" : "border-hairline-strong bg-white hover:border-ink"}`;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:gap-gutter lg:items-start">
      <div className="grid gap-10">
        <fieldset>
          <legend className="eyebrow text-amber-deep mb-4">01 · {e.step1}</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPES.map((k) => <button key={k} type="button" aria-pressed={type === k} className={chip(type === k)} onClick={() => pick(setType)(k)}><span className="d text-step-1 leading-none">{ESTIMATOR[k].l[locale]}</span></button>)}
          </div>
        </fieldset>
        <fieldset>
          <legend className="eyebrow text-amber-deep mb-4">02 · {e.step2}</legend>
          <div className="grid sm:grid-cols-3 gap-2">
            {def.tiers.map((t, i) => (
              <button key={t.l.en} type="button" aria-pressed={tier === i} className={chip(tier === i)} onClick={() => pick(setTier)(i as 0 | 1 | 2)}>
                <span className="block d text-step-1 leading-none">{t.l[locale]}</span><span className={`block mt-2 text-step--1 ${tier === i ? "text-bone/80" : "text-muted"}`}>{t.d[locale]}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="eyebrow text-amber-deep mb-4">03 · {e.step3}</legend>
          <div className="grid sm:grid-cols-3 gap-2">
            {FINISHES.map((f) => (
              <button key={f} type="button" aria-pressed={finish === f} className={chip(finish === f)} onClick={() => pick(setFinish)(f)}>
                <span className="block d text-step-1 leading-none">{e.finish[f].l}</span><span className={`block mt-2 text-step--1 ${finish === f ? "text-bone/80" : "text-muted"}`}>{e.finish[f].d}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="lg:sticky lg:top-28 rounded-card-lg bg-navy-2 text-bone p-7 md:p-8" aria-live="polite" data-tone="dark">
        <span className="eyebrow text-amber">{e.result}</span>
        <strong className="block d text-step-4 leading-[.95] mt-4">{money(r.lo)}<span className="text-amber"> – </span>{money(r.hi)}</strong>
        <p className="mt-3 text-step--1 text-muted-d">{def.l[locale]} · {def.tiers[tier].l[locale]} · {e.finish[finish].l}</p>
        <p className="mt-2 text-step--1 text-muted-d">{e.resultNote}</p>
        <Link className="btn btn--solid mt-6 w-full" href={cta} onClick={() => track("estimator_cta", { type, lo: r.lo, hi: r.hi })}>{e.cta} <Arrow /></Link>
        <p className="mt-3 slate text-bone/70">{e.ctaNote}</p>
        <div className="mt-6 pt-5 border-t border-hairline-d">
          <p className="d text-step-0 mb-3">{t.funnel.quickH}</p>
          <QuickLead locale={locale} t={t.funnel} labels={t.contact} err={t.contact.f.err} service={def.form} context={note.trim()} dark where="estimator" />
        </div>
        <p className="mt-6 pt-5 border-t border-hairline-d text-[.8rem] leading-relaxed text-muted-d">{e.disclaimer}</p>
      </div>
    </div>
  );
}
