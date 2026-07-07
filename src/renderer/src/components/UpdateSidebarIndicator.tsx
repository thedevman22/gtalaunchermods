import { Loader2 } from 'lucide-react'
import { useUpdate } from '@renderer/context/UpdateContext'

export default function UpdateSidebarIndicator(): React.JSX.Element | null {
  const { status, isPackaged, busy, applyUpdate, checkForUpdates } = useUpdate()

  if (!isPackaged) {
    return null
  }

  const { state, label, interactive } = getIndicatorState(status, busy)

  const content = (
    <>
      {state === 'checking' || state === 'downloading' ? (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin" aria-hidden />
      ) : state === 'upToDate' ? (
        <span className="text-emerald-400" aria-hidden>
          ✓
        </span>
      ) : null}
      <span className="truncate">{label}</span>
      {status.status === 'downloading' && status.progress !== undefined ? (
        <span className="shrink-0 text-[10px] tabular-nums">{status.progress}%</span>
      ) : null}
    </>
  )

  if (interactive) {
    const onClick = state === 'error' ? checkForUpdates : applyUpdate
    return (
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy || status.status === 'checking'}
        className="flex w-full items-center gap-2 rounded-lg border border-launcher-accent/35 bg-launcher-accent/10 px-3 py-2 text-left text-[11px] font-semibold text-launcher-accent transition-colors hover:bg-launcher-accent/15 disabled:cursor-wait disabled:opacity-70"
      >
        {content}
      </button>
    )
  }

  return (
    <div
      className={[
        'flex items-center gap-2 rounded-lg px-3 py-2 text-[11px]',
        state === 'upToDate' ? 'text-launcher-muted' : 'text-launcher-muted'
      ].join(' ')}
      role="status"
    >
      {content}
    </div>
  )
}

function getIndicatorState(
  status: ReturnType<typeof useUpdate>['status'],
  busy: boolean
): { state: 'checking' | 'upToDate' | 'available' | 'downloading' | 'ready' | 'error'; label: string; interactive: boolean } {
  if (status.status === 'checking') {
    return { state: 'checking', label: 'Checking…', interactive: false }
  }

  if (status.status === 'downloading') {
    return { state: 'downloading', label: 'Downloading update…', interactive: false }
  }

  if (status.status === 'ready') {
    return { state: 'ready', label: 'Restart to update', interactive: true }
  }

  if (status.status === 'available') {
    return { state: 'available', label: 'Update available', interactive: true }
  }

  if (status.status === 'error') {
    return { state: 'error', label: 'Update check failed', interactive: true }
  }

  if (status.upToDate) {
    return { state: 'upToDate', label: 'Up to date', interactive: false }
  }

  if (busy) {
    return { state: 'checking', label: 'Checking…', interactive: false }
  }

  return { state: 'checking', label: 'Checking…', interactive: false }
}
