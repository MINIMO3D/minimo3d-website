import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CtaBand, Figure, MaterialRow, PageHead, SpecTable } from '@/components/Blocks'
import { findAll, findBySlug } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

const ratingLabels: [string, string][] = [
  ['printability', 'Druckbarkeit'],
  ['stiffness', 'Steifigkeit'],
  ['toughness', 'Zähigkeit'],
  ['heat', 'Hitzebeständigkeit'],
  ['outdoor', 'Außentauglichkeit'],
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const m = await findBySlug('materials', slug)
  return m ? { title: m.name, description: m.summary } : {}
}

export default async function MaterialPage({ params }: Props) {
  const { slug } = await params
  const m = await findBySlug('materials', slug)
  if (!m) notFound()

  const related = (
    await findAll('materials', { sort: 'order', depth: 0, where: { family: { equals: m.family } } })
  ).filter((x) => x.id !== m.id)
  const ratings = ratingLabels
    .map(([key, label]) => ({ label, ...(m.ratings?.[key] || {}) }))
    .filter((r) => typeof r.score === 'number')

  return (
    <>
      <PageHead
        eyebrow={`${m.category} · ${m.process} · ${m.family}`}
        title={m.name}
        intro={m.headline || m.summary}
        crumbs={[{ href: '/materialien', label: 'Materialien' }]}
      />

      {(m.description || (m.image && typeof m.image === 'object')) && (
        <section className="wrap section grid grid--2">
          {m.description && <p className="lead">{m.description}</p>}
          {m.image && typeof m.image === 'object' && <Figure media={m.image} />}
        </section>
      )}

      {ratings.length > 0 && (
        <section className="band">
          <div className="wrap section stack">
            <h2 className="h2">Eigenschaften im Überblick</h2>
            <div className="ratings">
              {ratings.map((r) => (
                <div className="rating" key={r.label}>
                  <span className="rating__label">{r.label}</span>
                  <span className="rating__bar" role="img" aria-label={`${r.score} von 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} className={n <= r.score ? 'on' : undefined} />
                    ))}
                  </span>
                  {r.note && <span className="rating__note">{r.note}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(m.goodFor?.length > 0 || m.notFor?.length > 0) && (
        <section className="wrap section grid grid--2">
          {m.goodFor?.length > 0 && (
            <div className="stack" style={{ gap: 20 }}>
              <h2 className="h3">Geeignet für</h2>
              <ul className="checks">
                {m.goodFor.map((x: any, i: number) => (
                  <li key={i}>{x.text}</li>
                ))}
              </ul>
            </div>
          )}
          {m.notFor?.length > 0 && (
            <div className="stack" style={{ gap: 20 }}>
              <h2 className="h3">Nicht geeignet für</h2>
              <ul className="checks checks--no">
                {m.notFor.map((x: any, i: number) => (
                  <li key={i}>{x.text}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {m.specs?.length > 0 && (
        <section className="band">
          <div className="wrap section stack" style={{ gap: 28 }}>
            <h2 className="h2">Kennwerte</h2>
            <SpecTable rows={m.specs} />
            {m.specSource && <p className="small muted" style={{ maxWidth: 760 }}>{m.specSource}</p>}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="wrap section stack" style={{ gap: 24 }}>
          <h2 className="h3">Weitere Materialien: {m.family}</h2>
          <div className="rows">
            {related.map((x) => (
              <MaterialRow key={x.id} m={{ ...x, keywords: x.summary }} />
            ))}
          </div>
        </section>
      )}

      <CtaBand
        title={`Ein Bauteil aus ${m.name}?`}
        text="Senden Sie uns Ihre Datei oder beschreiben Sie das Teil. Wir prüfen, ob das Material zu Ihrem Einsatz passt."
      />
    </>
  )
}
