import type { Field } from 'payload'

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  label: 'URL-Name',
  required: true,
  unique: true,
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Teil der Adresse, z. B. "fdm-druck". Nur Kleinbuchstaben, Zahlen und Bindestriche.',
  },
}

export const faqField: Field = {
  name: 'faq',
  type: 'array',
  label: 'Häufige Fragen',
  labels: { singular: 'Frage', plural: 'Fragen' },
  fields: [
    { name: 'question', type: 'text', label: 'Frage', required: true },
    { name: 'answer', type: 'textarea', label: 'Antwort', required: true },
  ],
}

export const titleTextArray = (name: string, label: string, singular: string): Field => ({
  name,
  type: 'array',
  label,
  labels: { singular, plural: label },
  fields: [
    { name: 'title', type: 'text', label: 'Titel', required: true },
    { name: 'text', type: 'textarea', label: 'Text' },
  ],
})

/**
 * Nur Mitarbeiter (Sammlung "users") dürfen Inhalte ändern und interne Daten lesen.
 * Angemeldete Kunden (Sammlung "customers") zählen ausdrücklich nicht dazu.
 */
export const isAdminUser = (req: { user?: any }) => Boolean(req.user && req.user.collection === 'users')
export const isLoggedIn = ({ req }: { req: { user?: any } }) => isAdminUser(req)
export const isCustomer = (req: { user?: any }) => Boolean(req.user && req.user.collection === 'customers')
