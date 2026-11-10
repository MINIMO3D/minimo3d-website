import type { CollectionConfig, Field } from 'payload'
import { isLoggedIn, slugField } from './fields'

const rating = (name: string, label: string): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    { name: 'score', type: 'number', label: 'Wert (1–5)', min: 1, max: 5 },
    { name: 'note', type: 'text', label: 'Kurzer Kommentar' },
  ],
})

export const Materials: CollectionConfig = {
  slug: 'materials',
  labels: { singular: 'Material', plural: 'Materialien' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'family', 'category', 'process', 'featured'], group: 'Inhalte' },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    slugField,
    { name: 'order', type: 'number', label: 'Reihenfolge', defaultValue: 100, admin: { position: 'sidebar' } },
    { name: 'featured', type: 'checkbox', label: 'Als Einstieg hervorheben', defaultValue: false, admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        {
          name: 'family',
          type: 'select',
          label: 'Werkstofffamilie',
          required: true,
          options: ['PLA', 'PETG', 'ABS / ASA', 'PC', 'PP', 'Nylon (PA)', 'Faserverstärkt', 'TPU (flexibel)', 'Harz (SLA)'],
        },
        {
          name: 'category',
          type: 'select',
          label: 'Kategorie',
          required: true,
          options: ['Standard', 'Technisch', 'Faserverstärkt', 'Flexibel'],
        },
        { name: 'process', type: 'select', label: 'Verfahren', required: true, defaultValue: 'FDM', options: ['FDM', 'SLA'] },
      ],
    },
    { name: 'keywords', type: 'text', label: 'Stichworte', admin: { description: 'Zwei, drei Eigenschaften, z. B. "Zäh, abriebfest".' } },
    { name: 'summary', type: 'textarea', label: 'Wofür (ein Satz)', required: true },
    { name: 'headline', type: 'text', label: 'Überschrift der Seite' },
    { name: 'description', type: 'textarea', label: 'Beschreibung' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild' },
    {
      name: 'ratings',
      type: 'group',
      label: 'Eigenschaften im Überblick',
      fields: [
        rating('printability', 'Druckbarkeit'),
        rating('stiffness', 'Steifigkeit'),
        rating('toughness', 'Zähigkeit'),
        rating('heat', 'Hitzebeständigkeit'),
        rating('outdoor', 'Außentauglichkeit'),
      ],
    },
    {
      name: 'specs',
      type: 'array',
      label: 'Kennwerte',
      labels: { singular: 'Kennwert', plural: 'Kennwerte' },
      fields: [
        { name: 'label', type: 'text', label: 'Eigenschaft', required: true },
        { name: 'value', type: 'text', label: 'Wert', required: true },
      ],
    },
    { name: 'specSource', type: 'textarea', label: 'Quelle und Hinweis zu den Kennwerten' },
    {
      name: 'goodFor',
      type: 'array',
      label: 'Geeignet für',
      labels: { singular: 'Einsatz', plural: 'Einsätze' },
      fields: [{ name: 'text', type: 'text', label: 'Einsatz', required: true }],
    },
    {
      name: 'notFor',
      type: 'array',
      label: 'Nicht geeignet für',
      labels: { singular: 'Einsatz', plural: 'Einsätze' },
      fields: [{ name: 'text', type: 'text', label: 'Einsatz', required: true }],
    },
  ],
}
