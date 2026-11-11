import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { RegisterForm } from '@/components/konto/Forms'
import { getCustomer } from '@/lib/customer'

export const metadata: Metadata = {
  title: 'Kundenkonto anlegen',
  description: 'Kundenkonto für Privat- und Geschäftskunden: Bestellungen verfolgen, 3D-Dateien speichern, nachbestellen.',
}

type Props = { searchParams: Promise<{ art?: string; weiter?: string }> }

export default async function RegisterPage({ searchParams }: Props) {
  const { art, weiter } = await searchParams
  if (await getCustomer()) redirect('/konto')
  return (
    <section className="wrap section auth">
      <div className="auth__main">
        <p className="eyebrow">Kundenkonto</p>
        <h1 className="h1 h1--page">Konto anlegen</h1>
        <RegisterForm initialType={art === 'firma' ? 'b2b' : 'b2c'} next={weiter} />
        <p className="small">
          Schon registriert? <Link href="/konto/anmelden">Anmelden</Link>
        </p>
      </div>
      <aside className="auth__side">
        <h2 className="h3">Für alle Kunden</h2>
        <ul className="ticks">
          <li>Bestellungen und Status im Blick</li>
          <li>3D-Dateien bleiben gespeichert</li>
          <li>Nachbestellen mit einem Klick</li>
          <li>Fertigungsanalyse jederzeit als PDF</li>
        </ul>
        <h2 className="h3">Zusätzlich für Geschäftskunden</h2>
        <ul className="ticks">
          <li>Nettopreise im Rechner und im Konto</li>
          <li>Bestellreferenz und Kostenstelle je Auftrag</li>
          <li>Individueller Rabatt nach Vereinbarung</li>
          <li>Kauf auf Rechnung nach Freischaltung</li>
        </ul>
      </aside>
    </section>
  )
}
