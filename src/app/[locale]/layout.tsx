import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Space_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import Grain from "@/components/Grain";
import ScrollProgress from "@/components/ScrollProgress";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LangSuggest from "@/components/LangSuggest";
import Tracking from "@/components/Tracking";
import { SERVICE_PAGES } from "@/lib/content-services";
import { AREA_PAGES } from "@/lib/content-areas";
import { absolute, href } from "@/lib/i18n";
import { serviceHref, areaHref } from "@/lib/routes";
import { BRAND, CONTENT, photo } from "@/lib/content";
import { isLocale, LOCALES, SITE_URL, type Locale } from "@/lib/i18n";
import { ownerNode, OWNER_ID } from "@/lib/schema";
import { altMap } from "@/lib/alt-map";

/* Barlow Condensed for the display voice: upright, industrial, squared off —
   the type equivalent of a plumb wall. Barlow for body, Space Mono for the
   drafting-table metadata layer (eyebrows, specs, labels). */
/* Four preloaded files, not six: the hero needs Condensed 800 (tagline),
   Condensed 700 (buttons) and Barlow 400/600 (copy, nav). Barlow 500 was
   never used, and the mono face only sets small labels, so it loads off the
   critical path (preload: false) rather than gating the first paint. */
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["700", "800"], display: "swap", variable: "--font-bc" });
const body = Barlow({ subsets: ["latin"], weight: ["400", "600"], display: "swap", variable: "--font-barlow" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400"], display: "swap", preload: false, variable: "--font-mono-sp" });

/* Search Console / Bing Webmaster ownership: paste the token from each tool's
   "HTML tag" method into Vercel env vars. Nothing renders until set. */
const verify = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
};
export const metadata: Metadata = { metadataBase: new URL(SITE_URL), ...(Object.keys(verify).length ? { verification: verify } : {}), formatDetection: { telephone: true, address: false, email: false } };
export const viewport: Viewport = { themeColor: "#16233a" };

export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }

function jsonLd(locale: Locale) {
  const c = CONTENT[locale];
  return {
    "@context": "https://schema.org",
    "@type": ["GeneralContractor", "HomeAndConstructionBusiness", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: BRAND.name, alternateName: BRAND.short, url: `${SITE_URL}/`, inLanguage: locale,
    logo: `${SITE_URL}/brand/logo.png`, telephone: BRAND.tel, email: BRAND.email, image: photo("hero", 1600), description: c.meta.home.description, priceRange: "$$",
    address: { "@type": "PostalAddress", addressLocality: BRAND.city, addressRegion: BRAND.region, postalCode: BRAND.zip, addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: BRAND.geo.lat, longitude: BRAND.geo.lng },
    /* Every town named in the copy, each tied to its Wikipedia entity, plus
       the "about 30 minutes of downtown Auburn" rule as a circle (~40 km). */
    areaServed: [
      ...["Auburn", "Opelika", "Smiths Station", "Loachapoka", "Waverly", "Beauregard", "Notasulga", "Salem", "Cusseta"].map((name) => ({ "@type": "City", name: `${name}, AL`, sameAs: `https://en.wikipedia.org/wiki/${name.replace(/ /g, "_")},_Alabama` })),
      { "@type": "AdministrativeArea", name: "Lee County, Alabama", sameAs: "https://en.wikipedia.org/wiki/Lee_County,_Alabama" },
      { "@type": "GeoCircle", geoMidpoint: { "@type": "GeoCoordinates", latitude: BRAND.geo.lat, longitude: BRAND.geo.lng }, geoRadius: 40000 },
    ],
    /* The company's own canonical description of itself, in this language. */
    mainEntityOfPage: { "@id": `${absolute(href(locale, "facts"))}#webpage` },
    knowsAbout: ["House painting", "Interior painting", "Exterior painting", "Cabinet painting and refinishing", "Kitchen remodeling", "Bathroom remodeling", "Tub-to-shower conversion", "Home additions", "LVP flooring installation", "Wood rot repair", "Rental property turnover", "Residential building permits in Auburn and Opelika, Alabama"],
    foundingDate: String(BRAND.founded),
    ...(ownerNode(locale) ? { founder: ownerNode(locale), employee: { "@id": OWNER_ID } } : {}),
    availableLanguage: ["en", "es"],
    knowsLanguage: ["en", "es"],
    contactPoint: [{ "@type": "ContactPoint", telephone: BRAND.tel, contactType: "customer service", availableLanguage: ["English", "Spanish"], areaServed: "US-AL" }],
    ...(BRAND.profiles.length ? { sameAs: BRAND.profiles } : {}),
    subjectOf: AREA_PAGES.map((a) => ({ "@type": "WebPage", name: a.t[locale].title, url: absolute(areaHref(locale, a.id)) })),
    potentialAction: { "@type": "QuoteAction", target: absolute(href(locale, "contact")) },
    openingHoursSpecification: BRAND.hours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.days, opens: h.opens, closes: h.closes })),
        hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${BRAND.name} ${BRAND.city} ${BRAND.region}`)}`,
    slogan: c.home.h1 + " " + c.home.h1Accent,
    hasOfferCatalog: { "@type": "OfferCatalog", name: "Construction, Remodeling & Painting Services", itemListElement: SERVICE_PAGES.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.t[locale].name, url: absolute(serviceHref(locale, s.id)) } })) },
    /* No AggregateRating here on purpose: Google ignores self-served review
       stars for local businesses, and marking up the sample reviews would
       violate its review-snippet policy. Let Google/Yelp show real ratings. */
    ...(/^#?0+$/.test(BRAND.license.replace(/\D/g, "")) ? {} : {
      hasCredential: { "@type": "EducationalOccupationalCredential", credentialCategory: "license", name: `Alabama Home Builders Licensure Board license ${BRAND.license}`, recognizedBy: { "@type": "GovernmentOrganization", name: "Alabama Home Builders Licensure Board", url: "https://hblb.alabama.gov/" } },
    }),
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = CONTENT[locale];
  const alt = altMap(locale);
  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="pb-[72px] lg:pb-0">
        <a className="skip-link" href="#main">{c.ui.skip}</a>
        <Grain />
        <ScrollProgress />
        <Nav locale={locale} t={{ nav: c.nav, ui: c.ui }} alt={alt} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
        <LangSuggest locale={locale} t={c.langSuggest} altMap={alt} />
        <Tracking />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd(locale), {
          "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: BRAND.name, inLanguage: ["en", "es"], publisher: { "@id": `${SITE_URL}/#business` },
        }]).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
