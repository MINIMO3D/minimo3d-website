import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CtaBand, Faq, Figure, PageHead } from '@/components/Blocks'
import { findBySlug } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await findBySlug('pages', slug)
  return page ? { title: page.title, description: page.intro || undefined } : {}
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params
  const page = await findBySlug('pages', slug)
  if (!page) notFound()

  return (
    <>
      <PageHead eyebrow={page.eyebrow} title={page.title} intro={page.intro} />
      <section className="wrap section stack">
        {page.image && typeof page.image === 'object' && <Figure media={page.image} />}
        {page.content && (
          <div className="prose">
            <RichText data={page.content} />
          </div>
        )}
      </section>
      {page.faq?.length > 0 && (
        <section className="band">
          <div className="wrap section grid grid--2">
            <div className="head__text">
              <p className="eyebrow">FAQ</p>
              <h2 className="h2">Häufige Fragen</h2>
            </div>
            <Faq items={page.faq} />
          </div>
        </section>
      )}
      {page.showInquiry && <CtaBand />}
    </>
  )
}
