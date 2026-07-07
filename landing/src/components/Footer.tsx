import Link from 'next/link'
import { SITE } from '@/lib/constants'
import ScrollReveal from '@/components/ScrollReveal'

const INSTALL_STEPS = [
  'Download the Windows installer (.exe)',
  'Run the setup wizard and choose an install location',
  'Sign in or create a free account',
  'Point the launcher to your GTA5.exe (auto-detect works for most installs)',
  'Import mods via drag-and-drop and enable when ready'
]

export default function InstallSection(): React.JSX.Element {
  return (
    <section id="install" className="border-t border-border/60 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
              Install guide
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Get started in minutes</h2>
            <p className="mt-4 text-muted">
              {SITE.name} runs on Windows 10/11. You need a legitimate copy of GTA V and mods
              installed at your own risk — we help you organize, not curate.
            </p>
            <a
              href={SITE.downloadUrl}
              className="mt-8 inline-flex rounded-xl bg-gradient-to-r from-accent to-accent-dim px-6 py-3 text-xs font-bold uppercase tracking-wider text-bg shadow-[0_0_20px_rgba(0,230,118,0.2)] transition-transform hover:scale-[1.02]"
            >
              Download installer
            </a>
          </div>

          <ol className="space-y-4">
            {INSTALL_STEPS.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-xl border border-border bg-surface/40 p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </ScrollReveal>
      </div>
    </section>
  )
}

export function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border/60 bg-surface/30 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-dim">
                <span className="text-xs font-black text-bg">G</span>
              </div>
              <span className="font-bold">{SITE.name}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-muted">{SITE.tagline}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Product</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#how-it-works" className="text-muted transition-colors hover:text-text">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-muted transition-colors hover:text-text">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-muted transition-colors hover:text-text">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href={SITE.downloadUrl} className="text-muted transition-colors hover:text-text">
                    Download
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Account</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/sign-in" className="text-muted transition-colors hover:text-text">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="text-muted transition-colors hover:text-text">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Community</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href={SITE.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted transition-colors hover:text-text"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#install" className="text-muted transition-colors hover:text-text">
                    Install instructions
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href={SITE.termsUrl} className="text-muted transition-colors hover:text-text">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Not affiliated with Rockstar Games.</p>
          <p>GTA V is a trademark of Rockstar Games, Inc.</p>
        </div>
      </div>
    </footer>
  )
}
