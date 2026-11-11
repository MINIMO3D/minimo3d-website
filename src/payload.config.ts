import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Articles } from './collections/Articles'
import { Customers } from './collections/Customers'
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
import { startCleanup } from './lib/cleanup'
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
  collections: [Services, Materials, Articles, Pages, Media, Inquiries, InquiryFiles, Orders, Quotes, QuoteFiles, Customers, Users],
  globals: [Homepage, Calculator, SiteSettings],
  editor: lexicalEditor(),
  // E-Mail-Versand: nur wenn die Zugangsdaten gesetzt sind (siehe scripts/set-smtp.sh)
  ...(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM || process.env.SMTP_USER,
          defaultFromName: 'MINIMO3D',
          // Ein Tippfehler in den Zugangsdaten darf die Website nicht am Start hindern
          skipVerify: true,
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT || 587) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          },
        }),
      }
    : {}),
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
    startCleanup(payload)
  },
})
