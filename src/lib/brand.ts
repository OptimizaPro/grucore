import { SITE_URL } from "./i18n";

/* Brand facts and photo IDs, split out of content.ts so client components
   (nav, forms, tracking, slideshow) can import them without pulling the
   whole bilingual copy deck into the browser bundle. content.ts re-exports
   everything here, so server code can keep importing from "@/lib/content". */

export const BRAND = {
  name: "Z Construction & Remodeling LLC",
  short: "Z Construction",
  phone: "(334) 319-2126",
  tel: "+13343192126",
  email: "zefreino@zconstructionauburn.com",
  city: "Auburn",
  region: "AL",
  zip: "36830",
  geo: { lat: 32.6099, lng: -85.4808 },
  founded: 2025,
  rating: "5.0", // real: 5.0 across the reviews on Angi and HomeAdvisor
  license: "#00000", // TODO Alabama HBLB license number. Hidden from the page and schema while it is a placeholder.
  googleReviewUrl: "https://g.page/r/REPLACE_WITH_GOOGLE_REVIEW_LINK/review", // TODO
  angiUrl: "https://www.angi.com/companylist/us/al/opelika/z-construction-remodeling-llc-reviews-1.htm",
  hblbSearchUrl: "https://alhobv7prod.glsuite.us/GLSuiteWeb/Clients/ALHOB/Public/LicenseeSearch.aspx",
  homeAdvisorUrl: "https://www.homeadvisor.com/", // TODO direct link to the HomeAdvisor profile
  /* WhatsApp Business number, digits only with country code. Spanish-speaking
     families overwhelmingly prefer WhatsApp to a phone call or a form. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "13343192126", // same number as the phone
  /* Profiles that corroborate the business for Google and AI assistants
     (schema sameAs). Add each URL as soon as the profile exists. */
  profiles: ["https://www.angi.com/companylist/us/al/opelika/z-construction-remodeling-llc-reviews-1.htm"] as string[], // add as they exist: Google Business Profile, Facebook, Instagram, Nextdoor, Yelp, BBB, Houzz, HomeAdvisor, Bing Places
  /* The owner as a named, accountable person: Google's quality raters and AI
     assistants weigh who stands behind advice. Leave name empty until the
     owner confirms how he wants to appear (and ideally adds a headshot at
     public/brand/owner.jpg); nothing about him renders until then.
     TODO(owner): full name as he wants it shown (first name is spelled "Zefreino"), and optional profile URLs. */
  owner: { name: "", jobTitle: { en: "Owner", es: "Dueño" }, image: "", sameAs: [] as string[] },
  hours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "18:00" },
    { days: ["Saturday"], opens: "08:00", closes: "14:00" },
  ],
};

/* Unsplash IDs. Swap for the owner's own job photos in public/work/ when available. */
export const PHOTOS = {
  hero: "photo-1789352050947-c87040ebe0cb", kitchen1: "photo-1682888813913-e13f18692019", kitchen2: "photo-1628745277862-bc0b2d68c50c",
  kitchen3: "photo-1592506119503-c0b18879bd5a", bath1: "photo-1584622650111-993a426fbf0a", bath2: "photo-1638799869566-b17fa794c4de",
  bath3: "photo-1620626011761-996317b8d101", framing1: "photo-1587582423116-ec07293f0395", framing2: "photo-1676802037786-3697d60497ae",
  roomRaw: "photo-1656733911001-16912b79d2bf", worker1: "photo-1589939705384-5185137a7f0f", worker2: "photo-1646324554833-f0b6a479fa5d",
  worker3: "photo-1631396326838-de37e5f8bcbc", worker4: "photo-1505798577917-a65157d3320a", paint1: "photo-1786295866839-d17f879c65cd",
  houseWhite: "photo-1688573156630-950f631f1c38", houseWeathered: "photo-1777728868180-dbfc61eef59f", porch1: "photo-1625602812206-5ec545ca1231",
  porch2: "photo-1761061079517-2ff8192b2f02", porch3: "photo-1669345800916-6f453e20a6cd", deck1: "photo-1613544723371-23b514a78c85",
  deck2: "photo-1722881445918-75ae564ffced", deck3: "photo-1773979638724-c6ffed7fe0de", floor1: "photo-1613621792067-8e28d16b735c",
  floor2: "photo-1731185752376-a4cf3e8556fa",
} as const;
/* The owner's own job photos, in public/work (resized, metadata stripped).
   `pos` is the CSS object-position used when a portrait photo is cropped to
   a landscape frame, so the crop keeps the interesting part. */
