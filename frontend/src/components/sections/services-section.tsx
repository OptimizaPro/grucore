import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SectionReveal, StaggerReveal } from '@/components/ui/section-reveal'
import { ArrowUpRight } from 'lucide-react'

const ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  residential: ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75z" />
      <path d="M9 22V12h6v10" />
    </svg>
  ),
  remodeling: ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  commercial: ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="15" rx="1" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="17" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  ),
  design_build: ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  ),
  industrial: ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 22V12l5-5 5 5V7l5-5 5 5v15H2z" />
    </svg>
  ),
  kitchens_baths: ({ size = 20, className }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z" />
      <path d="M6 12V6a2 2 0 0 1 2-2h1" />
      <circle cx="10" cy="4" r="1" />
      <path d="M22 12H2" />
    </svg>
  ),
}

interface ServiceItem { id: string; title: string; description: string; tags: string[]; range: string }
interface ServicesData { eyebrow: string; title: string; subtitle: string; cta?: string; items: ServiceItem[] }

export function ServicesSection({ data }: { data?: ServicesData }) {
  const t = useTranslations('Home.services')
  const items = (data?.items ?? t.raw('items')) as ServiceItem[]

  return (
    <section className="py-24 bg-[#1A2530]" id="services" aria-label="Servicios">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <SectionReveal className="mb-16">
          <span
            className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-4"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {t('eyebrow')}
          </span>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <h2
              className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-[#F0EDE8] leading-tight max-w-2xl"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t('title')}
            </h2>
            <p className="text-[#8A95A5] max-w-sm text-sm leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </SectionReveal>

        {/* Grid de servicios */}
        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#27384A]"
          staggerDelay={0.07}
        >
          {items.map((item) => {
            const Icon = ICONS[item.id] ?? ICONS.residential
            return (
              <Link
                key={item.id}
                href={{ pathname: '/services/[slug]', params: { slug: item.id } }}
                className="group relative bg-[#1A2530] p-8 hover:bg-[#1F2D3A] hover:border-1 border-[#F54927] transition-colors duration-200 flex flex-col gap-5 min-h-[280px] h-full"
              >
                {/* Icono */}
                <div className="w-10 h-10 rounded-full border-1 border-gray-500 flex items-center justify-center text-[#FF6B35] group-hover:border-[#FF6B35] group-hover:bg-white transition-all duration-200">
                  <Icon size={18} />
                </div>

                {/* Texto */}
                <div className="flex-1 space-y-2">
                  <h3
                    className="text-xl font-semibold text-[#F0EDE8]"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#8A95A5] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tags + rango */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(item.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded border border-gray-500 text-[#8A95A5]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs text-[#FF6B35]"
                      style={{ fontFamily: 'Space Mono, monospace' }}
                    >
                      {item.range}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-[#8A95A5] group-hover:text-[#FF6B35] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </StaggerReveal>

        {/* CTA */}
        <SectionReveal delay={0.2} className="mt-12 flex justify-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8A95A5] hover:text-[#FF6B35] transition-colors border-b border-transparent hover:border-[#FF6B35]/50 pb-0.5"
          >
            {t('cta')}
            <ArrowUpRight size={14} />
          </Link>
        </SectionReveal>
      </div>
    </section>
  )
}
