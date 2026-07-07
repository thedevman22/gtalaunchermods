import DownloadCta from '@/components/DownloadCta'
import HeroBackground from '@/components/HeroBackground'
import ModHarborLogo from '@/components/ModHarborLogo'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

export default function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pt-32 lg:pb-32">
      <HeroBackground />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <ModHarborLogo
              variant="full"
              size={44}
              className="drop-shadow-[0_8px_28px_rgba(56,189,248,0.35)]"
            />
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            One-click mods for{' '}
            <span className="bg-gradient-to-r from-accent via-sky-400 to-cyan-300 bg-clip-text text-transparent">
              GTA V story mode
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            A free Windows mod launcher with one-click installs — built for story mode only.
          </p>

          <DownloadCta className="mt-10" />
        </ScrollReveal>
      </div>

      <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
    </section>
  )
}
