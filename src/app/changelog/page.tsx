import Link from "next/link";
import Image from "next/image";
import { Card, Legend, GroupedBars, Dumbbell, Strip, Bars, Line, Stat, C } from "./charts";

/* ---------------------------------------------------------------------------
   /NewSiteNewYou · the build report. Unlisted, noindex, not in the sitemap.
   Numbers come from the session's own measurements: Lighthouse 12 runs on the
   production build (mobile emulation, slow 4G, 4× CPU), the SEO crawl of all
   58 sitemap URLs, and git. Research figures cite their source.
   ------------------------------------------------------------------------- */

const TITLE_BEFORE = [14, 22, 46, 48, 50, 51, 52, 53, 53, 54, 55, 56, 57, 57, 59, 60, 60, 61, 61, 62, 63, 64, 64, 64, 64, 65, 65, 65, 65, 65, 66, 66, 67, 67, 68, 68, 68, 68, 69, 69, 69, 71, 71, 73, 74, 74, 75, 75, 76, 76, 76, 77, 83, 83, 85, 85, 94, 100];
const TITLE_AFTER = [42, 43, 44, 45, 45, 45, 45, 46, 46, 47, 47, 48, 48, 48, 49, 50, 50, 51, 51, 51, 52, 52, 52, 52, 52, 52, 53, 53, 53, 53, 53, 53, 53, 53, 54, 54, 54, 54, 54, 54, 55, 55, 55, 55, 55, 55, 55, 56, 56, 56, 56, 57, 57, 58, 58, 58, 59, 59];
const DESC_BEFORE = [137, 148, 149, 152, 154, 155, 155, 158, 163, 164, 165, 167, 168, 170, 171, 177, 177, 178, 180, 184, 189, 190, 191, 193, 193, 194, 194, 197, 198, 200, 200, 201, 201, 202, 205, 206, 210, 212, 214, 217, 221, 222, 223, 223, 227, 228, 228, 228, 228, 230, 230, 236, 238, 240, 240, 242, 243, 254];
const DESC_AFTER = [143, 146, 148, 149, 150, 150, 150, 150, 152, 152, 152, 153, 153, 153, 154, 154, 154, 154, 154, 154, 154, 154, 154, 154, 154, 155, 155, 155, 155, 155, 155, 155, 155, 155, 156, 156, 156, 156, 156, 156, 156, 156, 157, 157, 157, 157, 157, 157, 157, 157, 157, 157, 157, 157, 158, 158, 158, 158];

const WORDS: [string, number][] = [["/services/kitchen-remodeling", 1154], ["/services/bathroom-remodeling", 1049], ["/services/house-painting", 1012], ["/services/home-additions", 1011], ["/services", 1003], ["/services/rental-turnovers", 960], ["/services/home-remodeling", 955], ["/services/cabinet-painting", 941], ["/guides/kitchen-remodel-cost-auburn-al", 927], ["/services/flooring-installation", 914], ["/guides/remodeling-permits-auburn-opelika-al", 882], ["/services/home-repairs", 868], ["/service-areas/auburn-al", 842], ["/", 824], ["/guides/check-contractor-license-alabama", 814], ["/guides/rental-turnover-checklist-auburn-al", 802], ["/service-areas/opelika-al", 795], ["/service-areas/lee-county-al", 776], ["/service-areas/smiths-station-al", 775], ["/cost-estimator", 736], ["/guides/bathroom-remodel-cost-auburn-al", 735], ["/guides/paint-or-replace-kitchen-cabinets", 685], ["/about", 546], ["/guides", 496], ["/privacy-policy", 489], ["/service-areas", 414], ["/reviews", 374], ["/our-work", 369], ["/contact", 356]];

const COMMITS = [
  { d: "Sep 23 10:46", h: "ab4f637", n: 4625, s: "Site built: Next.js 16, bilingual EN/ES, WebGL blueprint-to-paint hero, 6 pages" },
  { d: "Sep 23 12:24", h: "2b68771", n: 87, s: "Remodeled-home slideshow behind the 3D layer; real logo in nav, footer, favicon" },
  { d: "Sep 25 19:26", h: "999f1cb", n: 3018, s: "9 service pages, 4 area pages, cost estimator, lead pipeline, tracking, llms.txt" },
  { d: "Sep 25 19:26", h: "0de36c7", n: 2501, s: "Growth playbook: research, SEO, Google Ads builds, 90-day plan (docs/growth)" },
  { d: "Sep 25 18:52", h: "87c0158", n: 252, s: "Business refocus: painting first, rental turns, honest proof, Web3Forms" },
  { d: "Sep 25 19:03", h: "8a1c1ba", n: 164, s: "SEO pass: titles, descriptions, canonical origin, keyword H1, structured data" },
  { d: "Sep 25 19:15", h: "ea988cf", n: 151, s: "UX pass: fast hero, 3-step estimate form, verifiable proof, a11y 100" },
  { d: "Sep 25 19:16", h: "0227048", n: 15, s: "Font diet, phone in mid-size nav, headline spacing fix" },
  { d: "Sep 25 22:40", h: "489c898", n: 550, s: "Second pass: promise block, Spanish WhatsApp-first, review page, this report" },
  { d: "Sep 25 23:50", h: "de759f9", n: 293, s: "Third pass: home-page prices, share cards, price catalog schema" },
  { d: "Sep 29", h: "7c1a9d1", n: 3096, s: "Fourth pass: 7 guides, question hub, facts page, entity graph, AI-search layer" },
];

