import { useState } from 'react'
import { useAuth } from '@renderer/context/AuthContext'

type AuthMode = 'login' | 'signup'

export default function LoginPage(): React.JSX.Element {
  const { signIn, signUp, signInWithGoogle, authError, clearAuthError, loading } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    setSubmitting(true)
    setLocalMessage(null)
    clearAuthError()

    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
        setLocalMessage('Account created! Check your email if confirmation is required.')
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

  return (
    <div className="flex h-full items-center justify-center bg-launcher-bg p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-launcher-accent to-launcher-accent-dim shadow-[0_0_30px_var(--color-launcher-glow)]">
            <span className="text-2xl font-black text-launcher-bg">G</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-launcher-text">GTA Mod Launcher</h1>
          <p className="mt-2 text-sm text-launcher-muted">
            {mode === 'login' ? 'Sign in to manage your mods' : 'Create your launcher account'}
          </p>
        </div>

        <div className="rounded-2xl border border-launcher-border bg-launcher-surface/80 p-6 backdrop-blur-xl">
          <div className="mb-6 flex rounded-lg bg-launcher-elevated p-1">
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab)
                  clearAuthError()
                  setLocalMessage(null)
                }}
                className={[
                  'flex-1 rounded-md py-2 text-xs font-bold uppercase tracking-wider transition-colors',
                  mode === tab
                    ? 'bg-launcher-accent/15 text-launcher-accent'
                    : 'text-launcher-muted hover:text-launcher-text'
                ].join(' ')}
              >
                {tab === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-launcher-muted">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-launcher-border bg-launcher-elevated px-3 py-2.5 text-sm text-launcher-text outline-none focus:border-launcher-accent/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-launcher-muted">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-launcher-border bg-launcher-elevated px-3 py-2.5 text-sm text-launcher-text outline-none focus:border-launcher-accent/50"
                placeholder="••••••••"
              />
            </div>

            {(authError || localMessage) && (
              <div
                className={[
                  'rounded-lg px-3 py-2 text-xs',
                  authError
                    ? 'border border-red-500/30 bg-red-500/10 text-red-300'
                    : 'border border-launcher-accent/30 bg-launcher-accent/10 text-launcher-accent'
                ].join(' ')}
              >
                {authError ?? localMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim py-3 text-sm font-bold uppercase tracking-wider text-launcher-bg shadow-[0_0_20px_var(--color-launcher-glow)] transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-launcher-border" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-launcher-muted">or</span>
            <div className="h-px flex-1 bg-launcher-border" />
          </div>

          <button
            type="button"
            disabled={submitting || loading}
            onClick={() => void handleGoogle()}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-launcher-border bg-launcher-elevated py-3 text-sm font-semibold text-launcher-text transition-colors hover:border-launcher-accent/40 disabled:opacity-50"
          >
            <span className="text-lg">G</span>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  )
}
