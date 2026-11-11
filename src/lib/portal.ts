import config from '@payload-config'
import { getPayload } from 'payload'

import type { Customer } from './customer'

export const ORDER_STATUS: Record<string, { label: string; tone: 'ok' | 'warn' | 'info' | 'off'; step: number }> = {
  offen: { label: 'Zahlung offen', tone: 'warn', step: 0 },
  rechnung: { label: 'Eingegangen, auf Rechnung', tone: 'info', step: 0 },
  bezahlt: { label: 'Bezahlt, in Prüfung', tone: 'info', step: 0 },
  fertigung: { label: 'In Fertigung', tone: 'info', step: 2 },
  versendet: { label: 'Versendet oder abholbereit', tone: 'ok', step: 3 },
  storniert: { label: 'Storniert', tone: 'off', step: -1 },
}
export const ORDER_STEPS = ['Bestellt', 'Geprüft', 'In Fertigung', 'Versendet oder abholbereit']

/** Abgebrochene Zahlungen (nie bezahlte Stripe-Kassen) zeigen wir im Konto nicht an. */
const visible = (customer: Customer) => ({
  and: [{ customer: { equals: customer.id } }, { status: { not_equals: 'offen' } }],
})

export const getOrders = async (customer: Customer, limit = 100) => {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'orders', where: visible(customer) as any, sort: '-createdAt', limit, depth: 0 })
  return { orders: res.docs as any[], total: res.totalDocs }
}

export const getOrder = async (customer: Customer, id: string) => {
  if (!/^\d+$/.test(id)) return null
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'orders',
    where: { and: [{ id: { equals: Number(id) } }, { customer: { equals: customer.id } }] },
    limit: 1,
    depth: 0,
  })
  return (res.docs[0] as any) || null
}

export const getFiles = async (customer: Customer, limit = 100) => {
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'quotes', where: { customer: { equals: customer.id } }, sort: '-createdAt', limit, depth: 0 })
  return { files: res.docs as any[], total: res.totalDocs }
}

export const dateDe = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' }) : ''

/** Adresse für den Preisrechner, um eine Datei mit gleicher Ausführung erneut zu öffnen. */
export const reorderHref = (o: any) => {
  const b = o.breakdown || {}
  if (!b.token) return null
  const q = new URLSearchParams({ datei: String(b.token) })
  if (b.materialId) q.set('m', String(b.materialId))
  if (b.layerId) q.set('schicht', String(b.layerId))
  if (b.infillId) q.set('fuellung', String(b.infillId))
  if (o.quantity) q.set('menge', String(o.quantity))
  if (o.color) q.set('farbe', String(o.color))
  return `/preisrechner?${q.toString()}`
}
