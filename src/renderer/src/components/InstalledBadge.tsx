import { motion } from 'framer-motion'
import { MOTION_DURATION, MOTION_EASE } from '@renderer/lib/motion'

export default function InstalledBadge(): React.JSX.Element {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
      className="inline-flex items-center gap-1.5 rounded-full border border-launcher-accent/30 bg-launcher-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-launcher-accent"
    >
      <motion.span
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: MOTION_DURATION, ease: MOTION_EASE, delay: 0.05 }}
        aria-hidden
      >
        ✓
      </motion.span>
      Installed
    </motion.span>
  )
}
