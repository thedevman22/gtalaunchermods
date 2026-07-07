'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { glowPulse } from '@/lib/motion'
import { formatDownloadVersionLabel } from '@/config/download'
import { DOWNLOAD_CONFIG } from '@/config/download'

type DownloadCtaProps = {
  className?: string
}

export default function DownloadCta({ className = '' }: DownloadCtaProps): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.a
        href={DOWNLOAD_CONFIG.downloadUrl}
        variants={glowPulse}
        initial="hidden"
        animate={['visible', ...(reduced ? [] : (['pulse'] as const))]}
        whileHover={reduced ? undefined : { y: -3, scale: 1.02 }}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        className="group wave-button inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-dim px-8 py-4 text-sm font-bold uppercase tracking-wider text-bg shadow-[0_4px_30px_rgba(56,189,248,0.3)]"
      >
        <motion.svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
          whileHover={reduced ? undefined : { y: 2 }}
          transition={{ duration: 0.2 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </motion.svg>
        Download for Windows
      </motion.a>
      <p className="mt-3 text-xs text-muted">{formatDownloadVersionLabel()}</p>
    </div>
  )
}
