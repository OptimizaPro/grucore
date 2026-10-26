"use client";
import { useRef, useState } from "react";
import type { SiteContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { submitLead, type LeadLabels } from "@/lib/submit-lead";
import { track } from "@/lib/track";

/* Two fields, one button: the lowest-effort way to become a lead. For the
   reader who has a number in mind (from a guide or the estimator) but won't
   do a full form. The owner calls or texts back by hand, so there's no
   paid SMS in the loop. `context` becomes the lead's message, so the owner
   knows exactly what they were reading. */
export default function QuickLead({ locale, t, labels, err, service, context, dark = false, where }: { locale: Locale; t: SiteContent["funnel"]; labels: LeadLabels; err: string; service: string; context: string; dark?: boolean; where: string }) {
  const f = t;
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const started = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setStatus("sending");
    const { ok } = await submitLead(locale, { ...data, form: "quick", service, contactPref: "text", smsConsent: "on", message: `${context}\n(${where})` }, labels);
    setStatus(ok ? "ok" : "error");
    track(ok ? "quick_lead" : "quick_lead_error", { where, service });
  }

  const input = `w-full h-12 rounded-full border px-5 text-step-0 focus:outline-none focus:ring-2 focus:ring-amber/50 ${dark ? "border-hairline-d-strong bg-bone/[.06] text-bone placeholder:text-bone/50" : "border-hairline-strong bg-white text-ink placeholder:text-muted"}`;
  if (status === "ok") return <p className={`rounded-card p-4 text-step--1 ${dark ? "bg-bone/[.06] text-bone" : "bg-bone text-ink"}`} role="status">{f.ok}</p>;

  return (
    <form onSubmit={onSubmit} onFocus={() => { if (!started.current) { started.current = true; track("quick_lead_start", { where, service }); } }} className="grid gap-2" aria-label={f.quickH}>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <label className="sr-only" htmlFor={`ql-name-${where}`}>{f.name}</label>
        <input id={`ql-name-${where}`} name="name" required autoComplete="given-name" placeholder={f.name} className={input} />
        <label className="sr-only" htmlFor={`ql-phone-${where}`}>{f.phone}</label>
        <input id={`ql-phone-${where}`} name="phone" type="tel" required inputMode="tel" autoComplete="tel" pattern="[\d\s()+.\-]{10,}" placeholder={f.phone} className={input} />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <button className="btn btn--solid h-12" disabled={status === "sending"}>{status === "sending" ? f.sending : f.send}</button>
      </div>
      <p className={`text-[.78rem] ${dark ? "text-bone/60" : "text-muted"}`}>{status === "error" ? err : f.consent}</p>
    </form>
  );
}
