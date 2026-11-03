import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap',
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

export default async function OgImage() {
  const [fontData, logoSrc] = await Promise.all([loadFont(), Promise.resolve(loadLogo())])

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#1A2530',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Orange top bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#FF6B35', flexShrink: 0 }} />

        {/* Background pattern — subtle diagonal lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,107,53,0.03) 0px, rgba(255,107,53,0.03) 1px, transparent 1px, transparent 40px)',
          }}
        />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 80px',
            gap: '24px',
          }}
        >
          {logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} width={200} height={60} style={{ objectFit: 'contain' }} alt="Grucore" />
          )}

          <div
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#F0EDE8',
              textAlign: 'center',
              lineHeight: 1.15,
              fontFamily: fontData ? 'Montserrat' : 'sans-serif',
            }}
          >
            Construcción y Remodelación Premium
          </div>

          <div
            style={{
              fontSize: '22px',
              color: '#FF6B35',
              fontFamily: fontData ? 'Montserrat' : 'sans-serif',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Guatemala
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            padding: '20px 60px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#8A95A5', fontSize: '16px', fontFamily: 'sans-serif' }}>
            grucore.com
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF6B35' }} />
            <span style={{ color: '#8A95A5', fontSize: '16px', fontFamily: 'sans-serif' }}>
              Consulta gratuita en 24h
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
