import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "@/components/pages/HomePage";
import ServicesPage from "@/components/pages/ServicesPage";
import AboutPage from "@/components/pages/AboutPage";
import WorkPage from "@/components/pages/WorkPage";
import ReviewsPage from "@/components/pages/ReviewsPage";
import ContactPage from "@/components/pages/ContactPage";
import ThanksPage from "@/components/pages/ThanksPage";
import ReviewRequestPage from "@/components/pages/ReviewRequestPage";
import EstimatorPage from "@/components/pages/EstimatorPage";
import GuidesIndexPage from "@/components/pages/GuidesIndexPage";
import GuidePage from "@/components/pages/GuidePage";
import AreasIndexPage from "@/components/pages/AreasIndexPage";
import AreaPage from "@/components/pages/AreaPage";
import ServiceDetailPage from "@/components/pages/ServiceDetailPage";
import PrivacyPage from "@/components/pages/PrivacyPage";
import HelpPage from "@/components/pages/HelpPage";
import FactsPage from "@/components/pages/FactsPage";
import { HELP } from "@/lib/content-help";
import { FACTS, FACTS_VERIFIED } from "@/lib/content-facts";
import { CONTENT, photoAbs, type PhotoKey } from "@/lib/content";
import { serviceById } from "@/lib/content-services";
import { AREA_PAGES } from "@/lib/content-areas";
import { GUIDES } from "@/lib/content-guides";
import { absolute, isLocale, LOCALES, type Locale, type PageKey } from "@/lib/i18n";
import { indexableRoutes, resolve, routeHref, type Route } from "@/lib/routes";
import { BUSINESS_ID, JsonLd, webPage, type PageKind } from "@/lib/schema";
import { CONTENT_UPDATED } from "@/lib/seo";

type Params = Promise<{ locale: string; slug?: string[] }>;

