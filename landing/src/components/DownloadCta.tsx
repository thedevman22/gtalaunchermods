'use client'

import { useEffect, useState } from 'react'
import { DOWNLOAD_CONFIG, formatDownloadVersionLabel } from '@/config/download'
import { detectOs, isNonWindowsOs, type OsFamily } from '@/lib/detect-os'
import { SITE } from '@/lib/constants'

type DownloadCtaProps = {
  className?: string
  buttonClassName?: string
  showSecondaryLink?: boolean
}

export default function DownloadCta({
  className = '',
  buttonClassName = '',
  showSecondaryLink = true
}: DownloadCtaProps): React.JSX.Element {
  const [os, setOs] = useState<OsFamily>('unknown')

  useEffect(() => {
    void Promise.resolve().then(() => {
      setOs(detectOs(navigator.userAgent, navigator.platform))
    })
  }, [])

  const showNonWindowsNote = isNonWindowsOs(os)

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <a
          href={DOWNLOAD_CONFIG.downloadUrl}
          className={`group wave-button flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-dim px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_4px_30px_rgba(43,159,212,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_40px_rgba(43,159,212,0.35)] sm:w-auto ${buttonClassName}`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
            />
          </svg>
          Download for Windows (.exe)
        </a>
        {showSecondaryLink ? (
          <a
            href="#features"
            className="w-full rounded-xl border border-border bg-surface/50 px-8 py-4 text-sm font-semibold text-text transition-colors hover:border-accent/40 hover:bg-elevated sm:w-auto"
          >
            See features
          </a>
        ) : null}
      </div>

      <p className="mt-4 text-xs text-muted">{formatDownloadVersionLabel()}</p>

      {showNonWindowsNote ? (
        <p
          className="mt-3 max-w-md text-xs leading-relaxed text-amber-700"
          role="status"
        >
          <span className="font-semibold text-amber-800">Not on Windows?</span>{' '}
          {SITE.name} is Windows-only. You can still download the installer to copy onto a PC.
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">64-bit · No Rockstar launcher required</p>
      )}
    </div>
  )
}
