import { useState } from 'react'
import { useAuth } from '@renderer/context/AuthContext'
import TierBadge from '@renderer/components/TierBadge'
import { tierBadgeLabel } from '../../../shared/profile'
import { createCheckoutSession } from '@renderer/lib/billing'

const SUBSCRIPTION_PORTAL_URL =
  import.meta.env.VITE_SUBSCRIPTION_PORTAL_URL ?? 'https://billing.stripe.com/p/login/test'

export default function AccountPage(): React.JSX.Element {
  const { user, profile, session, signOut, refreshProfile, waitForTierUpgrade } = useAuth()
  const [upgrading, setUpgrading] = useState<'pro' | 'elite' | null>(null)
  const [billingMessage, setBillingMessage] = useState<string | null>(null)
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

  const handleUpgrade = async (targetTier: 'pro' | 'elite'): Promise<void> => {
    if (!session?.access_token) {
      setBillingError('You must be signed in to upgrade.')
      return
    }

    setUpgrading(targetTier)
    setBillingError(null)
    setBillingMessage(null)

    try {
      const checkoutUrl = await createCheckoutSession(session.access_token, targetTier)
      await window.api.auth.openExternal(checkoutUrl)

      setBillingMessage('Complete payment in your browser. Waiting for your tier to update…')

      const upgraded = await waitForTierUpgrade(targetTier)
      if (upgraded) {
        await refreshProfile()
        setBillingMessage(`Welcome to ${tierBadgeLabel(targetTier)}! Your account has been upgraded.`)
      } else {
        setBillingMessage(
          'Payment may still be processing. Click Refresh if your tier has not updated yet.'
        )
      }
    } catch (err) {
      setBillingError(err instanceof Error ? err.message : 'Checkout failed.')
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-launcher-text">Account</h2>
          <p className="mt-1 text-sm text-launcher-muted">
            Your subscription tier, profile, and billing settings.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refreshProfile()}
          className="rounded-lg border border-launcher-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-launcher-muted transition-colors hover:border-launcher-accent/40 hover:text-launcher-accent"
        >
          Refresh
        </button>
      </header>

      {(billingMessage || billingError) && (
        <div
          className={[
            'rounded-lg px-4 py-3 text-sm',
            billingError
              ? 'border border-red-500/30 bg-red-500/10 text-red-300'
              : 'border border-launcher-accent/30 bg-launcher-accent/10 text-launcher-accent'
          ].join(' ')}
        >
          {billingError ?? billingMessage}
        </div>
      )}

      <div className="flex flex-col gap-6 rounded-2xl border border-launcher-border bg-launcher-surface/60 p-6 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-launcher-accent/30 to-launcher-elevated text-3xl font-bold text-launcher-accent">
          {initials}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-launcher-text">{email}</h3>
          <p className="mt-1 text-sm text-launcher-muted">User ID: {profile?.id.slice(0, 8) ?? '—'}…</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <TierBadge tier={tier} label={badgeLabel} />
            <span className="rounded-full border border-launcher-border bg-launcher-elevated px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-launcher-muted">
              Member since {memberSince}
            </span>
            {upgrading && (
              <span className="animate-pulse text-[10px] font-semibold uppercase tracking-wider text-launcher-accent">
                Upgrading…
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-launcher-muted">
            Current plan:{' '}
            <span className="font-semibold capitalize text-launcher-text">{tier}</span>
            {tier === 'free' && ' — Upgrade to unlock one-click install and batch mod controls.'}
            {tier === 'pro' && ' — Full mod automation and batch tools unlocked.'}
            {tier === 'elite' && ' — All premium features unlocked.'}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          {tier !== 'pro' && tier !== 'elite' && (
            <button
              type="button"
              disabled={upgrading !== null}
              onClick={() => void handleUpgrade('pro')}
              className="rounded-lg border border-blue-400/50 bg-blue-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-blue-300 transition-colors hover:bg-blue-500/25 disabled:opacity-50"
            >
              {upgrading === 'pro' ? 'Opening checkout…' : 'Upgrade to Pro'}
            </button>
          )}
          {tier !== 'elite' && (
            <button
              type="button"
              disabled={upgrading !== null}
              onClick={() => void handleUpgrade('elite')}
              className="rounded-lg border border-amber-400/50 bg-amber-500/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-200 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
            >
              {upgrading === 'elite' ? 'Opening checkout…' : 'Upgrade to Elite'}
            </button>
          )}
          {(tier === 'pro' || tier === 'elite') && (
            <button
              type="button"
              onClick={handleManageSubscription}
              className="rounded-lg bg-gradient-to-r from-launcher-accent to-launcher-accent-dim px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-launcher-bg shadow-[0_0_20px_var(--color-launcher-glow)] transition-transform hover:scale-[1.02]"
            >
              Manage Subscription
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

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            tier: 'free' as const,
            title: 'Free',
            perks: ['Manual mod import', 'Enable/disable one at a time', 'Offline story launch']
          },
          {
            tier: 'pro' as const,
            title: 'Pro',
            perks: ['One-click auto-install', 'Batch enable/disable', 'Priority support']
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
              'rounded-xl border p-5 transition-colors',
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
                disabled={upgrading !== null}
                onClick={() => void handleUpgrade(plan.tier)}
                className="mt-3 text-[10px] font-bold uppercase tracking-wider text-launcher-accent hover:underline disabled:opacity-50"
              >
                Upgrade to {plan.title}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
