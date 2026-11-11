import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articles } from './collections/Articles'
import { Inquiries, InquiryFiles } from './collections/Inquiries'
import { Materials } from './collections/Materials'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Orders, QuoteFiles, Quotes } from './collections/Quotes'
import { Services } from './collections/Services'
import { Users } from './collections/Users'
import { Calculator } from './globals/Calculator'
import { Homepage } from './globals/Homepage'
import { SiteSettings } from './globals/SiteSettings'
import { migrations } from './migrations'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · MINIMO3D' },
  },
  i18n: { supportedLanguages: { de, en }, fallbackLanguage: 'de' },
  collections: [Services, Materials, Articles, Pages, Media, Inquiries, InquiryFiles, Orders, Quotes, QuoteFiles, Users],
  globals: [Homepage, Calculator, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    prodMigrations: migrations,
  }),
  sharp,
  upload: { limits: { fileSize: 50 * 1024 * 1024 } },
  onInit: async (payload) => {
    await seed(payload)
  },
})
