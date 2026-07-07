import { useCallback, useEffect, useState } from 'react'

export type StartupPhase = 'loading' | 'exiting' | 'hidden'

interface StartupState {
  phase: StartupPhase
  progress: number
  statusText: string
}

const MIN_SPLASH_MS = 2200
const EXIT_ANIMATION_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function useStartupSequence(start: boolean): StartupState {
  const [phase, setPhase] = useState<StartupPhase>(start ? 'loading' : 'hidden')
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing launcher…')

  const runSequence = useCallback(async (signal: { cancelled: boolean }): Promise<void> => {
    const beganAt = Date.now()

    const steps: { label: string; run: () => Promise<unknown> }[] = [
      { label: 'Locating GTA V installation…', run: () => window.api.game.getPath() },
      { label: 'Checking mod prerequisites…', run: () => window.api.setup.getStatus() },
      { label: 'Loading mod catalog…', run: () => window.api.catalog.getMods() },
      { label: 'Preparing your dashboard…', run: () => delay(300) }
    ]

    for (let index = 0; index < steps.length; index += 1) {
      if (signal.cancelled) return
      const step = steps[index]
      setStatusText(step.label)
      try {
        await step.run()
      } catch {
        // Non-fatal during splash — main UI can surface errors later.
      }
      setProgress(Math.round(((index + 1) / steps.length) * 100))
    }

    const elapsed = Date.now() - beganAt
    if (elapsed < MIN_SPLASH_MS) {
      await delay(MIN_SPLASH_MS - elapsed)
    }

    if (signal.cancelled) return
    setPhase('exiting')
    await delay(EXIT_ANIMATION_MS)
    if (signal.cancelled) return
    setPhase('hidden')
  }, [])

  useEffect(() => {
    if (!start) {
      setPhase('hidden')
      return
    }

    const signal = { cancelled: false }
    void runSequence(signal)

    return () => {
      signal.cancelled = true
    }
  }, [runSequence, start])

  return { phase, progress, statusText }
}
