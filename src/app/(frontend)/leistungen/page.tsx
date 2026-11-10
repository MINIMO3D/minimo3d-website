import type { Metadata } from 'next'
import Link from 'next/link'

import { CtaBand, PageHead } from '@/components/Blocks'
import { findAll, getHomepage } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Leistungen',
  description: 'FDM- und SLA-3D-Druck, 3D-Scan und Machbarkeitsanalyse aus einer Werkstatt bei Stuttgart.',
}

export default async function ServicesPage() {
  const [services, home] = await Promise.all([findAll('services', { sort: 'order', depth: 0 }), getHomepage()])
  return (
    <>
      <PageHead
        eyebrow="Leistungen"
        title={home.servicesHeadline || 'Leistungen'}
        intro="Vom ersten Prototyp bis zur Kleinserie: Druck, Scan und Beratung kommen bei uns aus einer Hand."
      />
      <section className="wrap section stack">
        <div className="grid grid--2" style={{ gap: 20 }}>
          {services.map((x) => (
            <Link className="card card--white" key={x.id} href={`/leistungen/${x.slug}`}>
              {x.spec && <span className="mono">{x.spec}</span>}
              <h2 className="h3">{x.title}</h2>
              <p>{x.summary}</p>
              <span className="more">Mehr erfahren →</span>
            </Link>
          ))}
        </div>
        {home.servicesNote && <p className="muted">{home.servicesNote}</p>}
      </section>
      <CtaBand />
    </>
  )
}
