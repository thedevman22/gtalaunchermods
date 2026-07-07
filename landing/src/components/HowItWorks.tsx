'use client'

import { motion } from 'framer-motion'
import { HOW_IT_WORKS_STEPS } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'
import { staggerContainer, staggerItem } from '@/lib/motion'

function DemoPlaceholder({ label }: { label: string }): React.JSX.Element {
  return (
    <div
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-elevated via-surface/80 to-bg/60"
      aria-label={`${label} demo placeholder`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,230,118,0.08),transparent_55%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(42,42,58,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(42,42,58,0.35)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10 shadow-[0_0_30px_rgba(0,230,118,0.15)] transition-transform group-hover:scale-105">
          <svg className="ml-1 h-7 w-7 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Demo recording placeholder
        </p>
      </div>
    </div>
  )
}

export default function HowItWorks(): React.JSX.Element {
  return (
    <section id="how-it-works" className="border-t border-border/60 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            From download to story mode in four steps
          </h2>
          <p className="mt-4 text-muted">
            Create one account on the web or in the desktop app — your mods and preferences sync
            across both.
          </p>
        </ScrollReveal>

        <motion.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-16 space-y-10"
        >
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              variants={staggerItem}
              className={[
                'grid items-center gap-8 lg:grid-cols-2',
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              ].join(' ')}
            >
              <div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-2xl font-bold">{step.title}</h3>
                <p className="mt-3 text-muted leading-relaxed">{step.description}</p>
              </div>
              <DemoPlaceholder label={step.title} />
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
