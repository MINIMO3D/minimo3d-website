import type { Metadata } from 'next'
import Link from 'next/link'

import { ResetForm } from '@/components/konto/Forms'

export const metadata: Metadata = { title: 'Neues Passwort', robots: { index: false }, referrer: 'no-referrer' }

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ResetPage({ searchParams }: Props) {
  const { token } = await searchParams
  return (
    <section className="wrap section auth auth--single">
      <div className="auth__main">
        <p className="eyebrow">Kundenkonto</p>
        <h1 className="h1 h1--page">Neues Passwort festlegen</h1>
        {token ? (
          <ResetForm token={token} />
        ) : (
          <p className="lead">
            Dieser Link ist unvollständig. Bitte <Link href="/konto/passwort-vergessen">fordern Sie einen neuen an</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
