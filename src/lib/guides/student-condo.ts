import { costTable, mid, type Guide } from "../guide-kit";

const D = "2026-09-29";

/* Calendar dates are from Auburn University's published 2026–2027 calendar
   (re-check each summer). Deposit rules: Ala. Code §35-9A-201. */
export const guide: Guide = {
  id: "student-condo",
  slug: { en: "student-condo-maintenance-auburn-al", es: "mantenimiento-condominio-estudiante-auburn" },
  photo: "floor1",
  published: D,
  updated: D,
  service: "rental",
  estimator: "rental",
  related: ["rental-turnover", "flooring-humidity", "painting-cost"],
  sources: [
    { name: "Auburn University Calendar 2026–2027", url: "https://bulletin.auburn.edu/generalinformation/auburnuniversitycalendar/" },
    { name: "ENERGY STAR: Maintenance Checklist for heating and cooling", url: "https://www.energystar.gov/saveathome/heating-cooling/maintenance-checklist" },
    { name: "U.S. Fire Administration: Smoke alarms", url: "https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/smoke-alarms/" },
    { name: "U.S. Fire Administration: Clothes Dryer Fire Safety (flyer)", url: "https://www.usfa.fema.gov/downloads/pdf/publications/clothes_dryer_fire_safety_flyer.pdf" },
    { name: "Code of Alabama §35-9A-201, Security deposits (FindLaw)", url: "https://codes.findlaw.com/al/title-35-property/al-code-sect-35-9a-201/" },
  ],
  t: {
    en: {
      title: "Student Condo Maintenance in Auburn, AL: Parent's Guide",
      description: "Own a condo near Auburn University? A parent's yearly maintenance calendar, checklist, HOA contractor rules, turnover costs and how to manage it remotely.",
      eyebrow: "Owner guide · 2026",
      h1: "Owning a student condo in Auburn: a parent's maintenance guide",
      lede: "For parents and out-of-town owners of condos and small houses near campus: what to maintain each year, when to schedule it around the school calendar, and how to manage the work from two states away.",
      answer: `Plan the year around the lease: book turnover work in spring for the late-July or early-August move-out, use fall break, Thanksgiving, winter break and spring break for small repairs, and run one yearly checklist (HVAC service and filters, water heater, smoke alarms, dryer vent, caulk and paint). In Auburn, a light turnover typically costs ${mid("rental", 0)} and a medium turn with new LVP flooring ${mid("rental", 1)}.`,
      sections: [
        {
          h: "The Auburn owner's year",
          p: ["A student condo has a rhythm set by the university calendar and your lease dates. Work is cheapest and easiest to schedule when the unit is empty or the student is away, and hardest in the two weeks before move-in, when every painter and flooring crew in town is booked."],
          table: {
            head: ["Window", "What's happening", "What to schedule"],
            rows: [
              ["Late July to mid-August", "Leases end and start, often days apart; fall 2026 classes began August 17", "Turnover: repairs, paint, flooring, deep clean"],
              ["Fall break (Oct 8–9, 2026) and Thanksgiving week (Nov 23–27)", "Most students away for a few days", "Fall HVAC check, dryer vent, smoke alarm test, small repairs"],
              ["Winter break (mid-December to early January)", "The longest stretch the student is away during the school year", "Bath caulk and grout, fixture swaps, one-room projects, freeze prep"],
              ["Spring break (Mar 8–12, 2027)", "Pollen season, air conditioning about to run hard", "AC tune-up and filters; walk the unit and book summer turnover"],
              ["May to July", "Some units empty, some with summer subleases", "Bigger upgrades if the unit is empty; confirm turnover dates in writing"],
            ],
          },
        },
        {
          h: "The yearly checklist",
          list: [
            "HVAC: ENERGY STAR recommends checking filters monthly and scheduling a pre-season check-up, cooling in spring and heating in fall. In Lee County's long, humid summers the AC works hard, and a plugged condensate drain can leak into the unit below in a condo building. Leave the student a stack of the right filter size.",
            "Water heater: read the date on the label, look for rust or moisture at the base, and make sure the drain pan and its line are clear. Most failures give warning signs first.",
            "Smoke and CO alarms: the U.S. Fire Administration says to test smoke alarms monthly, replace batteries at least yearly and replace the alarms themselves every 10 years, with alarms inside and outside each sleeping area. Add CO alarms if the unit has any gas appliance.",
            "Dryer vent: USFA advises cleaning the lint filter every cycle, cleaning behind the dryer and checking that the vent isn't crushed or restricted. Condo vents often run long; we recommend having the full run cleaned yearly.",
            "Caulk and grout: tub, shower, sinks and backsplash. Failed caulk is one of the most common sources of slow leaks around tubs and vanities.",
            "Paint: touch up scuffs at each break and keep the color and sheen codes on file so patches match.",
            "Freeze prep: Lee County gets occasional hard freezes. Show the student where the water shutoff is, disconnect hoses, and ask that the heat stay on low over winter break, never off.",
          ],
        },
        {
          h: "LVP or carpet in a student unit",
          p: [
            `Carpet in living areas of a student rental rarely survives more than a few leases. Luxury vinyl plank handles spills, furniture moves and humidity far better and makes turnovers faster. Replacing about 300 square feet, one or two rooms, typically runs ${mid("flooring", 0)} here. Many owners keep carpet in bedrooms and put LVP everywhere else. Before you buy, read our [guide to flooring in Alabama humidity](guide:flooring-humidity), and check your condo documents: some associations require a sound-rated underlayment on upper floors.`,
          ],
        },
        {
          h: "Condo association rules for contractors",
          p: ["Most complexes near campus have written rules for outside contractors. Read them before you book, because a crew turned away at the gate still costs you a trip charge and a lost day."],
          list: [
            "Access: gate codes, fobs, elevator reservations and where trucks can park.",
            "Hours: many associations limit noisy work to weekday daytime hours.",
            "Insurance: associations often require a certificate of insurance naming the association before work starts.",
            "Approvals: flooring, plumbing and anything touching shared walls or the exterior may need written approval.",
            "Shared systems: water shutoffs that affect other units are usually coordinated through the manager.",
            "Debris: contractors generally haul their own; complex dumpsters are for residents.",
          ],
        },
        {
          h: "Managing work from out of town",
          list: [
            "Get a written scope and price per job before anyone starts.",
            "Ask for before-and-after photos of each room, and a video walkthrough when the job is bigger.",
            "Keep a lockbox or a key with the management office, and change the code after turnover.",
            "Have one point of contact who answers the phone, not a rotating cast.",
            "Pay against an itemized invoice with photos attached; it doubles as your records for taxes and deposits.",
          ],
          p: ["That's how our [rental turnover service](service:rental) works: a written scope, before-and-after photos, an itemized invoice and a walkthrough video on request. We can also work from your property manager's work order. Auburn is our home base, so we're nearby when something can't wait for the next break; see our [Auburn service area](area:auburn)."],
        },
        {
          h: "2026 turnover costs in Auburn",
          p: [`These are installed prices, labor and materials, for the work between one lease and the next. For the full room-by-room list, see our [rental turnover checklist](guide:rental-turnover), or get a range for your unit with the [cost estimator](page:estimator).`],
          table: costTable("rental", "en"),
        },
        {
          h: "What to fix now and what can wait",
          table: {
            head: ["Issue", "Fix now or wait?", "Why"],
            rows: [
              ["Active leak, water stain that's growing, soft floor by the toilet", "Now", "Water damage spreads, and in a condo it reaches the neighbor"],
              ["Missing, chirping or 10-year-old smoke alarm", "Now", "Life safety, and cheap"],
              ["AC not cooling or condensate backing up", "Now", "Summer humidity brings mold within days"],
              ["Crushed or clogged dryer vent", "Now", "Fire risk"],
              ["Broken lock, door or window latch", "Now", "Security for your student"],
              ["Scuffed paint, worn but intact carpet", "Next break or turnover", "Cheaper to do with the rest of the turn"],
              ["Dated fixtures, cabinet color, lighting", "Plan for summer", "Upgrades, not repairs"],
            ],
          },
        },
        {
          h: "Documenting condition and deposits",
          p: [
            "If roommates pay you rent, you're a landlord, even when one of them is your own child. Under Alabama's landlord-tenant law (§35-9A-201), a security deposit generally can't exceed one month's rent, with exceptions for pets, changes to the unit or added liability. Within 60 days after the tenancy ends and the unit is returned, you must refund the deposit or send a written, itemized list of what you kept; failing to do so can cost double the deposit. The City of Auburn also requires a residential rental business license.",
            "Take date-stamped photos and video of every room at move-in and move-out, and keep the contractor's itemized invoice for each repair. That's the paper trail that makes a deduction stick. This is general information, not legal advice.",
          ],
        },
      ],
      faq: [
        { q: "When do Auburn student leases turn over?", a: "Many leases near campus end and start in late July or early August, often only days apart. Book turnover work in spring so a crew and materials are ready on move-out day." },
        { q: "How often should the AC be serviced in a student condo?", a: "ENERGY STAR recommends a pre-season check-up each year, cooling in spring and heating in fall, and checking filters monthly. In Auburn's humid summers, don't skip the spring visit." },
        { q: "Do I need the condo association's permission to hire a contractor?", a: "For most interior work you don't need approval, but you do need to follow the association's rules on access, hours and insurance. Flooring, plumbing and exterior work often need written approval first." },
        { q: "Can I manage repairs without driving to Auburn?", a: "Yes. Ask for a written scope, before-and-after photos, an itemized invoice and a single contact. We work that way for out-of-town owners and can send a walkthrough video on request." },
        { q: "How much does a student condo turnover cost in Auburn?", a: `A light turn with paint, patching and repairs usually runs ${mid("rental", 0)}. A medium turn with new LVP and fixtures runs ${mid("rental", 1)}, at mid-range finishes.` },
        { q: "How long do I have to return a security deposit in Alabama?", a: "Alabama law gives a landlord 60 days after the tenancy ends and possession is returned to refund the deposit or send a written, itemized list of deductions." },
      ],
    },
    es: {
      title: "Condominio de estudiante en Auburn: guía de mantenimiento",
      description: "¿Tiene un condominio cerca de Auburn University? Calendario de mantenimiento, lista anual, reglas de la HOA, costos entre inquilinos y manejo a distancia.",
      eyebrow: "Guía para dueños · 2026",
      h1: "Su condominio de estudiante en Auburn: guía de mantenimiento para papás",
      lede: "Para papás y dueños que viven fuera y tienen un condominio o una casita cerca de la universidad: qué revisar cada año, cuándo hacerlo y cómo manejarlo sin venir a Auburn.",
      answer: `Organice el año según el contrato de renta: aparte desde la primavera el trabajo de cambio de inquilino para finales de julio o principios de agosto, aproveche las vacaciones de otoño, Thanksgiving, invierno y primavera para reparaciones chicas, y haga una revisión anual (aire acondicionado y filtros, calentador de agua, detectores de humo, ducto de la secadora, sellador y pintura). En Auburn, un cambio ligero cuesta normalmente ${mid("rental", 0)} y uno mediano con piso LVP nuevo ${mid("rental", 1)}.`,
      sections: [
        {
          h: "El año de un dueño en Auburn",
          p: ["Un condominio de estudiante sigue el calendario de la universidad y las fechas de su contrato. Los trabajos salen más fáciles cuando su hijo está de vacaciones, y más difíciles en las dos semanas antes de las clases, cuando todos los pintores e instaladores de la ciudad están ocupados."],
          table: {
            head: ["Temporada", "Qué pasa", "Qué conviene hacer"],
            rows: [
              ["Finales de julio a mediados de agosto", "Terminan y empiezan los contratos, a veces con días de diferencia; las clases de otoño 2026 empezaron el 17 de agosto", "Cambio de inquilino: reparaciones, pintura, pisos, limpieza a fondo"],
              ["Vacaciones de otoño (8 y 9 de octubre de 2026) y Thanksgiving (23 al 27 de noviembre)", "Casi todos los estudiantes se van unos días", "Revisión del aire en otoño, ducto de la secadora, prueba de detectores, reparaciones chicas"],
              ["Vacaciones de invierno (mediados de diciembre a principios de enero)", "El tiempo más largo que su hijo está fuera durante el año escolar", "Sellador y boquilla del baño, cambio de llaves o lámparas, un cuarto a la vez, preparar para heladas"],
              ["Vacaciones de primavera (8 al 12 de marzo de 2027)", "Temporada de polen; el aire acondicionado está por trabajar fuerte", "Servicio del aire y filtros; revisar el departamento y apartar el cambio de verano"],
              ["Mayo a julio", "Algunos departamentos quedan vacíos, otros se subarriendan", "Mejoras más grandes si está vacío; confirmar las fechas del cambio por escrito"],
            ],
          },
        },
        {
          h: "La revisión de cada año",
          list: [
            "Aire acondicionado: ENERGY STAR recomienda revisar los filtros cada mes y dar servicio antes de cada temporada, el aire en primavera y la calefacción en otoño. Con los veranos largos y húmedos del condado de Lee, el aire trabaja mucho, y un drenaje tapado puede gotear al departamento de abajo. Déjele a su hijo filtros de la medida correcta.",
            "Calentador de agua: vea la fecha en la etiqueta, busque óxido o humedad en la base y revise que la charola y su tubo de drenaje estén libres.",
            "Detectores de humo y monóxido: la Administración de Bomberos de EE. UU. (USFA) recomienda probar los detectores de humo cada mes, cambiar las pilas por lo menos una vez al año y cambiar el detector completo cada 10 años, con detectores dentro y fuera de cada recámara. Si hay algún aparato de gas, ponga también detector de monóxido.",
            "Ducto de la secadora: la USFA aconseja limpiar el filtro de pelusa en cada carga, limpiar detrás de la secadora y revisar que el ducto no esté aplastado ni tapado. En los condominios el ducto suele ser largo; nosotros recomendamos limpiarlo completo una vez al año.",
            "Sellador y boquilla: tina, regadera, lavabos y salpicadero. El sellador despegado es una de las causas más comunes de fugas lentas alrededor de tinas y tocadores.",
            "Heladas: en el condado de Lee a veces hiela fuerte. Enséñele a su hijo dónde se cierra el agua, desconecten las mangueras y pídale que en invierno deje la calefacción baja, nunca apagada.",
          ],
        },
        {
          h: "¿Piso LVP o alfombra?",
          p: [
            `En la sala de un departamento de estudiantes, la alfombra casi nunca aguanta más de unos cuantos contratos. El piso de vinilo de lujo (LVP) aguanta mejor los derrames y la humedad, y hace más rápido cada cambio. Cambiar unos 300 pies cuadrados, uno o dos cuartos, cuesta normalmente ${mid("flooring", 0)} en la zona. Muchos dueños dejan alfombra en las recámaras y ponen LVP en todo lo demás. Antes de comprar, lea nuestra [guía de pisos y humedad en Alabama](guide:flooring-humidity) y revise el reglamento del condominio: algunas asociaciones piden una base aislante contra ruido en los pisos de arriba.`,
          ],
        },
        {
          h: "Las reglas del condominio para contratistas",
          p: ["Casi todos los complejos cerca de la universidad tienen reglas por escrito para los contratistas. Léalas antes de programar para no perder un día en la entrada."],
          list: [
            "Acceso: códigos del portón, llaveros electrónicos, apartar el elevador y dónde se puede estacionar la camioneta.",
            "Horarios: muchas asociaciones solo permiten trabajo con ruido entre semana y de día.",
            "Seguro: es común que pidan un certificado de seguro a nombre de la asociación antes de empezar.",
            "Permisos internos: pisos, plomería y cualquier cosa que toque paredes compartidas o el exterior pueden necesitar aprobación por escrito.",
            "Instalaciones compartidas: cerrar el agua de varios departamentos se coordina con la administración.",
          ],
        },
        {
          h: "Cómo manejar los trabajos si vive lejos",
          list: [
            "Pida alcance y precio por escrito de cada trabajo antes de que alguien empiece.",
            "Pida fotos del antes y el después de cada cuarto, y un video del recorrido cuando el trabajo sea grande.",
            "Deje una caja de seguridad para llaves o una copia con la administración, y cambie el código después de cada cambio.",
            "Tenga un solo contacto que conteste el teléfono.",
            "Pague contra una factura detallada con fotos; le sirve para sus impuestos y para el depósito.",
          ],
          p: ["Así funciona nuestro [servicio para casas de renta](service:rental): alcance por escrito, fotos del antes y el después, factura detallada y video del recorrido si lo pide, todo en español. También podemos trabajar con la orden de trabajo de su administrador. Auburn es nuestra base: vea nuestra [zona de servicio en Auburn](area:auburn)."],
        },
        {
          h: "Costos de cambio de inquilino en Auburn (2026)",
          p: [`Son precios instalados, con mano de obra y materiales, para el trabajo entre un contrato y otro. Para la lista completa cuarto por cuarto, vea [cómo preparar su casa de renta](guide:rental-turnover), o saque un rango para su departamento con la [calculadora de costos](page:estimator).`],
          table: costTable("rental", "es"),
        },
        {
          h: "Qué arreglar ya y qué puede esperar",
          table: {
            head: ["Problema", "¿Ya o después?", "Por qué"],
            rows: [
              ["Fuga activa, mancha de agua que crece, piso blando junto al inodoro", "Ya", "El agua se extiende, y en un condominio le llega al vecino"],
              ["Detector de humo que falta, que pita o que tiene 10 años", "Ya", "Es seguridad y cuesta poco"],
              ["El aire no enfría o el drenaje se regresa", "Ya", "Con la humedad del verano sale moho en pocos días"],
              ["Ducto de la secadora aplastado o tapado", "Ya", "Riesgo de incendio"],
              ["Pintura golpeada, alfombra gastada pero entera", "Siguiente vacación o cambio de inquilino", "Sale más barato junto con lo demás"],
              ["Lámparas, llaves o gabinetes pasados de moda", "Planearlo para el verano", "Son mejoras, no reparaciones"],
            ],
          },
        },
        {
          h: "Fotos, daños y el depósito",
          p: [
            "Si los compañeros de cuarto le pagan renta, usted es el arrendador, aunque uno de ellos sea su propio hijo. La ley de Alabama (§35-9A-201) dice que el depósito normalmente no puede pasar de un mes de renta, salvo por mascotas, cambios al departamento o más riesgo para el dueño. Dentro de los 60 días después de que termina el contrato y le entregan el departamento, usted tiene que devolver el depósito o mandar por escrito la lista detallada de lo que se quedó; si no lo hace, puede tener que pagar el doble. Auburn además exige licencia de negocio para rentar.",
            "Tome fotos y video con fecha de cada cuarto a la entrada y a la salida, y guarde la factura detallada de cada reparación. Esto es información general, no asesoría legal.",
          ],
        },
      ],
      faq: [
        { q: "¿Cuándo cambian los contratos de estudiantes en Auburn?", a: "Muchos contratos cerca de la universidad terminan y empiezan a finales de julio o principios de agosto, a veces con pocos días de diferencia. Aparte el trabajo desde la primavera." },
        { q: "¿Cada cuánto hay que darle servicio al aire acondicionado?", a: "ENERGY STAR recomienda un servicio al año antes de cada temporada, el aire en primavera y la calefacción en otoño, y revisar los filtros cada mes." },
        { q: "¿Necesito permiso de la asociación del condominio para contratar a alguien?", a: "Para casi todo el trabajo interior no hace falta aprobación, pero sí hay que seguir las reglas de acceso, horarios y seguro. Pisos, plomería y trabajos exteriores muchas veces necesitan aprobación por escrito." },
        { q: "¿Puedo encargar las reparaciones sin ir a Auburn?", a: "Sí. Pida alcance por escrito, fotos del antes y el después, factura detallada y un solo contacto. Así trabajamos con dueños que viven fuera, en español." },
        { q: "¿Cuánto cuesta preparar un condominio de estudiante entre inquilinos?", a: `Un cambio ligero con pintura, resanes y reparaciones cuesta normalmente ${mid("rental", 0)}. Uno mediano con LVP y accesorios nuevos, ${mid("rental", 1)}, en acabados intermedios.` },
        { q: "¿Cuánto tiempo tengo para devolver el depósito en Alabama?", a: "La ley de Alabama le da al arrendador 60 días después de que termina el contrato y le entregan el departamento para devolver el depósito o mandar por escrito la lista detallada de descuentos." },
      ],
    },
  },
};
