import { DOWNLOAD_CONFIG } from '@/config/download'

export const SITE = {
  name: 'GTA Mod Launcher',
  tagline: 'Free, safe, story-mode-only mod management for GTA V',
  description:
    'A free desktop launcher to manage GTA V mods safely. Story-mode offline play only — no online, no paywalls on mods.',
  downloadUrl: DOWNLOAD_CONFIG.downloadUrl,
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL ?? 'https://discord.gg/gta-mod-launcher',
  installUrl: '/#install',
  termsUrl: '/terms'
} as const

export const FEATURES = [
  {
    icon: '📦',
    title: 'Mod Manager',
    description:
      'Import .zip mods into a separate library, enable or disable with one click, and deploy cleanly into GTA V with tracked manifests.'
  },
  {
    icon: '🛡️',
    title: 'Story-Mode-Safe Launch',
    description:
      'Launches GTA5.exe directly with -scOfflineOnly — no Rockstar launcher, no online sessions. Built for single-player modding.'
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
      'A lightweight Electron desktop app with a dark gaming UI — fast, offline-ready, and built for modders.'
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

export const HOW_IT_WORKS_STEPS = [
  {
    title: 'Download',
    description:
      'Grab the free Windows installer and run the setup wizard. The launcher auto-detects GTA V from Steam, Epic, or Rockstar.'
  },
  {
    title: 'Sign In',
    description:
      'Create an account with email or Google — the same login works on this site and in the desktop app, so your profile travels with you.'
  },
  {
    title: 'Browse Mods',
    description:
      'Explore the built-in catalog, import .zip archives, and toggle mods on or off. Your library stays isolated until you enable each mod.'
  },
  {
    title: 'Launch Story Mode',
    description:
      'Hit Play to launch GTA V with -scOfflineOnly enforced. Story mode only, offline-safe, with your enabled mods deployed cleanly.'
  }
] as const
