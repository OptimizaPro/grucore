/* ---------------------------------------------------------------------------
   Every word, number and link on the site lives here, once per language.
   Editing the site's words almost never means touching a component.

   The Spanish is written as its own copy, not run through the English. It
   speaks to the Hispanic families and landlords of Auburn, Opelika and Lee
   County in the "usted" register they'd expect from a contractor they are
   about to trust with their house: direct, warm, no marketing gloss.

   Rule for this file: only claims the business can back up. No invented
   project counts, no sample reviews shown as real, no backstory the owner
   hasn't confirmed. Real reviews go in `reviews.items` (verbatim, with
   permission) and the site switches from the rating block to review cards.

   CONFIRM BEFORE LAUNCH (search "TODO"): phone, WhatsApp, email, license
   number, Angi / HomeAdvisor / Google links, price ranges, the one-day reply
   promise, real photos.
   ------------------------------------------------------------------------- */
import type { Locale, PageKey } from "./i18n";

import { BRAND, PHOTOS, LOCAL_PHOTOS, photo, photoAbs, photoPos, photoAlt, isOwnPhoto, type PhotoKey } from "./brand";
export { BRAND, PHOTOS, LOCAL_PHOTOS, photo, photoAbs, photoPos, photoAlt, isOwnPhoto, type PhotoKey };

export type ServiceId = "remodeling" | "additions" | "kitchensBaths" | "painting" | "finishing" | "repairs";
export type ServiceGroup = "build" | "finish";
export type GalleryCat = "kitchen" | "bath" | "addition" | "exterior" | "deck" | "flooring";

export interface Service {
  id: ServiceId; group: ServiceGroup; name: string; sub: string; blurb: string; para: string; items: string[]; timeline: string; range: string; photo: PhotoKey; alt: string;
}
export interface Review { quote: string; name: string; meta: string }
/** A homepage proof tile. `value` animates as a counter; `display` is shown as-is. */
export interface Proof { value?: number; decimals?: number; display?: string; label: string; note: string }
export interface GalleryCell {
  kind: "photo" | "wide" | "tall" | "compare"; cat: GalleryCat; title: string; meta: string;
  photo?: PhotoKey; before?: PhotoKey; after?: PhotoKey; alt?: string; altBefore?: string; altAfter?: string;
  /** Portrait source photos: the before/after slider uses a tall frame instead of 4:3. */
  portrait?: boolean;
}

export interface SiteContent {
  nav: Record<"home" | "services" | "about" | "work" | "reviews" | "contact", string>;
  ui: {
    freeQuote: string; quoteShort: string; call: string; menu: string; primaryNav: string; quickActions: string;
    langSwitch: string; langSwitchLong: string; whatsappCta: string; langTitle: string; scroll: string; before: string; after: string; dragToCompare: string;
    readMore: string; skip: string; rating: string; ratingSources: string; starsLabel: string; whatsapp: string; home: string;
  };
  footer: { blurb: string; badge: string; services: string; company: string; contact: string; hours: string[]; rights: string; otherSite: string; areas: string; resources: string; estimator: string; guides: string; privacy: string; allAreas: string; help: string };
  cta: { h: string; p: string; btn: string; word: string };
  promise: { h: string; items: string[] };
  reviewRequest: { eyebrow: string; h1: string; lede: string; google: string; angi: string; ha: string; note: string; thanks: string };
  meta: Record<Exclude<PageKey, "help" | "facts">, { title: string; description: string }>; // help: content-help.ts · facts: content-facts.ts
  home: {
    eyebrow: string; h1: string; h1Accent: string; lede: string; primary: string; secondary: string; meta: string[]; marquee: string[];
    proof: Proof[];
    split: { eyebrow: string; h: string; lede: string; build: string; buildSub: string; finish: string; finishSub: string; link: string };
    rental: { eyebrow: string; h: string; p: string; points: string[]; btn: string };
    processEyebrow: string; processH: string; processLede: string; steps: { h: string; p: string }[]; newbie: string;
    workEyebrow: string; workH: string; workP: string; workBtn: string;
    reviewsEyebrow: string; reviewsH: string;
    areaEyebrow: string; areaH: string; areaP: string; areaLink: string;
    pricing: { eyebrow: string; h: string; p: string; btn: string; note: string; from: string };
  };
  services: Service[];
  servicesPage: { eyebrow: string; h1: string; lede: string; timelineLbl: string; rangeLbl: string; quoteBtn: string; faqEyebrow: string; faqH: string; faqLede: string; faq: { q: string; a: string }[]; ctaH: string; ctaP: string };
  about: {
    eyebrow: string; h1: string; lede: string; storyEyebrow: string; storyH: string; storyP: string[]; storyBadge: string;
    valuesEyebrow: string; valuesH: string; values: { h: string; p: string }[];
    licEyebrow: string; licH: string; licP: string; licChecks: string[]; licVerify: string;
    areaEyebrow: string; areaH: string; areaP: string; stats: { n: string; l: string }[]; ctaH: string; ctaP: string;
  };
  work: { eyebrow: string; h1: string; lede: string; filterLbl: string; filters: { v: string; l: string }[]; cells: GalleryCell[]; notice: string; ctaH: string; ctaP: string };
  reviews: { eyebrow: string; h1: string; lede: string; intro: string; items: Review[]; proofH: string; proofP: string; readAngi: string; readHA: string; askEyebrow: string; askH: string; askP: string; google: string; refEyebrow: string; refH: string; refP: string; refLink: string };
  contact: {
    eyebrow: string; h1: string; lede: string; formEyebrow: string; formH: string; formP: string;
    f: { name: string; phone: string; email: string; city: string; cityPh: string; service: string; timeline: string; budget: string; contactPref: string; smsConsent: string; select: string; message: string; messagePh: string; send: string; sending: string; note: string; ok: string; err: string; honeypot: string; privacy: string; next: string; back: string; stepOf: string; steps: [string, string, string] };
    serviceOptions: { v: string; l: string }[]; timelineOptions: { v: string; l: string }[]; budgetOptions: { v: string; l: string }[]; contactOptions: { v: string; l: string }[];
    waH: string; waP: string;
    callH: string; callP: string; emailH: string; emailP: string; hoursH: string; hoursRows: [string, string][]; basedH: string; basedP: string;
    areaEyebrow: string; areaH: string; areaP: string; mapTitle: string;
  };
  thanks: { eyebrow: string; h1: string; lede: string; home: string; work: string; nextH: string; next: string[]; wa: string };
  estimator: { eyebrow: string; h1: string; lede: string; step1: string; step2: string; step3: string; finish: Record<"standard" | "mid" | "premium", { l: string; d: string }>; result: string; resultNote: string; cta: string; ctaNote: string; disclaimer: string; guidesH: string };
  guidesIndex: { eyebrow: string; h1: string; lede: string; read: string; updated: string; answer: string; toc: string; related: string; ctaH: string; ctaP: string; sources: string; next: string; minRead: string; by: string; guidesFor: string };
  areasIndex: { eyebrow: string; h1: string; lede: string; also: string; alsoP: string; popular: string; places: string; local: string; drive: string; view: string; viewService: string };
  privacy: { eyebrow: string; h1: string; updated: string; sections: { h: string; p: string[] }[] };
  areas: string[];
  langSuggest: { msg: string; go: string; dismiss: string };
  /** Project call-to-action on content pages. {service} and {range} are filled in per page. */
  funnel: { eyebrow: string; h: string; p: string; range: string; full: string; quickH: string; quickP: string; name: string; phone: string; send: string; sending: string; ok: string; consent: string; wa: string; call: string; midH: string };
}

const AREAS_EN = ["Auburn", "Opelika", "Smiths Station", "Loachapoka", "Waverly", "Beauregard", "Notasulga", "Salem", "Cusseta", "Lee County"];
const AREAS_ES = ["Auburn", "Opelika", "Smiths Station", "Loachapoka", "Waverly", "Beauregard", "Notasulga", "Salem", "Cusseta", "Condado de Lee"];

