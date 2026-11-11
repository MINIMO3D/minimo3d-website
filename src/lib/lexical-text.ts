import { createHash } from 'crypto'

/** Reiner Text eines Lexical-Inhalts, in Lesereihenfolge. */
export const plainText = (node: any): string => {
  if (!node || typeof node !== 'object') return ''
  if (Array.isArray(node)) return node.map(plainText).join('')
  const own = typeof node.text === 'string' ? node.text : ''
  const kids = node.root ? plainText(node.root) : Array.isArray(node.children) ? node.children.map(plainText).join('\n') : ''
  return own + kids
}

/** Fingerabdruck eines Textes: Damit erkennen Migrationen, ob ein Text seit der Auslieferung bearbeitet wurde. */
export const textHash = (content: unknown) => createHash('sha256').update(plainText(content).replace(/\s+/g, ' ').trim()).digest('hex')
