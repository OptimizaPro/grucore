'use client'

import { useTranslations } from 'next-intl'

interface MarqueeItem { id: number | string; title: string }

// Diamond separator entre items
const SEP = (
  <span className="mx-8 text-[#FF6B35] select-none flex-shrink-0" aria-hidden>
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
      <path d="M5 0L10 5L5 10L0 5Z" />
    </svg>
  </span>
)

export function ServicesScroll({ items: cmsItems }: { items?: MarqueeItem[] }) {
  const t = useTranslations('Home.services')

  const base: MarqueeItem[] = (cmsItems && cmsItems.length > 0)
    ? cmsItems
    : (t.raw('items') as { id: string; title: string }[])

  const track = [...base, ...base]

  return (
    <div
      className="relative bg-[#0F1923] border-y border-[#FF6B35]/20 py-5 overflow-hidden"
      aria-label="Servicios"
    >
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 z-10
                      bg-gradient-to-r from-[#0F1923] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 z-10
                      bg-gradient-to-l from-[#0F1923] to-transparent" />

      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {track.map((item, i) => (
          <span key={`${item.id}-${i}`} className="flex items-center whitespace-nowrap">
            <span
              className="text-sm font-bold tracking-[0.2em] uppercase"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                color: i % 2 === 0 ? '#F0EDE8' : '#FF6B35',
              }}
            >
              {item.title}
            </span>
            {SEP}
          </span>
        ))}
      </div>
    </div>
  )
}
