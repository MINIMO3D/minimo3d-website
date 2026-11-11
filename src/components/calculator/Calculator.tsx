'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  calculatePrice,
  clampQuantity,
  euro,
  formatHours,
  INFILLS,
  LAYERS,
  netCents,
  type CalcConfig,
  type DeliveryId,
  type InfillId,
  type LayerId,
} from '@/lib/pricing'
import { COUNTRIES, EMPTY_CONTACT, type Contact } from '@/lib/contact'
import { Viewer, type ViewerHandle } from './Viewer'

type Material = {
  id: number | string
  name: string
  slug: string
  family: string
  summary: string
  pricePerKg: number
  density: number
  timeFactor: number
  priceFactor: number
  colors: { name: string; hex?: string }[]
}

type Check = { id: string; title: string; status: 'ok' | 'warn' | 'fail' | 'info'; value: string; text: string }

type Metrics = {
  triangles: number
  size: [number, number, number]
  volumeCm3: number
  areaCm2: number
  supportCm3: number
}

type Analysis = { token: string; fileName: string; metrics: Metrics; checks: Check[] }

type Props = {
  materials: Material[]
  config: CalcConfig
  checkoutEnabled: boolean
  testMode: boolean
  initialMaterial?: string
  /** Angemeldeter Kunde; null = Bestellung als Gast */
  customer?: { b2b: boolean; discountPercent: number; invoiceAllowed: boolean; invoiceDays: number; hasBilling: boolean } | null
  /** Kontakt und Adressen aus dem Kundenkonto als Vorbelegung für den Bestellschritt */
  contactDefaults?: Contact
  /** Gespeicherte Datei wieder öffnen (Nachbestellen aus dem Kundenkonto) */
  initial?: { token?: string; materialId?: string; layer?: string; infill?: string; quantity?: number; color?: string }
}

const ACCEPT = '.stl,.stp,.step,.obj,.3mf'
const MAX_SIZE = 50 * 1024 * 1024
const DEFAULT_COLOR = '#8fa3bf'
const STATUS_LABEL = { ok: 'In Ordnung', info: 'Hinweis', warn: 'Prüfen', fail: 'Kritisch' } as const
const QUANTITY_PRESETS = [1, 5, 10, 25]

const num = (v: number, d = 1) => v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })

const fits = (size: number[], cfg: CalcConfig) => {
  const a = [...size].sort((p, q) => q - p)
  const b = [cfg.buildX, cfg.buildY, cfg.buildZ].sort((p, q) => q - p)
  return a[0] <= b[0] && a[1] <= b[1] && a[2] <= b[2]
}

