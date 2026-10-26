# 06 · Local Services Ads, Facebook/Instagram & other channels

Sources: [research/paid-channels.md](research/paid-channels.md) §3–5.

---

## Google Local Services Ads (LSA) — channel #1

Pay per lead (not per click), shown at the very top of Google with the blue **"Google Verified"** badge. For contractors this is usually the cheapest source of real phone calls.

**2026 changes to know**
- The Guaranteed / Screened / License Verified badges merged into one **"Google Verified"** badge (Oct 2025). The $2,000 guarantee is gone.
- **From Oct 1, 2026, missed calls during your listed business hours are billed** if the caller waits more than 20 seconds. **Only list hours when someone actually answers**, or use an answering service or AI receptionist for overflow.
- LSA is moving into Google Ads as a pay-per-lead Performance Max campaign type. Service-area businesses move in late 2026. **Export your LSA lead reports before the migration** because history won't carry over.
- The manual "dispute lead" button is being replaced by automatic crediting of invalid leads.

**Setup**
1. Check category availability at ads.google.com/local-services-ads with ZIP 36830: General contractor, Handyman, Painter, and remodeling/kitchen/bath/flooring if offered.
2. Verification: owner and field-worker background checks, **HBLB license**, general liability insurance certificate, and a verified GBP link. Allow 2–5 weeks.
3. Profile: every job type, service ZIPs, hours you really answer, 10+ photos, a bio in English plus a Spanish line, **languages: English, Spanish**.
4. Phone menu (optional but smart): *"Press 1 for English, 2 para español."* It routes Spanish callers, and the billing timer starts at the key press.
5. Budget: at least 5–7 leads' worth per week so ads don't go dark mid-week.

**Expected cost per lead:** painter ~$33, handyman ~$41, remodeler ~$73–107. Plan on **$35–60** for paint and repair leads and **$70–120** for remodel leads.

**What ranks you:** reviews (count, rating, recency), **responsiveness** (answer rate, message reply time), proximity, and profile completeness. The review engine in [03](03-seo-local-and-ai-search.md) feeds LSA directly.

---

## Facebook & Instagram (Meta) — channel #3

**Treat remodeling ads as Housing Special Ad Category.** Meta's housing definition includes "housing repairs." Under Housing you get:
- a **minimum 15-mile radius**
- no ZIP, age or gender targeting
- no lookalike audiences

Custom audiences (site visitors, video viewers, customer lists) still work. Never target by ethnicity. Reach Spanish speakers through **Spanish creative and a Spanish form**.

**Geography:** pins on Auburn and Opelika (15-mile radius each); add Phenix City only if you serve it. Put "Serving Auburn, Opelika & Lee County" in the copy and a city question in the form.

**Campaigns**

| Campaign | Objective | Creative | Budget share |
|---|---|---|---|
| Retargeting | Leads | Before/after carousel + testimonial; "Still thinking about your kitchen?" | 30–40% |
| Prospecting (EN) | Leads, **Higher-intent Instant Form** with 3 questions (project type, budget range, city) | Before/after Reels, cabinet transformations, owner walk-through | 40–50% |
| Prospecting (ES) | **Click-to-WhatsApp** | Spanish Reel: the owner explaining a job in Spanish; "Mándenos fotos por WhatsApp" | 10–20% |

**Creative that works for remodelers:** before/after sliders and carousels, 15–30s Reels with captions (most people watch muted), time-lapses, the owner on camera (in English and in Spanish), cabinet painting transformations, and seasonal pushes ("Fall interior painting dates open"). Keep the logo and phone number on screen.

**Tracking (already wired into the site):** set `NEXT_PUBLIC_META_PIXEL_ID` and `META_CAPI_TOKEN`.
- The browser pixel and the server Conversions API both send a `Lead` event with the **same event ID**, so Meta counts each lead once, even when browsers block the pixel.
- Clicks on phone, WhatsApp and email links send `Contact`.
- For Instant Forms, sync to the CRM (Zapier/LeadsBridge or native) so the 5-minute follow-up fires.

**Benchmarks:** home improvement lead campaigns average ~$43 per lead, and remodeling-specific leads often run $80–120. Meta leads are lower-intent than search, so judge them by booked jobs, not form fills.

---

## Other channels, ranked for Z

| Channel | Verdict | How |
|---|---|---|
| **Yard signs + truck wrap** | ✅ Must-do | A bilingual sign at every job (ask permission; offer a small thank-you discount). Truck wrap or magnets with a QR code to `/?utm_source=truck&utm_medium=offline`. |
| **"Neighbor" direct mail (EDDM)** | ✅ Strong | After each job, mail 200–500 homes on the same carrier route: *"We just remodeled a kitchen on your street."* EDDM postage is $0.26/piece; 2,500 pieces cost about $650–1,100 all-in. QR code to `/?utm_source=eddm&utm_medium=mail&utm_campaign={street}`. Focus on 1990s–2000s subdivisions. |
| **Realtors** | ✅ High value | Join the Lee County Association of REALTORS as an affiliate. Bring a "pre-listing refresh" menu, 48-hour quotes for inspection repair lists, and post-closing remodel help for buyers. |
| **Property managers & landlords** | ✅ High value | Turnover packages, net-15/30 terms, photo reports, spring booking discount. Visit the Auburn PM companies in February–March. |
| **Referral program** | ✅ Cheap | $150 gift card or a local charity donation per referred *completed* job. Send a card with every final invoice and a text 30 days later. |
| **Microsoft Ads** | ✅ Month 2–4 | Import the Google campaigns, $100–300/month (see [04](04-google-ads.md)). |
| **Nextdoor** | ✅ Month 4+ | Free business page and recommendations first. Then a neighborhood sponsorship (~$32–150/ZIP/month) in 1–2 ZIPs around recent jobs. |
| **Thumbtack** | ⚠️ Fill-in only | Painting and handyman work with a weekly cap ($50–150) and instant auto-reply. Skip it for remodels. |
| **Angi / HomeAdvisor** | ❌ Avoid contracts | Shared leads close at 10–20%, about $250–500 per booked job, on 12-month contracts. The free profile is fine. |
| **YouTube (local)** | ⏳ Month 7+ at $5k/month | 30-second before/after spot in English and Spanish, targeted to service-area ZIPs, $200–500/month. |
| **Spanish radio** | ❌ Low priority | No confirmed Spanish station covers Auburn/Opelika. Churches, tiendas, WhatsApp and Facebook groups reach the community better. |
