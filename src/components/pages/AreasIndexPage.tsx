import Link from "next/link";
import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import Photo from "@/components/Photo";
import CtaBand from "@/components/CtaBand";
import { Arrow } from "@/components/Icons";
import { Reveal, Stagger, Item } from "@/components/motion";
import { CONTENT } from "@/lib/content";
import { AREA_PAGES } from "@/lib/content-areas";
import { href, type Locale } from "@/lib/i18n";
import { areaHref } from "@/lib/routes";

export default function AreasIndexPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale], ai = c.areasIndex;
  return (
    <>
      <PageHero photoKey="porch1" alt={ai.h1} eyebrow={ai.eyebrow} h1={ai.h1} lede={ai.lede} />
      <Breadcrumbs items={[{ name: c.ui.home, path: href(locale, "home") }, { name: c.footer.areas, path: href(locale, "areas") }]} />
      <section className="sec bg-bone" data-tone="light">
        <Stagger className="shell grid gap-6 md:grid-cols-2">
          {AREA_PAGES.map((a) => (
            <Item key={a.id}>
              <Link href={areaHref(locale, a.id)} className="svc group grid sm:grid-cols-[12rem_1fr] h-full overflow-hidden rounded-card border border-hairline bg-bone-2 no-underline text-ink">
                <div className="relative aspect-[16/9] sm:aspect-auto overflow-hidden"><Photo k={a.photo} alt={a.t[locale].h1} sizes="(min-width: 40rem) 12rem, 100vw" /></div>
                <div className="p-6">
                  <h2 className="d text-step-2 text-navy">{a.t[locale].name}</h2>
                  <p className="mt-2 text-step--1 text-muted">{a.t[locale].lede}</p>
                  <span className="text-link text-navy mt-3">{ai.view} <Arrow /></span>
                </div>
              </Link>
            </Item>
          ))}
        </Stagger>
        <Reveal className="shell mt-12 max-w-[60ch]">
          <h2 className="d text-step-2 text-navy mb-2">{ai.also}</h2>
          <p className="text-muted">{ai.alsoP}</p>
        </Reveal>
      </section>
      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
