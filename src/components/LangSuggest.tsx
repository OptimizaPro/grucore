"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { lookupAlt, type AltMap } from "@/lib/alt-lookup";
import type { SiteContent } from "@/lib/content";

export default function LangSuggest({ locale, t, altMap }: { locale: Locale; t: SiteContent["langSuggest"]; altMap: AltMap }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const other: Locale = locale === "en" ? "es" : "en";
  const [alt] = lookupAlt(altMap, locale, pathname);

  useEffect(() => {
    let pref: string | null = null;
    try { pref = localStorage.getItem("zc-lang"); } catch {}
    const external = !document.referrer || !document.referrer.startsWith(location.origin);
    if (pref && pref !== locale && external) { location.replace(alt); return; }
    if (pref) return;
    const sys = ((navigator.languages && navigator.languages[0]) || navigator.language || "").slice(0, 2).toLowerCase();
    const want: Locale = sys === "es" ? "es" : "en";
    if (want !== locale) { const id = setTimeout(() => setShow(true), 900); return () => clearTimeout(id); }
  }, [locale, alt]);

  const choose = (v: Locale) => { try { localStorage.setItem("zc-lang", v); } catch {} };
  return (
    <div role="status" className={`fixed left-1/2 bottom-[84px] lg:bottom-7 z-[950] flex items-center gap-2.5 max-w-[calc(100%-2rem)] rounded-full border border-hairline bg-bone text-navy-2 pl-4 pr-2 py-2 font-semibold text-step--1 shadow-[0_20px_50px_-18px_rgba(0,0,0,.55)] transition-[opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${show ? "opacity-100 -translate-x-1/2 translate-y-0" : "opacity-0 -translate-x-1/2 translate-y-5 pointer-events-none"}`}>
      <span>{t.msg}</span>
      <a className="btn btn--solid h-[2.4rem] px-4 text-[.9rem]" href={alt} hrefLang={other} lang={other} onClick={() => choose(other)}>{t.go}</a>
      <button className="w-[34px] h-[34px] rounded-full text-muted text-xl leading-none" aria-label={t.dismiss} onClick={() => { choose(locale); setShow(false); }}>×</button>
    </div>
  );
}
