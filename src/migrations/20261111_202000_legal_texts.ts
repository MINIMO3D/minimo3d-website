import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { agb, datenschutz, impressum, LEGAL_PLACEHOLDER, LEGAL_PLACEHOLDER_2 } from '../seed/legal'

// Nur Daten: Rechtstexte eintragen, solange auf den Seiten noch der Platzhalter steht.
// Bereits im Admin-Bereich bearbeitete Seiten bleiben unverändert.
const texts: Record<string, { title: string; content: unknown }> = {
  impressum: { title: 'Impressum', content: impressum },
  datenschutz: { title: 'Datenschutzerklärung', content: datenschutz },
  agb: { title: 'Allgemeine Geschäftsbedingungen', content: agb },
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  for (const [slug, data] of Object.entries(texts)) {
    const res = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 0, req })
    const page: any = res.docs[0]
    if (!page) {
      await payload.create({ collection: 'pages', data: { slug, ...data, showInquiry: false } as any, req })
      continue
    }
    const current = JSON.stringify(page.content || '')
    const untouched = !page.content || current.includes(LEGAL_PLACEHOLDER) || current.includes(LEGAL_PLACEHOLDER_2)
    if (untouched) await payload.update({ collection: 'pages', id: page.id, data: data as any, req })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Die Rechtstexte bleiben stehen.
}
