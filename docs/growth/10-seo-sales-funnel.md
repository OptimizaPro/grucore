# 10 · The SEO sales funnel

How a stranger searching Google or asking ChatGPT becomes a booked walkthrough, which page does each job, what to measure, and what to fix when a stage leaks. Built September 30, 2026.

## The funnel on one screen

```
1. FIND        Google / AI answer / Maps / a forwarded WhatsApp link
               → a guide, a question-hub answer, a town page, a service page
2. TRUST       answer-first content, real price ranges, dates, sources,
               Spanish in Spanish, license lookup, company facts page
3. PRICE IT    price range on the page → cost estimator (3 taps)
4. ACT         three effort levels on every content page:
               • leave a number (name + phone)          ← lowest effort
               • WhatsApp with a prefilled first line
               • full estimate form, pre-set to the service, page as context
               • or call (tap-to-call everywhere; mobile action bar)
5. RESPOND     lead → Telegram alert + email with one-tap call/WhatsApp,
               graded A/B/C (a priced estimate counts as a budget)
               → owner calls or texts back within 5 minutes
6. CLOSE       walkthrough → written line-by-line estimate
7. MULTIPLY    finished job → /review (/es/deje-su-resena) → reviews feed
               stage 1 and 2 for the next customer
```

## Which page does which job

| Stage | Pages | What they're built to do |
|---|---|---|
| Find | 13 guides (EN + ES), `/questions` hub (60 Q per language), 4 town pages, 9 service pages, company facts | Rank for question-style and "near me"-style searches; be the passage an AI assistant quotes |
| Trust | Every page: dates, sources, license link, "owner on every job" promise, Spanish written natively | Answer the first-timer's real worry: "Will this person be straight with me?" |
| Price it | Home price tiles, service-page tiers, guide tables, `/cost-estimator` | Nobody else in the market publishes prices; this is the moment the visitor stops shopping |
| Act | `ProjectCta` (end of every guide, after each hub lane), slim mid-guide prompt, `QuickLead` under the estimator result, inline form on service and town pages, mobile action bar | Offer a next step at the visitor's comfort level, never just "contact us" |
| Respond | `/api/quote` → Telegram, Resend email, webhook; Web3Forms as free fallback | Put the lead in the owner's hand in seconds, with the context to call confidently |
| Multiply | `/review`, `/es/deje-su-resena` | Turn each job into the next job's proof |

## Events to watch (GA4, once `NEXT_PUBLIC_GA4_ID` is set)

| Stage | Event | Fired when |
|---|---|---|
| Price it | `estimator_result` | A visitor changes the estimator (debounced) |
| Price it | `estimator_cta` | "Get my exact price" clicked |
| Act | `quick_lead_start` | First focus in a "call or text me" box (`where`: guide, guide-mid, help-home, help-business, estimator) |
| Act | `whatsapp_click`, `phone_click` | Any WhatsApp / tel: link (`link_location` says which block) |
| Act | `form_start`, `form_step` | Estimate form started / each of its 3 steps |
| Lead | `generate_lead` | Any lead delivered (quick or full), with value and service |
| Lead | `quick_lead` / `quick_lead_error` | Quick request delivered / failed |

**GA4 funnel exploration** (Explore → Funnel exploration), open funnel:
1. `page_view` where page path contains `/guides/` or `/questions` or `/es/guias/` or `/es/preguntas-frecuentes`
2. `estimator_result` **or** `quick_lead_start` **or** `form_start` **or** `whatsapp_click`
3. `generate_lead`

Break down by *Language* and *Session default channel group*. The two numbers that matter: content → act rate (target 3–6%), act → lead rate (target 30%+ for quick requests, 15–25% for the full form).

**Google Ads conversions:** keep `generate_lead` (the lead conversion) as **Primary**. Phone-click is **Secondary** (it counts intent, not a conversation). If WhatsApp becomes the main Spanish channel, import `whatsapp_click` from GA4 as a Secondary conversion.

## When a stage leaks

| Symptom | Likely cause | Fix |
|---|---|---|
| Traffic to guides, few `quick_lead_start` | CTA doesn't match the reader's question | Change the guide's `service`/`estimator` so the block shows the right service and range |
| Many `quick_lead_start`, few `quick_lead` | Phone field friction, or the form errors | Check `quick_lead_error`; confirm Web3Forms or Resend/Telegram keys are live |
| Leads, few booked walkthroughs | Speed-to-lead | Telegram alert on, 5-minute callback rule ([07](07-lead-system.md)) |
| Spanish traffic, English leads | Spanish readers pick WhatsApp | Watch `whatsapp_click` on `/es/` pages; answer WhatsApp as fast as calls |
| High estimator use, low CTA clicks | Range looks high | Recalibrate `src/lib/estimator.ts` against signed jobs; keep ranges honest |

## Weekly 10-minute review

1. Leads this week by channel and language (lead emails carry both).
2. Content → act and act → lead rates (the exploration above).
3. Which guide produced leads (the lead message names it). Write the next guide on that guide's neighbor topic.
4. Median response time to leads. Anything over 30 minutes is the first thing to fix.
