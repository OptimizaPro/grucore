import Link from "next/link";
import Photo from "@/components/Photo";
import { Arrow, WhatsApp } from "@/components/Icons";
import { SplitWords, Reveal } from "@/components/motion";
import { BRAND, CONTENT } from "@/lib/content";
import { waHref } from "@/lib/wa";
import { href, type Locale } from "@/lib/i18n";

export default function ThanksPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]; const t = c.thanks;
  return (
    <section className="relative isolate flex items-end min-h-[min(72svh,720px)] overflow-clip bg-navy-2 text-bone" data-tone="dark">
      <div className="absolute inset-0 -z-30"><Photo k="porch1" alt={t.h1} sizes="100vw" priority /></div>
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(15,26,46,.42),rgba(15,26,46,.94))]" />
      <div className="shell relative grid gap-4 pt-[calc(var(--barh)+5rem)] pb-16">
        <span className="eyebrow self-start justify-self-start w-fit max-w-full rounded-md bg-navy-2/70 px-2.5 py-1 leading-tight text-amber-bright">{t.eyebrow}</span>
        <SplitWords as="h1" text={t.h1} className="d d-lg max-w-[16ch]" />
        <Reveal delay={0.4}><p className="lede text-bone/95">{t.lede} <a className="text-amber" href={`tel:${BRAND.tel}`}>{BRAND.phone}</a>.</p></Reveal>
        <Reveal delay={0.5} className="mt-4 max-w-[52ch]">
          <h2 className="eyebrow text-amber-bright mb-3">{t.nextH}</h2>
          <ol className="grid gap-2">{t.next.map((x, i) => <li key={x} className="flex gap-3"><span className="font-mono text-amber">0{i + 1}</span><span className="text-bone/90">{x}</span></li>)}</ol>
        </Reveal>
        <Reveal delay={0.6} className="flex flex-wrap gap-3 mt-4"><a className="btn btn--solid" href={waHref(locale, "photos")} target="_blank" rel="noopener"><WhatsApp /> {t.wa}</a><Link className="btn btn--ghost" href={href(locale, "work")}>{t.work}</Link></Reveal>
      </div>
    </section>
  );
}
