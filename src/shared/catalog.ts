export type ModCategory =
  | 'vehicles'
  | 'weapons'
  | 'characters'
  | 'maps'
  | 'scripts_trainers'
  | 'visual_graphics'

export type ModCatalogSource = 'hosted' | 'external_link'

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
}

export interface CatalogResult {
  game_id: string
  mods: CatalogMod[]
}

export const MOD_CATEGORIES: { id: ModCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Mods', icon: '◈' },
  { id: 'vehicles', label: 'Vehicles', icon: '🚗' },
  { id: 'weapons', label: 'Weapons', icon: '⚔' },
  { id: 'characters', label: 'Characters', icon: '👤' },
  { id: 'maps', label: 'Maps', icon: '🗺' },
  { id: 'scripts_trainers', label: 'Scripts / Trainers', icon: '⌨' },
  { id: 'visual_graphics', label: 'Visual / Graphics', icon: '✦' }
]

export function formatDownloadCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`
  }
  return String(count)
}
