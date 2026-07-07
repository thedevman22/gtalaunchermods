import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '@renderer/components/Sidebar'
import SplashScreen from '@renderer/components/SplashScreen'
import HomePage from '@renderer/pages/HomePage'
import ModsPage from '@renderer/pages/ModsPage'
import SettingsPage from '@renderer/pages/SettingsPage'
import AccountPage from '@renderer/pages/AccountPage'
import LoginPage from '@renderer/pages/LoginPage'
import { AuthProvider, useAuth } from '@renderer/context/AuthContext'
import { LaunchProvider } from '@renderer/context/LaunchContext'
import { ModSyncProvider } from '@renderer/context/ModSyncContext'
import { useStartupSequence } from '@renderer/hooks/useStartupSequence'
import { pageTransition } from '@renderer/lib/motion'
import type { NavItem } from '@renderer/types/navigation'

const PAGE_TITLES: Record<NavItem, string> = {
  home: 'Home',
  mods: 'Mods',
  settings: 'Settings',
  account: 'Account'
}

function MainShell(): React.JSX.Element {
  const [activeNav, setActiveNav] = useState<NavItem>('home')
  const { isOfflineDev } = useAuth()

  useEffect(() => {
    void window.api.setup.getStatus().then((status) => {
      if (!status.setupComplete) {
        setActiveNav('mods')
      }
    })

    const unsubscribe = window.api.setup.onOpenChecklist(() => {
      setActiveNav('mods')
    })

    return unsubscribe
  }, [])

  const renderPage = (): React.JSX.Element => {
    switch (activeNav) {
      case 'home':
        return <HomePage />
      case 'mods':
        return (
          <ModsPage onNavigateSettings={() => setActiveNav('settings')} />
        )
      case 'settings':
        return <SettingsPage />
      case 'account':
        return <AccountPage />
    }
  }

  return (
    <div className="flex h-full">
      <Sidebar active={activeNav} onNavigate={setActiveNav} />

      <main className="flex min-w-0 flex-1 flex-col">
        {isOfflineDev && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-6 py-2 text-center text-xs text-amber-200">
            Offline dev mode — add Supabase keys to <code className="text-amber-100">.env</code> to enable login
          </div>
        )}
        <header className="flex h-12 shrink-0 items-center border-b border-launcher-border/60 px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-launcher-muted">
            {PAGE_TITLES[activeNav]}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} {...pageTransition} className="h-full">
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function AppContent(): React.JSX.Element {
  const { session, loading, isOfflineDev } = useAuth()
  const startup = useStartupSequence(!loading)
  const showMain = startup.phase === 'hidden'

  if (!showMain) {
    return (
      <SplashScreen
        progress={startup.progress}
        statusText={startup.statusText}
        exiting={startup.phase === 'exiting'}
      />
    )
  }

  return (
    <div className="app-enter h-full">
      {!session && !isOfflineDev ? <LoginPage /> : <MainShell />}
    </div>
  )
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <ModSyncProvider>
        <LaunchProvider>
          <AppContent />
        </LaunchProvider>
      </ModSyncProvider>
    </AuthProvider>
  )
}
