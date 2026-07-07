export default function SettingsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold text-launcher-text">Settings</h2>
        <p className="mt-1 text-sm text-launcher-muted">
          Configure game paths, launcher behavior, and mod loading preferences.
        </p>
      </header>

      <div className="space-y-4">
        {[
          {
            title: 'GTA V Installation Path',
            description: 'Path to your Grand Theft Auto V directory',
            value: 'C:\\Program Files\\Rockstar Games\\Grand Theft Auto V'
          },
          {
            title: 'Mods Folder',
            description: 'Directory where mod packages are stored',
            value: 'C:\\Users\\Player\\Documents\\GTA Mods'
          },
          {
            title: 'Launch Arguments',
            description: 'Additional command-line flags passed to the game',
            value: '-ignoreDifferentVideoCard'
          }
        ].map((setting) => (
          <div
            key={setting.title}
            className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5"
          >
            <h3 className="text-sm font-semibold text-launcher-text">{setting.title}</h3>
            <p className="mt-0.5 text-xs text-launcher-muted">{setting.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={setting.value}
                className="flex-1 rounded-lg border border-launcher-border bg-launcher-elevated px-3 py-2 font-mono text-xs text-launcher-muted outline-none focus:border-launcher-accent/50"
              />
              <button
                type="button"
                className="shrink-0 rounded-lg border border-launcher-border px-3 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted transition-colors hover:border-launcher-accent/40 hover:text-launcher-accent"
              >
                Browse
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5">
        <h3 className="text-sm font-semibold text-launcher-text">Preferences</h3>
        <div className="mt-4 space-y-4">
          {[
            { label: 'Auto-check for mod updates on startup', enabled: true },
            { label: 'Minimize launcher when game starts', enabled: true },
            { label: 'Create backup before enabling mods', enabled: false },
            { label: 'Show notifications for mod conflicts', enabled: true }
          ].map((pref) => (
            <label
              key={pref.label}
              className="flex cursor-pointer items-center justify-between gap-4"
            >
              <span className="text-sm text-launcher-muted">{pref.label}</span>
              <div
                className={[
                  'relative h-6 w-11 rounded-full transition-colors',
                  pref.enabled ? 'bg-launcher-accent/30' : 'bg-launcher-border'
                ].join(' ')}
              >
                <div
                  className={[
                    'absolute top-0.5 h-5 w-5 rounded-full transition-all',
                    pref.enabled
                      ? 'left-[22px] bg-launcher-accent shadow-[0_0_8px_var(--color-launcher-glow)]'
                      : 'left-0.5 bg-launcher-muted'
                  ].join(' ')}
                />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
