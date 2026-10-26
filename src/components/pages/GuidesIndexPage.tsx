import Link from "next/link";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import Photo from "@/components/Photo";
import CtaBand from "@/components/CtaBand";
import { Arrow } from "@/components/Icons";
import { Stagger, Item } from "@/components/motion";
import { CONTENT } from "@/lib/content";
import { GUIDES } from "@/lib/content-guides";
import { href, type Locale } from "@/lib/i18n";
import { guideHref } from "@/lib/routes";

export default function GuidesIndexPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale], gi = c.guidesIndex;
  return (
    <>
      <PageHero photoKey="worker3" alt={gi.h1} eyebrow={gi.eyebrow} h1={gi.h1} lede={gi.lede}>
        <Link className="btn btn--ghost self-start mt-2" href={href(locale, "help")}>{c.footer.help} <Arrow /></Link>
      </PageHero>
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: c.footer.guides, path: href(locale, "guides") }]} />
      <section className="sec bg-bone" data-tone="light">
        <Stagger className="shell grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {GUIDES.map((g) => (
            <Item key={g.id}>
              <Link href={guideHref(locale, g.id)} className="svc group block h-full overflow-hidden rounded-card border border-hairline bg-bone-2 no-underline text-ink">
                <div className="relative aspect-[16/9] overflow-hidden"><Photo k={g.photo} alt={g.t[locale].h1} /></div>
                <div className="p-6">
                  <span className="slate text-amber-deep">{g.t[locale].eyebrow}</span>
                  <h2 className="d text-step-2 leading-[.95] text-navy mt-2 mb-3">{g.t[locale].h1}</h2>
                  <p className="text-step--1 text-muted">{g.t[locale].description}</p>
                  <span className="text-link text-navy mt-4">{gi.read} <Arrow /></span>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>
      <CtaBand locale={locale} h={gi.ctaH} p={gi.ctaP} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
