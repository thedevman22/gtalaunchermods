'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { MOTION_DURATION, MOTION_EASE } from '@/lib/motion'

export default function PageTransition({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { duration: MOTION_DURATION, ease: MOTION_EASE }}
    >
      {children}
    </motion.div>
  )
}
