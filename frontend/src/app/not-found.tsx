import Link from 'next/link'

export default function NotFound() {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'rgba(255,107,53,0.04)', filter: 'blur(120px)' }} />

      <div className="relative z-10 text-center max-w-md">
        {/* Logo wordmark */}
        <p
          className="text-xs uppercase tracking-[0.3em] mb-8"
          style={{ fontFamily: 'Space Mono, monospace', color: '#FF6B35' }}
        >
          Grucore
        </p>

        {/* 404 */}
        <p
          className="text-[120px] font-bold leading-none mb-2 select-none"
          style={{
            fontFamily: 'Space Mono, monospace',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,107,53,0.35)',
          }}
        >
          404
        </p>

        <h1
          className="text-xl font-semibold text-[#F0EDE8] mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Página no encontrada
        </h1>
        <p className="text-sm text-[#8A95A5] mb-10 leading-relaxed">
          La ruta que buscas no existe o fue movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/erp/dashboard"
            className="px-6 py-3 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
          >
            Panel ERP
          </Link>
          <Link
            href="/portal"
            className="px-6 py-3 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
          >
            Portal cliente
          </Link>
        </div>
      </div>
    </div>
  )
}
