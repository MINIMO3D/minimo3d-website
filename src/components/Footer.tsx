import Link from 'next/link'

import { findAll, getSettings } from '@/lib/data'

export async function Footer() {
  const [s, services] = await Promise.all([getSettings(), findAll('services', { sort: 'order', depth: 0 })])
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div className="footer__grid">
          <div className="footer__col">
            <img src="/logo-white.png" alt="MINIMO3D Additive Manufacturing" width={185} height={34} />
            <span>{s.street}</span>
            <span>{s.city}</span>
          </div>
          <div className="footer__col">
            <span className="footer__title">Leistungen</span>
            {services.map((x) => (
              <Link key={x.id} href={`/leistungen/${x.slug}`}>
                {x.title}
              </Link>
            ))}
          </div>
          <div className="footer__col">
            <span className="footer__title">Unternehmen</span>
            <Link href="/ueber-uns">Über uns</Link>
            <Link href="/materialien">Materialien</Link>
            <Link href="/wissen">Wissen</Link>
            <Link href="/3d-druck-stuttgart">3D-Druck Stuttgart</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
          {s.social?.length > 0 && (
            <div className="footer__col">
              <span className="footer__title">Folgen</span>
              {s.social.map((x: any) => (
                <a key={x.url} href={x.url} rel="noopener noreferrer" target="_blank">
                  {x.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="footer__bottom">
          <span>
            © {new Date().getFullYear()} {s.company}
          </span>
          <div className="footer__legal">
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/agb">AGB</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
