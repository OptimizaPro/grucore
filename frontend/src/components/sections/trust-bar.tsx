'use client'

import { useTranslations } from 'next-intl'
import { AnimatedCounter } from '@/components/ui/animated-counter'

interface TrustStat { value: string; label: string }

export function TrustBar({ data }: { data?: TrustStat[] }) {
  const t = useTranslations('Home.trust')

  const items = data
    ? data.map((s, i) => ({
        value:  Number(s.value.replace(/\D/g, '')) || 0,
        suffix: s.value.replace(/[\d.]/g, ''),
        label:  s.label,
      }))
    : [
        { value: Number(t('projects_value')), suffix: '+', label: t('projects_label') },
        { value: Number(t('years_value')),    suffix: '+', label: t('years_label') },
        { value: Number(t('response_value')), suffix: 'h', label: t('response_label') },
        { value: Number(t('advisor_value')),  suffix: '',  label: t('advisor_label') },
      ]

  return (
    <section
      className="border-y border-[#27384A] bg-[#1F2D3A]/60 backdrop-blur-sm"
      aria-label="Métricas de confianza"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-1 py-8 px-4 text-center relative"
            >
              {/* Separador vertical */}
              {i > 0 && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-[#27384A]" />
              )}

              <AnimatedCounter
                value={item.value}
                suffix={item.suffix}
                className="text-4xl font-semibold text-[#FF6B35]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              />
              <span className="text-sm text-[#8A95A5] leading-snug max-w-[120px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
