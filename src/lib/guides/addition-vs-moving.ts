import { costTable, mid, money, type Guide } from "../guide-kit";

const D = "2026-09-30";

/* Moving-side figures are third-party and dated (see sources). The worked
   example is illustrative arithmetic on those figures, computed here so the
   numbers in both languages always agree. Addition prices come from the
   estimator via mid() and costTable(). */
const LISTING = 406791; // Realtor.com median listing price, Lee County, Aug 2026 (FRED MEDLISPRI1081)
const BUYER_AGENT = 2.42; // Redfin, average U.S. buyer's agent commission, Q3 2025
const RATE_NOW = 7.03; // Freddie Mac PMMS 30-yr fixed, Sept 24, 2026
const RATE_OLD = 3.5; // example existing loan
const LOAN = 300000; // example loan balance
const NEXT_HOME = 450000; // example next-home price
const r100 = (n: number) => Math.round(n / 100) * 100;
const COMMISSIONS = r100(LISTING * (BUYER_AGENT * 2) / 100); // both agents at the Redfin average
const CLOSE_LO = NEXT_HOME * 0.02, CLOSE_HI = NEXT_HOME * 0.05; // CFPB: 2–5% of purchase price
const pmt = (rate: number) => { const r = rate / 1200; return Math.round((LOAN * r) / (1 - Math.pow(1 + r, -360))); };
const PMT_OLD = pmt(RATE_OLD), PMT_NOW = pmt(RATE_NOW), PMT_DIFF = PMT_NOW - PMT_OLD;
const SUNK_LO = COMMISSIONS + CLOSE_LO, SUNK_HI = COMMISSIONS + CLOSE_HI;
const pctEs = (n: number) => `${n.toFixed(2)} %`;

