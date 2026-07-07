'use client'

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
import type { UserProfile } from '@shared/profile'
import { fetchUserProfile, getAuthCallbackUrl, getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  authError: string | null
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
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

  useEffect(() => {
    let mounted = true
    const client = getSupabaseClient()

    if (!client) {
      void Promise.resolve().then(() => {
        if (!mounted) return
        setLoading(false)
        if (!isSupabaseConfigured) {
          setAuthError('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.')
        }
      })
      return () => {
        mounted = false
      }
    }

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

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const client = getSupabaseClient()
    if (!client) throw new Error('Supabase is not configured.')
    setAuthError(null)

    const { error } = await client.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<void> => {
    const client = getSupabaseClient()
    if (!client) throw new Error('Supabase is not configured.')
    setAuthError(null)

    const { data, error } = await client.auth.signUp({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }

    if (data.user && !data.session) {
      setAuthError('Check your email to confirm your account, then sign in.')
    }
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    const client = getSupabaseClient()
    if (!client) throw new Error('Supabase is not configured.')
    setAuthError(null)

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthCallbackUrl() }
    })

    if (error) {
      setAuthError(error.message)
      throw error
    }
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    const client = getSupabaseClient()
    if (!client) return
    await client.auth.signOut()
    setProfile(null)
    setSession(null)
  }, [])

  const clearAuthError = useCallback((): void => {
    setAuthError(null)
  }, [])

  const value = useMemo(
    (): AuthContextValue => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      authError,
      isConfigured: isSupabaseConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      clearAuthError
    }),
    [session, profile, loading, authError, signIn, signUp, signInWithGoogle, signOut, clearAuthError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
