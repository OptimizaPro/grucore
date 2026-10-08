/* ---------------------------------------------------------------------------
   One landing page per service, per language. These are the pages Google
   ranks for "kitchen remodel auburn al" / "remodelación de cocinas auburn"
   and the pages paid ads land on, so each is written to stand on its own:
   what's included, what drives cost, honest FAQs, and a form on the page.

   Spanish is written natively (usted), not translated line by line.
   ------------------------------------------------------------------------- */
import type { Locale } from "./i18n";
import type { PhotoKey } from "./content";
import type { EstimatorType } from "./estimator";

export type ServicePageId =
  | "kitchen" | "bathroom" | "additions" | "remodeling" | "painting" | "cabinets" | "flooring" | "repairs" | "rental";

export interface ServiceCopy {
  name: string; title: string; description: string; eyebrow: string; h1: string; lede: string; alt: string;
  intro: string[]; included: string[];
  glance: { timeline: string; range: string; permit: string };
  why: { h: string; p: string }[];
  costP: string; factors: { h: string; p: string }[];
  faq: { q: string; a: string }[];
}
export interface ServicePage {
  id: ServicePageId; slug: Record<Locale, string>; form: string; photo: PhotoKey; photos: [PhotoKey, PhotoKey];
  estimator?: EstimatorType; related: ServicePageId[]; t: Record<Locale, ServiceCopy>;
}

export const SERVICE_UI: Record<Locale, {
  included: string; glance: string; timeline: string; range: string; permit: string; why: string; costEyebrow: string; costH: string;
  estimatorCta: string; details: string; faqEyebrow: string; faqH: string; related: string; areas: string; formEyebrow: string; formH: string; formP: string; crumbServices: string;
  /* Who / where / language rows in the "at a glance" box, so the page states them in plain text. */
  who: string; where: string; whereV: string; langs: string; langsV: string; updated: string;
}> = {
  en: {
    included: "What's included", glance: "At a glance", timeline: "Typical timeline", range: "Typical investment", permit: "Permits", why: "Why homeowners pick us for this",
    costEyebrow: "Pricing, honestly", costH: "What drives the price", estimatorCta: "Try the cost estimator", details: "Details & pricing", faqEyebrow: "Questions we hear", faqH: "Frequently asked questions",
    related: "Related services", areas: "Where we do this work", formEyebrow: "Free written estimate", formH: "Tell us about your project", formP: "Three quick questions. We reply within one business day, usually the same day.", crumbServices: "Services",
    who: "Contractor", where: "Service area", whereV: "Auburn, Opelika, Smiths Station and Lee County, AL", langs: "Languages", langsV: "English and Spanish", updated: "Updated",
  },
  es: {
    included: "Qué incluye", glance: "En resumen", timeline: "Duración típica", range: "Inversión típica", permit: "Permisos", why: "Por qué nos eligen para esto",
    costEyebrow: "Precios, con franqueza", costH: "Qué hace variar el precio", estimatorCta: "Use la calculadora de costos", details: "Detalles y precios", faqEyebrow: "Lo que nos preguntan", faqH: "Preguntas frecuentes",
    related: "Servicios relacionados", areas: "Dónde hacemos este trabajo", formEyebrow: "Presupuesto gratis por escrito", formH: "Cuéntenos de su proyecto", formP: "Tres preguntas rápidas. Le respondemos en un día hábil, casi siempre el mismo día, en español.", crumbServices: "Servicios",
    who: "Contratista", where: "Zona de servicio", whereV: "Auburn, Opelika, Smiths Station y el condado de Lee, AL", langs: "Idiomas", langsV: "Español e inglés", updated: "Actualizado el",
  },
};

