import { mid, type Guide } from "../guide-kit";

const D = "2026-09-29";

/* Spanish is the primary audience for this guide: the ES copy was written
   first. Everything here is about language and clear paperwork, never about
   origin or documents. HBLB facts checked against the Home Builders
   Licensure Law as effective October 1, 2025 (§34-14A-2, -7(f), -19). */
export const guide: Guide = {
  id: "bilingual-contractor",
  slug: { en: "spanish-speaking-contractor-auburn-opelika", es: "contratista-que-habla-espanol-auburn-opelika" },
  photo: "worker2",
  published: D,
  updated: D,
  service: "remodeling",
  related: ["hire-contractor", "permits", "bathroom-cost"],
  sources: [
    { name: "Alabama Home Builders Licensure Law, effective October 1, 2025 (HBLB)", url: "https://hblb.alabama.gov/wp-content/uploads/2025/10/HBLB-Law-Effective-October-1-2025.pdf" },
    { name: "Alabama Home Builders Licensure Board", url: "https://hblb.alabama.gov/" },
    { name: "Federal Trade Commission: Hiring a Contractor (brochure)", url: "https://www.bulkorder.ftc.gov/system/files/publications/pdf-0057-hiring-contractor.pdf" },
    { name: "Federal Trade Commission: How To Avoid a Home Improvement Scam", url: "https://consumer.ftc.gov/articles/how-avoid-home-improvement-scam" },
  ],
  t: {
    es: {
      title: "Contratista que habla español en Auburn y Opelika",
      description: "Qué preguntar antes de contratar a un contratista que habla español en Auburn y Opelika, AL: licencia, seguro, presupuesto por escrito, pagos y permisos.",
      eyebrow: "Guía para contratar · 2026",
      h1: "Contratista que habla español en Auburn y Opelika: qué preguntar antes de contratar",
      lede: "Que le hablen en su idioma ayuda mucho, pero no basta. Estas son las preguntas y los papeles que protegen su dinero y su casa, explicados sin rodeos.",
      answer: "Antes de contratar, pida cuatro cosas en español y por escrito: el número de licencia de la Alabama Home Builders Licensure Board (obligatoria cuando la obra pasa de $10,000), el certificado de seguro, un presupuesto detallado línea por línea y un contrato que diga cómo se paga, quién saca el permiso y cómo se aprueban los cambios. Si el contratista le habla en español pero no le da nada por escrito, siga buscando.",
      sections: [
        {
          h: "Por qué importa tener todo en su idioma",
          p: [
            "Casi todos los pleitos con contratistas empiezan igual: cada quien entendió otra cosa. Usted oyó \"incluye la pintura\" y pensó en paredes, techos y molduras; en el papel solo decía paredes. Usted aprobó un cambio por teléfono y nadie habló del precio. Con el presupuesto, el contrato, los cambios y la garantía en un idioma que usted lee con calma, esas diferencias salen antes de firmar.",
            "Esto no tiene que ver con el origen de nadie, sino con entender lo que uno firma. Muchas familias de Auburn y Opelika son bilingües: los hijos leen inglés, los papás prefieren español, y la persona que firma y paga debe ser la que entiende. Si los papeles vienen en inglés, pida que le expliquen cada punto y que le manden un resumen en español por escrito, aunque sea por WhatsApp.",
          ],
        },
        {
          h: "Licencia y seguro: lo primero que debe verificar",
          p: [
            `La ley de Alabama exige licencia de la Home Builders Licensure Board (HBLB) para construir, remodelar o reparar una vivienda de hasta cuatro unidades, condominios incluidos, cuando el costo total de la obra pasa de $10,000 (para techos, desde $2,500). Una remodelación de un solo cuarto en la zona suele costar ${mid("remodel", 0)}, así que casi cualquier remodelación de verdad pasa ese límite. La misma ley obliga al contratista con licencia a usar un contrato por escrito con su número de licencia, y a declararle por escrito, antes de empezar, si tiene seguro de responsabilidad civil. Esa declaración la firman él y usted, con un testigo que usted escoja.`,
            "La búsqueda de licencias está en la página de la HBLB (hblb.alabama.gov). Busque por nombre o por número y confirme que el nombre de la empresa coincide con el del presupuesto. En nuestra [guía para verificar a un contratista en Alabama](guide:hire-contractor) le explicamos el proceso paso a paso.",
          ],
          list: [
            "Pida el certificado de seguro de responsabilidad civil, enviado directamente por el agente, con usted como titular.",
            "Revise que las fechas de la póliza cubran toda su obra.",
            "Pregunte cómo están asegurados los trabajadores y los subcontratistas que van a entrar a su casa.",
          ],
        },
        {
          h: "Qué debe decir un presupuesto, línea por línea",
          p: ["Un presupuesto serio se puede comparar con otro sin adivinar. Si el suyo es una sola línea que dice \"remodelación de baño, $15,000\", pida que lo desglosen así:"],
          table: {
            head: ["Línea", "Qué debe decir", "Por qué importa"],
            rows: [
              ["Datos de la empresa", "Nombre legal, dirección física, teléfono y número de licencia HBLB", "Si algo sale mal, necesita saber a quién reclamar"],
              ["Alcance por cuarto", "Qué se quita, qué se repara y qué se instala en cada cuarto", "Evita el \"eso no estaba incluido\""],
              ["Materiales", "Marca o línea, color y cantidad (pies cuadrados, galones, piezas)", "Así puede comparar presupuestos parejo"],
              ["Montos para acabados", "Cuánto incluye para azulejo, llaves, lámparas o gabinetes", "Si escoge algo más caro, sabe cuánto sube"],
              ["Daños escondidos", "Qué pasa si aparece madera podrida o una fuga: se para, se le avisa y se cotiza aparte", "Es donde más crecen las cuentas"],
              ["Permisos e inspecciones", "Quién los saca y si el costo está incluido", "Debe ser el contratista, a su nombre"],
              ["Limpieza y escombro", "Retiro de basura, contenedor y limpieza final", "Si no dice, puede terminar pagándolo usted"],
              ["Tiempo", "Fecha de inicio y duración aproximada", "Para planear su vida mientras dura la obra"],
              ["Pagos", "Anticipo y pagos ligados a etapas terminadas", "Usted paga por avance que puede ver"],
              ["Garantía", "Qué cubre, por cuánto tiempo y cómo se reclama", "Una garantía de palabra no sirve de mucho"],
            ],
          },
        },
        {
          h: "Pagos, anticipos y liberación de gravámenes",
          p: [
            "La Comisión Federal de Comercio (FTC) recomienda no pagar en efectivo, limitar el anticipo y ligar los pagos a partes terminadas del trabajo. Es normal un anticipo para apartar la fecha y pedir materiales; no es normal que le pidan la mayor parte del dinero antes de empezar. Pague con cheque, transferencia o tarjeta y guarde cada recibo.",
            "Si el contratista no le paga al proveedor o a un subcontratista, ellos pueden poner un gravamen (mechanic's lien) sobre su casa, aunque usted ya haya pagado. Por eso la FTC aconseja pedir una liberación de gravamen (lien release o lien waiver) al contratista y, en obras grandes, a los subcontratistas y proveedores, sobre todo con el último pago.",
          ],
          list: [
            "Al firmar: un anticipo para apartar la fecha y pedir material.",
            "Durante la obra: pagos al terminar etapas que usted puede ver, por ejemplo la plomería inspeccionada o el azulejo puesto.",
            "Al final: el último pago después del recorrido final y de terminar los pendientes, contra la liberación de gravamen.",
          ],
        },
        {
          h: "El permiso va a nombre del contratista",
          p: [
            "Si la obra mueve plomería, electricidad, paredes o aire acondicionado, casi siempre lleva permiso: en Auburn lo da Inspection Services de la ciudad y en Opelika la división de Building Inspection. Lo correcto es que lo saque el contratista a su nombre; si le pide que lo saque usted como dueño, la responsabilidad pasa a usted, y la FTC lo considera señal de alerta. Vea nuestra [guía de permisos en Auburn y Opelika](guide:permits) para saber qué obras lo necesitan.",
          ],
        },
        {
          h: "Cambios a mitad de obra: por escrito, siempre",
          p: ["En toda remodelación aparece algo, como una tabla podrida detrás del azulejo. Lo importante es cómo se acuerda el cambio."],
          list: [
            "Antes de hacer el cambio, pida que le manden por WhatsApp o por correo qué se va a hacer, cuánto cuesta y cuántos días agrega.",
            "Conteste por escrito con un sí claro. Un \"ok\" en una llamada no deja rastro.",
            "Para cambios de dinero importantes, pida una orden de cambio firmada que se sume al contrato.",
            "Guarde todo: fotos del avance, el chat exportado y los PDF del presupuesto y el contrato.",
          ],
        },
        {
          h: "Señales de alerta",
          list: [
            "Solo acepta efectivo, o pide casi todo el dinero por adelantado.",
            "No tiene dirección física, solo un número de celular.",
            "No le da número de licencia, certificado de seguro ni contrato.",
            "Le pide que usted saque el permiso, o que mejor no se saque.",
            "Le presiona para firmar hoy, o le dice que \"así se hace aquí\" para saltarse un paso.",
            "Le habla en español pero se niega a explicarle por escrito lo que usted va a firmar.",
          ],
        },
        {
          h: "Cómo lo hacemos nosotros en español",
          p: [
            "Z Construction es una empresa familiar de Auburn y lo atendemos en español de principio a fin: la visita, el presupuesto, el contrato, las llamadas y los mensajes por WhatsApp. El presupuesto es gratis, por escrito y con el alcance y el precio claros. El dueño está en cada obra, sacamos los permisos a nuestro nombre cuando se requieren y cualquier cambio se acuerda por escrito antes de hacerlo. Si quiere ver la licencia y el certificado de seguro antes de firmar, se los entregamos con gusto.",
            "Si ya tiene un presupuesto de otra empresa y no le queda claro, con gusto se lo explicamos sin compromiso. Vea lo que hacemos en [remodelación de casas](service:remodeling) o calcule un rango para su proyecto con la [calculadora de costos](page:estimator).",
          ],
        },
      ],
      faq: [
        { q: "¿Puedo pedir que el contrato esté en español?", a: "Sí, puede pedirlo, y un buen contratista le va a explicar cada punto. Si el contrato viene en inglés, pida por lo menos un resumen en español por escrito del alcance, el precio, los pagos y la garantía antes de firmar." },
        { q: "¿Cuánto anticipo es normal para una remodelación en Alabama?", a: "Es normal un anticipo para apartar la fecha y pedir materiales, y el resto por etapas terminadas. La FTC recomienda limitar el anticipo y nunca pagar todo por adelantado." },
        { q: "¿Cómo sé si un contratista tiene licencia en Alabama?", a: "Pida su número de licencia y búsquelo en la página de la Alabama Home Builders Licensure Board (hblb.alabama.gov). La licencia es obligatoria cuando la obra en una vivienda pasa de $10,000, mano de obra y materiales juntos." },
        { q: "¿Los mensajes de WhatsApp sirven para comprobar lo que acordamos?", a: "Son un registro escrito con fecha y ayudan mucho, pero no reemplazan el contrato firmado. Para cambios que suben el precio, pida una orden de cambio firmada y guarde el chat." },
        { q: "¿Quién debe sacar el permiso de construcción?", a: "El contratista, a su nombre. Si le pide que lo saque usted como dueño, usted queda como responsable ante la ciudad." },
      ],
    },
    en: {
      title: "Spanish-Speaking Contractor in Auburn & Opelika, AL",
      description: "Hiring a Spanish-speaking contractor in Auburn or Opelika, AL? What to ask first: license, insurance, a line-by-line written estimate, payments and permits.",
      eyebrow: "Hiring guide · 2026",
      h1: "Hiring a Spanish-speaking contractor in Auburn & Opelika",
      lede: "For bilingual households, landlords with Spanish-speaking tenants and anyone helping a parent through a remodel: what to ask, and what to get in writing, in the language the person paying actually reads.",
      answer: "Get four things in writing before you hire, in the language the homeowner reads best: an Alabama Home Builders Licensure Board license number (required when the job exceeds $10,000), a certificate of insurance, a line-by-line estimate, and a contract that spells out payments, who pulls the permit and how changes are approved. Speaking Spanish is a plus; putting everything in writing is the requirement.",
      sections: [
        {
          h: "Why the paperwork needs to be in the right language",
          p: [
            "Most contractor disputes start the same way: two people understood two different things. \"Paint included\" meant walls, ceilings and trim to one side and walls only to the other. A change was approved over the phone and no one mentioned price. When the estimate, contract, change orders and warranty terms are in a language the homeowner reads comfortably, those gaps surface before signing, not on the day of the final payment.",
            "This is about clarity, not background. Plenty of Lee County families are bilingual: adult kids read English, a parent prefers Spanish, and the person signing and paying should be the one who understands. If you're helping a parent, sit in on the walkthrough, but make sure the documents work for them, not just for you. Landlords get a related benefit: a crew that can schedule access and explain the work to Spanish-speaking tenants avoids missed appointments and misunderstandings in an occupied unit.",
          ],
        },
        {
          h: "License and insurance come first",
          p: [
            `Alabama law requires a Home Builders Licensure Board (HBLB) license to build, remodel or repair a residence of up to four units, condos included, when the total cost exceeds $10,000 ($2,500 for roofing). A single-room remodel here typically runs ${mid("remodel", 0)}, so most real remodels cross that line. The same law requires licensees to use a written contract showing their license number, and to disclose in writing, before work starts, whether they carry liability insurance. That disclosure is signed by both of you and witnessed by someone you choose.`,
            "The licensee search is linked from the HBLB website (hblb.alabama.gov). Search by name or number and make sure the business name matches the estimate. Our [guide to checking an Alabama contractor license](guide:hire-contractor) walks through it step by step.",
          ],
          list: [
            "Ask for a general liability certificate sent directly from their insurance agent, naming you as certificate holder.",
            "Check that the policy dates cover your whole project.",
            "Ask how workers and subcontractors entering the home are insured.",
          ],
        },
        {
          h: "What a written estimate should contain, line by line",
          p: ["A serious estimate can be compared with another without guessing. If yours is one line reading \"bathroom remodel, $15,000,\" ask for it broken out like this:"],
          table: {
            head: ["Line", "What it should say", "Why it matters"],
            rows: [
              ["Company details", "Legal name, physical address, phone and HBLB license number", "You need to know who to hold responsible"],
              ["Scope by room", "What gets removed, repaired and installed in each room", "Prevents \"that wasn't included\""],
              ["Materials", "Brand or line, color and quantity (sq ft, gallons, pieces)", "Lets you compare bids evenly"],
              ["Allowances", "The amount included for tile, faucets, lights or cabinets", "You know what an upgrade costs before you pick it"],
              ["Hidden damage", "What happens if rot or a leak turns up: stop, tell you, price it separately", "It's where budgets grow"],
              ["Permits and inspections", "Who pulls them and whether fees are included", "It should be the contractor, in their name"],
              ["Cleanup and debris", "Haul-off, dumpster and final clean", "Unwritten, it can land on you"],
              ["Schedule", "Start date and estimated duration", "So you can plan around the work"],
              ["Payments", "Deposit and payments tied to finished stages", "You pay for progress you can see"],
              ["Warranty", "What's covered, for how long, and how to claim", "A verbal warranty is worth little"],
            ],
          },
        },
        {
          h: "Payments, deposits and lien releases",
          p: [
            "The Federal Trade Commission advises homeowners not to pay cash, to limit the down payment, and to tie payments during the project to completed work. A deposit to hold the date and order materials is normal; most of the money before work starts is not. Pay by check, transfer or card and keep every receipt.",
            "One risk many people don't know about: if a contractor doesn't pay a supplier or subcontractor, they may be able to file a mechanic's lien against your home even though you paid in full. The FTC recommends asking for a lien release or lien waiver from the contractor and, on larger jobs, from subcontractors and suppliers, especially with the final payment.",
          ],
          list: [
            "At signing: a deposit to hold the date and order materials.",
            "During the job: payments at stages you can see, such as plumbing inspected or tile set.",
            "At the end: final payment after the walkthrough and punch list, in exchange for a lien release.",
          ],
        },
        {
          h: "The permit goes in the contractor's name",
          p: [
            "If the job moves plumbing, electrical, walls or HVAC, it almost always needs a permit: from City of Auburn Inspection Services in Auburn, from the Building Inspection Division in Opelika. The contractor should pull it in their own name, so they answer to the inspector. If you're asked to pull it yourself as the owner, the responsibility shifts to you, and the FTC lists that as a warning sign. See our [Auburn and Opelika permit guide](guide:permits) for which jobs need one.",
          ],
        },
        {
          h: "Changes mid-project: in writing, every time",
          p: ["Every remodel turns something up: a rotten board behind the tile, a color someone wants to change. That's normal. What matters is how it's agreed."],
          list: [
            "Before the change, ask for a WhatsApp message or email with what will be done, what it costs and how many days it adds.",
            "Reply in writing with a clear yes. A verbal okay leaves no record.",
            "For significant price changes, ask for a signed change order added to the contract.",
            "Keep everything: progress photos, the exported chat, and PDFs of the estimate and contract in one folder.",
          ],
        },
        {
          h: "Red flags",
          list: [
            "Cash only, or most of the money up front.",
            "No physical business address, just a cell number.",
            "No license number, insurance certificate or written contract.",
            "Asking you to pull the permit, or suggesting you skip it.",
            "Pressure to sign today.",
            "Happy to talk in Spanish but unwilling to put the same promises in writing.",
          ],
        },
        {
          h: "How we handle Spanish service",
          p: [
            "Z Construction is a family-owned Auburn company, and we work fully in Spanish or English: the walkthrough, the estimate, the contract, calls and WhatsApp messages. Estimates are free and written, with a clear scope and price. The owner is on every job, we pull required permits in our name, and every change is agreed in writing before the work. Copies of our license and insurance certificate are available before you sign anything.",
            "In a mixed-language household, one person can get updates in English while another approves the scope in Spanish. See our [remodeling services](service:remodeling) or get a planning range from the [cost estimator](page:estimator).",
          ],
        },
      ],
      faq: [
        { q: "Can I ask for the contract in Spanish?", a: "Yes, and a good contractor will walk through every point. If the contract is in English, ask at minimum for a written Spanish summary of scope, price, payments and warranty before anyone signs." },
        { q: "How much deposit is normal for a remodel in Alabama?", a: "A deposit to schedule the work and order materials is normal, with the rest paid by completed stages. The FTC recommends limiting the down payment and never paying in full up front." },
        { q: "How do I check a contractor's license in Alabama?", a: "Ask for the license number and look it up through the Alabama Home Builders Licensure Board website (hblb.alabama.gov). A license is required when residential work exceeds $10,000, labor and materials combined." },
        { q: "Do WhatsApp messages count as proof of what we agreed?", a: "They're a dated written record and help a lot, but they don't replace a signed contract. For changes that raise the price, get a signed change order and keep the chat." },
        { q: "I'm helping my parent hire a contractor. What should I do?", a: "Be at the walkthrough, make sure the estimate and contract are in the language your parent reads best, confirm the license and insurance yourself, and ask to be copied on the change-order messages." },
        { q: "What is a lien release and why do I need one?", a: "It's a document saying a supplier or subcontractor has been paid and won't claim against your home. Collect one with payments, especially the final one." },
      ],
    },
  },
};
