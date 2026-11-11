import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { ratingKeys, ratingsFor } from '../seed/ratings'

// Nur Daten: Bewertungen für den Materialvergleich eintragen, wo noch keine stehen.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({ collection: 'materials', limit: 500, depth: 0, req })
  for (const m of docs as any[]) {
    const wanted = ratingsFor(m.name)
    if (!wanted) continue
    const ratings: Record<string, unknown> = { ...(m.ratings || {}) }
    let changed = false
    for (const key of ratingKeys) {
      if (typeof m.ratings?.[key]?.score === 'number') continue
      ratings[key] = { ...(m.ratings?.[key] || {}), score: wanted[key].score }
      changed = true
    }
    if (changed) await payload.update({ collection: 'materials', id: m.id, data: { ratings } as any, req })
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Bewertungen bleiben stehen.
}
