import type { Metadata } from 'next'
import '../globals.css'
import ERPToaster from '@/components/erp/ERPToaster'
import ERPOnboarding from '@/components/erp/ERPOnboarding'

export const metadata: Metadata = {
  title: { default: 'Panel ERP — Grucore', template: '%s | ERP Grucore' },
  description: 'Panel interno de gestión de proyectos para el equipo de Grucore.',
  robots: { index: false, follow: false },
}

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#131D28] text-[#F0EDE8]">
        {children}
        <ERPToaster />
        <ERPOnboarding />
      </body>
    </html>
  )
}
