import Link from 'next/link'

const links = [
  { href: '/leistungen', label: 'Leistungen' },
  { href: '/materialien', label: 'Materialien' },
  { href: '/wissen', label: 'Wissen' },
  { href: '/ueber-uns', label: 'Über uns' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function Header() {
  return (
    <header className="header">
      <a className="skip" href="#inhalt">
        Zum Inhalt springen
      </a>
      <div className="wrap header__inner">
        <Link className="logo" href="/">
          <img src="/logo.svg" alt="MINIMO3D Additive Manufacturing" width={180} height={40} />
        </Link>
        <nav className="nav" aria-label="Hauptnavigation">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <Link className="btn btn--primary btn--small" href="/kontakt#anfrage">
            Bauteil anfragen
          </Link>
        </nav>
      </div>
    </header>
  )
}
