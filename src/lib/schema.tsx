/* JSON-LD builders. Every page links back to the one LocalBusiness node
   (@id = /#business, emitted by the layout), so Google and AI assistants see
   a single entity with services, areas, guides and FAQs hanging off it. */
import { absolute, SITE_URL, type Locale } from "./i18n";
import { BRAND } from "./content";

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const OWNER_ID = `${SITE_URL}/#owner`;

/** The owner's Person node, or null until BRAND.owner.name is filled in. */
export const ownerNode = (locale: Locale) => BRAND.owner.name ? {
  "@type": "Person", "@id": OWNER_ID, name: BRAND.owner.name, jobTitle: BRAND.owner.jobTitle[locale],
  worksFor: { "@id": BUSINESS_ID }, knowsLanguage: ["en", "es"],
  knowsAbout: ["House painting", "Cabinet painting", "Kitchen remodeling", "Bathroom remodeling", "Flooring installation", "Rental property turnover", "Alabama residential building permits"],
  ...(BRAND.owner.image ? { image: absolute(BRAND.owner.image) } : {}),
  ...(BRAND.owner.sameAs.length ? { sameAs: BRAND.owner.sameAs } : {}),
} : null;

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList", "@id": `${absolute(items[items.length - 1].path)}#breadcrumb`,
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
});

export const faqPage = (faq: { q: string; a: string }[]) => ({
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

/* Towns resolve to their Wikipedia entity so Google ties "Opelika" to the
   right place, not a namesake elsewhere. */
const WIKI: Record<string, string> = {
  Auburn: "https://en.wikipedia.org/wiki/Auburn,_Alabama", Opelika: "https://en.wikipedia.org/wiki/Opelika,_Alabama",
  "Smiths Station": "https://en.wikipedia.org/wiki/Smiths_Station,_Alabama", "Lee County": "https://en.wikipedia.org/wiki/Lee_County,_Alabama",
  "Condado de Lee": "https://en.wikipedia.org/wiki/Lee_County,_Alabama",
};

export const serviceNode = (o: {
  name: string; description: string; path: string; locale: Locale; areas: string[]; image: string; lo?: number; hi?: number;
  tiers?: { name: string; description: string; lo: number; hi: number }[]; guides?: { name: string; path: string }[];
}) => ({
  "@context": "https://schema.org", "@type": "Service",
  "@id": `${absolute(o.path)}#service`, name: o.name, serviceType: o.name, description: o.description, url: absolute(o.path), inLanguage: o.locale, image: o.image,
  provider: { "@id": BUSINESS_ID }, availableLanguage: ["en", "es"],
  mainEntityOfPage: { "@id": `${absolute(o.path)}#webpage` },
  areaServed: o.areas.map((name) => ({ "@type": /County|Condado/.test(name) ? "AdministrativeArea" : "City", name: `${name}, AL`, ...(WIKI[name] ? { sameAs: WIKI[name] } : {}) })),
  ...(o.tiers?.length
    ? { hasOfferCatalog: { "@type": "OfferCatalog", name: o.name, itemListElement: o.tiers.map((t) => ({
        "@type": "Offer", name: t.name, description: t.description, priceCurrency: "USD", offeredBy: { "@id": BUSINESS_ID },
        priceSpecification: { "@type": "PriceSpecification", minPrice: t.lo, maxPrice: t.hi, priceCurrency: "USD" },
      })) } }
    : o.lo ? { offers: { "@type": "Offer", priceCurrency: "USD", priceSpecification: { "@type": "PriceSpecification", minPrice: o.lo, ...(o.hi ? { maxPrice: o.hi } : {}), priceCurrency: "USD" } } } : {}),
  ...(o.guides?.length ? { subjectOf: o.guides.map((g) => ({ "@type": "WebPage", "@id": `${absolute(g.path)}#webpage`, name: g.name, url: absolute(g.path) })) } : {}),
});

export const article = (o: { headline: string; description: string; path: string; locale: Locale; image: string; published: string; updated: string; words?: number; section?: string; about?: string; citations?: { name: string; url: string }[]; mentions?: string[]; aboutName?: string; aboutUrl?: string }) => ({
  "@context": "https://schema.org", "@type": "Article", "@id": `${absolute(o.path)}#article`,
  headline: o.headline, description: o.description, inLanguage: o.locale, image: o.image, datePublished: o.published, dateModified: o.updated,
  mainEntityOfPage: { "@id": `${absolute(o.path)}#webpage` }, isPartOf: { "@id": `${SITE_URL}/#website` },
  author: { "@id": BRAND.owner.name ? OWNER_ID : BUSINESS_ID }, publisher: { "@id": BUSINESS_ID }, copyrightHolder: { "@id": BUSINESS_ID },
  ...(o.words ? { wordCount: o.words } : {}), ...(o.section ? { articleSection: o.section } : {}),
  ...(o.about ? { about: { "@type": "Service", "@id": o.about, ...(o.aboutName ? { name: o.aboutName } : {}), ...(o.aboutUrl ? { url: o.aboutUrl } : {}), provider: { "@id": BUSINESS_ID } } } : {}),
  ...(o.mentions?.length ? { mentions: o.mentions.map((name) => ({ "@type": "Place", name })) } : {}),
  ...(o.citations?.length ? { citation: o.citations.map((c) => ({ "@type": "CreativeWork", name: c.name, url: c.url })) } : {}),
});

export type PageKind = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "ItemPage" | "FAQPage";

/** The one WebPage node every URL gets (emitted centrally by the route).
    It ties the page to the site, the business, its breadcrumb trail, its
    main entity (a Service, an Article, a Place) and its other-language twin. */
export const webPage = (o: {
  kind: PageKind; name: string; description: string; path: string; twinPath: string; locale: Locale; image?: string;
  mainEntity?: string; about?: object; modified?: string; breadcrumb?: boolean; extra?: object;
}) => {
  const url = absolute(o.path), twin = `${absolute(o.twinPath)}#webpage`;
  return {
    "@context": "https://schema.org", "@type": o.kind,
    "@id": `${url}#webpage`, url, name: o.name, description: o.description, inLanguage: o.locale,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: o.about ?? { "@id": BUSINESS_ID },
    ...(o.mainEntity ? { mainEntity: { "@id": o.mainEntity } } : {}),
    ...(o.breadcrumb ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...(o.image ? { primaryImageOfPage: { "@type": "ImageObject", contentUrl: o.image, url: o.image } } : {}),
    ...(o.modified ? { dateModified: o.modified } : {}),
    /* English is the source; Spanish pages are written natively but are its twin. */
    ...(o.locale === "en" ? { workTranslation: { "@id": twin } } : { translationOfWork: { "@id": twin } }),
    potentialAction: { "@type": "ReadAction", target: url },
    ...(o.extra ?? {}),
  };
};

/** ItemList of the service landing pages, for the services index. */
export const serviceList = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org", "@type": "ItemList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: absolute(it.path) })),
});

/** ImageGallery for the before/after page. */
export const imageGallery = (o: { name: string; path: string; locale: Locale; images: { url: string; caption: string }[] }) => ({
  "@context": "https://schema.org", "@type": "ImageGallery", isPartOf: { "@id": `${absolute(o.path)}#webpage` },
  "@id": `${absolute(o.path)}#gallery`, name: o.name, url: absolute(o.path), inLanguage: o.locale, about: { "@id": BUSINESS_ID },
  associatedMedia: o.images.map((im) => ({ "@type": "ImageObject", contentUrl: im.url, caption: im.caption })),
});

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
