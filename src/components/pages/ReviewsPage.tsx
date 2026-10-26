import Link from "next/link";
import PageHero from "@/components/PageHero";
import CtaBand from "@/components/CtaBand";
import ReviewsBlock from "@/components/ReviewsBlock";
import { Arrow } from "@/components/Icons";
import { Reveal } from "@/components/motion";
import { BRAND, CONTENT } from "@/lib/content";
import { href, type Locale } from "@/lib/i18n";
import { photo } from "@/lib/content";

export default function ReviewsPage({ locale }: { locale: Locale }) {
  const c = CONTENT[locale]; const r = c.reviews;
  return (
    <>
      <PageHero photoKey="porch3" alt={r.h1} eyebrow={r.eyebrow} h1={r.h1} lede={r.lede} />
      <section className="sec bg-bone" data-tone="light">
        <div className="shell">
          <Reveal><p className="lede text-muted mb-10 md:mb-12">{r.intro}</p></Reveal>
          <ReviewsBlock locale={locale} />
        </div>
      </section>
      <section className="sec bg-navy text-bone" data-tone="dark">
        <div className="shell grid gap-10 md:grid-cols-2 md:gap-gutter">
          <Reveal>
            <span className="eyebrow text-amber mb-4">{r.askEyebrow}</span><h2 className="d h-md">{r.askH}</h2>
            <p className="mt-4 max-w-[58ch] text-muted-d">{r.askP}</p>
            <div className="flex flex-wrap gap-3 mt-6"><a className="btn btn--solid" href={BRAND.googleReviewUrl} rel="noopener" target="_blank">{r.google} <Arrow /></a></div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow text-amber mb-4">{r.refEyebrow}</span><h2 className="d h-md">{r.refH}</h2>
            <p className="mt-4 max-w-[58ch] text-muted-d">{r.refP}</p>
            <Link className="text-link text-bone mt-6" href={href(locale, "contact")}>{r.refLink} <Arrow /></Link>
          </Reveal>
        </div>
      </section>
      <CtaBand locale={locale} h={c.cta.h} p={c.cta.p} btn={c.cta.btn} word={c.cta.word} />
    </>
  );
}