const en: SiteContent = {
  nav: { home: "Home", services: "Services", about: "About", work: "Our Work", reviews: "Reviews", contact: "Contact" },
  ui: {
    freeQuote: "Get a Free Quote", quoteShort: "Free Quote", call: "Call", menu: "Menu", primaryNav: "Primary", quickActions: "Quick actions",
    langSwitch: "Español", langSwitchLong: "Español", whatsappCta: "Message us on WhatsApp", langTitle: "Leer en español", scroll: "Scroll", before: "Before", after: "After",
    dragToCompare: "Drag to compare before and after", readMore: "Read more reviews", skip: "Skip to content", rating: "5.0", ratingSources: "Angi · HomeAdvisor", starsLabel: "5 out of 5 stars",
    whatsapp: "WhatsApp", home: "Home",
  },
  footer: {
    blurb: "Z Construction & Remodeling LLC is a family-owned painting and remodeling contractor based in Auburn, Alabama, working in English and Spanish across Auburn, Opelika and Lee County. Kitchens, baths, additions, paint, cabinets, floors and the repairs in between.",
    badge: "Licensed & Insured · Alabama", services: "Services", company: "Company", contact: "Contact",
    hours: ["Mon–Fri 7:00am–6:00pm", "Sat 8:00am–2:00pm"], rights: "All rights reserved.", otherSite: "Sitio en español",
    areas: "Service areas", resources: "Plan your project", estimator: "Cost estimator", guides: "Remodeling guides", privacy: "Privacy policy", allAreas: "All service areas", help: "Questions, answered",
  },
  reviewRequest: { eyebrow: "Thank you", h1: "How did we do?", lede: "Two minutes from you is how the next family on your street finds a contractor they can trust. Pick whichever site you already use.", google: "Review us on Google", angi: "Review us on Angi", ha: "Review us on HomeAdvisor", note: "If anything wasn't right, call or text the owner first and we'll make it right.", thanks: "Thank you for trusting us with your home." },
  promise: { h: "Our promise, in writing", items: ["A written scope and price before any work starts", "No surprise invoices: changes are agreed in writing first", "Licensed for residential work in Alabama and insured", "Clean site every day, and a walkthrough before we call it done", "A reply within one business day, in English or Spanish"] },
  cta: { h: "Ready to start your project?", p: "Tell us what you have in mind. We come out, take a look, and send a clear, written estimate. No pressure, no surprises.", btn: "Get a Free Quote", word: "Let's Build" },
  meta: {
    home: { title: "Painting & Remodeling in Auburn, AL | Z Construction", description: "Family-owned painters and remodelers in Auburn & Opelika, AL. Kitchens, baths, cabinets, floors and rental turns. Free written estimates. Hablamos español." },
    services: { title: "Remodeling & Painting Services in Auburn & Opelika, AL", description: "Kitchen and bath remodeling, house painting, cabinet refinishing, flooring, additions and repairs in Auburn and Opelika, AL. Licensed, insured, owner-run." },
    about: { title: "About Z Construction | Family-Owned Auburn Contractor", description: "Z Construction & Remodeling is a family-owned, owner-run painting and remodeling company serving Auburn, Opelika and Lee County, AL. Licensed and insured." },
    work: { title: "Before & After Remodeling Photos | Auburn & Opelika, AL", description: "Before-and-after photos of kitchen remodels, bathrooms, house painting, cabinets, floors and decks. See the kind of work we do across Auburn and Opelika, AL." },
    reviews: { title: "Customer Reviews | Z Construction & Remodeling, Auburn", description: "Z Construction & Remodeling is rated 5.0 on Angi and HomeAdvisor. See what Auburn and Opelika homeowners say, or leave a review for your finished project." },
    contact: { title: "Free Remodeling & Painting Estimate | Auburn, AL", description: "Get a free written estimate for painting or remodeling in Auburn, Opelika or Lee County, AL. Call, text, WhatsApp or use the form. Reply in one business day." },
    thanks: { title: "Thanks", description: "We received your request and will follow up within one business day." },
    estimator: { title: "Remodeling Cost Calculator | Auburn & Opelika, AL (2026)", description: "Free 2026 cost calculator for Auburn and Opelika, AL: kitchens, baths, additions, painting, cabinets, flooring and rental turns. A price range in 30 seconds." },
    guides: { title: "Remodeling Cost & Permit Guides | Auburn & Opelika, AL", description: "Straight answers for Lee County homeowners and landlords: 2026 remodeling costs, permits, checking a contractor license, rental turns and cabinet painting." },
    areas: { title: "Service Areas | Remodeling Contractor in Lee County, AL", description: "We paint and remodel homes in Auburn, Opelika, Smiths Station, Beauregard, Salem, Loachapoka, Waverly and Notasulga, Lee County, Alabama. Free estimates." },
    review: { title: "Leave a review | Z Construction & Remodeling", description: "Thank you for choosing Z Construction & Remodeling. Leaving a quick review on Google, Angi or HomeAdvisor helps the next Auburn family find us." },
    privacy: { title: "Privacy Policy | Z Construction & Remodeling LLC", description: "How Z Construction & Remodeling LLC collects, uses and protects what you send through this website, including our text-message terms and your choices." },
  },
  home: {
    eyebrow: "Painting & remodeling contractor in Auburn & Opelika, AL",
    h1: "Built with precision.", h1Accent: "Finished like art.",
    lede: "Family-owned painters and remodelers in Auburn and Opelika. A written price before we start, the owner on every job, and the same crew from the first day to the last coat.",
    primary: "Get my free estimate", secondary: "Price my project",
    proof: [
      { value: 5, decimals: 1, label: "Star rating", note: "Every review so far" },
      { display: "$0", label: "Written estimates", note: "No fee, no obligation" },
      { display: "1 day", label: "Reply time", note: "Calls and forms, every time" }, // TODO confirm the owner can hold to this
      { display: "1", label: "Point of contact", note: "The owner, start to finish" },
    ],
    split: { eyebrow: "What we do", h: "One crew, start to finish.", lede: "The crew that patches the drywall is the crew that paints it. No hand-offs, no finger-pointing, one written price.",
      build: "Construction & Remodeling", buildSub: "Kitchens · baths · additions", finish: "Painting & Finishes", finishSub: "Paint · cabinets · floors", link: "All services & pricing" },
    rental: { eyebrow: "Landlords & property managers", h: "Rental turns, done between leases.",
      p: "Auburn's lease calendar doesn't wait. We repaint, replace worn floors, fix what tenants broke and clear the punch list in days, then send photos so out-of-town owners never have to drive in.",
      points: ["Full repaint: walls, trim and doors", "LVP flooring that stands up to tenants", "Drywall, doors, fixtures and punch lists", "Photo report when the unit is ready"],
      btn: "Plan a rental turn" },
    meta: ["Free written estimates", "Prices on every service page", "Owner on every job", "Hablamos español"],
    marquee: ["Home Additions", "Kitchens & Baths", "Whole-Home Remodels", "Interior Painting", "Exterior Painting", "Cabinet Refinishing", "Flooring", "Repairs & Punch Lists", "Auburn · Opelika · Lee County"],
    processEyebrow: "How it works", newbie: "Never hired a contractor before? Start with the plain-English answers", processH: "No surprises. That's the whole process.", processLede: "Four steps, clearly communicated, so you always know where your project stands.",
    steps: [
      { h: "Walkthrough", p: "We come to the house, listen to what you want, measure, and talk honestly about what's possible and what it costs." },
      { h: "Written estimate", p: "A clear scope, line-item pricing and a realistic timeline in writing. No vague \"we'll see\" numbers." },
      { h: "Build", p: "Permits pulled, trades scheduled, site kept clean. You get updates as the work happens, not after." },
      { h: "Final walkthrough", p: "We walk every inch with you, handle the punch list, and don't call it done until you do." },
    ],
    workEyebrow: "Recent work", workH: "Drag to see the difference",
    workP: "Slide the handle to compare where a project started and where it ended up. More in the gallery.",
    workBtn: "View the gallery",
    reviewsEyebrow: "Reviews", reviewsH: "Five stars, so far.",
    areaEyebrow: "Service area", areaH: "Local. Actually local.",
    areaP: "Auburn, Opelika and the Lee County communities around them, including rentals and game-day homes for owners who live out of town.",
    areaLink: "Check your address",
    pricing: { eyebrow: "Real numbers before you call", h: "Most contractors won't put a price on their website. We do.", p: "These are 2026 planning ranges for Lee County, installed, labor and materials. Your written estimate is line by line, and it doesn't change unless you change the plan.", btn: "See every price", note: "Mid-range finishes. Standard runs about 15% less, premium about 30% more.", from: "Typical range" },
  },
  services: [
    { id: "remodeling", group: "build", name: "Home Remodeling", sub: "Whole-home and single-room remodels", blurb: "Whole-home and single-room remodels that respect the bones of the house.", photo: "bathTubAfterWide", alt: "Remodeled tub-shower with white tile to the ceiling, two tiled niches and brass fixtures",
      para: "Whether it's opening up a wall between the kitchen and living room or updating an entire 1980s house, we plan remodels around how your family actually lives. We keep what's good about the house and fix what isn't.",
      items: ["Whole-home remodels", "Open-concept conversions", "Basement & bonus room finishing", "Trim, doors & built-ins", "Structural repairs", "Permits & inspections", "Rental turnover refreshes", "Design coordination"], timeline: "2–8 weeks", range: "From $10k" },
    { id: "additions", group: "build", name: "Home Additions", sub: "Room additions, sunrooms & garages", blurb: "Bedrooms, bonus rooms, sunrooms and garages that look like they were always there.", photo: "framing2", alt: "New home addition with wood framing and roof trusses",
      para: "An addition should look like it was part of the original plan. We match rooflines, siding, windows and trim so the new space blends in, and we handle the permits, engineering and inspections from start to finish.",
      items: ["Bedroom & bathroom additions", "Bonus rooms & second stories", "Sunrooms & screened porches", "Attached & detached garages", "In-law suites", "Foundations, framing & roofing", "Electrical & plumbing coordination", "Permits & inspections"], timeline: "6–16 weeks", range: "From $40k" },
    { id: "kitchensBaths", group: "build", name: "Kitchens & Baths", sub: "Layouts, cabinetry, tile, counters & plumbing", blurb: "The two rooms that sell a house, built with cabinetry, tile and plumbing done right the first time.", photo: "bathVanityAfter", alt: "Remodeled bathroom with a navy vanity, gold mirror and light fixture, and white tile along the lower wall",
      para: "Kitchens and bathrooms are where a house earns its keep, and where there's zero margin for error. We design for storage, workflow and light, then install cabinetry, countertops, tile, waterproofing and fixtures with the precision they deserve.",
      items: ["Full kitchen remodels", "Layout changes & islands", "Custom & semi-custom cabinetry", "Quartz, granite & butcher block", "Walk-in & curbless showers", "Tub-to-shower conversions", "Custom tile work", "Vanities, mirrors & lighting"], timeline: "2–6 weeks", range: "From $8k" },
    { id: "painting", group: "finish", name: "Interior & Exterior Painting", sub: "Prep-first painting with premium finishes", blurb: "Walls, ceilings, siding and trim, prepped like it matters and finished in premium paint.", photo: "paint1", alt: "Painter masking a window before painting a house exterior",
      para: "A great paint job is ninety percent preparation. We wash, scrape, sand, caulk and prime before a single finish coat goes on, then use premium Sherwin-Williams and Benjamin Moore products chosen for Alabama sun and humidity.",
      items: ["Interior walls, ceilings & trim", "Exterior siding, brick & stucco", "Pressure washing & prep", "Caulking, patching & priming", "Color consultation", "Accent walls & feature finishes", "Rental turnover repaints", "HOA-compliant exterior colors"], timeline: "2–7 days", range: "From $1,800" },
    { id: "finishing", group: "finish", name: "Cabinet & Trim Finishing", sub: "Sprayed cabinetry, doors and millwork", blurb: "Factory-smooth sprayed finishes on cabinets, doors and millwork, at a fraction of replacement cost.", photo: "kitchen2", alt: "Kitchen with freshly refinished white cabinetry",
      para: "Refinishing cabinets is the single highest-return update in a kitchen. We remove doors and drawers, degrease, sand, prime and spray a catalyzed enamel finish that looks and wears like factory paint.",
      items: ["Kitchen cabinet refinishing", "Bathroom vanity refinishing", "Interior doors & trim", "Staircases & railings", "Built-ins & mantels", "Hardware & soft-close upgrades", "Sprayed enamel finishes", "Stain & clear-coat work"], timeline: "3–7 days", range: "From $3,500" },
    { id: "repairs", group: "finish", name: "Flooring & Repairs", sub: "LVP, hardwood, drywall, decks & punch lists", blurb: "New floors, rot repair, drywall, doors and the punch list before you list or rent.", photo: "deckRebuildFraming", alt: "Deck being rebuilt with the old boards removed and the joists exposed",
      para: "Not every job needs a big crew. New LVP or hardwood, rotten trim, a sagging deck, a door that won't latch, drywall damage or a punch list before you list the house. We handle it with the same care as a full remodel.",
      items: ["LVP, hardwood & tile flooring", "Wood rot & siding repair", "Deck & porch repair", "Drywall & texture", "Door & window replacement", "Pre-sale punch lists", "Rental make-ready", "Storm & water damage"], timeline: "1–5 days", range: "From $350" },
  ],
  servicesPage: {
    eyebrow: "Services · Auburn & Opelika, AL", h1: "Residential construction & remodeling services",
    lede: "Kitchens, baths, additions, whole-home remodels and repairs. One crew, one point of contact, one written price.",
    timelineLbl: "Typical timeline", rangeLbl: "Typical range", quoteBtn: "Get a quote for this",
    faqEyebrow: "Pricing, honestly", faqH: "How we price a project", faqLede: "The ranges above are starting points for planning. Your written estimate is the real number, and it's the one we hold to.",
    faq: [
      { q: "Are estimates really free?", a: "Yes. We visit the home, measure, talk through options and send a written scope and price. There's no fee and no obligation." },
      { q: "What changes the price?", a: "Layout changes that move plumbing or walls, material choices (tile, counters, cabinetry) and the condition of what we uncover behind walls. We flag any of those before the work happens, never after." },
      { q: "Do you handle permits and inspections?", a: "Yes. For any project that requires them in Auburn, Opelika or Lee County, we pull the permits, schedule the inspections and meet the inspector." },
      { q: "Can you work around a rental lease cycle?", a: "We do a lot of turnover work for Auburn University-area rentals. Tell us the move-out and move-in dates and we'll schedule around them." },
      { q: "How do payments work?", a: "A deposit to schedule and order materials, progress payments at agreed milestones, and the balance after your final walkthrough. It's all spelled out in the estimate." },
    ],
    ctaH: "Not sure which service you need?", ctaP: "Describe the problem or the idea. We'll tell you what it takes, what it costs, and whether it's worth doing.",
  },
  about: {
    eyebrow: "About us · Family-owned in Auburn, AL", h1: "Built by a family, for families",
    lede: "We started Z Construction & Remodeling because homeowners around here deserve a contractor who answers the phone, shows up and finishes.",
    storyEyebrow: "Our story", storyH: "Owner-operated, on purpose",
    storyP: [
      `Z Construction & Remodeling started in ${BRAND.founded} with one rule: the person who quotes your job is the person who does it.`,
      "The owner walks every project, sets every schedule and answers every call, in English or Spanish. The crew is small and consistent, and every job is priced in writing before it starts.",
      "We're a young company, so every review matters. We earn them one house at a time.",
    ],
    storyBadge: "Owner on every job",
    valuesEyebrow: "What we stand on", valuesH: "Four things we won't compromise",
    values: [
      { h: "Show up", p: "Be there when we said. Call if anything changes. Never leave you guessing." },
      { h: "Tell the truth", p: "If it doesn't need doing, we say so. If something's wrong behind a wall, you hear it first." },
      { h: "Build it right", p: "Plumb, level, square, waterproofed, to code. The parts you'll never see get the most attention." },
      { h: "Leave it clean", p: "Daily cleanup, dust barriers, respect for the house and the people living in it." },
    ],
    licEyebrow: "Licensed & insured", licH: "Protected, on paper",
    licP: "We carry general liability insurance and are licensed for residential work in the State of Alabama. Copies of our license and certificate of insurance are available on request, and we're glad to provide them before you sign anything.",
    licChecks: ["Licensed for residential work in Alabama", "General liability insurance, certificate available on request", "Permits pulled in our name for permitted work", "Written estimates and contracts on every project"],
    licVerify: "Check any Alabama contractor's license on the state's HBLB licensee search",
    areaEyebrow: "Service area", areaH: "Auburn, Opelika & Lee County",
    areaP: "We're headquartered in Auburn and work throughout Lee County. If you're within about 30 minutes of downtown Auburn, we'll come take a look.",
    stats: [{ n: "5.0", l: "Rating" }, { n: String(BRAND.founded), l: "Founded" }, { n: "1", l: "Point of contact" }, { n: "$0", l: "Estimates" }],
    ctaH: "Let's talk about your house.", ctaP: "A conversation and a walkthrough cost nothing. Reach out and we'll find a time that works.",
  },
  work: {
    eyebrow: "Our work · Auburn & Opelika", h1: "Before, after, and everything in between",
    lede: "Drag the sliders. Every project here is the kind of work we do every week for homeowners across Lee County.",
    filterLbl: "Filter projects",
    filters: [{ v: "all", l: "All" }, { v: "compare", l: "Before / After" }, { v: "kitchen", l: "Kitchens" }, { v: "bath", l: "Bathrooms" }, { v: "addition", l: "Additions" }, { v: "exterior", l: "Exterior" }, { v: "deck", l: "Decks" }, { v: "flooring", l: "Flooring" }],
    cells: [
      { kind: "compare", cat: "bath", portrait: true, before: "bathTubBeforeWide", after: "bathTubAfterWide", altBefore: "Bathroom tub with a gold-framed sliding glass door before the remodel", altAfter: "The same tub area after the remodel: white tile to the ceiling, two tiled niches, brass fixtures and a shower curtain", title: "Tub-shower remodel", meta: "Tile to the ceiling, brass fixtures" },
      { kind: "compare", cat: "bath", portrait: true, before: "bathTubBeforeClose", after: "bathTubAfterClose", altBefore: "Close view of the old tub with its gold-framed sliding door and rippled glass", altAfter: "Close view of the new tub with a white tile surround and built-in niches", title: "Tub wall, up close", meta: "Sliding door out, new tile in" },
      { kind: "compare", cat: "bath", portrait: true, before: "bathVanityBefore", after: "bathVanityAfter", altBefore: "Bathroom vanity with white cabinets, a plain oval sink and a large mirror before the remodel", altAfter: "The bathroom after the remodel: navy vanity with a white top, gold mirror and light fixture, and white tile along the lower wall", title: "Vanity & finishes", meta: "Navy vanity, gold mirror and light" },
      { kind: "photo", cat: "bath", photo: "bathTileDetail", title: "Tile detail", meta: "Tile to the ceiling, recessed light" },
      { kind: "photo", cat: "bath", photo: "vanityNavy", title: "Navy vanity", meta: "Cabinets, pulls and top" },
      { kind: "photo", cat: "bath", photo: "vanityTop", title: "Vanity top", meta: "Integrated sink and backsplash" },
      { kind: "photo", cat: "deck", photo: "deckRebuildFraming", title: "Deck rebuild", meta: "Decking off, framing exposed" },
      { kind: "tall", cat: "deck", photo: "dockLake", title: "Lakeside dock", meta: "T-shaped walkway and platform" },
      { kind: "photo", cat: "exterior", photo: "fenceInstalled", title: "Chain-link fence", meta: "Galvanized rail and posts" },
      { kind: "photo", cat: "exterior", photo: "fenceStaged", title: "Fence install", meta: "Rolls and gates staged" },
      { kind: "compare", cat: "exterior", before: "houseWeathered", after: "houseWhite", altBefore: "Weathered wood-sided house before exterior renovation", altAfter: "White farmhouse exterior with black shutters after renovation", title: "Exterior refresh", meta: "Siding, paint, trim" },
      { kind: "tall", cat: "kitchen", photo: "kitchen2", title: "Kitchen remodel", meta: "Cabinets & counters" },
      { kind: "photo", cat: "addition", photo: "framing1", title: "Second-story addition", meta: "Framing" },
      { kind: "compare", cat: "kitchen", before: "roomRaw", after: "kitchen1", altBefore: "Kitchen space stripped to the subfloor before remodel", altAfter: "Finished kitchen with marble island and white cabinetry", title: "Full kitchen renovation", meta: "Layout change & island" },
      { kind: "wide", cat: "exterior", photo: "porch2", title: "Porch rebuild", meta: "Columns, rails & paint" },
      { kind: "photo", cat: "flooring", photo: "floor2", title: "LVP flooring", meta: "Rental turnover" },
      { kind: "photo", cat: "kitchen", photo: "kitchen3", title: "Kitchen refresh", meta: "Cabinet paint & backsplash" },
      { kind: "photo", cat: "addition", photo: "framing2", title: "Garage addition", meta: "Framing & roofing" },
      { kind: "wide", cat: "flooring", photo: "floor1", title: "Whole-home flooring", meta: "Engineered hardwood" },
      { kind: "photo", cat: "exterior", photo: "paint1", title: "Exterior painting", meta: "Prep & paint" },
    ],
    notice: "The bathroom, deck, dock and fence photos are from real Z Construction jobs. Photos in the other categories are representative of the work until we add ours. Want to see a project like yours in person? Ask us for local references.",
    ctaH: "Want your house on this page?", ctaP: "Send us a photo of the room and a sentence about what you'd like to change. We'll take it from there.",
  },
  reviews: {
    eyebrow: "Reviews · What our customers say", h1: "Rated 5.0 by the people we build for",
    lede: "Straight from homeowners in Auburn and Opelika. We ask every customer for an honest review when the job is done.",
    intro: "Reviews are the only marketing we really trust, which is why we ask for one on every job, good or bad.",
    /* TODO: replace with verbatim reviews from Google / Angi / HomeAdvisor. These are samples. */
    items: [], // TODO paste real reviews here, verbatim, with permission: { quote, name, meta }
    proofH: "Every review so far is five stars.",
    proofP: "Our reviews live on Angi and HomeAdvisor, where only real customers can leave them. Read them there, then decide.",
    readAngi: "Read on Angi", readHA: "Read on HomeAdvisor",
    askEyebrow: "Worked with us?", askH: "Leave a review, it helps more than you know", askP: "A two-minute Google review is how the next family on your street finds us. Thank you.",
    google: "Review on Google",
    refEyebrow: "References", refH: "Want to talk to a past customer?", refP: "We'll connect you with homeowners who've had similar work done. Just ask when you request your estimate.", refLink: "Request a quote",
  },
  contact: {
    eyebrow: "Contact · Free estimates in Auburn & Opelika", h1: "Get a free quote",
    lede: "Tell us about the project. We'll follow up within one business day to set a time to come out.",
    formEyebrow: "Request an estimate", formH: "Tell us what you're thinking", formP: "Three quick questions and we'll be in touch with a time to come out.",
    f: { name: "Name", phone: "Phone", email: "Email", city: "Property city", cityPh: "Auburn, Opelika…", service: "Service", timeline: "Timeline", budget: "Budget range", contactPref: "Best way to reach you", smsConsent: "OK to text me about this request. Msg & data rates may apply. Reply STOP to opt out.", select: "Select one", message: "Tell us about the project", messagePh: "What room, what you'd like to change, anything we should know about the house.",
      send: "Get my free estimate", sending: "Sending…", next: "Next", back: "Back", stepOf: "Step {n} of 3", steps: ["Your project", "The details", "How to reach you"], note: "We reply within one business day. Your info is never shared or sold.",
      ok: "Thanks, we got it. Expect a call or email within one business day.", err: "Something went wrong sending the form. Please call or text us directly and we will take care of you.", honeypot: "Leave this empty", privacy: "Privacy policy" },
    serviceOptions: [{ v: "painting", l: "Interior / exterior painting" }, { v: "finishing", l: "Cabinet painting & trim" }, { v: "repairs", l: "Flooring / repairs" }, { v: "kitchensBaths", l: "Kitchen or bath" }, { v: "remodeling", l: "Home remodeling" }, { v: "additions", l: "Home addition" }, { v: "rental", l: "Rental turnover / make-ready" }, { v: "other", l: "Something else" }],
    timelineOptions: [{ v: "asap", l: "As soon as possible" }, { v: "1-3m", l: "Within 1–3 months" }, { v: "3-6m", l: "3–6 months" }, { v: "planning", l: "Just planning" }],
    budgetOptions: [{ v: "lt5", l: "Under $5,000" }, { v: "5-15", l: "$5,000–$15,000" }, { v: "15-40", l: "$15,000–$40,000" }, { v: "40-100", l: "$40,000–$100,000" }, { v: "100+", l: "$100,000+" }, { v: "unsure", l: "Not sure yet" }],
    contactOptions: [{ v: "call", l: "Call" }, { v: "text", l: "Text" }, { v: "whatsapp", l: "WhatsApp" }, { v: "email", l: "Email" }],
    waH: "WhatsApp", waP: "Send photos of the project and we'll reply with next steps.",
    callH: "Call or text", callP: "Fastest way to reach us during business hours.", emailH: "Email", emailP: "For plans, photos and anything longer than a text.",
    hoursH: "Hours", hoursRows: [["Monday – Friday", "7:00am – 6:00pm"], ["Saturday", "8:00am – 2:00pm"], ["Sunday", "Closed"]],
    basedH: "Based in", basedP: "Serving Auburn, Opelika & Lee County",
    areaEyebrow: "Service area", areaH: "Where we work",
    areaP: "Auburn is home base. We take projects throughout Lee County and a few neighboring communities, generally within about 30 minutes of downtown Auburn. Not sure if you're in range? Ask, the answer is usually yes.",
    mapTitle: "Map of the Z Construction service area around Auburn, Alabama",
  },
  thanks: { eyebrow: "Request received", h1: "Thanks, we'll be in touch", lede: "We got your request and will follow up within one business day. If it's urgent, call or text us at", home: "Back to home", work: "See our work",
    nextH: "What happens next", next: ["You'll get a confirmation email in a minute or two.", "The owner calls or texts you, usually the same business day, to set up a walkthrough.", "We visit, measure and talk options. Then you get a written scope and price."], wa: "Send photos on WhatsApp" },
  estimator: {
    eyebrow: "Free cost estimator · Lee County, AL · 2026", h1: "What will my project cost?",
    lede: "Three quick choices, and you get the planning range we'd give you on the phone. Based on real Auburn and Opelika project pricing, labor and materials included.",
    step1: "What are you planning?", step2: "How big is it?", step3: "Finish level",
    finish: { standard: { l: "Standard", d: "Durable builder-grade materials" }, mid: { l: "Mid-range", d: "What most of our clients choose" }, premium: { l: "Premium", d: "Custom, designer and high-end" } },
    result: "Typical 2026 range", resultNote: "Installed price, labor and materials, for Auburn, Opelika and Lee County.",
    cta: "Get my exact price", ctaNote: "Free walkthrough and written estimate. No pressure.",
    disclaimer: "Planning range only, not a quote. Your written estimate after a walkthrough is the real number, and it's the one we hold to.",
    guidesH: "Want the detail behind these numbers?",
  },
  guidesIndex: { eyebrow: "Guides · Lee County homeowners & landlords", h1: "Straight answers before you spend", lede: "Costs, permits, licensing and timing for remodeling in Auburn, Opelika and Lee County, written by the people who do the work.", read: "Read the guide", updated: "Updated", answer: "Short answer", toc: "In this guide", related: "Related service", ctaH: "Want a number for your house?", ctaP: "Guides give ranges. A free walkthrough gives you a written price.", sources: "Sources", next: "Keep reading", minRead: "min read", by: "Written by the Z Construction team, from the projects we price and build in Lee County", guidesFor: "Guides for this project" },
  areasIndex: { eyebrow: "Service areas · Lee County, Alabama", h1: "Where we build", lede: "Home base is Auburn. We work throughout Lee County and nearby communities, generally within about 30 minutes of downtown Auburn.", also: "Also serving", alsoP: "Beauregard, Salem, Loachapoka, Waverly, Notasulga and nearby communities. Not sure you're in range? Ask, the answer is usually yes.", popular: "Popular services here", places: "Neighborhoods & communities", local: "Good to know locally", drive: "From our Auburn base", view: "View area", viewService: "See the service" },
  privacy: {
    eyebrow: "Legal", h1: "Privacy policy", updated: "Last updated September 2026",
    sections: [
      { h: "What we collect", p: ["When you request a quote we collect what you type into the form: name, phone, email, property city, project details, and your contact preferences. We also record basic technical information such as the page you came from, your browser type and marketing tags (for example utm parameters or ad click IDs) so we know which of our advertising works."] },
      { h: "How we use it", p: ["We use your information only to respond to your request, prepare an estimate, schedule and perform work, and improve our marketing. We do not sell or rent your personal information."] },
      { h: "Text messages", p: ["If you check the box to receive texts, we may text you about your request, appointments and estimates. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time, or HELP for help. Consent to receive texts is not a condition of any purchase. Mobile numbers and SMS consent are never shared with third parties or affiliates for their marketing purposes."] },
      { h: "Advertising & analytics", p: ["This site may use Google Analytics, Google Ads, Microsoft Advertising, Meta (Facebook/Instagram) and similar tools that use cookies or similar technology to measure visits and ad performance. You can limit ad personalization in your Google, Microsoft and Meta account settings, and block cookies in your browser."] },
      { h: "Service providers", p: ["We use trusted providers to run this site and deliver messages (for example hosting, email and text-message delivery, and our customer management system). They may process your information only to provide those services to us."] },
      { h: "Your choices", p: ["To see, correct or delete the information we hold about you, email us or call us using the contact details on this site and we will respond promptly."] },
    ],
  },
  areas: AREAS_EN,
  langSuggest: { msg: "¿Prefiere leerlo en español?", go: "Ver en español", dismiss: "Cerrar" },
  funnel: {
    eyebrow: "Ready for a real number?", h: "Get a written price for {service}",
    p: "A free walkthrough, a line-by-line estimate in writing, and the owner on the job from start to finish.",
    range: "Typical 2026 range in Lee County: {range}", full: "Full estimate form",
    quickH: "Or just leave your number", quickP: "The owner calls or texts you back, usually the same business day. No spam, no mailing list.",
    name: "First name", phone: "Phone", send: "Call or text me", sending: "Sending…", ok: "Got it. Expect a call or text from the owner soon.",
    consent: "By sending, you agree we may call or text this number about your project.", wa: "WhatsApp us", call: "Call",
    midH: "Want this priced for your home?",
  },
};

