/* Browser side of the twin-page map (see alt-map.ts): types and a lookup
   with no runtime imports, so it adds nothing to client bundles. */
import type { Locale } from "./i18n";

export type NavKey = "home" | "services" | "about" | "work" | "reviews" | "contact";
export type AltMap = Record<string, [alt: string, section: NavKey | null]>;

/** Client-safe lookup (no imports beyond types). Server renders see the internal
    "/en/..." rewrite; browsers see "/...". Unknown paths fall back to the other home. */
export function lookupAlt(map: AltMap, locale: Locale, pathname: string): [string, NavKey | null] {
  let p = pathname.replace(/\/$/, "") || "/";
  if (locale === "en") p = p.replace(/^\/en(?=\/|$)/, "") || "/";
  return map[p] ?? [locale === "en" ? "/es" : "/", null];
}
