import config from '@payload-config'
import { getPayload } from 'payload'
import Stripe from 'stripe'

import { sendOrderMails } from './mail'

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

const norm = (v: string) => v.toLowerCase().replace(/deutschland|\bde\b/g, '').replace(/[^a-z0-9äöüß]/g, '')
/** Enthält unsere gespeicherte Adresse schon Straße, PLZ und Ort der Stripe-Adresse? */
const sameAddress = (ours: string, stripes: string) => {
  const o = norm(ours)
  return stripes
    .split('\n')
    .slice(1)
    .every((line) => !norm(line) || o.includes(norm(line)))
}

/** Bestellung als bezahlt markieren. Darf mehrfach aufgerufen werden (Rückkehrseite und Webhook). */
export const markOrderPaid = async (session: Stripe.Checkout.Session, origin = process.env.SITE_URL || ''): Promise<any | null> => {
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
      // Angaben aus dem Bestellschritt bleiben stehen; was der Kunde bei Stripe geändert hat, steht darunter
      customerName: order.customerName || details?.name || undefined,
      customerEmail: details?.email || order.customerEmail || undefined,
      customerPhone: details?.phone || order.customerPhone || undefined,
      address: order.address
        ? address && !sameAddress(order.address, address)
          ? `${order.address}\n\nBei der Zahlung angegeben:\n${address}`
          : order.address
        : address || undefined,
      stripePaymentIntent: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
    } as any,
  })
  const quoteIds: unknown[] = Array.isArray(order.breakdown?.items) ? order.breakdown.items.map((i: any) => i?.quoteId) : [order.breakdown?.quoteId]
  for (const id of quoteIds)
    if (id) await payload.update({ collection: 'quotes', id: id as number, data: { ordered: true } as any }).catch(() => null)
  payload.logger.info(`Bestellung ${order.orderNumber} bezahlt.`)
  await sendOrderMails(payload, updated, origin)
  return updated
}
