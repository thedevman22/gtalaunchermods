export type GameId = 'gta5'

export type GameEdition = 'legacy' | 'enhanced'

export type GameCardStatus = 'supported' | 'coming_soon'

export interface GameEditionOption {
  id: GameEdition
  gameId: GameId
  title: string
  description: string
  available: boolean
}

export const GTA5_EDITIONS: GameEditionOption[] = [
  {
    id: 'legacy',
    gameId: 'gta5',
    title: 'GTA V Legacy Edition',
    description: 'Original PC release · GTA5.exe',
    available: true
  },
  {
    id: 'enhanced',
    gameId: 'gta5',
    title: 'GTA V Enhanced Edition',
    description: '2025 upgrade · GTA5_Enhanced.exe',
    available: true
  }
]

export function getExeFileNameForEdition(edition: GameEdition): string {
  return edition === 'enhanced' ? 'GTA5_Enhanced.exe' : 'GTA5.exe'
}

export function getEditionLabel(edition: GameEdition): string {
  return edition === 'enhanced' ? 'Enhanced Edition' : 'Legacy Edition'
}

export function isGameEdition(value: string): value is GameEdition {
  return value === 'legacy' || value === 'enhanced'
}

export interface GameDefinition {
  id: GameId
  title: string
  catalogTitle: string
  catalogSubtitle: string
}

export interface GameCardInfo {
  id: string
  title: string
  status: GameCardStatus
  tagline: string
}

export const GAMES: Record<GameId, GameDefinition> = {
  gta5: {
    id: 'gta5',
    title: 'Grand Theft Auto V',
    catalogTitle: 'Mod Catalog',
    catalogSubtitle: 'Browse curated story-mode mods or manage your installed library.'
  }
}

export const GAME_CARDS: GameCardInfo[] = [
  {
    id: 'gta5',
    title: 'Grand Theft Auto V',
    status: 'supported',
    tagline: 'Story mode · Offline'
  },
  {
    id: 'gta6',
    title: 'Grand Theft Auto VI',
    status: 'coming_soon',
    tagline: 'Support planned'
  }
]

export const DEFAULT_GAME_ID: GameId = 'gta5'

export function isGameId(value: string): value is GameId {
  return value in GAMES
}

export function getGameDefinition(gameId: string): GameDefinition | undefined {
  return isGameId(gameId) ? GAMES[gameId] : undefined
}

export function resolveGameId(gameId?: string): GameId {
  if (gameId && isGameId(gameId)) {
    return gameId
  }
  return DEFAULT_GAME_ID
}
