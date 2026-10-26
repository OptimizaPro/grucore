'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from '@/i18n/navigation'

const LABELS = {
  es: { flag: '🇬🇹', short: 'ES', long: 'Español' },
  en: { flag: '🇺🇸', short: 'EN', long: 'English' },
} as const

export function LanguageSwitcherFloat() {
  const locale = useLocale() as 'es' | 'en'
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [open, setOpen] = useState(false)

  const current = LABELS[locale]
  const other = locale === 'es' ? 'en' : 'es'

  const switchTo = (next: 'es' | 'en') => {
    setOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (next !== locale) router.replace({ pathname, params } as any, { locale: next })
  }

  return (
    <div
      className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6"
      aria-label="Language selector"
    >
      <div className="relative">
        {/* Dropdown panel */}
        <div
          className={cn(
            'absolute bottom-full right-0 mb-2 min-w-[140px] bg-[#1F2D3A] border border-[#27384A] rounded-xl overflow-hidden shadow-xl transition-all duration-200',
            open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
          )}
        >
          {(['es', 'en'] as const).map((l) => {
            const info = LABELS[l]
            const isActive = locale === l
            return (
              <button
                key={l}
                onClick={() => switchTo(l)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                  isActive
                    ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                    : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#27384A]'
                )}
              >
                <span className="text-base">{info.flag}</span>
                <span className="font-medium">{info.long}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Trigger pill */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border shadow-lg transition-all duration-200',
            open
              ? 'bg-[#FF6B35] border-[#FF6B35] text-[#1A2530]'
              : 'bg-[#1F2D3A] border-[#27384A] text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#F0EDE8]'
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Globe size={14} />
          <span
            className="text-xs font-semibold tracking-wider uppercase"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {current.short}
          </span>
          <span className="text-base leading-none">{current.flag}</span>
        </button>
      </div>
    </div>
  )
}
