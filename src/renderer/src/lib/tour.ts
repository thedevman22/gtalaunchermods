export interface TourStep {
  id: string
  /** CSS selectors tried in order — first match becomes the spotlight target. */
  targets: string[]
  title: string
  body: string
}

export function getTourSteps(gamePathConfigured: boolean): TourStep[] {
  return [
    {
      id: 'setup',
      targets: ['[data-tour="setup-card"]', '[data-tour="setup-status"]'],
      title: 'Connect your game folder',
      body: gamePathConfigured
        ? 'Your GTA V folder is already connected — this indicator stays green while everything is ready. You can change the folder anytime in Settings.'
        : 'ModHarbor needs to know where GTA V is installed. Use this to locate your game folder — Steam, Epic, and Rockstar installs are detected automatically.'
    },
    {
      id: 'catalog',
      targets: ['[data-tour="nav-mods"]'],
      title: 'Find mods in the catalog',
      body: 'The Mods tab holds the catalog. Hit Install on a mod and it downloads, sorts itself into the right game folders, and joins your selected profile. You can also import .zip files there.'
    },
    {
      id: 'profiles',
      targets: ['[data-tour="profiles"]'],
      title: 'Organize with profiles',
      body: 'Profiles are named mod loadouts. Click a card to select it — mods you add go into the selected profile, and switching profiles cleanly swaps files in and out of your game folder.'
    },
    {
      id: 'launch',
      targets: ['[data-tour="launch"]'],
      title: 'Launch — story mode only',
      body: 'One click deploys the selected profile and starts GTA V offline in story mode. ModHarbor never launches or touches GTA Online — that is a guarantee, not a setting.'
    }
  ]
}

const TOUR_SEEN_PREFIX = 'modharbor.tourSeen.'

export function hasSeenTour(userKey: string): boolean {
  try {
    return localStorage.getItem(TOUR_SEEN_PREFIX + userKey) === '1'
  } catch {
    return true
  }
}

export function markTourSeen(userKey: string): void {
  try {
    localStorage.setItem(TOUR_SEEN_PREFIX + userKey, '1')
  } catch {
    // Non-fatal: the tour will simply offer itself again next launch.
  }
}
