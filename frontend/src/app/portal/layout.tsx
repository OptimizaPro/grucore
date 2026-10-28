import type { Metadata } from 'next'
import PortalOnboarding from '@/components/portal/PortalOnboarding'
import ERPToaster from '@/components/erp/ERPToaster'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Portal Cliente — Grucore', template: '%s | Portal Grucore' },
  description: 'Portal de seguimiento de proyectos para clientes de Grucore.',
  robots: { index: false, follow: false },
}

/**
 * Layout raíz del portal de cliente.
 *
 * IMPORTANTE: este árbol es completamente independiente de app/[locale]/layout.tsx.
 * NO incluir Header, Footer ni LanguageSwitcherFloat aquí — el portal tiene
 * su propia navegación interna en el dashboard.
 *
 * Protección de rutas: middleware.ts redirige /portal/dashboard/* al login
 * si la cookie `grucore_session` no existe.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PortalOnboarding />
      <ERPToaster />
    </>
  )
}
