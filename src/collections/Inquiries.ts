import type { CollectionConfig } from 'payload'
import path from 'path'
import { isLoggedIn } from './fields'

export const InquiryFiles: CollectionConfig = {
  slug: 'inquiry-files',
  labels: { singular: 'Anfrage-Datei', plural: 'Anfrage-Dateien' },
  admin: { group: 'Anfragen' },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  fields: [],
  upload: { staticDir: path.resolve(process.cwd(), 'inquiry-files') },
}

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Anfrage', plural: 'Anfragen' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'email', 'status', 'createdAt'], group: 'Anfragen' },
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'neu',
      options: [
        { label: 'Neu', value: 'neu' },
        { label: 'In Bearbeitung', value: 'bearbeitung' },
        { label: 'Erledigt', value: 'erledigt' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'email', type: 'email', label: 'E-Mail', required: true },
    { name: 'company', type: 'text', label: 'Firma' },
    { name: 'phone', type: 'text', label: 'Telefon' },
    { name: 'message', type: 'textarea', label: 'Nachricht', required: true },
    { name: 'files', type: 'relationship', relationTo: 'inquiry-files', hasMany: true, label: 'Dateien' },
    { name: 'consent', type: 'checkbox', label: 'Einwilligung Datenschutz', admin: { readOnly: true } },
    { name: 'notes', type: 'textarea', label: 'Interne Notizen' },
  ],
}
