// Kontakt- und Adressdaten für die Bestellung: Formular im Preisrechner, Prüfung auf dem Server, Übergabe an Stripe.

export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'BE', name: 'Belgien' },
  { code: 'BG', name: 'Bulgarien' },
  { code: 'DK', name: 'Dänemark' },
  { code: 'EE', name: 'Estland' },
  { code: 'FI', name: 'Finnland' },
  { code: 'FR', name: 'Frankreich' },
  { code: 'GR', name: 'Griechenland' },
  { code: 'IE', name: 'Irland' },
  { code: 'IT', name: 'Italien' },
  { code: 'HR', name: 'Kroatien' },
  { code: 'LV', name: 'Lettland' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Litauen' },
  { code: 'LU', name: 'Luxemburg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Niederlande' },
  { code: 'PL', name: 'Polen' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Rumänien' },
  { code: 'SE', name: 'Schweden' },
  { code: 'SK', name: 'Slowakei' },
  { code: 'SI', name: 'Slowenien' },
  { code: 'ES', name: 'Spanien' },
  { code: 'CZ', name: 'Tschechien' },
  { code: 'HU', name: 'Ungarn' },
  { code: 'CY', name: 'Zypern' },
]

export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name || 'Deutschland'
/** Ländername oder Kürzel aus dem Kundenkonto in ein Kürzel übersetzen. */
export const countryCode = (value?: string | null) => {
  const v = String(value || '').trim().toLowerCase()
  return COUNTRIES.find((c) => c.code.toLowerCase() === v || c.name.toLowerCase() === v)?.code || 'DE'
}

export type Contact = {
  email: string
  firstName: string
  lastName: string
  company: string
  vatId: string
  phone: string
  street: string
  zip: string
  city: string
  country: string // Kürzel, z. B. DE
  shippingSame: boolean
  sName: string
  sStreet: string
  sZip: string
  sCity: string
}

export const EMPTY_CONTACT: Contact = {
  email: '',
  firstName: '',
  lastName: '',
  company: '',
  vatId: '',
  phone: '',
  street: '',
  zip: '',
  city: '',
  country: 'DE',
  shippingSame: true,
  sName: '',
  sStreet: '',
  sZip: '',
  sCity: '',
}

/** Angaben aus dem Kundenkonto als Vorbelegung. */
export const contactFromCustomer = (c: any): Contact => ({
  email: c?.email || '',
  firstName: c?.firstName || '',
  lastName: c?.lastName || '',
  company: c?.company || '',
  vatId: c?.vatId || '',
  phone: c?.phone || '',
  street: c?.billing?.street || '',
  zip: c?.billing?.zip || '',
  city: c?.billing?.city || '',
  country: countryCode(c?.billing?.country),
  shippingSame: c?.shippingSame !== false || !c?.shipping?.street,
  sName: c?.shipping?.name || '',
  sStreet: c?.shipping?.street || '',
  sZip: c?.shipping?.zip || '',
  sCity: c?.shipping?.city || '',
})

const text = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Prüft die Angaben aus dem Browser. Bei Versand muss die Lieferadresse in Deutschland liegen. */
export const parseContact = (raw: any, shipping: boolean): Contact | { error: string } => {
  const c: Contact = {
    email: text(raw?.email, 200).toLowerCase(),
    firstName: text(raw?.firstName),
    lastName: text(raw?.lastName),
    company: text(raw?.company, 160),
    vatId: text(raw?.vatId, 30).toUpperCase().replace(/[^A-Z0-9]/g, ''),
    phone: text(raw?.phone, 40),
    street: text(raw?.street),
    zip: text(raw?.zip, 12),
    city: text(raw?.city),
    country: countryCode(text(raw?.country, 40)),
    shippingSame: raw?.shippingSame !== false,
    sName: text(raw?.sName),
    sStreet: text(raw?.sStreet),
    sZip: text(raw?.sZip, 12),
    sCity: text(raw?.sCity),
  }
  if (!EMAIL.test(c.email)) return { error: 'Bitte geben Sie eine gültige E-Mail-Adresse an.' }
  if (!c.firstName || !c.lastName) return { error: 'Bitte geben Sie Vor- und Nachnamen an.' }
  if (!c.street || !c.zip || !c.city) return { error: 'Bitte füllen Sie die Rechnungsadresse vollständig aus.' }
  if (c.vatId && !/^[A-Z]{2}[A-Z0-9]{2,12}$/.test(c.vatId)) return { error: 'Die Umsatzsteuer-ID hat kein gültiges Format, zum Beispiel DE123456789.' }
  if (c.vatId && !c.company) return { error: 'Bitte geben Sie zur Umsatzsteuer-ID auch die Firma an.' }
  if (shipping) {
    if (c.shippingSame && c.country !== 'DE')
      return { error: 'Wir versenden innerhalb Deutschlands. Bitte geben Sie eine Lieferadresse in Deutschland an oder wählen Sie Abholung.' }
    if (!c.shippingSame && (!c.sStreet || !c.sZip || !c.sCity)) return { error: 'Bitte füllen Sie die Lieferadresse vollständig aus.' }
    if (!/^\d{5}$/.test(c.shippingSame ? c.zip : c.sZip)) return { error: 'Bitte geben Sie für die Lieferadresse eine fünfstellige Postleitzahl an.' }
  }
  return c
}

export const fullName = (c: Contact) => `${c.firstName} ${c.lastName}`.trim()
export const billingText = (c: Contact) =>
  [c.company, fullName(c), c.street, `${c.zip} ${c.city}`, countryName(c.country), c.vatId ? `USt-IdNr. ${c.vatId}` : ''].filter(Boolean).join('\n')
export const shippingOf = (c: Contact) =>
  c.shippingSame
    ? { name: c.company || fullName(c), street: c.street, zip: c.zip, city: c.city }
    : { name: c.sName || c.company || fullName(c), street: c.sStreet, zip: c.sZip, city: c.sCity }
export const shippingText = (c: Contact) => {
  const s = shippingOf(c)
  return [s.name, s.name === fullName(c) ? '' : fullName(c), s.street, `${s.zip} ${s.city}`, 'Deutschland'].filter(Boolean).join('\n')
}
