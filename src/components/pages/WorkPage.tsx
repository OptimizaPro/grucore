import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";
import CtaBand from "@/components/CtaBand";
import { CONTENT } from "@/lib/content";
import { href, type Locale } from "@/lib/i18n";
import { JsonLd, imageGallery } from "@/lib/schema";
import { photoAbs, photoAlt } from "@/lib/content";

export default function WorkPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]; const w = c.work;
  return (
    <>
      <JsonLd data={imageGallery({ name: c.meta.work.title, path: href(locale, "work"), locale,
        images: w.cells.flatMap((x) => x.kind === "compare" ? [{ url: photoAbs(x.before!, 1600), caption: x.altBefore! }, { url: photoAbs(x.after!, 1600), caption: x.altAfter! }] : [{ url: photoAbs(x.photo!, 1600), caption: photoAlt(x.photo!, locale) ?? `${x.title} · ${x.meta}` }]) })} />
      <PageHero photoKey="bathVanityAfter" alt={photoAlt("bathVanityAfter", locale) ?? w.cells[1].title} eyebrow={w.eyebrow} h1={w.h1} lede={w.lede} />
      <section className="sec bg-bone" data-tone="light">
        <div className="shell">
          <GalleryGrid cells={w.cells.map((x) => (x.photo && !x.alt ? { ...x, alt: photoAlt(x.photo, locale) ?? x.title } : x))} filters={w.filters} filterLabel={w.filterLbl} labels={[c.ui.before, c.ui.after]} compareLabel={c.ui.dragToCompare} beforeAfterText={`${c.ui.before} / ${c.ui.after}`} />
          <p className="mt-10 rounded-r-[10px] border-l-[3px] border-amber bg-amber/10 px-4 py-3.5 text-step--1">{w.notice}</p>
        </div>
      </section>
      <CtaBand locale={locale} h={w.ctaH} p={w.ctaP} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
