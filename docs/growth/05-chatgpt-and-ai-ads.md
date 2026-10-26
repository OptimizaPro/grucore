# 05 · ChatGPT ads & AI-assistant advertising

Sources: [research/paid-channels.md](research/paid-channels.md) §1. Several OpenAI pages block automated fetches, so some details come from trade press; verify minimums and credits inside Ads Manager.

## Where AI advertising stands (September 2026)

| Platform | Status | Fit for Z today |
|---|---|---|
| **ChatGPT Ads** (OpenAI) | Live since Feb 9, 2026 for US Free and Go users (paid plans see no ads). **Self-serve Ads Manager since May 2026**, no minimum spend, CPC bidding; ZIP/DMA/state targeting since May 22; conversion-optimized bidding, pixel + Conversions API, and HubSpot integration since September. | ⚠️ **Set up now, test in month 4+.** |
| **Microsoft Copilot** | Ads show inside Copilot automatically from regular Microsoft Advertising campaigns | ✅ Month 2–4 — import the Google campaigns |
| **Google AI Overviews / AI Mode** | Normal Search ads show around AI Overviews; *inside* them via Performance Max / AI Max / broad match. Exact/phrase test in AI Mode started Sept 4, 2026. | ⏳ After 30+ conversions/month |
| **Perplexity** | Stopped taking advertisers (Oct 2025) | ❌ None |
| **Gemini app** | No ads | ❌ None |

## ChatGPT Ads — the honest assessment

**What it is:** a labeled "Sponsored" card below ChatGPT's answer (business name, ~40-character headline, description, link). Targeting uses plain-language **"context hints"** describing the conversations you want to appear in, plus geography. There are no keywords.

**Why not lead with it:**
- Click floor around **$3–5**, reported **~$25/day minimum** per campaign (~$760/month).
- **No call button, phone number, stars, hours or map** for local businesses. Remodeling leads mostly come by phone.
- **No radius targeting, no geographic reporting**, and only Free/Go users see ads.
- Google Search clicks cost more but come with calls, maps, reviews and much higher intent.

**Why still prepare now:** it's the fastest-growing ad surface, competition from local contractors is near zero, and conversion bidding plus a Conversions API just arrived. Being set up early is cheap.

### Do now (1 hour)
1. Create the account at OpenAI Ads Manager and verify the business.
2. Install the OpenAI pixel **through Google Tag Manager**: set `NEXT_PUBLIC_GTM_ID`, add the pixel as a tag in GTM, and fire its lead event on the `lead_submitted` event the site already pushes. No code change needed.
3. Use `utm_source=chatgpt&utm_medium=paid-ai` on every ChatGPT ad URL. The site already classifies these leads as **"AI Assistant (paid)"**, separate from organic ChatGPT referrals.

### Test plan (month 4+, only once Google/LSA are profitable)
- **Budget:** $25/day for 4 weeks (~$750), using any new-advertiser credit offered.
- **Geo:** ZIPs 36830, 36832, 36849, 36801, 36804, 36877 (+ Phenix City ZIPs if serving).
- **Landing pages:** the cost guides and estimator, which match what people ask ChatGPT:
  - `/guides/kitchen-remodel-cost-auburn-al`, `/guides/bathroom-remodel-cost-auburn-al`, `/cost-estimator`
  - Spanish: `/es/guias/costo-remodelar-bano-alabama` (turn on the ad-translation option)
- **Context hints** (examples):
  - "planning a kitchen remodel and asking about cost or contractors in Alabama"
  - "bathroom renovation or tub-to-shower conversion cost"
  - "should I paint or replace my kitchen cabinets"
  - "how to find a reliable, licensed contractor; checking a contractor's license"
  - "landlord preparing a rental between tenants near Auburn University"
  - Spanish: "cuánto cuesta remodelar un baño o una cocina en Estados Unidos"
- **Ad copy** (≈40-character headline):
  - "Auburn Remodel Costs, Real 2026 Prices" → estimator
  - "Paint or Replace Cabinets? Auburn Pros" → cabinet guide
  - "Contratista en Auburn que Habla Español" → Spanish guide
- **Kill rule:** after ~$1,000, stop if cost per *qualified* lead is more than 2× Google Search.

## The bigger AI opportunity is free

Right now, **being recommended organically** by ChatGPT, Google's AI and Copilot is worth far more than AI ads. That work is in [03](03-seo-local-and-ai-search.md#getting-recommended-by-ai-assistants-chatgpt-google-ai-copilot-siri): Yelp (ChatGPT's local answers draw ~96% on it), Bing Places (Copilot), Apple Business Connect (Siri), GBP (Google AI), reviews that mention service + town, local press and "best of" lists, and the answer-first guides already on the site.

The site already:
- Welcomes AI search crawlers in `robots.txt` (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude, Bing, Applebot).
- Server-renders all prices, FAQs and business facts (AI crawlers mostly don't run JavaScript).
- Publishes `/llms.txt`, a plain-text fact sheet. Google says it ignores these, so treat it as a small, free extra.
- Tags every lead from chatgpt.com, perplexity.ai, gemini, copilot and claude.ai as **"AI Assistant"**, so you can see this channel grow in your lead emails.
