import type { CollectionConfig } from 'payload'
import { faqField, isLoggedIn, slugField, titleTextArray } from './fields'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Leistung', plural: 'Leistungen' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'order'], group: 'Inhalte' },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', label: 'Name', required: true },
    slugField,
    { name: 'order', type: 'number', label: 'Reihenfolge', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'spec', type: 'text', label: 'Kennzahl (kurz)', admin: { description: 'Erscheint auf der Karte, z. B. "bis 350 × 320 mm".' } },
    { name: 'summary', type: 'textarea', label: 'Kurztext für Übersichten', required: true },
    { name: 'headline', type: 'text', label: 'Überschrift der Seite' },
    { name: 'intro', type: 'textarea', label: 'Einleitung' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild' },
    titleTextArray('useCases', 'Typische Ausgangspunkte', 'Ausgangspunkt'),
    {
      name: 'features',
      type: 'array',
      label: 'Merkmale',
      labels: { singular: 'Merkmal', plural: 'Merkmale' },
      fields: [{ name: 'text', type: 'text', label: 'Merkmal', required: true }],
    },
    {
      name: 'specs',
      type: 'array',
      label: 'Technische Daten',
      labels: { singular: 'Zeile', plural: 'Zeilen' },
      fields: [
        { name: 'label', type: 'text', label: 'Merkmal', required: true },
        { name: 'value', type: 'text', label: 'Angabe', required: true },
      ],
    },
    { name: 'noteTitle', type: 'text', label: 'Hinweis: Überschrift' },
    { name: 'noteText', type: 'textarea', label: 'Hinweis: Text' },
    { name: 'stepsTitle', type: 'text', label: 'Ablauf: Überschrift' },
    titleTextArray('steps', 'Ablauf', 'Schritt'),
    faqField,
  ],
}