/* -------------------------------------------------------------------------
   ESPAÑOL — escrito directamente para la comunidad hispana de Auburn,
   Opelika y el condado de Lee. Trato de usted, tono de vecino que sabe
   de obra, sin traducciones literales ni frases de folleto.
   ------------------------------------------------------------------------- */
const es: SiteContent = {
  nav: { home: "Inicio", services: "Servicios", about: "Nosotros", work: "Proyectos", reviews: "Reseñas", contact: "Contacto" },
  ui: {
    freeQuote: "Pida su cotización gratis", quoteShort: "Cotización gratis", call: "Llamar", menu: "Menú", primaryNav: "Principal", quickActions: "Acciones rápidas",
    langSwitch: "English", langSwitchLong: "English", whatsappCta: "Escríbanos por WhatsApp", langTitle: "Read in English", scroll: "Baje", before: "Antes", after: "Después",
    dragToCompare: "Deslice para comparar el antes y el después", readMore: "Ver más reseñas", skip: "Ir al contenido", rating: "5.0", ratingSources: "Angi · HomeAdvisor", starsLabel: "5 de 5 estrellas",
    whatsapp: "WhatsApp", home: "Inicio",
  },
  footer: {
    blurb: "Z Construction & Remodeling LLC es una empresa familiar de pintura y remodelación con base en Auburn, Alabama, que atiende en español y en inglés en Auburn, Opelika y el condado de Lee. Cocinas, baños, ampliaciones, pintura, gabinetes, pisos y todas esas reparaciones que se van acumulando.",
    badge: "Con licencia y asegurados · Alabama", services: "Servicios", company: "Empresa", contact: "Contacto",
    hours: ["Lun–Vie 7:00am–6:00pm", "Sáb 8:00am–2:00pm"], rights: "Todos los derechos reservados.", otherSite: "Site in English",
    areas: "Zonas de servicio", resources: "Planee su proyecto", estimator: "Calculadora de costos", guides: "Guías de remodelación", privacy: "Política de privacidad", allAreas: "Todas las zonas", help: "Preguntas frecuentes",
  },
  reviewRequest: { eyebrow: "Gracias", h1: "¿Cómo le fue con nosotros?", lede: "Dos minutos de su tiempo son la forma en que la siguiente familia de su calle encuentra un contratista de confianza. Use el sitio que ya conozca.", google: "Reseña en Google", angi: "Reseña en Angi", ha: "Reseña en HomeAdvisor", note: "Si algo no quedó bien, llame o mande mensaje al dueño primero y lo arreglamos.", thanks: "Gracias por confiarnos su casa." },
  promise: { h: "Nuestro compromiso, por escrito", items: ["Alcance y precio por escrito antes de empezar cualquier trabajo", "Sin cobros sorpresa: cualquier cambio se acuerda por escrito primero", "Licencia para trabajo residencial en Alabama y seguro vigente", "Obra limpia cada día y un recorrido final antes de dar por terminado", "Respuesta en un día hábil, en español o en inglés"] },
  cta: { h: "¿Tiene un proyecto en mente?", p: "Cuéntenos qué quiere hacer. Pasamos a su casa, revisamos con calma y le dejamos un presupuesto claro y por escrito. Sin compromiso, sin presión y sin sorpresas después.", btn: "Pida su cotización gratis", word: "Manos a la obra" },
  meta: {
    home: { title: "Pintura y remodelación en Auburn, AL | Hablamos español", description: "Pintores y remodeladores en Auburn y Opelika, AL: cocinas, baños, gabinetes, pisos y casas de renta. Empresa familiar. Presupuesto gratis en español." },
    services: { title: "Servicios de remodelación y pintura en Auburn, AL", description: "Remodelación de cocinas y baños, pintura de casas, gabinetes, pisos, ampliaciones y reparaciones en Auburn y Opelika, AL. Con licencia y seguro. En español." },
    about: { title: "Quiénes somos | Contratista familiar en Auburn, AL", description: "Empresa familiar de pintura y remodelación en Auburn, Opelika y el condado de Lee, Alabama. El dueño está en cada obra y lo atiende en español." },
    work: { title: "Fotos de antes y después | Remodelaciones en Auburn, AL", description: "Fotos del antes y después de cocinas, baños, pintura de casas, gabinetes, pisos y terrazas. Vea el tipo de trabajo que hacemos en Auburn y Opelika, Alabama." },
    reviews: { title: "Reseñas de clientes | Z Construction en Auburn, AL", description: "Z Construction & Remodeling tiene 5.0 estrellas en Angi y HomeAdvisor. Vea lo que dicen las familias de Auburn y Opelika, o deje la reseña de su proyecto." },
    contact: { title: "Presupuesto gratis de pintura y remodelación | Auburn", description: "Pida su presupuesto gratis por escrito en Auburn, Opelika o el condado de Lee. Llame, mande WhatsApp o llene el formulario. Respondemos en español en un día." },
    thanks: { title: "Gracias", description: "Recibimos su solicitud. Le respondemos en un día hábil." },
    estimator: { title: "Calculadora de costos de remodelación | Auburn, AL 2026", description: "Calcule gratis cuánto cuesta remodelar en Auburn y Opelika en 2026: cocina, baño, ampliación, pintura, gabinetes, pisos o casa de renta. En 30 segundos." },
    guides: { title: "Guías de costos y permisos para remodelar | Auburn, AL", description: "Respuestas claras para familias y dueños de rentas del condado de Lee: costos 2026, permisos, cómo verificar a un contratista, casas de renta y gabinetes." },
    areas: { title: "Zonas de servicio | Contratista en el condado de Lee, AL", description: "Pintamos y remodelamos casas en Auburn, Opelika, Smiths Station, Beauregard, Salem, Loachapoka, Waverly y Notasulga, condado de Lee. Hablamos español." },
    review: { title: "Déjenos su reseña | Z Construction & Remodeling", description: "Gracias por elegir a Z Construction & Remodeling. Una reseña rápida en Google, Angi o HomeAdvisor ayuda a la siguiente familia de Auburn a encontrarnos." },
    privacy: { title: "Política de privacidad | Z Construction & Remodeling", description: "Cómo Z Construction & Remodeling LLC recopila, usa y protege lo que usted envía por este sitio, incluidos los términos de mensajes de texto y sus opciones." },
  },
  home: {
    eyebrow: "Pintura y remodelación de casas en Auburn y Opelika, AL",
    h1: "Construido con precisión.", h1Accent: "Terminado con arte.",
    lede: "Pintores y remodeladores de Auburn y Opelika, empresa familiar. Precio por escrito antes de empezar, el dueño en cada obra y la misma cuadrilla del primer día a la última mano de pintura. Lo atendemos en español.",
    primary: "Pida su presupuesto gratis", secondary: "Calcule su proyecto",
    proof: [
      { value: 5, decimals: 1, label: "Calificación", note: "En todas las reseñas hasta hoy" },
      { display: "$0", label: "Presupuesto por escrito", note: "Sin costo y sin compromiso" },
      { display: "1 día", label: "Tiempo de respuesta", note: "Llamadas y formularios, siempre" },
      { display: "1", label: "Solo responsable", note: "El dueño, de principio a fin" },
    ],
    split: { eyebrow: "Lo que hacemos", h: "Una sola cuadrilla, de principio a fin.", lede: "La misma cuadrilla que resana la tablaroca es la que la pinta. Sin intermediarios, sin echarse la culpa y con un solo precio por escrito.",
      build: "Construcción y remodelación", buildSub: "Cocinas · baños · ampliaciones", finish: "Pintura y acabados", finishSub: "Pintura · gabinetes · pisos", link: "Todos los servicios y precios" },
    rental: { eyebrow: "Dueños de casas de renta", h: "Su casa de renta, lista entre un inquilino y otro.",
      p: "En Auburn el calendario de rentas no espera. Pintamos, cambiamos el piso gastado, reparamos lo que dejó el inquilino y resolvemos los pendientes en días. Al terminar le mandamos fotos, para que no tenga que venir si vive en otra ciudad.",
      points: ["Pintura completa: paredes, molduras y puertas", "Piso LVP que aguanta el uso de inquilinos", "Tablaroca, puertas, accesorios y pendientes", "Reporte con fotos cuando la casa está lista"],
      btn: "Planear el cambio de inquilino" },
    meta: ["Presupuesto gratis y por escrito", "Precios en cada servicio", "El dueño en cada obra", "Atención en español"],
    marquee: ["Ampliaciones", "Cocinas y baños", "Remodelaciones completas", "Pintura interior", "Pintura exterior", "Gabinetes", "Pisos", "Reparaciones", "Auburn · Opelika · Condado de Lee"],
    processEyebrow: "Así trabajamos", newbie: "¿Es la primera vez que contrata a alguien? Empiece por las preguntas frecuentes", processH: "Sin sorpresas. Así de simple.", processLede: "Cuatro pasos, bien explicados, para que usted siempre sepa en qué va su obra.",
    steps: [
      { h: "Visita", p: "Vamos a su casa, escuchamos lo que quiere, medimos y le hablamos con franqueza de lo que se puede hacer y lo que cuesta." },
      { h: "Presupuesto por escrito", p: "Alcance claro, precios detallados y un calendario realista. Nada de \"luego vemos\" ni de letra chica." },
      { h: "La obra", p: "Permisos en regla, oficios coordinados y la casa limpia cada día. Le vamos avisando conforme avanza el trabajo, no al final." },
      { h: "Entrega", p: "Recorremos todo con usted, corregimos cualquier detalle y no damos la obra por terminada hasta que usted quede conforme." },
    ],
    workEyebrow: "Trabajo reciente", workH: "Deslice y vea la diferencia",
    workP: "Mueva el control para comparar cómo empezó un proyecto y cómo quedó. Hay más en la galería.",
    workBtn: "Ver la galería",
    reviewsEyebrow: "Reseñas", reviewsH: "Cinco estrellas, hasta hoy.",
    areaEyebrow: "Zona de servicio", areaH: "De aquí, de verdad.",
    areaP: "Auburn, Opelika y las comunidades del condado de Lee, incluidas las casas de renta y de fin de semana de dueños que viven fuera.",
    areaLink: "Vea si llegamos a su zona",
    pricing: { eyebrow: "Números reales antes de llamar", h: "Casi ningún contratista de la zona publica precios. Nosotros sí.", p: "Son rangos de planeación 2026 para el condado de Lee, instalados, con mano de obra y materiales. Su presupuesto por escrito viene línea por línea y no cambia si usted no cambia el plan.", btn: "Ver todos los precios", note: "Acabados de gama media. Los estándar cuestan cerca de 15% menos y los premium unos 30% más.", from: "Rango típico" },
  },
  services: [
    { id: "remodeling", group: "build", name: "Remodelación de casas", sub: "Casa completa o una sola habitación", blurb: "Remodelaciones completas o de un solo espacio, respetando la estructura de la casa.", photo: "bathTubAfterWide", alt: "Tina y regadera remodeladas con azulejo blanco hasta el techo, dos nichos de azulejo y accesorios de latón",
      para: "Ya sea tirar la pared entre la cocina y la sala o poner al día una casa entera de los años ochenta, planeamos la remodelación pensando en cómo vive su familia de verdad. Conservamos lo que la casa tiene de bueno y arreglamos lo que no.",
      items: ["Remodelación de casa completa", "Conversión a concepto abierto", "Acabado de sótanos y cuartos extra", "Molduras, puertas y muebles empotrados", "Reparaciones estructurales", "Permisos e inspecciones", "Renovación entre inquilinos", "Coordinación de diseño"], timeline: "2 a 8 semanas", range: "Desde $10,000" },
    { id: "additions", group: "build", name: "Ampliaciones", sub: "Cuartos, solarios y cocheras", blurb: "Cuartos, dormitorios, solarios y cocheras que parecen haber estado ahí desde siempre.", photo: "framing2", alt: "Ampliación en construcción con estructura de madera",
      para: "Una ampliación tiene que verse como parte del diseño original. Igualamos techos, fachada, ventanas y molduras para que el espacio nuevo se integre, y nosotros nos encargamos de permisos, ingeniería e inspecciones de principio a fin.",
      items: ["Dormitorios y baños adicionales", "Cuartos extra y segundos pisos", "Solarios y porches con mosquitero", "Cocheras adosadas e independientes", "Cuartos para los suegros o la familia", "Cimientos, estructura y techo", "Coordinación eléctrica y de plomería", "Permisos e inspecciones"], timeline: "6 a 16 semanas", range: "Desde $40,000" },
    { id: "kitchensBaths", group: "build", name: "Cocinas y baños", sub: "Distribución, gabinetes, azulejo, cubiertas y plomería", blurb: "Los dos espacios que más valor le dan a una casa, con gabinetes, azulejo y plomería bien hechos a la primera.", photo: "bathVanityAfter", alt: "Baño remodelado con tocador azul marino, espejo y lámpara dorados, y azulejo blanco en la parte baja de la pared",
      para: "La cocina y el baño son donde más se nota una buena remodelación, y donde no hay margen de error. Diseñamos pensando en espacio, orden y luz, y luego instalamos gabinetes, cubiertas, azulejo, impermeabilización y accesorios con la precisión que se merecen.",
      items: ["Remodelación completa de cocina", "Cambio de distribución e islas", "Gabinetes a la medida", "Cuarzo, granito y madera", "Regaderas a ras de piso", "Cambio de tina por regadera", "Azulejo a la medida", "Tocadores, espejos e iluminación"], timeline: "2 a 6 semanas", range: "Desde $8,000" },
    { id: "painting", group: "finish", name: "Pintura interior y exterior", sub: "Preparación a conciencia y pintura de primera", blurb: "Paredes, techos, fachadas y molduras, preparados como se debe y terminados con pintura de primera calidad.", photo: "paint1", alt: "Pintor cubriendo una ventana antes de pintar la fachada",
      para: "Un buen trabajo de pintura es noventa por ciento preparación. Lavamos, raspamos, lijamos, sellamos y aplicamos primario antes de dar la primera mano de acabado, y usamos productos Sherwin-Williams y Benjamin Moore pensados para el sol y la humedad de Alabama.",
      items: ["Paredes, techos y molduras interiores", "Fachadas de madera, ladrillo y estuco", "Lavado a presión y preparación", "Sellado, resane y primario", "Asesoría de color", "Paredes de acento y acabados especiales", "Repintado entre inquilinos", "Colores exteriores aprobados por la HOA"], timeline: "2 a 7 días", range: "Desde $1,800" },
    { id: "finishing", group: "finish", name: "Gabinetes y molduras", sub: "Gabinetes, puertas y carpintería a pistola", blurb: "Acabado a pistola, liso como de fábrica, en gabinetes, puertas y carpintería, por una fracción de lo que cuesta cambiarlos.", photo: "kitchen2", alt: "Cocina con gabinetes blancos recién pintados",
      para: "Renovar los gabinetes es la mejora que más valor regresa en una cocina. Quitamos puertas y cajones, desengrasamos, lijamos, aplicamos primario y pintamos a pistola con un esmalte catalizado que se ve y aguanta como pintura de fábrica.",
      items: ["Gabinetes de cocina", "Tocadores de baño", "Puertas y molduras interiores", "Escaleras y barandales", "Muebles empotrados y chimeneas", "Herrajes y cierre suave", "Esmalte a pistola", "Tinte y barniz"], timeline: "3 a 7 días", range: "Desde $3,500" },
    { id: "repairs", group: "finish", name: "Pisos y reparaciones", sub: "LVP, madera, tablaroca, terrazas y detalles", blurb: "Pisos nuevos, madera podrida, tablaroca, puertas y esa lista de detalles antes de vender o rentar.", photo: "deckRebuildFraming", alt: "Terraza en reconstrucción, con las tablas viejas quitadas y las vigas a la vista",
      para: "No todo necesita una cuadrilla grande. Piso LVP o de madera, una moldura podrida, una terraza vencida, una puerta que no cierra, un golpe en la tablaroca o los detalles antes de vender o rentar la casa. Lo atendemos con la misma seriedad que una remodelación completa.",
      items: ["Pisos de LVP, madera y azulejo", "Madera podrida y fachada", "Terrazas y porches", "Tablaroca y textura", "Cambio de puertas y ventanas", "Detalles antes de vender", "Preparación de casas de renta", "Daños por tormenta y agua"], timeline: "1 a 5 días", range: "Desde $350" },
  ],
  servicesPage: {
    eyebrow: "Servicios · Auburn y Opelika, AL", h1: "Construcción y remodelación para su casa",
    lede: "Cocinas, baños, ampliaciones, remodelaciones completas y reparaciones. Una cuadrilla, un responsable y un precio por escrito.",
    timelineLbl: "Duración típica", rangeLbl: "Rango típico", quoteBtn: "Cotizar este servicio",
    faqEyebrow: "Precios, con franqueza", faqH: "Cómo cotizamos un proyecto", faqLede: "Los rangos de arriba son para que se dé una idea. Su presupuesto por escrito es el número real, y ese es el que respetamos.",
    faq: [
      { q: "¿De verdad la cotización es gratis?", a: "Sí. Vamos a su casa, medimos, platicamos las opciones y le mandamos el alcance y el precio por escrito. No cobramos la visita y no queda comprometido a nada." },
      { q: "¿Qué puede cambiar el precio?", a: "Cambios de distribución que muevan plomería o paredes, los materiales que elija (azulejo, cubiertas, gabinetes) y lo que encontremos detrás de las paredes. Cualquiera de esas cosas se la avisamos antes de hacerla, nunca después." },
      { q: "¿Ustedes sacan los permisos?", a: "Sí. Si el proyecto lo requiere en Auburn, Opelika o el condado de Lee, nosotros tramitamos los permisos, programamos las inspecciones y recibimos al inspector." },
      { q: "¿Pueden ajustarse a las fechas de renta?", a: "Hacemos mucho trabajo de cambio de inquilino en casas cerca de Auburn University. Díganos cuándo se va uno y cuándo entra el otro, y nos organizamos con esas fechas." },
      { q: "¿Cómo se paga?", a: "Un anticipo para programar la obra y pedir materiales, pagos por avance en las etapas acordadas y el resto después del recorrido final. Todo queda detallado en el presupuesto." },
    ],
    ctaH: "¿No sabe qué servicio necesita?", ctaP: "Descríbanos el problema o la idea. Le decimos qué se necesita, cuánto cuesta y, con toda honestidad, si vale la pena hacerlo.",
  },
  about: {
    eyebrow: "Nosotros · Empresa familiar de Auburn, AL", h1: "Una familia que construye para otras familias",
    lede: "Abrimos Z Construction & Remodeling porque las familias de esta zona merecen un contratista que conteste el teléfono, llegue a la hora y termine el trabajo.",
    storyEyebrow: "Nuestra historia", storyH: "El dueño en la obra, siempre",
    storyP: [
      `Z Construction & Remodeling empezó en ${BRAND.founded} con una sola regla: la persona que le cotiza el trabajo es la misma que lo hace.`,
      "El dueño recorre cada proyecto, arma cada calendario y contesta cada llamada, en español o en inglés. La cuadrilla es chica y siempre la misma, y cada trabajo tiene su precio por escrito antes de empezar.",
      "Somos una empresa joven, así que cada reseña cuenta. Nos las ganamos casa por casa.",
    ],
    storyBadge: "El dueño en cada obra",
    valuesEyebrow: "Nuestros principios", valuesH: "Cuatro cosas que no negociamos",
    values: [
      { h: "Cumplir", p: "Llegar cuando dijimos. Avisar si algo cambia. Nunca dejarlo esperando sin explicación." },
      { h: "Hablar claro", p: "Si algo no hace falta, se lo decimos. Si aparece un problema detrás de una pared, usted es el primero en saberlo." },
      { h: "Hacerlo bien", p: "A plomo, a nivel, a escuadra, impermeabilizado y conforme al código. Lo que no se ve es lo que más cuidamos." },
      { h: "Dejar limpio", p: "Limpieza diaria, barreras contra el polvo y respeto por su casa y por la familia que vive en ella." },
    ],
    licEyebrow: "Licencia y seguro", licH: "Todo en regla, por escrito",
    licP: "Contamos con seguro de responsabilidad civil y con licencia para trabajo residencial en el estado de Alabama. Si quiere ver la licencia y el certificado de seguro antes de firmar cualquier cosa, con gusto se los entregamos. Es lo correcto.",
    licChecks: ["Licencia para trabajo residencial en Alabama", "Seguro de responsabilidad civil, certificado disponible a solicitud", "Permisos tramitados a nuestro nombre", "Presupuesto y contrato por escrito en cada proyecto"],
    licVerify: "Verifique la licencia de cualquier contratista de Alabama en el buscador oficial de la HBLB",
    areaEyebrow: "Zona de servicio", areaH: "Auburn, Opelika y el condado de Lee",
    areaP: "Nuestra base está en Auburn y trabajamos en todo el condado de Lee. Si está a unos 30 minutos del centro de Auburn, pasamos a ver su proyecto.",
    stats: [{ n: "5.0", l: "Calificación" }, { n: String(BRAND.founded), l: "Fundada" }, { n: "1", l: "Solo responsable" }, { n: "$0", l: "Presupuestos" }],
    ctaH: "Hablemos de su casa.", ctaP: "Platicar y hacer la visita no cuesta nada. Escríbanos y buscamos un horario que le acomode.",
  },
  work: {
    eyebrow: "Proyectos · Auburn y Opelika", h1: "El antes, el después y todo lo de en medio",
    lede: "Mueva los controles. Cada proyecto de esta página es el tipo de trabajo que hacemos cada semana para familias del condado de Lee.",
    filterLbl: "Filtrar proyectos",
    filters: [{ v: "all", l: "Todo" }, { v: "compare", l: "Antes / Después" }, { v: "kitchen", l: "Cocinas" }, { v: "bath", l: "Baños" }, { v: "addition", l: "Ampliaciones" }, { v: "exterior", l: "Fachadas" }, { v: "deck", l: "Terrazas" }, { v: "flooring", l: "Pisos" }],
    cells: [
      { kind: "compare", cat: "bath", portrait: true, before: "bathTubBeforeWide", after: "bathTubAfterWide", altBefore: "Tina del baño con puerta corrediza de cristal con marco dorado, antes de la remodelación", altAfter: "La misma tina después de la remodelación: azulejo blanco hasta el techo, dos nichos de azulejo, accesorios de latón y cortina de regadera", title: "Tina y regadera nuevas", meta: "Azulejo hasta el techo, accesorios de latón" },
      { kind: "compare", cat: "bath", portrait: true, before: "bathTubBeforeClose", after: "bathTubAfterClose", altBefore: "Vista cercana de la tina vieja con su puerta corrediza de marco dorado y cristal texturizado", altAfter: "Vista cercana de la tina nueva con azulejo blanco alrededor y nichos integrados", title: "La pared de la tina, de cerca", meta: "Sin puerta corrediza, con azulejo nuevo" },
      { kind: "compare", cat: "bath", portrait: true, before: "bathVanityBefore", after: "bathVanityAfter", altBefore: "Tocador con gabinetes blancos, lavabo ovalado sencillo y espejo grande, antes de la remodelación", altAfter: "El baño después de la remodelación: tocador azul marino con cubierta blanca, espejo y lámpara dorados, y azulejo blanco en la parte baja de la pared", title: "Tocador y acabados", meta: "Tocador azul marino, espejo y lámpara dorados" },
      { kind: "photo", cat: "bath", photo: "bathTileDetail", title: "Detalle del azulejo", meta: "Azulejo hasta el techo y luz empotrada" },
      { kind: "photo", cat: "bath", photo: "vanityNavy", title: "Tocador azul marino", meta: "Gabinetes, jaladeras y cubierta" },
      { kind: "photo", cat: "bath", photo: "vanityTop", title: "Cubierta del tocador", meta: "Lavabo integrado y salpicadero" },
      { kind: "photo", cat: "deck", photo: "deckRebuildFraming", title: "Terraza en reconstrucción", meta: "Sin tablas, estructura a la vista" },
      { kind: "tall", cat: "deck", photo: "dockLake", title: "Muelle junto al lago", meta: "Pasarela y plataforma en forma de T" },
      { kind: "photo", cat: "exterior", photo: "fenceInstalled", title: "Cerca de malla ciclónica", meta: "Barra superior y postes galvanizados" },
      { kind: "photo", cat: "exterior", photo: "fenceStaged", title: "Instalación de cerca", meta: "Rollos y puertas listos en obra" },
      { kind: "compare", cat: "exterior", before: "houseWeathered", after: "houseWhite", altBefore: "Casa con madera desgastada antes de renovar la fachada", altAfter: "Fachada blanca con persianas negras ya renovada", title: "Fachada renovada", meta: "Fachada, pintura y molduras" },
      { kind: "tall", cat: "kitchen", photo: "kitchen2", title: "Remodelación de cocina", meta: "Gabinetes y cubiertas" },
      { kind: "photo", cat: "addition", photo: "framing1", title: "Segundo piso", meta: "Estructura" },
      { kind: "compare", cat: "kitchen", before: "roomRaw", after: "kitchen1", altBefore: "Cocina desmantelada hasta el subpiso antes de la obra", altAfter: "Cocina terminada con isla de mármol y gabinetes blancos", title: "Cocina completa", meta: "Nueva distribución e isla" },
      { kind: "wide", cat: "exterior", photo: "porch2", title: "Porche reconstruido", meta: "Columnas, barandal y pintura" },
      { kind: "photo", cat: "flooring", photo: "floor2", title: "Piso LVP", meta: "Cambio de inquilino" },
      { kind: "photo", cat: "kitchen", photo: "kitchen3", title: "Cocina renovada", meta: "Gabinetes pintados y salpicadero" },
      { kind: "photo", cat: "addition", photo: "framing2", title: "Cochera nueva", meta: "Estructura y techo" },
      { kind: "wide", cat: "flooring", photo: "floor1", title: "Pisos en toda la casa", meta: "Madera de ingeniería" },
      { kind: "photo", cat: "exterior", photo: "paint1", title: "Pintura exterior", meta: "Preparación y pintura" },
    ],
    notice: "Las fotos de baños, terrazas, muelle y cerca son de trabajos reales de Z Construction. Las de las demás categorías muestran el tipo de trabajo mientras agregamos las nuestras. ¿Quiere ver en persona un proyecto parecido al suyo? Pídanos referencias de clientes de la zona.",
    ctaH: "¿Quiere ver su casa en esta página?", ctaP: "Mándenos una foto del espacio y una frase de lo que quiere cambiar. Nosotros nos encargamos del resto.",
  },
  reviews: {
    eyebrow: "Reseñas · Lo que dicen nuestros clientes", h1: "Las familias nos califican con 5.0",
    lede: "Opiniones directas de dueños de casa en Auburn y Opelika. Al terminar cada trabajo le pedimos al cliente una reseña honesta.",
    intro: "Las reseñas son la única publicidad en la que de verdad confiamos. Por eso pedimos una en cada trabajo, salga bien o salga mal.",
    /* TODO: sustituir por reseñas reales tal cual aparecen en Google / Angi / HomeAdvisor. Estas son muestras. */
    items: [], // TODO paste real reviews here, verbatim, with permission: { quote, name, meta }
    proofH: "Todas nuestras reseñas son de cinco estrellas.",
    proofP: "Nuestras reseñas están en Angi y HomeAdvisor, donde solo los clientes reales pueden dejarlas. Léalas ahí y decida usted.",
    readAngi: "Leer en Angi", readHA: "Leer en HomeAdvisor",
    askEyebrow: "¿Ya trabajó con nosotros?", askH: "Déjenos una reseña. Ayuda más de lo que se imagina.", askP: "Dos minutos en Google son la forma en que la siguiente familia de su calle nos encuentra. Muchas gracias.",
    google: "Reseña en Google",
    refEyebrow: "Referencias", refH: "¿Quiere hablar con un cliente nuestro?", refP: "Lo ponemos en contacto con familias que ya hicieron un trabajo parecido al suyo. Solo pídalo cuando solicite su cotización.", refLink: "Pedir cotización",
  },
  contact: {
    eyebrow: "Contacto · Cotización gratis en Auburn y Opelika", h1: "Pida su cotización gratis",
    lede: "Cuéntenos de su proyecto. En un día hábil le llamamos para ponernos de acuerdo y pasar a su casa. Lo atendemos en español.",
    formEyebrow: "Solicite su presupuesto", formH: "Cuéntenos qué tiene en mente", formP: "Tres preguntas rápidas y le escribimos para agendar la visita.",
    f: { name: "Nombre", phone: "Teléfono", email: "Correo electrónico", city: "Ciudad de la propiedad", cityPh: "Auburn, Opelika…", service: "Servicio", timeline: "¿Para cuándo?", budget: "Presupuesto aproximado", contactPref: "¿Cómo prefiere que le contactemos?", smsConsent: "Acepto recibir mensajes de texto sobre esta solicitud. Pueden aplicar tarifas de mensajes y datos. Responda STOP para cancelar.", select: "Elija una opción", message: "Cuéntenos del proyecto", messagePh: "Qué espacio, qué le gustaría cambiar y cualquier detalle de la casa que debamos saber.",
      send: "Pedir mi presupuesto gratis", sending: "Enviando…", next: "Siguiente", back: "Atrás", stepOf: "Paso {n} de 3", steps: ["Su proyecto", "Los detalles", "Cómo contactarlo"], note: "Le respondemos en un día hábil. Sus datos no se comparten ni se venden.",
      ok: "Listo, recibimos su solicitud. Espere nuestra llamada o correo en un día hábil.", err: "Hubo un problema al enviar el formulario. Llámenos o mándenos un mensaje y con gusto lo atendemos.", honeypot: "Deje este campo vacío", privacy: "Política de privacidad" },
    serviceOptions: [{ v: "painting", l: "Pintura interior / exterior" }, { v: "finishing", l: "Pintura de gabinetes y molduras" }, { v: "repairs", l: "Pisos / reparaciones" }, { v: "kitchensBaths", l: "Cocina o baño" }, { v: "remodeling", l: "Remodelación de casa" }, { v: "additions", l: "Ampliación" }, { v: "rental", l: "Casa de renta / cambio de inquilino" }, { v: "other", l: "Otra cosa" }],
    timelineOptions: [{ v: "asap", l: "Lo antes posible" }, { v: "1-3m", l: "En 1 a 3 meses" }, { v: "3-6m", l: "En 3 a 6 meses" }, { v: "planning", l: "Apenas estoy planeando" }],
    budgetOptions: [{ v: "lt5", l: "Menos de $5,000" }, { v: "5-15", l: "$5,000–$15,000" }, { v: "15-40", l: "$15,000–$40,000" }, { v: "40-100", l: "$40,000–$100,000" }, { v: "100+", l: "Más de $100,000" }, { v: "unsure", l: "Todavía no sé" }],
    contactOptions: [{ v: "whatsapp", l: "WhatsApp" }, { v: "call", l: "Llamada" }, { v: "text", l: "Mensaje de texto" }, { v: "email", l: "Correo" }],
    waH: "WhatsApp", waP: "Mándenos fotos del proyecto por WhatsApp y le contestamos con los siguientes pasos. En español.",
    callH: "Llame o mande mensaje", callP: "La forma más rápida de encontrarnos en horario de trabajo.", emailH: "Correo", emailP: "Para planos, fotos y todo lo que no cabe en un mensaje de texto.",
    hoursH: "Horario", hoursRows: [["Lunes a viernes", "7:00am – 6:00pm"], ["Sábado", "8:00am – 2:00pm"], ["Domingo", "Cerrado"]],
    basedH: "Sede", basedP: "Atendemos Auburn, Opelika y el condado de Lee",
    areaEyebrow: "Zona de servicio", areaH: "Dónde trabajamos",
    areaP: "Auburn es nuestra base. Tomamos proyectos en todo el condado de Lee y en algunas comunidades vecinas, por lo general a unos 30 minutos del centro de Auburn. ¿No sabe si llegamos a su zona? Pregunte; casi siempre la respuesta es sí.",
    mapTitle: "Mapa de la zona de servicio de Z Construction alrededor de Auburn, Alabama",
  },
  thanks: { eyebrow: "Solicitud recibida", h1: "Gracias, en breve le llamamos", lede: "Recibimos su solicitud y le respondemos en un día hábil. Si es algo urgente, llámenos o mándenos un mensaje al", home: "Volver al inicio", work: "Ver proyectos",
    nextH: "Qué sigue", next: ["En un par de minutos le llega un correo de confirmación.", "El dueño le llama o le escribe, casi siempre el mismo día hábil, para quedar en una visita.", "Pasamos a su casa, medimos y platicamos opciones. Luego le mandamos el alcance y el precio por escrito."], wa: "Mandar fotos por WhatsApp" },
  estimator: {
    eyebrow: "Calculadora gratis · Condado de Lee, AL · 2026", h1: "¿Cuánto va a costar mi proyecto?",
    lede: "Tres preguntas rápidas y le damos el mismo rango que le daríamos por teléfono. Basado en precios reales de obras en Auburn y Opelika, con mano de obra y materiales.",
    step1: "¿Qué quiere hacer?", step2: "¿Qué tan grande es?", step3: "Nivel de acabados",
    finish: { standard: { l: "Estándar", d: "Materiales resistentes y económicos" }, mid: { l: "Intermedio", d: "Lo que escogen la mayoría de nuestros clientes" }, premium: { l: "Premium", d: "A la medida, de diseñador y de alta gama" } },
    result: "Rango típico en 2026", resultNote: "Precio instalado, mano de obra y materiales, para Auburn, Opelika y el condado de Lee.",
    cta: "Quiero mi precio exacto", ctaNote: "Visita y presupuesto por escrito gratis. Sin compromiso.",
    disclaimer: "Es solo un rango para planear, no una cotización. El número real es el de su presupuesto por escrito después de la visita, y ese es el que respetamos.",
    guidesH: "¿Quiere saber de dónde salen estos números?",
  },
  guidesIndex: { eyebrow: "Guías · Para familias y dueños del condado de Lee", h1: "Respuestas claras antes de gastar", lede: "Costos, permisos, licencias y tiempos para remodelar en Auburn, Opelika y el condado de Lee, escritos por la gente que hace el trabajo. En español.", read: "Leer la guía", updated: "Actualizada", answer: "Respuesta corta", toc: "En esta guía", related: "Servicio relacionado", ctaH: "¿Quiere un número para su casa?", ctaP: "Las guías dan rangos. Una visita gratis le da un precio por escrito.", sources: "Fuentes", next: "Siga leyendo", minRead: "min de lectura", by: "Escrita por el equipo de Z Construction, con base en los proyectos que cotizamos y hacemos en el condado de Lee", guidesFor: "Guías para este proyecto" },
  areasIndex: { eyebrow: "Zonas de servicio · Condado de Lee, Alabama", h1: "Dónde trabajamos", lede: "Nuestra base es Auburn. Trabajamos en todo el condado de Lee y comunidades cercanas, por lo general a unos 30 minutos del centro de Auburn.", also: "También atendemos", alsoP: "Beauregard, Salem, Loachapoka, Waverly, Notasulga y comunidades cercanas. ¿No sabe si llegamos? Pregunte; casi siempre la respuesta es sí.", popular: "Servicios más pedidos aquí", places: "Vecindarios y comunidades", local: "Bueno saber", drive: "Desde nuestra base en Auburn", view: "Ver zona", viewService: "Ver el servicio" },
  privacy: {
    eyebrow: "Legal", h1: "Política de privacidad", updated: "Última actualización: septiembre de 2026",
    sections: [
      { h: "Qué información recopilamos", p: ["Cuando pide una cotización recopilamos lo que escribe en el formulario: nombre, teléfono, correo, ciudad de la propiedad, detalles del proyecto y cómo prefiere que le contactemos. También registramos información técnica básica, como la página de la que llegó, el tipo de navegador y etiquetas de publicidad (por ejemplo parámetros utm o identificadores de clic de anuncios), para saber qué publicidad nos funciona."] },
      { h: "Para qué la usamos", p: ["Usamos su información solo para responder a su solicitud, preparar un presupuesto, programar y hacer el trabajo, y mejorar nuestra publicidad. No vendemos ni rentamos su información personal."] },
      { h: "Mensajes de texto", p: ["Si marca la casilla para recibir mensajes, podemos escribirle sobre su solicitud, citas y presupuestos. La frecuencia varía. Pueden aplicar tarifas de mensajes y datos. Responda STOP en cualquier momento para cancelar, o HELP para recibir ayuda. Aceptar mensajes no es condición para ninguna compra. Nunca compartimos números de celular ni el consentimiento de mensajes con terceros o afiliados para su publicidad."] },
      { h: "Publicidad y estadísticas", p: ["Este sitio puede usar Google Analytics, Google Ads, Microsoft Advertising, Meta (Facebook/Instagram) y herramientas similares que usan cookies o tecnología parecida para medir visitas y el rendimiento de anuncios. Puede limitar la personalización de anuncios en la configuración de sus cuentas de Google, Microsoft y Meta, y bloquear cookies en su navegador."] },
      { h: "Proveedores de servicio", p: ["Usamos proveedores de confianza para operar este sitio y enviar mensajes (por ejemplo, alojamiento web, envío de correos y mensajes de texto, y nuestro sistema de clientes). Solo pueden usar su información para darnos esos servicios."] },
      { h: "Sus opciones", p: ["Para ver, corregir o borrar la información que tenemos sobre usted, escríbanos o llámenos con los datos de contacto de este sitio y le respondemos pronto."] },
    ],
  },
  areas: AREAS_ES,
  langSuggest: { msg: "Prefer to read this in English?", go: "View in English", dismiss: "Dismiss" },
  funnel: {
    eyebrow: "¿Listo para un número real?", h: "Pida un precio por escrito para {service}",
    p: "Una visita gratis, un presupuesto por escrito línea por línea y el dueño en la obra de principio a fin.",
    range: "Rango típico 2026 en el condado de Lee: {range}", full: "Formulario completo",
    quickH: "O déjenos su número", quickP: "El dueño le llama o le manda mensaje, casi siempre el mismo día hábil. Sin spam y sin listas de correo.",
    name: "Nombre", phone: "Teléfono", send: "Que me llamen", sending: "Enviando…", ok: "Listo. El dueño le va a llamar o mandar mensaje muy pronto.",
    consent: "Al enviar, acepta que le llamemos o le mandemos mensaje a este número sobre su proyecto.", wa: "Escríbanos por WhatsApp", call: "Llamar",
    midH: "¿Quiere el precio para su casa?",
  },
};

export const CONTENT: Record<Locale, SiteContent> = { en, es };
