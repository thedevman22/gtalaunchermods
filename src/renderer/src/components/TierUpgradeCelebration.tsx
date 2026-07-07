import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import MotionButton from '@renderer/components/MotionButton'
import TierBadge from '@renderer/components/TierBadge'
import { TIER_PERKS } from '../../../shared/billing'
import type { SubscriptionTier } from '../../../shared/profile'
import { tierBadgeLabel } from '../../../shared/profile'

interface TierUpgradeCelebrationProps {
  tier: SubscriptionTier
  onDismiss: () => void
}

export default function TierUpgradeCelebration({
  tier,
  onDismiss
}: TierUpgradeCelebrationProps): React.JSX.Element {
  const perks = TIER_PERKS[tier]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-launcher-bg/80 p-6 backdrop-blur-md"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-launcher-accent/40 bg-launcher-surface p-8 text-center shadow-[0_24px_80px_rgba(43,159,212,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-launcher-accent/15 via-transparent to-amber-400/10"
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 18 }}
          className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-launcher-accent to-launcher-accent-dim text-launcher-bg shadow-[0_0_40px_var(--color-launcher-glow)]"
        >
          <Sparkles className="h-9 w-9" strokeWidth={2} aria-hidden />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="relative mt-6 text-xs font-bold uppercase tracking-[0.3em] text-launcher-accent"
        >
          Welcome aboard
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="relative mt-2 font-display text-3xl font-bold text-launcher-text"
        >
          {tierBadgeLabel(tier)} unlocked
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mt-4 flex justify-center"
        >
          <TierBadge tier={tier} size="md" />
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="relative mt-6 space-y-2 text-left"
        >
          {perks.map((perk, index) => (
            <motion.li
              key={perk}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.52 + index * 0.06 }}
              className="flex items-start gap-2 text-sm text-launcher-muted"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-launcher-accent"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>{perk}</span>
            </motion.li>
          ))}
        </motion.ul>

        <MotionButton
          onClick={onDismiss}
          className="relative mt-8 w-full rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-6 py-3 text-xs font-bold uppercase tracking-wider text-launcher-bg shadow-[0_0_24px_var(--color-launcher-glow)]"
        >
          Start modding
        </MotionButton>
      </motion.div>
    </motion.div>
  )
}
