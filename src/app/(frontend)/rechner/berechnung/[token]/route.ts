import { NextResponse } from 'next/server'

import { findQuote, getCalcSetup, mayUseQuote } from '@/lib/calc-server'
import { customerFromRequest } from '@/lib/customer'
import { dfmChecks, type Metrics } from '@/lib/mesh/analyze'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Eine gespeicherte Berechnung wieder öffnen, zum Beispiel beim Nachbestellen aus dem Kundenkonto. */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const quote = await findQuote(token)
  if (!quote || !mayUseQuote(quote, await customerFromRequest(req)))
    return NextResponse.json({ error: 'Diese Datei ist nicht mehr gespeichert. Bitte laden Sie sie erneut hoch.' }, { status: 404 })
  const { config: cfg } = await getCalcSetup()
  const metrics = quote.metrics as Metrics
  return NextResponse.json({
    token: quote.token,
    fileName: quote.fileName,
    metrics,
    checks: dfmChecks(metrics, { x: cfg.buildX, y: cfg.buildY, z: cfg.buildZ }),
  })
}
