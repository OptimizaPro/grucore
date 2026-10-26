/**
 * Server-side Portfolio API client.
 * Call only from Server Components or route handlers.
 * Endpoints are public (AllowAny) — no auth required.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PortfolioImage {
  id:         number
  url:        string
  alt_es:     string
  alt_en:     string
  caption_es: string
  caption_en: string
  sort_order: number
}

export interface PortfolioProjectSummary {
  id:                  number
  slug:                string
  title_es:            string
  title_en:            string
  project_type:        string
  project_type_label:  string
  location:            string
  year:                number | null
  area_m2:             string | null
  tagline_es:          string
  tagline_en:          string
  cover_url:           string
  featured:            boolean
  sort_order:          number
}

export interface PortfolioProjectDetail extends PortfolioProjectSummary {
  description_es: string
  description_en: string
  gallery:        PortfolioImage[]
}

// ── Fetch helpers ──────────────────────────────────────────────────────────────

/**
 * Fetches the published portfolio project list.
 * Revalidates every hour (ISR).
 */
export async function getPortfolioProjects(params?: {
  type?:     string
  featured?: boolean
}): Promise<PortfolioProjectSummary[]> {
  try {
    const qs = new URLSearchParams()
    if (params?.type)             qs.set('type', params.type)
    if (params?.featured === true) qs.set('featured', 'true')

    const url = `${API_URL}/api/portfolio/${qs.toString() ? `?${qs}` : ''}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    return res.json() as Promise<PortfolioProjectSummary[]>
  } catch {
    return []
  }
}

/**
 * Fetches a single published portfolio project by slug.
 * Returns null if not found or on error.
 */
export async function getPortfolioProject(
  slug: string,
): Promise<PortfolioProjectDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/portfolio/${slug}/`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json() as Promise<PortfolioProjectDetail>
  } catch {
    return null
  }
}
