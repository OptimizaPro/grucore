import { BRAND, CONTENT } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function PrivacyPage({ locale }: { locale: Locale }) {
  const p = CONTENT[locale].privacy;
  return (
    <section className="bg-bone pt-[calc(var(--barh)+6rem)] pb-20" data-tone="light">
      <div className="shell max-w-[48rem]">
        <span className="eyebrow text-amber-deep mb-4">{p.eyebrow}</span>
        <h1 className="d d-lg text-navy">{p.h1}</h1>
        <p className="slate text-muted mt-3 mb-10">{p.updated} · {BRAND.name}</p>
        {p.sections.map((s) => (
          <section key={s.h} className="mb-8">
            <h2 className="d text-step-2 text-navy mb-2">{s.h}</h2>
            {s.p.map((x) => <p key={x} className="text-muted mb-3">{x}</p>)}
          </section>
        ))}
        <p className="text-muted">{BRAND.name} · {BRAND.city}, {BRAND.region} {BRAND.zip} · <a className="underline" href={`mailto:${BRAND.email}`}>{BRAND.email}</a> · <a className="underline" href={`tel:${BRAND.tel}`}>{BRAND.phone}</a></p>
      </div>
    </section>
  );
}
