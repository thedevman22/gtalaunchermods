/** Public paths for game cover art (landing site). */
export const GAME_COVER_IMAGES = {
  gta5: '/games/gta5.png',
  gta6: '/games/gta6.png'
} as const

export type GameCoverId = keyof typeof GAME_COVER_IMAGES

export function getGameCoverImage(gameId: string): string | undefined {
  if (gameId === 'gta5' || gameId === 'gta6') {
    return GAME_COVER_IMAGES[gameId]
  }
  return undefined
}
