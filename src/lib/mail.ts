import type { Payload } from 'payload'

import { orderItems } from './order-items'

export const mailEnabled = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const originOf = (req?: { headers?: Headers } | null) => {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/+$/, '')
  const h = req?.headers
  const host = h?.get?.('x-forwarded-host') || h?.get?.('host')
  if (!host) return ''
  return `${h?.get?.('x-forwarded-proto') || 'https'}://${host}`
}

/** Einheitlicher Rahmen für alle E-Mails. */
export const layout = (title: string, body: string) => `<!doctype html>
<html lang="de"><body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#0e1726">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #d9dee7;border-radius:10px">
<tr><td style="padding:28px 32px 8px;font-size:20px;font-weight:bold;color:#2163b5;letter-spacing:1px">MINIMO3D</td></tr>
<tr><td style="padding:8px 32px 0;font-size:22px;font-weight:bold;line-height:1.3">${esc(title)}</td></tr>
<tr><td style="padding:16px 32px 28px;font-size:15px;line-height:1.6;color:#3d4963">${body}</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid #d9dee7;font-size:12px;line-height:1.5;color:#55607a">MINIMO3D · Inhaber Daniele Bucci · Kirchstraße 65 · 73765 Neuhausen auf den Fildern<br>+49 7158 6883442 · support@minimo3d.com</td></tr>
</table></td></tr></table></body></html>`

const button = (href: string, label: string) =>
  `<p style="margin:24px 0"><a href="${esc(href)}" style="display:inline-block;background:#2163b5;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:6px">${esc(label)}</a></p>`

const rows = (items: [string, unknown][]) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:12px 0;font-size:14px">${items
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#55607a;vertical-align:top;width:42%">${esc(k)}</td><td style="padding:6px 0;color:#0e1726;font-weight:bold;white-space:pre-line">${esc(v)}</td></tr>`,
    )
    .join('')}</table>`

export const resetPasswordEmail = (req: { headers?: Headers } | null, token: string) => {
  const url = `${originOf(req)}/konto/passwort-neu?token=${encodeURIComponent(token)}`
  return layout(
    'Neues Passwort festlegen',
    `<p>Für Ihr Kundenkonto wurde ein neues Passwort angefordert. Über den folgenden Link legen Sie es fest. Der Link gilt eine Stunde.</p>${button(url, 'Passwort festlegen')}<p>Wenn Sie das nicht waren, müssen Sie nichts tun. Ihr Passwort bleibt unverändert.</p>`,
  )
}

/** Sendet eine E-Mail, wenn der Versand eingerichtet ist. Fehler brechen den Ablauf nie ab. */
export const sendMail = async (payload: Payload, mail: { to: string; subject: string; html: string; replyTo?: string }) => {
  if (!mailEnabled() || !mail.to) return false
  try {
    await payload.sendEmail(mail)
    return true
  } catch (err) {
    payload.logger.error({ err }, `E-Mail an ${mail.to} konnte nicht gesendet werden`)
    return false
  }
}

const euro = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })

const orderRows = (o: any): [string, unknown][] => [
  ['Bestellnummer', o.orderNumber],
  ...orderItems(o).map((it, n, all): [string, unknown] => [
    all.length > 1 ? `Bauteil ${n + 1}` : 'Bauteil',
    `${it.quantity} × ${it.fileName}\n${[it.materialName, it.color].filter(Boolean).join(', ')}\nSchichthöhe ${it.layer}, Füllung ${it.infill}${it.partsCents ? `\n${euro(it.partsCents / 100)}` : ''}`,
  ]),
  ['Express', o.express ? 'ja' : ''],
  ['Lieferung', o.delivery],
  ['Lieferzeit', o.leadTime],
  ['Ihre Bestellreferenz', o.poNumber],
  ['Kostenstelle', o.costCentre],
  ['Zahlungsart', o.paymentMethod === 'rechnung' ? 'Kauf auf Rechnung' : 'Online bezahlt'],
  ['Gesamt inkl. 19 % MwSt.', typeof o.total === 'number' ? euro(o.total) : ''],
]

/** Bestellbestätigung an den Kunden und Hinweis an den Betrieb. */
export const sendOrderMails = async (payload: Payload, order: any, origin = '') => {
  const settings: any = await payload.findGlobal({ slug: 'site-settings', depth: 0 }).catch(() => null)
  const invoice = order.paymentMethod === 'rechnung'
  const link = order.customer && origin ? button(`${origin}/konto/bestellungen/${order.id}`, 'Bestellung im Kundenkonto ansehen') : ''
  if (order.customerEmail)
    await sendMail(payload, {
      to: order.customerEmail,
      replyTo: settings?.email || undefined,
      subject: `MINIMO3D: Ihre Bestellung ${order.orderNumber}`,
      html: layout(
        'Danke für Ihre Bestellung',
        `<p>${invoice ? 'wir haben Ihre Bestellung erhalten. Die Rechnung senden wir Ihnen mit der Lieferung.' : 'wir haben Ihre Bestellung und Ihre Zahlung erhalten.'} Wir prüfen Ihre Datei von Hand und starten dann die Fertigung. Sollte etwas anzupassen sein, melden wir uns vorher bei Ihnen.</p>${rows(orderRows(order))}${link}<p>Das Teil wird nach Ihren Vorgaben gefertigt, deshalb besteht kein Widerrufsrecht. Es gelten unsere AGB: ${esc(origin)}/agb</p>`,
      ),
    })
  if (settings?.email)
    await sendMail(payload, {
      to: settings.email,
      replyTo: order.customerEmail || undefined,
      subject: `Neue Bestellung ${order.orderNumber}${invoice ? ' (auf Rechnung)' : ''}`,
      html: layout(
        'Neue Bestellung',
        `${rows([['Kunde', order.customerName], ['E-Mail', order.customerEmail], ['Telefon', order.customerPhone], ['Adresse', order.address], ['Hinweis', order.customerNote], ...orderRows(order)])}${origin ? button(`${origin}/admin/collections/orders/${order.id}`, 'Im Admin-Bereich öffnen') : ''}`,
      ),
    })
}

/** Hinweis an den Betrieb bei einer neuen Anfrage über das Formular. */
export const sendInquiryMail = async (payload: Payload, inquiry: any, files: number, origin = '') => {
  const settings: any = await payload.findGlobal({ slug: 'site-settings', depth: 0 }).catch(() => null)
  if (!settings?.email) return
  await sendMail(payload, {
    to: settings.email,
    replyTo: inquiry.email,
    subject: `Neue Anfrage von ${inquiry.name}`,
    html: layout(
      'Neue Anfrage',
      `${rows([['Name', inquiry.name], ['E-Mail', inquiry.email], ['Firma', inquiry.company], ['Dateien', files || '']])}<p style="white-space:pre-line">${esc(inquiry.message)}</p>${origin ? button(`${origin}/admin/collections/inquiries/${inquiry.id}`, 'Im Admin-Bereich öffnen') : ''}`,
    ),
  })
}

export const welcomeEmail = (firstName: string, b2b: boolean, origin: string) =>
  layout(
    'Ihr Kundenkonto ist eingerichtet',
    `<p>Guten Tag ${esc(firstName)},</p><p>Ihr ${b2b ? 'Geschäftskundenkonto' : 'Kundenkonto'} bei MINIMO3D ist eingerichtet. Dort finden Sie Ihre Bestellungen, Ihre gespeicherten 3D-Dateien und können mit einem Klick nachbestellen.</p>${origin ? button(`${origin}/konto`, 'Zum Kundenkonto') : ''}`,
  )
