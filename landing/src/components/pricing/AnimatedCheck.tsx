'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { MOTION_DURATION_FAST, MOTION_EASE } from '@/lib/motion'

type AnimatedCheckProps = {
  className?: string
}

export default function AnimatedCheck({ className = '' }: AnimatedCheckProps): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={`mt-0.5 shrink-0 text-accent ${className}`}
      aria-hidden
      initial={reduced ? false : { opacity: 0, scale: 0.6 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: MOTION_DURATION_FAST, ease: MOTION_EASE }}
    >
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, ease: MOTION_EASE, delay: 0.05 }}
      />
    </motion.svg>
  )
}
