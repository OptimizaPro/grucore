# Z Construction & Remodeling LLC — website

Next.js 16 · React 19 · Tailwind CSS v4 · @react-three/fiber · Framer Motion. English at `/`, Spanish at `/es` (native copy, localized slugs, hreflang).

> **Growth system:** market research, positioning, SEO & AI-search plan, ready-to-import Google Ads, ChatGPT/Meta/LSA playbooks, the lead pipeline and a 90-day plan live in [`docs/growth/`](docs/growth/README.md).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Deploy on Vercel (framework preset detects Next). Set the env vars from `.env.example` in Vercel → Settings → Environment Variables.

## Where things live

| Path | What |
| --- | --- |
| `src/lib/content.ts` | **Every word on the site, in both languages.** Edit copy here, not in components. Spanish is written natively (usted register) for Auburn/Opelika families, not machine-translated. |
| `src/lib/i18n.ts` | Locales, localized slugs (`/services` ↔ `/es/servicios`), URL helpers. |
| `src/lib/routes.ts` | Resolves every URL to a route (fixed page, service, town or guide) in either language; drives the language switch, hreflang, sitemap and `llms.txt`. |
| `src/lib/content-services.ts` | The 9 service landing pages (EN + ES): copy, what's included, cost drivers, FAQs. |
| `src/lib/content-areas.ts` | The 4 town pages (EN + ES), built on local permit/historic/housing facts. |
| `src/lib/content-guides.ts` | The 6 guides (EN + ES). Cost tables are generated from the estimator. |
| `src/lib/estimator.ts` | One price table for the cost estimator, service pages and guides. Calibrate yearly. |
| `src/lib/leads.ts` | Lead pipeline: scoring, channel attribution, owner email/SMS, homeowner auto-reply, CRM webhook, Meta CAPI. |
| `src/lib/attribution.ts`, `src/lib/track.ts`, `src/components/Tracking.tsx` | First/last-touch attribution, and GA4 / Google Ads / Meta / Microsoft / CallRail / GTM tracking, each enabled by one env var. |
| `src/proxy.ts` | Locale routing: `/` → English (rewritten to `/en` internally), `/es/...` → Spanish. |
| `src/app/[locale]/layout.tsx` | Fonts (Barlow Condensed / Barlow / Space Mono), nav, footer, grain, JSON-LD LocalBusiness schema. |
| `src/app/[locale]/[[...slug]]/page.tsx` | Routes slug → page component; per-page metadata with canonical + hreflang. |
| `src/app/api/quote/route.ts` | Quote form endpoint: validates, rate-limits, scores and fans the lead out (see `src/lib/leads.ts`). Logs to console when nothing is configured. |
| `src/components/three/BlueprintLiquid.tsx` | The WebGL scene: cursor-warped blueprint grid that morphs into a clearcoat liquid-paint surface on scroll. |
| `src/components/three/Background3D.tsx` | Client-only host; pauses the render loop when the hero/services zone leaves the viewport. |
| `src/components/motion.tsx` | Framer Motion primitives: `Reveal`, `Stagger`/`Item`, `SplitWords` (CSS keyframes), `Counter`, `Magnetic`. |
| `src/components/pages/*` | One component per page (Home, Services, About, Work, Reviews, Contact, Thanks). |
| `src/app/globals.css` | Tailwind `@theme` tokens + the handful of custom pieces (glass nav, grain, marquee, compare slider, faq, forms). |
| `src/app/sitemap.ts`, `robots.ts`, `llms.txt/route.ts` | Bilingual sitemap with hreflang alternates for every route; robots that welcomes search and AI crawlers; a generated `/llms.txt` fact sheet. |

## The 3D background, briefly

One `PlaneGeometry`, two skins sharing one displacement function so the crossfade is seamless:

