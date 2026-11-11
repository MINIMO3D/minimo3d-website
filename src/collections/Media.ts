import type { CollectionConfig } from 'payload'
import path from 'path'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Bild oder Video', plural: 'Bilder und Videos' },
  admin: { group: 'Inhalte' },
  access: { read: () => true },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Beschreibung (Alt-Text)',
      required: true,
      admin: { description: 'Beschreibt das Bild oder Video für Suchmaschinen und Screenreader.' },
    },
  ],
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    imageSizes: [
      { name: 'card', width: 800 },
      { name: 'wide', width: 1600 },
    ],
  },
}
