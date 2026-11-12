// Positionen einer Bestellung einheitlich lesen: neue Bestellungen haben eine Liste von Bauteilen,
// ältere genau ein Bauteil in den Feldern der Bestellung selbst.

export type OrderItemView = {
  fileName: string
  materialName: string
  color: string
  layer: string
  infill: string
  quantity: number
  /** brutto, in Cent */
  unitCents: number
  partsCents: number
  discountPercent: number
  // zum Nachbestellen
  token?: string
  materialId?: string
  layerId?: string
  infillId?: string
}

export const orderItems = (o: any): OrderItemView[] => {
  const b = o?.breakdown || {}
  if (Array.isArray(o?.items) && o.items.length)
    return o.items.map((it: any, n: number): OrderItemView => {
      const extra = Array.isArray(b.items) ? b.items[n] || {} : {}
      return {
        fileName: it.fileName || '',
        materialName: it.materialName || '',
        color: it.color || '',
        layer: it.layer || '',
        infill: it.infill || '',
        quantity: it.quantity || 1,
        unitCents: Math.round((it.unitPrice || 0) * 100),
        partsCents: Math.round((it.lineTotal || 0) * 100),
        discountPercent: extra.discountPercent || 0,
        token: extra.token,
        materialId: extra.materialId != null ? String(extra.materialId) : undefined,
        layerId: extra.layerId,
        infillId: extra.infillId,
      }
    })
  const p = b.price || {}
  return [
    {
      fileName: o?.fileName || '',
      materialName: o?.materialName || '',
      color: o?.color || '',
      layer: o?.layer || '',
      infill: o?.infill || '',
      quantity: o?.quantity || 1,
      unitCents: p.unitCents || 0,
      partsCents: p.partsCents || 0,
      discountPercent: p.discountPercent || 0,
      token: b.token,
      materialId: b.materialId != null ? String(b.materialId) : undefined,
      layerId: b.layerId,
      infillId: b.infillId,
    },
  ]
}

/** Kurztext für Listen: „3 × halter.stl“ oder „3 Bauteile: a.stl, b.stl, c.stl“. */
export const orderSummary = (o: any) => {
  const items = orderItems(o)
  if (items.length === 1) return `${items[0].quantity} × ${items[0].fileName}`
  const names = items.map((i) => i.fileName).join(', ')
  return `${items.length} Bauteile: ${names.length > 90 ? `${names.slice(0, 88)} …` : names}`
}
