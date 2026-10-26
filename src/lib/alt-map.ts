/* Server-built lookup: for every URL in a language, its twin in the other
   language and which top-nav item it belongs to. The nav and the language
   prompt run in the browser; handing them this small map means they never
   import the route tables (and with them every page's copy) client-side. */
import { href, type Locale } from "./i18n";
import { indexableRoutes, routeHref, type Route } from "./routes";

import type { AltMap, NavKey } from "./alt-lookup";
export type { AltMap, NavKey } from "./alt-lookup";

export function altMap(locale: Locale): AltMap {
  const other: Locale = locale === "en" ? "es" : "en";
  const routes: Route[] = [...indexableRoutes(), { kind: "page", key: "thanks" }, { kind: "page", key: "review" }];
  const nav: readonly string[] = ["home", "services", "about", "work", "reviews", "contact"];
  const out: AltMap = {};
  for (const r of routes) {
    const alt = r.kind === "page" && r.key === "thanks" ? href(other, "home") : routeHref(other, r);
    const section = r.kind === "page" ? (nav.includes(r.key) ? (r.key as NavKey) : null) : r.kind === "service" ? "services" : null;
    out[routeHref(locale, r)] = [alt, section];
  }
  return out;
}
