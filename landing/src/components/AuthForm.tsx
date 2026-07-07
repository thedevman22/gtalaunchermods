'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { SITE } from '@/lib/constants'

type AuthMode = 'login' | 'signup'

interface AuthFormProps {
  mode: AuthMode
}

export default function AuthForm({ mode }: AuthFormProps): React.JSX.Element {
  const {
    session,
    profile,
    loading,
    authError,
    isConfigured,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    clearAuthError
  } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)

  const isLogin = mode === 'login'
  const alternateHref = isLogin ? '/sign-up' : '/sign-in'
  const alternateLabel = isLogin ? 'Sign Up' : 'Sign In'

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    setSubmitting(true)
    setLocalMessage(null)
    clearAuthError()

    try {
      if (isLogin) {
        await signIn(email, password)
        setLocalMessage('Signed in successfully. Open the desktop app with the same account.')
      } else {
        await signUp(email, password)
        setLocalMessage('Account created! Check your email if confirmation is required, then sign in.')
      }
    } catch {
      // authError set in context
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogle = async (): Promise<void> => {
    setSubmitting(true)
    setLocalMessage(null)
    clearAuthError()

    try {
      await signInWithGoogle()
    } catch (err) {
      setLocalMessage(err instanceof Error ? err.message : 'Google sign-in failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (session?.user) {
    return (
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dim shadow-[0_0_30px_rgba(0,230,118,0.25)]">
            <span className="text-2xl font-black text-bg">G</span>
          </div>
          <h1 className="text-2xl font-bold">You&apos;re signed in</h1>
          <p className="mt-2 text-sm text-muted">
            {profile?.email ?? session.user.email} · {profile?.role_badge ?? 'Member'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
          <p className="text-sm leading-relaxed text-muted">
            Use the same account in the desktop launcher to sync mods and preferences across
            devices.
          </p>
          <a
            href={SITE.downloadUrl}
            className="mt-6 block rounded-xl bg-gradient-to-r from-accent to-accent-dim py-3 text-center text-sm font-bold uppercase tracking-wider text-bg shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-transform hover:scale-[1.01]"
          >
            Download launcher
          </a>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 w-full rounded-xl border border-border bg-elevated py-3 text-sm font-semibold text-muted transition-colors hover:text-text"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-dim shadow-[0_0_30px_rgba(0,230,118,0.25)]">
          <span className="text-2xl font-black text-bg">G</span>
        </div>
        <h1 className="text-2xl font-bold">{SITE.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {isLogin ? 'Sign in to your launcher account' : 'Create your launcher account'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface/80 p-6 backdrop-blur-xl">
        {!isConfigured && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            Add <code className="text-accent">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-accent">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable auth.
          </div>
        )}

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-text outline-none focus:border-accent/50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border bg-elevated px-3 py-2.5 text-sm text-text outline-none focus:border-accent/50"
              placeholder="••••••••"
            />
          </div>

          {(authError || localMessage) && (
            <div
              className={[
                'rounded-lg px-3 py-2 text-xs',
                authError && !localMessage
                  ? 'border border-red-500/30 bg-red-500/10 text-red-300'
                  : 'border border-accent/30 bg-accent/10 text-accent'
              ].join(' ')}
            >
              {localMessage ?? authError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loading || !isConfigured}
            className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-dim py-3 text-sm font-bold uppercase tracking-wider text-bg shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-transform hover:scale-[1.01] disabled:opacity-50"
          >
            {submitting ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          disabled={submitting || loading || !isConfigured}
          onClick={() => void handleGoogle()}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-elevated py-3 text-sm font-semibold text-text transition-colors hover:border-accent/40 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <Link href={alternateHref} className="font-semibold text-accent hover:underline">
            {alternateLabel}
          </Link>
        </p>
      </div>
    </div>
  )
}
