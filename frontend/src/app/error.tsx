'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[#131D28]">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,53,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,53,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'rgba(239,68,68,0.04)', filter: 'blur(100px)' }}
      />

      <div className="relative z-10 text-center max-w-md">
        <p
          className="text-[10px] uppercase tracking-[0.3em] mb-8"
          style={{ fontFamily: 'Space Mono, monospace', color: '#FF6B35' }}
        >
          Grucore
        </p>

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-400" />
        </div>

        <p
          className="text-[10px] uppercase tracking-widest text-red-400 mb-2"
          style={{ fontFamily: 'Space Mono, monospace' }}
        >
          Error 500
        </p>
        <h1
          className="text-xl font-semibold text-white mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Algo salió mal
        </h1>
        <p className="text-sm text-[#8A95A5] mb-8 leading-relaxed">
          Se produjo un error inesperado. Puedes intentar recargar o volver al inicio.
        </p>

        {error.digest && (
          <p className="text-[10px] text-[#4A5568] mb-6" style={{ fontFamily: 'Space Mono, monospace' }}>
            ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
          >
            <RefreshCw size={14} />
            Reintentar
          </button>
          <Link
            href="/erp/dashboard"
            className="px-6 py-3 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
          >
            Panel ERP
          </Link>
        </div>
      </div>
    </div>
  )
}
