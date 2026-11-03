import type { MetadataRoute } from 'next'
import { PROJECTS } from '@/lib/projects-data'
import { SERVICES } from '@/lib/estimator'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://grucore.com'

// Static public pages with their localised paths
// Default locale (es) has no prefix; en has /en prefix
const staticPages: MetadataRoute.Sitemap = [
  // Home
  { url: `${BASE_URL}/`,         alternates: { languages: { es: `${BASE_URL}/`,      en: `${BASE_URL}/en` } }, changeFrequency: 'monthly', priority: 1.0 },
  // Services index
  { url: `${BASE_URL}/servicios`, alternates: { languages: { es: `${BASE_URL}/servicios`, en: `${BASE_URL}/en/services` } }, changeFrequency: 'monthly', priority: 0.9 },
  // Projects index
  { url: `${BASE_URL}/proyectos`, alternates: { languages: { es: `${BASE_URL}/proyectos`, en: `${BASE_URL}/en/projects` } }, changeFrequency: 'weekly',  priority: 0.9 },
  // About
  { url: `${BASE_URL}/nosotros`,  alternates: { languages: { es: `${BASE_URL}/nosotros`, en: `${BASE_URL}/en/about` } }, changeFrequency: 'monthly', priority: 0.7 },
  // Contact
  { url: `${BASE_URL}/contacto`,  alternates: { languages: { es: `${BASE_URL}/contacto`, en: `${BASE_URL}/en/contact` } }, changeFrequency: 'monthly', priority: 0.8 },
  // Quote / Cotizar (es-only path, no i18n alternate defined in routing)
  { url: `${BASE_URL}/cotizar`,   changeFrequency: 'monthly', priority: 0.6 },
  // Legal
  { url: `${BASE_URL}/privacy`,   changeFrequency: 'yearly',  priority: 0.2 },
  { url: `${BASE_URL}/terms`,     changeFrequency: 'yearly',  priority: 0.2 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  // Dynamic: service detail pages
  const serviceEntries: MetadataRoute.Sitemap = Object.keys(SERVICES).map((slug) => ({
    url: `${BASE_URL}/servicios/${slug}`,
    alternates: {
      languages: {
        es: `${BASE_URL}/servicios/${slug}`,
        en: `${BASE_URL}/en/services/${slug}`,
      },
    },
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Dynamic: project detail pages
  const projectEntries: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${BASE_URL}/proyectos/${p.slug}`,
    alternates: {
      languages: {
        es: `${BASE_URL}/proyectos/${p.slug}`,
        en: `${BASE_URL}/en/projects/${p.slug}`,
      },
    },
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticPages, ...serviceEntries, ...projectEntries]
}
