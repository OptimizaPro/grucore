'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Pagination({
  page,
  total,
  perPage,
  onChange,
}: {
  page: number
  total: number
  perPage: number
  onChange: (p: number) => void
}) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null

  const range: (number | '…')[] = []
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) range.push(i)
  } else {
    range.push(1)
    if (page > 3) range.push('…')
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) range.push(i)
    if (page < pages - 2) range.push('…')
    range.push(pages)
  }

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-[#8A95A5]">
        {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} de {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded hover:bg-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {range.map((r, i) =>
          r === '…' ? (
            <span key={`e${i}`} className="px-1 text-xs text-[#8A95A5]">…</span>
          ) : (
            <button
              key={r}
              onClick={() => onChange(r as number)}
              className={cn(
                'w-7 h-7 rounded text-xs font-medium transition-colors',
                page === r
                  ? 'bg-[#FF6B35] text-white'
                  : 'text-[#8A95A5] hover:bg-[#27384A] hover:text-[#F0EDE8]',
              )}
            >
              {r}
            </button>
          ),
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="p-1.5 rounded hover:bg-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
