/* Client-side lead delivery, shared by the full estimate form and the quick
   "call or text me" box. Two steps, in order:
   1. /api/quote grades the lead, finds its source and delivers through any
      configured channel (Telegram alert, Resend email, CRM webhook).
   2. Web3Forms (free, 250/month) emails the owner, with that grade and
      source in the message. It posts from the browser because the free plan
      rejects server-side calls.
   The lead counts as sent if either step delivers it. */
import type { SiteContent } from "./content";
import type { Locale } from "./i18n";
import { getAttribution } from "./attribution";
import { trackLead } from "./track";

export type LeadLabels = Pick<SiteContent["contact"], "serviceOptions" | "timelineOptions" | "budgetOptions" | "contactOptions">;

export async function submitLead(locale: Locale, data: Record<string, string>, c: LeadLabels): Promise<{ ok: boolean; leadId?: string }> {
  /* Web3Forms access keys are public by design (they ship in the browser
     either way and can only send to the inbox they're tied to), so the live
     key is the default; a Vercel env var overrides it. */
  const w3fKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "4073f9e9-9005-4810-b6c0-745df45295fd";
  const label = (opts: { v: string; l: string }[], v?: string) => opts.find((o) => o.v === v)?.l || v || "-";
  const quick = data.form === "quick";
  /* Step 1: our own endpoint. It validates, grades the lead A/B/C, works out
     which channel produced it, and delivers through any configured channel
     (Telegram, Resend, webhook). Capped at 5 s so a slow function never
     holds up the email below. */
  type Api = { ok?: boolean; leadId?: string; delivered?: boolean; grade?: string; score?: number; channel?: string };
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 5000);
  const { r, j } = await fetch("/api/quote", {
    method: "POST", headers: { "Content-Type": "application/json" }, signal: ctl.signal,
    body: JSON.stringify({ ...data, language: locale, page: location.href, attribution: getAttribution() }),
  }).then(async (r) => ({ r, j: (await r.json().catch(() => ({}))) as Api }))
    .catch(() => ({ r: null as Response | null, j: {} as Api }));
  clearTimeout(timer);

  /* Step 2: the owner's email, via Web3Forms. Written to be acted on from a
     phone: grade and source in the subject, then a one-tap WhatsApp link to
     the customer, then the details in the order he needs them. */
  const digits = data.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "1$1");
  const es = locale === "es";
  const svc = label(c.serviceOptions, data.service);
  const w3fOk = w3fKey && !data.company
    ? await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: w3fKey, botcheck: "", from_name: "Z Construction website", ...(data.email ? { replyto: data.email } : {}),
          subject: `${j.grade ? `[${j.grade}] ` : ""}${quick ? "CALL BACK" : "Estimate request"} · ${svc} · ${data.city || "city not given"} · ${data.name}${es ? " · ESPAÑOL" : ""}`,
          "Lead": `${quick ? "Quick request: call or text back" : "Full estimate request"}${j.grade ? ` · grade ${j.grade} (${j.score}/100)` : ""}${es ? " · SPEAKS SPANISH" : ""}`,
          "Name": data.name,
          "Phone": data.phone,
          "WhatsApp them": `https://wa.me/${digits}`,
          "Email": data.email || "not given (reply by call, text or WhatsApp)",
          "Prefers": `${label(c.contactOptions, data.contactPref)}${data.smsConsent ? " · OK to text" : ""}`,
          "Service": svc,
          "City": data.city || "-",
          "Timeline": label(c.timelineOptions, data.timeline),
          "Budget": label(c.budgetOptions, data.budget),
          "Message": data.message || "-",
          "Language": es ? "Spanish" : "English",
          "Found us via": j.channel || "-",
          "Sent from page": location.href,
          "Lead ID": j.leadId || "-",
        }),
      }).then((x) => x.json()).then((x: { success?: boolean }) => !!x.success).catch(() => false)
    : false;
  /* In production an "ok but delivered: false" answer means no channel is
     configured: report failure so the visitor sees the call-us message
     instead of a false success. */
  const apiOk = !!r?.ok && !!j.ok && (j.delivered !== false || process.env.NODE_ENV !== "production");
  if (!w3fOk && !apiOk) return { ok: false };
  const leadId = j.leadId || crypto.randomUUID();
  trackLead({ leadId, service: data.service || "other", email: data.email || "", phone: data.phone, language: locale });
  return { ok: true, leadId };
}
