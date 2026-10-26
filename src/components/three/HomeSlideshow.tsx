"use client";
/* Full-bleed crossfading slideshow of finished homes, sitting underneath the
   WebGL layer. Only three slides are ever mounted (previous, current, next)
   so the GPU isn't compositing eight full-screen images. The incoming slide
   fades in on top of the outgoing one, which stays opaque underneath, so the
   crossfade never dips to the dark ground. Each slide drifts with a slow
   Ken Burns zoom (transform only). Reduced motion: first slide, static. */
import Image from "next/image";
import { useEffect, useState } from "react";
import { photo, photoPos, type PhotoKey } from "@/lib/brand";

const SLIDES: PhotoKey[] = ["hero", "kitchen1", "houseWhite", "bathVanityAfter", "porch2", "kitchen2", "porch1", "bathTubAfterWide"];
const INTERVAL = 6500;

export default function HomeSlideshow({ active, reduced }: { active: boolean; reduced: boolean }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!active || reduced) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") setIdx((i) => (i + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [active, reduced]);

  const n = SLIDES.length;
  const prev = (idx - 1 + n) % n;
  const next = (idx + 1) % n;
  const mounted = reduced ? [idx] : Array.from(new Set([prev, idx, next]));

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      {mounted.map((i) => {
        const role = i === idx ? "current" : i === prev ? "prev" : "next";
        return (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-[cubic-bezier(.45,0,.15,1)]"
            style={{ opacity: role === "next" ? 0 : 1, zIndex: role === "current" ? 2 : 1 }}
          >
            <Image
              src={photo(SLIDES[i], 2000)}
              alt=""
              fill
              sizes="100vw"
              quality={70}
              priority={i === 0}
              style={photoPos(SLIDES[i]) ? { objectPosition: photoPos(SLIDES[i]) } : undefined}
              className={`object-cover ${role !== "next" && !reduced ? (i % 2 ? "kenburns kenburns--alt" : "kenburns") : ""}`}
            />
          </div>
        );
      })}
    </div>
  );
}
