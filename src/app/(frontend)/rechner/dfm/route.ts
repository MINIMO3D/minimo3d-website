import { NextResponse } from 'next/server'

import { resolveSelection } from '@/lib/calc-selection'
import { findQuote, mayUseQuote } from '@/lib/calc-server'
import { customerFromRequest } from '@/lib/customer'
import { getSettings } from '@/lib/data'
import { buildDfmPdf } from '@/lib/dfm-pdf'
import { dfmChecks, type Metrics } from '@/lib/mesh/analyze'
import { euro, formatHours } from '@/lib/pricing'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })
const comma = (n: number, d = 1) => n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const quote = await findQuote(body?.token)
  const customer = await customerFromRequest(req)
  if (!quote || !mayUseQuote(quote, customer)) return bad('Die Berechnung ist abgelaufen. Bitte laden Sie die Datei erneut hoch.', 404)
  const sel = await resolveSelection(quote, body, customer)
  if ('error' in sel) return bad(sel.error)

  let snapshot: Uint8Array | null = null
  let snapshotType: 'png' | 'jpg' = 'jpg'
  const m = typeof body.snapshot === 'string' ? /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(body.snapshot) : null
  if (m && m[2].length < 3_000_000) {
    snapshot = new Uint8Array(Buffer.from(m[2], 'base64'))
    snapshotType = m[1] === 'png' ? 'png' : 'jpg'
  }

  const metrics = quote.metrics as Metrics
  const cfg = sel.config
  const s = await getSettings()
  const p = sel.price
  const pdf = await buildDfmPdf({
    fileName: quote.fileName,
    metrics,
    checks: dfmChecks(metrics, { x: cfg.buildX, y: cfg.buildY, z: cfg.buildZ }),
    snapshot,
    snapshotType,
    company: { name: s.company, street: s.street, city: s.city, phone: s.phone, email: s.email },
    config: [
      { label: 'Verfahren', value: 'FDM 3D-Druck' },
      { label: 'Material', value: sel.material.name },
      ...(sel.color ? [{ label: 'Farbe', value: sel.color }] : []),
      { label: 'Schichthöhe', value: `${sel.layer.label} (${comma(sel.layer.mm)} mm)` },
      { label: 'Füllung', value: `${sel.infill.label} (${sel.infill.range})` },
      { label: 'Stückzahl', value: String(sel.quantity) },
      { label: 'Gewicht je Stück (geschätzt)', value: `${comma(p.gramsPerPart, 0)} g` },
      { label: 'Druckzeit je Stück (geschätzt)', value: formatHours(p.hoursPerPart) },
    ],
    price: sel.fits
      ? [
          { label: 'Preis je Stück', value: euro(p.unitCents) },
          ...(p.discountPercent ? [{ label: 'Mengenrabatt', value: `${comma(p.discountPercent, 0)} %, im Stückpreis enthalten` }] : []),
          ...(p.customerDiscountPercent ? [{ label: 'Ihr Kundenrabatt', value: `${comma(p.customerDiscountPercent, 0)} %, im Stückpreis enthalten` }] : []),
          { label: 'Auftragspauschale', value: euro(p.feeCents) },
          ...(p.expressCents ? [{ label: 'Express', value: euro(p.expressCents) }] : []),
          { label: sel.delivery === 'versand' ? 'DHL-Versand' : 'Abholung', value: euro(p.shippingCents) },
          { label: 'Gesamt inkl. 19 % MwSt.', value: euro(p.totalCents) },
          { label: 'Lieferzeit', value: `${p.leadTime} nach Zahlungseingang` },
        ]
      : [{ label: 'Preis', value: 'auf Anfrage (größer als der Bauraum)' }],
  })

  const base = quote.fileName.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 60) || 'Bauteil'
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="DFM-Analyse_${base}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
