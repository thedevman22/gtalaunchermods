import Link from 'next/link'
import { SITE } from '@/lib/constants'
import NavbarAuth from '@/components/NavbarAuth'
import ModHarborLogo from '@/components/ModHarborLogo'

export default function Navbar(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <ModHarborLogo size={36} className="shadow-[0_4px_12px_rgba(43,159,212,0.2)]" />
          <span className="font-display text-sm font-bold tracking-wide">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-text">
            How It Works
          </a>
          <a href="#games" className="transition-colors hover:text-text">
            Games
          </a>
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

        <NavbarAuth />
      </div>
    </header>
  )
}
