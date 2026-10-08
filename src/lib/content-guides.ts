/* ---------------------------------------------------------------------------
   Guides. Written to be the page Google and AI assistants quote when a Lee
   County homeowner asks "how much does…" or "do I need a permit…":
   a direct answer first, then a table, then local specifics, dated.

   Cost tables are generated from src/lib/estimator.ts so a price change
   there updates the calculator, service pages and guides together.
   Sources for third-party figures are named in the text. Re-verify permit
   office details and the HBLB threshold each January.
   ------------------------------------------------------------------------- */

import { costTable, estimate, mid, money, type Guide, type GuideId } from "./guide-kit";
import { NEW_GUIDES } from "./guides";

export type { Guide, GuideCopy, GuideId, GuideSection } from "./guide-kit";

const D = "2026-09-25";

const CORE: Guide[] = [
  /* ------------------------------------------------------------ KITCHEN COST */
  {
    id: "kitchen-cost", slug: { en: "kitchen-remodel-cost-auburn-al", es: "costo-remodelar-cocina-auburn-al" }, photo: "kitchen1", published: D, updated: D, service: "kitchen", estimator: "kitchen", related: ["cabinets-paint-vs-replace", "builder-grade-upgrades", "permits"],
    t: {
      en: {
        title: "Kitchen Remodel Cost in Auburn, AL (2026 Price Guide)", eyebrow: "Cost guide · 2026",
        description: "What a kitchen remodel costs in Auburn and Opelika, AL in 2026: refresh, full remodel or new layout, with local price ranges and what pays back at resale.",
        h1: "How much does a kitchen remodel cost in Auburn, AL?", lede: "Real 2026 ranges for Auburn, Opelika and Lee County, from a cabinet-and-counter refresh to a gutted kitchen with a new layout.",
        answer: `In Auburn and Opelika in 2026, a kitchen refresh (painted cabinets, new counters, backsplash, lighting) typically costs ${mid("kitchen", 0)}. A full remodel that keeps the layout runs ${mid("kitchen", 1)}, and one that moves walls or plumbing runs ${mid("kitchen", 2)}, labor and materials included, at mid-range finishes.`,
        sections: [
          { h: "2026 kitchen remodel costs in Lee County", p: ["These are installed prices, labor and materials, based on kitchens we price in Auburn, Opelika and Lee County. Appliances are extra unless noted in your estimate."], table: costTable("kitchen", "en") },
          { h: "What drives the price", list: [
            "Layout: keeping the sink, range and walls where they are is the single biggest saving. Moving them adds plumbing, electrical, framing and drywall.",
            "Cabinet line: stock, semi-custom and custom cabinetry can differ by two to three times for the same kitchen. Painting solid existing boxes costs less still.",
            "Counters: quartz and granite are similarly priced here; edge profile, seams, the number of cutouts and backsplash height move the number.",
            "Condition: older homes can hide water damage, undersized wiring or out-of-level floors. A good contractor checks before pricing and flags surprises before fixing them.",
            "Finish level: lighting, hardware, tile and faucet choices add up quickly. Choose your allowances before the estimate, not after.",
          ] },
          { h: "How local prices compare to national numbers", p: [
            "The 2025 Cost vs. Value report (Zonda / JLC) puts a national mid-range minor kitchen remodel at about $28,458 and a mid-range major kitchen remodel at about $82,793. Lee County projects often come in under those national figures because Alabama labor and overhead run lower than many metro markets.",
          ] },
          { h: "Does a kitchen remodel pay off when you sell?", p: [
            "Nationally, the same 2025 report found a mid-range minor kitchen remodel recouped about 113% of its cost at resale, while a major kitchen remodel recouped about 51%. In other words: a well-chosen refresh tends to pay for itself; a full gut is mostly for you. If you plan to sell within a few years, favor paint, counters, lighting and hardware over a new layout.",
          ] },
          { h: "Ways to save without regret", list: [
            "Keep the footprint and plumbing locations.",
            "Paint or reface solid cabinet boxes instead of replacing them.",
            "Spend on the things you touch daily (drawers, faucet, counters) and save on the rest.",
            "Order materials early so the crew isn't waiting, and lock your selections before demolition.",
            "Bundle flooring and paint with the kitchen so you pay for one mobilization, not three.",
          ] },
          { h: "How long it takes", p: ["Plan on 1–4 weeks for design, selections and ordering, then 2–6 weeks on site. Custom cabinets or stone lead times can add weeks, so order before demolition starts."] },
        ],
        faq: [
          { q: "What is the average cost of a kitchen remodel in Auburn, AL?", a: `Most full kitchen remodels we price in Auburn with the same layout fall in the ${mid("kitchen", 1)} range at mid-range finishes. Refreshes cost less and layout changes cost more.` },
          { q: "Can I remodel a kitchen for $15,000?", a: "Often yes, if the cabinet boxes are sound: paint or reface the cabinets, replace counters and backsplash, and update lighting and hardware." },
          { q: "Do I need a permit?", a: "For plumbing, electrical or wall changes, yes. See our permit guide for Auburn, Opelika and Lee County." },
        ],
      },
      es: {
        title: "¿Cuánto cuesta remodelar una cocina en Auburn? (2026)", eyebrow: "Guía de costos · 2026",
        description: "Cuánto cuesta remodelar una cocina en Auburn y Opelika, AL en 2026: renovación, remodelación completa o nueva distribución, con precios reales de la zona.",
        h1: "¿Cuánto cuesta remodelar una cocina en Auburn, AL?", lede: "Rangos reales de 2026 para Auburn, Opelika y el condado de Lee, desde cambiar cubiertas y pintar gabinetes hasta una cocina nueva con otra distribución.",
        answer: `En Auburn y Opelika, en 2026, renovar una cocina (pintar gabinetes, cubiertas nuevas, salpicadero e iluminación) cuesta normalmente ${mid("kitchen", 0)}. Una remodelación completa sin cambiar la distribución cuesta ${mid("kitchen", 1)}, y si se mueven paredes o plomería, ${mid("kitchen", 2)}, con mano de obra y materiales, en acabados intermedios.`,
        sections: [
          { h: "Costos de remodelar una cocina en el condado de Lee (2026)", p: ["Son precios instalados, con mano de obra y materiales, basados en cocinas que cotizamos en Auburn, Opelika y el condado de Lee. Los electrodomésticos van aparte, salvo que su presupuesto diga lo contrario."], table: costTable("kitchen", "es") },
          { h: "Qué hace subir o bajar el precio", list: [
            "La distribución: dejar el fregadero, la estufa y las paredes donde están es el ahorro más grande. Moverlos suma plomería, electricidad, estructura y tablaroca.",
            "El tipo de gabinete: entre gabinetes de línea, semi a la medida y a la medida puede haber 2 o 3 veces de diferencia. Pintar los que ya tiene, si están buenos, sale todavía más barato.",
            "Las cubiertas: aquí el cuarzo y el granito cuestan parecido; el canto, las uniones, los cortes y la altura del salpicadero cambian el número.",
            "El estado de la casa: las casas viejas pueden esconder humedad, cableado insuficiente o pisos desnivelados. Un buen contratista revisa antes de cotizar y le avisa antes de arreglar.",
            "Los acabados: lámparas, jaladeras, azulejo y llaves suman rápido. Escoja sus materiales antes del presupuesto, no después.",
          ] },
          { h: "Cómo se comparan con los precios nacionales", p: [
            "El reporte Cost vs. Value 2025 (Zonda / JLC) calcula a nivel nacional unos $28,458 para una renovación ligera de cocina de gama media y unos $82,793 para una remodelación mayor. En el condado de Lee muchas obras quedan por debajo porque la mano de obra en Alabama cuesta menos que en las grandes ciudades.",
          ] },
          { h: "¿Se recupera la inversión al vender?", p: [
            "Según el mismo reporte, a nivel nacional una renovación ligera de cocina recuperó alrededor del 113% de su costo al vender la casa, y una remodelación mayor alrededor del 51%. O sea: una renovación bien pensada casi se paga sola; una cocina completamente nueva es más para disfrutarla usted. Si piensa vender en pocos años, conviene más pintar, cambiar cubiertas, luces y jaladeras que mover la distribución.",
          ] },
          { h: "Cómo ahorrar sin arrepentirse", list: [
            "Conserve el acomodo y la ubicación de la plomería.",
            "Pinte o renueve los gabinetes si están firmes, en lugar de cambiarlos.",
            "Invierta en lo que usa todos los días (cajones, llave, cubiertas) y ahorre en lo demás.",
            "Pida los materiales con tiempo para que la cuadrilla no se quede esperando.",
            "Junte pisos y pintura con la cocina para pagar una sola movilización, no tres.",
          ] },
          { h: "Cuánto tiempo toma", p: ["Cuente de 1 a 4 semanas para diseño, selección y pedidos, y luego de 2 a 6 semanas de obra. Los gabinetes a la medida o la piedra pueden tardar más en llegar, por eso se piden antes de demoler."] },
        ],
        faq: [
          { q: "¿Cuánto cuesta en promedio remodelar una cocina en Auburn?", a: `La mayoría de las remodelaciones completas que cotizamos en Auburn, sin cambiar la distribución, quedan entre ${mid("kitchen", 1)} con acabados intermedios.` },
          { q: "¿Se puede renovar una cocina con $15,000?", a: "Muchas veces sí, si los gabinetes están firmes: pintarlos o renovarlos, cambiar cubiertas y salpicadero, y actualizar luces y jaladeras." },
          { q: "¿Pueden explicarme el presupuesto en español?", a: "Sí. Le damos el presupuesto por escrito y se lo explicamos punto por punto en español, con WhatsApp si lo prefiere." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ BATH COST */
  {
    id: "bathroom-cost", slug: { en: "bathroom-remodel-cost-auburn-al", es: "costo-remodelar-bano-alabama" }, photo: "bathVanityAfter", published: D, updated: D, service: "bathroom", estimator: "bath", related: ["tub-to-shower", "permits", "hire-contractor"],
    t: {
      en: {
        title: "Bathroom Remodel Cost in Auburn & Opelika, AL (2026)", eyebrow: "Cost guide · 2026",
        description: "2026 bathroom remodel costs in Auburn and Opelika, AL: refreshes, full hall baths, tub-to-shower conversions and primary baths, with local price ranges.",
        h1: "How much does a bathroom remodel cost in Auburn, AL?", lede: "From a vanity-and-fixtures refresh to a curbless primary shower, here's what bathrooms cost in Lee County in 2026.",
        answer: `In Auburn and Opelika in 2026, a bathroom refresh typically costs ${mid("bath", 0)}. A full hall bath taken down to the studs with a tiled tub or shower runs ${mid("bath", 1)}, and a primary bath with a layout change or curbless shower runs ${mid("bath", 2)}, at mid-range finishes, installed.`,
        sections: [
          { h: "2026 bathroom remodel costs in Lee County", table: costTable("bath", "en") },
          { h: "Tub-to-shower conversions", p: [
            "Converting a tub to a walk-in tiled shower usually falls in the full-bath range because it involves a new pan, waterproofing, tile and glass. Acrylic panel systems sold by bath franchises can install faster and sometimes cost less; tile costs more but gives unlimited design options and can be repaired one tile at a time.",
          ] },
          { h: "Where the money goes", list: [
            "Tile labor: floor-to-ceiling tile, small mosaics and patterns take far more hours than a standard layout.",
            "Plumbing moves: relocating a toilet, drain or shower valve means opening floors and walls.",
            "Waterproofing: a real shower membrane and pan flood test are non-negotiable, and worth every dollar.",
            "Glass and fixtures: frameless glass and thermostatic valves are real line items.",
            "Accessibility: curbless entries require recessing the subfloor; grab-bar blocking is cheap if added while walls are open.",
          ] },
          { h: "National benchmarks", p: [
            "The 2025 Cost vs. Value report puts a national mid-range bathroom remodel (5×7 ft, new tub, toilet, vanity and tile) at about $26,138, recouping about 80% at resale, and a universal-design (accessible) bath at about $42,183.",
          ] },
          { h: "Timeline", p: ["A refresh is often 1–2 weeks. A full remodel is typically 2–4 weeks on site, depending on tile, glass lead times (often 1–2 weeks after tile is set) and inspections."] },
        ],
        faq: [
          { q: "How much does it cost to convert a tub to a shower in Auburn?", a: `Most tiled tub-to-shower conversions fall in the ${mid("bath", 1)} range, depending on tile, glass and whether the drain moves.` },
          { q: "What's the cheapest way to update a bathroom?", a: "Keep the tub or shower and plumbing in place, and replace the vanity, toilet, lighting, mirror, paint and floor." },
          { q: "Do I need a permit for a bathroom remodel?", a: "If plumbing or electrical changes, generally yes. See our permit guide." },
        ],
      },
      es: {
        title: "¿Cuánto cuesta remodelar un baño en Alabama? (2026)", eyebrow: "Guía de costos · 2026",
        description: "Precios reales 2026 para remodelar un baño en Auburn y Opelika, AL: renovación, baño completo, cambio de tina por regadera y baño principal, y qué influye.",
        h1: "¿Cuánto cuesta remodelar un baño en Alabama?", lede: "Desde cambiar el tocador y los accesorios hasta una regadera grande sin escalón: esto cuestan los baños en el condado de Lee en 2026.",
        answer: `En Auburn y Opelika, en 2026, renovar un baño cuesta normalmente ${mid("bath", 0)}. Un baño completo hasta la estructura, con tina o regadera de azulejo, cuesta ${mid("bath", 1)}, y un baño principal con cambio de distribución o regadera a ras de piso, ${mid("bath", 2)}, con acabados intermedios e instalado.`,
        sections: [
          { h: "Costos de remodelar un baño en el condado de Lee (2026)", table: costTable("bath", "es") },
          { h: "Cambiar la tina por regadera", p: [
            "Cambiar una tina por una regadera de azulejo normalmente cae en el rango de baño completo, porque lleva base nueva, impermeabilización, azulejo y cancel. Los sistemas de paneles acrílicos que venden algunas franquicias se instalan más rápido y a veces cuestan menos; el azulejo cuesta más, pero permite cualquier diseño y se puede reparar pieza por pieza.",
          ] },
          { h: "En qué se va el dinero", list: [
            "La mano de obra del azulejo: azulejo hasta el techo, mosaicos o diseños especiales llevan muchas más horas.",
            "Mover la plomería: cambiar de lugar el inodoro, el desagüe o la llave de la regadera implica abrir pisos y paredes.",
            "La impermeabilización: una membrana de verdad y la prueba de agua de la base no se negocian, y valen cada dólar.",
            "Cristal y accesorios: el cancel sin marco y las llaves termostáticas cuestan.",
            "Para personas mayores: una entrada sin escalón requiere rebajar el subpiso; los refuerzos para barras de apoyo cuestan poco si se ponen con las paredes abiertas.",
          ] },
          { h: "Precios nacionales de referencia", p: [
            "El reporte Cost vs. Value 2025 calcula a nivel nacional unos $26,138 para remodelar un baño de gama media (1.5 × 2 m, tina, inodoro, tocador y azulejo nuevos), que recupera alrededor del 80% al vender, y unos $42,183 para un baño adaptado para personas mayores.",
          ] },
          { h: "Cuánto tiempo toma", p: ["Una renovación ligera suele tomar 1 o 2 semanas. Un baño completo, de 2 a 4 semanas en obra, según el azulejo, el cancel (que se mide ya con el azulejo puesto) y las inspecciones."] },
        ],
        faq: [
          { q: "¿Cuánto cuesta cambiar la tina por regadera en Auburn?", a: `La mayoría de los cambios de tina por regadera de azulejo quedan entre ${mid("bath", 1)}, según el azulejo, el cancel y si se mueve el desagüe.` },
          { q: "¿Cuál es la forma más barata de renovar un baño?", a: "Dejar la tina o regadera y la plomería donde están, y cambiar tocador, inodoro, luz, espejo, pintura y piso." },
          { q: "¿Necesito permiso?", a: "Si cambia la plomería o la electricidad, normalmente sí. Vea nuestra guía de permisos." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ PERMITS */
  {
    id: "permits", slug: { en: "remodeling-permits-auburn-opelika-al", es: "permisos-remodelacion-auburn-opelika" }, photo: "framing1", published: D, updated: D, service: "remodeling", related: ["hire-contractor", "bilingual-contractor", "kitchen-cost"],
    t: {
      en: {
        title: "Remodeling Permits in Auburn & Opelika, AL (2026 Guide)", eyebrow: "Permit guide · 2026",
        description: "Which home projects need a building permit in Auburn, Opelika and Lee County, AL, which don't, how each city's process works, and historic-district rules.",
        h1: "Do I need a permit to remodel in Auburn or Opelika?", lede: "What needs a permit, what doesn't, and how the process works with the City of Auburn, the City of Opelika and Lee County.",
        answer: "In Auburn and Opelika you need a building permit for additions, structural changes, decks, and new or relocated plumbing, electrical or HVAC work. Cosmetic work such as painting, flooring, trim and cabinet painting generally doesn't need one. Outside city limits, Lee County Building Inspection issues permits. A licensed contractor normally pulls the permit in their own name.",
        sections: [
          { h: "Projects that usually need a permit", list: ["Room additions, garages, sunrooms and second stories", "Removing or moving walls, especially load-bearing walls", "New or relocated plumbing (moving a sink, toilet or shower drain)", "New electrical circuits, panels or rewiring", "HVAC installation or changes", "Decks, and in Auburn also roofing, siding and window replacement", "Converting a garage or attic into living space"] },
          { h: "Projects that usually don't", list: ["Interior and exterior painting", "Flooring, carpet and trim", "Cabinet painting or refacing", "Like-for-like fixture and faucet swaps, minor repairs", "Countertop replacement with no plumbing changes"], p: ["When in doubt, ask. The cities publish their rules, and a good contractor will tell you on the walkthrough."] },
          { h: "City of Auburn", p: [
            "Auburn Inspection Services (171 N. Ross St., 334-501-3170) handles residential permits and inspections. Applications go through the Auburn permit portal or by email to plans@auburnal.gov, and the City publishes a Residential Remodel/Alteration permit application. Only minor repairs are exempt; additions, alterations and new plumbing, electrical or mechanical work need permits.",
          ] },
          { h: "City of Opelika", p: [
            "Opelika's Building Inspection Division (Public Works, 710 Fox Trail, 334-705-5420) requires plans and a building permit for construction, plus separate electrical, plumbing and mechanical permits. Residential plan review typically takes 3–4 business days, the permit card must be posted on site, and inspections use a red-tag/green-tag system. Opelika uses the 2021 International Building Code.",
          ] },
          { h: "Lee County and smaller towns", p: [
            "Outside city limits, Lee County's Building Inspection department handles permits. Smiths Station and other incorporated towns may have their own process, so confirm which office covers your address before work starts.",
          ] },
          { h: "Historic districts and HOAs", p: [
            "Exterior changes in Opelika's Northside, Downtown and Geneva Street historic districts, and in Auburn's North College Historic District, need a Certificate of Appropriateness in addition to any building permit. Separately, most subdivisions have HOA architectural review for exterior colors, additions and fences. An HOA approval is not a permit, and a permit is not an HOA approval: you usually need both.",
          ] },
          { h: "Why skipping the permit costs more", list: ["Insurance may deny claims tied to unpermitted work.", "Buyers' inspectors and appraisers flag it at sale time, and you may have to open walls to prove it was done right.", "Inspections protect you: they catch wiring, plumbing and structural mistakes before they're buried.", "A contractor who suggests skipping the permit on work that needs one is telling you something about how they work."] },
        ],
        faq: [
          { q: "Can a homeowner pull their own permit in Auburn?", a: "Homeowners can often permit work on their own home, but then they're responsible for the work passing inspection. When you hire a contractor, the contractor should pull the permit in their name." },
          { q: "Do I need a permit to replace my kitchen cabinets?", a: "Replacing cabinets and counters without moving plumbing or electrical generally doesn't. If you're adding circuits or moving the sink, it does." },
          { q: "How much do permits cost?", a: "Fees depend on project value and trade permits. Auburn and Opelika publish their fee schedules; your contractor's estimate should include them." },
        ],
      },
      es: {
        title: "¿Necesito permiso para remodelar en Auburn u Opelika?", eyebrow: "Guía de permisos · 2026",
        description: "Qué obras necesitan permiso en Auburn, Opelika y el condado de Lee, cuáles no, cómo es el trámite en cada ciudad y las reglas de zonas históricas. En español.",
        h1: "¿Necesito permiso para remodelar en Auburn u Opelika?", lede: "Qué necesita permiso, qué no y cómo es el trámite con la ciudad de Auburn, la ciudad de Opelika y el condado de Lee, explicado en español.",
        answer: "En Auburn y Opelika se necesita permiso de construcción para ampliaciones, cambios de estructura, terrazas y trabajos nuevos o reubicados de plomería, electricidad o aire acondicionado. Los trabajos estéticos, como pintura, pisos, molduras y pintar gabinetes, normalmente no lo necesitan. Fuera de la ciudad, los permisos los da Building Inspection del condado de Lee. Lo normal es que el contratista con licencia saque el permiso a su nombre.",
        sections: [
          { h: "Obras que normalmente necesitan permiso", list: ["Ampliaciones, cocheras, solarios y segundos pisos", "Quitar o mover paredes, sobre todo las de carga", "Plomería nueva o reubicada (mover fregadero, inodoro o desagüe de regadera)", "Circuitos eléctricos nuevos, panel o recableado", "Instalar o cambiar aire acondicionado y calefacción", "Terrazas, y en Auburn también techo, fachada y cambio de ventanas", "Convertir la cochera o el ático en cuarto"] },
          { h: "Obras que normalmente no lo necesitan", list: ["Pintura interior y exterior", "Pisos, alfombra y molduras", "Pintar o renovar gabinetes", "Cambiar accesorios o llaves por otros iguales, reparaciones menores", "Cambiar cubiertas sin mover plomería"], p: ["Si tiene duda, pregunte. Las ciudades publican sus reglas, y un buen contratista se lo dice en la visita."] },
          { h: "Ciudad de Auburn", p: [
            "Inspection Services de Auburn (171 N. Ross St., 334-501-3170) maneja los permisos e inspecciones residenciales. Las solicitudes se hacen en el portal de permisos de Auburn o por correo a plans@auburnal.gov. Solo las reparaciones menores están exentas; las ampliaciones, modificaciones y los trabajos nuevos de plomería, electricidad o aire acondicionado necesitan permiso. Los trámites son en inglés; nosotros los hacemos por usted.",
          ] },
          { h: "Ciudad de Opelika", p: [
            "La división de Building Inspection de Opelika (Public Works, 710 Fox Trail, 334-705-5420) pide planos y permiso de construcción, además de permisos aparte para electricidad, plomería y aire acondicionado. La revisión de una obra residencial toma normalmente de 3 a 4 días hábiles, la tarjeta del permiso debe estar a la vista en la obra y las inspecciones usan etiquetas rojas (no aprobado) y verdes (aprobado). Opelika usa el Código Internacional de Construcción 2021.",
          ] },
          { h: "Condado de Lee y pueblos cercanos", p: [
            "Fuera de los límites de la ciudad, el departamento de Building Inspection del condado de Lee lleva los permisos. Smiths Station y otros pueblos pueden tener su propio proceso, así que hay que confirmar qué oficina le toca a su dirección antes de empezar.",
          ] },
          { h: "Zonas históricas y HOA", p: [
            "Los cambios exteriores en los distritos históricos de Northside, el centro y Geneva Street en Opelika, y en el North College Historic District de Auburn, necesitan un Certificado de Conformidad además del permiso. Aparte, casi todos los fraccionamientos tienen una HOA que revisa colores, ampliaciones y cercas. La aprobación de la HOA no es un permiso, y el permiso no es la aprobación de la HOA: casi siempre se necesitan los dos.",
          ] },
          { h: "Por qué saltarse el permiso sale más caro", list: ["El seguro puede negar un reclamo relacionado con una obra sin permiso.", "Al vender, el inspector del comprador o el valuador lo detectan, y puede tener que abrir paredes para demostrar que se hizo bien.", "Las inspecciones lo protegen a usted: encuentran errores de electricidad, plomería o estructura antes de que queden tapados.", "Si un contratista le propone no sacar el permiso para una obra que sí lo necesita, eso dice mucho de cómo trabaja."] },
        ],
        faq: [
          { q: "¿Puedo sacar yo mismo el permiso en Auburn?", a: "Muchas veces el dueño puede sacar permiso para su propia casa, pero entonces usted es responsable de que el trabajo pase la inspección. Cuando contrata a un contratista, él debe sacar el permiso a su nombre." },
          { q: "¿Necesito permiso para cambiar los gabinetes de la cocina?", a: "Cambiar gabinetes y cubiertas sin mover plomería ni electricidad, normalmente no. Si agrega circuitos o mueve el fregadero, sí." },
          { q: "¿Cuánto cuestan los permisos?", a: "Depende del valor de la obra y de los permisos de cada oficio. Auburn y Opelika publican sus tarifas, y el presupuesto de su contratista debe incluirlas." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ HIRE A CONTRACTOR */
  {
    id: "hire-contractor", slug: { en: "check-contractor-license-alabama", es: "como-verificar-contratista-alabama" }, photo: "worker1", published: D, updated: D, service: "remodeling", related: ["bilingual-contractor", "permits", "painting-cost"],
    t: {
      en: {
        title: "How to Check a Contractor License in Alabama ($10K Rule)", eyebrow: "Hiring guide · 2026",
        description: "Alabama requires a Home Builders license for residential jobs over $10,000. How to verify a contractor's license and insurance, and red flags before you sign.",
        h1: "How to check a contractor's license in Alabama", lede: "The $10,000 rule, how to look up a license, what to ask for before you sign, and the red flags that should end the conversation.",
        answer: "In Alabama, anyone doing residential construction, remodeling or repair where the cost, labor and materials combined, exceeds $10,000 must hold a license from the Alabama Home Builders Licensure Board (HBLB). You can look up a contractor's license on the HBLB website before you sign. Also ask for a certificate of insurance, get a written contract with a clear scope and payment schedule, and never pay most of the price up front.",
        sections: [
          { h: "The $10,000 rule", p: [
            "Alabama law requires an HBLB license for the construction, remodeling, repair or improvement of a residential structure (single-family homes up to fourplexes) when the total cost of the undertaking, labor and materials, exceeds $10,000. Splitting one project into smaller contracts to stay under the threshold doesn't make it legal.",
            "The separate Alabama Licensing Board for General Contractors covers non-residential work; its threshold rose to $100,000 in October 2024. If you're hiring for your home, the HBLB license is the one to check. Georgia has its own rules, so a contractor working across the state line needs a Georgia license too.",
          ] },
          { h: "How to verify a license", list: ["Ask for the contractor's HBLB license number (it should be on their estimate, website and truck).", "Look it up on the Alabama Home Builders Licensure Board website (hblb.alabama.gov) and confirm the name and status match the company you're hiring.", "Confirm the license type covers your work; some licenses are limited.", "Search the business name on the Alabama Secretary of State site to confirm the LLC or corporation is active."] },
          { h: "Insurance to ask for", list: ["A certificate of general liability insurance, sent directly from their agent, naming you as certificate holder.", "Workers' compensation coverage for their employees (Alabama generally requires it for employers with five or more employees), or proof subcontractors carry their own.", "Check the policy dates cover your project."] },
          { h: "What belongs in the contract", list: ["A written, itemized scope of work, including materials and allowances", "Price and payment schedule tied to milestones, not dates", "Who pulls permits (it should be the contractor)", "Start date and estimated duration", "How change orders are priced and approved: in writing, before the work", "Warranty terms and cleanup and disposal"] },
          { h: "Red flags", list: ["Door-to-door offers after a storm, especially with pressure to sign today", "Cash-only, or asking for most of the money before work starts", "No license number, no insurance certificate, no written contract", "Suggesting you pull the permit yourself or skip it", "Prices far below every other estimate, with vague scope"] },
        ],
        faq: [
          { q: "Does a painter or handyman need a license in Alabama?", a: "If the total job, labor and materials, exceeds $10,000 on a residential structure, the HBLB license requirement applies. Smaller jobs may not require it, but insurance and a written agreement still matter." },
          { q: "How much deposit is normal?", a: "A deposit to schedule the work and order materials is normal; the rest should follow completed milestones, with the final payment after your walkthrough." },
          { q: "Where can I report an unlicensed contractor?", a: "The Alabama Home Builders Licensure Board accepts complaints about unlicensed residential contractors." },
        ],
      },
      es: {
        title: "Cómo verificar a un contratista en Alabama", eyebrow: "Guía para contratar · 2026",
        description: "En Alabama, las obras de más de $10,000 requieren licencia de la Junta de Constructores (HBLB). Cómo verificar licencia y seguro, y señales de alerta.",
        h1: "Cómo verificar a un contratista en Alabama", lede: "La regla de los $10,000, cómo buscar una licencia, qué pedir antes de firmar y las señales que deben hacerlo pensar dos veces. Para que nadie se aproveche.",
        answer: "En Alabama, cualquier persona que construya, remodele o repare una casa cuando el costo total, mano de obra más materiales, pase de $10,000 debe tener licencia de la Junta de Licencias de Constructores de Vivienda de Alabama (Alabama Home Builders Licensure Board, HBLB). Puede buscar la licencia en la página de la HBLB antes de firmar. También pida el certificado de seguro, un contrato por escrito con el alcance y los pagos claros, y nunca pague la mayor parte por adelantado.",
        sections: [
          { h: "La regla de los $10,000", p: [
            "La ley de Alabama exige licencia de la HBLB para construir, remodelar, reparar o mejorar una vivienda (casas y edificios de hasta cuatro departamentos) cuando el costo total de la obra, mano de obra y materiales, pasa de $10,000. Dividir una obra en contratos más chicos para no llegar al límite no la hace legal.",
            "La otra junta, la de contratistas generales, es para obras no residenciales; su límite subió a $100,000 en octubre de 2024. Si la obra es en su casa, la licencia que hay que revisar es la de la HBLB. Georgia tiene sus propias reglas, así que un contratista que trabaja del otro lado de la línea necesita también licencia de Georgia.",
          ] },
          { h: "Cómo verificar la licencia", list: ["Pida el número de licencia HBLB del contratista (debe aparecer en su presupuesto, su página web y su camioneta).", "Búsquelo en la página de la Alabama Home Builders Licensure Board (hblb.alabama.gov) y confirme que el nombre y el estatus coinciden con la empresa que va a contratar.", "Confirme que el tipo de licencia cubre su obra; algunas licencias son limitadas.", "Busque el nombre de la empresa en la página del Secretario de Estado de Alabama para confirmar que la LLC está activa."] },
          { h: "El seguro que debe pedir", list: ["Un certificado de seguro de responsabilidad civil, enviado directamente por su agente de seguros, con usted como titular del certificado.", "Seguro de compensación para trabajadores (en Alabama normalmente es obligatorio para empleadores con cinco o más empleados), o prueba de que los subcontratistas tienen el suyo.", "Revise que las fechas de la póliza cubran su obra."] },
          { h: "Qué debe decir el contrato", list: ["El alcance del trabajo por escrito y detallado, con materiales y montos para acabados", "El precio y los pagos ligados a etapas terminadas, no a fechas", "Quién saca los permisos (debe ser el contratista)", "Fecha de inicio y duración aproximada", "Cómo se cobran y aprueban los cambios: por escrito, antes de hacerlos", "Garantía, limpieza y retiro de escombro"] },
          { h: "Si no habla mucho inglés", p: [
            "Usted tiene derecho a entender lo que firma. Pida que le expliquen el presupuesto y el contrato en español, y que los cambios también queden por escrito. Desconfíe de quien le pida firmar rápido algo que no entiende, o de quien le diga que \"así se hace aquí\" para evitar el permiso o el contrato. Nosotros hacemos todo el proceso en español, y si ya tiene un presupuesto de otra empresa, con gusto se lo explicamos sin compromiso.",
          ] },
          { h: "Señales de alerta", list: ["Ofertas de puerta en puerta después de una tormenta, con presión para firmar hoy", "Que solo acepte efectivo, o que pida la mayor parte del dinero antes de empezar", "Sin número de licencia, sin certificado de seguro, sin contrato por escrito", "Que le sugiera sacar usted el permiso o no sacarlo", "Precios muy por debajo de todos los demás, con un alcance vago"] },
        ],
        faq: [
          { q: "¿Un pintor o un handyman necesita licencia en Alabama?", a: "Si el trabajo total en una vivienda, mano de obra y materiales, pasa de $10,000, sí aplica la licencia de la HBLB. En trabajos más chicos puede que no, pero el seguro y un acuerdo por escrito siguen siendo importantes." },
          { q: "¿Cuánto anticipo es normal?", a: "Es normal un anticipo para programar la obra y pedir materiales; el resto debe pagarse conforme se terminan las etapas, con el último pago después del recorrido final." },
          { q: "¿Dónde puedo reportar a un contratista sin licencia?", a: "La Alabama Home Builders Licensure Board recibe quejas sobre contratistas residenciales sin licencia." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ RENTAL TURNOVER */
  {
    id: "rental-turnover", slug: { en: "rental-turnover-checklist-auburn-al", es: "preparar-casa-de-renta-auburn" }, photo: "floor1", published: D, updated: D, service: "rental", estimator: "rental", related: ["student-condo", "flooring-humidity", "painting-cost"],
    t: {
      en: {
        title: "Rental Turnover Checklist for Auburn, AL Landlords (2026)", eyebrow: "Landlord guide · 2026",
        description: "A room-by-room rental turnover checklist for Auburn and Opelika landlords, with 2026 turnover costs, a durable spec sheet and how to beat the summer rush.",
        h1: "The Auburn landlord's rental turnover checklist", lede: "How to plan, sequence and price a turnover between tenants, especially when Auburn's leases all turn over the same summer weeks.",
        answer: `Book turnover work 6–8 weeks before move-out, walk the unit the day the tenant leaves, and work in this order: repairs and drywall, paint, flooring, fixtures, then final clean. In Auburn, a light turnover usually costs ${mid("rental", 0)}, and a medium turn with new LVP and fixtures ${mid("rental", 1)}.`,
        sections: [
          { h: "Plan around Auburn's calendar", p: [
            "Most Auburn student leases end and begin within the same few summer weeks, often with only days between tenants. Painters and flooring crews book up fast. Schedule in spring, share your lease dates, and have materials ordered before move-out day.",
          ] },
          { h: "The room-by-room checklist", list: [
            "Walls: patch holes and dings, spot-prime, repaint (one standard wall color, one trim color).",
            "Floors: replace worn carpet with LVP in living areas; deep-clean or replace carpet in bedrooms if kept.",
            "Kitchen: test appliances, re-caulk sink and backsplash, tighten hardware, replace damaged cabinet doors or repaint.",
            "Bathrooms: re-caulk tub and shower, regrout if needed, check for soft floors near the toilet, replace worn vanities or mirrors.",
            "Doors and trim: fix latches and hinges, replace damaged doors, rekey or replace locks.",
            "Safety: test smoke and CO detectors, check GFCI outlets near water, confirm handrails are solid.",
            "Exterior: check steps, railings and fascia for rot; clear gutters; touch up paint.",
            "Final: photo every room for your records and the next move-in inspection.",
          ] },
          { h: "2026 turnover costs in Auburn", table: costTable("rental", "en") },
          { h: "A durable spec sheet saves money every year", list: ["Pick one wall color and one trim color for all units and keep the paint codes on file.", "Use eggshell or satin on walls (washable) and semi-gloss on trim and doors.", "Choose an LVP with a thick wear layer and keep spare boxes for repairs.", "Standardize faucets, light fixtures and hardware so replacements match."] },
          { h: "Licensing and short-term rentals", p: ["The City of Auburn requires a residential rental business license. Short-term (game-day) rentals have separate rules, including zones where non-owner-occupied short-term rentals aren't allowed. Check with the City before listing a property for football weekends."] },
        ],
        faq: [
          { q: "How long does a rental turnover take?", a: "A light turn is often 2–4 days; a medium turn with flooring is typically 4–7 days; heavy turns with kitchen or bath work take longer." },
          { q: "Should I replace carpet with LVP in a rental?", a: "In most Auburn rentals, yes, at least in living areas. It costs more once and saves on every future turnover." },
          { q: "Can a contractor handle turnovers if I live out of town?", a: "Yes. Ask for photos of every room, an itemized invoice and one point of contact." },
        ],
      },
      es: {
        title: "Cómo preparar una casa de renta en Auburn, AL (2026)", eyebrow: "Guía para dueños · 2026",
        description: "Lista cuarto por cuarto para preparar una casa de renta en Auburn y Opelika entre inquilinos, con costos 2026, materiales que duran y cómo ganarle al verano.",
        h1: "Cómo preparar su casa de renta en Auburn", lede: "Cómo planear, ordenar y cotizar el trabajo entre un inquilino y otro, sobre todo cuando todos los contratos de Auburn cambian en las mismas semanas del verano.",
        answer: `Aparte el trabajo de 6 a 8 semanas antes de que salga el inquilino, revise la casa el mismo día que se va y trabaje en este orden: reparaciones y tablaroca, pintura, pisos, accesorios y limpieza final. En Auburn, un cambio ligero cuesta normalmente ${mid("rental", 0)} y uno mediano con piso LVP y accesorios nuevos ${mid("rental", 1)}.`,
        sections: [
          { h: "Planee según el calendario de Auburn", p: [
            "Casi todos los contratos de estudiantes en Auburn terminan y empiezan en las mismas semanas del verano, muchas veces con solo unos días entre un inquilino y otro. Los pintores y los instaladores de pisos se llenan rápido. Organícese desde la primavera, comparta las fechas de los contratos y tenga los materiales pedidos antes del día de salida.",
          ] },
          { h: "La lista, cuarto por cuarto", list: [
            "Paredes: resanar hoyos y golpes, primario donde haga falta y pintar (un color para paredes y otro para molduras).",
            "Pisos: cambiar la alfombra gastada por LVP en sala y comedor; lavar o cambiar la alfombra de las recámaras si se queda.",
            "Cocina: probar los aparatos, volver a sellar fregadero y salpicadero, apretar jaladeras, cambiar o pintar puertas dañadas.",
            "Baños: volver a sellar tina y regadera, rehacer boquilla si hace falta, revisar si el piso está blando junto al inodoro, cambiar tocadores o espejos gastados.",
            "Puertas y molduras: arreglar chapas y bisagras, cambiar puertas dañadas, cambiar las cerraduras.",
            "Seguridad: probar detectores de humo y monóxido, revisar contactos GFCI cerca del agua, confirmar que los barandales estén firmes.",
            "Exterior: revisar escalones, barandales y aleros por madera podrida; limpiar canaletas; retocar pintura.",
            "Al final: tomar fotos de cada cuarto para sus archivos y la inspección del siguiente inquilino.",
          ] },
          { h: "Costos en Auburn (2026)", table: costTable("rental", "es") },
          { h: "Estandarizar le ahorra dinero cada año", list: ["Escoja un color de pared y uno de molduras para todas sus casas y guarde los códigos de pintura.", "Use acabado satinado en paredes (se puede lavar) y semibrillante en molduras y puertas.", "Escoja un LVP con buena capa de desgaste y guarde cajas extra para reparaciones.", "Use las mismas llaves, lámparas y jaladeras en todas las casas para que los cambios siempre combinen."] },
          { h: "Licencias y rentas de corto plazo", p: ["La ciudad de Auburn exige licencia de negocio para rentar casas. Las rentas de corto plazo (por ejemplo, para los partidos) tienen reglas aparte, incluso zonas donde no se permiten si el dueño no vive ahí. Consulte con la ciudad antes de anunciar su casa para los fines de semana de fútbol."] },
          { h: "Si tiene una o dos casas de renta como patrimonio", p: ["Muchas familias hispanas de la zona tienen una casa de renta como inversión para el futuro. Tratamos esa casa con el mismo cuidado que una casa grande: presupuesto claro por escrito, fotos del antes y el después, y todo explicado en español."] },
        ],
        faq: [
          { q: "¿Cuánto tarda preparar una casa de renta?", a: "Un cambio ligero suele tomar de 2 a 4 días; uno mediano con pisos, de 4 a 7 días; los cambios fuertes con cocina o baño tardan más." },
          { q: "¿Conviene cambiar la alfombra por LVP en una casa de renta?", a: "En la mayoría de las rentas de Auburn, sí, por lo menos en las áreas comunes. Cuesta más una vez y ahorra en cada cambio de inquilino." },
          { q: "¿Pueden encargarse si vivo fuera de Auburn?", a: "Sí. Le mandamos fotos de cada cuarto, factura detallada y usted tiene un solo contacto, en español o en inglés." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ CABINETS */
  {
    id: "cabinets-paint-vs-replace", slug: { en: "paint-or-replace-kitchen-cabinets", es: "pintar-o-cambiar-gabinetes-de-cocina" }, photo: "kitchen2", published: D, updated: D, service: "cabinets", estimator: "cabinets", related: ["painting-cost", "kitchen-cost", "builder-grade-upgrades"],
    t: {
      en: {
        title: "Paint or Replace Kitchen Cabinets? 2026 Costs in Auburn", eyebrow: "Decision guide · 2026",
        description: "Paint, reface or replace your kitchen cabinets? 2026 costs in Auburn, AL, how to tell if yours can be painted, and how a cabinet finish that lasts is made.",
        h1: "Paint or replace your kitchen cabinets?", lede: "When painting is the smartest money you'll spend on a kitchen, and when it isn't.",
        answer: `If your cabinet boxes are solid wood or plywood, in good shape, and you like the layout, professional cabinet painting (${mid("cabinets", 0)} for a small kitchen, ${mid("cabinets", 1)} for an average one in Auburn) gives you a new-looking kitchen for roughly a fifth of replacement cost. Replace them if boxes are water-damaged, particleboard is swelling, doors are peeling thermofoil, or you want a different layout.`,
        sections: [
          { h: "Cost side by side", table: { head: ["Option", "Typical Auburn cost", "Time", "Best when"], rows: [
            ["Professional cabinet painting", `${money(estimate("cabinets", 0, "mid").lo)}–${money(estimate("cabinets", 2, "mid").hi)}`, "3–7 days", "Solid boxes, layout works, dated color or finish"],
            ["Refacing (new doors, veneer boxes)", "Between painting and replacing", "1–2 weeks", "Solid boxes, but you want a new door style"],
            ["New cabinets (with counters)", `${mid("kitchen", 1)}`, "3–6 weeks", "Damaged boxes, new layout, full remodel"],
          ] } },
          { h: "Is your kitchen a good candidate for paint?", list: ["Open a door: are the boxes solid wood or plywood, not crumbling particleboard?", "Check under the sink for swelling or water damage.", "Do the doors sit flat, and do hinges hold screws?", "Is the layout working for you? Paint can't add an island.", "Are the doors thermofoil (a vinyl skin)? If it's peeling, paint won't hold reliably."] },
          { h: "What makes a painted finish last", list: ["Doors and drawer fronts removed and sprayed, not brushed in place", "Thorough degreasing, then scuff sanding", "A bonding primer made for slick cabinet finishes", "A catalyzed or urethane-modified enamel topcoat that cures hard", "Proper cure time before heavy use"], p: ["Wall paint brushed over greasy cabinets is why so many DIY cabinet jobs chip around the handles within months."] },
          { h: "Oak grain: fill it or keep it", p: ["Painted oak shows its grain through the paint. Some people like the texture; for a smooth, modern look the grain can be filled before priming, which adds labor."] },
        ],
        faq: [
          { q: "How long does painted cabinetry last?", a: "Done with degreasing, bonding primer and a catalyzed enamel, many years of daily use. It's a different product and process from wall paint." },
          { q: "Can I keep using my kitchen?", a: "Mostly. Boxes are painted in place with the kitchen masked, and doors are finished separately. Expect a few days of limited use." },
          { q: "Does painting cabinets add value?", a: "Nationally, minor kitchen updates are among the best-returning remodels at resale, and cabinet painting is often the centerpiece of one." },
        ],
      },
      es: {
        title: "¿Pintar o cambiar los gabinetes de cocina? Costos 2026", eyebrow: "Guía para decidir · 2026",
        description: "¿Pintar, renovar o cambiar sus gabinetes? Costos 2026 en Auburn, AL, cómo saber si los suyos se pueden pintar y cómo se logra un acabado que dura.",
        h1: "¿Pintar o cambiar los gabinetes de la cocina?", lede: "Cuándo pintar es el dinero mejor gastado en una cocina, y cuándo no.",
        answer: `Si sus gabinetes son de madera o triplay, están en buen estado y le gusta cómo está acomodada la cocina, pintarlos profesionalmente (${mid("cabinets", 0)} en una cocina chica y ${mid("cabinets", 1)} en una mediana en Auburn) le da una cocina que parece nueva por más o menos la quinta parte de lo que cuesta cambiarlos. Conviene cambiarlos si están dañados por el agua, si el aglomerado está hinchado, si las puertas son de vinil que se despega o si quiere otra distribución.`,
        sections: [
          { h: "Costos lado a lado", table: { head: ["Opción", "Costo típico en Auburn", "Tiempo", "Conviene cuando"], rows: [
            ["Pintar los gabinetes", `${money(estimate("cabinets", 0, "mid").lo)}–${money(estimate("cabinets", 2, "mid").hi)}`, "3 a 7 días", "Gabinetes firmes, la distribución funciona, color o acabado pasados de moda"],
            ["Renovar (puertas nuevas, chapa en las cajas)", "Entre pintar y cambiar", "1 a 2 semanas", "Gabinetes firmes, pero quiere otro estilo de puerta"],
            ["Gabinetes nuevos (con cubiertas)", `${mid("kitchen", 1)}`, "3 a 6 semanas", "Gabinetes dañados, nueva distribución, remodelación completa"],
          ] } },
          { h: "¿Sus gabinetes sirven para pintarse?", list: ["Abra una puerta: ¿las cajas son de madera o triplay, no de aglomerado que se desmorona?", "Revise debajo del fregadero: ¿hay hinchazón o daño por agua?", "¿Las puertas cierran parejas y las bisagras aguantan los tornillos?", "¿Le funciona el acomodo? La pintura no le agrega una isla.", "¿Las puertas son de vinil (thermofoil)? Si se está despegando, la pintura no va a durar."] },
          { h: "Qué hace que la pintura dure", list: ["Quitar puertas y cajones y pintarlos a pistola, no con brocha en su lugar", "Desengrasar bien y luego lijar", "Un primario de adherencia hecho para superficies lisas", "Un esmalte catalizado o de uretano que endurece", "Dejar curar el tiempo necesario antes de usar a fondo"], p: ["La pintura de pared con brocha sobre gabinetes grasosos es la razón por la que tantos trabajos caseros se descarapelan alrededor de las jaladeras en pocos meses."] },
          { h: "La veta del roble: rellenarla o dejarla", p: ["El roble pintado deja ver su veta. A algunas personas les gusta la textura; para un acabado liso y moderno se puede rellenar la veta antes del primario, lo que suma trabajo."] },
        ],
        faq: [
          { q: "¿Cuánto dura la pintura en los gabinetes?", a: "Bien hecha, con desengrasado, primario de adherencia y esmalte catalizado, muchos años de uso diario. No es el mismo producto ni el mismo proceso que pintar una pared." },
          { q: "¿Puedo seguir usando la cocina?", a: "En buena parte, sí. Las cajas se pintan en su lugar con la cocina cubierta y las puertas se terminan aparte. Cuente con unos días de uso limitado." },
          { q: "¿Pintar los gabinetes le sube valor a la casa?", a: "A nivel nacional, las renovaciones ligeras de cocina están entre las mejoras que más se recuperan al vender, y pintar los gabinetes suele ser la parte principal." },
        ],
      },
    },
  },
];

export const GUIDES: Guide[] = [...CORE, ...NEW_GUIDES];
