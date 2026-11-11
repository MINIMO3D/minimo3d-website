import type { CollectionConfig } from 'payload'
import path from 'path'
import { isLoggedIn } from './fields'

const adminOnly = { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn }

/** Hochgeladene 3D-Dateien aus dem Preisrechner. Nur im Admin-Bereich abrufbar. */
export const QuoteFiles: CollectionConfig = {
  slug: 'quote-files',
  labels: { singular: '3D-Datei', plural: '3D-Dateien' },
  admin: { group: 'Preisrechner' },
  access: adminOnly,
  fields: [],
  upload: { staticDir: path.resolve(process.cwd(), 'quote-files') },
}

/** Ein geprüftes Modell mit Kennzahlen. Entsteht bei jedem Upload im Preisrechner. */
export const Quotes: CollectionConfig = {
  slug: 'quotes',
  labels: { singular: 'Berechnung', plural: 'Berechnungen' },
  admin: {
    useAsTitle: 'fileName',
    defaultColumns: ['fileName', 'ordered', 'createdAt'],
    group: 'Preisrechner',
    description: 'Berechnungen ohne Bestellung werden nach 7 Tagen samt Datei gelöscht.',
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  fields: [
    { name: 'token', type: 'text', required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: 'fileName', type: 'text', label: 'Dateiname', required: true },
    { name: 'file', type: 'relationship', relationTo: 'quote-files', label: 'Datei' },
    { name: 'ordered', type: 'checkbox', label: 'Bestellt', defaultValue: false },
    { name: 'metrics', type: 'json', label: 'Kennzahlen', admin: { readOnly: true } },
  ],
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Bestellung', plural: 'Bestellungen' },
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'status', 'customerName', 'total', 'createdAt'],
    group: 'Preisrechner',
  },
  access: adminOnly,
  defaultSort: '-createdAt',
  fields: [
    { name: 'orderNumber', type: 'text', label: 'Bestellnummer', required: true, unique: true, index: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'offen',
      options: [
        { label: 'Zahlung offen', value: 'offen' },
        { label: 'Bezahlt', value: 'bezahlt' },
        { label: 'In Fertigung', value: 'fertigung' },
        { label: 'Versendet / abholbereit', value: 'versendet' },
        { label: 'Storniert', value: 'storniert' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'paidAt', type: 'date', label: 'Bezahlt am', admin: { position: 'sidebar', readOnly: true } },
    { name: 'total', type: 'number', label: 'Gesamt (€, brutto)', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'customerName', type: 'text', label: 'Kunde' },
        { name: 'customerEmail', type: 'email', label: 'E-Mail' },
        { name: 'customerPhone', type: 'text', label: 'Telefon' },
      ],
    },
    { name: 'address', type: 'textarea', label: 'Liefer- oder Rechnungsadresse' },
    { name: 'fileName', type: 'text', label: 'Dateiname', admin: { readOnly: true } },
    { name: 'file', type: 'relationship', relationTo: 'quote-files', label: '3D-Datei' },
    {
      type: 'row',
      fields: [
        { name: 'materialName', type: 'text', label: 'Material', admin: { readOnly: true } },
        { name: 'color', type: 'text', label: 'Farbe' },
        { name: 'layer', type: 'text', label: 'Schichthöhe', admin: { readOnly: true } },
        { name: 'infill', type: 'text', label: 'Füllung', admin: { readOnly: true } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'quantity', type: 'number', label: 'Stückzahl', admin: { readOnly: true } },
        { name: 'express', type: 'checkbox', label: 'Express', admin: { readOnly: true } },
        { name: 'delivery', type: 'text', label: 'Lieferung', admin: { readOnly: true } },
        { name: 'leadTime', type: 'text', label: 'Lieferzeit', admin: { readOnly: true } },
      ],
    },
    { name: 'customerNote', type: 'textarea', label: 'Hinweis des Kunden', admin: { readOnly: true } },
    { name: 'breakdown', type: 'json', label: 'Preisaufstellung und Kennzahlen', admin: { readOnly: true } },
    { name: 'stripeSessionId', type: 'text', label: 'Stripe-Sitzung', index: true, admin: { readOnly: true } },
    { name: 'stripePaymentIntent', type: 'text', label: 'Stripe-Zahlung', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea', label: 'Interne Notizen' },
  ],
}
