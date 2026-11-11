import config from '@payload-config'
import { NextResponse } from 'next/server'
import { generateExpiredPayloadCookie, generatePayloadCookie, getPayload, type Payload } from 'payload'

import { customerFromRequest, type Customer } from '@/lib/customer'
import { mailEnabled, originOf, sendMail, welcomeEmail } from '@/lib/mail'
import { checkVatId, normalizeVatId } from '@/lib/vies'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status })
const text = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// einfache Bremse je IP gegen automatisierte Versuche
const hits = new Map<string, number[]>()
const limited = (req: Request, key: string, max: number, minutes: number) => {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'lokal'
  const id = `${key}:${ip}`
  const now = Date.now()
  const list = (hits.get(id) || []).filter((t) => now - t < minutes * 60_000)
  list.push(now)
  hits.set(id, list)
  if (hits.size > 5000) hits.clear()
  return list.length > max
}

const passwordProblem = (pw: unknown) => {
  if (typeof pw !== 'string' || pw.length < 10) return 'Das Passwort braucht mindestens 10 Zeichen.'
  if (pw.length > 200) return 'Das Passwort ist zu lang.'
  return null
}

const addressOf = (a: any, withName = false) => ({
  ...(withName ? { name: text(a?.name) } : {}),
  street: text(a?.street),
  zip: text(a?.zip, 12),
  city: text(a?.city),
  country: text(a?.country) || 'Deutschland',
})

const withLogin = async (payload: Payload, email: string, password: string, body: Record<string, unknown>) => {
  const result = await payload.login({ collection: 'customers', data: { email, password } })
  const res = NextResponse.json(body)
  if (result.token)
    res.headers.append(
      'Set-Cookie',
      generatePayloadCookie({
        collectionAuthConfig: payload.collections.customers.config.auth,
        cookiePrefix: payload.config.cookiePrefix,
        token: result.token,
      }),
    )
  return res
}

const loggedOut = (payload: Payload, body: Record<string, unknown>) => {
  const res = NextResponse.json(body)
  res.headers.append(
    'Set-Cookie',
    generateExpiredPayloadCookie({
      collectionAuthConfig: payload.collections.customers.config.auth,
      cookiePrefix: payload.config.cookiePrefix,
    }),
  )
  return res
}

// ---------------------------------------------------------------- Registrierung
const register = async (req: Request, body: any) => {
  if (text(body.website)) return NextResponse.json({ ok: true }) // Honigtopf
  if (limited(req, 'reg', 6, 60)) return bad('Zu viele Versuche. Bitte versuchen Sie es später erneut.', 429)

  const type = body.type === 'b2b' ? 'b2b' : 'b2c'
  const email = text(body.email, 200).toLowerCase()
  const firstName = text(body.firstName)
  const lastName = text(body.lastName)
  if (!firstName || !lastName) return bad('Bitte geben Sie Vor- und Nachnamen an.')
  if (!EMAIL.test(email)) return bad('Bitte geben Sie eine gültige E-Mail-Adresse an.')
  const pw = passwordProblem(body.password)
  if (pw) return bad(pw)
  if (body.accepted !== true) return bad('Bitte bestätigen Sie AGB und Datenschutzerklärung.')

  const data: Record<string, unknown> = {
    type,
    email,
    password: body.password,
    firstName,
    lastName,
    phone: text(body.phone, 40),
    billing: addressOf(body.billing),
    shippingSame: true,
    acceptedTermsAt: new Date().toISOString(),
    vatStatus: 'ungeprueft',
    discountPercent: 0,
    invoiceAllowed: false,
  }

  if (type === 'b2b') {
    const company = text(body.company, 160)
    if (!company) return bad('Bitte geben Sie den Firmennamen an.')
    const vatId = normalizeVatId(text(body.vatId, 30))
    if (!vatId) return bad('Bitte geben Sie eine gültige Umsatzsteuer-ID an, zum Beispiel DE123456789.')
    const billing = data.billing as ReturnType<typeof addressOf>
    if (!billing.street || !billing.zip || !billing.city) return bad('Bitte geben Sie die Rechnungsadresse der Firma an.')
    const check = await checkVatId(vatId)
    if (check.status === 'ungueltig')
      return bad('Diese Umsatzsteuer-ID ist laut EU-Datenbank (VIES) nicht gültig. Bitte prüfen Sie die Nummer.')
    Object.assign(data, { company, vatId, vatStatus: check.status, vatCheckedAt: new Date().toISOString() })
  }

  const payload = await getPayload({ config })
  const existing = await payload.find({ collection: 'customers', where: { email: { equals: email } }, limit: 1, depth: 0 })
  if (existing.docs.length) return bad('Zu dieser E-Mail-Adresse gibt es bereits ein Konto. Bitte melden Sie sich an.', 409)

  try {
    await payload.create({ collection: 'customers', data: data as any, overrideAccess: true })
  } catch (err: any) {
    payload.logger.error({ err }, 'Registrierung fehlgeschlagen')
    return bad('Das Konto konnte nicht angelegt werden. Bitte prüfen Sie Ihre Angaben.')
  }
  await sendMail(payload, {
    to: email,
    subject: 'MINIMO3D: Ihr Kundenkonto',
    html: welcomeEmail(firstName, type === 'b2b', originOf(req)),
  })
  return withLogin(payload, email, body.password, { ok: true })
}

