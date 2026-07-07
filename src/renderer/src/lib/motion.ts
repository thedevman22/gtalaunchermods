export const MOTION_DURATION = 0.22
export const MOTION_DURATION_FAST = 0.15
export const MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const pageTransition = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: MOTION_DURATION, ease: MOTION_EASE }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 }
  }
}

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION, ease: MOTION_EASE }
  }
}
