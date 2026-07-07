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
  /** Whether automatic updates were enabled when this status was emitted. */
  autoUpdate?: boolean
}

export interface UpdateSettings {
  autoUpdate: boolean
}
