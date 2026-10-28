import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // Dev — backend local y Railway Volume
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      // Producción — backend Railway (ajusta el hostname cuando lo tengas)
      {
        protocol: 'https',
        hostname: '*.railway.app',
        pathname: '/media/**',
      },
      // Supabase Storage (activar con USE_S3=True)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async redirects() {
    const adminDomain = process.env.ADMIN_DOMAIN ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    return [
      {
        source: '/djamasy',
        destination: `${adminDomain}/djamasy/`,
        permanent: false,
      },
      {
        source: '/djamasy/:path*',
        destination: `${adminDomain}/djamasy/:path*`,
        permanent: false,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
