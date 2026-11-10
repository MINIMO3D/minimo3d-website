import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_TOTAL = 50 * 1024 * 1024
const MAX_FILES = 5
const ALLOWED = ['stl', 'step', 'stp', '3mf', 'obj', 'pdf', 'jpg', 'jpeg', 'png', 'webp']

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })
const str = (v: FormDataEntryValue | null, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return bad('Die Anfrage konnte nicht gelesen werden.')
  }

  // Honeypot: Bots füllen das versteckte Feld aus. Wir tun so, als wäre alles gut.
  if (str(form.get('website'), 200)) return NextResponse.json({ ok: true })

  const name = str(form.get('name'), 120)
  const email = str(form.get('email'), 200)
  const company = str(form.get('company'), 160)
  const message = str(form.get('message'), 5000)
  const consent = form.get('consent') === 'ja'

  if (!name || !message) return bad('Bitte füllen Sie Name und Nachricht aus.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Bitte geben Sie eine gültige E-Mail-Adresse an.')
  if (!consent) return bad('Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu.')

  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)
  if (files.length > MAX_FILES) return bad(`Bitte höchstens ${MAX_FILES} Dateien senden.`)
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL) return bad('Die Dateien sind zusammen größer als 50 MB.')
  for (const f of files) {
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED.includes(ext)) return bad(`Der Dateityp ".${ext}" wird nicht angenommen.`)
  }

  try {
    const payload = await getPayload({ config })
    const fileIds: (number | string)[] = []
    for (const f of files) {
      const doc = await payload.create({
        collection: 'inquiry-files',
        data: {},
        file: {
          data: Buffer.from(await f.arrayBuffer()),
          mimetype: f.type || 'application/octet-stream',
          name: f.name,
          size: f.size,
        },
      })
      fileIds.push(doc.id)
    }
    await payload.create({
      collection: 'inquiries',
      data: { name, email, company, message, consent, files: fileIds, status: 'neu' } as any,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Anfrage fehlgeschlagen', err)
    return bad('Die Anfrage konnte nicht gespeichert werden. Bitte schreiben Sie uns eine E-Mail.', 500)
  }
}
