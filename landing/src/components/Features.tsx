import { FEATURES } from '@/lib/constants'

export default function Features(): React.JSX.Element {
  return (
    <section id="features" className="border-t border-border/60 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Features</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for safe single-player modding
          </h2>
          <p className="mt-4 text-muted">
            Everything you need to organize mods and launch GTA V offline — without risking your
            online account.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-border bg-surface/40 p-6 transition-colors hover:border-accent/30 hover:bg-surface/70"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-elevated text-2xl transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
