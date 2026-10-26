import { Arrow, Phone, Stars } from "@/components/Icons";
import { BRAND, CONTENT } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/* Sent by text to every customer the day a job finishes. One tap to the
   review site they already use. Unlisted and noindex: it replaces the review
   flow a paid directory would otherwise own. */
export default function ReviewRequestPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]; const r = c.reviewRequest;
  const btn = "btn w-full justify-between";
  return (
    <section className="min-h-[100svh] flex items-center bg-navy-2 text-bone" data-tone="dark">
      <div className="shell py-24 grid gap-8 max-w-[34rem]">
        <div className="grid gap-4">
          <span className="eyebrow text-amber">{r.eyebrow}</span>
          <h1 className="d d-lg">{r.h1}</h1>
          <Stars label={c.ui.starsLabel} />
          <p className="lede text-bone/85">{r.lede}</p>
        </div>
        <div className="grid gap-3">
          <a className={`${btn} btn--solid`} href={BRAND.googleReviewUrl} target="_blank" rel="noopener">{r.google} <Arrow /></a>
          <a className={`${btn} btn--ghost`} href={BRAND.angiUrl} target="_blank" rel="noopener">{r.angi} <Arrow /></a>
          <a className={`${btn} btn--ghost`} href={BRAND.homeAdvisorUrl} target="_blank" rel="noopener">{r.ha} <Arrow /></a>
        </div>
        <p className="text-step--1 text-bone/70">{r.note} <a className="inline-flex items-center gap-1.5 text-amber-bright underline underline-offset-2" href={`tel:${BRAND.tel}`}><Phone className="w-3.5 h-3.5" />{BRAND.phone}</a></p>
        <p className="font-mono text-[.7rem] tracking-[.12em] uppercase text-bone/50">{r.thanks}</p>
      </div>
    </section>
  );
}
