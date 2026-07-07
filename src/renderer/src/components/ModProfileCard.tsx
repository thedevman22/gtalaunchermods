import { motion } from 'framer-motion'
import { Play, Trash2 } from 'lucide-react'
import { MOTION_DURATION, MOTION_EASE, staggerItem } from '@renderer/lib/motion'
import type { ModProfileSummary } from '../../../shared/modProfiles'

interface ModProfileCardProps {
  profile: ModProfileSummary
  isActive?: boolean
  isSelected?: boolean
  isLaunching?: boolean
  launchDisabled?: boolean
  onSelect?: () => void
  onLaunch: () => void
  onDelete?: () => void
}

export default function ModProfileCard({
  profile,
  isActive = false,
  isSelected = false,
  isLaunching = false,
  launchDisabled = false,
  onSelect,
  onLaunch,
  onDelete
}: ModProfileCardProps): React.JSX.Element {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -2, transition: { duration: MOTION_DURATION, ease: MOTION_EASE } }}
      onClick={onSelect}
      className={[
        'relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-launcher-surface p-6 transition-colors',
        isSelected
          ? 'border-launcher-accent/60 shadow-[0_0_18px_var(--color-launcher-glow)]'
          : 'border-launcher-border shadow-black/20 hover:border-launcher-border/40'
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-bold text-launcher-text">
            {profile.name}
          </h3>
          <p className="type-caption mt-1.5">
            {profile.modCount} mod{profile.modCount === 1 ? '' : 's'}
            {isActive ? ' · Last launched' : ''}
          </p>
        </div>
        {isSelected ? (
          <span className="shrink-0 rounded-full bg-launcher-accent/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-launcher-accent">
            Selected
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={isLaunching || launchDisabled}
          title={launchDisabled ? 'Set your game folder first' : undefined}
          onClick={(event) => {
            event.stopPropagation()
            onLaunch()
          }}
          className="btn-ghost inline-flex items-center gap-2"
        >
          <Play className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          {isLaunching ? 'Launching…' : 'Launch'}
        </button>
        {onDelete ? (
          <button
            type="button"
            aria-label="Delete profile"
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
            className="rounded-lg p-2 text-launcher-muted transition-colors hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>
    </motion.article>
  )
}
