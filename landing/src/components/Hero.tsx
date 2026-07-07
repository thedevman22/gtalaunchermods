import { SITE } from '@/lib/constants'
import DownloadCta from '@/components/DownloadCta'
import HeroBackground from '@/components/HeroBackground'
import ModHarborLogo from '@/components/ModHarborLogo'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

export default function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:pb-20">
      <HeroBackground />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <ModHarborLogo
              size={72}
              className="shadow-[0_8px_32px_rgba(43,159,212,0.25)] ring-4 ring-white/80"
            />
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Story mode only · Offline · Mods always free
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Your calm harbor for{' '}
            <span className="bg-gradient-to-r from-accent via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              GTA story-mode mods
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {SITE.name} is a free Windows launcher with mod profiles, a built-in catalog, and
            offline-only launches. Organize loadouts, deploy cleanly, and play single-player with
            confidence.
          </p>

          <DownloadCta className="mt-10" />
        </ScrollReveal>
      </div>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
