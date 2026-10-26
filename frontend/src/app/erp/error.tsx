'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'

export default function ERPError({
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
    <div className="min-h-screen bg-[#131D28] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,53,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,53,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[460px] rounded-full pointer-events-none"
        style={{ background: 'rgba(239,68,68,0.04)', filter: 'blur(90px)' }}
      />

      <div className="relative z-10 text-center max-w-md">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#27384A] bg-[#1F2D3A] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span className="text-[10px] text-[#8A95A5] uppercase tracking-widest" style={{ fontFamily: 'Space Mono, monospace' }}>
            Panel ERP
          </span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-400" />
        </div>

        <p
          className="text-[10px] uppercase tracking-widest text-red-400 mb-2"
          style={{ fontFamily: 'Space Mono, monospace' }}
        >
          Error inesperado
        </p>
        <h1
          className="text-xl font-semibold text-white mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Algo salió mal
        </h1>
        <p className="text-sm text-[#8A95A5] mb-2 leading-relaxed">
          Se produjo un error en esta sección del panel. Puedes reintentar o volver al inicio.
        </p>

        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="text-[11px] text-red-400/70 font-mono bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2 mb-6 text-left break-all">
            {error.message}
          </p>
        )}

        {error.digest && (
          <p className="text-[10px] text-[#4A5568] mb-6" style={{ fontFamily: 'Space Mono, monospace' }}>
            ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
          >
            <RefreshCw size={14} />
            Reintentar
          </button>
          <Link
            href="/erp/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
          >
            <LayoutDashboard size={14} />
            Ir al panel
          </Link>
        </div>
      </div>
    </div>
  )
}
