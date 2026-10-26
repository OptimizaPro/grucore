'use client'

import { useRef, useState, useCallback } from 'react'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  dragHint?: string
  height?: string   // Tailwind height class, e.g. 'h-[400px]'
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Antes',
  afterLabel  = 'Después',
  dragHint    = 'Desliza para comparar',
  height      = 'h-[420px] md:h-[520px]',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition]   = useState(50)
  const isDragging                = useRef(false)

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pct  = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 4), 96)
    setPosition(pct)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    updatePosition(e.clientX)
    const onMove = (e: MouseEvent) => { if (isDragging.current) updatePosition(e.clientX) }
    const onUp   = () => { isDragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp, { once: true })
  }

  const onTouchStart = (e: React.TouchEvent) => {
    const onMove = (e: TouchEvent) => updatePosition(e.touches[0].clientX)
    const onEnd  = () => window.removeEventListener('touchmove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onEnd, { once: true })
    updatePosition(e.touches[0].clientX)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  setPosition(p => Math.max(p - 5, 4))
    if (e.key === 'ArrowRight') setPosition(p => Math.min(p + 5, 96))
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} rounded-xl overflow-hidden select-none cursor-col-resize border border-[#27384A]`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      aria-label="Comparación antes y después"
    >
      {/* DESPUÉS — fondo completo */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url('${afterImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-[#1A2530]/30" />
        <div className="absolute bottom-6 right-6">
          <span className="px-4 py-2 bg-[#4A9E6B] text-white text-sm font-semibold rounded-lg shadow-lg">
            {afterLabel}
          </span>
        </div>
      </div>

      {/* ANTES — clip izquierdo */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `url('${beforeImage}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-[#1A2530]/40" />
        <div className="absolute bottom-6 left-6">
          <span className="px-4 py-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg shadow-lg">
            {beforeLabel}
          </span>
        </div>
      </div>

      {/* Línea divisora */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      />

      {/* Handle circular */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-none z-10"
        style={{ left: `${position}%` }}
      >
        <div className="flex items-center gap-1">
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path d="M6 1L1 6l5 5" stroke="#1A2530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
            <path d="M2 1l5 5-5 5" stroke="#1A2530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Hint de drag */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="px-4 py-2 bg-[#1A2530]/80 backdrop-blur-sm text-xs text-[#8A95A5] rounded-full border border-[#27384A]">
          {dragHint}
        </span>
      </div>

      {/* Slider accesible */}
      <input
        type="range" min={4} max={96} value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        onKeyDown={onKeyDown}
        className="sr-only"
        aria-label="Desliza para comparar antes y después"
      />
    </div>
  )
}