// ---------------------------------------------------------------- An- und Abmelden
const login = async (req: Request, body: any) => {
  if (limited(req, 'login', 20, 10)) return bad('Zu viele Versuche. Bitte versuchen Sie es in einigen Minuten erneut.', 429)
  const email = text(body.email, 200).toLowerCase()
  if (!EMAIL.test(email) || typeof body.password !== 'string' || !body.password) return bad('Bitte geben Sie E-Mail und Passwort an.')
  const payload = await getPayload({ config })
  try {
    return await withLogin(payload, email, body.password, { ok: true })
  } catch (err: any) {
    if (err?.name === 'LockedAuth' || err?.status === 401 && /lock/i.test(err?.message || ''))
      return bad('Das Konto ist nach zu vielen Fehlversuchen für 10 Minuten gesperrt.', 429)
    return bad('E-Mail oder Passwort stimmen nicht.', 401)
  }
}

// ---------------------------------------------------------------- Passwort
const forgot = async (req: Request, body: any) => {
  if (limited(req, 'forgot', 5, 60)) return bad('Zu viele Versuche. Bitte versuchen Sie es später erneut.', 429)
  if (!mailEnabled())
    return bad('Der E-Mail-Versand ist noch nicht eingerichtet. Bitte schreiben Sie uns, wir setzen Ihr Passwort zurück.', 503)
  const email = text(body.email, 200).toLowerCase()
  if (!EMAIL.test(email)) return bad('Bitte geben Sie eine gültige E-Mail-Adresse an.')
  const payload = await getPayload({ config })
  // Antwort ist immer gleich, damit niemand herausfindet, welche Adressen ein Konto haben
  await payload
    .forgotPassword({ collection: 'customers', data: { email }, req: { headers: req.headers } as any })
    .catch((err) => payload.logger.error({ err }, 'Passwort-Mail fehlgeschlagen'))
  return NextResponse.json({ ok: true })
}

const reset = async (_req: Request, body: any) => {
  const token = text(body.token, 300)
  const pw = passwordProblem(body.password)
  if (!token) return bad('Der Link ist ungültig. Bitte fordern Sie einen neuen an.')
  if (pw) return bad(pw)
  const payload = await getPayload({ config })
  try {
    const result = await payload.resetPassword({ collection: 'customers', data: { token, password: body.password }, overrideAccess: true })
    const res = NextResponse.json({ ok: true })
    if (result.token)
      res.headers.append(
        'Set-Cookie',
        generatePayloadCookie({
          collectionAuthConfig: payload.collections.customers.config.auth,
          cookiePrefix: payload.config.cookiePrefix,
          token: result.token,
        }),
      )
    return res
  } catch {
    return bad('Der Link ist abgelaufen oder wurde schon benutzt. Bitte fordern Sie einen neuen an.')
  }
}

