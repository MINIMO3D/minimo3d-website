import type { Metadata } from 'next'
import Link from 'next/link'

import { CtaBand, PageHead } from '@/components/Blocks'
import { MaterialCompare, type CompareRow } from '@/components/MaterialCompare'
import { findAll } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Materialien vergleichen',
  description:
    'Alle Materialien im direkten Vergleich: Steifigkeit, Zähigkeit, Hitzebeständigkeit, Außentauglichkeit, Druckbarkeit und Preisniveau.',
}

// Preisniveau aus den Werten des Preisrechners, bezogen auf PLA Basic
const priceLevel = (m: any, base: number): number | null => {
  const c = m.calc
  if (!c?.enabled || !(c.pricePerKg > 0) || !(c.density > 0) || !(base > 0)) return null
  const index = (c.pricePerKg * c.density * (c.priceFactor > 0 ? c.priceFactor : 1)) / base
  return index < 1.2 ? 1 : index < 1.8 ? 2 : index < 3.2 ? 3 : 4
}

export default async function ComparePage() {
  const materials = await findAll('materials', { sort: 'order', depth: 0 })
  const ref = materials.find((m) => m.slug === 'pla-basic')?.calc
  const base = ref?.pricePerKg > 0 && ref?.density > 0 ? ref.pricePerKg * ref.density : 45 * 1.24

  const rows: CompareRow[] = materials.map((m) => ({
    id: String(m.id),
    name: m.name,
    slug: m.slug,
    category: m.category,
    family: m.family,
    process: m.process,
    summary: m.summary,
    ratings: {
      stiffness: m.ratings?.stiffness?.score ?? null,
      toughness: m.ratings?.toughness?.score ?? null,
      heat: m.ratings?.heat?.score ?? null,
      outdoor: m.ratings?.outdoor?.score ?? null,
      printability: m.ratings?.printability?.score ?? null,
    },
    price: priceLevel(m, base),
    calc: Boolean(m.calc?.enabled),
  }))

  return (
    <>
      <PageHead
        eyebrow="Materialien"
        title="Materialien vergleichen."
        intro={`${rows.length} Materialien nebeneinander. Sortieren Sie nach der Eigenschaft, die für Ihr Bauteil zählt, oder stellen Sie bis zu drei Materialien direkt gegenüber.`}
        crumbs={[{ href: '/materialien', label: 'Materialien' }]}
      />
      <section className="wrap wrap--wide section">
        <MaterialCompare rows={rows} />
      </section>
      <section className="band">
        <div className="wrap section advantages">
          <div className="rule">
            <span className="mono">Draußen</span>
            <h2 className="h3">Sonne, Regen, Frost</h2>
            <p>
              Sortieren Sie nach Außentauglichkeit. ASA ist hier die übliche Wahl, mit Carbonfasern auch für steife Teile.
            </p>
          </div>
          <div className="rule">
            <span className="mono">Wärme</span>
            <h2 className="h3">Im Motorraum oder am Gerät</h2>
            <p>PLA wird ab etwa 60 °C weich. Für warme Umgebungen sortieren Sie nach Hitzebeständigkeit.</p>
          </div>
          <div className="rule">
            <span className="mono">Belastung</span>
            <h2 className="h3">Steif oder zäh?</h2>
            <p>
              Steife Materialien verformen sich wenig, brechen aber eher. Zähe geben nach und halten Schläge aus. Die
              meisten Funktionsteile brauchen von beidem etwas.
            </p>
          </div>
          <div className="rule">
            <span className="mono">Unsicher?</span>
            <h2 className="h3">Wir schlagen ein Material vor</h2>
            <p>
              Beschreiben Sie uns Einsatz, Last und Umgebung. <Link href="/kontakt#anfrage">Zur Anfrage</Link>
            </p>
          </div>
        </div>
      </section>
      <CtaBand title="Material gefunden?" text="Laden Sie Ihre Datei hoch und sehen Sie den Preis sofort, oder senden Sie uns eine Anfrage." />
    </>
  )
}
