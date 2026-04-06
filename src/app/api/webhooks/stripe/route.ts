import { stripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return Response.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const service = createServiceClient()

  async function getSupabaseUserId(customerId: string): Promise<string | null> {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer.deleted) return null
    return (customer as Stripe.Customer).metadata?.supabase_user_id ?? null
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (!session.customer || !session.subscription) break

      const userId = await getSupabaseUserId(session.customer as string)
      if (!userId) break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      // billing_cycle_anchor is the next billing date in Stripe v22
      const periodEnd = new Date(subscription.billing_cycle_anchor * 1000).toISOString()

      await service.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_sub_id: session.subscription as string,
        tier: 'pro',
        status: 'active',
        current_period_end: periodEnd,
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getSupabaseUserId(sub.customer as string)
      if (!userId) break

      const tier = sub.status === 'active' || sub.status === 'trialing' ? 'pro' : 'free'
      await service.from('subscriptions').upsert({
        user_id: userId,
        stripe_sub_id: sub.id,
        stripe_customer_id: sub.customer as string,
        tier,
        status: sub.status as 'active' | 'past_due' | 'canceled' | 'trialing',
        current_period_end: new Date(sub.billing_cycle_anchor * 1000).toISOString(),
      })
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const userId = await getSupabaseUserId(sub.customer as string)
      if (!userId) break

      await service.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: sub.customer as string,
        stripe_sub_id: sub.id,
        tier: 'free',
        status: 'canceled',
        current_period_end: null,
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (!invoice.customer) break

      const userId = await getSupabaseUserId(invoice.customer as string)
      if (!userId) break

      await service.from('subscriptions').update({ status: 'past_due' }).eq('user_id', userId)
      break
    }
  }

  return Response.json({ received: true })
}
