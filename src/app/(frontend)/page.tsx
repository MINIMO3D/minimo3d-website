import Link from 'next/link'

import { Faq, InquirySection, MaterialRow, Steps } from '@/components/Blocks'
import { HeroVideo } from '@/components/HeroVideo'
import { findAll, getHomepage, getSettings, mediaUrl } from '@/lib/data'

export default async function HomePage() {
  const [home, s, services, materials, total] = await Promise.all([
    getHomepage(),
    getSettings(),
    findAll('services', { sort: 'order', depth: 0 }),
    findAll('materials', { sort: 'order', depth: 0, where: { featured: { equals: true } } }),
    findAll('materials', { depth: 0, select: { name: true } }),
  ])
  const heroImage = mediaUrl(home.image)
  const materialsImage = mediaUrl(home.materialsImage)

  return (
    <>
      <section className="hero">
        <div className="hero__banner">
          <HeroVideo
            src={(typeof home.heroVideo === 'object' && home.heroVideo?.url) || '/video/hero.mp4'}
            poster={heroImage || '/video/hero-poster.jpg'}
          />
          <div className="wrap hero__content">
            {home.eyebrow && <p className="eyebrow">{home.eyebrow}</p>}
            <h1 className="h1">{home.headline}</h1>
            {home.text && <p className="lead">{home.text}</p>}
            <div className="btns">
              <Link className="btn btn--primary" href="/preisrechner">
                {home.heroButtonLabel || 'Sofortangebot'}
              </Link>
              <Link className="btn btn--onvideo" href="/materialien">
                Materialien vergleichen
              </Link>
            </div>
            {s.priceNote && <p className="small hero__note">{s.priceNote}</p>}
          </div>
        </div>
        {home.stats?.length > 0 && (
          <div className="stats">
            <div className="wrap stats__grid">
              {home.stats.map((x: any, i: number) => (
                <div className="stat" key={i}>
                  <span className="stat__value">{x.value}</span>
                  <span className="stat__label">{x.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {home.advantages?.length > 0 && (
        <section className="wrap section">
          <div className="advantages">
            {home.advantages.map((a: any, i: number) => {
              const src = mediaUrl(a.image, 'card')
              return (
                <div className={src ? 'adv' : 'rule'} key={i}>
                  {src && (
                    <img
                      className="adv__img"
                      src={src}
                      alt={a.image.alt || ''}
                      width={a.image.width}
                      height={a.image.height}
                      loading="lazy"
                    />
                  )}
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="h3">{a.title}</h2>
                  <p>{a.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="band">
        <div className="wrap section stack">
          <div className="head">
            <div className="head__text">
              <p className="eyebrow">Leistungen</p>
              <h2 className="h2">{home.servicesHeadline || 'Leistungen'}</h2>
            </div>
            <Link className="more" href="/leistungen">
              Alle Leistungen entdecken →
            </Link>
          </div>
          <div className="grid grid--4">
            {services.map((x) => (
              <Link className="card" key={x.id} href={`/leistungen/${x.slug}`}>
                {x.spec && <span className="mono">{x.spec}</span>}
                <h3 className="h3">{x.title}</h3>
                <p>{x.summary}</p>
              </Link>
            ))}
          </div>
          {home.servicesNote && <p className="muted">{home.servicesNote}</p>}
        </div>
      </section>

      <section className="wrap section stack">
        <div className={materialsImage ? 'split' : 'head'}>
          <div className="head__text">
            <p className="eyebrow">Materialien</p>
            <h2 className="h2">{home.materialsHeadline || 'Materialien'}</h2>
            {home.materialsText && <p>{home.materialsText}</p>}
            <Link className="more" href="/materialien">
              Alle {total.length} Materialien vergleichen →
            </Link>
          </div>
          {materialsImage && (
            <figure className="split__figure">
              <img
                src={materialsImage}
                alt={home.materialsImage.alt || ''}
                width={home.materialsImage.width}
                height={home.materialsImage.height}
                loading="lazy"
              />
              {home.materialsImageCaption && <figcaption>{home.materialsImageCaption}</figcaption>}
            </figure>
          )}
        </div>
        <div className="rows">
          {materials.map((m) => (
            <MaterialRow key={m.id} m={m} />
          ))}
        </div>
      </section>

      {home.steps?.length > 0 && (
        <section className="band">
          <div className="wrap section stack">
            <div className="head__text">
              <p className="eyebrow">Ablauf</p>
              <h2 className="h2">{home.stepsHeadline || 'Ablauf'}</h2>
            </div>
            <Steps items={home.steps} />
          </div>
        </section>
      )}

      {home.faq?.length > 0 && (
        <section className="wrap section grid grid--2">
          <div className="head__text">
            <p className="eyebrow">FAQ</p>
            <h2 className="h2">Häufige Fragen</h2>
            <p>
              Mehr zu Verfahren und Konstruktion finden Sie im <Link href="/wissen">Wissensbereich</Link>.
            </p>
          </div>
          <Faq items={home.faq} />
        </section>
      )}

      <InquirySection />
    </>
  )
}
