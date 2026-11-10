import Link from 'next/link'
import React from 'react'

import { getHomepage, getSettings, mediaUrl, telHref } from '@/lib/data'
import { InquiryForm } from './InquiryForm'

export function Faq({ items }: { items?: { question: string; answer: string }[] }) {
  if (!items?.length) return null
  return (
    <div className="faq">
      {items.map((f, i) => (
        <details key={i} open={i === 0}>
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  )
}

export function Steps({ items }: { items?: { title: string; text?: string }[] }) {
  if (!items?.length) return null
  return (
    <ol className="steps">
      {items.map((s, i) => (
        <li key={i}>
          <span className="steps__num" aria-hidden="true">
            {i + 1}
          </span>
          <h3 className="h3">{s.title}</h3>
          {s.text && <p>{s.text}</p>}
        </li>
      ))}
    </ol>
  )
}

export function SpecTable({ rows }: { rows?: { label: string; value: string }[] }) {
  if (!rows?.length) return null
  return (
    <div className="tablebox">
      <table className="specs">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <th scope="row">{r.label}</th>
              <td>{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PageHead({
  eyebrow,
  title,
  intro,
  crumbs,
  children,
}: {
  eyebrow?: string
  title: string
  intro?: string
  crumbs?: { href: string; label: string }[]
  children?: React.ReactNode
}) {
  return (
    <section className="pagehead">
      <div className="wrap pagehead__inner">
        {crumbs && (
          <nav className="crumbs" aria-label="Brotkrumen">
            <Link href="/">Start</Link>
            {crumbs.map((c) => (
              <React.Fragment key={c.href}>
                <span aria-hidden="true">/</span>
                <Link href={c.href}>{c.label}</Link>
              </React.Fragment>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="h1 h1--page">{title}</h1>
        {intro && <p className="lead">{intro}</p>}
        {children}
      </div>
    </section>
  )
}

export function Figure({ media }: { media: any }) {
  const url = mediaUrl(media)
  if (!url) return null
  return (
    <figure className="figure" style={{ margin: 0 }}>
      <img src={url} alt={media.alt || ''} width={media.width} height={media.height} loading="lazy" />
    </figure>
  )
}

export function MaterialRow({ m }: { m: any }) {
  return (
    <Link className="row" href={`/materialien/${m.slug}`}>
      <span className="row__name">{m.name}</span>
      <span className="row__tag">{m.category}</span>
      <span className="row__text">{m.keywords || m.summary}</span>
    </Link>
  )
}

export function CtaBand({ title, text }: { title?: string; text?: string }) {
  return (
    <section className="cta">
      <div className="wrap cta__inner">
        <div>
          <h2 className="h2">{title || 'Passt das zu Ihrem Vorhaben?'}</h2>
          <p>{text || 'Senden Sie uns Ihre Datei oder beschreiben Sie das Teil. Wir prüfen, welcher Weg sinnvoll ist.'}</p>
        </div>
        <Link className="btn btn--primary" href="/kontakt#anfrage">
          Bauteil anfragen
        </Link>
      </div>
    </section>
  )
}

export async function InquirySection() {
  const [s, home] = await Promise.all([getSettings(), getHomepage()])
  return (
    <section className="inquiry" id="anfrage">
      <div className="wrap inquiry__grid">
        <div className="inquiry__text">
          <p className="eyebrow">Anfrage</p>
          <h2 className="h2">{home.inquiryHeadline || 'Erzählen Sie uns, was Ihr Bauteil leisten soll.'}</h2>
          {home.inquiryText && <p className="inquiry__lead">{home.inquiryText}</p>}
          <div className="inquiry__contact">
            {s.phone && <a href={telHref(s.phone)}>{s.phone}</a>}
            {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
            {s.pickup && <span>{s.pickup}</span>}
          </div>
        </div>
        <InquiryForm />
      </div>
    </section>
  )
}
