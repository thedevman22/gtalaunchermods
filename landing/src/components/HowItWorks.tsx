'use client'

import { motion } from 'framer-motion'
import { APP_MOCKUPS } from '@/lib/constants'
import AppScreenMockup from '@/components/AppScreenMockup'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'
import { staggerContainer, staggerItem } from '@/lib/motion'

export default function HowItWorks(): React.JSX.Element {
  return (
    <section id="how-it-works" className="relative bg-surface/40 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            How ModHarbor works
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Three screens. One calm workflow.
          </h2>
          <p className="mt-4 text-muted">
            Build mod profiles, browse the catalog, and launch story mode offline — all from a
            bright, native Windows app that matches this site.
          </p>
        </ScrollReveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-14 grid gap-10 lg:grid-cols-3"
        >
          {APP_MOCKUPS.map((mockup) => (
            <motion.figure key={mockup.id} variants={staggerItem} className="flex flex-col">
              <AppScreenMockup screen={mockup.id} />
              <figcaption className="mt-5 text-center lg:text-left">
                <h3 className="font-display text-lg font-bold">{mockup.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{mockup.caption}</p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
