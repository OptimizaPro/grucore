# Z Construction & Remodeling — Growth System

Built September 2026. This folder is the operating manual for turning the website into Z Construction's main source of jobs. It covers the market research, the positioning, the SEO and AI-search plan, the paid ads builds (Google, Local Services, Meta, Microsoft, ChatGPT), the lead pipeline that's now wired into the site, and a 90-day plan with budgets.

## The one-paragraph version

Z is entering a market where **no remodeler has more than about 30 Google reviews, nobody markets in Spanish, nobody owns rental turnovers, and only one out-of-town firm is running modern search ads.** The plan is to own four positions nobody else holds: **(1) the bilingual contractor** for Lee County's fast-growing Hispanic community, **(2) "we build it, then we finish it"** (construction + painting under one crew), **(3) the landlord's contractor** for Auburn's student-rental market, and **(4) the honest-pricing contractor** that publishes real ranges. The website now has the pages, tracking and lead pipeline to capture that demand; the playbooks below say how to drive it.

## What's in this folder

| File | What it's for |
|---|---|
| [01-market-and-competitors.md](01-market-and-competitors.md) | Who the competition is, what they're weak at, and the market numbers |
| [02-positioning-and-offers.md](02-positioning-and-offers.md) | The four positions, messaging in English and Spanish, offers to launch |
| [03-seo-local-and-ai-search.md](03-seo-local-and-ai-search.md) | Google Business Profile, reviews, citations, content calendar, the Spanish and Korean community plans, and how to get recommended by ChatGPT, Google AI and Copilot |
| [04-google-ads.md](04-google-ads.md) + [google-ads/](google-ads/) | Ready-to-import Google Ads campaigns (English + Spanish), keywords, ads, negatives, settings, and conversion tracking |
| [05-chatgpt-and-ai-ads.md](05-chatgpt-and-ai-ads.md) | ChatGPT Ads (self-serve since May 2026), Copilot, Google AI Mode: what to do now vs. later |
| [06-lsa-meta-and-other-channels.md](06-lsa-meta-and-other-channels.md) | Google Local Services Ads, Facebook/Instagram, Nextdoor, direct mail, realtors, property managers, referrals |
| [07-lead-system.md](07-lead-system.md) | How the lead pipeline works, how to turn each piece on, speed-to-lead scripts (EN/ES), follow-up cadence, review requests, CRM |
| [08-budget-and-90-day-plan.md](08-budget-and-90-day-plan.md) | Budgets at $1,500 / $3,000 / $5,000 a month, KPIs, week-by-week 90-day plan |
| [09-ai-visibility.md](09-ai-visibility.md) + [prompts](ai-visibility-prompts.csv) + [scorecard](ai-visibility-scorecard.csv) | How ChatGPT, Google AI, Copilot and Perplexity pick local businesses (sourced), the company-facts page, a competitor AI-readiness benchmark, the monthly 30-prompt test (EN + ES) and off-site actions ranked |
| [10-seo-sales-funnel.md](10-seo-sales-funnel.md) | The funnel from search to booked walkthrough: which page does which job, the conversion blocks, the GA4 events and funnel exploration, leak-by-leak fixes, and a weekly review |
| [research/](research/) | The full sourced research (competitors, market & SEO, paid channels) with links |

## What was built into the website

- **9 service landing pages** in English and native Spanish (kitchen, bathroom, additions, remodeling, painting, cabinet painting, flooring, repairs, rental turnovers), each with pricing ranges, what's included, cost drivers, FAQs, an on-page quote form, and Service + FAQ structured data. These double as Google Ads landing pages.
- **4 town pages** (Auburn, Opelika, Smiths Station & Beauregard, rural Lee County) built on real local facts — permit offices, historic districts, housing stock — not city-name swaps.
- **13+ guides** in both languages (costs, permits, licensing, painting, flooring, tub-to-shower, builder-grade upgrades, rental turns, student condos, hiring a Spanish-speaking contractor…), written answer-first with sources, each ending in a project call-to-action.
- **Question hub** (`/questions`, `/es/preguntas-frecuentes`): 60 plain-language answers per language for first-timers and for landlords/property managers, a glossary and an Auburn vs Opelika local-facts table.
- **Interactive cost estimator** (`/cost-estimator`, `/es/calculadora-de-costos`) that hands the visitor's choices to the quote form, so leads arrive pre-qualified.
- **Lead pipeline**: lead scoring (A/B/C), marketing attribution on every lead (Google Ads, organic, ChatGPT/AI assistant, Facebook, GBP…), owner email with one-tap call/text/WhatsApp, free Telegram alert (SMS optional), bilingual auto-reply to the homeowner, webhook to any CRM or Google Sheet, Meta Conversions API.
- **Tracking**: GA4, Google Ads (with enhanced conversions and call tracking), Meta Pixel, Microsoft UET, CallRail and optional Google Tag Manager — each switched on by setting one environment variable.
- **WhatsApp everywhere**: mobile action bar, contact page, service pages, thank-you page; "Hablamos español" band on every English page.
- **Technical SEO**: hreflang en-US/es-US/x-default on every URL, localized slugs, breadcrumbs, sitemap with all 58 URLs, robots.txt that welcomes AI search crawlers, `/llms.txt` fact sheet, privacy policy with SMS terms (required for A2P 10DLC texting and ad platforms). Fixed a bug where English pages rendered the wrong language-switch link for search engines.

## The owner's top 10 (nothing else matters as much)

1. **Replace the placeholders** in `src/lib/content.ts` (search `TODO`): real phone, WhatsApp number, email, **HBLB license number**, Google review link, and real reviews. Don't launch ads before this.
2. **Confirm the Alabama Home Builders Licensure Board license.** Required for any residential job over $10,000 (additions, kitchens, most baths). Display the number everywhere once it's in.
3. **Google Business Profile**: primary category *Remodeler*, secondaries, all services, 20 service areas, WhatsApp chat, "Hablamos español" line, 30+ photos. → [03](03-seo-local-and-ai-search.md)
4. **Review engine**: ask every customer, same words, same day the job ends. Target 30 Google reviews in 90 days — that alone beats every remodeler in Lee County.
5. **Claim Yelp, Bing Places and Apple Business Connect.** ChatGPT's local answers come almost entirely from Yelp; Copilot uses Bing Places; Siri uses Apple.
6. **Turn on the lead pipeline**: Resend (email) + Twilio (SMS alert) + a CRM or Google Sheet webhook. → [07](07-lead-system.md)
7. **Answer every lead in under 5 minutes.** It's the single biggest lever on close rate, and after Oct 1, 2026 Google bills LSA for missed calls.
8. **Launch Google Local Services Ads** (pay per lead) and the **Google Search** campaigns from `google-ads/`. → [04](04-google-ads.md), [06](06-lsa-meta-and-other-channels.md)
9. **Replace stock photos with real job photos** — before/after of every project, with the town in the caption. Real photos convert and give the town pages their proof.
10. **Spanish community outreach**: St. Michael's Spanish Mass bulletin, Fiesta Supermarket and tiendas, the "Latinos unidos Opelika y Auburn" Facebook group, WhatsApp. → [03](03-seo-local-and-ai-search.md#the-spanish-speaking-community-playbook)
