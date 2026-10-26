"use client";
import { useState } from "react";
import Photo from "./Photo";
import Compare from "./Compare";
import { Reveal } from "./motion";
import type { GalleryCell } from "@/lib/content";

export default function GalleryGrid({ cells, filters, filterLabel, labels, compareLabel, beforeAfterText }:
  { cells: GalleryCell[]; filters: { v: string; l: string }[]; filterLabel: string; labels: [string, string]; compareLabel: string; beforeAfterText: string }) {
  const [f, setF] = useState("all");
  const visible = cells.filter((c) => f === "all" || c.cat === f || (f === "compare" && c.kind === "compare"));
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-9" role="group" aria-label={filterLabel}>
        {filters.map((x) => (
          <button key={x.v} type="button" aria-pressed={f === x.v} onClick={() => setF(x.v)}
            className={`rounded-full border px-4 py-2 font-mono text-[.72rem] tracking-[.12em] uppercase transition-colors ${f === x.v ? "bg-navy text-bone border-navy" : "border-hairline-strong hover:border-ink"}`}>{x.l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 [grid-auto-flow:dense]">
        {visible.map((c, i) => c.kind === "compare" ? (
          <Reveal key={c.title + i} delay={(i % 4) * 0.07} className={c.portrait ? "col-span-2 sm:col-span-1 lg:col-span-2" : "col-span-2"}>
            <Compare before={c.before!} after={c.after!} altBefore={c.altBefore!} altAfter={c.altAfter!} labels={labels} ariaLabel={compareLabel} portrait={c.portrait} />
            <figcaption className="pt-3.5"><b className="block font-display uppercase text-step-1 leading-none text-navy">{c.title}</b><span className="slate text-muted">{c.meta} · {beforeAfterText}</span></figcaption>
          </Reveal>
        ) : (
          <Reveal key={c.title + i} delay={(i % 4) * 0.07}
            className={`cell relative overflow-hidden rounded-card bg-navy-2 text-bone ${c.kind === "wide" ? "col-span-2 aspect-[16/10]" : c.kind === "tall" ? "sm:row-span-2 aspect-[3/4] sm:aspect-[3/5]" : "aspect-[3/4]"}`}>
            <Photo k={c.photo!} alt={c.alt ?? c.title} sizes="(min-width: 64rem) 25vw, 50vw" />
            <figcaption className="cell__cap absolute inset-x-0 bottom-0 p-4 bg-[linear-gradient(180deg,transparent,rgba(15,26,46,.85))]"><b className="block font-display uppercase text-step-1 leading-none">{c.title}</b><span className="slate">{c.meta}</span></figcaption>
          </Reveal>
        ))}
      </div>
    </>
  );
}
