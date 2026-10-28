import { useTranslations } from 'next-intl'
import { SectionReveal, StaggerReveal } from '@/components/ui/section-reveal'
import { Check, ArrowRight } from 'lucide-react'

interface PricingTier {
  tag?: string; category?: string; title: string; description: string
  price?: string; range_gtq?: string; range_usd?: string
  duration: string; highlights?: string[]; featured?: boolean
}
interface PricingData {
  eyebrow: string; title: string; subtitle: string; disclaimer: string; cta?: string
  tiers: PricingTier[]
}

export function PricingSection({ data }: { data?: PricingData }) {
  const t = useTranslations('Home.pricing')
  const items = (data?.tiers ?? t.raw('items')) as PricingTier[]

  return (
    <section className="py-24 bg-[#131D28] border-t border-[#27384A]/60" aria-label="Transparencia de precios">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <SectionReveal className="mb-6">
          <span
            className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-6"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {data?.eyebrow ?? t('eyebrow')}
          </span>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <h2
              className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-[#F0EDE8] leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {data?.title ?? t('title')}
            </h2>
            <p className="text-sm text-[#8A95A5] leading-relaxed">
              {data?.subtitle ?? t('subtitle')}
            </p>
          </div>
        </SectionReveal>

        {/* Cards */}
        <StaggerReveal
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          staggerDelay={0.1}
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col rounded-xl border p-8 ${
                item.featured
                  ? 'border-[#FF6B35]/50 bg-[#243344]'
                  : 'border-[#2E4156] bg-[#1F2D3A]'
              }`}
            >
              {item.featured && (
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent" />
              )}

              {/* Category */}
              <span
                className="text-xs font-semibold tracking-widest mb-4"
                style={{
                  fontFamily: 'Space Mono, monospace',
                  color: item.featured ? '#FF6B35' : '#8A95A5',
                }}
              >
                {item.tag ?? item.category}
              </span>

              {/* Title + description */}
              <h3
                className="text-2xl font-semibold text-[#F0EDE8] mb-2"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[#8A95A5] mb-6 leading-relaxed">
                {item.description}
              </p>

              {/* Rango de precio */}
              <div className="py-5 border-y border-[#27384A] mb-6 space-y-1">
                <div
                  className="text-2xl font-semibold text-[#F0EDE8]"
                  style={{ fontFamily: 'Space Mono, monospace', letterSpacing: '-0.02em' }}
                >
                  {item.price ?? item.range_gtq}
                </div>
                {item.range_usd && (
                <div
                  className="text-sm text-[#B0B8C4]"
                  style={{ fontFamily: 'Space Mono, monospace' }}
                >
                  ≈ {item.range_usd}
                </div>
                )}
                <div className="text-xs text-[#8A95A5] pt-1">
                  Duración estimada: {item.duration}
                </div>
              </div>

              {/* Highlights */}
              {item.highlights && item.highlights.length > 0 && (
              <ul className="flex-1 space-y-2.5 mb-8">
                {item.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-sm text-[#8A95A5]">
                    <Check size={14} className="text-[#FF6B35] mt-0.5 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              )}

              {/* CTA */}
              <a
                href="#cta-section"
                className={`w-full h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-200 ${
                  item.featured
                    ? 'bg-[#FF6B35] text-[#1A2530] hover:bg-[#FF8557]'
                    : 'border border-[#27384A] text-[#F0EDE8] hover:border-[#FF6B35]/50 hover:bg-[#27384A]'
                }`}
              >
                {data?.cta ?? t('cta')} <ArrowRight size={14} />
              </a>
            </div>
          ))}
        </StaggerReveal>

        {/* Disclaimer */}
        <SectionReveal delay={0.3} className="mt-8 text-center">
          <p className="text-xs text-[#8A95A5]">{data?.disclaimer ?? t('disclaimer')}</p>
        </SectionReveal>
      </div>
    </section>
  )
}
