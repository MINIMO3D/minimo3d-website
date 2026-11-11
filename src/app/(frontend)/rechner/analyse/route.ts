import config from '@payload-config'
import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { analyzeFile, cleanupOldQuotes, getCalcSetup, rememberPreview } from '@/lib/calc-server'
import { dfmChecks } from '@/lib/mesh/analyze'
import { isModelFile, ModelError } from '@/lib/mesh/parse'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 120

const MAX_SIZE = 50 * 1024 * 1024
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })

// Einfache Bremse gegen Missbrauch: höchstens 20 Dateien in 10 Minuten je Besucher.
const WINDOW_MS = 10 * 60 * 1000
const LIMIT = 20
const hits = new Map<string, number[]>()
const tooMany = (req: Request) => {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unbekannt'
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > LIMIT
}

export async function POST(req: Request) {
  if (tooMany(req)) return bad('Zu viele Dateien in kurzer Zeit. Bitte versuchen Sie es in ein paar Minuten erneut.', 429)
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return bad('Die Datei konnte nicht gelesen werden.')
  }
  const file = form.get('file')
  if (!(file instanceof File) || file.size === 0) return bad('Bitte wählen Sie eine Datei aus.')
  if (file.size > MAX_SIZE) return bad('Die Datei ist größer als 50 MB. Bitte senden Sie sie als Anfrage.')
  if (!isModelFile(file.name)) return bad('Möglich sind STL, STEP (STP), OBJ und 3MF.')

  const setup = await getCalcSetup()
  if (!setup.enabled) return bad('Der Preisrechner ist gerade nicht verfügbar.', 503)

  const buf = Buffer.from(await file.arrayBuffer())
  let analysis
  try {
    analysis = await analyzeFile(buf, file.name)
  } catch (err) {
    if (err instanceof ModelError) return bad(err.message, 422)
    console.error('Analyse fehlgeschlagen', err)
    return bad('Die Datei konnte nicht ausgewertet werden. Bitte senden Sie sie als Anfrage.', 422)
  }
  const { mesh, metrics } = analysis
  if (!(metrics.volumeCm3 > 0)) return bad('Das Modell hat kein Volumen. Bitte prüfen Sie die Datei.', 422)

  try {
    const payload = await getPayload({ config })
    const token = randomBytes(16).toString('hex')
    const stored = await payload.create({
      collection: 'quote-files',
      data: {},
      file: { data: buf, mimetype: 'application/octet-stream', name: file.name, size: file.size },
    })
    await payload.create({
      collection: 'quotes',
      data: { token, fileName: file.name.slice(0, 200), file: stored.id, metrics, ordered: false } as any,
    })
    rememberPreview(token, mesh.positions)
    void cleanupOldQuotes()
    const { config: cfg } = setup
    return NextResponse.json({
      token,
      fileName: file.name,
      metrics,
      checks: dfmChecks(metrics, { x: cfg.buildX, y: cfg.buildY, z: cfg.buildZ }),
    })
  } catch (err) {
    console.error('Berechnung konnte nicht gespeichert werden', err)
    return bad('Die Berechnung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.', 500)
  }
}
