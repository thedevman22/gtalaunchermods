'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { SITE } from '@/lib/constants'

export default function NavbarAuth(): React.JSX.Element {
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-elevated" aria-hidden />
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="hidden rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-accent/40 hover:text-text sm:inline-flex"
        >
          Account
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-accent/40 hover:text-text"
        >
          Sign Out
        </button>
        <a
          href={SITE.downloadUrl}
          className="rounded-lg bg-gradient-to-r from-accent to-accent-dim px-4 py-2 text-xs font-bold uppercase tracking-wider text-bg shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-transform hover:scale-[1.02]"
        >
          Download
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted transition-colors hover:border-accent/40 hover:text-text"
      >
        Sign In
      </Link>
      <Link
        href="/sign-up"
        className="rounded-lg bg-gradient-to-r from-accent to-accent-dim px-4 py-2 text-xs font-bold uppercase tracking-wider text-bg shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-transform hover:scale-[1.02]"
      >
        Sign Up
      </Link>
    </div>
  )
}
