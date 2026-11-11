import fs from 'fs'
import path from 'path'
import type { Payload, PayloadRequest } from 'payload'

/** Lädt das mitgelieferte Inhaberfoto in die Bildverwaltung, falls noch keines gesetzt ist. */
export const attachOwnerPhoto = async (payload: Payload, req?: PayloadRequest): Promise<void> => {
  const s: any = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
  if (!s?.company) return
  const data: Record<string, unknown> = {}
  if (!s.ownerTitle) data.ownerTitle = 'Unternehmensinhaber'
  if (!s.ownerPhoto) {
    const filePath = path.resolve(process.cwd(), 'seed-assets', 'inhaber.jpg')
    if (fs.existsSync(filePath)) {
      const doc = await payload.create({
        collection: 'media',
        data: { alt: `Porträt von ${s.owner || 'dem Inhaber'}` },
        filePath,
        req,
      })
      data.ownerPhoto = doc.id
    }
  }
  if (Object.keys(data).length) await payload.updateGlobal({ slug: 'site-settings', data: data as any, req })
}

/** Entfernt den alten Textabschnitt "Inhaber" am Ende der Seite Über uns, wenn er unverändert ist. */
export const removeOwnerParagraph = async (payload: Payload, req?: PayloadRequest): Promise<void> => {
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: 'ueber-uns' } }, limit: 1, depth: 0, req })
  const page: any = res.docs[0]
  const nodes: any[] | undefined = page?.content?.root?.children
  if (!nodes || nodes.length < 2) return
  const text = (n: any) => (n?.children || []).map((c: any) => c.text || '').join('')
  const [heading, para] = nodes.slice(-2)
  if (heading?.type === 'heading' && text(heading) === 'Inhaber' && text(para) === 'Daniele Bucci ist Inhaber von MINIMO3D.') {
    const content = { ...page.content, root: { ...page.content.root, children: nodes.slice(0, -2) } }
    await payload.update({ collection: 'pages', id: page.id, data: { content } as any, req })
  }
}
