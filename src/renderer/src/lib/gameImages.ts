import gta5Cover from '@renderer/assets/games/gta5.png'
import gta6Cover from '@renderer/assets/games/gta6.png'

export const GAME_COVER_IMAGES = {
  gta5: gta5Cover,
  gta6: gta6Cover
} as const

export function getGameCoverImage(gameId: string): string | undefined {
  if (gameId === 'gta5') return GAME_COVER_IMAGES.gta5
  if (gameId === 'gta6') return GAME_COVER_IMAGES.gta6
  return undefined
}
