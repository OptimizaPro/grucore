import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import QuoteForm from "@/components/QuoteForm";
import Promise from "@/components/Promise";
import { Reveal } from "@/components/motion";
import { BRAND, CONTENT } from "@/lib/content";
import { waHref } from "@/lib/wa";
import Link from "next/link";
import { Arrow } from "@/components/Icons";
import { href, type Locale } from "@/lib/i18n";
import { photo } from "@/lib/content";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-card border border-hairline bg-bone p-6 pb-5"><h3 className="font-mono font-normal text-[.74rem] tracking-[.14em] uppercase text-muted mb-3">{title}</h3>{children}</div>;
}

export default function ContactPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]; const k = c.contact;
  return (
    <>
      <PageHero photoKey="houseWhite" alt={k.h1} eyebrow={k.eyebrow} h1={k.h1} lede={k.lede} />
      <section className="sec bg-bone" data-tone="light" id="quote">
        <div className="shell grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-[calc(var(--spacing-gutter)*1.6)] lg:items-start">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{k.formEyebrow}</span>
            <h2 className="d h-md text-navy">{k.formH}</h2>
            <p className="mt-3 text-muted">{k.formP}</p>
            <Suspense fallback={null}><QuoteForm locale={locale} t={c.contact} /></Suspense>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-4">
            <Promise locale={locale} />
            <Card title={k.callH}><a className="d text-step-2 text-navy hover:text-amber-deep no-underline" href={`tel:${BRAND.tel}`}>{BRAND.phone}</a><p className="mt-2 text-step--1 text-muted">{k.callP}</p></Card>
            <Card title={k.waH}><a className="d text-step-1 text-navy hover:text-amber-deep no-underline" href={waHref(locale)} target="_blank" rel="noopener">WhatsApp →</a><p className="mt-2 text-step--1 text-muted">{k.waP}</p></Card>
            <Card title={k.emailH}><a className="d text-step-1 text-navy hover:text-amber-deep no-underline break-all" href={`mailto:${BRAND.email}`}>{BRAND.email}</a><p className="mt-2 text-step--1 text-muted">{k.emailP}</p></Card>
            <Card title={k.hoursH}><table className="w-full text-step--1 border-collapse"><tbody>{k.hoursRows.map(([d, t]) => <tr key={d} className="border-b border-hairline last:border-0"><td className="py-2">{d}</td><td className="py-2 text-right font-mono text-[.72rem] tracking-[.06em]">{t}</td></tr>)}</tbody></table></Card>
            <Card title={k.basedH}><p className="text-ink">{BRAND.city}, Alabama {BRAND.zip}<br /><span className="text-muted">{k.basedP}</span></p></Card>
          </Reveal>
        </div>
      </section>
      <section className="sec bg-bone-2" data-tone="light" id="areas">
        <div className="shell grid gap-8 md:grid-cols-2 md:gap-gutter">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{k.areaEyebrow}</span><h2 className="d h-md text-navy">{k.areaH}</h2>
            <p className="mt-4 max-w-[58ch] text-muted">{k.areaP}</p>
            <ul className="grid grid-cols-2 gap-x-6 mt-6 text-step--1">{c.areas.map((x) => <li key={x} className="py-1.5 border-b border-hairline">{x}</li>)}</ul>
            <Link className="text-link text-navy mt-6" href={href(locale, "areas")}>{c.footer.allAreas} <Arrow /></Link>
          </Reveal>
          <Reveal delay={0.1}><iframe className="w-full aspect-[16/10] rounded-card border-0 saturate-75" title={k.mapTitle} src={`https://www.google.com/maps?q=Auburn,+AL&z=10&output=embed&hl=${locale}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></Reveal>
        </div>
      </section>
    </>
  );
}
