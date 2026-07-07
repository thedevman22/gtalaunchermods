import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ModSummary } from '../../../preload/index.d'
import AnimatedToggle from '@renderer/components/AnimatedToggle'
import MotionButton from '@renderer/components/MotionButton'
import { MOTION_DURATION, MOTION_EASE, staggerItem } from '@renderer/lib/motion'

interface InstalledModRowProps extends Omit<HTMLMotionProps<'article'>, 'onToggle'> {
  mod: ModSummary
  busy: boolean
  onToggleMod: (modId: string, enabled: boolean) => void
  onDelete: (modId: string) => void
  inProfile?: boolean
  profileMode?: boolean
}

export default function InstalledModRow({
  mod,
  busy,
  onToggleMod,
  onDelete,
  inProfile,
  profileMode = false,
  ...motionProps
}: InstalledModRowProps): React.JSX.Element {
  const enabled = profileMode ? Boolean(inProfile) : mod.enabled
  const onLabel = profileMode ? 'In profile' : 'On'
  const offLabel = profileMode ? 'Add' : 'Off'

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ scale: 1.005, transition: { duration: MOTION_DURATION, ease: MOTION_EASE } }}
      className="group flex items-center gap-4 rounded-2xl border border-launcher-border/80 bg-launcher-surface/50 px-4 py-3 hover:border-launcher-accent/20 hover:bg-launcher-surface/80"
      {...motionProps}
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-launcher-elevated">
        {mod.thumbnailDataUrl ? (
          <img src={mod.thumbnailDataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-launcher-elevated to-launcher-border text-lg font-bold text-launcher-accent/50">
            {mod.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-launcher-text">{mod.name}</h3>
          <span className="rounded-md bg-launcher-elevated px-2 py-0.5 font-mono text-[10px] text-launcher-muted">
            v{mod.version || '1.0.0'}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-launcher-muted">by {mod.author}</p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <AnimatedToggle
          enabled={enabled}
          disabled={busy}
          label={enabled ? onLabel : offLabel}
          onChange={(next) => onToggleMod(mod.id, next)}
        />

        <MotionButton
          disabled={busy}
          onClick={() => onDelete(mod.id)}
          aria-label={`Delete ${mod.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-launcher-muted hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </MotionButton>
      </div>
    </motion.article>
  )
}
