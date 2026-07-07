import { DOWNLOAD_CONFIG, formatDownloadVersionLabel } from '@/config/download'

type DownloadCtaProps = {
  className?: string
}

export default function DownloadCta({ className = '' }: DownloadCtaProps): React.JSX.Element {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <a
        href={DOWNLOAD_CONFIG.downloadUrl}
        className="group wave-button inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-dim px-8 py-4 text-sm font-bold uppercase tracking-wider text-bg shadow-[0_4px_30px_rgba(56,189,248,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_40px_rgba(56,189,248,0.35)]"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
          />
        </svg>
        Download for Windows
      </a>
      <p className="mt-3 text-xs text-muted">{formatDownloadVersionLabel()}</p>
    </div>
  )
}
