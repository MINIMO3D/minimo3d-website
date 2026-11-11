// Preisberechnung für den FDM-Preisrechner.
// Läuft im Browser (Sofortpreis) und auf dem Server (verbindlicher Preis für die Kasse) mit denselben Zahlen.

export type LayerId = 'fein' | 'standard' | 'grob'
export type InfillId = 'leicht' | 'standard' | 'stabil'
export type DeliveryId = 'abholung' | 'versand'

export const LAYERS: { id: LayerId; label: string; mm: number; hint: string }[] = [
  { id: 'fein', label: 'Fein', mm: 0.1, hint: 'Glatte Rundungen, längere Druckzeit' },
  { id: 'standard', label: 'Standard', mm: 0.2, hint: 'Guter Mittelweg für die meisten Teile' },
  { id: 'grob', label: 'Grob', mm: 0.3, hint: 'Schnell und günstig, sichtbare Schichten' },
]

export const INFILLS: { id: InfillId; label: string; range: string; fraction: number; hint: string }[] = [
  { id: 'leicht', label: 'Leicht', range: '5–20 %', fraction: 0.15, hint: 'Modelle und Passproben' },
  { id: 'standard', label: 'Standard', range: '25–45 %', fraction: 0.35, hint: 'Gehäuse, Halter, Alltagsteile' },
  { id: 'stabil', label: 'Stabil', range: '50–80 %', fraction: 0.65, hint: 'Belastete Funktionsteile' },
]

/** Einstellungen aus dem Admin-Bereich (Preisrechner). Netto-Sätze, sofern nicht anders genannt. */
export type CalcConfig = {
  vatPercent: number
  /** Auftragspauschale je Bestellung, brutto */
  orderFeeGross: number
  /** Maschinenstundensatz, netto */
  machineRate: number
  /** Mindestpreis für die Druckposition (alle Stück zusammen), netto */
  minPartNet: number
  discount5: number
  discount10: number
  discount25: number
  expressPercent: number
  expressMinGross: number
  shippingGross: number
  freeShippingFromGross: number
  /** Annahmen für Material und Zeit */
  wallMm: number
  lineWidthMm: number
  speedMmS: number
  secondsPerLayer: number
  buildX: number
  buildY: number
  buildZ: number
}

export const DEFAULT_CONFIG: CalcConfig = {
  vatPercent: 19,
  orderFeeGross: 6.55,
  machineRate: 1.25,
  minPartNet: 1.02,
  discount5: 12,
  discount10: 25,
  discount25: 30,
  expressPercent: 50,
  expressMinGross: 18,
  shippingGross: 4.9,
  freeShippingFromGross: 50,
  wallMm: 1.2,
  lineWidthMm: 0.45,
  speedMmS: 60,
  secondsPerLayer: 4,
  buildX: 350,
  buildY: 320,
  buildZ: 325,
}

export const mergeConfig = (stored: Partial<Record<keyof CalcConfig, unknown>> | null | undefined): CalcConfig => {
  const out = { ...DEFAULT_CONFIG }
  if (stored)
    for (const key of Object.keys(DEFAULT_CONFIG) as (keyof CalcConfig)[]) {
      const v = stored[key]
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[key] = v
    }
  return out
}

export type PriceMaterial = { density: number; pricePerKg: number; timeFactor: number; priceFactor?: number }
export type PriceGeometry = { volumeCm3: number; areaCm2: number; supportCm3: number; heightMm: number }

export type PriceInput = {
  geometry: PriceGeometry
  material: PriceMaterial
  layer: LayerId
  infill: InfillId
  quantity: number
  express: boolean
  delivery: DeliveryId
  /** individueller Kundenrabatt in Prozent (Geschäftskunden) */
  customerDiscountPercent?: number
}

export type PriceResult = {
  gramsPerPart: number
  hoursPerPart: number
  discountPercent: number
  customerDiscountPercent: number
  /** alle Beträge in Cent, brutto */
  unitCents: number
  partsCents: number
  feeCents: number
  expressCents: number
  shippingCents: number
  totalCents: number
  vatCents: number
  leadTime: string
}

