import config from '@payload-config'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { resolveSelection } from '@/lib/calc-selection'
import { findQuote, siteOrigin } from '@/lib/calc-server'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })
const comma = (n: number) => String(n).replace('.', ',')

export async function POST(req: Request) {
  const stripe = getStripe()
  if (!stripe) return bad('Die Online-Zahlung ist noch nicht eingerichtet. Bitte senden Sie uns eine Anfrage.', 503)

  const body = await req.json().catch(() => null)
  if (!body) return bad('Ungültige Anfrage.')
  if (body.accepted !== true) return bad('Bitte bestätigen Sie AGB und Datenschutzerklärung.')

  const quote = await findQuote(body.token)
  if (!quote) return bad('Die Berechnung ist abgelaufen. Bitte laden Sie die Datei erneut hoch.', 404)

  const sel = await resolveSelection(quote, body)
  if ('error' in sel) return bad(sel.error)
  if (!sel.fits) return bad('Das Teil ist größer als der Bauraum. Bitte senden Sie uns dafür eine Anfrage.')

  const { price } = sel
  const now = new Date()
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const orderNumber = `M3D-${stamp}-${randomBytes(3).toString('hex').toUpperCase()}`
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : ''
  const deliveryLabel = sel.delivery === 'versand' ? 'DHL-Versand (Deutschland)' : 'Abholung in Neuhausen auf den Fildern'

  const payload = await getPayload({ config })
  const order = await payload.create({
    collection: 'orders',
    data: {
      orderNumber,
      status: 'offen',
      total: price.totalCents / 100,
      fileName: quote.fileName,
      file: typeof quote.file === 'object' ? quote.file?.id : quote.file,
      materialName: sel.material.name,
      color: sel.color || undefined,
      layer: `${sel.layer.label} (${comma(sel.layer.mm)} mm)`,
      infill: `${sel.infill.label} (${sel.infill.range})`,
      quantity: sel.quantity,
      express: sel.express,
      delivery: deliveryLabel,
      leadTime: price.leadTime,
      customerNote: note || undefined,
      breakdown: { quoteId: quote.id, price, metrics: quote.metrics },
    } as any,
  })

  const origin = siteOrigin(req)
  const partName = `3D-Druck: ${quote.fileName}`.slice(0, 120)
  const partDesc = [
    sel.material.name,
    sel.color,
    `Schichthöhe ${comma(sel.layer.mm)} mm`,
    `Füllung ${sel.infill.label}`,
    price.discountPercent ? `${comma(price.discountPercent)} % Mengenrabatt` : '',
    'inkl. 19 % MwSt.',
  ]
    .filter(Boolean)
    .join(' · ')

  const line = (name: string, amount: number, quantity = 1, description?: string) => ({
    quantity,
    price_data: { currency: 'eur', unit_amount: amount, product_data: { name, ...(description ? { description } : {}) } },
  })

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'de',
      line_items: [
        line(partName, price.unitCents, sel.quantity, partDesc),
        line('Auftragspauschale', price.feeCents, 1, 'Prüfung, Abwicklung und Verpackung'),
        ...(price.expressCents ? [line('Express-Fertigung', price.expressCents)] : []),
      ],
      ...(sel.delivery === 'versand'
        ? {
            shipping_address_collection: { allowed_countries: ['DE' as const] },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount' as const,
                  display_name: price.shippingCents ? 'DHL-Versand' : 'DHL-Versand (kostenlos)',
                  fixed_amount: { amount: price.shippingCents, currency: 'eur' },
                },
              },
            ],
          }
        : {}),
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      customer_creation: 'always',
      client_reference_id: orderNumber,
      metadata: { orderId: String(order.id), orderNumber },
      payment_intent_data: {
        description: `MINIMO3D Bestellung ${orderNumber}`,
        metadata: { orderId: String(order.id), orderNumber },
      },
      custom_text: {
        submit: {
          message: `Bestellung ${orderNumber}. Lieferzeit ${price.leadTime} nach Zahlungseingang. ${deliveryLabel}.`,
        },
      },
      success_url: `${origin}/preisrechner/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/preisrechner?abgebrochen=1`,
    })
    await payload.update({ collection: 'orders', id: order.id, data: { stripeSessionId: session.id } as any })
    if (!session.url) throw new Error('Stripe lieferte keine Adresse für die Kasse.')
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe-Kasse fehlgeschlagen', err?.message || err)
    await payload.update({ collection: 'orders', id: order.id, data: { status: 'storniert', notes: `Kasse fehlgeschlagen: ${err?.message || ''}`.slice(0, 500) } as any }).catch(() => null)
    return bad('Die Kasse konnte nicht geöffnet werden. Bitte versuchen Sie es erneut oder senden Sie uns eine Anfrage.', 502)
  }
}
