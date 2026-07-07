export default function HomePage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-launcher-accent">
          Welcome back
        </p>
        <h2 className="mt-1 font-display text-3xl font-bold text-launcher-text">
          Grand Theft Auto V
        </h2>
        <p className="mt-2 max-w-xl text-sm text-launcher-muted">
          Your modded session is configured and ready. Select a profile or jump straight into the
          game.
        </p>
      </header>

      <div className="relative overflow-hidden rounded-2xl border border-launcher-border bg-launcher-elevated">
        <div className="absolute inset-0 bg-gradient-to-r from-launcher-accent/5 via-transparent to-launcher-warning/5" />
        <div className="relative flex items-center justify-between gap-6 p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-launcher-accent/30 bg-launcher-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-launcher-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-launcher-accent" />
              Enhanced Edition
            </span>
            <h3 className="mt-3 text-xl font-bold text-launcher-text">Los Santos — Mod Profile</h3>
            <p className="mt-1 text-sm text-launcher-muted">12 mods active · Last played 2 days ago</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-launcher-bg shadow-[0_0_30px_var(--color-launcher-glow)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Play
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Installed Mods', value: '24', sub: '3 updates available' },
          { label: 'Play Time', value: '186h', sub: 'This month: 12h' },
          { label: 'Profiles', value: '3', sub: '1 active profile' }
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5 backdrop-blur-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-launcher-muted">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-launcher-text">{stat.value}</p>
            <p className="mt-1 text-xs text-launcher-muted">{stat.sub}</p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-launcher-muted">
          Recent Activity
        </h3>
        <div className="space-y-2">
          {[
            { action: 'Installed', mod: 'NaturalVision Evolved', time: '3 hours ago' },
            { action: 'Updated', mod: 'Script Hook V', time: 'Yesterday' },
            { action: 'Enabled', mod: 'LSPDFR', time: '3 days ago' }
          ].map((entry) => (
            <div
              key={entry.mod}
              className="flex items-center justify-between rounded-lg border border-launcher-border/60 bg-launcher-elevated/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-launcher-border/50" />
                <div>
                  <p className="text-sm font-medium text-launcher-text">{entry.mod}</p>
                  <p className="text-xs text-launcher-muted">{entry.action}</p>
                </div>
              </div>
              <span className="text-xs text-launcher-muted">{entry.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
