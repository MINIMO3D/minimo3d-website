import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Der STEP-Leser bringt eine WebAssembly-Datei mit, die unverändert mit ausgeliefert werden muss.
  serverExternalPackages: ['occt-import-js'],
  outputFileTracingIncludes: {
    '/rechner/analyse': ['./node_modules/occt-import-js/dist/**'],
    '/rechner/mesh/[token]': ['./node_modules/occt-import-js/dist/**'],
  },
  async redirects() {
    return [
      { source: '/materialien/vergleich', destination: '/materialien', permanent: false },
    ]
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
