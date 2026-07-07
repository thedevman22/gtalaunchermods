import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { SubscriptionTier, UserProfile } from '../../../shared/profile'
import { hasTier, isPremiumTier } from '../../../shared/profile'
import { fetchUserProfile, isOfflineDevMode, isSupabaseConfigured, OFFLINE_DEV_PROFILE, supabase } from '@renderer/lib/supabase'
import { waitForTierUpgrade as pollForTierUpgrade } from '@renderer/lib/billing'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  authError: string | null
  isOfflineDev: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<UserProfile | null>
  waitForTierUpgrade: (targetTier: SubscriptionTier) => Promise<boolean>
  hasTier: (required: SubscriptionTier) => boolean
  isPremium: boolean
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfileForUser(user: User): Promise<UserProfile> {
  return fetchUserProfile(user.id, user.email ?? '')
}

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (isOfflineDevMode) {
      setProfile(OFFLINE_DEV_PROFILE)
      return OFFLINE_DEV_PROFILE
    }

    if (!supabase || !session?.user) {
      setProfile(null)
      return null
    }

    const nextProfile = await loadProfileForUser(session.user)
    setProfile(nextProfile)
    return nextProfile
  }, [session?.user])

  const waitForTierUpgrade = useCallback(
    async (targetTier: SubscriptionTier): Promise<boolean> => {
      return pollForTierUpgrade(() => refreshProfile(), targetTier)
    },
    [refreshProfile]
  )

  useEffect(() => {
    if (isOfflineDevMode) {
      setProfile(OFFLINE_DEV_PROFILE)
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      setAuthError('Supabase is not configured. Copy .env.example to .env and add your keys.')
      return
    }

    const client = supabase
    let mounted = true

    const init = async (): Promise<void> => {
      const { data } = await client.auth.getSession()
      if (!mounted) return

      setSession(data.session)

      if (data.session?.user) {
        try {
          const userProfile = await loadProfileForUser(data.session.user)
          if (mounted) setProfile(userProfile)
        } catch (err) {
          if (mounted) {
            setAuthError(err instanceof Error ? err.message : 'Failed to load profile.')
          }
        }
      }

      if (mounted) setLoading(false)
    }

    void init()

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)

      if (nextSession?.user) {
        try {
          const userProfile = await loadProfileForUser(nextSession.user)
          setProfile(userProfile)
          setAuthError(null)
        } catch (err) {
          setAuthError(err instanceof Error ? err.message : 'Failed to load profile.')
          setProfile(null)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const offlineAuthMessage = 'Configure .env with your Supabase keys to enable sign-in.'

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    if (isOfflineDevMode) {
      setAuthError(offlineAuthMessage)
      throw new Error(offlineAuthMessage)
    }
    if (!supabase) throw new Error('Supabase is not configured.')
    setAuthError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    if (isOfflineDevMode) {
      setAuthError(offlineAuthMessage)
      throw new Error(offlineAuthMessage)
    }
    if (!supabase) throw new Error('Supabase is not configured.')
    setAuthError(null)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }

    if (data.user && !data.session) {
      setAuthError('Check your email to confirm your account, then sign in.')
    }
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (isOfflineDevMode) {
      setAuthError(offlineAuthMessage)
      throw new Error(offlineAuthMessage)
    }
    if (!supabase) throw new Error('Supabase is not configured.')
    const client = supabase
    setAuthError(null)

    const { redirectTo } = await window.api.auth.startOAuthCallback()

    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        unsubscribe()
        reject(new Error('Google sign-in timed out. Please try again.'))
      }, 120_000)

      const unsubscribe = window.api.auth.onOAuthCallback(async (callbackUrl) => {
        window.clearTimeout(timeout)
        unsubscribe()

        try {
          const url = new URL(callbackUrl)
          const code = url.searchParams.get('code')
          const errorDescription = url.searchParams.get('error_description')

          if (errorDescription) {
            throw new Error(errorDescription)
          }

          if (!code) {
            throw new Error('No authorization code received from Google.')
          }

          const { error } = await client.auth.exchangeCodeForSession(code)
          if (error) throw error
          resolve()
        } catch (err) {
          reject(err)
        }
      })

      void client.auth
        .signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo,
            skipBrowserRedirect: true
          }
        })
        .then(({ data, error }) => {
          if (error) {
            window.clearTimeout(timeout)
            unsubscribe()
            reject(error)
            return
          }

          if (data.url) {
            void window.api.auth.openExternal(data.url)
          } else {
            window.clearTimeout(timeout)
            unsubscribe()
            reject(new Error('Failed to start Google OAuth flow.'))
          }
        })
    })
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    if (!supabase) return
    setAuthError(null)
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const clearAuthError = useCallback((): void => {
    setAuthError(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile: isOfflineDevMode ? OFFLINE_DEV_PROFILE : profile,
      loading,
      authError,
      isOfflineDev: isOfflineDevMode,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
      waitForTierUpgrade,
      hasTier: (required) => hasTier(profile?.subscription_tier ?? 'free', required),
      isPremium: isPremiumTier(profile?.subscription_tier ?? 'free'),
      clearAuthError
    }),
    [
      session,
      profile,
      loading,
      authError,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
      waitForTierUpgrade,
      clearAuthError
    ]
  )

  if (!isSupabaseConfigured && !isOfflineDevMode && !loading) {
    return (
      <div className="flex h-full items-center justify-center bg-launcher-bg p-8">
        <div className="max-w-md rounded-xl border border-launcher-border bg-launcher-surface p-6 text-center">
          <h1 className="text-lg font-bold text-launcher-text">Supabase not configured</h1>
          <p className="mt-2 text-sm text-launcher-muted">
            Copy <code className="text-launcher-accent">.env.example</code> to{' '}
            <code className="text-launcher-accent">.env</code> and set your Supabase URL and anon key.
          </p>
          <ol className="mt-4 space-y-2 text-left text-xs text-launcher-muted">
            <li>1. Create a project at supabase.com</li>
            <li>2. Run <code className="text-launcher-accent">supabase/migrations/001_profiles.sql</code></li>
            <li>3. Copy Project URL + anon key from Settings → API</li>
            <li>4. Restart the launcher with <code className="text-launcher-accent">npm run dev</code></li>
          </ol>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }
  return context
}
