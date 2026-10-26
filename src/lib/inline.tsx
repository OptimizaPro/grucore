/* Inline links inside content strings: [anchor](kind:id) → the right URL for
   the current language, rendered as a Next <Link>. See guide-kit.ts for the
   syntax. `plainText` strips the markup for schema and meta; `markdown`
   rewrites it with absolute URLs for /llms-full.txt. */
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { absolute, href, type Locale, type PageKey } from "./i18n";
import { areaHref, guideHref, serviceHref } from "./routes";
import type { ServicePageId } from "./content-services";
import type { AreaId } from "./content-areas";
import type { GuideId } from "./guide-kit";

const RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function resolveTarget(target: string, locale: Locale): { url: string; external: boolean } | null {
  if (/^https?:\/\//.test(target)) return { url: target, external: true };
  const [kind, id] = target.split(":");
  switch (kind) {
    case "service": return { url: serviceHref(locale, id as ServicePageId), external: false };
    case "guide": return { url: guideHref(locale, id as GuideId), external: false };
    case "area": return { url: areaHref(locale, id as AreaId), external: false };
    case "page": return { url: href(locale, id as PageKey), external: false };
    default: return null;
  }
}

export function Rich({ text, locale, linkClass = "text-navy underline decoration-amber/60 underline-offset-[3px] hover:text-amber-deep" }: { text: string; locale: Locale; linkClass?: string }) {
  const out: ReactNode[] = [];
  let last = 0, i = 0;
  for (const m of text.matchAll(RE)) {
    out.push(text.slice(last, m.index));
    const t = resolveTarget(m[2], locale);
    if (!t) out.push(m[1]);
    else if (t.external) out.push(<a key={i++} className={linkClass} href={t.url} target="_blank" rel="noopener">{m[1]}</a>);
    else out.push(<Link key={i++} className={linkClass} href={t.url}>{m[1]}</Link>);
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out.map((x, k) => <Fragment key={k}>{x}</Fragment>)}</>;
}

export const plainText = (text: string) => text.replace(RE, "$1");

export const markdown = (text: string, locale: Locale) =>
  text.replace(RE, (_, a: string, target: string) => { const t = resolveTarget(target, locale); return t ? `[${a}](${t.external ? t.url : absolute(t.url)})` : a; });

/** Every internal route a string links to, for link-integrity checks. */
export const linkTargets = (text: string) => [...text.matchAll(RE)].map((m) => m[2]);
