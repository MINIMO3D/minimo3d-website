import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Benutzer', plural: 'Benutzer' },
  admin: { useAsTitle: 'email', group: 'Verwaltung' },
  auth: true,
  fields: [],
}
