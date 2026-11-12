// Drucklage: sucht die Ausrichtung auf dem Druckbett, die am wenigsten Stützmaterial braucht.
// Geprüft werden die sechs Achsrichtungen und die größten ebenen Flächen des Modells als Auflage.

export type Orientation = {
  /** Drehmatrix (zeilenweise): neue Koordinaten = matrix · alte Koordinaten */
  matrix: number[]
  /** Wurde das Modell gegenüber der gelieferten Lage gedreht? */
  changed: boolean
  /** geschätztes Stützmaterial in der gelieferten und in der gewählten Lage, in cm³ */
  supportBeforeCm3: number
  supportCm3: number
  /** Zahl der geprüften Lagen */
  candidates: number
}

type Vec = [number, number, number]
type Score = { support: number; contact: number; height: number; fits: boolean }

const OVERHANG_COS = Math.cos((45 * Math.PI) / 180)
const SCORE_TRIANGLES = 150_000
const FACE_CANDIDATES = 26
const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1]

const norm = (v: Vec): Vec => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

/** Rechtshändige Drehung, die die Richtung "down" nach unten (−Z) legt. Achsrichtungen bleiben achsparallel. */
const basisFor = (down: Vec): number[] => {
  const up: Vec = [-down[0], -down[1], -down[2]]
  if (up[2] > 0.999999) return IDENTITY
  // Hilfsachse: die Koordinatenachse, die am wenigsten in Richtung "up" zeigt
  const ax = Math.abs(up[0]), ay = Math.abs(up[1]), az = Math.abs(up[2])
  const helper: Vec = ax <= ay && ax <= az ? [1, 0, 0] : ay <= az ? [0, 1, 0] : [0, 0, 1]
  const x = norm(cross(helper, up))
  const y = cross(up, x)
  return [...x, ...y, ...up]
}

/** Bewertet eine Lage mit denselben Regeln wie die Fertigungsanalyse (Überhang über 45°, Stützsäule bis zum Bett). */
const score = (pos: Float32Array, stride: number, m: number[], build?: { x: number; y: number; z: number }): Score => {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < pos.length; i += 9 * stride)
    for (let v = 0; v < 9; v += 3) {
      const px = pos[i + v], py = pos[i + v + 1], pz = pos[i + v + 2]
      for (let k = 0; k < 3; k++) {
        const c = m[k * 3] * px + m[k * 3 + 1] * py + m[k * 3 + 2] * pz
        if (c < min[k]) min[k] = c
        if (c > max[k]) max[k] = c
      }
    }
  const height = max[2] - min[2]
  const bedTol = Math.max(0.05, height * 0.002)
  const ux = m[6], uy = m[7], uz = m[8] // "oben" in alten Koordinaten
  let support = 0
  let contact = 0
  for (let i = 0; i < pos.length; i += 9 * stride) {
    const ax = pos[i], ay = pos[i + 1], az = pos[i + 2]
    const e1x = pos[i + 3] - ax, e1y = pos[i + 4] - ay, e1z = pos[i + 5] - az
    const e2x = pos[i + 6] - ax, e2y = pos[i + 7] - ay, e2z = pos[i + 8] - az
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x
    const len = Math.hypot(nx, ny, nz)
    if (len === 0) continue
    const nUp = nx * ux + ny * uy + nz * uz
    if (-nUp / len <= OVERHANG_COS) continue
    const za = ax * ux + ay * uy + az * uz
    const zb = pos[i + 3] * ux + pos[i + 4] * uy + pos[i + 5] * uz
    const zc = pos[i + 6] * ux + pos[i + 7] * uy + pos[i + 8] * uz
    if (Math.max(za, zb, zc) <= min[2] + bedTol) contact += len / 2
    else support += (Math.abs(nUp) / 2) * ((za + zb + zc) / 3 - min[2]) * 0.1
  }
  const sx = max[0] - min[0], sy = max[1] - min[1]
  const fits = !build || (height <= build.z && Math.max(sx, sy) <= Math.max(build.x, build.y) && Math.min(sx, sy) <= Math.min(build.x, build.y))
  return { support: support * stride, contact: contact * stride, height, fits }
}

