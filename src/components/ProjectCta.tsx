import Link from "next/link";
import QuickLead from "./QuickLead";
import { Arrow, Phone, WhatsApp } from "./Icons";
import { BRAND, CONTENT } from "@/lib/content";
import { serviceById, type ServicePageId } from "@/lib/content-services";
import { ESTIMATOR, money, type EstimatorType } from "@/lib/estimator";
import { href, type Locale } from "@/lib/i18n";
import { waHref } from "@/lib/wa";

/* The conversion block for content pages (guides, the question hub). Search
   traffic arrives with a question; this turns the answer into a next step at
   three effort levels: leave a number, WhatsApp with a prefilled message, or
   the full form pre-set to this service with the page as context. `slim` is
   the mid-article version. */
export default function ProjectCta({ locale, service, estimator, context, where, slim = false }: {
  locale: Locale; service: ServicePageId; estimator?: EstimatorType; context: string; where: string; slim?: boolean;
}) {
  const f = CONTENT[locale].funnel;
  const s = serviceById(service), name = s.t[locale].name;
  const est = estimator ? ESTIMATOR[estimator].tiers : null;
  const range = est ? `${money(est[0].lo)}–${money(est[2].hi)}` : s.t[locale].glance.range;
  const note = `${context}\n\n`;
  const full = `${href(locale, "contact")}?service=${s.form}&note=${encodeURIComponent(note)}#quote`;

  if (slim) return (
    <aside className="my-12 rounded-card border border-hairline bg-bone-2 p-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center" data-track={`${where}-mid`}>
      <div>
        <h2 className="d text-step-2 text-navy leading-none">{f.midH}</h2>
        <p className="mt-2 text-step--1 text-muted">{f.range.replace("{range}", range)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link className="btn btn--ink btn--sm" href={full}>{CONTENT[locale].ui.freeQuote} <Arrow /></Link>
        <a className="btn btn--sm bg-[#075e54] text-white" href={waHref(locale, name.toLowerCase())} target="_blank" rel="noopener"><WhatsApp className="w-4 h-4" /> WhatsApp</a>
      </div>
    </aside>
  );

  return (
    <section className="my-14 rounded-card-lg bg-navy-2 text-bone p-7 md:p-10 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10" data-tone="dark" data-track={where} aria-label={f.h.replace("{service}", name.toLowerCase())}>
      <div>
        <span className="eyebrow text-amber mb-4">{f.eyebrow}</span>
        <h2 className="d h-md max-w-[18ch]">{f.h.replace("{service}", name.toLowerCase())}</h2>
        <p className="mt-3 text-bone/85 max-w-[48ch]">{f.p}</p>
        <p className="mt-4 slate text-amber-bright">{f.range.replace("{range}", range)}</p>
        <div className="flex flex-wrap gap-2 mt-6">
          <a className="btn btn--sm bg-[#075e54] text-white" href={waHref(locale, name.toLowerCase())} target="_blank" rel="noopener"><WhatsApp className="w-4 h-4" /> {f.wa}</a>
          <a className="btn btn--ghost btn--sm" href={`tel:${BRAND.tel}`}><Phone /> {f.call}</a>
          <Link className="btn btn--ghost btn--sm" href={full}>{f.full} <Arrow /></Link>
        </div>
      </div>
      <div className="rounded-card border border-hairline-d p-5 md:p-6 self-start">
        <h3 className="d text-step-1 leading-none">{f.quickH}</h3>
        <p className="mt-2 mb-4 text-step--1 text-bone/75">{f.quickP}</p>
        <QuickLead locale={locale} t={f} labels={CONTENT[locale].contact} err={CONTENT[locale].contact.f.err} service={s.form} context={context} dark where={where} />
      </div>
    </section>
  );
}
