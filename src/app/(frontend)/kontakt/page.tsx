import type { Metadata } from 'next'

import { InquirySection, PageHead } from '@/components/Blocks'
import { getSettings, telHref } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Bauteil anfragen, Datei senden oder anrufen: So erreichen Sie MINIMO3D in Neuhausen auf den Fildern.',
}

export default async function ContactPage() {
  const s = await getSettings()
  return (
    <>
      <PageHead
        eyebrow="Kontakt"
        title="Wir freuen uns auf Ihr Projekt."
        intro="Schreiben Sie uns, rufen Sie an oder senden Sie Ihre Datei direkt über das Formular. Sie erhalten innerhalb von 24 Stunden eine Antwort."
      />
      <section className="wrap section">
        <div className="advantages">
          <div className="rule">
            <span className="mono">Telefon</span>
            <h2 className="h3">
              <a href={telHref(s.phone)} style={{ color: 'inherit', textDecoration: 'none' }}>
                {s.phone}
              </a>
            </h2>
          </div>
          <div className="rule">
            <span className="mono">E-Mail</span>
            <h2 className="h3">
              <a href={`mailto:${s.email}`} style={{ color: 'inherit', textDecoration: 'none', overflowWrap: 'anywhere' }}>
                {s.email}
              </a>
            </h2>
          </div>
          <div className="rule">
            <span className="mono">Werkstatt</span>
            <h2 className="h3">{s.street}</h2>
            <p>{s.city}</p>
            {s.pickup && <p>{s.pickup}</p>}
          </div>
        </div>
      </section>
      <InquirySection />
    </>
  )
}
