export type GameId = 'gta5'

export interface GameDefinition {
  id: GameId
  title: string
  catalogTitle: string
  catalogSubtitle: string
}

export const GAMES: Record<GameId, GameDefinition> = {
  gta5: {
    id: 'gta5',
    title: 'Grand Theft Auto V',
    catalogTitle: 'Mod Catalog',
    catalogSubtitle: 'Browse curated story-mode mods or manage your installed library.'
  }
}

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
