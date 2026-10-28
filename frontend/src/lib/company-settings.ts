/**
 * Company branding settings — shared across ERP, portal and public site.
 *
 * Client components: use `getCompanySettings()` — module-level cache prevents
 * repeated fetches within the same browser session.
 *
 * Server components: use `fetchCompanySettings()` — each call is a fresh
 * Next.js fetch with ISR revalidation (300 s).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export interface CompanySettings {
  name:           string
  tagline:        string
  description:    string
  phone:          string
  email:          string
  address:        string
  whatsapp:       string
  instagram:      string
  linkedin:       string
  facebook:       string
  logo_url:       string | null
  logo_light_url: string | null
  updated_at:     string
}

const FALLBACK: CompanySettings = {
  name:           'Grucore',
  tagline:        'Construcción y Remodelación Premium',
  description:    '',
  phone:          '',
  email:          '',
  address:        '',
  whatsapp:       '',
  instagram:      '',
  linkedin:       '',
  facebook:       '',
  logo_url:       null,
  logo_light_url: null,
  updated_at:     '',
}

// ── Client-side cache ────────────────────────────────────────────────────────
let _cache:   CompanySettings | null    = null
let _pending: Promise<CompanySettings> | null = null

export async function getCompanySettings(): Promise<CompanySettings> {
  if (_cache) return _cache
  if (_pending) return _pending
  _pending = fetch(`${API_URL}/api/settings/company/`)
    .then(r => (r.ok ? r.json() : FALLBACK))
    .then((data: CompanySettings) => { _cache = data; _pending = null; return data })
    .catch(() => { _pending = null; return FALLBACK })
  return _pending
}

/** Call after saving new settings to force a fresh fetch on next use. */
export function invalidateCompanySettings() {
  _cache   = null
  _pending = null
}

// ── Server-side fetch (use in async Server Components) ───────────────────────
export async function fetchCompanySettings(): Promise<CompanySettings> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
    const res = await fetch(`${backendUrl}/api/settings/company/`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return FALLBACK
    return res.json()
  } catch {
    return FALLBACK
  }
}
