import fs from 'fs/promises'
import path from 'path'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

import type { Check, Metrics } from './mesh/analyze'

export type DfmPdfInput = {
  fileName: string
  metrics: Metrics
  checks: Check[]
  config: { label: string; value: string }[]
  price?: { label: string; value: string }[]
  snapshot?: Uint8Array | null
  snapshotType?: 'png' | 'jpg'
  company: { name: string; street?: string; city?: string; phone?: string; email?: string }
}

const BLUE = rgb(0x21 / 255, 0x63 / 255, 0xb5 / 255)
const INK = rgb(0x0e / 255, 0x17 / 255, 0x26 / 255)
const TEXT = rgb(0x3d / 255, 0x49 / 255, 0x63 / 255)
const MUTED = rgb(0x55 / 255, 0x60 / 255, 0x7a / 255)
const LINE = rgb(0xd9 / 255, 0xde / 255, 0xe7 / 255)
const STATUS = {
  ok: { color: rgb(0.09, 0.5, 0.24), label: 'In Ordnung' },
  info: { color: BLUE, label: 'Hinweis' },
  warn: { color: rgb(0.76, 0.45, 0.02), label: 'Prüfen' },
  fail: { color: rgb(0.72, 0.11, 0.11), label: 'Kritisch' },
} as const

// Die eingebauten PDF-Schriften kennen nur WinAnsi. Alles andere wird ersetzt.
const WIN_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'
const clean = (s: string) =>
  String(s)
    .replace(/[−]/g, '-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/[^\x20-\x7e\xa0-\xff]/g, (ch) => (WIN_EXTRA.includes(ch) ? ch : '?'))

const wrap = (text: string, font: PDFFont, size: number, width: number) => {
  const lines: string[] = []
  let line = ''
  for (const word of clean(text).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(next, size) <= width || !line) line = next
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

const num = (v: number, d = 1) => v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })

