export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error'

export interface UpdateStatusPayload {
  status: UpdateStatus
  version?: string
  progress?: number
  message?: string
  /** Whether automatic background download is enabled for this session. */
  autoUpdate?: boolean
  /** Last check found no newer release than the installed build. */
  upToDate?: boolean
  /** Installed build is below remote minimum_version — app usage is blocked. */
  required?: boolean
  /** Remote minimum_version from catalog config, if set. */
  minimumVersion?: string | null
  /** Currently installed app version. */
  appVersion?: string
}

export interface UpdateSettings {
  autoUpdate: boolean
}
