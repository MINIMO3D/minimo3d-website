import type { CollectionConfig } from 'payload'

import { isLoggedIn } from './fields'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Benutzer', plural: 'Benutzer' },
  admin: { useAsTitle: 'email', group: 'Verwaltung' },
  auth: true,
  access: { read: isLoggedIn, create: isLoggedIn, update: isLoggedIn, delete: isLoggedIn, admin: isLoggedIn },
  fields: [],
}
