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
import { AnimatePresence } from 'framer-motion'
import TierUpgradeCelebration from '@renderer/components/TierUpgradeCelebration'
import { useAuth } from '@renderer/context/AuthContext'
import { watchForTierUpgrade, WEBSITE_URL } from '@renderer/lib/billing'
import { buildWebsitePricingUrl } from '../../../shared/billing'
import type { SubscriptionTier } from '../../../shared/profile'
import { hasTier } from '../../../shared/profile'

interface UpgradeFlowContextValue {
  startUpgrade: (tier?: 'pro' | 'elite') => void
  awaitingPayment: boolean
  dismissCelebration: () => void
}

const UpgradeFlowContext = createContext<UpgradeFlowContextValue | null>(null)

export function UpgradeFlowProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const { session, profile, refreshProfile, isOfflineDev, openAuthModal } = useAuth()
  const [awaitingPayment, setAwaitingPayment] = useState(false)
  const [celebrationTier, setCelebrationTier] = useState<SubscriptionTier | null>(null)
  const watcherRef = useRef<ReturnType<typeof watchForTierUpgrade> | null>(null)
  const previousTierRef = useRef<SubscriptionTier>('free')

  const stopWatcher = useCallback((): void => {
    watcherRef.current?.stop()
    watcherRef.current = null
  }, [])

  const handleTierDetected = useCallback(
    async (newTier: SubscriptionTier): Promise<void> => {
      setAwaitingPayment(false)
      stopWatcher()
      await refreshProfile()
      setCelebrationTier(newTier)
    },
    [refreshProfile, stopWatcher]
  )

  const startUpgrade = useCallback(
    (tier: 'pro' | 'elite' = 'pro'): void => {
      if (isOfflineDev) {
        void window.api.auth.openExternal(`${WEBSITE_URL.replace(/\/$/, '')}/pricing`)
        return
      }

      if (!session) {
        openAuthModal()
        return
      }

      const currentTier = profile?.subscription_tier ?? 'free'
      if (hasTier(currentTier, tier)) {
        return
      }

      previousTierRef.current = currentTier
      const pricingUrl = buildWebsitePricingUrl(WEBSITE_URL, session, { tier })
      void window.api.auth.openExternal(pricingUrl)

      setAwaitingPayment(true)
      stopWatcher()

      if (session.user?.id) {
        watcherRef.current = watchForTierUpgrade(
          session.user.id,
          currentTier,
          (newTier) => void handleTierDetected(newTier),
          refreshProfile,
          { pollIntervalMs: 10_000 }
        )
      }
    },
    [handleTierDetected, isOfflineDev, openAuthModal, profile?.subscription_tier, refreshProfile, session, stopWatcher]
  )

  const dismissCelebration = useCallback((): void => {
    setCelebrationTier(null)
  }, [])

  useEffect(() => {
    return () => {
      stopWatcher()
    }
  }, [stopWatcher])

  const value = useMemo<UpgradeFlowContextValue>(
    () => ({
      startUpgrade,
      awaitingPayment,
      dismissCelebration
    }),
    [startUpgrade, awaitingPayment, dismissCelebration]
  )

  return (
    <UpgradeFlowContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {celebrationTier ? (
          <TierUpgradeCelebration tier={celebrationTier} onDismiss={dismissCelebration} />
        ) : null}
      </AnimatePresence>
      {awaitingPayment ? (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 max-w-xs rounded-xl border border-launcher-accent/30 bg-launcher-surface/95 px-4 py-3 text-xs text-launcher-muted shadow-lg backdrop-blur-sm">
          <span className="font-semibold text-launcher-accent">Waiting for payment…</span>
          <p className="mt-1">Complete checkout in your browser. Your tier updates automatically when you return.</p>
        </div>
      ) : null}
    </UpgradeFlowContext.Provider>
  )
}

export function useUpgradeFlow(): UpgradeFlowContextValue {
  const context = useContext(UpgradeFlowContext)
  if (!context) {
    throw new Error('useUpgradeFlow must be used within UpgradeFlowProvider.')
  }
  return context
}
