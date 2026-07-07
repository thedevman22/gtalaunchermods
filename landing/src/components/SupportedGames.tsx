import { SUPPORTED_GAMES } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

export default function SupportedGames(): React.JSX.Element {
  return (
    <section id="games" className="relative px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Harbor fleet</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Supported games
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Text-only listings — no official logos. ModHarbor focuses on one harbor at a time.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.06} className="mt-12 grid gap-6 sm:grid-cols-2">
          {SUPPORTED_GAMES.map((game) => {
            const supported = game.status === 'supported'
            return (
              <article
                key={game.id}
                className={[
                  'relative overflow-hidden rounded-2xl border bg-surface p-8 transition-shadow',
                  supported
                    ? 'border-accent/30 shadow-lg shadow-sky-100/80'
                    : 'border-border/70 opacity-90'
                ].join(' ')}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                      {game.id === 'gta5' ? 'Rockstar title' : 'Upcoming title'}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold sm:text-2xl">{game.title}</h3>
                  </div>
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
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted">{game.description}</p>

                {game.tagline ? (
                  <p className="mt-4 text-xs font-medium text-text/80">{game.tagline}</p>
                ) : null}

                {!supported ? (
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    🔒 Not available in the launcher yet
                  </p>
                ) : null}

                {supported ? (
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
                ) : null}
              </article>
            )
          })}
        </ScrollReveal>
      </div>
      <WaveDivider variant="subtle" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
