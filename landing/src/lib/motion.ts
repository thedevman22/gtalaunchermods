import type { Transition, Variants } from 'framer-motion'

/** Premium ease-out — keep interactions in the 200–400ms range. */
export const MOTION_DURATION = 0.32
export const MOTION_DURATION_FAST = 0.22
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const viewportOnce = { once: true, margin: '-60px' as const }
export const viewportOnceTight = { once: true, margin: '-40px' as const }

export function transition(reduced: boolean, duration = MOTION_DURATION): Transition {
  if (reduced) return { duration: 0 }
  return { duration, ease: MOTION_EASE }
}

export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION, ease: MOTION_EASE }
  }
}

export const fadeSlideUpReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } }
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION_DURATION, ease: MOTION_EASE }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.06 }
  }
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION, ease: MOTION_EASE }
  }
}

export const heroWord: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: MOTION_EASE }
  }
}

export const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.12 }
  }
}

export const glowPulse: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.38, ease: MOTION_EASE, delay: 0.45 }
  },
  pulse: {
    boxShadow: [
      '0 4px 30px rgba(56,189,248,0.3)',
      '0 6px 44px rgba(56,189,248,0.45)',
      '0 4px 30px rgba(56,189,248,0.3)'
    ],
    transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const floatIdle = (delay = 0): Variants => ({
  initial: { y: 0 },
  animate: {
    y: [0, -5, 0],
    transition: {
      duration: 4.2 + delay,
      repeat: Infinity,
      ease: 'easeInOut',
      delay
    }
  }
})

export const cardHoverLift = {
  y: -5,
  transition: { duration: MOTION_DURATION_FAST, ease: MOTION_EASE }
}

export const iconHover = {
  scale: 1.08,
  rotate: -3,
  transition: { duration: MOTION_DURATION_FAST, ease: MOTION_EASE }
}
