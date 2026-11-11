import { NextResponse } from 'next/server'

import { findQuote, loadPreview, mayUseQuote } from '@/lib/calc-server'
import { customerFromRequest } from '@/lib/customer'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Dreiecke für die 3D-Ansicht: rohe Float32-Werte, neun je Dreieck, in Millimetern. */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const quote = await findQuote(token)
  if (!quote || !mayUseQuote(quote, await customerFromRequest(req))) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })
  try {
    const positions = await loadPreview(quote)
    if (!positions) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 })
    const body = Buffer.from(positions.buffer, positions.byteOffset, positions.byteLength)
    return new NextResponse(body, {
      headers: { 'Content-Type': 'application/octet-stream', 'Cache-Control': 'private, max-age=3600' },
    })
  } catch (err) {
    console.error('3D-Ansicht fehlgeschlagen', err)
    return NextResponse.json({ error: 'Die Ansicht konnte nicht erzeugt werden.' }, { status: 500 })
  }
}
