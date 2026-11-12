import { geometryOf, getCalcSetup, type CalcMaterial } from './calc-server'
import { discountOf, type Customer } from './customer'
import { fitsBuildVolume, type Metrics } from './mesh/analyze'
import { findQuote, mayUseQuote } from './calc-server'
import {
  calculateOrder,
  calculatePrice,
  clampQuantity,
  INFILLS,
  LAYERS,
  MAX_PARTS,
  type CalcConfig,
  type DeliveryId,
  type InfillId,
  type LayerId,
  type OrderLine,
  type OrderPrice,
  type PriceResult,
} from './pricing'

export type Selection = {
  material: CalcMaterial
  color: string
  layer: (typeof LAYERS)[number]
  infill: (typeof INFILLS)[number]
  quantity: number
  express: boolean
  delivery: DeliveryId
  price: PriceResult
  config: CalcConfig
  fits: boolean
}

/** Prüft die Auswahl aus dem Browser und rechnet den Preis auf dem Server neu. */
export const resolveSelection = async (quote: any, body: any, customer: Customer | null = null): Promise<Selection | { error: string }> => {
  const setup = await getCalcSetup()
  if (!setup.enabled) return { error: 'Der Preisrechner ist gerade nicht verfügbar.' }
  const material = setup.materials.find((m) => String(m.id) === String(body?.materialId))
  if (!material) return { error: 'Bitte wählen Sie ein Material.' }
  const layer = LAYERS.find((l) => l.id === (body?.layer as LayerId))
  const infill = INFILLS.find((i) => i.id === (body?.infill as InfillId))
  if (!layer || !infill) return { error: 'Bitte wählen Sie Schichthöhe und Füllung.' }
  const delivery: DeliveryId = body?.delivery === 'versand' ? 'versand' : 'abholung'
  const quantity = clampQuantity(Number(body?.quantity))
  const express = body?.express === true

  let color = typeof body?.color === 'string' ? body.color.trim().slice(0, 60) : ''
  if (material.colors.length) {
    const match = material.colors.find((c) => c.name === color)
    color = (match || material.colors[0]).name
  }

  const metrics = quote.metrics as Metrics
  const price = calculatePrice(
    { geometry: geometryOf(metrics), material, layer: layer.id, infill: infill.id, quantity, express, delivery, customerDiscountPercent: discountOf(customer) },
    setup.config,
  )
  const cfg = setup.config
  return {
    material,
    color,
    layer,
    infill,
    quantity,
    express,
    delivery,
    price,
    config: cfg,
    fits: fitsBuildVolume(metrics.size, { x: cfg.buildX, y: cfg.buildY, z: cfg.buildZ }),
  }
}

export type OrderItem = {
  quote: any
  material: CalcMaterial
  color: string
  layer: (typeof LAYERS)[number]
  infill: (typeof INFILLS)[number]
  quantity: number
  line: OrderLine
}
export type ResolvedOrder = { items: OrderItem[]; express: boolean; delivery: DeliveryId; price: OrderPrice; config: CalcConfig }

/** Prüft eine Bestellung mit einem oder mehreren Bauteilen und rechnet den Preis auf dem Server neu. */
export const resolveOrder = async (body: any, customer: Customer | null = null): Promise<ResolvedOrder | { error: string; status?: number }> => {
  const setup = await getCalcSetup()
  if (!setup.enabled) return { error: 'Der Preisrechner ist gerade nicht verfügbar.', status: 503 }
  const cfg = setup.config
  const raw: any[] = Array.isArray(body?.items) ? body.items : []
  if (!raw.length) return { error: 'Bitte laden Sie mindestens ein Bauteil hoch.' }
  if (raw.length > MAX_PARTS) return { error: `Je Bestellung sind höchstens ${MAX_PARTS} verschiedene Bauteile möglich. Für mehr senden Sie uns bitte eine Anfrage.` }
  if (new Set(raw.map((r) => String(r?.token))).size !== raw.length) return { error: 'Ein Bauteil ist doppelt in der Liste. Bitte erhöhen Sie stattdessen die Stückzahl.' }

  const delivery: DeliveryId = body?.delivery === 'versand' ? 'versand' : 'abholung'
  const express = body?.express === true
  const items: Omit<OrderItem, 'line'>[] = []
  for (const r of raw) {
    const quote = await findQuote(r?.token)
    if (!quote || !mayUseQuote(quote, customer))
      return { error: 'Eine Berechnung ist abgelaufen. Bitte laden Sie die Datei erneut hoch.', status: 404 }
    const material = setup.materials.find((m) => String(m.id) === String(r?.materialId))
    if (!material) return { error: `Bitte wählen Sie ein Material für „${quote.fileName}“.` }
    const layer = LAYERS.find((l) => l.id === (r?.layer as LayerId))
    const infill = INFILLS.find((i) => i.id === (r?.infill as InfillId))
    if (!layer || !infill) return { error: `Bitte wählen Sie Schichthöhe und Füllung für „${quote.fileName}“.` }
    if (!fitsBuildVolume((quote.metrics as Metrics).size, { x: cfg.buildX, y: cfg.buildY, z: cfg.buildZ }))
      return { error: `„${quote.fileName}“ ist größer als der Bauraum. Bitte entfernen Sie das Teil und senden Sie uns dafür eine Anfrage.` }
    let color = typeof r?.color === 'string' ? r.color.trim().slice(0, 60) : ''
    if (material.colors.length) color = (material.colors.find((c) => c.name === color) || material.colors[0]).name
    items.push({ quote, material, color, layer, infill, quantity: clampQuantity(Number(r?.quantity)) })
  }

  const price = calculateOrder(
    items.map((i) => ({ geometry: geometryOf(i.quote.metrics as Metrics), material: i.material, layer: i.layer.id, infill: i.infill.id, quantity: i.quantity })),
    { express, delivery, customerDiscountPercent: discountOf(customer) },
    cfg,
  )
  return { items: items.map((i, n) => ({ ...i, line: price.lines[n] })), express, delivery, price, config: cfg }
}
