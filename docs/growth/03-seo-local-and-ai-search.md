# 03 · SEO, local search & AI search

How Z gets found for free — in Google's map pack, in regular results, in Spanish, and when someone asks ChatGPT, Google's AI, Copilot or Siri "who's a good remodeler in Auburn?". Sources and evidence: [research/market-and-seo.md](research/market-and-seo.md).

---

## What decides local rankings in 2026

1. **Google Business Profile (GBP)**: primary category, completeness, services, photos, activity.
2. **Reviews**: count, *recency* (steady flow beats bursts), rating, and what they mention (service + town).
3. **Proximity** to the searcher (you can't change this — Auburn is home base, so expect strongest map visibility in Auburn and Opelika).
4. **Website**: a dedicated page per service ✅, relevant town pages ✅, consistent name/phone/address ✅.
5. **Citations & mentions**: the same business details on the major directories, plus local news and "best of" lists. These matter more now because AI assistants lean on them.

The website side is done. Items 1, 2 and 5 are the owner's work, below.

---

## Google Business Profile — setup checklist

- [ ] **Name**: exactly "Z Construction & Remodeling" (no keywords stuffed in; it gets profiles suspended).
- [ ] **Primary category: Remodeler.** Test 60–90 days before changing.
- [ ] **Secondary categories** (in order): Kitchen remodeler · Bathroom remodeler · General contractor · Painter · Flooring contractor · Handyman *(only if you want small jobs)* · Deck builder / Tile contractor / Drywall contractor *(only what you truly do)*.
- [ ] **Services**: add every predefined service that fits, plus custom ones with short descriptions: kitchen remodeling, bathroom remodeling, tub-to-shower conversion, home additions, interior painting, exterior painting, cabinet painting & refinishing, LVP/tile flooring, drywall repair, wood rot & trim repair, deck & porch repair, rental turnover / make-ready, **Spanish-speaking estimates (Estimados en español)**.
- [ ] **Service areas** (up to 20): Auburn, Opelika, Smiths Station, Beauregard, Loachapoka, Waverly, Notasulga, Salem, Lee County AL, Phenix City *(if you'll take jobs there)*, Tuskegee, Valley, Lanett, Dadeville / Lake Martin *(only if you'll go)*. **Not** Columbus/LaGrange GA until licensed in Georgia.
- [ ] **Hide the street address** if you work from home (service-area business).
- [ ] **Description** (750 chars): English, with one Spanish sentence. Example:
  > Family-owned, licensed and insured construction, remodeling and painting contractor based in Auburn, Alabama. Kitchens, bathrooms, home additions, whole-home remodels, cabinet painting, flooring, repairs and rental turnovers for Auburn, Opelika and Lee County. The same crew builds and finishes your project, the owner is on every job, and every estimate is written and itemized. **Hablamos español — presupuestos gratis en español.**
- [ ] **Chat**: Edit profile → Contact → Chat → **WhatsApp**.
- [ ] **Website link** with tracking: `https://www.zconstructionauburn.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp` (the site's lead attribution will then show "Google Business Profile" as the source).
- [ ] **Booking link**: `/contact` (also feeds LSA booking).
- [ ] **Photos**: 30+ at launch (logo, cover, team, truck, before/after); then 5–10 per week while jobs are active. Photos now sort by recency.
- [ ] **Products** (optional but they show prominently): Cabinet Refresh Package, Tub-to-Shower Conversion, Rental Turnover Package, Interior Painting (per room) — each with a photo and "from" price.
- [ ] **Posts**: 1–2 per week. Alternate English and Spanish, or short bilingual captions. Mix: project spotlight (with town), seasonal tip, offer, guide link.
- [ ] If the **language assistance / Spanish** attribute shows up in your dashboard, turn it on (it isn't confirmed for remodelers yet).

> **Google Q&A is gone** (replaced by the AI "Ask Maps" feature, which answers from your profile, reviews, photos and **website**). That's why every service and town page now carries FAQs.

---

## The review engine

**Goal:** 30 Google reviews in 90 days (beats every remodeler in Lee County) → 75–100 in 12 months → 125+ in 24 months.

**Rules (Google tightened them in April 2026):** ask *every* customer the same way; no incentives, no "only ask the happy ones" (gating), no staff quotas, no kiosks. Reply to every review within 24–48 hours, in the reviewer's language.

**When:** the day of the final walkthrough, while they're happy and looking at the finished room. Reminder once after 3 days.

**Text / WhatsApp — English**
> Hi {first name}, this is {owner} with Z Construction. Thank you for trusting us with your {project}. If you have two minutes, a Google review helps other families in {town} find us: {review link}. Mentioning the project and your town helps the most. Thank you!

**Texto / WhatsApp — Español**
> Hola {nombre}, le saluda {dueño} de Z Construction. Gracias por confiarnos su {proyecto}. Si tiene dos minutos, una reseña en Google ayuda mucho a que otras familias de {ciudad} nos encuentren: {enlace}. Si puede, escríbala en español y mencione el trabajo y su ciudad. ¡Muchas gracias!

**Spanish reviews are a moat.** No competitor has any. They help Spanish searchers and tell every visitor Z really serves the community.

**Yelp is different:** Yelp discourages asking for reviews. Just add "Find us on Yelp" to emails and invoices, and respond fast to Yelp messages (Yelp's "Request a Quote" now appears inside ChatGPT).

---

## Citations — where Z needs a listing (same name, phone, website everywhere)

**Tier 1 — do in the first two weeks**
1. Google Business Profile
2. **Bing Places for Business** (feeds Microsoft Copilot and Bing, which ChatGPT search also draws on)
3. **Apple Business Connect** (Apple Maps, Siri, Apple Intelligence)
4. **Yelp** — ChatGPT's local business answers are grounded almost entirely in Yelp (OpenAI licensed Yelp data in July 2026)
5. **Facebook Page** (the review source Bing shows most)
6. Nextdoor Business
7. BBB (Central & South Alabama)
8. Houzz (where the premium competitors win — photos + reviews)
9. Angi (free profile; no paid contract needed)

**Tier 2 — month 1–2:** HomeAdvisor, Porch, Thumbtack (profile), BuildZoom, Foursquare, Data Axle, Neustar Localeze, Yellow Pages, Superpages, Manta, MapQuest, Chamber of Commerce.com, LinkedIn, Instagram, YouTube.

**Local & trade:** Auburn Chamber of Commerce, Opelika Chamber, Home Builders Association in the area (if a member), Lee County Association of REALTORS affiliate directory, the HBLB license record (make sure its name/address match).

**Spanish / Hispanic:** AlabamaLatino.com directorio (covers Auburn), Hispanos Emprendedores directory, Georgia Hispanic Chamber (only if expanding into Columbus), parish bulletins/directories (St. Michael, St. Mary's Opelika), "Latinos unidos Opelika y Auburn" Facebook group.

**When a profile exists, add its URL to `BRAND.profiles` in `src/lib/content.ts`.** It goes into the site's structured data (`sameAs`), which tells Google and AI assistants these listings are all the same business.

---

## Website SEO — what's live and what to add

### Live now
| Asset | URLs / where |
|---|---|
| 9 service pages × 2 languages | `/services/…`, `/es/servicios/…`, each with a "Guides for this project" block |
| 4 town pages × 2 | `/service-areas/…`, `/es/zonas-de-servicio/…`, each linking its most relevant guides |
| 13 guides × 2 | `/guides/…`, `/es/guias/…`: answer-first, dated, reading time, in-text links to services/guides/towns, numbered sources, "keep reading" |
| Cost estimator + price catalog | `/cost-estimator`: 27 priced tiers as an `OfferCatalog`; same numbers on the home page and service pages |
| Entity graph | One `WebPage` node per URL tied to the site, the business, its breadcrumb, its main entity (Service / Article / Place) and its other-language twin (`workTranslation`). Services carry tiered offers, languages and their guides; guides carry word count, subject, places and citations. Audited: 0 dangling references across all pages. |
| Owner E-E-A-T (switches on when filled) | `BRAND.owner` in `content.ts` → `founder` on the business and `author` on every guide |
| International | hreflang `en-US`, `en`, `es-US`, `es`, `x-default` on every page and in the sitemap; Spanish slugs; no auto-redirects |
| Crawling | XML sitemap with image entries and a `lastmod` that only moves when content does (`CONTENT_UPDATED` in `src/lib/seo.ts`); robots.txt welcoming Google, Bing and AI crawlers; `/llms.txt` + `/llms-full.txt` (the whole site as Markdown, both languages) |
| Instant re-crawl | IndexNow key at `/indexnow.txt`; `npm run indexnow` pushes every URL to Bing/Yandex after a deploy (Bing's index feeds ChatGPT search and Copilot) |
| Verification | `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` env vars render the meta tags |
| Share previews | Branded card per page per language (`/api/og`) |

**Deliberately *not* built:** "Bathroom remodel Opelika"-style service × town pages. Google's March 2026 update hit templated city pages hard. Build one only after 2–3 real projects of that service in that town — and make it a case study.

### Content calendar (2 pieces/month + 1 case study)

Every piece: an "Updated [month year]" stamp, a direct answer in the first two sentences, a table where it fits, a real local photo, links to one service page and the estimator, and a Spanish counterpart where marked.

| Month | English | Español |
|---|---|---|
| Oct 2026 | How much do painters charge in Auburn, AL? | ¿Cuánto cobra un pintor por pie cuadrado en Estados Unidos? |
| Oct | Case study #1 (real project) | Caso #1 |
| Nov | Tub-to-shower conversion: cost & timeline | Cambiar la tina por regadera: costo y tiempo |
| Nov | Upgrading a builder-grade home: the first 5 projects | Mejoras para una casa de constructor |
| Dec | Home addition vs. moving in Lee County (2026 numbers) | ¿Ampliar la casa o mudarse? |
| Dec | Case study #2 | Caso #2 |
| Jan 2027 | **Refresh all cost guides** (update estimator ranges first) | Actualizar guías de costos |
| Jan | LVP vs. laminate vs. tile in Alabama humidity | Pisos LVP, laminado o cerámica |
| Feb | Remodeling a 1970s ranch in Opelika: hidden issues & budgets | Remodelar una casa antigua |
| Feb | Parents' guide: maintaining a student condo from out of state | — |
| Mar | Why hire a bilingual contractor? | ¿Por qué contratar un contratista que habla español? |
| Mar | Financing a remodel: HELOC vs. loan vs. contractor financing | Cómo financiar una remodelación en EE. UU. |
| Apr | Rental turnover season: book now (landlord email + post) | Temporada de casas de renta |
| Apr | Storm & water damage: what to do first | Daños por tormenta: qué hacer primero |
| May | "What 25 Auburn bathroom remodels actually cost us" (original data) | Lo que de verdad costaron 25 baños en Auburn |

**Original data is the strongest content you can publish.** Google's AI guidance rewards first-hand information, and AI assistants love citing specific local numbers. Keep a simple spreadsheet of every job: type, town, sq ft, weeks, final price.

### Adding a guide or town page

Content lives in `src/lib/content-guides.ts` and `src/lib/content-areas.ts`. Add an entry (English + Spanish) and the page, sitemap, hreflang, footer links, `/llms.txt` and structured data are all generated automatically.

---

## Getting recommended by AI assistants (ChatGPT, Google AI, Copilot, Siri)

> Updated, sourced version with the competitor benchmark and the monthly test kit: [09-ai-visibility.md](09-ai-visibility.md).

| Assistant | Where its local answers come from | What Z does |
|---|---|---|
| **Google AI Overviews / AI Mode / Ask Maps / Gemini** | Google's normal index + **Business Profile** + reviews | GBP complete and active; reviews that mention service + town; FAQ-rich pages ✅ |
| **ChatGPT** | Bing-class web index + its own crawl; **business cards grounded ~96% in Yelp** | Full Yelp profile; Bing Places; crawlable pages ✅; robots.txt allows OAI-SearchBot ✅ |
| **Microsoft Copilot** | Bing index + **Bing Places** (reviews shown mostly from Facebook and Yelp) | Bing Places + Facebook reviews |
| **Perplexity** | Live web: Yelp, Google Maps data, Angi, Houzz, BBB, local news, "best of" lists | Directory profiles; local press |
| **Siri / Apple Intelligence** | **Apple Business Connect** | Claim it (58% of businesses haven't) |

**The AI-visibility checklist**
1. Identical name, phone, website, services and "Spanish-speaking" claim across GBP, Bing, Apple, Yelp, Facebook, BBB, Houzz, Angi, Nextdoor.
2. **Get onto "best of" lists and local news.** Pitch OA News (oanow.com), Opelika Observer, The Auburn Villager, WTVM/WRBL: "first bilingual remodeler in Lee County", a before/after of a historic Opelika home, a free Spanish-language homeowner workshop on hiring contractors and permits.
3. Answer-first content with dates and local specifics ✅ (guides).
4. Be genuinely helpful on Reddit (r/auburn) and Nextdoor recommendation threads — AI assistants cite them. No fake accounts.
5. **Measure monthly**: ask ChatGPT, Gemini, Copilot and Perplexity: *"best remodeling contractor in Auburn AL"*, *"who paints kitchen cabinets in Opelika"*, *"contratista que hable español en Auburn Alabama"*, *"rental turnover contractor Auburn"*. Screenshot results in a spreadsheet. Also watch the lead emails — the site now labels leads from ChatGPT, Perplexity, Gemini and Copilot as **"AI Assistant."**

---

## The Spanish-speaking community playbook

Spanish search volume in Lee County is small (Spanish city-name searches don't even autocomplete), so this niche is won **offline and on WhatsApp first**, with the Spanish site as the proof.

| Channel | Action | Cadence |
|---|---|---|
| **St. Michael the Archangel, Auburn** (Spanish Mass Sun 12:30) and **St. Mary's Opelika** Hispanic ministry | Bulletin ad; offer a free "cómo contratar un contratista / permisos" talk after Mass; sponsor a parish event | Monthly |
| **Fiesta Supermarket** (1904 Pepperell Pkwy, Opelika) and other tiendas | Bilingual flyer + business cards on the community board, with WhatsApp QR code | Refresh monthly |
| **Facebook group "Latinos unidos Opelika y Auburn"** | Helpful posts (not spam): before/after with a tip, answer questions, share the Spanish guides | Weekly |
| **WhatsApp Business** | Catalog of services with "desde" prices; quick replies in Spanish; labels for lead stages; status updates with before/after | Daily |
| **Spanish reviews** | Ask every Spanish-speaking client to review in Spanish | Every job |
| **Facebook/Instagram** | Spanish Reels (owner explaining a job in Spanish) + click-to-WhatsApp ads | 1–2/week |
| **Landlords with Spanish-speaking tenants / crews** | "Bilingual crew" is a selling point to English-speaking owners and property managers too | In every rental pitch |
| **Directories** | AlabamaLatino.com, Hispanos Emprendedores | Once |

**Tone:** usted, warm, direct, no marketing gloss (the site copy is written this way). Always about *language*, never about ethnicity or immigration. Explain contracts, permits and payments clearly — trust is the product.

## Adjacent niche: the Korean community (test, don't overbuild)

Lee County has ~3,400 Korean residents (about a quarter of Alabama's), tied to Hyundai/Kia suppliers in Opelika and Auburn. Many supplier executives rent or buy newer homes on 2–5 year assignments: move-in/move-out paint, repairs and make-ready are a natural fit. Test with a one-page flyer (English + a Korean line), the K Market (Gatewood Dr, Auburn) board, the Auburn Opelika Korean Commerce Association, and Korean-speaking realtors and relocation agents. Don't build a Korean site until the flyer produces jobs.

---

## Monthly SEO routine (2 hours)

1. Search Console: queries rising/falling, pages with impressions but low clicks (rewrite their titles). Check the "Generative AI" performance report if it's in your account.
2. GBP Insights: calls, direction requests, website clicks; post count; photo count.
3. Reviews: new this month (goal ≥ 4), average rating, all replied to.
4. AI spot-check prompts (above), screenshot results.
5. Publish the month's two content pieces + one case study; post each to GBP and Facebook.
6. Add any new directory profile URL to `BRAND.profiles`.
