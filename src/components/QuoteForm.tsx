"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Arrow } from "./Icons";
import type { SiteContent } from "@/lib/content";
import { href, type Locale } from "@/lib/i18n";
import { submitLead } from "@/lib/submit-lead";
import { track } from "@/lib/track";

/* The quote form. Also embedded on every service and town page, so it takes
   an optional preset service; ?service= and ?note= (from the cost estimator)
   override it. Budget + timeline feed lead scoring; attribution rides along
   so every lead says which ad, search or AI assistant produced it. */
export default function QuoteForm({ locale, t, service, compact = false }: { locale: Locale; t: SiteContent["contact"]; service?: string; compact?: boolean }) {
  const c = t;
  const router = useRouter();
  const params = useSearchParams();
  const preset = params.get("service") ?? service ?? "";
  const note = params.get("note") ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const started = useRef(false);
  const id = (k: string) => (compact ? `q-${k}` : k);

  const onStart = () => {
    if (started.current) return;
    started.current = true;
    track("form_start", { form: compact ? "inline" : "contact", service: preset || "none" });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    for (const i of [0, 1, 2]) { if (!stepValid(i)) { setStep(i); return; } }
    setStatus("sending");
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    try {
      const { ok } = await submitLead(locale, data, c);
      if (!ok) throw new Error("not delivered");
      router.push(href(locale, "thanks"));
    } catch { setStatus("error"); }
  }

  const select = (name: string, label: string, options: { v: string; l: string }[], value = "") => (
    <div className="field" key={name}><label htmlFor={id(name)}>{label}</label>
      <select id={id(name)} name={name} defaultValue={value}><option value="">{c.f.select}</option>{options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}</select></div>
  );

  /* Three short screens. Project questions come first because they are easy
     and they commit the visitor; name and phone come last (the field people
     abandon on). Every field stays in the one <form>, so the payload and the
     server validation are unchanged; inactive steps are hidden, not unmounted. */
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const stepValid = (i: number) => {
    const root = formRef.current?.querySelector<HTMLElement>(`[data-step="${i}"]`);
    const fields = Array.from(root?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea") ?? []);
    const bad = fields.find((f) => !f.checkValidity());
    if (bad) { bad.reportValidity(); return false; }
    return true;
  };
  const go = (i: number) => {
    if (i > step && !stepValid(step)) return;
    setStep(i);
    track("form_step", { form: compact ? "inline" : "contact", step: i + 1 });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const stepCls = (i: number) => `grid gap-4 ${i === step ? "" : "hidden"}`;

  return (
    <form ref={formRef} className="grid gap-5 mt-6 scroll-mt-28" onSubmit={onSubmit} onFocus={onStart} noValidate data-track={compact ? "inline-form" : "contact-form"}>
      <p className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true"><label>{c.f.honeypot} <input name="company" tabIndex={-1} autoComplete="off" /></label></p>

      {/* progress */}
      <ol className="grid grid-cols-3 gap-2" aria-label={c.f.stepOf.replace("{n}", String(step + 1))}>
        {c.f.steps.map((label, i) => (
          <li key={label} className="grid gap-2" aria-current={i === step ? "step" : undefined}>
            <span className={`h-1 rounded-full ${i <= step ? "bg-amber" : "bg-hairline"}`} />
            <span className={`font-mono text-[.66rem] tracking-[.12em] uppercase ${i === step ? "text-ink" : "text-muted"}`}>{i + 1}. {label}</span>
          </li>
        ))}
      </ol>

      <div data-step="0" className={stepCls(0)}>
        <div className="grid gap-4 sm:grid-cols-2">
          {select("service", c.f.service, c.serviceOptions, preset)}
          {select("timeline", c.f.timeline, c.timelineOptions)}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {select("budget", c.f.budget, c.budgetOptions)}
          <div className="field"><label htmlFor={id("city")}>{c.f.city} *</label><input id={id("city")} name="city" type="text" autoComplete="address-level2" placeholder={c.f.cityPh} required /></div>
        </div>
      </div>

      <div data-step="1" className={stepCls(1)}>
        <div className="field"><label htmlFor={id("message")}>{c.f.message} *</label><textarea id={id("message")} name="message" required placeholder={c.f.messagePh} defaultValue={note} /></div>
      </div>

      <div data-step="2" className={stepCls(2)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field"><label htmlFor={id("name")}>{c.f.name} *</label><input id={id("name")} name="name" type="text" autoComplete="name" required /></div>
          <div className="field"><label htmlFor={id("phone")}>{c.f.phone} *</label><input id={id("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" required minLength={10} /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field"><label htmlFor={id("email")}>{c.f.email} *</label><input id={id("email")} name="email" type="email" autoComplete="email" required /></div>
          {select("contactPref", c.f.contactPref, c.contactOptions, c.contactOptions[0].v)}
        </div>
        <label className="flex gap-3 items-start text-step--1 text-muted cursor-pointer">
          <input type="checkbox" name="smsConsent" className="mt-1 w-4 h-4 shrink-0 accent-[var(--color-amber-deep)]" />
          <span>{c.f.smsConsent} <Link className="underline" href={href(locale, "privacy")}>{c.f.privacy}</Link></span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        {step > 0 && <button type="button" className="btn btn--line" onClick={() => go(step - 1)}>{c.f.back}</button>}
        {step < 2
          ? <button type="button" className="btn btn--solid" onClick={() => go(step + 1)}>{c.f.next} <Arrow /></button>
          : <button className="btn btn--solid" type="submit" disabled={status === "sending"}>{status === "sending" ? c.f.sending : c.f.send} <Arrow /></button>}
        <p className="font-mono text-[.72rem] tracking-[.1em] uppercase text-muted max-w-[34ch] leading-relaxed">{c.f.note}</p>
      </div>
      {status === "error" && <div role="status" className="rounded-[10px] bg-[#fbe8e5] text-[#8f2a1f] px-4 py-4 font-semibold">{c.f.err}</div>}
    </form>
  );
}
