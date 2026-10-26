/* ---------------------------------------------------------------------------
   Lead pipeline (server only). A quote request becomes:

     1. a scored lead (A/B/C) with its marketing channel worked out
     2. an email to the owner with one-tap call / text / WhatsApp links
     3. an instant SMS alert to the owner's phone (Twilio, optional)
     4. an acknowledgment email to the homeowner in their language
     5. a JSON POST to your CRM / Zapier / Make / Google Sheet (optional)
     6. a server-side "Lead" event to Meta's Conversions API (optional)

   Every channel is optional and independent: if one fails the others still
   run, and the visitor still sees success as long as at least one reached you.
   ------------------------------------------------------------------------- */
import { createHash, randomUUID } from "node:crypto";
import { BRAND } from "./content";
import type { Attribution, Touch } from "./attribution";

export interface Lead {
  id: string; createdAt: string;
  name: string; phone: string; email: string; city: string; service: string; timeline: string; budget: string;
  contactPref: string; smsConsent: boolean; message: string; language: "en" | "es"; page: string;
  attribution: Attribution; channel: string; score: number; grade: "A" | "B" | "C"; inArea: boolean;
  ip?: string; userAgent?: string; fbp?: string; fbc?: string;
}

const clean = (v: unknown, max = 2000) => String(v ?? "").trim().slice(0, max);

export const SERVICE_LABEL: Record<string, string> = {
  remodeling: "Home remodeling", additions: "Home addition", kitchensBaths: "Kitchen / bath", painting: "Painting",
  finishing: "Cabinets & trim", repairs: "Flooring / repairs", rental: "Rental turnover", other: "Other",
};
const TIMELINE_LABEL: Record<string, string> = { asap: "ASAP", "1-3m": "1–3 months", "3-6m": "3–6 months", planning: "Just planning" };
const BUDGET_LABEL: Record<string, string> = { lt5: "Under $5k", "5-15": "$5k–$15k", "15-40": "$15k–$40k", "40-100": "$40k–$100k", "100+": "$100k+", unsure: "Not sure" };

const IN_AREA = /auburn|opelika|smiths|loachapoka|waverly|beauregard|notasulga|salem|cusseta|lee county|phenix|valley|lanett|tuskegee|dadeville|lake martin|camp hill/i;

/* ---------- scoring: how hot is this lead? tune weights to your close data */
export function score(l: Pick<Lead, "service" | "timeline" | "budget" | "city" | "message" | "contactPref">): { score: number; grade: Lead["grade"]; inArea: boolean } {
  const svc: Record<string, number> = { additions: 30, remodeling: 25, kitchensBaths: 25, finishing: 18, painting: 15, rental: 18, repairs: 8, other: 8 };
  const time: Record<string, number> = { asap: 20, "1-3m": 20, "3-6m": 10, planning: 3 };
  const bud: Record<string, number> = { "100+": 30, "40-100": 28, "15-40": 22, "5-15": 14, lt5: 5, unsure: 10 };
  const inArea = IN_AREA.test(l.city);
  /* A lead that carries a priced estimate (from the estimator or a guide)
     told us its budget without answering the budget question: use the top
     of that range. */
  const priced = Math.max(0, ...[...l.message.matchAll(/\$([\d,]{4,})/g)].map((m) => Number(m[1].replace(/,/g, ""))));
  const budget = l.budget || (priced >= 100000 ? "100+" : priced >= 40000 ? "40-100" : priced >= 15000 ? "15-40" : priced >= 5000 ? "5-15" : priced ? "lt5" : "");
  let s = (svc[l.service] ?? 8) + (time[l.timeline] ?? 8) + (bud[budget] ?? 8);
  /* No city given (quick requests) is unknown, not out of area. */
  s += inArea ? 10 : l.city ? -10 : 0;
  if (l.message.length > 80) s += 5;
  if (l.contactPref === "call" || l.contactPref === "whatsapp") s += 3;
  s = Math.max(0, Math.min(100, s));
  return { score: s, grade: s >= 65 ? "A" : s >= 42 ? "B" : "C", inArea };
}

