'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  calculateOrder,
  clampQuantity,
  euro,
  formatHours,
  INFILLS,
  LAYERS,
  MAX_PARTS,
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

/** Ausführung eines Bauteils */
type PartConfig = { materialId: string; color: string; layer: LayerId; infill: InfillId; quantity: number }
/** Ein hochgeladenes Bauteil mit Auswertung, 3D-Ansicht und Ausführung */
type Part = PartConfig & { analysis: Analysis; positions: Float32Array }

export type InitialPart = { token?: string; materialId?: string; layer?: string; infill?: string; quantity?: number; color?: string }

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
  /** Gespeicherte Dateien wieder öffnen (Nachbestellen aus dem Kundenkonto) */
  initialParts?: InitialPart[]
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

export function Calculator({ materials, config, checkoutEnabled, testMode, initialMaterial, customer = null, initialParts, contactDefaults }: Props) {
  const b2b = Boolean(customer?.b2b)
  const canInvoice = Boolean(b2b && customer?.invoiceAllowed)
  const [busy, setBusy] = useState<'upload' | 'pdf' | 'checkout' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  // Bauteile der Bestellung. Solange noch nichts hochgeladen ist, gilt die Vorauswahl ("draft").
  const [parts, setParts] = useState<Part[]>([])
  const [activeToken, setActiveToken] = useState<string | null>(null)
  const [draft, setDraft] = useState<PartConfig>(() => ({
    materialId: String((materials.find((m) => m.slug === initialMaterial) || materials[0])?.id ?? ''),
    color: '',
    layer: 'standard',
    infill: 'standard',
    quantity: 1,
  }))
  const part = parts.find((p) => p.analysis.token === activeToken) || parts[0] || null
  const current: PartConfig = part || draft
  const update = useCallback(
    (patch: Partial<PartConfig>) => {
      const token = part?.analysis.token
      if (token) setParts((list) => list.map((p) => (p.analysis.token === token ? { ...p, ...patch } : p)))
      else setDraft((d) => ({ ...d, ...patch }))
    },
    [part?.analysis.token],
  )
  const analysis = part?.analysis ?? null
  const positions = part?.positions ?? null
  const { materialId, color, layer, infill, quantity } = current
  const setMaterialId = (v: string) => update({ materialId: v })
  const setColor = (v: string) => update({ color: v })
  const setLayer = (v: LayerId) => update({ layer: v })
  const setInfill = (v: InfillId) => update({ infill: v })
  const setQuantity = (v: number | ((q: number) => number)) => update({ quantity: clampQuantity(typeof v === 'function' ? v(quantity) : v) })
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
  const addInput = useRef<HTMLInputElement>(null)

  const material = materials.find((m) => String(m.id) === materialId) || materials[0]
  const families = useMemo(() => [...new Set(materials.map((m) => m.family))], [materials])

  // Farbe passend zum Material halten
  useEffect(() => {
    if (!material) return
    if (material.colors.length) {
      if (!material.colors.some((c) => c.name === color)) update({ color: material.colors[0].name })
    } else if (materials.some((m) => m.colors.some((c) => c.name === color))) update({ color: '' })
  }, [material, color, materials, update])

  const colorHex = material?.colors.find((c) => c.name === color)?.hex || DEFAULT_COLOR

  const itemOf = useCallback(
    (p: Part, qty = p.quantity) => ({
      geometry: {
        volumeCm3: p.analysis.metrics.volumeCm3,
        areaCm2: p.analysis.metrics.areaCm2,
        supportCm3: p.analysis.metrics.supportCm3,
        heightMm: p.analysis.metrics.size[2],
      },
      material: materials.find((m) => String(m.id) === p.materialId) || materials[0],
      layer: p.layer,
      infill: p.infill,
      quantity: qty,
    }),
    [materials],
  )
  const options = useMemo(
    () => ({ express, delivery, customerDiscountPercent: customer?.discountPercent || 0 }),
    [express, delivery, customer?.discountPercent],
  )
  // Preis der ganzen Bestellung: alle Bauteile, eine Auftragspauschale, ein Versand
  const price = useMemo(
    () => (parts.length ? calculateOrder(parts.map((p) => itemOf(p)), options, config) : null),
    [parts, itemOf, options, config],
  )
  const activeIndex = part ? parts.indexOf(part) : -1
  const line = price && activeIndex >= 0 ? price.lines[activeIndex] : null
  /** Stückpreis des gewählten Bauteils bei anderer Menge */
  const unitFor = (qty: number) => (part ? calculateOrder([itemOf(part, qty)], options, config).lines[0].unitCents : 0)
  const tooBig = parts.filter((p) => !fits(p.analysis.metrics.size, config))
  const fitsBuild = tooBig.length === 0
  const hasFail = parts.some((p) => p.analysis.checks.some((c) => c.status === 'fail'))
  const several = parts.length > 1

  /** Auswertung und 3D-Ansicht als Bauteil in die Liste aufnehmen */
  const addPart = (a: Analysis, buffer: ArrayBuffer, cfg?: Partial<PartConfig>) => {
    setParts((list) => {
      if (list.some((p) => p.analysis.token === a.token) || list.length >= MAX_PARTS) return list
      // neues Bauteil übernimmt die Ausführung des zuletzt gewählten, die Stückzahl beginnt bei 1
      const base: PartConfig = { ...current, quantity: list.length ? 1 : current.quantity, ...cfg }
      return [...list, { ...base, analysis: a, positions: new Float32Array(buffer) }]
    })
    setActiveToken(a.token)
  }

  const removePart = (token: string) => {
    setParts((list) => list.filter((p) => p.analysis.token !== token))
    setActiveToken((t) => (t === token ? null : t))
    if (parts.length <= 1) setStep('config')
    setError(null)
  }

  const upload = async (files: FileList | File[] | undefined | null) => {
    const list = Array.from(files || [])
    if (!list.length) return
    setError(null)
    const free = MAX_PARTS - parts.length
    const problems: string[] = []
    if (list.length > free) problems.push(`Je Bestellung sind höchstens ${MAX_PARTS} verschiedene Bauteile möglich.`)
    setBusy('upload')
    try {
      for (const file of list.slice(0, Math.max(0, free))) {
        if (!/\.(stl|stp|step|obj|3mf)$/i.test(file.name)) {
          problems.push(`${file.name}: Dieses Dateiformat können wir hier nicht lesen. Möglich sind STL, STEP (STP), OBJ und 3MF.`)
          continue
        }
        if (file.size > MAX_SIZE) {
          problems.push(`${file.name}: Die Datei ist größer als 50 MB. Bitte senden Sie sie uns als Anfrage.`)
          continue
        }
        try {
          const body = new FormData()
          body.append('file', file)
          const res = await fetch('/rechner/analyse', { method: 'POST', body })
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(json.error || 'Die Datei konnte nicht ausgewertet werden.')
          const meshRes = await fetch(`/rechner/mesh/${json.token}`)
          if (!meshRes.ok) throw new Error('Die 3D-Ansicht konnte nicht geladen werden.')
          addPart(json as Analysis, await meshRes.arrayBuffer())
          setAccepted(false)
        } catch (err) {
          problems.push(`${list.length > 1 ? `${file.name}: ` : ''}${err instanceof Error ? err.message : 'Die Datei konnte nicht ausgewertet werden.'}`)
        }
      }
    } finally {
      setBusy(null)
      if (problems.length) setError(problems.join(' '))
      if (input.current) input.current.value = ''
      if (addInput.current) addInput.current.value = ''
    }
  }

  // Gespeicherte Dateien aus dem Kundenkonto wieder öffnen
  const initialKey = (initialParts || []).map((p) => p.token).join(',')
  useEffect(() => {
    const wanted = (initialParts || []).filter((p) => p.token && /^[A-Za-z0-9_-]{10,100}$/.test(p.token)).slice(0, MAX_PARTS)
    if (!wanted.length) return
    let stop = false
    ;(async () => {
      setBusy('upload')
      let missing = 0
      for (const w of wanted) {
        try {
          const res = await fetch(`/rechner/berechnung/${w.token}`)
          const json = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error()
          const meshRes = await fetch(`/rechner/mesh/${w.token}`)
          if (!meshRes.ok) throw new Error()
          const buffer = await meshRes.arrayBuffer()
          if (stop) return
          const cfg: Partial<PartConfig> = { quantity: clampQuantity(w.quantity || 1), color: w.color || '' }
          if (materials.some((m) => String(m.id) === w.materialId)) cfg.materialId = w.materialId
          if (LAYERS.some((l) => l.id === w.layer)) cfg.layer = w.layer as LayerId
          if (INFILLS.some((i) => i.id === w.infill)) cfg.infill = w.infill as InfillId
          addPart(json as Analysis, buffer, cfg)
        } catch {
          missing += 1
        }
      }
      if (stop) return
      if (missing)
        setError(
          wanted.length === 1
            ? 'Diese Datei ist nicht mehr gespeichert. Bitte laden Sie sie erneut hoch.'
            : `${missing} von ${wanted.length} Dateien sind nicht mehr gespeichert. Bitte laden Sie sie erneut hoch.`,
        )
      setActiveToken(wanted[0].token || null)
      setBusy(null)
    })()
    return () => {
      stop = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialKey])

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
    if (!parts.length || !fitsBuild) return
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
        body: JSON.stringify({
          items: parts.map((p) => ({ token: p.analysis.token, materialId: p.materialId, color: p.color, layer: p.layer, infill: p.infill, quantity: p.quantity })),
          express,
          delivery,
          note,
          accepted,
          poNumber,
          costCentre,
          payment: canInvoice ? payment : 'stripe',
          contact,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.url) throw new Error(json.error || 'Die Kasse konnte nicht geöffnet werden.')
      window.location.href = json.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Die Kasse konnte nicht geöffnet werden.')
      setBusy(null)
    }
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
        {/* ---------- Bauteile der Bestellung ---------- */}
        {parts.length > 0 && price && (
          <section className="panel" aria-labelledby="calc-parts">
            <div className="panel__head">
              <h2 className="h3" id="calc-parts">
                {several ? `Ihre Bauteile (${parts.length})` : 'Ihr Bauteil'}
              </h2>
              {parts.length < MAX_PARTS && (
                <label className={`btn btn--ghost btn--small${busy === 'upload' ? ' btn--busy' : ''}`}>
                  <input
                    ref={addInput}
                    className="calc__add"
                    type="file"
                    accept={ACCEPT}
                    multiple
                    disabled={busy === 'upload'}
                    onChange={(e) => void upload(e.target.files)}
                  />
                  {busy === 'upload' ? 'Wird geprüft …' : '+ Weiteres Bauteil'}
                </label>
              )}
            </div>
            <ul
              className={`partlist${dragging ? ' partlist--over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                void upload(e.dataTransfer.files)
              }}
            >
              {parts.map((p, n) => {
                const mat = materials.find((x) => String(x.id) === p.materialId)
                const on = p === part
                const big = !fits(p.analysis.metrics.size, config)
                return (
                  <li key={p.analysis.token} className={`partlist__item${on ? ' partlist__item--on' : ''}`}>
                    <button
                      type="button"
                      className="partlist__pick"
                      aria-pressed={on}
                      onClick={() => {
                        setActiveToken(p.analysis.token)
                        setStep('config')
                      }}
                    >
                      <span className="partlist__name">
                        {p.quantity} × {p.analysis.fileName}
                      </span>
                      <span className="small muted">
                        {[mat?.name, p.color, `${LAYERS.find((l) => l.id === p.layer)?.label}`, `Füllung ${INFILLS.find((i) => i.id === p.infill)?.label}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                      {big && <span className="small partlist__warn">Größer als der Bauraum</span>}
                    </button>
                    <span className="partlist__price">{big ? '–' : show(price.lines[n].partsCents)}</span>
                    {several && (
                      <button type="button" className="linkbtn" aria-label={`${p.analysis.fileName} entfernen`} onClick={() => removePart(p.analysis.token)}>
                        Entfernen
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="small muted">
              {several
                ? 'Wählen Sie ein Bauteil aus, um Material, Ausführung und Stückzahl zu ändern. Auftragspauschale und Versand fallen nur einmal an.'
                : 'Sie können weitere Bauteile hinzufügen und zusammen bestellen. Auftragspauschale und Versand fallen dann nur einmal an.'}
            </p>
          </section>
        )}

        {/* ---------- Datei und 3D-Ansicht ---------- */}
        <section className="panel" aria-labelledby="calc-file">
          <div className="panel__head">
            <h2 className="h3" id="calc-file">
              {analysis ? analysis.fileName : '1. Dateien hochladen'}
            </h2>
            {analysis && (
              <div className="panel__actions">
                <button className="linkbtn" type="button" onClick={() => viewer.current?.resetView()}>
                  Ansicht zurücksetzen
                </button>
                <button className="linkbtn" type="button" onClick={() => removePart(analysis.token)}>
                  {several ? 'Teil entfernen' : 'Andere Datei'}
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
                void upload(e.dataTransfer.files)
              }}
            >
              <input
                ref={input}
                className="dropzone__input"
                type="file"
                accept={ACCEPT}
                multiple
                disabled={busy === 'upload'}
                onChange={(e) => void upload(e.target.files)}
              />
              <span className="dropzone__title">
                {busy === 'upload' ? 'Dateien werden geprüft …' : 'Dateien hierher ziehen oder auswählen'}
              </span>
              <span className="dropzone__hint">STL · STP · STEP · OBJ · 3MF, bis 50 MB je Datei, mehrere Bauteile möglich</span>
              <span className="dropzone__note">
                Die Datei wird zur Berechnung auf unseren Server in Deutschland geladen und nach 7 Tagen gelöscht, wenn
                Sie nicht bestellen.
              </span>
            </label>
          )}

          {analysis && positions && m && (
            <>
              <div className="viewer">
                <Viewer key={analysis.token} ref={viewer} positions={positions} color={colorHex} build={{ x: config.buildX, y: config.buildY }} />
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
              Automatische Vorprüfung in der berechneten Drucklage: Wir drehen das Modell so, dass es möglichst wenig Stützmaterial braucht. Vor dem Druck prüfen wir jede Datei von Hand
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
                  <p className="small muted">Sie holen Ihre Bestellung in Neuhausen auf den Fildern ab. Wir melden uns, sobald es bereitliegt.</p>
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
            {analysis ? (several ? `Ausführung: ${analysis.fileName}` : 'Ausführung wählen') : '2. Ausführung wählen'}
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
                {several ? `„${tooBig.map((p) => p.analysis.fileName).join('“, „')}“ ist` : 'Das Teil ist'} größer als unser Bauraum von {config.buildX} ×{' '}
                {config.buildY} × {config.buildZ} mm. Wir fertigen es geteilt und gefügt und nennen Ihnen den Preis im Angebot.
                {several ? ' Entfernen Sie das Teil aus der Liste, um die übrigen online zu bestellen.' : ''}
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
                {parts.map((p, n) => {
                  const l = price.lines[n]
                  return (
                    <div key={p.analysis.token}>
                      <dt>
                        {p.quantity} × {show(l.unitCents)}
                        {several ? ` · ${p.analysis.fileName}` : ''}
                        {l.discountPercent ? ` (${num(l.discountPercent, 0)} % Mengenrabatt enthalten)` : ''}
                      </dt>
                      <dd>{show(l.partsCents)}</dd>
                    </div>
                  )
                })}
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
                {line && (
                  <>
                    <div>
                      <dt>Gewicht je Stück</dt>
                      <dd>ca. {num(line.gramsPerPart, 0)} g</dd>
                    </div>
                    <div>
                      <dt>Druckzeit je Stück</dt>
                      <dd>ca. {formatHours(line.hoursPerPart)}</dd>
                    </div>
                  </>
                )}
              </dl>

              {several && analysis && <p className="small muted">Gewicht, Druckzeit und Staffelpreise für: {analysis.fileName}</p>}
              <div className="ladder" aria-label="Stückpreis nach Menge">
                {QUANTITY_PRESETS.map((q) => (
                  <button key={q} type="button" className={`ladder__cell${quantity === q ? ' ladder__cell--on' : ''}`} onClick={() => setQuantity(q)}>
                    <span>{q} Stück</span>
                    <strong>{show(unitFor(q))}</strong>
                  </button>
                ))}
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
