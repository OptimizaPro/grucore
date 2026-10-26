"use client";
import { useEffect, useRef, useState } from "react";

/* Live filter for the question hub. The questions themselves are
   server-rendered (so every answer is in the HTML Google indexes); this only
   hides non-matching ones. Accent- and case-insensitive, so "baño" matches
   "bano" and "permit" matches "Permits". */
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export default function HelpFilter({ target, label, placeholder, empty, showing }: { target: string; label: string; placeholder: string; empty: string; showing: string }) {
  const [q, setQ] = useState("");
  const [count, setCount] = useState<[number, number] | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const root = document.getElementById(target);
    if (!root) return;
    const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
    const items = [...root.querySelectorAll<HTMLElement>("[data-q]")];
    let shown = 0;
    for (const el of items) {
      const hit = terms.every((t) => el.dataset.q!.includes(t));
      el.hidden = !hit;
      if (hit) shown++;
      if (el instanceof HTMLDetailsElement) el.open = terms.length > 0 && hit;
    }
    for (const g of root.querySelectorAll<HTMLElement>("[data-group]")) g.hidden = !g.querySelector("[data-q]:not([hidden])");
    setCount(terms.length ? [shown, items.length] : null);
  }, [q, target]);

  /* "/" focuses the box, like most help centers. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "/" && document.activeElement?.tagName !== "INPUT") { e.preventDefault(); input.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="grid gap-2">
      <label htmlFor="help-q" className="slate text-muted">{label}</label>
      <input ref={input} id="help-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} autoComplete="off" enterKeyHint="search"
        className="w-full h-14 rounded-full border border-hairline-strong bg-bone px-6 text-step-0 text-ink placeholder:text-muted focus:outline-none focus:border-navy focus:ring-2 focus:ring-amber/40" />
      <p className="min-h-[1.4em] text-step--1 text-muted" aria-live="polite">
        {count && (count[0] ? showing.replace("{n}", String(count[0])).replace("{total}", String(count[1])) : empty)}
      </p>
    </div>
  );
}