/** Dreht um die Hochachse, bis der Grundriss möglichst klein und achsparallel ist (nur für schräge Lagen nötig). */
const squareUp = (pos: Float32Array, stride: number, m: number[]): number[] => {
  const turned = (deg: number) => {
    const c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180)
    return [
      c * m[0] - s * m[3], c * m[1] - s * m[4], c * m[2] - s * m[5],
      s * m[0] + c * m[3], s * m[1] + c * m[4], s * m[2] + c * m[5],
      m[6], m[7], m[8],
    ]
  }
  const areaOf = (r: number[]) => {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    for (let i = 0; i < pos.length; i += 9 * stride)
      for (let v = 0; v < 9; v += 3) {
        const x = r[0] * pos[i + v] + r[1] * pos[i + v + 1] + r[2] * pos[i + v + 2]
        const y = r[3] * pos[i + v] + r[4] * pos[i + v + 1] + r[5] * pos[i + v + 2]
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    return (x1 - x0) * (y1 - y0)
  }
  // erst grob in Grad-Schritten, dann fein um den besten Winkel
  let bestDeg = 0
  let bestArea = Infinity
  const tryDeg = (deg: number) => {
    const area = areaOf(turned(deg))
    if (area < bestArea * 0.99999) {
      bestArea = area
      bestDeg = deg
    }
  }
  for (let deg = 0; deg < 90; deg += 1) tryDeg(deg)
  const coarse = bestDeg
  for (let d = -1; d <= 1; d += 0.02) tryDeg(coarse + d)
  return turned(bestDeg)
}

export const findOrientation = (pos: Float32Array, volumeMm3: number, build?: { x: number; y: number; z: number }): Orientation => {
  const triangles = pos.length / 9
  const stride = Math.max(1, Math.ceil(triangles / SCORE_TRIANGLES))

  // Kandidaten: gelieferte Lage zuerst, dann die Achsen, dann die größten ebenen Flächen als Auflage
  const downs: Vec[] = [[0, 0, -1], [0, 0, 1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]]
  const faces = new Map<string, { n: Vec; area: number }>()
  for (let i = 0; i < pos.length; i += 9 * stride) {
    const e1x = pos[i + 3] - pos[i], e1y = pos[i + 4] - pos[i + 1], e1z = pos[i + 5] - pos[i + 2]
    const e2x = pos[i + 6] - pos[i], e2y = pos[i + 7] - pos[i + 1], e2z = pos[i + 8] - pos[i + 2]
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x
    const len = Math.hypot(nx, ny, nz)
    if (len === 0) continue
    const key = `${Math.round((nx / len) * 25)},${Math.round((ny / len) * 25)},${Math.round((nz / len) * 25)}`
    const f = faces.get(key)
    if (f) {
      f.n[0] += nx
      f.n[1] += ny
      f.n[2] += nz
      f.area += len
    } else faces.set(key, { n: [nx, ny, nz], area: len })
  }
  for (const f of [...faces.values()].sort((a, b) => b.area - a.area).slice(0, FACE_CANDIDATES)) {
    const d = norm(f.n)
    if (!downs.some((k) => k[0] * d[0] + k[1] * d[1] + k[2] * d[2] > 0.9995)) downs.push(d)
  }

  const scored = downs.map((d, index) => {
    const matrix = basisFor(d)
    return { index, matrix, ...score(pos, stride, matrix, build) }
  })
  const original = scored[0]
  const pool = scored.some((s) => s.fits) ? scored.filter((s) => s.fits) : scored

  // Rangfolge: wenig Stützmaterial, dann große Auflagefläche, dann geringe Höhe, im Zweifel die gelieferte Lage
  const supportTol = Math.max(20, volumeMm3 * 0.01)
  const minSupport = Math.min(...pool.map((s) => s.support))
  let shortlist = pool.filter((s) => s.support <= minSupport + supportTol)
  const maxContact = Math.max(...shortlist.map((s) => s.contact))
  shortlist = shortlist.filter((s) => s.contact >= maxContact * 0.9 - 1)
  const minHeight = Math.min(...shortlist.map((s) => s.height))
  shortlist = shortlist.filter((s) => s.height <= minHeight * 1.02 + 0.05)
  const best = shortlist.sort((a, b) => a.index - b.index)[0]

  const changed = best.index !== 0
  const axisAligned = best.matrix.every((v) => Math.abs(v) < 1e-9 || Math.abs(Math.abs(v) - 1) < 1e-9)
  const matrix = changed && !axisAligned ? squareUp(pos, stride, best.matrix) : best.matrix
  return {
    matrix: matrix.map((v) => Math.round(v * 1e7) / 1e7),
    changed,
    supportBeforeCm3: original.support / 1000,
    supportCm3: best.support / 1000,
    candidates: scored.length,
  }
}

/** Dreht das Netz in die Drucklage. Liefert das ursprüngliche Feld zurück, wenn nichts zu drehen ist. */
export const applyOrientation = (pos: Float32Array, matrix?: number[] | null): Float32Array => {
  if (!Array.isArray(matrix) || matrix.length !== 9 || matrix.some((v) => !Number.isFinite(v))) return pos
  if (matrix.every((v, i) => Math.abs(v - IDENTITY[i]) < 1e-9)) return pos
  const out = new Float32Array(pos.length)
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2]
    out[i] = matrix[0] * x + matrix[1] * y + matrix[2] * z
    out[i + 1] = matrix[3] * x + matrix[4] * y + matrix[5] * z
    out[i + 2] = matrix[6] * x + matrix[7] * y + matrix[8] * z
  }
  return out
}
