import ScrollReveal from '@/components/ScrollReveal'

const SAFETY_POINTS = [
  {
    title: 'Story mode only',
    body: 'Every launch uses -scOfflineOnly — no online sessions, no multiplayer risk.'
  },
  {
    title: 'Clean deploy',
    body: 'Mods apply from isolated profiles with tracked manifests — switch loadouts without leftover files.'
  },
  {
    title: 'Mods stay free',
    body: 'Paid tiers unlock launcher convenience. We never charge for mod downloads.'
  }
]

export default function StoryModeBanner(): React.JSX.Element {
  return (
    <section className="relative border-y border-accent/15 bg-gradient-to-r from-accent/8 via-surface to-sky-50/80 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-3xl shadow-[0_4px_24px_rgba(43,159,212,0.15)]">
              🛡️
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                Built for safe single-player modding
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Offline story mode — by design, not by accident
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted lg:mx-0 mx-auto">
                ModHarbor never launches GTA Online. Your mods deploy only when you choose a profile
                and hit Launch — keeping your account out of risky online sessions.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SAFETY_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-xl border border-border/70 bg-surface/70 p-4 text-left backdrop-blur-sm"
              >
                <h3 className="flex items-center gap-2 text-sm font-bold text-text">
                  <span className="text-accent">✦</span>
                  {point.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{point.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
