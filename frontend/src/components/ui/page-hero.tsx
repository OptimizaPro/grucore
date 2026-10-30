'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

/**
 * subtitleVariant controla el tratamiento visual del panel de subtítulo en layout split:
 *  'border-top'  — línea naranja superior            (Proyectos usa su propio hero inline)
 *  'border-left' — línea naranja izquierda           (Servicios)
 *  'card'        — tarjeta con borde sutil y bg      (Contacto)
 *  'rule'        — regla blanca fina + texto alineado (Nosotros)
 */
type SubtitleVariant = 'border-top' | 'border-left' | 'card' | 'rule'

interface PageHeroProps {
  eyebrow: string
  title: string
  subtitle?: string
  accent?: string
  accentLast?: boolean
  bgImage?: string
  className?: string
  titleClassName?: string
  size?: 'md' | 'lg'
  /** Activa el layout editorial: título izquierda, subtítulo derecha */
  split?: boolean
  subtitleVariant?: SubtitleVariant
}

function applyAccent(title: string, accent?: string, accentLast?: boolean): string {
  const strokeSpan = (word: string) =>
    `<span style="color:transparent;-webkit-text-stroke:2px #FF6B35">${word}</span>`
  const nowrap = (content: string) =>
    `<span style="white-space:nowrap">${content}</span>`

  if (accent) {
    return title.replace(accent, strokeSpan(accent))
  }
  if (accentLast) {
    const words = title.split(' ')
    if (words.length > 1) {
      const last       = words.pop()!
      const secondLast = words.length > 0 ? words.pop() : null
      // Solo aplicar nowrap si hay un prefijo (3+ palabras), para evitar
      // que el grupo se parta. Con 2 palabras solo stroke sin nowrap.
      const group      = secondLast
        ? `${secondLast} ${strokeSpan(last)}`
        : strokeSpan(last)
      const prefix = words.length > 0 ? `${words.join(' ')} ` : ''
      const wrapped = (prefix && secondLast) ? `${prefix}${nowrap(group)}` : `${prefix}${group}`
      return wrapped
    }
  }
  return title
}

const SUBTITLE_VARIANTS: Record<SubtitleVariant, string> = {
  'border-top':  'border-t-2 border-[#FF6B35]/50 pt-5 max-w-[300px]',
  'border-left': 'border-l-2 border-[#FF6B35]/60 pl-5 max-w-[280px] py-1',
  'card':        'bg-[#0D1820]/70 backdrop-blur-sm border border-[#2E4156] rounded-xl p-6 max-w-[480px] w-full',
  'rule':        'border-t border-[#F0EDE8]/20 pt-5 max-w-[320px]',
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  accent,
  accentLast,
  bgImage,
  className,
  titleClassName,
  size = 'md',
  split = false,
  subtitleVariant = 'border-top',
}: PageHeroProps) {
  const headlineSize = size === 'lg'
    ? 'text-[clamp(3rem,10vw,9.5rem)]'
    : 'text-[clamp(2rem,6vw,5rem)]'

  const renderedTitle = applyAccent(title, accent, accentLast)

  const item = (delay: number) => ({
    hidden:  { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const } },
  })

  return (
    <section
      className={cn('relative pt-36 pb-20 overflow-hidden', className)}
      aria-label="Page hero"
    >
      {/* ── Fondo ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[#111C25]" />

      {bgImage ? (
        <>
          <Image
            src={bgImage}
            alt=""
            fill
            className="object-cover object-center"
            priority
            quality={55}
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(105deg, rgba(17,28,37,0.96) 0%, rgba(17,28,37,0.82) 45%, rgba(17,28,37,0.55) 100%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-48"
            style={{ background: 'linear-gradient(to bottom, transparent, #1A2530)' }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,107,53,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,107,53,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: 'linear-gradient(to bottom, transparent, #1A2530)' }}
          />
        </>
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 70%, rgba(255,107,53,0.08) 0%, transparent 65%)',
        }}
      />

      <motion.div
        className="absolute left-0 top-0 bottom-0 w-px hidden lg:block"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,107,53,0.4) 45%, transparent 100%)',
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* ── Contenido ─────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Eyebrow */}
        <motion.div
          variants={item(0)}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mb-7"
        >
          <span
            className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {eyebrow}
          </span>
        </motion.div>

        {split && subtitle ? (
          /* ── Layout editorial split ── */
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 lg:gap-16">
            <motion.h1
              variants={item(0.1)}
              initial="hidden"
              animate="visible"
              className={cn(
                headlineSize,
                'font-bold text-[#F0EDE8] leading-[0.95] tracking-tight',
                titleClassName,
              )}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
              dangerouslySetInnerHTML={{ __html: renderedTitle }}
            />
            <motion.div
              variants={item(0.25)}
              initial="hidden"
              animate="visible"
              className={cn('flex-shrink-0', SUBTITLE_VARIANTS[subtitleVariant])}
            >
              <p className="text-sm text-[#B8C4CE] leading-relaxed">
                {subtitle}
              </p>
            </motion.div>
          </div>
        ) : (
          /* ── Layout default apilado ── */
          <>
            <motion.h1
              variants={item(0.1)}
              initial="hidden"
              animate="visible"
              className={cn(
                headlineSize,
                'font-bold text-[#F0EDE8] leading-[0.95] tracking-tight max-w-3xl',
                titleClassName,
              )}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
              dangerouslySetInnerHTML={{ __html: renderedTitle }}
            />
            {subtitle && (
              <motion.p
                variants={item(0.22)}
                initial="hidden"
                animate="visible"
                className="mt-5 text-[0.95rem] text-[#B8C4CE] max-w-lg leading-relaxed font-medium"
              >
                {subtitle}
              </motion.p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