const LEAD_STANDARD: [number, string][] = [[24, '3–5'], [60, '5–8'], [100, '8–12'], [200, '10–14'], [400, '12–18']]
const LEAD_EXPRESS: [number, string][] = [[24, '1–2'], [60, '2–4'], [100, '4–6'], [200, '5–7'], [400, '6–9']]

export const clampQuantity = (q: number) => Math.min(500, Math.max(1, Math.round(Number.isFinite(q) ? q : 1)))

export const calculatePrice = (input: PriceInput, cfg: CalcConfig): PriceResult => {
  const layer = LAYERS.find((l) => l.id === input.layer) || LAYERS[1]
  const infill = INFILLS.find((i) => i.id === input.infill) || INFILLS[1]
  const qty = clampQuantity(input.quantity)
  const g = input.geometry

  // Material: Außenhaut voll, Kern nach Füllgrad, dazu Stützen
  const shell = Math.min(g.volumeCm3, g.areaCm2 * (cfg.wallMm / 10))
  const printedCm3 = shell + Math.max(0, g.volumeCm3 - shell) * infill.fraction + g.supportCm3
  const grams = printedCm3 * input.material.density

  // Zeit: Materialdurchsatz der Düse plus fester Anteil je Schicht
  const flowCm3h = cfg.lineWidthMm * layer.mm * cfg.speedMmS * 3.6
  const layers = g.heightMm / layer.mm
  const hours = (printedCm3 / flowCm3h) * (input.material.timeFactor || 1) + (layers * cfg.secondsPerLayer) / 3600 + 0.05

  // Preisfaktor: Aufschlag für Materialien, die mehr Rüstaufwand, Trocknung und Ausschuss bedeuten
  const partNet = ((grams / 1000) * input.material.pricePerKg + hours * cfg.machineRate) * (input.material.priceFactor || 1)
  const discountPercent = qty >= 25 ? cfg.discount25 : qty >= 10 ? cfg.discount10 : qty >= 5 ? cfg.discount5 : 0
  const vat = 1 + cfg.vatPercent / 100

  // Der Mindestpreis gilt für die ganze Position, nicht je Stück
  const customerDiscountPercent = Math.min(50, Math.max(0, input.customerDiscountPercent || 0))
  const lineNet = Math.max(cfg.minPartNet, partNet * (1 - discountPercent / 100) * (1 - customerDiscountPercent / 100) * qty)
  const unitCents = Math.round((lineNet / qty) * vat * 100)
  const partsCents = unitCents * qty
  const feeCents = Math.round(cfg.orderFeeGross * 100)
  const goods = partsCents + feeCents
  const expressCents = input.express ? Math.max(Math.round(cfg.expressMinGross * 100), Math.round((goods * cfg.expressPercent) / 100)) : 0
  const shippingCents =
    input.delivery === 'versand' && goods + expressCents < Math.round(cfg.freeShippingFromGross * 100)
      ? Math.round(cfg.shippingGross * 100)
      : 0
  const totalCents = goods + expressCents + shippingCents
  const vatCents = Math.round(totalCents - totalCents / vat)

  const totalHours = hours * qty
  const table = input.express ? LEAD_EXPRESS : LEAD_STANDARD
  const tier = table.find(([limit]) => totalHours <= limit)
  const leadTime = tier ? `${tier[1]} Werktage` : 'nach Absprache'

  return { gramsPerPart: grams, hoursPerPart: hours, discountPercent, customerDiscountPercent, unitCents, partsCents, feeCents, expressCents, shippingCents, totalCents, vatCents, leadTime }
}

export const euro = (cents: number) => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

export const formatHours = (h: number) => {
  const total = Math.max(1, Math.round(h * 60))
  const hh = Math.floor(total / 60)
  const mm = total % 60
  return hh ? `${hh} h ${String(mm).padStart(2, '0')} min` : `${mm} min`
}

/** Nettobetrag zu einem Bruttobetrag in Cent. */
export const netCents = (grossCents: number, vatPercent: number) => Math.round(grossCents / (1 + vatPercent / 100))
