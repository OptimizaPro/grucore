/* ---------------------------------------------------------------------------
   Company facts (/company-facts, /es/datos-de-la-empresa): the one page an
   AI assistant, a journalist or a directory editor can quote about the
   business without reading the whole site. Dated, with a changelog, and
   built from BRAND / CONTENT / SERVICE_PAGES so it can never disagree with
   the rest of the site.

   Why it exists: Google, Bing and ChatGPT search pull answers from visible
   passages, not from JSON-LD alone, and AI answers skew toward recently
   updated pages. Every section here opens with the company's full name and
   answers one question an assistant fans a query out into ("is it
   licensed?", "does it speak Spanish?", "what does it charge?").

   Rule: restate only what content.ts and the service pages already claim.
   Placeholders (license number) stay hidden until they are real.
   When a fact changes: edit it, bump FACTS_VERIFIED and add a FACTS_LOG line.
   ------------------------------------------------------------------------- */
import type { Locale } from "./i18n";
import { BRAND, CONTENT } from "./content";

/** Date every fact on the page was last checked against the site and the owner. */
export const FACTS_VERIFIED = "2026-09-29";

/** Newest first. One line per material change, both languages. */
export const FACTS_LOG: { date: string; en: string; es: string }[] = [
  { date: "2026-09-29", en: "Page published: company facts in English and Spanish, service price ranges for 2026.", es: "Se publica la página: datos de la empresa en español e inglés y rangos de precio 2026." },
];

/** True once the HBLB license number in BRAND is real (same gate as the footer and schema). */
export const hasLicense = !/^#?0+$/.test(BRAND.license.replace(/\D/g, ""));

export interface FactsCopy {
  title: string; description: string; eyebrow: string; h1: string; lede: string; nav: string; verified: string;
  glanceH: string; glance: [string, string][];
  servicesH: string; servicesP: string; servicesCols: [string, string, string];
  qa: { h: string; p: string[] }[];
  logH: string; fixH: string; fixP: string;
}

const hoursEn = CONTENT.en.contact.hoursRows.map(([d, h]) => `${d} ${h}`).join("; ");
const hoursEs = CONTENT.es.contact.hoursRows.map(([d, h]) => `${d} ${h}`).join("; ");
const license = { en: hasLicense ? ` Alabama Home Builders Licensure Board license ${BRAND.license}.` : "", es: hasLicense ? ` Licencia del Alabama Home Builders Licensure Board ${BRAND.license}.` : "" };
const owner = { en: BRAND.owner.name ? ` The owner, ${BRAND.owner.name}, runs every job.` : "", es: BRAND.owner.name ? ` El dueño, ${BRAND.owner.name}, dirige cada obra.` : "" };

