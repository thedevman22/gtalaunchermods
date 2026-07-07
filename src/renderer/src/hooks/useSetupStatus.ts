import { useEffect, useState } from 'react'
import type { SetupStatus } from '../../../shared/dependencies'

/** Live setup status (game path + dependencies), kept in sync via setup:changed. */
export function useSetupStatus(): SetupStatus | null {
  const [status, setStatus] = useState<SetupStatus | null>(null)

  useEffect(() => {
    void window.api.setup.getStatus().then(setStatus)
    return window.api.setup.onChanged(setStatus)
  }, [])

  return status
}
