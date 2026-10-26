"use client";
/* A little drafting-table readout in the hero: live cursor coordinates and
   the grid spec. Pure flavor, desktop only, one rAF-throttled listener. */
import { useEffect, useRef } from "react";

export default function BlueprintHud() {
  const x = useRef<HTMLSpanElement>(null);
  const y = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0; let px = 0; let py = 0;
    const onMove = (e: PointerEvent) => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(paint); };
    const paint = () => { raf = 0; if (x.current) x.current.textContent = ((px / window.innerWidth) * 2 - 1).toFixed(3); if (y.current) y.current.textContent = (-((py / window.innerHeight) * 2 - 1)).toFixed(3); };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <div aria-hidden="true" className="absolute right-gutter top-[calc(var(--barh)+4.5rem)] hidden lg:grid gap-1 font-mono text-[.66rem] tracking-[.16em] uppercase text-bone/60 text-right">
      <span>Grid 120 × 74 · Plane 18 × 11</span>
      <span>X <span ref={x} className="text-amber-bright">0.000</span> · Y <span ref={y} className="text-amber-bright">0.000</span></span>
      <span>Auburn, AL · 32.6099 N · 85.4808 W</span>
    </div>
  );
}
