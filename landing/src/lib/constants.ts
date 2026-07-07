import { DOWNLOAD_CONFIG } from '@/config/download'

export const SITE = {
  name: 'ModHarbor',
  tagline: 'Free, safe, story-mode mod management — calm and premium',
  description:
    'ModHarbor is a free desktop launcher to manage game mods safely. Story-mode offline play only — no online, no paywalls on mods.',
  downloadUrl: DOWNLOAD_CONFIG.downloadUrl,
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/modharbor',
  installUrl: '/#install',
  termsUrl: '/terms'
} as const

export const SUPPORTED_GAMES = [
  {
    id: 'gta5',
    title: 'Grand Theft Auto V',
    status: 'supported' as const,
    tagline: 'Story mode · Offline launches · Steam, Epic, or Rockstar',
    description:
      'Full ModHarbor support today — mod profiles, catalog browsing, drag-and-drop imports, and offline story-mode launch with -scOfflineOnly.'
  },
  {
    id: 'gta6',
    title: 'Grand Theft Auto VI',
    status: 'coming_soon' as const,
    tagline: 'Harbor support planned after release',
    description:
      'We are preparing ModHarbor for the next chapter. Join Discord for updates — no ETA yet, and no official branding on this page.'
  }
]

export const FEATURES = [
  {
    icon: '📦',
    title: 'Mod Profiles',
    description:
      'Named loadouts with their own mod lists. Launch a profile to deploy exactly those mods — previous files are cleaned up first.'
  },
  {
    icon: '🛡️',
    title: 'Story-Mode-Safe Launch',
    description:
      'Launches with -scOfflineOnly — no online sessions. Built for single-player modding only.'
  },
  {
    icon: '⚡',
    title: 'Pro & Elite Tiers',
    description:
      'Upgrade for one-click auto-install, batch enable/disable, and priority support. Mods themselves are always free.'
  },
  {
    icon: '🔒',
    title: 'Isolated Mod Library',
    description:
      'Mods live in your launcher library, not mixed into your game folder until you choose to enable them.'
  },
  {
    icon: '🎯',
    title: 'Auto-Detect Install',
    description:
      'Finds GTA V from Steam, Epic, or Rockstar paths automatically. Manual browse if needed.'
  },
  {
    icon: '🖥️',
    title: 'Native Windows App',
    description:
      'A lightweight Electron desktop app with a bright coastal UI — fast, offline-ready, and built for modders.'
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
      'Steam / Epic / Rockstar detection',
      'Community Discord access'
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
      'Batch enable / disable',
      'Pro role badge',
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
      'Dedicated support channel',
      'Vote on roadmap features'
    ]
  }
] as const

export const COMPARISON_ROWS = [
  { feature: 'Mod imports', free: true, pro: true, elite: true },
  { feature: 'Story-mode offline launch', free: true, pro: true, elite: true },
  { feature: 'One-click auto-install', free: false, pro: true, elite: true },
  { feature: 'Batch enable / disable', free: false, pro: true, elite: true },
  { feature: 'Early access features', free: false, pro: false, elite: true },
  { feature: 'Mods are free', free: true, pro: true, elite: true }
] as const

export const APP_MOCKUPS = [
  {
    id: 'profiles' as const,
    title: 'Mod profiles',
    caption:
      'Create named loadouts like “Realistic Graphics” or “Chaos Mode.” Each profile tracks its own mods — launch applies exactly that set.'
  },
  {
    id: 'catalog' as const,
    title: 'Mod catalog',
    caption:
      'Browse by category, import .zip archives, and add mods to your selected profile. Pro unlocks one-click install from the catalog.'
  },
  {
    id: 'launch' as const,
    title: 'Story-mode launch',
    caption:
      'Launch undeploys the previous profile, applies yours in order, and starts GTA V with -scOfflineOnly — offline single-player only.'
  }
] as const
