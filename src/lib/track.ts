/* ---------------------------------------------------------------------------
   One call site for every ad/analytics platform. Each platform is optional:
   if its ID isn't set in the environment, its script never loads and these
   calls are no-ops. IDs live in .env (see .env.example).

   Conversion values are relative lead values by service so Google/Meta/
   Microsoft bidding learns an addition lead is worth more than a repair
   lead. Tune them in LEAD_VALUE once you know your close rates.
   ------------------------------------------------------------------------- */

type Fn = (...args: unknown[]) => void;
declare global {
  interface Window { gtag?: Fn; fbq?: Fn; uetq?: unknown[] & { push: (...a: unknown[]) => void }; dataLayer?: unknown[] }
}

export const IDS = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID || "",
  ads: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
  adsLead: process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL || "",
  adsCallClick: process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_CLICK_LABEL || "",
  adsCall: process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_LABEL || "",
  meta: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  uet: process.env.NEXT_PUBLIC_MS_UET_ID || "",
  callrail: process.env.NEXT_PUBLIC_CALLRAIL_SCRIPT || "",
  gtm: process.env.NEXT_PUBLIC_GTM_ID || "",
};

export const LEAD_VALUE: Record<string, number> = {
  additions: 400, remodeling: 300, kitchensBaths: 300, finishing: 150, painting: 150, rental: 150, repairs: 75, other: 75,
};

/** US phone → E.164 (+13345550123), or "" if it doesn't look like one. */
export function e164(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return "";
}

export function track(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
  window.uetq?.push("event", name, params);
  // Google Tag Manager: lets you add new pixels (ChatGPT Ads, Nextdoor, TikTok…) without a code change.
  if (IDS.gtm) (window.dataLayer = window.dataLayer || []).push({ event: name, ...params });
}

export function trackContact(kind: "phone" | "email" | "whatsapp", where: string) {
  track(`${kind}_click`, { link_location: where });
  if (kind === "phone" && IDS.ads && IDS.adsCallClick) window.gtag?.("event", "conversion", { send_to: `${IDS.ads}/${IDS.adsCallClick}` });
  window.fbq?.("track", "Contact", { content_name: kind });
}

export function trackLead(l: { leadId: string; service: string; email: string; phone: string; language: string }) {
  if (typeof window === "undefined") return;
  const value = LEAD_VALUE[l.service] ?? LEAD_VALUE.other;
  const phone = e164(l.phone);
  // Enhanced conversions: gtag hashes these before they leave the browser.
  window.gtag?.("set", "user_data", { ...(l.email ? { email: l.email } : {}), ...(phone ? { phone_number: phone } : {}) });
  window.gtag?.("event", "generate_lead", { value, currency: "USD", service: l.service, language: l.language, transaction_id: l.leadId });
  if (IDS.ads && IDS.adsLead) window.gtag?.("event", "conversion", { send_to: `${IDS.ads}/${IDS.adsLead}`, value, currency: "USD", transaction_id: l.leadId });
  // Same eventID as the server-side Conversions API call, so Meta de-duplicates.
  window.fbq?.("track", "Lead", { content_name: l.service, value, currency: "USD" }, { eventID: l.leadId });
  window.uetq?.push("event", "submit_lead_form", { event_category: "lead", event_label: l.service, revenue_value: value, currency: "USD" });
  if (IDS.gtm) (window.dataLayer = window.dataLayer || []).push({ event: "lead_submitted", lead_id: l.leadId, service: l.service, value, currency: "USD", language: l.language, user_email: l.email, user_phone: phone });
}
