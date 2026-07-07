import { useEffect, useState } from 'react'
import type { NavItem } from '@renderer/types/navigation'

interface SidebarProps {
  active: NavItem
  onNavigate: (item: NavItem) => void
}

const navItems: { id: NavItem; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'mods', label: 'Mods', icon: '◈' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
  { id: 'account', label: 'Account', icon: '◎' }
]

export default function Sidebar({ active, onNavigate }: SidebarProps): React.JSX.Element {
  const [setupComplete, setSetupComplete] = useState(true)

  useEffect(() => {
    void window.api.setup.getStatus().then((status) => {
      setSetupComplete(status.setupComplete)
    })
    const unsubscribe = window.api.setup.onChanged((status) => {
      setSetupComplete(status.setupComplete)
    })
    return unsubscribe
  }, [])

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-launcher-border bg-launcher-surface/80 backdrop-blur-xl">
      <div className="border-b border-launcher-border px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-launcher-accent to-launcher-accent-dim shadow-[0_0_20px_var(--color-launcher-glow)]">
            <span className="text-lg font-black text-launcher-bg">G</span>
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-wide text-launcher-text">
              GTA MOD
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-launcher-accent">
              Launcher
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={[
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-launcher-accent/10 text-launcher-accent shadow-[inset_3px_0_0_0_var(--color-launcher-accent)]'
                  : 'text-launcher-muted hover:bg-launcher-elevated hover:text-launcher-text'
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors',
                  isActive
                    ? 'bg-launcher-accent/20 text-launcher-accent'
                    : 'bg-launcher-elevated text-launcher-muted group-hover:text-launcher-text'
                ].join(' ')}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-launcher-border p-4">
        <div className="rounded-lg border border-launcher-border bg-launcher-elevated/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-launcher-muted">
            Status
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span
              className={[
                'h-2 w-2 rounded-full',
                setupComplete
                  ? 'animate-pulse bg-launcher-accent shadow-[0_0_8px_var(--color-launcher-accent)]'
                  : 'bg-amber-400'
              ].join(' ')}
            />
            <span className="text-xs text-launcher-text">
              {setupComplete ? 'Ready to launch' : 'Setup required'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
