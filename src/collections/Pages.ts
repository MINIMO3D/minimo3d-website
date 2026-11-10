import type { CollectionConfig } from 'payload'
import { faqField, isLoggedIn, slugField } from './fields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Seite', plural: 'Seiten' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug'], group: 'Inhalte' },
  access: { read: () => true, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [
    { name: 'title', type: 'text', label: 'Titel', required: true },
    slugField,
    { name: 'eyebrow', type: 'text', label: 'Kleine Zeile über dem Titel' },
    { name: 'intro', type: 'textarea', label: 'Einleitung' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild' },
    { name: 'content', type: 'richText', label: 'Inhalt' },
    faqField,
    { name: 'showInquiry', type: 'checkbox', label: 'Anfrage-Hinweis am Seitenende zeigen', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
