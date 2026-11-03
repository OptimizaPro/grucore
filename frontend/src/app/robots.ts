import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://grucore.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/erp/', '/portal/', '/djamasy/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
