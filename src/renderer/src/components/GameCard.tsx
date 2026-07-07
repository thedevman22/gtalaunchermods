import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import MotionButton from '@renderer/components/MotionButton'
import WaveDivider from '@renderer/components/WaveDivider'
import { getGameCoverImage } from '@renderer/lib/gameImages'
import { MOTION_DURATION, MOTION_EASE, staggerItem } from '@renderer/lib/motion'
import type { GameCardInfo } from '../../../shared/games'

interface GameCardProps {
  game: GameCardInfo
  modStats?: { total: number; enabled: number }
  isLaunching?: boolean
  onPlay?: () => void
}

function GameCover({
  gameId,
  title,
  locked
}: {
  gameId: string
  title: string
  locked: boolean
}): React.JSX.Element {
  const src = getGameCoverImage(gameId)

  return (
    <div className="relative h-full w-full overflow-hidden">
      {src ? (
        <img
          src={src}
          alt={title}
          className={[
            'h-full w-full object-cover object-center transition-transform duration-300',
            locked ? 'scale-105 opacity-55 grayscale' : 'group-hover:scale-[1.03]'
          ].join(' ')}
          draggable={false}
        />
      ) : (
        <div className="h-full w-full bg-launcher-elevated" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-launcher-surface via-launcher-surface/10 to-transparent" />
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
        'group wave-card relative flex flex-col overflow-hidden rounded-2xl border bg-launcher-surface',
        locked
          ? 'border-launcher-border/60 opacity-90'
          : 'border-launcher-border shadow-sm shadow-black/30'
      ].join(' ')}
    >
      <div className="relative h-40 overflow-hidden border-b border-launcher-border/60">
        <GameCover gameId={game.id} title={game.title} locked={locked} />
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 rounded-full border border-launcher-border bg-launcher-elevated/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-launcher-muted">
              <Lock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
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
            className="wave-button mt-4 w-full rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim py-3 text-sm font-bold uppercase tracking-wider text-launcher-bg shadow-[0_4px_20px_var(--color-launcher-glow)] disabled:opacity-60"
          >
            {isLaunching ? 'Launching…' : 'Play'}
          </MotionButton>
        )}
      </div>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </motion.article>
  )
}
