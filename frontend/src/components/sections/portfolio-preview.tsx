import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SectionReveal, StaggerReveal } from '@/components/ui/section-reveal'
import { ArrowRight, MapPin, Maximize2, Clock } from 'lucide-react'
import { PROJECTS } from '@/lib/projects-data'

// Primeros 3 proyectos destacados para el home
const FEATURED = PROJECTS.filter((p) => p.is_featured).slice(0, 3)

export function PortfolioPreview() {
  const t = useTranslations('Home.portfolio')

  return (
    <section className="py-24 bg-[#1A2530]" aria-label="Portafolio de proyectos">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <SectionReveal className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span
              className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-4"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {t('eyebrow')}
            </span>
            <h2
              className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-[#F0EDE8] leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t('title')}
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8A95A5] hover:text-[#FF6B35] transition-colors border-b border-transparent hover:border-[#FF6B35]/50 pb-0.5 whitespace-nowrap"
          >
            {t('cta')} <ArrowRight size={14} />
          </Link>
        </SectionReveal>

        {/* Cards */}
        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          staggerDelay={0.1}
        >
          {FEATURED.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}` as any}
              className="group relative overflow-hidden rounded-xl border border-[#27384A] hover:border-[#FF6B35]/30 transition-all duration-300 flex flex-col"
            >
              {/* Imagen */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={project.cover_image}
                  alt={project.title.es}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2530]/80 via-[#1A2530]/20 to-transparent" />
                {/* Tipo badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-xs px-3 py-1 rounded-full border border-[#FF6B35]/40 text-[#FF6B35] bg-[#1A2530]/60 backdrop-blur-sm">
                    {project.type_label.es}
                  </span>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#FF6B35]/0 group-hover:bg-[#FF6B35]/5 transition-colors duration-300" />
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col gap-4 bg-[#1F2D3A] flex-1">
                <h3
                  className="text-xl font-semibold text-[#F0EDE8] group-hover:text-[#FF6B35] transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {project.title.es}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
                    <MapPin size={12} className="text-[#FF6B35] flex-shrink-0" />
                    <span className="truncate">{project.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
                    <Maximize2 size={12} className="text-[#FF6B35] flex-shrink-0" />
                    <span>{project.area_m2.toLocaleString()} m²</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
                    <Clock size={12} className="text-[#FF6B35] flex-shrink-0" />
                    <span>{project.duration_months} meses</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
