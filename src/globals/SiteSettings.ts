import type { GlobalConfig } from 'payload'
import { isLoggedIn } from '../collections/fields'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Firmendaten',
  admin: { group: 'Verwaltung' },
  access: { read: () => true, update: isLoggedIn },
  fields: [
    { name: 'company', type: 'text', label: 'Firmenname', required: true },
    { name: 'owner', type: 'text', label: 'Inhaber' },
    { name: 'street', type: 'text', label: 'Straße und Hausnummer' },
    { name: 'city', type: 'text', label: 'PLZ und Ort' },
    { name: 'phone', type: 'text', label: 'Telefon' },
    { name: 'email', type: 'email', label: 'E-Mail' },
    { name: 'pickup', type: 'text', label: 'Abholzeiten' },
    { name: 'vatId', type: 'text', label: 'Umsatzsteuer-ID' },
    { name: 'priceNote', type: 'text', label: 'Preishinweis', admin: { description: 'Erscheint unter den Buttons auf der Startseite.' } },
    {
      name: 'social',
      type: 'array',
      label: 'Soziale Medien',
      labels: { singular: 'Profil', plural: 'Profile' },
      fields: [
        { name: 'label', type: 'text', label: 'Name', required: true },
        { name: 'url', type: 'text', label: 'Adresse', required: true },
      ],
    },
    { name: 'seoDescription', type: 'textarea', label: 'Beschreibung für Suchmaschinen' },
  ],
}
