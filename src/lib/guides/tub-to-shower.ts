import { costTable, estimate, mid, money, type Guide } from "../guide-kit";

const D = "2026-09-29";

export const guide: Guide = {
  id: "tub-to-shower",
  slug: { en: "tub-to-shower-conversion-cost-auburn-al", es: "cambiar-tina-por-regadera-auburn-al" },
  photo: "bathTubAfterWide", published: D, updated: D, service: "bathroom", estimator: "bath",
  related: ["bathroom-cost", "permits", "builder-grade-upgrades"],
  sources: [
    { name: "Schluter-Systems: Schluter-KERDI waterproofing membrane", url: "https://www.schluter.com/schluter-us/en_US/Membranes/Waterproofing-(KERDI)/Schluter-KERDI/p/KERDI" },
    { name: "Custom Building Products: RedGard Waterproofing and Crack Prevention Membrane", url: "https://www.custombuildingproducts.com/products/redgard-waterproofing-and-crack-prevention-membrane" },
    { name: "Custom Building Products: RedGard technical data sheet (TDS-104)", url: "https://www.custombuildingproducts.com/wp-content/uploads/TDS-104-021425.pdf" },
    { name: "Home Ventilating Institute: Bathroom Exhaust Fans", url: "https://www.hvi.org/resources/publications/bathroom-exhaust-fans/" },
  ],
  t: {
    en: {
      title: "Tub-to-Shower Conversion Cost in Auburn, AL (2026)", eyebrow: "Cost guide · 2026",
      description: "What a tub-to-shower conversion costs in Auburn and Opelika, AL in 2026: tile vs acrylic panels, curbless options, waterproofing, permits and timeline.",
      h1: "How much does a tub-to-shower conversion cost in Auburn, AL?",
      lede: "What actually happens when a builder-grade tub comes out and a walk-in shower goes in, what it costs in Lee County in 2026, and the decisions that move the price.",
      answer: `In Auburn and Opelika in 2026, most tiled tub-to-shower conversions cost ${mid("bath", 1)} at mid-range finishes, installed, because the job includes a new drain, valve, shower pan, waterproofing, tile and glass. A curbless shower or one where the drain moves runs ${mid("bath", 2)}. Plan on roughly 2–3 weeks on site, plus glass lead time.`,
      sections: [
        { h: "What a tub-to-shower conversion involves", list: [
          "Demolition: the tub, surround tile or fiberglass, and wall board come out, usually down to the studs on the wet walls. That's when we see whether the subfloor or framing behind a 20-year-old tub has been getting wet.",
          "Drain: a shower drain is typically 2 inches where a tub drain is often 1½, and it has to sit where the pan can slope to it. Moving it means opening the floor, or on a slab, cutting concrete.",
          "Valve: a new shower valve goes in at shower height. Plumbing code requires a pressure-balancing or thermostatic valve on showers, so an old tub valve rarely stays.",
          "Pan and slope: a mortar bed or a foam tray sloped toward the drain, with a curb or recessed for a curbless entry.",
          "Waterproofing: a membrane over the whole wet area, then a flood test before any tile goes on.",
          "Finish: tile or panels, a niche or bench if you want one, glass, trim, paint and a correctly sized exhaust fan.",
        ] },
        { h: "What it costs in 2026", p: [
          `A conversion is rarely a "refresh." Our refresh tier (${mid("bath", 0)}) assumes the tub or shower stays where it is. Taking the tub out and building a waterproofed tile shower lands in the full hall bath tier, ${mid("bath", 1)}, and at standard finishes can start around ${money(estimate("bath", 1, "standard").lo)}. Frameless glass, floor-to-ceiling tile, a relocated drain or a curbless entry pushes it toward ${mid("bath", 2)}.`,
          "Most of the swing between two quotes is tile labor, glass and how much of the rest of the bathroom gets redone at the same time. If the vanity, toilet and floor are dated too (see our [bathroom remodel cost guide](guide:bathroom-cost) for those ranges), doing them during the same mobilization costs less than coming back later. You can price your own version with our [bathroom cost estimator](page:estimator).",
        ], table: costTable("bath", "en") },
        { h: "Curb or curbless", p: [
          "A standard shower has a low curb, usually a few inches tall, that keeps water in. It's the simpler, less expensive build. A curbless (zero-entry) shower has the floor of the shower flush with the bathroom, which is easier for anyone with a walker, a wheelchair or unsteady balance, and it looks clean and modern.",
          "The catch is the floor structure. On a wood-framed floor over a crawlspace, we recess the subfloor between the joists so the pan can slope without a step. On a slab, the concrete is cut and lowered around the drain. Either way it adds framing or concrete work, and the waterproofing usually extends onto the bathroom floor beyond the glass.",
        ] },
        { h: "Waterproofing: the part you never see", p: [
          "Tile and grout are not waterproof on their own. What keeps water out of your walls is the membrane underneath. Two common systems are sheet membranes and liquid-applied membranes. Schluter describes KERDI as a sheet waterproofing membrane and vapor retarder bonded to the wall with thin-set mortar, made for tiled showers and tub surrounds. Custom Building Products' RedGard is a roll-on liquid membrane; its data sheet calls for at least two coats, and it goes on pink and dries to dark red, which makes thin spots easy to catch.",
          "Whichever system is used, the pan gets flood-tested: the drain is plugged, the pan is filled and left to confirm it holds water. We photograph the membrane and the flood test and send you the photos before tile covers them. The failure we see most in older baths is tile over plain drywall or green board with no membrane at all.",
        ] },
        { h: "Tile or acrylic panels", table: { head: ["", "Tiled shower", "Acrylic or solid-surface panels"], rows: [
          ["Typical cost", `${mid("bath", 1)} and up`, `Often toward the low end of ${mid("bath", 1)}`],
          ["Time on site", "About 2–3 weeks, plus glass", "Often faster; fewer curing steps"],
          ["Look", "Any size, color or pattern; niches and benches", "Limited colors and textures; fewer grout lines"],
          ["Cleaning", "Grout needs sealing or an upgraded grout", "Wipe-down surface, very little grout"],
          ["Repairs", "One cracked tile can be replaced", "A damaged panel is usually replaced whole"],
        ] }, p: ["Panels suit rentals and quick turnarounds. Tile suits a primary bath you plan to live with for a long time. Both still need a correct pan, slope and sealed seams."] },
        { h: "How long it takes", list: [
          "Selections and ordering: 1–3 weeks before demolition, so tile, valve and fixtures are on site on day one.",
          "Demolition, plumbing rough-in and inspection: 2–4 days.",
          "Pan, membrane and flood test: 2–4 days, including cure time.",
          "Tile, grout and fixtures: 4–7 working days for a typical alcove shower.",
          "Glass: measured after tile is set, then usually 1–2 weeks to fabricate and install. You can shower before the glass arrives with a temporary curtain.",
        ] },
        { h: "Do you need a permit?", p: [
          "Usually, yes. Replacing a tub with a shower changes the drain and the valve, and new or relocated plumbing needs a permit. In Auburn, that goes through Auburn Inspection Services; in [Opelika](area:opelika), through the City's Building Inspection Division; outside city limits, through Lee County. We pull the permit in our name and schedule the inspections. Our [permit guide](guide:permits) explains what each office covers.",
        ] },
        { h: "Resale: keep at least one tub", p: [
          "The advice real estate agents give most often on this is simple: keep at least one bathtub in the house. Families with small children and some buyers who like a soak will look for one, and a house with no tub can narrow the pool of buyers. Converting the primary bath's tub to a big walk-in shower while keeping a tub in the hall bath is the usual compromise. If yours is the only tub in a three-bedroom house, think about who buys that house next before removing it.",
        ] },
        { h: "Details worth adding while the walls are open", p: [
          "For ventilation, the Home Ventilating Institute recommends 1 CFM of exhaust per square foot for bathrooms up to 100 square feet, with 50 CFM as a minimum, and for larger baths 50 CFM each for the toilet, shower and tub. The fan should duct outside, not into the attic, and a fan rated 1.0 sones or less is quiet enough that people actually run it. In a Lee County summer, that matters for mildew.",
        ], list: [
          "Blocking between studs for grab bars, even if you don't want bars today. It costs little now and a lot later.",
          "A handheld shower on a slide bar, easy to reach from a seat.",
          "A built-in bench or a spot for a fold-down seat.",
          "Slip-resistant floor tile; smaller tiles give more grout lines and more grip.",
          "A niche placed so you don't have to bend or reach across the spray.",
        ] },
      ],
      faq: [
        { q: "How much does it cost to convert a tub to a walk-in shower in Auburn?", a: `Most tiled conversions we price in Auburn and Opelika fall in the ${mid("bath", 1)} range at mid-range finishes. Curbless showers or conversions that move the drain run ${mid("bath", 2)}.` },
        { q: "Is it cheaper to put in a shower instead of a tub?", a: "Not usually. A new tub dropped into the same spot often costs less than a conversion, because a shower needs a pan, full waterproofing and glass. People convert for easier access and a bigger shower, not to save money." },
        { q: "How long does a tub-to-shower conversion take?", a: "Plan on about 2–3 weeks on site for a tiled shower, plus 1–2 weeks for glass after the tile is set. Panel systems are often faster." },
        { q: "Do I need a permit to replace my tub with a shower in Auburn, AL?", a: "Generally yes, because the drain and valve change. We pull the permit and schedule inspections with the City of Auburn, the City of Opelika or Lee County, depending on your address." },
        { q: "Will removing my only bathtub hurt resale?", a: "It can narrow your buyers, especially families with young children. The common approach is to convert the primary bath and keep a tub in the hall bath." },
        { q: "Can you build a curbless shower on a slab?", a: "Yes. The concrete around the shower is cut and lowered so the floor can slope to the drain without a step. It adds cost, and we'll tell you after looking at the slab whether it makes sense. More on how we build them on our [bathroom remodeling](service:bathroom) page." },
      ],
    },
    es: {
      title: "Cambiar la tina por regadera en Auburn: costo y tiempo", eyebrow: "Guía de costos · 2026",
      description: "Cuánto cuesta cambiar la tina por regadera en Auburn y Opelika, AL en 2026: azulejo o paneles, regadera sin escalón, impermeabilización, permisos y tiempos.",
      h1: "¿Cuánto cuesta cambiar la tina por regadera en Auburn?",
      lede: "Qué se hace al quitar una tina y poner una regadera amplia, cuánto cuesta en el condado de Lee en 2026 y qué cambia el precio.",
      answer: `En Auburn y Opelika, en 2026, cambiar la tina por una regadera de azulejo cuesta normalmente ${mid("bath", 1)} con acabados intermedios, ya instalada, porque lleva desagüe, llave, base, impermeabilización, azulejo y cancel nuevos. Si la regadera es sin escalón o hay que mover el desagüe, ${mid("bath", 2)}. Cuente con unas 2 o 3 semanas de obra, más lo que tarda el cancel.`,
      sections: [
        { h: "Qué incluye el cambio de tina por regadera", list: [
          "Demolición: se quita la tina, el azulejo o la fibra de vidrio y la tablaroca de las paredes mojadas, casi siempre hasta la estructura. Ahí se ve si la madera detrás de la tina se ha estado mojando.",
          "El desagüe: el de una regadera normalmente es de 2 pulgadas y el de una tina muchas veces de 1½, y tiene que quedar donde la base pueda tener caída hacia él. Moverlo es abrir el piso, o si la casa está sobre losa, cortar el concreto.",
          "La llave: se pone una llave nueva a la altura de regadera. El código de plomería pide una llave con control de presión o termostática en las regaderas, así que la llave vieja de la tina casi nunca se queda.",
          "La base: una cama de mortero o una charola de espuma con caída hacia el desagüe, con bordillo o rebajada para que quede a ras de piso.",
          "La impermeabilización: una membrana en toda la zona mojada y una prueba de agua antes de poner un solo azulejo.",
          "El acabado: azulejo o paneles, un nicho o una banca si la quiere, el cancel, molduras, pintura y un extractor del tamaño correcto.",
        ] },
        { h: "Cuánto cuesta en 2026", p: [
          `Cambiar la tina casi nunca es una \"renovación ligera\". Nuestro rango de renovación (${mid("bath", 0)}) es para cuando la tina o la regadera se quedan donde están. Quitar la tina y hacer una regadera de azulejo bien impermeabilizada cae en el rango de baño completo, ${mid("bath", 1)}, y con acabados estándar puede empezar alrededor de ${money(estimate("bath", 1, "standard").lo)}. El cancel sin marco, el azulejo hasta el techo, mover el desagüe o hacerla sin escalón la acercan a ${mid("bath", 2)}.`,
          "La diferencia entre dos cotizaciones casi siempre está en el azulejo, el cancel y cuánto más del baño se cambia. Si el tocador, el inodoro y el piso también están viejos (los rangos están en nuestra [guía de costos de baño](guide:bathroom-cost)), sale más barato hacerlos en la misma obra que regresar después. Puede calcular su caso con nuestra [calculadora de costos](page:estimator).",
        ], table: costTable("bath", "es") },
        { h: "¿Con bordillo o sin escalón?", p: [
          "Una regadera normal tiene un bordillo bajo, de unas cuantas pulgadas, que detiene el agua. Es la opción más sencilla y económica. Una regadera sin escalón queda al mismo nivel que el piso del baño: es más fácil para quien usa andadera o silla de ruedas, y se ve limpia y moderna.",
          "Lo que la complica es la estructura del piso. Si la casa tiene piso de madera sobre un espacio bajo la casa, rebajamos el subpiso entre las vigas para que la base tenga caída sin escalón. Si está sobre losa, se corta y se baja el concreto alrededor del desagüe. En los dos casos se suma trabajo.",
        ] },
        { h: "La impermeabilización: lo que no se ve", p: [
          "El azulejo y la boquilla no detienen el agua por sí solos. Lo que protege sus paredes es la membrana que va debajo. Schluter describe su KERDI como una membrana impermeable en lámina que se pega a la pared con mortero adhesivo (thin-set), hecha para regaderas y alrededor de tinas. RedGard, de Custom Building Products, es una membrana líquida que se aplica con rodillo; su hoja técnica pide por lo menos dos capas, y se pone rosa y seca rojo oscuro, así que se nota enseguida dónde quedó delgada.",
          "Con cualquiera de los dos, la base se prueba con agua: se tapa el desagüe, se llena y se deja para confirmar que no se sale. Tomamos fotos de la membrana y de la prueba y se las mandamos antes de que el azulejo las tape. En baños viejos encontramos mucho azulejo sobre tablaroca verde, sin membrana.",
        ] },
        { h: "¿Azulejo o paneles acrílicos?", table: { head: ["", "Regadera de azulejo", "Paneles acrílicos o de superficie sólida"], rows: [
          ["Costo típico", `${mid("bath", 1)} o más`, `Muchas veces en la parte baja de ${mid("bath", 1)}`],
          ["Tiempo de obra", "Unas 2 o 3 semanas, más el cancel", "Muchas veces más rápido; menos tiempos de secado"],
          ["Apariencia", "Cualquier tamaño, color o diseño; nichos y bancas", "Pocos colores y texturas; casi sin juntas"],
          ["Limpieza", "La boquilla necesita sellador o una boquilla mejorada", "Se limpia con un trapo, casi sin boquilla"],
          ["Reparaciones", "Se cambia solo el azulejo roto", "Un panel dañado casi siempre se cambia completo"],
        ] }, p: ["Los paneles convienen en casas de renta o cuando hay prisa. El azulejo conviene en el baño principal donde piensa vivir muchos años. En los dos casos hace falta una base con buena caída y juntas bien selladas."] },
        { h: "Cuánto tiempo toma", list: [
          "Escoger y pedir materiales: de 1 a 3 semanas antes de demoler.",
          "Demolición, plomería e inspección: de 2 a 4 días.",
          "Base, membrana y prueba de agua: de 2 a 4 días, con tiempo de secado.",
          "Azulejo, boquilla y accesorios: de 4 a 7 días hábiles en una regadera normal.",
          "El cancel: se mide ya con el azulejo puesto y tarda normalmente de 1 a 2 semanas en hacerse e instalarse. Mientras tanto puede bañarse con una cortina provisional.",
        ] },
        { h: "¿Necesita permiso?", p: [
          "Normalmente sí. Al cambiar la tina por regadera cambian el desagüe y la llave, y la plomería nueva o reubicada necesita permiso. En Auburn se tramita con Inspection Services; en Opelika, con la división de Building Inspection de la ciudad; fuera de la ciudad, con el condado de Lee. Nosotros sacamos el permiso a nuestro nombre y programamos las inspecciones, y le explicamos todo en español. En nuestra [guía de permisos](guide:permits) está qué cubre cada oficina.",
        ] },
        { h: "Al vender: deje por lo menos una tina", p: [
          "El consejo que más dan los agentes de bienes raíces es sencillo: que quede por lo menos una tina en la casa. Las familias con niños chiquitos la buscan, y una casa sin tina puede tener menos compradores. Lo más común es cambiar la tina del baño principal por una regadera grande y dejar la tina en el otro baño. Si es la única tina en una casa de tres recámaras, piense en quién la compraría antes de quitarla.",
        ] },
        { h: "Lo que conviene agregar con las paredes abiertas", p: [
          "Para la ventilación, el Home Ventilating Institute recomienda 1 CFM de extracción por cada pie cuadrado en baños de hasta 100 pies cuadrados, con un mínimo de 50 CFM, y en baños más grandes 50 CFM por el inodoro, 50 por la regadera y 50 por la tina. El extractor debe sacar el aire afuera de la casa, no al ático, y uno de 1.0 sones o menos es tan callado que la gente sí lo prende.",
        ], list: [
          "Refuerzos de madera entre los postes para barras de apoyo, aunque hoy no las quiera. Ahora cuestan poco; después, mucho.",
          "Una regadera de mano en barra deslizable, fácil de alcanzar sentado.",
          "Una banca integrada o un lugar para un asiento plegable.",
          "Azulejo antiderrapante en el piso; el azulejo chico tiene más juntas y agarra mejor.",
          "Un nicho a una altura donde no tenga que agacharse ni estirarse por encima del chorro.",
        ] },
      ],
      faq: [
        { q: "¿Cuánto cuesta quitar la tina y poner regadera en Auburn?", a: `La mayoría de los cambios con azulejo que cotizamos en Auburn y Opelika quedan entre ${mid("bath", 1)} con acabados intermedios. Si es sin escalón o se mueve el desagüe, ${mid("bath", 2)}.` },
        { q: "¿Sale más barato poner regadera que tina?", a: "Normalmente no. Poner una tina nueva en el mismo lugar muchas veces cuesta menos, porque la regadera lleva base, impermeabilización completa y cancel. La gente la cambia por comodidad y por tener una regadera más amplia, no para ahorrar." },
        { q: "¿Cuántos días tardan en cambiar la tina por regadera?", a: "Unas 2 o 3 semanas de obra para una regadera de azulejo, más 1 o 2 semanas para el cancel después de poner el azulejo. Con paneles suele ser más rápido." },
        { q: "¿Necesito permiso para cambiar la tina por regadera en Auburn?", a: "Por lo general sí, porque cambian el desagüe y la llave. Nosotros lo sacamos y programamos las inspecciones con la ciudad de Auburn, la de Opelika o el condado de Lee, según su dirección." },
        { q: "¿Pierde valor mi casa si quito la única tina?", a: "Puede tener menos compradores, sobre todo familias con niños chiquitos. Lo más común es cambiar la del baño principal y dejar una tina en el otro baño." },
        { q: "¿Me pueden explicar todo en español?", a: "Sí. Le damos el presupuesto por escrito, se lo explicamos punto por punto en español y le mandamos fotos de la impermeabilización antes de poner el azulejo. Vea también nuestro servicio de [remodelación de baños](service:bathroom)." },
      ],
    },
  },
};
