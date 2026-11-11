import config from '@payload-config'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { cache } from 'react'

export type Customer = {
  id: number | string
  email: string
  type: 'b2c' | 'b2b'
  firstName: string
  lastName: string
  phone?: string
  company?: string
  vatId?: string
  vatStatus?: 'ungeprueft' | 'gueltig' | 'ungueltig'
  discountPercent?: number
  invoiceAllowed?: boolean
  invoiceDays?: number
  billing?: { street?: string; zip?: string; city?: string; country?: string }
  shippingSame?: boolean
  shipping?: { name?: string; street?: string; zip?: string; city?: string; country?: string }
}

const fromUser = (user: any): Customer | null => (user && user.collection === 'customers' ? (user as Customer) : null)

/** Angemeldeter Kunde in Seiten (Server Components). Mitarbeiterkonten zählen nicht. */
export const getCustomer = cache(async (): Promise<Customer | null> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  return fromUser(user)
})

/** Angemeldeter Kunde in Route Handlern. */
export const customerFromRequest = async (req: Request): Promise<Customer | null> => {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  return fromUser(user)
}

export const isB2B = (c: Customer | null | undefined) => c?.type === 'b2b'
export const discountOf = (c: Customer | null | undefined) =>
  isB2B(c) && typeof c!.discountPercent === 'number' ? Math.min(50, Math.max(0, c!.discountPercent)) : 0

export const hasBilling = (c: Customer | null | undefined) => Boolean(c?.billing?.street && c.billing.zip && c.billing.city)

export const formatAddress = (name: string | undefined, a?: { street?: string; zip?: string; city?: string; country?: string } | null) =>
  [name, a?.street, [a?.zip, a?.city].filter(Boolean).join(' '), a?.country].filter(Boolean).join('\n')

export const customerName = (c: Customer) => [c.firstName, c.lastName].filter(Boolean).join(' ')

/** Für Seiten im Kundenkonto: leitet zur Anmeldung, wenn niemand angemeldet ist. */
export const requireCustomer = async (): Promise<Customer> => {
  const customer = await getCustomer()
  if (!customer) redirect('/konto/anmelden')
  return customer
}
