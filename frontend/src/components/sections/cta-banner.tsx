'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, Phone } from 'lucide-react'

export function CtaBanner() {
  const t = useTranslations('Home.cta_banner')

  return (
    <section
      className="relative overflow-hidden bg-[#FF6B35]"
      aria-label="Llamada a la acción"
    >
      {/* Watermark */}
      <span
        aria-hidden
        className="pointer-events-none select-none absolute bottom-0 right-0
                   translate-y-[38%]
                   text-[clamp(5rem,13vw,12rem)] font-black leading-none
                   text-[#1A2530]/10 whitespace-nowrap"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {t('watermark')}
      </span>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

          {/* Left — headline + subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            <h2
              className="text-[clamp(2.2rem,6vw,4.5rem)] font-black text-[#1A2530] leading-none tracking-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t('headline_1')}
              <br />
              {t('headline_2')}
            </h2>
            <p className="mt-5 text-[#1A2530]/75 text-base leading-relaxed max-w-md">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Right — buttons */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 lg:flex-shrink-0"
          >
            {/* Primary CTA */}
            <button
              onClick={() =>
                document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="group inline-flex items-center justify-center gap-3
                         h-14 px-8 rounded-full
                         bg-[#1A2530] text-[#F0EDE8]
                         font-semibold text-sm tracking-wide
                         hover:bg-[#0F1923] active:scale-[0.97]
                         transition-all duration-200"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t('cta_primary')}
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>

            {/* Phone CTA */}
            <a
              href={`tel:${t('cta_phone').replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-3
                         h-14 px-8 rounded-full
                         border-2 border-[#1A2530]/30 text-[#1A2530]
                         font-semibold text-sm tracking-wide
                         hover:border-[#1A2530]/60 hover:bg-[#1A2530]/8
                         active:scale-[0.97] transition-all duration-200"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <Phone size={15} />
              {t('cta_phone')}
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
