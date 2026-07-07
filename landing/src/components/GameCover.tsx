import { getGameCoverImage } from '@/lib/gameImages'

interface GameCoverProps {
  gameId: string
  alt: string
  locked?: boolean
  className?: string
}

/** Game hero image with optional coming-soon dimming. */
export default function GameCover({
  gameId,
  alt,
  locked = false,
  className = ''
}: GameCoverProps): React.JSX.Element {
  const src = getGameCoverImage(gameId)

  return (
    <div className={['relative h-full w-full overflow-hidden', className].join(' ')}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export
        <img
          src={src}
          alt={alt}
          className={[
            'h-full w-full object-cover object-center',
            locked ? 'scale-105 opacity-60 grayscale' : ''
          ].join(' ')}
          draggable={false}
        />
      ) : (
        <div className="h-full w-full bg-elevated" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
    </div>
  )
}
