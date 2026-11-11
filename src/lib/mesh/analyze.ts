import * as THREE from 'three'
import { MeshBVH } from 'three-mesh-bvh'

export type Metrics = {
  triangles: number
  /** Abmessungen in mm (X, Y, Z in der gelieferten Lage) */
  size: [number, number, number]
  volumeCm3: number
  areaCm2: number
  /** Fläche mit mehr als 45° Überhang, ohne Auflagefläche */
  overhangCm2: number
  /** geschätztes Stützmaterial */
  supportCm3: number
  /** Auflagefläche auf dem Druckbett */
  contactCm2: number
  watertight: boolean | null
  openEdges: number
  nonManifoldEdges: number
  shells: number | null
  /** Wandstärke aus Stichproben, in mm */
  wall: { p05: number; median: number; below08: number; below12: number; samples: number } | null
}

export type CheckStatus = 'ok' | 'warn' | 'fail' | 'info'
export type Check = { id: string; title: string; status: CheckStatus; value: string; text: string }

export type BuildVolume = { x: number; y: number; z: number }

const OVERHANG_COS = Math.cos((45 * Math.PI) / 180)
const TOPOLOGY_LIMIT = 1_500_000
const WALL_SAMPLES = 2500

const num = (v: number, digits = 1) => v.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const analyzeMesh = (positions: Float32Array): Metrics => {
  const n = positions.length / 9
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3)
    for (let k = 0; k < 3; k++) {
      const v = positions[i + k]
      if (v < min[k]) min[k] = v
      if (v > max[k]) max[k] = v
    }
  const size: [number, number, number] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  const diag = Math.hypot(size[0], size[1], size[2]) || 1

  let volume6 = 0
  let area = 0
  let overhang = 0
  let contact = 0
  let support = 0
  const bedTol = Math.max(0.05, size[2] * 0.002)
  // Bezugspunkt in der Modellmitte hält die Volumensumme numerisch stabil
  const cx = (min[0] + max[0]) / 2
  const cy = (min[1] + max[1]) / 2
  const cz = (min[2] + max[2]) / 2

  for (let i = 0; i < positions.length; i += 9) {
    const ax = positions[i] - cx, ay = positions[i + 1] - cy, az = positions[i + 2] - cz
    const bx = positions[i + 3] - cx, by = positions[i + 4] - cy, bz = positions[i + 5] - cz
    const dx = positions[i + 6] - cx, dy = positions[i + 7] - cy, dz = positions[i + 8] - cz
    volume6 += ax * (by * dz - bz * dy) - ay * (bx * dz - bz * dx) + az * (bx * dy - by * dx)
    const ux = bx - ax, uy = by - ay, uz = bz - az
    const vx = dx - ax, vy = dy - ay, vz = dz - az
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx
    const len = Math.hypot(nx, ny, nz)
    if (len === 0) continue
    const a = len / 2
    area += a
    const cosDown = -nz / len
    if (cosDown > OVERHANG_COS) {
      const zMax = Math.max(az, bz, dz) + cz
      if (zMax <= min[2] + bedTol) contact += a
      else {
        overhang += a
        // Stützsäule unter der projizierten Fläche bis zum Bett, mit rund 10 % Dichte
        support += Math.abs(nz) / 2 * ((az + bz + dz) / 3 + cz - min[2]) * 0.1
      }
    }
  }
  const volume = Math.abs(volume6) / 6

  // ---- Topologie: offene Kanten, Mehrfachkanten, Einzelkörper ----
  let watertight: boolean | null = null
  let openEdges = 0
  let nonManifoldEdges = 0
  let shells: number | null = null
  if (n <= TOPOLOGY_LIMIT) {
    const grid = Math.max(diag * 1e-6, 1e-5)
    const ids = new Map<string, number>()
    const tri = new Uint32Array(n * 3)
    for (let i = 0; i < n * 3; i++) {
      const key = `${Math.round(positions[i * 3] / grid)},${Math.round(positions[i * 3 + 1] / grid)},${Math.round(positions[i * 3 + 2] / grid)}`
      let id = ids.get(key)
      if (id === undefined) {
        id = ids.size
        ids.set(key, id)
      }
      tri[i] = id
    }
    const vcount = ids.size
    const parent = new Uint32Array(vcount)
    for (let i = 0; i < vcount; i++) parent[i] = i
    const find = (x: number) => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]]
        x = parent[x]
      }
      return x
    }
    const edges = new Map<number, number>()
    for (let t = 0; t < n; t++) {
      const a = tri[t * 3], b = tri[t * 3 + 1], c = tri[t * 3 + 2]
      if (a === b || b === c || a === c) continue
      for (const [p, q] of [[a, b], [b, c], [c, a]] as [number, number][]) {
        const key = p < q ? p * vcount + q : q * vcount + p
        edges.set(key, (edges.get(key) || 0) + 1)
        const rp = find(p), rq = find(q)
        if (rp !== rq) parent[rp] = rq
      }
    }
    for (const count of edges.values()) {
      if (count === 1) openEdges++
      else if (count > 2) nonManifoldEdges++
    }
    watertight = openEdges === 0 && nonManifoldEdges === 0
    const roots = new Set<number>()
    for (let t = 0; t < n; t++) roots.add(find(tri[t * 3]))
    shells = roots.size
  }

  // ---- Wandstärke: Strahl von der Oberfläche nach innen bis zur nächsten Fläche ----
  let wall: Metrics['wall'] = null
  try {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const bvh = new MeshBVH(geometry)
    const eps = diag * 1e-5
    const ray = new THREE.Ray()
    const found: { d: number; a: number }[] = []
    let total = 0

    // Stichprobenpunkte gleichmäßig über die Oberfläche verteilen (flächengewichtet, reproduzierbar)
    const cumulative = new Float64Array(n)
    let sum = 0
    for (let t = 0; t < n; t++) {
      const i = t * 9
      const ux = positions[i + 3] - positions[i], uy = positions[i + 4] - positions[i + 1], uz = positions[i + 5] - positions[i + 2]
      const vx = positions[i + 6] - positions[i], vy = positions[i + 7] - positions[i + 1], vz = positions[i + 8] - positions[i + 2]
      sum += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2
      cumulative[t] = sum
    }
    let seed = 12345
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }
    for (let k = 0; k < WALL_SAMPLES && sum > 0; k++) {
      const target = ((k + rand()) / WALL_SAMPLES) * sum
      let lo = 0
      let hi = n - 1
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (cumulative[mid] < target) lo = mid + 1
        else hi = mid
      }
      const i = lo * 9
      const ax = positions[i], ay = positions[i + 1], az = positions[i + 2]
      const ux = positions[i + 3] - ax, uy = positions[i + 4] - ay, uz = positions[i + 5] - az
      const vx = positions[i + 6] - ax, vy = positions[i + 7] - ay, vz = positions[i + 8] - az
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx
      const len = Math.hypot(nx, ny, nz)
      if (len < 1e-12) continue
      let r1 = rand()
      let r2 = rand()
      if (r1 + r2 > 1) {
        r1 = 1 - r1
        r2 = 1 - r2
      }
      // etwas Abstand zu den Dreieckskanten, damit Nachbarflächen nicht als Wand zählen
      r1 = 0.1 + r1 * 0.7
      r2 = 0.1 + r2 * 0.7
      ray.direction.set(-nx / len, -ny / len, -nz / len)
      ray.origin.set(ax + ux * r1 + vx * r2, ay + uy * r1 + vy * r2, az + uz * r1 + vz * r2).addScaledVector(ray.direction, eps)
      const hit = bvh.raycastFirst(ray, THREE.DoubleSide)
      if (hit && Number.isFinite(hit.distance)) {
        found.push({ d: hit.distance + eps, a: 1 })
        total += 1
      }
    }
    if (found.length >= 20 && total > 0) {
      found.sort((p, q) => p.d - q.d)
      let acc = 0
      let p05 = found[0].d
      let median = found[0].d
      let below08 = 0
      let below12 = 0
      let gotP05 = false
      let gotMedian = false
      for (const f of found) {
        acc += f.a
        if (f.d < 0.8) below08 += f.a
        if (f.d < 1.2) below12 += f.a
        if (!gotP05 && acc >= total * 0.05) { p05 = f.d; gotP05 = true }
        if (!gotMedian && acc >= total * 0.5) { median = f.d; gotMedian = true }
      }
      wall = { p05, median, below08: below08 / total, below12: below12 / total, samples: found.length }
    }
  } catch {
    wall = null
  }

  const supportCm3 = Math.min(support / 1000, volume / 1000)
  return {
    triangles: n,
    size,
    volumeCm3: volume / 1000,
    areaCm2: area / 100,
    overhangCm2: overhang / 100,
    supportCm3,
    contactCm2: contact / 100,
    watertight,
    openEdges,
    nonManifoldEdges,
    shells,
    wall,
  }
}

