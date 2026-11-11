import type { Metadata } from 'next'
import Link from 'next/link'

import { PageHead } from '@/components/Blocks'
import { Calculator } from '@/components/calculator/Calculator'
import { getCalcSetup } from '@/lib/calc-server'
import { stripeEnabled, stripeTestMode } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Preisrechner und Sofortangebot',
  description:
    '3D-Datei hochladen, Material und Ausführung wählen, Preis sofort sehen und direkt bestellen. Mit 3D-Ansicht und Fertigungsanalyse als PDF.',
}

type Props = { searchParams: Promise<{ material?: string; abgebrochen?: string }> }

export default async function CalculatorPage({ searchParams }: Props) {
  const [params, setup] = await Promise.all([searchParams, getCalcSetup()])

  return (
    <>
      <PageHead
        eyebrow="Preisrechner"
        title="Sofortangebot für Ihr Bauteil."
        intro="Datei hochladen, Material und Ausführung wählen, Preis sofort sehen. Die Fertigungsanalyse zeigt, ob sich das Teil gut drucken lässt, und Sie bestellen direkt online."
      />
      <section className="wrap section">
        {params.abgebrochen && (
          <p className="form__msg form__msg--err" style={{ marginBottom: 24 }}>
            Die Zahlung wurde abgebrochen. Es wurde nichts abgebucht. Sie können die Datei erneut hochladen und es noch
            einmal versuchen.
          </p>
        )}
        {setup.enabled ? (
          <Calculator
            materials={setup.materials}
            config={setup.config}
            checkoutEnabled={stripeEnabled()}
            testMode={stripeTestMode()}
            initialMaterial={params.material}
          />
        ) : (
          <div className="calc__empty">
            <p>Der Preisrechner ist gerade nicht verfügbar. Senden Sie uns Ihr Bauteil bitte als Anfrage.</p>
            <Link className="btn btn--primary" href="/kontakt#anfrage">
              Bauteil anfragen
            </Link>
          </div>
        )}
      </section>
      <section className="band">
        <div className="wrap section advantages">
          <div className="rule">
            <span className="mono">Preis</span>
            <h2 className="h3">So setzt sich der Preis zusammen</h2>
            <p>
              Material nach Gewicht, Druckzeit nach Maschinenstunden und einmal je Bestellung die Auftragspauschale für
              Prüfung, Abwicklung und Verpackung. Ab 5, 10 und 25 Stück sinkt der Stückpreis.
            </p>
          </div>
          <div className="rule">
            <span className="mono">Prüfung</span>
            <h2 className="h3">Wir sehen uns jede Datei an</h2>
            <p>
              Die Fertigungsanalyse ist eine automatische Vorprüfung. Vor dem Druck prüfen wir Ihr Modell von Hand und
              melden uns, falls etwas angepasst werden sollte.
            </p>
          </div>
          <div className="rule">
            <span className="mono">Größer oder anders</span>
            <h2 className="h3">SLA, große Teile, Nachbearbeitung</h2>
            <p>
              Der Rechner deckt den FDM-Druck ab. Für SLA-Harze, Teile über dem Bauraum, Lackierung oder Gewindeeinsätze
              senden Sie uns bitte eine <Link href="/kontakt#anfrage">Anfrage</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
