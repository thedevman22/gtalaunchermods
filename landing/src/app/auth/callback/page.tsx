'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

export default function AuthCallbackPage(): React.JSX.Element {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const completeAuth = async (): Promise<void> => {
      const client = getSupabaseClient()
      if (!client) {
        setError('Supabase is not configured.')
        return
      }

      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const errorDescription = url.searchParams.get('error_description')

      if (errorDescription) {
        setError(errorDescription)
        return
      }

      if (code) {
        const { error: exchangeError } = await client.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError(exchangeError.message)
          return
        }
      } else {
        const { data, error: sessionError } = await client.auth.getSession()
        if (sessionError || !data.session) {
          setError(sessionError?.message ?? 'No session found after sign-in.')
          return
        }
      }

      router.replace('/sign-in')
    }

    void completeAuth()
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-red-300">{error}</p>
        <Link href="/sign-in" className="text-sm font-semibold text-accent hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm text-muted">Completing sign-in…</p>
      </div>
    </div>
  )
}
