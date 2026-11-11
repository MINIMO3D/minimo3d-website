import type { Payload } from 'payload'

const DAY = 24 * 3600 * 1000

/**
 * Löscht, was laut Datenschutzerklärung nicht länger aufbewahrt wird:
 * Berechnungen ohne Bestellung nach 7 Tagen, Anfragen nach 12 Monaten, jeweils samt Dateien.
 */
export const runCleanup = async (payload: Payload): Promise<void> => {
  try {
    const quotes = await payload.find({
      collection: 'quotes',
      where: { and: [{ createdAt: { less_than: new Date(Date.now() - 7 * DAY).toISOString() } }, { ordered: { not_equals: true } }, { customer: { exists: false } }] },
      limit: 200,
      depth: 0,
    })
    for (const q of quotes.docs as any[]) {
      if (q.file) await payload.delete({ collection: 'quote-files', id: q.file }).catch(() => null)
      await payload.delete({ collection: 'quotes', id: q.id }).catch(() => null)
    }

    const inquiries = await payload.find({
      collection: 'inquiries',
      where: { createdAt: { less_than: new Date(Date.now() - 365 * DAY).toISOString() } },
      limit: 200,
      depth: 0,
    })
    for (const i of inquiries.docs as any[]) {
      for (const f of (i.files || []) as (number | string)[])
        await payload.delete({ collection: 'inquiry-files', id: f }).catch(() => null)
      await payload.delete({ collection: 'inquiries', id: i.id }).catch(() => null)
    }

    const removed = quotes.docs.length + inquiries.docs.length
    if (removed) payload.logger.info(`Aufräumen: ${quotes.docs.length} Berechnungen und ${inquiries.docs.length} Anfragen gelöscht.`)
  } catch (err) {
    payload.logger.error({ err }, 'Aufräumen fehlgeschlagen')
  }
}

const started = Symbol.for('minimo3d.cleanup')

/** Startet das Aufräumen kurz nach dem Start und danach alle sechs Stunden. */
export const startCleanup = (payload: Payload): void => {
  if (process.env.NODE_ENV !== 'production') return
  const g = globalThis as any
  if (g[started]) return
  g[started] = true
  setTimeout(() => void runCleanup(payload), 60 * 1000).unref()
  setInterval(() => void runCleanup(payload), 6 * 3600 * 1000).unref()
}
