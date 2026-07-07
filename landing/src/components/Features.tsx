'use client'

import { motion } from 'framer-motion'
import { FEATURES } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'
import { staggerContainer, staggerItem } from '@/lib/motion'

export default function Features(): React.JSX.Element {
  return (
    <section id="features" className="relative px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Features</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Built for safe single-player modding
          </h2>
          <p className="mt-4 text-muted">
            Everything you need to organize mods and launch GTA V offline — without risking your
            online account.
          </p>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.article
              key={feature.title}
              variants={staggerItem}
              className="group rounded-2xl border border-border bg-surface/60 p-6 shadow-sm shadow-sky-50/80 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-surface hover:shadow-md hover:shadow-sky-100/60"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-elevated text-2xl transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
