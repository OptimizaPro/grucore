/**
 * Server-side CMS utility — llamar únicamente desde Server Components o route handlers.
 * El endpoint es público (AllowAny) — no requiere autenticación.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

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
      next: { revalidate: 3600 },
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
