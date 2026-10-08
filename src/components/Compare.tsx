"use client";
import { useState } from "react";
import Photo from "./Photo";
import type { PhotoKey } from "@/lib/content";

/* Before/after. `portrait` is for phone photos taken upright: a tall frame
   (3:4, capped in width) instead of 4:3, so nothing important is cropped away.
   On phones a drag slider hides half of each photo and is easy
   to fumble, so below 40rem the pair is simply stacked with labels; from
   40rem up it becomes the draggable comparison. The hidden variant's images
   never load (display:none never intersects the viewport). */
export default function Compare({ before, after, altBefore, altAfter, labels, ariaLabel, sizes = "(min-width: 64rem) 50vw, 100vw", portrait = false }:
  { before: PhotoKey; after: PhotoKey; altBefore: string; altAfter: string; labels: [string, string]; ariaLabel: string; sizes?: string; portrait?: boolean }) {
  const [pos, setPos] = useState(50);
  const tag = (t: string, after = false) => (
    <span className={`absolute top-3.5 slate rounded px-2.5 py-1.5 pointer-events-none ${after ? "right-3.5 bg-amber text-navy-2" : "left-3.5 bg-navy-2/80 text-bone"}`}>{t}</span>
  );
  return (
    <>
      <div className={`grid gap-3 sm:hidden ${portrait ? "grid-cols-2" : ""}`}>
        <div className={`relative overflow-hidden rounded-card bg-navy-2 ${portrait ? "aspect-[3/4]" : "aspect-[4/3]"}`}><Photo k={before} alt={altBefore} sizes={portrait ? "50vw" : "100vw"} />{tag(labels[0])}</div>
        <div className={`relative overflow-hidden rounded-card bg-navy-2 ${portrait ? "aspect-[3/4]" : "aspect-[4/3]"}`}><Photo k={after} alt={altAfter} sizes={portrait ? "50vw" : "100vw"} />{tag(labels[1], true)}</div>
      </div>
      <div className={`compare hidden sm:block ${portrait ? "compare--portrait" : ""}`} style={{ ["--pos" as string]: `${pos}%` }}>
        <Photo k={before} alt={altBefore} sizes={sizes} />
        <div className="compare__after absolute inset-0"><Photo k={after} alt={altAfter} sizes={sizes} /></div>
        {tag(labels[0])}{tag(labels[1], true)}
        <div className="compare__handle" />
        <input className="compare__range" type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label={ariaLabel} />
      </div>
    </>
  );
}
