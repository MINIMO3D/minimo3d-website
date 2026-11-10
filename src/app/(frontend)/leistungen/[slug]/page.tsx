import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CtaBand, Faq, Figure, PageHead, SpecTable, Steps } from '@/components/Blocks'
import { findBySlug } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const x = await findBySlug('services', slug)
  return x ? { title: x.title, description: x.summary } : {}
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const x = await findBySlug('services', slug)
  if (!x) notFound()

  return (
    <>
      <PageHead
        eyebrow={x.title}
        title={x.headline || x.title}
        intro={x.intro || x.summary}
        crumbs={[{ href: '/leistungen', label: 'Leistungen' }]}
      />

      {x.image && typeof x.image === 'object' && (
        <section className="wrap" style={{ paddingTop: 'var(--section)' }}>
          <Figure media={x.image} />
        </section>
      )}

      {x.useCases?.length > 0 && (
        <section className="wrap section stack">
          <h2 className="h2">Drei typische Ausgangspunkte</h2>
          <div className="advantages">
            {x.useCases.map((u: any, i: number) => (
              <div className="rule" key={i}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <h3>{u.title}</h3>
                {u.text && <p>{u.text}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {(x.specs?.length > 0 || x.features?.length > 0) && (
        <section className="band">
          <div className="wrap section grid grid--2">
            <div className="stack" style={{ gap: 24 }}>
              <h2 className="h2">Was technisch möglich ist</h2>
              {x.features?.length > 0 && (
                <ul className="checks">
                  {x.features.map((f: any, i: number) => (
                    <li key={i}>{f.text}</li>
                  ))}
                </ul>
              )}
              {x.noteText && (
                <div className="note">
                  {x.noteTitle && <h3 className="h3">{x.noteTitle}</h3>}
                  <p>{x.noteText}</p>
                </div>
              )}
            </div>
            <SpecTable rows={x.specs} />
          </div>
        </section>
      )}

      {x.steps?.length > 0 && (
        <section className="wrap section stack">
          <h2 className="h2">{x.stepsTitle || 'Ablauf'}</h2>
          <Steps items={x.steps} />
        </section>
      )}

      {x.faq?.length > 0 && (
        <section className="band">
          <div className="wrap section grid grid--2">
            <div className="head__text">
              <p className="eyebrow">FAQ</p>
              <h2 className="h2">Häufige Fragen</h2>
            </div>
            <Faq items={x.faq} />
          </div>
        </section>
      )}

      <CtaBand />
    </>
  )
}
