'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { NAV_LINKS, SITE } from '@/lib/constants'
import NavbarAuth from '@/components/NavbarAuth'
import ModHarborLogo from '@/components/ModHarborLogo'
import NavLink from '@/components/NavLink'
import { transition } from '@/lib/motion'

export default function Navbar(): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <motion.header
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition(reduced ?? false, 0.28)}
      className="sticky top-0 z-50 border-b border-border/60 bg-bg/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label={SITE.name}>
          <ModHarborLogo
            variant="full"
            size={24}
            className="drop-shadow-[0_2px_8px_rgba(56,189,248,0.25)]"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <NavbarAuth />
      </div>
    </motion.header>
  )
}
