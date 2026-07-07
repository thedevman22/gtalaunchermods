'use client'

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { MOTION_DURATION_FAST, MOTION_EASE } from '@/lib/motion'

type HoverLiftCardProps = HTMLMotionProps<'article'>

export default function HoverLiftCard({
  children,
  className,
  ...props
}: HoverLiftCardProps): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <motion.article
      className={className}
      style={{ transformPerspective: 900 }}
      whileHover={
        reduced
          ? undefined
          : {
              y: -6,
              rotateX: 1.5,
              rotateY: -1.5,
              boxShadow: '0 14px 40px rgba(0, 0, 0, 0.22)',
              transition: { duration: MOTION_DURATION_FAST, ease: MOTION_EASE }
            }
      }
      {...props}
    >
      {children}
    </motion.article>
  )
}
