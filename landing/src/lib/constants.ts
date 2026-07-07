import { DOWNLOAD_CONFIG } from '@/config/download'

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

export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
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
    price: '$7',
    period: '/month',
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
    price: '$15',
    period: '/month',
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
