import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import LiquidBlobBackground from '@renderer/components/LiquidBlobBackground'
import MotionButton from '@renderer/components/MotionButton'
import { useLaunch } from '@renderer/context/LaunchContext'
import { MOTION_DURATION, MOTION_EASE, staggerContainer, staggerItem } from '@renderer/lib/motion'

export default function HomePage(): React.JSX.Element {
  const { isLaunching, startLaunch } = useLaunch()
  const [modStats, setModStats] = useState({ total: 0, enabled: 0 })

  useEffect(() => {
    void window.api.mods.list().then((result) => {
      setModStats({
        total: result.mods.length,
        enabled: result.mods.filter((mod) => mod.enabled).length
      })
    })
    return window.api.mods.onChanged((result) => {
      setModStats({
        total: result.mods.length,
        enabled: result.mods.filter((mod) => mod.enabled).length
      })
    })
  }, [])

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-launcher-accent">
          Welcome back
        </p>
        <h2 className="mt-1 font-display text-3xl font-bold text-launcher-text">
          Grand Theft Auto V
        </h2>
        <p className="mt-2 max-w-xl text-sm text-launcher-muted">
          Your modded session is configured and ready. Jump into story mode with offline-safe
          launch.
        </p>
      </header>

      <div className="relative overflow-hidden rounded-2xl border border-launcher-border bg-launcher-elevated">
        <LiquidBlobBackground />
        <div className="absolute inset-0 bg-gradient-to-r from-launcher-accent/5 via-transparent to-launcher-warning/5" />
        <div className="relative z-10 flex items-center justify-between gap-6 p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-launcher-accent/30 bg-launcher-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-launcher-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-launcher-accent" />
              Story mode · Offline
            </span>
            <h3 className="mt-3 text-xl font-bold text-launcher-text">Los Santos — Mod Profile</h3>
            <p className="mt-1 text-sm text-launcher-muted">
              {modStats.enabled} mod{modStats.enabled === 1 ? '' : 's'} active · {modStats.total}{' '}
              installed
            </p>
          </div>
          <MotionButton
            disabled={isLaunching}
            onClick={() => void startLaunch()}
            className="shrink-0 rounded-xl bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-launcher-bg shadow-[0_0_30px_var(--color-launcher-glow)] disabled:opacity-60"
          >
            {isLaunching ? 'Launching…' : 'Play'}
          </MotionButton>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Installed Mods', value: String(modStats.total), sub: `${modStats.enabled} enabled` },
          { label: 'Launch Mode', value: 'Offline', sub: '-scOfflineOnly enforced' },
          { label: 'Catalog', value: 'Browse', sub: 'Discover new mods' }
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={staggerItem}
            whileHover={{ scale: 1.01, transition: { duration: MOTION_DURATION, ease: MOTION_EASE } }}
            className="rounded-xl border border-launcher-border bg-launcher-surface/60 p-5 backdrop-blur-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-launcher-muted">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-launcher-text">{stat.value}</p>
            <p className="mt-1 text-xs text-launcher-muted">{stat.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-launcher-muted">
          Quick tips
        </h3>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {[
            'Mods deploy only when enabled — your GTA folder stays clean.',
            'Use Settings to sync your install path across devices.',
            'Complete the Mods setup checklist before your first import.'
          ].map((tip) => (
            <motion.div
              key={tip}
              variants={staggerItem}
              className="rounded-lg border border-launcher-border/60 bg-launcher-elevated/40 px-4 py-3 text-sm text-launcher-muted"
            >
              {tip}
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  )
}
