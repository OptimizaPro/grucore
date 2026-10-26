import Link from "next/link";
import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import CtaBand from "@/components/CtaBand";
import SectionHead from "@/components/SectionHead";
import { Arrow } from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { CONTENT } from "@/lib/content";
import { href, type Locale } from "@/lib/i18n";
import { serviceHref } from "@/lib/routes";
import { CARD_PAGE, SERVICE_PAGES, SERVICE_UI } from "@/lib/content-services";
import { JsonLd, serviceList } from "@/lib/schema";
import { photo } from "@/lib/content";

export default function ServicesPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]; const p = c.servicesPage;
  return (
    <>
      <JsonLd data={[
        serviceList(SERVICE_PAGES.map((sp) => ({ name: sp.t[locale].name, path: serviceHref(locale, sp.id) }))),
      ]} />
      <PageHero photoKey="worker4" alt={c.services[0].alt} eyebrow={p.eyebrow} h1={p.h1} lede={p.lede} />
      <section className="bg-bone py-8 md:py-12" data-tone="light">
        <div className="shell">
          {c.services.map((s, i) => (
            <article key={s.id} id={s.id} className={`grid gap-8 py-12 md:py-20 border-t border-hairline first:border-t-0 lg:grid-cols-2 lg:gap-[calc(var(--spacing-gutter)*1.5)] lg:items-center [scroll-margin-top:5.5rem]`}>
              <Reveal className={`relative overflow-hidden rounded-card-lg aspect-[5/4] ${i % 2 ? "lg:order-2" : ""}`}><Photo k={s.photo} alt={s.alt} sizes="(min-width: 60rem) 50vw, 100vw" /></Reveal>
              <Reveal delay={0.1}>
                <span className="block font-mono text-[.78rem] tracking-[.14em] text-amber-deep mb-4">0{i + 1} — {s.sub}</span>
                <h2 className="d h-md text-navy mb-3"><Link className="no-underline hover:text-amber-deep" href={serviceHref(locale, CARD_PAGE[s.id])}>{s.name}</Link></h2>
                <p className="max-w-[58ch] text-muted">{s.para}</p>
                <ul className="my-5 sm:columns-2 sm:gap-8">{s.items.map((x) => <li key={x} className="break-inside-avoid py-2 border-b border-hairline text-step--1">{x}</li>)}</ul>
                <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[.74rem] tracking-[.12em] uppercase text-muted mb-6"><span>{p.timelineLbl} <b className="font-normal text-ink">{s.timeline}</b></span><span>{p.rangeLbl} <b className="font-normal text-ink">{s.range}</b></span></div>
                <div className="flex flex-wrap gap-3"><Link className="btn btn--ink" href={serviceHref(locale, CARD_PAGE[s.id])}>{SERVICE_UI[locale].details} <Arrow /></Link><Link className="btn btn--line" href={`${href(locale, "contact")}?service=${s.id}`}>{p.quoteBtn}</Link></div>
              </Reveal>
            </article>
          ))}
        </div>
      </section>
      <section className="sec bg-navy-2 text-bone" data-tone="dark">
        <div className="shell">
          <SectionHead dark eyebrow={p.eyebrow} h={SERVICE_UI[locale].related} />
          <ul className="grid gap-px bg-hairline-d border border-hairline-d rounded-card overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_PAGES.map((sp) => <li key={sp.id} className="bg-navy-2"><Link className="flex items-center justify-between gap-4 p-5 no-underline text-bone hover:bg-bone/5" href={serviceHref(locale, sp.id)}><span className="d text-step-1">{sp.t[locale].name}</span><Arrow className="w-4 h-4 text-amber" /></Link></li>)}
          </ul>
        </div>
      </section>
      <section className="sec bg-bone-2" data-tone="light">
        <div className="shell">
          <SectionHead eyebrow={p.faqEyebrow} h={p.faqH} lede={p.faqLede} />
          <Reveal className="faq max-w-[52rem]">
            {p.faq.map((f, i) => <details key={f.q} open={i === 0}><summary>{f.q}</summary><p className="text-muted pb-6 max-w-[60ch]">{f.a}</p></details>)}
          </Reveal>
        </div>
      </section>
      <CtaBand locale={locale} h={p.ctaH} p={p.ctaP} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
