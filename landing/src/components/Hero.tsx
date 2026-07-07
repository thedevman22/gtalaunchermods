'use client'

import { motion, useReducedMotion } from 'framer-motion'
import DownloadCta from '@/components/DownloadCta'
import HeroBackground from '@/components/HeroBackground'
import ModHarborLogo from '@/components/ModHarborLogo'
import CountUp from '@/components/CountUp'
import WaveDivider from '@/components/WaveDivider'
import { HERO_STATS } from '@/lib/constants'
import { heroContainer, heroWord, fadeSlideUp, transition } from '@/lib/motion'

const HEADLINE_WORDS = ['One-click', 'mods', 'for']
const HEADLINE_ACCENT = 'GTA V story mode'

export default function Hero(): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pt-32 lg:pb-32">
      <HeroBackground />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          animate="visible"
          variants={heroContainer}
        >
          <motion.div variants={heroWord} className="mb-8 flex justify-center">
            <ModHarborLogo
              variant="full"
              size={44}
              className="drop-shadow-[0_8px_28px_rgba(56,189,248,0.35)]"
            />
          </motion.div>

          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {HEADLINE_WORDS.map((word) => (
              <motion.span
                key={word}
                variants={heroWord}
                className="mr-[0.28em] inline-block"
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              variants={heroWord}
              className="mt-1 inline-block bg-gradient-to-r from-accent via-sky-400 to-cyan-300 bg-clip-text text-transparent sm:mt-0"
            >
              {HEADLINE_ACCENT}
            </motion.span>
          </h1>

          <motion.p
            variants={fadeSlideUp}
            transition={transition(reduced ?? false, 0.36)}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted"
          >
            A free Windows mod launcher with one-click installs — built for story mode only.
          </motion.p>

          <motion.div
            variants={fadeSlideUp}
            transition={transition(reduced ?? false, 0.36)}
            className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-text sm:text-3xl">
                  <CountUp value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </p>
                <p className="mt-1 text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          <DownloadCta className="mt-10" />
        </motion.div>
      </div>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
