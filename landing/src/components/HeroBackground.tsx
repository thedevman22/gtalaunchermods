'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function HeroBackground(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })

  const layerAY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40])
  const layerBY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 70])
  const layerCY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 100])

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-bg/40" />
      <motion.svg
        style={{ y: layerAY }}
        className="wave-hero-layer absolute -bottom-6 left-0 h-[58%] w-[200%] opacity-70"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="wave-layer-a"
          fill="#38bdf8"
          fillOpacity="0.16"
          d="M0 80 C300 120 500 40 800 90 C950 115 1100 70 1200 95 V200 H0 Z"
        />
      </motion.svg>
      <motion.svg
        style={{ y: layerBY }}
        className="wave-hero-layer absolute -bottom-6 left-0 h-[58%] w-[200%] opacity-60"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="wave-layer-b"
          fill="#0ea5e9"
          fillOpacity="0.12"
          d="M0 110 C250 85 450 130 700 100 C900 75 1050 125 1200 105 V200 H0 Z"
        />
      </motion.svg>
      <motion.svg
        style={{ y: layerCY }}
        className="wave-hero-layer absolute -bottom-6 left-0 h-[58%] w-[200%] opacity-50"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="wave-layer-c"
          fill="#38bdf8"
          fillOpacity="0.08"
          d="M0 140 C200 155 400 125 600 145 C800 165 1000 130 1200 150 V200 H0 Z"
        />
      </motion.svg>
      <div className="liquid-blob liquid-blob-a" />
      <div className="liquid-blob liquid-blob-b" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-bg/40" />
    </div>
  )
}