export const guide: Guide = {
  id: "addition-vs-moving",
  slug: { en: "home-addition-vs-moving-lee-county-al", es: "ampliar-la-casa-o-mudarse-condado-de-lee-al" },
  photo: "framing1",
  published: D,
  updated: D,
  service: "additions",
  estimator: "addition",
  related: ["permits", "kitchen-cost", "hire-contractor"],
  sources: [
    { name: "Consumer Financial Protection Bureau — Figure out how much you want to spend (closing costs)", url: "https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/" },
    { name: "Freddie Mac — Primary Mortgage Market Survey (week of Sept. 24, 2026)", url: "https://www.freddiemac.com/pmms" },
    { name: "Redfin — Average buyer's agent commission, Q3 2025 (Dec. 8, 2025)", url: "https://www.redfin.com/news/commissions-q3-2025/" },
    { name: "FRED / Realtor.com — Median Listing Price in Lee County, AL (MEDLISPRI1081)", url: "https://fred.stlouisfed.org/series/MEDLISPRI1081" },
    { name: "City of Opelika — Board of Zoning Adjustment", url: "https://www.opelika-al.gov/417/Zoning-Board-of-Adjustment" },
  ],
  t: {
    en: {
      title: "Home Addition vs. Moving in Lee County, AL: 2026 Costs",
      eyebrow: "Planning guide · 2026",
      description: "Build an addition or move? 2026 addition costs in Auburn and Opelika, AL vs. commissions, closing costs and mortgage rates, plus zoning and a decision table.",
      h1: "Build an addition or move? Lee County, AL (2026 numbers)",
      lede: "What an addition costs here, what moving really costs once commissions, closing costs and a new mortgage rate are counted, and the lot, zoning and HOA questions that decide it before any money is spent.",
      answer: `In Lee County in 2026 a bedroom or bonus-room addition typically costs ${mid("addition", 1)} and a primary or in-law suite with a full bath ${mid("addition", 2)}. Selling a home at the county's median listing price and buying another can cost roughly ${money(SUNK_LO)}–${money(SUNK_HI)} in commissions and closing costs alone, money that does not stay in any house, plus a higher mortgage rate. If you like your location and your lot can take it, an addition usually wins; if you need a different school zone, much more space or your lot has no room, moving does.`,
      sections: [
        {
          h: "What an addition costs in Lee County (2026)",
          p: [
            `These are planning ranges for complete, finished space, installed, with permits, foundation, framing, roof tie-in, windows, siding matched to the house, mechanical trades, drywall, trim and paint. The biggest price jumps come from plumbing (a bathroom or kitchenette), a complicated roofline, a sloped lot and whether your HVAC and electrical panel can carry the new space. Try your own size in our [addition cost estimator](page:estimator).`,
          ],
          table: costTable("addition", "en"),
        },
        {
          h: "What moving really costs",
          p: [
            `To compare honestly, use today's numbers. Realtor.com's median listing price for Lee County was ${money(LISTING)} in August 2026 (reported on FRED). Redfin found the average U.S. buyer's agent commission was ${BUYER_AGENT}% in the third quarter of 2025, and commissions are negotiable; if both agents are paid around that rate, commissions on a median sale come to about ${money(COMMISSIONS)}. The Consumer Financial Protection Bureau says closing costs typically run 2% to 5% of the purchase price, so a ${money(NEXT_HOME)} next home adds ${money(CLOSE_LO)}–${money(CLOSE_HI)}.`,
          ],
          list: [
            `Commissions on the sale: about ${money(COMMISSIONS)} in this example`,
            `Closing costs on the purchase: ${money(CLOSE_LO)}–${money(CLOSE_HI)}`,
            "Getting the old house ready to sell: repairs from the buyer's inspection, paint, cleaning",
            "Movers, overlap in utilities, deposits, and often a few months of two housing payments",
            "Furnishing and fixing the new house, which rarely fits your furniture or needs exactly",
          ],
        },
        {
          h: "The mortgage rate is the hidden cost",
          p: [
            `Freddie Mac's survey put the average 30-year fixed rate at ${RATE_NOW}% on September 24, 2026. Many Lee County homeowners bought or refinanced when rates were far lower. As a simple example, principal and interest on a ${money(LOAN)} loan is about ${money(PMT_OLD)} a month at ${RATE_OLD}% and about ${money(PMT_NOW)} at ${RATE_NOW}%, roughly ${money(PMT_DIFF)} more every month for the same balance. An addition leaves your current loan alone; how you finance the addition (cash, a home equity line or a cash-out refinance) has its own rate, so compare those with your lender.`,
          ],
        },
        {
          h: "Can your lot take an addition?",
          p: [
            "This is the question to answer first, before drawings. Every lot has setbacks (minimum distances from the property lines), and most subdivisions have recorded easements and HOA rules on top of city zoning.",
          ],
          list: [
            "Auburn: the City of Auburn Planning Department can tell you your zoning district and the setbacks that apply, and staff review accessory structures for setbacks too. The building permit then goes through Inspection Services.",
            "Opelika: if a setback makes a reasonable addition impossible because of a narrow, shallow or oddly shaped lot, the Board of Zoning Adjustment hears variance requests. It meets the second Tuesday of each month, and applications are due to the Planning Department three Tuesdays before.",
            "Historic districts: exterior changes in Auburn's North College district and Opelika's Northside, Downtown and Geneva Street districts need a Certificate of Appropriateness.",
            "HOAs: most subdivisions around Auburn and Opelika require architectural review for additions, including rooflines, siding and colors. HOA approval and a city permit are separate; you usually need both.",
            "Outside city limits: county lots often have more room, but a septic drain field, a well or a steep slope can limit where an addition can go.",
          ],
        },
        {
          h: "How long an addition takes",
          table: {
            head: ["Phase", "Typical time", "What happens"],
            rows: [
              ["Feasibility and budget", "1–2 weeks", "Site walk, setbacks, planning range before you pay for drawings"],
              ["Design and drawings", "Several weeks", "Designer or architect, engineering where needed, HOA submittal"],
              ["Permits", "Days to a few weeks", "Opelika plan review is typically 3–4 business days once complete; Auburn varies with the queue"],
              ["Construction", "6–16 weeks on site", "Foundation, framing, dry-in, trades, inspections, finishes"],
            ],
          },
          p: ["A move has its own timeline: preparing and listing the house, time on market, a buyer's inspection and financing, then closing and moving. The two are not far apart, but an addition's schedule is mostly in your control."],
        },
        {
          h: "Living through construction",
          p: [
            "Most of an addition is built outside the existing house. The disruptive part is the tie-in, when we open the wall between old and new, and the weeks of trades and finishes after it. We plan it so you keep a working kitchen and bathroom, put up dust walls and floor protection, and tell you ahead of time about days when water or power will be off. If the addition connects through the kitchen, it can make sense to update the kitchen at the same time; our [kitchen remodel cost guide](guide:kitchen-cost) has those numbers.",
          ],
        },
        {
          h: "When moving is the better call",
          list: [
            "You need a different school zone, a shorter commute or a different town, not just more space.",
            "You need two or three rooms plus a bigger kitchen and garage. At that point you are rebuilding the house.",
            "Setbacks, easements, the HOA or a septic field leave no good place to build.",
            "The house has other big bills coming (roof, foundation, HVAC), so the addition would sit on a weak base.",
            "The addition would make yours the most expensive house on the street by a wide margin. Additions are built for living in; resale rarely pays back the full cost.",
          ],
        },
        {
          h: "A simple way to decide",
          table: {
            head: ["If this is true", "Leans toward"],
            rows: [
              ["You like the neighborhood, schools and commute", "Addition"],
              ["Your mortgage rate is well below today's rate", "Addition"],
              ["You need one bedroom, a suite or a bonus room", "Addition"],
              ["Parents moving in and need a first-floor suite", "Addition"],
              ["The lot has room within setbacks and the HOA allows it", "Addition"],
              ["You need a different location or school zone", "Move"],
              ["You need several rooms and a bigger kitchen", "Move"],
              ["The lot or HOA rules block a sensible addition", "Move"],
              ["You plan to sell within two or three years", "Move, or a smaller project"],
            ],
          },
          p: ["Before you decide, get a planning number for the addition and a realistic net-proceeds sheet for a sale, side by side. We give a planning range on our first visit to your house, before you pay for drawings, and our [home additions](service:additions) page explains how we handle the whole project."],
        },
      ],
      faq: [
        { q: "Is it cheaper to build an addition or buy a bigger house?", a: `Often the addition, if you need one or two rooms. A bedroom addition runs ${mid("addition", 1)} here, and that money stays in your house as finished space, while commissions and closing costs on a move do not. If you need much more space or a new location, moving can come out ahead.` },
        { q: "How much does a 400 sq ft addition cost in Auburn or Opelika?", a: `A primary or in-law suite of roughly 400–500 sq ft with a full bath typically costs ${mid("addition", 2)} at mid-range finishes in 2026. Without a bathroom, a bonus room is closer to ${mid("addition", 1)}.` },
        { q: "Do I need a permit for a home addition?", a: "Yes, always, from the City of Auburn, the City of Opelika or Lee County depending on the address, plus HOA approval in most subdivisions. See our [permit guide](guide:permits)." },
        { q: "How close to my property line can I build?", a: "It depends on your zoning district and any subdivision plat or HOA rules. The city planning department can confirm the setbacks for your lot, and we check them on the first site visit." },
        { q: "Can we live in the house during an addition?", a: "Usually yes. Most of the work is outside the existing house until the tie-in. We plan the schedule so you keep a working kitchen and bathroom." },
        { q: "Does an addition add value to my home?", a: "It adds space and usually value, but rarely the full cost at resale. It makes the most sense when you plan to stay for years and it fits the size and price of the homes around you." },
      ],
    },
    es: {
      title: "¿Ampliar la casa o mudarse? Condado de Lee, AL 2026",
      eyebrow: "Guía para decidir · 2026",
      description: "¿Ampliar o mudarse? Costos 2026 de ampliaciones en Auburn y Opelika, AL frente a comisiones, gastos de cierre y tasas de hipoteca, con permisos y zonas.",
      h1: "¿Ampliar la casa o mudarse? Condado de Lee, AL (2026)",
      lede: "Cuánto cuesta ampliar aquí, cuánto cuesta de verdad mudarse con comisiones, gastos de cierre y una hipoteca nueva, y qué dicen el terreno, la zonificación y la HOA.",
      answer: `En el condado de Lee, en 2026, agregar un dormitorio o un cuarto extra cuesta normalmente ${mid("addition", 1)}, y una suite principal o para los papás con baño completo ${mid("addition", 2)}. Vender una casa al precio mediano de lista del condado y comprar otra puede costar más o menos ${money(SUNK_LO)}–${money(SUNK_HI)} solo en comisiones y gastos de cierre, dinero que no se queda en ninguna casa, además de una tasa de hipoteca más alta. Si le gusta dónde vive y su terreno lo permite, casi siempre conviene ampliar; si necesita otra zona escolar, mucho más espacio o no hay dónde construir, conviene mudarse.`,
      sections: [
        {
          h: "Cuánto cuesta una ampliación en el condado de Lee (2026)",
          p: [
            `Son precios de referencia para un espacio terminado, con permisos, cimentación, estructura, techo, ventanas, fachada igual a la casa, instalaciones y acabados. Lo que más sube el precio es la plomería (un baño o una cocineta), un techo complicado, un terreno en pendiente y si el aire acondicionado y el panel eléctrico aguantan. Puede calcular su caso con nuestro [calculador de ampliaciones](page:estimator).`,
          ],
          table: costTable("addition", "es"),
        },
        {
          h: "Cuánto cuesta mudarse de verdad",
          p: [
            `Para comparar parejo hay que usar los números de hoy. El precio mediano de lista de Realtor.com para el condado de Lee fue de ${money(LISTING)} en agosto de 2026 (publicado en FRED). Redfin encontró que la comisión promedio del agente del comprador en Estados Unidos fue de ${pctEs(BUYER_AGENT)} en el tercer trimestre de 2025, y las comisiones se negocian; si a los dos agentes se les paga más o menos eso, en una venta mediana son unos ${money(COMMISSIONS)}. La Oficina para la Protección Financiera del Consumidor (CFPB) dice que los gastos de cierre suelen ser del 2 % al 5 % del precio de compra, así que una casa nueva de ${money(NEXT_HOME)} suma ${money(CLOSE_LO)}–${money(CLOSE_HI)}.`,
          ],
          list: [
            `Comisiones de la venta: unos ${money(COMMISSIONS)} en este ejemplo`,
            `Gastos de cierre de la compra: ${money(CLOSE_LO)}–${money(CLOSE_HI)}`,
            "Preparar la casa para vender: reparaciones que pide el inspector del comprador, pintura, limpieza",
            "La mudanza, depósitos de servicios y muchas veces unos meses pagando dos casas",
            "Amueblar y arreglar la casa nueva, que casi nunca le queda exacta a lo que usted tiene",
          ],
        },
        {
          h: "La tasa de la hipoteca es el costo que no se ve",
          p: [
            `Según Freddie Mac, la tasa promedio a 30 años fue de ${pctEs(RATE_NOW)} el 24 de septiembre de 2026. Un ejemplo sencillo: el pago de capital e interés de un préstamo de ${money(LOAN)} es de unos ${money(PMT_OLD)} al mes al ${pctEs(RATE_OLD)} y de unos ${money(PMT_NOW)} al ${pctEs(RATE_NOW)}, casi ${money(PMT_DIFF)} más cada mes por la misma deuda. Si amplía, su préstamo actual no cambia; el financiamiento de la ampliación (ahorros, línea de crédito sobre la casa o refinanciamiento) tiene su propia tasa, así que compárelo con su banco.`,
          ],
        },
        {
          h: "¿Su terreno permite una ampliación?",
          p: [
            "Esto se revisa antes de hacer planos. Todo terreno tiene retiros (la distancia mínima a las líneas del terreno), y casi todos los fraccionamientos suman servidumbres y reglas de la HOA.",
          ],
          list: [
            "Auburn: el Departamento de Planeación le dice en qué zona está su terreno y qué retiros aplican. El permiso después se tramita con Inspection Services.",
            "Opelika: si un retiro no deja hacer una ampliación razonable porque el terreno es angosto, poco profundo o de forma rara, la Junta de Ajuste de Zonificación (Board of Zoning Adjustment) revisa las solicitudes de variación. Se reúne el segundo martes de cada mes y la solicitud se entrega al Departamento de Planeación tres martes antes.",
            "Zonas históricas: los cambios exteriores en North College (Auburn) y en Northside, el centro y Geneva Street (Opelika) necesitan un Certificado de Conformidad.",
            "HOA: casi todos los fraccionamientos de Auburn y Opelika piden que su comité apruebe la ampliación, el techo, la fachada y los colores. Eso es aparte del permiso de la ciudad.",
            "Fuera de la ciudad: hay más espacio, pero la fosa séptica, un pozo o una pendiente fuerte pueden limitar dónde construir.",
          ],
        },
        {
          h: "Cuánto tarda una ampliación",
          table: {
            head: ["Etapa", "Tiempo típico", "Qué pasa"],
            rows: [
              ["Revisión y presupuesto", "1–2 semanas", "Visita, retiros y precio de referencia antes de pagar planos"],
              ["Diseño y planos", "Varias semanas", "Diseñador o arquitecto, ingeniero si hace falta, trámite con la HOA"],
              ["Permisos", "De días a unas semanas", "En Opelika la revisión suele tardar 3–4 días hábiles con todo completo; en Auburn depende de la carga"],
              ["Construcción", "6–16 semanas en obra", "Cimentación, estructura, techo, instalaciones, inspecciones y acabados"],
            ],
          },
          p: ["Mudarse también lleva tiempo: preparar y vender la casa, la inspección y el crédito del comprador, el cierre y la mudanza. La diferencia es que el calendario de una ampliación depende más de usted."],
        },
        {
          h: "Vivir en la casa mientras se construye",
          p: [
            "Casi toda la ampliación se construye por fuera. Lo pesado es la unión, cuando abrimos la pared entre lo viejo y lo nuevo, y los acabados que siguen. Lo planeamos para que siga teniendo cocina y baño, ponemos plásticos contra el polvo y le avisamos con tiempo los días sin agua o sin luz. Si la ampliación se conecta por la cocina, a veces conviene remodelarla al mismo tiempo; en nuestra [guía de precios de cocinas](guide:kitchen-cost) están esos números.",
          ],
        },
        {
          h: "Cuándo conviene más mudarse",
          list: [
            "Necesita otra zona escolar u otra ciudad, no solo más espacio.",
            "Necesita dos o tres cuartos, una cocina más grande y cochera: eso ya es rehacer la casa.",
            "Los retiros, la HOA o la fosa séptica no dejan dónde construir.",
            "La casa tiene otros gastos grandes por delante: techo, cimientos, clima.",
            "Su casa quedaría muy por encima de las demás de la calle. Una ampliación es para vivirla, no para recuperar todo al vender.",
          ],
        },
        {
          h: "Una tabla sencilla para decidir",
          table: {
            head: ["Si esto es cierto", "Conviene más"],
            rows: [
              ["Le gustan el vecindario, las escuelas y la distancia al trabajo", "Ampliar"],
              ["Su tasa de hipoteca está muy por debajo de la de hoy", "Ampliar"],
              ["Necesita un dormitorio, una suite o un cuarto extra", "Ampliar"],
              ["Los papás se vienen a vivir y necesitan una suite en planta baja", "Ampliar"],
              ["Hay espacio dentro de los retiros y la HOA lo permite", "Ampliar"],
              ["Necesita otra ubicación u otra zona escolar", "Mudarse"],
              ["Necesita varios cuartos y una cocina más grande", "Mudarse"],
              ["El terreno o la HOA no permiten una ampliación razonable", "Mudarse"],
              ["Piensa vender en dos o tres años", "Mudarse, o un proyecto más chico"],
            ],
          },
          p: ["Antes de decidir, compare un precio de referencia de la ampliación con lo que realmente le quedaría al vender. Nosotros le damos un rango en la primera visita a su casa, antes de que pague planos, y en nuestra página de [ampliaciones de casas](service:additions) explicamos cómo llevamos todo el proyecto, en español si usted prefiere."],
        },
      ],
      faq: [
        { q: "¿Qué sale más barato, ampliar o comprar una casa más grande?", a: `Si necesita uno o dos cuartos, casi siempre ampliar. Un dormitorio nuevo cuesta ${mid("addition", 1)}, y ese dinero se queda en su casa como espacio terminado; las comisiones y los gastos de cierre de una mudanza no. Si necesita mucho más espacio u otra zona, mudarse puede salir mejor.` },
        { q: "¿Cuánto cuesta una ampliación de 400 pies cuadrados en Auburn u Opelika?", a: `Una suite principal o para la familia de unos 400–500 pies² con baño completo cuesta normalmente ${mid("addition", 2)} con acabados de gama media en 2026. Sin baño, un cuarto extra queda más cerca de ${mid("addition", 1)}.` },
        { q: "¿Necesito permiso para ampliar mi casa?", a: "Sí, siempre: de la ciudad de Auburn, de la ciudad de Opelika o del condado de Lee, según la dirección, y en la mayoría de los fraccionamientos también la aprobación de la HOA. Vea nuestra [guía de permisos](guide:permits)." },
        { q: "¿Qué tan cerca de la línea del terreno puedo construir?", a: "Depende de la zona de su terreno y de las reglas del fraccionamiento o la HOA. Planeación de la ciudad le confirma los retiros, y nosotros los revisamos en la primera visita." },
        { q: "¿Podemos seguir viviendo en la casa durante la obra?", a: "Casi siempre sí. Planeamos la obra para que siga teniendo cocina y baño." },
        { q: "¿Una ampliación le sube el valor a la casa?", a: "Le suma espacio y casi siempre valor, pero al vender rara vez se recupera todo. Conviene si piensa quedarse años y la casa sigue en línea con el vecindario." },
      ],
    },
  },
};
