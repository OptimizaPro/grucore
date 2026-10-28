import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHero } from '@/components/ui/page-hero'
import { SectionReveal } from '@/components/ui/section-reveal'
import { SERVICES, formatRangeGtq, formatRangeUsd } from '@/lib/estimator'
import { CtaSection } from '@/components/sections/cta-section'
import { Check, Clock, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { getCMSPage, blocks } from '@/lib/cms'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const cms = await getCMSPage('services', locale)
  return {
    title: cms ? `${cms.title} — Grucore` : 'Servicios — Grucore',
    description: cms?.meta_description ?? 'Construcción residencial, remodelación, proyectos comerciales e industriales en Guatemala.',
  }
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params
  const cms = await getCMSPage('services', locale)

  const services = Object.values(SERVICES)

  const hero   = blocks(cms, 'hero')
  const labels = blocks(cms, 'labels')

  const content = {
    eyebrow:  hero.eyebrow  ?? (locale === 'es' ? 'Nuestros servicios' : 'Our services'),
    title:    hero.title    ?? (locale === 'es' ? 'Soluciones para cada tipo de proyecto' : 'Solutions for every project type'),
    subtitle: hero.subtitle ?? '',
    duration: locale === 'es' ? 'Duración típica' : 'Typical duration',
    months:   locale === 'es' ? 'meses' : 'months',
    cta:      labels.cta_quote  ?? (locale === 'es' ? 'Solicitar cotización gratuita' : 'Request a free estimate'),
    details:  labels.cta_detail ?? (locale === 'es' ? 'Ver detalle del servicio' : 'View service details'),
  }

  return (
    <>
      <PageHero
        eyebrow={content.eyebrow}
        title={content.title}
        subtitle={content.subtitle}
        accent={locale === 'es' ? 'Soluciones' : 'Solutions'}
        bgImage="https://images.unsplash.com/photo-1710181202412-a8d5accdbbf6?auto=format&fit=crop&w=1600&q=60"
        size="md"
        split
        subtitleVariant="border-left"
      />

      <section className="py-8 bg-[#1A2530]">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          {services.map((service, i) => {
            const isEven = i % 2 === 0
            const label = locale === 'es' ? service.label_es : service.label_en
            const description = locale === 'es' ? service.description_es : service.description_en
            const highlights = locale === 'es' ? service.highlights_es : service.highlights_en
            const [minM, maxM] = service.typical_duration_months

            return (
              <SectionReveal key={service.id} delay={0.05}>
                <article className="grid grid-cols-1 lg:grid-cols-2 border border-[#27384A] rounded-xl overflow-hidden hover:border-[#FF6B35]/20 transition-colors duration-300">
                  {/* Bloque visual — alterna lado */}
                  <div
                    className={`relative min-h-[280px] lg:min-h-[360px] overflow-hidden ${isEven ? 'lg:order-first' : 'lg:order-last'}`}
                  >
                    <Image
                      src={service.cover_image}
                      alt={label}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    {/* Overlay oscuro */}
                    <div className="absolute inset-0 bg-[#1A2530]/60" />
                    {/* Badge de rango */}
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
                      <span
                        className="text-sm font-semibold text-[#FF6B35]"
                        style={{ fontFamily: 'Space Mono, monospace' }}
                      >
                        {formatRangeGtq(service.range_gtq)}
                      </span>
                      <span
                        className="text-xs text-[#B0B8C4]"
                        style={{ fontFamily: 'Space Mono, monospace' }}
                      >
                        ≈ {formatRangeUsd(service.range_gtq)}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="bg-[#1A2530] p-8 lg:p-12 flex flex-col justify-between gap-8">
                    <div className="space-y-4">
                      <h2
                        className="text-3xl lg:text-4xl font-semibold text-[#F0EDE8]"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {label}
                      </h2>
                      <p className="text-[#8A95A5] leading-relaxed text-sm">
                        {description}
                      </p>

                      {/* Duración */}
                      <div className="flex items-center gap-2 text-sm text-[#8A95A5]">
                        <Clock size={14} className="text-[#FF6B35]" />
                        <span>{content.duration}:</span>
                        <span
                          className="text-[#F0EDE8]"
                          style={{ fontFamily: 'Space Mono, monospace' }}
                        >
                          {minM} – {maxM} {content.months}
                        </span>
                      </div>
                    </div>

                    {/* Highlights — solo los 4 principales */}
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {highlights.slice(0, 4).map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-[#8A95A5]">
                          <Check size={13} className="text-[#FF6B35] mt-0.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <a
                        href="#cta-section"
                        className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                      >
                        {content.cta}
                      </a>
                      <Link
                        href={`/services/${service.id}` as any}
                        className="flex-1 h-11 flex items-center justify-center gap-2 border border-[#27384A] text-[#F0EDE8] text-sm font-semibold rounded-lg hover:border-[#FF6B35]/40 hover:bg-[#1F2D3A] transition-colors"
                      >
                        {content.details}
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              </SectionReveal>
            )
          })}
        </div>
      </section>

      <CtaSection />
    </>
  )
}
