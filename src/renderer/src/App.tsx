import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '@renderer/components/Sidebar'
import SpotlightTour from '@renderer/components/SpotlightTour'
import UpdateBanner from '@renderer/components/UpdateBanner'
import SplashScreen from '@renderer/components/SplashScreen'
import OnboardingWizard from '@renderer/components/OnboardingWizard'
import HomePage from '@renderer/pages/HomePage'
import ModsPage from '@renderer/pages/ModsPage'
import SettingsPage from '@renderer/pages/SettingsPage'
import AccountPage from '@renderer/pages/AccountPage'
import LoginPage from '@renderer/pages/LoginPage'
import { AuthProvider, useAuth } from '@renderer/context/AuthContext'
import { UpgradeFlowProvider } from '@renderer/context/UpgradeFlowContext'
import { LaunchProvider } from '@renderer/context/LaunchContext'
import { ProfileProvider } from '@renderer/context/ProfileContext'
import { ModSyncProvider } from '@renderer/context/ModSyncContext'
import { useSetupStatus } from '@renderer/hooks/useSetupStatus'
import { useStartupSequence } from '@renderer/hooks/useStartupSequence'
import { pageTransition } from '@renderer/lib/motion'
import { getTourSteps, hasSeenTour, markTourSeen } from '@renderer/lib/tour'
import type { OnboardingState } from '../../shared/onboarding'
import type { NavItem } from '@renderer/types/navigation'

function MainShell(): React.JSX.Element {
  const [activeNav, setActiveNav] = useState<NavItem>('home')
  const { user, isOfflineDev } = useAuth()
  const setupStatus = useSetupStatus()
  const [tourOpen, setTourOpen] = useState(false)
  const tourTimer = useRef<number | null>(null)

  const tourUserKey = user?.id ?? (isOfflineDev ? 'offline-dev' : 'anon')

  useEffect(() => {
    void window.api.setup.getStatus().then((status) => {
      // Only steer to the checklist when a game folder exists but deps are
      // missing. With setup skipped, Home shows the "Finish setup" card.
      if (status.gamePathConfigured && !status.setupComplete) {
        setActiveNav('mods')
      }
    })

    const unsubscribe = window.api.setup.onOpenChecklist(() => {
      setActiveNav('mods')
    })

    return unsubscribe
  }, [])

  // First dashboard visit: run the welcome tour once per user.
  useEffect(() => {
    if (tourOpen || activeNav !== 'home' || hasSeenTour(tourUserKey)) return
    const timer = window.setTimeout(() => setTourOpen(true), 900)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tourOpen intentionally omitted
  }, [activeNav, tourUserKey])

  const startTour = (): void => {
    setActiveNav('home')
    if (tourTimer.current !== null) window.clearTimeout(tourTimer.current)
    // Give the page transition time to settle before measuring targets.
    tourTimer.current = window.setTimeout(() => setTourOpen(true), 450)
  }

  const closeTour = (): void => {
    markTourSeen(tourUserKey)
    setTourOpen(false)
  }

  const renderPage = (): React.JSX.Element => {
    switch (activeNav) {
      case 'home':
        return <HomePage />
      case 'mods':
        return <ModsPage onNavigateSettings={() => setActiveNav('settings')} />
      case 'settings':
        return <SettingsPage onStartTour={startTour} />
      case 'account':
        return <AccountPage />
    }
  }

  return (
    <div className="flex h-full">
      <Sidebar active={activeNav} onNavigate={setActiveNav} />

      <main className="flex min-w-0 flex-1 flex-col">
        <UpdateBanner />
        {isOfflineDev && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 text-center text-xs text-amber-200">
            Offline dev mode — add Supabase keys to <code className="text-amber-100">.env</code> to enable login
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} {...pageTransition} className="h-full">
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {tourOpen && (
        <SpotlightTour
          steps={getTourSteps(setupStatus?.gamePathConfigured ?? false)}
          onClose={closeTour}
        />
      )}
    </div>
  )
}

function AppContent(): React.JSX.Element {
  const { session, loading, isOfflineDev } = useAuth()
  const startup = useStartupSequence(!loading)
  const showMain = startup.phase === 'hidden'
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null)

  useEffect(() => {
    if (!showMain) return

    void window.api.onboarding.getState().then(setOnboarding)
    return window.api.onboarding.onChanged(setOnboarding)
  }, [showMain])

  if (!showMain) {
    return (
      <SplashScreen
        progress={startup.progress}
        statusText={startup.statusText}
        exiting={startup.phase === 'exiting'}
      />
    )
  }

  if (!session && !isOfflineDev) {
    return (
      <div className="app-enter h-full">
        <LoginPage />
      </div>
    )
  }

  if (!onboarding) {
    return (
      <div className="flex h-full items-center justify-center bg-launcher-bg">
        <span className="text-sm text-launcher-muted">Loading…</span>
      </div>
    )
  }

  if (!onboarding.complete) {
    return (
      <div className="app-enter h-full">
        <OnboardingWizard onComplete={() => setOnboarding({ ...onboarding, complete: true })} />
      </div>
    )
  }

  return (
    <div className="app-enter h-full">
      <MainShell />
    </div>
  )
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <UpgradeFlowProvider>
        <ModSyncProvider>
          <LaunchProvider>
            <ProfileProvider>
              <AppContent />
            </ProfileProvider>
          </LaunchProvider>
        </ModSyncProvider>
      </UpgradeFlowProvider>
    </AuthProvider>
  )
}
