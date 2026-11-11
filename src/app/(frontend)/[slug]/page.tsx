import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CtaBand, Faq, Figure, PageHead } from '@/components/Blocks'
import { findBySlug, getSettings, mediaUrl } from '@/lib/data'

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

  // Auf der Seite "Über uns" erscheint der Inhaber mit Foto aus den Firmendaten.
  const s = slug === 'ueber-uns' ? await getSettings() : null
  const photo = s ? mediaUrl(s.ownerPhoto, 'card') : null
  const linkedin = typeof s?.ownerLinkedin === 'string' && /^https:\/\//.test(s.ownerLinkedin) ? s.ownerLinkedin : null

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
      {s?.owner && (
        <section className="wrap" style={{ paddingBottom: 'var(--section)' }}>
          <div className="owner">
            <h2 className="h2">Inhaber</h2>
            <div className="owner__card">
              {photo &&
                (linkedin ? (
                  <a className="owner__photo" href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${s.owner} auf LinkedIn`}>
                    <img src={photo} alt={s.ownerPhoto.alt || s.owner} width={160} height={160} loading="lazy" />
                  </a>
                ) : (
                  <span className="owner__photo">
                    <img src={photo} alt={s.ownerPhoto.alt || s.owner} width={160} height={160} loading="lazy" />
                  </span>
                ))}
              <div className="owner__text">
                <p className="h3">{s.owner}</p>
                <p className="muted">
                  {s.ownerTitle ? `${s.ownerTitle} bei ${s.company}` : `Inhaber von ${s.company}`}
                </p>
                {linkedin && (
                  <a className="more" href={linkedin} target="_blank" rel="noopener noreferrer">
                    Profil auf LinkedIn →
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
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
