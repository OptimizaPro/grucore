'use client'

import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

// global-error catches errors in the root layout itself.
// Must include <html> and <body> — no layout wraps this.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="es">
      <head>
        <title>Error — Grucore</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Space+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, background: '#131D28', display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          {/* Icon */}
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(248,113,113)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#FF6B35', marginBottom: 8 }}>
            Error crítico
          </p>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>
            El sistema no está disponible
          </h1>
          <p style={{ fontFamily: 'system-ui, sans-serif', fontSize: 14, color: '#8A95A5', lineHeight: 1.6, marginBottom: 32 }}>
            Se produjo un error en el núcleo de la aplicación. Por favor recarga la página.
          </p>

          {error.digest && (
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#4A5568', marginBottom: 24 }}>
              ID: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: '#FF6B35', color: '#131D28', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}
          >
            <RefreshCw size={14} />
            Recargar
          </button>
        </div>
      </body>
    </html>
  )
}
