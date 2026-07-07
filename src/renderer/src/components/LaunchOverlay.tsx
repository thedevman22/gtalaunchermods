interface LaunchOverlayProps {
  visible: boolean
  progress: number
  statusText: string
  error?: string | null
}

export default function LaunchOverlay({
  visible,
  progress,
  statusText,
  error
}: LaunchOverlayProps): React.JSX.Element | null {
  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-launcher-bg/95 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,230,118,0.08),transparent_60%)]" />

      <div className="relative w-full max-w-md px-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-launcher-accent/15 ring-1 ring-launcher-accent/30">
          <svg
            className="h-8 w-8 animate-pulse text-launcher-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="mt-6 font-display text-2xl font-bold text-launcher-text">Launching GTA V…</h2>
        <p className="mt-2 text-sm text-launcher-muted">{statusText}</p>

        <div className="mt-8">
          <div className="h-2 overflow-hidden rounded-full bg-launcher-border/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-launcher-accent via-launcher-accent-dim to-launcher-accent transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-launcher-muted">
            {Math.round(progress)}%
          </p>
        </div>

        {error ? (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        ) : (
          <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-launcher-muted/80">
            Story-mode offline · Mods applied
          </p>
        )}
      </div>
    </div>
  )
}
