import ScrollReveal from '@/components/ScrollReveal'

export default function TrustSection(): React.JSX.Element {
  return (
    <section id="trust" className="border-t border-border/60 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/5 via-surface/80 to-surface/40 p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
                  Our promise
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Mods are free, always.
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted">
                  We will never charge for mods, lock downloads behind a subscription, or take a cut
                  from mod creators. {`GTA Mod Launcher's`} paid tiers only unlock launcher
                  convenience — never the mods themselves.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    title: 'No mod paywalls',
                    body: 'Import and manage unlimited mods on the free tier. We don\'t host or sell mod content.'
                  },
                  {
                    title: 'Story mode only',
                    body: 'We launch with -scOfflineOnly to keep you in single-player. No online modding, no bans.'
                  },
                  {
                    title: 'Transparent tiers',
                    body: 'Pro and Elite add automation and support — not access to mods. Ever.'
                  }
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border/60 bg-bg/40 p-5 backdrop-blur-sm"
                  >
                    <h3 className="flex items-center gap-2 font-semibold">
                      <span className="text-accent">✦</span>
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
