import type { Field, GlobalConfig } from 'payload'

import { isLoggedIn } from '../collections/fields'
import { DEFAULT_CONFIG } from '../lib/pricing'

const n = (name: keyof typeof DEFAULT_CONFIG, label: string, description?: string): Field => ({
  name,
  type: 'number',
  label,
  min: 0,
  defaultValue: DEFAULT_CONFIG[name],
  admin: description ? { description } : undefined,
})

export const Calculator: GlobalConfig = {
  slug: 'calculator',
  label: 'Preise und Einstellungen',
  admin: { group: 'Preisrechner' },
  access: { read: () => true, update: isLoggedIn },
  fields: [
    { name: 'enabled', type: 'checkbox', label: 'Preisrechner anzeigen', defaultValue: true },
    {
      type: 'collapsible',
      label: 'Preise',
      fields: [
        n('orderFeeGross', 'Auftragspauschale je Bestellung (€, brutto)'),
        n('machineRate', 'Maschinenstundensatz (€, netto)'),
        n('minPartNet', 'Mindestpreis der Druckposition (€, netto)', 'Gilt für alle Stück einer Bestellung zusammen.'),
        n('vatPercent', 'Mehrwertsteuer (%)'),
        { type: 'row', fields: [n('discount5', 'Rabatt ab 5 Stück (%)'), n('discount10', 'Rabatt ab 10 Stück (%)'), n('discount25', 'Rabatt ab 25 Stück (%)')] },
        { type: 'row', fields: [n('expressPercent', 'Express-Aufschlag (%)'), n('expressMinGross', 'Express mindestens (€, brutto)')] },
        { type: 'row', fields: [n('shippingGross', 'Versand Deutschland (€, brutto)'), n('freeShippingFromGross', 'Versandkostenfrei ab (€, brutto)')] },
      ],
    },
    {
      type: 'collapsible',
      label: 'Annahmen für Material und Druckzeit',
      admin: { initCollapsed: true },
      fields: [
        n('wallMm', 'Wandstärke der Außenhaut (mm)'),
        n('lineWidthMm', 'Bahnbreite (mm)'),
        n('speedMmS', 'Mittlere Druckgeschwindigkeit (mm/s)'),
        n('secondsPerLayer', 'Zeitanteil je Schicht (s)'),
        { type: 'row', fields: [n('buildX', 'Bauraum X (mm)'), n('buildY', 'Bauraum Y (mm)'), n('buildZ', 'Bauraum Z (mm)')] },
      ],
    },
  ],
}
