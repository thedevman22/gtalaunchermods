import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { MOTION_DURATION_FAST, MOTION_EASE } from '@renderer/lib/motion'

type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  children: ReactNode
}

export default function MotionButton({
  children,
  className = '',
  disabled,
  ...props
}: MotionButtonProps): React.JSX.Element {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: MOTION_DURATION_FAST, ease: MOTION_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  )
}
