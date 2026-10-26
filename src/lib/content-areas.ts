/* ---------------------------------------------------------------------------
   Town pages. Google's 2026 updates demote "city-name-swapped" pages, so
   each one is built on what is actually different about building there:
   which office issues the permit, historic-district rules, the housing
   stock, HOAs, and what homeowners in that town call us for.

   Facts verified September 2026 (city/county sites). Re-check permit office
   details yearly. TODO(owner): add 2–3 real local projects per town (photo,
   scope, weeks, budget range) — that's what makes these pages rank.
   ------------------------------------------------------------------------- */
import type { Locale } from "./i18n";
import type { PhotoKey } from "./content";
import type { ServicePageId } from "./content-services";
import { BRAND } from "./content";
import { ESTIMATOR, money, type EstimatorType } from "./estimator";

export type AreaId = "auburn" | "opelika" | "smiths-station" | "lee-county";
export interface AreaCopy {
  name: string; title: string; description: string; eyebrow: string; h1: string; lede: string;
  intro: string[]; local: { h: string; p: string }[]; places: string[]; faq: { q: string; a: string }[];
}
export interface AreaPage { id: AreaId; slug: Record<Locale, string>; photo: PhotoKey; map: string; drive: Record<Locale, string>; popular: ServicePageId[]; t: Record<Locale, AreaCopy> }

