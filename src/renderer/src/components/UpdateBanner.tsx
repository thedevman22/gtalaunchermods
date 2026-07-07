import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MotionButton from '@renderer/components/MotionButton'
import type { UpdateStatusPayload } from '../../../shared/update'

const IDLE: UpdateStatusPayload = { status: 'idle', autoUpdate: true }

export default function UpdateBanner(): React.JSX.Element | null {
  const [update, setUpdate] = useState<UpdateStatusPayload>(IDLE)
  const [toastDismissed, setToastDismissed] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    void window.api.update.getStatus().then(setUpdate)
    return window.api.update.onStatusChanged((payload) => {
      setUpdate(payload)
      if (payload.status !== 'ready') {
        setToastDismissed(false)
      }
      if (payload.status !== 'available') {
        setDownloading(false)
      }
    })
  }, [])

  const autoMode = update.autoUpdate !== false

  const handleDownload = async (): Promise<void> => {
    setDownloading(true)
    const result = await window.api.update.download()
    if (!result.success) {
      setDownloading(false)
    }
  }

  // Errors and idle/checking states never show anything — update checks must not disturb usage.
  if (update.status === 'idle' || update.status === 'checking' || update.status === 'error') {
    return null
  }

  // Auto mode: downloads happen silently; only surface a small toast once ready.
  if (autoMode) {
    if (update.status !== 'ready' || toastDismissed) {
      return null
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-4 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-launcher-accent/30 bg-launcher-surface/95 p-4 shadow-lg backdrop-blur-sm"
          role="status"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-launcher-accent">
                Update ready{update.version ? ` — v${update.version}` : ''}
              </p>
              <p className="mt-1 text-xs text-launcher-muted">
                Restart to apply. It also installs automatically next time you quit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setToastDismissed(true)}
              aria-label="Dismiss update notification"
              className="shrink-0 rounded-md px-1.5 text-launcher-muted hover:text-launcher-text"
            >
              ✕
            </button>
          </div>
          <MotionButton
            onClick={() => void window.api.update.install()}
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-launcher-bg"
          >
            Restart Now
          </MotionButton>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Manual mode: persistent banner the user acts on themselves.
  return (
    <div className="border-b border-launcher-accent/25 bg-launcher-accent/10 px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-launcher-accent">
            {update.status === 'ready'
              ? 'Update ready'
              : `Update available${update.version ? ` — v${update.version}` : ''}`}
          </p>
          <p className="text-xs text-launcher-muted">{update.message}</p>
          {update.status === 'downloading' && update.progress !== undefined ? (
            <div className="mt-2 h-1.5 w-48 max-w-full overflow-hidden rounded-full bg-launcher-border">
              <div
                className="h-full rounded-full bg-launcher-accent transition-all duration-200"
                style={{ width: `${update.progress}%` }}
              />
            </div>
          ) : null}
        </div>

        {update.status === 'available' ? (
          <MotionButton
            disabled={downloading}
            onClick={() => void handleDownload()}
            className="shrink-0 rounded-lg bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-launcher-bg disabled:opacity-60"
          >
            {downloading ? 'Starting…' : 'Download & Install'}
          </MotionButton>
        ) : null}

        {update.status === 'ready' ? (
          <MotionButton
            onClick={() => void window.api.update.install()}
            className="shrink-0 rounded-lg bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-launcher-bg"
          >
            Restart to update
          </MotionButton>
        ) : null}
      </div>
    </div>
  )
}
