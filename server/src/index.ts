import 'dotenv/config'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

type SubscriptionTier = 'free' | 'pro' | 'elite'

const PORT = Number(process.env.PORT ?? 4242)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO
const STRIPE_PRICE_ELITE = process.env.STRIPE_PRICE_ELITE
const STRIPE_SUCCESS_URL =
  process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:3000/pricing?checkout=success'
const STRIPE_CANCEL_URL = process.env.STRIPE_CANCEL_URL ?? 'http://localhost:3000/pricing?checkout=cancel'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

function tierRoleBadge(tier: SubscriptionTier): string {
  switch (tier) {
    case 'elite':
      return 'Elite Member'
    case 'pro':
      return 'Pro Member'
    default:
      return 'Free Member'
  }
}

function requireEnv(): void {
  const missing: string[] = []
  if (!STRIPE_SECRET_KEY) missing.push('STRIPE_SECRET_KEY')
  if (!STRIPE_WEBHOOK_SECRET) missing.push('STRIPE_WEBHOOK_SECRET')
  if (!STRIPE_PRICE_PRO) missing.push('STRIPE_PRICE_PRO')
  if (!STRIPE_PRICE_ELITE) missing.push('STRIPE_PRICE_ELITE')
  if (!SUPABASE_URL) missing.push('SUPABASE_URL')
  if (!SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`)
    process.exit(1)
  }
}

requireEnv()

const stripe = new Stripe(STRIPE_SECRET_KEY!)
const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const app = express()

app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'OPTIONS']
  })
)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/checkout/success', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Payment successful</title></head>
<body style="font-family:system-ui;background:#0a0a0f;color:#e8e8f0;display:flex;align-items:center;justify-content:center;height:100vh">
  <div style="text-align:center"><h1>Payment successful</h1><p>Return to ModHarbor — your tier will update shortly.</p></div>
</body></html>`)
})

app.get('/checkout/cancel', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html><head><title>Checkout canceled</title></head>
<body style="font-family:system-ui;background:#0a0a0f;color:#e8e8f0;display:flex;align-items:center;justify-content:center;height:100vh">
  <div style="text-align:center"><h1>Checkout canceled</h1><p>You can close this window and return to the launcher.</p></div>
</body></html>`)
})

async function authenticateUser(req: Request): Promise<{ id: string; email: string }> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new Error('Missing authorization token.')
  }

  const token = header.slice('Bearer '.length)
  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user) {
    throw new Error('Invalid or expired session.')
  }

  return {
    id: data.user.id,
    email: data.user.email ?? ''
  }
}

async function updateUserTier(userId: string, tier: SubscriptionTier): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_tier: tier,
      role_badge: tierRoleBadge(tier)
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
}

function priceIdForTier(tier: 'pro' | 'elite'): string {
  if (tier === 'elite') return STRIPE_PRICE_ELITE!
  return STRIPE_PRICE_PRO!
}

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature']
  if (!signature || typeof signature !== 'string') {
    res.status(400).send('Missing Stripe signature.')
    return
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid webhook signature.'
    console.error('Webhook signature error:', message)
    res.status(400).send(`Webhook Error: ${message}`)
    return
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const userId = session.metadata?.supabase_user_id
        const tier = session.metadata?.tier as SubscriptionTier | undefined

        if (!userId || !tier || !['pro', 'elite'].includes(tier)) {
          console.warn('Checkout session missing metadata:', session.id)
          break
        }

        await updateUserTier(userId, tier)
        console.log(`Upgraded user ${userId} to ${tier}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        const tier = subscription.metadata?.tier as SubscriptionTier | undefined

        if (!userId || !tier) break

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          await updateUserTier(userId, tier)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id
        if (!userId) break

        await updateUserTier(userId, 'free')
        console.log(`Downgraded user ${userId} to free`)
        break
      }

      default:
        break
    }

    res.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook handler failed.'
    console.error('Webhook handler error:', message)
    res.status(500).send(message)
  }
})

app.use(express.json())

app.post('/create-checkout-session', async (req, res) => {
  try {
    const user = await authenticateUser(req)
    const tier = req.body?.tier as string | undefined

    if (tier !== 'pro' && tier !== 'elite') {
      res.status(400).json({ error: 'tier must be "pro" or "elite".' })
      return
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email || undefined,
      line_items: [{ price: priceIdForTier(tier), quantity: 1 }],
      success_url: STRIPE_SUCCESS_URL,
      cancel_url: STRIPE_CANCEL_URL,
      client_reference_id: user.id,
      metadata: {
        supabase_user_id: user.id,
        tier
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          tier
        }
      }
    })

    if (!session.url) {
      res.status(500).json({ error: 'Stripe did not return a checkout URL.' })
      return
    }

    res.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout session.'
    res.status(401).json({ error: message })
  }
})

app.listen(PORT, () => {
  console.log(`Billing server listening on http://localhost:${PORT}`)
})
