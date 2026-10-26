import Photo from "./Photo";
import { SplitWords } from "./motion";
import type { PhotoKey } from "@/lib/content";

/* Interior-page hero: full-bleed photo, dark scrim, bottom-left lockup. */
export default function PageHero({ photoKey, alt, eyebrow, h1, lede, children }: { photoKey: PhotoKey; alt: string; eyebrow: string; h1: string; lede: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate flex items-end min-h-[min(72svh,720px)] overflow-clip bg-navy-2 text-bone" data-tone="dark">
      <div className="absolute inset-0 -z-30"><Photo k={photoKey} alt={alt} sizes="100vw" priority /></div>
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(15,26,46,.42)_0%,rgba(15,26,46,.40)_40%,rgba(15,26,46,.94)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_80%_20%,rgba(227,147,30,.14),transparent_55%)]" />
      <div className="shell relative grid gap-4 pt-[calc(var(--barh)+5rem)] pb-12 md:pb-16">
        <span className="eyebrow self-start justify-self-start w-fit max-w-full rounded-md bg-navy-2/70 px-2.5 py-1 leading-tight text-amber-bright">{eyebrow}</span>
        <SplitWords as="h1" text={h1} className="d d-lg max-w-[16ch]" />
        <p className="lede text-bone/95">{lede}</p>
        {children}
      </div>
    </section>
  );
}
