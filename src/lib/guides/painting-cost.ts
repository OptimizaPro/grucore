import { costTable, estimate, mid, money, type Guide } from "../guide-kit";

const D = "2026-09-29";

/* Per-square-foot and per-room figures are derived from the estimator table,
   never typed by hand, so they move when the table is recalibrated. */
const WHOLE_SQFT = 2000; // interior tier 1 and the example exterior home
const dollars = (n: number) => `$${n % 1 ? n.toFixed(2) : n.toFixed(0)}`;
const perSqFt = (type: "interior" | "exterior", tier: 0 | 1 | 2, sqft: number) => {
  const r = estimate(type, tier, "mid");
  return `${dollars(Math.round((r.lo / sqft) * 4) / 4)}–${dollars(Math.round((r.hi / sqft) * 4) / 4)}`;
};
const perRoom = () => {
  const r = estimate("interior", 0, "mid");
  return `${money(Math.round(r.lo / 3 / 50) * 50)}–${money(Math.round(r.hi / 2 / 50) * 50)}`;
};

export const guide: Guide = {
  id: "painting-cost",
  slug: { en: "house-painting-cost-auburn-al", es: "cuanto-cobra-un-pintor-auburn-al" },
  photo: "paint1",
  published: D,
  updated: D,
  service: "painting",
  estimator: "interior",
  related: ["exterior-paint-timing", "cabinets-paint-vs-replace", "hire-contractor"],
  sources: [
    { name: "U.S. EPA — Lead Renovation, Repair and Painting Program Rules", url: "https://www.epa.gov/lead/lead-renovation-repair-and-painting-program-rules" },
    { name: "Alabama Department of Public Health — Lead Renovation Firm Certification", url: "https://www.alabamapublichealth.gov/lead/certification-renovation.html" },
    { name: "Sherwin-Williams — Duration Exterior Acrylic Satin, Product Data Sheet (3/2026)", url: "https://paintdocs.com/docs/webPDF.jsp?SITEID=STORECAT&doctype=PDS&lang=E&prodno=650405780" },
    { name: "National Association of Realtors — 2025 Remodeling Impact Report release", url: "https://www.nar.realtor/newsroom/top-remodeling-projects-for-homeowner-satisfaction-and-cost-recovery-revealed-in-nar-report" },
  ],
  t: {
    en: {
      title: "House Painting Cost in Auburn, AL: 2026 Painter Prices",
      eyebrow: "Cost guide · 2026",
      description: "What painters charge in Auburn and Opelika, AL in 2026: interior per room and whole house, exterior by home size, per square foot, and how to compare quotes.",
      h1: "How much do painters charge in Auburn, AL? (2026)",
      lede: "Interior and exterior painting prices for Auburn, Opelika and Lee County, how painters actually build a quote, and what should be in writing before anyone opens a can.",
      answer: `In Auburn and Opelika in 2026, painting two or three rooms typically costs ${mid("interior", 0)}, and a whole ~2,000 sq ft interior with walls, ceilings, trim and doors runs ${mid("interior", 1)}, about ${perSqFt("interior", 1, WHOLE_SQFT)} per square foot of floor. Exterior painting runs ${mid("exterior", 0)} for a small one-story home and ${mid("exterior", 1)} for an average 1,500–2,500 sq ft home, prep and two coats included.`,
      sections: [
        {
          h: "Interior painting costs in Lee County (2026)",
          p: [
            `These are installed prices, labor and paint, at mid-range products unless you pick another column. Broken down per room, a typical bedroom or living room lands around ${perRoom()} depending on size, ceiling height and how much trim there is. Whole-house jobs cost less per room because setup, masking and color matching happen once.`,
          ],
          table: costTable("interior", "en"),
        },
        {
          h: "Exterior painting costs by home size",
          p: [
            `For a 2,000 sq ft home, an exterior repaint in the average-home tier works out to roughly ${perSqFt("exterior", 1, WHOLE_SQFT)} per square foot of living area. The spread comes mostly from prep: a brick ranch with painted trim only is a different job from a two-story with hardboard siding and soft fascia boards. Use our [cost estimator](page:estimator) for your own size and finish level.`,
          ],
          table: costTable("exterior", "en"),
        },
        {
          h: "How painters actually price a job",
          p: [
            "Almost nobody in the trade prices by one simple number. Most painters measure the job one of three ways, then sanity-check it against the others:",
          ],
          list: [
            "Per room: common for bedrooms and small jobs. Easy to compare, but ask whether ceilings, trim and doors are in the room price or extra.",
            "Per wall square foot: the painter measures actual wall and ceiling area, which is two to three times the floor area in most rooms. It is the most accurate method for big or unusual spaces like two-story foyers.",
            "Per job: a single price built from labor days plus materials. This is how most whole-house and exterior quotes are written, and it is fine as long as the scope is spelled out.",
          ],
        },
        {
          h: "What a complete quote includes",
          list: [
            "Furniture moved and covered, floors protected, switch plates removed",
            "Patching nail holes, dings and small cracks, then sanding smooth",
            "Caulking gaps where trim meets walls, and at exterior joints and windows",
            "Spot priming patches and bare wood; full primer for stains or big color changes",
            "Two finish coats on walls (one coat is a touch-up, not a repaint)",
            "Ceilings, baseboards, door and window casing, and doors, each listed or clearly excluded",
            "Paint brand, product line and sheen named in writing, and cleanup every day",
          ],
          p: [
            "Exterior quotes should also list pressure washing and mildew treatment, scraping, rot repair (per board or as an allowance) and which surfaces are included: siding, trim, fascia, soffits, shutters, doors, porch ceilings. Sherwin-Williams' data sheet for Duration, for example, calls for two coats on new or bare surfaces and one on a sound repaint of the same color; most quotes here still specify two for color changes and sun-beaten walls.",
          ],
        },
        {
          h: "What raises or lowers the price",
          list: [
            "Ceiling height: 9–10 ft walls, vaulted living rooms and stairwells need taller ladders or planks and more time.",
            "Color changes: going from a dark accent wall to a light neutral usually takes a primer coat plus two finish coats. Light-to-light repaints are the cheapest.",
            "Wallpaper removal: stripping, washing off the glue and sealing the wall before paint can cost as much as painting the room.",
            "Repairs: water stains, settlement cracks, and outside, rotten trim or siding. On our [painting jobs](service:painting), carpenters replace rot before painting rather than caulk over it.",
            "Trim and doors: six-panel doors, crown and wainscoting are hand work and take longer than open wall.",
            "Access and occupancy: an empty house goes faster than one full of furniture, and a steep lot slows exterior work.",
          ],
        },
        {
          h: "Pre-1978 homes: lead-safe rules",
          p: [
            "Many of the 1960s and 1970s ranches around [Opelika](area:opelika) and older parts of Auburn were built before 1978, when lead paint was still used in homes. Under the EPA's Renovation, Repair and Painting rule, firms paid to disturb painted surfaces in those homes must be certified and follow lead-safe work practices; small jobs under about 6 sq ft inside or 20 sq ft outside are exempt from the full requirements. In Alabama the program is run by the Alabama Department of Public Health, which certifies renovation firms.",
            "In practice it means containment, no open-flame burning or high-speed sanding without HEPA dust collection, and careful cleanup, which adds time to scraping-heavy exterior work. Ask any painter, including us, how they handle it before work starts on an older home.",
          ],
        },
        {
          h: "Paint grade: what you get for more money",
          p: [
            "Contractor-grade paint is cheaper per gallon but often needs a third coat and scuffs sooner. Mid-range and premium lines (for example Sherwin-Williams' SuperPaint, Duration and Emerald, or Benjamin Moore's Regal and Aura) hide better, wash better and hold color longer in south- and west-facing sun. Paint is a modest share of a professional job, so the premium line usually adds less than people expect. Use a washable matte or eggshell on walls, satin or semi-gloss on trim and doors.",
          ],
        },
        {
          h: "How to compare quotes, and red flags",
          p: [
            "Put quotes side by side on the same scope: same rooms, same surfaces, same number of coats, same product line. A low number that leaves out ceilings or trim is not cheaper. If you are also pricing cabinets, see our guide on [whether to paint or replace kitchen cabinets](guide:cabinets-paint-vs-replace); that is a different process from wall paint.",
          ],
          list: [
            "No written scope: if coats, surfaces and product are not on paper, they are not in the price.",
            "Cash only, or pressure to decide today.",
            "A large deposit up front. A reasonable deposit covers materials; most of the payment should follow the work.",
            "No proof of insurance, or no answer about lead-safe practices on a pre-1978 house.",
            "One coat promised for a color change, or rot that will be caulked and painted over.",
          ],
        },
      ],
      faq: [
        { q: "How much does it cost to paint a room in Auburn, AL?", a: `A typical bedroom or living room runs about ${perRoom()} in 2026, depending on size, ceiling height and trim. Two or three rooms together usually fall in the ${mid("interior", 0)} range.` },
        { q: "How much does it cost to paint the inside of a 2,000 sq ft house?", a: `Most whole interiors that size, with walls, ceilings, trim and doors, run ${mid("interior", 1)} at mid-range paint, roughly ${perSqFt("interior", 1, WHOLE_SQFT)} per square foot of floor.` },
        { q: "What does it cost to paint the outside of a house in Opelika or Auburn?", a: `An average 1,500–2,500 sq ft home typically runs ${mid("exterior", 1)}; large or two-story homes and heavy rot repair run ${mid("exterior", 2)}. See our [exterior painting timing guide](guide:exterior-paint-timing) for when to schedule it.` },
        { q: "Do painters charge by the hour or by the job?", a: "Most residential painters quote a fixed price per room or per job, built from their own labor-hour estimate. Hourly billing is more common for small repairs and touch-ups." },
        { q: "Is paint included in the price?", a: "In our quotes, yes: labor, paint, primer, caulk and patching materials. If you want a specific brand or line, we name it in writing." },
        { q: "Do I need a permit to paint my house?", a: "Not in Auburn or Opelika for painting alone. HOA color approval is a separate matter, and many subdivisions require it for exterior colors." },
      ],
    },
    es: {
      title: "¿Cuánto cobra un pintor en Auburn, AL? Precios 2026",
      eyebrow: "Guía de precios · 2026",
      description: "Cuánto cobra un pintor en Auburn y Opelika, AL en 2026: por cuarto, casa completa, exterior y por pie cuadrado, qué incluye y cómo comparar cotizaciones.",
      h1: "¿Cuánto cobra un pintor en Auburn, AL? Precios 2026",
      lede: "Precios de pintura interior y exterior en Auburn, Opelika y el condado de Lee, cómo arman su precio los pintores y qué debe venir por escrito antes de empezar.",
      answer: `En Auburn y Opelika, en 2026, pintar 2 o 3 cuartos cuesta normalmente ${mid("interior", 0)}, y todo el interior de una casa de unos 2,000 pies² (paredes, techos, molduras y puertas) cuesta ${mid("interior", 1)}, o sea, alrededor de ${perSqFt("interior", 1, WHOLE_SQFT)} por pie cuadrado de construcción. Pintar el exterior cuesta ${mid("exterior", 0)} en una casa chica de un piso y ${mid("exterior", 1)} en una casa mediana, con preparación y dos manos incluidas.`,
      sections: [
        {
          h: "Precio de pintura interior en el condado de Lee (2026)",
          p: [
            `Son precios con mano de obra y pintura, en productos de gama media salvo que usted escoja otra columna. Por cuarto, una recámara o una sala típica queda alrededor de ${perRoom()}, según el tamaño, la altura del techo y cuántas molduras tenga. Pintar la casa completa sale más barato por cuarto, porque cubrir, preparar y igualar colores se hace una sola vez.`,
          ],
          table: costTable("interior", "es"),
        },
        {
          h: "Precio por pie cuadrado: cómo sacar la cuenta",
          p: [
            `Mucha gente busca el precio por pie cuadrado, y sirve como referencia, siempre que se sepa de qué pies se habla. Hay dos formas de medir:`,
          ],
          list: [
            `Pies cuadrados de la casa (lo que dice el avalúo): para pintar todo el interior de una casa de 2,000 pies², sale alrededor de ${perSqFt("interior", 1, WHOLE_SQFT)} por pie cuadrado. Para el exterior de una casa mediana del mismo tamaño, alrededor de ${perSqFt("exterior", 1, WHOLE_SQFT)}.`,
            "Pies cuadrados de pared: el pintor mide las paredes y los techos que va a pintar, que suelen ser dos o tres veces los pies del piso. Por eso un precio por pie de pared siempre se ve más bajo que uno por pie de casa, aunque el total sea el mismo.",
            "Por eso, cuando compare cotizaciones, pregunte siempre: ¿por pie cuadrado de qué?",
          ],
        },
        {
          h: "Pintura exterior según el tamaño de la casa",
          p: [
            `La diferencia de precio viene sobre todo de la preparación: una casa de ladrillo donde solo se pintan molduras no se compara con una de dos pisos con fachada de madera prensada y aleros podridos. Puede calcular su caso con nuestro [calculador de costos](page:estimator).`,
          ],
          table: costTable("exterior", "es"),
        },
        {
          h: "Qué debe incluir una buena cotización",
          list: [
            "Mover y cubrir muebles, proteger pisos, quitar tapas de contactos",
            "Resanar hoyos de clavos, golpes y grietas chicas, y lijar",
            "Sellar con silicón o sellador las uniones de molduras, ventanas y juntas",
            "Primario en resanes y madera sin pintar; primario completo si hay manchas o un cambio fuerte de color",
            "Dos manos de acabado en las paredes (una sola mano es un retoque, no una pintada)",
            "Techos, zoclos, marcos de puertas y ventanas, y puertas: incluidos o excluidos por escrito",
            "Marca, línea y acabado de la pintura por escrito, y limpieza diaria",
          ],
          p: [
            "En el exterior también debe decir si incluye lavado a presión y tratamiento contra moho, raspado, cambio de madera podrida (por tabla o con una cantidad reservada) y qué partes se pintan: fachada, molduras, aleros, plafones, contraventanas, puertas y techo del porche. La hoja técnica de Duration de Sherwin-Williams, por ejemplo, pide dos manos en superficies nuevas o sin pintar.",
          ],
        },
        {
          h: "Qué sube o baja el precio",
          list: [
            "Techos altos, salas con techo de catedral y escaleras: más escalera, más andamio, más tiempo.",
            "Cambio de color: pasar de una pared oscura a un color claro casi siempre pide una mano de primario y dos de acabado.",
            "Quitar papel tapiz: despegar, lavar el pegamento y sellar la pared puede costar tanto como pintar el cuarto.",
            "Reparaciones: manchas de agua, grietas y, por fuera, madera podrida. Nosotros cambiamos la madera mala antes de pintar, no la tapamos.",
            "Molduras y puertas de tableros: es trabajo a mano y toma más que una pared lisa.",
            "Casa vacía o con muebles: una casa vacía, por ejemplo entre inquilinos, se pinta más rápido.",
          ],
        },
        {
          h: "Casas construidas antes de 1978: plomo",
          p: [
            "Muchas casas de los años 60 y 70 en Opelika y en las partes viejas de Auburn se construyeron antes de 1978, cuando todavía se usaba pintura con plomo. La regla RRP de la EPA exige que las empresas que raspan, lijan o quitan pintura en esas casas estén certificadas y trabajen de forma segura; los trabajos muy chicos (menos de unos 6 pies² por dentro o 20 pies² por fuera) quedan fuera de la mayoría de los requisitos. En Alabama, quien certifica a las empresas es el Departamento de Salud Pública del estado.",
            "Eso significa cubrir y aislar el área, nada de quemar pintura ni lijar a alta velocidad sin aspiradora HEPA, y una limpieza cuidadosa. Si su casa es de esos años, pregúntele a cualquier pintor, también a nosotros, cómo lo maneja antes de empezar.",
          ],
        },
        {
          h: "La calidad de la pintura sí se nota",
          p: [
            "La pintura económica cuesta menos por galón, pero muchas veces pide una tercera mano y se marca más rápido. Las líneas de gama media y alta (por ejemplo SuperPaint, Duration o Emerald de Sherwin-Williams, o Regal y Aura de Benjamin Moore) tapan mejor, se lavan mejor y aguantan más el sol de la tarde. Como la pintura es solo una parte del precio total, subir de línea suele costar menos de lo que la gente piensa.",
          ],
        },
        {
          h: "Cómo comparar cotizaciones y señales de alerta",
          p: [
            "Compare cotizaciones con el mismo alcance: los mismos cuartos, las mismas superficies, el mismo número de manos y la misma línea de pintura. Si una cotización barata no incluye techos ni molduras, no es más barata. Para contratar con confianza, vea también nuestra guía para [verificar a un contratista en Alabama](guide:hire-contractor), y si quiere hablarlo en español, estamos en nuestra página de [pintura de casas](service:painting).",
          ],
          list: [
            "No hay nada por escrito: lo que no está en papel no está en el precio.",
            "Solo acepta efectivo, o le presiona para decidir hoy mismo.",
            "Pide un anticipo muy grande. Un anticipo razonable cubre materiales; la mayor parte se paga conforme avanza el trabajo.",
            "No le muestra comprobante de seguro, o no sabe qué hacer con el plomo en una casa vieja.",
            "Le promete una sola mano para un cambio de color, o tapar madera podrida con sellador y pintura.",
          ],
        },
      ],
      faq: [
        { q: "¿Cuánto cobra un pintor por cuarto en Auburn?", a: `Una recámara o sala típica cuesta alrededor de ${perRoom()} en 2026, según el tamaño, la altura y las molduras. Dos o tres cuartos juntos suelen quedar en ${mid("interior", 0)}.` },
        { q: "¿Cuánto cobran por pie cuadrado por pintar una casa?", a: `Para todo el interior de una casa de 2,000 pies², alrededor de ${perSqFt("interior", 1, WHOLE_SQFT)} por pie cuadrado de construcción; para el exterior de una casa mediana, alrededor de ${perSqFt("exterior", 1, WHOLE_SQFT)}. Siempre pregunte si el precio es por pie de casa o por pie de pared.` },
        { q: "¿Cuánto cuesta pintar una casa por fuera en Opelika o Auburn?", a: `Una casa mediana de 1,500 a 2,500 pies² cuesta normalmente ${mid("exterior", 1)}; una grande o de dos pisos, o con mucha madera podrida, ${mid("exterior", 2)}. Vea nuestra guía sobre [la mejor época para pintar por fuera](guide:exterior-paint-timing).` },
        { q: "¿La pintura va incluida en el precio?", a: "En nuestras cotizaciones, sí: mano de obra, pintura, primario, sellador y materiales para resanar. Si usted quiere una marca o línea en particular, la ponemos por escrito." },
        { q: "¿Cuánto tarda en pintarse una casa?", a: "Dos o tres cuartos, uno o dos días. Un interior completo, casi siempre menos de una semana. El exterior de una casa mediana, varios días de trabajo más los días de lluvia." },
        { q: "¿Necesito permiso para pintar mi casa?", a: "En Auburn y Opelika, no para pintar. La aprobación de colores de la HOA es otra cosa, y muchos fraccionamientos la piden para el exterior." },
      ],
    },
  },
};
