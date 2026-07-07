import Link from 'next/link'
import { SITE } from '@/lib/constants'
import ModHarborLogo from '@/components/ModHarborLogo'

export default function Footer(): React.JSX.Element {
  return (
    <footer className="border-t border-border/60 bg-surface/30 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2.5">
          <ModHarborLogo size={28} />
          <span className="font-display text-sm font-bold">{SITE.name}</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-muted">
          <a
            href={SITE.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-text"
          >
            Discord
          </a>
          <Link href={SITE.termsUrl} className="transition-colors hover:text-text">
            Terms
          </Link>
          <Link href={SITE.privacyUrl} className="transition-colors hover:text-text">
            Privacy
          </Link>
        </nav>
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} {SITE.name}. Not affiliated with Rockstar Games.
      </p>
    </footer>
  )
}
