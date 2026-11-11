import Link from 'next/link'
import { notFound } from 'next/navigation'

import { DfmButton } from '@/components/konto/Forms'
import { StatusBadge } from '@/components/konto/OrderTable'
import { requireCustomer, isB2B } from '@/lib/customer'
import { getSettings } from '@/lib/data'
import { dateDe, getOrder, ORDER_STATUS, ORDER_STEPS, reorderHref } from '@/lib/portal'
import { euro, netCents } from '@/lib/pricing'

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ neu?: string }> }

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ id }, { neu }] = await Promise.all([params, searchParams])
  const customer = await requireCustomer()
  const [o, s] = await Promise.all([getOrder(customer, id), getSettings()])
  if (!o || o.status === 'offen') notFound()
  const b2b = isB2B(customer)
  const p = o.breakdown?.price
  const b = o.breakdown || {}
  const show = (cents: number) => euro(b2b ? netCents(cents, 19) : cents)
  const step = ORDER_STATUS[o.status]?.step ?? 0
  const invoice = o.paymentMethod === 'rechnung'
  const again = reorderHref(o)

  return (
    <div className="stack" style={{ gap: 28 }}>
      <p className="small">
        <Link href="/konto/bestellungen">← Alle Bestellungen</Link>
      </p>
      {neu && (
        <p className="form__msg form__msg--ok" role="status">
          Danke, Ihre Bestellung ist eingegangen. {invoice ? 'Die Rechnung erhalten Sie mit der Lieferung.' : ''} Wir prüfen Ihre Datei von Hand und starten
          dann die Fertigung.
        </p>
      )}
      <div className="panel__head">
        <h1 className="h2">Bestellung {o.orderNumber}</h1>
        <StatusBadge status={o.status} />
      </div>

      {step >= 0 && (
        <ol className="track" aria-label="Fortschritt">
          {ORDER_STEPS.map((label, i) => (
            <li key={label} className={i <= step ? 'track__step track__step--done' : 'track__step'} aria-current={i === step ? 'step' : undefined}>
              {label}
            </li>
          ))}
        </ol>
      )}

      <div className="split">
        <section className="panel">
          <h2 className="h3">Bauteil</h2>
          <dl className="sum">
            <div>
              <dt>Datei</dt>
              <dd>{o.fileName}</dd>
            </div>
            <div>
              <dt>Material</dt>
              <dd>{[o.materialName, o.color].filter(Boolean).join(', ')}</dd>
            </div>
            <div>
              <dt>Schichthöhe</dt>
              <dd>{o.layer}</dd>
            </div>
            <div>
              <dt>Füllung</dt>
              <dd>{o.infill}</dd>
            </div>
            <div>
              <dt>Stückzahl</dt>
              <dd>{o.quantity}</dd>
            </div>
            <div>
              <dt>Lieferung</dt>
              <dd>{o.delivery}</dd>
            </div>
            <div>
              <dt>Lieferzeit</dt>
              <dd>{o.leadTime}</dd>
            </div>
            <div>
              <dt>Bestellt am</dt>
              <dd>{dateDe(o.createdAt)}</dd>
            </div>
            {o.poNumber && (
              <div>
                <dt>Ihre Bestellreferenz</dt>
                <dd>{o.poNumber}</dd>
              </div>
            )}
            {o.costCentre && (
              <div>
                <dt>Kostenstelle</dt>
                <dd>{o.costCentre}</dd>
              </div>
            )}
            {o.customerNote && (
              <div>
                <dt>Ihr Hinweis</dt>
                <dd>{o.customerNote}</dd>
              </div>
            )}
          </dl>
          <div className="actions">
            {again && (
              <Link className="btn btn--primary" href={again}>
                Erneut bestellen
              </Link>
            )}
            {b.token && b.materialId && (
              <DfmButton
                selection={{
                  token: b.token,
                  materialId: String(b.materialId),
                  layer: b.layerId,
                  infill: b.infillId,
                  quantity: o.quantity,
                  color: o.color || '',
                  fileName: o.fileName,
                }}
              />
            )}
          </div>
        </section>

        <section className="panel panel--price">
          <h2 className="h3">Preis</h2>
          {p ? (
            <dl className="sum">
              <div>
                <dt>
                  {o.quantity} × {show(p.unitCents)}
                </dt>
                <dd>{show(p.partsCents)}</dd>
              </div>
              {p.discountPercent > 0 && (
                <div className="sum__muted">
                  <dt>Mengenrabatt</dt>
                  <dd>{p.discountPercent} % enthalten</dd>
                </div>
              )}
              {p.customerDiscountPercent > 0 && (
                <div className="sum__muted">
                  <dt>Ihr Kundenrabatt</dt>
                  <dd>{p.customerDiscountPercent} % enthalten</dd>
                </div>
              )}
              <div>
                <dt>Auftragspauschale</dt>
                <dd>{show(p.feeCents)}</dd>
              </div>
              {p.expressCents > 0 && (
                <div>
                  <dt>Express</dt>
                  <dd>{show(p.expressCents)}</dd>
                </div>
              )}
              <div>
                <dt>Versand</dt>
                <dd>{p.shippingCents ? show(p.shippingCents) : 'kostenlos'}</dd>
              </div>
              {b2b && (
                <>
                  <div>
                    <dt>Summe netto</dt>
                    <dd>{euro(p.totalCents - p.vatCents)}</dd>
                  </div>
                  <div>
                    <dt>19 % MwSt.</dt>
                    <dd>{euro(p.vatCents)}</dd>
                  </div>
                </>
              )}
              <div className="sum__total">
                <dt>Gesamt {b2b ? 'brutto' : 'inkl. MwSt.'}</dt>
                <dd>{euro(p.totalCents)}</dd>
              </div>
              {!b2b && (
                <div className="sum__muted">
                  <dt>Enthaltene MwSt.</dt>
                  <dd>{euro(p.vatCents)}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p>Gesamt: {euro(Math.round((o.total || 0) * 100))}</p>
          )}
          <p className="small muted">
            Zahlungsart: {invoice ? `Kauf auf Rechnung, zahlbar ${b.invoiceDays ?? 14} Tage nach Rechnungsdatum` : 'online bezahlt über Stripe'}
            {o.paidAt ? `, bezahlt am ${dateDe(o.paidAt)}` : ''}
          </p>
          <p className="small muted">
            Fragen zur Bestellung? <a href={`mailto:${s.email}?subject=${encodeURIComponent(`Bestellung ${o.orderNumber}`)}`}>{s.email}</a>
          </p>
        </section>
      </div>
    </div>
  )
}
