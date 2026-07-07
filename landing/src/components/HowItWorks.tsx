'use client'

import { motion } from 'framer-motion'
import { HOW_IT_WORKS_STEPS } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'
import { staggerContainer, staggerItem } from '@/lib/motion'

export default function HowItWorks(): React.JSX.Element {
  return (
    <section id="how-it-works" className="relative bg-surface/40 px-4 py-24 sm:px-6 lg:py-32">
      <div className="mx-auto max-w-4xl">
        <ScrollReveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
        </ScrollReveal>

        <motion.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-14 grid gap-10 sm:grid-cols-3"
        >
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <motion.li key={step.title} variants={staggerItem} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-3xl shadow-[0_4px_24px_rgba(56,189,248,0.12)]">
                <span aria-hidden>{step.icon}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">
                <span className="mr-2 text-accent">{index + 1}.</span>
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.line}</p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
