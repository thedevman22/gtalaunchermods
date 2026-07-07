export type NavItem = 'home' | 'mods' | 'settings' | 'account'

export const NAV_ITEMS: { id: NavItem; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'mods', label: 'Mods', icon: '◈' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'account', label: 'Account', icon: '◎' }
]
