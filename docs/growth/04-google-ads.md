# 04 · Google Ads (Search) — ready to import

Everything in [google-ads/](google-ads/) imports into **Google Ads Editor** (free desktop app). Benchmarks and sources: [research/paid-channels.md](research/paid-channels.md) §2.

| File | Contents |
|---|---|
| `ads.csv` | 15 ad groups × 1 responsive search ad each (up to 15 headlines, 4 descriptions), English + Spanish, all within Google's 30/90-character limits |
| `keywords.csv` | 103 keywords × exact + phrase match (206 rows) |
| `negative-keywords.txt` | Shared negative list (jobs, DIY, retail, out-of-area, Spanish equivalents) |
| `sitelinks-and-assets.csv` | Sitelinks, callouts and structured snippets (EN + ES), length-checked |
| `offline-conversions-template.csv` | For uploading "Qualified lead / Estimate scheduled / Job won" back to Google |

## Campaigns

| Campaign | Ad groups → landing page | Notes |
|---|---|---|
| **Brand** | Brand → `/` | Pennies per click; protects your name from competitors |
| **EN \| Kitchen & Bath** | Kitchen Remodel → `/services/kitchen-remodeling` · Bathroom Remodel → `/services/bathroom-remodeling` · Tub to Shower → `/services/bathroom-remodeling` | Highest value; most of the budget |
| **EN \| Painting & Cabinets** | House Painters → `/services/house-painting` · Cabinet Painting → `/services/cabinet-painting` | High local search volume ("painters auburn al" autocompletes) |
| **EN \| Flooring, Repairs & Rentals** | Flooring → `/services/flooring-installation` · Home Repairs → `/services/home-repairs` · Rental Turnover → `/services/rental-turnovers` | Cheaper clicks; rentals peak Mar–Aug |
| **EN \| Additions & Remodeling** | Home Additions → `/services/home-additions` · Remodeling & General Contractor → `/services/home-remodeling` | Expensive clicks, big tickets; cap the budget |
| **ES \| Español** | Baños · Cocinas · Pintura · Contratista → Spanish pages | Small volume, very low competition |

**On a $1,500/month budget,** run only Brand + Kitchen & Bath + Painting & Cabinets (+ the Spanish campaign at $3–5/day). Add the others as budget grows. Aim for at least ~10 clicks/day per campaign or merge.

Every landing page already has: phone number, WhatsApp, a quote form on the page, pricing, FAQs, and English↔Spanish switching. No separate "landing page builder" needed.

## Settings (apply to every campaign)

