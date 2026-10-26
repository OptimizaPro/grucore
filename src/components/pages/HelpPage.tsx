import Link from "next/link";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";
import HelpFilter from "@/components/HelpFilter";
import ProjectCta from "@/components/ProjectCta";
import { Arrow, Phone, WhatsApp } from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { BRAND, CONTENT } from "@/lib/content";
import { waHref } from "@/lib/wa";
import { HELP, type Audience } from "@/lib/content-help";
import { absolute, href, type Locale } from "@/lib/i18n";
import { plainText, Rich } from "@/lib/inline";
import { BUSINESS_ID, JsonLd } from "@/lib/schema";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/* The "start here" hub. Built for someone who has never hired a contractor:
   pick your lane (homeowner / landlord & business), type a question or
   browse, and every answer leads to the page that goes deeper. All answers
   are in the server HTML; the filter only hides and shows them. */
export default function HelpPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale], h = HELP[locale];
  const path = href(locale, "help");
  const lanes: Audience[] = ["home", "business"];

  return (
    <>
      <PageHero photoKey="worker1" alt={h.h1} eyebrow={h.eyebrow} h1={h.h1} lede={h.lede} />
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: c.footer.help, path }]} />

      {/* lanes + search */}
      <section className="bg-bone pt-12 md:pt-16 pb-6" data-tone="light">
        <div className="shell grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-gutter lg:items-end">
          <div className="grid gap-3 sm:grid-cols-2">
            {lanes.map((a) => {
              const first = h.groups.find((g) => g.audience === a);
              return first && (
                <a key={a} href={`#${first.id}`} className="group block rounded-card border border-hairline bg-bone-2 p-6 no-underline hover:border-navy transition-colors">
                  <span className="block d text-step-2 text-navy leading-none">{h.audiences[a].label}</span>
                  <span className="block mt-2 text-step--1 text-muted">{h.audiences[a].blurb}</span>
                  <span className="text-link text-navy mt-4 text-[.8rem] group-hover:text-amber-deep">{h.groups.filter((g) => g.audience === a).reduce((n, g) => n + g.qs.length, 0)} · {h.all} <Arrow className="w-3.5 h-3.5" /></span>
                </a>
              );
            })}
          </div>
          <HelpFilter target="help-list" label={h.searchLabel} placeholder={h.searchPh} empty={h.noResults} showing={h.showing} />
        </div>
        <nav className="shell mt-8" aria-label={h.all}>
          <ul className="flex flex-wrap gap-2">
            {h.groups.map((g) => <li key={g.id}><a className="inline-block rounded-full border border-hairline-strong px-3.5 py-1.5 text-step--1 no-underline hover:border-ink" href={`#${g.id}`}>{g.h}</a></li>)}
          </ul>
        </nav>
      </section>

      {/* questions */}
      <section className="bg-bone pb-16 md:pb-24" data-tone="light">
        <div className="shell" id="help-list">
          {lanes.map((a) => (
            <div key={a} className="mt-10 first:mt-4">
              <h2 className="eyebrow text-amber-deep mb-2">{h.audiences[a].label}</h2>
              {h.groups.filter((g) => g.audience === a).map((g) => (
                <section key={g.id} id={g.id} data-group className="grid gap-4 border-t border-hairline pt-8 mt-6 lg:grid-cols-[18rem_1fr] lg:gap-gutter [scroll-margin-top:6rem]">
                  <div>
                    <h3 className="d text-step-2 text-navy leading-[1.02]">{g.h}</h3>
                    <p className="mt-2 text-step--1 text-muted max-w-[34ch]">{g.intro}</p>
                  </div>
                  <div className="faq">
                    {g.qs.map((x) => (
                      <details key={x.q} data-q={norm(`${x.q} ${plainText(x.a)} ${g.h}`)}>
                        <summary>{x.q}</summary>
                        <p className="text-muted pb-6 max-w-[64ch]"><Rich text={x.a} locale={locale} /></p>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
              <ProjectCta locale={locale} service={a === "home" ? "painting" : "rental"} estimator={a === "home" ? "interior" : "rental"} context={`${h.h1} · ${h.audiences[a].label}`} where={`help-${a}`} />
            </div>
          ))}
        </div>
      </section>

      {/* hyper-local table */}
      {h.local.length > 0 && (
        <section className="sec bg-bone-2" data-tone="light" id="local">
          <div className="shell">
            <Reveal className="max-w-[60ch] mb-8">
              <span className="eyebrow text-amber-deep mb-4">Auburn · Opelika</span>
              <h2 className="d h-md text-navy">{h.localH}</h2>
              <p className="mt-3 text-muted">{h.localP}</p>
            </Reveal>
            <Reveal className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-step--1 border-collapse">
                <thead><tr>{h.localCols.map((col, i) => <th key={i} scope="col" className="text-left py-2 pr-4 border-b-2 border-ink font-mono font-normal text-[.72rem] tracking-[.1em] uppercase">{col}</th>)}</tr></thead>
                <tbody>
                  {h.local.map((f) => (
                    <tr key={f.label} className="border-b border-hairline align-top">
                      <th scope="row" className="py-3 pr-4 text-left d text-step-0 text-navy">{f.label}</th>
                      <td className="py-3 pr-4"><Rich text={f.auburn} locale={locale} /></td>
                      <td className="py-3 pr-4"><Rich text={f.opelika} locale={locale} />{f.note && <span className="block mt-1 text-muted text-[.85em]"><Rich text={f.note} locale={locale} /></span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>
        </section>
      )}

      {/* glossary */}
      <section className="sec bg-bone" data-tone="light" id="glossary">
        <div className="shell">
          <Reveal className="max-w-[60ch] mb-8">
            <span className="eyebrow text-amber-deep mb-4">A–Z</span>
            <h2 className="d h-md text-navy">{h.glossaryH}</h2>
            <p className="mt-3 text-muted">{h.glossaryP}</p>
          </Reveal>
          <dl className="grid gap-px bg-hairline border border-hairline rounded-card overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
            {h.glossary.map((t) => (
              <div key={t.term} className="bg-bone-2 p-5" id={`term-${norm(t.term).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>
                <dt className="d text-step-1 text-navy leading-tight">{t.term}</dt>
                <dd className="mt-1.5 text-step--1 text-muted"><Rich text={t.def} locale={locale} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* still stuck */}
      <section className="sec bg-navy-2 text-bone" data-tone="dark">
        <div className="shell grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <h2 className="d h-md">{h.stillH}</h2>
            <p className="mt-3 text-bone/85 max-w-[52ch]">{h.stillP}</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <a className="btn btn--solid" href={`tel:${BRAND.tel}`}><Phone /> {BRAND.phone}</a>
            <a className="btn btn--ghost" href={waHref(locale)} target="_blank" rel="noopener"><WhatsApp className="w-[18px] h-[18px]" /> WhatsApp</a>
            <Link className="btn btn--ghost" href={href(locale, "contact")}>{c.ui.freeQuote} <Arrow /></Link>
          </div>
        </div>
      </section>

      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "FAQPage", "@id": `${absolute(path)}#faq`, inLanguage: locale, isPartOf: { "@id": `${absolute(path)}#webpage` }, about: { "@id": BUSINESS_ID },
          mainEntity: h.groups.flatMap((g) => g.qs.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: plainText(x.a) } }))) },
        { "@context": "https://schema.org", "@type": "DefinedTermSet", "@id": `${absolute(path)}#glossary`, name: h.glossaryH, inLanguage: locale,
          hasDefinedTerm: h.glossary.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: plainText(t.def), url: `${absolute(path)}#term-${norm(t.term).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}` })) },
      ]} />
    </>
  );
}
