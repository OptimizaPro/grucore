import Link from "next/link";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import CtaBand from "@/components/CtaBand";
import SectionHead from "@/components/SectionHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuoteForm from "@/components/QuoteForm";
import Promise from "@/components/Promise";
import Compare from "@/components/Compare";
import { Arrow, Check, Phone } from "@/components/Icons";
import { Reveal, Stagger, Item } from "@/components/motion";
import { BRAND, CONTENT, photoAbs, photoAlt } from "@/lib/content";
import { waHref } from "@/lib/wa";
import { SERVICE_UI, serviceById, type ServicePageId } from "@/lib/content-services";
import { AREA_PAGES } from "@/lib/content-areas";
import { GUIDES } from "@/lib/content-guides";
import { ESTIMATOR, kRange } from "@/lib/estimator";
import { CONTENT_UPDATED } from "@/lib/seo";
import { href, type Locale } from "@/lib/i18n";
import { areaHref, guideHref, serviceHref } from "@/lib/routes";
import { faqPage, JsonLd, serviceNode } from "@/lib/schema";

export default function ServiceDetailPage({ locale, id }: { locale: Locale; id: ServicePageId }) {
  const c = CONTENT[locale], ui = SERVICE_UI[locale];
  const s = serviceById(id), t = s.t[locale];
  const path = serviceHref(locale, id);
  const est = s.estimator ? ESTIMATOR[s.estimator].tiers : null;
  const areaNames = AREA_PAGES.length ? AREA_PAGES.map((a) => a.t[locale].name) : ["Auburn", "Opelika", "Smiths Station"];
  /* A before/after pair from the gallery for the categories that have one. */
  const cmpCat: Partial<Record<ServicePageId, "kitchen" | "exterior" | "deck" | "bath">> = { bathroom: "bath", kitchen: "kitchen", cabinets: "kitchen", rental: "kitchen", painting: "exterior", repairs: "deck", remodeling: "kitchen" };
  /* Hub → spoke: the guides written for this service, then any that point here as related. */
  const guides = GUIDES.filter((g) => g.service === id).concat(GUIDES.filter((g) => g.service !== id && s.related.includes(g.service))).slice(0, 4);
  const cmp = cmpCat[id] ? c.work.cells.find((x) => x.kind === "compare" && x.cat === cmpCat[id]) : undefined;

  return (
    <>
      <PageHero photoKey={s.photo} alt={t.alt} eyebrow={t.eyebrow} h1={t.h1} lede={t.lede}>
        <div className="flex flex-wrap gap-3 mt-2">
          <a className="btn btn--solid" href="#quote">{c.ui.freeQuote} <Arrow /></a>
          <a className="btn btn--ghost" href={`tel:${BRAND.tel}`}><Phone /> {BRAND.phone}</a>
        </div>
      </PageHero>
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: ui.crumbServices, path: href(locale, "services") }, { name: t.name, path }]} />

      {/* intro + at a glance */}
      <section className="sec bg-bone" data-tone="light">
        <div className="shell grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:gap-gutter lg:items-start">
          <Reveal className="grid gap-4 max-w-[62ch] text-muted">
            {t.intro.map((p) => <p key={p}>{p}</p>)}
          </Reveal>
          <Reveal delay={0.1} className="rounded-card border border-hairline bg-bone-2 p-6">
            <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-4">{ui.glance}</h2>
            <dl className="grid gap-4">
              {([[ui.timeline, t.glance.timeline], [ui.range, t.glance.range], [ui.permit, t.glance.permit], [ui.who, `${BRAND.name}, ${BRAND.city}, ${BRAND.region}`], [ui.where, ui.whereV], [ui.langs, ui.langsV]] as const).map(([k, v]) => (
                <div key={k} className="border-b border-hairline pb-3 last:border-0 last:pb-0"><dt className="slate text-amber-deep">{k}</dt><dd className="mt-1 text-ink">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-4 slate text-muted">{ui.updated} <time dateTime={CONTENT_UPDATED}>{new Date(CONTENT_UPDATED + "T12:00:00Z").toLocaleDateString(locale === "es" ? "es-US" : "en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })}</time></p>
            {s.estimator && <Link className="text-link text-navy mt-5" href={`${href(locale, "estimator")}?type=${s.estimator}`}>{ui.estimatorCta} <Arrow /></Link>}
          </Reveal>
        </div>
      </section>

      {/* included */}
      <section className="sec bg-bone-2" data-tone="light">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-[calc(var(--spacing-gutter)*1.5)] lg:items-center">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{t.name}</span>
            <h2 className="d h-md text-navy">{ui.included}</h2>
            <ul className="grid gap-3 mt-6 sm:grid-cols-2 sm:gap-x-6">{t.included.map((x) => <li key={x} className="flex gap-3 items-start text-step--1"><Check className="w-4 h-4 shrink-0 mt-[.3em] text-amber-deep" /><span>{x}</span></li>)}</ul>
          </Reveal>
          <Reveal delay={0.1} className="grid grid-cols-2 gap-3">
            {s.photos.map((k, i) => <div key={k} className={`relative overflow-hidden rounded-card aspect-[4/5] ${i ? "mt-10" : ""}`}><Photo k={k} alt={photoAlt(k, locale) ?? t.alt} sizes="(min-width: 60rem) 25vw, 50vw" /></div>)}
          </Reveal>
        </div>
      </section>

      {cmp && (
        <section className="sec bg-bone" data-tone="light">
          <div className="shell grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-gutter lg:items-center">
            <Reveal><Compare before={cmp.before!} after={cmp.after!} altBefore={cmp.altBefore!} altAfter={cmp.altAfter!} labels={[c.ui.before, c.ui.after]} ariaLabel={c.ui.dragToCompare} portrait={cmp.portrait} /></Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow text-amber-deep mb-4">{c.home.workEyebrow}</span>
              <h2 className="d h-md text-navy">{c.home.workH}</h2>
              <p className="mt-4 max-w-[48ch] text-muted">{c.home.workP}</p>
              <Link className="btn btn--ink mt-6" href={href(locale, "work")}>{c.home.workBtn} <Arrow /></Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* why us */}
      <section className="sec bg-navy-2 text-bone" data-tone="dark">
        <div className="shell">
          <SectionHead dark eyebrow={t.name} h={ui.why} />
          <Stagger className="grid gap-5 md:grid-cols-3">
            {t.why.map((w, i) => (
              <Item key={w.h} className="rounded-card border border-hairline-d bg-bone/[.04] p-7">
                <span className="block font-mono text-[.8rem] tracking-[.14em] text-amber mb-5">0{i + 1}</span>
                <h3 className="d text-step-2 leading-[.95] mb-2">{w.h}</h3>
                <p className="text-step--1 text-muted-d">{w.p}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* cost */}
      <section className="sec bg-bone" data-tone="light">
        <div className="shell">
          <SectionHead eyebrow={ui.costEyebrow} h={ui.costH} lede={t.costP} />
          {est && (
            <Reveal className="grid gap-px bg-hairline border border-hairline rounded-card overflow-hidden md:grid-cols-3 mb-10">
              {est.map((tier) => (
                <div key={tier.l.en} className="bg-bone-2 p-6">
                  <span className="slate text-amber-deep">{tier.l[locale]}</span>
                  <strong className="block d text-step-3 text-navy mt-2">{kRange(tier.lo, tier.hi)}</strong>
                  <span className="block mt-2 text-step--1 text-muted">{tier.d[locale]}</span>
                </div>
              ))}
            </Reveal>
          )}
          <Stagger className="grid gap-px bg-hairline border-y border-hairline md:grid-cols-2 xl:grid-cols-4">
            {t.factors.map((f) => <Item key={f.h} className="bg-bone p-6"><h3 className="d text-step-1 text-navy mb-2">{f.h}</h3><p className="text-step--1 text-muted">{f.p}</p></Item>)}
          </Stagger>
          {s.estimator && <Reveal className="mt-8"><Link className="btn btn--ink" href={`${href(locale, "estimator")}?type=${s.estimator}`}>{ui.estimatorCta} <Arrow /></Link></Reveal>}
        </div>
      </section>

      {/* process */}
      <section className="sec bg-bone-2" data-tone="light">
        <div className="shell">
          <SectionHead eyebrow={c.home.processEyebrow} h={c.home.processH} lede={c.home.processLede} />
          <Stagger className="grid gap-px bg-hairline border-y border-hairline md:grid-cols-2 xl:grid-cols-4">
            {c.home.steps.map((st, i) => (
              <Item key={st.h} className="bg-bone-2 p-7 pb-8">
                <span className="block font-mono text-[.8rem] tracking-[.14em] text-amber-deep mb-6">0{i + 1}</span>
                <h3 className="d text-step-2 leading-[.95] text-navy mb-2">{st.h}</h3>
                <p className="text-step--1 text-muted">{st.p}</p>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {guides.length > 0 && (
        <section className="sec bg-bone" data-tone="light">
          <div className="shell">
            <SectionHead eyebrow={c.footer.guides} h={c.guidesIndex.guidesFor} />
            <Stagger className="grid gap-px bg-hairline border border-hairline rounded-card overflow-hidden sm:grid-cols-2 xl:grid-cols-4">
              {guides.map((g) => (
                <Item key={g.id} className="bg-bone-2">
                  <Link className="group block h-full p-6 no-underline hover:bg-bone" href={guideHref(locale, g.id)}>
                    <span className="slate text-amber-deep">{g.t[locale].eyebrow}</span>
                    <h3 className="d text-step-1 text-navy mt-2 leading-[1.05]">{g.t[locale].h1}</h3>
                    <p className="mt-2 text-step--1 text-muted">{g.t[locale].lede}</p>
                    <span className="text-link text-navy mt-4 text-[.8rem] group-hover:text-amber-deep">{c.guidesIndex.read} <Arrow className="w-3.5 h-3.5" /></span>
                  </Link>
                </Item>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* faq */}
      <section className="sec bg-bone" data-tone="light">
        <div className="shell">
          <SectionHead eyebrow={ui.faqEyebrow} h={ui.faqH} />
          <Reveal className="faq max-w-[52rem]">
            {t.faq.map((f, i) => <details key={f.q} open={i === 0}><summary>{f.q}</summary><p className="text-muted pb-6 max-w-[60ch]">{f.a}</p></details>)}
          </Reveal>
        </div>
      </section>

      {/* form */}
      <section className="sec bg-bone-2" data-tone="light" id="quote">
        <div className="shell grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-[calc(var(--spacing-gutter)*1.6)] lg:items-start">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{ui.formEyebrow}</span>
            <h2 className="d h-md text-navy">{ui.formH}</h2>
            <p className="mt-3 text-muted">{ui.formP}</p>
            <Suspense fallback={null}><QuoteForm locale={locale} t={c.contact} service={s.form} compact /></Suspense>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-8">
            <Promise locale={locale} />
            <div>
              <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-3">{ui.related}</h2>
              <ul className="grid gap-2">{s.related.map((r) => <li key={r}><Link className="text-link text-navy" href={serviceHref(locale, r)}>{serviceById(r).t[locale].name} <Arrow /></Link></li>)}</ul>
            </div>
            {AREA_PAGES.length > 0 && (
              <div>
                <h2 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-3">{ui.areas}</h2>
                <ul className="flex flex-wrap gap-2">{AREA_PAGES.map((a) => <li key={a.id}><Link className="inline-block rounded-full border border-hairline-strong px-3 py-1.5 text-step--1 no-underline hover:border-ink" href={areaHref(locale, a.id)}>{t.name} · {a.t[locale].name}</Link></li>)}</ul>
              </div>
            )}
            <a className="inline-flex items-center gap-3 rounded-card border border-hairline bg-bone p-5 no-underline" href={waHref(locale, t.name.toLowerCase())} target="_blank" rel="noopener">
              <span className="d text-step-1 text-navy">{c.contact.waH}</span><span className="text-step--1 text-muted">{c.contact.waP}</span>
            </a>
          </Reveal>
        </div>
      </section>

      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
      <JsonLd data={[
        serviceNode({ name: t.name, description: t.description, path, locale, areas: areaNames, image: photoAbs(s.photo, 1600), lo: est?.[0].lo, hi: est?.[2].hi,
          tiers: est?.map((tier) => ({ name: `${t.name}: ${tier.l[locale]}`, description: tier.d[locale], lo: tier.lo, hi: tier.hi })),
          guides: guides.map((g) => ({ name: g.t[locale].h1, path: guideHref(locale, g.id) })) }),
        faqPage(t.faq),
      ]} />
    </>
  );
}
