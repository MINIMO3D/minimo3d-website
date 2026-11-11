import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { LogoutButton } from '@/components/konto/Forms'
import { customerName, getCustomer, isB2B } from '@/lib/customer'

export const metadata: Metadata = { title: 'Kundenkonto', robots: { index: false } }

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer()
  if (!customer) redirect('/konto/anmelden')
  const b2b = isB2B(customer)
  return (
    <section className="wrap section portal">
      <header className="portal__head">
        <div>
          <p className="eyebrow">{b2b ? 'Geschäftskundenkonto' : 'Kundenkonto'}</p>
          <p className="portal__who">{b2b ? `${customer.company} · ${customerName(customer)}` : customerName(customer)}</p>
        </div>
        <nav className="portal__nav" aria-label="Kundenkonto">
          <Link href="/konto">Übersicht</Link>
          <Link href="/konto/bestellungen">Bestellungen</Link>
          <Link href="/konto/dateien">Dateien</Link>
          <Link href="/konto/profil">{b2b ? 'Firma und Adressen' : 'Profil und Adressen'}</Link>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </section>
  )
}
