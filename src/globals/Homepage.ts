import type { GlobalConfig } from 'payload'
import { faqField, isLoggedIn, titleTextArray } from '../collections/fields'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Startseite',
  admin: { group: 'Inhalte' },
  access: { read: () => true, update: isLoggedIn },
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Kleine Zeile über der Überschrift' },
    { name: 'headline', type: 'text', label: 'Überschrift', required: true },
    { name: 'text', type: 'textarea', label: 'Einleitung' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild (ersetzt die Zeichnung)' },
    {
      name: 'stats',
      type: 'array',
      label: 'Kennzahlen',
      labels: { singular: 'Kennzahl', plural: 'Kennzahlen' },
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', label: 'Wert', required: true },
        { name: 'label', type: 'text', label: 'Erklärung', required: true },
      ],
    },
    titleTextArray('advantages', 'Vorteile', 'Vorteil'),
    { name: 'servicesHeadline', type: 'text', label: 'Leistungen: Überschrift' },
    { name: 'servicesNote', type: 'text', label: 'Leistungen: Zusatzzeile' },
    { name: 'materialsHeadline', type: 'text', label: 'Materialien: Überschrift' },
    { name: 'materialsText', type: 'textarea', label: 'Materialien: Text' },
    { name: 'stepsHeadline', type: 'text', label: 'Ablauf: Überschrift' },
    titleTextArray('steps', 'Ablauf', 'Schritt'),
    faqField,
    { name: 'inquiryHeadline', type: 'text', label: 'Anfrage: Überschrift' },
    { name: 'inquiryText', type: 'textarea', label: 'Anfrage: Text' },
  ],
}
