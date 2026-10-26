# 09 · AI visibility (ChatGPT, Google AI Overviews / AI Mode, Gemini, Copilot, Perplexity)

Research date: September 29, 2026. This page covers how each assistant picks the local businesses it names, what's built into the site for that, how Z compares with local competitors, the monthly test that measures it, and the off-site work ranked by impact. It builds on the AI section of [03](03-seo-local-and-ai-search.md). Where the two disagree, this page is newer.

**The short version.** For "who should I hire" questions, the assistants mostly repeat what they find in business listings: Google Business Profile, Yelp and Bing. The website decides whether they can back up that answer with facts (prices, Spanish, licensing, area) and whether they cite Z's pages for cost and permit questions. The site side is now ahead of every local competitor we checked. The listings side is still empty, so Z shows up nowhere yet.

---

## 1. How each assistant finds local businesses (sourced)

| Assistant | Mechanism | Source |
|---|---|---|
| **ChatGPT search** | Crawls with **OAI-SearchBot**. Blocking it removes a site from search answers. GPTBot is training only, and ChatGPT-User is a fetch a user triggers. Robots.txt changes take about 24 hours. | [OpenAI bots doc](https://developers.openai.com/api/docs/bots) (primary) |
| ChatGPT business cards | In 2,880 prompts, **Yelp grounded 95.8%** of structured business cards and Foursquare about 0%. BrightLocal found Yelp as a source in 80% of ChatGPT local answers. OpenAI hasn't named its local data provider. | [Steady Demand, Aug 2026](https://www.steadydemand.com/chatgpts-local-results-arent-coming-from-foursquare-and-probably-never-really-were/), [BrightLocal](https://www.brightlocal.com/resources/ai-directory-sources/) (studies) |
| ChatGPT web citations | About 87% of early SearchGPT citations matched Bing's top organic results. That makes Bing indexing (and IndexNow) a leading input. | Seer analysis, cited secondhand (study) |
| **Google AI Overviews / AI Mode / Gemini** | No special requirements: a page only needs to be indexed and eligible for a snippet. Google says no "AI text files" or special markup are needed. AI Mode and AI Overviews use **query fan-out**: one question is split into several related searches, so self-contained answers to each sub-question are what get pulled. `nosnippet` / `max-snippet` apply to these features. AI traffic is counted in the Search Console "Web" report. | [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) (primary) |
| Google (practical) | Focus on fundamentals, keep Business Profile data accurate, and make structured data match the visible text. | [Google Search Central blog, May 2025](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search) (primary) |
| **Microsoft Copilot / Bing** | Bing Webmaster Tools has an **AI Performance report** (Feb 2026). It shows citation counts per URL and the "grounding queries" behind Copilot and Bing AI answers. Bing's guidance: clear headings, tables, FAQ sections, data with cited sources, regular updates, and IndexNow. A June 2026 update added Intents, Topics, Citation Share and Compare. | [Bing blog, Feb 2026](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview), [Bing blog, Jun 2026](https://blogs.bing.com/search/June-2026/New-AI-Visibility-Insights-in-Bing-Webmaster-Tools-Intents-Topics-Citation-Share-Compare) (primary) |
| Bing and schema | Microsoft's Fabrice Canel: schema markup helps Bing's LLMs understand content. | [Search Engine Land, Mar 2025](https://searchengineland.com/microsoft-bing-copilot-use-schema-for-its-llms-453455) (vendor statement, reported) |
| **Perplexity** | PerplexityBot indexes and respects robots.txt. Perplexity-User is user-triggered. Neither is used for training. Reddit is a very large share of what it cites. | [Perplexity bots doc](https://docs.perplexity.ai/guides/bots) (primary), [Semrush](https://www.semrush.com/blog/most-cited-domains-ai/) (study) |
| **Siri / Apple Maps** | Apple Business (renamed from Business Connect in April 2026) feeds Maps, Siri and Safari. Apple primary docs not checked. | [9to5Mac, Sep 2026](https://9to5mac.com/2026/09/24/square-now-integrates-with-apple-business-to-improve-maps-listings/) (third-party) |
| **What gets cited, locally** | Across 1.9M local AI citations: Google Business Profile 28.6%, Yelp 9.5%, Facebook 2.2%, Instagram 1.9%, Reddit 1.8%, BBB 0.3%, Angi 0.2%. About 93% of cited domains were individual business websites. | [BrightLocal](https://www.brightlocal.com/resources/ai-directory-sources/) (study) |
| **Freshness** | AI-cited pages are 25.7% fresher (by publish date) than Google's organic results, and ChatGPT skews newest. | [Ahrefs](https://ahrefs.com/blog/seo-statistics/) (study, read via summary) |
| **Spanish queries** | In Google AI Overviews, Spanish prompts cite social content about 1.4× as often as English prompts, with TikTok at 16% (5× the English rate). ChatGPT cites less social in Spanish. The data isn't contractor-specific. | [Profound](https://www.tryprofound.com/blog/how-query-language-reshapes-ai-citations) (study) |
| **Content edits** | Content changes such as adding sources, statistics and quotations raised visibility in generative answers by up to 40% in controlled tests. | [Aggarwal et al., GEO, KDD 2024](https://arxiv.org/abs/2311.09735) (paper, abstract read) |

### Myths vs. evidence

| Claim | Verdict | What we did |
|---|---|---|
| "llms.txt gets you into ChatGPT" | **No evidence.** Google's Mueller says no AI service claims to use it, and Illyes says Google won't. One log study found 97% of llms.txt files were never requested by any bot. ([SEL](https://searchengineland.com/google-says-normal-seo-works-for-ranking-in-ai-overviews-and-llms-txt-wont-be-used-459422), [SER](https://www.seroundtable.com/google-ai-llms-txt-39607.html), [SEL log study](https://searchengineland.com/does-llms-txt-matter-467740)) | Kept it, since it's generated and costs nothing, but put the facts on a real HTML page instead. |
| "FAQ schema gets rich results / AI citations" | The FAQ rich result is gone: restricted in 2023 and no longer shown since May 2026 ([Google](https://developers.google.com/search/docs/appearance/structured-data/faqpage)). Bing says schema helps its LLMs understand pages. | Kept FAQPage because it's harmless and matches visible Q&As. What gets cited is the visible question headings and answers. |
| "Add `speakable`" | Still beta: news only, US English, Google Home ([Google](https://developers.google.com/search/docs/appearance/structured-data/speakable)). | Not added. |
| "Block Google-Extended to stay out of AI Overviews" | Google-Extended covers Gemini training and grounding. AI Overviews run on Googlebot. (Third-party consensus, not primary-verified.) | Allowed. Nothing to change. |
| "Self-served star ratings help" | Google ignores self-served LocalBusiness review stars. | No AggregateRating. Ratings stated in plain text only, as on the rest of the site. |

---

## 2. What's on the site now (this pass, September 2026)

| Change | Why (mechanism above) |
|---|---|
| **Company facts page**: `/company-facts` and `/es/datos-de-la-empresa`. It has a key-facts table (legal name, aliases, founded, base, area, languages, hours, contact, estimates, license and insurance, rating), a 9-row service price table, and 8 question-style sections that each open with the company name. It shows a visible "Facts verified" date and a changelog, and it's linked from every footer and in the sitemap with hreflang. | Gives assistants one quotable, dated page to confirm facts. Each section answers one sub-question an assistant is likely to split a query into, and is written to stand on its own. |
| **Schema**: the LocalBusiness node's `mainEntityOfPage` points to the facts page. The facts page is an `AboutPage` whose `mainEntity` is the business, with `dateModified` and `lastReviewed`. Added `knowsAbout`. `areaServed` now lists all 9 towns plus Lee County, each tied to its Wikipedia page, plus a GeoCircle of about 40 km for the "about 30 minutes from Auburn" rule. | Entity consistency. Bing says schema helps. The structured data matches the visible text. |
| **Service pages**: the at-a-glance box now also says Contractor (full name, Auburn AL), Service area and Languages, plus a visible "Updated" date. Price tiles render as one text string (`$6.5k–$11k`) instead of split text nodes. | Key facts stated in plain text on every service page, and freshness is visible. |
| **Town pages**: a bold opening passage now says who works there, how far it is from the Auburn base, the languages, and headline 2026 prices (generated from the estimator). A visible "Updated" date was added. **Bug fixed:** Spanish pages showed "10–15 minutes" in English. | A self-contained answer per town for queries like "painter in Opelika". |
| **Home page bug fixed:** the star-rating counter was server-rendered as **"0.0 Star rating"**. Crawlers and no-JS readers saw zero stars. The server now renders the real value, and the count-up only runs for counters below the fold. | Crawlers read the server HTML. |
| **Footer blurb** (every page, both languages) is now a complete sentence: "Z Construction & Remodeling LLC is a family-owned painting and remodeling contractor based in Auburn, Alabama, working in English and Spanish across Auburn, Opelika and Lee County." | The company name, what it does, where, and the languages in one quotable line on every page. |
| **llms.txt / llms-full.txt**: facts and the verified date come first, with a link to the facts page in both languages and a Spanish summary. llms-full.txt opens with the complete facts page in both languages. | Low priority (see myths), but kept accurate and dated. |

Already in place before this pass: server rendering, a robots.txt allow-list for OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot, Claude, Google-Extended, Bingbot and Applebot-Extended, IndexNow, a sitemap with an honest lastmod, hreflang, answer-first guides with sources, and published prices.

**When facts change:** edit `src/lib/content.ts` (BRAND), bump `FACTS_VERIFIED` in `src/lib/content-facts.ts`, add a `FACTS_LOG` line, deploy, then run `npm run indexnow`.

---

## 3. Competitor benchmark (AI-search readiness)

Checked September 29, 2026 by fetching each homepage, robots.txt and /llms.txt with an OAI-SearchBot user agent. No site blocked that user agent. The table records only what was loaded. JSON-LD was read from the homepage only, and inner pages weren't crawled.

Score: 1 point each for crawlers allowed, LocalBusiness-type schema, published service prices, Spanish content, answer/FAQ content, and dates visible on the page (6 max). llms.txt is shown but not scored (see myths).

| Site | AI crawlers | llms.txt | LocalBusiness schema | Prices | Spanish | Answer / FAQ | Visible dates | Score |
|---|---|---|---|---|---|---|---|---|
| **Z Construction & Remodeling** | ✅ explicit allow-list | ✅ | ✅ GeneralContractor + Service/Offer graph | ✅ every service, 27 tiers | ✅ full site, localized slugs | ✅ 13 guides, FAQs, facts page | ✅ guides, services, towns, facts | **6/6** |
| Five Star Painting Auburn-Opelika (franchise) | ✅ explicit allow | ✅ | ✅ HousePainter | ❌ | ❌ | ✅ FAQPage | ❌ | 3/6 |
| JL Remodeling & Home Repair | ✅ default | ❌ | ✅ HomeAndConstructionBusiness | ❌ | ❌ | ✅ FAQPage | ❌ (in meta only) | 3/6 |
| C&A Painting Co | ✅ default | ❌ | ✅ + OfferCatalog, AggregateRating | ❌ | ❌ | ✅ FAQPage | ❌ | 3/6 |
| Old Number One Customs | ✅ (lists AI bots, no block) | ❌ | ✅ | ✅ kitchen/bath ranges on inner pages (per [research/competitors.md](research/competitors.md); none on homepage) | ❌ | ❌ | ❌ | 3/6 |
| E&S Painting alt site (painterinauburn.com) | ✅ default | ✅ (says "Auburn, California") | ✅ | ❌ | ❌ | ❌ | ❌ (in schema only) | 2/6 |
| First Choice Painting & Repairs | ✅ default | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ (blank dates) | 2/6 |
| Kelleys Painting Services | ✅ explicit opt-in | ✅ | ✅ ProfessionalService | ❌ | ❌ | ❌ | ❌ | 2/6 |
| E&S Contractor Painting (main site) | ✅ (no robots.txt) | ❌ | ❌ none | ❌ | ❌ | ❌ | ❌ | 1/6 |
| CertaPro Columbus-Auburn (franchise) | ✅ default | ✅ (corporate) | ❌ on local homepage | ❌ promo only | ❌ | ❌ | ❌ (meta only) | 1/6 |
| Alabama Construction Pros (Montgomery) | ✅ default | ✅ (auto-generated) | ❌ Organization only | ❌ | ❌ | ❌ | ❌ | 1/6 |
| TLC Design/Build (Letlow) | ✅ default | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (2020 meta) | 1/6 |
| Triple B Construction | ⚠️ robots.txt is a corrupt RTF file | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0/6 |
| Guerrero Construction | No website found (directory mentions only) | | | | | | | n/a |

### Who the assistants' web layer surfaces today

These are web searches run September 29, 2026 (the same retrieval layer the assistants use). Z doesn't appear yet because the site isn't publicly indexable.

- **"painters Auburn AL"**: CertaPro, Houzz, HomeAdvisor, BBB, Yelp, Five Star, YellowPages.
- **"best house painters Auburn Alabama"**: Houzz, CertaPro, Angi, HomeAdvisor, Yelp and Five Star. Named inside those pages: E&S, Fresh Coat, True Tone, Paintworks and others.
- **"kitchen remodeling Opelika AL"**: Angi, HomeAdvisor, BBB, Yelp, plus homeremodelingopelikaal.com, oncbuilds.com and alabamaconstructionpros.com.
- **"pintores en Auburn Alabama"**: Wikipedia pages and CertaPro's English page. **No Spanish-language contractor.**
- **"contratista que hable español Auburn Alabama"**: immigration-lawyer directories and job boards. **No contractor at all.**
- **"remodelación de baños Opelika"**: Houzz, BBB, and English contractor pages.

### Gaps to widen first

1. **Spanish.** Zero contractors surface for Spanish queries. Every Spanish page Z publishes, plus Spanish Google reviews and a Spanish GBP description, faces no competition. Spanish AI Overviews over-cite social content, so short Spanish before/after videos (Facebook and TikTok) are the second channel.
2. **Published prices.** No competitor publishes service prices on the pages checked. Assistants asked "how much does X cost in Auburn" need a local source, and Z's guides and facts page are the only one.
3. **Dated, visible, fresh content.** No competitor shows a date on the page. Keep `CONTENT_UPDATED` and guide dates honest, and publish 2 pieces a month (see [03](03-seo-local-and-ai-search.md)).
4. **Directories.** This is where Z is behind: competitors surface through Houzz, Angi, HomeAdvisor, Yelp and BBB, and E&S has about 114 Google reviews. See the ranked list in section 5.

---

## 4. The monthly AI-visibility test (about 90 minutes, first Monday of each month)

**Prompts:** [ai-visibility-prompts.csv](ai-visibility-prompts.csv) has 30 fixed prompts (18 English, 12 Spanish). They span painting, cabinets, kitchen, bath, flooring, rentals and general work × Auburn, Opelika, Smiths Station and Lee County × the intents recommend, cost, Spanish-speaking, landlord, permits, trust and brand. Never edit a prompt, or month-to-month numbers stop being comparable. Add new ones with new IDs.

**Where and how:**

| Assistant | How to run it |
|---|---|
| ChatGPT | chatgpt.com, **logged out** (or a Temporary Chat with memory off), search enabled. Open the Sources panel and record the domains. |
| Google AI Mode | google.com/aimode in an incognito window. Record the cited links. |
| Google AI Overviews | A regular Google search of the same prompt in incognito. Record "no AI Overview" if none appears. |
| Gemini | gemini.google.com, new chat. |
| Copilot | copilot.microsoft.com, new chat. |
| Perplexity | perplexity.ai, logged out. Record the sources. |

Start a new chat for every prompt. If you're testing from outside Lee County, the prompts already name the town, so don't add anything. Screenshot every answer that names Z or a competitor.

**Scoring** (one row per assistant × prompt in [ai-visibility-scorecard.csv](ai-visibility-scorecard.csv)):

| Score | Meaning |
|---|---|
| 0 | Z not mentioned |
| 1 | Z mentioned but not recommended (e.g. listed without a link, or wrong facts) |
| 2 | Z recommended in a list, or a Z page/profile cited as a source |
| 3 | Z named first or as the main answer, facts correct |

Also record `z_facts_correct`: phone, languages, area and prices match the [facts page](../../src/lib/content-facts.ts). A wrong fact means a listing somewhere disagrees, so fix it at the source.

**Monthly KPIs:** (a) **share of answers**: prompts scoring ≥2 ÷ prompts run, per assistant and per language; (b) **average score**; (c) **Z pages cited**: which URLs get cited, to spot which pages earn their keep.

**Also check each month:**
- **Bing Webmaster Tools → AI Performance**: Copilot citations per URL and the grounding queries. This is the only first-party AI citation report available. Verify the site first (`BING_SITE_VERIFICATION` env var).
- **Search Console → Performance → Web**: AI Overviews and AI Mode clicks are counted here.
- **Lead emails** labeled "AI Assistant" (ChatGPT, Perplexity, Gemini and Copilot referrals are already tagged by the lead pipeline).

**Targets:** month 3 after launch, share of answers ≥20% on ES prompts (no competition there) and ≥1 cited Z page per assistant for cost prompts. Month 6: ≥40% ES and ≥15% EN.

---

## 5. Off-site actions, ranked by impact

The website is done. These are the inputs the assistants actually use for "who should I hire" questions.

| # | Action | Which assistant it moves | Why |
|---|---|---|---|
| 0 | **Replace the placeholder phone, email and WhatsApp** in `src/lib/content.ts` before anything below. | All | Every listing must match the site exactly. A 555 number on the site and a real one on Yelp splits the business into two entities. |
| 1 | **Google Business Profile**: complete it, add the Spanish description line, services with prices, photos, and review requests every job. | AI Overviews, AI Mode, Gemini, Maps | GBP is the single biggest local AI citation source (28.6%, BrightLocal). Google says to keep Business Profile data accurate. |
| 2 | **Yelp**: claim it, use the same name/phone/site, add "Spanish-speaking" and services, respond to requests fast. Don't ask for Yelp reviews (against Yelp policy). | ChatGPT | 95.8% of ChatGPT business cards (Steady Demand) and 80% of ChatGPT local answers (BrightLocal) are grounded in Yelp. |
| 3 | **Bing Places + Bing Webmaster Tools**: claim Bing Places (it can import from GBP), verify the site, submit the sitemap, run `npm run indexnow` after every deploy. | Copilot, ChatGPT web results | Copilot grounds via Bing search. ChatGPT citations track Bing's top results. The AI Performance report lives here. |
| 4 | **Apple Business**: claim the listing with the same details. | Siri, Apple Maps, Safari | Few competitors will do it. It takes 20 minutes. |
| 5 | **Facebook page** (Spanish and English posts, reviews on) and **short Spanish before/after videos** (Facebook Reels, TikTok). | Copilot (shows Facebook reviews), Spanish AI Overviews | Facebook is 2.2% of local AI citations. Spanish AI Overviews cite social content about 1.4× as often as English ones (TikTok 16%). |
| 6 | **Angi, HomeAdvisor, Houzz, BBB**: identical name/phone/site and "Spanish-speaking" in every profile. Link each in `BRAND.profiles` (schema `sameAs`). | Perplexity, web layer of all assistants | These are exactly the pages that surface today for "painters Auburn AL" (section 3). |
| 7 | **Reddit r/auburn and Nextdoor**: genuine, disclosed answers when someone asks for a painter, remodeler or "someone who speaks Spanish". No fake accounts. | Perplexity especially, ChatGPT | Reddit is a large share of Perplexity's citations. ChatGPT's Reddit share has swung sharply, so don't rely on it alone. |
| 8 | **Local press**: OA News, Opelika Observer, Auburn Villager, WTVM/WRBL, and Spanish-language outlets or church bulletins (St. Michael, St. Mary's Hispanic ministry). Pitch "first bilingual remodeler in Lee County" or a free Spanish homeowner workshop on permits. | All (third-party corroboration) | Assistants cite businesses that third parties vouch for. A business's own site is rarely enough for "best". |
| 9 | **Reviews that name the service and town**, e.g. "painted our kitchen cabinets in Opelika". Spanish reviews from Spanish-speaking customers. | All | Review text is what assistants summarize when they explain why they're recommending a business. |

---

## Not done, on purpose

- **No AggregateRating/Review schema**, invented or self-served, and no "best in Auburn" copy. Google ignores self-served stars, and the rating only restates the existing 5.0 on Angi and HomeAdvisor.
- **No `speakable`** (beta, news only).
- **No ChatGPT "shopping"/merchant feed**: it's for products, not local services.
- **No separate AI-only pages or cloaking**: assistants see what people see.
