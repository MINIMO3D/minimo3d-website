import type { CollectionConfig } from 'payload'
import path from 'path'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Bild', plural: 'Bilder' },
  admin: { group: 'Inhalte' },
  access: { read: () => true },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Bildbeschreibung (Alt-Text)',
      required: true,
      admin: { description: 'Beschreibt das Bild für Suchmaschinen und Screenreader.' },
    },
  ],
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'card', width: 800 },
      { name: 'wide', width: 1600 },
    ],
  },
}
