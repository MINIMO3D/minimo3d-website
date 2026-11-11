import { unzipSync, strFromU8 } from 'fflate'

/** Dreiecksnetz in Millimetern: neun Zahlen je Dreieck (drei Eckpunkte), Z zeigt nach oben. */
export type Mesh = { positions: Float32Array }

export const MODEL_EXTENSIONS = ['stl', 'stp', 'step', 'obj', '3mf'] as const
export const MAX_TRIANGLES = 3_000_000

export class ModelError extends Error {}

const ext = (name: string) => name.split('.').pop()?.toLowerCase() || ''

export const isModelFile = (name: string) => (MODEL_EXTENSIONS as readonly string[]).includes(ext(name))

const checkCount = (triangles: number) => {
  if (triangles < 1) throw new ModelError('Die Datei enthält keine Geometrie.')
  if (triangles > MAX_TRIANGLES)
    throw new ModelError('Das Modell hat zu viele Dreiecke für die Sofortprüfung. Bitte senden Sie es als Anfrage.')
}

// ---------- STL ----------

const parseStl = (buf: Buffer): Mesh => {
  if (buf.length >= 84) {
    const n = buf.readUInt32LE(80)
    if (buf.length === 84 + n * 50) {
      checkCount(n)
      const positions = new Float32Array(n * 9)
      for (let i = 0; i < n; i++) {
        const o = 84 + i * 50 + 12
        for (let k = 0; k < 9; k++) positions[i * 9 + k] = buf.readFloatLE(o + k * 4)
      }
      return { positions }
    }
  }
  // ASCII
  const text = buf.toString('latin1')
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g
  const out: number[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    out.push(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]))
    if (out.length > MAX_TRIANGLES * 9) checkCount(MAX_TRIANGLES + 1)
  }
  const n = Math.floor(out.length / 9)
  checkCount(n)
  return { positions: new Float32Array(out.slice(0, n * 9)) }
}

// ---------- OBJ ----------

const parseObj = (buf: Buffer): Mesh => {
  const text = buf.toString('latin1')
  const verts: number[] = []
  const out: number[] = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('v ')) {
      const p = line.split(/\s+/)
      verts.push(parseFloat(p[1]), parseFloat(p[2]), parseFloat(p[3]))
    } else if (line.startsWith('f ')) {
      const idx = line
        .split(/\s+/)
        .slice(1)
        .map((t) => {
          const i = parseInt(t.split('/')[0], 10)
          return i < 0 ? verts.length / 3 + i : i - 1
        })
        .filter((i) => Number.isInteger(i) && i >= 0 && i < verts.length / 3)
      for (let k = 1; k + 1 < idx.length; k++) {
        for (const i of [idx[0], idx[k], idx[k + 1]]) out.push(verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2])
      }
      if (out.length > MAX_TRIANGLES * 9) checkCount(MAX_TRIANGLES + 1)
    }
  }
  checkCount(out.length / 9)
  return { positions: new Float32Array(out) }
}

// ---------- 3MF ----------

type Matrix = number[] // 12 Werte, zeilenweise 4x3
const IDENTITY: Matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]

const parseMatrix = (s?: string): Matrix => {
  if (!s) return IDENTITY
  const v = s.trim().split(/\s+/).map(Number)
  return v.length === 12 && v.every(Number.isFinite) ? v : IDENTITY
}

// erst a, dann b anwenden
const multiply = (a: Matrix, b: Matrix): Matrix => {
  const r = new Array(12).fill(0)
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j]
  for (let j = 0; j < 3; j++) r[9 + j] = a[9] * b[j] + a[10] * b[3 + j] + a[11] * b[6 + j] + b[9 + j]
  return r
}

const attr = (tag: string, name: string) => {
  const m = new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(tag)
  return m ? m[1] : undefined
}

type Obj3mf = { verts: number[]; tris: number[]; components: { path?: string; id: string; matrix: Matrix }[] }

const UNITS: Record<string, number> = { micron: 0.001, millimeter: 1, centimeter: 10, inch: 25.4, foot: 304.8, meter: 1000 }

