import { costTable, mid, type Guide } from "../guide-kit";

const D = "2026-09-29";

export const guide: Guide = {
  id: "exterior-paint-timing",
  slug: { en: "best-time-to-paint-house-exterior-alabama", es: "mejor-epoca-para-pintar-casa-por-fuera-alabama" },
  photo: "houseWhite",
  published: D,
  updated: D,
  service: "painting",
  estimator: "exterior",
  related: ["painting-cost", "hire-contractor", "builder-grade-upgrades"],
  sources: [
    { name: "Sherwin-Williams — Duration Exterior Acrylic Satin, Product Data Sheet (3/2026)", url: "https://paintdocs.com/docs/webPDF.jsp?SITEID=STORECAT&doctype=PDS&lang=E&prodno=650405780" },
    { name: "Benjamin Moore — Aura Waterborne Exterior Low Lustre N634, Technical Data Sheet", url: "https://media.benjaminmoore.com/WebServices/prod/assets/stage/datasheets/TDS_0634/N634_TDS_US.pdf" },
    { name: "Benjamin Moore — Temperature Guide for Exterior Painting", url: "https://www.benjaminmoore.com/en-us/interior-exterior-paints-stains/how-to-advice/exteriors/temperature" },
    { name: "Alabama Office of the State Climatologist — Alabama's Climate", url: "https://www.uah.edu/aosc/alabamas-climate" },
  ],
  t: {
    en: {
      title: "Best Time to Paint a House Exterior in Alabama (2026)",
      eyebrow: "Planning guide · 2026",
      description: "When to paint a house exterior in Auburn and Lee County, AL: temperature and dew point limits from paint data sheets, summer storms, pollen and why fall wins.",
      h1: "When is the best time to paint a house exterior in Alabama?",
      lede: "What the paint manufacturers actually require, how Lee County's weather lines up against it month by month, and how a good crew schedules around storms, dew and pollen.",
      answer: "In Auburn and the rest of Lee County, mid-September through November is the best time to paint a house exterior: October is typically the driest month, humidity drops, and days stay well above the 35°F minimum that premium acrylics like Sherwin-Williams Duration and Benjamin Moore Aura list. Late April through May is the second-best window once pollen settles. Summer works with early starts and shade-chasing; midwinter works only on mild, dry stretches.",
      sections: [
        {
          h: "What the paint data sheets actually require",
          p: [
            "Every can of exterior paint has a technical data sheet, and that sheet, not a rule of thumb, is what decides whether a day is paintable. Here is what two of the premium acrylics we see most often on Lee County homes list:",
          ],
          table: {
            head: ["Requirement", "Sherwin-Williams Duration", "Benjamin Moore Aura (N634)"],
            rows: [
              ["Minimum air and surface temperature", "35°F, and not if it may drop below 35°F within 48 hours", "35°F"],
              ["Dew point", "Surface at least 5°F above dew point", "Benjamin Moore guidance: more than 5°F above dew point"],
              ["Rain", "Avoid if rain is expected within 2–3 hours", "Stop if it rains; resume once the surface is dry"],
              ["Heat and sun", "Do not paint in direct sun; sets up quickly above 80°F", "Maximum surface temperature 100°F"],
              ["Recoat time", "4 hours at 45°F+; 24–48 hours at 35–45°F (50% RH)", "4 hours at 77°F and 50% RH; longer when cool and humid"],
            ],
          },
        },
        {
          h: "Why the dew point matters more than the thermometer",
          p: [
            "The dew point is the temperature at which moisture condenses out of the air. If the siding is colder than that, or within a few degrees, a film of water forms on it, and fresh latex laid over it can lose adhesion, streak or leave soapy-looking surfactant stains. On a fall morning in Auburn the air may be 55°F while the north wall is still wet with dew at 9 a.m. We start on the sides the sun has already dried, and stop early enough in the afternoon that the last coat has a few hours before evening dew returns.",
            "Primers are pickier than topcoats. Sherwin-Williams notes that standard latex primers cannot be used below 50°F, so bare wood and new trim get primed on the warmer days of a cool-weather job.",
          ],
        },
        {
          h: "Lee County's year, month by month",
          table: {
            head: ["Months", "Painting conditions", "Our verdict"],
            rows: [
              ["Mid-Sep – Nov", "Driest stretch of the year, lower humidity, warm days, cool nights", "Best window; book early"],
              ["Late Apr – May", "Warm and pleasant; pollen tapering off", "Very good"],
              ["Jun – Aug", "Hot, humid, afternoon thunderstorms, hot surfaces", "Workable with early starts and shade"],
              ["Mar – mid-Apr", "Heavy pine and oak pollen, spring storms", "Fair; extra washing and timing"],
              ["Dec – Feb", "Mild spells between cold fronts, occasional hard freezes, short days", "Only on dry, mild stretches"],
            ],
          },
          p: [
            "Alabama's State Climatologist describes a humid subtropical climate where summer rain is dominated by frequent thunderstorms and fall rainfall is variable, sometimes driven by tropical systems. In [Auburn](area:auburn), October averages the least rain of any month under current NOAA normals. That combination is why fall calendars fill first.",
          ],
        },
        {
          h: "Summer: heat, humidity and 3 p.m. storms",
          list: [
            "Surface heat: a dark south or west wall in July can be far hotter than the air. Paint applied there dries too fast, shows lap marks and can blister. We follow the shade around the house: west side in the morning, east side in the afternoon.",
            "Humidity: high humidity slows drying and curing. Paint may feel dry and still be soft underneath.",
            "Pop-up storms: summer showers often build after lunch. We watch radar, finish exposed walls early and keep the 2–3 hour rain buffer the data sheet asks for.",
          ],
        },
        {
          h: "Spring: pollen season",
          p: [
            "From roughly March into April, pine and oak pollen coats everything in yellow dust. Paint applied over it bonds to the pollen, not the siding, and wet paint catches whatever blows in. Spring jobs get washed right before painting, and on the worst days we paint trim or porch ceilings under cover instead.",
          ],
        },
        {
          h: "Rain, pressure washing and drying time",
          p: [
            "Siding has to be dry, not just dry-looking. After pressure washing we generally give the house at least a full dry day before paint, and longer on shaded walls, bare wood, or after a soaking rain. Wood that has been wet for days can hold moisture well after the surface feels dry, and paint over trapped moisture is how blisters and peeling start.",
          ],
        },
        {
          h: "Siding types common around Auburn and Opelika",
          list: [
            "Vinyl: it can be painted, but Sherwin-Williams warns against going darker than the original color, or below a light reflectance value of 56, unless you choose from its VinylSafe colors; otherwise the siding can warp in the sun. Clean it well and choose from the vinyl-safe palette.",
            "Fiber cement: takes paint very well. New or bare fiber cement is checked for high alkalinity (pH) and primed with a masonry primer if needed.",
            "Wood and hardboard: common on 1980s–90s homes. Exposed wood is sanded and primed; hardboard gets an oil-based primer where wax could bleed through. Soft or swollen boards are replaced, not painted.",
            "Brick: often only the trim is painted. Painting brick itself is a one-way decision, so we discuss it carefully.",
          ],
        },
        {
          h: "Prep and how long the job takes",
          p: [
            `An average 1,500–2,500 sq ft home takes most crews 3–7 working days once prep starts: washing, scraping, rot repair, caulking, spot priming, then two coats on the body and trim. Rot repair happens first, because new boards need primer before caulk and paint. Budget-wise, the average-home tier runs ${mid("exterior", 1)} in Lee County; see our [house painting cost guide](guide:painting-cost) for the full breakdown, or run your own numbers in the [cost estimator](page:estimator).`,
          ],
          table: costTable("exterior", "en"),
        },
        {
          h: "How we schedule around the weather",
          list: [
            "We check hourly forecasts for temperature, dew point and rain chance each morning, not just the daily high.",
            "Weather days are expected, not a surprise. We tell you up front that a 5-day job can take 7 calendar days in a stormy week.",
            "If a storm catches wet paint, we inspect it once dry and recoat anything marred.",
            "HOA color approval is submitted before the start date so the calendar isn't waiting on a committee. See our [exterior painting service](service:painting) for what's included.",
          ],
        },
      ],
      faq: [
        { q: "What is the best month to paint a house exterior in Alabama?", a: "October is usually the best single month in Lee County: it is typically the driest of the year, with warm days and lower humidity. Late September, November and May are also strong." },
        { q: "What is the lowest temperature you can paint outside?", a: "Premium acrylics like Sherwin-Williams Duration and Benjamin Moore Aura list 35°F minimum for air and surface, and Duration adds that it shouldn't drop below 35°F within 48 hours. Many primers need 50°F, and cool, humid weather stretches recoat times." },
        { q: "Can you paint a house in the summer in Auburn?", a: "Yes, with early starts, following the shade, and quitting walls before afternoon storms. Avoid painting sun-baked walls; Sherwin-Williams says not to paint in direct sun." },
        { q: "How long after rain can you paint siding?", a: "When the surface is fully dry, which usually means a dry day after a soaking rain and longer for shaded walls and bare wood. The data sheet rule is also no rain within 2–3 hours after application." },
        { q: "How long does it take to paint the outside of a house?", a: "Most average-size homes take 3–7 working days, plus any weather days. Heavy rot repair or two-story access adds time." },
        { q: "Can vinyl siding be painted a darker color?", a: "Only with colors formulated for vinyl, such as Sherwin-Williams' VinylSafe line. Standard dark colors can make vinyl warp in the Alabama sun." },
      ],
    },
    es: {
      title: "Mejor época para pintar una casa por fuera en Alabama",
      eyebrow: "Guía para planear · 2026",
      description: "Cuándo pintar su casa por fuera en Auburn y el condado de Lee: temperatura mínima, rocío, tormentas de verano, polen y por qué el otoño es la mejor época.",
      h1: "¿Cuál es la mejor época para pintar una casa por fuera en Alabama?",
      lede: "Lo que piden de verdad los fabricantes de pintura, cómo se compara con el clima del condado de Lee mes por mes y cómo se organiza un buen pintor alrededor de la lluvia, el rocío y el polen.",
      answer: "En Auburn y el condado de Lee, la mejor época para pintar una casa por fuera es de mediados de septiembre a noviembre: octubre suele ser el mes más seco del año, baja la humedad y la temperatura queda muy por encima del mínimo de 35°F que piden pinturas como Duration de Sherwin-Williams y Aura de Benjamin Moore. La segunda mejor época es de finales de abril a mayo, cuando ya bajó el polen. En verano se puede empezando temprano; en invierno, solo en días templados y secos.",
      sections: [
        {
          h: "Lo que dicen las hojas técnicas de la pintura",
          p: [
            "Cada pintura exterior tiene una hoja técnica, y esa hoja es la que dice si un día sirve para pintar, no la costumbre. Esto es lo que piden dos de las pinturas de primera que más usamos en casas de la zona:",
          ],
          table: {
            head: ["Requisito", "Sherwin-Williams Duration", "Benjamin Moore Aura (N634)"],
            rows: [
              ["Temperatura mínima del aire y la superficie", "35°F, y que no baje de 35°F en las siguientes 48 horas", "35°F"],
              ["Punto de rocío", "Superficie por lo menos 5°F arriba del punto de rocío", "Guía de Benjamin Moore: más de 5°F arriba del punto de rocío"],
              ["Lluvia", "No aplicar si se espera lluvia en 2 a 3 horas", "Si llueve, parar; seguir cuando la superficie esté seca"],
              ["Calor y sol", "No pintar al sol directo; arriba de 80°F seca muy rápido", "Superficie máxima de 100°F"],
              ["Tiempo entre manos", "4 horas a 45°F o más; 24 a 48 horas entre 35 y 45°F", "4 horas a 77°F; más si hace frío o hay humedad"],
            ],
          },
        },
        {
          h: "El rocío importa más que el termómetro",
          p: [
            "El punto de rocío es la temperatura en la que la humedad del aire se vuelve agua. Si la pared está más fría que eso, o casi, se forma una capa de agua encima, y la pintura fresca sobre esa capa no pega bien, se chorrea o deja manchas que parecen de jabón. Por eso empezamos por los lados que el sol ya secó y terminamos temprano en la tarde.",
            "Los primarios son más delicados que la pintura de acabado. Sherwin-Williams indica que los primarios de látex comunes no se pueden usar abajo de 50°F, así que la madera sin pintar se prepara en los días más calientes.",
          ],
        },
        {
          h: "El año en el condado de Lee, mes por mes",
          table: {
            head: ["Meses", "Cómo está el clima", "Nuestra opinión"],
            rows: [
              ["Mediados de sep – nov", "La temporada más seca, menos humedad, días templados", "La mejor; aparte su fecha con tiempo"],
              ["Finales de abr – may", "Templado; el polen va bajando", "Muy buena"],
              ["Jun – ago", "Calor, humedad, tormentas en la tarde, paredes muy calientes", "Se puede, empezando temprano y con sombra"],
              ["Mar – mediados de abr", "Mucho polen de pino y encino, tormentas de primavera", "Regular; hay que lavar más y cuidar el horario"],
              ["Dic – feb", "Días templados entre frentes fríos, heladas de vez en cuando", "Solo en días secos y templados"],
            ],
          },
          p: [
            "La oficina del Climatólogo del Estado de Alabama describe un clima húmedo subtropical, donde la lluvia del verano viene sobre todo de tormentas frecuentes y la del otoño varía, a veces por sistemas tropicales. En Auburn, octubre es el mes con menos lluvia según los promedios actuales de NOAA.",
          ],
        },
        {
          h: "Verano: calor, humedad y tormentas de la tarde",
          list: [
            "Paredes calientes: una pared oscura al sur o al poniente en julio puede estar mucho más caliente que el aire. Ahí la pintura seca demasiado rápido, deja marcas y puede hacer ampollas. Seguimos la sombra: el poniente en la mañana y el oriente en la tarde.",
            "Humedad: con mucha humedad la pintura tarda más en secar y puede seguir blanda por dentro.",
            "Tormentas: en verano las lluvias suelen formarse después de comer. Vemos el radar, terminamos temprano las paredes expuestas y respetamos las 2 o 3 horas sin lluvia que pide la hoja técnica.",
          ],
        },
        {
          h: "Primavera: la temporada del polen",
          p: [
            "Más o menos de marzo a abril, el polen de pino y encino deja todo amarillo. La pintura aplicada encima se pega al polen, no a la pared, y la pintura fresca atrapa lo que traiga el viento. En primavera lavamos justo antes de pintar, y en los peores días pintamos molduras o techos de porche bajo techo.",
          ],
        },
        {
          h: "Lluvia, lavado a presión y secado",
          p: [
            "La pared tiene que estar seca de verdad, no nada más verse seca. Después del lavado a presión dejamos por lo menos un día completo de secado antes de pintar, y más en paredes con sombra, madera sin pintar o después de un aguacero. Pintar sobre madera que guarda humedad es como empiezan las ampollas.",
          ],
        },
        {
          h: "Tipos de fachada comunes en Auburn y Opelika",
          list: [
            "Vinil: sí se puede pintar, pero Sherwin-Williams advierte no usar un color más oscuro que el original (o con un valor de reflexión de luz menor a 56) si no es de su línea VinylSafe, porque el vinil se puede torcer con el sol.",
            "Fibrocemento: agarra muy bien la pintura. Si es nuevo o está sin pintar, se revisa la alcalinidad (pH) y se usa primario para mampostería si hace falta.",
            "Madera y madera prensada: comunes en casas de los 80 y 90. La madera expuesta se lija y lleva primario; la madera prensada lleva primario de aceite donde la cera puede traspasar. Las tablas blandas o hinchadas se cambian, no se pintan.",
            "Ladrillo: muchas veces solo se pintan las molduras. Pintar el ladrillo no tiene regreso.",
          ],
        },
        {
          h: "Preparación y cuánto tarda el trabajo",
          p: [
            `Una casa mediana, de 1,500 a 2,500 pies², toma de 3 a 7 días de trabajo: lavado, raspado, cambio de madera podrida, sellado, primario donde hace falta y dos manos en paredes y molduras. La madera podrida va primero, porque la tabla nueva necesita primario antes del sellador y la pintura. En el condado de Lee, una casa mediana cuesta normalmente ${mid("exterior", 1)}; vea nuestra guía de [cuánto cobra un pintor](guide:painting-cost) o calcule la suya con el [calculador de costos](page:estimator).`,
          ],
          table: costTable("exterior", "es"),
        },
        {
          h: "Cómo nos organizamos con el clima",
          list: [
            "Cada mañana revisamos el pronóstico por hora: temperatura, punto de rocío y probabilidad de lluvia, no solo la máxima del día.",
            "Los días de lluvia se cuentan desde el principio. Le decimos claro que un trabajo de 5 días puede tomar 7 días de calendario en una semana de tormentas.",
            "Si una tormenta moja la pintura fresca, la revisamos ya seca y repintamos lo dañado.",
            "La aprobación de colores de la HOA se manda antes de la fecha de inicio. Vea lo que incluye nuestro servicio de [pintura de casas](service:painting).",
          ],
        },
      ],
      faq: [
        { q: "¿Cuál es el mejor mes para pintar una casa por fuera en Alabama?", a: "En el condado de Lee, normalmente octubre: suele ser el mes más seco del año, con días templados y menos humedad. Finales de septiembre, noviembre y mayo también son buenos." },
        { q: "¿A qué temperatura mínima se puede pintar afuera?", a: "Pinturas de primera como Duration y Aura piden mínimo 35°F en el aire y la superficie, y Duration agrega que no baje de 35°F en 48 horas. Muchos primarios piden 50°F, y con frío y humedad hay que esperar más entre manos." },
        { q: "¿Se puede pintar una casa en verano en Auburn?", a: "Sí, empezando temprano, siguiendo la sombra y terminando antes de las tormentas de la tarde. No se debe pintar una pared que está al sol directo." },
        { q: "¿Cuánto hay que esperar después de la lluvia para pintar?", a: "Hasta que la superficie esté completamente seca; después de un aguacero, normalmente un día seco, y más en paredes con sombra o madera sin pintar. Además, no debe llover en las 2 o 3 horas después de pintar." },
        { q: "¿Cuánto se tardan en pintar una casa por fuera?", a: "Una casa mediana, de 3 a 7 días de trabajo, más los días de lluvia. Mucha madera podrida o una casa de dos pisos agregan tiempo." },
        { q: "¿Puedo pintar mi fachada de vinil de un color más oscuro?", a: "Solo con colores hechos para vinil, como la línea VinylSafe de Sherwin-Williams. Un color oscuro común puede torcer el vinil con el sol de Alabama." },
      ],
    },
  },
};
