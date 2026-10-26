/* Every URL on the site resolves to one Route. Fixed pages come from SLUGS;
   service, town and guide pages come from their content collections. The
   same Route renders in either language, which is what lets the language
   switch, hreflang and the sitemap always point at the true equivalent. */
import { SLUGS, pageFromSlug, pathFor, type Locale, type PageKey } from "./i18n";
import { SERVICE_PAGES, type ServicePageId } from "./content-services";
import { AREA_PAGES, type AreaId } from "./content-areas";
import { GUIDES, type GuideId } from "./content-guides";

export type Route =
  | { kind: "page"; key: PageKey }
  | { kind: "service"; id: ServicePageId }
  | { kind: "area"; id: AreaId }
  | { kind: "guide"; id: GuideId };

const COLLECTIONS = {
  service: { base: "services" as PageKey, items: SERVICE_PAGES },
  area: { base: "areas" as PageKey, items: AREA_PAGES },
  guide: { base: "guides" as PageKey, items: GUIDES },
} as const;

export function resolve(locale: Locale, slug: string[] | undefined): Route | null {
  const key = pageFromSlug(locale, slug);
  if (key) return { kind: "page", key };
  if (!slug || slug.length !== 2) return null;
  const [base, leaf] = slug;
  for (const kind of ["service", "area", "guide"] as const) {
    const col = COLLECTIONS[kind];
    if (base !== SLUGS[locale][col.base]) continue;
    const item = (col.items as { id: string; slug: Record<Locale, string> }[]).find((x) => x.slug[locale] === leaf);
    return item ? ({ kind, id: item.id } as Route) : null;
  }
  return null;
}

export function routeHref(locale: Locale, r: Route, hash?: string): string {
  if (r.kind === "page") return pathFor(locale, SLUGS[locale][r.key], hash);
  const col = COLLECTIONS[r.kind];
  const item = (col.items as { id: string; slug: Record<Locale, string> }[]).find((x) => x.id === r.id)!;
  return pathFor(locale, `${SLUGS[locale][col.base]}/${item.slug[locale]}`, hash);
}

export const serviceHref = (locale: Locale, id: ServicePageId) => routeHref(locale, { kind: "service", id });
export const areaHref = (locale: Locale, id: AreaId) => routeHref(locale, { kind: "area", id });
export const guideHref = (locale: Locale, id: GuideId) => routeHref(locale, { kind: "guide", id });

/** Route for the current pathname (used by the nav's language switch). Unknown → home. */
export function routeFromPath(locale: Locale, pathname: string): Route {
  // Server renders see the internal rewrite ("/en/services"); browsers see "/services".
  const rest = pathname.replace(locale === "es" ? /^\/es\/?/ : /^\/(en\/?)?/, "");
  return resolve(locale, rest ? rest.split("/").filter(Boolean) : []) ?? { kind: "page", key: "home" };
}

/** Every indexable route, for the sitemap, static params and llms.txt. */
export function indexableRoutes(): Route[] {
  const pages: PageKey[] = ["home", "services", "about", "work", "reviews", "contact", "help", "facts", "estimator", "areas", "guides", "privacy"];
  return [
    ...pages.map((key) => ({ kind: "page", key }) as Route),
    ...SERVICE_PAGES.map((s) => ({ kind: "service", id: s.id }) as Route),
    ...AREA_PAGES.map((a) => ({ kind: "area", id: a.id }) as Route),
    ...GUIDES.map((g) => ({ kind: "guide", id: g.id }) as Route),
  ];
}
