import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'
import { SERVICES, formatRangeGtq } from '@/lib/estimator'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { slug } = await params
  const service = SERVICES[slug]
  return [{ id: slug, alt: service ? service.label_es : 'Grucore' }]
}

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;900&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const css = await res.text()
    const url = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1]
    if (!url) return null
    return fetch(url).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

function loadLogo(): string {
  try {
    const data = readFileSync(join(process.cwd(), 'public', 'Grucore-white.png'))
    return `data:image/png;base64,${data.toString('base64')}`
  } catch {
    return ''
  }
}

export default async function ServiceOgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const service = SERVICES[slug]
  const lang = (locale === 'en' ? 'en' : 'es') as 'es' | 'en'

  const label       = service ? (lang === 'en' ? service.label_en       : service.label_es)       : 'Servicio'
  const description = service ? (lang === 'en' ? service.description_en : service.description_es) : ''
  const priceRange  = service ? formatRangeGtq(service.range_gtq) : ''
  const duration    = service
    ? `${service.typical_duration_months[0]}–${service.typical_duration_months[1]} ${lang === 'en' ? 'months' : 'meses'}`
    : ''

  const [fontData, logoSrc] = await Promise.all([loadFont(), Promise.resolve(loadLogo())])

  const fontFamily = fontData ? 'Montserrat' : 'sans-serif'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          backgroundColor: '#1A2530',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Orange left accent bar */}
        <div style={{ width: '8px', height: '100%', backgroundColor: '#FF6B35', flexShrink: 0 }} />

        {/* Background texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,107,53,0.03) 0px, rgba(255,107,53,0.03) 1px, transparent 1px, transparent 40px)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 72px 44px 64px',
            position: 'relative',
          }}
        >
          {/* Top: label + logo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#FF6B35',
                fontFamily,
              }}
            >
              {lang === 'en' ? 'Service' : 'Servicio'} · Grucore
            </span>
            {logoSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} width={130} height={40} style={{ objectFit: 'contain' }} alt="Grucore" />
            )}
          </div>

          {/* Center: service name + description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontSize: '62px',
                fontWeight: 900,
                color: '#F0EDE8',
                lineHeight: 1.1,
                fontFamily,
                maxWidth: '860px',
              }}
            >
              {label}
            </div>
            {description && (
              <div
                style={{
                  fontSize: '22px',
                  color: '#8A95A5',
                  lineHeight: 1.4,
                  fontFamily,
                  maxWidth: '760px',
                }}
              >
                {description}
              </div>
            )}
          </div>

          {/* Bottom: price + duration + domain */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
              {priceRange && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#8A95A5', fontFamily, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Investment' : 'Inversión'}
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#FF6B35', fontFamily }}>
                    {priceRange}
                  </span>
                </div>
              )}
              {duration && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#8A95A5', fontFamily, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Duration' : 'Duración'}
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#F0EDE8', fontFamily }}>
                    {duration}
                  </span>
                </div>
              )}
            </div>
            <span style={{ fontSize: '16px', color: '#8A95A5', fontFamily }}>
              grucore.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: 'Montserrat', data: fontData, style: 'normal', weight: 700 }]
        : [],
    }
  )
}
