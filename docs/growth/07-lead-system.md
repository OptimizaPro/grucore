# 07 · The lead system

From "someone found us" to "signed job," with nothing falling through the cracks.

## How it works (already built into the site)

```
Visitor lands (Google, ChatGPT, Facebook, yard sign QR…)
   │  site records source: UTMs, gclid/fbclid/msclkid, referrer, landing page
   ▼
Quote form (contact page, every service page, every town page)
or cost estimator → pre-filled quote form
or quick request ("call or text me": name + phone only) on every guide,
   the question hub and under the estimator result; the page they were
   reading (or the exact estimate) becomes the lead's message
   │  name, phone, email, city, service, timeline, budget,
   │  preferred contact (call / text / WhatsApp / email), SMS consent
   ▼
/api/quote  →  scores the lead A / B / C  →  works out the channel
   ├─► Email to owner      subject "[A · 80] Kitchen / bath · Opelika · María G. · ESPAÑOL"
   │                        + one-tap call / text / WhatsApp links + full source
   ├─► Telegram alert      free push to the owner's phone: grade, name, service, one-tap call + WhatsApp
   ├─► SMS to owner phone  optional, paid (Twilio): same alert as a text
   ├─► Email to homeowner  confirmation in their language + "reply with photos"
   ├─► SMS to homeowner    (only if they ticked consent and texting is registered)
   ├─► Webhook → CRM / Zapier / Make / Google Sheet (every field as JSON)
   └─► Meta Conversions API (server-side Lead event)
   ▼
Thank-you page: "what happens next" + "send photos on WhatsApp"
Browser fires conversions: GA4, Google Ads (+ enhanced conversions), Meta, Microsoft, GTM
```

Every channel is **optional and independent**. If one fails, the others still run. With nothing configured the lead is logged, and the site still works end to end.

## Turning it on

All settings are environment variables in **Vercel → Project → Settings → Environment Variables**. The full list with comments is in `.env.example`. Redeploy after changing them.

