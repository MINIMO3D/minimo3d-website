import type { Payload } from 'payload'

import { articles, homepage, pages, services, settings } from './content'
import { materials } from './materials'

/**
 * Befüllt eine leere Datenbank einmalig mit den Inhalten der bisherigen Website.
 * Läuft beim Start; sobald Leistungen vorhanden sind, passiert nichts mehr.
 */
export const seed = async (payload: Payload): Promise<void> => {
  try {
    const existing = await payload.count({ collection: 'services' })
    if (existing.totalDocs > 0) return

    payload.logger.info('Leere Datenbank: Inhalte werden angelegt …')

    await payload.updateGlobal({ slug: 'site-settings', data: settings as any })
    await payload.updateGlobal({ slug: 'homepage', data: homepage as any })

    for (const data of services) await payload.create({ collection: 'services', data: data as any })
    for (const data of materials) await payload.create({ collection: 'materials', data: data as any })
    for (const data of pages) await payload.create({ collection: 'pages', data: data as any })
    for (const data of articles) await payload.create({ collection: 'articles', data: data as any })

    payload.logger.info('Inhalte angelegt.')
  } catch (err) {
    payload.logger.error({ err }, 'Inhalte konnten nicht angelegt werden')
  }
}
