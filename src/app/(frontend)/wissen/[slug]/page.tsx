import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CtaBand, Figure, PageHead } from '@/components/Blocks'
import { articleCategories } from '@/collections/Articles'
import { findBySlug } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const a = await findBySlug('articles', slug)
  return a ? { title: a.title, description: a.summary } : {}
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const a = await findBySlug('articles', slug)
  if (!a) notFound()

  const meta = [
    a.author,
    a.updated && `Stand ${new Date(a.updated).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}`,
    a.readingTime && `${a.readingTime} Min. Lesezeit`,
  ].filter(Boolean)

  return (
    <>
      <PageHead
        eyebrow={articleCategories.find((c) => c.value === a.category)?.label}
        title={a.title}
        intro={a.summary}
        crumbs={[{ href: '/wissen', label: 'Wissen' }]}
      >
        {meta.length > 0 && <p className="small muted">{meta.join(' · ')}</p>}
      </PageHead>
      <section className="wrap section stack">
        {a.image && typeof a.image === 'object' && <Figure media={a.image} />}
        {a.content && (
          <div className="prose">
            <RichText data={a.content} />
          </div>
        )}
      </section>
      <CtaBand title="Passt das zu Ihrem Bauteil?" />
    </>
  )
}
