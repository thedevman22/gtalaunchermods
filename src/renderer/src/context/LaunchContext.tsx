import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import { LAUNCH_STAGES } from '@renderer/data/splashTips'
import LaunchOverlay from '@renderer/components/LaunchOverlay'

interface LaunchContextValue {
  isLaunching: boolean
  startLaunch: () => Promise<void>
}

const LaunchContext = createContext<LaunchContextValue | null>(null)

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function LaunchProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isLaunching, setIsLaunching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState<string>(LAUNCH_STAGES[0])
  const [error, setError] = useState<string | null>(null)
  const launchActive = useRef(false)

  useEffect(() => {
    const unsubscribe = window.api.game.onStatusChanged((payload) => {
      if (!launchActive.current) return

      if (payload.status === 'running') {
        setProgress(100)
        setStatusText('Game started — have fun in Los Santos!')
        window.setTimeout(() => {
          setIsLaunching(false)
          launchActive.current = false
        }, 700)
      }

      if (payload.status === 'error' && payload.error) {
        setError(payload.error)
        window.setTimeout(() => {
          setIsLaunching(false)
          launchActive.current = false
        }, 2500)
      }
    })

    return unsubscribe
  }, [])

  const startLaunch = useCallback(async (): Promise<void> => {
    if (launchActive.current) return

    launchActive.current = true
    setIsLaunching(true)
    setError(null)
    setProgress(8)
    setStatusText(LAUNCH_STAGES[0])

    try {
      const library = await window.api.mods.list()
      const enabledCount = library.mods.filter((mod) => mod.enabled).length
      setProgress(28)
      setStatusText(
        enabledCount > 0
          ? `Applying mods… (${enabledCount} active)`
          : 'Applying mods… (none enabled)'
      )
      await delay(750)

      setProgress(52)
      setStatusText(LAUNCH_STAGES[1])
      await delay(650)

      setProgress(72)
      setStatusText(LAUNCH_STAGES[2])

      const result = await window.api.game.launch()
      if (!result.success) {
        setError(result.error ?? 'Failed to launch GTA V.')
        setProgress(100)
        await delay(2200)
        setIsLaunching(false)
        launchActive.current = false
        return
      }

      setProgress(92)
      await delay(500)

      const status = await window.api.game.getStatus()
      if (status.status === 'running') {
        setProgress(100)
        setStatusText('Game started — have fun in Los Santos!')
        await delay(700)
        setIsLaunching(false)
        launchActive.current = false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Launch failed.')
      await delay(2200)
      setIsLaunching(false)
      launchActive.current = false
    }
  }, [])

  const value = useMemo<LaunchContextValue>(
    () => ({
      isLaunching,
      startLaunch
    }),
    [isLaunching, startLaunch]
  )

  return (
    <LaunchContext.Provider value={value}>
      {children}
      <LaunchOverlay visible={isLaunching} progress={progress} statusText={statusText} error={error} />
    </LaunchContext.Provider>
  )
}

export function useLaunch(): LaunchContextValue {
  const context = useContext(LaunchContext)
  if (!context) {
    throw new Error('useLaunch must be used within LaunchProvider.')
  }
  return context
}