/* ---------- which channel produced it (feeds reporting + the email subject) */
const AI = /chatgpt|openai|perplexity|gemini\.google|copilot|claude\.ai|you\.com|meta\.ai|grok/i;
export function channelOf(t?: Touch): string {
  if (!t) return "Direct";
  const src = (t.source || "").toLowerCase(), med = (t.medium || "").toLowerCase(), ref = (t.referrer || "").toLowerCase();
  if (t.gclid || t.gbraid || t.wbraid) return "Google Ads";
  if (t.msclkid) return "Microsoft Ads";
  if (AI.test(src) || AI.test(ref)) return /cpc|paid|ads/.test(med) ? "AI Assistant (paid)" : "AI Assistant";
  if (/cpc|ppc|paid|display|lsa/.test(med)) return src ? `Paid · ${src}` : "Paid";
  if (t.fbclid || /facebook|instagram|fb|ig|meta/.test(src + ref)) return "Facebook / Instagram";
  if (/gbp|google_business|maps/.test(src + med + (t.campaign || ""))) return "Google Business Profile";
  if (/nextdoor/.test(src + ref)) return "Nextdoor";
  if (/google|bing|duckduckgo|yahoo|ecosia/.test(src + ref)) return "Organic search";
  if (/email|sms|text/.test(med)) return `Owned · ${med}`;
  if (src || ref) { let host = ref; try { host = new URL(ref).hostname; } catch {} return `Referral · ${src || host}`; }
  return "Direct";
}

export function parseLead(b: Record<string, unknown>, meta: { ip?: string; userAgent?: string; fbp?: string; fbc?: string }): Lead | null {
  const name = clean(b.name, 120), phone = clean(b.phone, 40), email = clean(b.email, 160);
  /* Two shapes: the full estimate form (email + message required), and the
     quick "text me a price" request from content pages (name + phone only;
     the page context becomes the message). A phone number is the one thing
     every lead must have: it's how the owner closes. */
  const quick = clean(b.form, 20) === "quick";
  const message = clean(b.message) || (quick ? "Quick request from the website: please call or text with a price." : "");
  if (!name || !phone || !message || phone.replace(/\D/g, "").length < 10) return null;
  if (email ? !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) : !quick) return null;
  let attribution: Attribution = {};
  try { attribution = typeof b.attribution === "string" ? JSON.parse(b.attribution) : ((b.attribution as Attribution) ?? {}); } catch {}
  const base = {
    name, phone, email, message, city: clean(b.city, 80), service: clean(b.service, 30) || "other", timeline: clean(b.timeline, 20), budget: clean(b.budget, 20),
    contactPref: clean(b.contactPref, 20) || "call", smsConsent: b.smsConsent === "on" || b.smsConsent === true || b.smsConsent === "true",
    language: (clean(b.language, 2) === "es" ? "es" : "en") as Lead["language"], page: clean(b.page, 300),
  };
  return {
    id: randomUUID(), createdAt: new Date().toISOString(), ...base, attribution,
    channel: channelOf(attribution.last ?? attribution.first), ...score(base), ...meta,
  };
}

/* ---------- formatting ---------- */
const digits = (p: string) => p.replace(/\D/g, "").replace(/^(\d{10})$/, "1$1");

export function ownerEmail(l: Lead) {
  const t = l.attribution.last ?? l.attribution.first ?? {};
  const f = l.attribution.first ?? {};
  const subject = `[${l.grade} · ${l.score}] ${SERVICE_LABEL[l.service] ?? l.service} · ${l.city || "?"} · ${l.name}${l.language === "es" ? " · ESPAÑOL" : ""}`;
  const text = [
    `NEW LEAD — grade ${l.grade} (${l.score}/100)${l.inArea ? "" : " — OUTSIDE usual service area"}`,
    `Respond within 5 minutes: leads contacted fast close far more often.`,
    "",
    `Name:      ${l.name}`,
    `Phone:     ${l.phone}    call: tel:+${digits(l.phone)}   text: sms:+${digits(l.phone)}   WhatsApp: https://wa.me/${digits(l.phone)}`,
    `Email:     ${l.email || "(not given: quick request, reply by call/text)"}`,
    `Prefers:   ${l.contactPref}${l.smsConsent ? " (OK to text)" : ""}   Language: ${l.language === "es" ? "SPANISH" : "English"}`,
    `City:      ${l.city}`,
    `Service:   ${SERVICE_LABEL[l.service] ?? l.service}`,
    `Timeline:  ${TIMELINE_LABEL[l.timeline] ?? (l.timeline || "-")}`,
    `Budget:    ${BUDGET_LABEL[l.budget] ?? (l.budget || "-")}`,
    "",
    l.message,
    "",
    `— Source —`,
    `Channel:   ${l.channel}`,
    `Last touch: ${[t.source, t.medium, t.campaign, t.term].filter(Boolean).join(" / ") || "-"}  ref=${t.referrer || "-"}  landing=${t.landing || "-"}`,
    `First touch: ${[f.source, f.medium, f.campaign].filter(Boolean).join(" / ") || "-"}  ref=${f.referrer || "-"}  landing=${f.landing || "-"}`,
    `Click IDs: ${["gclid", "gbraid", "wbraid", "fbclid", "msclkid"].map((k) => (t as Record<string, string>)[k] ? `${k}=${(t as Record<string, string>)[k]}` : "").filter(Boolean).join("  ") || "-"}`,
    `Form page: ${l.page}`,
    `Lead ID:   ${l.id}   ${l.createdAt}`,
  ].join("\n");
  return { subject, text };
}

