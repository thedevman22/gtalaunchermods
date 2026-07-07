import { SITE } from '@/lib/constants'
import DownloadCta from '@/components/DownloadCta'
import HeroBackground from '@/components/HeroBackground'
import ModHarborLogo from '@/components/ModHarborLogo'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

export default function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:pb-32">
      <HeroBackground />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <div className="mb-10 flex justify-center">
            <ModHarborLogo
              size={72}
              className="shadow-[0_8px_32px_rgba(56,189,248,0.3)] ring-4 ring-elevated/90"
            />
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Your calm harbor for{' '}
            <span className="bg-gradient-to-r from-accent via-sky-400 to-cyan-300 bg-clip-text text-transparent">
              GTA story-mode mods
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {SITE.name} is a free Windows launcher for organizing, deploying, and playing
            single-player mods — safely offline.
          </p>

          <DownloadCta className="mt-10" />
        </ScrollReveal>
      </div>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
