'use client'

import { useTranslations } from 'next-intl'
import { SectionReveal, StaggerReveal } from '@/components/ui/section-reveal'

interface ProcessData {
  eyebrow: string; title: string
  steps: Array<{ number: string; title: string; description: string }>
}

export function ProcessSection({ data }: { data?: ProcessData }) {
  const t = useTranslations('Home.process')
  const steps = (data?.steps ?? t.raw('steps')) as Array<{ number: string; title: string; description: string }>

  return (
    <section className="py-24 bg-[#1F2D3A]" aria-label="Proceso de trabajo">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <SectionReveal className="mb-20">
          <span
            className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-4"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {data?.eyebrow ?? t('eyebrow')}
          </span>
          <h2
            className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-[#F0EDE8] leading-tight max-w-2xl"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {data?.title ?? t('title')}
          </h2>
        </SectionReveal>

        {/* Timeline + Pasos */}
        <div className="relative">

          {/* Línea conectora desktop — entre marcadores */}
          <div className="hidden lg:block absolute top-5 left-[calc(100%/8)] right-[calc(100%/8)] h-px z-0">
            <div className="w-full h-full" style={{
              background: 'linear-gradient(90deg, #FF6B35 0%, #27384A 30%, #27384A 70%, #FF6B35 100%)'
            }} />
          </div>

          {/* Marcadores desktop */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5 mb-8 relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-[#FF6B35]/50 bg-[#1F2D3A] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
                </div>
                <span
                  className="text-xs text-[#8A95A5] tracking-widest"
                  style={{ fontFamily: 'Space Mono, monospace' }}
                >
                  {step.number}
                </span>
              </div>
            ))}
          </div>

          {/* Cards */}
          <StaggerReveal
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            staggerDelay={0.1}
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#1A2530] border border-[#27384A]/80 hover:border-[#FF6B35]/30 hover:-translate-y-2 hover:shadow-[0_24px_48px_rgba(0,0,0,0.4)] transition-all duration-300 cursor-default"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B35]/0 to-transparent group-hover:via-[#FF6B35] transition-all duration-500" />

                {/* Watermark número */}
                <div
                  className="absolute -top-2 -right-2 text-[7rem] font-black leading-none select-none text-[#F0EDE8]/[0.03] group-hover:text-[#FF6B35]/[0.07] transition-colors duration-300"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                  aria-hidden
                >
                  {step.number}
                </div>

                {/* Contenido */}
                <div className="relative p-7 flex flex-col gap-5 h-full">
                  {/* Badge número mobile (oculto en desktop donde está el marcador) */}
                  <div className="lg:hidden w-10 h-10 rounded-lg border border-[#FF6B35]/30 bg-[#FF6B35]/5 flex items-center justify-center self-start">
                    <span
                      className="text-sm font-bold text-[#FF6B35]"
                      style={{ fontFamily: 'Space Mono, monospace' }}
                    >
                      {step.number}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3
                      className="text-lg font-semibold text-[#F0EDE8] group-hover:text-white transition-colors duration-300 leading-snug"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#8A95A5] leading-relaxed group-hover:text-[#A8B5C2] transition-colors duration-300">
                      {step.description}
                    </p>
                  </div>

                  {/* Indicador inferior */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#27384A]/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]/40 group-hover:bg-[#FF6B35] transition-colors duration-300" />
                    <div className="flex-1 h-px bg-[#27384A]/60 group-hover:bg-[#FF6B35]/20 transition-colors duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </div>
    </section>
  )
}