const parse3mf = (buf: Buffer): Mesh => {
  let files: Record<string, Uint8Array>
  try {
    files = unzipSync(new Uint8Array(buf), { filter: (f) => f.name.toLowerCase().endsWith('.model') })
  } catch {
    throw new ModelError('Die 3MF-Datei konnte nicht geöffnet werden.')
  }
  const norm = (p: string) => p.replace(/^\/+/, '').toLowerCase()
  const models = new Map<string, { objects: Map<string, Obj3mf>; text: string }>()
  for (const [name, data] of Object.entries(files)) {
    const text = strFromU8(data)
    const objects = new Map<string, Obj3mf>()
    const objRe = /<object\b([^>]*)>([\s\S]*?)<\/object>/g
    let m: RegExpExecArray | null
    while ((m = objRe.exec(text))) {
      const id = attr(m[1], 'id')
      if (!id) continue
      const o: Obj3mf = { verts: [], tris: [], components: [] }
      const body = m[2]
      const vRe = /<vertex\b([^>]*)\/?>/g
      let v: RegExpExecArray | null
      while ((v = vRe.exec(body)))
        o.verts.push(Number(attr(v[1], 'x')), Number(attr(v[1], 'y')), Number(attr(v[1], 'z')))
      const tRe = /<triangle\b([^>]*)\/?>/g
      while ((v = tRe.exec(body)))
        o.tris.push(Number(attr(v[1], 'v1')), Number(attr(v[1], 'v2')), Number(attr(v[1], 'v3')))
      const cRe = /<component\b([^>]*)\/?>/g
      while ((v = cRe.exec(body))) {
        const cid = attr(v[1], 'objectid')
        if (cid) o.components.push({ path: attr(v[1], '[a-z]+:path'), id: cid, matrix: parseMatrix(attr(v[1], 'transform')) })
      }
      objects.set(id, o)
    }
    models.set(norm(name), { objects, text })
  }

  const rootName = [...models.keys()].find((n) => n === '3d/3dmodel.model') || [...models.keys()].find((n) => /<build\b/.test(models.get(n)!.text))
  if (!rootName) throw new ModelError('In der 3MF-Datei wurde kein Modell gefunden.')
  const root = models.get(rootName)!
  const unit = UNITS[attr(/<model\b([^>]*)>/.exec(root.text)?.[1] || '', 'unit') || 'millimeter'] || 1

  const out: number[] = []
  const emit = (modelName: string, id: string, matrix: Matrix, depth: number) => {
    const o = models.get(modelName)?.objects.get(id)
    if (!o || depth > 8) return
    for (let i = 0; i + 2 < o.tris.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        const vi = o.tris[i + k] * 3
        const x = o.verts[vi]
        const y = o.verts[vi + 1]
        const z = o.verts[vi + 2]
        out.push(
          (x * matrix[0] + y * matrix[3] + z * matrix[6] + matrix[9]) * unit,
          (x * matrix[1] + y * matrix[4] + z * matrix[7] + matrix[10]) * unit,
          (x * matrix[2] + y * matrix[5] + z * matrix[8] + matrix[11]) * unit,
        )
      }
      if (out.length > MAX_TRIANGLES * 9) checkCount(MAX_TRIANGLES + 1)
    }
    for (const c of o.components) emit(c.path ? norm(c.path) : modelName, c.id, multiply(c.matrix, matrix), depth + 1)
  }

  const build = /<build\b[^>]*>([\s\S]*?)<\/build>/.exec(root.text)?.[1] || ''
  const itemRe = /<item\b([^>]*)\/?>/g
  let it: RegExpExecArray | null
  let items = 0
  while ((it = itemRe.exec(build))) {
    const id = attr(it[1], 'objectid')
    if (!id) continue
    items++
    emit(rootName, id, parseMatrix(attr(it[1], 'transform')), 0)
  }
  if (!items) for (const id of root.objects.keys()) emit(rootName, id, IDENTITY, 0)

  checkCount(out.length / 9)
  return { positions: new Float32Array(out) }
}

// ---------- STEP ----------

let occtPromise: Promise<any> | null = null

const parseStep = async (buf: Buffer): Promise<Mesh> => {
  if (!occtPromise) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const init = require('occt-import-js')
    occtPromise = init()
  }
  const occt = await occtPromise
  const res = occt.ReadStepFile(new Uint8Array(buf), {
    linearUnit: 'millimeter',
    linearDeflectionType: 'bounding_box_ratio',
    linearDeflection: 0.001,
    angularDeflection: 0.4,
  })
  if (!res?.success || !res.meshes?.length) throw new ModelError('Die STEP-Datei konnte nicht gelesen werden.')
  let count = 0
  for (const m of res.meshes) count += (m.index?.array?.length || 0) / 3
  checkCount(count)
  const positions = new Float32Array(count * 9)
  let o = 0
  for (const m of res.meshes) {
    const p = m.attributes.position.array
    const idx = m.index.array
    for (let i = 0; i < idx.length; i++) {
      const vi = idx[i] * 3
      positions[o++] = p[vi]
      positions[o++] = p[vi + 1]
      positions[o++] = p[vi + 2]
    }
  }
  return { positions }
}

export const parseModel = async (buf: Buffer, filename: string): Promise<Mesh> => {
  const e = ext(filename)
  let mesh: Mesh
  if (e === 'stl') mesh = parseStl(buf)
  else if (e === 'obj') mesh = parseObj(buf)
  else if (e === '3mf') mesh = parse3mf(buf)
  else if (e === 'stp' || e === 'step') mesh = await parseStep(buf)
  else throw new ModelError('Dieses Dateiformat wird nicht unterstützt. Möglich sind STL, STEP, OBJ und 3MF.')
  for (let i = 0; i < mesh.positions.length; i++) {
    if (!Number.isFinite(mesh.positions[i])) throw new ModelError('Die Datei enthält ungültige Koordinaten.')
  }
  return mesh
}

/**
 * Verkleinerte Fassung für die 3D-Ansicht: fasst Eckpunkte in einem Raster zusammen,
 * bis das Netz höchstens `maxTriangles` Dreiecke hat. Kleine Netze bleiben unverändert.
 */
export const previewMesh = (positions: Float32Array, maxTriangles = 300_000): Float32Array => {
  if (positions.length / 9 <= maxTriangles) return positions
  let min = [Infinity, Infinity, Infinity]
  let max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3)
    for (let k = 0; k < 3; k++) {
      if (positions[i + k] < min[k]) min[k] = positions[i + k]
      if (positions[i + k] > max[k]) max[k] = positions[i + k]
    }
  const span = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) || 1
  let best = positions
  for (const cells of [512, 384, 256, 192, 128, 96]) {
    const step = span / cells
    const q = (v: number, k: number) => (Math.round((v - min[k]) / step) * step + min[k])
    const out = new Float32Array(positions.length)
    let o = 0
    for (let i = 0; i < positions.length; i += 9) {
      const t = new Array(9)
      for (let k = 0; k < 9; k++) t[k] = q(positions[i + k], k % 3)
      const same = (a: number, b: number) => t[a] === t[b] && t[a + 1] === t[b + 1] && t[a + 2] === t[b + 2]
      if (same(0, 3) || same(3, 6) || same(0, 6)) continue
      for (let k = 0; k < 9; k++) out[o++] = t[k]
    }
    best = out.slice(0, o)
    if (o / 9 <= maxTriangles) break
  }
  return best
}
