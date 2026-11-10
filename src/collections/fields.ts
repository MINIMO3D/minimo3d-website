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

export const isLoggedIn = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)
