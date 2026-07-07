import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { MOTION_DURATION, MOTION_EASE } from '@renderer/lib/motion'

export default function InstalledBadge(): React.JSX.Element {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: MOTION_DURATION, ease: MOTION_EASE }}
      className="inline-flex items-center gap-1.5 rounded-full border border-launcher-accent/30 bg-launcher-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-launcher-accent"
    >
      Installed
      <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
    </motion.span>
  )
}
