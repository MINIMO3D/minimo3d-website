'use client'

import Link from 'next/link'
import React, { useMemo, useState } from 'react'

export type CompareRow = {
  id: string
  name: string
  slug: string
  category: string
  family: string
  process: string
  summary: string
  ratings: Record<RatingKey, number | null>
  /** 1 = günstig … 4 = teuer, null = Preis auf Anfrage */
  price: number | null
  calc: boolean
}

type RatingKey = 'stiffness' | 'toughness' | 'heat' | 'outdoor' | 'printability'
type SortKey = RatingKey | 'price' | 'name'

const CRITERIA: { key: RatingKey; label: string; help: string }[] = [
  { key: 'stiffness', label: 'Steifigkeit', help: 'Wie wenig sich das Teil unter Last verformt.' },
  { key: 'toughness', label: 'Zähigkeit', help: 'Wie gut das Teil Schläge und Stöße aushält, ohne zu brechen.' },
  { key: 'heat', label: 'Hitzebeständigkeit', help: 'Bis zu welcher Temperatur das Teil seine Form behält.' },
  { key: 'outdoor', label: 'Außentauglichkeit', help: 'Wie gut das Material Sonne, Regen und Frost verträgt.' },
  { key: 'printability', label: 'Druckbarkeit', help: 'Wie zuverlässig sich feine Details und enge Maße drucken lassen.' },
]

const FILTERS = ['Alle', 'Standard', 'Technisch', 'Faserverstärkt', 'Flexibel', 'Harz (SLA)'] as const
const MAX_PICK = 3
const PRICE_LABEL = ['', 'günstig', 'mittel', 'gehoben', 'hoch']

