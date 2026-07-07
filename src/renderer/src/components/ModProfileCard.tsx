import { motion } from 'framer-motion'
import MotionButton from '@renderer/components/MotionButton'
import WaveDivider from '@renderer/components/WaveDivider'
import { MOTION_DURATION, MOTION_EASE, staggerItem } from '@renderer/lib/motion'
import type { ModProfileSummary } from '../../../shared/modProfiles'

interface ModProfileCardProps {
  profile: ModProfileSummary
  isActive?: boolean
  isLaunching?: boolean
  onLaunch: () => void
  onDelete?: () => void
}

export default function ModProfileCard({
  profile,
  isActive = false,
  isLaunching = false,
  onLaunch,
  onDelete
}: ModProfileCardProps): React.JSX.Element {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -2, transition: { duration: MOTION_DURATION, ease: MOTION_EASE } }}
      className={[
        'wave-card relative flex flex-col overflow-hidden rounded-2xl border bg-launcher-surface p-5 shadow-sm',
        isActive ? 'border-launcher-accent shadow-sky-100' : 'border-launcher-border shadow-sky-50'
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-launcher-text">{profile.name}</h3>
          <p className="mt-1 text-sm text-launcher-muted">
            {profile.modCount} mod{profile.modCount === 1 ? '' : 's'}
            {isActive ? ' · Last launched' : ''}
          </p>
        </div>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-launcher-muted hover:text-red-500"
          >
            Delete
          </button>
        ) : null}
      </div>

      <MotionButton
        disabled={isLaunching}
        onClick={onLaunch}
        className="wave-button mt-5 w-full rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_var(--color-launcher-glow)] disabled:opacity-60"
      >
        {isLaunching ? 'Launching…' : 'Launch'}
      </MotionButton>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0 opacity-70" />
    </motion.article>
  )
}
