'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { StaggerReveal } from '@/components/ui/section-reveal'
import { PROJECTS, PROJECT_TYPES, type ProjectType } from '@/lib/projects-data'
import { MapPin, Maximize2, Clock, Calendar, ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function ProjectsPage() {
  const locale = useLocale() as 'es' | 'en'
  const [activeFilter, setActiveFilter] = useState<ProjectType | 'all'>('all')

  const filtered = activeFilter === 'all'
    ? PROJECTS
    : PROJECTS.filter((p) => p.type === activeFilter)

  const BG_IMAGE = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=60'

  const content = {
    eyebrow:  { es: 'Portafolio', en: 'Portfolio' },
    title:    { es: 'Proyectos que hablan por sí solos', en: 'Projects that speak for themselves' },
    accent:   { es: 'Proyectos', en: 'Projects' },
    subtitle: { es: 'Más de 50 proyectos ejecutados en Guatemala. Cada uno con cronograma cumplido, presupuesto respetado y cliente satisfecho.', en: 'Over 50 projects completed in Guatemala. Each one with schedule met, budget respected and client satisfied.' },
    area:     { es: 'm² construidos', en: 'sq meters built' },
    duration: { es: 'duración', en: 'duration' },
    months:   { es: 'meses', en: 'months' },
    year_label: { es: 'Año', en: 'Year' },
    view:     { es: 'Ver proyecto', en: 'View project' },
  }

  return (
    <>
      {/* ── Hero editorial: título izquierda + subtítulo derecha ── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[#111C25]" />
        <Image
          src={BG_IMAGE}
          alt=""
          fill
          className="object-cover object-center"
          priority
          quality={55}
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg, rgba(17,28,37,0.97) 0%, rgba(17,28,37,0.85) 50%, rgba(17,28,37,0.60) 100%)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-48"
          style={{ background: 'linear-gradient(to bottom, transparent, #1A2530)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-10">
            <span className="w-8 h-px bg-[#FF6B35]" />
            <span
              className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {content.eyebrow[locale]}
            </span>
          </div>

          {/* Título + Subtítulo split */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-16">
            <h1
              className="text-[clamp(2.5rem,4.5vw,5rem)] font-bold text-[#F0EDE8] leading-[0.95] tracking-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <span style={{ color: 'transparent', WebkitTextStroke: '2px #FF6B35' }}>
                {content.accent[locale]}
              </span>
              {content.title[locale].replace(content.accent[locale], '')}
            </h1>

            <div className="border-t-2 border-[#FF6B35]/50 pt-5 lg:max-w-[300px] flex-shrink-0">
              <p
                className="text-sm text-[#B8C4CE] leading-relaxed"
              >
                {content.subtitle[locale]}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1A2530] pb-24">
        <div className="max-w-7xl mx-auto px-6">

          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap py-8 border-b border-[#27384A] mb-12">
            {PROJECT_TYPES.map(({ value, label_es, label_en }) => {
              const label = locale === 'es' ? label_es : label_en
              const isActive = activeFilter === value
              return (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FF6B35] text-[#1A2530]'
                      : 'border border-gray-600 text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#F0EDE8]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
            <span className="ml-auto text-xs text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
              {filtered.length} {locale === 'es' ? 'proyectos' : 'projects'}
            </span>
          </div>

          {/* Grid de proyectos */}
          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            staggerDelay={0.07}
          >
            {filtered.map((project) => {
              const title = locale === 'es' ? project.title.es : project.title.en
              const typeLabel = locale === 'es' ? project.type_label.es : project.type_label.en

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}` as any}
                  className="group relative rounded-xl border border-[#27384A] hover:border-[#FF6B35]/30 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Imagen */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={project.cover_image}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {/* Overlay oscuro */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A2530]/80 via-[#1A2530]/20 to-transparent" />
                    {/* Badge tipo */}
                    <div className="absolute top-4 left-4">
                      <span className="text-xs px-3 py-1 rounded-full border border-[#FF6B35]/40 text-[#FF6B35] bg-[#1A2530]/60 backdrop-blur-sm">
                        {typeLabel}
                      </span>
                    </div>
                    {/* Featured badge */}
                    {project.is_featured && (
                      <div className="absolute top-4 right-4">
                        <span className="text-xs px-2 py-1 rounded bg-[#FF6B35] text-[#1A2530] font-semibold">
                          {locale === 'es' ? 'Destacado' : 'Featured'}
                        </span>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#FF6B35]/0 group-hover:bg-[#FF6B35]/5 transition-colors duration-300 flex items-center justify-center">
                      <ArrowUpRight
                        size={24}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-4 p-5 bg-[#1F2D3A] flex-1">
                    <div>
                      <h3
                        className="text-lg font-semibold text-[#F0EDE8] group-hover:text-[#FF6B35] transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {title}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#8A95A5]">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#FF6B35]" />
                        <span className="truncate">{project.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Maximize2 size={11} className="text-[#FF6B35]" />
                        <span>{project.area_m2.toLocaleString()} m²</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-[#FF6B35]" />
                        <span>{project.duration_months} {content.months[locale]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-[#FF6B35]" />
                        <span>{project.year}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </StaggerReveal>

          {filtered.length === 0 && (
            <div className="py-24 text-center text-[#8A95A5]">
              {locale === 'es' ? 'No hay proyectos en esta categoría.' : 'No projects in this category.'}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