function Bars({ value }: { value: number | null }) {
  if (value == null) return <span className="muted small">keine Angabe</span>
  return (
    <span className="bar5" role="img" aria-label={`${value} von 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= value ? 'on' : undefined} />
      ))}
    </span>
  )
}

function Price({ value }: { value: number | null }) {
  if (value == null) return <span className="muted small">auf Anfrage</span>
  return (
    <span className="price4" role="img" aria-label={`Preisniveau ${PRICE_LABEL[value]}`}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={n <= value ? 'on' : undefined}>
          €
        </span>
      ))}
    </span>
  )
}

export function MaterialCompare({ rows }: { rows: CompareRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Alle')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null)
  const [picked, setPicked] = useState<string[]>([])

  const visible = useMemo(() => {
    let list = rows.filter((r) =>
      filter === 'Alle' ? true : filter === 'Harz (SLA)' ? r.process === 'SLA' : r.category === filter && r.process !== 'SLA',
    )
    if (sort) {
      const value = (r: CompareRow) => (sort.key === 'name' ? r.name : sort.key === 'price' ? r.price : r.ratings[sort.key])
      list = [...list].sort((a, b) => {
        const x = value(a)
        const y = value(b)
        if (x == null && y == null) return 0
        if (x == null) return 1
        if (y == null) return -1
        const c = typeof x === 'string' ? x.localeCompare(y as string, 'de') : (x as number) - (y as number)
        return sort.dir === 'asc' ? c : -c
      })
    }
    return list
  }, [rows, filter, sort])

  const toggleSort = (key: SortKey) =>
    setSort((s) => {
      const first = key === 'name' || key === 'price' ? 'asc' : 'desc'
      if (!s || s.key !== key) return { key, dir: first }
      if (s.dir === first) return { key, dir: first === 'asc' ? 'desc' : 'asc' }
      return null
    })

  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_PICK ? p : [...p, id]))

  const chosen = picked.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as CompareRow[]

  const header = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort?.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="sortbtn" onClick={() => toggleSort(key)}>
        {label}
        <span className="sortbtn__icon" aria-hidden="true">
          {sort?.key === key ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </button>
    </th>
  )

  return (
    <div className="compare">
      <div className="compare__bar">
        <div className="compare__filters" role="group" aria-label="Materialgruppe">
          {FILTERS.map((f) => (
            <button key={f} type="button" className={`chip${filter === f ? ' chip--on' : ''}`} aria-pressed={filter === f} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
        <p className="small muted" aria-live="polite">
          {visible.length} von {rows.length} Materialien
        </p>
      </div>

      {chosen.length > 0 && (
        <section className="panel duel" aria-label="Direktvergleich">
          <div className="panel__head">
            <h2 className="h3">Direktvergleich</h2>
            <button type="button" className="linkbtn" onClick={() => setPicked([])}>
              Auswahl aufheben
            </button>
          </div>
          {chosen.length === 1 && (
            <p className="muted">Wählen Sie in der Tabelle ein zweites Material, um beide nebeneinander zu sehen.</p>
          )}
          <div className="tablebox">
            <table className="duel__table">
              <thead>
                <tr>
                  <td />
                  {chosen.map((r) => (
                    <th key={r.id} scope="col">
                      <Link href={`/materialien/${r.slug}`}>{r.name}</Link>
                      <span className="duel__sub">
                        {r.category} · {r.process}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRITERIA.map((c) => {
                  const best = Math.max(...chosen.map((r) => r.ratings[c.key] ?? 0))
                  return (
                    <tr key={c.key}>
                      <th scope="row">{c.label}</th>
                      {chosen.map((r) => (
                        <td key={r.id} className={chosen.length > 1 && r.ratings[c.key] === best && best > 0 ? 'duel__best' : undefined}>
                          <Bars value={r.ratings[c.key]} />
                        </td>
                      ))}
                    </tr>
                  )
                })}
                <tr>
                  <th scope="row">Preisniveau</th>
                  {chosen.map((r) => (
                    <td key={r.id}>
                      <Price value={r.price} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Wofür</th>
                  {chosen.map((r) => (
                    <td key={r.id} className="duel__text">
                      {r.summary}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td />
                  {chosen.map((r) => (
                    <td key={r.id}>
                      {r.calc ? (
                        <Link className="btn btn--primary btn--small" href={`/preisrechner?material=${r.slug}`}>
                          Preis berechnen
                        </Link>
                      ) : (
                        <Link className="btn btn--ghost btn--small" href="/kontakt#anfrage">
                          Anfragen
                        </Link>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="tablebox compare__box">
        <table className="compare__table">
          <thead>
            <tr>
              <th scope="col" className="compare__pick">
                <span className="sr-only">Zum Direktvergleich auswählen</span>
              </th>
              {header('name', 'Material')}
              {CRITERIA.map((c) => (
                <React.Fragment key={c.key}>{header(c.key, c.label)}</React.Fragment>
              ))}
              {header('price', 'Preis')}
              <th scope="col">Wofür</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const on = picked.includes(r.id)
              return (
                <tr key={r.id} className={on ? 'is-picked' : undefined}>
                  <td className="compare__pick">
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={!on && picked.length >= MAX_PICK}
                      onChange={() => togglePick(r.id)}
                      aria-label={`${r.name} zum Direktvergleich auswählen`}
                    />
                  </td>
                  <th scope="row" className="compare__name">
                    <Link href={`/materialien/${r.slug}`}>
                      {r.name} <span aria-hidden="true">→</span>
                    </Link>
                    <span className="compare__sub">{r.process === 'SLA' ? `${r.category} · SLA` : r.category}</span>
                  </th>
                  {CRITERIA.map((c) => (
                    <td key={c.key}>
                      <Bars value={r.ratings[c.key]} />
                    </td>
                  ))}
                  <td>
                    <Price value={r.price} />
                  </td>
                  <td className="compare__text">{r.summary}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        Bis zu drei Materialien ankreuzen, um sie direkt nebeneinander zu sehen. Ein Klick auf eine Spaltenüberschrift
        sortiert die Tabelle.
      </p>

      <dl className="legend">
        {CRITERIA.map((c) => (
          <div key={c.key}>
            <dt>{c.label}</dt>
            <dd>{c.help}</dd>
          </div>
        ))}
        <div>
          <dt>Preis</dt>
          <dd>Preisniveau im Vergleich zu PLA Basic, bei gleichem Bauteil. Den genauen Preis zeigt der Preisrechner.</dd>
        </div>
      </dl>
    </div>
  )
}
