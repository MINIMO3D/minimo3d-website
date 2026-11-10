import type { Metadata } from 'next'
import Link from 'next/link'

import { CtaBand, PageHead } from '@/components/Blocks'
import { articleCategories } from '@/collections/Articles'
import { findAll } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Wissen',
  description: 'Grundlagen und Praxiswissen zu FDM, SLA, 3D-Scan und zur Konstruktion für den 3D-Druck.',
}

export default async function KnowledgePage() {
  const articles = await findAll('articles', { sort: 'order', depth: 0 })
  return (
    <>
      <PageHead
        eyebrow="Wissen"
        title="3D-Druck verstehen."
        intro="Wie die Verfahren funktionieren, worauf es bei der Konstruktion ankommt und welches Material wofür taugt."
      />
      <section className="wrap section">
        <div className="grid grid--2" style={{ gap: 20 }}>
          {articles.map((a) => (
            <Link className="card card--white" key={a.id} href={`/wissen/${a.slug}`}>
              <span className="mono">{articleCategories.find((c) => c.value === a.category)?.label}</span>
              <h2 className="h3">{a.title}</h2>
              <p>{a.summary}</p>
              <span className="more">Artikel lesen →</span>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand title="Passt das zu Ihrem Bauteil?" />
    </>
  )
}