const verifyPassword = async (payload: Payload, customer: Customer, password: unknown) => {
  if (typeof password !== 'string' || !password) return false
  try {
    await payload.login({ collection: 'customers', data: { email: customer.email, password } })
    return true
  } catch {
    return false
  }
}

const changePassword = async (req: Request, body: any, customer: Customer) => {
  if (limited(req, 'pw', 10, 10)) return bad('Zu viele Versuche. Bitte versuchen Sie es später erneut.', 429)
  const pw = passwordProblem(body.password)
  if (pw) return bad(pw)
  const payload = await getPayload({ config })
  if (!(await verifyPassword(payload, customer, body.current))) return bad('Das aktuelle Passwort stimmt nicht.', 401)
  await payload.update({ collection: 'customers', id: customer.id, data: { password: body.password } as any, overrideAccess: true })
  return withLogin(payload, customer.email, body.password, { ok: true })
}

// ---------------------------------------------------------------- Profil
const profile = async (_req: Request, body: any, customer: Customer) => {
  const firstName = text(body.firstName)
  const lastName = text(body.lastName)
  if (!firstName || !lastName) return bad('Bitte geben Sie Vor- und Nachnamen an.')
  const shippingSame = body.shippingSame !== false
  const data: Record<string, unknown> = {
    firstName,
    lastName,
    phone: text(body.phone, 40),
    billing: addressOf(body.billing),
    shippingSame,
    shipping: shippingSame ? { name: '', street: '', zip: '', city: '', country: 'Deutschland' } : addressOf(body.shipping, true),
  }
  if (!shippingSame) {
    const s = data.shipping as any
    if (!s.street || !s.zip || !s.city) return bad('Bitte füllen Sie die Lieferadresse vollständig aus.')
  }

  let vatNote = ''
  if (customer.type === 'b2b') {
    const company = text(body.company, 160)
    if (!company) return bad('Bitte geben Sie den Firmennamen an.')
    const billing = data.billing as any
    if (!billing.street || !billing.zip || !billing.city) return bad('Bitte geben Sie die Rechnungsadresse der Firma an.')
    data.company = company
    const vatId = normalizeVatId(text(body.vatId, 30))
    if (!vatId) return bad('Bitte geben Sie eine gültige Umsatzsteuer-ID an, zum Beispiel DE123456789.')
    if (vatId !== customer.vatId) {
      const check = await checkVatId(vatId)
      if (check.status === 'ungueltig')
        return bad('Diese Umsatzsteuer-ID ist laut EU-Datenbank (VIES) nicht gültig. Bitte prüfen Sie die Nummer.')
      Object.assign(data, { vatId, vatStatus: check.status, vatCheckedAt: new Date().toISOString() })
      vatNote = check.status === 'gueltig' ? 'Die Umsatzsteuer-ID wurde geprüft und ist gültig.' : 'Die Umsatzsteuer-ID prüfen wir von Hand.'
    }
  }
  const payload = await getPayload({ config })
  await payload.update({ collection: 'customers', id: customer.id, data: data as any, overrideAccess: true })
  return NextResponse.json({ ok: true, note: vatNote })
}

