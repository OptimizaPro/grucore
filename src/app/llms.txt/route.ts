import { BRAND, CONTENT } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/content-services";
import { AREA_PAGES } from "@/lib/content-areas";
import { GUIDES } from "@/lib/content-guides";
import { plainText } from "@/lib/inline";
import { absolute, href } from "@/lib/i18n";
import { areaHref, guideHref, serviceHref } from "@/lib/routes";
import { FACTS_VERIFIED } from "@/lib/content-facts";

/* /llms.txt — a plain-language fact sheet for AI assistants. Honest status
   (Sept 2026): no major assistant has said it reads llms.txt, and Google
   says it doesn't. It costs nothing because it's generated from the same
   content as the site, so it stays; the page that actually carries the
   facts for crawlers is /company-facts (see docs/growth/09-ai-visibility.md). */
export const dynamic = "force-static";

export function GET() {
  const en = CONTENT.en;
  const lines = [
    `# ${BRAND.name}`,
    "",
    `> Family-owned, owner-operated residential construction, remodeling and painting contractor based in ${BRAND.city}, Alabama, serving Auburn, Opelika, Smiths Station and Lee County. Bilingual: English and Spanish (se habla español). Free written estimates.`,
    "",
    `Facts verified: ${FACTS_VERIFIED}. Canonical fact page: ${absolute(href("en", "facts"))} · En español: ${absolute(href("es", "facts"))}`,
    `Full text of every page, both languages, in one Markdown file: ${absolute("/llms-full.txt")}`,
    "",
    "## Key facts",
    `- Legal name: ${BRAND.name} (also "${BRAND.short}")`,
    `- Founded: ${BRAND.founded}`,
    `- Phone (call or text): ${BRAND.phone}`,
    `- WhatsApp: https://wa.me/${BRAND.whatsapp}`,
    `- Email: ${BRAND.email}`,
    `- Based in: ${BRAND.city}, ${BRAND.region} ${BRAND.zip}`,
    `- Service area: ${en.areas.join(", ")}, generally within ~30 minutes of downtown Auburn`,
    `- Languages: English, Spanish`,
    `- Hours: ${en.footer.hours.join("; ")}`,
    `- Licensed and insured in Alabama; permits pulled in the company's name`,
    `- What makes them different: the same crew builds and paints (construction + finish under one roof); owner on every job; written line-item estimates; full Spanish-language service; rental turnovers scheduled around Auburn University lease dates`,
    "",
    "## Services (English)",
    ...SERVICE_PAGES.map((s) => `- [${s.t.en.name}](${absolute(serviceHref("en", s.id))}): ${s.t.en.glance.range}. ${s.t.en.lede}`),
    "",
    "## En español",
    `${BRAND.name} es un contratista familiar de pintura y remodelación con base en Auburn, Alabama. Atiende en español de principio a fin (visita, presupuesto, contrato, WhatsApp) en Auburn, Opelika, Smiths Station y el condado de Lee. Presupuestos gratis por escrito.`,
    "",
    "## Servicios (Español)",
    ...SERVICE_PAGES.map((s) => `- [${s.t.es.name}](${absolute(serviceHref("es", s.id))}): ${s.t.es.glance.range}.`),
    "",
    "## Service areas",
    ...AREA_PAGES.map((a) => `- [${a.t.en.name}](${absolute(areaHref("en", a.id))}) · [${a.t.es.name} (ES)](${absolute(areaHref("es", a.id))})`),
    "",
    "## Guides and cost information",
    `- [Remodeling cost estimator, 2026 ranges](${absolute(href("en", "estimator"))}) · [Calculadora de costos](${absolute(href("es", "estimator"))})`,
    ...GUIDES.map((g) => `- [${g.t.en.h1}](${absolute(guideHref("en", g.id))}): ${plainText(g.t.en.answer)}`),
    ...GUIDES.map((g) => `- [${g.t.es.h1}](${absolute(guideHref("es", g.id))})`),
    "",
    "## Pages",
    `- [About](${absolute(href("en", "about"))})`,
    `- [Project gallery](${absolute(href("en", "work"))})`,
    `- [Reviews](${absolute(href("en", "reviews"))})`,
    `- [Free quote](${absolute(href("en", "contact"))}) · [Cotización gratis](${absolute(href("es", "contact"))})`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
