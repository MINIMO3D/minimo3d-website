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
    {
      name: 'heroVideo',
      type: 'upload',
      relationTo: 'media',
      label: 'Video im Kopfbereich',
      filterOptions: { mimeType: { contains: 'video' } },
      admin: { description: 'MP4, am besten 1920 × 1080, ohne Ton, höchstens etwa 5 MB. Leer = mitgeliefertes Video.' },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Standbild zum Video',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: { description: 'Erscheint, bis das Video geladen ist, und bei ausgeschalteten Animationen.' },
    },
    { name: 'heroButtonLabel', type: 'text', label: 'Beschriftung des Hauptbuttons', defaultValue: 'Sofortangebot' },
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
    {
      name: 'advantages',
      type: 'array',
      label: 'Vorteile',
      labels: { singular: 'Vorteil', plural: 'Vorteile' },
      fields: [
        { name: 'title', type: 'text', label: 'Titel', required: true },
        { name: 'text', type: 'textarea', label: 'Text' },
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild (Hochformat)' },
      ],
    },
    { name: 'servicesHeadline', type: 'text', label: 'Leistungen: Überschrift' },
    { name: 'servicesNote', type: 'text', label: 'Leistungen: Zusatzzeile' },
    { name: 'materialsHeadline', type: 'text', label: 'Materialien: Überschrift' },
    { name: 'materialsText', type: 'textarea', label: 'Materialien: Text' },
    { name: 'materialsImage', type: 'upload', relationTo: 'media', label: 'Materialien: Bild' },
    { name: 'materialsImageCaption', type: 'text', label: 'Materialien: Bildunterschrift' },
    { name: 'stepsHeadline', type: 'text', label: 'Ablauf: Überschrift' },
    titleTextArray('steps', 'Ablauf', 'Schritt'),
    faqField,
    { name: 'inquiryHeadline', type: 'text', label: 'Anfrage: Überschrift' },
    { name: 'inquiryText', type: 'textarea', label: 'Anfrage: Text' },
  ],
}