export const LOCAL_PHOTOS = {
  bathTubBeforeWide: { src: "/work/bath-tub-before-wide.jpg", pos: "50% 50%", alt: { en: "Bathroom tub with a gold-framed sliding glass door before the remodel", es: "Tina del baño con puerta corrediza de cristal con marco dorado, antes de la remodelación" } },
  bathTubBeforeClose: { src: "/work/bath-tub-before-close.jpg", pos: "50% 45%", alt: { en: "Close view of the old tub with its gold-framed sliding door and rippled glass", es: "Vista cercana de la tina vieja con su puerta corrediza de marco dorado y cristal texturizado" } },
  bathVanityBefore: { src: "/work/bath-vanity-before.jpg", pos: "50% 60%", alt: { en: "Bathroom vanity with white cabinets, a plain oval sink and a large mirror before the remodel", es: "Tocador con gabinetes blancos, lavabo ovalado sencillo y espejo grande, antes de la remodelación" } },
  bathTubAfterWide: { src: "/work/bath-tub-after-wide.jpg", pos: "50% 45%", alt: { en: "Remodeled tub-shower with white tile to the ceiling, two tiled niches and brass fixtures", es: "Tina y regadera remodeladas con azulejo blanco hasta el techo, dos nichos de azulejo y accesorios de latón" } },
  bathTubAfterClose: { src: "/work/bath-tub-after-close.jpg", pos: "50% 50%", alt: { en: "Close view of the new tub with a white tile surround and built-in niches", es: "Vista cercana de la tina nueva con azulejo blanco alrededor y nichos integrados" } },
  bathTileDetail: { src: "/work/bath-tile-detail.jpg", pos: "50% 40%", alt: { en: "Glossy white tile running up to the ceiling with a recessed light", es: "Azulejo blanco brillante que sube hasta el techo, con una luz empotrada" } },
  bathVanityAfter: { src: "/work/bath-vanity-after.jpg", pos: "50% 55%", alt: { en: "Remodeled bathroom with a navy vanity, gold mirror and light fixture, and white tile along the lower wall", es: "Baño remodelado con tocador azul marino, espejo y lámpara dorados, y azulejo blanco en la parte baja de la pared" } },
  vanityNavy: { src: "/work/vanity-navy.jpg", pos: "50% 55%", alt: { en: "Bathroom vanity with navy cabinets, brushed-metal pulls and a speckled white top", es: "Tocador de baño con gabinetes azul marino, jaladeras metálicas y cubierta blanca con motas" } },
  vanityTop: { src: "/work/vanity-top.jpg", pos: "50% 45%", alt: { en: "Speckled white vanity top with an oval sink and a raised backsplash", es: "Cubierta blanca con motas, lavabo ovalado y salpicadero elevado" } },
  dockLake: { src: "/work/dock-lake.jpg", pos: "50% 55%", alt: { en: "Wooden T-shaped dock with a walkway and platform on a lake", es: "Muelle de madera en forma de T, con pasarela y plataforma, junto a un lago" } },
  fenceStaged: { src: "/work/fence-staged.jpg", pos: "50% 55%", alt: { en: "Chain-link fence rolls, gate frames and posts staged in a yard before installation", es: "Rollos de malla ciclónica, marcos de puerta y postes listos en un patio antes de instalar" } },
  fenceInstalled: { src: "/work/fence-installed.jpg", pos: "50% 55%", alt: { en: "Galvanized chain-link fence with a top rail and line posts along a yard", es: "Cerca de malla ciclónica galvanizada con barra superior y postes a lo largo de un patio" } },
  deckRebuildFraming: { src: "/work/deck-rebuild-framing.jpg", pos: "50% 55%", alt: { en: "Deck being rebuilt with the old boards removed and the joists exposed, a worker along the frame", es: "Terraza en reconstrucción, con las tablas viejas quitadas y las vigas a la vista, y un trabajador sobre la estructura" } },
} as const;
export type PhotoKey = keyof typeof PHOTOS | keyof typeof LOCAL_PHOTOS;

const isLocal = (k: PhotoKey): k is keyof typeof LOCAL_PHOTOS => k in LOCAL_PHOTOS;
/** Image address for next/image: a /work path for the owner's photos, an Unsplash URL for placeholders. */
export const photo = (k: PhotoKey, w = 1600) => isLocal(k) ? LOCAL_PHOTOS[k].src : `https://images.unsplash.com/${PHOTOS[k as keyof typeof PHOTOS]}?auto=format&fit=crop&w=${w}&q=75`;
/** Accurate description of one of the owner's photos, in the page language (undefined for placeholders). */
export const photoAlt = (k: PhotoKey, locale: "en" | "es") => (isLocal(k) ? LOCAL_PHOTOS[k].alt[locale] : undefined);
/** True for the owner's own photos (as opposed to stock placeholders). */
export const isOwnPhoto = isLocal;
/** CSS object-position for a photo cropped into a landscape frame. */
export const photoPos = (k: PhotoKey) => (isLocal(k) ? LOCAL_PHOTOS[k].pos : undefined);
/** Full https address for schema, sitemaps and share cards. */
export const photoAbs = (k: PhotoKey, w = 1600) => { const u = photo(k, w); return u.startsWith("/") ? `${SITE_URL}${u}` : u; };
