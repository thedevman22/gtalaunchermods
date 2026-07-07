import { useEffect, useState } from 'react'
import Sidebar from '@renderer/components/Sidebar'
import HomePage from '@renderer/pages/HomePage'
import ModsPage from '@renderer/pages/ModsPage'
import SettingsPage from '@renderer/pages/SettingsPage'
import AccountPage from '@renderer/pages/AccountPage'
import LoginPage from '@renderer/pages/LoginPage'
import { AuthProvider, useAuth } from '@renderer/context/AuthContext'
import type { NavItem } from '@renderer/types/navigation'

const PAGE_TITLES: Record<NavItem, string> = {
  home: 'Home',
  mods: 'Mods',
  settings: 'Settings',
  account: 'Account'
}

function LoadingScreen(): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center bg-launcher-bg">
      <div className="flex items-center gap-3 text-sm text-launcher-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-launcher-accent" />
        Loading…
      </div>
    </div>
  )
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
          <ModsPage
            onNavigateToAccount={() => setActiveNav('account')}
            onNavigateSettings={() => setActiveNav('settings')}
          />
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

        <div className="flex-1 overflow-y-auto p-6">{renderPage()}</div>
      </main>
    </div>
  )
}

function AppContent(): React.JSX.Element {
  const { session, loading, isOfflineDev } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!session && !isOfflineDev) {
    return <LoginPage />
  }

  return <MainShell />
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
