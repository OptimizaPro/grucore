import { estimate, mid, money, type Guide } from "../guide-kit";

const D = "2026-09-29";

/* All five projects together, low end to high end, from the estimator table. */
const bundle = () => {
  const parts = [estimate("interior", 1, "mid"), estimate("cabinets", 1, "mid"), estimate("flooring", 1, "mid"), estimate("bath", 0, "mid")];
  return `${money(parts.reduce((s, r) => s + r.lo, 0))}–${money(parts.reduce((s, r) => s + r.hi, 0))}`;
};

export const guide: Guide = {
  id: "builder-grade-upgrades",
  slug: { en: "builder-grade-home-upgrades-auburn-al", es: "mejoras-casa-de-constructor-auburn-al" },
  photo: "kitchen3",
  published: D,
  updated: D,
  service: "remodeling",
  estimator: "interior",
  related: ["cabinets-paint-vs-replace", "painting-cost", "bathroom-cost"],
  sources: [
    { name: "National Association of Realtors — 2025 Remodeling Impact Report release", url: "https://www.nar.realtor/newsroom/top-remodeling-projects-for-homeowner-satisfaction-and-cost-recovery-revealed-in-nar-report" },
    { name: "ENERGY STAR — Qualified Residential Light Fixtures at a Glance", url: "https://www.energystar.gov/sites/default/files/asset/document/Light_Fixtures_At-A-Glance.pdf" },
  ],
  t: {
    en: {
      title: "Builder-Grade Home Upgrades in Auburn, AL: First 5 Projects",
      eyebrow: "Planning guide · 2026",
      description: "Upgrading a 1990s–2010s builder-grade home in Auburn, AL: the five projects with the most impact per dollar, 2026 costs, timelines and the right order.",
      h1: "Upgrading a builder-grade home in Auburn: the first 5 projects",
      lede: "For the subdivision homes built across Auburn and Opelika from the 1990s through the 2010s: what to change first, what it costs in 2026, and the order that keeps you from paying twice.",
      answer: `For most builder-grade homes in Auburn, the five upgrades with the most impact per dollar are, in order: whole-interior paint in a modern neutral (${mid("interior", 1)} for ~2,000 sq ft), painted cabinets with new hardware (${mid("cabinets", 1)}), LVP replacing carpet in the main living areas (${mid("flooring", 1)}), new lighting and fixtures, and a hall-bath refresh (${mid("bath", 0)}). Do the dusty and messy work first, paint walls before the new floor goes down, and paint the trim last.`,
      sections: [
        {
          h: "What 'builder-grade' usually means here",
          p: [
            "Walk into most houses built in Auburn subdivisions off Moores Mill or Richland Road, or in newer Opelika neighborhoods, between the mid-1990s and the 2010s, and you find the same package: one beige flat paint everywhere, oak or thermofoil cabinets, laminate counters, wall-to-wall carpet in the living room, dome ceiling lights, brass or brushed-nickel fixtures, and a cultured-marble vanity top. None of it is bad. It was chosen to be cheap and inoffensive, and after 10 to 30 years it is simply tired.",
            "The good news: these homes usually have sound framing, reasonable layouts and cabinet boxes worth keeping. That makes them ideal for finish upgrades instead of a gut remodel.",
          ],
        },
        {
          h: "The five projects, ranked by impact per dollar",
          table: {
            head: ["Rank", "Project", "Typical Auburn cost (2026)", "Time on site"],
            rows: [
              ["1", "Whole-interior paint, modern neutral (~2,000 sq ft)", mid("interior", 1), "4–7 days"],
              ["2", "Cabinet painting + new hardware (average kitchen)", mid("cabinets", 1), "5–7 days"],
              ["3", "LVP replacing carpet, main living areas (~1,000 sq ft)", mid("flooring", 1), "2–4 days"],
              ["4", "Lighting and plumbing fixtures", "Priced per fixture on your estimate", "1–3 days"],
              ["5", "Hall bath refresh (vanity, toilet, fixtures, paint, floor)", mid("bath", 0), "1–2 weeks"],
            ],
          },
          p: [
            `All four priced projects together typically total about ${bundle()} at mid-range finishes, before lighting. Try your own combination in our [cost estimator](page:estimator).`,
          ],
        },
        {
          h: "1. Paint the whole interior",
          p: [
            "Paint touches every room for the lowest cost per square foot of any project on this list. Replace the builder beige with a warm white or soft greige on walls, one white on all trim and doors, and flat white ceilings. Switch from flat wall paint to a washable matte or eggshell. In the National Association of Realtors' 2025 Remodeling Impact Report, painting the entire home was the project agents most often recommended sellers complete before listing (50%). See our [painting cost guide](guide:painting-cost) for what a complete quote should include.",
          ],
        },
        {
          h: "2. Paint the cabinets and change the hardware",
          p: [
            "Builder oak cabinets are usually solid boxes with dated doors, which is exactly the case where painting beats replacing. Degreased, primed with a bonding primer and sprayed in a hard enamel, then fitted with new pulls and soft-close hinges, the kitchen looks new for a fraction of new cabinets. If the doors are peeling thermofoil or the sink base is water-damaged, read our guide on [painting versus replacing cabinets](guide:cabinets-paint-vs-replace) first.",
          ],
        },
        {
          h: "3. Replace the carpet with LVP",
          p: [
            "Luxury vinyl plank in the living room, dining room and hallways removes the most worn surface in the house and handles pets, kids and Alabama humidity. Run one floor through the main living areas for a larger, calmer look. Carpet can stay in bedrooms for now. Buy a few extra boxes and store them for future repairs.",
          ],
        },
        {
          h: "4. Update lighting and fixtures",
          p: [
            "Swapping dome lights, dated vanity bars and a builder chandelier is quick and changes every room at night. Pick one finish family (matte black, brushed brass or nickel) for lights, faucets, cabinet pulls and door hardware so the house reads as one plan. Choose LED fixtures in the same color temperature throughout; ENERGY STAR says qualified residential LED lighting uses at least 75% less energy and lasts about 25 times longer than incandescent. Like-for-like fixture swaps generally don't need a permit, but new circuits or added recessed lights do; our [permit guide](guide:permits) covers the details.",
          ],
        },
        {
          h: "5. Refresh the hall bath",
          p: [
            "Keep the tub and plumbing where they are, and replace the vanity and top, toilet, faucet, mirror, light and floor, then paint. That is the refresh tier, well below a full tear-out. If the tub itself is the problem, that is a bigger project with its own budget.",
          ],
        },
        {
          h: "The right order, and why",
          p: [
            "The rule is top to bottom, dirty to clean, and protect the most expensive finish from the trades that come after it.",
          ],
          list: [
            "Plan everything first and order materials: LVP, hardware, fixtures and vanity should be on site before work starts.",
            "Messy work: any electrical changes that cut drywall (new recessed lights, moved boxes), bath demolition and plumbing.",
            "Drywall repairs and patching.",
            "Cabinets: sprayed while the kitchen is masked, before walls, so the wall paint line against the cabinets is the final one.",
            "Ceilings and walls: painted before the new floor. Drips, ladders and drop cloths land on carpet that is about to be thrown away, not on new LVP.",
            "Flooring: carpet out, LVP in, then baseboards reset or shoe molding added to cover the expansion gap.",
            "Trim last: caulk and paint baseboards, shoe and doors after the floor is in, then install fixtures and hardware and do a final clean.",
          ],
        },
        {
          h: "HOA note for exterior changes",
          p: [
            "Everything above is interior and needs no HOA approval. The moment you change the outside, such as body or trim color, front door, shutters, garage door or light fixtures on the facade, most Auburn and Opelika subdivisions require architectural review first. We prepare color chips and specs for the submittal, and schedule exterior work after approval, not before. See how we run a whole-house project on our [remodeling page](service:remodeling).",
          ],
        },
      ],
      faq: [
        { q: "What should I upgrade first in a builder-grade home?", a: `Interior paint, because it changes every room for the least money: about ${mid("interior", 1)} for a whole ~2,000 sq ft interior in Auburn in 2026. Then cabinets and flooring.` },
        { q: "Should I paint before or after installing new floors?", a: "Paint ceilings and walls before the new floor, so drips and ladders hit the old carpet. Install the floor, then caulk and paint the baseboards and trim last." },
        { q: "Is it worth replacing carpet with LVP in Auburn?", a: `In living areas, usually yes. About 1,000 sq ft of main living space typically runs ${mid("flooring", 1)} with the old floor removed.` },
        { q: "How much does it cost to update a builder-grade home?", a: `Paint, cabinets, main-floor LVP and a hall-bath refresh together typically total about ${bundle()} at mid-range finishes, plus lighting.` },
        { q: "Can I live in the house during these upgrades?", a: "Yes, for most of it. Expect a few days of limited kitchen use during cabinet work, and plan to clear the main rooms during flooring." },
        { q: "Do I need HOA approval to upgrade my house?", a: "Not for interior work. For exterior paint colors, doors, shutters and other visible changes, most subdivisions require architectural review first." },
      ],
    },
    es: {
      title: "Mejorar una casa de constructor en Auburn: 5 proyectos",
      eyebrow: "Guía para planear · 2026",
      description: "Cómo mejorar una casa de fraccionamiento de los 90 a los 2010 en Auburn, AL: los 5 proyectos que más rinden, costos 2026, tiempos y en qué orden hacerlos.",
      h1: "Cómo mejorar una casa de constructor en Auburn: los primeros 5 proyectos",
      lede: "Para las casas de fraccionamiento construidas en Auburn y Opelika entre los años 90 y los 2010: qué cambiar primero, cuánto cuesta en 2026 y en qué orden hacerlo para no pagar dos veces.",
      answer: `En la mayoría de las casas de constructor en Auburn, las cinco mejoras que más rinden por cada dólar son, en este orden: pintar todo el interior en un color neutro moderno (${mid("interior", 1)} para unos 2,000 pies²), pintar los gabinetes y cambiar jaladeras (${mid("cabinets", 1)}), cambiar la alfombra por piso LVP en las áreas principales (${mid("flooring", 1)}), lámparas y accesorios nuevos, y renovar el baño (${mid("bath", 0)}). Lo sucio va primero, las paredes se pintan antes del piso nuevo y las molduras al final.`,
      sections: [
        {
          h: "Qué es una casa 'de constructor'",
          p: [
            "En casi todas las casas de fraccionamiento construidas en Auburn (por Moores Mill o Richland Road) o en las colonias más nuevas de Opelika, entre mediados de los 90 y los 2010, se repite lo mismo: un solo color beige mate en toda la casa, gabinetes de roble o de vinil, cubiertas de formica, alfombra en la sala, lámparas de plato en el techo, llaves doradas o de níquel y un lavabo de mármol sintético. No es malo. Se escogió para que fuera barato y le gustara a todos, y después de 10 a 30 años simplemente se ve cansado.",
            "Lo bueno es que estas casas casi siempre tienen buena estructura, una distribución razonable y gabinetes que vale la pena conservar. Por eso conviene mejorar los acabados en lugar de remodelar todo.",
          ],
        },
        {
          h: "Los cinco proyectos, del que más rinde al que menos",
          table: {
            head: ["Lugar", "Proyecto", "Costo típico en Auburn (2026)", "Tiempo de trabajo"],
            rows: [
              ["1", "Pintar todo el interior en un neutro moderno (~2,000 pies²)", mid("interior", 1), "4 a 7 días"],
              ["2", "Pintar gabinetes y cambiar jaladeras (cocina mediana)", mid("cabinets", 1), "5 a 7 días"],
              ["3", "Piso LVP en lugar de alfombra en áreas principales (~1,000 pies²)", mid("flooring", 1), "2 a 4 días"],
              ["4", "Lámparas, llaves y accesorios", "Se cotiza por pieza en su presupuesto", "1 a 3 días"],
              ["5", "Renovar el baño (tocador, inodoro, accesorios, pintura, piso)", mid("bath", 0), "1 a 2 semanas"],
            ],
          },
          p: [
            `Los cuatro proyectos con precio suman normalmente unos ${bundle()} en acabados intermedios, sin contar las lámparas. Haga su propia combinación en nuestro [calculador de costos](page:estimator).`,
          ],
        },
        {
          h: "1. Pintar todo el interior",
          p: [
            "La pintura cambia todos los cuartos por el menor costo por pie cuadrado de toda esta lista. Cambie el beige del constructor por un blanco cálido o un gris cálido en las paredes, un solo blanco en molduras y puertas, y blanco mate en los techos. Use pintura lavable en lugar de la mate de antes. En el reporte 2025 de la Asociación Nacional de Realtors, pintar toda la casa fue el proyecto que más recomendaron los agentes antes de vender (50%). Vea nuestra guía de [cuánto cobra un pintor](guide:painting-cost) para saber qué debe incluir la cotización.",
          ],
        },
        {
          h: "2. Pintar los gabinetes y cambiar las jaladeras",
          p: [
            "Los gabinetes de roble del constructor casi siempre tienen cajas firmes y puertas pasadas de moda, justo el caso en que pintar conviene más que cambiar. Desengrasados, con primario de adherencia y esmalte duro aplicado a pistola, más jaladeras nuevas y bisagras de cierre suave, la cocina se ve nueva por una parte de lo que cuestan gabinetes nuevos. Si las puertas son de vinil que se despega o el mueble del fregadero tiene daño por agua, lea primero nuestra guía sobre [pintar o cambiar los gabinetes](guide:cabinets-paint-vs-replace).",
          ],
        },
        {
          h: "3. Cambiar la alfombra por piso LVP",
          p: [
            "El piso vinílico (LVP) en sala, comedor y pasillos quita la superficie más gastada de la casa y aguanta mascotas, niños y la humedad de Alabama. Use el mismo piso en todas las áreas principales para que la casa se vea más grande y tranquila. Las recámaras pueden quedarse con alfombra por ahora. Compre unas cajas de más y guárdelas para reparaciones.",
          ],
        },
        {
          h: "4. Lámparas, llaves y accesorios",
          p: [
            "Cambiar las lámparas de plato, la barra de luz del baño y el candil del comedor es rápido y cambia toda la casa de noche. Escoja un solo acabado (negro mate, dorado cepillado o níquel) para lámparas, llaves, jaladeras y chapas, para que todo combine. Use luz LED del mismo tono en toda la casa; según ENERGY STAR, la iluminación LED certificada usa por lo menos 75% menos energía y dura unas 25 veces más que un foco incandescente. Cambiar una lámpara por otra normalmente no necesita permiso, pero los circuitos nuevos o las luces empotradas sí; lo explicamos en nuestra [guía de permisos](guide:permits).",
          ],
        },
        {
          h: "5. Renovar el baño",
          p: [
            "Deje la tina y la plomería donde están, y cambie el tocador con su cubierta, el inodoro, la llave, el espejo, la luz y el piso, y luego pinte. Eso es una renovación ligera, muy por debajo de un baño nuevo desde cero. Si el problema es la tina, eso ya es otro proyecto con otro presupuesto.",
          ],
        },
        {
          h: "El orden correcto, y por qué",
          p: [
            "La regla es de arriba hacia abajo, de lo sucio a lo limpio, y proteger el acabado más caro de los trabajos que vienen después.",
          ],
          list: [
            "Planear todo primero y pedir materiales: el piso, las jaladeras, las lámparas y el tocador deben estar en la casa antes de empezar.",
            "Lo sucio: cambios eléctricos que abren la tablaroca (luces empotradas, cajas que se mueven), demolición y plomería del baño.",
            "Resanes y reparación de tablaroca.",
            "Gabinetes: se pintan a pistola con la cocina cubierta, antes que las paredes, para que la línea de pintura contra el gabinete sea la final.",
            "Techos y paredes: se pintan antes del piso nuevo. Las gotas, las escaleras y las lonas caen sobre la alfombra que ya se va a tirar, no sobre el LVP nuevo.",
            "Piso: se quita la alfombra, se pone el LVP y luego se vuelven a poner los zoclos o se agrega un cuarto bocel para tapar la junta de expansión.",
            "Molduras al final: sellar y pintar zoclos y puertas después del piso, luego instalar lámparas y jaladeras y hacer la limpieza final.",
          ],
        },
        {
          h: "Si va a cambiar algo por fuera: la HOA",
          p: [
            "Todo lo anterior es interior y no necesita aprobación de la HOA. Pero si cambia algo por fuera, como el color de la casa o las molduras, la puerta principal, las contraventanas, la puerta de la cochera o las lámparas de la fachada, casi todos los fraccionamientos de Auburn y Opelika piden revisión antes. Preparamos las muestras de color y los datos para el trámite, y programamos el trabajo exterior después de la aprobación. Vea cómo trabajamos una casa completa en nuestra página de [remodelación](service:remodeling), en español de principio a fin.",
          ],
        },
      ],
      faq: [
        { q: "¿Qué conviene mejorar primero en una casa de constructor?", a: `La pintura interior, porque cambia todos los cuartos por menos dinero: unos ${mid("interior", 1)} para todo el interior de una casa de 2,000 pies² en Auburn en 2026. Después, los gabinetes y el piso.` },
        { q: "¿Se pinta antes o después de poner el piso nuevo?", a: "Los techos y las paredes se pintan antes del piso, para que las gotas y las escaleras caigan en la alfombra vieja. Luego se pone el piso, y al final se sellan y pintan los zoclos y las molduras." },
        { q: "¿Vale la pena cambiar la alfombra por LVP en Auburn?", a: `En sala y comedor, casi siempre sí. Unos 1,000 pies² de áreas principales cuestan normalmente ${mid("flooring", 1)}, quitando el piso viejo.` },
        { q: "¿Cuánto cuesta poner al día una casa de constructor?", a: `Pintura, gabinetes, piso LVP en las áreas principales y renovar el baño suman normalmente unos ${bundle()} en acabados intermedios, más las lámparas.` },
        { q: "¿Podemos vivir en la casa durante el trabajo?", a: "Sí, casi todo el tiempo. Cuente con unos días de uso limitado de la cocina mientras se pintan los gabinetes, y con desocupar la sala y el comedor mientras se pone el piso." },
        { q: "¿Necesito permiso de la HOA para mejorar mi casa?", a: "Para el interior, no. Para colores exteriores, puertas, contraventanas y otros cambios que se ven desde la calle, casi todos los fraccionamientos piden revisión antes." },
      ],
    },
  },
};
