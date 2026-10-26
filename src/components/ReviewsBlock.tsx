import { Stars, Arrow } from "./Icons";
import { Stagger, Item, Reveal } from "./motion";
import { BRAND, CONTENT } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/* Real reviews only. Until verbatim reviews are pasted into content.ts, this
   shows the actual rating and sends people to the profiles where the reviews
   live, instead of inventing quotes. */
export default function ReviewsBlock({ locale, dark = false, limit }: { locale: Locale; dark?: boolean; limit?: number }) {
  const c = CONTENT[locale]; const r = c.reviews;
  const items = limit ? r.items.slice(0, limit) : r.items;
  const muted = dark ? "text-muted-d" : "text-muted";
  const border = dark ? "border-hairline-d" : "border-hairline";

  if (items.length) {
    return (
      <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((x) => (
          <Item key={x.name} className={`flex flex-col gap-4 rounded-card border ${border} ${dark ? "bg-bone/[.04]" : "bg-bone"} p-7 pb-6`}>
            <Stars label={c.ui.starsLabel} />
            <blockquote className="flex-1 leading-[1.55]">&ldquo;{x.quote}&rdquo;</blockquote>
            <cite className="not-italic"><b className="block d text-step-1 leading-none">{x.name}</b><span className={`font-mono text-[.74rem] tracking-[.12em] uppercase ${muted}`}>{x.meta}</span></cite>
          </Item>
        ))}
      </Stagger>
    );
  }

  return (
    <Reveal className={`grid gap-8 rounded-card-lg border ${border} ${dark ? "bg-bone/[.04]" : "bg-bone"} p-7 md:p-10 md:grid-cols-[auto_1fr] md:items-center md:gap-12`}>
      <div className="flex items-center gap-5">
        <strong className={`d text-[clamp(4.5rem,10vw,7rem)] leading-[.8] ${dark ? "text-bone" : "text-navy"}`}>{BRAND.rating}</strong>
        <div className="grid gap-2"><Stars label={c.ui.starsLabel} /><span className={`slate ${muted}`}>{c.ui.ratingSources}</span></div>
      </div>
      <div>
        <h3 className={`d h-sm ${dark ? "text-bone" : "text-navy"}`}>{r.proofH}</h3>
        <p className={`mt-3 max-w-[52ch] ${muted}`}>{r.proofP}</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <a className={`btn ${dark ? "btn--ghost" : "btn--line"}`} href={BRAND.angiUrl} rel="noopener" target="_blank">{r.readAngi} <Arrow /></a>
          <a className={`btn ${dark ? "btn--ghost" : "btn--line"}`} href={BRAND.homeAdvisorUrl} rel="noopener" target="_blank">{r.readHA} <Arrow /></a>
        </div>
      </div>
    </Reveal>
  );
}
