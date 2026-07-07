export type ModCategory =
  | 'vehicles'
  | 'weapons'
  | 'characters'
  | 'maps'
  | 'scripts_trainers'
  | 'visual_graphics'

export type ModCatalogSource = 'hosted' | 'external_link'

export type CatalogModStatus = 'available' | 'coming_soon'

export interface CatalogMod {
  id: string
  game_id: string
  name: string
  author: string
  description: string
  thumbnail_url: string
  download_url: string
  download_count: number
  category: ModCategory
  source: ModCatalogSource
  version?: string
  status?: CatalogModStatus
}

export function isCatalogModPlaceholder(mod: CatalogMod): boolean {
  return mod.status === 'coming_soon'
}

export interface CatalogResult {
  game_id: string
  mods: CatalogMod[]
}

export type CatalogSource = 'remote' | 'cache' | 'bundled'

export interface CatalogMeta {
  refreshedAt: string | null
  source: CatalogSource
}

export const MOD_CATEGORIES: { id: ModCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Mods' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'weapons', label: 'Weapons' },
  { id: 'characters', label: 'Characters' },
  { id: 'maps', label: 'Maps' },
  { id: 'scripts_trainers', label: 'Scripts / Trainers' },
  { id: 'visual_graphics', label: 'Visual / Graphics' }
]

export function getCategoryLabel(category: ModCategory): string {
  return MOD_CATEGORIES.find((entry) => entry.id === category)?.label ?? category
}

export function formatDownloadCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`
  }
  return String(count)
}
