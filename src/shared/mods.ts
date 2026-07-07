export type DeployMethod = 'copy' | 'symlink'

export interface ModDeployedFile {
  source: string
  target: string
  method: DeployMethod
}

export interface ModManifest {
  id: string
  name: string
  author: string
  version: string
  description: string
  enabled: boolean
  importedAt: string
  deployedFiles: ModDeployedFile[]
  catalogId?: string
}

export interface ModSummary {
  id: string
  name: string
  author: string
  version: string
  description: string
  enabled: boolean
  importedAt: string
  thumbnailDataUrl?: string
  catalogId?: string
}

export interface ModImportOptions {
  catalogId?: string
  name?: string
  author?: string
  version?: string
  description?: string
}

export interface ModImportResult {
  success: boolean
  error?: string
  mod?: ModSummary
}

export interface ModListResult {
  libraryPath: string
  mods: ModSummary[]
}
