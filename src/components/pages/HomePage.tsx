import Link from "next/link";
import Background3D from "@/components/three/Background3D";
import BlueprintHud from "@/components/BlueprintHud";
import Photo from "@/components/Photo";
import Marquee from "@/components/Marquee";
import Compare from "@/components/Compare";
import CtaBand from "@/components/CtaBand";
import SectionHead from "@/components/SectionHead";
import ReviewsBlock from "@/components/ReviewsBlock";
import { Arrow, Check, WhatsApp } from "@/components/Icons";
import { Reveal, Stagger, Item, SplitWords, Counter, Magnetic } from "@/components/motion";
import { BRAND, CONTENT, type Service } from "@/lib/content";
import { waHref } from "@/lib/wa";
import { href, type Locale } from "@/lib/i18n";
import { serviceHref } from "@/lib/routes";
import { CARD_PAGE, type ServicePageId } from "@/lib/content-services";
import { ESTIMATOR, kRange, type EstimatorType } from "@/lib/estimator";

/* Four ranges a homeowner asks about first, each linking to its service page. */
const PRICE_PICKS: [EstimatorType, 0 | 1 | 2, ServicePageId][] = [["interior", 1, "painting"], ["cabinets", 1, "cabinets"], ["bath", 1, "bathroom"], ["kitchen", 1, "kitchen"]];

function ServiceCard({ s, n, locale }: { s: Service; n: number; locale: Locale }) {
  return (
    <Item>
      <Link href={serviceHref(locale, CARD_PAGE[s.id])} className="svc group relative block h-full overflow-hidden rounded-card border border-hairline-d bg-void/75 text-bone no-underline transition-colors hover:border-hairline-d-strong">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Photo k={s.photo} alt={s.alt} sizes="(min-width: 80rem) 20vw, (min-width: 40rem) 33vw, 100vw" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(15,26,46,.85))]" />
          <span className="absolute top-4 left-5 font-mono text-[.78rem] tracking-[.14em] text-amber-bright [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">0{n}</span>
          <span className="svc__arrow absolute top-3.5 right-3.5 w-10 h-10 rounded-full border border-hairline-d-strong grid place-items-center"><Arrow className="w-4 h-4" /></span>
        </div>
        <div className="p-5 pb-6">
          <h3 className="d text-step-2 leading-[.95] mb-2">{s.name}</h3>
          <p className="text-step--1 text-muted-d">{s.blurb}</p>
        </div>
      </Link>
    </Item>
  );
}

