import Link from 'next/link'
import { LayoutDashboard, Building2, Users, Package } from 'lucide-react'

const QUICK_LINKS = [
  { href: '/erp/dashboard',    Icon: LayoutDashboard, label: 'Proyectos' },
  { href: '/erp/clients',      Icon: Building2,       label: 'Clientes'  },
  { href: '/erp/team',         Icon: Users,           label: 'Equipo'    },
  { href: '/erp/inventory',    Icon: Package,         label: 'Inventario'},
]

export default function ERPNotFound() {
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
        style={{ background: 'rgba(255,107,53,0.04)', filter: 'blur(90px)' }}
      />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#27384A] bg-[#1F2D3A] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />
          <span className="text-[10px] text-[#8A95A5] uppercase tracking-widest" style={{ fontFamily: 'Space Mono, monospace' }}>
            Panel ERP
          </span>
        </div>

        {/* 404 */}
        <p
          className="text-[108px] font-bold leading-none mb-2 select-none"
          style={{
            fontFamily: 'Space Mono, monospace',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,107,53,0.3)',
          }}
        >
          404
        </p>

        <h1
          className="text-xl font-semibold text-white mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Página no encontrada
        </h1>
        <p className="text-sm text-[#8A95A5] mb-10 leading-relaxed">
          La sección que buscas dentro del panel no existe o fue movida.
        </p>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {QUICK_LINKS.map(({ href, Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/40 hover:bg-[#27384A] transition-colors group"
            >
              <Icon size={16} className="text-[#4A5568] group-hover:text-[#FF6B35] transition-colors" />
              <span className="text-[11px] text-[#8A95A5] group-hover:text-[#F0EDE8] transition-colors">{label}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/erp/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
        >
          <LayoutDashboard size={14} />
          Ir al panel
        </Link>
      </div>
    </div>
  )
}
