import type { Metadata } from 'next'
import '../globals.css'
import ERPToaster from '@/components/erp/ERPToaster'
import ERPOnboarding from '@/components/erp/ERPOnboarding'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Panel ERP — Grucore', template: '%s | ERP Grucore' },
  description: 'Panel interno de gestión de proyectos para el equipo de Grucore.',
  robots: { index: false, follow: false },
}

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ERPToaster />
      <ERPOnboarding />
    </>
  )
}