export const SERVICE_PAGES: ServicePage[] = [
  /* ------------------------------------------------------------ KITCHEN */
  {
    id: "kitchen", slug: { en: "kitchen-remodeling", es: "remodelacion-de-cocinas" }, form: "kitchensBaths", photo: "kitchen1", photos: ["kitchen2", "kitchen3"],
    estimator: "kitchen", related: ["cabinets", "bathroom", "flooring"],
    t: {
      en: {
        name: "Kitchen Remodeling", alt: "Remodeled kitchen with white cabinets and a marble island in Auburn, AL",
        title: "Kitchen Remodeling in Auburn & Opelika, AL | Free Estimate",
        description: "Kitchen remodeling in Auburn and Opelika, AL: cabinets, quartz and granite counters, tile, islands and new layouts. Family-owned and insured. Free estimate.",
        eyebrow: "Kitchen remodeling · Auburn & Opelika, AL", h1: "Kitchen remodeling in Auburn, AL",
        lede: "From a cabinet-and-counter refresh to a gutted, re-planned kitchen with an island. One crew, one written price, and the owner on site.",
        intro: [
          "The kitchen is the room that decides whether a house works for your family, and it's the room buyers judge first when you sell. We plan around how you actually cook, store and gather, then build it with cabinetry, counters, tile and plumbing done right the first time.",
          "Many Auburn and Opelika homes built in the '80s, '90s and early 2000s have good bones and tired kitchens: builder-grade oak, laminate tops, a closed-off layout. Sometimes the right answer is a full remodel. Sometimes it's painting the cabinets and changing the counters for a third of the price. We'll tell you which, honestly.",
        ],
        included: ["Layout planning and design coordination", "Demolition and haul-off", "Custom, semi-custom or stock cabinetry", "Quartz, granite, butcher block and solid-surface counters", "Tile backsplashes", "Islands and peninsulas", "Plumbing and electrical coordination, under-cabinet lighting", "LVP, tile or hardwood flooring", "Drywall, trim and paint to finish", "Permits and inspections when required"],
        glance: { timeline: "2–6 weeks on site", range: "From $8,000 refresh · $25,000–$80,000 full remodel", permit: "Required when plumbing, electrical or walls change. We pull it." },
        why: [
          { h: "Build and finish, one crew", p: "The people who hang your cabinets also paint the trim and set the tile. No hand-offs, no finger-pointing between trades." },
          { h: "A kitchen you can live with during the work", p: "We plan a temporary sink and fridge setup, dust barriers and a daily cleanup so your family can still function." },
          { h: "Refresh or remodel, honestly", p: "If your cabinet boxes are solid, we'll show you what painting and new counters would cost next to a full tear-out." },
        ],
        costP: "A kitchen in Lee County typically lands between $25,000 and $45,000 when the layout stays the same, and $45,000 to $80,000 when walls or plumbing move. A cosmetic refresh starts around $8,000. Your written estimate is the real number, and it's the one we hold to.",
        factors: [
          { h: "Layout changes", p: "Moving a sink, range or wall adds plumbing, electrical and framing. Keeping the footprint is the biggest single saving." },
          { h: "Cabinet line", p: "Stock, semi-custom and custom cabinetry can differ by 2–3× for the same kitchen. Painting sound boxes is cheaper still." },
          { h: "Counters and tile", p: "Quartz and granite are close in price here; the edge profile, seams and backsplash height move the number." },
          { h: "What's behind the walls", p: "Older homes can hide water damage or undersized wiring. We check before we price and flag anything we find before we fix it." },
        ],
        faq: [
          { q: "How long will I be without a kitchen?", a: "Most full kitchen remodels take 3 to 6 weeks on site once materials are in. We sequence the work so the sink and fridge are back as early as possible, and we'll set up a temporary station if you want one." },
          { q: "Should I paint my cabinets or replace them?", a: "If the boxes are solid wood or plywood and the layout works, painting with a sprayed enamel gives you a new-looking kitchen for roughly a fifth of replacement cost. If doors are warped, boxes are water-damaged or you want a new layout, replace them." },
          { q: "Do you help with design and choosing materials?", a: "Yes. We help you plan the layout, then point you to the local showrooms and suppliers we trust for cabinets, counters and tile, and coordinate orders and measurements." },
          { q: "Do I need a permit for a kitchen remodel?", a: "Cosmetic work usually doesn't. Moving plumbing, adding circuits or changing walls does. We pull the permits in our name and meet the inspector in Auburn, Opelika or Lee County." },
          { q: "Can you work with my budget?", a: "Tell us the number you're comfortable with. We'll show you what it buys, where to spend, and where to save, before you commit to anything." },
        ],
      },
      es: {
        name: "Remodelación de cocinas", alt: "Cocina remodelada con gabinetes blancos e isla de mármol en Auburn, AL",
        title: "Remodelación de cocinas en Auburn y Opelika, AL",
        description: "Remodelamos cocinas en Auburn y Opelika, AL: gabinetes, cubiertas de cuarzo y granito, azulejo, islas y nueva distribución. Presupuesto gratis en español.",
        eyebrow: "Remodelación de cocinas · Auburn y Opelika, AL", h1: "Remodelación de cocinas en Auburn, AL",
        lede: "Desde cambiar cubiertas y pintar gabinetes hasta una cocina nueva con isla. Una sola cuadrilla, un precio por escrito y el dueño en la obra, atendiéndole en español.",
        intro: [
          "La cocina es el corazón de la casa: ahí se cocina, se platica y se junta la familia. Por eso la planeamos pensando en cómo cocina usted de verdad, dónde guarda las cosas y cuánta gente se sienta a la mesa, y la construimos con gabinetes, cubiertas, azulejo y plomería bien hechos a la primera.",
          "Muchas casas de Auburn y Opelika de los años 80, 90 y principios de los 2000 tienen buena estructura pero una cocina cansada: gabinetes de roble de constructor, cubiertas de formica, todo cerrado. A veces conviene remodelar completo. A veces basta con pintar los gabinetes y cambiar las cubiertas, por una tercera parte del precio. Le decimos con toda honestidad qué le conviene.",
        ],
        included: ["Planeación de la distribución y el diseño", "Demolición y retiro de escombro", "Gabinetes a la medida, semi a la medida o de línea", "Cubiertas de cuarzo, granito o madera", "Salpicadero de azulejo", "Islas y penínsulas", "Coordinación de plomería y electricidad, luz bajo gabinetes", "Pisos de LVP, azulejo o madera", "Tablaroca, molduras y pintura final", "Permisos e inspecciones cuando se requieren"],
        glance: { timeline: "2 a 6 semanas en obra", range: "Desde $8,000 renovación · $25,000–$80,000 remodelación completa", permit: "Se requiere si se mueve plomería, electricidad o paredes. Nosotros lo tramitamos." },
        why: [
          { h: "Construimos y terminamos", p: "Los mismos que instalan sus gabinetes pintan las molduras y ponen el azulejo. Sin pasarse la bolita entre oficios." },
          { h: "Usted sigue viviendo en su casa", p: "Le dejamos un fregadero y refrigerador provisionales, barreras contra el polvo y limpieza diaria para que su familia siga con su rutina." },
          { h: "Todo explicado en español", p: "El presupuesto, el contrato y cada cambio se lo explicamos en su idioma, por escrito. Sin letra chica y sin sorpresas." },
        ],
        costP: "En el condado de Lee, una cocina suele costar entre $25,000 y $45,000 si se conserva la distribución, y entre $45,000 y $80,000 si se mueven paredes o plomería. Una renovación ligera empieza alrededor de $8,000. El número real es el de su presupuesto por escrito, y ese es el que respetamos.",
        factors: [
          { h: "Cambiar la distribución", p: "Mover el fregadero, la estufa o una pared suma plomería, electricidad y estructura. Conservar el acomodo es el mayor ahorro." },
          { h: "El tipo de gabinete", p: "Entre gabinetes de línea, semi a la medida y a la medida puede haber 2 o 3 veces de diferencia. Pintar los que ya tiene sale todavía más barato." },
          { h: "Cubiertas y azulejo", p: "Aquí el cuarzo y el granito cuestan parecido; lo que cambia el precio es el canto, las uniones y la altura del salpicadero." },
          { h: "Lo que hay detrás de las paredes", p: "Las casas más viejas pueden esconder humedad o cableado insuficiente. Revisamos antes de cotizar y le avisamos antes de arreglar cualquier cosa." },
        ],
        faq: [
          { q: "¿Cuánto tiempo voy a estar sin cocina?", a: "La mayoría de las remodelaciones completas toman de 3 a 6 semanas en obra, ya con materiales. Organizamos el trabajo para que el fregadero y el refrigerador regresen lo antes posible, y si quiere le armamos una estación provisional." },
          { q: "¿Me conviene pintar los gabinetes o cambiarlos?", a: "Si los gabinetes son de madera o triplay y en buen estado, pintarlos a pistola le da una cocina que parece nueva por más o menos la quinta parte de lo que cuesta cambiarlos. Si están hinchados por el agua o quiere otra distribución, conviene cambiarlos." },
          { q: "¿Me ayudan a escoger el diseño y los materiales?", a: "Sí. Le ayudamos a planear la distribución y le recomendamos las tiendas y proveedores de la zona en los que confiamos para gabinetes, cubiertas y azulejo. Nosotros coordinamos medidas y pedidos." },
          { q: "¿Se necesita permiso para remodelar la cocina?", a: "Los cambios estéticos normalmente no. Mover plomería, agregar circuitos o cambiar paredes sí. Nosotros sacamos los permisos a nuestro nombre y recibimos al inspector en Auburn, Opelika o el condado de Lee." },
          { q: "¿Pueden trabajar con mi presupuesto?", a: "Díganos con cuánto se siente cómodo. Le enseñamos qué se puede hacer con esa cantidad, en qué vale la pena invertir y en qué ahorrar, antes de que se comprometa a nada." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ BATHROOM */
  {
    id: "bathroom", slug: { en: "bathroom-remodeling", es: "remodelacion-de-banos" }, form: "kitchensBaths", photo: "bathVanityAfter", photos: ["bathTubAfterWide", "bathTileDetail"],
    estimator: "bath", related: ["kitchen", "flooring", "remodeling"],
    t: {
      en: {
        name: "Bathroom Remodeling", alt: "Remodeled bathroom with a navy vanity, gold mirror and light fixture, and white tile along the lower wall",
        title: "Bathroom Remodeling in Auburn & Opelika, AL | Showers",
        description: "Bathroom remodeling in Auburn and Opelika, AL: walk-in and curbless showers, tub-to-shower conversions, tile and vanities, waterproofed right. Free estimate.",
        eyebrow: "Bathroom remodeling · Auburn & Opelika, AL", h1: "Bathroom remodeling in Auburn, AL",
        lede: "Walk-in showers, tub-to-shower conversions and full primary baths, waterproofed properly behind the tile where it matters most.",
        intro: [
          "A bathroom is small, but it's the most technical room in the house. Water goes where it isn't supposed to unless the pan, membrane and slope are done right, and you won't find out for two years. We build showers with a proper waterproofing system under every tile, and we'll show you photos of that stage before it's covered.",
          "Most of our bath work in Lee County falls into three groups: hall baths that need a full refresh, tub-to-shower conversions for easier access, and primary bath remodels with a larger walk-in or curbless shower and a double vanity.",
        ],
        included: ["Demolition down to studs when needed", "Shower pans, membranes and waterproofing", "Walk-in, curbless and tiled tub showers", "Tub-to-shower conversions", "Floor and wall tile, niches and benches", "Vanities, tops, mirrors and lighting", "Glass enclosures", "Exhaust fans vented outside", "Grab bars and aging-in-place details", "Plumbing and electrical coordination, permits"],
        glance: { timeline: "2–4 weeks on site", range: "From $6,000 refresh · $14,000–$48,000 full remodel", permit: "Required when plumbing or electrical changes. We pull it." },
        why: [
          { h: "Waterproofing you can see", p: "We photograph the membrane and pan flood test before tile goes on, and send the photos to you." },
          { h: "Aging-in-place, done beautifully", p: "Curbless entries, blocking for grab bars, comfort-height toilets and slip-resistant tile that don't look clinical." },
          { h: "One bathroom out of service, not the house", p: "We keep dust behind barriers and plan around the bathroom your family still needs." },
        ],
        costP: "A bathroom refresh in Auburn or Opelika starts around $6,000. A full hall bath down to the studs usually runs $14,000–$26,000, and a primary bath with a layout change or curbless shower runs $26,000–$48,000.",
        factors: [
          { h: "Tile area and pattern", p: "Floor-to-ceiling tile, small mosaics and herringbone take far more labor than a standard layout." },
          { h: "Moving plumbing", p: "Relocating a toilet or drain means cutting floors and rerouting lines. Keeping fixtures in place saves thousands." },
          { h: "Curbless showers", p: "A zero-threshold entry requires recessing the subfloor. Worth it for accessibility, but it adds framing work." },
          { h: "Glass and fixtures", p: "Frameless glass and thermostatic valves look and work great but are a real line item. We'll price options side by side." },
        ],
        faq: [
          { q: "How long does a bathroom remodel take?", a: "A refresh is often 1–2 weeks. A full remodel down to the studs is typically 2–4 weeks on site, depending on tile, glass lead times and inspections." },
          { q: "Can you convert my tub to a walk-in shower?", a: "Yes, it's one of our most common jobs. We remove the tub, build a properly sloped and waterproofed pan, tile the walls and floor, and add glass, a niche and a bench if you want them." },
          { q: "Do you build curbless (zero-entry) showers?", a: "Yes. On wood-framed floors we recess the subfloor so the shower floor sits flush with the bathroom, then waterproof the whole wet area." },
          { q: "What's the most common mistake you fix in other people's bathrooms?", a: "Showers tiled over drywall or green board with no real waterproofing. It looks fine until the wall behind it rots. We always use a waterproofing system rated for showers." },
        ],
      },
      es: {
        name: "Remodelación de baños", alt: "Baño remodelado con tocador azul marino, espejo y lámpara dorados, y azulejo blanco en la parte baja de la pared",
        title: "Remodelación de baños en Auburn y Opelika, AL",
        description: "Remodelamos baños en Auburn y Opelika, AL: regaderas a ras de piso, cambio de tina por regadera, azulejo y tocadores bien impermeabilizados. En español.",
        eyebrow: "Remodelación de baños · Auburn y Opelika, AL", h1: "Remodelación de baños en Auburn, AL",
        lede: "Regaderas grandes, cambio de tina por regadera y baños principales completos, con la impermeabilización bien hecha detrás del azulejo, que es donde más importa.",
        intro: [
          "El baño es chico, pero es el cuarto más delicado de la casa. Si la base, la membrana y la pendiente no quedan bien, el agua se mete donde no debe, y uno se entera dos años después. Nosotros hacemos cada regadera con un sistema de impermeabilización completo debajo del azulejo, y le mandamos fotos de esa etapa antes de taparla.",
          "Casi todo nuestro trabajo de baños en el condado de Lee es de tres tipos: baños de visitas que necesitan renovarse, cambio de tina por regadera para entrar más fácil, y baños principales con regadera más grande o a ras de piso y doble lavabo.",
        ],
        included: ["Demolición hasta la estructura cuando hace falta", "Base de regadera, membranas e impermeabilización", "Regaderas grandes, a ras de piso o tina con azulejo", "Cambio de tina por regadera", "Azulejo en piso y paredes, nichos y bancas", "Tocadores, cubiertas, espejos e iluminación", "Canceles de cristal", "Extractor con salida al exterior", "Barras de apoyo y detalles para personas mayores", "Plomería, electricidad y permisos"],
        glance: { timeline: "2 a 4 semanas en obra", range: "Desde $6,000 renovación · $14,000–$48,000 remodelación completa", permit: "Se requiere si cambia la plomería o la electricidad. Nosotros lo tramitamos." },
        why: [
          { h: "Impermeabilización a la vista", p: "Tomamos fotos de la membrana y de la prueba de agua de la base antes de poner el azulejo, y se las mandamos." },
          { h: "Pensado para toda la familia", p: "Entradas sin escalón, refuerzos para barras de apoyo e inodoros a buena altura para los papás o abuelos, sin que parezca hospital." },
          { h: "Todo en español, por escrito", p: "Le explicamos cada paso y cada costo en su idioma. Si algo cambia, lo sabe antes, no en la factura." },
        ],
        costP: "Renovar un baño en Auburn u Opelika empieza alrededor de $6,000. Un baño completo hasta la estructura suele costar de $14,000 a $26,000, y un baño principal con cambio de distribución o regadera a ras de piso de $26,000 a $48,000.",
        factors: [
          { h: "Cuánto azulejo y qué diseño", p: "Azulejo hasta el techo, mosaicos pequeños o espiga llevan mucha más mano de obra que un acomodo sencillo." },
          { h: "Mover la plomería", p: "Cambiar de lugar el inodoro o el desagüe implica cortar el piso y rehacer tuberías. Dejar todo donde está ahorra miles." },
          { h: "Regadera a ras de piso", p: "Para que no haya escalón hay que rebajar el subpiso. Vale la pena, pero suma trabajo de estructura." },
          { h: "Cristal y accesorios", p: "El cancel sin marco y las llaves termostáticas se ven y funcionan muy bien, pero cuestan. Le cotizamos opciones lado a lado." },
        ],
        faq: [
          { q: "¿Cuánto tarda remodelar un baño?", a: "Una renovación ligera suele tomar 1 o 2 semanas. Un baño completo hasta la estructura, de 2 a 4 semanas en obra, según el azulejo, el cristal y las inspecciones." },
          { q: "¿Pueden cambiar mi tina por una regadera?", a: "Sí, es de los trabajos que más hacemos. Quitamos la tina, hacemos una base con pendiente e impermeabilizada, ponemos azulejo en paredes y piso, y si quiere le agregamos cancel, nicho y banca." },
          { q: "¿Hacen regaderas sin escalón?", a: "Sí. En pisos de madera rebajamos el subpiso para que la regadera quede al mismo nivel que el baño, y luego impermeabilizamos toda la zona mojada." },
          { q: "¿Cuál es el error más común que encuentran en otros baños?", a: "Regaderas con azulejo pegado directo sobre tablaroca, sin impermeabilizar. Se ve bien hasta que la pared de atrás se pudre. Nosotros siempre usamos un sistema de impermeabilización para regaderas." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ ADDITIONS */
  {
    id: "additions", slug: { en: "home-additions", es: "ampliaciones-de-casas" }, form: "additions", photo: "framing2", photos: ["framing1", "houseWhite"],
    estimator: "addition", related: ["remodeling", "painting", "bathroom"],
    t: {
      en: {
        name: "Home Additions", alt: "Home addition framed with wood studs and roof trusses in Lee County, AL",
        title: "Home Additions in Auburn & Opelika, AL | Rooms & Garages",
        description: "Home additions in Auburn, Opelika and Lee County, AL: bedrooms, baths, in-law suites, bonus rooms, sunrooms and garages that match your house. Permits done.",
        eyebrow: "Home additions · Auburn, Opelika & Lee County", h1: "Home additions that look original",
        lede: "Bedrooms, primary suites, in-law suites, sunrooms and garages that match your roofline, siding and trim, so nobody can tell where the old house ends.",
        intro: [
          "Growing families, parents moving in, a home office that isn't the dining table: an addition is often cheaper and less disruptive than moving, especially with today's mortgage rates. Done badly, it looks bolted on. Done well, it looks like the original plan.",
          "We handle an addition start to finish: site review, drawings and engineering coordination, permits, foundation, framing, roofing, windows, siding, mechanical trades, drywall, trim and paint. Because we're also painters and finish carpenters, the last 10% gets the same care as the first 90%.",
        ],
        included: ["Feasibility walk and budget planning", "Drawings and engineering coordination", "Permits, inspections and HOA submittals", "Slab or crawlspace foundations", "Framing, roofing and tie-ins", "Windows, doors and siding matched to the house", "HVAC, electrical and plumbing coordination", "Insulation, drywall and trim", "Interior and exterior paint", "Final clean and walkthrough"],
        glance: { timeline: "6–16 weeks after permits", range: "From $40,000 · suites $95,000–$170,000", permit: "Always required. We pull it and coordinate inspections." },
        why: [
          { h: "It matches", p: "We match shingles, siding profile, window grids, soffit depth and trim so the addition reads as part of the house." },
          { h: "One contract, start to finish", p: "No juggling a framer, a roofer and a painter. We coordinate every trade and every inspection." },
          { h: "Straight talk on budget", p: "We'll give you a planning range at the first visit, before you pay for drawings, so you don't design something you can't build." },
        ],
        costP: "Additions in Lee County generally start around $40,000 for a garage or sunroom, $55,000–$95,000 for a bedroom or bonus room, and $95,000–$170,000 for a primary or in-law suite with a full bath.",
        factors: [
          { h: "Size and plumbing", p: "Square footage drives framing and roofing; adding a bathroom or kitchenette adds plumbing and fixtures." },
          { h: "Foundation and site", p: "Sloped lots, crawlspaces vs. slabs, and access for equipment all affect cost." },
          { h: "Roof tie-in", p: "Matching a complex roofline takes more framing and roofing than a simple shed or gable addition." },
          { h: "Mechanical capacity", p: "Your existing HVAC and electrical panel may need upgrading to carry the new space." },
        ],
        faq: [
          { q: "How long does a home addition take?", a: "After permits are approved, most additions take 6 to 16 weeks on site depending on size, weather and inspections. Drawings and permitting typically add several weeks before that." },
          { q: "Do I need an architect?", a: "Not always. Many single-story additions can be drawn by a residential designer and checked by an engineer where needed. We'll tell you what your project requires." },
          { q: "Will my HOA need to approve it?", a: "In most Auburn and Opelika subdivisions, yes. We prepare the drawings, material and color selections your HOA's architectural committee asks for." },
          { q: "Is an addition worth it versus moving?", a: "If you like your neighborhood and schools, an addition often costs less than the commissions, closing costs and higher rate of a new mortgage. We'll give you real numbers so you can compare." },
        ],
      },
      es: {
        name: "Ampliaciones de casas", alt: "Ampliación de casa con estructura de madera en el condado de Lee, AL",
        title: "Ampliaciones de casas en Auburn y Opelika, AL",
        description: "Ampliamos casas en Auburn, Opelika y el condado de Lee: cuartos, baños, suites para la familia, solarios y cocheras que combinan con su casa. Con permisos.",
        eyebrow: "Ampliaciones · Auburn, Opelika y condado de Lee", h1: "Ampliaciones que parecen originales",
        lede: "Dormitorios, suites, cuartos para los papás o los suegros, solarios y cocheras que combinan con su techo, su fachada y sus molduras. Nadie va a notar dónde termina la casa vieja.",
        intro: [
          "La familia crece, los papás se vienen a vivir con ustedes, hace falta una oficina que no sea la mesa del comedor. Muchas veces ampliar sale más barato y da menos dolores de cabeza que mudarse, sobre todo con las tasas de interés de hoy. Mal hecha, una ampliación se ve pegada. Bien hecha, parece que siempre estuvo ahí.",
          "Nos encargamos de todo: revisión del terreno, planos y coordinación con el ingeniero, permisos, cimientos, estructura, techo, ventanas, fachada, instalaciones, tablaroca, molduras y pintura. Como también somos pintores y carpinteros de acabados, el último 10% se hace con el mismo cuidado que el primer 90%.",
        ],
        included: ["Visita de factibilidad y presupuesto de planeación", "Planos y coordinación con ingeniería", "Permisos, inspecciones y trámites con la HOA", "Cimientos de losa o con espacio de ventilación", "Estructura, techo y unión con la casa", "Ventanas, puertas y fachada iguales a las de la casa", "Coordinación de aire acondicionado, electricidad y plomería", "Aislamiento, tablaroca y molduras", "Pintura interior y exterior", "Limpieza final y recorrido de entrega"],
        glance: { timeline: "6 a 16 semanas después de los permisos", range: "Desde $40,000 · suites $95,000–$170,000", permit: "Siempre se requiere. Nosotros lo tramitamos y coordinamos las inspecciones." },
        why: [
          { h: "Combina con su casa", p: "Igualamos tejas, fachada, cuadrícula de ventanas, aleros y molduras para que la ampliación se vea parte de la casa." },
          { h: "Un solo contrato, de principio a fin", p: "Usted no tiene que coordinar a un carpintero, un techador y un pintor. Nosotros coordinamos cada oficio y cada inspección." },
          { h: "Números claros desde el principio", p: "En la primera visita le damos un rango para planear, antes de que pague planos, para que no diseñe algo que no puede construir." },
        ],
        costP: "En el condado de Lee, una ampliación empieza alrededor de $40,000 para una cochera o solario, de $55,000 a $95,000 para un dormitorio o cuarto extra, y de $95,000 a $170,000 para una suite con baño completo.",
        factors: [
          { h: "Tamaño y plomería", p: "Los pies cuadrados mandan en estructura y techo; agregar baño o cocineta suma plomería y accesorios." },
          { h: "Cimientos y terreno", p: "Terrenos con pendiente, losa o espacio de ventilación y el acceso para maquinaria afectan el costo." },
          { h: "Unión con el techo", p: "Igualar un techo complicado lleva más trabajo que una ampliación de techo sencillo." },
          { h: "Capacidad de las instalaciones", p: "Puede que su aire acondicionado o su panel eléctrico necesiten crecer para el espacio nuevo." },
        ],
        faq: [
          { q: "¿Cuánto tarda una ampliación?", a: "Ya con los permisos aprobados, la mayoría toma de 6 a 16 semanas en obra, según el tamaño, el clima y las inspecciones. Los planos y permisos suelen sumar algunas semanas antes." },
          { q: "¿Necesito un arquitecto?", a: "No siempre. Muchas ampliaciones de un piso las puede dibujar un diseñador residencial, con revisión de ingeniero donde haga falta. Le decimos qué necesita su proyecto." },
          { q: "¿Mi HOA tiene que aprobarla?", a: "En casi todos los fraccionamientos de Auburn y Opelika, sí. Nosotros preparamos los planos, materiales y colores que pide el comité de la HOA." },
          { q: "¿Conviene ampliar o mejor mudarse?", a: "Si le gusta su vecindario y las escuelas, ampliar muchas veces cuesta menos que las comisiones, los gastos de cierre y una hipoteca nueva con tasa más alta. Le damos números reales para que compare." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ REMODELING */
  {
    id: "remodeling", slug: { en: "home-remodeling", es: "remodelacion-de-casas" }, form: "remodeling", photo: "kitchen3", photos: ["bathTubAfterClose", "vanityNavy"],
    estimator: "remodel", related: ["kitchen", "additions", "flooring"],
    t: {
      en: {
        name: "Home Remodeling", alt: "Open-concept living room after a whole-home remodel in Auburn, AL",
        title: "Home Remodeling Contractor in Auburn, AL | Whole-Home",
        description: "Whole-home and room remodeling in Auburn, Opelika and Lee County, AL: open floor plans, bonus rooms, trim, built-ins and older homes updated. Free estimate.",
        eyebrow: "Home remodeling · Auburn, Opelika & Lee County", h1: "Home remodeling in Auburn, AL",
        lede: "Open up the floor plan, update an older house top to bottom, or finally finish the bonus room. Planned around how your family lives.",
        intro: [
          "A remodel is about how a house works: where the light comes from, how you move from kitchen to living room, where the shoes and backpacks go. We start with how you live, then decide what walls, finishes and systems need to change.",
          "We do a lot of work on Auburn and Opelika homes from the 1970s through the 2000s: removing the wall between kitchen and den, replacing carpet with LVP throughout, updating trim and doors, and bringing lighting and outlets up to modern expectations.",
        ],
        included: ["Open-concept conversions and beam installs", "Whole-home updates for older houses", "Bonus room and attic finishing", "Trim, doors, built-ins and mantels", "Lighting and electrical updates (licensed trades)", "Flooring throughout", "Drywall, texture and paint", "Structural and rot repairs", "Design coordination", "Permits and inspections"],
        glance: { timeline: "2–8 weeks on site", range: "From $10,000 · whole-home $70,000–$150,000", permit: "Required for structural, electrical or plumbing changes. We pull it." },
        why: [
          { h: "We know these houses", p: "Local builder-grade construction from the '70s to the 2000s has predictable weak spots. We plan for them instead of being surprised." },
          { h: "One point of contact", p: "The owner quotes, schedules and answers the phone. You're never passed around." },
          { h: "Phased if you need it", p: "We can split a big remodel into phases so you can budget and live in the house between them." },
        ],
        costP: "A single-room remodel or wall removal typically runs $10,000–$25,000. Updating the main living areas runs $30,000–$70,000, and a whole-home update of an older house runs $70,000–$150,000.",
        factors: [
          { h: "Structural changes", p: "Removing a load-bearing wall requires a sized beam, posts and sometimes an engineer's letter." },
          { h: "Systems", p: "Older wiring, galvanized plumbing and undersized HVAC ducts are cheaper to fix while walls are open." },
          { h: "Scope creep", p: "We price each area separately so you can decide what's in and out before we start." },
          { h: "Finish level", p: "Doors, trim profiles, lighting and flooring grades swing the number more than people expect." },
        ],
        faq: [
          { q: "Can you remove a load-bearing wall?", a: "Yes. We size the beam, coordinate an engineer where required, pull the permit and install posts and footings so the load is carried properly." },
          { q: "Can we live in the house during a remodel?", a: "Usually yes. We section off work areas with dust barriers, keep a bathroom and kitchen functional where possible, and clean daily." },
          { q: "How do you keep a remodel on budget?", a: "A detailed written scope, allowances you choose up front, and a written change order before any extra work. You approve every dollar before it's spent." },
        ],
      },
      es: {
        name: "Remodelación de casas", alt: "Sala de concepto abierto después de remodelar la casa en Auburn, AL",
        title: "Remodelación de casas en Auburn, AL | En español",
        description: "Remodelamos casas completas y cuartos en Auburn, Opelika y el condado de Lee: espacios abiertos, cuartos extra, molduras y casas antiguas al día. En español.",
        eyebrow: "Remodelación · Auburn, Opelika y condado de Lee", h1: "Remodelación de casas en Auburn, AL",
        lede: "Abrir la sala y la cocina, poner al día una casa vieja de arriba abajo o por fin terminar el cuarto de arriba. Todo planeado según cómo vive su familia.",
        intro: [
          "Remodelar es hacer que la casa funcione: por dónde entra la luz, cómo se pasa de la cocina a la sala, dónde se quedan los zapatos y las mochilas. Empezamos por cómo vive usted y luego decidimos qué paredes, acabados e instalaciones hay que cambiar.",
          "Trabajamos mucho en casas de Auburn y Opelika de los años 70 al 2000: quitar la pared entre la cocina y la sala, cambiar la alfombra por LVP en toda la casa, renovar molduras y puertas, y poner la iluminación y los contactos al día.",
        ],
        included: ["Concepto abierto e instalación de vigas", "Actualización completa de casas antiguas", "Acabado de cuartos extra y áticos", "Molduras, puertas, muebles empotrados y chimeneas", "Iluminación y electricidad (con electricista con licencia)", "Pisos en toda la casa", "Tablaroca, textura y pintura", "Reparaciones estructurales y de madera podrida", "Coordinación de diseño", "Permisos e inspecciones"],
        glance: { timeline: "2 a 8 semanas en obra", range: "Desde $10,000 · casa completa $70,000–$150,000", permit: "Se requiere para cambios estructurales, eléctricos o de plomería. Nosotros lo tramitamos." },
        why: [
          { h: "Conocemos estas casas", p: "Las casas de constructor de la zona tienen puntos débiles que ya conocemos. Los planeamos desde el principio en lugar de llevarnos sorpresas." },
          { h: "Un solo responsable", p: "El dueño cotiza, organiza y contesta el teléfono, en español. Nadie lo trae de un lado a otro." },
          { h: "Por etapas, si lo necesita", p: "Podemos dividir una remodelación grande en etapas para que usted la pague con calma y siga viviendo en la casa." },
        ],
        costP: "Remodelar un cuarto o quitar una pared suele costar de $10,000 a $25,000. Renovar las áreas principales, de $30,000 a $70,000, y poner al día una casa antigua completa, de $70,000 a $150,000.",
        factors: [
          { h: "Cambios de estructura", p: "Quitar una pared de carga requiere una viga del tamaño correcto, postes y a veces una carta de ingeniero." },
          { h: "Instalaciones", p: "Cableado viejo, tubería galvanizada o ductos chicos salen más baratos de arreglar con las paredes abiertas." },
          { h: "Que el proyecto crezca", p: "Cotizamos cada área por separado para que usted decida qué entra y qué no antes de empezar." },
          { h: "Nivel de acabados", p: "Puertas, molduras, lámparas y tipo de piso mueven el precio más de lo que la gente cree." },
        ],
        faq: [
          { q: "¿Pueden quitar una pared de carga?", a: "Sí. Calculamos la viga, coordinamos con un ingeniero si se requiere, sacamos el permiso e instalamos postes y zapatas para que el peso quede bien apoyado." },
          { q: "¿Podemos vivir en la casa mientras remodelan?", a: "Casi siempre sí. Aislamos las áreas de trabajo con barreras contra el polvo, dejamos un baño y la cocina funcionando cuando se puede y limpiamos todos los días." },
          { q: "¿Cómo evitan que se pase del presupuesto?", a: "Con un alcance detallado por escrito, materiales que usted escoge desde el principio y una orden de cambio firmada antes de cualquier trabajo extra. Usted aprueba cada dólar antes de gastarlo." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ PAINTING */
  {
    id: "painting", slug: { en: "house-painting", es: "pintura-de-casas" }, form: "painting", photo: "paint1", photos: ["houseWhite", "porch2"],
    estimator: "exterior", related: ["cabinets", "repairs", "rental"],
    t: {
      en: {
        name: "Interior & Exterior Painting", alt: "Painter masking windows before painting a house exterior in Auburn, AL",
        title: "House Painters in Auburn & Opelika, AL | Interior, Exterior",
        description: "Interior and exterior house painting in Auburn and Opelika, AL: pressure washing, rot repair, caulking and premium paint for Alabama humidity. Free estimate.",
        eyebrow: "House painting · Auburn & Opelika, AL", h1: "House painters in Auburn, AL",
        lede: "Interior and exterior painting that starts with real prep: washing, scraping, rot repair and caulk, then premium paint made for Alabama sun and humidity.",
        intro: [
          "Paint fails in Alabama for predictable reasons: mildew, moisture behind siding, UV on the south and west walls, and paint applied over chalky or dirty surfaces. A great paint job is about ninety percent preparation, and it's the part most crews rush.",
          "Because we're carpenters too, we replace rotten trim, fascia and siding boards before we paint them, instead of caulking over rot and painting it the same color. Inside, we patch, sand, caulk and cut clean lines, then leave the house cleaner than we found it.",
        ],
        included: ["Pressure washing and mildew treatment", "Scraping, sanding and spot priming", "Wood rot, fascia and siding repair", "Caulking gaps, nail holes and joints", "Walls, ceilings, trim and doors", "Brick, stucco and siding", "Decks, porches and railings", "Color consultation and HOA submittals", "Premium Sherwin-Williams and Benjamin Moore products", "Daily cleanup and furniture protection"],
        glance: { timeline: "2–7 days for most homes", range: "Interior from $1,800 · exterior $4,000–$18,000", permit: "Not required for painting." },
        why: [
          { h: "Rot fixed, not painted over", p: "Our carpenters replace bad wood before the painters arrive. Same crew, same day, same invoice." },
          { h: "Products for this climate", p: "Mildew-resistant, high-build exterior coatings where the sun and humidity are hardest on them." },
          { h: "Clean lines, clean house", p: "Floors covered, furniture moved and protected, and every room put back the way we found it." },
        ],
        costP: "Interior painting starts around $1,800 for two or three rooms and runs $6,000–$11,000 for a typical 2,000 sq ft interior. Exterior painting in Lee County typically runs $4,000–$18,000 depending on size, stories, and how much repair the siding and trim need.",
        factors: [
          { h: "Prep and repair", p: "Rot, peeling and chalking paint add time. It's the most important part of the job and the first thing others skip." },
          { h: "Height and access", p: "Two-story walls, steep lots and tall foyers need ladders, planks or lifts." },
          { h: "Color changes", p: "Going dark-to-light or covering stains needs a primer coat plus two finish coats." },
          { h: "Trim and doors", p: "Detailed trim, shutters and doors are hand work and take longer than open wall." },
        ],
        faq: [
          { q: "What's the best time of year to paint a house exterior in Alabama?", a: "Spring and fall are ideal: mild temperatures and lower humidity help paint cure. Summer is fine with early starts and shade-chasing; we avoid painting right before rain or when dew won't burn off." },
          { q: "How long does exterior paint last here?", a: "With proper prep and a premium product, 8–12 years on siding and 5–7 on high-exposure trim is typical in our climate." },
          { q: "Do you help choose colors?", a: "Yes. We bring fan decks, can put sample patches on the house, and prepare the color submission if your HOA requires approval." },
          { q: "Do you paint cabinets too?", a: "Yes, with a different process: we spray a catalyzed enamel for a factory-smooth finish. See cabinet painting." },
        ],
      },
      es: {
        name: "Pintura interior y exterior", alt: "Pintor cubriendo ventanas antes de pintar una casa en Auburn, AL",
        title: "Pintores en Auburn y Opelika, AL | Pintura de casas",
        description: "Pintamos casas por dentro y por fuera en Auburn y Opelika, AL: lavado a presión, madera podrida, sellado y pintura de primera para la humedad. En español.",
        eyebrow: "Pintura de casas · Auburn y Opelika, AL", h1: "Pintores de casas en Auburn, AL",
        lede: "Pintura interior y exterior que empieza con una buena preparación: lavado, raspado, madera podrida reparada y sellado, y luego pintura de primera hecha para el sol y la humedad de Alabama.",
        intro: [
          "En Alabama la pintura falla siempre por lo mismo: moho, humedad detrás de la fachada, el sol en las paredes del sur y del poniente, y pintura aplicada sobre superficies sucias o gredosas. Un buen trabajo de pintura es noventa por ciento preparación, y es justo lo que muchos hacen a la carrera.",
          "Como también somos carpinteros, cambiamos la madera podrida de molduras, aleros y fachada antes de pintarla, en lugar de taparla con sellador y pintarla del mismo color. Por dentro resanamos, lijamos, sellamos y cortamos líneas limpias, y dejamos la casa más limpia de como la encontramos.",
        ],
        included: ["Lavado a presión y tratamiento contra moho", "Raspado, lijado y primario donde hace falta", "Reparación de madera podrida, aleros y fachada", "Sellado de grietas, hoyos y uniones", "Paredes, techos, molduras y puertas", "Ladrillo, estuco y fachada", "Terrazas, porches y barandales", "Asesoría de color y trámite con la HOA", "Productos Sherwin-Williams y Benjamin Moore", "Limpieza diaria y protección de muebles"],
        glance: { timeline: "2 a 7 días en la mayoría de las casas", range: "Interior desde $1,800 · exterior $4,000–$18,000", permit: "No se requiere permiso para pintar." },
        why: [
          { h: "La madera podrida se cambia", p: "Nuestros carpinteros reemplazan la madera mala antes de que lleguen los pintores. La misma cuadrilla, el mismo día y la misma factura." },
          { h: "Productos para este clima", p: "Pinturas resistentes al moho y de alto espesor donde el sol y la humedad pegan más fuerte." },
          { h: "Líneas limpias, casa limpia", p: "Pisos cubiertos, muebles protegidos y cada cuarto de vuelta en su lugar." },
        ],
        costP: "Pintar el interior empieza alrededor de $1,800 para dos o tres cuartos y suele costar de $6,000 a $11,000 para una casa de 2,000 pies². Pintar el exterior en el condado de Lee normalmente cuesta de $4,000 a $18,000, según el tamaño, los pisos y cuánta reparación necesiten la fachada y las molduras.",
        factors: [
          { h: "Preparación y reparación", p: "La madera podrida, la pintura que se pela o que suelta polvo agregan tiempo. Es la parte más importante y la primera que otros se saltan." },
          { h: "Altura y acceso", p: "Paredes de dos pisos, terrenos inclinados o recibidores altos necesitan escaleras, andamios o elevador." },
          { h: "Cambio de color", p: "Pasar de oscuro a claro o tapar manchas requiere una mano de primario y dos de acabado." },
          { h: "Molduras y puertas", p: "Las molduras con detalle, las contraventanas y las puertas son trabajo a mano y toman más tiempo." },
        ],
        faq: [
          { q: "¿Cuál es la mejor época para pintar el exterior en Alabama?", a: "La primavera y el otoño son ideales: temperaturas templadas y menos humedad ayudan a que la pintura cure. En verano también se puede, empezando temprano y siguiendo la sombra; evitamos pintar antes de lluvia o cuando el rocío no se ha secado." },
          { q: "¿Cuánto dura la pintura exterior aquí?", a: "Con buena preparación y un producto de primera, lo normal en este clima es de 8 a 12 años en la fachada y de 5 a 7 en las molduras más expuestas." },
          { q: "¿Me ayudan a escoger los colores?", a: "Sí. Llevamos muestrarios, podemos pintar muestras en la casa y preparamos el trámite de colores si su HOA lo pide." },
          { q: "¿También pintan gabinetes?", a: "Sí, con otro proceso: aplicamos a pistola un esmalte catalizado que queda liso como de fábrica. Vea pintura de gabinetes." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ CABINETS */
  {
    id: "cabinets", slug: { en: "cabinet-painting", es: "pintura-de-gabinetes" }, form: "finishing", photo: "kitchen2", photos: ["kitchen3", "kitchen1"],
    estimator: "cabinets", related: ["kitchen", "painting", "rental"],
    t: {
      en: {
        name: "Cabinet Painting & Refinishing", alt: "Kitchen cabinets freshly refinished in white enamel in Auburn, AL",
        title: "Cabinet Painting in Auburn & Opelika, AL | Sprayed Finish",
        description: "Kitchen cabinet painting in Auburn and Opelika, AL: degreased, sanded, primed and sprayed in durable enamel. A kitchen that looks new for far less than new.",
        eyebrow: "Cabinet painting · Auburn & Opelika, AL", h1: "Cabinet painting that looks factory-made",
        lede: "Doors and drawers off, degreased, sanded, primed and sprayed with a catalyzed enamel. A new-looking kitchen in about a week, for roughly a fifth of replacement cost.",
        intro: [
          "Cabinet painting is the highest-return update in most kitchens, and the easiest one to do badly. Brushed latex over greasy oak looks fine for a month, then chips around every handle. The difference is process and product.",
          "We remove doors and drawer fronts and spray them off-site or in a controlled area, mask the kitchen, degrease and scuff every surface, prime with a bonding primer, and spray a catalyzed or urethane-modified enamel that cures hard. Hardware and soft-close hinges can be upgraded at the same time.",
        ],
        included: ["Door and drawer removal and labeling", "Full kitchen masking and protection", "Degreasing and scuff sanding", "Grain filling on oak (optional)", "Bonding primer", "Sprayed catalyzed enamel finish", "Boxes, face frames and end panels", "Hardware and soft-close hinge upgrades", "Vanities and built-ins", "Reinstallation and adjustment"],
        glance: { timeline: "3–7 days", range: "$3,500–$12,000 (≈20–40+ doors)", permit: "Not required." },
        why: [
          { h: "Sprayed, not brushed", p: "No brush marks or roller stipple. The finish looks like it came from the cabinet shop." },
          { h: "Catalyzed enamel", p: "Harder and more chip-resistant than wall paint, and it cleans like a factory finish." },
          { h: "Kitchen back in a week", p: "Most kitchens are fully usable again in 3 to 7 days." },
        ],
        costP: "Cabinet painting in the Auburn area usually runs $3,500–$5,500 for a small kitchen, $5,000–$8,000 for an average kitchen, and $7,500–$12,000 for a large kitchen with an island. Replacing the same cabinets often costs four to five times as much.",
        factors: [
          { h: "Number of doors and drawers", p: "We price mostly by the piece. Count doors, drawer fronts and panels for a quick ballpark." },
          { h: "Oak grain", p: "Heavy oak grain shows through paint. Grain filling for a smooth modern look adds labor." },
          { h: "Condition", p: "Water-damaged or delaminating doors need repair or replacement before paint." },
          { h: "Extras", p: "Crown molding, new hardware, soft-close hinges and interiors add to the base price." },
        ],
        faq: [
          { q: "How long does painted cabinetry last?", a: "With proper degreasing, bonding primer and a catalyzed enamel, many years of daily use. It's a different product than the latex you put on walls." },
          { q: "Can you paint laminate or thermofoil cabinets?", a: "Laminate can often be painted with the right primer. Peeling thermofoil usually can't be painted reliably; we'll tell you honestly." },
          { q: "Can I use my kitchen while you work?", a: "Mostly. The boxes are painted on site with the kitchen masked; doors are finished separately. Expect a few days of limited use." },
        ],
      },
      es: {
        name: "Pintura de gabinetes", alt: "Gabinetes de cocina recién pintados de blanco en Auburn, AL",
        title: "Pintura de gabinetes en Auburn y Opelika, AL",
        description: "Pintamos gabinetes de cocina en Auburn y Opelika, AL: desengrasados, lijados, con primario y esmalte a pistola. Como nuevos por mucho menos que cambiarlos.",
        eyebrow: "Pintura de gabinetes · Auburn y Opelika, AL", h1: "Gabinetes pintados como de fábrica",
        lede: "Quitamos puertas y cajones, desengrasamos, lijamos, aplicamos primario y pintamos a pistola con esmalte catalizado. Una cocina que parece nueva en una semana, por más o menos la quinta parte de lo que cuesta cambiar los gabinetes.",
        intro: [
          "Pintar los gabinetes es la mejora que más vale en casi cualquier cocina, y también la más fácil de hacer mal. Pintura de pared con brocha sobre roble grasoso se ve bien un mes, y luego se descarapela alrededor de cada jaladera. La diferencia está en el proceso y en el producto.",
          "Quitamos puertas y frentes de cajón y los pintamos a pistola en un área controlada, cubrimos toda la cocina, desengrasamos y lijamos cada superficie, aplicamos un primario de adherencia y terminamos con un esmalte catalizado que endurece de verdad. Si quiere, al mismo tiempo cambiamos jaladeras y bisagras de cierre suave.",
        ],
        included: ["Retiro y marcado de puertas y cajones", "Protección completa de la cocina", "Desengrasado y lijado", "Relleno de veta en roble (opcional)", "Primario de adherencia", "Esmalte catalizado a pistola", "Cajas, marcos y costados", "Jaladeras y bisagras de cierre suave", "Tocadores y muebles empotrados", "Reinstalación y ajuste"],
        glance: { timeline: "3 a 7 días", range: "$3,500–$12,000 (≈20–40+ puertas)", permit: "No se requiere." },
        why: [
          { h: "A pistola, no a brocha", p: "Sin marcas de brocha ni textura de rodillo. Queda como salido del taller." },
          { h: "Esmalte catalizado", p: "Más duro y resistente que la pintura de pared, y se limpia como acabado de fábrica." },
          { h: "Su cocina de vuelta en una semana", p: "La mayoría de las cocinas quedan listas para usarse en 3 a 7 días." },
        ],
        costP: "En la zona de Auburn, pintar gabinetes suele costar de $3,500 a $5,500 en una cocina chica, de $5,000 a $8,000 en una mediana y de $7,500 a $12,000 en una cocina grande con isla. Cambiar esos mismos gabinetes muchas veces cuesta cuatro o cinco veces más.",
        factors: [
          { h: "Cuántas puertas y cajones", p: "Cotizamos casi siempre por pieza. Cuente puertas, frentes de cajón y paneles para darse una idea rápida." },
          { h: "La veta del roble", p: "La veta marcada del roble se nota a través de la pintura. Rellenarla para un acabado liso y moderno suma trabajo." },
          { h: "El estado de los gabinetes", p: "Puertas hinchadas por el agua o que se despegan hay que repararlas o cambiarlas antes de pintar." },
          { h: "Extras", p: "Cornisa, jaladeras nuevas, bisagras de cierre suave o pintar por dentro se suman al precio base." },
        ],
        faq: [
          { q: "¿Cuánto dura la pintura en los gabinetes?", a: "Con buen desengrasado, primario de adherencia y esmalte catalizado, muchos años de uso diario. No es la misma pintura que se usa en las paredes." },
          { q: "¿Se pueden pintar gabinetes de laminado o de vinil (thermofoil)?", a: "El laminado muchas veces sí, con el primario adecuado. El vinil que se está despegando casi nunca queda bien pintado; se lo decimos con honestidad." },
          { q: "¿Puedo usar la cocina mientras trabajan?", a: "En buena parte, sí. Las cajas se pintan en su lugar con la cocina cubierta y las puertas se terminan aparte. Cuente con unos días de uso limitado." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ FLOORING */
  {
    id: "flooring", slug: { en: "flooring-installation", es: "instalacion-de-pisos" }, form: "repairs", photo: "floor2", photos: ["floor1", "kitchen3"],
    estimator: "flooring", related: ["rental", "remodeling", "repairs"],
    t: {
      en: {
        name: "Flooring Installation", alt: "Installer laying luxury vinyl plank flooring in an Auburn, AL home",
        title: "Flooring Installation in Auburn, AL | LVP, Tile & Hardwood",
        description: "LVP, tile, engineered hardwood and laminate floors installed in Auburn and Opelika, AL. Old floor removal, subfloor repair, trim and transitions. Free quote.",
        eyebrow: "Flooring · Auburn & Opelika, AL", h1: "Flooring installation in Auburn, AL",
        lede: "Waterproof LVP, tile and engineered hardwood, installed flat and quiet over a subfloor we've actually checked. Trim, transitions and baseboards included.",
        intro: [
          "Most flooring complaints come from what's underneath: a bouncy or uneven subfloor, no expansion gap, or a transition nobody planned. We pull the old floor, fix squeaks and soft spots, flatten where needed, and only then install.",
          "Luxury vinyl plank is our most-requested floor for families with kids and pets and for Auburn rentals, because it's waterproof, tough and affordable. We also install tile, engineered hardwood and laminate, and we'll tell you which fits the room and the budget.",
        ],
        included: ["Carpet, tile and old floor removal", "Subfloor repair, squeak and soft-spot fixes", "Floor leveling where required", "Luxury vinyl plank (LVP)", "Porcelain and ceramic tile", "Engineered hardwood and laminate", "Stair treads and nosing", "Baseboards, quarter round and transitions", "Moving and resetting toilets and appliances", "Haul-off and cleanup"],
        glance: { timeline: "1–5 days", range: "From $1,800 · whole home $9,000–$16,000", permit: "Not usually required." },
        why: [
          { h: "Subfloor first", p: "We fix what's under the floor before we cover it, so it stays flat and quiet." },
          { h: "Finished edges", p: "Baseboards, transitions and door jambs are cut and finished by carpenters, not caulked over." },
          { h: "Turnover-friendly scheduling", p: "Landlords: we schedule between move-out and move-in and work alongside paint." },
        ],
        costP: "LVP installed with old floor removal typically runs $1,800–$3,500 for one or two rooms, $5,000–$9,000 for main living areas (~1,000 sq ft) and $9,000–$16,000 for a whole ~2,000 sq ft home. Tile and hardwood run higher.",
        factors: [
          { h: "Material", p: "LVP wear layer and thickness, tile size and hardwood species change material cost significantly." },
          { h: "Subfloor condition", p: "Leveling, replacing water-damaged plywood or fixing squeaks adds labor." },
          { h: "Stairs", p: "Each stair is hand-fitted and priced separately." },
          { h: "Removal", p: "Glued-down tile or carpet with tack strip takes longer to remove than floating floors." },
        ],
        faq: [
          { q: "Is LVP really waterproof?", a: "The planks are. Water can still get under the floor at edges and seams, so we seal wet areas and install with the right expansion gaps and transitions." },
          { q: "Can you install over my existing floor?", a: "Sometimes over flat vinyl or tile, but most of the time removing it gives a better, longer-lasting result. We'll check on the walkthrough." },
          { q: "How quickly can you do a rental?", a: "A typical 3-bedroom rental in LVP is 2–4 days, and we can coordinate paint at the same time." },
        ],
      },
      es: {
        name: "Instalación de pisos", alt: "Instalador colocando piso de vinilo LVP en una casa de Auburn, AL",
        title: "Instalación de pisos en Auburn, AL | LVP, azulejo y madera",
        description: "Instalamos piso LVP, azulejo, madera de ingeniería y laminado en Auburn y Opelika, AL. Retiro del piso viejo, subpiso, zoclos y transiciones. En español.",
        eyebrow: "Pisos · Auburn y Opelika, AL", h1: "Instalación de pisos en Auburn, AL",
        lede: "LVP a prueba de agua, azulejo y madera de ingeniería, instalados parejos y sin rechinidos sobre un subpiso que sí revisamos. Zoclos y transiciones incluidos.",
        intro: [
          "Casi todos los problemas de pisos vienen de abajo: un subpiso que se hunde o está disparejo, sin espacio de dilatación, o una transición que nadie planeó. Quitamos el piso viejo, arreglamos rechinidos y partes blandas, nivelamos donde hace falta, y hasta entonces instalamos.",
          "El piso de vinilo de lujo (LVP) es el que más nos piden las familias con niños y mascotas y los dueños de casas de renta en Auburn, porque aguanta el agua, el uso y el bolsillo. También instalamos azulejo, madera de ingeniería y laminado, y le decimos cuál conviene para cada cuarto y presupuesto.",
        ],
        included: ["Retiro de alfombra, azulejo o piso viejo", "Reparación del subpiso, rechinidos y partes blandas", "Nivelación donde se requiere", "Piso de vinilo de lujo (LVP)", "Azulejo de porcelana y cerámica", "Madera de ingeniería y laminado", "Escalones y narices de escalera", "Zoclos, cuarto bocel y transiciones", "Retirar y volver a poner inodoros y aparatos", "Retiro de escombro y limpieza"],
        glance: { timeline: "1 a 5 días", range: "Desde $1,800 · toda la casa $9,000–$16,000", permit: "Normalmente no se requiere." },
        why: [
          { h: "Primero el subpiso", p: "Arreglamos lo de abajo antes de taparlo, para que el piso quede parejo y sin ruido." },
          { h: "Orillas bien terminadas", p: "Zoclos, transiciones y marcos de puerta los cortan y terminan carpinteros, no se tapan con sellador." },
          { h: "Ideal para casas de renta", p: "Nos ajustamos entre la salida de un inquilino y la entrada del otro, y trabajamos junto con la pintura." },
        ],
        costP: "El LVP instalado, quitando el piso viejo, suele costar de $1,800 a $3,500 en uno o dos cuartos, de $5,000 a $9,000 en las áreas principales (~1,000 pies²) y de $9,000 a $16,000 en una casa completa de ~2,000 pies². El azulejo y la madera cuestan más.",
        factors: [
          { h: "El material", p: "La capa de desgaste y el grosor del LVP, el tamaño del azulejo o el tipo de madera cambian bastante el costo." },
          { h: "El estado del subpiso", p: "Nivelar, cambiar triplay dañado por agua o quitar rechinidos suma mano de obra." },
          { h: "Escaleras", p: "Cada escalón se ajusta a mano y se cotiza aparte." },
          { h: "El retiro", p: "El azulejo pegado o la alfombra con tiras de clavos tardan más en quitarse que los pisos flotantes." },
        ],
        faq: [
          { q: "¿El LVP de verdad aguanta el agua?", a: "Las tablas sí. El agua todavía puede meterse por las orillas y uniones, por eso sellamos las zonas mojadas e instalamos con los espacios y transiciones correctos." },
          { q: "¿Pueden instalar encima de mi piso actual?", a: "A veces, sobre vinil o azulejo parejo. Pero casi siempre quitarlo da un mejor resultado y dura más. Lo revisamos en la visita." },
          { q: "¿Qué tan rápido pueden hacer una casa de renta?", a: "Una casa de renta de 3 recámaras con LVP toma normalmente de 2 a 4 días, y podemos coordinar la pintura al mismo tiempo." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ REPAIRS */
  {
    id: "repairs", slug: { en: "home-repairs", es: "reparaciones-del-hogar" }, form: "repairs", photo: "deckRebuildFraming", photos: ["dockLake", "fenceInstalled"],
    related: ["painting", "flooring", "rental"],
    t: {
      en: {
        name: "Home Repairs & Carpentry", alt: "Deck being rebuilt with the old boards removed and the joists exposed",
        title: "Home Repairs in Auburn & Opelika, AL | Rot, Decks & Drywall",
        description: "Home repairs in Auburn and Opelika, AL: wood rot, siding, decks and porches, drywall, doors, windows, storm damage and pre-sale punch lists. No job too small.",
        eyebrow: "Repairs & carpentry · Auburn & Opelika, AL", h1: "Home repairs, done like a remodel",
        lede: "Rotten trim, a soft deck board, drywall damage, a door that won't latch, or the inspection list before you sell. Handled with the same care as a full remodel.",
        intro: [
          "Small jobs are where you find out if a contractor is any good. We show up when we said, fix the cause instead of the symptom, and leave the house clean. Many of our remodel clients first called us for a repair.",
          "Common calls in Lee County: rotten fascia, window trim and door jambs; deck and porch boards and railings; drywall after plumbing leaks; sticking doors; storm damage; and home-inspection punch lists before a sale closes.",
        ],
        included: ["Wood rot, fascia and soffit repair", "Siding and trim replacement", "Deck and porch repair and rebuilds", "Railings and stairs", "Drywall patching and texture matching", "Interior and exterior door replacement", "Window trim and sill repair", "Storm and water damage repair", "Home inspection and pre-sale punch lists", "Paint to match"],
        glance: { timeline: "Often 1–3 days", range: "From $350 · most repairs $500–$5,000", permit: "Depends on scope; decks and structural repairs often need one." },
        why: [
          { h: "We fix the cause", p: "If trim is rotting because of a gutter or missing flashing, we fix that too, or tell you who should." },
          { h: "Carpentry and paint together", p: "The repair is primed and painted to match, so it disappears." },
          { h: "Fast turnaround for closings", p: "Buying or selling? We work to the inspection deadline and document the work with photos." },
        ],
        costP: "Small repairs start around $350. Most repair calls land between $500 and $5,000. Deck rebuilds and larger storm repairs are priced like a remodel, with a written scope.",
        factors: [
          { h: "Hidden damage", p: "Rot usually extends beyond what you can see. We probe and price the likely extent, then confirm before replacing." },
          { h: "Matching", p: "Matching old siding profiles, trim or texture can take special-order material." },
          { h: "Access", p: "Second-story fascia or steep roofs need ladders, planks or lifts." },
          { h: "Bundling", p: "Several repairs in one visit cost less than separate trips. Send us the whole list." },
        ],
        faq: [
          { q: "Do you take small jobs?", a: "Yes. We have a minimum trip charge, and bundling several items in one visit is the best value." },
          { q: "Can you handle my home inspection repair list?", a: "Yes. Send us the report pages; we'll price each item, work to your closing date and provide photos and an invoice for your agent." },
          { q: "Do you work with insurance claims?", a: "We can document storm and water damage and provide a detailed estimate for your adjuster." },
        ],
      },
      es: {
        name: "Reparaciones y carpintería", alt: "Terraza en reconstrucción, con las tablas viejas quitadas y las vigas a la vista",
        title: "Reparaciones de casas en Auburn y Opelika, AL",
        description: "Reparamos casas en Auburn y Opelika, AL: madera podrida, fachada, terrazas, tablaroca, puertas, ventanas, daños por tormenta y pendientes. En español.",
        eyebrow: "Reparaciones y carpintería · Auburn y Opelika, AL", h1: "Reparaciones hechas con el cuidado de una remodelación",
        lede: "Una moldura podrida, una tabla floja en la terraza, un golpe en la tablaroca, una puerta que no cierra o la lista del inspector antes de vender. Lo atendemos con la misma seriedad que una obra grande.",
        intro: [
          "En los trabajos chicos es donde uno se da cuenta si un contratista es bueno. Llegamos cuando dijimos, arreglamos la causa y no solo el síntoma, y dejamos todo limpio. Muchos de nuestros clientes de remodelación nos llamaron primero para una reparación.",
          "Lo que más nos piden en el condado de Lee: aleros, marcos de ventana y de puerta podridos; tablas y barandales de terrazas y porches; tablaroca después de una fuga; puertas que se atoran; daños por tormenta; y la lista de reparaciones del inspector antes de cerrar una venta.",
        ],
        included: ["Madera podrida, aleros y plafones", "Cambio de fachada y molduras", "Reparación y reconstrucción de terrazas y porches", "Barandales y escaleras", "Resanes de tablaroca con la misma textura", "Cambio de puertas interiores y exteriores", "Reparación de marcos y repisones de ventana", "Daños por tormenta y agua", "Reparaciones del inspector antes de vender", "Pintura del mismo color"],
        glance: { timeline: "Casi siempre 1 a 3 días", range: "Desde $350 · la mayoría $500–$5,000", permit: "Depende; terrazas y reparaciones estructurales muchas veces lo requieren." },
        why: [
          { h: "Arreglamos la causa", p: "Si la moldura se pudre por un canalón o una lámina que falta, también lo arreglamos, o le decimos quién debe hacerlo." },
          { h: "Carpintería y pintura juntas", p: "La reparación se pinta del mismo color para que no se note." },
          { h: "A tiempo para su cierre", p: "¿Compra o vende? Trabajamos con la fecha del inspector y documentamos todo con fotos." },
        ],
        costP: "Las reparaciones chicas empiezan alrededor de $350. La mayoría quedan entre $500 y $5,000. Reconstruir una terraza o reparar daños grandes de tormenta se cotiza como una remodelación, con alcance por escrito.",
        factors: [
          { h: "Daño escondido", p: "La madera podrida casi siempre llega más lejos de lo que se ve. Revisamos y cotizamos lo probable, y le confirmamos antes de cambiar." },
          { h: "Igualar materiales", p: "Igualar fachadas, molduras o texturas viejas a veces requiere material de pedido especial." },
          { h: "Acceso", p: "Aleros de segundo piso o techos inclinados necesitan escaleras, andamios o elevador." },
          { h: "Juntar trabajos", p: "Varias reparaciones en una sola visita salen más baratas que viajes separados. Mándenos la lista completa." },
        ],
        faq: [
          { q: "¿Toman trabajos chicos?", a: "Sí. Tenemos un cargo mínimo por visita, y juntar varios arreglos en una sola visita es lo que más le conviene." },
          { q: "¿Pueden hacer la lista de reparaciones del inspector?", a: "Sí. Mándenos las páginas del reporte; cotizamos cada punto, trabajamos con su fecha de cierre y le damos fotos y factura para su agente." },
          { q: "¿Trabajan con reclamos de seguro?", a: "Podemos documentar daños por tormenta o agua y darle un presupuesto detallado para su ajustador." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ RENTAL */
  {
    id: "rental", slug: { en: "rental-turnovers", es: "remodelacion-casas-de-renta" }, form: "rental", photo: "floor1", photos: ["kitchen2", "paint1"],
    estimator: "rental", related: ["flooring", "painting", "cabinets"],
    t: {
      en: {
        name: "Rental Turnovers & Make-Ready", alt: "Freshly turned rental living room with new LVP flooring near Auburn University",
        title: "Rental Turnover & Make-Ready in Auburn, AL | Landlords",
        description: "Rental make-ready for Auburn and Opelika landlords: paint, LVP, repairs and punch lists between tenants, scheduled around Auburn University move-out dates.",
        eyebrow: "For landlords & property managers · Auburn, AL", h1: "Rental turnovers, done on your calendar",
        lede: "Paint, LVP, repairs and make-ready between tenants, scheduled around Auburn's move-out and move-in dates. Photo updates for owners who live out of town.",
        intro: [
          "Auburn's rental calendar is brutal: most leases end and start within a few weeks of each other every summer. Every vacant day is lost rent. We plan turnovers weeks ahead, show up on the move-out date, and hand back a rent-ready unit with photos.",
          "Many of our landlord clients live in Birmingham, Atlanta or out of state. You get one contact, a written scope and price per unit, and before-and-after photos, so you don't have to drive down to check on the work.",
        ],
        included: ["Full interior repaints in durable, touch-up-friendly finishes", "LVP flooring replacing worn carpet", "Drywall, door and trim repairs", "Cabinet painting and hardware", "Fixture, faucet and lighting swaps", "Bathroom caulk, grout and vanity refresh", "Exterior touch-ups and rot repair", "Game-day and short-term rental refreshes", "Pre-listing punch lists", "Photo documentation for owners"],
        glance: { timeline: "2–10 days per unit", range: "Light turn from $1,500 · heavy $12,000–$30,000", permit: "Rarely required unless plumbing or electrical changes." },
        why: [
          { h: "We plan for the August crunch", p: "Book your units in spring and we'll schedule the crew and materials before the rush." },
          { h: "Durable, repeatable specs", p: "Standard paint colors, sheens and LVP lines so future touch-ups match without guesswork." },
          { h: "Remote-owner friendly", p: "Photos, written scopes, invoices you can forward to your accountant, and one person to call." },
        ],
        costP: "A light turn (paint, patch and repairs) usually runs $1,500–$4,000. A medium turn with LVP and fixtures runs $5,000–$12,000, and a heavy turn with kitchen or bath updates runs $12,000–$30,000 per unit.",
        factors: [
          { h: "Condition at move-out", p: "Pet damage, wall damage and neglected maintenance drive the scope more than size." },
          { h: "Upgrade vs. repair", p: "Replacing carpet with LVP costs more once but reduces future turn costs." },
          { h: "Timing", p: "Units booked ahead of the summer peak are easier to staff and price than last-minute calls." },
          { h: "Portfolio pricing", p: "Multiple units or a standing turnover agreement lowers per-unit cost." },
        ],
        faq: [
          { q: "Can you work around move-out and move-in dates?", a: "Yes, that's the whole point. Send us your lease dates and we'll schedule the turn to fit, including tight Auburn University summer windows." },
          { q: "I live out of town. How do I know the work is done?", a: "You get before-and-after photos of every room, an itemized invoice and a walkthrough video on request." },
          { q: "Do you work with property managers?", a: "Yes. We can work directly from a property manager's work order and bill the owner or the management company." },
        ],
      },
      es: {
        name: "Casas de renta y cambio de inquilino", alt: "Sala de casa de renta recién preparada con piso LVP nuevo cerca de Auburn University",
        title: "Preparación de casas de renta en Auburn, AL",
        description: "Preparamos casas de renta entre inquilinos en Auburn y Opelika: pintura, piso LVP, reparaciones y pendientes, según las fechas de Auburn University.",
        eyebrow: "Para dueños e inversionistas · Auburn, AL", h1: "Casas de renta listas a tiempo",
        lede: "Pintura, piso LVP, reparaciones y preparación entre un inquilino y otro, según las fechas de salida y entrada de Auburn. Con fotos para los dueños que viven fuera.",
        intro: [
          "El calendario de rentas en Auburn es muy apretado: casi todos los contratos terminan y empiezan en las mismas semanas del verano. Cada día que la casa está vacía es renta perdida. Planeamos los cambios con semanas de anticipación, llegamos el día que sale el inquilino y le entregamos la casa lista para rentar, con fotos.",
          "Muchos de nuestros clientes son inversionistas que viven en Birmingham, Atlanta o fuera del estado, y también familias hispanas que tienen una o dos casas de renta como patrimonio. Usted tiene un solo contacto, alcance y precio por escrito para cada casa, y fotos del antes y el después, sin tener que venir a revisar.",
        ],
        included: ["Pintura interior completa con acabados resistentes y fáciles de retocar", "Piso LVP en lugar de alfombra gastada", "Reparación de tablaroca, puertas y molduras", "Pintura de gabinetes y jaladeras", "Cambio de lámparas, llaves y accesorios", "Sellador, boquilla y tocador del baño", "Retoques exteriores y madera podrida", "Casas para partidos y renta de corto plazo", "Detalles antes de poner en venta", "Fotos del trabajo para el dueño"],
        glance: { timeline: "2 a 10 días por casa", range: "Cambio ligero desde $1,500 · fuerte $12,000–$30,000", permit: "Casi nunca se requiere, salvo cambios de plomería o electricidad." },
        why: [
          { h: "Planeamos para agosto", p: "Aparte sus casas en primavera y organizamos la cuadrilla y los materiales antes de la temporada fuerte." },
          { h: "Especificaciones que se repiten", p: "Colores, brillos y líneas de LVP estándar, para que los retoques futuros siempre combinen." },
          { h: "Para dueños que viven lejos", p: "Fotos, alcances por escrito, facturas para su contador y una sola persona a quien llamar, en español o en inglés." },
        ],
        costP: "Un cambio ligero (pintura, resanes y reparaciones) suele costar de $1,500 a $4,000. Un cambio mediano con LVP y accesorios, de $5,000 a $12,000, y uno fuerte con cocina o baño, de $12,000 a $30,000 por casa.",
        factors: [
          { h: "Cómo la dejó el inquilino", p: "Daños de mascotas, golpes en paredes y falta de mantenimiento pesan más que el tamaño." },
          { h: "Mejorar o reparar", p: "Cambiar alfombra por LVP cuesta más una vez, pero baja el costo de los cambios siguientes." },
          { h: "Con cuánto tiempo avisa", p: "Las casas que se apartan antes del verano se organizan y cotizan mejor que las de último minuto." },
          { h: "Varias propiedades", p: "Si tiene varias casas o un acuerdo fijo de cambios, el costo por casa baja." },
        ],
        faq: [
          { q: "¿Se ajustan a las fechas de salida y entrada?", a: "Sí, para eso estamos. Mándenos las fechas de los contratos y organizamos el trabajo para que quepa, incluso en las ventanas cortas del verano de Auburn University." },
          { q: "Vivo fuera de Auburn. ¿Cómo sé que quedó el trabajo?", a: "Recibe fotos del antes y el después de cada cuarto, una factura detallada y, si la pide, un video del recorrido." },
          { q: "¿Trabajan con administradores de propiedades?", a: "Sí. Podemos trabajar con la orden de trabajo del administrador y facturarle al dueño o a la administradora." },
        ],
      },
    },
  },
];

export const serviceById = (id: ServicePageId) => SERVICE_PAGES.find((s) => s.id === id)!;

/** The six summary cards on Home / Services → their detail page. */
export const CARD_PAGE: Record<string, ServicePageId> = { remodeling: "remodeling", additions: "additions", kitchensBaths: "kitchen", painting: "painting", finishing: "cabinets", repairs: "flooring" };
