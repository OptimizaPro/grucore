import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { PROJECTS, getProject } from '@/lib/projects-data'
import { PageHero } from '@/components/ui/page-hero'
import { SectionReveal, StaggerReveal } from '@/components/ui/section-reveal'
import { CtaSection } from '@/components/sections/cta-section'
import { MapPin, Maximize2, Clock, Calendar, Layers, ArrowLeft, ArrowRight } from 'lucide-react'
import { Check } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { BeforeAfterSlider } from '@/components/ui/before-after-slider'

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: `${project.title.es} — Grucore`,
    description: project.description.es,
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  const locale = (await getLocale()) as 'es' | 'en'
  const project = getProject(slug)

  if (!project) notFound()

  const title = locale === 'es' ? project.title.es : project.title.en
  const typeLabel = locale === 'es' ? project.type_label.es : project.type_label.en
  const description = locale === 'es' ? project.description.es : project.description.en
  const highlights = locale === 'es' ? project.highlights.es : project.highlights.en

  // Proyectos relacionados (mismo tipo, excluyendo el actual)
  const related = PROJECTS.filter((p) => p.type === project.type && p.slug !== slug).slice(0, 2)

  const t = {
    back:       { es: 'Volver al portafolio', en: 'Back to portfolio' },
    overview:   { es: 'Ficha del proyecto', en: 'Project overview' },
    area:       { es: 'Superficie', en: 'Area' },
    floors:     { es: 'Niveles', en: 'Floors' },
    duration:   { es: 'Duración', en: 'Duration' },
    months:     { es: 'meses', en: 'months' },
    year:       { es: 'Año', en: 'Year' },
    type:       { es: 'Tipo', en: 'Type' },
    location:   { es: 'Ubicación', en: 'Location' },
    highlights: { es: 'Puntos destacados', en: 'Highlights' },
    related:    { es: 'Proyectos relacionados', en: 'Related projects' },
    cta:        { es: 'Tengo un proyecto similar', en: 'I have a similar project' },
  }

  const stats = [
    { icon: Maximize2, label: t.area[locale],    value: `${project.area_m2.toLocaleString()} m²` },
    { icon: Layers,    label: t.floors[locale],  value: `${project.floors}` },
    { icon: Clock,     label: t.duration[locale], value: `${project.duration_months} ${t.months[locale]}` },
    { icon: Calendar,  label: t.year[locale],    value: `${project.year}` },
  ]

  return (
    <>
      <PageHero
        eyebrow={typeLabel}
        title={title}
        subtitle={`${project.city} · ${project.location}`}
        bgImage={project.cover_image}
        accentLast
        size="lg"
      />

      <div className="bg-[#1A2530]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-[#8A95A5] hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={14} />
            {t.back[locale]}
          </Link>
        </div>
      </div>

      <section className="bg-[#1A2530] pb-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">

          {/* Imagen principal placeholder + stats */}
          <SectionReveal>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Imagen grande o slider antes/después */}
              <div className="lg:col-span-2 h-[400px]">
                {project.before_image && project.after_image ? (
                  <BeforeAfterSlider
                    beforeImage={project.before_image}
                    afterImage={project.after_image}
                    beforeLabel={locale === 'es' ? 'Antes' : 'Before'}
                    afterLabel={locale === 'es' ? 'Después' : 'After'}
                    dragHint={locale === 'es' ? 'Desliza para comparar' : 'Drag to compare'}
                    height="h-[400px]"
                  />
                ) : (
                  <div className="rounded-xl overflow-hidden h-full relative border border-[#27384A]">
                    <Image
                      src={project.cover_image}
                      alt={title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2530]/70 via-[#1A2530]/10 to-transparent" />
                    <div className="absolute top-6 left-6">
                      <span className="px-3 py-1.5 text-xs rounded-full border border-[#FF6B35]/40 text-[#FF6B35] bg-[#1A2530]/70 backdrop-blur-sm">
                        {typeLabel}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats sidebar */}
              <div className="flex flex-col gap-4">
                {/* Ficha */}
                <div className="p-6 rounded-xl border border-[#27384A] bg-[#1F2D3A] space-y-4">
                  <h3
                    className="text-sm font-semibold text-[#8A95A5] uppercase tracking-widest"
                    style={{ fontFamily: 'Space Mono, monospace' }}
                  >
                    {t.overview[locale]}
                  </h3>
                  {stats.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-4 py-3 border-b border-[#27384A] last:border-0">
                      <div className="flex items-center gap-2 text-sm text-[#8A95A5]">
                        <Icon size={13} className="text-[#FF6B35]" />
                        {label}
                      </div>
                      <span
                        className="text-sm font-semibold text-[#F0EDE8]"
                        style={{ fontFamily: 'Space Mono, monospace' }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div className="flex items-center gap-2 text-sm text-[#8A95A5]">
                      <MapPin size={13} className="text-[#FF6B35]" />
                      {t.location[locale]}
                    </div>
                    <span className="text-sm text-[#F0EDE8] text-right max-w-[160px]">
                      {project.city}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href="#cta-section"
                  className="w-full h-12 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                >
                  {t.cta[locale]}
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </SectionReveal>

          {/* Descripción + highlights */}
          <SectionReveal delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2
                  className="text-2xl font-semibold text-[#F0EDE8] mb-4"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {locale === 'es' ? 'Sobre el proyecto' : 'About the project'}
                </h2>
                <p className="text-[#8A95A5] leading-relaxed">{description}</p>
              </div>
              <div>
                <h2
                  className="text-2xl font-semibold text-[#F0EDE8] mb-4"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {t.highlights[locale]}
                </h2>
                <ul className="space-y-3">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 text-sm text-[#8A95A5]">
                      <Check size={14} className="text-[#FF6B35] mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionReveal>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#27384A] text-[#8A95A5]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Proyectos relacionados */}
          {related.length > 0 && (
            <div>
              <h2
                className="text-2xl font-semibold text-[#F0EDE8] mb-8"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {t.related[locale]}
              </h2>
              <StaggerReveal
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                staggerDelay={0.1}
              >
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/projects/${rel.slug}` as any}
                    className="group flex gap-4 p-4 rounded-xl border border-[#27384A] hover:border-[#FF6B35]/30 bg-[#1F2D3A] transition-colors"
                  >
                    <div className="w-20 h-20 rounded-lg flex-shrink-0 relative overflow-hidden">
                      <Image
                        src={rel.cover_image}
                        alt={locale === 'es' ? rel.title.es : rel.title.en}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#FF6B35] mb-1" style={{ fontFamily: 'Space Mono, monospace' }}>
                        {locale === 'es' ? rel.type_label.es : rel.type_label.en}
                      </p>
                      <h3
                        className="text-base font-semibold text-[#F0EDE8] group-hover:text-[#FF6B35] transition-colors truncate"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {locale === 'es' ? rel.title.es : rel.title.en}
                      </h3>
                      <p className="text-xs text-[#8A95A5] mt-1">{rel.city} · {rel.area_m2} m²</p>
                    </div>
                  </Link>
                ))}
              </StaggerReveal>
            </div>
          )}
        </div>
      </section>

      <CtaSection />
    </>
  )
}
