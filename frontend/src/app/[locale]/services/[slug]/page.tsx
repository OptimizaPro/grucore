import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { SERVICES, formatRangeGtq, formatRangeUsd } from '@/lib/estimator'
import { PageHero } from '@/components/ui/page-hero'
import { SectionReveal } from '@/components/ui/section-reveal'
import { CtaSection } from '@/components/sections/cta-section'
import { Check, Clock, ArrowLeft } from 'lucide-react'
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

  const label = locale === 'es' ? service.label_es : service.label_en
  const description = locale === 'es' ? service.description_es : service.description_en
  const highlights = locale === 'es' ? service.highlights_es : service.highlights_en
  const [minM, maxM] = service.typical_duration_months

  const t = {
    back:       { es: 'Volver a servicios', en: 'Back to services' },
    highlights: { es: 'Lo que incluye', en: "What's included" },
    duration:   { es: 'Duración típica', en: 'Typical duration' },
    months:     { es: 'meses', en: 'months' },
    range_gtq:  { es: 'Rango de inversión', en: 'Investment range' },
    cta:        { es: 'Solicitar cotización gratuita', en: 'Request a free estimate' },
    faq_title:  { es: 'Preguntas frecuentes', en: 'Frequently asked questions' },
  }

  const faqs: Array<{ q: { es: string; en: string }; a: { es: string; en: string } }> = [
    {
      q: { es: '¿El presupuesto es realmente gratuito?', en: 'Is the estimate really free?' },
      a: { es: 'Sí. La evaluación del proyecto, la visita técnica y el presupuesto detallado no tienen costo ni compromiso.', en: 'Yes. The project evaluation, technical visit and detailed estimate are free with no obligation.' },
    },
    {
      q: { es: '¿Cuánto tarda el proceso antes de iniciar obra?', en: 'How long before construction starts?' },
      a: { es: 'Entre 2 y 4 semanas desde la aprobación del presupuesto, dependiendo de la disponibilidad de materiales y permisos.', en: 'Between 2 and 4 weeks from budget approval, depending on material availability and permits.' },
    },
    {
      q: { es: '¿Qué pasa si el costo varía durante la obra?', en: 'What if costs change during construction?' },
      a: { es: 'Cualquier variación se documenta mediante orden de cambio firmada por ambas partes antes de ejecutarse. Sin sorpresas.', en: 'Any variation is documented via a change order signed by both parties before execution. No surprises.' },
    },
    {
      q: { es: '¿Tienen garantía los trabajos?', en: 'Is the work guaranteed?' },
      a: { es: 'Sí. Todos los proyectos tienen garantía mínima de 1 año en mano de obra. Los proyectos mayores tienen garantía extendida según contrato.', en: 'Yes. All projects carry a minimum 1-year labor warranty. Larger projects have extended warranty per contract.' },
    },
  ]

  return (
    <>
      <PageHero
        eyebrow={locale === 'es' ? 'Servicio' : 'Service'}
        title={label}
        subtitle={description}
        bgImage={service.cover_image}
        accentLast
        size="lg"
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
                      className="text-sm text-[#8A95A5] mt-1"
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
                  className="flex items-center gap-3 p-4 rounded-xl border border-[#27384A] hover:border-[#25D366]/40 hover:bg-[#1F2D3A] transition-colors text-sm text-[#8A95A5] hover:text-[#25D366]"
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
