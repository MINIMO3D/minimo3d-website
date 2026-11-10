import type { CollectionConfig } from 'payload'
import { isLoggedIn, slugField } from './fields'

export const articleCategories = [
  { label: 'FDM 3D-Druck', value: 'fdm' },
  { label: 'SLA 3D-Druck', value: 'sla' },
  { label: '3D-Scannen', value: '3d-scannen' },
  { label: 'Allgemein', value: 'allgemein' },
]

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Wissensartikel', plural: 'Wissen' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'updated'], group: 'Inhalte' },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', label: 'Titel', required: true },
    slugField,
    { name: 'order', type: 'number', label: 'Reihenfolge', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'category', type: 'select', label: 'Bereich', required: true, options: articleCategories, admin: { position: 'sidebar' } },
    { name: 'author', type: 'text', label: 'Autor', admin: { position: 'sidebar' } },
    { name: 'updated', type: 'date', label: 'Stand', admin: { position: 'sidebar', date: { displayFormat: 'dd.MM.yyyy' } } },
    { name: 'readingTime', type: 'number', label: 'Lesezeit (Minuten)', admin: { position: 'sidebar' } },
    { name: 'summary', type: 'textarea', label: 'Kurztext', required: true },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild' },
    { name: 'content', type: 'richText', label: 'Inhalt' },
  ],
}
