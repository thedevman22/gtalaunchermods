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
  launchingProfileId: string | null
  startLaunch: () => Promise<void>
  startProfileLaunch: (profileId: string) => Promise<void>
}

const LaunchContext = createContext<LaunchContextValue | null>(null)

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function LaunchProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [isLaunching, setIsLaunching] = useState(false)
  const [launchingProfileId, setLaunchingProfileId] = useState<string | null>(null)
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
          setLaunchingProfileId(null)
          launchActive.current = false
        }, 700)
      }

      if (payload.status === 'error' && payload.error) {
        setError(payload.error)
        window.setTimeout(() => {
          setIsLaunching(false)
          setLaunchingProfileId(null)
          launchActive.current = false
        }, 2500)
      }
    })

    return unsubscribe
  }, [])

  const runLaunchSequence = useCallback(
    async (profileId: string | null, modCount: number): Promise<void> => {
      if (launchActive.current) return

      launchActive.current = true
      setIsLaunching(true)
      setLaunchingProfileId(profileId)
      setError(null)
      setProgress(8)
      setStatusText('Clearing previous profile mods…')

      try {
        setProgress(24)
        setStatusText(
          modCount > 0
            ? `Applying profile mods… (${modCount} mod${modCount === 1 ? '' : 's'})`
            : 'No mods in profile — launching vanilla story mode'
        )
        await delay(650)

        setProgress(52)
        setStatusText(LAUNCH_STAGES[1])
        await delay(650)

        setProgress(72)
        setStatusText(LAUNCH_STAGES[2])

        const result = profileId
          ? await window.api.profiles.launch(profileId)
          : await window.api.game.launch()

        if (!result.success) {
          setError(result.error ?? 'Failed to launch GTA V.')
          setProgress(100)
          await delay(2200)
          setIsLaunching(false)
          setLaunchingProfileId(null)
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
          setLaunchingProfileId(null)
          launchActive.current = false
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Launch failed.')
        await delay(2200)
        setIsLaunching(false)
        setLaunchingProfileId(null)
        launchActive.current = false
      }
    },
    []
  )

  const startProfileLaunch = useCallback(
    async (profileId: string): Promise<void> => {
      const profile = await window.api.profiles.get(profileId)
      await runLaunchSequence(profileId, profile?.modIds.length ?? 0)
    },
    [runLaunchSequence]
  )

  const startLaunch = useCallback(async (): Promise<void> => {
    const profiles = await window.api.profiles.list()
    if (profiles.length > 0) {
      const activeId = await window.api.profiles.getActiveId()
      const targetId = activeId || profiles[0].id
      await startProfileLaunch(targetId)
      return
    }
    await runLaunchSequence(null, 0)
  }, [runLaunchSequence, startProfileLaunch])

  const value = useMemo<LaunchContextValue>(
    () => ({
      isLaunching,
      launchingProfileId,
      startLaunch,
      startProfileLaunch
    }),
    [isLaunching, launchingProfileId, startLaunch, startProfileLaunch]
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
