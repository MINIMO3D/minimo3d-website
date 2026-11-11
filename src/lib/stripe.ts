import config from '@payload-config'
import { getPayload } from 'payload'
import Stripe from 'stripe'

let client: Stripe | null = null

export const stripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY)
export const stripeTestMode = () => (process.env.STRIPE_SECRET_KEY || '').startsWith('sk_test_')

export const getStripe = (): Stripe | null => {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY)
  return client
}

const formatAddress = (name?: string | null, a?: Stripe.Address | null) =>
  [name, a?.line1, a?.line2, [a?.postal_code, a?.city].filter(Boolean).join(' '), a?.country].filter(Boolean).join('\n')

/** Bestellung als bezahlt markieren. Darf mehrfach aufgerufen werden (Rückkehrseite und Webhook). */
export const markOrderPaid = async (session: Stripe.Checkout.Session): Promise<any | null> => {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'orders',
    where: { stripeSessionId: { equals: session.id } },
    limit: 1,
    depth: 0,
  })
  const order: any = found.docs[0]
  if (!order) return null
  if (session.payment_status !== 'paid') return order
  if (order.status !== 'offen') return order

  const anySession = session as any
  const shipping = anySession.collected_information?.shipping_details || anySession.shipping_details
  const details = session.customer_details
  const address = shipping?.address
    ? formatAddress(shipping.name, shipping.address)
    : formatAddress(details?.name, details?.address)

  const updated = await payload.update({
    collection: 'orders',
    id: order.id,
    data: {
      status: 'bezahlt',
      paidAt: new Date().toISOString(),
      total: (session.amount_total ?? 0) / 100,
      customerName: details?.name || undefined,
      customerEmail: details?.email || undefined,
      customerPhone: details?.phone || undefined,
      address: address || undefined,
      stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
    } as any,
  })
  if (order.breakdown?.quoteId)
    await payload.update({ collection: 'quotes', id: order.breakdown.quoteId, data: { ordered: true } as any }).catch(() => null)
  payload.logger.info(`Bestellung ${order.orderNumber} bezahlt.`)
  return updated
}
