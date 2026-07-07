export type OsFamily = 'windows' | 'mac' | 'linux' | 'other' | 'unknown'

export function detectOs(userAgent: string, platform = ''): OsFamily {
  if (/Win/i.test(userAgent) || /Win/i.test(platform)) {
    return 'windows'
  }
  if (/Mac/i.test(userAgent) || /Mac/i.test(platform)) {
    return 'mac'
  }
  if (/Linux/i.test(userAgent) || /Linux/i.test(platform)) {
    return 'linux'
  }
  return 'other'
}

export function isNonWindowsOs(os: OsFamily): boolean {
  return os === 'mac' || os === 'linux' || os === 'other'
}
