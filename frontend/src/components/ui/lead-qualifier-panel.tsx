'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { useLocale } from 'next-intl'

export function LeadQualifierPanel() {
  const locale = useLocale()

  return (
    <Link
      href="/cotizar"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#FF6B35]/60 bg-[#1F2D3A] text-[#F0EDE8] shadow-lg transition-all duration-200 hover:bg-[#FF6B35] hover:border-[#FF6B35] hover:text-[#1A2530]"
      style={{ fontFamily: 'Montserrat, sans-serif' }}
    >
      <Sparkles size={14} />
      <span className="text-xs font-semibold tracking-wider uppercase">
        {locale === 'es' ? 'Cotizar' : 'Quote'}
      </span>
    </Link>
  )
}
