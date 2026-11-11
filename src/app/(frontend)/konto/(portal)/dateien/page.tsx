import Link from 'next/link'

import { DfmButton, RemoveFileButton } from '@/components/konto/Forms'
import { getCalcSetup } from '@/lib/calc-server'
import { requireCustomer } from '@/lib/customer'
import { dateDe, getFiles } from '@/lib/portal'

const num = (v: number, d = 1) => Number(v || 0).toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })

export default async function FilesPage() {
  const customer = await requireCustomer()
  const [{ files }, setup] = await Promise.all([getFiles(customer, 200), getCalcSetup()])
  const defaultMaterial = setup.materials[0]
  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="panel__head">
        <h1 className="h2">Gespeicherte Dateien</h1>
        <Link className="btn btn--primary btn--small" href="/preisrechner">
          Neue Datei hochladen
        </Link>
      </div>
      <p className="muted">
        Jede Datei, die Sie angemeldet im Preisrechner hochladen, bleibt hier gespeichert, bis Sie sie entfernen. Sie können sie jederzeit mit anderer
        Ausführung oder Stückzahl neu berechnen.
      </p>
      {files.length ? (
        <div className="tablebox">
          <table className="list">
            <thead>
              <tr>
                <th>Datei</th>
                <th>Hochgeladen</th>
                <th>Maße</th>
                <th>Volumen</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => {
                const m = f.metrics || {}
                return (
                  <tr key={f.id}>
                    <td>
                      <Link href={`/preisrechner?datei=${f.token}`}>{f.fileName}</Link>
                      {f.ordered && (
                        <>
                          <br />
                          <span className="small muted">bereits bestellt</span>
                        </>
                      )}
                    </td>
                    <td>{dateDe(f.createdAt)}</td>
                    <td>{Array.isArray(m.size) ? `${m.size.map((x: number) => num(x)).join(' × ')} mm` : '–'}</td>
                    <td>{m.volumeCm3 != null ? `${num(m.volumeCm3)} cm³` : '–'}</td>
                    <td>
                      <span className="rowactions">
                        <Link href={`/preisrechner?datei=${f.token}`}>{f.ordered ? 'Nachbestellen' : 'Preis berechnen'}</Link>
                        {defaultMaterial && (
                          <DfmButton
                            label="DFM-PDF"
                            selection={{
                              token: f.token,
                              materialId: String(defaultMaterial.id),
                              layer: 'standard',
                              infill: 'standard',
                              quantity: 1,
                              fileName: f.fileName,
                            }}
                          />
                        )}
                        <RemoveFileButton token={f.token} ordered={Boolean(f.ordered)} />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="calc__empty">
          <p>Noch keine Dateien gespeichert.</p>
          <Link className="btn btn--primary" href="/preisrechner">
            Zum Preisrechner
          </Link>
        </div>
      )}
    </div>
  )
}
