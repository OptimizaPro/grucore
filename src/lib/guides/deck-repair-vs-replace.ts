import { type Guide } from "../guide-kit";
import { serviceById } from "../content-services";

const D = "2026-09-30";

/* No estimator tier fits deck work, so the only Z Construction price in this
   guide is the repairs-page glance range, read from content-services.ts so the
   two never disagree. Replacement figures are Zonda's national averages. */
const REPAIR_RANGE = { en: serviceById("repairs").t.en.glance.range, es: serviceById("repairs").t.es.glance.range };

export const guide: Guide = {
  id: "deck-repair-vs-replace",
  slug: { en: "deck-repair-or-replace-auburn-al", es: "reparar-o-cambiar-terraza-de-madera-auburn-al" },
  photo: "deckRebuildFraming",
  published: D,
  updated: D,
  service: "repairs",
  related: ["permits", "exterior-paint-timing", "hire-contractor"],
  sources: [
    { name: "American Wood Council — DCA 6, Prescriptive Residential Wood Deck Construction Guide (2015 IRC)", url: "https://web-media.awc.org/wp-content/uploads/2022/02/17210514/AWC-DCA62015-DeckGuide-1804.pdf" },
    { name: "American Wood Protection Association — Use Category guide for residential treated wood", url: "https://awpa.com/images/standards/ResidentialInfographic2021.pdf" },
    { name: "Simpson Strong-Tie — Preservative-Treated Wood FAQ (connector corrosion)", url: "https://www.strongtie.com/products/product-use-information/corrosion-information/pressure-treated-wood-faq" },
    { name: "Viance (TreatedWood.com) — Staining treated wood", url: "https://www.treatedwood.com/woodchat/part-4-staining-treated-wood" },
    { name: "Zonda — 2025 Cost vs. Value Report", url: "https://zondahome.com/2025-cost-vs-value-report/" },
  ],
  t: {
    en: {
      title: "Deck Repair or Replace? Auburn, AL Costs and Signs (2026)",
      eyebrow: "Repair guide · 2026",
      description: "Repair or replace your deck in Auburn or Opelika, AL? How to inspect it, what fails in our humidity, 2026 costs, composite vs. treated pine and permits.",
      h1: "Deck repair or replacement? Costs in Auburn, AL (2026)",
      lede: "How to check a pressure-treated deck yourself, what Lee County's heat and humidity do to it, when a repair is money well spent and when it only delays a rebuild.",
      answer: `Repair the deck if the framing, ledger and footings are sound and the problems are boards, railings or stairs; that kind of work usually falls in our repair range (${REPAIR_RANGE.en}). Replace it when the ledger or several joists are rotten, the ledger was never bolted and flashed, or the railing and stairs can't be brought up to code. For scale, Zonda's 2025 national average for a new 16 x 20 ft deck was $18,263 in treated wood and $25,096 in composite.`,
      sections: [
        {
          h: "The short rule: the frame decides",
          p: [
            "Boards, railings and stair treads are the parts you see and the cheapest to replace. The frame underneath (posts, beams, joists, the ledger bolted to the house, and the footings) decides repair or rebuild. New boards on failing joists is money spent twice.",
          ],
          table: {
            head: ["What you find", "Usually", "Why"],
            rows: [
              ["A few soft or split deck boards", "Repair", "Boards swap out one at a time"],
              ["Wobbly railing posts, loose balusters", "Repair", "Posts can be re-bolted or replaced and blocked"],
              ["Rusted joist hangers or nails, joists still firm", "Repair", "Hangers and fasteners can be replaced"],
              ["Soft ends on one or two joists", "Repair", "Sister or replace the joist, treat the cut ends"],
              ["Ledger soft, no flashing, or nailed only", "Replace (or rebuild the frame)", "The house connection is the most common failure point"],
              ["Many joists soft, sagging beam, sinking posts", "Replace", "The structure has reached the end of its life"],
              ["Railing under 36 in. or gaps that pass a 4 in. ball", "Rebuild railing at least", "Current code minimums"],
            ],
          },
        },
        {
          h: "How to inspect your deck in 20 minutes",
          p: ["Take a flat screwdriver and a flashlight, and look from underneath too. Sound treated pine resists a screwdriver pushed by hand; rotten wood lets it sink in."],
          list: [
            "Soft wood: probe board ends, the tops of joists under the boards, post bases and anywhere leaves collect. Rot starts where water sits.",
            "Ledger board: this is the board bolted to the house. The American Wood Council's DCA 6 guide calls for ½ in. lag screws or bolts into the house band joist, corrosion-resistant flashing over it, and no attachment to brick veneer. Look for rust streaks, gaps and soft wood.",
            "Joist hangers: the metal brackets that hold each joist. Look for flaking rust, missing nails, or hangers that were never nailed at all. DCA 6 calls for hangers at least 60% of the joist depth.",
            "Posts and footings: posts should sit on concrete footings, not buried in dirt. DCA 6 has footings bearing on undisturbed soil at least 12 in. below grade. A post that has sunk, leans or is soft at the bottom is a structural repair.",
            "Railing: grab each post and push hard. It should not move. Decks more than 30 in. above grade need a guard, 36 in. is the usual residential minimum height, and a 4 in. ball should not pass between balusters.",
            "Stairs: check stringers at the ground and at the deck, cracked treads, and a solid handrail.",
          ],
        },
        {
          h: "Why treated pine decks fail in Lee County",
          p: [
            "Most decks around [Auburn](area:auburn) and [Opelika](area:opelika) are Southern yellow pine, pressure-treated with copper-based preservatives. It lasts well, but our long hot, humid summers mean the wood rarely dries out fully, especially on low decks, shady lots and anything close to the ground. Boards check (crack along the grain), water gets in, and the less-treated core decays.",
            "Two details explain most early failures. Treatment level: the American Wood Protection Association rates deck boards and railings for above-ground use, but posts, and joists or beams that are hard to replace or near the ground, should be ground-contact rated (UC4A). Cut ends: every saw cut exposes less-treated wood, and the industry standard calls for brushing copper naphthenate on cuts and drilled holes.",
            "Fasteners matter too. Modern ACQ and copper azole treatments are more corrosive to steel than the old CCA. Simpson Strong-Tie recommends hot-dip galvanized or ZMAX (G185) connectors, or stainless steel for higher exposure, and DCA 6 requires fasteners and connectors to be galvanized or stainless. Plain steel nails in treated wood can rust through while the wood looks fine.",
          ],
        },
        {
          h: "What deck repair and replacement cost",
          p: [
            "Repairs are priced per job after we look at the frame, because hidden rot changes the scope. The replacement figures are national averages from Zonda's 2025 Cost vs. Value Report, not our price list; local prices depend on size, height, stairs and railing.",
          ],
          table: {
            head: ["Work", "Typical cost", "Source"],
            rows: [
              ["Board, railing, stair and hanger repairs", REPAIR_RANGE.en, "Z Construction repair range"],
              ["New 16 x 20 ft deck, treated wood", "$18,263 (about 95% recouped at resale)", "Zonda 2025, national average"],
              ["New 16 x 20 ft deck, composite", "$25,096 (about 89% recouped at resale)", "Zonda 2025, national average"],
            ],
          },
        },
        {
          h: "When repair makes sense, and when replacement wins",
          list: [
            "Repair: the joists and posts are firm, the ledger is bolted and flashed, and the problems are in the top layer.",
            "Repair: an inspection item before a sale. We document the work with photos for your agent.",
            "Repair and re-deck: the frame is sound but the boards are worn out. New boards (treated or composite) on a good frame is a solid middle option.",
            "Replace: the ledger is rotten, nailed or attached through brick veneer, or several joists and posts are soft.",
            "Replace: you want a different size, height or a covered porch, permitted and built to current code.",
          ],
        },
        {
          h: "Composite or pressure-treated for the new deck",
          p: ["Either way the frame is usually treated lumber; the choice is mostly about the boards and railing."],
          table: {
            head: ["", "Pressure-treated pine", "Composite boards"],
            rows: [
              ["Upfront cost", "Lower", "Higher (Zonda: about 37% more nationally)"],
              ["Upkeep", "Clean and re-seal or stain on a schedule", "Wash; no staining"],
              ["Heat", "Stays cooler in sun", "Some colors get hot in July sun"],
              ["Our humidity", "Checks and can rot if neglected", "Boards don't rot, but the frame still can"],
            ],
          },
        },
        {
          h: "Permits for deck work in Auburn and Opelika",
          p: [
            "New decks and deck rebuilds need a building permit in both cities: City of Auburn Inspection Services on N. Ross St., and the City of Opelika Building Inspection Division through Public Works. Swapping a few boards is typically treated as a minor repair, but replacing a ledger, joists, posts or stairs is structural work, and we confirm with the City before we start. Outside city limits, Lee County issues permits. Our [permit guide](guide:permits) explains each office, and HOA approval is separate if you change the deck's size, color or railing.",
          ],
        },
        {
          h: "Sealing and staining schedule",
          list: [
            "New treated wood: wait until it is dry enough to absorb water. Viance, a preservative maker, says treated wood is typically ready about 60 days after installation; sprinkle a few drops of water, and if they soak in, it is ready.",
            "Clear water repellents: Viance notes most makers recommend a yearly coat.",
            "Semi-transparent stains: plan on recoating the floor every couple of years and railings less often; follow the product's label.",
            "Timing: in Lee County, fall is the best window. Clean after pollen season in March and April, and avoid staining in direct July sun. See our [exterior painting timing guide](guide:exterior-paint-timing) for the same weather logic.",
          ],
        },
      ],
      faq: [
        { q: "How do I know if my deck is safe?", a: "Check that the ledger is bolted and flashed, the posts sit on footings, joists and hangers are firm and rust-free, and the railing doesn't move when pushed. If any fail, stay off it until it is looked at." },
        { q: "How much does deck repair cost in Auburn, AL?", a: `Most board, railing, stair and hanger repairs fall in our [repair range](service:repairs): ${REPAIR_RANGE.en}. Structural repairs to the ledger or frame are priced after an inspection, with a written scope.` },
        { q: "Can I put new boards on my old deck frame?", a: "Yes, if the frame passes inspection. We replace any bad joists before new boards go on. Composite boards may need tighter joist spacing than your old frame has." },
        { q: "Do I need a permit to replace my deck in Opelika or Auburn?", a: "Yes, a replacement deck needs a building permit in both cities. We pull it and schedule the inspections." },
        { q: "Is composite decking worth it in our climate?", a: "It is if you don't want to stain every few years and plan to stay a while. It costs more upfront, and the frame underneath still needs the same care as a wood deck." },
      ],
    },
    es: {
      title: "¿Reparar o cambiar su terraza de madera? Auburn, AL 2026",
      eyebrow: "Guía de reparaciones · 2026",
      description: "¿Reparar o cambiar la terraza en Auburn u Opelika, AL? Cómo revisarla, qué falla con la humedad, precios 2026, compuesto o madera tratada, y permisos.",
      h1: "¿Reparar o cambiar la terraza? Precios en Auburn, AL (2026)",
      lede: "Cómo revisar usted mismo una terraza (deck) de madera tratada, qué le hace el calor húmedo del condado de Lee y cuándo conviene repararla o hacerla nueva.",
      answer: `Repare la terraza si la estructura, la viga pegada a la casa (el ledger) y las bases de concreto están bien y el problema son tablas, barandales o escalones; ese trabajo casi siempre queda en nuestro rango de reparaciones (${REPAIR_RANGE.es}). Cámbiela si el ledger o varias viguetas están podridos, si el ledger nunca se atornilló ni se protegió con lámina, o si el barandal y la escalera no se pueden poner al código. Como referencia, el promedio nacional de Zonda en 2025 para una terraza nueva de 16 x 20 pies fue de $18,263 en madera tratada y $25,096 en material compuesto.`,
      sections: [
        {
          h: "La regla corta: manda la estructura",
          p: [
            "Las tablas, los barandales y los escalones son lo que se ve y lo más barato de cambiar. Lo que decide si se repara o se reconstruye está debajo: postes, vigas, viguetas, el ledger atornillado a la casa y las bases de concreto. Poner tablas nuevas sobre viguetas que ya fallan es pagar dos veces.",
          ],
          table: {
            head: ["Lo que encuentra", "Normalmente", "Por qué"],
            rows: [
              ["Unas cuantas tablas blandas o rajadas", "Reparar", "Las tablas se cambian una por una"],
              ["Postes del barandal flojos, balaustres sueltos", "Reparar", "Se vuelven a atornillar o se cambian"],
              ["Estribos o clavos oxidados, viguetas firmes", "Reparar", "Los herrajes se pueden cambiar"],
              ["Una o dos viguetas blandas en la punta", "Reparar", "Se refuerza o cambia la vigueta"],
              ["Ledger blando, sin lámina o solo clavado", "Cambiar o rehacer la estructura", "La unión con la casa es la falla más común"],
              ["Muchas viguetas blandas, viga caída, postes hundidos", "Cambiar", "La estructura ya cumplió su vida"],
              ["Barandal de menos de 36 pulgadas o huecos de más de 4", "Rehacer al menos el barandal", "Son los mínimos del código"],
            ],
          },
        },
        {
          h: "Cómo revisar su terraza en 20 minutos",
          p: ["Necesita un desarmador plano y una lámpara, y hay que ver también por debajo. Si el desarmador se hunde con la mano, esa madera está podrida."],
          list: [
            "Madera blanda: pruebe puntas de tablas, viguetas, bases de postes y donde se juntan hojas.",
            "El ledger: es la tabla atornillada a la casa. La guía DCA 6 del American Wood Council pide pijas o tornillos de ½ pulgada hacia la estructura de la casa, una lámina contra la humedad por encima y nunca fijarlo al ladrillo de fachada. Busque óxido o madera blanda.",
            "Estribos metálicos: los herrajes que cargan cada vigueta. Revise óxido y clavos faltantes. La DCA 6 pide estribos de al menos 60% del peralte de la vigueta.",
            "Postes y bases: los postes van sobre bases de concreto, no enterrados. La DCA 6 pide que la base apoye en suelo firme a por lo menos 12 pulgadas de profundidad. Un poste hundido o blando abajo es reparación estructural.",
            "Barandal: empuje fuerte cada poste; no se debe mover. A más de 30 pulgadas del suelo se necesita barandal, de 36 pulgadas como mínimo usual en casas, y una pelota de 4 pulgadas no debe pasar entre balaustres.",
            "Escalera: revise las zancas abajo y arriba, los escalones rajados y que el pasamanos esté firme.",
          ],
        },
        {
          h: "Por qué se pudren las terrazas en el condado de Lee",
          p: [
            "Casi todas las terrazas de [Auburn](area:auburn) y [Opelika](area:opelika) son de pino amarillo tratado a presión con cobre. Con los veranos calientes y húmedos de aquí la madera casi nunca se seca del todo, sobre todo en terrazas bajas o con sombra. Las tablas se agrietan, entra el agua y se pudre el centro, que lleva menos tratamiento.",
            "Dos detalles explican casi todas las fallas tempranas. El tratamiento: la American Wood Protection Association clasifica tablas y barandales para uso sobre el suelo, pero los postes, y las viguetas o vigas difíciles de cambiar o cerca de la tierra, deben ser para contacto con el suelo (UC4A). Los cortes: cada corte expone madera con menos tratamiento, y la norma pide pintar cortes y agujeros con naftenato de cobre.",
            "Los tratamientos de hoy (ACQ y azol de cobre) corroen el acero más que el antiguo CCA. Simpson Strong-Tie recomienda herrajes galvanizados por inmersión en caliente o ZMAX (G185), o acero inoxidable en ambientes más agresivos, y la DCA 6 exige clavos, tornillos y estribos galvanizados o inoxidables. Un clavo común en madera tratada se oxida aunque la madera se vea bien.",
          ],
        },
        {
          h: "Cuánto cuesta reparar o cambiar una terraza",
          p: [
            "Las reparaciones se cotizan después de revisar la estructura, porque la pudrición escondida cambia el alcance. Las cifras de terrazas nuevas son promedios nacionales del reporte Cost vs. Value 2025 de Zonda, no nuestra lista de precios; aquí el precio depende del tamaño, la altura, la escalera y el barandal.",
          ],
          table: {
            head: ["Trabajo", "Costo típico", "Fuente"],
            rows: [
              ["Tablas, barandal, escalones y estribos", REPAIR_RANGE.es, "Rango de reparaciones de Z Construction"],
              ["Terraza nueva de 16 x 20 pies, madera tratada", "$18,263 (se recupera cerca del 95% al vender)", "Zonda 2025, promedio nacional"],
              ["Terraza nueva de 16 x 20 pies, material compuesto", "$25,096 (se recupera cerca del 89% al vender)", "Zonda 2025, promedio nacional"],
            ],
          },
        },
        {
          h: "Cuándo conviene reparar y cuándo cambiar",
          list: [
            "Reparar: viguetas y postes firmes, ledger atornillado y protegido, y problemas solo en la capa de arriba.",
            "Reparar: el inspector marcó la terraza antes de vender. Le damos fotos para su agente.",
            "Reparar y poner piso nuevo: la estructura está sana pero las tablas ya no dan más. Es un buen punto medio.",
            "Cambiar: el ledger está podrido, solo clavado o fijado al ladrillo, o hay varias viguetas y postes blandos.",
            "Cambiar: quiere otro tamaño, otra altura o un porche con techo, con permiso y al código.",
          ],
        },
        {
          h: "¿Material compuesto o madera tratada?",
          p: ["La estructura casi siempre es de madera tratada; lo que se escoge es el piso y el barandal."],
          table: {
            head: ["", "Pino tratado a presión", "Tablas de material compuesto"],
            rows: [
              ["Costo inicial", "Más bajo", "Más alto (según Zonda, cerca de 37% más a nivel nacional)"],
              ["Mantenimiento", "Lavar y volver a sellar o teñir", "Solo lavar; no se tiñe"],
              ["Calor", "Se mantiene más fresca al sol", "Algunos colores se calientan mucho en julio"],
              ["Humedad", "Se agrieta y se pudre si se descuida", "No se pudre; la estructura sí"],
            ],
          },
        },
        {
          h: "Permisos para terrazas en Auburn y Opelika",
          p: [
            "Una terraza nueva o reconstruida necesita permiso en las dos ciudades: en Auburn con Inspection Services (N. Ross St.) y en Opelika con Building Inspection de Public Works. Cambiar unas tablas suele contar como reparación menor; cambiar el ledger, viguetas, postes o escalera es estructural, y lo confirmamos con la ciudad. Fuera de la ciudad, el permiso lo da el condado de Lee. En nuestra [guía de permisos](guide:permits) explicamos cada oficina; y si cambia el tamaño, el color o el barandal, la HOA también tiene que aprobarlo.",
          ],
        },
        {
          h: "Cada cuánto sellar o teñir",
          list: [
            "Madera tratada nueva: Viance, fabricante de preservadores, dice que suele estar lista unos 60 días después de instalada; si unas gotas de agua se absorben, ya se puede teñir.",
            "Selladores transparentes: según Viance, casi todos los fabricantes piden una mano al año.",
            "Tintes semitransparentes: en el piso, cada par de años; en barandales, menos seguido. Siga la etiqueta.",
            "Temporada: el otoño; lave después del polen de marzo y abril y no tiña bajo el sol de julio. En nuestra guía sobre [la mejor época para pintar por fuera](guide:exterior-paint-timing) aplicamos la misma lógica del clima.",
          ],
        },
      ],
      faq: [
        { q: "¿Cómo sé si mi terraza es segura?", a: "Revise que el ledger esté atornillado y protegido con lámina, que los postes estén sobre bases de concreto, que viguetas y estribos estén firmes y sin óxido, y que el barandal no se mueva. Si algo falla, no la use hasta que alguien la revise." },
        { q: "¿Cuánto cuesta reparar una terraza en Auburn, AL?", a: `La mayoría de los arreglos de tablas, barandales, escalones y estribos quedan en nuestro rango de [reparaciones del hogar](service:repairs): ${REPAIR_RANGE.es}. Lo estructural se cotiza después de revisar, por escrito.` },
        { q: "¿Se pueden poner tablas nuevas sobre la estructura vieja?", a: "Sí, si la estructura pasa la revisión. Cambiamos las viguetas malas antes de poner el piso. Las tablas de compuesto a veces piden viguetas más juntas." },
        { q: "¿Necesito permiso para cambiar mi terraza en Opelika o Auburn?", a: "Sí, una terraza nueva necesita permiso de construcción en las dos ciudades. Nosotros lo sacamos y programamos las inspecciones." },
        { q: "¿Vale la pena el material compuesto con este clima?", a: "Sí, si no quiere teñir cada pocos años y piensa quedarse. Cuesta más al principio, y la estructura de abajo necesita el mismo cuidado." },
      ],
    },
  },
};
