import type { GameEdition, GameId } from './games'

export interface OnboardingState {
  complete: boolean
  gameId: GameId | null
  edition: GameEdition | null
}

export interface GameSetupSelection {
  gameId: GameId
  edition: GameEdition
}

export const ONBOARDING_STEPS = ['welcome', 'game', 'path', 'dependencies'] as const
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number]
