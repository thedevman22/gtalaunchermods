'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import {
  fadeSlideUp,
  fadeSlideUpReduced,
  staggerContainer,
  transition,
  viewportOnce
} from '@/lib/motion'

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  delay?: number
  stagger?: boolean
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  stagger = false,
  ...props
}: ScrollRevealProps): React.JSX.Element {
  const reduced = useReducedMotion()
  const variants = reduced ? fadeSlideUpReduced : stagger ? staggerContainer : fadeSlideUp

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={
        stagger
          ? variants
          : {
              hidden: variants.hidden,
              visible: {
                ...variants.visible,
                transition: {
                  ...(typeof variants.visible === 'object' && 'transition' in variants.visible
                    ? variants.visible.transition
                    : {}),
                  ...transition(reduced ?? false),
                  delay: reduced ? 0 : delay
                }
              }
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function ScrollRevealItem({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'>): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <motion.div
      variants={
        reduced
          ? fadeSlideUpReduced
          : {
              hidden: { opacity: 0, y: 18 },
              visible: {
                opacity: 1,
                y: 0,
                transition: transition(false)
              }
            }
      }
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