export function Calculator({ materials, config, checkoutEnabled, testMode, initialMaterial, customer = null, initial, contactDefaults }: Props) {
  const b2b = Boolean(customer?.b2b)
  const canInvoice = Boolean(b2b && customer?.invoiceAllowed)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [positions, setPositions] = useState<Float32Array | null>(null)
  const [busy, setBusy] = useState<'upload' | 'pdf' | 'checkout' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const [materialId, setMaterialId] = useState<string>(() => {
    const wanted = materials.find((m) => String(m.id) === initial?.materialId) || materials.find((m) => m.slug === initialMaterial)
    return String((wanted || materials[0])?.id ?? '')
  })
  const [color, setColor] = useState(initial?.color || '')
  const [layer, setLayer] = useState<LayerId>(LAYERS.some((l) => l.id === initial?.layer) ? (initial!.layer as LayerId) : 'standard')
  const [infill, setInfill] = useState<InfillId>(INFILLS.some((i) => i.id === initial?.infill) ? (initial!.infill as InfillId) : 'standard')
  const [quantity, setQuantity] = useState(() => clampQuantity(initial?.quantity || 1))
  const [express, setExpress] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryId>('versand')
  const [note, setNote] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [step, setStep] = useState<'config' | 'address'>('config')
  const [contact, setContact] = useState<Contact>(contactDefaults || EMPTY_CONTACT)
  const set = (key: keyof Contact) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setContact((c) => ({ ...c, [key]: e.target.value }))
  const side = useRef<HTMLFormElement>(null)
  const [poNumber, setPoNumber] = useState('')
  const [costCentre, setCostCentre] = useState('')
  const [payment, setPayment] = useState<'stripe' | 'rechnung'>(canInvoice && customer?.hasBilling ? 'rechnung' : 'stripe')

  const viewer = useRef<ViewerHandle>(null)
  const input = useRef<HTMLInputElement>(null)

  const material = materials.find((m) => String(m.id) === materialId) || materials[0]
  const families = useMemo(() => [...new Set(materials.map((m) => m.family))], [materials])

  // Farbe passend zum Material halten
  useEffect(() => {
    if (!material) return
    if (material.colors.length) {
      if (!material.colors.some((c) => c.name === color)) setColor(material.colors[0].name)
    } else if (materials.some((m) => m.colors.some((c) => c.name === color))) setColor('')
  }, [material, color, materials])

  const colorHex = material?.colors.find((c) => c.name === color)?.hex || DEFAULT_COLOR

  const priceFor = useCallback(
    (qty: number) =>
      analysis && material
        ? calculatePrice(
            {
              geometry: {
                volumeCm3: analysis.metrics.volumeCm3,
                areaCm2: analysis.metrics.areaCm2,
                supportCm3: analysis.metrics.supportCm3,
                heightMm: analysis.metrics.size[2],
              },
              material,
              layer,
              infill,
              quantity: qty,
              express,
              delivery,
              customerDiscountPercent: customer?.discountPercent || 0,
            },
            config,
          )
        : null,
    [analysis, material, layer, infill, express, delivery, config, customer],
  )
  const price = priceFor(quantity)
  const fitsBuild = analysis ? fits(analysis.metrics.size, config) : true
  const hasFail = analysis?.checks.some((c) => c.status === 'fail') ?? false

  const upload = async (file: File | undefined | null) => {
    if (!file) return
    setError(null)
    if (!/\.(stl|stp|step|obj|3mf)$/i.test(file.name)) {
      setError('Dieses Dateiformat können wir hier nicht lesen. Möglich sind STL, STEP (STP), OBJ und 3MF.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Die Datei ist größer als 50 MB. Bitte senden Sie sie uns als Anfrage.')
      return
    }
    setBusy('upload')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/rechner/analyse', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || 'Die Datei konnte nicht ausgewertet werden.')
      const meshRes = await fetch(`/rechner/mesh/${json.token}`)
      if (!meshRes.ok) throw new Error('Die 3D-Ansicht konnte nicht geladen werden.')
      const buffer = await meshRes.arrayBuffer()
      setPositions(new Float32Array(buffer))
      setAnalysis(json as Analysis)
      setAccepted(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Datei konnte nicht ausgewertet werden.')
    } finally {
      setBusy(null)
      if (input.current) input.current.value = ''
    }
  }

  // Gespeicherte Datei aus dem Kundenkonto wieder öffnen
  useEffect(() => {
    const token = initial?.token
    if (!token || !/^[A-Za-z0-9_-]{10,100}$/.test(token)) return
    let stop = false
    ;(async () => {
      setBusy('upload')
      try {
        const res = await fetch(`/rechner/berechnung/${token}`)
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json.error || 'Die Datei konnte nicht geladen werden.')
        const meshRes = await fetch(`/rechner/mesh/${token}`)
        if (!meshRes.ok) throw new Error('Die 3D-Ansicht konnte nicht geladen werden.')
        const buffer = await meshRes.arrayBuffer()
        if (stop) return
        setPositions(new Float32Array(buffer))
        setAnalysis(json as Analysis)
      } catch (err) {
        if (!stop) setError(err instanceof Error ? err.message : 'Die Datei konnte nicht geladen werden.')
      } finally {
        if (!stop) setBusy(null)
      }
    })()
    return () => {
      stop = true
    }
  }, [initial?.token])

  const invoice = canInvoice && payment === 'rechnung'

  /** Geschäftskunden sehen Nettopreise. */
  const show = (cents: number) => euro(b2b ? netCents(cents, config.vatPercent) : cents)

  const selection = () => ({ token: analysis?.token, materialId, color, layer, infill, quantity, express, delivery })

  const downloadPdf = async () => {
    if (!analysis) return
    setError(null)
    setBusy('pdf')
    try {
      const res = await fetch('/rechner/dfm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selection(), snapshot: viewer.current?.snapshot() }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Das PDF konnte nicht erstellt werden.')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `DFM-Analyse_${analysis.fileName.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9_-]+/g, '_') || 'Bauteil'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Das PDF konnte nicht erstellt werden.')
    } finally {
      setBusy(null)
    }
  }

  const checkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!analysis) return
    setError(null)
    if (step === 'config') {
      // erster Klick: zum Schritt mit Kontakt und Adresse
      setStep('address')
      requestAnimationFrame(() => side.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      return
    }
    setBusy('checkout')
    try {
      const res = await fetch('/rechner/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selection(), note, accepted, poNumber, costCentre, payment: canInvoice ? payment : 'stripe', contact }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) throw new Error(json.error || 'Die Kasse konnte nicht geöffnet werden.')
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Kasse konnte nicht geöffnet werden.')
      setBusy(null)
    }
  }

  const reset = () => {
    setStep('config')
    setAnalysis(null)
    setPositions(null)
    setError(null)
  }

  if (!materials.length)
    return (
      <div className="calc__empty">
        <p>Der Preisrechner ist gerade nicht verfügbar. Senden Sie uns Ihr Bauteil bitte als Anfrage.</p>
        <Link className="btn btn--primary" href="/kontakt#anfrage">
          Bauteil anfragen
        </Link>
      </div>
    )

  const m = analysis?.metrics

  return (
    <div className="calc">
      <div className="calc__main">
        {/* ---------- Datei und 3D-Ansicht ---------- */}
        <section className="panel" aria-labelledby="calc-file">
          <div className="panel__head">
            <h2 className="h3" id="calc-file">
              {analysis ? analysis.fileName : '1. Datei hochladen'}
            </h2>
            {analysis && (
              <div className="panel__actions">
                <button className="linkbtn" type="button" onClick={() => viewer.current?.resetView()}>
                  Ansicht zurücksetzen
                </button>
                <button className="linkbtn" type="button" onClick={reset}>
                  Andere Datei
                </button>
              </div>
            )}
          </div>

          {!analysis && (
            <label
              className={`dropzone${dragging ? ' dropzone--over' : ''}${busy === 'upload' ? ' dropzone--busy' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                void upload(e.dataTransfer.files?.[0])
              }}
            >
              <input
                ref={input}
                className="dropzone__input"
                type="file"
                accept={ACCEPT}
                disabled={busy === 'upload'}
                onChange={(e) => void upload(e.target.files?.[0])}
              />
              <span className="dropzone__title">
                {busy === 'upload' ? 'Datei wird geprüft …' : 'Datei hierher ziehen oder auswählen'}
              </span>
              <span className="dropzone__hint">STL · STP · STEP · OBJ · 3MF, bis 50 MB</span>
              <span className="dropzone__note">
                Die Datei wird zur Berechnung auf unseren Server in Deutschland geladen und nach 7 Tagen gelöscht, wenn
                Sie nicht bestellen.
              </span>
            </label>
          )}

          {analysis && positions && m && (
            <>
              <div className="viewer">
                <Viewer ref={viewer} positions={positions} color={colorHex} build={{ x: config.buildX, y: config.buildY }} />
              </div>
              <dl className="facts">
                <div>
                  <dt>Abmessungen</dt>
                  <dd>
                    {num(m.size[0])} × {num(m.size[1])} × {num(m.size[2])} mm
                  </dd>
                </div>
                <div>
                  <dt>Volumen</dt>
                  <dd>{num(m.volumeCm3, 2)} cm³</dd>
                </div>
                <div>
                  <dt>Oberfläche</dt>
                  <dd>{num(m.areaCm2)} cm²</dd>
                </div>
                <div>
                  <dt>Dreiecke</dt>
                  <dd>{m.triangles.toLocaleString('de-DE')}</dd>
                </div>
              </dl>
            </>
          )}
        </section>

        {error && (
          <p className="form__msg form__msg--err" role="alert">
            {error}
          </p>
        )}

        {/* ---------- DFM ---------- */}
        {analysis && (
          <section className="panel" aria-labelledby="calc-dfm">
            <div className="panel__head">
              <h2 className="h3" id="calc-dfm">
                Fertigungsanalyse (DFM)
              </h2>
              <button className="btn btn--ghost btn--small" type="button" onClick={downloadPdf} disabled={busy === 'pdf'}>
                {busy === 'pdf' ? 'PDF wird erstellt …' : 'Als PDF herunterladen'}
              </button>
            </div>
            <ul className="checks-list">
              {analysis.checks.map((c) => (
                <li key={c.id} className={`check check--${c.status}`}>
                  <span className="check__status">{STATUS_LABEL[c.status]}</span>
                  <div className="check__body">
                    <p className="check__title">
                      {c.title} <span className="check__value">{c.value}</span>
                    </p>
                    <p className="check__text">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="small muted">
              Automatische Vorprüfung in der gelieferten Lage des Modells. Vor dem Druck prüfen wir jede Datei von Hand
              und wählen die beste Drucklage.
            </p>
          </section>
        )}
      </div>

      {/* ---------- Ausführung und Preis ---------- */}
      <form className="calc__side" onSubmit={checkout} ref={side}>
        {step === 'address' && (
          <section className="panel" aria-labelledby="calc-address">
            <div className="panel__head">
              <h2 className="h3" id="calc-address">
                Ihre Angaben
              </h2>
              <button className="linkbtn" type="button" onClick={() => setStep('config')}>
                ← Ausführung ändern
              </button>
            </div>
            {invoice ? (
              <>
                <p>Rechnung und Lieferung gehen an die Adressen aus Ihrem Kundenkonto:</p>
                <p className="address">
                  {[contact.company, `${contact.firstName} ${contact.lastName}`, contact.street, `${contact.zip} ${contact.city}`].filter(Boolean).join('\n')}
                </p>
                <p className="small">
                  <Link href="/konto/profil">Adressen im Kundenkonto ändern</Link>
                </p>
              </>
            ) : (
              <>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="co-first">Vorname</label>
                    <input id="co-first" type="text" required autoComplete="given-name" value={contact.firstName} onChange={set('firstName')} />
                  </div>
                  <div className="field">
                    <label htmlFor="co-last">Nachname</label>
                    <input id="co-last" type="text" required autoComplete="family-name" value={contact.lastName} onChange={set('lastName')} />
                  </div>
                </div>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="co-email">E-Mail</label>
                    <input id="co-email" type="email" required autoComplete="email" value={contact.email} onChange={set('email')} />
                  </div>
                  <div className="field">
                    <label htmlFor="co-phone">Telefon (optional)</label>
                    <input id="co-phone" type="tel" autoComplete="tel" value={contact.phone} onChange={set('phone')} />
                  </div>
                </div>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="co-company">Firma (optional)</label>
                    <input id="co-company" type="text" autoComplete="organization" value={contact.company} onChange={set('company')} />
                  </div>
                  <div className="field">
                    <label htmlFor="co-vat">Umsatzsteuer-ID (optional)</label>
                    <input id="co-vat" type="text" placeholder="DE123456789" value={contact.vatId} onChange={set('vatId')} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="co-street">Rechnungsadresse: Straße und Hausnummer</label>
                  <input id="co-street" type="text" required autoComplete="address-line1" value={contact.street} onChange={set('street')} />
                </div>
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="co-zip">PLZ</label>
                    <input id="co-zip" type="text" required inputMode="numeric" autoComplete="postal-code" value={contact.zip} onChange={set('zip')} />
                  </div>
                  <div className="field">
                    <label htmlFor="co-city">Ort</label>
                    <input id="co-city" type="text" required autoComplete="address-level2" value={contact.city} onChange={set('city')} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="co-country">Land</label>
                  <select id="co-country" autoComplete="country" value={contact.country} onChange={set('country')}>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {delivery === 'versand' ? (
                  <>
                    <label className="option">
                      <input
                        type="checkbox"
                        checked={contact.shippingSame}
                        onChange={(e) => setContact((c) => ({ ...c, shippingSame: e.target.checked }))}
                      />
                      <span>Lieferung an die Rechnungsadresse</span>
                    </label>
                    {!contact.shippingSame && (
                      <>
                        <div className="field">
                          <label htmlFor="co-sname">Lieferadresse: Empfänger</label>
                          <input id="co-sname" type="text" value={contact.sName} onChange={set('sName')} />
                        </div>
                        <div className="field">
                          <label htmlFor="co-sstreet">Straße und Hausnummer</label>
                          <input id="co-sstreet" type="text" required value={contact.sStreet} onChange={set('sStreet')} />
                        </div>
                        <div className="form__row">
                          <div className="field">
                            <label htmlFor="co-szip">PLZ</label>
                            <input id="co-szip" type="text" required inputMode="numeric" value={contact.sZip} onChange={set('sZip')} />
                          </div>
                          <div className="field">
                            <label htmlFor="co-scity">Ort</label>
                            <input id="co-scity" type="text" required value={contact.sCity} onChange={set('sCity')} />
                          </div>
                        </div>
                      </>
                    )}
                    <p className="small muted">Wir versenden mit DHL innerhalb Deutschlands.</p>
                  </>
                ) : (
                  <p className="small muted">Sie holen das Teil in Neuhausen auf den Fildern ab. Wir melden uns, sobald es bereitliegt.</p>
                )}
                {customer === null && (
                  <p className="small muted">
                    Schon Kunde? <Link href="/konto/anmelden?weiter=/preisrechner">Anmelden</Link>, dann sind Ihre Angaben beim nächsten Mal ausgefüllt.
                  </p>
                )}
              </>
            )}
          </section>
        )}
        <section className="panel" aria-labelledby="calc-config" hidden={step === 'address'}>
          <h2 className="h3" id="calc-config">
            {analysis ? 'Ausführung wählen' : '2. Ausführung wählen'}
          </h2>

          <div className="field">
            <label htmlFor="calc-material">Material</label>
            <select id="calc-material" value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
              {families.map((f) => (
                <optgroup key={f} label={f}>
                  {materials
                    .filter((x) => x.family === f)
                    .map((x) => (
                      <option key={x.id} value={String(x.id)}>
                        {x.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            {material && (
              <p className="small muted">
                {material.summary} <Link href={`/materialien/${material.slug}`}>Mehr zum Material</Link>
              </p>
            )}
          </div>

          {material && material.colors.length > 0 ? (
            <fieldset className="field">
              <legend>Farbe: {color}</legend>
              <div className="swatches">
                {material.colors.map((c) => (
                  <label key={c.name} className="swatch" title={c.name}>
                    <input type="radio" name="color" value={c.name} checked={color === c.name} onChange={() => setColor(c.name)} />
                    <span className="swatch__dot" style={{ background: c.hex || DEFAULT_COLOR }} />
                    <span className="swatch__name">{c.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : (
            <div className="field">
              <label htmlFor="calc-color">Farbwunsch (optional)</label>
              <input
                id="calc-color"
                type="text"
                maxLength={60}
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="z. B. Schwarz"
              />
              <p className="small muted">Wir bestätigen die Farbe mit der Auftragsbestätigung.</p>
            </div>
          )}

          <fieldset className="field">
            <legend>Schichthöhe</legend>
            <div className="choices">
              {LAYERS.map((l) => (
                <label key={l.id} className="choice">
                  <input type="radio" name="layer" value={l.id} checked={layer === l.id} onChange={() => setLayer(l.id)} />
                  <span className="choice__box">
                    <span className="choice__title">{l.label}</span>
                    <span className="choice__value">{num(l.mm)} mm</span>
                    <span className="choice__hint">{l.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Füllung</legend>
            <div className="choices">
              {INFILLS.map((i) => (
                <label key={i.id} className="choice">
                  <input type="radio" name="infill" value={i.id} checked={infill === i.id} onChange={() => setInfill(i.id)} />
                  <span className="choice__box">
                    <span className="choice__title">{i.label}</span>
                    <span className="choice__value">{i.range}</span>
                    <span className="choice__hint">{i.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label htmlFor="calc-qty">Stückzahl</label>
            <div className="qty">
              <button type="button" className="qty__btn" aria-label="Eine weniger" onClick={() => setQuantity((q) => clampQuantity(q - 1))}>
                −
              </button>
              <input
                id="calc-qty"
                type="number"
                inputMode="numeric"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(clampQuantity(Number(e.target.value)))}
              />
              <button type="button" className="qty__btn" aria-label="Eine mehr" onClick={() => setQuantity((q) => clampQuantity(q + 1))}>
                +
              </button>
              <div className="qty__presets">
                {QUANTITY_PRESETS.map((q) => (
                  <button key={q} type="button" className={`chip${quantity === q ? ' chip--on' : ''}`} onClick={() => setQuantity(q)}>
                    {q}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          <fieldset className="field">
            <legend>Lieferung</legend>
            <label className="option">
              <input type="radio" name="delivery" checked={delivery === 'versand'} onChange={() => setDelivery('versand')} />
              <span>
                DHL-Versand innerhalb Deutschlands, {euro(Math.round(config.shippingGross * 100))}, ab{' '}
                {euro(Math.round(config.freeShippingFromGross * 100))} kostenlos
              </span>
            </label>
            <label className="option">
              <input type="radio" name="delivery" checked={delivery === 'abholung'} onChange={() => setDelivery('abholung')} />
              <span>Abholung in Neuhausen auf den Fildern, kostenlos</span>
            </label>
            <label className="option">
              <input type="checkbox" checked={express} onChange={(e) => setExpress(e.target.checked)} />
              <span>
                Express: {num(config.expressPercent, 0)} % Aufschlag, mindestens {euro(Math.round(config.expressMinGross * 100))}
              </span>
            </label>
          </fieldset>
        </section>

        <section className="panel panel--price" aria-labelledby="calc-price" aria-live="polite">
          <h2 className="h3" id="calc-price">
            {analysis ? 'Ihr Preis' : '3. Preis sehen und bestellen'}
          </h2>

          {!analysis && <p className="muted">Laden Sie eine Datei hoch. Der Preis erscheint sofort.</p>}

          {analysis && price && !fitsBuild && (
            <>
              <p>
                Das Teil ist größer als unser Bauraum von {config.buildX} × {config.buildY} × {config.buildZ} mm. Wir
                fertigen es geteilt und gefügt und nennen Ihnen den Preis im Angebot.
              </p>
              <Link className="btn btn--primary" href="/kontakt#anfrage">
                Bauteil anfragen
              </Link>
            </>
          )}

          {analysis && price && fitsBuild && (
            <>
              <p className="total">
                <span className="total__amount">{b2b ? euro(price.totalCents - price.vatCents) : euro(price.totalCents)}</span>
                <span className="total__note">
                  {b2b ? 'netto, zzgl. 19 % MwSt.' : 'inkl. 19 % MwSt.'}
                  {price.shippingCents ? (b2b ? ', inkl. Versand' : ' und Versand') : ''}
                </span>
              </p>
              <dl className="sum">
                <div>
                  <dt>
                    {quantity} × {show(price.unitCents)}
                    {price.discountPercent ? ` (${num(price.discountPercent, 0)} % Mengenrabatt enthalten)` : ''}
                  </dt>
                  <dd>{show(price.partsCents)}</dd>
                </div>
                {price.customerDiscountPercent > 0 && (
                  <div className="sum__muted">
                    <dt>Ihr Kundenrabatt</dt>
                    <dd>{num(price.customerDiscountPercent, 0)} % enthalten</dd>
                  </div>
                )}
                <div>
                  <dt>Auftragspauschale</dt>
                  <dd>{show(price.feeCents)}</dd>
                </div>
                {price.expressCents > 0 && (
                  <div>
                    <dt>Express</dt>
                    <dd>{show(price.expressCents)}</dd>
                  </div>
                )}
                <div>
                  <dt>{delivery === 'versand' ? 'DHL-Versand' : 'Abholung'}</dt>
                  <dd>{price.shippingCents ? show(price.shippingCents) : 'kostenlos'}</dd>
                </div>
                {b2b ? (
                  <>
                    <div>
                      <dt>19 % MwSt.</dt>
                      <dd>{euro(price.vatCents)}</dd>
                    </div>
                    <div className="sum__total">
                      <dt>Gesamt brutto</dt>
                      <dd>{euro(price.totalCents)}</dd>
                    </div>
                  </>
                ) : (
                  <div className="sum__muted">
                    <dt>Enthaltene MwSt.</dt>
                    <dd>{euro(price.vatCents)}</dd>
                  </div>
                )}
              </dl>
              <dl className="facts facts--tight">
                <div>
                  <dt>Lieferzeit</dt>
                  <dd>{price.leadTime}</dd>
                </div>
                <div>
                  <dt>Gewicht je Stück</dt>
                  <dd>ca. {num(price.gramsPerPart, 0)} g</dd>
                </div>
                <div>
                  <dt>Druckzeit je Stück</dt>
                  <dd>ca. {formatHours(price.hoursPerPart)}</dd>
                </div>
              </dl>

              <div className="ladder" aria-label="Stückpreis nach Menge">
                {QUANTITY_PRESETS.map((q) => {
                  const p = priceFor(q)
                  return p ? (
                    <button key={q} type="button" className={`ladder__cell${quantity === q ? ' ladder__cell--on' : ''}`} onClick={() => setQuantity(q)}>
                      <span>{q} Stück</span>
                      <strong>{show(p.unitCents)}</strong>
                    </button>
                  ) : null
                })}
              </div>

              {hasFail && (
                <p className="form__msg form__msg--err">
                  Die Fertigungsanalyse zeigt einen kritischen Punkt. Sie können trotzdem bestellen. Wir melden uns vor
                  dem Druck, falls das Teil so nicht herstellbar ist.
                </p>
              )}

              {b2b && (
                <div className="form__row">
                  <div className="field">
                    <label htmlFor="calc-po">Ihre Bestellreferenz (optional)</label>
                    <input id="calc-po" type="text" maxLength={60} value={poNumber} onChange={(e) => setPoNumber(e.target.value)} placeholder="z. B. PO-2026-0815" />
                  </div>
                  <div className="field">
                    <label htmlFor="calc-cc">Kostenstelle (optional)</label>
                    <input id="calc-cc" type="text" maxLength={60} value={costCentre} onChange={(e) => setCostCentre(e.target.value)} />
                  </div>
                </div>
              )}

              {canInvoice && (
                <fieldset className="field">
                  <legend>Zahlungsart</legend>
                  <label className="option">
                    <input type="radio" name="payment" checked={payment === 'rechnung'} disabled={!customer?.hasBilling} onChange={() => setPayment('rechnung')} />
                    <span>
                      Kauf auf Rechnung, zahlbar in {customer?.invoiceDays ?? 14} Tagen
                      {!customer?.hasBilling && (
                        <>
                          {' '}
                          (bitte zuerst die <Link href="/konto/profil">Rechnungsadresse</Link> hinterlegen)
                        </>
                      )}
                    </span>
                  </label>
                  {checkoutEnabled && (
                    <label className="option">
                      <input type="radio" name="payment" checked={payment === 'stripe'} onChange={() => setPayment('stripe')} />
                      <span>Sofort online zahlen über Stripe</span>
                    </label>
                  )}
                </fieldset>
              )}

              <div className="field">
                <label htmlFor="calc-note">Hinweis zum Auftrag (optional)</label>
                <textarea id="calc-note" rows={2} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
              </div>

              {checkoutEnabled || (canInvoice && customer?.hasBilling) ? (
                step === 'config' ? (
                  <>
                    <button className="btn btn--primary" type="submit">
                      Weiter: Adresse und Zahlung
                    </button>
                    <p className="small muted">
                      {customer ? 'Im nächsten Schritt prüfen Sie Ihre Adresse.' : 'Im nächsten Schritt geben Sie Ihre Adresse an. Ein Kundenkonto brauchen Sie nicht.'}
                    </p>
                  </>
                ) : (
                  <>
                    {testMode && !invoice && (
                      <p className="form__msg form__msg--ok">Testmodus: Die Kasse arbeitet mit Testzahlungen. Es wird nichts abgebucht.</p>
                    )}
                    <label className="consent">
                      <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} required />
                      <span>
                        Ich akzeptiere die <Link href="/agb">AGB</Link> und habe die <Link href="/datenschutz">Datenschutzerklärung</Link>{' '}
                        gelesen. Das Teil wird nach meinen Vorgaben gefertigt, deshalb besteht kein Widerrufsrecht.
                        Schichtlinien, Stützspuren und leichte Maßabweichungen sind kein Mangel.
                      </span>
                    </label>
                    <button className="btn btn--primary" type="submit" disabled={busy === 'checkout'}>
                      {invoice
                        ? busy === 'checkout'
                          ? 'Bestellung wird gesendet …'
                          : 'Zahlungspflichtig bestellen'
                        : busy === 'checkout'
                          ? 'Kasse wird geöffnet …'
                          : 'Weiter zur Zahlung'}
                    </button>
                    {!invoice && (
                      <p className="small muted">Sie zahlen sicher über Stripe. Ihre Angaben sind dort schon eingetragen.</p>
                    )}
                  </>
                )
              ) : (
                <>
                  <p className="small muted">
                    Die Online-Zahlung wird gerade eingerichtet. Senden Sie uns Ihr Bauteil bis dahin bitte als Anfrage,
                    der Preis gilt.
                  </p>
                  <Link className="btn btn--primary" href="/kontakt#anfrage">
                    Bauteil anfragen
                  </Link>
                </>
              )}
            </>
          )}
        </section>
      </form>
    </div>
  )
}
