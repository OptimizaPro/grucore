/**
 * Server-side CMS utility — llamar únicamente desde Server Components o route handlers.
 * El endpoint es público (AllowAny) — no requiere autenticación.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
const REVALIDATE = process.env.NODE_ENV === 'development' ? 0 : 3600

export type CMSBlocks   = Record<string, any>
export type CMSSections = Record<string, { label: string; blocks: CMSBlocks }>

export interface CMSPage {
  slug:             string
  title:            string
  meta_description: string
  is_published:     boolean
  updated_at:       string
  sections:         CMSSections
}

/**
 * Obtiene una página del CMS por slug e idioma.
 * Revalida cada hora (ISR). Devuelve null si la página no existe o hay error.
 */
export async function getCMSPage(slug: string, lang = 'es'): Promise<CMSPage | null> {
  try {
    const res = await fetch(`${API_URL}/api/cms/pages/${slug}/?lang=${lang}`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return null
    return res.json() as Promise<CMSPage>
  } catch {
    return null
  }
}

/** Shorthand para obtener los bloques de una sección. Devuelve {} si no existe. */
export function blocks(page: CMSPage | null, section: string): CMSBlocks {
  return page?.sections?.[section]?.blocks ?? {}
}

export interface ServiceImages {
  cover:  string | null
  before: string | null
  after:  string | null
}

/**
 * Obtiene las imágenes configuradas en el admin para un servicio.
 * Devuelve nulls si el servicio no tiene imágenes en el CMS (el frontend usa su fallback).
 */
export async function getServiceImages(slug: string): Promise<ServiceImages> {
  try {
    const res = await fetch(`${API_URL}/api/cms/services/${slug}/`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return { cover: null, before: null, after: null }
    return res.json() as Promise<ServiceImages>
  } catch {
    return { cover: null, before: null, after: null }
  }
}

export interface MarqueeItem { id: number; title: string; order: number }

/**
 * Obtiene los elementos activos del ticker de servicios.
 * Devuelve [] si no hay datos en el CMS (el componente usa el fallback del JSON).
 */
export async function getMarqueeItems(lang = 'es'): Promise<MarqueeItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/cms/marquee/?lang=${lang}`, {
      next: { revalidate: REVALIDATE },
    })
    if (!res.ok) return []
    const data = await res.json() as MarqueeItem[]
    return data.length ? data : []
  } catch {
    return []
  }
}
