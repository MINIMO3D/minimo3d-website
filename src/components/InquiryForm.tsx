'use client'

import Link from 'next/link'
import React, { useRef, useState } from 'react'

const MAX_TOTAL = 50 * 1024 * 1024
const MAX_FILES = 5

type State = { status: 'idle' | 'sending' | 'ok' | 'error'; message?: string }

export function InquiryForm() {
  const [state, setState] = useState<State>({ status: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const files = data.getAll('files').filter((f): f is File => f instanceof File && f.size > 0)

    if (files.length > MAX_FILES) {
      setState({ status: 'error', message: `Bitte höchstens ${MAX_FILES} Dateien auswählen.` })
      return
    }
    if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL) {
      setState({ status: 'error', message: 'Die Dateien sind zusammen größer als 50 MB. Senden Sie uns größere Dateien bitte per Link.' })
      return
    }

    setState({ status: 'sending' })
    try {
      const res = await fetch('/anfrage', { method: 'POST', body: data })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Die Anfrage konnte nicht gesendet werden.')
      form.reset()
      setState({ status: 'ok' })
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Die Anfrage konnte nicht gesendet werden.',
      })
    }
  }

  if (state.status === 'ok') {
    return (
      <div className="form" role="status">
        <h3 className="h3">Danke, Ihre Anfrage ist angekommen.</h3>
        <p>Wir prüfen Ihre Angaben und melden uns innerhalb von 24 Stunden per E-Mail.</p>
        <button className="btn btn--ghost" type="button" onClick={() => setState({ status: 'idle' })}>
          Weitere Anfrage senden
        </button>
      </div>
    )
  }

  const sending = state.status === 'sending'

  return (
    <form className="form" ref={formRef} onSubmit={onSubmit} noValidate={false}>
      <div className="hp" aria-hidden="true">
        <label htmlFor="af-website">Website (bitte leer lassen)</label>
        <input id="af-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form__row">
        <div className="field">
          <label htmlFor="af-name">Name</label>
          <input id="af-name" name="name" type="text" autoComplete="name" required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="af-email">E-Mail</label>
          <input id="af-email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="af-company">Firma (optional)</label>
        <input id="af-company" name="company" type="text" autoComplete="organization" maxLength={160} />
      </div>
      <div className="field">
        <label htmlFor="af-files">Dateien (optional)</label>
        <div className="drop">
          <input
            id="af-files"
            name="files"
            type="file"
            multiple
            accept=".stl,.step,.stp,.3mf,.obj,.pdf,.jpg,.jpeg,.png,.webp"
          />
          <span className="hint">STL · STEP · 3MF · OBJ · Foto · PDF, zusammen bis 50 MB, höchstens 5 Dateien</span>
        </div>
      </div>
      <div className="field">
        <label htmlFor="af-message">Was soll das Bauteil leisten?</label>
        <textarea id="af-message" name="message" rows={5} required maxLength={5000} />
      </div>
      <label className="consent">
        <input name="consent" type="checkbox" value="ja" required />
        <span>
          Ich bin einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verarbeitet werden. Details stehen in
          der <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </span>
      </label>
      {state.status === 'error' && (
        <p className="form__msg form__msg--err" role="alert">
          {state.message}
        </p>
      )}
      <button className="btn btn--primary" type="submit" disabled={sending}>
        {sending ? 'Wird gesendet …' : 'Anfrage senden'}
      </button>
    </form>
  )
}
