'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { MOTION_DURATION_FAST, MOTION_EASE } from '@/lib/motion'

type NavLinkProps = {
  href: string
  children: React.ReactNode
}

export default function NavLink({ href, children }: NavLinkProps): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <Link href={href} className="group relative py-1 text-muted transition-colors hover:text-text">
      {children}
      <motion.span
        className="absolute -bottom-0.5 left-0 h-px w-full origin-left bg-accent"
        initial={{ scaleX: 0 }}
        whileHover={reduced ? undefined : { scaleX: 1 }}
        transition={{ duration: MOTION_DURATION_FAST, ease: MOTION_EASE }}
        aria-hidden
      />
    </Link>
  )
}
