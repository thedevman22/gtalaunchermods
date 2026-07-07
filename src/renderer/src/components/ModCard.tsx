import type { ModSummary } from '../../../preload/index.d'

interface ModCardProps {
  mod: ModSummary
  busy: boolean
  onToggle: (modId: string, enabled: boolean) => void
  onDelete: (modId: string) => void
}

export default function ModCard({ mod, busy, onToggle, onDelete }: ModCardProps): React.JSX.Element {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-launcher-border bg-launcher-surface/70 transition-colors hover:border-launcher-accent/30">
      <div className="relative aspect-video overflow-hidden bg-launcher-elevated">
        {mod.thumbnailDataUrl ? (
          <img
            src={mod.thumbnailDataUrl}
            alt={mod.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-launcher-elevated via-launcher-surface to-launcher-border">
            <span className="font-display text-4xl font-black text-launcher-accent/40">
              {mod.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span
          className={[
            'absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            mod.enabled
              ? 'bg-launcher-accent/90 text-launcher-bg'
              : 'bg-launcher-bg/80 text-launcher-muted'
          ].join(' ')}
        >
          {mod.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-launcher-text">{mod.name}</h3>
        <p className="mt-0.5 text-xs text-launcher-muted">by {mod.author}</p>
        {mod.version && (
          <p className="mt-1 font-mono text-[10px] text-launcher-muted/80">v{mod.version}</p>
        )}
        {mod.description && (
          <p className="mt-2 line-clamp-2 flex-1 text-xs text-launcher-muted">{mod.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-launcher-border/60 pt-3">
          <label className="flex cursor-pointer items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={mod.enabled}
              disabled={busy}
              onClick={() => onToggle(mod.id, !mod.enabled)}
              className={[
                'relative h-6 w-11 rounded-full transition-colors disabled:opacity-50',
                mod.enabled ? 'bg-launcher-accent/30' : 'bg-launcher-border'
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-5 w-5 rounded-full transition-all',
                  mod.enabled
                    ? 'left-[22px] bg-launcher-accent shadow-[0_0_8px_var(--color-launcher-glow)]'
                    : 'left-0.5 bg-launcher-muted'
                ].join(' ')}
              />
            </button>
            <span className="text-xs text-launcher-muted">{mod.enabled ? 'On' : 'Off'}</span>
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(mod.id)}
            className="rounded-lg border border-red-500/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-colors hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
