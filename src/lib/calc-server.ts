import config from '@payload-config'
import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'

import { analyzeMesh, type Metrics } from './mesh/analyze'
import { parseModel, previewMesh } from './mesh/parse'
import { mergeConfig, type CalcConfig } from './pricing'

export type CalcMaterial = {
  id: number | string
  name: string
  slug: string
  family: string
  summary: string
  pricePerKg: number
  density: number
  timeFactor: number
  priceFactor: number
  colors: { name: string; hex?: string }[]
}

export const getCalcSetup = async (): Promise<{ enabled: boolean; config: CalcConfig; materials: CalcMaterial[] }> => {
  const payload = await getPayload({ config })
  const [global, mats] = await Promise.all([
    payload.findGlobal({ slug: 'calculator' }) as Promise<any>,
    payload.find({ collection: 'materials', where: { 'calc.enabled': { equals: true } }, sort: 'order', limit: 200, depth: 0 }),
  ])
  const materials = (mats.docs as any[])
    .filter((m) => m.calc?.pricePerKg > 0 && m.calc?.density > 0)
    .map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      family: m.family,
      summary: m.summary,
      pricePerKg: m.calc.pricePerKg,
      density: m.calc.density,
      timeFactor: m.calc.timeFactor > 0 ? m.calc.timeFactor : 1,
      priceFactor: m.calc.priceFactor > 0 ? m.calc.priceFactor : 1,
      colors: (m.calc.colors || []).map((c: any) => ({ name: c.name, hex: c.hex || undefined })),
    }))
  return { enabled: global?.enabled !== false, config: mergeConfig(global), materials }
}

export const geometryOf = (m: Metrics) => ({
  volumeCm3: m.volumeCm3,
  areaCm2: m.areaCm2,
  supportCm3: m.supportCm3,
  heightMm: m.size[2],
})

// ---- kleine Zwischenablage für die 3D-Ansicht, damit die Datei nicht doppelt gelesen wird ----
const previews = new Map<string, Float32Array>()
export const rememberPreview = (token: string, positions: Float32Array) => {
  previews.set(token, previewMesh(positions))
  while (previews.size > 6) previews.delete(previews.keys().next().value as string)
}

export const quoteFilePath = (filename: string) => path.resolve(process.cwd(), 'quote-files', path.basename(filename))

export const findQuote = async (token: unknown): Promise<any | null> => {
  if (typeof token !== 'string' || !/^[a-f0-9]{32}$/.test(token)) return null
  const payload = await getPayload({ config })
  const res = await payload.find({ collection: 'quotes', where: { token: { equals: token } }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
}

export const loadPreview = async (quote: any): Promise<Float32Array | null> => {
  const cached = previews.get(quote.token)
  if (cached) return cached
  const filename = typeof quote.file === 'object' ? quote.file?.filename : null
  if (!filename) return null
  const mesh = await parseModel(await fs.readFile(quoteFilePath(filename)), quote.fileName)
  rememberPreview(quote.token, mesh.positions)
  return previews.get(quote.token) || null
}

export const analyzeFile = async (buf: Buffer, name: string) => {
  const mesh = await parseModel(buf, name)
  return { mesh, metrics: analyzeMesh(mesh.positions) }
}

/** Berechnungen ohne Bestellung nach 7 Tagen samt Datei löschen. */
export const cleanupOldQuotes = async () => {
  try {
    const payload = await getPayload({ config })
    const before = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const old = await payload.find({
      collection: 'quotes',
      where: { and: [{ createdAt: { less_than: before } }, { ordered: { not_equals: true } }] },
      limit: 25,
      depth: 0,
    })
    for (const q of old.docs as any[]) {
      if (q.file) await payload.delete({ collection: 'quote-files', id: q.file }).catch(() => null)
      await payload.delete({ collection: 'quotes', id: q.id }).catch(() => null)
    }
  } catch (err) {
    console.error('Aufräumen alter Berechnungen fehlgeschlagen', err)
  }
}

export const siteOrigin = (req: Request) => {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '')
  const proto = req.headers.get('x-forwarded-proto') || new URL(req.url).protocol.replace(':', '')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host
  return `${proto}://${host}`
}