export default function HomePage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale];
  const h = c.home;
  const groups = [
    { label: h.split.finish, sub: h.split.finishSub, list: c.services.filter((s) => s.group === "finish"), start: 1 },
    { label: h.split.build, sub: h.split.buildSub, list: c.services.filter((s) => s.group === "build"), start: 4 },
  ];
  const showcase = c.work.cells.find((x) => x.kind === "compare" && x.cat === "bath")!; // the owner's own bathroom before/after

  return (
    <>
      {/* ---- canvas zone: hero, proof and services share the WebGL + slideshow background ---- */}
      <div id="canvas-zone" className="relative text-bone">
        <Background3D zoneId="canvas-zone" />

        {/* HERO */}
        <section className="relative flex min-h-[100svh] items-end" data-tone="dark">
          <div className="absolute inset-0 -z-[1] bg-[linear-gradient(180deg,rgba(10,17,32,.35),rgba(10,17,32,.15)_35%,rgba(10,17,32,.8)_100%)]" />
          <div className="absolute inset-0 -z-[1] bg-[linear-gradient(90deg,rgba(10,17,32,.8)_0%,rgba(10,17,32,.55)_45%,rgba(10,17,32,.1)_100%)]" />
          <BlueprintHud />
          <div className="shell relative grid gap-4 pt-[calc(var(--barh)+5rem)] pb-24 sm:pb-16 md:pb-20">
            {/* The H1 is the plain-language line (service + place), which is what
                Google reads; the big brand tagline below it is a styled <p>. */}
            <h1 className="rise eyebrow self-start justify-self-start w-fit max-w-full rounded-md bg-navy-2/70 px-2.5 py-1 leading-tight text-amber-bright font-normal">{h.eyebrow}</h1>
            <p className="d d-xl max-w-[13ch]">
              <SplitWords text={h.h1} className="block" delay={0.1} />
              <SplitWords text={h.h1Accent} className="block text-amber" delay={0.45} />
            </p>
            <p className="rise lede text-bone/95" style={{ ["--d" as string]: ".55s" }}>{h.lede}</p>
            <div className="rise flex flex-wrap gap-3 mt-2" style={{ ["--d" as string]: ".7s" }}>
              <Magnetic><Link className="btn btn--solid" href={href(locale, "contact")}>{h.primary} <Arrow /></Link></Magnetic>
              {/* Spanish-speaking households reach for WhatsApp first (Pew 2024: 54% of Hispanic adults), so the Spanish path offers it up front. */}
              {locale === "es"
                ? <a className="btn btn--ghost" href={waHref(locale)} target="_blank" rel="noopener"><WhatsApp className="w-[18px] h-[18px]" /> {c.ui.whatsappCta}</a>
                : <Link className="btn btn--ghost" href={href(locale, "estimator")}>{h.secondary}</Link>}
            </div>
            <ul className="flex flex-wrap gap-x-7 gap-y-2.5 mt-6 pt-5 border-t border-hairline-d-strong slate text-bone">
              {h.meta.map((m, i) => <li key={m} className="rise flex items-center gap-2" style={{ ["--d" as string]: `${0.85 + i * 0.07}s` }}><Check className="w-3.5 h-3.5 text-amber" /> {m}</li>)}
            </ul>
          </div>
          <div className="scrollcue absolute right-gutter bottom-8 hidden lg:flex items-center gap-3 font-mono text-[.68rem] tracking-[.18em] uppercase text-bone/70 [writing-mode:vertical-rl]" aria-hidden="true"><i />{c.ui.scroll}</div>
        </section>

        {/* PROOF */}
        <section className="relative py-14 md:py-20" data-tone="dark">
          <div className="absolute inset-0 -z-[1] bg-[linear-gradient(180deg,rgba(10,17,32,.55),rgba(10,17,32,.35))]" />
          <div className="shell relative">
            <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline-d border border-hairline-d rounded-card overflow-hidden">
              {h.proof.map((k, i) => {
                const inner = <>
                  <strong className="block d text-step-4 leading-[.9] text-bone">{k.value !== undefined ? <Counter value={k.value} decimals={k.decimals} /> : k.display}</strong>
                  <span className="block mt-3 font-display uppercase text-step-1 leading-none text-amber-bright">{k.label}</span>
                  <span className="block mt-2 slate text-bone/70">{k.note}</span>
                </>;
                /* The rating tile links out to where the reviews actually live; an isolated claim is worth less than a verifiable one. */
                return i === 0
                  ? <Item key={k.label}><a className="block h-full bg-void/70 p-6 md:p-8 no-underline hover:bg-void/90 transition-colors" href={BRAND.angiUrl} target="_blank" rel="noopener">{inner}</a></Item>
                  : <Item key={k.label} className="bg-void/70 p-6 md:p-8">{inner}</Item>;
              })}
            </Stagger>
          </div>
        </section>

        {/* SERVICES SPLIT: painting first, where the scene has turned to liquid paint */}
        <section id="services" className="relative pb-20 md:pb-28 pt-4" data-tone="dark">
          <div className="absolute inset-0 -z-[1] bg-[linear-gradient(180deg,rgba(10,17,32,.2),rgba(10,17,32,.7)_25%,rgba(10,17,32,.95)_100%)]" />
          <div className="shell relative">
            <SectionHead dark eyebrow={h.split.eyebrow} h={h.split.h} lede={h.split.lede} />
            <div className="grid gap-12">
              {groups.map((g, gi) => (
                <div key={g.label}>
                  <Reveal className="flex items-baseline gap-4 pb-4 mb-5 border-b border-hairline-d-strong">
                    <span className="font-mono text-[.78rem] tracking-[.14em] text-amber">0{gi + 1}</span>
                    <h3 className="d text-step-2 leading-none">{g.label}</h3>
                    <span className="slate text-bone/60 ml-auto hidden sm:inline">{g.sub}</span>
                  </Reveal>
                  <Stagger className="grid gap-4 sm:grid-cols-3">
                    {g.list.map((s, i) => <ServiceCard key={s.id} s={s} n={g.start + i} locale={locale} />)}
                  </Stagger>
                </div>
              ))}
            </div>
            <Reveal className="mt-10"><Link className="text-link text-bone" href={href(locale, "services")}>{h.split.link} <Arrow /></Link></Reveal>
          </div>
        </section>
      </div>

      <Marquee items={h.marquee} />

      {/* PRICING: none of the 14 local competitors checked in Sep 2026 publish a price. Four headline ranges from the same table that drives the estimator. */}
      <section className="sec bg-bone" data-tone="light" id="pricing">
        <div className="shell">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-gutter lg:items-end mb-10">
            <Reveal>
              <span className="eyebrow text-amber-deep mb-4">{h.pricing.eyebrow}</span>
              <h2 className="d h-md text-navy max-w-[16ch]">{h.pricing.h}</h2>
            </Reveal>
            <Reveal delay={0.1}><p className="max-w-[56ch] text-muted">{h.pricing.p}</p></Reveal>
          </div>
          <Stagger className="grid gap-px bg-hairline border border-hairline rounded-card overflow-hidden sm:grid-cols-2 xl:grid-cols-4">
            {PRICE_PICKS.map(([type, tier, page]) => {
              const d = ESTIMATOR[type], t = d.tiers[tier];
              return (
                <Item key={type}>
                  <Link href={serviceHref(locale, page)} className="group block h-full bg-bone-2 p-6 md:p-7 no-underline hover:bg-bone transition-colors">
                    <span className="block slate text-amber-deep">{d.l[locale]}</span>
                    <strong className="block d text-step-4 leading-[.9] text-navy mt-3">{kRange(t.lo, t.hi)}</strong>
                    <span className="block mt-3 font-display uppercase text-step-0 leading-tight text-ink">{t.l[locale]}</span>
                    <span className="block mt-1.5 text-step--1 text-muted">{t.d[locale]}</span>
                    <span className="text-link text-navy mt-5 text-[.8rem] group-hover:text-amber-deep">{h.pricing.from} <Arrow className="w-3.5 h-3.5" /></span>
                  </Link>
                </Item>
              );
            })}
          </Stagger>
          <Reveal className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <p className="text-step--1 text-muted">{h.pricing.note}</p>
            <Link className="btn btn--ink" href={href(locale, "estimator")}>{h.pricing.btn} <Arrow /></Link>
          </Reveal>
        </div>
      </section>

      {/* RENTAL TURNS: the niche most local contractors only serve by accident */}
      <section className="sec bg-bone" data-tone="light">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-[calc(var(--spacing-gutter)*1.5)] lg:items-center">
          <Reveal className="relative overflow-hidden rounded-card-lg aspect-[5/4]">
            <Photo k="floor1" alt={h.rental.points[1]} sizes="(min-width: 60rem) 50vw, 100vw" />
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow text-amber-deep mb-4">{h.rental.eyebrow}</span>
            <h2 className="d h-md text-navy max-w-[16ch]">{h.rental.h}</h2>
            <p className="mt-4 max-w-[56ch] text-muted">{h.rental.p}</p>
            <ul className="grid gap-3 my-6">{h.rental.points.map((x) => <li key={x} className="flex gap-3 items-start"><Check className="w-5 h-5 shrink-0 mt-[.2em] text-amber-deep" /><span>{x}</span></li>)}</ul>
            <Link className="btn btn--ink" href={serviceHref(locale, "rental")}>{h.rental.btn} <Arrow /></Link>
          </Reveal>
        </div>
      </section>

      {/* PROCESS + BEFORE/AFTER */}
      <section className="sec bg-bone-2" data-tone="light">
        <div className="shell">
          <SectionHead eyebrow={h.processEyebrow} h={h.processH} />
          <Stagger className="grid gap-px bg-hairline border-y border-hairline md:grid-cols-2 xl:grid-cols-4">
            {h.steps.map((s, i) => (
              <Item key={s.h} className="bg-bone-2 p-7 pb-8">
                <span className="block font-mono text-[.8rem] tracking-[.14em] text-amber-deep mb-6">0{i + 1}</span>
                <h3 className="d text-step-2 leading-[.95] text-navy mb-2">{s.h}</h3>
                <p className="text-step--1 text-muted">{s.p}</p>
              </Item>
            ))}
          </Stagger>

          <Reveal className="mt-6"><Link className="text-link text-navy normal-case tracking-normal font-body font-semibold text-step-0" href={href(locale, "help")}>{h.newbie} <Arrow /></Link></Reveal>

          <div className="grid gap-8 mt-16 md:mt-24 lg:grid-cols-[1.2fr_.8fr] lg:gap-gutter lg:items-center">
            <Reveal>
              <Compare before={showcase.before!} after={showcase.after!} altBefore={showcase.altBefore!} altAfter={showcase.altAfter!} labels={[c.ui.before, c.ui.after]} ariaLabel={c.ui.dragToCompare} portrait={showcase.portrait} />
            </Reveal>
            <Reveal delay={0.1}>
              <span className="eyebrow text-amber-deep mb-4">{h.workEyebrow}</span>
              <h2 className="d h-md text-navy">{h.workH}</h2>
              <p className="mt-4 max-w-[48ch] text-muted">{h.workP}</p>
              <Link className="btn btn--ink mt-6" href={href(locale, "work")}>{h.workBtn} <Arrow /></Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="sec bg-navy-2 text-bone" data-tone="dark">
        <div className="shell">
          <SectionHead dark eyebrow={h.reviewsEyebrow} h={h.reviewsH} />
          <ReviewsBlock locale={locale} dark limit={3} />
        </div>
      </section>

      {/* AREA */}
      <section className="sec bg-bone" data-tone="light">
        <div className="shell grid gap-8 md:grid-cols-[1fr_1.1fr] md:gap-gutter md:items-end">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{h.areaEyebrow}</span>
            <h2 className="d h-md text-navy">{h.areaH}</h2>
            <p className="mt-4 max-w-[48ch] text-muted">{h.areaP}</p>
            <Link className="text-link text-navy mt-6" href={href(locale, "areas")}>{h.areaLink} <Arrow /></Link>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="grid grid-cols-2 gap-x-8 text-step-0">{c.areas.map((a) => <li key={a} className="py-2.5 border-b border-hairline">{a}</li>)}</ul>
          </Reveal>
        </div>
      </section>

      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
