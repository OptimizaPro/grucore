import PageHero from "@/components/PageHero";
import Photo from "@/components/Photo";
import CtaBand from "@/components/CtaBand";
import SectionHead from "@/components/SectionHead";
import { Arrow, Check } from "@/components/Icons";
import { Reveal, Stagger, Item } from "@/components/motion";
import { BRAND, CONTENT } from "@/lib/content";
import { href, type Locale } from "@/lib/i18n";
import { photo } from "@/lib/content";

export default function AboutPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]; const a = c.about;
  return (
    <>
      <PageHero photoKey="worker1" alt={a.storyBadge} eyebrow={a.eyebrow} h1={a.h1} lede={a.lede} />
      <section className="sec bg-bone" data-tone="light">
        <div className="shell grid gap-8 lg:grid-cols-2 lg:gap-[calc(var(--spacing-gutter)*1.5)] lg:items-center">
          <Reveal className="relative overflow-hidden rounded-card-lg aspect-[4/5]">
            <Photo k="worker3" alt={a.storyBadge} sizes="(min-width: 60rem) 50vw, 100vw" />
            <span className="absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full bg-bone text-navy px-3.5 py-2 font-mono text-[.68rem] tracking-[.12em] uppercase before:content-[''] before:w-2 before:h-2 before:rounded-full before:bg-amber">{a.storyBadge}</span>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow text-amber-deep mb-4">{a.storyEyebrow}</span>
            <h2 className="d h-md text-navy">{a.storyH}</h2>
            <div className="mt-4 grid gap-4 max-w-[58ch] text-muted">{a.storyP.map((p) => <p key={p}>{p}</p>)}</div>
          </Reveal>
        </div>
      </section>
      <section className="sec bg-navy text-bone" data-tone="dark">
        <div className="shell">
          <SectionHead dark eyebrow={a.valuesEyebrow} h={a.valuesH} />
          <Stagger className="grid gap-px bg-hairline-d border-y border-hairline-d md:grid-cols-2 xl:grid-cols-4">
            {a.values.map((v, i) => <Item key={v.h} className="bg-navy p-7 pb-8"><span className="block font-mono text-[.8rem] tracking-[.14em] text-amber mb-6">0{i + 1}</span><h3 className="d text-step-2 leading-[.95] mb-2">{v.h}</h3><p className="text-step--1 text-muted-d">{v.p}</p></Item>)}
          </Stagger>
        </div>
      </section>
      <section className="sec bg-bone" data-tone="light">
        <div className="shell grid gap-10 md:grid-cols-2 md:gap-gutter">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{a.licEyebrow}</span>
            <h2 className="d h-md text-navy">{a.licH}</h2>
            <p className="mt-4 max-w-[58ch] text-muted">{a.licP}</p>
            <ul className="grid gap-3 my-6">{a.licChecks.map((x) => <li key={x} className="flex gap-3 items-start"><Check className="w-5 h-5 shrink-0 mt-[.2em] text-amber-deep" /><span>{x}</span></li>)}</ul>
            <a className="text-link text-navy text-[.9rem]" href={BRAND.hblbSearchUrl} target="_blank" rel="noopener">{a.licVerify} <Arrow /></a>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow text-amber-deep mb-4">{a.areaEyebrow}</span>
            <h2 className="d h-md text-navy">{a.areaH}</h2>
            <p className="mt-4 max-w-[58ch] text-muted">{a.areaP}</p>
            <ul className="grid grid-cols-2 gap-x-6 mt-6 text-step--1">{c.areas.slice(0, 8).map((x) => <li key={x} className="py-1.5 border-b border-hairline">{x}</li>)}</ul>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border border-hairline mt-8">{a.stats.map((s) => <div key={s.l} className="bg-bone p-5"><strong className="block d text-step-3 leading-[.95] text-navy">{s.n}</strong><span className="block mt-2 font-mono text-[.76rem] tracking-[.12em] uppercase text-muted">{s.l}</span></div>)}</div>
          </Reveal>
        </div>
      </section>
      <CtaBand locale={locale} h={a.ctaH} p={a.ctaP} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
