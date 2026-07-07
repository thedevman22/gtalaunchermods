import { BrowserWindow, ipcMain } from 'electron'
import { isGameEdition, isGameId } from '../shared/games'
import type { GameEdition, GameId } from '../shared/games'
import type { OnboardingState } from '../shared/onboarding'
import type { OperationResult } from '../shared/game'
import { getSetupStatus } from './dependencyManager'
import {
  getGameEdition,
  getGameId,
  getSavedGamePath,
  isOnboardingComplete,
  resetOnboardingState,
  setGameSelection,
  setOnboardingComplete,
  validateGamePath
} from './gameLauncher'

function buildOnboardingState(): OnboardingState {
  maybeMigrateLegacySetup()

  return {
    complete: isOnboardingComplete(),
    gameId: getGameId(),
    edition: getGameEdition()
  }
}

/** Users who completed setup before onboarding existed skip the wizard. */
function maybeMigrateLegacySetup(): void {
  if (isOnboardingComplete()) {
    return
  }

  const setup = getSetupStatus()
  if (setup.setupComplete && getSavedGamePath()) {
    setOnboardingComplete(true)
  }
}

function broadcastOnboardingChanged(): void {
  const payload = buildOnboardingState()
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send('onboarding:changed', payload)
  }
}

export function getOnboardingState(): OnboardingState {
  return buildOnboardingState()
}

export function isOnboardingRequired(): boolean {
  return !getOnboardingState().complete
}

export function saveGameSetup(gameId: GameId, edition: GameEdition): OperationResult {
  if (!isGameId(gameId)) {
    return { success: false, error: 'Unsupported game.' }
  }

  if (!isGameEdition(edition)) {
    return { success: false, error: 'Invalid edition.' }
  }

  setGameSelection(gameId, edition)

  const saved = getSavedGamePath()
  if (saved && !validateGamePath(saved, edition).valid) {
    // Edition changed — path will be re-selected in onboarding
  }

  broadcastOnboardingChanged()
  return { success: true }
}

export function completeOnboarding(): OperationResult {
  const setup = getSetupStatus()
  if (!setup.setupComplete) {
    return {
      success: false,
      error: 'Finish dependency setup before completing onboarding.'
    }
  }

  setOnboardingComplete(true)
  broadcastOnboardingChanged()
  return { success: true }
}

export function resetOnboarding(): OperationResult {
  resetOnboardingState()
  broadcastOnboardingChanged()
  return { success: true }
}

export function emitOnboardingChanged(): void {
  broadcastOnboardingChanged()
}

export function registerOnboardingIpc(): void {
  ipcMain.handle('onboarding:getState', () => getOnboardingState())
  ipcMain.handle('onboarding:setGameSetup', (_event, gameId: unknown, edition: unknown) => {
    if (typeof gameId !== 'string' || typeof edition !== 'string') {
      return { success: false, error: 'Invalid game setup.' } satisfies OperationResult
    }
    return saveGameSetup(gameId as GameId, edition as GameEdition)
  })
  ipcMain.handle('onboarding:complete', () => completeOnboarding())
  ipcMain.handle('onboarding:reset', () => resetOnboarding())
}
