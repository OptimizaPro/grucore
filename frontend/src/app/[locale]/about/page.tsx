import type { Metadata } from 'next'
import Image from 'next/image'
import { PageHero } from '@/components/ui/page-hero'
import { SectionReveal, StaggerReveal } from '@/components/ui/section-reveal'
import { CtaSection } from '@/components/sections/cta-section'
import { Link } from '@/i18n/navigation'
import { CheckCircle2, ArrowRight, Award } from 'lucide-react'
import { getCMSPage, blocks } from '@/lib/cms'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const cms = await getCMSPage('about', locale)
  return {
    title: cms ? `${cms.title} — Grucore` : 'Nosotros — Grucore',
    description: cms?.meta_description ?? 'Conoce al equipo detrás de Grucore, empresa guatemalteca de construcción y remodelación premium con más de 10 años de experiencia.',
  }
}

const TEAM_IMG  = 'https://images.unsplash.com/photo-1632041482049-c8b8a076fbf3?auto=format&fit=crop&w=1200&q=80'
const SITE_IMG  = 'https://images.unsplash.com/photo-1591588582259-e675bd2e6088?auto=format&fit=crop&w=1200&q=80'

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const cms = await getCMSPage('about', locale)

  const hero   = blocks(cms, 'hero')
  const story  = blocks(cms, 'story')
  const stats  = blocks(cms, 'stats')
  const values = blocks(cms, 'values')
  const diff   = blocks(cms, 'differentiators')
  const cta    = blocks(cms, 'mini_cta')

  const c = {
    eyebrow:               hero.eyebrow   ?? '',
    title:                 hero.title     ?? '',
    subtitle:              hero.subtitle  ?? '',
    story_eyebrow:         story.eyebrow  ?? '',
    story_title:           story.title    ?? '',
    story_p1:              story.p1       ?? '',
    story_p2:              story.p2       ?? '',
    story_p3:              story.p3       ?? '',
    stats:                 (stats.items   ?? []) as { value: string; label: string }[],
    values_eyebrow:        values.eyebrow ?? '',
    values_title:          values.title   ?? '',
    values:                (values.items  ?? []) as { number: string; title: string; description: string }[],
    differentiators_eyebrow: diff.eyebrow ?? '',
    differentiators_title:   diff.title   ?? '',
    differentiators:         (diff.items  ?? []) as string[],
    cta_title:    cta.title           ?? '',
    cta_sub:      cta.subtitle        ?? '',
    cta_btn:      cta.button_primary  ?? '',
    cta_projects: cta.button_secondary ?? '',
  }

  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        subtitle={c.subtitle}
        accentLast
        bgImage="https://plus.unsplash.com/premium_photo-1681691161744-06b1e2299ad5?auto=format&fit=crop&w=1600&q=60"
        size="md"
        split
        subtitleVariant="rule"
      />

      {/* Stats bar */}
      <section className="bg-[#131D28] border-y border-[#27384A]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* proyectos(+), años(+), respuesta(h), asesor('') */}
          {(() => {
            const DEFAULT_SUFFIXES = ['+', '+', 'h', '']
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {c.stats.map((stat, i) => {
                  const extracted = stat.value.replace(/[\d.]/g, '')
                  const num       = stat.value.replace(/\D/g, '')
                  const suffix    = extracted || DEFAULT_SUFFIXES[i] || ''
                  return (
                    <div key={stat.label} className="text-center">
                      <p
                        className="text-4xl font-bold text-[#FF6B35] mb-1"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {num}{suffix}
                      </p>
                      <p className="text-xs text-[#8A95A5] uppercase tracking-widest" style={{ fontFamily: 'Space Mono, monospace' }}>
                        {stat.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </section>

      {/* Historia */}
      <section className="py-24 bg-[#1A2530]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Texto */}
            <SectionReveal>
              <span
                className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-4"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                {c.story_eyebrow}
              </span>
              <h2
                className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold text-[#F0EDE8] leading-tight mb-8"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {c.story_title}
              </h2>
              <div className="space-y-5 text-[#8A95A5] leading-relaxed">
                <p>{c.story_p1}</p>
                <p>{c.story_p2}</p>
                <p className="text-[#F0EDE8] font-medium border-l-2 border-[#FF6B35] pl-4">
                  {c.story_p3}
                </p>
              </div>
            </SectionReveal>

            {/* Imágenes apiladas */}
            <SectionReveal delay={0.15} className="relative h-[480px]">
              <div className="absolute inset-0 rounded-xl overflow-hidden border border-[#27384A]">
                <Image
                  src={SITE_IMG}
                  alt="Equipo Grucore en obra"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[#1A2530]/40" />
              </div>
              {/* Badge flotante */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-[#131D28]/90 backdrop-blur-sm border border-[#27384A] rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                    <Award size={18} className="text-[#FF6B35]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {locale === 'es' ? 'Empresa guatemalteca certificada' : 'Certified Guatemalan company'}
                    </p>
                    <p className="text-xs text-[#8A95A5] mt-0.5">
                      {locale === 'es' ? 'Desde 2016 · Ciudad de Guatemala' : 'Since 2016 · Guatemala City'}
                    </p>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="py-24 bg-[#1F2D3A]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionReveal className="mb-16">
            <span
              className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-4"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {c.values_eyebrow}
            </span>
            <h2
              className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-[#F0EDE8] leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {c.values_title}
            </h2>
          </SectionReveal>

          <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.08}>
            {c.values.map((v) => (
              <div
                key={v.number}
                className="p-8 rounded-xl border border-[#27384A] bg-[#1A2530] hover:border-[#FF6B35]/20 transition-colors duration-300"
              >
                <span
                  className="text-xs font-semibold tracking-[0.15em] text-[#FF6B35]/50 uppercase block mb-4"
                  style={{ fontFamily: 'Space Mono, monospace' }}
                >
                  {v.number}
                </span>
                <h3
                  className="text-xl font-semibold text-[#F0EDE8] mb-3"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {v.title}
                </h3>
                <p className="text-sm text-[#8A95A5] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* Por qué elegirnos */}
      <section className="py-24 bg-[#1A2530]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Imagen */}
            <SectionReveal className="relative h-[420px] order-2 lg:order-1">
              <div className="absolute inset-0 rounded-xl overflow-hidden border border-[#27384A]">
                <Image
                  src={TEAM_IMG}
                  alt={locale === 'es' ? 'Equipo de trabajo Grucore' : 'Grucore work team'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[#1A2530]/50" />
              </div>
            </SectionReveal>

            {/* Lista */}
            <SectionReveal delay={0.1} className="order-1 lg:order-2">
              <span
                className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-4"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                {c.differentiators_eyebrow}
              </span>
              <h2
                className="text-[clamp(1.75rem,4vw,2.75rem)] font-semibold text-[#F0EDE8] leading-tight mb-10"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {c.differentiators_title}
              </h2>
              <ul className="space-y-4">
                {c.differentiators.map((d) => (
                  <li key={d} className="flex items-start gap-3 text-sm text-[#8A95A5]">
                    <CheckCircle2 size={16} className="text-[#FF6B35] flex-shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Mini CTA interno */}
      <section className="py-20 bg-[#131D28] border-t border-[#27384A]">
        <SectionReveal>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2
              className="text-3xl md:text-4xl font-semibold text-[#F0EDE8] mb-4"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {c.cta_title}
            </h2>
            <p className="text-[#8A95A5] mb-10">{c.cta_sub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#cta-section"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
              >
                {c.cta_btn}
              </a>
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 h-12 px-8 border border-[#27384A] text-[#F0EDE8] text-sm font-semibold rounded-lg hover:border-[#FF6B35]/40 hover:bg-[#1F2D3A] transition-colors"
              >
                {c.cta_projects} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </section>

      <CtaSection />
    </>
  )
}
