'use client'

import { useEffect, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { MOTION_EASE } from '@/lib/motion'

type AnimatedPriceProps = {
  amount: number
  period: string
  animateKey: string
  className?: string
}

export default function AnimatedPrice({
  amount,
  period,
  animateKey,
  className = ''
}: AnimatedPriceProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const displayRef = useRef(amount)
  const frameRef = useRef(0)
  const displayEl = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!displayEl.current) return

    if (reduced || !inView) {
      displayEl.current.textContent = String(amount)
      displayRef.current = amount
      return
    }

    const from = displayRef.current
    const to = amount
    if (from === to) return

    const start = performance.now()
    const duration = 360

    const tick = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      const current = Math.round(from + (to - from) * eased)
      if (displayEl.current) {
        displayEl.current.textContent = String(current)
      }
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        displayRef.current = to
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [amount, inView, reduced, animateKey])

  return (
    <div ref={ref} className={`flex items-baseline gap-1.5 ${className}`}>
      <span className="font-display text-4xl font-bold tracking-tight sm:text-[2.75rem]">
        $<span ref={displayEl}>{reduced && inView ? amount : 0}</span>
      </span>
      <motion.span
        key={period}
        initial={reduced ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: MOTION_EASE }}
        className="text-sm text-muted"
      >
        {period}
      </motion.span>
    </div>
  )
}
