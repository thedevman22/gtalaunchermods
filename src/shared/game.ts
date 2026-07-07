export type LaunchStatus = 'idle' | 'launching' | 'running' | 'closed' | 'error'

export type GamePathSource = 'steam' | 'epic' | 'rockstar' | 'saved' | 'manual'

export interface GamePathCandidate {
  path: string
  source: GamePathSource
}

export interface LaunchStatusPayload {
  status: LaunchStatus
  error?: string
}

export interface GamePathInfo {
  savedPath: string
  resolvedPath: string
  candidates: GamePathCandidate[]
}

export interface OperationResult {
  success: boolean
  error?: string
  path?: string
  canceled?: boolean
}
