'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { SITE } from '@/lib/constants'
import ModHarborLogo from '@/components/ModHarborLogo'
import NavLink from '@/components/NavLink'
import { MOTION_DURATION_FAST, MOTION_EASE } from '@/lib/motion'

function ExternalLink({
  href,
  children
}: {
  href: string
  children: React.ReactNode
}): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative py-1 text-muted transition-colors hover:text-text"
    >
      {children}
      <motion.span
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-accent"
        initial={{ scaleX: 0 }}
        whileHover={reduced ? undefined : { scaleX: 1 }}
        transition={{ duration: MOTION_DURATION_FAST, ease: MOTION_EASE }}
        aria-hidden
      />
    </a>
  )
}

export default function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border/60 bg-surface/30 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center">
          <ModHarborLogo variant="full" size={20} />
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <ExternalLink href={SITE.discordUrl}>Discord</ExternalLink>
          <NavLink href={SITE.termsUrl}>Terms</NavLink>
          <NavLink href={SITE.privacyUrl}>Privacy</NavLink>
          <NavLink href={SITE.legalUrl}>Safety &amp; Fair Play</NavLink>
        </nav>
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.name}. Not affiliated with Rockstar Games.
      </p>
    </footer>
  )
}
