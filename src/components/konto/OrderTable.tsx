import Link from 'next/link'

import { dateDe, ORDER_STATUS } from '@/lib/portal'
import { euro, netCents } from '@/lib/pricing'

export function StatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status] || { label: status, tone: 'info' }
  return <span className={`badge badge--${s.tone}`}>{s.label}</span>
}

export function OrderTable({ orders, b2b }: { orders: any[]; b2b: boolean }) {
  return (
    <div className="tablebox">
      <table className="list">
        <thead>
          <tr>
            <th>Bestellung</th>
            <th>Datum</th>
            <th>Bauteil</th>
            {b2b && <th>Ihre Referenz</th>}
            <th>Status</th>
            <th className="num">{b2b ? 'Netto' : 'Gesamt'}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const cents = Math.round((o.total || 0) * 100)
            return (
              <tr key={o.id}>
                <td>
                  <Link href={`/konto/bestellungen/${o.id}`}>{o.orderNumber}</Link>
                </td>
                <td>{dateDe(o.createdAt)}</td>
                <td>
                  {o.quantity} × {o.fileName}
                  <br />
                  <span className="small muted">{o.materialName}</span>
                </td>
                {b2b && <td>{[o.poNumber, o.costCentre].filter(Boolean).join(' · ') || '–'}</td>}
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td className="num">{euro(b2b ? netCents(cents, 19) : cents)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
