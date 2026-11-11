import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Nur Daten: die Adressen der Social-Media-Profile berichtigen.
const correct: Record<string, string> = {
  LinkedIn: 'https://www.linkedin.com/company/minimo3d/',
  Instagram: 'https://www.instagram.com/_minimo3d_/',
  Facebook: 'https://www.facebook.com/minimo3d',
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const s: any = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
  if (!Array.isArray(s?.social) || !s.social.length) return
  const social = s.social.map((x: any) => (correct[x.label] ? { ...x, url: correct[x.label] } : x))
  await payload.updateGlobal({ slug: 'site-settings', data: { social } as any, req })
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Die berichtigten Adressen bleiben stehen.
}