export function customerEmail(l: Lead) {
  const first = l.name.split(/\s+/)[0];
  if (l.language === "es") {
    return {
      subject: "Recibimos su solicitud — Z Construction & Remodeling",
      text: [
        `Hola ${first}:`,
        "",
        "Gracias por escribirnos. Recibimos su solicitud y le vamos a contactar en un día hábil (casi siempre el mismo día) para ponernos de acuerdo y pasar a ver su proyecto.",
        "",
        "Para darle un presupuesto más rápido y más preciso, puede contestar este correo con:",
        "  • 3 o 4 fotos del espacio (de lejos y de cerca)",
        "  • medidas aproximadas, si las tiene",
        "  • fotos o enlaces de ideas que le gusten",
        "",
        `Si es urgente, llámenos o mándenos mensaje al ${BRAND.phone}. Lo atendemos en español.`,
        "",
        "Saludos,",
        "Z Construction & Remodeling LLC",
        "Auburn, Alabama",
      ].join("\n"),
    };
  }
  return {
    subject: "We got your request — Z Construction & Remodeling",
    text: [
      `Hi ${first},`,
      "",
      "Thanks for reaching out. We received your request and will contact you within one business day (usually the same day) to set up a time to see the project.",
      "",
      "To speed up an accurate estimate, you can reply to this email with:",
      "  • 3–4 photos of the space (wide and close-up)",
      "  • rough measurements, if you have them",
      "  • photos or links of ideas you like",
      "",
      `If it's urgent, call or text ${BRAND.phone}.`,
      "",
      "Thanks,",
      "Z Construction & Remodeling LLC",
      "Auburn, Alabama",
    ].join("\n"),
  };
}

/* ---------- delivery channels ---------- */
type Result = { channel: string; ok: boolean; skipped?: boolean; error?: string };

async function resendSend(msg: { to: string; subject: string; text: string; replyTo?: string }) {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = process.env.QUOTE_FROM_EMAIL || `Z Construction <quotes@${new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").hostname}>`;
  const { error } = await resend.emails.send({ from, to: [msg.to], subject: msg.subject, text: msg.text, replyTo: msg.replyTo });
  if (error) throw new Error(error.message);
}

async function twilioSend(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID!, token = process.env.TWILIO_AUTH_TOKEN!, from = process.env.TWILIO_FROM!;
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });
  if (!r.ok) throw new Error(`twilio ${r.status}`);
}

const sha = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

