import fs from 'fs'
import path from 'path'
import type { Payload, PayloadRequest } from 'payload'

// Bilder der Startseite, mitgeliefert im Ordner seed-assets.
const advantageImages: Record<string, { file: string; alt: string }> = {
  'Ab einem Stück': {
    file: 'start-ab-einem-stueck.webp',
    alt: 'Ein einzelnes 3D-gedrucktes Rändelrad aus grauem Kunststoff',
  },
  'Im eigenen Haus': {
    file: 'start-im-eigenen-haus.webp',
    alt: 'Werkbank mit 3D-Drucker, Filamentspulen und Werkzeug',
  },
  'Material mit Plan': {
    file: 'start-material-mit-plan.webp',
    alt: 'Drei gedruckte Scharniere aus weißem, transparentem und schwarzem Material',
  },
  'Erst prüfen, dann fertigen': {
    file: 'start-erst-pruefen.webp',
    alt: 'Ein gedruckter Lagerbock wird mit dem Messschieber geprüft',
  },
}

const materialsImage = {
  file: 'start-materialmuster.webp',
  alt: 'Zwölf gedruckte Materialmuster in verschiedenen Farben und Oberflächen, daneben ein Messschieber',
  caption: 'Materialmuster: Farben und Oberflächen im direkten Vergleich',
}

// Texte der ersten Fassung, die zu den Bildern passend ergänzt werden.
// Wurde ein Text im Admin-Bereich schon geändert, bleibt er unberührt.
const textUpdates: Record<string, [from: string, to: string]> = {
  'Material mit Plan': [
    'Wir wählen das Material nach Belastung, Temperatur und gewünschter Oberfläche.',
    'Ein Scharnier, drei Materialien: Wir wählen nach Belastung, Temperatur und gewünschter Oberfläche.',
  ],
  'Erst prüfen, dann fertigen': [
    'Datei und Einsatzzweck besprechen wir mit Ihnen, bevor der Druck startet.',
    'Datei und Einsatzzweck besprechen wir mit Ihnen, bevor der Druck startet. Das fertige Teil prüfen wir vor dem Versand.',
  ],
}

/**
 * Lädt die mitgelieferten Startseiten-Bilder in die Bildverwaltung und hängt sie an
 * die passenden Vorteile und den Materialien-Abschnitt. Vorhandene Bilder bleiben.
 */
export const attachHomepageImages = async (payload: Payload, req?: PayloadRequest): Promise<void> => {
  const home: any = await payload.findGlobal({ slug: 'homepage', depth: 0, req })
  if (!home?.advantages?.length) return

  const dir = path.resolve(process.cwd(), 'seed-assets')
  const upload = async (file: string, alt: string) => {
    const filePath = path.join(dir, file)
    if (!fs.existsSync(filePath)) {
      payload.logger.warn(`Bild fehlt: ${filePath}`)
      return null
    }
    const doc = await payload.create({ collection: 'media', data: { alt }, filePath, req })
    return doc.id
  }

  const advantages = []
  for (const a of home.advantages) {
    const next = { ...a }
    const img = advantageImages[a.title]
    if (img && !a.image) next.image = await upload(img.file, img.alt)
    const update = textUpdates[a.title]
    if (update && a.text === update[0]) next.text = update[1]
    advantages.push(next)
  }

  const data: Record<string, unknown> = { advantages }
  if (!home.materialsImage) {
    data.materialsImage = await upload(materialsImage.file, materialsImage.alt)
    if (!home.materialsImageCaption) data.materialsImageCaption = materialsImage.caption
  }

  await payload.updateGlobal({ slug: 'homepage', data: data as any, req })
  payload.logger.info('Startseiten-Bilder zugeordnet.')
}
