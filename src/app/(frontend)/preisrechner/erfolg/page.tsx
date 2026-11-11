import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'

import { getSettings, telHref } from '@/lib/data'
import { euro } from '@/lib/pricing'
import { originOf } from '@/lib/mail'
import { getStripe, markOrderPaid } from '@/lib/stripe'

export const metadata: Metadata = { title: 'Bestellung', robots: { index: false } }

type Props = { searchParams: Promise<{ session_id?: string }> }

export default async function OrderDonePage({ searchParams }: Props) {
  const { session_id } = await searchParams
  const s = await getSettings()
  const stripe = getStripe()

  let order: any = null
  let paid = false
  if (stripe && session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      order = await markOrderPaid(session, originOf({ headers: await headers() }))
      paid = session.payment_status === 'paid'
    } catch (err) {
      console.error('Bestellung konnte nicht geladen werden', err)
    }
  }

  return (
    <section className="wrap section stack" style={{ gap: 24, maxWidth: 820 }}>
      {order && paid ? (
        <>
          <p className="eyebrow">Bestellung {order.orderNumber}</p>
          <h1 className="h1 h1--page">Danke, Ihre Bestellung ist bezahlt.</h1>
          <p className="lead">
            Wir prüfen Ihre Datei von Hand und starten dann die Fertigung. Die Zahlungsbestätigung kommt per E-Mail von
            unserem Zahlungsdienst Stripe.
          </p>
          <dl className="sum" style={{ maxWidth: 520 }}>
            <div>
              <dt>Datei</dt>
              <dd>{order.fileName}</dd>
            </div>
            <div>
              <dt>Ausführung</dt>
              <dd>
                {order.quantity} × {order.materialName}
                {order.color ? `, ${order.color}` : ''}
              </dd>
            </div>
            <div>
              <dt>Lieferung</dt>
              <dd>{order.delivery}</dd>
            </div>
            <div>
              <dt>Lieferzeit</dt>
              <dd>{order.leadTime}</dd>
            </div>
            <div>
              <dt>Gesamt inkl. MwSt.</dt>
              <dd>{euro(Math.round((order.total || 0) * 100))}</dd>
            </div>
          </dl>
          {order.customer && (
            <p>
              <Link href={`/konto/bestellungen/${typeof order.id === 'number' || typeof order.id === 'string' ? order.id : ''}`}>
                Bestellung im Kundenkonto ansehen
              </Link>
            </p>
          )}
        </>
      ) : order ? (
        <>
          <p className="eyebrow">Bestellung {order.orderNumber}</p>
          <h1 className="h1 h1--page">Ihre Zahlung ist noch nicht eingegangen.</h1>
          <p className="lead">
            Bei manchen Zahlungsarten dauert die Bestätigung etwas. Sobald die Zahlung da ist, beginnen wir mit der
            Fertigung. Bei Fragen nennen Sie uns bitte die Bestellnummer.
          </p>
        </>
      ) : (
        <>
          <h1 className="h1 h1--page">Diese Bestellung haben wir nicht gefunden.</h1>
          <p className="lead">Falls Sie gerade bezahlt haben, melden Sie sich bitte kurz bei uns. Wir klären das sofort.</p>
        </>
      )}
      <p>
        Fragen? <a href={telHref(s.phone)}>{s.phone}</a> oder <a href={`mailto:${s.email}`}>{s.email}</a>
      </p>
      <div className="btns">
        <Link className="btn btn--primary" href="/preisrechner">
          Weiteres Bauteil berechnen
        </Link>
        <Link className="btn btn--ghost" href="/">
          Zur Startseite
        </Link>
      </div>
    </section>
  )
}
