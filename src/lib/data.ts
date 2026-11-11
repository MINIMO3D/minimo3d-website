import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

export const payloadClient = cache(async () => getPayload({ config }))

export const getSettings = cache(async (): Promise<any> => {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})

export const getHomepage = cache(async (): Promise<any> => {
  const payload = await payloadClient()
  return payload.findGlobal({ slug: 'homepage', depth: 1 })
})

export const findAll = async (collection: string, opts: Record<string, unknown> = {}): Promise<any[]> => {
  const payload = await payloadClient()
  const res = await payload.find({ collection: collection as any, limit: 200, depth: 1, ...opts })
  return res.docs
}

export const findBySlug = async (collection: string, slug: string): Promise<any | null> => {
  const payload = await payloadClient()
  const res = await payload.find({
    collection: collection as any,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
}

export const telHref = (phone?: string) => (phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : '#')

export const mediaUrl = (media: any, size: 'card' | 'wide' = 'wide'): string | null => {
  if (!media || typeof media !== 'object') return null
  return media.sizes?.[size]?.url || media.url || null
}
