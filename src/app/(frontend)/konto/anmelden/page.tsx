import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/konto/Forms'
import { getCustomer } from '@/lib/customer'

export const metadata: Metadata = { title: 'Anmelden', robots: { index: false } }

type Props = { searchParams: Promise<{ weiter?: string }> }

export default async function LoginPage({ searchParams }: Props) {
  const { weiter } = await searchParams
  if (await getCustomer()) redirect('/konto')
  const q = weiter ? `&weiter=${encodeURIComponent(weiter)}` : ''
  return (
    <section className="wrap section auth">
      <div className="auth__main">
        <p className="eyebrow">Kundenkonto</p>
        <h1 className="h1 h1--page">Anmelden</h1>
        <LoginForm next={weiter} />
      </div>
      <aside className="auth__side">
        <h2 className="h3">Noch kein Konto?</h2>
        <p>Mit einem Konto sehen Sie Ihre Bestellungen, speichern 3D-Dateien und bestellen mit einem Klick nach.</p>
        <div className="actions">
          <Link className="btn btn--ghost" href={`/konto/registrieren?art=privat${q}`}>
            Als Privatkunde registrieren
          </Link>
          <Link className="btn btn--ghost" href={`/konto/registrieren?art=firma${q}`}>
            Als Geschäftskunde registrieren
          </Link>
        </div>
        <p className="small muted">Sie können weiterhin ohne Konto bestellen.</p>
      </aside>
    </section>
  )
}
