/**
 * Release metadata for the Windows installer.
 * Update `version` when shipping a new build (keep in sync with root package.json).
 */
const VERSION = '1.0.3'

const GITHUB_OWNER = 'thedevman22'
const GITHUB_REPO = 'gtalaunchermods'

/** Matches electron-builder `artifactName`: ${productName}-${version}-setup.exe */
function githubReleaseArtifactName(version: string): string {
  return `ModHarbor-${version}-setup.exe`
}

function buildGitHubReleaseDownloadUrl(version: string): string {
  const artifact = githubReleaseArtifactName(version)
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/v${version}/${encodeURIComponent(artifact)}`
}

export const DOWNLOAD_CONFIG = {
  version: VERSION,
  githubOwner: GITHUB_OWNER,
  githubRepo: GITHUB_REPO,
  artifactName: githubReleaseArtifactName(VERSION),
  /** Direct URL to the GitHub release Windows NSIS installer (.exe) */
  downloadUrl:
    process.env.NEXT_PUBLIC_DOWNLOAD_URL ?? buildGitHubReleaseDownloadUrl(VERSION),
  supportedOsLabel: 'Windows 10/11'
} as const

export function formatDownloadVersionLabel(): string {
  return `v${DOWNLOAD_CONFIG.version} · ${DOWNLOAD_CONFIG.supportedOsLabel}`
}
