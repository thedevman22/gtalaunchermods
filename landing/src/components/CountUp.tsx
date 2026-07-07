'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

type CountUpProps = {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export default function CountUp({
  value,
  suffix = '',
  prefix = '',
  duration = 1.2,
  className = ''
}: CountUpProps): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()
  const [animated, setAnimated] = useState(0)
  const display = reduced ? (inView ? value : 0) : animated

  useEffect(() => {
    if (!inView || reduced) return

    const start = performance.now()
    let frame = 0

    const tick = (now: number): void => {
      const progress = Math.min((now - start) / (duration * 1000), 1)
      const eased = 1 - (1 - progress) ** 3
      setAnimated(Math.round(eased * value))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration, reduced])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
