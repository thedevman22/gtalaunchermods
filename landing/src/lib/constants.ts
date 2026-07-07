import { DOWNLOAD_CONFIG } from '@/config/download'
import type { PaidTierId } from '@/lib/pricing'

export const SITE = {
  name: 'ModHarbor',
  tagline: 'Free, safe, story-mode mod management',
  description:
    'ModHarbor is a free desktop launcher to manage game mods safely. Story-mode offline play only — no online, no paywalls on mods.',
  downloadUrl: DOWNLOAD_CONFIG.downloadUrl,
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/modharbor',
  takedownEmail: process.env.NEXT_PUBLIC_TAKEDOWN_EMAIL ?? 'takedown@modharbor.app',
  termsUrl: '/terms',
  privacyUrl: '/privacy',
  legalUrl: '/legal'
} as const

export const NAV_LINKS = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/why-modharbor', label: 'Why ModHarbor' },
  { href: '/gta-support', label: 'GTA Support' },
  { href: '/#pricing', label: 'Pricing' }
] as const

export const SUPPORTED_GAMES = [
  {
    id: 'gta5',
    title: 'Grand Theft Auto V',
    status: 'supported' as const,
    tagline: 'Mod profiles · Catalog · Offline story-mode launch'
  },
  {
    id: 'gta6',
    title: 'Grand Theft Auto VI',
    status: 'coming_soon' as const,
    tagline: 'Support planned after release'
  }
]

export const HOW_IT_WORKS_STEPS = [
  {
    id: 'build' as const,
    title: 'Build a profile',
    line: 'Group your mods into named loadouts.'
  },
  {
    id: 'launch' as const,
    title: 'Launch it',
    line: 'One click deploys the profile and starts the game.'
  },
  {
    id: 'safe' as const,
    title: 'Stay safe',
    line: 'Story mode only — always launched offline.'
  }
] as const

export const HERO_STATS = [
  { value: 100, suffix: '%', prefix: '', label: 'Mods stay free' },
  { value: 1, suffix: '', prefix: '', label: 'Click to install' },
  { value: 3, suffix: '', prefix: '', label: 'Steps to play' }
] as const

export type PricingTierId = 'free' | PaidTierId

export type PricingTier = {
  id: PricingTierId
  name: string
  description: string
  highlight: boolean
  cta: string
  features: readonly string[]
}

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Everything you need to mod story mode safely.',
    highlight: false,
    cta: 'Download Free',
    features: [
      'Unlimited mod imports',
      'Manual enable / disable',
      'Story-mode offline launch',
      'Auto-detect game install'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Power tools for serious modders.',
    highlight: true,
    cta: 'Get Pro',
    features: [
      'Everything in Free',
      'One-click auto-install',
      'Unlimited profiles & mod stacking',
      'Priority support'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'The ultimate launcher experience.',
    highlight: false,
    cta: 'Get Elite',
    features: [
      'Everything in Pro',
      'Early access features',
      'Elite gold badge',
      'Vote on roadmap features'
    ]
  }
] as const

export const PRICING_FAQ = [
  {
    id: 'cancel',
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Cancel from your account settings or the Stripe customer portal. You keep paid features until the end of your billing period — no hidden fees.'
  },
  {
    id: 'mods',
    question: 'Do mods cost money?',
    answer:
      'Never. Every mod in the catalog stays free. Pro and Elite only unlock launcher convenience — one-click installs, profiles, and priority support.'
  },
  {
    id: 'safe',
    question: 'Is this safe for my Rockstar account?',
    answer:
      'ModHarbor launches GTA V in offline story mode only. We never touch online play, so your account stays out of modded multiplayer sessions.'
  },
  {
    id: 'switch',
    question: 'Can I switch between monthly and yearly?',
    answer:
      'You can change plans when you renew or upgrade. Yearly billing is billed once up front and typically saves about two months compared to paying monthly.'
  }
] as const