// ---------------------------------------------------------------- Dateien und Konto
const removeFile = async (_req: Request, body: any, customer: Customer) => {
  const payload = await getPayload({ config })
  const found = await payload.find({
    collection: 'quotes',
    where: { and: [{ token: { equals: text(body.token, 100) } }, { customer: { equals: customer.id } }] },
    limit: 1,
    depth: 0,
  })
  const quote: any = found.docs[0]
  if (!quote) return bad('Die Datei wurde nicht gefunden.', 404)
  if (quote.ordered) {
    // Die Datei gehört zu einer Bestellung und bleibt dort erhalten; sie verschwindet nur aus der Liste
    await payload.update({ collection: 'quotes', id: quote.id, data: { customer: null } as any })
  } else {
    const fileId = typeof quote.file === 'object' ? quote.file?.id : quote.file
    await payload.delete({ collection: 'quotes', id: quote.id })
    if (fileId) await payload.delete({ collection: 'quote-files', id: fileId }).catch(() => null)
  }
  return NextResponse.json({ ok: true })
}

const removeAccount = async (req: Request, body: any, customer: Customer) => {
  if (limited(req, 'del', 6, 10)) return bad('Zu viele Versuche. Bitte versuchen Sie es später erneut.', 429)
  const payload = await getPayload({ config })
  if (!(await verifyPassword(payload, customer, body.password))) return bad('Das Passwort stimmt nicht.', 401)
  const open = await payload.count({
    collection: 'orders',
    where: { and: [{ customer: { equals: customer.id } }, { status: { in: ['rechnung', 'bezahlt', 'fertigung'] } }] },
  })
  if (open.totalDocs)
    return bad('Es gibt noch laufende Bestellungen. Das Konto kann gelöscht werden, sobald sie abgeschlossen sind. Schreiben Sie uns gern.', 409)

  // gespeicherte Dateien ohne Bestellung sofort löschen; Bestellungen bleiben wegen der Aufbewahrungspflichten ohne Kontobezug erhalten
  const quotes = await payload.find({ collection: 'quotes', where: { customer: { equals: customer.id } }, limit: 500, depth: 0 })
  for (const q of quotes.docs as any[]) {
    if (q.ordered) await payload.update({ collection: 'quotes', id: q.id, data: { customer: null } as any }).catch(() => null)
    else {
      const fileId = typeof q.file === 'object' ? q.file?.id : q.file
      await payload.delete({ collection: 'quotes', id: q.id }).catch(() => null)
      if (fileId) await payload.delete({ collection: 'quote-files', id: fileId }).catch(() => null)
    }
  }
  const orders = await payload.find({ collection: 'orders', where: { customer: { equals: customer.id } }, limit: 1000, depth: 0 })
  for (const o of orders.docs as any[])
    await payload.update({ collection: 'orders', id: o.id, data: { customer: null } as any }).catch(() => null)
  await payload.delete({ collection: 'customers', id: customer.id, overrideAccess: true })
  return loggedOut(payload, { ok: true })
}

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') return bad('Ungültige Anfrage.')

  // Nur Aufrufe von der eigenen Seite annehmen
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (origin && host && new URL(origin).host !== host) return bad('Ungültige Anfrage.', 403)

  try {
    switch (action) {
      case 'registrieren':
        return await register(req, body)
      case 'anmelden':
        return await login(req, body)
      case 'abmelden':
        return loggedOut(await getPayload({ config }), { ok: true })
      case 'passwort-vergessen':
        return await forgot(req, body)
      case 'passwort-neu':
        return await reset(req, body)
    }
    const customer = await customerFromRequest(req)
    if (!customer) return bad('Bitte melden Sie sich an.', 401)
    switch (action) {
      case 'profil':
        return await profile(req, body, customer)
      case 'passwort':
        return await changePassword(req, body, customer)
      case 'datei-entfernen':
        return await removeFile(req, body, customer)
      case 'konto-loeschen':
        return await removeAccount(req, body, customer)
    }
    return bad('Nicht gefunden.', 404)
  } catch (err) {
    console.error('Kundenkonto', action, err)
    return bad('Das hat nicht geklappt. Bitte versuchen Sie es erneut.', 500)
  }
}
