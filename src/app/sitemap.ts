import type { MetadataRoute } from "next";
import { absolute, type Locale } from "@/lib/i18n";
import { indexableRoutes, routeHref, type Route } from "@/lib/routes";
import { GUIDES } from "@/lib/content-guides";
import { AREA_PAGES } from "@/lib/content-areas";
import { serviceById } from "@/lib/content-services";
import { photoAbs, type PhotoKey } from "@/lib/content";
import { CONTENT_UPDATED } from "@/lib/seo";
import { FACTS_VERIFIED } from "@/lib/content-facts";

/* Every indexable route in both languages, each with:
   - its hreflang set (same as the page's <link rel="alternate">),
   - a lastmod that only moves when content moves (guides carry their own
     date; everything else uses CONTENT_UPDATED) — Google ignores lastmod
     from sites that stamp every URL with the build time,
   - its hero image, so Google Images can index the job photos. */
const HERO: Record<string, PhotoKey> = { home: "hero", services: "worker4", about: "worker1", work: "kitchen2", reviews: "porch3", contact: "houseWhite", estimator: "kitchen3", guides: "worker3", areas: "porch1", privacy: "houseWhite", help: "worker1", facts: "worker4" };

function imageOf(r: Route): PhotoKey {
  if (r.kind === "service") return serviceById(r.id).photo;
  if (r.kind === "guide") return GUIDES.find((g) => g.id === r.id)!.photo;
  if (r.kind === "area") return AREA_PAGES.find((a) => a.id === r.id)!.photo;
  return HERO[r.key] ?? "hero";
}

export default function sitemap(): MetadataRoute.Sitemap {
  return indexableRoutes().flatMap((r) => {
    const priority = r.kind === "page" ? (r.key === "home" ? 1 : r.key === "privacy" ? 0.2 : 0.8) : r.kind === "service" ? 0.9 : 0.7;
    const lastModified = (r.kind === "guide" ? GUIDES.find((g) => g.id === r.id)?.updated : r.kind === "page" && r.key === "facts" ? FACTS_VERIFIED : undefined) ?? CONTENT_UPDATED;
    const en = absolute(routeHref("en", r)), es = absolute(routeHref("es", r));
    return (["en", "es"] as Locale[]).map((locale) => ({
      url: absolute(routeHref(locale, r)),
      lastModified, changeFrequency: r.kind === "guide" ? ("yearly" as const) : ("monthly" as const), priority,
      /* Next writes <image:loc> verbatim (no XML escaping), and the Unsplash
         query string's "&" would make the whole sitemap invalid XML. */
      images: [photoAbs(imageOf(r), 1600).replace(/&/g, "&amp;")],
      alternates: { languages: { "en-US": en, en, "es-US": es, es, "x-default": en } },
    }));
  });
}
