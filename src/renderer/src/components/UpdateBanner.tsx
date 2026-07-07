import { useEffect, useState } from 'react'
import MotionButton from '@renderer/components/MotionButton'
import type { UpdateStatusPayload } from '../../../shared/update'

const IDLE: UpdateStatusPayload = { status: 'idle' }

export default function UpdateBanner(): React.JSX.Element | null {
  const [update, setUpdate] = useState<UpdateStatusPayload>(IDLE)

  useEffect(() => {
    return window.api.update.onStatusChanged(setUpdate)
  }, [])

  if (update.status === 'idle' || update.status === 'checking') {
    return null
  }

  if (update.status === 'error') {
    return null
  }

  return (
    <div className="border-b border-launcher-accent/25 bg-launcher-accent/10 px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-launcher-accent">
            {update.status === 'ready' ? 'Update ready' : 'Update available'}
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
