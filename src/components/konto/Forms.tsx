'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

type State = { busy: boolean; error?: string; ok?: string }

const post = async (action: string, body: unknown) => {
  const res = await fetch(`/konto/api/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Das hat nicht geklappt. Bitte versuchen Sie es erneut.')
  return json
}

const useSubmit = () => {
  const [state, setState] = useState<State>({ busy: false })
  const run = async (fn: () => Promise<string | void>) => {
    setState({ busy: true })
    try {
      const ok = await fn()
      setState({ busy: false, ok: ok || undefined })
    } catch (err) {
      setState({ busy: false, error: err instanceof Error ? err.message : 'Das hat nicht geklappt.' })
    }
  }
  return { state, run }
}

const Msg = ({ state }: { state: State }) => (
  <>
    {state.error && (
      <p className="form__msg form__msg--err" role="alert">
        {state.error}
      </p>
    )}
    {state.ok && (
      <p className="form__msg form__msg--ok" role="status">
        {state.ok}
      </p>
    )}
  </>
)

type FieldProps = {
  name: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
  defaultValue?: string
  hint?: string
  minLength?: number
  placeholder?: string
}
const Field = ({ name, label, type = 'text', hint, ...rest }: FieldProps) => (
  <div className="field">
    <label htmlFor={`f-${name}`}>{label}</label>
    <input id={`f-${name}`} name={name} type={type} {...rest} />
    {hint && <p className="small muted">{hint}</p>}
  </div>
)

const values = (form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries()) as Record<string, string>

const safeNext = (next?: string) => (next && /^\/(?!\/)[A-Za-z0-9/_?=&%.-]*$/.test(next) ? next : '/konto')

// ------------------------------------------------------------------ Anmelden
export function LoginForm({ next }: { next?: string }) {
  const { state, run } = useSubmit()
  return (
    <form
      className="form form--narrow"
      onSubmit={(e) => {
        e.preventDefault()
        const v = values(e.currentTarget)
        run(async () => {
          await post('anmelden', v)
          window.location.href = safeNext(next)
        })
      }}
    >
      <Field name="email" label="E-Mail" type="email" required autoComplete="email" />
      <Field name="password" label="Passwort" type="password" required autoComplete="current-password" />
      <Msg state={state} />
      <button className="btn btn--primary" type="submit" disabled={state.busy}>
        {state.busy ? 'Anmeldung läuft …' : 'Anmelden'}
      </button>
      <p className="small">
        <Link href="/konto/passwort-vergessen">Passwort vergessen?</Link>
      </p>
    </form>
  )
}

// ------------------------------------------------------------------ Registrieren
export function RegisterForm({ initialType, next }: { initialType: 'b2c' | 'b2b'; next?: string }) {
  const [type, setType] = useState<'b2c' | 'b2b'>(initialType)
  const { state, run } = useSubmit()
  const b2b = type === 'b2b'
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        const v = values(e.currentTarget)
        run(async () => {
          await post('registrieren', {
            type,
            email: v.email,
            password: v.password,
            firstName: v.firstName,
            lastName: v.lastName,
            phone: v.phone,
            company: v.company,
            vatId: v.vatId,
            website: v.website,
            accepted: v.accepted === 'on',
            billing: { street: v.street, zip: v.zip, city: v.city, country: 'Deutschland' },
          })
          window.location.href = safeNext(next)
        })
      }}
    >
      <fieldset className="field">
        <legend>Ich bestelle als</legend>
        <div className="choices choices--two">
          <label className="choice">
            <input type="radio" name="kind" checked={!b2b} onChange={() => setType('b2c')} />
            <span className="choice__box">
              <span className="choice__title">Privatkunde</span>
              <span className="choice__hint">Preise inklusive Mehrwertsteuer</span>
            </span>
          </label>
          <label className="choice">
            <input type="radio" name="kind" checked={b2b} onChange={() => setType('b2b')} />
            <span className="choice__box">
              <span className="choice__title">Geschäftskunde</span>
              <span className="choice__hint">Nettopreise, Bestellreferenz, Kauf auf Rechnung</span>
            </span>
          </label>
        </div>
      </fieldset>

      {b2b && (
        <div className="form__row">
          <Field name="company" label="Firma" required autoComplete="organization" />
          <Field
            name="vatId"
            label="Umsatzsteuer-ID"
            required
            placeholder="DE123456789"
            hint="Wir prüfen die Nummer in der EU-Datenbank VIES."
          />
        </div>
      )}
      <div className="form__row">
        <Field name="firstName" label="Vorname" required autoComplete="given-name" />
        <Field name="lastName" label="Nachname" required autoComplete="family-name" />
      </div>
      <div className="form__row">
        <Field name="email" label="E-Mail" type="email" required autoComplete="email" />
        <Field name="phone" label="Telefon (optional)" type="tel" autoComplete="tel" />
      </div>
      <Field
        name="street"
        label={b2b ? 'Rechnungsadresse: Straße und Hausnummer' : 'Straße und Hausnummer (optional)'}
        required={b2b}
        autoComplete="street-address"
      />
      <div className="form__row">
        <Field name="zip" label={b2b ? 'PLZ' : 'PLZ (optional)'} required={b2b} autoComplete="postal-code" />
        <Field name="city" label={b2b ? 'Ort' : 'Ort (optional)'} required={b2b} autoComplete="address-level2" />
      </div>
      <Field
        name="password"
        label="Passwort"
        type="password"
        required
        minLength={10}
        autoComplete="new-password"
        hint="Mindestens 10 Zeichen."
      />
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Website</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input type="checkbox" name="accepted" required />
        <span>
          Ich akzeptiere die <Link href="/agb">AGB</Link> und habe die <Link href="/datenschutz">Datenschutzerklärung</Link> gelesen.
        </span>
      </label>
      <Msg state={state} />
      <button className="btn btn--primary" type="submit" disabled={state.busy}>
        {state.busy ? 'Konto wird angelegt …' : b2b ? 'Geschäftskonto anlegen' : 'Kundenkonto anlegen'}
      </button>
    </form>
  )
}

// ------------------------------------------------------------------ Passwort
export function ForgotForm() {
  const { state, run } = useSubmit()
  return (
    <form
      className="form form--narrow"
      onSubmit={(e) => {
        e.preventDefault()
        const v = values(e.currentTarget)
        run(async () => {
          await post('passwort-vergessen', v)
          return 'Wenn es zu dieser Adresse ein Konto gibt, ist die E-Mail mit dem Link unterwegs. Der Link gilt eine Stunde.'
        })
      }}
    >
      <Field name="email" label="E-Mail" type="email" required autoComplete="email" />
      <Msg state={state} />
      <button className="btn btn--primary" type="submit" disabled={state.busy}>
        {state.busy ? 'Wird gesendet …' : 'Link senden'}
      </button>
    </form>
  )
}

export function ResetForm({ token }: { token: string }) {
  const { state, run } = useSubmit()
  return (
    <form
      className="form form--narrow"
      onSubmit={(e) => {
        e.preventDefault()
        const v = values(e.currentTarget)
        run(async () => {
          await post('passwort-neu', { token, password: v.password })
          window.location.href = '/konto'
        })
      }}
    >
      <Field name="password" label="Neues Passwort" type="password" required minLength={10} autoComplete="new-password" hint="Mindestens 10 Zeichen." />
      <Msg state={state} />
      <button className="btn btn--primary" type="submit" disabled={state.busy}>
        {state.busy ? 'Wird gespeichert …' : 'Passwort speichern'}
      </button>
    </form>
  )
}

// ------------------------------------------------------------------ Abmelden
export function LogoutButton({ className = 'linkbtn' }: { className?: string }) {
  const [busy, setBusy] = useState(false)
  return (
    <button
      className={className}
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        await post('abmelden', {}).catch(() => null)
        window.location.href = '/'
      }}
    >
      Abmelden
    </button>
  )
}

// ------------------------------------------------------------------ Profil
type Address = { name?: string; street?: string; zip?: string; city?: string; country?: string }
export type ProfileData = {
  type: 'b2c' | 'b2b'
  email: string
  firstName: string
  lastName: string
  phone?: string
  company?: string
  vatId?: string
  billing?: Address
  shippingSame?: boolean
  shipping?: Address
}

export function ProfileForm({ data }: { data: ProfileData }) {
  const router = useRouter()
  const { state, run } = useSubmit()
  const [same, setSame] = useState(data.shippingSame !== false)
  const b2b = data.type === 'b2b'
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        const v = values(e.currentTarget)
        run(async () => {
          const res = await post('profil', {
            firstName: v.firstName,
            lastName: v.lastName,
            phone: v.phone,
            company: v.company,
            vatId: v.vatId,
            billing: { street: v.street, zip: v.zip, city: v.city, country: v.country },
            shippingSame: same,
            shipping: { name: v.sName, street: v.sStreet, zip: v.sZip, city: v.sCity, country: v.sCountry },
          })
          router.refresh()
          return ['Ihre Angaben sind gespeichert.', res.note].filter(Boolean).join(' ')
        })
      }}
    >
      <h2 className="h3">{b2b ? 'Firma und Ansprechpartner' : 'Ihre Angaben'}</h2>
      {b2b && (
        <div className="form__row">
          <Field name="company" label="Firma" required defaultValue={data.company} autoComplete="organization" />
          <Field name="vatId" label="Umsatzsteuer-ID" required defaultValue={data.vatId} hint="Nach einer Änderung prüfen wir die Nummer erneut." />
        </div>
      )}
      <div className="form__row">
        <Field name="firstName" label="Vorname" required defaultValue={data.firstName} autoComplete="given-name" />
        <Field name="lastName" label="Nachname" required defaultValue={data.lastName} autoComplete="family-name" />
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="f-email-ro">E-Mail</label>
          <input id="f-email-ro" type="email" value={data.email} readOnly />
          <p className="small muted">Für eine andere Adresse schreiben Sie uns bitte kurz.</p>
        </div>
        <Field name="phone" label="Telefon" type="tel" defaultValue={data.phone} autoComplete="tel" />
      </div>

      <h2 className="h3">Rechnungsadresse</h2>
      <Field name="street" label="Straße und Hausnummer" required={b2b} defaultValue={data.billing?.street} autoComplete="street-address" />
      <div className="form__row">
        <Field name="zip" label="PLZ" required={b2b} defaultValue={data.billing?.zip} autoComplete="postal-code" />
        <Field name="city" label="Ort" required={b2b} defaultValue={data.billing?.city} autoComplete="address-level2" />
        <Field name="country" label="Land" defaultValue={data.billing?.country || 'Deutschland'} autoComplete="country-name" />
      </div>

      <h2 className="h3">Lieferadresse</h2>
      <label className="consent">
        <input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} />
        <span>Die Lieferadresse ist die Rechnungsadresse.</span>
      </label>
      {!same && (
        <>
          <Field name="sName" label="Empfänger" defaultValue={data.shipping?.name} />
          <Field name="sStreet" label="Straße und Hausnummer" required defaultValue={data.shipping?.street} />
          <div className="form__row">
            <Field name="sZip" label="PLZ" required defaultValue={data.shipping?.zip} />
            <Field name="sCity" label="Ort" required defaultValue={data.shipping?.city} />
            <Field name="sCountry" label="Land" defaultValue={data.shipping?.country || 'Deutschland'} />
          </div>
          <p className="small muted">Wir versenden mit DHL innerhalb Deutschlands.</p>
        </>
      )}
      <Msg state={state} />
      <button className="btn btn--primary" type="submit" disabled={state.busy}>
        {state.busy ? 'Wird gespeichert …' : 'Speichern'}
      </button>
    </form>
  )
}

export function PasswordForm() {
  const { state, run } = useSubmit()
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        const form = e.currentTarget
        const v = values(form)
        run(async () => {
          await post('passwort', v)
          form.reset()
          return 'Das neue Passwort ist gespeichert.'
        })
      }}
    >
      <h2 className="h3">Passwort ändern</h2>
      <div className="form__row">
        <Field name="current" label="Aktuelles Passwort" type="password" required autoComplete="current-password" />
        <Field name="password" label="Neues Passwort" type="password" required minLength={10} autoComplete="new-password" hint="Mindestens 10 Zeichen." />
      </div>
      <Msg state={state} />
      <button className="btn btn--ghost" type="submit" disabled={state.busy}>
        {state.busy ? 'Wird gespeichert …' : 'Passwort ändern'}
      </button>
    </form>
  )
}

export function DeleteAccountForm() {
  const { state, run } = useSubmit()
  const [open, setOpen] = useState(false)
  if (!open)
    return (
      <div className="form">
        <h2 className="h3">Konto löschen</h2>
        <p>
          Wir löschen Ihr Konto und Ihre gespeicherten Dateien. Rechnungsdaten abgeschlossener Bestellungen müssen wir nach
          Handels- und Steuerrecht weiter aufbewahren.
        </p>
        <button className="btn btn--ghost" type="button" onClick={() => setOpen(true)}>
          Konto löschen …
        </button>
      </div>
    )
  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        const v = values(e.currentTarget)
        run(async () => {
          await post('konto-loeschen', v)
          window.location.href = '/?konto=geloescht'
        })
      }}
    >
      <h2 className="h3">Konto wirklich löschen?</h2>
      <p>Das lässt sich nicht rückgängig machen. Bitte bestätigen Sie mit Ihrem Passwort.</p>
      <Field name="password" label="Passwort" type="password" required autoComplete="current-password" />
      <Msg state={state} />
      <div className="actions">
        <button className="btn btn--danger" type="submit" disabled={state.busy}>
          {state.busy ? 'Wird gelöscht …' : 'Konto endgültig löschen'}
        </button>
        <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>
          Abbrechen
        </button>
      </div>
    </form>
  )
}

// ------------------------------------------------------------------ Dateien
export function RemoveFileButton({ token, ordered }: { token: string; ordered: boolean }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'ask' | 'busy'>('idle')
  if (state === 'idle')
    return (
      <button className="linkbtn" type="button" onClick={() => setState('ask')}>
        Entfernen
      </button>
    )
  return (
    <span className="confirm">
      <span className="small">{ordered ? 'Aus der Liste entfernen?' : 'Datei löschen?'}</span>
      <button
        className="linkbtn linkbtn--danger"
        type="button"
        disabled={state === 'busy'}
        onClick={async () => {
          setState('busy')
          await post('datei-entfernen', { token }).catch(() => null)
          router.refresh()
          setState('idle')
        }}
      >
        Ja
      </button>
      <button className="linkbtn" type="button" onClick={() => setState('idle')}>
        Nein
      </button>
    </span>
  )
}

export type DfmSelection = { token: string; materialId: string; layer: string; infill: string; quantity: number; color?: string; fileName: string }

export function DfmButton({ selection, label = 'DFM-Analyse (PDF)' }: { selection: DfmSelection; label?: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle')
  return (
    <button
      className="linkbtn"
      type="button"
      disabled={state === 'busy'}
      onClick={async () => {
        setState('busy')
        try {
          const res = await fetch('/rechner/dfm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...selection, delivery: 'versand', express: false }),
          })
          if (!res.ok) throw new Error()
          const url = URL.createObjectURL(await res.blob())
          const a = document.createElement('a')
          a.href = url
          a.download = `DFM-Analyse_${selection.fileName.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9_-]+/g, '_') || 'Bauteil'}.pdf`
          document.body.appendChild(a)
          a.click()
          a.remove()
          setTimeout(() => URL.revokeObjectURL(url), 5000)
          setState('idle')
        } catch {
          setState('error')
        }
      }}
    >
      {state === 'busy' ? 'PDF wird erstellt …' : state === 'error' ? 'Nicht mehr verfügbar' : label}
    </button>
  )
}