- **Blueprint** — `ShaderMaterial` (wireframe) + `Points`. Vertices ripple and pull toward the cursor (distance measured in screen space, so it tracks the pointer regardless of the plane's tilt).
- **Liquid gloss** — `MeshPhysicalMaterial` (metalness .55, roughness ~.16, clearcoat 1, iridescence .3) with the wave displacement injected via `onBeforeCompile`, normals recomputed by finite differences. Lit by three's `RoomEnvironment` through PMREM, so no HDR download. Color drifts through a six-stop paint palette.

`uMorph` (0→1) is driven by `scrollY` across roughly the first viewport height and smoothed with an exponential lerp. It crossfades the two skins, tilts the plane, and pans the camera down. DPR is capped at 1.75; segment count drops on phones; `prefers-reduced-motion` freezes the animation; a WebGL failure renders nothing (the CSS blueprint grid underneath remains). The canvas resizes with the viewport via R3F's ResizeObserver.

## Motion rules (DOM)

Transform and opacity only. No animated filters, box-shadows or large blurred surfaces (the WebGL canvas is the one deliberate exception and lives on its own layer). Grain is static. One easing everywhere: `cubic-bezier(.22, 1, .36, 1)`. Reduced motion is respected globally.

## Language behavior

- EN/ES pill in the nav and in the mobile menu, plus a footer link. Any language link stores the choice in `localStorage` (`zc-lang`).
- Landing from outside the site with a stored choice that differs from the page language redirects to the matching page.
- No stored choice + browser language Spanish on an English page (or vice-versa) shows a small suggestion pill. No automatic redirect (Google advises against it).
- Every page carries `<link rel="alternate" hreflang>` for en / es / x-default; the sitemap does too.

## Build report

`/NewSiteNewYou` (any capitalization) is an unlisted, noindex report of everything that changed, with charts: Lighthouse before/after, SEO title and description lengths across all 58 URLs, site map, commit timeline, conversion research, a competitor comparison, the integrations checklist and the Angi-to-Google budget plan. Source: `src/app/changelog/`. It is not in the sitemap and is not linked from the site.

## Share cards

Every page's `og:image` is a branded card rendered on demand by `src/app/api/og/route.tsx` (title, kicker, phone, a job photo, in the page's language), so a link forwarded on WhatsApp, iMessage or Facebook previews as the company rather than a stock photo. The fonts it uses (Barlow, OFL) are bundled in `src/assets/fonts` and traced into the Vercel bundle by `outputFileTracingIncludes` in `next.config.ts`; `/api/og` is the one API path robots.txt allows so social crawlers can fetch it. Preview any card locally: `/api/og?t=Title&k=Kicker&p=kitchen1&l=es`.

## Pricing

One table, `src/lib/estimator.ts`, feeds the estimator, the "at a glance" ranges on service pages, the cost guides, the four price tiles on the home page and the `OfferCatalog` structured data. Calibrate it against signed jobs every January; nothing else needs to change.

## Review requests

`/review` and `/es/deje-su-resena` are unlisted pages to text a customer the day a job finishes: one tap to Google, Angi or HomeAdvisor. Reviews are the asset a paid directory rents you; this builds them where the leads are free.

## Integrations

Every tracking and lead channel is already in the code and switches on when its ID is set in Vercel (see `.env.example`): Google Ads conversions (form leads, call clicks, website-call number swap), GA4, Meta pixel, Microsoft UET, CallRail, GTM; lead delivery through Resend, Twilio, a CRM/Sheet webhook and Web3Forms. Nothing loads until its ID exists.

## Before launch (search `TODO` in `content.ts`)

1. Real phone number, email, license number, Google review link.
2. Replace the six sample reviews with verbatim reviews from Google / Angi / HomeAdvisor.
3. Replace Unsplash placeholders with job photos (drop them in `public/work/` and swap `photo()` sources).
4. Confirm the four homepage counters (projects, square feet, years, rating).
5. Set `NEXT_PUBLIC_SITE_URL` to the real domain; add Resend key and verify the sending domain. See `.env.example` for SMS alerts, CRM webhook, WhatsApp and ad tracking.
6. Calibrate `src/lib/estimator.ts` ranges against recent signed jobs.
7. Optional: `npx @next/codemod@canary middleware-to-proxy .` is already done (file is `src/proxy.ts`).
