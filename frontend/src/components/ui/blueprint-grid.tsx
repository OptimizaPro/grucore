'use client'

import { useEffect, useRef } from 'react'

export function BlueprintGrid() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const CELL   = 72
    const PULL   = 24
    const RADIUS = 180
    const LERP   = 0.07

    let W = 0, H = 0, dpr = 1
    let cols = 0, rows = 0
    let raf = 0
    let visible = true
    let dirty = true

    const target  = { x: -9999, y: -9999 }
    const current = { x: -9999, y: -9999 }

    const isMobile = window.matchMedia('(pointer: coarse)').matches
    const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isStatic = isMobile || reduced

    function resize() {
      const parent = canvas.parentElement
      W = parent ? parent.offsetWidth  : window.innerWidth
      H = parent ? parent.offsetHeight : window.innerHeight
      if (W === 0 || H === 0) return

      dpr           = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width  = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols  = Math.ceil(W / CELL) + 1
      rows  = Math.ceil(H / CELL) + 1
      dirty = true
    }

    function pt(c: number, r: number): [number, number] {
      const bx = c * CELL
      const by = r * CELL
      if (isStatic || current.x < 0) return [bx, by]
      const dist = Math.hypot(bx - current.x, by - current.y)
      if (dist === 0 || dist > RADIUS) return [bx, by]
      const strength = (1 - dist / RADIUS) ** 2 * PULL
      return [
        bx + ((current.x - bx) / dist) * strength,
        by + ((current.y - by) / dist) * strength,
      ]
    }

    function draw() {
      if (W === 0 || H === 0) return
      ctx.clearRect(0, 0, W, H)

      // lines
      ctx.strokeStyle = 'rgba(255,107,53,0.18)'
      ctx.lineWidth   = 0.6

      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        for (let c = 0; c < cols; c++) {
          const [x, y] = pt(c, r)
          c === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        for (let r = 0; r < rows; r++) {
          const [x, y] = pt(c, r)
          r === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      // dots
      ctx.fillStyle = 'rgba(255,107,53,0.35)'
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const [x, y] = pt(c, r)
          ctx.beginPath()
          ctx.arc(x, y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    function tick() {
      if (visible) {
        const dx = target.x - current.x
        const dy = target.y - current.y
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          current.x += dx * LERP
          current.y += dy * LERP
          dirty = true
        }
        if (dirty) { draw(); dirty = false }
      }
      raf = requestAnimationFrame(tick)
    }

    const section = canvas.closest('section')

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      target.x = e.clientX - rect.left
      target.y = e.clientY - rect.top
    }
    function onLeave() {
      target.x = -9999
      target.y = -9999
    }

    section?.addEventListener('mousemove', onMove)
    section?.addEventListener('mouseleave', onLeave)

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    observer.observe(canvas)
    window.addEventListener('resize', resize)

    // defer first resize one frame to ensure layout is complete
    requestAnimationFrame(() => {
      resize()
      if (isStatic) {
        draw()
      } else {
        tick()
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      section?.removeEventListener('mousemove', onMove)
      section?.removeEventListener('mouseleave', onLeave)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  )
}
