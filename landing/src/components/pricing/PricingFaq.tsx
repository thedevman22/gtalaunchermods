'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PRICING_FAQ } from '@/lib/constants'
import { MOTION_DURATION_FAST, MOTION_EASE, transition } from '@/lib/motion'

export default function PricingFaq(): React.JSX.Element {
  const reduced = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="mx-auto mt-16 max-w-2xl">
      <motion.h3
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={transition(reduced ?? false)}
        className="text-center font-display text-xl font-bold tracking-tight sm:text-2xl"
      >
        Common questions
      </motion.h3>

      <ul className="mt-6 divide-y divide-border/70 rounded-2xl border border-border/80 bg-surface/50">
        {PRICING_FAQ.map((item, index) => {
          const isOpen = openId === item.id
          return (
            <motion.li
              key={item.id}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ ...transition(reduced ?? false), delay: index * 0.06 }}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-elevated/40"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-text">{item.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: MOTION_DURATION_FAST, ease: MOTION_EASE }}
                  className="shrink-0 text-muted"
                >
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: MOTION_EASE }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
