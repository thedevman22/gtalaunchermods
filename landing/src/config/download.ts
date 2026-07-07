/**
 * Release metadata for the Windows installer.
 * `version` is kept in sync with the root package.json by scripts/bump-version.mjs.
 */
const VERSION = '1.0.11'

const GITHUB_OWNER = 'thedevman22'
const GITHUB_REPO = 'gtalaunchermods'

/** Matches electron-builder `artifactName` — stable across versions. */
const INSTALLER_FILE = 'ModHarbor-Setup.exe'

export const DOWNLOAD_CONFIG = {
  version: VERSION,
  githubOwner: GITHUB_OWNER,
  githubRepo: GITHUB_REPO,
  artifactName: INSTALLER_FILE,
  /**
   * Site-relative path. vercel.json redirects it to the newest GitHub release
   * binary, so clicking starts the download directly — no GitHub page.
   */
  downloadUrl: process.env.NEXT_PUBLIC_DOWNLOAD_URL ?? '/download/windows',
  /** Underlying host URL (always the latest published installer). */
  githubLatestUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest/download/${INSTALLER_FILE}`,
  supportedOsLabel: 'Windows 10/11'
} as const

export function formatDownloadVersionLabel(): string {
  return `v${DOWNLOAD_CONFIG.version} · ${DOWNLOAD_CONFIG.supportedOsLabel}`
}
