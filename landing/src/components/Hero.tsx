import { SITE } from '@/lib/constants'
import DownloadCta from '@/components/DownloadCta'

export default function Hero(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-pro/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Story mode only · Offline · Free to download
          </div>

          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            The free, safe{' '}
            <span className="bg-gradient-to-r from-accent to-accent-dim bg-clip-text text-transparent">
              story-mode
            </span>{' '}
            GTA mod launcher
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {SITE.name} helps you manage GTA V mods without touching online play. Import, enable,
            and launch single-player with confidence — mods are never behind a paywall.
          </p>

          <DownloadCta className="mt-10" />
        </div>

        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-accent/80" />
            <span className="ml-2 text-xs text-muted">{SITE.name}</span>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-[200px_1fr]">
            <div className="hidden space-y-1 bg-elevated/80 p-4 sm:block">
              {['Home', 'Mods', 'Settings', 'Account'].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    i === 1 ? 'bg-accent/10 text-accent' : 'text-muted'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-bg/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Mod library
              </p>
              <h2 className="mt-1 text-lg font-bold">Your mods, your rules</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {['NaturalVision', 'Script Hook V', 'LSPDFR'].map((mod) => (
                  <div
                    key={mod}
                    className="rounded-lg border border-border bg-elevated/50 p-3"
                  >
                    <div className="mb-2 h-12 rounded-md bg-gradient-to-br from-border to-elevated" />
                    <p className="text-xs font-medium">{mod}</p>
                    <span className="mt-1 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
                      Enabled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
