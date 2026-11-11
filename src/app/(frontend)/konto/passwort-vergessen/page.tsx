import type { Metadata } from 'next'
import Link from 'next/link'

import { ForgotForm } from '@/components/konto/Forms'

export const metadata: Metadata = { title: 'Passwort vergessen', robots: { index: false } }

export default function ForgotPage() {
  return (
    <section className="wrap section auth auth--single">
      <div className="auth__main">
        <p className="eyebrow">Kundenkonto</p>
        <h1 className="h1 h1--page">Passwort vergessen</h1>
        <p className="lead">Wir senden Ihnen einen Link, über den Sie ein neues Passwort festlegen.</p>
        <ForgotForm />
        <p className="small">
          <Link href="/konto/anmelden">Zurück zur Anmeldung</Link>
        </p>
      </div>
    </section>
  )
}
