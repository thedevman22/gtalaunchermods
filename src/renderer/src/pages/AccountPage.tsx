import { useState } from 'react'
import { useAuth } from '@renderer/context/AuthContext'
import { useUpgradeFlow } from '@renderer/context/UpgradeFlowContext'
import TierBadge from '@renderer/components/TierBadge'
import { tierBadgeLabel } from '../../../shared/profile'

const SUBSCRIPTION_PORTAL_URL =
  import.meta.env.VITE_SUBSCRIPTION_PORTAL_URL ?? 'https://billing.stripe.com/p/login/test'

export default function AccountPage(): React.JSX.Element {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const { startUpgrade, awaitingPayment } = useUpgradeFlow()
  const [billingError, setBillingError] = useState<string | null>(null)

  const email = profile?.email ?? user?.email ?? 'Unknown'
  const tier = profile?.subscription_tier ?? 'free'
  const badgeLabel = profile?.role_badge ?? tierBadgeLabel(tier)
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—'

  const initials = email.charAt(0).toUpperCase()

  const handleManageSubscription = (): void => {
    void window.api.auth.openExternal(SUBSCRIPTION_PORTAL_URL)
  }

  const handleUpgrade = (targetTier: 'pro' | 'elite'): void => {
    setBillingError(null)
    startUpgrade(targetTier)
  }

  return (
    <div className="h-full overflow-y-auto px-10 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="type-title">Account</h2>
          <p className="type-body mt-1.5">Profile, subscription, and billing.</p>
        </div>
        <button type="button" onClick={() => void refreshProfile()} className="btn-ghost">
          Refresh
        </button>
      </header>

      {billingError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {billingError}
        </div>
      ) : null}

      {awaitingPayment ? (
        <div className="rounded-lg border border-launcher-accent/30 bg-launcher-accent/10 px-4 py-3 text-sm text-launcher-accent">
          Complete payment on the ModHarbor website. Your tier will update automatically when checkout
          finishes — no restart needed.
        </div>
      ) : null}

      <div className="flex flex-col gap-8 rounded-2xl border border-launcher-border bg-launcher-surface/60 p-8 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-launcher-accent/30 to-launcher-elevated text-3xl font-bold text-launcher-accent">
          {initials}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-launcher-text">{email}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <TierBadge tier={tier} label={badgeLabel} />
            <span className="rounded-full border border-launcher-border bg-launcher-elevated px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-launcher-muted">
              Member since {memberSince}
            </span>
            {awaitingPayment ? (
              <span className="animate-pulse text-[10px] font-semibold uppercase tracking-wider text-launcher-accent">
                Awaiting payment…
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3">
          {tier === 'free' && (
            <button
              type="button"
              disabled={awaitingPayment}
              onClick={() => handleUpgrade('pro')}
              className="btn-primary px-5 py-2.5"
            >
              {awaitingPayment ? 'Checkout open…' : 'Upgrade to Pro'}
            </button>
          )}
          {(tier === 'pro' || tier === 'elite') && (
            <button type="button" onClick={handleManageSubscription} className="btn-primary px-5 py-2.5">
              Manage Subscription
            </button>
          )}
          {tier !== 'elite' && (
            <button
              type="button"
              disabled={awaitingPayment}
              onClick={() => handleUpgrade('elite')}
              className="btn-ghost"
            >
              {awaitingPayment ? 'Checkout open…' : 'Upgrade to Elite'}
            </button>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg border border-launcher-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-launcher-muted transition-colors hover:border-red-500/40 hover:text-red-400"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {[
          {
            tier: 'free' as const,
            title: 'Free',
            perks: ['Manual mod import', '1 profile · 3 mods', 'Offline story launch']
          },
          {
            tier: 'pro' as const,
            title: 'Pro',
            perks: ['One-click auto-install', 'Unlimited profiles', 'Mod stacking', 'Priority support']
          },
          {
            tier: 'elite' as const,
            title: 'Elite',
            perks: ['Everything in Pro', 'Early access features', 'Elite role badge']
          }
        ].map((plan) => (
          <div
            key={plan.tier}
            className={[
              'rounded-2xl border p-6 transition-colors',
              tier === plan.tier
                ? 'border-launcher-accent/50 bg-launcher-accent/5'
                : 'border-launcher-border bg-launcher-elevated/40'
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-launcher-text">{plan.title}</h4>
              <TierBadge tier={plan.tier} size="sm" />
            </div>
            <ul className="mt-3 space-y-1.5">
              {plan.perks.map((perk) => (
                <li key={perk} className="text-xs text-launcher-muted">
                  • {perk}
                </li>
              ))}
            </ul>
            {tier === plan.tier && (
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-launcher-accent">
                Current plan
              </p>
            )}
            {tier !== plan.tier && plan.tier !== 'free' && (
              <button
                type="button"
                disabled={awaitingPayment}
                onClick={() => handleUpgrade(plan.tier)}
                className="mt-3 text-[10px] font-bold uppercase tracking-wider text-launcher-accent hover:underline disabled:opacity-50"
              >
                Upgrade to {plan.title}
              </button>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}
