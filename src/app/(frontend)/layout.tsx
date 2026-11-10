import type { Metadata } from 'next'
import { connection } from 'next/server'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getSettings } from '@/lib/data'
import './styles.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  await connection()
  const s = await getSettings()
  return {
    title: { default: `${s.company} · 3D-Druck bei Stuttgart`, template: `%s · ${s.company}` },
    description: s.seoDescription,
    icons: { icon: '/favicon.svg' },
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Inhalte kommen aus der Datenbank: nie beim Build vorab rendern.
  await connection()
  return (
    <html lang="de">
      <head>
        <meta name="theme-color" content="#2163b5" />
      </head>
      <body>
        <Header />
        <main id="inhalt">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
