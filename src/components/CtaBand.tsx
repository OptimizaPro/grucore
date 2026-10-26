import Link from "next/link";
import { Arrow, Phone } from "./Icons";
import { BRAND } from "@/lib/content";
import { href, type Locale } from "@/lib/i18n";
import { Reveal } from "./motion";

export default function CtaBand({ locale, h, p, btn, word }: { locale: Locale; h: string; p: string; btn: string; word: string }) {
  return (
    <section className="relative overflow-clip bg-amber text-navy-2" data-tone="light">
      <div className="shell grid gap-6 items-center py-14 md:py-20 md:grid-cols-[1fr_auto]">
        <Reveal>
          <h2 className="d h-md max-w-[14ch]">{h}</h2>
          <p className="mt-3 max-w-[44ch] text-step-1 text-navy-2/85">{p}</p>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-wrap gap-3">
          <Link className="btn btn--ink" href={href(locale, "contact")}>{btn} <Arrow /></Link>
          <a className="btn btn--line" href={`tel:${BRAND.tel}`}><Phone /> {BRAND.phone}</a>
        </Reveal>
      </div>
      <div aria-hidden="true" className="absolute -right-[2vw] -bottom-[0.18em] d text-[min(14vw,12rem)] leading-none text-navy-2/[0.07] whitespace-nowrap pointer-events-none">{word}</div>
    </section>
  );
}