export function generateStaticParams() {
  const routes: Route[] = [...indexableRoutes(), { kind: "page", key: "thanks" }, { kind: "page", key: "review" }];
  return LOCALES.flatMap((locale) =>
    routes.map((r) => routeHref(locale, r)).map((p) => p.replace(/^\/es/, "").replace(/^\//, "")).filter(Boolean).map((s) => ({ locale, slug: s.split("/") })),
  );
}

const OG: Record<PageKey, PhotoKey> = {
  home: "hero", services: "kitchen1", about: "worker1", work: "bathVanityAfter", reviews: "porch3", contact: "houseWhite", thanks: "porch1",
  estimator: "kitchen3", guides: "worker3", areas: "porch1", privacy: "houseWhite", review: "porch3", help: "worker1", facts: "worker4",
};

/* Branded share card in the page's language; see src/app/api/og/route.tsx. */
const ogCard = (locale: Locale, title: string, image: PhotoKey) =>
  absolute(`/api/og?${new URLSearchParams({ t: title.split(" | ")[0], k: CONTENT[locale].home.eyebrow, p: image, l: locale })}`);

/* en-US / es-US for the local market, plus language-only en / es so a
   Spanish speaker searching from anywhere (a relative in Mexico helping a
   parent in Opelika) still gets the Spanish page. */
const hreflang = (r: Route) => {
  const en = absolute(routeHref("en", r)), es = absolute(routeHref("es", r));
  return { "en-US": en, en, "es-US": es, es, "x-default": en };
};

const KIND: Partial<Record<PageKey, PageKind>> = { about: "AboutPage", contact: "ContactPage", services: "CollectionPage", guides: "CollectionPage", areas: "CollectionPage", work: "CollectionPage" };

/** Main entity, subject, date and breadcrumb for the central WebPage node. */
function pageGraph(locale: Locale, r: Route, m: { title: string; description: string; image: PhotoKey }) {
  const path = routeHref(locale, r), url = absolute(path);
  const twinPath = routeHref(locale === "en" ? "es" : "en", r);
  const base = { name: m.title, description: m.description, path, twinPath, locale, image: photoAbs(m.image, 1600) };
  switch (r.kind) {
    case "service": return webPage({ ...base, kind: "ItemPage", mainEntity: `${url}#service`, breadcrumb: true, modified: CONTENT_UPDATED });
    case "guide": { const g = GUIDES.find((x) => x.id === r.id)!; return webPage({ ...base, kind: "WebPage", mainEntity: `${url}#article`, breadcrumb: true, modified: g.updated, extra: { datePublished: g.published } }); }
    case "area": { const a = AREA_PAGES.find((x) => x.id === r.id)!; return webPage({ ...base, kind: "WebPage", breadcrumb: true, modified: CONTENT_UPDATED, about: [{ "@id": BUSINESS_ID }, { "@type": "Place", name: a.map }], extra: { spatialCoverage: { "@type": "Place", name: a.map } } }); }
    /* The facts page is the business's own canonical description: its main
       entity is the LocalBusiness node, and lastReviewed says when every
       fact on it was last checked. */
    case "page":
      if (r.key === "facts") return webPage({ ...base, kind: "AboutPage", mainEntity: BUSINESS_ID, breadcrumb: true, modified: FACTS_VERIFIED, extra: { lastReviewed: FACTS_VERIFIED } });
      return webPage({ ...base, kind: KIND[r.key] ?? "WebPage", breadcrumb: ["estimator", "guides", "areas", "help"].includes(r.key), modified: CONTENT_UPDATED, ...(r.key === "help" ? { mainEntity: `${url}#faq` } : {}) });
  }
}

function metaFor(locale: Locale, r: Route): { title: string; description: string; image: PhotoKey } {
  switch (r.kind) {
    case "page": return { ...(r.key === "help" ? { title: HELP[locale].title, description: HELP[locale].description } : r.key === "facts" ? { title: FACTS[locale].title, description: FACTS[locale].description } : CONTENT[locale].meta[r.key]), image: OG[r.key] };
    case "service": { const s = serviceById(r.id); return { title: s.t[locale].title, description: s.t[locale].description, image: s.photo }; }
    case "area": { const a = AREA_PAGES.find((x) => x.id === r.id)!; return { title: a.t[locale].title, description: a.t[locale].description, image: a.photo }; }
    case "guide": { const g = GUIDES.find((x) => x.id === r.id)!; return { title: g.t[locale].title, description: g.t[locale].description, image: g.photo }; }
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const r = resolve(locale, slug);
  if (!r) return {};
  const m = metaFor(locale, r);
  const canonical = absolute(routeHref(locale, r));
  const noindex = r.kind === "page" && (r.key === "thanks" || r.key === "review");
  return {
    title: m.title, description: m.description,
    alternates: { canonical, languages: hreflang(r) },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    openGraph: { type: r.kind === "guide" ? "article" : "website", siteName: "Z Construction & Remodeling LLC", title: m.title, description: m.description, url: canonical, locale: locale === "en" ? "en_US" : "es_US", alternateLocale: locale === "en" ? "es_US" : "en_US", images: [{ url: ogCard(locale, m.title, m.image), width: 1200, height: 630, alt: m.title }] },
    twitter: { card: "summary_large_image" },
    other: { "geo.region": "US-AL", "geo.placename": "Auburn", "geo.position": "32.6099;-85.4808", ICBM: "32.6099, -85.4808" },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const r = resolve(locale, slug);
  if (!r) notFound();
  const l = locale as Locale;
  const noindex = r.kind === "page" && (r.key === "thanks" || r.key === "review");
  return <>{noindex ? null : <JsonLd data={pageGraph(l, r, metaFor(l, r))} />}{body(l, r)}</>;
}

function body(l: Locale, r: Route) {
  if (r.kind === "service") return <ServiceDetailPage locale={l} id={r.id} />;
  if (r.kind === "area") return <AreaPage locale={l} id={r.id} />;
  if (r.kind === "guide") return <GuidePage locale={l} id={r.id} />;
  switch (r.key) {
    case "home": return <HomePage locale={l} />;
    case "services": return <ServicesPage locale={l} />;
    case "about": return <AboutPage locale={l} />;
    case "work": return <WorkPage locale={l} />;
    case "reviews": return <ReviewsPage locale={l} />;
    case "contact": return <ContactPage locale={l} />;
    case "thanks": return <ThanksPage locale={l} />;
    case "review": return <ReviewRequestPage locale={l} />;
    case "estimator": return <EstimatorPage locale={l} />;
    case "guides": return <GuidesIndexPage locale={l} />;
    case "areas": return <AreasIndexPage locale={l} />;
    case "privacy": return <PrivacyPage locale={l} />;
    case "help": return <HelpPage locale={l} />;
    case "facts": return <FactsPage locale={l} />;
  }
}