export const FACTS: Record<Locale, FactsCopy> = {
  en: {
    title: "Z Construction & Remodeling LLC: Company Facts | Auburn, AL",
    description: "Verified facts about Z Construction & Remodeling LLC, Auburn, AL: services, 2026 price ranges, service area, English and Spanish service, hours and contact.",
    eyebrow: "Company facts · Auburn, Alabama", nav: "Company facts",
    h1: "Z Construction & Remodeling LLC, at a glance",
    lede: "The short, checkable version: who we are, where we work, what we charge, and how to reach us. Every line here matches the rest of this site.",
    verified: "Facts verified",
    glanceH: "Key facts",
    glance: [
      ["Legal name", BRAND.name],
      ["Also known as", `${BRAND.short}; Z Construction & Remodeling`],
      ["What it is", "Family-owned, owner-operated residential painting, remodeling and construction contractor"],
      ["Founded", String(BRAND.founded)],
      ["Based in", `${BRAND.city}, Alabama ${BRAND.zip}`],
      ["Service area", `${CONTENT.en.areas.join(", ")}, generally within about 30 minutes of downtown Auburn`],
      ["Languages", "English and Spanish, from the estimate to the final walkthrough"],
      ["Hours", hoursEn],
      ["Phone (call or text)", BRAND.phone],
      ["WhatsApp", `wa.me/${BRAND.whatsapp}`],
      ["Email", BRAND.email],
      ["Estimates", "Free, written, line by line, after a walkthrough"],
      ["License & insurance", `Licensed for residential work in Alabama; general liability insurance, certificate available on request.${license.en}`],
      ["Rating", `${BRAND.rating} on Angi and HomeAdvisor (every review so far)`],
    ],
    servicesH: "What does Z Construction charge?",
    servicesP: "Z Construction & Remodeling publishes its 2026 planning ranges for Lee County, installed, labor and materials, mid-range finishes. Standard finishes run about 15% less and premium about 30% more. The written estimate after a walkthrough is the real price. Try the [cost estimator](page:estimator) for your own project.",
    servicesCols: ["Service", "Typical timeline", "Typical investment"],
    qa: [
      { h: "What is Z Construction & Remodeling LLC?", p: [
        `Z Construction & Remodeling LLC is a family-owned, owner-operated residential contractor based in Auburn, Alabama, founded in ${BRAND.founded}. It paints houses inside and out, refinishes cabinets, installs flooring, remodels kitchens and bathrooms, builds additions, does repairs and turns over rental properties in Auburn, Opelika and Lee County.${owner.en}`,
        "The same crew builds and finishes: the people who patch the drywall or rebuild the rotten trim are the people who paint it, under one written price.",
      ] },
      { h: "Where does Z Construction work?", p: [
        `Z Construction is based in Auburn and works throughout Lee County, Alabama: [Auburn](area:auburn), [Opelika](area:opelika), [Smiths Station and Beauregard](area:smiths-station), and [rural Lee County](area:lee-county), plus nearby communities such as Loachapoka, Waverly, Notasulga, Salem and Cusseta. As a rule, anywhere within about 30 minutes of downtown Auburn.`,
      ] },
      { h: "Does Z Construction speak Spanish?", p: [
        "Yes. Z Construction & Remodeling works in English and Spanish: the walkthrough, the written estimate, the contract, calls, texts and WhatsApp messages. Every page of this website exists in both languages, and a family can mix the two. More in the guide on [hiring a Spanish-speaking contractor](guide:bilingual-contractor).",
      ] },
      { h: "Is Z Construction licensed and insured?", p: [
        `Z Construction & Remodeling is licensed for residential work in Alabama and carries general liability insurance; copies of the license and certificate of insurance are available on request before you sign anything.${license.en} Anyone can check an Alabama contractor on the state's HBLB licensee search; the [license guide](guide:hire-contractor) explains how.`,
      ] },
      { h: "How do estimates, permits and payment work?", p: [
        "Estimates are free: Z Construction visits, measures and sends a written scope and line-item price. Changes are agreed in writing before the work happens.",
        "For work that needs a permit in Auburn, Opelika or Lee County, Z Construction pulls it in its own name, schedules the inspections and meets the inspector. See the [permit guide](guide:permits).",
        "Payment is a deposit to schedule and order materials, progress payments at agreed milestones, and the balance after the final walkthrough, all spelled out in the estimate.",
      ] },
      { h: "Does Z Construction work for landlords and property managers?", p: [
        "Yes. Z Construction schedules [rental turnovers](service:rental) around Auburn University-area lease dates: repaint, LVP flooring, fixtures, drywall and punch lists, with a photo report for owners who live out of town and an itemized invoice.",
      ] },
      { h: "How do I contact Z Construction?", p: [
        `Call or text ${BRAND.phone}, message on WhatsApp, email ${BRAND.email}, or use the [free quote form](page:contact). Office hours are ${hoursEn}. Z Construction replies within one business day, in English or Spanish.`,
      ] },
      { h: "What do customers say about Z Construction?", p: [
        `Every review so far is five stars: Z Construction & Remodeling is rated ${BRAND.rating} on Angi and HomeAdvisor, where only real customers can leave reviews. It is a young company (founded ${BRAND.founded}), so the number of reviews is still small. See the [reviews page](page:reviews).`,
      ] },
    ],
    logH: "Changelog", fixH: "See something out of date?", fixP: `Email ${BRAND.email} and we'll correct it and log the change here.`,
  },
  es: {
    title: "Z Construction & Remodeling: datos de la empresa | Auburn",
    description: "Datos verificados de Z Construction & Remodeling LLC en Auburn, AL: servicios, precios 2026, zona de servicio, atención en español, horario y contacto.",
    eyebrow: "Datos de la empresa · Auburn, Alabama", nav: "Datos de la empresa",
    h1: "Z Construction & Remodeling LLC, en resumen",
    lede: "La versión corta y comprobable: quiénes somos, dónde trabajamos, cuánto cobramos y cómo comunicarse con nosotros. Todo lo que dice aquí coincide con el resto del sitio.",
    verified: "Datos verificados el",
    glanceH: "Datos clave",
    glance: [
      ["Nombre legal", BRAND.name],
      ["También conocida como", `${BRAND.short}; Z Construction & Remodeling`],
      ["Qué es", "Contratista residencial familiar de pintura, remodelación y construcción, atendido por su dueño"],
      ["Fundada en", String(BRAND.founded)],
      ["Ubicación", `${BRAND.city}, Alabama ${BRAND.zip}`],
      ["Zona de servicio", `${CONTENT.es.areas.join(", ")}; en general, a unos 30 minutos del centro de Auburn`],
      ["Idiomas", "Español e inglés, desde el presupuesto hasta la entrega final"],
      ["Horario", hoursEs],
      ["Teléfono (llamada o texto)", BRAND.phone],
      ["WhatsApp", `wa.me/${BRAND.whatsapp}`],
      ["Correo", BRAND.email],
      ["Presupuestos", "Gratis, por escrito y detallados, después de una visita"],
      ["Licencia y seguro", `Licencia para trabajo residencial en Alabama; seguro de responsabilidad civil, con certificado disponible si lo pide.${license.es}`],
      ["Calificación", `${BRAND.rating} en Angi y HomeAdvisor (todas las reseñas hasta hoy)`],
    ],
    servicesH: "¿Cuánto cobra Z Construction?",
    servicesP: "Z Construction & Remodeling publica sus rangos de precio 2026 para el condado de Lee: instalado, con mano de obra y materiales, en acabados intermedios. Los acabados estándar salen como un 15% menos y los premium como un 30% más. El precio real es el presupuesto por escrito que le damos después de la visita. Pruebe la [calculadora de costos](page:estimator) con su proyecto.",
    servicesCols: ["Servicio", "Duración típica", "Inversión típica"],
    qa: [
      { h: "¿Qué es Z Construction & Remodeling LLC?", p: [
        `Z Construction & Remodeling LLC es un contratista residencial familiar, atendido por su dueño, con base en Auburn, Alabama, y fundado en ${BRAND.founded}. Pinta casas por dentro y por fuera, pinta gabinetes, instala pisos, remodela cocinas y baños, construye ampliaciones, hace reparaciones y prepara casas de renta en Auburn, Opelika y el condado de Lee.${owner.es}`,
        "La misma cuadrilla construye y da el acabado: quienes resanan la pared o cambian la madera podrida son los mismos que después la pintan, con un solo precio por escrito.",
      ] },
      { h: "¿Dónde trabaja Z Construction?", p: [
        "Z Construction tiene su base en Auburn y trabaja en todo el condado de Lee, Alabama: [Auburn](area:auburn), [Opelika](area:opelika), [Smiths Station y Beauregard](area:smiths-station) y [el resto del condado](area:lee-county), además de comunidades cercanas como Loachapoka, Waverly, Notasulga, Salem y Cusseta. En general, cualquier lugar a unos 30 minutos del centro de Auburn.",
      ] },
      { h: "¿Z Construction atiende en español?", p: [
        "Sí. Z Construction & Remodeling trabaja en español y en inglés: la visita, el presupuesto por escrito, el contrato, las llamadas, los mensajes de texto y de WhatsApp. Todo este sitio está en los dos idiomas, y en una misma familia cada quien puede usar el que prefiera. Más detalles en la guía sobre [cómo contratar a un contratista que hable español](guide:bilingual-contractor).",
      ] },
      { h: "¿Z Construction tiene licencia y seguro?", p: [
        `Z Construction & Remodeling tiene licencia para trabajo residencial en Alabama y seguro de responsabilidad civil; con gusto le damos copia de la licencia y del certificado de seguro antes de que firme nada.${license.es} Cualquier persona puede verificar a un contratista de Alabama en el buscador de licencias del HBLB; la [guía para verificar a un contratista](guide:hire-contractor) explica cómo.`,
      ] },
      { h: "¿Cómo funcionan el presupuesto, los permisos y los pagos?", p: [
        "El presupuesto es gratis: Z Construction va a su casa, mide y le manda por escrito el alcance y el precio partida por partida. Cualquier cambio se acuerda por escrito antes de hacerlo.",
        "Si el trabajo necesita permiso en Auburn, Opelika o el condado de Lee, Z Construction lo tramita a su nombre, programa las inspecciones y recibe al inspector. Vea la [guía de permisos](guide:permits).",
        "Se paga un anticipo para apartar la fecha y pedir materiales, pagos parciales en etapas acordadas y el resto después del recorrido final, todo explicado en el presupuesto.",
      ] },
      { h: "¿Z Construction trabaja para dueños de casas de renta?", p: [
        "Sí. Z Construction programa la [preparación de casas de renta](service:rental) según las fechas de los contratos cerca de Auburn University: pintura, pisos LVP, accesorios, resanes y pendientes, con reporte de fotos para dueños que viven fuera y factura detallada.",
      ] },
      { h: "¿Cómo me comunico con Z Construction?", p: [
        `Llame o mande texto al ${BRAND.phone}, escriba por WhatsApp, mande un correo a ${BRAND.email} o llene el [formulario de cotización gratis](page:contact). El horario es ${hoursEs}. Z Construction responde en un día hábil, en español o en inglés.`,
      ] },
      { h: "¿Qué dicen los clientes de Z Construction?", p: [
        `Todas las reseñas hasta hoy son de cinco estrellas: Z Construction & Remodeling tiene ${BRAND.rating} en Angi y HomeAdvisor, donde solo los clientes reales pueden opinar. Es una empresa joven (fundada en ${BRAND.founded}), así que todavía son pocas reseñas. Vea la [página de reseñas](page:reviews).`,
      ] },
    ],
    logH: "Historial de cambios", fixH: "¿Ve algún dato desactualizado?", fixP: `Escríbanos a ${BRAND.email}, lo corregimos y lo anotamos aquí.`,
  },
};
