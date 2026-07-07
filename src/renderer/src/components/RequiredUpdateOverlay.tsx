import { Loader2 } from 'lucide-react'
import ModHarborLogo from '@renderer/components/ModHarborLogo'
import MotionButton from '@renderer/components/MotionButton'
import { useUpdate } from '@renderer/context/UpdateContext'

export default function RequiredUpdateOverlay(): React.JSX.Element | null {
  const { status, isPackaged, busy, applyUpdate, checkForUpdates, appVersion } = useUpdate()

  if (!isPackaged || !status.required) {
    return null
  }

  const showProgress = status.status === 'downloading'
  const showReady = status.status === 'ready'
  const showError = status.status === 'error'
  const isChecking = status.status === 'checking' || status.status === 'idle'
  const actionLabel = showReady
    ? 'Restart Now'
    : showProgress
      ? 'Downloading…'
      : showError
        ? 'Try Again'
        : isChecking
          ? 'Checking for update…'
          : 'Update Now'

  const handleAction = (): void => {
    if (showError || isChecking) {
      void checkForUpdates()
      return
    }
    void applyUpdate()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-launcher-bg/95 p-6 backdrop-blur-md"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="required-update-title"
      aria-describedby="required-update-desc"
    >
      <div className="w-full max-w-md rounded-2xl border border-launcher-accent/30 bg-launcher-surface p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center">
          <ModHarborLogo variant="mark" size={48} />
        </div>

        <h2
          id="required-update-title"
          className="mt-6 font-display text-xl font-bold tracking-tight text-launcher-text"
        >
          An update is required to continue
        </h2>

        <p id="required-update-desc" className="mt-3 text-sm leading-relaxed text-launcher-muted">
          {status.message ??
            `ModHarbor v${status.minimumVersion ?? 'latest'} or newer is required. You are on v${appVersion}.`}
        </p>

        {showProgress && status.progress !== undefined ? (
          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-launcher-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-launcher-accent to-launcher-accent-dim transition-all duration-200"
                style={{ width: `${status.progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-launcher-muted">{status.progress}% complete</p>
          </div>
        ) : null}

        <MotionButton
          disabled={(busy && !showError) || (isChecking && busy)}
          onClick={handleAction}
          className="btn-primary mt-8 w-full px-6 py-3.5 text-xs"
        >
          {busy && !showError ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {actionLabel}
            </span>
          ) : (
            actionLabel
          )}
        </MotionButton>

        {status.version ? (
          <p className="mt-4 text-[11px] text-launcher-muted">Update version: v{status.version}</p>
        ) : null}
      </div>
    </div>
  )
}
