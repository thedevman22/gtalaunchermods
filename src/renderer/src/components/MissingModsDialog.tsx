import type { MissingCloudMod } from '../../../shared/sync'

interface MissingModsDialogProps {
  mods: MissingCloudMod[]
  busy: boolean
  onDownloadAll: () => void
  onDownloadOne: (modId: string) => void
  onDismiss: () => void
}

export default function MissingModsDialog({
  mods,
  busy,
  onDownloadAll,
  onDownloadOne,
  onDismiss
}: MissingModsDialogProps): React.JSX.Element | null {
  if (mods.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-launcher-bg/80 p-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-labelledby="missing-mods-title"
        className="w-full max-w-lg rounded-2xl border border-launcher-border bg-launcher-surface p-6 shadow-2xl"
      >
        <h2 id="missing-mods-title" className="font-display text-xl font-bold text-launcher-text">
          Re-download missing mods?
        </h2>
        <p className="mt-2 text-sm text-launcher-muted">
          These mods are saved to your account but not installed on this device.
        </p>

        <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
          {mods.map((mod) => (
            <li
              key={mod.modId}
              className="flex items-center justify-between gap-3 rounded-xl border border-launcher-border/80 bg-launcher-elevated/50 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-launcher-text">{mod.name}</p>
                <p className="text-[10px] text-launcher-muted">
                  {mod.enabled ? 'Was enabled' : 'Was disabled'} on your other device
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onDownloadOne(mod.modId)}
                className="shrink-0 rounded-lg border border-launcher-accent/40 bg-launcher-accent/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-accent disabled:opacity-50"
              >
                Download
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onDismiss}
            className="rounded-xl border border-launcher-border px-4 py-2 text-xs font-semibold text-launcher-muted hover:text-launcher-text disabled:opacity-50"
          >
            Not now
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDownloadAll}
            className="rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-5 py-2 text-xs font-bold uppercase tracking-wider text-launcher-bg disabled:opacity-50"
          >
            {busy ? 'Downloading…' : 'Download all'}
          </button>
        </div>
      </div>
    </div>
  )
}
