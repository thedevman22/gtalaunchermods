import { useEffect, useState } from 'react'
import { SPLASH_TIPS } from '@renderer/data/splashTips'
import ModHarborLogo from '@renderer/components/ModHarborLogo'
import WaveDivider from '@renderer/components/WaveDivider'

interface SplashScreenProps {
  progress: number
  statusText: string
  exiting?: boolean
}

export default function SplashScreen({
  progress,
  statusText,
  exiting = false
}: SplashScreenProps): React.JSX.Element {
  const [tipIndex, setTipIndex] = useState(0)
  const [tipVisible, setTipVisible] = useState(true)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTipVisible(false)
      window.setTimeout(() => {
        setTipIndex((current) => (current + 1) % SPLASH_TIPS.length)
        setTipVisible(true)
      }, 280)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <div
      className={[
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-launcher-bg transition-opacity duration-500',
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center px-8">
        <div
          className={[
            'splash-logo-enter shadow-[0_8px_40px_rgba(43,159,212,0.3)]',
            exiting ? 'scale-100 opacity-100' : ''
          ].join(' ')}
        >
          <ModHarborLogo size={112} className="rounded-3xl" />
        </div>

        <h1 className="splash-title-enter mt-8 font-display text-3xl font-bold tracking-wide text-launcher-text">
          ModHarbor
        </h1>
        <p className="splash-title-enter mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-launcher-accent">
          Story mode · Offline · Safe
        </p>

        <div className="splash-bar-enter mt-12 w-80 max-w-[85vw]">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-launcher-muted">
            <span>{statusText}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-launcher-border/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-launcher-accent to-launcher-accent-dim shadow-[0_0_12px_var(--color-launcher-glow)] transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        <p
          className={[
            'mt-8 max-w-md text-center text-sm leading-relaxed text-launcher-muted transition-opacity duration-300',
            tipVisible ? 'opacity-100' : 'opacity-0'
          ].join(' ')}
        >
          {SPLASH_TIPS[tipIndex]}
        </p>
      </div>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </div>
  )
}
