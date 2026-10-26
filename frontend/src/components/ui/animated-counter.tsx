'use client'

import { useEffect, useRef } from 'react'
import { useInView, useMotionValue, useTransform, motion, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
  style?: React.CSSProperties
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.8,
  className,
  style,
}: AnimatedCounterProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration,
        ease: [0.22, 1, 0.36, 1],
      })
      return controls.stop
    }
  }, [isInView, count, value, duration])

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}
