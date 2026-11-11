// Prüfung der Umsatzsteuer-ID über die MwSt-Informationsaustausch-Datenbank (VIES) der EU-Kommission.

export type VatResult = { status: 'gueltig' | 'ungueltig' | 'ungeprueft'; name?: string }

const EU = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'XI']

/** Bringt eine Eingabe wie "de 286 185 561" in die Form "DE286185561". Gibt null zurück, wenn das Format nicht passt. */
export const normalizeVatId = (input: string): string | null => {
  const v = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!/^[A-Z]{2}[A-Z0-9]{2,12}$/.test(v)) return null
  if (!EU.includes(v.slice(0, 2))) return null
  if (v.startsWith('DE') && !/^DE\d{9}$/.test(v)) return null
  return v
}

/**
 * Fragt die EU-Datenbank. Ist sie nicht erreichbar, bleibt der Status "ungeprueft":
 * Dann prüft der Betrieb die Nummer von Hand im Admin-Bereich.
 */
export const checkVatId = async (vatId: string): Promise<VatResult> => {
  const country = vatId.slice(0, 2)
  const number = vatId.slice(2)
  try {
    const res = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${country}/vat/${encodeURIComponent(number)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { status: 'ungeprueft' }
    const data: any = await res.json()
    if (data?.isValid === true) return { status: 'gueltig', name: typeof data.name === 'string' && data.name !== '---' ? data.name : undefined }
    if (data?.isValid === false && (!data.userError || data.userError === 'INVALID')) return { status: 'ungueltig' }
    return { status: 'ungeprueft' }
  } catch {
    return { status: 'ungeprueft' }
  }
}
