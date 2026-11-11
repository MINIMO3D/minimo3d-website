import config from '@payload-config'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { resolveSelection } from '@/lib/calc-selection'
import { findQuote, mayUseQuote, siteOrigin } from '@/lib/calc-server'
import { customerFromRequest, customerName, formatAddress, hasBilling, isB2B } from '@/lib/customer'
import { sendOrderMails } from '@/lib/mail'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })
const comma = (n: number) => String(n).replace('.', ',')
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return bad('Ungültige Anfrage.')
  if (body.accepted !== true) return bad('Bitte bestätigen Sie AGB und Datenschutzerklärung.')

  const customer = await customerFromRequest(req)
  const quote = await findQuote(body.token)
  if (!quote || !mayUseQuote(quote, customer)) return bad('Die Berechnung ist abgelaufen. Bitte laden Sie die Datei erneut hoch.', 404)

  const sel = await resolveSelection(quote, body, customer)
  if ('error' in sel) return bad(sel.error)
  if (!sel.fits) return bad('Das Teil ist größer als der Bauraum. Bitte senden Sie uns dafür eine Anfrage.')

  // Kauf auf Rechnung: nur für freigeschaltete Geschäftskunden mit hinterlegter Adresse
  const onInvoice = body.payment === 'rechnung'
  if (onInvoice) {
    if (!customer || !isB2B(customer) || !customer.invoiceAllowed)
      return bad('Kauf auf Rechnung ist für Ihr Konto nicht freigeschaltet.', 403)
    if (!hasBilling(customer)) return bad('Bitte hinterlegen Sie zuerst Ihre Rechnungsadresse im Kundenkonto.')
  }
  const stripe = onInvoice ? null : getStripe()
  if (!onInvoice && !stripe) return bad('Die Online-Zahlung ist noch nicht eingerichtet. Bitte senden Sie uns eine Anfrage.', 503)

  const { price } = sel
  const now = new Date()
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const orderNumber = `M3D-${stamp}-${randomBytes(3).toString('hex').toUpperCase()}`
  const note = text(body.note, 1000)
  const b2b = isB2B(customer)
  const poNumber = b2b ? text(body.poNumber, 60) : ''
  const costCentre = b2b ? text(body.costCentre, 60) : ''
  const deliveryLabel = sel.delivery === 'versand' ? 'DHL-Versand (Deutschland)' : 'Abholung in Neuhausen auf den Fildern'
  const origin = siteOrigin(req)

  const shippingAddress =
    customer && sel.delivery === 'versand'
      ? customer.shippingSame === false && customer.shipping?.street
        ? formatAddress(customer.shipping.name || customer.company || customerName(customer), customer.shipping)
        : formatAddress(customer.company || customerName(customer), customer.billing)
      : ''

  const payload = await getPayload({ config })
  const order: any = await payload.create({
    collection: 'orders',
    data: {
      orderNumber,
      status: onInvoice ? 'rechnung' : 'offen',
      paymentMethod: onInvoice ? 'rechnung' : 'stripe',
      total: price.totalCents / 100,
      customer: customer?.id,
      customerName: customer ? [customer.company, customerName(customer)].filter(Boolean).join(', ') : undefined,
      customerEmail: customer?.email,
      customerPhone: customer?.phone || undefined,
      address: onInvoice
        ? [`Rechnung:\n${formatAddress(customer!.company || customerName(customer!), customer!.billing)}`, shippingAddress ? `Lieferung:\n${shippingAddress}` : '']
            .filter(Boolean)
            .join('\n\n')
        : undefined,
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
      poNumber: poNumber || undefined,
      costCentre: costCentre || undefined,
      breakdown: {
        quoteId: quote.id,
        token: quote.token,
        materialId: sel.material.id,
        layerId: sel.layer.id,
        infillId: sel.infill.id,
        price,
        metrics: quote.metrics,
        vatId: b2b ? customer?.vatId : undefined,
        invoiceDays: onInvoice ? (customer!.invoiceDays ?? 14) : undefined,
      },
    } as any,
  })

  // ---- Kauf auf Rechnung: Bestellung ist damit angenommen ----
  if (onInvoice) {
    await payload.update({ collection: 'quotes', id: quote.id, data: { ordered: true } as any }).catch(() => null)
    await sendOrderMails(payload, order, origin)
    payload.logger.info(`Bestellung ${orderNumber} auf Rechnung.`)
    return NextResponse.json({ url: `/konto/bestellungen/${order.id}?neu=1` })
  }

  // ---- Online-Zahlung über Stripe ----
  const partName = `3D-Druck: ${quote.fileName}`.slice(0, 120)
  const partDesc = [
    sel.material.name,
    sel.color,
    `Schichthöhe ${comma(sel.layer.mm)} mm`,
    `Füllung ${sel.infill.label}`,
    price.discountPercent ? `${comma(price.discountPercent)} % Mengenrabatt` : '',
    price.customerDiscountPercent ? `${comma(price.customerDiscountPercent)} % Kundenrabatt` : '',
    'inkl. 19 % MwSt.',
  ]
    .filter(Boolean)
    .join(' · ')

  const line = (name: string, amount: number, quantity = 1, description?: string) => ({
    quantity,
    price_data: { currency: 'eur', unit_amount: amount, product_data: { name, ...(description ? { description } : {}) } },
  })
  const reference = [poNumber ? `Ihre Referenz ${poNumber}` : '', costCentre ? `Kostenstelle ${costCentre}` : ''].filter(Boolean).join(', ')

  try {
    const session = await stripe!.checkout.sessions.create({
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
      ...(customer ? { customer_email: customer.email } : {}),
      client_reference_id: orderNumber,
      metadata: { orderId: String(order.id), orderNumber, ...(poNumber ? { poNumber } : {}), ...(costCentre ? { costCentre } : {}) },
      payment_intent_data: {
        description: `MINIMO3D Bestellung ${orderNumber}${reference ? ` (${reference})` : ''}`,
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
    await payload
      .update({ collection: 'orders', id: order.id, data: { status: 'storniert', notes: `Kasse fehlgeschlagen: ${err?.message || ''}`.slice(0, 500) } as any })
      .catch(() => null)
    return bad('Die Kasse konnte nicht geöffnet werden. Bitte versuchen Sie es erneut oder senden Sie uns eine Anfrage.', 502)
  }
}