| Step | What to set | Cost |
|---|---|---|
| 1. Email alerts + homeowner auto-reply | Create a [Resend](https://resend.com) account, verify the domain, then set `RESEND_API_KEY`, `QUOTE_TO_EMAIL`, `QUOTE_FROM_EMAIL` | Free tier covers this |
| 2. Instant alert on the owner's phone (**free**) | Telegram: message @BotFather → `/newbot` → copy the token into `TELEGRAM_BOT_TOKEN`; send the bot one message, open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the chat id into `TELEGRAM_CHAT_ID` | Free |
| 2b. Same alert as a text message (optional) | Only if Telegram won't do: [Twilio](https://twilio.com) number + `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `LEAD_ALERT_SMS_TO` | Paid: monthly number + per-text + A2P registration. Skip it. |
| 3. CRM / spreadsheet | Set `LEAD_WEBHOOK_URL` (+ optional `LEAD_WEBHOOK_SECRET`) to a Zapier/Make webhook, your CRM's inbound webhook, or the free Google Sheet below | Free–$20/month |
| 4. WhatsApp | Install **WhatsApp Business** on the business phone and set `NEXT_PUBLIC_WHATSAPP` (digits only, e.g. 13345550123) | Free |
| 5. Ads tracking | GA4, Google Ads, Meta, Microsoft, CallRail, GTM IDs (see [04](04-google-ads.md), [06](06-lsa-meta-and-other-channels.md)) | Free (CallRail from $50/month) |
| 6. Texting homeowners automatically (optional, paid) | Not needed: the owner texts back by hand from his own phone or WhatsApp, which is free and converts better than a bot. If ever wanted: A2P 10DLC with Twilio, then `LEAD_SMS_AUTOREPLY=1` | Paid |

### Free CRM option: Google Sheet (10 minutes)

1. New Google Sheet → Extensions → Apps Script → paste the script below → Deploy → New deployment → Web app → *Execute as me, access: Anyone* → copy the URL.
2. Set `LEAD_WEBHOOK_URL` to that URL.

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) sh.appendRow(["Date","Grade","Score","Name","Phone","Email","City","Service","Timeline","Budget","Prefers","Lang","Channel","Campaign","Term","GCLID","Message","Status","Estimate $","Won $","Lead ID"]);
  sh.appendRow([d.createdAt, d.grade, d.score, d.name, d.phone, d.email, d.city, d.serviceLabel, d.timelineLabel, d.budgetLabel,
    d.contactPref, d.language, d.channel, d.utm_campaign, d.utm_term, d.gclid, d.message, "New", "", "", d.id]);
  return ContentService.createTextOutput("ok");
}
```

The **Status / Estimate $ / Won $** columns turn the sheet into a pipeline. The GCLID column is what you upload to Google Ads for offline conversions ([04](04-google-ads.md)).

### Paid CRM options (when volume justifies it)

| Tool | ~Monthly | Best for |
|---|---|---|
| **Jobber** (Connect) | $119–139 | Quotes, scheduling, invoices, review requests. Easy. |
| **Housecall Pro** (Essentials) | $149–189 | Same idea. Reportedly has a Spanish-language app. |
| **GoHighLevel** | $97–297 | One inbox for SMS, WhatsApp, Facebook, Instagram and GBP chat; missed-call text-back; automations |
| **HubSpot Free** | $0 | Pipeline + email. Weak on field operations. Integrates with ChatGPT Ads. |

Any of them accepts the site's webhook directly or through Zapier.

## Lead grades (A / B / C)

Scoring is in `src/lib/leads.ts` (the `score` function). Tune the weights once you know which leads close.

| Signal | Points |
|---|---|
| Service | additions 30 · remodeling/kitchen-bath 25 · cabinets/rentals 18 · painting 15 · repairs/other 8 |
| Timeline | ASAP or 1–3 months 20 · 3–6 months 10 · just planning 3 |
| Budget | $100k+ 30 · $40–100k 28 · $15–40k 22 · $5–15k 14 · not sure 10 · under $5k 5 |
| City in service area | +10 (−10 if outside, flagged in the email) |
| Detailed message / prefers call or WhatsApp | +5 / +3 |

**A ≥ 65 · B ≥ 42 · C below.** A-leads get a call within 5 minutes, no exceptions.

---

## Speed-to-lead playbook

Leads contacted within **5 minutes** are about **21× more likely to qualify** than those contacted after 30 minutes, and most contractors take days. Answering fast is the cheapest competitive advantage there is.

**During business hours**
1. The Telegram alert (or email) arrives → **call within 5 minutes** (or WhatsApp, if that's their preference; the email shows it).
2. No answer → text or WhatsApp right away (templates below), then call again in 2 hours.
3. Book the walkthrough on the first conversation, and send a confirmation text with date, time and the owner's name.

**After hours:** the homeowner already has the auto-reply email. Text at 7:30am the next morning.

**Missed calls:** turn on **missed-call text-back** in your phone system or CRM (GoHighLevel, Jobber, Housecall Pro and CallRail all have it). After Oct 1, 2026, missed LSA calls are billed, so answer or text back within 60 seconds.

### Scripts

**First text / WhatsApp — English**
> Hi {name}, this is {owner} with Z Construction — thanks for your {project} request in {city}. Is now a good time for a quick call, or would later today be better? Feel free to send a few photos of the space here.

**Primer mensaje — Español**
> Hola {nombre}, le saluda {dueño} de Z Construction. Gracias por su solicitud de {proyecto} en {ciudad}. ¿Le puedo llamar ahorita o prefiere más tarde? Si gusta, mándeme por aquí unas fotos del espacio.

**Phone call opener (both languages):** thank them → confirm the project in their words → ask the three questions (what's driving the project now, rough budget, timeline) → book the walkthrough → confirm by text.

**Walkthrough confirmation**
> EN: Confirmed: {day} at {time}, {address}. I'll text when I'm on the way. — {owner}, Z Construction
>
> ES: Confirmado: {día} a las {hora}, {dirección}. Le escribo cuando vaya en camino. — {dueño}, Z Construction

### Follow-up cadence

| When | Not yet reached | Estimate sent, no decision |
|---|---|---|
| Day 0 | Call + text (above) | Send the estimate the same day or next morning, and walk them through it by phone |
| Day 1 | Call + short text | — |
| Day 2 | — | "Any questions on the estimate? Happy to adjust scope to fit the budget." |
| Day 3 | Call | — |
| Day 7 | Text: "Still planning your {project}? I have openings in {month}." | Call: check timing, offer phased options |
| Day 14 | Final text: "I'll close your file for now — reply anytime." | — |
| Day 21 | — | "Holding your {month} start date until Friday." |
| Day 90 | Seasonal check-in | Seasonal check-in / new idea (cabinets, paint) |

### After the job
1. Final walkthrough → **review request that same day** (templates in [03](03-seo-local-and-ai-search.md#the-review-engine)).
2. Before/after photos → GBP post, Facebook/Instagram, Our Work, and the town page.
3. Referral card with the invoice; text at 30 days.
4. Neighbor mailer to the street ([06](06-lsa-meta-and-other-channels.md)).
5. Mark the lead "Won $" in the CRM/sheet so Google Ads learns (offline conversion import).

---

## Texting compliance (TCPA / A2P 10DLC)

- **Replying** to someone who submitted the form or called you is conversational and generally fine.
- **Marketing texts** (offers, seasonal pushes) need **prior express written consent**. The form's SMS checkbox is unchecked by default, with STOP language, and is linked to the privacy policy (which includes the SMS terms carriers look for during 10DLC registration).
- **A2P 10DLC registration is required** for business texting from local numbers. Your provider (Twilio, CallRail, Jobber, Housecall Pro, GoHighLevel) handles it.
- Honor opt-outs from any reasonable message ("stop", "no more texts", "no me escriba") right away. Text only between 8am and 9pm local time.
- WhatsApp Business app is fine for one-to-one chats. Bulk WhatsApp marketing needs the WhatsApp Business Platform with opt-in templates.

## What gets measured

Every lead email and webhook row carries: grade, score, channel (Google Ads, Microsoft Ads, AI Assistant, Facebook/Instagram, Google Business Profile, Nextdoor, organic search, referral, direct), UTM source/medium/campaign/term, click IDs, first and last landing page, language, and lead ID. Count these monthly in the sheet or CRM. The report that matters is **cost per booked job by channel** ([08](08-budget-and-90-day-plan.md)).
