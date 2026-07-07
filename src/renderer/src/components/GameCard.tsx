import { motion } from 'framer-motion'
import MotionButton from '@renderer/components/MotionButton'
import WaveDivider from '@renderer/components/WaveDivider'
import { MOTION_DURATION, MOTION_EASE, staggerItem } from '@renderer/lib/motion'
import type { GameCardInfo } from '../../../shared/games'

interface GameCardProps {
  game: GameCardInfo
  modStats?: { total: number; enabled: number }
  isLaunching?: boolean
  onPlay?: () => void
}

function GameArtPlaceholder({ gameId, locked }: { gameId: string; locked: boolean }): React.JSX.Element {
  if (gameId === 'gta6') {
    return (
      <div
        className={[
          'relative h-full w-full overflow-hidden',
          locked ? 'opacity-50 grayscale' : ''
        ].join(' ')}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-sky-100" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-sky-200/60 to-transparent" />
        <div className="absolute left-1/4 top-1/3 h-16 w-8 rounded-t-full bg-slate-300/70" />
        <div className="absolute right-1/4 top-1/4 h-20 w-10 rounded-t-full bg-slate-300/50" />
        <div className="absolute bottom-6 left-0 right-0 h-px bg-sky-300/40" />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-sky-200" />
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-emerald-200/50 to-transparent" />
      <div className="absolute bottom-8 left-[15%] h-14 w-6 rounded-t-sm bg-slate-400/40" />
      <div className="absolute bottom-8 left-[30%] h-20 w-8 rounded-t-sm bg-slate-400/50" />
      <div className="absolute bottom-8 left-[48%] h-16 w-7 rounded-t-sm bg-slate-400/45" />
      <div className="absolute bottom-8 right-[18%] h-24 w-10 rounded-t-sm bg-slate-400/55" />
      <div className="absolute left-1/4 top-1/4 h-10 w-10 rounded-full bg-amber-200/80 blur-sm" />
    </div>
  )
}

export default function GameCard({
  game,
  modStats,
  isLaunching = false,
  onPlay
}: GameCardProps): React.JSX.Element {
  const locked = game.status === 'coming_soon'
  const supported = game.status === 'supported'

  return (
    <motion.article
      variants={staggerItem}
      whileHover={
        locked
          ? undefined
          : { y: -2, transition: { duration: MOTION_DURATION, ease: MOTION_EASE } }
      }
      className={[
        'wave-card relative flex flex-col overflow-hidden rounded-2xl border bg-launcher-surface',
        locked
          ? 'border-launcher-border/60 opacity-75'
          : 'border-launcher-border shadow-sm shadow-sky-100'
      ].join(' ')}
    >
      <div className="relative h-36 overflow-hidden border-b border-launcher-border/60">
        <GameArtPlaceholder gameId={game.id} locked={locked} />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 rounded-full border border-launcher-border bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-launcher-muted">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V12a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm0 2a3 3 0 013 3v3H9V7a3 3 0 013-3z" />
              </svg>
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-launcher-text">{game.title}</h3>
        <p className="mt-1 text-sm text-launcher-muted">
          {supported ? 'Supported' : 'Coming Soon'}
          {game.tagline ? ` · ${game.tagline}` : ''}
        </p>

        {supported && modStats && (
          <p className="mt-3 text-xs text-launcher-muted">
            {modStats.enabled} mod{modStats.enabled === 1 ? '' : 's'} active · {modStats.total}{' '}
            installed
          </p>
        )}

        {supported && onPlay && (
          <MotionButton
            disabled={isLaunching}
            onClick={onPlay}
            className="wave-button mt-4 w-full rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_20px_var(--color-launcher-glow)] disabled:opacity-60"
          >
            {isLaunching ? 'Launching…' : 'Play'}
          </MotionButton>
        )}
      </div>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </motion.article>
  )
}
