import Footer from '@/components/Footer'
import ScrollReveal from '@/components/ScrollReveal'
import WaveDivider from '@/components/WaveDivider'

interface PageShellProps {
  eyebrow: string
  title: string
  intro?: string
  children: React.ReactNode
}

/** Shared layout for subpages: wave header, content column, footer. */
export default function PageShell({
  eyebrow,
  title,
  intro,
  children
}: PageShellProps): React.JSX.Element {
  return (
    <>
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-20">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute inset-0 bg-gradient-to-b from-sky-400/10 via-transparent to-transparent" />
            <div className="liquid-blob liquid-blob-b" />
          </div>
          <ScrollReveal className="relative mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              {eyebrow}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {intro ? (
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>
            ) : null}
          </ScrollReveal>
          <WaveDivider variant="accent" className="absolute bottom-0 left-0 right-0" />
        </section>

        <div className="px-4 pb-24 pt-12 sm:px-6">{children}</div>
      </main>
      <Footer />
    </>
  )
}
