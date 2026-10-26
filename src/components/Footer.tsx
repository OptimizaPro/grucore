import Link from "next/link";
import Image from "next/image";
import { Phone, Arrow, WhatsApp } from "./Icons";
import { BRAND, CONTENT } from "@/lib/content";
import { waHref } from "@/lib/wa";
import { SERVICE_PAGES } from "@/lib/content-services";
import { AREA_PAGES } from "@/lib/content-areas";
import { FACTS } from "@/lib/content-facts";
import { href, type Locale } from "@/lib/i18n";
import { areaHref, serviceHref } from "@/lib/routes";

/* The footer doubles as the site's internal-link hub: every service page,
   every town page and the planning tools are one click from anywhere. */
export default function Footer({ locale }: { locale: Locale }) {
  const c = CONTENT[locale];
  const other: Locale = locale === "en" ? "es" : "en";
  const H = ({ children }: { children: React.ReactNode }) => <p className="font-mono font-normal text-[.74rem] tracking-[.24em] uppercase text-bone/60 mb-4">{children}</p>;
  const L = ({ to, children }: { to: string; children: React.ReactNode }) => <li><Link className="text-bone hover:text-amber no-underline" href={to}>{children}</Link></li>;
  return (
    <>
      {locale === "en" && (
        /* Many bilingual homeowners search in English ("spanish speaking contractor near me"),
           so English pages carry the Spanish trust signal too. */
        <aside className="bg-bone-2 border-t border-hairline" data-tone="light" lang="es">
          <div className="shell flex flex-wrap items-center justify-between gap-4 py-5">
            <p className="text-ink"><strong className="d text-step-1 text-navy mr-2">Hablamos español.</strong><span className="text-muted">Spanish-speaking contractor in Auburn · Presupuesto, contrato y obra en español.</span></p>
            <div className="flex flex-wrap gap-2">
              <a className="btn btn--line btn--sm" href={href("es", "home")} hrefLang="es">Ver en español</a>
              <a className="btn btn--sm bg-[#075e54] text-white" href={waHref(locale)} target="_blank" rel="noopener"><WhatsApp /> WhatsApp</a>
            </div>
          </div>
        </aside>
      )}
      <footer className="bg-navy-2 text-muted-d border-t border-hairline-d pt-14 md:pt-24 pb-8" data-tone="dark">
        <div className="shell">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:gap-gutter">
            <div>
              <Link className="inline-block mb-5" href={href(locale, "home")} aria-label={BRAND.name}><Image src="/brand/logo-on-dark.png" alt={BRAND.name} width={1076} height={680} sizes="220px" className="w-[220px] h-auto" /></Link>
              <p className="max-w-[40ch] text-step--1">{c.footer.blurb}</p>
              <span className="inline-flex items-center gap-2 mt-4 rounded-full border border-hairline-d px-3 py-1.5 font-mono text-[.72rem] tracking-[.12em] uppercase text-bone before:content-[''] before:w-[7px] before:h-[7px] before:rounded-full before:bg-amber">{c.footer.badge}{/^#?0+$/.test(BRAND.license.replace(/\D/g, "")) ? "" : ` · HBLB ${BRAND.license}`}</span>
            </div>
            <div><H>{c.footer.services}</H><ul className="grid gap-2">{SERVICE_PAGES.map((s) => <L key={s.id} to={serviceHref(locale, s.id)}>{s.t[locale].name}</L>)}</ul></div>
            <div className="grid gap-10 content-start">
              <div><H>{c.footer.areas}</H><ul className="grid gap-2">
                {AREA_PAGES.map((a) => <L key={a.id} to={areaHref(locale, a.id)}>{a.t[locale].name}</L>)}
                <L to={href(locale, "areas")}>{c.footer.allAreas}</L>
              </ul></div>
              <div><H>{c.footer.company}</H><ul className="grid gap-2">
                {(["about", "work", "reviews", "contact"] as const).map((k) => <L key={k} to={href(locale, k)}>{c.nav[k]}</L>)}
                <li><a className="text-bone hover:text-amber no-underline" href={href(other, "home")} hrefLang={other} lang={other}>{c.footer.otherSite}</a></li>
              </ul></div>
            </div>
            <div className="grid gap-10 content-start">
              <div><H>{c.footer.contact}</H><ul className="grid gap-2">
                <li><a className="text-bone hover:text-amber no-underline" href={`tel:${BRAND.tel}`}>{BRAND.phone}</a></li>
                <li><a className="text-bone hover:text-amber no-underline" href={waHref(locale)} target="_blank" rel="noopener">WhatsApp</a></li>
                <li><a className="text-bone hover:text-amber no-underline break-all" href={`mailto:${BRAND.email}`}>{BRAND.email}</a></li>
                <li>{BRAND.city}, {BRAND.region} {BRAND.zip}</li>
                <li>{c.footer.hours[0]}<br />{c.footer.hours[1]}</li>
              </ul></div>
              <div><H>{c.footer.resources}</H><ul className="grid gap-2">
                <L to={href(locale, "help")}>{c.footer.help}</L>
                <L to={href(locale, "estimator")}>{c.footer.estimator}</L>
                <L to={href(locale, "guides")}>{c.footer.guides}</L>
                <L to={href(locale, "facts")}>{FACTS[locale].nav}</L>
              </ul></div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-hairline-d flex flex-wrap justify-between gap-x-8 gap-y-2 font-mono text-[.72rem] tracking-[.1em] uppercase text-bone/60">
            <span>© {new Date().getFullYear()} {BRAND.name}. {c.footer.rights}</span>
            <span><Link className="hover:text-amber" href={href(locale, "privacy")}>{c.footer.privacy}</Link> · Auburn · Opelika · Lee County, Alabama</span>
          </div>
        </div>
      </footer>
      {/* sticky phone-width action bar: call · WhatsApp · quote */}
      {/* Mobile bar. Spanish path: WhatsApp is a full button and comes first. */}
      <div className={`fixed left-3 right-3 bottom-3 z-[900] grid gap-1.5 p-1.5 rounded-full bg-navy-2/95 shadow-[0_20px_50px_-20px_rgba(0,0,0,.6)] lg:hidden ${locale === "es" ? "grid-cols-[1.3fr_auto_1.2fr]" : "grid-cols-[1fr_auto_1.45fr]"}`} aria-label={c.ui.quickActions} data-track="mobile-bar">
        {locale === "es"
          ? <a href={waHref(locale)} target="_blank" rel="noopener" className="h-[46px] px-3 rounded-full inline-flex items-center justify-center gap-2 no-underline font-display uppercase font-bold tracking-[.04em] text-[.95rem] text-bone bg-[#075e54]"><WhatsApp className="w-5 h-5" /> WhatsApp</a>
          : <a href={`tel:${BRAND.tel}`} className="h-[46px] rounded-full inline-flex items-center justify-center gap-2 no-underline font-display uppercase font-bold tracking-[.06em] text-bone border border-hairline-d-strong"><Phone className="w-4 h-4" /> {c.ui.call}</a>}
        {locale === "es"
          ? <a href={`tel:${BRAND.tel}`} aria-label={c.ui.call} className="h-[46px] w-[46px] rounded-full inline-flex items-center justify-center text-bone border border-hairline-d-strong"><Phone className="w-5 h-5" /></a>
          : <a href={waHref(locale)} target="_blank" rel="noopener" aria-label={c.ui.whatsapp} className="h-[46px] w-[46px] rounded-full inline-flex items-center justify-center text-bone bg-[#075e54]"><WhatsApp className="w-5 h-5" /></a>}
        <Link href={href(locale, "contact")} className="h-[46px] px-3 rounded-full inline-flex items-center justify-center gap-1.5 no-underline font-display uppercase font-bold tracking-[.04em] whitespace-nowrap text-[.95rem] bg-amber text-navy-2">{c.ui.quoteShort} <Arrow className="w-4 h-4 max-[380px]:hidden" /></Link>
      </div>
    </>
  );
}
