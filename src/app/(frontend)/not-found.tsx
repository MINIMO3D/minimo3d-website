import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="wrap section stack" style={{ gap: 24 }}>
      <p className="eyebrow">Fehler 404</p>
      <h1 className="h1 h1--page">Diese Seite gibt es nicht.</h1>
      <p className="lead">Vielleicht wurde sie verschoben. Über die Startseite finden Sie alle Inhalte.</p>
      <div className="btns">
        <Link className="btn btn--primary" href="/">
          Zur Startseite
        </Link>
        <Link className="btn btn--ghost" href="/kontakt">
          Kontakt
        </Link>
      </div>
    </section>
  )
}
