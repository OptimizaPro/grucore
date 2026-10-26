import { costTable, mid, type Guide } from "../guide-kit";

const D = "2026-09-29";

export const guide: Guide = {
  id: "flooring-humidity",
  slug: { en: "lvp-vs-laminate-vs-tile-alabama-humidity", es: "piso-vinilico-laminado-o-porcelanato-humedad-alabama" },
  photo: "floor2", published: D, updated: D, service: "flooring", estimator: "flooring",
  related: ["rental-turnover", "builder-grade-upgrades", "student-condo"],
  sources: [
    { name: "Shaw Floors: Resilient Installation Guidelines for SPC Products", url: "https://qmsview.shawinc.com/Shaw-Residential/Shaw-Residential-Installation/Resilient-Installation/Resilient-Installation-Guidelines-for-SPC-Products" },
    { name: "Shaw Floors: Laminate Flooring Installation", url: "https://shawfloors.com/en-us/plan-and-install/laminate" },
    { name: "Shaw Floors: Installation Guidelines for Residential Resilient Direct Glue", url: "https://images.thdstatic.com/catalog/pdfImages/f2/f2852063-f9c2-4f22-93e9-c2b5c3c07eeb.pdf" },
    { name: "Tile Council of North America: Porcelain Tile Certification", url: "https://tcnatile.com/resource-center/porcelain-tile-certification/" },
  ],
  t: {
    en: {
      title: "LVP vs Laminate vs Tile in Alabama Humidity (2026)", eyebrow: "Decision guide · 2026",
      description: "LVP, laminate or porcelain tile for a humid Alabama home? How each handles spills, slabs and crawlspaces, what it costs in Auburn, AL, and our picks by room.",
      h1: "LVP vs laminate vs tile: which floor holds up to Alabama humidity?",
      lede: "How each floor handles spills, muggy summers, slabs and crawlspaces in Lee County homes, what it costs in 2026, and which one we'd put in each room.",
      answer: `For most Lee County homes, waterproof-core LVP is the best all-round floor for humidity, spills, pets and rentals; installed with old floor removal it typically runs ${mid("flooring", 1)} for about 1,000 sq ft of main living area in Auburn. Porcelain tile handles water best and is worth it in bathrooms and laundry rooms. Laminate looks and feels great in dry living areas but is water-resistant, not waterproof.`,
      sections: [
        { h: "The short version", table: { head: ["", "LVP (rigid core)", "Laminate", "Porcelain tile"], rows: [
          ["Spills and splashes", "Planks are waterproof", "Water-resistant surface; core is wood fiber", "Waterproof tile; grout needs care"],
          ["Humid summers", "Very stable in a conditioned house", "Needs steady indoor humidity", "Not affected"],
          ["Standing water or leaks", "Planks survive; subfloor may not", "Swelling likely at seams and edges", "Survives; can be dried out"],
          ["Feel underfoot", "Warmer, quieter, slight give", "Firm, closest to wood", "Hard and cool"],
          ["Best rooms", "Living areas, kitchens, bedrooms, rentals", "Dry living areas and bedrooms", "Baths, laundry, entries"],
        ] } },
        { h: "What waterproof really means", p: [
          "Waterproof describes the plank, not the floor system. Shaw's installation guidelines for its rigid-core (SPC) vinyl call the planks waterproof, and in the same breath warn that excessive moisture in the subfloor can still promote mold and mildew. Water that runs to the edges or comes up from below goes under the floor, where no plank can stop it. That's why, in bathrooms, Shaw calls for the perimeter to be caulked with flexible silicone.",
          "Laminate is a photo layer over a wood-fiber core. Newer lines have much better edge coatings, and Shaw now markets some laminate as waterproof, but its own instructions note that liquid can run off the edges into the expansion gap, which it recommends filling with foam backer rod and silicone in wet areas. A wiped-up spill is fine. A slow leak under a dishwasher is a different story.",
          "Porcelain is the only one of the three where the material itself shrugs off water. The Tile Council of North America defines porcelain as tile with water absorption of 0.5% or less, and a certification mark exists because some tile sold as porcelain isn't.",
        ] },
        { h: "Slabs and crawlspaces: test before you buy", p: [
          "Lee County has plenty of both foundations. Many subdivision homes sit on a slab; a lot of older ranches and farmhouses sit over a crawlspace. Each brings moisture from a different direction, and the floor manufacturer's warranty assumes you checked.",
        ], list: [
          "On a slab, we test moisture before a floating floor goes down. Shaw's SPC guidelines list limits of 90% internal relative humidity or 8 lbs by the calcium chloride test, and call for a 6-mil poly film with taped seams over concrete for floating installs.",
          "Over a crawlspace, the same guidelines require 6-mil black polyethylene covering 100% of the ground, at least 18 inches of clearance and perimeter venting. We look under the house before we quote; wet dirt, sagging insulation or a soft subfloor get fixed first.",
          "Old sheet vinyl and black adhesive in 1970s and 1980s homes may contain asbestos. Shaw's resilient installation guidelines warn not to sand, scrape or grind them dry. We test or cover over them rather than making dust.",
        ] },
        { h: "Acclimation, gaps and summer air", list: [
          "Rigid-core LVP: Shaw says acclimation isn't required if the house is climate-controlled between 55°F and 85°F. Leave the AC running.",
          "Laminate: Shaw asks for the HVAC to run for 7 days before, during and after installation, with indoor humidity between 35% and 65%. A vacant house with the AC off in July is not that.",
          "Expansion gaps: floating floors move. Shaw specifies a 1/4-inch gap for rigid-core vinyl in areas under 2,500 sq ft and 1/2 inch for laminate, hidden by baseboard or quarter round.",
          "Heavy fixed objects: cabinets and islands shouldn't sit on a floating floor. Shaw requires that area to be fully glued down; we usually install the floor up to the cabinets instead.",
        ] },
        { h: "What it costs in Auburn in 2026", p: [
          `These are our installed LVP ranges, labor and materials, including removal of the old floor. Most main-level projects land around ${mid("flooring", 1)} at mid-range finishes; you can size your own project with the [flooring cost estimator](page:estimator).`,
          "Laminate installs much like LVP, so the labor is similar and the total usually lands close to these ranges. Porcelain tile costs more per square foot because of the setting, grout and more careful subfloor prep, which is why we suggest tile where water is a daily fact and LVP elsewhere.",
        ], table: costTable("flooring", "en") },
        { h: "Pets, kids, rentals and how long each lasts", list: [
          "LVP handles pet accidents, water bowls and kids. Its lifespan depends mostly on the wear layer, so a thicker wear layer is money well spent in busy homes.",
          "Laminate generally has a hard, scratch-resistant surface, which is good for dog claws, but a pet accident left overnight at a seam is its weak spot.",
          "Tile lasts as long as the substrate under it stays solid. Cracked tiles usually point to a flexing floor, not bad tile.",
          "For Auburn rentals, LVP is the default. It survives move-outs, repairs one plank at a time, and a few spare boxes make patching easy. Our [rental turnover service](service:rental) standardizes one LVP line across units, and the [rental turnover checklist](guide:rental-turnover) covers the rest.",
          "Comfort: LVP with an attached pad is the quietest and warmest underfoot; laminate sounds a little hollower; tile is cool, which many people welcome in August.",
        ] },
        { h: "When tile is worth it, and how the rooms meet", p: [
          "Tile earns its cost where water sits: full bathrooms, laundry rooms (a washer hose can fail while you're at work), and mudroom entries. In a hall bath the floor area is small, so the price difference against LVP is modest.",
          "Where two floors meet, plan the transition. Tile set in mortar usually sits higher than a floating floor, so we pick the reducer or T-molding before ordering. Shaw says moldings and transition strips must not be fastened to the planks themselves, and door jambs get undercut so the floor slides beneath them. New floors are also the right moment to replace tired baseboards, rather than nailing quarter round onto old ones.",
        ] },
        { h: "Our picks by room", table: { head: ["Room", "Our usual pick", "Why"], rows: [
          ["Living room, halls, bedrooms", "LVP or laminate", "Comfortable, affordable, one continuous floor"],
          ["Kitchen", "LVP", "Handles spills and dropped dishes; warmer than tile"],
          ["Full bathroom", "Porcelain tile", "Water on the floor daily; small area keeps cost down"],
          ["Half bath", "LVP or tile", "Little water; LVP can run through from the hall"],
          ["Laundry room", "Porcelain tile", "Hose failures and floods"],
          ["Rental units", "LVP", "Durable, quick to repair, same spec every turn"],
        ] } },
      ],
      faq: [
        { q: "Is LVP or laminate better for a humid climate like Alabama?", a: "For most homes, rigid-core LVP. It's unaffected by humidity in a conditioned house and the planks are waterproof. Laminate is a good choice in dry living areas if the AC runs steadily." },
        { q: "Can you put laminate in a bathroom?", a: "Some newer laminates are rated for it with sealed edges, but in a full bath with a tub or shower we recommend porcelain tile or LVP. Water that reaches the edges is laminate's weak point." },
        { q: "Do I need a moisture barrier under LVP on a concrete slab?", a: "Usually, yes. Manufacturers typically call for a moisture test and a 6-mil poly film with taped seams over concrete. We test before installing." },
        { q: "How much does LVP cost to install in Auburn, AL?", a: `Including old floor removal, about ${mid("flooring", 0)} for one or two rooms, ${mid("flooring", 1)} for main living areas and ${mid("flooring", 2)} for a whole ~2,000 sq ft home, at mid-range finishes.` },
        { q: "Is tile worth it over LVP?", a: "In full baths and laundry rooms, yes. In living areas and bedrooms, LVP gives you most of the durability at lower cost and is more comfortable underfoot." },
        { q: "What's the best flooring for a rental near Auburn University?", a: "LVP with a thick wear layer. It survives turnovers, repairs plank by plank and keeps each summer's make-ready fast. Our [flooring installation](service:flooring) page covers the lines we install." },
      ],
    },
    es: {
      title: "Piso vinílico, laminado o porcelanato en Auburn, AL", eyebrow: "Guía para decidir · 2026",
      description: "¿Piso vinílico (LVP), laminado o porcelanato para la humedad de Alabama? Cómo aguanta cada uno, cuánto cuesta en Auburn, AL y cuál conviene en cada cuarto.",
      h1: "LVP, laminado o porcelanato: ¿cuál aguanta la humedad de Alabama?",
      lede: "Cómo resiste cada piso los derrames, los veranos húmedos, las losas y los espacios bajo la casa en el condado de Lee, cuánto cuesta en 2026 y cuál pondríamos en cada cuarto.",
      answer: `Para la mayoría de las casas del condado de Lee, el piso vinílico (LVP) de núcleo rígido es el que mejor aguanta la humedad, los derrames, las mascotas y las rentas; instalado, quitando el piso viejo, cuesta normalmente ${mid("flooring", 1)} por unos 1,000 pies cuadrados de áreas principales en Auburn. El porcelanato es el que mejor resiste el agua y vale la pena en baños y cuartos de lavado. El laminado se ve y se siente muy bien en áreas secas, pero resiste el agua, no es a prueba de agua.`,
      sections: [
        { h: "En resumen", table: { head: ["", "LVP (núcleo rígido)", "Laminado", "Porcelanato"], rows: [
          ["Derrames y salpicaduras", "Las tablas no se dañan con agua", "La superficie resiste; el núcleo es fibra de madera", "No le pasa nada; la boquilla necesita cuidado"],
          ["Veranos húmedos", "Muy estable con el aire prendido", "Necesita humedad estable adentro", "No le afecta"],
          ["Agua estancada o fugas", "Las tablas aguantan; el subpiso quizá no", "Se hincha en uniones y orillas", "Aguanta; se puede secar"],
          ["Cómo se siente", "Más tibio, silencioso, un poco suave", "Firme, parecido a la madera", "Duro y fresco"],
          ["Dónde conviene", "Sala, cocina, recámaras, rentas", "Sala y recámaras secas", "Baños, lavado, entradas"],
        ] } },
        { h: "Qué quiere decir \"a prueba de agua\"", p: [
          "\"A prueba de agua\" habla de la tabla, no de todo el piso. Las guías de instalación de Shaw para su vinílico de núcleo rígido (SPC) dicen que las tablas son a prueba de agua, y en la misma línea advierten que la humedad de más en el subpiso puede causar moho. El agua que se va a las orillas o que sube desde abajo pasa por debajo del piso, y ahí ninguna tabla la detiene. Por eso, en los baños, Shaw pide sellar todo el perímetro con silicón flexible.",
          "El laminado es una capa con la imagen de madera sobre un núcleo de fibra de madera. Las líneas nuevas traen orillas mucho mejor protegidas, y Shaw ya vende algunos laminados como a prueba de agua, pero sus propias instrucciones dicen que el líquido puede escurrirse por las orillas hacia el espacio de dilatación, y en zonas mojadas recomiendan llenarlo con cordón de espuma y silicón. Un derrame que se limpia luego no es problema. Una fuga lenta debajo de la lavadora de platos es otra historia.",
          "El porcelanato es el único de los tres donde el material mismo no absorbe agua. El Tile Council of North America define el porcelanato como azulejo que absorbe 0.5% de agua o menos, y existe un sello de certificación porque hay azulejo que se vende como porcelanato sin serlo.",
        ] },
        { h: "Losa o espacio bajo la casa: primero se mide", p: [
          "En el condado de Lee hay mucho de los dos. Muchas casas de fraccionamiento están sobre losa de concreto; muchas casas de rancho y de campo más viejas tienen un espacio bajo la casa (crawlspace). La humedad llega por lados distintos, y la garantía del fabricante da por hecho que se revisó.",
        ], list: [
          "Sobre losa, medimos la humedad antes de poner un piso flotante. Las guías SPC de Shaw ponen como límite 90% de humedad relativa interna u 8 libras en la prueba de cloruro de calcio, y piden un plástico de 6 milésimas con las uniones encintadas sobre el concreto cuando el piso es flotante.",
          "Sobre un espacio bajo la casa, las mismas guías piden plástico negro de 6 milésimas cubriendo el 100% de la tierra, por lo menos 18 pulgadas de altura libre y ventilación alrededor. Revisamos debajo de la casa antes de cotizar; tierra mojada, aislante caído o subpiso blando se arreglan primero.",
          "El linóleo viejo y el pegamento negro de casas de los años 70 y 80 pueden tener asbesto. Las guías de instalación de Shaw advierten no lijarlos, rasparlos en seco ni molerlos. Los analizamos o los cubrimos, en lugar de levantar polvo.",
        ] },
        { h: "Aclimatar, dejar espacio y el aire del verano", list: [
          "LVP de núcleo rígido: Shaw dice que no hace falta aclimatarlo si la casa se mantiene entre 55°F y 85°F.",
          "Laminado: Shaw pide que el aire funcione 7 días antes, durante y después de instalar, con humedad adentro entre 35% y 65%. Una casa vacía con el aire apagado en julio no cumple.",
          "Espacio de dilatación: los pisos flotantes se mueven. Shaw pide 1/4 de pulgada alrededor para el vinílico rígido en áreas de menos de 2,500 pies cuadrados y 1/2 pulgada para el laminado, tapado por el zoclo o el cuarto bocel.",
          "Muebles fijos pesados: los gabinetes y las islas no deben ir encima de un piso flotante. Shaw exige pegar esa zona completa; nosotros normalmente llegamos con el piso hasta los gabinetes.",
        ] },
        { h: "Cuánto cuesta en Auburn en 2026", p: [
          `Estos son nuestros rangos de LVP instalado, con mano de obra y materiales, quitando el piso viejo. La mayoría de las obras en la planta principal quedan alrededor de ${mid("flooring", 1)} con acabados intermedios; puede calcular su caso con nuestra [calculadora de costos](page:estimator).`,
          "El laminado se instala casi igual que el LVP, así que la mano de obra es parecida y el total suele quedar cerca de estos rangos. El porcelanato cuesta más por pie cuadrado por el mortero, la boquilla y la preparación más cuidadosa del subpiso. Por eso recomendamos azulejo donde el agua es de todos los días y LVP en lo demás.",
        ], table: costTable("flooring", "es") },
        { h: "Mascotas, niños, rentas y cuánto dura cada uno", list: [
          "El LVP aguanta accidentes de mascotas, el plato del agua y a los niños. Lo que más define cuánto dura es la capa de desgaste; en una casa con mucho movimiento, una capa más gruesa es dinero bien gastado.",
          "El laminado normalmente tiene una superficie dura que resiste rayones, buena para las uñas del perro, pero un accidente que se queda toda la noche en una unión es su punto débil.",
          "El porcelanato dura mientras lo que tiene debajo se mantenga firme. Un azulejo que se raja casi siempre indica un piso que se mueve, no un azulejo malo.",
          "Para las casas de renta en Auburn, el LVP es lo normal. Aguanta las mudanzas, se repara tabla por tabla y con unas cajas de repuesto los arreglos son fáciles. En nuestro servicio de [casas de renta](service:rental) usamos una misma línea de LVP en todas sus casas, y la [guía para preparar una casa de renta](guide:rental-turnover) cubre lo demás.",
          "Comodidad: el LVP con bajopiso integrado es el más silencioso y tibio; el laminado suena un poco más hueco; el azulejo es fresco, y eso en agosto se agradece.",
        ] },
        { h: "Cuándo vale la pena el azulejo y cómo se unen los pisos", p: [
          "El azulejo se paga solo donde el agua se queda: baños completos, cuartos de lavado (una manguera de la lavadora puede reventar mientras usted está en el trabajo) y entradas. En un baño el área es chica, así que la diferencia de precio contra el LVP no es mucha.",
          "Donde se juntan dos pisos, hay que planear la transición. El azulejo sobre mortero casi siempre queda más alto que un piso flotante, así que escogemos la moldura de transición antes de pedir el material. Shaw indica que las molduras y transiciones no se clavan a las tablas, y los marcos de las puertas se recortan por abajo para que el piso pase. Cambiar el piso también es el momento de poner zoclos nuevos, en lugar de clavar cuarto bocel sobre los viejos.",
        ] },
        { h: "Lo que recomendamos en cada cuarto", table: { head: ["Cuarto", "Lo que normalmente ponemos", "Por qué"], rows: [
          ["Sala, pasillos, recámaras", "LVP o laminado", "Cómodo, económico, un solo piso corrido"],
          ["Cocina", "LVP", "Aguanta derrames y platos que se caen; más tibio que el azulejo"],
          ["Baño completo", "Porcelanato", "Agua en el piso todos los días; el área chica baja el costo"],
          ["Medio baño", "LVP o porcelanato", "Poca agua; el LVP puede seguir desde el pasillo"],
          ["Cuarto de lavado", "Porcelanato", "Mangueras que fallan e inundaciones"],
          ["Casas de renta", "LVP", "Resistente, fácil de reparar, el mismo material en cada cambio"],
        ] } },
      ],
      faq: [
        { q: "¿Qué es mejor para la humedad de Alabama, el LVP o el laminado?", a: "Para la mayoría de las casas, el LVP de núcleo rígido. Con el aire prendido la humedad no le afecta y las tablas son a prueba de agua. El laminado es buena opción en áreas secas si el aire funciona parejo." },
        { q: "¿Se puede poner laminado en el baño?", a: "Algunos laminados nuevos lo permiten con las orillas selladas, pero en un baño completo con tina o regadera recomendamos porcelanato o LVP. El agua que llega a las orillas es el punto débil del laminado." },
        { q: "¿Necesito plástico contra la humedad debajo del LVP si la casa está sobre losa?", a: "Normalmente sí. Los fabricantes piden medir la humedad y poner un plástico de 6 milésimas con las uniones encintadas sobre el concreto. Nosotros medimos antes de instalar." },
        { q: "¿Cuánto cuesta instalar piso vinílico en Auburn?", a: `Quitando el piso viejo, más o menos ${mid("flooring", 0)} en uno o dos cuartos, ${mid("flooring", 1)} en las áreas principales y ${mid("flooring", 2)} en una casa completa de ~2,000 pies cuadrados, con acabados intermedios.` },
        { q: "¿Vale la pena el porcelanato en lugar del LVP?", a: "En baños completos y cuartos de lavado, sí. En la sala y las recámaras, el LVP le da casi la misma resistencia por menos dinero y es más cómodo para caminar." },
        { q: "¿Me pueden cotizar el piso en español?", a: "Sí. Revisamos el subpiso con usted, le damos la cotización por escrito y se la explicamos en español. Vea nuestro servicio de [instalación de pisos](service:flooring)." },
      ],
    },
  },
};
