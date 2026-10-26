import { BRAND, CONTENT } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/content-services";
import { AREA_PAGES } from "@/lib/content-areas";
import { GUIDES } from "@/lib/content-guides";
import { ESTIMATOR, money } from "@/lib/estimator";
import { absolute, href, LOCALES, type Locale } from "@/lib/i18n";
import { areaHref, guideHref, serviceHref } from "@/lib/routes";
import { markdown } from "@/lib/inline";
import { HELP } from "@/lib/content-help";
import { FACTS, FACTS_VERIFIED } from "@/lib/content-facts";

/* /llms-full.txt — the whole site as one Markdown document, both languages,
   for AI assistants that read a site in a single fetch (the llms.txt
   convention's "full" companion). Generated from the same content modules
   as the pages, so it can never disagree with them. */
export const dynamic = "force-static";

export function GET() {
  const out: string[] = [`# ${BRAND.name} — full site content`, "", `> ${CONTENT.en.meta.home.description}`, "", `Phone: ${BRAND.phone} · WhatsApp: https://wa.me/${BRAND.whatsapp} · Email: ${BRAND.email} · ${BRAND.city}, ${BRAND.region} · English and Spanish`, ""];

  /* Company facts first: the same rows and answers as /company-facts. */
  const f = FACTS.en;
  out.push(`## ${f.glanceH} (${f.verified.toLowerCase()} ${FACTS_VERIFIED})`, `URL: ${absolute(href("en", "facts"))} · ES: ${absolute(href("es", "facts"))}`, "", ...f.glance.map(([k, v]) => `- **${k}:** ${v}`), "");
  for (const q of f.qa) out.push(`### ${q.h}`, "", ...q.p.map((x) => markdown(x, "en")), "");

  out.push("## 2026 price ranges, Lee County, AL (installed, labor + materials, mid-range finish)", "", "| Project | Scope | Range |", "|---|---|---|");
  for (const d of Object.values(ESTIMATOR)) for (const t of d.tiers) out.push(`| ${d.l.en} | ${t.l.en}: ${t.d.en} | ${money(t.lo)}–${money(t.hi)} |`);
  out.push("", `Standard finishes run about 15% less, premium about 30% more. Calculator: ${absolute(href("en", "estimator"))}`, "");

  for (const locale of LOCALES as readonly Locale[]) {
    const md = (x: string) => markdown(x, locale);
    out.push(locale === "en" ? "# English" : "# Español", "");
    if (locale === "es") {
      const fe = FACTS.es;
      out.push(`## ${fe.glanceH} (${fe.verified.toLowerCase()} ${FACTS_VERIFIED})`, `URL: ${absolute(href("es", "facts"))}`, "", ...fe.glance.map(([k, v]) => `- **${k}:** ${v}`), "");
      for (const q of fe.qa) out.push(`### ${q.h}`, "", ...q.p.map(md), "");
    }
    out.push(locale === "en" ? "## Services" : "## Servicios", "");
    for (const s of SERVICE_PAGES) {
      const t = s.t[locale];
      out.push(`### ${t.name}`, `URL: ${absolute(serviceHref(locale, s.id))}`, "", t.lede, "", ...t.intro, "", `- ${t.glance.timeline}`, `- ${t.glance.range}`, `- ${t.glance.permit}`, "");
      out.push(...t.included.map((x) => `- ${x}`), "");
      for (const f of t.faq) out.push(`**${f.q}** ${f.a}`, "");
    }
    out.push(locale === "en" ? "## Service areas" : "## Zonas de servicio", "");
    for (const a of AREA_PAGES) {
      const t = a.t[locale];
      out.push(`### ${t.name}`, `URL: ${absolute(areaHref(locale, a.id))}`, "", t.lede, "", ...t.intro, "", ...t.local.map((l) => `- **${l.h}.** ${l.p}`), "");
      for (const f of t.faq) out.push(`**${f.q}** ${f.a}`, "");
    }
    const h = HELP[locale];
    if (h) {
      out.push(`## ${h.h1}`, `URL: ${absolute(href(locale, "help"))}`, "");
      for (const g of h.groups) { out.push(`### ${g.h}`, ""); for (const x of g.qs) out.push(`**${x.q}** ${md(x.a)}`, ""); }
      if (h.local.length) out.push(`### ${h.localH}`, "", `| ${h.localCols.join(" | ")} |`, "|---|---|---|", ...h.local.map((f) => `| ${f.label} | ${md(f.auburn)} | ${md(f.opelika)}${f.note ? ` (${md(f.note)})` : ""} |`), "");
      out.push(`### ${h.glossaryH}`, "", ...h.glossary.map((t) => `- **${t.term}:** ${md(t.def)}`), "");
    }
    out.push(locale === "en" ? "## Guides" : "## Guías", "");
    for (const g of GUIDES) {
      const t = g.t[locale];
      out.push(`### ${t.h1}`, `URL: ${absolute(guideHref(locale, g.id))} · ${locale === "en" ? "Updated" : "Actualizada"} ${g.updated}`, "", `**${locale === "en" ? "Short answer" : "Respuesta corta"}:** ${md(t.answer)}`, "");
      for (const sec of t.sections) {
        out.push(`#### ${sec.h}`, "", ...(sec.p ?? []).map(md));
        if (sec.list) out.push(...sec.list.map((x) => `- ${md(x)}`));
        if (sec.table) out.push("", `| ${sec.table.head.join(" | ")} |`, `|${sec.table.head.map(() => "---").join("|")}|`, ...sec.table.rows.map((r) => `| ${r.join(" | ")} |`));
        out.push("");
      }
      for (const f of t.faq) out.push(`**${f.q}** ${md(f.a)}`, "");
      if (g.sources?.length) out.push(locale === "en" ? "Sources:" : "Fuentes:", ...g.sources.map((s) => `- [${s.name}](${s.url})`), "");
    }
  }
  return new Response(out.join("\n"), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
