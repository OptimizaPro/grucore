import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";
import { Arrow } from "@/components/Icons";
import { CONTENT } from "@/lib/content";
import { FACTS, FACTS_LOG, FACTS_VERIFIED } from "@/lib/content-facts";
import { SERVICE_PAGES } from "@/lib/content-services";
import { href, type Locale } from "@/lib/i18n";
import { Rich } from "@/lib/inline";
import { serviceHref } from "@/lib/routes";

/* Text-first on purpose: no hero photo, no reveal animations. This page is
   read by assistants and editors more than by homeowners, so every fact is
   plain server-rendered HTML in the first screenful. */
export default function FactsPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale], f = FACTS[locale];
  const fmt = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString(locale === "es" ? "es-US" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <>
      <section className="bg-bone pt-[calc(var(--barh)+5rem)] pb-10" data-tone="light">
        <div className="shell max-w-[56rem]">
          <span className="eyebrow text-amber-deep mb-4">{f.eyebrow}</span>
          <h1 className="d d-lg text-navy">{f.h1}</h1>
          <p className="lede text-muted mt-4">{f.lede}</p>
          <p className="slate text-muted mt-4">{f.verified} <time dateTime={FACTS_VERIFIED}>{fmt(FACTS_VERIFIED)}</time></p>
        </div>
      </section>
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: f.nav, path: href(locale, "facts") }]} />

      <section className="sec bg-bone" data-tone="light">
        <div className="shell max-w-[56rem] grid gap-14">
          <div className="rounded-card border border-hairline bg-bone-2 p-6 md:p-8">
            <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-4">{f.glanceH}</h2>
            <dl className="grid gap-x-8 md:grid-cols-[14rem_1fr]">
              {f.glance.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="slate text-amber-deep pt-3 md:border-b md:border-hairline md:pb-3">{k}</dt>
                  <dd className="text-ink pb-3 border-b border-hairline md:pt-3">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <section>
            <h2 className="d h-md text-navy">{f.servicesH}</h2>
            <p className="mt-4 text-muted max-w-[62ch]"><Rich text={f.servicesP} locale={locale} /></p>
            <div className="mt-6 overflow-x-auto rounded-card border border-hairline">
              <table className="w-full text-left text-step--1">
                <thead className="bg-bone-2"><tr>{f.servicesCols.map((h) => <th key={h} scope="col" className="slate text-muted font-normal p-4">{h}</th>)}</tr></thead>
                <tbody>
                  {SERVICE_PAGES.map((s) => (
                    <tr key={s.id} className="border-t border-hairline">
                      <th scope="row" className="p-4 font-semibold"><Link className="text-navy underline decoration-amber/60 underline-offset-[3px] hover:text-amber-deep" href={serviceHref(locale, s.id)}>{s.t[locale].name}</Link></th>
                      <td className="p-4 text-muted">{s.t[locale].glance.timeline}</td>
                      <td className="p-4 text-ink">{s.t[locale].glance.range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {f.qa.map((q) => (
            <section key={q.h}>
              <h2 className="d text-step-3 leading-[1] text-navy">{q.h}</h2>
              <div className="mt-4 grid gap-3 max-w-[62ch] text-muted">{q.p.map((p) => <p key={p}><Rich text={p} locale={locale} /></p>)}</div>
            </section>
          ))}

          <section className="border-t border-hairline pt-10 grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-3">{f.logH}</h2>
              <ul className="grid gap-2 text-step--1">{FACTS_LOG.map((l) => <li key={l.date + l.en}><time className="slate text-amber-deep mr-2" dateTime={l.date}>{l.date}</time>{l[locale]}</li>)}</ul>
            </div>
            <div>
              <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-3">{f.fixH}</h2>
              <p className="text-step--1 text-muted">{f.fixP}</p>
              <Link className="text-link text-navy mt-4" href={href(locale, "about")}>{c.nav.about} <Arrow /></Link>
            </div>
          </section>
        </div>
      </section>
      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
