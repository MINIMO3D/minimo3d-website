import Link from 'next/link'

import { OrderTable } from '@/components/konto/OrderTable'
import { requireCustomer, isB2B } from '@/lib/customer'
import { getOrders } from '@/lib/portal'

export default async function OrdersPage() {
  const customer = await requireCustomer()
  const { orders } = await getOrders(customer, 200)
  return (
    <div className="stack" style={{ gap: 24 }}>
      <h1 className="h2">Bestellungen</h1>
      {orders.length ? (
        <OrderTable orders={orders} b2b={isB2B(customer)} />
      ) : (
        <div className="calc__empty">
          <p>Hier erscheinen Ihre Bestellungen, sobald Sie angemeldet bestellt haben.</p>
          <Link className="btn btn--primary" href="/preisrechner">
            Zum Preisrechner
          </Link>
        </div>
      )}
    </div>
  )
}
