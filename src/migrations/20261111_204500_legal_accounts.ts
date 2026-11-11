import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { textHash } from '../lib/lexical-text'
import { agb, datenschutz } from '../seed/legal'

// Nur Daten: Datenschutzerklärung und AGB um Kundenkonto, Anmelde-Cookie, Prüfung der USt-IdNr.,
// Kauf auf Rechnung und Rabatt ergänzen. Ersetzt wird nur die unveränderte erste Fassung.
// Im Admin-Bereich bearbeitete Texte bleiben stehen und müssen von Hand ergänzt werden.
const updates: Record<string, { firstVersion: string; content: unknown }> = {
  datenschutz: { firstVersion: '735462489652e24e58ff53252d44e3fa19b74861465a7aba24e8e0a4f5631c42', content: datenschutz },
  agb: { firstVersion: '0f55faa2ebab90c6949431cb6b693a307be1dab5d302589e3e21d39aeb168c63', content: agb },
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const [slug, u] of Object.entries(updates)) {
    const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, req })
    const page: any = res.docs[0]
    if (!page) continue
    if (textHash(page.content) === u.firstVersion) {
      await payload.update({ collection: 'pages', id: page.id, data: { content: u.content } as any, req })
      payload.logger.info(`Rechtstext "${slug}" um das Kundenkonto ergänzt.`)
    } else if (textHash(page.content) !== textHash(u.content)) {
      payload.logger.warn(`Rechtstext "${slug}" wurde bearbeitet und bleibt unverändert. Bitte Abschnitte zum Kundenkonto von Hand ergänzen.`)
    }
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Die Rechtstexte bleiben stehen.
}
