import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

import { getStripe, markOrderPaid } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Stripe meldet hier abgeschlossene Zahlungen, auch wenn der Kunde das Fenster vorher schließt. */
export async function POST(req: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) return NextResponse.json({ error: 'Webhook nicht eingerichtet.' }, { status: 503 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature') || '', secret)
  } catch {
    return NextResponse.json({ error: 'Ungültige Signatur.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    await markOrderPaid(event.data.object as Stripe.Checkout.Session)
  }
  return NextResponse.json({ received: true })
}
