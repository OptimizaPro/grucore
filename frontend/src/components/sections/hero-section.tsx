'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { BlueprintGrid } from '@/components/ui/blueprint-grid'

const HERO_IMG = 'https://images.unsplash.com/photo-1621511075938-f03482369feb?auto=format&fit=crop&w=1600&q=60'

interface HeroData {
  eyebrow: string; headline_1: string; headline_2: string; headline_3: string
  cta_primary: string; cta_secondary: string
}

export function HeroSection({ data }: { data?: HeroData }) {
  const t = useTranslations('Home.hero')

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  }

  const lineVariants = {
    hidden:  { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  }

  const fadeVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, delay: 0.5 } },
  }

  return (
    <section
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Foto de fondo — muy oscura para preservar legibilidad del texto */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={HERO_IMG}
          alt="Fondo de la sección hero"
          fill
          className="object-cover object-center"
          priority
          quality={60}
          sizes="100vw"
        />
      </div>
      {/* Capas de oscurecimiento */}
      <div className="absolute inset-0 pointer-events-none bg-[#1A2530]/80" />
      <BlueprintGrid />
      {/* Gradiente radial central */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,107,53,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Línea decorativa izquierda */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-px hidden lg:block"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,107,53,0.3) 40%, transparent 100%)' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-32 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-0"
        >
          {/* Eyebrow */}
          <motion.div variants={lineVariants} className="flex items-center gap-3 mb-8">
            <span className="w-8 h-px bg-[#FF6B35]" />
            <span
              className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {data?.eyebrow ?? t('eyebrow')}
            </span>
          </motion.div>

          {/* Headline — tres líneas */}
          <div
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <motion.h1 variants={lineVariants} className="leading-none overflow-visible">
              <span
                className="block text-[clamp(3rem,9vw,8rem)] font-semibold text-[#F0EDE8] tracking-tight"
              >
                {data?.headline_1 ?? t('headline_1')}
              </span>
              <span
                className="block text-[clamp(3rem,9vw,8rem)] font-semibold tracking-tight"
                style={{ color: 'transparent', WebkitTextStroke: '2px #FF6B35' }}
              >
                {data?.headline_2 ?? t('headline_2')}
              </span>
              <span
                className="block text-[clamp(3rem,9vw,8rem)] font-semibold text-[#F0EDE8] tracking-tight"
              >
                {data?.headline_3 ?? t('headline_3')}
              </span>
            </motion.h1>
          </div>

          {/* CTAs */}
          <motion.div
            variants={fadeVariants}
            className="flex flex-col sm:flex-row gap-4 mt-12"
          >
            <button
              onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group inline-flex items-center gap-3 h-14 px-8 bg-[#FF6B35] text-[#1A2530] font-semibold text-base rounded-lg hover:bg-[#FF9E7A] transition-all duration-200 active:scale-[0.98]"
            >
              {data?.cta_primary ?? t('cta_primary')}
              <ArrowRight
                size={18}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>

            <Link
              href="/projects"
              className="inline-flex items-center gap-3 h-14 px-8 border border-[#FF6B35] text-gray-200 font-semibold text-base rounded-lg hover:border-[#FF6B35]/50 hover:bg-[#27384A] transition-all duration-200"
            >
              {data?.cta_secondary ?? t('cta_secondary')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Indicador de scroll */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-xs text-[#8A95A5] tracking-widest uppercase" style={{ fontFamily: 'Space Mono, monospace' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} className="text-[#8A95A5]" />
          </motion.div>
        </motion.div>

        {/* Circle CTA */}
        <motion.div
          className="absolute bottom-16 right-8 sm:right-12 lg:right-20 hidden sm:block"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ scale: [1, 1.07, 1] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          >
          <Link
            href="/cotizar"
            aria-label="Cotización rápida"
            className="relative w-[136px] h-[136px] lg:w-[156px] lg:h-[156px] rounded-full
                       border border-[#FF6B35]/50 bg-[#1A2530]/70 backdrop-blur-sm
                       hover:bg-[#FF6B35] hover:border-[#FF6B35] group
                       transition-colors duration-300 flex items-center justify-center"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* Rotating text ring */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                <defs>
                  <path
                    id="hero-circle-path"
                    d="M 50,50 m -39,0 a 39,39 0 1,1 78,0 a 39,39 0 1,1 -78,0"
                  />
                </defs>
                <text
                  className="fill-[#FF6B35] group-hover:fill-[#1A2530] transition-colors duration-300"
                  style={{ fontSize: '7.2px', letterSpacing: '0.12em', fontFamily: 'Space Mono, monospace', fontWeight: 700 }}
                >
                  <textPath href="#hero-circle-path" startOffset="0%">
                    GRUCORE · COTIZAR · CONSTRUIMOS · REMODELAMOS ·{' '}
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* Arrow central */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ArrowUpRight
                size={30}
                className="text-[#FF6B35] group-hover:text-[#1A2530] transition-colors duration-300"
                strokeWidth={1.5}
              />
            </div>
          </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
