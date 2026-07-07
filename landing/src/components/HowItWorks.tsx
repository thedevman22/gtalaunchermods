'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Package, Rocket, ShieldCheck, type LucideIcon } from 'lucide-react'
import { HOW_IT_WORKS_STEPS } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'
import { MOTION_EASE, staggerContainer, staggerItem, transition, viewportOnce } from '@/lib/motion'

const STEP_ICONS: Record<(typeof HOW_IT_WORKS_STEPS)[number]['id'], LucideIcon> = {
  build: Package,
  launch: Rocket,
  safe: ShieldCheck
}

export default function HowItWorks(): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <section id="how-it-works" className="relative bg-surface/40 px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
        </ScrollReveal>

        <div className="relative mt-14">
          <motion.div
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-8 hidden h-0.5 origin-left bg-gradient-to-r from-accent/20 via-accent/55 to-accent/20 sm:block"
            initial={reduced ? false : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.75, ease: MOTION_EASE, delay: 0.15 }}
            aria-hidden
          />

          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative grid gap-10 sm:grid-cols-3"
          >
            {HOW_IT_WORKS_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[step.id]
              return (
                <motion.li key={step.title} variants={staggerItem} className="text-center">
                  <motion.div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent shadow-[0_4px_24px_rgba(56,189,248,0.12)]"
                    whileHover={reduced ? undefined : { scale: 1.06, y: -2 }}
                    transition={transition(reduced ?? false, 0.22)}
                  >
                    <motion.span whileHover={reduced ? undefined : { rotate: -6, scale: 1.1 }}>
                      <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                    </motion.span>
                  </motion.div>
                  <h3 className="mt-5 font-display text-lg font-bold">
                    <span className="mr-2 text-accent">{index + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{step.line}</p>
                </motion.li>
              )
            })}
          </motion.ol>
        </div>
      </div>
      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
