/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUBSCRIPTION_PORTAL_URL?: string
  readonly VITE_BILLING_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
