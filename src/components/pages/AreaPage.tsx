import Link from "next/link";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";
import SectionHead from "@/components/SectionHead";
import QuoteForm from "@/components/QuoteForm";
import { Arrow, Check, Phone } from "@/components/Icons";
import { Reveal, Stagger, Item } from "@/components/motion";
import { BRAND, CONTENT } from "@/lib/content";
import { AREA_PAGES, areaSummary, type AreaId } from "@/lib/content-areas";
import { CONTENT_UPDATED } from "@/lib/seo";
import { GUIDES } from "@/lib/content-guides";
import { SERVICE_PAGES, SERVICE_UI, serviceById } from "@/lib/content-services";
import { href, type Locale } from "@/lib/i18n";
import { areaHref, guideHref, serviceHref } from "@/lib/routes";
import { faqPage, JsonLd } from "@/lib/schema";

export default function AreaPage({ locale, id }: { locale: Locale; id: AreaId }) {
  const c = CONTENT[locale], ai = c.areasIndex, ui = SERVICE_UI[locale];
  const a = AREA_PAGES.find((x) => x.id === id)!, t = a.t[locale];
  const path = areaHref(locale, id);
  const guides = GUIDES.filter((g) => a.popular.includes(g.service) || g.id === "permits").slice(0, 6);
  const others = AREA_PAGES.filter((x) => x.id !== id);
  return (
    <>
      <PageHero photoKey={a.photo} alt={t.h1} eyebrow={t.eyebrow} h1={t.h1} lede={t.lede}>
        <div className="flex flex-wrap gap-3 mt-2">
          <a className="btn btn--solid" href="#quote">{c.ui.freeQuote} <Arrow /></a>
          <a className="btn btn--ghost" href={`tel:${BRAND.tel}`}><Phone /> {BRAND.phone}</a>
        </div>
      </PageHero>
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: c.footer.areas, path: href(locale, "areas") }, { name: t.name, path }]} />

      <section className="sec bg-bone" data-tone="light">
        <div className="shell grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:gap-gutter lg:items-start">
          <Reveal className="grid gap-4 max-w-[62ch] text-muted">
            <p className="text-ink font-semibold">{areaSummary(locale, a)}</p>
            {t.intro.map((p) => <p key={p}>{p}</p>)}
            <p className="slate">{ui.updated} <time dateTime={CONTENT_UPDATED}>{new Date(CONTENT_UPDATED + "T12:00:00Z").toLocaleDateString(locale === "es" ? "es-US" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time></p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-card border border-hairline bg-bone-2 p-6">
            <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-3">{ai.places}</h2>
            <ul className="grid grid-cols-2 gap-x-4 text-step--1">{t.places.map((p) => <li key={p} className="py-1.5 border-b border-hairline">{p}</li>)}</ul>
            <p className="mt-4 slate text-amber-deep">{ai.drive}: {a.drive[locale]}</p>
          </Reveal>
        </div>
      </section>

      <section className="sec bg-bone-2" data-tone="light">
        <div className="shell">
          <SectionHead eyebrow={t.name} h={ai.popular} />
          <Stagger className="grid gap-px bg-hairline border border-hairline rounded-card overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
            {[...a.popular, ...SERVICE_PAGES.map((s) => s.id).filter((x) => !a.popular.includes(x))].map((sid) => {
              const s = serviceById(sid).t[locale];
              return (
                <Item key={sid} className="bg-bone-2">
                  <Link className="group block p-6 no-underline text-ink h-full hover:bg-bone" href={serviceHref(locale, sid)}>
                    <h3 className="d text-step-1 text-navy">{s.name} <span className="text-muted">· {t.name}</span></h3>
                    <p className="mt-2 text-step--1 text-muted">{s.glance.range}</p>
                    <span className="text-link text-amber-deep mt-3 text-[.9rem]">{ai.viewService} <Arrow /></span>
                  </Link>
                </Item>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="sec bg-bone" data-tone="light">
        <div className="shell">
          <SectionHead eyebrow={t.name} h={ai.local} />
          <Stagger className="grid gap-5 md:grid-cols-2">
            {t.local.map((l) => (
              <Item key={l.h} className="flex gap-4 rounded-card border border-hairline p-6">
                <Check className="w-5 h-5 shrink-0 mt-1 text-amber-deep" />
                <div><h3 className="d text-step-1 text-navy mb-1">{l.h}</h3><p className="text-step--1 text-muted">{l.p}</p></div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="sec bg-bone-2" data-tone="light">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-gutter">
          <div>
            <SectionHead eyebrow={ui.faqEyebrow} h={ui.faqH} />
            <Reveal className="faq">{t.faq.map((f, i) => <details key={f.q} open={i === 0}><summary>{f.q}</summary><p className="text-muted pb-6">{f.a}</p></details>)}</Reveal>
          </div>
          <Reveal delay={0.1}><iframe className="w-full aspect-[4/3] rounded-card border-0 saturate-75" title={`${t.name} map`} src={`https://www.google.com/maps?q=${encodeURIComponent(a.map)}&z=12&output=embed&hl=${locale}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></Reveal>
        </div>
      </section>

      <section className="sec bg-bone" data-tone="light" id="quote">
        <div className="shell grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-[calc(var(--spacing-gutter)*1.6)] lg:items-start">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{ui.formEyebrow}</span>
            <h2 className="d h-md text-navy">{ui.formH}</h2>
            <p className="mt-3 text-muted">{ui.formP}</p>
            <Suspense fallback={null}><QuoteForm locale={locale} t={c.contact} compact /></Suspense>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-3">{c.footer.allAreas}</h2>
            <ul className="grid gap-2">{others.map((o) => <li key={o.id}><Link className="text-link text-navy" href={areaHref(locale, o.id)}>{o.t[locale].name} <Arrow /></Link></li>)}</ul>
            <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mt-10 mb-3">{c.footer.guides} · {t.name}</h2>
            <ul className="grid gap-2">{guides.map((g) => <li key={g.id}><Link className="text-link text-navy normal-case tracking-normal font-body font-semibold" href={guideHref(locale, g.id)}>{g.t[locale].h1} <Arrow /></Link></li>)}</ul>
          </Reveal>
        </div>
      </section>
      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
      <JsonLd data={[
        faqPage(t.faq),
      ]} />
    </>
  );
}
