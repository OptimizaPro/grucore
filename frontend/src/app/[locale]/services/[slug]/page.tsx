import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { SERVICES, formatRangeGtq, formatRangeUsd } from '@/lib/estimator'
import { getServiceImages } from '@/lib/cms'
import { PageHero } from '@/components/ui/page-hero'
import { SectionReveal } from '@/components/ui/section-reveal'
import { CtaSection } from '@/components/sections/cta-section'
import { BeforeAfterSlider } from '@/components/ui/before-after-slider'
import { Check, Clock, ArrowLeft, ShieldCheck, CalendarCheck, UserCheck } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  return Object.keys(SERVICES).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = SERVICES[slug]
  if (!service) return {}
  return {
    title: `${service.label_es} — Grucore`,
    description: service.description_es,
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as 'es' | 'en'
  const service = SERVICES[slug]

  if (!service) notFound()

  const cmsImages = await getServiceImages(slug)
  const coverImage  = cmsImages.cover  ?? service.cover_image
  const beforeImage = cmsImages.before ?? service.before_image
  const afterImage  = cmsImages.after  ?? service.after_image

  const label = locale === 'es' ? service.label_es : service.label_en
  const description = locale === 'es' ? service.description_es : service.description_en
  const highlights = locale === 'es' ? service.highlights_es : service.highlights_en
  const [minM, maxM] = service.typical_duration_months

  const t = {
    back:         { es: 'Volver a servicios', en: 'Back to services' },
    highlights:   { es: 'Lo que incluye', en: "What's included" },
    duration:     { es: 'Duración típica', en: 'Typical duration' },
    months:       { es: 'meses', en: 'months' },
    range_gtq:    { es: 'Rango de inversión', en: 'Investment range' },
    cta:          { es: 'Solicitar cotización gratuita', en: 'Request a free estimate' },
    faq_title:    { es: 'Preguntas frecuentes', en: 'Frequently asked questions' },
    why_title:    { es: '¿Por qué Grucore para esto?', en: 'Why Grucore for this?' },
    price_title:  { es: 'Qué hace variar el precio', en: 'What affects the price' },
    tier_basic:   { es: 'Básico', en: 'Basic' },
    tier_typical: { es: 'Típico', en: 'Typical' },
    tier_premium: { es: 'Premium', en: 'Premium' },
  }

  // Tiers de precio calculados del rango existente
  const [minQ, maxQ] = service.range_gtq
  const spread = maxQ - minQ
  const tiers = [
    { label: t.tier_basic,   range: [minQ, minQ + spread * 0.35] as [number, number],   desc: { es: 'Alcance acotado, acabados estándar', en: 'Limited scope, standard finishes' } },
    { label: t.tier_typical, range: [minQ + spread * 0.35, minQ + spread * 0.7] as [number, number], desc: { es: 'Proyecto completo, materiales de calidad', en: 'Full project, quality materials' } },
    { label: t.tier_premium, range: [minQ + spread * 0.7, maxQ] as [number, number],    desc: { es: 'Alcance amplio, acabados de primera', en: 'Full scope, premium finishes' } },
  ]

  const whyCards = [
    {
      Icon: CalendarCheck,
      title: { es: 'Cumplimos cronogramas', en: 'We meet deadlines' },
      body:  { es: 'Cada proyecto tiene fechas comprometidas en contrato. Actualizaciones de avance semanales sin que tengas que preguntar.', en: 'Every project has contractual deadlines. Weekly progress updates without you having to ask.' },
    },
    {
      Icon: ShieldCheck,
      title: { es: 'Presupuesto detallado ítem por ítem', en: 'Line-item detailed budget' },
      body:  { es: 'Sin rangos genéricos. Cada rubro desglosado antes de firmar. Cualquier cambio va en orden de cambio escrita.', en: 'No generic ranges. Every line item broken down before signing. Any change goes in a written change order.' },
    },
    {
      Icon: UserCheck,
      title: { es: 'Un asesor único durante todo el proceso', en: 'One advisor throughout the process' },
      body:  { es: 'No hablas con coordinadores distintos cada vez. Un solo punto de contacto de la cotización a la entrega.', en: "You don't talk to different coordinators each time. One contact from estimate to delivery." },
    },
  ]

  const FAQ_BY_SERVICE: Record<string, Array<{ q: { es: string; en: string }; a: { es: string; en: string } }>> = {
    residential_construction: [
      {
        q: { es: '¿Necesito tener los planos antes de contactarlos?', en: 'Do I need plans before contacting you?' },
        a: { es: 'No. Podemos partir desde cero: diseño arquitectónico y planos estructurales son parte del servicio. Si ya tienes planos, los revisamos y cotizamos sobre ellos.', en: 'No. We can start from scratch: architectural design and structural drawings are part of the service. If you already have plans, we review and quote from them.' },
      },
      {
        q: { es: '¿Cuánto tiempo toma construir una residencia?', en: 'How long does it take to build a home?' },
        a: { es: 'Entre 6 y 18 meses según metraje y nivel de acabados. En la cotización entregamos un cronograma con hitos definidos y fechas comprometidas en contrato.', en: 'Between 6 and 18 months depending on size and finish level. In the estimate we provide a schedule with defined milestones and contractual deadlines.' },
      },
      {
        q: { es: '¿Puedo ver el avance si no vivo cerca de la obra?', en: 'Can I monitor progress if I\'m not near the site?' },
        a: { es: 'Sí. Tienes acceso a un portal de cliente con reportes fotográficos semanales y avance en tiempo real. Además tu asesor te actualiza directamente cada semana.', en: 'Yes. You get access to a client portal with weekly photo reports and real-time progress. Your advisor also updates you directly every week.' },
      },
      {
        q: { es: '¿Qué garantía tiene la construcción?', en: 'What warranty does the construction carry?' },
        a: { es: 'Garantía de 2 años en mano de obra. Estructuralmente seguimos las normas AGIES vigentes en Guatemala. Cualquier defecto cubierto lo atendemos sin costo adicional.', en: '2-year labor warranty. Structurally we follow current AGIES standards in Guatemala. Any covered defect is addressed at no additional cost.' },
      },
    ],
    remodeling: [
      {
        q: { es: '¿Tengo que desalojar la casa durante la remodelación?', en: 'Do I have to vacate the house during remodeling?' },
        a: { es: 'Depende del alcance. Remodelaciones parciales (una habitación o área) generalmente no requieren desalojar. Proyectos de remodelación total sí lo recomendamos para agilizar los trabajos y proteger tus pertenencias.', en: 'It depends on the scope. Partial remodels (one room or area) usually don\'t require vacating. Full remodels: we recommend it to speed up work and protect your belongings.' },
      },
      {
        q: { es: '¿Incluye la limpieza y el retiro de escombros?', en: 'Does it include cleanup and debris removal?' },
        a: { es: 'Sí. La limpieza diaria durante obra y el retiro final de escombros están incluidos en el precio. Entregamos el espacio listo para usar.', en: 'Yes. Daily cleanup during construction and final debris removal are included in the price. We hand over the space ready to use.' },
      },
      {
        q: { es: '¿Puedo elegir los materiales o ustedes los definen?', en: 'Can I choose the materials or do you define them?' },
        a: { es: 'Tú eliges. Te acompañamos en la selección de acabados según tu presupuesto y gusto. También podemos proponerte opciones con relación calidad/precio validada por nuestros proyectos anteriores.', en: 'You choose. We guide you through finish selection based on your budget and taste. We can also propose options with quality/price ratios validated by past projects.' },
      },
      {
        q: { es: '¿Qué pasa si durante la demolición aparecen problemas ocultos?', en: 'What if hidden issues appear during demolition?' },
        a: { es: 'Es posible encontrar instalaciones en mal estado o humedad no visible. Si ocurre, lo documentamos con fotos, te explicamos el problema y emitimos una orden de cambio con costo antes de proceder. Nada se ejecuta sin tu aprobación.', en: 'It\'s possible to find faulty installations or invisible moisture. If it happens, we document it with photos, explain the problem, and issue a change order with cost before proceeding. Nothing is done without your approval.' },
      },
    ],
    commercial: [
      {
        q: { es: '¿Pueden trabajar en horarios fuera de oficina para no afectar la operación?', en: 'Can you work outside business hours to avoid disrupting operations?' },
        a: { es: 'Sí. Para proyectos en locales activos coordinamos jornadas nocturnas o de fin de semana. El costo adicional se refleja en la cotización desde el inicio, sin sorpresas.', en: 'Yes. For active commercial spaces we coordinate night or weekend shifts. The additional cost is reflected in the estimate from the start, no surprises.' },
      },
      {
        q: { es: '¿Manejan los permisos municipales y de construcción?', en: 'Do you handle municipal and construction permits?' },
        a: { es: 'Podemos orientarte sobre los requisitos municipales y acompañarte en el proceso, pero la gestión formal de licencias y permisos corre por cuenta del cliente. Te explicamos qué necesitas y qué pasos seguir desde el inicio.', en: 'We can guide you on municipal requirements and support you through the process, but the formal management of licenses and permits is the client\'s responsibility. We explain what you need and what steps to follow from the start.' },
      },
      {
        q: { es: '¿Tienen experiencia en restaurantes y locales de food service?', en: 'Do you have experience with restaurants and food service spaces?' },
        a: { es: 'Sí. Hemos ejecutado proyectos de restaurantes, cafeterías y dark kitchens. Conocemos los requerimientos de ventilación, extracción, pisos antideslizantes y normativas sanitarias aplicables.', en: 'Yes. We\'ve executed restaurants, cafeterias and dark kitchen projects. We understand ventilation, extraction, non-slip flooring and applicable sanitary regulations.' },
      },
      {
        q: { es: '¿Cómo manejan los cambios de alcance una vez iniciada la obra?', en: 'How do you handle scope changes once construction starts?' },
        a: { es: 'Cada cambio se documenta mediante orden de cambio escrita con costo y tiempo impacto antes de ejecutarse. El contrato original se mantiene intacto. Cero cambios verbales.', en: 'Every change is documented via written change order with cost and time impact before execution. The original contract stays intact. Zero verbal changes.' },
      },
    ],
    design_build: [
      {
        q: { es: '¿Qué ventaja tiene el modelo diseño + construcción vs. contratar por separado?', en: 'What\'s the advantage of design + build vs. hiring separately?' },
        a: { es: 'Un solo responsable desde el boceto hasta la entrega. Elimina brechas entre lo que el arquitecto diseñó y lo que el constructor ejecuta, reduce cambios costosos y acorta los tiempos de coordinación.', en: 'One single responsible party from sketch to handover. Eliminates gaps between what the architect designed and what the builder executes, reduces costly changes and shortens coordination time.' },
      },
      {
        q: { es: '¿Puedo participar en las decisiones de diseño?', en: 'Can I participate in design decisions?' },
        a: { es: 'Completamente. El proceso de diseño incluye sesiones de revisión contigo. Presentamos opciones, recibimos tu feedback y ajustamos antes de emitir planos finales. El diseño es tuyo.', en: 'Completely. The design process includes review sessions with you. We present options, receive your feedback and adjust before issuing final drawings. The design is yours.' },
      },
      {
        q: { es: '¿El presupuesto puede cambiar una vez definido el diseño?', en: 'Can the budget change once the design is set?' },
        a: { es: 'Una vez aprobado el diseño y firmado el contrato de obra, el presupuesto es cerrado. Los únicos cambios posibles son por órdenes de cambio solicitadas por el cliente o imprevistos documentados.', en: 'Once the design is approved and the construction contract signed, the budget is fixed. The only possible changes are client-requested change orders or documented unforeseen conditions.' },
      },
      {
        q: { es: '¿Manejan proyectos fuera de Ciudad de Guatemala?', en: 'Do you handle projects outside Guatemala City?' },
        a: { es: 'Sí. Hemos ejecutado proyectos en el interior del país. El costo de movilización y viáticos del equipo de supervisión se incluye de forma transparente en la cotización.', en: 'Yes. We\'ve executed projects in the interior of the country. Team mobilization and supervision per diem are transparently included in the estimate.' },
      },
    ],
    industrial: [
      {
        q: { es: '¿Trabajan con estructura metálica o solo concreto?', en: 'Do you work with steel structure or only concrete?' },
        a: { es: 'Ambas. Evaluamos con el equipo de ingeniería cuál es la solución óptima según el uso, cargas, plazos y presupuesto. Muchos proyectos de bodega combinan estructura metálica con losa de concreto.', en: 'Both. We evaluate with our engineering team which is the optimal solution based on use, loads, deadlines and budget. Many warehouse projects combine steel structure with concrete slab.' },
      },
      {
        q: { es: '¿Incluye las instalaciones eléctricas industriales y trifásico?', en: 'Does it include industrial electrical and three-phase power?' },
        a: { es: 'Sí. Coordinamos el diseño eléctrico industrial, tableros, acometidas trifásicas, iluminación de alto rendimiento y puesta a tierra, según los requerimientos de tu operación.', en: 'Yes. We coordinate industrial electrical design, panels, three-phase feeds, high-efficiency lighting and grounding, according to your operational requirements.' },
      },
      {
        q: { es: '¿Pueden construir en zona libre o parque industrial con reglamentos propios?', en: 'Can you build in a free zone or industrial park with its own regulations?' },
        a: { es: 'Sí. Trabajamos con las especificaciones técnicas del parque o zona franca. Coordinamos directamente con el ente administrador para aprobación de planos y permisos internos.', en: 'Yes. We work with the park or free zone\'s technical specifications. We coordinate directly with the managing entity for plan approval and internal permits.' },
      },
      {
        q: { es: '¿El piso industrial está incluido en la cotización?', en: 'Is the industrial floor included in the estimate?' },
        a: { es: 'Sí. El piso forma parte del presupuesto base. Especificamos el espesor, resistencia y acabado (pulido, endurecedor, epóxico) según la carga operativa y tipo de tráfico que manejará la instalación.', en: 'Yes. The floor is part of the base budget. We specify thickness, strength and finish (polished, hardener, epoxy) based on the operational load and traffic type the facility will handle.' },
      },
    ],
    kitchens_baths: [
      {
        q: { es: '¿Puedo usar la cocina o el baño mientras dure la remodelación?', en: 'Can I use the kitchen or bathroom during remodeling?' },
        a: { es: 'No durante la fase de demolición e instalaciones, que suele ser la primera semana. Una vez terminadas las instalaciones y los revestimientos, el espacio queda funcional antes del acabado final.', en: 'Not during the demolition and installation phase, which is usually the first week. Once installations and cladding are done, the space is functional before the final finish.' },
      },
      {
        q: { es: '¿Manejan la plomería y la electricidad o tengo que contratar a alguien más?', en: 'Do you handle plumbing and electrical or do I need to hire someone else?' },
        a: { es: 'Lo manejamos todo internamente. Plomería, eléctrico, azulejos, muebles y accesorios. No necesitas coordinar con otros contratistas. Eso es precisamente lo que hace el proceso más limpio y rápido.', en: 'We handle everything in-house. Plumbing, electrical, tiles, cabinetry and fixtures. You don\'t need to coordinate with other contractors. That\'s precisely what makes the process cleaner and faster.' },
      },
      {
        q: { es: '¿Ustedes consiguen los materiales o yo los compro?', en: 'Do you source the materials or do I buy them?' },
        a: { es: 'Puedes elegir. Podemos gestionar la compra completa con nuestros proveedores habituales (ahorrando tiempo y evitando faltantes), o trabajar con materiales que tú ya compraste o quieres comprar. Ambas opciones están contempladas en el presupuesto.', en: 'You choose. We can manage the full purchase through our regular suppliers (saving time and avoiding shortages), or work with materials you already bought or want to buy. Both options are covered in the estimate.' },
      },
      {
        q: { es: '¿Cuánto tiempo tarda una remodelación de cocina o baño?', en: 'How long does a kitchen or bathroom remodel take?' },
        a: { es: 'Entre 3 y 8 semanas para la mayoría de proyectos. Una cocina pequeña puede estar lista en 3 semanas; una cocina grande con cambio de distribución o un baño principal completo toma entre 5 y 8 semanas.', en: 'Between 3 and 8 weeks for most projects. A small kitchen can be ready in 3 weeks; a large kitchen with layout changes or a full master bathroom takes 5 to 8 weeks.' },
      },
    ],
  }

  const faqs = FAQ_BY_SERVICE[slug] ?? []

  return (
    <>
      <PageHero
        eyebrow={locale === 'es' ? 'Servicio' : 'Service'}
        title={label}
        subtitle={description}
        bgImage={coverImage}
        accentLast
        size="md"
        split
        subtitleVariant="border-left"
      />

      <div className="bg-[#1A2530]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-[#8A95A5] hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={14} />
            {t.back[locale]}
          </Link>
        </div>
      </div>

      <section className="bg-[#1A2530] pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-12">

              {/* Antes / Después — solo si el servicio tiene imágenes */}
              {beforeImage && afterImage && (
                <SectionReveal>
                  <BeforeAfterSlider
                    beforeImage={beforeImage}
                    afterImage={afterImage}
                    beforeLabel={locale === 'es' ? 'Antes' : 'Before'}
                    afterLabel={locale === 'es' ? 'Después' : 'After'}
                    height="h-[380px] md:h-[480px]"
                  />
                </SectionReveal>
              )}

              {/* Highlights */}
              <SectionReveal>
                <div className="p-8 rounded-xl border border-[#27384A] bg-[#1F2D3A]">
                  <h2
                    className="text-2xl font-semibold text-[#F0EDE8] mb-6"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {t.highlights[locale]}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                    {highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3 text-sm text-[#8A95A5]">
                        <Check size={14} className="text-[#FF6B35] mt-0.5 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionReveal>

              {/* ¿Por qué Grucore para esto? */}
              <SectionReveal delay={0.05}>
                <h2
                  className="text-2xl font-semibold text-[#F0EDE8] mb-6"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {t.why_title[locale]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {whyCards.map(({ Icon, title, body }) => (
                    <div
                      key={title.es}
                      className="p-6 rounded-xl border border-[#27384A] bg-[#1F2D3A] space-y-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                        <Icon size={18} className="text-[#FF6B35]" />
                      </div>
                      <h3
                        className="text-sm font-semibold text-[#F0EDE8]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {title[locale]}
                      </h3>
                      <p className="text-xs text-[#8A95A5] leading-relaxed">
                        {body[locale]}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionReveal>

              {/* Qué hace variar el precio */}
              <SectionReveal delay={0.08}>
                <h2
                  className="text-2xl font-semibold text-[#F0EDE8] mb-6"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {t.price_title[locale]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {tiers.map(({ label, range, desc }) => (
                    <div
                      key={label.es}
                      className="p-6 rounded-xl border border-[#27384A] bg-[#1F2D3A] space-y-3"
                    >
                      <span
                        className="text-xs font-semibold tracking-[0.15em] text-[#FF6B35] uppercase"
                        style={{ fontFamily: 'Space Mono, monospace' }}
                      >
                        {label[locale]}
                      </span>
                      <p
                        className="text-base font-semibold text-white"
                        style={{ fontFamily: 'Space Mono, monospace' }}
                      >
                        {formatRangeGtq(range)}
                      </p>
                      <p className="text-xs text-[#8A95A5]">{desc[locale]}</p>
                    </div>
                  ))}
                </div>
              </SectionReveal>

              {/* FAQs */}
              <SectionReveal delay={0.1}>
                <h2
                  className="text-2xl font-semibold text-[#F0EDE8] mb-6"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {t.faq_title[locale]}
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="group border border-[#27384A] rounded-lg overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none text-[#F0EDE8] text-sm font-medium hover:bg-[#1F2D3A] transition-colors">
                        {faq.q[locale]}
                        <span className="text-[#FF6B35] text-lg leading-none flex-shrink-0 group-open:rotate-45 transition-transform duration-200">
                          +
                        </span>
                      </summary>
                      <div className="px-5 pb-5 text-sm text-[#8A95A5] leading-relaxed border-t border-[#27384A] pt-4">
                        {faq.a[locale]}
                      </div>
                    </details>
                  ))}
                </div>
              </SectionReveal>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <SectionReveal delay={0.15} className="sticky top-24">
                {/* Card de precio */}
                <div className="p-6 rounded-xl border border-[#FF6B35]/20 bg-[#1F2D3A] space-y-5">
                  <div>
                    <p
                      className="text-xs text-[#8A95A5] mb-1"
                      style={{ fontFamily: 'Space Mono, monospace' }}
                    >
                      {t.range_gtq[locale]}
                    </p>
                    <p
                      className="text-xl font-semibold text-[#FF6B35]"
                      style={{ fontFamily: 'Space Mono, monospace' }}
                    >
                      {formatRangeGtq(service.range_gtq)}
                    </p>
                    <p
                      className="text-sm text-[#B0B8C4] mt-1"
                      style={{ fontFamily: 'Space Mono, monospace' }}
                    >
                      ≈ {formatRangeUsd(service.range_gtq)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#8A95A5] py-4 border-y border-[#27384A]">
                    <Clock size={14} className="text-[#FF6B35]" />
                    <span>{t.duration[locale]}:</span>
                    <span className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                      {minM}–{maxM} {t.months[locale]}
                    </span>
                  </div>

                  <a
                    href="#cta-section"
                    className="w-full h-12 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                  >
                    {t.cta[locale]}
                  </a>

                  <div className="text-xs text-[#8A95A5] text-center">
                    {locale === 'es'
                      ? 'Sin costo · Sin compromiso · Respuesta en 24h'
                      : 'No cost · No obligation · 24h response'}
                  </div>
                </div>

                {/* WhatsApp rápido */}
                <a
                  href="https://wa.me/50220000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 mt-4 rounded-xl border border-[#27384A] hover:border-[#25D366]/40 hover:bg-[#1F2D3A] transition-colors text-sm text-[#8A95A5] hover:text-[#25D366]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  {locale === 'es' ? 'Consultar por WhatsApp' : 'Ask via WhatsApp'}
                </a>
              </SectionReveal>
            </aside>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
