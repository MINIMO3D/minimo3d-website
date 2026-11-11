import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { textHash } from '../lib/lexical-text'
import { agb, datenschutz } from '../seed/legal'

// Nur Daten: Datenschutzerklärung und AGB an den neuen Bestellschritt anpassen
// (Adresse wird auf der Website angegeben und an Stripe übergeben).
// Ersetzt wird nur die unveränderte Fassung aus der vorherigen Auslieferung.
const updates: Record<string, { previous: string; content: unknown }> = {
  datenschutz: { previous: 'dfeed714c47de60edf0cf55afa3e772e0bd3effae1221f3fe9195e6745def6d1', content: datenschutz },
  agb: { previous: 'ffd47ac1a1c7530ddbcccddabda761c5e2cee0601bb8c948c55e71923b10450b', content: agb },
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const [slug, u] of Object.entries(updates)) {
    const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, req })
    const page: any = res.docs[0]
    if (!page) continue
    const current = textHash(page.content)
    if (current === u.previous) {
      await payload.update({ collection: 'pages', id: page.id, data: { content: u.content } as any, req })
      payload.logger.info(`Rechtstext "${slug}" an den Bestellschritt angepasst.`)
    } else if (current !== textHash(u.content)) {
      payload.logger.warn(`Rechtstext "${slug}" wurde bearbeitet und bleibt unverändert. Bitte den Bestellschritt von Hand ergänzen.`)
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Die Rechtstexte bleiben stehen.
}
