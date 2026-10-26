import Link from "next/link";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import CostEstimator from "@/components/CostEstimator";
import CtaBand from "@/components/CtaBand";
import { Arrow } from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { CONTENT } from "@/lib/content";
import { GUIDES } from "@/lib/content-guides";
import { ESTIMATOR, money } from "@/lib/estimator";
import { absolute, href, type Locale } from "@/lib/i18n";
import { guideHref } from "@/lib/routes";
import { BUSINESS_ID, JsonLd } from "@/lib/schema";

export default function EstimatorPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale], e = c.estimator;
  const guides = GUIDES.filter((g) => g.estimator);
  return (
    <>
      <PageHero photoKey="kitchen3" alt={e.h1} eyebrow={e.eyebrow} h1={e.h1} lede={e.lede} />
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: c.footer.estimator, path: href(locale, "estimator") }]} />
      <section className="sec bg-bone" data-tone="light">
        <div className="shell"><Suspense fallback={null}><CostEstimator locale={locale} t={{ estimator: c.estimator, funnel: c.funnel, contact: c.contact }} /></Suspense></div>
      </section>
      {/* The full price table, server-rendered, so search engines and AI assistants can read and cite it. */}
      <section className="sec bg-bone-2" data-tone="light">
        <div className="shell">
          <Reveal>
            <span className="eyebrow text-amber-deep mb-4">{e.resultNote}</span>
            <h2 className="d h-md text-navy max-w-[20ch]">{e.result} · {e.finish.mid.l}</h2>
          </Reveal>
          <Reveal className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-step--1 border-collapse">
              <tbody>
                {Object.values(ESTIMATOR).map((d) => d.tiers.map((t, i) => (
                  <tr key={d.l.en + i} className="border-b border-hairline">
                    {i === 0 && <th rowSpan={3} scope="rowgroup" className="py-3 pr-4 text-left align-top d text-step-1 text-navy">{d.l[locale]}</th>}
                    <td className="py-3 pr-4">{t.l[locale]}<span className="block text-muted">{t.d[locale]}</span></td>
                    <td className="py-3 text-right font-mono whitespace-nowrap">{money(t.lo)}–{money(t.hi)}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </Reveal>
          <p className="mt-6 text-step--1 text-muted max-w-[70ch]">{e.disclaimer}</p>
          {guides.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="d text-step-2 text-navy mb-4">{e.guidesH}</h2>
              <ul className="grid gap-2">{guides.map((g) => <li key={g.id}><Link className="text-link text-navy" href={guideHref(locale, g.id)}>{g.t[locale].h1} <Arrow /></Link></li>)}</ul>
            </Reveal>
          )}
        </div>
      </section>
      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebApplication", name: e.h1, applicationCategory: "UtilitiesApplication", operatingSystem: "Any", inLanguage: locale, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        /* The price table as a catalog, so "how much does X cost in Auburn" answers can cite a range. */
        { "@context": "https://schema.org", "@type": "OfferCatalog", name: `${e.result} · ${e.finish.mid.l}`, url: absolute(href(locale, "estimator")), inLanguage: locale,
          itemListElement: Object.values(ESTIMATOR).flatMap((d) => d.tiers.map((t) => ({
            "@type": "Offer", name: `${d.l[locale]}: ${t.l[locale]}`, description: t.d[locale], priceCurrency: "USD", offeredBy: { "@id": BUSINESS_ID },
            areaServed: { "@type": "AdministrativeArea", name: "Lee County, AL" },
            priceSpecification: { "@type": "PriceSpecification", minPrice: t.lo, maxPrice: t.hi, priceCurrency: "USD" },
          }))) },
      ]} />
    </>
  );
}
