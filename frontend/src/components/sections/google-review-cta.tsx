'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ?? 'https://g.page/r/grucore/review'

// Estrella SVG reutilizable
function Star({ filled = true }: { filled?: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? '#FF6B35' : 'none'}
        stroke="#FF6B35"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GoogleReviewCta() {
  const t = useTranslations('Home.google_review')

  return (
    <section
      className="relative overflow-hidden bg-[#1F2D3A] border-t border-[#27384A]/60 py-20"
      aria-label="Dejar reseña en Google"
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full
                   bg-[#FF6B35]/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full
                   bg-[#FF6B35]/8 blur-3xl"
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Google logo + label */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-label="Google">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span
              className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {t('eyebrow')}
            </span>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-6" aria-label="5 estrellas">
            {[...Array(5)].map((_, i) => <Star key={i} />)}
          </div>

          {/* Headline */}
          <h2
            className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white leading-tight mb-4"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {t('title')}
          </h2>

          <p className="text-gray-400 text-base leading-relaxed max-w-xl mx-auto mb-10">
            {t('subtitle')}
          </p>

          {/* CTA */}
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3
                       h-14 px-10 rounded-full
                       bg-[#FF6B35] text-[#1A2530]
                       font-bold text-sm tracking-wide
                       hover:bg-[#FF8557] active:scale-[0.97]
                       transition-all duration-200"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {t('cta')}
            <ExternalLink size={15} />
          </a>

          {/* Trust note */}
          <p
            className="mt-6 text-xs text-[#8A95A5] opacity-80"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {t('note')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
