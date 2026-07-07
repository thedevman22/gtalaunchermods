import { SUPPORTED_GAMES } from '@/lib/constants'
import GameCover from '@/components/GameCover'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

export default function SupportedGames(): React.JSX.Element {
  return (
    <section id="games" className="relative px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Supported games
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="mt-12 grid gap-6 sm:grid-cols-2">
          {SUPPORTED_GAMES.map((game) => {
            const supported = game.status === 'supported'
            return (
              <article
                key={game.id}
                className={[
                  'group relative overflow-hidden rounded-2xl border bg-surface text-center',
                  supported
                    ? 'border-accent/30 shadow-lg shadow-sky-400/10'
                    : 'border-border/70 opacity-90'
                ].join(' ')}
              >
                <div className="relative h-44 sm:h-48">
                  <GameCover
                    gameId={game.id}
                    alt={game.title}
                    locked={!supported}
                    className="[&_img]:group-hover:scale-[1.03] [&_img]:transition-transform [&_img]:duration-300"
                  />
                </div>

                <div className="p-6 pt-5">
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider',
                      supported
                        ? 'border border-accent/30 bg-accent/10 text-accent'
                        : 'border border-border bg-elevated text-muted'
                    ].join(' ')}
                  >
                    {supported ? 'Supported Now' : 'Coming Soon'}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold sm:text-2xl">{game.title}</h3>
                  <p className="mt-3 text-sm text-muted">{game.tagline}</p>
                </div>
              </article>
            )
          })}
        </ScrollReveal>
      </div>
      <WaveDivider variant="subtle" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
