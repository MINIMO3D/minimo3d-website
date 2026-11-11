import { geometryOf, getCalcSetup, type CalcMaterial } from './calc-server'
import { discountOf, type Customer } from './customer'
import { fitsBuildVolume, type Metrics } from './mesh/analyze'
import { calculatePrice, clampQuantity, INFILLS, LAYERS, type CalcConfig, type DeliveryId, type InfillId, type LayerId, type PriceResult } from './pricing'

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
