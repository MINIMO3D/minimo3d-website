import type { CollectionConfig, Field, FieldAccess } from 'payload'

import { resetPasswordEmail } from '../lib/mail'
import { isAdminUser, isCustomer, isLoggedIn } from './fields'

const adminField: { update: FieldAccess; create: FieldAccess } = {
  update: ({ req }) => isAdminUser(req),
  create: ({ req }) => isAdminUser(req),
}

const address = (name: string, label: string, withName = false): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    ...(withName ? ([{ name: 'name', type: 'text', label: 'Empfänger' }] as Field[]) : []),
    { name: 'street', type: 'text', label: 'Straße und Hausnummer' },
    {
      type: 'row',
      fields: [
        { name: 'zip', type: 'text', label: 'PLZ' },
        { name: 'city', type: 'text', label: 'Ort' },
        { name: 'country', type: 'text', label: 'Land', defaultValue: 'Deutschland' },
      ],
    },
  ],
})

/** Kundenkonten für das Portal. Getrennt von den Mitarbeiterkonten (Sammlung "users"). */
export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Kunde', plural: 'Kunden' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'type', 'company', 'lastName', 'vatStatus', 'invoiceAllowed', 'discountPercent'],
    group: 'Kunden',
    description: 'Rabatt und Kauf auf Rechnung legen Sie je Geschäftskunde hier fest.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 14,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
    forgotPassword: {
      generateEmailSubject: () => 'MINIMO3D: Neues Passwort festlegen',
      generateEmailHTML: (args) => resetPasswordEmail(args?.req as any, String(args?.token || '')),
    },
  },
  access: {
    // Registrierung läuft über /konto/api/registrieren mit Prüfung, nicht über die offene API
    create: isLoggedIn,
    read: ({ req }) => (isAdminUser(req) ? true : isCustomer(req) ? { id: { equals: req.user!.id } } : false),
    update: ({ req }) => (isAdminUser(req) ? true : isCustomer(req) ? { id: { equals: req.user!.id } } : false),
    delete: isLoggedIn,
    admin: () => false,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Kundenart',
      required: true,
      defaultValue: 'b2c',
      options: [
        { label: 'Privatkunde (B2C)', value: 'b2c' },
        { label: 'Geschäftskunde (B2B)', value: 'b2b' },
      ],
      access: adminField,
      admin: { position: 'sidebar' },
    },
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', label: 'Vorname', required: true },
        { name: 'lastName', type: 'text', label: 'Nachname', required: true },
        { name: 'phone', type: 'text', label: 'Telefon' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Geschäftskunde',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'company', type: 'text', label: 'Firma', access: adminField },
            { name: 'vatId', type: 'text', label: 'Umsatzsteuer-ID', access: adminField },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'vatStatus',
              type: 'select',
              label: 'Prüfung der Umsatzsteuer-ID',
              defaultValue: 'ungeprueft',
              options: [
                { label: 'Noch nicht geprüft', value: 'ungeprueft' },
                { label: 'Gültig (EU-Datenbank)', value: 'gueltig' },
                { label: 'Ungültig', value: 'ungueltig' },
              ],
              access: adminField,
            },
            { name: 'vatCheckedAt', type: 'date', label: 'Geprüft am', access: adminField, admin: { readOnly: true } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'discountPercent', type: 'number', label: 'Individueller Rabatt (%)', min: 0, max: 50, defaultValue: 0, access: adminField, admin: { description: 'Gilt im Preisrechner auf den Teilepreis.' } },
            { name: 'invoiceAllowed', type: 'checkbox', label: 'Kauf auf Rechnung erlaubt', defaultValue: false, access: adminField },
            { name: 'invoiceDays', type: 'number', label: 'Zahlungsziel (Tage)', min: 0, defaultValue: 14, access: adminField },
          ],
        },
      ],
    },
    address('billing', 'Rechnungsadresse'),
    { name: 'shippingSame', type: 'checkbox', label: 'Lieferadresse wie Rechnungsadresse', defaultValue: true },
    address('shipping', 'Lieferadresse', true),
    { name: 'acceptedTermsAt', type: 'date', label: 'AGB und Datenschutz akzeptiert am', access: adminField, admin: { readOnly: true } },
    { name: 'notes', type: 'textarea', label: 'Interne Notizen', access: { ...adminField, read: ({ req }) => isAdminUser(req) } },
  ],
}
