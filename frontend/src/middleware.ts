import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

// Roles con acceso al ERP interno
const ERP_ROLES = new Set(['admin', 'project_manager', 'site_supervisor', 'team_member', 'contractor'])

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Portal de cliente: /portal/dashboard/* ────────────────────────────────
  if (pathname.startsWith('/portal/dashboard')) {
    if (!request.cookies.get('grucore_session')) {
      const url = new URL('/portal', request.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── ERP interno: /erp/* ──────────────────────────────────────────────────
  if (pathname.startsWith('/erp')) {
    // /erp/login no requiere auth — servir directamente
    if (!pathname.startsWith('/erp/login')) {
      const session = request.cookies.get('grucore_session')
      const role    = request.cookies.get('grucore_role')?.value

      if (!session || !role || !ERP_ROLES.has(role)) {
        const url = new URL('/erp/login', request.url)
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }
    }
    // Todas las rutas /erp/* bypasan i18n
    return NextResponse.next()
  }

  // ── i18n para rutas públicas ──────────────────────────────────────────────
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/portal/dashboard/:path*',
    '/erp/:path*',
    // i18n — excluye api, _next, archivos estáticos, admin, djamasy, portal, erp
    '/((?!api|_next|_vercel|admin|djamasy|portal|erp|.*\\..*).*)',
  ],
}