function H2({ k, children }: { k: string; children: React.ReactNode }) {
  return <div className="mb-8"><span className="eyebrow text-amber mb-3">{k}</span><h2 className="d h-md text-bone max-w-[18ch]">{children}</h2></div>;
}
function Src({ href, children }: { href: string; children: React.ReactNode }) {
  return <a className="underline decoration-bone/30 underline-offset-2 hover:text-amber" href={href} target="_blank" rel="noopener">{children}</a>;
}
const Chip = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[.66rem] tracking-[.1em] uppercase ${ok ? "bg-[#199e70]/20 text-[#8ee0bd]" : "bg-[#c98500]/20 text-[#f3c86b]"}`}><span aria-hidden="true">{ok ? "✓" : "!"}</span>{children}</span>
);

export default function ChangelogPage() {
  return (
    <main className="pb-24">
      {/* hero */}
      <header className="relative overflow-clip border-b border-hairline-d">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_10%,rgba(227,147,30,.16),transparent_55%)]" />
        <div className="shell relative pt-16 pb-14 md:pt-24 md:pb-20 grid gap-5">
          <div className="flex items-center gap-3"><Image src="/brand/mark-on-dark.png" alt="" width={62} height={28} className="h-7 w-auto" /><span className="font-mono text-[.7rem] tracking-[.16em] uppercase text-bone/60">Z Construction & Remodeling · build report · Sep 23–25, 2026</span></div>
          <h1 className="d d-lg max-w-[14ch]">New site, <span className="text-amber">new you.</span></h1>
          <p className="lede text-bone/85">Everything that changed, measured. From a six-page brochure to a 66-page bilingual lead engine: what was built, what it fixed, what the numbers say, and what still needs the owner.</p>
          <p className="font-mono text-[.7rem] tracking-[.12em] uppercase text-bone/50">Unlisted page · not indexed · not in the sitemap</p>
        </div>
      </header>

      {/* KPI row */}
      <section className="shell py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Lighthouse · mobile home" value="87" delta="from 51" note="Performance score, slow 4G, 4× CPU" />
          <Stat label="Main-thread blocking" value="10 ms" delta="from 1,393 ms" note="Total Blocking Time on a phone" />
          <Stat label="Pages built" value="66" delta="from 14" note="29 indexable pages × 2 languages" />
          <Stat label="Accessibility" value="100" delta="from 91" note="Every page audited: 100" />
          <Stat label="SEO titles in range" value="58 / 58" delta="from 17 / 58" note="≤ 60 characters, unique" />
          <Stat label="JavaScript on a phone" value="278 KB" delta="from 516 KB" note="Three.js stays on desktop only" />
          <Stat label="Estimate form" value="3 steps" delta="from 9 fields at once" note="Contact details asked last" />
          <Stat label="Lines of code & docs" value="8,800" note="14 commits, 3 days" />
        </div>
      </section>

      {/* PERFORMANCE */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="01 · Speed">The hero stopped costing leads</H2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Lighthouse scores, home page on a phone" sub="Before: the WebGL scene compiled shaders and built a 120×74 mesh before React could hydrate, so the hero text sat invisible for seconds. After: no WebGL on phones, deferred to idle on desktop, hero animated in CSS."
            table={{ head: ["Category", "Before", "After"], rows: [["Performance", 51, 87], ["Accessibility", 91, 100], ["Best practices", 100, 100], ["SEO", 100, 100]] }}>
            <GroupedBars rows={[{ label: "Performance", values: [51, 87] }, { label: "Accessibility", values: [91, 100] }, { label: "Best practices", values: [100, 100] }, { label: "SEO", values: [100, 100] }]} series={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} max={108} />
            <Legend items={[{ label: "Before (Sep 25, 13:55)", color: C.dim }, { label: "After (Sep 25, 19:16)", color: C.s1 }]} />
          </Card>
          <Card title="Load milestones on a phone, seconds" sub="Time to Interactive halved. Blocking time went from 1.39 s to 0.01 s. Largest Contentful Paint is the simulated slow-4G figure; on LTE it is well under that."
            table={{ head: ["Metric", "Before (s)", "After (s)"], rows: [["Largest Contentful Paint", 6.4, 4.1], ["Time to Interactive", 8.1, 4.1], ["Speed Index", 3.3, 1.1], ["Total Blocking Time", 1.39, 0.01], ["First Contentful Paint", 0.9, 1.1]] }}>
            <Dumbbell rows={[{ label: "Interactive", a: 8.1, b: 4.1 }, { label: "Largest paint", a: 6.4, b: 4.1 }, { label: "Speed index", a: 3.3, b: 1.1 }, { label: "Blocking time", a: 1.39, b: 0.01 }]} unit="s" max={9} />
            <Legend items={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} />
          </Card>
          <Card title="Bytes shipped to a phone, KB" sub="The 900 KB (uncompressed) Three.js chunk no longer downloads on phones or low-end devices. Images are unchanged; they were already responsive."
            table={{ head: ["Resource", "Before", "After"], rows: [["JavaScript", 516, 278], ["Images", 170, 170], ["Everything", 874, 620]] }}>
            <GroupedBars rows={[{ label: "JavaScript", values: [516, 278] }, { label: "Images", values: [170, 170] }, { label: "Everything", values: [874, 620] }]} series={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} unit=" KB" max={950} />
            <Legend items={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} />
          </Card>
          <Card title="Main-thread work, milliseconds" sub="Script evaluation was 2.8 of the 3.4 seconds. The desktop keeps the full scene and still scores 100."
            table={{ head: ["Measure", "Before", "After"], rows: [["Main-thread work", 3411, 613], ["Script boot-up", 2889, 211], ["Preloaded font files", 6, 4]] }}>
            <GroupedBars rows={[{ label: "Main-thread work", values: [3411, 613] }, { label: "Script boot-up", values: [2889, 211] }]} series={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} unit=" ms" max={3700} />
            <Legend items={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} />
          </Card>
        </div>
        <p className="mt-6 max-w-[70ch] text-step--1 text-bone/70">Why it matters: Google found 53% of mobile visits are abandoned when a page takes over three seconds (<Src href="https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/">Think with Google, 2016</Src>), and a Deloitte/Google study of 30 million sessions put a 0.1 s improvement at +7% lead-gen page views (<Src href="https://web.dev/case-studies/milliseconds-make-millions">web.dev</Src>).</p>
      </section>

      {/* SEO */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="02 · Search">Every one of 58 URLs, tuned by hand</H2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Title tag length, all 58 pages" sub="Google truncates titles past about 60 characters. Before, 41 of 58 ran long (one hit 100). After, every title is 42–59 characters and unique."
            table={{ head: ["", "Shortest", "Longest", "Average", "Over 60"], rows: [["Before", 14, 100, 65, 41], ["After", 42, 59, 52, 0]] }}>
            <Strip groups={[{ label: "Before", values: TITLE_BEFORE, color: C.dim }, { label: "After", values: TITLE_AFTER, color: C.s1 }]} min={0} max={105} band={[30, 60]} unit=" chars" />
          </Card>
          <Card title="Meta description length, all 58 pages" sub="Descriptions get cut around 155–160 characters. Before, 50 of 58 were too long. After, all sit in the 143–158 band, each written for its page in its language."
            table={{ head: ["", "Shortest", "Longest", "Average", "Over 158"], rows: [["Before", 137, 254, 198, 50], ["After", 143, 158, 154, 0]] }}>
            <Strip groups={[{ label: "Before", values: DESC_BEFORE, color: C.dim }, { label: "After", values: DESC_AFTER, color: C.s1 }]} min={100} max={260} band={[120, 158]} unit=" chars" />
          </Card>
          <Card title="Site map: pages per language" sub="From six brochure pages to a page for every service, every town and the questions people search before hiring. Each has a Spanish twin with its own slug, linked by hreflang."
            table={{ head: ["Section", "Pages (per language)"], rows: [["Service landing pages", 9], ["Guides & cost guides", 6], ["Core pages", 10], ["Service-area pages", 4]] }}>
            <Bars rows={[{ label: "Service pages", value: 9 }, { label: "Guides", value: 6 }, { label: "Core pages", value: 10 }, { label: "Area pages", value: 4 }]} max={11} labelW={140} />
          </Card>
          <Card title="Words of real copy per English page" sub="Google rewards pages that answer the question. Service and guide pages carry 700–1,150 words each, written for Auburn and Opelika, not templated.">
            <Bars rows={WORDS.map(([l, v]) => ({ label: l, value: v }))} max={1250} labelW={300} w={720} />
          </Card>
        </div>
        <ul className="mt-6 grid gap-2 md:grid-cols-2 text-step--1 text-bone/80 max-w-[90ch]">
          <li><b className="text-bone">Canonical origin fixed.</b> Canonicals, hreflang and the sitemap pointed at zconstructionremodeling.com, a domain that isn't registered. They now follow the live domain automatically.</li>
          <li><b className="text-bone">One URL per page.</b> /Services and /es/Servicios used to render as duplicates; they now redirect to the lowercase page.</li>
          <li><b className="text-bone">Keyword H1s.</b> The home page's H1 is "Painting & remodeling contractor in Auburn & Opelika, AL"; the brand tagline keeps its big type as a paragraph.</li>
          <li><b className="text-bone">Structured data on every page.</b> LocalBusiness + WebSite in the layout; Service, FAQ, Article, Breadcrumb, AboutPage, ContactPage, ImageGallery and ItemList where they apply. 15–21 schema types per page.</li>
          <li><b className="text-bone">Crawl verified.</b> All 58 URLs: 200 OK, one H1, alt text on every image, reciprocal hreflang, no broken links, no orphans.</li>
          <li><b className="text-bone">AI search included.</b> robots.txt welcomes OpenAI, Perplexity, Claude and Bing crawlers; /llms.txt describes the business and prices in plain text.</li>
        </ul>
      </section>

      {/* CONVERSION */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="03 · Leads">Built the way the evidence says home-service sites convert</H2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Paid-search conversion rate by home-service category" sub="LocaliQ's 2025 benchmark across 3,211 campaigns: painting leads convert at four times the rate of general contracting. The site routes painting intent to its own pages and forms." table={{ head: ["Category", "Conversion rate", "Cost per lead"], rows: [["Handyman", "13.45%", "—"], ["Painting", "10.80%", "$138"], ["All home services", "7.33%", "—"], ["General contractors", "2.61%", "$166"]] }}>
            <Bars rows={[{ label: "Handyman", value: 13.45 }, { label: "Painting", value: 10.8 }, { label: "All home services", value: 7.33 }, { label: "General contractors", value: 2.61 }]} unit="%" emphasis={1} color={C.s2} max={15} labelW={170} />
            <p className="mt-2 text-[.78rem] text-bone/60">Source: <Src href="https://localiq.com/blog/home-services-search-advertising-benchmarks/">LocaliQ Home Services Search Benchmarks 2025</Src></p>
          </Card>
          <Card title="Chance a mobile visitor bounces as load time grows" sub="Google's model, 2017: the probability of a bounce rises 32% by three seconds and more than doubles by ten. This is why the phone gets a lighter page." table={{ head: ["Load time", "Bounce probability increase"], rows: [["1 s → 3 s", "+32%"], ["1 s → 5 s", "+90%"], ["1 s → 6 s", "+106%"], ["1 s → 10 s", "+123%"]] }}>
            <Line points={[{ x: 1, y: 0, label: "1 s" }, { x: 3, y: 32, label: "3 s" }, { x: 5, y: 90, label: "5 s" }, { x: 6, y: 106, label: "6 s" }, { x: 10, y: 123, label: "10 s" }]} unit="%" xLabel="page load time" />
            <p className="mt-2 text-[.78rem] text-bone/60">Source: <Src href="https://business.google.com/ca-en/think/marketing-strategies/mobile-page-speed-new-industry-benchmarks/">Think with Google</Src></p>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          {[
            ["Calls first", "Calls convert at about 46% in home services versus 1.7% for web forms, so the phone number sits in the header and a call bar stays pinned on phones. On the Spanish site WhatsApp comes first: 54% of Hispanic adults use it.", "https://pcnanswers.com/calls-vs-forms-leads-study/"],
            ["Three-step estimate form", "Multi-step forms lifted conversion 59% to 743% in the published tests, with contact details asked last. The form asks project, then details, then name and phone. Same data reaches the owner.", "https://ventureharbour.com/multi-step-lead-forms-get-300-conversions/"],
            ["Verifiable proof", "Consumers trust linked, third-party reviews over isolated claims. The 5.0 rating links to the Angi profile; the About page links to Alabama's HBLB license search; the sample reviews and invented counters are gone.", "https://www.nngroup.com/articles/trustworthy-design/"],
          ].map(([h, p, u]) => <div key={h} className="rounded-card border border-hairline-d bg-bone/[.03] p-5"><h3 className="d text-step-1 leading-none mb-3">{h}</h3><p className="text-step--1 text-bone/80">{p}</p><p className="mt-3 text-[.78rem] text-bone/55"><Src href={u}>Source</Src></p></div>)}
        </div>
      </section>

      {/* COMPETITORS */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="04 · The field">Fourteen local competitors, researched site by site</H2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Google reviews, top local competitors" sub="Reviews are the moat. E&S leads on volume but its newest review is about ten months old; Five Star's own testimonials page is empty. Ten to twenty reviews a year would be top-tier here, which is what the new review page is for." table={{ head: ["Business", "Rating", "Reviews", "Source"], rows: [["E&S Contractor Painting", "4.9", 114, "Birdeye"], ["CertaPro Columbus-Auburn", "4.7", 90, "5starbusiness"], ["JL Remodeling & Home Repair", "4.8", 44, "Trustindex"], ["Paintnovations (Houzz)", "5.0", 23, "Houzz"], ["Priceless Painting Plus (Yelp)", "4.8", 10, "Yelp"], ["Z Construction (Angi + HomeAdvisor)", "5.0", 2, "Angi"]] }}>
            <Bars rows={[{ label: "E&S Contractor Painting", value: 114 }, { label: "CertaPro Columbus-Auburn", value: 90 }, { label: "JL Remodeling", value: 44 }, { label: "Paintnovations", value: 23 }, { label: "Priceless Painting Plus", value: 10 }, { label: "Z Construction", value: 2 }]} emphasis={5} color={C.s2} max={125} labelW={200} />
            <p className="mt-2 text-[.78rem] text-bone/60">Sources: <Src href="https://reviews.birdeye.com/es-contractor-painting-company-inc-166337522062091">Birdeye</Src>, <Src href="https://reputation.5starbusiness.com/certapro-painters-of-columbus-ga-and-auburn-al-163885549365496">5starbusiness</Src>, <Src href="https://www.trustindex.io/reviews/jlremodelingauburn.com">Trustindex</Src>, Houzz, Yelp. Directory pages blocked automated fetches, so some counts come from aggregators.</p>
          </Card>
          <Card title="What nobody else in the market offers" sub="Checked on every competitor site on Sep 25, 2026. Four lanes are wide open, and this site is already in three of them." table={{ head: ["Signal", "Competitors offering it (of 14)", "Z Construction"], rows: [["Prices shown on the site", "0", "Yes: every service page, guides, estimator"], ["Spanish-language pages", "0", "Yes: full site"], ["Landlord / rental-turnover page", "0 (one handyman mentions absentee owners)", "Yes"], ["License number printed", "1 (Guerrero)", "As soon as the owner provides it"], ["Financing offered", "2 (Priceless, Floor Coverings Intl.)", "Not yet"], ["Written warranty stated", "1 concrete (Five Star, 2-year)", "Not yet: decide and publish"]] }}>
            <Bars rows={[{ label: "Prices shown on site", value: 0 }, { label: "Spanish pages", value: 0 }, { label: "Landlord page", value: 0 }, { label: "License number shown", value: 1 }, { label: "Concrete warranty", value: 1 }, { label: "Financing", value: 2 }, { label: "Online booking / estimate form", value: 3 }, { label: "City pages", value: 3 }]} unit=" of 14" max={14} labelW={220} color={C.s3} />
          </Card>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6">
            <h3 className="d text-step-1 leading-none mb-4">Copy angles the research supports</h3>
            <ul className="grid gap-2 text-step--1 text-bone/85 list-disc pl-5">
              <li><b className="text-bone">"Real Auburn prices, before you call."</b> CertaPro's pricing section literally reads "less than you might expect"; no competitor shows a dollar figure.</li>
              <li><b className="text-bone">"Hablamos español: presupuestos en su idioma."</b> A search for "pintores Auburn AL" returns only English directory pages.</li>
              <li><b className="text-bone">"Opelika-based, a 334 number."</b> CertaPro answers on a Georgia 706 number; Priceless and Paintnovations are Columbus firms with no Auburn page.</li>
              <li><b className="text-bone">"One crew: paint, cabinets and floors."</b> The painters don't lay LVP; the flooring franchise doesn't paint; JL doesn't refinish cabinets.</li>
              <li><b className="text-bone">Rental turns for landlords</b>: no painter in the market has a landlord page; the university's August lease crunch is unserved.</li>
            </ul>
          </div>
          <div className="rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6">
            <h3 className="d text-step-1 leading-none mb-4">Worth copying from them</h3>
            <ul className="grid gap-2 text-step--1 text-bone/85 list-disc pl-5">
              <li><Src href="https://certapro.com/columbus-auburn/auburn-house-painters/">CertaPro</Src>: a 3,500-word Auburn page with owner bios; an estimate form with photo upload and a date picker.</li>
              <li><Src href="https://www.fivestarpainting.com/auburn-opelika/residential/cabinet-painting/">Five Star</Src>: a concrete "10% off, up to $500" offer and a plain two-year warranty.</li>
              <li><Src href="https://www.pricelesspaintingplus.com/">Priceless Painting Plus</Src>: Hearth financing link. Financing raised close rates from 38% to 49% in ACCA data.</li>
              <li><Src href="https://jlremodelingauburn.com/">JL Remodeling</Src>: Google review widget with the count on the home page; an annual maintenance plan upsell.</li>
              <li>Fresh Coat's franchise "3-3-3 pledge" (answer in 3 minutes, quote in 3 days, start in 3 weeks): a promise format worth adapting to what Luis can actually keep.</li>
            </ul>
          </div>
        </div>
        <p className="mt-4 text-[.78rem] text-bone/55">Full competitor profiles, keyword gaps by town, and review snippets are in the session research; the growth playbook in <code className="font-mono">docs/growth/</code> carries the market analysis.</p>
      </section>

      {/* TIMELINE */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="05 · Timeline">Twelve commits, two days</H2>
        <Card title="Lines added per commit" sub="Merge and deploy-trigger commits omitted. The two large bars are the landing-page build and the growth playbook." table={{ head: ["When", "Commit", "Lines", "What"], rows: COMMITS.map((c) => [c.d, c.h, c.n, c.s]) }}>
          <Bars rows={COMMITS.map((c) => ({ label: `${c.d} · ${c.h}`, value: c.n }))} max={5000} labelW={170} color={C.s3} />
        </Card>
        <ol className="mt-6 grid gap-3">
          {COMMITS.map((c) => <li key={c.h} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-6 py-3 border-b border-hairline-d"><span className="font-mono text-[.7rem] tracking-[.1em] uppercase text-bone/55">{c.d} · {c.h}</span><span className="text-step--1 text-bone/85">{c.s}</span></li>)}
        </ol>
      </section>

      {/* INTEGRATIONS + BUDGET */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="06 · Integrations & budget">Wired and waiting for IDs</H2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="What $500 a month buys, estimated leads" sub="Angi Pro is the current spend. Google Local Services Ads charge per lead (painting median $48) and carry the Google Verified badge; standard Search costs about $138 per painting lead. Angi's lead count must come from the owner's dashboard; the industry median is not published." table={{ head: ["Channel", "Cost per lead", "Leads from $500"], rows: [["Google Local Services Ads", "$48 (median, painting)", "≈ 10"], ["Google Search ads", "$138 (avg, painting)", "≈ 3.6"], ["Angi Pro (current)", "check the Angi dashboard", "?"]] }}>
            <Bars rows={[{ label: "Local Services Ads", value: 10.4 }, { label: "Google Search", value: 3.6 }]} unit=" leads" max={12} labelW={170} color={C.s4} />
            <p className="mt-2 text-[.78rem] text-bone/60">Sources: <Src href="https://localiq.com/blog/home-services-search-advertising-benchmarks/">LocaliQ 2025</Src>; LSA median via 99 Calls / Web Tonic 2026 (in the growth playbook).</p>
          </Card>
          <div className="rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6">
            <h3 className="d text-step-1 leading-none mb-4">Cancelling Angi Pro, without a lead gap</h3>
            <ol className="grid gap-3 text-step--1 text-bone/85 list-decimal pl-5">
              <li><b className="text-bone">Keep the free Angi profile.</b> The reviews and the 5.0 rating live there and the site links to it. Only the paid lead subscription goes.</li>
              <li><b className="text-bone">Pull the numbers first.</b> In the Angi Pro dashboard: leads, cost per lead and jobs won over the last 90 days. That is the bar the replacement has to beat.</li>
              <li><b className="text-bone">Turn on Google Local Services Ads</b> (background check + license/insurance upload, 1–3 weeks). Set a $500 monthly budget and answer every lead within minutes.</li>
              <li><b className="text-bone">Verify the Google Business Profile</b> and text every finished customer the site's review page (<code className="font-mono text-[.75rem]">/review</code>, Spanish <code className="font-mono text-[.75rem]">/es/deje-su-resena</code>) the same day. Reviews are the asset Angi was renting you; this builds them on Google, where the leads are free.</li>
              <li><b className="text-bone">Cancel Angi Pro the month LSA leads arrive</b>, then revisit at 90 days with the site's own form and call counts.</li>
            </ol>
          </div>
        </div>
        <div className="mt-4 rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6">
          <h3 className="d text-step-1 leading-none mb-4">Tracking already in the code, one environment variable each</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-step--1">
            {[
              ["Google Ads conversions", "NEXT_PUBLIC_GOOGLE_ADS_ID + lead / call labels", "Form leads, call-button clicks and a website-call forwarding number. Enhanced conversions on."],
              ["Google Analytics 4", "NEXT_PUBLIC_GA4_ID", "Page views, form starts and steps, estimator use, contact clicks, language."],
              ["Meta pixel", "NEXT_PUBLIC_META_PIXEL_ID", "Lead events with hashed email/phone for matching."],
              ["Microsoft Ads (Bing)", "NEXT_PUBLIC_MS_UET_ID", "Same events; Bing is where many older homeowners search."],
              ["CallRail", "NEXT_PUBLIC_CALLRAIL_SCRIPT", "Per-source phone numbers if call attribution needs to go deeper than Google's."],
              ["Lead delivery", "RESEND_API_KEY · Twilio · LEAD_WEBHOOK_URL · NEXT_PUBLIC_WEB3FORMS_KEY", "Email, text alert, CRM/Sheet row, and a free email fallback. Every lead carries its source, keyword and landing page."],
            ].map(([h, env, p]) => <div key={h} className="rounded-[10px] border border-hairline-d p-4"><b className="block text-bone">{h}</b><code className="block mt-1 font-mono text-[.66rem] text-amber-bright break-words">{env}</code><p className="mt-2 text-bone/75">{p}</p></div>)}
          </div>
          <p className="mt-4 text-[.8rem] text-bone/60">Set these in Vercel → Project → Settings → Environment Variables, then redeploy. Nothing loads until its ID exists, so the site stays fast until each channel is switched on.</p>
        </div>
      </section>

      {/* CHECKLIST */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="07 · Launch">What's done, and what needs the owner</H2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            [true, "Site merged, deployed on Vercel, auto-deploys from GitHub main"],
            [true, "66 pages, English and Spanish, hreflang, sitemap, robots, llms.txt"],
            [true, "Lighthouse: mobile 87 / desktop 100 / accessibility 100"],
            [true, "3-step estimate form, WhatsApp, click-to-call bar, Spanish path WhatsApp-first"],
            [true, "Honest proof only: no invented counters, no sample reviews, license placeholder hidden"],
            [true, "Review-request page to text customers after every job: /review and /es/deje-su-resena (one tap to Google, Angi, HomeAdvisor)"],
            [true, "Prices on the home page, branded share cards on every page, price catalog in structured data"],
            [true, "13 bilingual guides, 60-question hub, company facts page, connected schema graph, llms-full.txt, IndexNow"],
            [true, "Funnel: project call-to-action on every guide and hub lane, 2-field quick lead, prefilled WhatsApp, lean client bundles"],
            [false, "Free Telegram lead alert: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in Vercel (5 minutes, see docs/growth/07)"],
            [false, "Confirm EPA lead-safe (RRP) firm certification: required to paint pre-1978 homes, and a selling point once confirmed"],
            [false, "Owner name for guide authorship (BRAND.owner in content.ts) and an optional headshot"],
            [false, "Yelp + Bing Places + Apple Business profiles with identical name/phone (ChatGPT's local cards come mostly from Yelp)"],
            [false, "Search Console + Bing Webmaster verification tokens and an INDEXNOW_KEY in Vercel; run the monthly AI prompt test (docs/growth/ai-visibility-prompts.csv)"],
            [true, "Publicly live: Vercel Deployment Protection off, no noindex"],
            [true, "Domain connected: www.zconstructionauburn.com (canonicals, sitemap, hreflang and share cards follow it automatically)"],
            [true, "Real phone and WhatsApp: (334) 319-2126"],
            [true, "Real email: zefreino@zconstructionauburn.com"],
            [false, "Alabama HBLB license number (src/lib/brand.ts)"],
            [true, "Web3Forms key live: every form and quick request emails the owner"],
            [false, "Google Business Profile verified; paste the review link"],
            [true, "Angi profile linked (rating tile, review page, schema sameAs)"],
            [false, "Direct link to the HomeAdvisor profile"],
            [true, "Real job photos on the site: bathroom before/afters, vanities, deck, dock and fence, with accurate descriptions in English and Spanish"],
            [false, "More real photos: the owner and crew, painting, kitchens, flooring and additions (stock photos still fill those categories; real photos lifted conversion 45–100% in published tests)"],
            [false, "Google Ads / GA4 / Meta IDs in Vercel; apply for Local Services Ads"],
            [false, "Decide: Auburn or Opelika as the listed city (the research report shows an Opelika address)"],
            [false, "Decide on a written workmanship warranty to publish (only one competitor states one; Five Star offers two years)"],
            [false, "Optional: a financing partner such as Hearth or Wisetack for kitchen and bath jobs (two competitors offer it)"],
          ].map(([ok, t]) => <div key={String(t)} className="flex items-start gap-3 rounded-[10px] border border-hairline-d p-4 text-step--1"><Chip ok={ok as boolean}>{ok ? "done" : "owner"}</Chip><span className="text-bone/85">{t as string}</span></div>)}
        </div>
      </section>

      {/* THIRD PASS */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="08 · Third pass">Prices up front, and a card worth forwarding</H2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat label="Competitors publishing prices" value="0 / 14" note="Checked Sep 25, 2026" />
          <Stat label="Price ranges on the home page" value="4" delta="from 0" note="Painting, cabinets, bath, kitchen" />
          <Stat label="Priced offers in structured data" value="27" delta="from 9" note="Every estimator tier, as an OfferCatalog" />
          <Stat label="Branded share cards" value="66" delta="from 0" note="One per page, in its language" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="What a forwarded link looks like now" sub="Before, a shared page previewed as an anonymous stock photo. Now every page renders its own card: company, page title, phone, a job photo, in English or Spanish. Referrals in the Spanish-speaking community travel by WhatsApp (Pew 2024: 54% of Hispanic adults use it, against 29% of all U.S. adults), and the preview is the first impression.">
            <div className="grid gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/api/og?t=Pintura%20de%20casas%20en%20Auburn%20y%20Opelika&k=Pintura%20y%20remodelaci%C3%B3n%20de%20casas%20en%20Auburn%20y%20Opelika%2C%20AL&p=houseWhite&l=es" alt="Spanish share card: house painting in Auburn and Opelika" width={1200} height={630} className="w-full h-auto rounded-[10px] border border-hairline-d" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/api/og?t=Kitchen%20Remodeling%20in%20Auburn%20%26%20Opelika&k=Painting%20%26%20remodeling%20contractor%20in%20Auburn%20%26%20Opelika%2C%20AL&p=kitchen1" alt="English share card: kitchen remodeling in Auburn and Opelika" width={1200} height={630} className="w-full h-auto rounded-[10px] border border-hairline-d" loading="lazy" />
            </div>
            <p className="mt-2 text-[.78rem] text-bone/60">Source: <Src href="https://www.pewresearch.org/internet/2024/01/31/americans-social-media-use/">Pew Research, Americans' Social Media Use, Jan 2024</Src>.</p>
          </Card>
          <div className="grid gap-4">
            <Card title="Pricing moved to the home page" sub="Four ranges a homeowner asks about first (whole-interior paint, cabinet painting, a full hall bath, a full kitchen) now sit right under the services, each linking to its page. The numbers come from the one table that drives the estimator, the service pages and the guides, so they can never disagree. The headline says the quiet part: nobody else here publishes a price." table={{ head: ["Tile", "Range (mid-range finish)", "Links to"], rows: [["Interior painting, whole interior", "$6k–$11k", "/services/house-painting"], ["Cabinet painting, average kitchen", "$5k–$8k", "/services/cabinet-painting"], ["Bathroom, full hall bath", "$14k–$26k", "/services/bathroom-remodeling"], ["Kitchen, full remodel, same layout", "$25k–$45k", "/services/kitchen-remodeling"]] }}>
              <Bars rows={[{ label: "Kitchen, full", value: 45 }, { label: "Bathroom, full", value: 26 }, { label: "Interior paint", value: 11 }, { label: "Cabinets", value: 8 }]} unit="k" max={50} labelW={150} color={C.s3} />
              <p className="mt-2 text-[.78rem] text-bone/60">Top of each range, in thousands of dollars. Calibrate against signed jobs every January (src/lib/estimator.ts).</p>
            </Card>
            <div className="rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6">
              <h3 className="d text-step-1 leading-none mb-4">Also in this pass</h3>
              <ul className="grid gap-2.5 text-step--1 text-bone/85">
                <li><b className="text-bone">Price catalog for search and AI answers.</b> The estimator's 27 tiers are now an <code className="font-mono text-[.75rem]">OfferCatalog</code> with min and max prices, so "how much does a bathroom remodel cost in Auburn" can be answered with this site's range and a link.</li>
                <li><b className="text-bone">Share cards allowed for social crawlers.</b> <code className="font-mono text-[.75rem]">/api/og</code> is the one API path robots.txt lets through; the rest stays blocked.</li>
                <li><b className="text-bone">Fonts bundled for the cards.</b> Barlow and Barlow Condensed (open license) ship in the repo so the card renders the same on Vercel as on a laptop.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOURTH PASS: SEO + AI SEARCH */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="09 · Search & AI answers">Built to be the answer, in both languages</H2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat label="Guides" value="13" delta="from 6" note="1,100–1,450 words each, EN + ES, sourced" />
          <Stat label="Questions answered" value="60 × 2" delta="new" note="/questions · /es/preguntas-frecuentes" />
          <Stat label="Indexable pages" value="76" delta="from 58" note="Every page has its Spanish twin" />
          <Stat label="Schema problems" value="0" note="Graph audit over every sitemap URL" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="AI-search readiness, Z vs the local field" sub="Checked Sep 29, 2026 on each competitor's homepage, robots.txt and llms.txt. One point each: AI crawlers allowed, business schema, published prices, Spanish pages, answer/FAQ content, visible update dates. Web searches for 'pintores en Auburn Alabama' and 'contratista que hable español Auburn' surfaced no contractor at all: the Spanish lane is empty." table={{ head: ["Site", "Score (of 6)", "Prices", "Spanish"], rows: [["Z Construction", 6, "Yes", "Yes"], ["Five Star Painting", 3, "No", "No"], ["JL Remodeling", 3, "No", "No"], ["C&A Painting", 3, "No", "No"], ["Old Number One Customs", 3, "Inner pages", "No"], ["E&S (alt site)", 2, "No", "No"], ["First Choice Painting", 2, "No", "No"], ["Kelleys Painting", 2, "No", "No"], ["E&S Contractor Painting", 1, "No", "No"], ["CertaPro", 1, "No", "No"], ["Alabama Construction Pros", 1, "No", "No"], ["TLC Design/Build", 1, "No", "No"], ["Triple B", 0, "No", "No"]] }}>
            <Bars rows={[{ label: "Z Construction", value: 6 }, { label: "Five Star", value: 3 }, { label: "JL Remodeling", value: 3 }, { label: "C&A Painting", value: 3 }, { label: "Old Number One", value: 3 }, { label: "First Choice", value: 2 }, { label: "Kelleys", value: 2 }, { label: "E&S", value: 1 }, { label: "CertaPro", value: 1 }, { label: "TLC", value: 1 }]} max={6} emphasis={0} labelW={150} />
            <p className="mt-2 text-[.78rem] text-bone/60">Full method and sources: docs/growth/09-ai-visibility.md.</p>
          </Card>
          <div className="rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6">
            <h3 className="d text-step-1 leading-none mb-4">What changed</h3>
            <ul className="grid gap-2.5 text-step--1 text-bone/85">
              <li><b className="text-bone">Company facts page</b> (/company-facts, /es/datos-de-la-empresa): the one dated, quotable source of truth about the business, which the business schema points to.</li>
              <li><b className="text-bone">Question hub for first-timers and landlords</b>: 60 questions per language in two lanes (homeowners; landlords, property managers, realtors, HOAs), a live accent-proof filter, a 22-term glossary and an Auburn-vs-Opelika table of permit offices, utilities, historic districts and Alabama 811, each checked against an official site.</li>
              <li><b className="text-bone">Seven new guides</b>: painter pricing, when to paint an exterior in Alabama, builder-grade upgrades, tub-to-shower, LVP vs laminate vs tile in humidity, hiring a Spanish-speaking contractor (written Spanish-first), student-condo upkeep. Every price comes from the estimator table; every outside figure links its source.</li>
              <li><b className="text-bone">One connected entity graph</b>: one WebPage per URL tied to its breadcrumb, main entity, the business and its other-language twin; tiered offers on services; citations and word counts on guides.</li>
              <li><b className="text-bone">Crawl layer</b>: image sitemap with honest lastmod (and a fix for invalid XML), language-only hreflang, /llms-full.txt, IndexNow, Search Console and Bing verification hooks.</li>
              <li><b className="text-bone">Bugs that fed crawlers wrong facts, fixed</b>: the star counter read "0.0" in the HTML; Spanish town pages showed English drive times; the license-search link pointed at a dead state server; the Opelika permit address was wrong (710, not 700, Fox Trail).</li>
              <li><b className="text-bone">Lighthouse</b>: SEO, accessibility and best practices 100 on every page tested; mobile performance 84–90 in the slow-4G lab.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FIFTH PASS: SALES FUNNEL */}
      <section className="shell py-10 md:py-14 border-t border-hairline-d">
        <H2 k="10 · Sales funnel">Every answer now ends in a next step</H2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Stat label="Ways to become a lead" value="4" delta="from 2" note="Number, WhatsApp, full form, call" />
          <Stat label="Fields for the quickest lead" value="2" delta="from 9" note="Name + phone; page becomes the message" />
          <Stat label="JavaScript on every page" value="215 KB" delta="from 327 KB" note="Copy deck no longer shipped to browsers" />
          <Stat label="Paid texting needed" value="$0" note="Free Telegram alert; owner texts back by hand" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Lighthouse mobile performance, before and after" sub="The nav and forms were importing the whole bilingual copy deck and every page's text (about 170 KB compressed) into the browser. They now get only the strings they need from the server. Slow-4G, 4× CPU lab test." table={{ head: ["Page", "Before", "After"], rows: [["Home", 85, 90], ["Question hub", 84, 92], ["Guide: painter pricing", 89, 93]] }}>
            <GroupedBars rows={[{ label: "Home", values: [85, 90] }, { label: "Question hub", values: [84, 92] }, { label: "Painter pricing guide", values: [89, 93] }]} series={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} max={108} />
            <Legend items={[{ label: "Before", color: C.dim }, { label: "After", color: C.s1 }]} />
          </Card>
          <div className="rounded-card border border-hairline-d bg-bone/[.03] p-5 md:p-6">
            <h3 className="d text-step-1 leading-none mb-4">The funnel, stage by stage</h3>
            <ol className="grid gap-2.5 text-step--1 text-bone/85 list-decimal pl-5">
              <li><b className="text-bone">Find:</b> 15 guides, 60-question hub, town and service pages, company facts (EN + ES).</li>
              <li><b className="text-bone">Trust:</b> dates, sources, license lookup, owner-on-every-job promise, native Spanish.</li>
              <li><b className="text-bone">Price it:</b> a real range on every page; the estimator in three taps.</li>
              <li><b className="text-bone">Act:</b> a project block ends every guide and each hub lane, with a slim prompt mid-guide: leave a number, WhatsApp with a prefilled first line naming the service, the full form pre-set with the page as context, or call. The estimator result now has the two-field box too.</li>
              <li><b className="text-bone">Respond:</b> quick requests are graded by the estimate they carry (a priced $25k–$45k kitchen now grades B, not C), and a free Telegram alert puts the lead on the owner's phone in seconds.</li>
              <li><b className="text-bone">Measure:</b> quick_lead_start, quick_lead, whatsapp_click, estimator and form events feed a GA4 funnel; setup and weekly review in docs/growth/10-seo-sales-funnel.md.</li>
            </ol>
            <p className="mt-4 text-[.8rem] text-bone/60">Also: two new guides (deck repair vs replace; addition vs moving), and the share-card function no longer bundles the whole project.</p>
          </div>
        </div>
      </section>

      <footer className="shell pt-10 border-t border-hairline-d text-[.78rem] text-bone/50">
        <p>Measurements: Lighthouse 12.x on the production build, mobile emulation (Moto G Power class, slow 4G, 4× CPU slowdown) and desktop preset; SEO crawl script over every sitemap URL; git history. Research figures link to their sources above and in <code className="font-mono">docs/growth/</code>. <Link className="underline" href="/">Back to the site</Link>.</p>
      </footer>
    </main>
  );
}
