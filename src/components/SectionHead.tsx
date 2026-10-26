import { Reveal } from "./motion";

export default function SectionHead({ eyebrow, h, lede, dark = false, right }: { eyebrow?: string; h: string; lede?: string; dark?: boolean; right?: React.ReactNode }) {
  return (
    <div className="grid gap-4 items-end mb-10 md:mb-14 lg:grid-cols-[1.1fr_.9fr] lg:gap-gutter">
      <Reveal>
        {eyebrow && <span className={`eyebrow mb-4 ${dark ? "text-amber" : "text-amber-deep"}`}>{eyebrow}</span>}
        <h2 className={`d h-md max-w-[16ch] ${dark ? "text-bone" : "text-navy"}`}>{h}</h2>
      </Reveal>
      {(lede || right) && (
        <Reveal delay={0.1} className="lg:justify-self-end lg:mb-1">
          {right ?? <p className={`lede ${dark ? "text-muted-d" : "text-muted"}`}>{lede}</p>}
        </Reveal>
      )}
    </div>
  );
}