/** Passt das Teil in den Bauraum, wenn man es beliebig dreht? */
export const fitsBuildVolume = (size: number[], build: BuildVolume) => {
  const a = [...size].sort((p, q) => q - p)
  const b = [build.x, build.y, build.z].sort((p, q) => q - p)
  return a[0] <= b[0] && a[1] <= b[1] && a[2] <= b[2]
}

/** Fertigungsprüfung (DFM) für FDM-Druck, als Liste von Befunden. */
export const dfmChecks = (m: Metrics, build: BuildVolume): Check[] => {
  const checks: Check[] = []
  const [x, y, z] = m.size
  const dims = `${num(x)} × ${num(y)} × ${num(z)} mm`
  const smallest = Math.min(x, y, z)

  if (fitsBuildVolume(m.size, build))
    checks.push({ id: 'size', title: 'Bauraum', status: 'ok', value: dims, text: `Das Teil passt am Stück in den Bauraum von ${build.x} × ${build.y} × ${build.z} mm.` })
  else
    checks.push({ id: 'size', title: 'Bauraum', status: 'fail', value: dims, text: `Das Teil ist größer als der Bauraum von ${build.x} × ${build.y} × ${build.z} mm. Wir fertigen es geteilt und gefügt oder auf Anfrage. Bitte senden Sie uns dazu eine Anfrage.` })

  if (smallest < 1)
    checks.push({ id: 'tiny', title: 'Kleinste Abmessung', status: 'fail', value: `${num(smallest, 2)} mm`, text: 'Eine Abmessung liegt unter 1 mm. Im FDM-Druck ist das nicht zuverlässig herstellbar. Prüfen Sie bitte Maßstab und Einheit der Datei.' })
  else if (smallest < 2)
    checks.push({ id: 'tiny', title: 'Kleinste Abmessung', status: 'warn', value: `${num(smallest, 2)} mm`, text: 'Das Teil ist in einer Richtung sehr dünn. Es kann sich verziehen und ist wenig belastbar.' })

  if (m.watertight === null)
    checks.push({ id: 'closed', title: 'Geschlossenes Netz', status: 'info', value: 'nicht geprüft', text: 'Das Netz ist für die automatische Prüfung zu groß. Wir prüfen es vor dem Druck von Hand.' })
  else if (m.watertight)
    checks.push({ id: 'closed', title: 'Geschlossenes Netz', status: 'ok', value: 'geschlossen', text: 'Das Netz ist wasserdicht. Volumen und Preis lassen sich sicher berechnen.' })
  else
    checks.push({ id: 'closed', title: 'Geschlossenes Netz', status: 'warn', value: `${m.openEdges} offene, ${m.nonManifoldEdges} mehrfache Kanten`, text: 'Das Netz hat Lücken oder mehrfach belegte Kanten. Wir reparieren das meist vor dem Druck. Volumen und Preis können dadurch leicht abweichen.' })

  if (m.shells !== null && m.shells > 1)
    checks.push({ id: 'shells', title: 'Einzelkörper', status: 'info', value: `${m.shells} Körper`, text: 'Die Datei enthält mehrere getrennte Körper. Sie werden zusammen als ein Auftrag gedruckt. Durchdringen sich Körper, verschmelzen wir sie beim Slicen.' })

  if (m.wall) {
    const value = `ab etwa ${num(m.wall.p05, 2)} mm, typisch ${num(m.wall.median, 2)} mm`
    if (m.wall.below08 > 0.03)
      checks.push({ id: 'wall', title: 'Wandstärke', status: 'fail', value, text: `Rund ${num(m.wall.below08 * 100, 0)} % der Oberfläche sind dünner als 0,8 mm. Solche Wände werden oft nicht oder nur brüchig gedruckt. Wir empfehlen mindestens 1,2 mm.` })
    else if (m.wall.below12 > 0.05)
      checks.push({ id: 'wall', title: 'Wandstärke', status: 'warn', value, text: `Rund ${num(m.wall.below12 * 100, 0)} % der Oberfläche sind dünner als unsere Empfehlung von 1,2 mm. Druckbar, aber empfindlich. Spitz zulaufende Kanten zählen hier mit.` })
    else
      checks.push({ id: 'wall', title: 'Wandstärke', status: 'ok', value, text: 'Die Wände liegen über unserer Empfehlung von mindestens 1,2 mm.' })
  }

  const overhangShare = m.areaCm2 > 0 ? m.overhangCm2 / m.areaCm2 : 0
  if (m.overhangCm2 < 0.05)
    checks.push({ id: 'overhang', title: 'Überhänge', status: 'ok', value: 'keine', text: 'In der gelieferten Lage sind keine Stützstrukturen nötig.' })
  else if (overhangShare < 0.12)
    checks.push({ id: 'overhang', title: 'Überhänge', status: 'info', value: `${num(m.overhangCm2)} cm² über 45°`, text: `Einige Flächen brauchen Stützstrukturen (etwa ${num(m.supportCm3)} cm³). Die gestützten Flächen sind etwas rauer. Wir wählen die Drucklage so, dass möglichst wenig gestützt wird.` })
  else
    checks.push({ id: 'overhang', title: 'Überhänge', status: 'warn', value: `${num(m.overhangCm2)} cm² über 45°`, text: `Ein großer Teil der Oberfläche hängt über (etwa ${num(m.supportCm3)} cm³ Stützmaterial). Eine andere Drucklage, Fasen oder eine Teilung können Material und Nacharbeit sparen. Wir prüfen die beste Lage vor dem Druck.` })

  const footprint = (x * y) / 100
  if (m.contactCm2 < 0.2 || (footprint > 0 && m.contactCm2 / footprint < 0.03))
    checks.push({ id: 'contact', title: 'Auflagefläche', status: 'warn', value: `${num(m.contactCm2)} cm²`, text: 'In der gelieferten Lage liegt das Teil kaum flach auf dem Druckbett. Wir drehen es vor dem Druck in eine stabile Lage oder stützen es ab.' })
  else
    checks.push({ id: 'contact', title: 'Auflagefläche', status: 'ok', value: `${num(m.contactCm2)} cm²`, text: 'Das Teil hat eine ebene Auflagefläche und haftet gut auf dem Druckbett.' })

  const base = Math.min(x, y)
  if (base > 0 && z / base > 8)
    checks.push({ id: 'slender', title: 'Schlankheit', status: 'warn', value: `Höhe ${num(z / base, 0)}-mal so groß wie die schmale Seite`, text: 'Hohe, schlanke Teile schwingen beim Druck. Wir drucken sie liegend, wenn die Belastung das zulässt.' })

  if (Math.max(x, y) > 200)
    checks.push({ id: 'warp', title: 'Verzug', status: 'info', value: `${num(Math.max(x, y), 0)} mm Kantenlänge`, text: 'Große, flache Teile können sich bei ABS, ASA, PC und Polyamid verziehen. PLA und PETG sind hier unkritischer.' })

  return checks
}

export const worstStatus = (checks: Check[]): CheckStatus =>
  checks.some((c) => c.status === 'fail') ? 'fail' : checks.some((c) => c.status === 'warn') ? 'warn' : 'ok'