export const AREA_PAGES: AreaPage[] = [
  /* ------------------------------------------------------------ AUBURN */
  {
    id: "auburn", slug: { en: "auburn-al", es: "auburn-al" }, photo: "porch3", map: "Auburn, AL", drive: { en: "Home base", es: "Nuestra base" },
    popular: ["kitchen", "bathroom", "rental", "cabinets"],
    t: {
      en: {
        name: "Auburn", title: "Remodeling & Painting Contractor in Auburn, AL",
        description: "Auburn, AL painting and remodeling: kitchens, baths, cabinets, additions and rental turns, from downtown to Moores Mill. Permits handled. English or Spanish.",
        eyebrow: "Service area · Auburn, Alabama", h1: "Remodeling contractor in Auburn, AL",
        lede: "Auburn is home. We build and paint in every part of town, from the older streets near campus to the subdivisions off Moores Mill and Richland Road, and we pull the permits with the City ourselves.",
        intro: [
          "Auburn's housing splits into a few groups, and each has its own usual projects. Older homes near downtown and campus need updated kitchens and baths without losing their character. Subdivisions built from the 1990s through the 2000s now have their first round of tired builder-grade cabinets, laminate counters and carpet. And roughly half of Auburn households rent, so there's steady turnover work for landlords and parents who own a student rental.",
          "Because we're based here, we know the City's permit process, the HOA review committees, and the summer lease crunch. You get one local contact who's in the house, not a call center.",
        ],
        local: [
          { h: "Permits: City of Auburn Inspection Services", p: "Remodels, alterations, additions, decks and new plumbing, electrical or mechanical work need a City permit. Painting, flooring and trim generally don't. We apply through the Auburn permit portal, schedule inspections and meet the inspector. (Inspection Services, 171 N. Ross St.)" },
          { h: "Historic district work", p: "Exterior changes in Auburn's North College Historic District need a Certificate of Appropriateness from the Historic Preservation Commission. We plan materials and details that fit, and prepare the paperwork." },
          { h: "HOAs and architectural review", p: "Most Auburn subdivisions have covenants for exterior colors, additions and fences. We prepare drawings, color chips and material specs for your HOA before any exterior work starts." },
          { h: "Rentals and the August crunch", p: "Auburn requires a residential rental business license, and most leases turn over in the same few summer weeks. Book turnovers in spring and we'll hold your dates." },
        ],
        places: ["Downtown & North College", "Cary Woods", "Camden Ridge", "Moores Mill", "Asheton Lakes", "Yarbrough Farms", "Grove Hill", "Near campus rentals"],
        faq: [
          { q: "Do I need a permit to remodel my kitchen or bathroom in Auburn?", a: "If you're moving plumbing, adding electrical circuits or changing walls, yes. Cosmetic updates like paint, flooring and cabinet painting usually don't. We confirm on the walkthrough and pull any required permits in our name." },
          { q: "Do you work on student rentals for parents who live out of town?", a: "Yes. We coordinate with you or your property manager, work to the lease dates, and send before-and-after photos and an itemized invoice." },
          { q: "How fast can you come look at my project in Auburn?", a: "Usually within a few business days. Auburn is our home base, so walkthroughs here are easiest to schedule." },
        ],
      },
      es: {
        name: "Auburn", title: "Contratista de remodelación y pintura en Auburn, AL",
        description: "Pintura y remodelación en Auburn, AL: cocinas, baños, gabinetes, ampliaciones y casas de renta en todos los vecindarios. Con permisos. Atención en español.",
        eyebrow: "Zona de servicio · Auburn, Alabama", h1: "Contratista de remodelación en Auburn, AL",
        lede: "Auburn es nuestra casa. Construimos y pintamos en toda la ciudad, desde las calles viejas cerca de la universidad hasta los fraccionamientos de Moores Mill y Richland Road, y nosotros mismos tramitamos los permisos con la ciudad. Todo en español.",
        intro: [
          "En Auburn hay varios tipos de casas, y cada uno tiene sus trabajos típicos. Las casas viejas cerca del centro y de la universidad necesitan cocinas y baños al día sin perder su carácter. Los fraccionamientos de los 90 y los 2000 ya tienen gabinetes cansados, cubiertas de formica y alfombra gastada. Y como más o menos la mitad de los hogares de Auburn rentan, hay mucho trabajo de cambio de inquilino para dueños e inversionistas.",
          "Como somos de aquí, conocemos el proceso de permisos de la ciudad, los comités de las HOA y la carrera del verano con los contratos de renta. Usted tiene un solo contacto local que le habla en español y que conoce su casa, no un centro de llamadas.",
        ],
        local: [
          { h: "Permisos: Inspection Services de Auburn", p: "Las remodelaciones, ampliaciones, terrazas y los trabajos nuevos de plomería, electricidad o aire acondicionado necesitan permiso de la ciudad. Pintar, cambiar pisos o molduras normalmente no. Nosotros lo solicitamos en el portal de permisos de Auburn, programamos las inspecciones y recibimos al inspector. (Inspection Services, 171 N. Ross St.)" },
          { h: "Casas en zona histórica", p: "Los cambios exteriores en el North College Historic District requieren un Certificado de Conformidad (COA) de la Comisión de Preservación Histórica. Planeamos materiales y detalles adecuados y preparamos el trámite." },
          { h: "HOA y revisión de fachadas", p: "Casi todos los fraccionamientos de Auburn tienen reglas para colores, ampliaciones y cercas. Preparamos planos, muestras de color y especificaciones para su HOA antes de empezar cualquier trabajo exterior." },
          { h: "Casas de renta y el verano", p: "Auburn exige licencia de negocio para rentar casas, y casi todos los contratos cambian en las mismas semanas del verano. Aparte su fecha desde la primavera y se la respetamos." },
        ],
        places: ["Centro y North College", "Cary Woods", "Camden Ridge", "Moores Mill", "Asheton Lakes", "Yarbrough Farms", "Grove Hill", "Rentas cerca de la universidad"],
        faq: [
          { q: "¿Necesito permiso para remodelar mi cocina o baño en Auburn?", a: "Si va a mover plomería, agregar circuitos eléctricos o cambiar paredes, sí. Los cambios estéticos como pintura, pisos o pintar gabinetes casi nunca. Lo confirmamos en la visita y sacamos los permisos a nuestro nombre." },
          { q: "¿Me atienden en español de principio a fin?", a: "Sí. La visita, el presupuesto, el contrato, las llamadas y los mensajes por WhatsApp, todo en español. Y si alguien de su familia prefiere inglés, también." },
          { q: "¿Qué tan rápido pueden venir a ver mi proyecto en Auburn?", a: "Normalmente en unos pocos días hábiles. Auburn es nuestra base, así que aquí es donde más fácil nos acomodamos." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ OPELIKA */
  {
    id: "opelika", slug: { en: "opelika-al", es: "opelika-al" }, photo: "porch2", map: "Opelika, AL", drive: { en: "10–15 minutes", es: "10–15 minutos" },
    popular: ["painting", "kitchen", "bathroom", "repairs"],
    t: {
      en: {
        name: "Opelika", title: "Remodeling & Painting Contractor in Opelika, AL",
        description: "Opelika, AL painting, remodeling and repairs: kitchens, baths, exterior paint, porches and rot repair, historic Northside homes included. English or Spanish.",
        eyebrow: "Service area · Opelika, Alabama", h1: "Remodeling & painting in Opelika, AL",
        lede: "Opelika has some of the area's best older homes, from the Northside historic district to the brick ranches around Saugahatchee. We update them carefully and handle permits with the City.",
        intro: [
          "Nearly half of Opelika's houses were built before 1990, so a lot of our work here is bringing solid older homes up to date: kitchens and baths, exterior paint with real rot repair, porches, and replacing worn carpet with LVP. Newer neighborhoods like National Village bring cabinet painting, upgrades and additions.",
          "Opelika also has the largest share of Spanish-speaking families in Lee County, and many families relocating for the area's manufacturing employers. We serve both: every estimate and conversation can be in English or Spanish.",
        ],
        local: [
          { h: "Permits: Opelika Building Inspection Division", p: "Opelika requires plans and permits for construction, plus separate electrical, plumbing and mechanical permits. Plan review typically takes 3–4 business days and the permit card must be posted on site. We handle all of it with Public Works (710 Fox Trail)." },
          { h: "Historic districts", p: "Exterior changes in the Northside, Downtown and Geneva Street historic districts need a Certificate of Appropriateness. We match original trim, siding and porch details and prepare the application." },
          { h: "Older-home surprises", p: "Pre-1990 homes can hide rot, galvanized plumbing or outdated wiring. We look before we price and tell you what we find before we fix it." },
          { h: "Exterior paint that lasts", p: "Brick ranches and wood-sided homes here take a beating from sun and humidity. We wash, scrape, replace rotten wood and use coatings made for this climate." },
        ],
        places: ["Northside Historic District", "Geneva Street", "Downtown Opelika", "Saugahatchee Country Club area", "National Village / Grand National", "Pepperell Parkway area"],
        faq: [
          { q: "How long does a building permit take in Opelika?", a: "Residential plan review is typically 3–4 business days once a complete application is in. We build that into the schedule and pull the permit ourselves." },
          { q: "Can you work on a house in Opelika's historic district?", a: "Yes. Exterior changes need a Certificate of Appropriateness; interior work generally doesn't. We plan details that fit the house and prepare the COA application." },
          { q: "Do you do exterior painting in Opelika?", a: "Yes, it's one of our most common jobs here, usually with rot repair on fascia, window trim and porches before paint." },
        ],
      },
      es: {
        name: "Opelika", title: "Contratista de remodelación y pintura en Opelika, AL",
        description: "Pintura, remodelación y reparaciones en Opelika, AL: cocinas, baños, pintura exterior, porches y madera podrida, también en casas históricas. En español.",
        eyebrow: "Zona de servicio · Opelika, Alabama", h1: "Remodelación y pintura en Opelika, AL",
        lede: "Opelika tiene algunas de las casas más bonitas de la zona, desde el barrio histórico de Northside hasta las casas de ladrillo alrededor de Saugahatchee. Las ponemos al día con cuidado, tramitamos los permisos con la ciudad y lo atendemos en español.",
        intro: [
          "Casi la mitad de las casas de Opelika se construyeron antes de 1990, así que mucho de nuestro trabajo aquí es poner al día casas viejas pero sólidas: cocinas y baños, pintura exterior con reparación de madera podrida, porches y cambiar alfombra por LVP. En los vecindarios más nuevos, como National Village, hacemos pintura de gabinetes, mejoras y ampliaciones.",
          "Opelika es la ciudad del condado de Lee con más familias hispanas, y sabemos lo que significa encontrar un contratista que le explique todo en su idioma, por escrito, sin sorpresas. Aquí lo atendemos en español de principio a fin.",
        ],
        local: [
          { h: "Permisos: Building Inspection de Opelika", p: "Opelika pide planos y permiso de construcción, además de permisos aparte para electricidad, plomería y aire acondicionado. La revisión tarda normalmente de 3 a 4 días hábiles y la tarjeta del permiso tiene que estar a la vista en la obra. Nosotros hacemos todo el trámite con Public Works (710 Fox Trail)." },
          { h: "Zonas históricas", p: "Los cambios exteriores en los distritos históricos de Northside, el centro y Geneva Street requieren un Certificado de Conformidad (COA). Igualamos molduras, fachada y detalles del porche originales y preparamos la solicitud." },
          { h: "Sorpresas en casas viejas", p: "Las casas de antes de 1990 pueden esconder madera podrida, tubería galvanizada o cableado viejo. Revisamos antes de cotizar y le avisamos lo que encontremos antes de arreglarlo." },
          { h: "Pintura exterior que dura", p: "Las casas de ladrillo y de madera sufren mucho con el sol y la humedad. Lavamos, raspamos, cambiamos la madera podrida y usamos pinturas hechas para este clima." },
        ],
        places: ["Barrio histórico Northside", "Geneva Street", "Centro de Opelika", "Zona de Saugahatchee Country Club", "National Village / Grand National", "Zona de Pepperell Parkway"],
        faq: [
          { q: "¿Cuánto tarda un permiso de construcción en Opelika?", a: "La revisión de una obra residencial toma normalmente de 3 a 4 días hábiles con la solicitud completa. Lo contemplamos en el calendario y lo tramitamos nosotros." },
          { q: "¿Pueden trabajar en una casa de la zona histórica?", a: "Sí. Los cambios exteriores necesitan un Certificado de Conformidad; el trabajo interior casi nunca. Planeamos detalles que vayan con la casa y preparamos la solicitud." },
          { q: "¿Me pueden explicar el presupuesto y el contrato en español?", a: "Sí, todo: la visita, el presupuesto por escrito, el contrato y cada cambio. Si prefiere, también le mandamos todo por WhatsApp." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ SMITHS STATION */
  {
    id: "smiths-station", slug: { en: "smiths-station-al", es: "smiths-station-al" }, photo: "deck2", map: "Smiths Station, AL", drive: { en: "About 25–30 minutes", es: "Unos 25–30 minutos" },
    popular: ["additions", "repairs", "flooring", "painting"],
    t: {
      en: {
        name: "Smiths Station & Beauregard", title: "Contractor in Smiths Station & Beauregard, AL",
        description: "Additions, garages, decks, porches, flooring, painting and repairs in Smiths Station and Beauregard, AL. Family-owned Lee County contractor. Free estimates.",
        eyebrow: "Service area · South Lee County", h1: "Contractor in Smiths Station & Beauregard",
        lede: "Bigger lots, growing families and homes that need more room. In south Lee County we build a lot of additions, garages, porches and decks, and handle the repairs in between.",
        intro: [
          "South Lee County has grown fast, with newer subdivisions alongside older homes on larger country lots. That combination means more room to build: bedroom and bonus-room additions, attached and detached garages, screened porches and decks, plus flooring and paint to freshen up the rest of the house.",
          "Many families here commute toward Columbus or Auburn–Opelika, so we plan work around your schedule, keep the site clean and secure, and keep you updated by text or WhatsApp.",
        ],
        local: [
          { h: "Which office issues your permit", p: "Addresses inside Smiths Station city limits and addresses in unincorporated Lee County (much of the Beauregard area) are permitted through different offices. We confirm which one applies to your address and pull the permit." },
          { h: "Room to add on", p: "Larger lots make additions, detached garages and workshops practical. We check setbacks, drainage and how the roofline ties in before you commit to drawings." },
          { h: "Septic and wells", p: "If your home is on septic, adding a bedroom or bathroom can require a capacity review with the county health department. We check early so it doesn't stall the job." },
          { h: "Storm season", p: "Spring storms bring fallen limbs and roof, siding and porch damage. We document damage for your insurance adjuster and make permanent repairs." },
        ],
        places: ["Smiths Station", "Beauregard", "US-280 / US-431 corridor", "Lee Road communities", "Newer subdivisions", "Country homes on acreage"],
        faq: [
          { q: "Do you build detached garages and workshops?", a: "Yes. We handle the slab, framing, roofing, doors, electrical coordination and permits, and match the siding and paint to your house." },
          { q: "Is Smiths Station too far for small jobs?", a: "Not at all. For small repairs, bundling a few items into one visit keeps the trip worthwhile for everyone." },
          { q: "Can you help with storm damage?", a: "Yes. We document the damage with photos, provide a detailed estimate for your adjuster and do the permanent repairs." },
        ],
      },
      es: {
        name: "Smiths Station y Beauregard", title: "Contratista en Smiths Station y Beauregard, AL",
        description: "Ampliaciones, cocheras, terrazas, porches, pisos, pintura y reparaciones en Smiths Station y Beauregard, AL. Empresa familiar del condado de Lee. En español.",
        eyebrow: "Zona de servicio · Sur del condado de Lee", h1: "Contratista en Smiths Station y Beauregard",
        lede: "Terrenos más grandes, familias que crecen y casas que necesitan más espacio. En el sur del condado de Lee hacemos muchas ampliaciones, cocheras, porches y terrazas, y todas las reparaciones de en medio.",
        intro: [
          "El sur del condado de Lee ha crecido rápido, con fraccionamientos nuevos junto a casas más viejas en terrenos de campo. Eso da espacio para construir: dormitorios y cuartos extra, cocheras pegadas o separadas, porches con mosquitero y terrazas, además de pisos y pintura para renovar el resto de la casa.",
          "Muchas familias de aquí trabajan en Columbus o en Auburn–Opelika, así que organizamos el trabajo según su horario, dejamos la obra limpia y segura y le avisamos de todo por mensaje o WhatsApp, en español.",
        ],
        local: [
          { h: "Qué oficina da su permiso", p: "Las casas dentro de la ciudad de Smiths Station y las del condado sin municipio (buena parte de Beauregard) sacan permiso en oficinas distintas. Nosotros confirmamos cuál le toca a su dirección y hacemos el trámite." },
          { h: "Espacio para crecer", p: "Con terrenos más grandes, las ampliaciones, cocheras separadas y talleres son muy prácticos. Revisamos distancias al lindero, drenaje y cómo se une el techo antes de que pague planos." },
          { h: "Fosa séptica y pozo", p: "Si su casa tiene fosa séptica, agregar un dormitorio o un baño puede requerir una revisión de capacidad con el departamento de salud del condado. Lo revisamos desde el principio para que no se atore la obra." },
          { h: "Temporada de tormentas", p: "Las tormentas de primavera tiran ramas y dañan techos, fachadas y porches. Documentamos el daño para su ajustador del seguro y hacemos la reparación definitiva." },
        ],
        places: ["Smiths Station", "Beauregard", "Corredor US-280 / US-431", "Comunidades de las Lee Road", "Fraccionamientos nuevos", "Casas de campo con terreno"],
        faq: [
          { q: "¿Construyen cocheras separadas y talleres?", a: "Sí. Hacemos la losa, la estructura, el techo, las puertas, la coordinación eléctrica y los permisos, y la fachada y la pintura quedan igual que las de su casa." },
          { q: "¿Smiths Station les queda muy lejos para trabajos chicos?", a: "Para nada. Si junta varias reparaciones en una sola visita, el viaje vale la pena para todos." },
          { q: "¿Me ayudan con daños por tormenta y el seguro?", a: "Sí. Tomamos fotos del daño, le damos un presupuesto detallado para el ajustador y hacemos la reparación. Si lo necesita, le explicamos en español lo que dice el seguro." },
        ],
      },
    },
  },
  /* ------------------------------------------------------------ LEE COUNTY */
  {
    id: "lee-county", slug: { en: "lee-county-al", es: "condado-de-lee-al" }, photo: "deck1", map: "Lee County, AL", drive: { en: "15–30 minutes", es: "15–30 minutos" },
    popular: ["remodeling", "additions", "repairs", "painting"],
    t: {
      en: {
        name: "Lee County", title: "Remodeling Contractor in Lee County, AL | Rural Homes",
        description: "Remodeling, additions, painting and repairs across rural Lee County, AL: Loachapoka, Salem, Waverly, Notasulga and nearby. Free estimates, English or Spanish.",
        eyebrow: "Service area · Lee County, Alabama", h1: "Remodeling across Lee County",
        lede: "Loachapoka, Salem, Waverly, Notasulga and the country roads in between. Farmhouses, older homes on acreage and family land, updated by a local crew that shows up.",
        intro: [
          "Out in the county, houses tend to be older, bigger-lot and more varied: farmhouses that have been added onto over generations, brick ranches, and homes that need a new bathroom, a bigger kitchen or a porch rebuilt. It's also where it's hardest to find a contractor who returns calls and actually drives out.",
          "We do. Most of Lee County is within 30 minutes of our Auburn base, and we bundle visits so smaller jobs in the county still make sense.",
        ],
        local: [
          { h: "Permits in unincorporated Lee County", p: "Outside city limits, building permits and inspections run through Lee County's Building Inspection department; small towns may have their own rules. We confirm which applies and handle it." },
          { h: "Older and farmhouse construction", p: "Older framing, crawlspaces and past additions rarely line up perfectly. We plan for it, check for rot and termite damage, and tell you what we find before we fix it." },
          { h: "Septic, wells and additions", p: "Adding a bedroom or bath on septic can require a capacity review with the county health department. We check before you design, not after." },
          { h: "Porches, decks and outbuildings", p: "Wraparound porches, decks, garages and workshops are a big part of county work. We rebuild with materials made for weather and bugs." },
        ],
        places: ["Loachapoka", "Salem", "Waverly", "Notasulga", "Beauregard", "Rural Lee County"],
        faq: [
          { q: "Will you drive out to rural Lee County for an estimate?", a: "Yes. Anywhere within about 30 minutes of Auburn is in our normal area, and we'll often schedule county walkthroughs back-to-back to get to you faster." },
          { q: "Do you work on older farmhouses?", a: "Yes. Older homes are some of our favorite projects. We respect what's original, fix what's failing and make the new work blend in." },
          { q: "Do you work on manufactured homes?", a: "For interior updates like flooring, paint, cabinets, bathroom refreshes and decks or porches, yes. Structural changes to manufactured homes have special rules, so we'll look first." },
        ],
      },
      es: {
        name: "Condado de Lee", title: "Contratista en el condado de Lee, AL | Zonas rurales",
        description: "Remodelación, ampliaciones, pintura y reparaciones en el condado de Lee: Loachapoka, Salem, Waverly, Notasulga y alrededores. Presupuesto gratis en español.",
        eyebrow: "Zona de servicio · Condado de Lee, Alabama", h1: "Remodelación en todo el condado de Lee",
        lede: "Loachapoka, Salem, Waverly, Notasulga y los caminos de en medio. Casas de campo, casas viejas con terreno y propiedades de familia, renovadas por una cuadrilla local que sí llega.",
        intro: [
          "En el campo las casas suelen ser más viejas, con terrenos más grandes y muy distintas entre sí: casas a las que se les han ido agregando cuartos por generaciones, casas de ladrillo de un piso y hogares que necesitan un baño nuevo, una cocina más grande o reconstruir el porche. También es donde más cuesta encontrar un contratista que conteste el teléfono y de verdad vaya.",
          "Nosotros sí vamos. Casi todo el condado de Lee está a 30 minutos de nuestra base en Auburn, y juntamos visitas para que los trabajos chicos en el campo también convengan. Y le atendemos en español.",
        ],
        local: [
          { h: "Permisos fuera de la ciudad", p: "Fuera de los límites de la ciudad, los permisos e inspecciones los lleva el departamento de Building Inspection del condado de Lee; algunos pueblos tienen sus propias reglas. Confirmamos cuál aplica y hacemos el trámite." },
          { h: "Casas viejas y de campo", p: "La estructura vieja, el espacio bajo el piso y las ampliaciones anteriores casi nunca cuadran perfecto. Lo planeamos, revisamos madera podrida y daño de termitas, y le avisamos antes de arreglar." },
          { h: "Fosa séptica, pozo y ampliaciones", p: "Agregar un dormitorio o un baño con fosa séptica puede requerir una revisión con el departamento de salud del condado. Lo revisamos antes de diseñar, no después." },
          { h: "Porches, terrazas y construcciones aparte", p: "Los porches, terrazas, cocheras y talleres son gran parte del trabajo en el campo. Los reconstruimos con materiales que aguantan el clima y los insectos." },
        ],
        places: ["Loachapoka", "Salem", "Waverly", "Notasulga", "Beauregard", "Zonas rurales del condado"],
        faq: [
          { q: "¿Van hasta el campo a dar presupuesto?", a: "Sí. Todo lo que esté a unos 30 minutos de Auburn es nuestra zona normal, y muchas veces juntamos visitas en el condado para llegar más pronto." },
          { q: "¿Trabajan en casas de campo viejas?", a: "Sí. Las casas viejas son de nuestros proyectos favoritos. Respetamos lo original, arreglamos lo que está fallando y hacemos que lo nuevo combine." },
          { q: "¿Trabajan en casas móviles o prefabricadas?", a: "Para mejoras interiores como pisos, pintura, gabinetes, baños y también terrazas o porches, sí. Los cambios estructurales en casas prefabricadas tienen reglas especiales, así que primero las revisamos." },
        ],
      },
    },
  },
];

/* One self-contained passage per town page: who, where, languages and the
   headline price ranges, in a sentence an assistant can quote whole. Prices
   come from the estimator table, so they move when it moves. */
export function areaSummary(locale: Locale, a: AreaPage): string {
  const r = (k: EstimatorType) => { const t = ESTIMATOR[k].tiers; return `${money(t[0].lo)}–${money(t[2].hi)}`; };
  const name = a.t[locale].name;
  if (locale === "es") {
    const where = a.id === "auburn" ? "su base" : `a ${a.drive.es.toLowerCase()} de su base en Auburn`;
    return `${BRAND.name} pinta y remodela casas en ${name}, Alabama (${where}), y atiende en español o en inglés. Rangos típicos 2026 aquí: pintura interior desde ${money(ESTIMATOR.interior.tiers[0].lo)}, cocinas ${r("kitchen")}, baños ${r("bath")} y pintura de gabinetes ${r("cabinets")}.`;
  }
  const where = a.id === "auburn" ? "its home base" : `${a.drive.en.toLowerCase()} from its Auburn base`;
  return `${BRAND.name} paints and remodels homes in ${name}, Alabama (${where}), in English or Spanish. Typical 2026 ranges here: interior painting from ${money(ESTIMATOR.interior.tiers[0].lo)}, kitchens ${r("kitchen")}, bathrooms ${r("bath")} and cabinet painting ${r("cabinets")}.`;
}