async function metaCapi(l: Lead) {
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID!, token = process.env.META_CAPI_TOKEN!;
  const v = process.env.META_GRAPH_VERSION || "v24.0";
  const [fn, ...rest] = l.name.split(/\s+/);
  const body = {
    data: [{
      event_name: "Lead", event_time: Math.floor(Date.now() / 1000), event_id: l.id, action_source: "website", event_source_url: l.page,
      user_data: {
        ...(l.email ? { em: [sha(l.email)] } : {}), ph: [sha(digits(l.phone))], fn: [sha(fn)], ...(rest.length ? { ln: [sha(rest.join(" "))] } : {}),
        ct: l.city ? [sha(l.city.replace(/[^a-z]/gi, ""))] : undefined, st: [sha("al")], country: [sha("us")],
        client_ip_address: l.ip, client_user_agent: l.userAgent, fbp: l.fbp, fbc: l.fbc,
      },
      custom_data: { content_name: l.service, lead_grade: l.grade, currency: "USD" },
    }],
    ...(process.env.META_TEST_EVENT_CODE ? { test_event_code: process.env.META_TEST_EVENT_CODE } : {}),
  };
  const r = await fetch(`https://graph.facebook.com/${v}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`meta capi ${r.status}`);
}

async function webhook(l: Lead) {
  const r = await fetch(process.env.LEAD_WEBHOOK_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(process.env.LEAD_WEBHOOK_SECRET ? { "X-Lead-Secret": process.env.LEAD_WEBHOOK_SECRET } : {}) },
    body: JSON.stringify({
      ...l, serviceLabel: SERVICE_LABEL[l.service] ?? l.service, timelineLabel: TIMELINE_LABEL[l.timeline] ?? l.timeline, budgetLabel: BUDGET_LABEL[l.budget] ?? l.budget,
      gclid: l.attribution.last?.gclid ?? l.attribution.first?.gclid ?? "", fbclid: l.attribution.last?.fbclid ?? "", msclkid: l.attribution.last?.msclkid ?? "",
      utm_source: l.attribution.last?.source ?? "", utm_medium: l.attribution.last?.medium ?? "", utm_campaign: l.attribution.last?.campaign ?? "", utm_term: l.attribution.last?.term ?? "",
      landing: l.attribution.first?.landing ?? "", referrer: l.attribution.first?.referrer ?? "",
    }),
  });
  if (!r.ok) throw new Error(`webhook ${r.status}`);
}

async function run(channel: string, enabled: boolean, fn: () => Promise<void>): Promise<Result> {
  if (!enabled) return { channel, ok: false, skipped: true };
  try { await fn(); return { channel, ok: true }; } catch (e) { console.error(`[lead] ${channel} failed`, e); return { channel, ok: false, error: String(e) }; }
}

/* Free instant alert to the owner's phone: a Telegram bot message (no
   per-message cost, unlike SMS). Setup: message @BotFather → /newbot → copy
   the token; send the bot any message, then open
   https://api.telegram.org/bot<TOKEN>/getUpdates to read your chat id. */
async function telegramSend(text: string) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  });
  if (!r.ok) throw new Error(`telegram ${r.status}`);
}

export async function deliver(l: Lead): Promise<{ delivered: boolean; results: Result[] }> {
  const env = process.env;
  const owner = ownerEmail(l);
  const ownerTo = env.QUOTE_TO_EMAIL || BRAND.email;
  const results = await Promise.all([
    run("owner-email", !!env.RESEND_API_KEY, () => resendSend({ to: ownerTo, subject: owner.subject, text: owner.text, replyTo: l.email || undefined })),
    run("owner-sms", !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM && env.LEAD_ALERT_SMS_TO), () =>
      Promise.all(env.LEAD_ALERT_SMS_TO!.split(",").map((to) => twilioSend(to.trim(),
        `New ${l.grade} lead (${l.score}) ${l.language === "es" ? "ES " : ""}— ${l.name}, ${SERVICE_LABEL[l.service] ?? l.service}, ${l.city}. ${TIMELINE_LABEL[l.timeline] ?? ""} ${BUDGET_LABEL[l.budget] ?? ""}. Prefers ${l.contactPref}. ${l.phone} · via ${l.channel}`.slice(0, 320)))).then(() => {})),
    run("customer-email", !!env.RESEND_API_KEY && env.LEAD_AUTOREPLY !== "0" && !!l.email, () => { const m = customerEmail(l); return resendSend({ to: l.email, subject: m.subject, text: m.text, replyTo: ownerTo }); }),
    // Texting the homeowner requires their consent (checkbox) and a registered A2P 10DLC number.
    run("customer-sms", !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_FROM && env.LEAD_SMS_AUTOREPLY === "1" && l.smsConsent), () =>
      twilioSend(`+${digits(l.phone)}`, l.language === "es"
        ? `Z Construction: Hola ${l.name.split(/\s+/)[0]}, recibimos su solicitud. Le llamamos pronto. Si gusta, mande fotos del espacio por aquí. Responda STOP para no recibir mensajes.`
        : `Z Construction: Hi ${l.name.split(/\s+/)[0]}, we got your request and will call you shortly. Feel free to text photos of the space here. Reply STOP to opt out.`)),
    run("owner-telegram", !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID), () => telegramSend(
      `${l.grade} lead ${l.language === "es" ? "· ESPAÑOL " : ""}— ${l.name}\n${SERVICE_LABEL[l.service] ?? l.service} · ${l.city || "?"}\n${l.message.slice(0, 400)}\n\nCall: tel:+${digits(l.phone)}\nWhatsApp: https://wa.me/${digits(l.phone)}\nvia ${l.channel}`)),
    run("webhook", !!env.LEAD_WEBHOOK_URL, () => webhook(l)),
    run("meta-capi", !!(env.NEXT_PUBLIC_META_PIXEL_ID && env.META_CAPI_TOKEN), () => metaCapi(l)),
  ]);
  const reachedOwner = results.some((r) => r.ok && ["owner-email", "owner-sms", "owner-telegram", "webhook"].includes(r.channel));
  return { delivered: reachedOwner, results };
}
