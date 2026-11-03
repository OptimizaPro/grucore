import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grucore.com').replace(/\/$/, '')

interface BuildMetadataOptions {
  title: string
  description: string
  locale: string
  /** Path for the canonical URL of the current locale, e.g. '/nosotros' */
  canonicalPath: string
  /** Localised paths for hreflang alternates */
  alternatePaths?: { es?: string; en?: string }
  /** Absolute URL or path for OG image */
  image?: string
  type?: 'website' | 'article'
}

export function buildMetadata({
  title,
  description,
  locale,
  canonicalPath,
  alternatePaths,
  image,
  type = 'website',
}: BuildMetadataOptions): Metadata {
  const canonical = `${SITE_URL}${canonicalPath}`
  const ogLocale  = locale === 'en' ? 'en_US' : 'es_GT'
  const altLocale = locale === 'en' ? 'es_GT' : 'en_US'

  const languages: Record<string, string> = {}
  if (alternatePaths?.es) languages.es = `${SITE_URL}${alternatePaths.es}`
  if (alternatePaths?.en) languages.en = `${SITE_URL}${alternatePaths.en}`

  const images = image
    ? [{ url: image.startsWith('http') ? image : `${SITE_URL}${image}`, width: 1200, height: 630, alt: title }]
    : []

  return {
    title,
    description,
    alternates: {
      canonical,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Grucore',
      locale: ogLocale,
      alternateLocale: altLocale,
      type,
      ...(images.length > 0 ? { images } : {}),
    },
    twitter: {
      card: images.length > 0 ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(images.length > 0 ? { images: [images[0].url] } : {}),
    },
  }
}
