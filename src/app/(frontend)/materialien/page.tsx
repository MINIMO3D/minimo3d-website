import type { Metadata } from 'next'
import Link from 'next/link'

import { CtaBand, MaterialRow, PageHead } from '@/components/Blocks'
import { findAll, getHomepage } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Materialien',
  description: 'Alle Materialien für FDM- und SLA-Druck im Überblick: von PLA über PETG, ASA und Polyamid bis zu faserverstärkten Kunststoffen und Harzen.',
}

const order = ['PLA', 'PETG', 'ABS / ASA', 'PC', 'PP', 'Nylon (PA)', 'Faserverstärkt', 'TPU (flexibel)', 'Harz (SLA)']

export default async function MaterialsPage() {
  const [materials, home] = await Promise.all([findAll('materials', { sort: 'order', depth: 0 }), getHomepage()])
  const families = [...new Set([...order, ...materials.map((m) => m.family)])].filter((f) =>
    materials.some((m) => m.family === f),
  )
  const fdm = materials.filter((m) => m.process === 'FDM').length
  const sla = materials.length - fdm

  return (
    <>
      <PageHead
        eyebrow="Materialien"
        title={home.materialsHeadline || 'Materialien'}
        intro={`${materials.length} Materialien stehen zur Wahl: ${fdm} Kunststoffe für den FDM-Druck und ${sla} Harze für den SLA-Druck. Wir schlagen Ihnen anhand von Belastung, Temperatur und Oberfläche das passende vor.`}
      />
      <section className="wrap section stack">
        <div className="note" style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px 32px' }}>
          <p>
            <strong>Alle Materialien nebeneinander:</strong> Steifigkeit, Zähigkeit, Hitze, Außeneinsatz und Preisniveau im Vergleich.
          </p>
          <Link className="btn btn--primary" href="/materialien/vergleich">
            Materialien vergleichen
          </Link>
        </div>
        {families.map((f) => (
          <div className="family" key={f}>
            <h2 className="h3">{f}</h2>
            <div className="rows">
              {materials
                .filter((m) => m.family === f)
                .map((m) => (
                  <MaterialRow key={m.id} m={{ ...m, keywords: m.summary }} />
                ))}
            </div>
          </div>
        ))}
      </section>
      <CtaBand
        title="Unsicher, welches Material passt?"
        text="Beschreiben Sie uns den Einsatz Ihres Bauteils. Wir empfehlen Ihnen ein Material und begründen die Wahl."
      />
    </>
  )
}
