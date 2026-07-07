'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { fadeSlideUp } from '@/lib/motion'

type ScrollRevealProps = HTMLMotionProps<'div'> & {
  delay?: number
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  ...props
}: ScrollRevealProps): React.JSX.Element {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        hidden: fadeSlideUp.hidden,
        visible: {
          ...fadeSlideUp.visible,
          transition: {
            ...fadeSlideUp.visible.transition,
            delay
          }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
