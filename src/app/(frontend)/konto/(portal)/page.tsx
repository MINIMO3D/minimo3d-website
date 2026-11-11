import Link from 'next/link'

import { OrderTable } from '@/components/konto/OrderTable'
import { discountOf, requireCustomer, hasBilling, isB2B } from '@/lib/customer'
import { getSettings } from '@/lib/data'
import { getFiles, getOrders } from '@/lib/portal'
import { euro, netCents } from '@/lib/pricing'

const VAT = 19

export default async function PortalHome() {
  const customer = await requireCustomer()
  const b2b = isB2B(customer)
  const [{ orders, total }, { total: fileCount }, s] = await Promise.all([getOrders(customer, 200), getFiles(customer, 1), getSettings()])
  const active = orders.filter((o) => ['rechnung', 'bezahlt', 'fertigung'].includes(o.status))
  const year = new Date().getFullYear()
  const cents = (o: any) => Math.round((o.total || 0) * 100)
  const yearNet = orders
    .filter((o) => o.status !== 'storniert' && new Date(o.createdAt).getFullYear() === year)
    .reduce((sum, o) => sum + netCents(cents(o), VAT), 0)
  const openInvoices = orders.filter((o) => o.status === 'rechnung' || (o.paymentMethod === 'rechnung' && !o.paidAt && o.status !== 'storniert'))
  const discount = discountOf(customer)

  return (
    <div className="stack" style={{ gap: 32 }}>
      <h1 className="h2">Guten Tag, {customer.firstName}.</h1>

      {b2b && !hasBilling(customer) && (
        <p className="form__msg form__msg--err">
          Bitte ergänzen Sie Ihre <Link href="/konto/profil">Rechnungsadresse</Link>.
        </p>
      )}

      <div className="tiles">
        <Link className="tile" href="/konto/bestellungen">
          <span className="mono">Bestellungen</span>
          <strong>{total}</strong>
          <span>{active.length ? `${active.length} in Arbeit` : 'keine in Arbeit'}</span>
        </Link>
        <Link className="tile" href="/konto/dateien">
          <span className="mono">Gespeicherte Dateien</span>
          <strong>{fileCount}</strong>
          <span>öffnen und nachbestellen</span>
        </Link>
        {b2b ? (
          <>
            <div className="tile">
              <span className="mono">Umsatz {year}</span>
              <strong>{euro(yearNet)}</strong>
              <span>netto</span>
            </div>
            <div className="tile">
              <span className="mono">Offene Rechnungen</span>
              <strong>{openInvoices.length}</strong>
              <span>{openInvoices.length ? euro(openInvoices.reduce((a, o) => a + cents(o), 0)) + ' brutto' : 'alles beglichen'}</span>
            </div>
          </>
        ) : (
          <Link className="tile tile--cta" href="/preisrechner">
            <span className="mono">Neues Bauteil</span>
            <strong>Sofortangebot</strong>
            <span>Datei hochladen und Preis sehen</span>
          </Link>
        )}
      </div>

      {b2b && (
        <section className="panel">
          <div className="panel__head">
            <h2 className="h3">Ihre Konditionen</h2>
            <Link className="btn btn--primary btn--small" href="/preisrechner">
              Sofortangebot
            </Link>
          </div>
          <dl className="facts">
            <div>
              <dt>Preise</dt>
              <dd>netto, zuzüglich 19 % MwSt.</dd>
            </div>
            <div>
              <dt>Umsatzsteuer-ID</dt>
              <dd>
                {customer.vatId}{' '}
                <span className={`badge badge--${customer.vatStatus === 'gueltig' ? 'ok' : customer.vatStatus === 'ungueltig' ? 'warn' : 'info'}`}>
                  {customer.vatStatus === 'gueltig' ? 'geprüft' : customer.vatStatus === 'ungueltig' ? 'ungültig' : 'Prüfung läuft'}
                </span>
              </dd>
            </div>
            <div>
              <dt>Ihr Rabatt</dt>
              <dd>{discount ? `${discount.toLocaleString('de-DE')} % auf alle Teile` : 'nach Vereinbarung'}</dd>
            </div>
            <div>
              <dt>Kauf auf Rechnung</dt>
              <dd>
                {customer.invoiceAllowed ? (
                  `freigeschaltet, zahlbar in ${customer.invoiceDays ?? 14} Tagen`
                ) : (
                  <a href={`mailto:${s.email}?subject=${encodeURIComponent(`Kauf auf Rechnung für ${customer.company || ''}`)}`}>Freischaltung anfragen</a>
                )}
              </dd>
            </div>
          </dl>
          <p className="small muted">
            Bestellreferenz und Kostenstelle geben Sie bei jeder Bestellung im Preisrechner an. Sie stehen auf Bestätigung und Rechnung.
          </p>
        </section>
      )}

      <section className="stack" style={{ gap: 16 }}>
        <div className="panel__head">
          <h2 className="h3">Letzte Bestellungen</h2>
          {total > 5 && <Link href="/konto/bestellungen">Alle ansehen</Link>}
        </div>
        {orders.length ? (
          <OrderTable orders={orders.slice(0, 5)} b2b={b2b} />
        ) : (
          <div className="calc__empty">
            <p>Sie haben noch nichts bestellt. Laden Sie Ihre erste Datei hoch, der Preis erscheint sofort.</p>
            <Link className="btn btn--primary" href="/preisrechner">
              Zum Preisrechner
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
