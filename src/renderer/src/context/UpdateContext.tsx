import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { UpdateStatusPayload } from '../../../shared/update'

interface UpdateContextValue {
  status: UpdateStatusPayload
  appVersion: string
  isPackaged: boolean
  busy: boolean
  applyUpdate: () => Promise<void>
  checkForUpdates: () => Promise<void>
}

const UpdateContext = createContext<UpdateContextValue | null>(null)

const INITIAL: UpdateStatusPayload = { status: 'checking', upToDate: false }

const isPackagedBuild = !import.meta.env.DEV

export function UpdateProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [status, setStatus] = useState<UpdateStatusPayload>(
    isPackagedBuild ? INITIAL : { status: 'idle', upToDate: true, message: 'Development build' }
  )
  const [appVersion, setAppVersion] = useState('0.0.0')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void window.api.update.getAppVersion().then(setAppVersion)

    if (!isPackagedBuild) return

    let mounted = true

    void window.api.update.getStatus().then((next) => {
      if (mounted) setStatus(next)
    })

    const unsubscribeUpdate = window.api.update.onStatusChanged((payload) => {
      setStatus(payload)
      setBusy(payload.status === 'downloading')
    })

    const unsubscribeCatalog = window.api.catalog.onChanged(() => {
      void window.api.update.getStatus().then((next) => {
        if (mounted) setStatus(next)
      })
    })

    return () => {
      mounted = false
      unsubscribeUpdate()
      unsubscribeCatalog()
    }
  }, [])

  const applyUpdate = useCallback(async (): Promise<void> => {
    if (!isPackagedBuild) return
    setBusy(true)
    try {
      if (status.status === 'ready') {
        await window.api.update.install()
        return
      }
      await window.api.update.downloadAndInstall()
    } finally {
      setBusy(false)
    }
  }, [status.status])

  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (!isPackagedBuild) return
    setBusy(true)
    try {
      await window.api.update.check()
    } finally {
      setBusy(false)
    }
  }, [])

  const value = useMemo<UpdateContextValue>(
    () => ({
      status,
      appVersion,
      isPackaged: isPackagedBuild,
      busy,
      applyUpdate,
      checkForUpdates
    }),
    [status, appVersion, busy, applyUpdate, checkForUpdates]
  )

  return <UpdateContext.Provider value={value}>{children}</UpdateContext.Provider>
}

export function useUpdate(): UpdateContextValue {
  const context = useContext(UpdateContext)
  if (!context) {
    throw new Error('useUpdate must be used within UpdateProvider.')
  }
  return context
}
