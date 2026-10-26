import { Fragment } from "react";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import CtaBand from "@/components/CtaBand";
import ProjectCta from "@/components/ProjectCta";
import { Arrow } from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { CONTENT, photoAbs } from "@/lib/content";
import { GUIDES, type GuideId } from "@/lib/content-guides";
import { serviceById } from "@/lib/content-services";
import { absolute, href, type Locale } from "@/lib/i18n";
import { guideHref, serviceHref } from "@/lib/routes";
import { article, faqPage, JsonLd } from "@/lib/schema";
import { guideText, wordCount } from "@/lib/guide-kit";
import { plainText, Rich } from "@/lib/inline";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Long-form guide. The "short answer" box up top is deliberate: it's the
   sentence Google's AI Overviews and ChatGPT lift when they cite a page. */
export default function GuidePage({ locale, id }: { locale: Locale; id: GuideId }) {
  const c = CONTENT[locale], gi = c.guidesIndex;
  const g = GUIDES.find((x) => x.id === id)!, t = g.t[locale];
  const path = guideHref(locale, id);
  const svc = serviceById(g.service);
  const words = wordCount(guideText(t)), minutes = Math.max(3, Math.round(words / 220));
  const next = (g.related ?? []).map((r) => GUIDES.find((x) => x.id === r)).filter((x): x is (typeof GUIDES)[number] => !!x);
  const R = ({ x }: { x: string }) => <Rich text={x} locale={locale} />;
  const date = new Date(g.updated + "T12:00:00Z").toLocaleDateString(locale === "es" ? "es-US" : "en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <>
      <PageHero photoKey={g.photo} alt={t.h1} eyebrow={t.eyebrow} h1={t.h1} lede={t.lede} />
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: c.footer.guides, path: href(locale, "guides") }, { name: t.h1, path }]} />
      <article className="bg-bone" data-tone="light">
        <div className="shell grid gap-12 py-14 md:py-20 lg:grid-cols-[1fr_18rem] lg:gap-gutter">
          <div className="max-w-[68ch]">
            <p className="slate text-muted mb-2">{gi.updated} <time dateTime={g.updated}>{date}</time> · {minutes} {gi.minRead}</p>
            <p className="text-step--1 text-muted mb-8 max-w-[56ch]">{gi.by}.</p>
            <Reveal className="rounded-card border-l-4 border-amber bg-bone-2 p-6 mb-12">
              <h2 className="eyebrow text-amber-deep mb-3">{gi.answer}</h2>
              <p className="text-step-1 leading-snug text-ink"><R x={t.answer} /></p>
            </Reveal>
            {t.sections.map((s, si) => (<Fragment key={s.h}>
              {si === 3 && t.sections.length >= 5 && <ProjectCta slim locale={locale} service={g.service} estimator={g.estimator} context={`${gi.read}: ${t.h1}`} where="guide" />}
              <section key={s.h} id={slugify(s.h)} className="mb-12 [scroll-margin-top:6rem]">
                <h2 className="d text-step-3 text-navy mb-4">{s.h}</h2>
                <div className="grid gap-4 text-muted">
                  {s.p?.map((p) => <p key={p}><R x={p} /></p>)}
                  {s.list && <ul className="grid gap-2 list-disc pl-5">{s.list.map((x) => <li key={x}><R x={x} /></li>)}</ul>}
                  {s.table && (
                    <div className="overflow-x-auto"><table className="w-full min-w-[32rem] text-step--1 border-collapse text-ink">
                      <thead><tr>{s.table.head.map((h) => <th key={h} scope="col" className="text-left py-2 pr-4 border-b-2 border-ink font-mono font-normal text-[.72rem] tracking-[.1em] uppercase">{h}</th>)}</tr></thead>
                      <tbody>{s.table.rows.map((r) => <tr key={r.join()} className="border-b border-hairline">{r.map((cell, i) => <td key={i} className={`py-2.5 pr-4 ${i ? "font-mono whitespace-nowrap" : ""}`}>{cell}</td>)}</tr>)}</tbody>
                    </table></div>
                  )}
                </div>
              </section>
            </Fragment>))}
            <ProjectCta locale={locale} service={g.service} estimator={g.estimator} context={`${gi.read}: ${t.h1}`} where="guide" />
            {t.faq.length > 0 && (
              <section className="faq">
                <h2 className="d text-step-3 text-navy mb-4">FAQ</h2>
                {t.faq.map((f) => <details key={f.q}><summary>{f.q}</summary><p className="text-muted pb-6"><R x={f.a} /></p></details>)}
              </section>
            )}
            {g.sources && g.sources.length > 0 && (
              <section className="mt-12 pt-6 border-t border-hairline">
                <h2 className="slate text-muted mb-3">{gi.sources}</h2>
                <ol className="grid gap-1.5 list-decimal pl-5 text-step--1 text-muted">{g.sources.map((src) => <li key={src.url}><a className="underline decoration-hairline-strong underline-offset-2 hover:text-ink break-words" href={src.url} target="_blank" rel="noopener">{src.name}</a></li>)}</ol>
              </section>
            )}
            {next.length > 0 && (
              <nav className="mt-12" aria-label={gi.next}>
                <h2 className="d text-step-2 text-navy mb-4">{gi.next}</h2>
                <ul className="grid gap-px bg-hairline border border-hairline rounded-card overflow-hidden sm:grid-cols-2">
                  {next.map((n) => <li key={n.id} className="bg-bone-2"><Link className="group block h-full p-5 no-underline hover:bg-bone" href={guideHref(locale, n.id)}><span className="slate text-amber-deep">{n.t[locale].eyebrow}</span><span className="block d text-step-1 text-navy mt-1.5">{n.t[locale].h1}</span></Link></li>)}
                </ul>
              </nav>
            )}
          </div>
          <aside className="lg:sticky lg:top-28 self-start grid gap-6">
            <nav className="rounded-card border border-hairline p-5" aria-label={gi.toc}>
              <h2 className="slate text-muted mb-3">{gi.toc}</h2>
              <ol className="grid gap-2 text-step--1">{t.sections.map((s) => <li key={s.h}><a className="hover:text-amber-deep" href={`#${slugify(s.h)}`}>{s.h}</a></li>)}</ol>
            </nav>
            <div className="rounded-card bg-navy-2 text-bone p-5" data-tone="dark">
              <h2 className="slate text-amber mb-2">{gi.related}</h2>
              <Link className="text-link text-bone" href={serviceHref(locale, g.service)}>{svc.t[locale].name} <Arrow /></Link>
              {g.estimator && <Link className="btn btn--solid btn--sm mt-4 w-full" href={`${href(locale, "estimator")}?type=${g.estimator}`}>{c.footer.estimator} <Arrow /></Link>}
            </div>
          </aside>
        </div>
      </article>
      <CtaBand locale={locale} h={gi.ctaH} p={gi.ctaP} btn={c.cta.btn} word={c.cta.word} />
      <JsonLd data={[
        article({ headline: t.h1, description: t.description, path, locale, image: photoAbs(g.photo, 1600), published: g.published, updated: g.updated, words, section: t.eyebrow.split(" · ")[0],
          about: `${absolute(serviceHref(locale, g.service))}#service`, aboutName: svc.t[locale].name, aboutUrl: absolute(serviceHref(locale, g.service)), citations: g.sources, mentions: ["Auburn, Alabama", "Opelika, Alabama", "Lee County, Alabama"] }),
        ...(t.faq.length ? [faqPage(t.faq.map((f) => ({ q: f.q, a: plainText(f.a) })))] : []),
      ]} />
    </>
  );
}
