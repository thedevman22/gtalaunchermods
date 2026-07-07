import Link from 'next/link'
import { SITE } from '@/lib/constants'

export default function Navbar(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dim shadow-[0_0_20px_rgba(0,230,118,0.25)]">
            <span className="text-sm font-black text-bg">G</span>
          </div>
          <span className="text-sm font-bold tracking-wide">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#features" className="transition-colors hover:text-text">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-text">
            Pricing
          </a>
          <a href="#trust" className="transition-colors hover:text-text">
            Our Promise
          </a>
          <a href="#install" className="transition-colors hover:text-text">
            Install
          </a>
        </nav>

        <a
          href={SITE.downloadUrl}
          className="rounded-lg bg-gradient-to-r from-accent to-accent-dim px-4 py-2 text-xs font-bold uppercase tracking-wider text-bg shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-transform hover:scale-[1.02]"
        >
          Download
        </a>
      </div>
    </header>
  )
}