| Setting | Value |
|---|---|
| Type / networks | Search only. **Uncheck Search Partners and Display** at launch. |
| Locations | Auburn, Opelika, Smiths Station, Beauregard, Salem, Loachapoka, Waverly, Notasulga (cities + ZIPs 36830, 36832, 36849, 36801, 36804, 36867/36869/36870 Phenix City only if you'll take jobs there, 36877). **Exclude** Columbus GA and LaGrange GA until Georgia-licensed. |
| Location option | **"Presence: people in or regularly in your targeted locations"** (not the default "presence or interest") |
| Language | Google is removing Search language targeting (late Sept 2026). Spanish ads now match on the ad's language + the landing page's language — which is why every Spanish ad group points at a real Spanish page. Keep each ad group in one language. |
| Ad schedule | Mon–Sat, 7am–7pm (hours someone answers the phone). After hours, let ads run only if the auto-reply is on. |
| Bidding | Weeks 1–4: **Maximize Clicks with a max CPC cap (~$12)** or Manual CPC. After ~15–30 conversions in 30 days: **Maximize Conversions**, then **Target CPA**. |
| Broad match / Performance Max / AI Max | **Not in months 1–6.** They need 30+ conversions/month and generate junk lead-gen fills early. Revisit after offline conversion import works. |
| Assets | Call asset (tracked number), location asset (link GBP), sitelinks/callouts/snippets from `sitelinks-and-assets.csv`, image assets (real before/after), lead-form asset *(test only, with qualifying questions)* |
| Tracking template (account level) | `{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}` — plus **auto-tagging ON** (gclid). The site stores both on every lead. |

## Importing (15 minutes)

1. Install Google Ads Editor → sign in → download the account.
2. Create the six campaigns with the settings above (Editor → Campaigns → Add), naming them exactly as in the table.
3. **Account → Import → From file** → `keywords.csv`. Then again with `ads.csv`. Editor creates the ad groups automatically.
4. Shared library → Negative keyword lists → create "Z – Account negatives" → paste `negative-keywords.txt` (skip lines starting with #) → apply to all campaigns.
5. Add the sitelinks, callouts and snippets from `sitelinks-and-assets.csv` (English assets on English campaigns, Spanish on the Spanish campaign).
6. **Replace the placeholder phone** in call assets with your tracked number. Review, then Post.

**Microsoft Ads (Bing + Copilot + Yahoo):** in month 2–4, use Microsoft Advertising's **Import from Google Ads**. Clicks run ~30–60% cheaper and ads appear inside Copilot automatically. Set `NEXT_PUBLIC_MS_UET_ID` so conversions track.

## Conversion tracking — wired into the site

Create these conversion actions in Google Ads (Goals → Conversions → New → Website, "set up manually"), then paste each label into the matching environment variable in Vercel:

| Conversion action | Category | Primary? | Env var |
|---|---|---|---|
| Quote form lead | Submit lead form | **Primary** | `NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL` |
| Calls from website (Google forwarding number) | Phone call lead, ≥ 60s | **Primary** | `NEXT_PUBLIC_GOOGLE_ADS_CALL_LABEL` |
| Calls from ads (call asset) | Phone call lead, ≥ 60s | **Primary** | *(set in Google Ads; no code)* |
| Click to call | Contact | Secondary | `NEXT_PUBLIC_GOOGLE_ADS_CALL_CLICK_LABEL` |
| Qualified lead · Estimate scheduled · Job won | Qualified lead / Converted lead | Primary once importing | *(offline import, below)* |

Also set `NEXT_PUBLIC_GOOGLE_ADS_ID` (the `AW-…` ID) and turn on **Enhanced conversions** (Goals → Settings; since April 2026 it's one toggle). The site already sends the hashed email/phone with every lead, uses the lead ID as the transaction ID (no double counting), and sends a relative **conversion value by service** (additions 400, kitchen/bath/remodel 300, painting/cabinets/rentals 150, repairs 75) so bidding learns which leads matter. Tune values in `src/lib/track.ts` once you know your close rates.

### Offline conversion import (month 2+) — the step most contractors skip

Google only knows a form was filled. It doesn't know the $40k kitchen closed and the $300 door repair didn't. Tell it:

1. Every lead email and webhook row includes the **gclid** (under "Click IDs").
2. When a lead is qualified, gets an estimate, or signs, add a row to `offline-conversions-template.csv` (or the CRM does it — CallRail, Jobber/HCP via Zapier, or Google's **Data Manager** all support this).
3. Upload weekly: Goals → Conversions → Uploads.
4. After ~30 "Job won" imports, switch bidding to optimize for **Qualified lead** or **Job won** value.

## Weekly routine (30 minutes)

1. **Search terms report** → add irrelevant terms to the negative list (critical in weeks 1–8).
2. Pause keywords with 30+ clicks and 0 leads; raise bids on keywords producing A-grade leads (the lead email shows grade + keyword).
3. Check Auction Insights — who's showing next to you.
4. Compare cost per lead by campaign against [08](08-budget-and-90-day-plan.md) targets. Move money to the cheapest *booked job*, not the cheapest lead.
5. Read the actual leads. Bad lead patterns → new negatives or ad copy that pre-qualifies ("Kitchens from $8,000").

## Benchmarks to judge results

| Category | Typical CPC | Typical cost per lead |
|---|---|---|
| Home & home improvement (all, 2026) | ~$8.33 | ~$91 |
| Painting | ~$13.74 | ~$138 |
| Handyman | ~$7.10 | ~$54 |
| Kitchen / bath remodel | $8–18 (small markets toward the low end) | $90–400 (new account $120–180, mature $70–110) |
| **Spanish keywords** | Often far lower | Low volume — a handful of clicks a week |

Auburn planning assumption: **$60–150 per lead blended** in the first 90 days, improving as negatives and offline data build up.
