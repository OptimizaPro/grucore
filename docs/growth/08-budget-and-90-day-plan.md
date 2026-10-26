# 08 · Budget, KPIs & the 90-day plan

The lead-volume numbers below are **planning estimates for Auburn**, built from 2026 industry benchmarks ([research/paid-channels.md](research/paid-channels.md) §7). Your own data will replace them within 60–90 days.

## Monthly budget scenarios (ad spend; tools are separate)

### $1,500 / month — "prove it"
| Channel | Months 1–3 | Months 4–6 | Months 7–12 |
|---|---|---|---|
| Google Local Services Ads | $600 | $650 | $700 |
| Google Search (Brand, Kitchen & Bath, Painting & Cabinets, Spanish ad group) | $600 | $550 | $500 |
| Meta (retargeting + before/after lead form) | $200 | $200 | $150 |
| Microsoft Ads (imported) | — | $100 | $100 |
| Local / offline (signs, neighbor mailers, Nextdoor) | $100 | paid from job margin | $50 |
| **Expected leads / month** | **~12–20** | **~15–22** | **~16–25** |

### $3,000 / month — "grow"
| Channel | Months 1–3 | Months 4–6 | Months 7–12 |
|---|---|---|---|
| Google LSA | $1,000 | $1,000 | $1,000 |
| Google Search (all 6 campaigns) | $1,200 | $1,100 | $1,000 |
| Meta (EN + ES creative, click-to-WhatsApp) | $500 | $450 | $450 |
| Microsoft Ads | $100 | $150 | $150 |
| Nextdoor sponsorship / neighbor mailers | $200 | $200 | $250 |
| ChatGPT Ads test | — | ~$100 + any credit (4 weeks) | $0–150, only if CPL ≤ 1.5× Search |
| **Expected leads / month** | **~25–40** | **~30–45** | **~35–50** |

### $5,000 / month — "dominate Lee County"
| Channel | Months 1–3 | Months 4–6 | Months 7–12 |
|---|---|---|---|
| Google LSA (all eligible categories) | $1,500 | $1,500 | $1,500 |
| Google Search (6 campaigns + Spanish) | $2,000 | $1,800 | $1,600 |
| Meta (prospecting, retargeting, click-to-WhatsApp ES) | $900 | $800 | $700 |
| Microsoft Ads | $200 | $200 | $200 |
| Neighbor mailers / Nextdoor / sponsorships | $400 | $300 | $300 |
| ChatGPT Ads test | — | $400 | $0–300 by result |
| Broad match / AI Max test (only with 30+ conversions/month + offline import) | — | — | $300 |
| YouTube local (EN/ES before/after) | — | — | $200 |
| **Expected leads / month** | **~45–65** | **~50–70** | **~55–80** |

**Tools (all scenarios): ~$150–350/month.** That covers a CRM ($0 Google Sheet up to ~$200), CallRail ($50), Twilio (a few dollars), and optionally GoHighLevel ($97). One-time costs: yard signs and magnets ($300–800), plus truck lettering when affordable.

## KPIs

| KPI | Target |
|---|---|
| **Cost per booked job** (the one that matters) | < $400 for repairs/paint · < $800 for kitchen, bath and additions |
| Blended cost per lead (all paid) | $50–110 |
| Google Search cost per lead | < $120 in months 1–3 → < $90 by month 6 |
| LSA cost per lead | ≤ $60 paint/handyman · ≤ $110 remodel |
| Lead → walkthrough booked | ≥ 50–60% |
| Walkthrough → job won | ≥ 25–35% |
| Speed to lead (median, business hours) | < 5 minutes |
| LSA answer rate | ≥ 90% (missed calls are billed from Oct 1, 2026) |
| New Google reviews | ≥ 4 / month (30 in first 90 days); rating ≥ 4.8 |
| Spanish-language leads | Tracked separately (the lead email says ESPAÑOL); report monthly |
| Marketing spend as % of revenue | 5–10% |
| Revenue won ÷ ad spend | ≥ 8–10× by month 6 |

## The first 90 days

### Weeks 1–2 — Foundation (no ad spend yet)
- [ ] Replace every `TODO` in `src/lib/content.ts`: phone, WhatsApp, email, **HBLB license #**, Google review link, real reviews (or remove the samples), the four homepage counters.
- [ ] Confirm the **HBLB license** is active, and confirm Georgia licensing status before advertising in Columbus/LaGrange.
- [ ] Vercel env vars: Resend (email), Twilio (owner SMS alert), webhook to the Google Sheet or CRM, `NEXT_PUBLIC_WHATSAPP`. Submit a test lead and confirm the email, text and sheet row arrive.
- [ ] GA4 + Google Ads account + conversion actions + enhanced conversions ([04](04-google-ads.md)).
- [ ] **Google Business Profile** fully built ([03](03-seo-local-and-ai-search.md)). Submit the sitemap in Google Search Console and Bing Webmaster Tools.
- [ ] Claim **Yelp, Bing Places, Apple Business Connect, Facebook, Nextdoor, BBB, Houzz, Angi (free)**. Add each URL to `BRAND.profiles`.
- [ ] Start the **LSA** application (background checks take 2–5 weeks).
- [ ] WhatsApp Business: profile, service catalog with "desde" prices, Spanish and English quick replies.
- [ ] Start the review engine: text every customer from the last 12 months.

### Weeks 3–4 — Launch
- [ ] Import the Google Ads campaigns (budget-appropriate subset). Presence targeting, negatives, assets, call tracking.
- [ ] Meta Pixel + Conversions API. Launch a small retargeting campaign.
- [ ] Yard sign on every active job. Truck magnets.
- [ ] Spanish community: bulletin at St. Michael/St. Mary's, flyers at Fiesta Supermarket and tiendas, first helpful post in "Latinos unidos Opelika y Auburn."
- [ ] Replace 10+ stock photos with real job photos, starting with the service pages' hero images.

### Weeks 5–8 — Tune
- [ ] Weekly search-terms cleanup. Pause wasted keywords.
- [ ] LSA live: answer rate ≥ 90%, reply to messages within minutes.
- [ ] Two content pieces + one case study per month ([03](03-seo-local-and-ai-search.md) calendar).
- [ ] Join the Lee County Association of REALTORS as an affiliate. Pitch 3 property managers on turnover packages before spring.
- [ ] Review count check: aim for 15+ by week 8.

### Weeks 9–13 — Scale what works
- [ ] First **offline conversion upload** (Qualified / Won) to Google Ads.
- [ ] Move Search bidding to Maximize Conversions where conversion volume allows.
- [ ] Import campaigns into **Microsoft Ads**.
- [ ] Shift budget toward the lowest **cost per booked job**.
- [ ] Monthly AI-visibility check (ChatGPT, Gemini, Copilot, Perplexity prompts).
- [ ] 90-day review: 30+ reviews? Leads by channel, by language, by grade. Close rate. Decide the months 4–6 budget scenario.

## The monthly one-page report

| Section | Where the data is |
|---|---|
| Leads by channel, grade and language | Lead sheet/CRM (from the webhook) |
| Cost per lead and per booked job, by channel | Ad platforms + sheet "Won $" column |
| Revenue won, close rate, average job | Sheet/CRM |
| Reviews: new, total, rating | GBP |
| Top search queries and pages | Search Console |
| AI assistant mentions | Monthly prompt screenshots |
| Next month: budget moves, content, offers | Decide from the above |
