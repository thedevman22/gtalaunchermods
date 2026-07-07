type MockupScreen = 'profiles' | 'catalog' | 'launch'

interface AppScreenMockupProps {
  screen: MockupScreen
  className?: string
}

function WindowChrome({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-sky-100/70">
      <div className="flex items-center gap-2 border-b border-border bg-elevated/60 px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <div className="h-2.5 w-2.5 rounded-full bg-accent/80" />
        <span className="ml-2 text-[10px] font-medium text-muted">ModHarbor</span>
      </div>
      <div className="grid grid-cols-[52px_1fr] bg-bg/90">
        <div className="hidden space-y-1 border-r border-border/60 bg-elevated/40 p-2 sm:block">
          {['Home', 'Mods', 'Settings', 'Account'].map((item, index) => (
            <div
              key={item}
              className={[
                'rounded-md px-2 py-1.5 text-[9px] font-semibold',
                index === 0 ? 'bg-accent/15 text-accent' : 'text-muted'
              ].join(' ')}
            >
              {item}
            </div>
          ))}
        </div>
        <div className="min-h-[220px] p-4 sm:min-h-[260px]">{children}</div>
      </div>
    </div>
  )
}

function ProfilesScreen(): React.JSX.Element {
  const profiles = [
    { name: 'Realistic Graphics', mods: 3, active: true },
    { name: 'Chaos Mode', mods: 7, active: false }
  ]

  return (
    <WindowChrome>
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Profiles</p>
      <h3 className="mt-0.5 font-display text-sm font-bold">Your loadouts</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {profiles.map((profile) => (
          <div
            key={profile.name}
            className={[
              'rounded-xl border bg-surface p-3',
              profile.active ? 'border-accent/40 shadow-sm shadow-sky-100' : 'border-border'
            ].join(' ')}
          >
            <p className="font-display text-xs font-bold">{profile.name}</p>
            <p className="mt-0.5 text-[10px] text-muted">
              {profile.mods} mods{profile.active ? ' · Last launched' : ''}
            </p>
            <div
              className={[
                'mt-2 rounded-lg py-1.5 text-center text-[9px] font-bold uppercase tracking-wider text-white',
                profile.active
                  ? 'bg-gradient-to-r from-accent to-accent-dim'
                  : 'bg-accent/20 text-accent'
              ].join(' ')}
            >
              Launch
            </div>
          </div>
        ))}
      </div>
    </WindowChrome>
  )
}

function CatalogScreen(): React.JSX.Element {
  const mods = [
    { name: 'Cinematic Lighting Pack', category: 'Visual', soon: true },
    { name: 'Supercar Collection', category: 'Vehicles', soon: true },
    { name: 'Story Enhancer Scripts', category: 'Scripts', soon: true }
  ]

  return (
    <WindowChrome>
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted">Mod catalog</p>
      <h3 className="mt-0.5 font-display text-sm font-bold">Browse & import</h3>
      <div className="mt-3 space-y-2">
        {mods.map((mod) => (
          <div
            key={mod.name}
            className="flex items-center gap-2 rounded-lg border border-dashed border-border/80 bg-elevated/30 p-2"
          >
            <div className="h-10 w-14 shrink-0 rounded-md bg-gradient-to-br from-sky-100 to-cyan-50 opacity-70" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold text-text/80">{mod.name}</p>
              <p className="text-[9px] text-muted">{mod.category}</p>
            </div>
            <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-700">
              {mod.soon ? 'Soon' : 'Install'}
            </span>
          </div>
        ))}
      </div>
    </WindowChrome>
  )
}

function LaunchScreen(): React.JSX.Element {
  return (
    <WindowChrome>
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-accent/20 bg-gradient-to-b from-accent/5 to-bg/80 px-4 text-center">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
          <div className="relative h-10 w-10 rounded-full border-2 border-accent/30 border-t-accent" />
        </div>
        <p className="mt-4 font-display text-sm font-bold">Launching story mode…</p>
        <p className="mt-1 text-[10px] text-muted">Applying profile mods · -scOfflineOnly</p>
        <div className="mt-4 w-full max-w-[200px] overflow-hidden rounded-full bg-elevated">
          <div className="h-1.5 w-2/3 rounded-full bg-gradient-to-r from-accent to-accent-dim" />
        </div>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent">
          <span className="h-1 w-1 rounded-full bg-accent" />
          Offline only
        </span>
      </div>
    </WindowChrome>
  )
}

export default function AppScreenMockup({
  screen,
  className = ''
}: AppScreenMockupProps): React.JSX.Element {
  return (
    <div className={className}>
      {screen === 'profiles' && <ProfilesScreen />}
      {screen === 'catalog' && <CatalogScreen />}
      {screen === 'launch' && <LaunchScreen />}
    </div>
  )
}