export const buildDfmPdf = async (input: DfmPdfInput): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create()
  pdf.setTitle(clean(`DFM-Analyse ${input.fileName}`))
  pdf.setAuthor(clean(input.company.name))
  const regular = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let logo: Awaited<ReturnType<typeof pdf.embedPng>> | null = null
  try {
    logo = await pdf.embedPng(await fs.readFile(path.resolve(process.cwd(), 'seed-assets', 'logo-pdf.png')))
  } catch {
    logo = null
  }

  const W = 595.28
  const H = 841.89
  const M = 48
  const CW = W - 2 * M
  let page!: PDFPage
  let y = 0
  const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })

  const footer = () => {
    const c = input.company
    const line = clean([c.name, c.street, c.city, c.phone, c.email].filter(Boolean).join('  ·  '))
    page.drawLine({ start: { x: M, y: 44 }, end: { x: W - M, y: 44 }, thickness: 0.5, color: LINE })
    page.drawText(line, { x: M, y: 30, size: 7.5, font: regular, color: MUTED })
  }
  const newPage = () => {
    page = pdf.addPage([W, H])
    y = H - M
    if (logo) {
      const h = 26
      const w = (logo.width / logo.height) * h
      page.drawImage(logo, { x: M, y: y - h, width: w, height: h })
    } else page.drawText(clean(input.company.name), { x: M, y: y - 20, size: 18, font: bold, color: BLUE })
    const right = clean(`DFM-Analyse  ·  ${date}`)
    page.drawText(right, { x: W - M - regular.widthOfTextAtSize(right, 9), y: y - 16, size: 9, font: regular, color: MUTED })
    y -= 44
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.5, color: INK })
    y -= 26
    footer()
  }
  const need = (h: number) => {
    if (y - h < 64) newPage()
  }
  const heading = (t: string) => {
    need(40)
    page.drawText(clean(t), { x: M, y, size: 13, font: bold, color: INK })
    y -= 10
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.5, color: LINE })
    y -= 16
  }
  const rows = (items: { label: string; value: string }[], x: number, width: number, startY: number) => {
    let yy = startY
    for (const r of items) {
      page.drawText(clean(r.label), { x, y: yy, size: 9, font: regular, color: MUTED })
      const lines = wrap(r.value, bold, 9, width * 0.58)
      lines.forEach((l, i) => page.drawText(l, { x: x + width * 0.42, y: yy - i * 12, size: 9, font: bold, color: INK }))
      yy -= Math.max(1, lines.length) * 12 + 5
    }
    return yy
  }

  newPage()

  // Titel
  page.drawText('Fertigungsanalyse (DFM)', { x: M, y, size: 22, font: bold, color: INK })
  y -= 20
  wrap(input.fileName, regular, 11, CW).slice(0, 2).forEach((l) => {
    page.drawText(l, { x: M, y, size: 11, font: regular, color: TEXT })
    y -= 14
  })
  y -= 8

  // Ergebnis in einem Satz
  const fails = input.checks.filter((c) => c.status === 'fail').length
  const warns = input.checks.filter((c) => c.status === 'warn').length
  const verdict = fails
    ? { s: STATUS.fail, t: `${fails} kritische${fails === 1 ? 'r' : ''} Punkt${fails === 1 ? '' : 'e'}: Bitte vor dem Druck klären.` }
    : warns
      ? { s: STATUS.warn, t: `Druckbar, ${warns} Punkt${warns === 1 ? '' : 'e'} sollten Sie prüfen.` }
      : { s: STATUS.ok, t: 'Das Teil ist ohne Einschränkungen druckbar.' }
  page.drawRectangle({ x: M, y: y - 30, width: CW, height: 34, color: rgb(0.965, 0.969, 0.976) })
  page.drawRectangle({ x: M, y: y - 30, width: 4, height: 34, color: verdict.s.color })
  page.drawText(clean(verdict.t), { x: M + 16, y: y - 18, size: 11, font: bold, color: INK })
  y -= 50

  // Bild links, Kennzahlen rechts
  const m = input.metrics
  const facts = [
    { label: 'Abmessungen', value: `${num(m.size[0])} × ${num(m.size[1])} × ${num(m.size[2])} mm` },
    { label: 'Volumen', value: `${num(m.volumeCm3, 2)} cm³` },
    { label: 'Oberfläche', value: `${num(m.areaCm2)} cm²` },
    { label: 'Dreiecke', value: m.triangles.toLocaleString('de-DE') },
    { label: 'Überhang über 45°', value: `${num(m.overhangCm2)} cm²` },
    { label: 'Stützmaterial (geschätzt)', value: `${num(m.supportCm3, 2)} cm³` },
    { label: 'Auflagefläche', value: `${num(m.contactCm2)} cm²` },
    ...(m.wall ? [{ label: 'Wandstärke (typisch)', value: `${num(m.wall.median, 2)} mm` }] : []),
  ]
  const top = y
  let imgBottom = y
  if (input.snapshot) {
    try {
      const img = input.snapshotType === 'png' ? await pdf.embedPng(input.snapshot) : await pdf.embedJpg(input.snapshot)
      const boxW = CW * 0.46
      const boxH = 170
      const scale = Math.min(boxW / img.width, boxH / img.height)
      const w = img.width * scale
      const h = img.height * scale
      page.drawRectangle({ x: M, y: top - boxH, width: boxW, height: boxH, borderColor: LINE, borderWidth: 0.75, color: rgb(1, 1, 1) })
      page.drawImage(img, { x: M + (boxW - w) / 2, y: top - boxH + (boxH - h) / 2, width: w, height: h })
      imgBottom = top - boxH
    } catch {
      imgBottom = top
    }
  }
  const hasImg = imgBottom !== top
  const factsBottom = rows(facts, hasImg ? M + CW * 0.5 : M, hasImg ? CW * 0.5 : CW, top - 8)
  y = Math.min(imgBottom, factsBottom) - 22

  // Befunde
  heading('Prüfergebnisse')
  for (const c of input.checks) {
    const st = STATUS[c.status]
    const textLines = wrap(c.text, regular, 9, CW - 110)
    const h = 16 + textLines.length * 12 + 10
    need(h)
    page.drawCircle({ x: M + 5, y: y - 3, size: 4, color: st.color })
    page.drawText(clean(st.label), { x: M + 16, y: y - 6, size: 8.5, font: bold, color: st.color })
    page.drawText(clean(c.title), { x: M + 110, y: y - 6, size: 10, font: bold, color: INK })
    const val = clean(c.value)
    const titleW = bold.widthOfTextAtSize(clean(c.title), 10)
    if (font_fits(regular, val, 9, CW - 110 - titleW - 14))
      page.drawText(val, { x: W - M - regular.widthOfTextAtSize(val, 9), y: y - 6, size: 9, font: regular, color: MUTED })
    let yy = y - 20
    for (const l of textLines) {
      page.drawText(l, { x: M + 110, y: yy, size: 9, font: regular, color: TEXT })
      yy -= 12
    }
    y = yy - 6
    page.drawLine({ start: { x: M, y: y + 4 }, end: { x: W - M, y: y + 4 }, thickness: 0.5, color: LINE })
    y -= 8
  }

  // Gewählte Ausführung und Preis
  y -= 8
  const colH = Math.max(input.config.length, input.price?.length || 0) * 17 + 50
  need(colH)
  heading(input.price?.length ? 'Gewählte Ausführung und Preis' : 'Gewählte Ausführung')
  const startY = y
  const a = rows(input.config, M, input.price?.length ? CW * 0.48 : CW, startY)
  const b = input.price?.length ? rows(input.price, M + CW * 0.52, CW * 0.48, startY) : startY
  y = Math.min(a, b) - 10

  // Hinweis
  const note =
    'Diese Analyse wurde automatisch aus der hochgeladenen Datei erstellt und bezieht sich auf die gelieferte Lage des Modells. ' +
    'Wandstärken und Stützmaterial sind Näherungen aus Stichproben. Vor dem Druck prüfen wir jede Datei von Hand, wählen die Drucklage und melden uns, falls etwas angepasst werden sollte. ' +
    'Der genannte Preis gilt für die gewählte Ausführung zum Zeitpunkt der Erstellung.'
  const noteLines = wrap(note, regular, 8, CW)
  need(noteLines.length * 10 + 10)
  for (const l of noteLines) {
    page.drawText(l, { x: M, y, size: 8, font: regular, color: MUTED })
    y -= 10
  }

  return pdf.save()
}

const font_fits = (font: PDFFont, text: string, size: number, width: number) => font.widthOfTextAtSize(text, size) <= width
