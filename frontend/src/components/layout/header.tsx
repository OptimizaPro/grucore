'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { Menu, X, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, useRouter, usePathname } from '@/i18n/navigation'
import { getCompanySettings } from '@/lib/company-settings'

const NAV_LINKS = [
  { key: 'services', href: '/services' },
  { key: 'projects', href: '/projects' },
  { key: 'about',    href: '/about' },
  { key: 'contact',  href: '/contact' },
] as const

function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const toggle = (next: 'es' | 'en') => {
    if (next === locale) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace({ pathname, params } as any, { locale: next })
  }

  return (
    <div className={cn('flex items-center gap-0.5 p-0.5 rounded-lg border border-[#27384A] bg-[#1A2530]', className)}>
      {(['es', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => toggle(l)}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider uppercase transition-all duration-200',
            locale === l
              ? 'bg-[#FF6B35] text-[#1A2530]'
              : 'text-[#8A95A5] hover:text-[#F0EDE8]'
          )}
          style={{ fontFamily: 'Space Mono, monospace' }}
          aria-label={l === 'es' ? 'Español' : 'English'}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

export function Header() {
  const t = useTranslations('Navigation')
  const pathname = usePathname()
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [logoUrl, setLogoUrl]     = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getCompanySettings().then(s => setLogoUrl(s.logo_light_url ?? s.logo_url))
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-[#1A2530]/95 backdrop-blur-md border-b border-[#27384A]'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center group transition-opacity hover:opacity-85"
            aria-label="Grucore — Inicio"
          >
            <Image
              src={logoUrl ?? '/Grucore-white.png'}
              alt="Grucore — Construcción y Remodelaciones"
              width={520}
              height={60}
              priority
              className="h-16 w-auto"
              style={{ width: 'auto' }}
              unoptimized={!!logoUrl}
            />
          </Link>

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {NAV_LINKS.map(({ key, href }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={key}
                  href={href}
                  className={cn(
                    'text-sm font-medium transition-all duration-200 tracking-wide pb-1 border-b-2',
                    isActive
                      ? 'text-[#F0EDE8] border-[#FF6B35]'
                      : 'text-[#8A95A5] border-transparent hover:text-[#F0EDE8] hover:border-[#FF6B35]'
                  )}
                >
                  {t(key)}
                </Link>
              )
            })}
          </nav>

          {/* Right side desktop */}
          <div className="hidden md:flex items-center gap-3">
            <LocaleSwitcher />
            <NextLink
              href="/portal"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#8A95A5] text-[#F0EDE8] hover:bg-[#1A2530] hover:text-[#F0EDE8] transition-colors duration-200"
            >
              {t('portal')}
            </NextLink>
            <Button
              size="sm"
              onClick={() => {
                document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {t('quote')}
            </Button>
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 text-[#F0EDE8] hover:text-[#FF6B35] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Overlay mobile */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#1A2530] transition-all duration-300 md:hidden flex flex-col',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden={!menuOpen}
      >
        <div className="h-20 border-b border-[#27384A]" />

        <nav className="flex flex-col p-8 gap-6" aria-label="Menú móvil">
          {NAV_LINKS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-semibold text-[#F0EDE8] hover:text-[#FF6B35] transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t(key).toUpperCase()}
            </Link>
          ))}

          <div className="mt-auto pt-8 border-t border-[#27384A] flex flex-col gap-4">
            {/* Locale switcher mobile */}
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#8A95A5]" />
              <span className="text-xs text-[#8A95A5] uppercase tracking-widest" style={{ fontFamily: 'Space Mono, monospace' }}>
                Idioma
              </span>
              <LocaleSwitcher className="ml-auto" />
            </div>
            <NextLink
              href="/portal"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#FF6B35] text-[#1A2530] hover:bg-[#FF8557] transition-colors duration-200 text-center"
              onClick={() => setMenuOpen(false)}
            >
              {t('portal')}
            </NextLink>
            <Button size="lg" className="w-full" onClick={() => setMenuOpen(false)}>
              {t('quote')}
            </Button>
          </div>
        </nav>
      </div>

      {/* Barra de acción fija mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#1A2530]/95 backdrop-blur-md border-t border-[#27384A] px-4 py-3">
        <div className="flex gap-3">
          <a
            href="tel:+50220000000"
            className="flex-1 h-11 flex items-center justify-center gap-2 border border-[#27384A] rounded-lg text-sm font-medium text-[#F0EDE8] hover:border-[#FF6B35] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6 19.79 19.79 0 0 1 1.65 5 2 2 0 0 1 3.63 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.6a16 16 0 0 0 6 6l.93-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 18l.5-1.08z" />
            </svg>
            Llamar
          </a>
          <a
            href="https://wa.me/50220000000"
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#25D366] rounded-lg text-sm font-medium text-white hover:bg-[#1ebe5d] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <button
            onClick={() => document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#FF6B35] rounded-lg text-sm font-semibold text-[#1A2530] hover:bg-[#FF8557] transition-colors"
          >
            Cotizar
          </button>
        </div>
      </div>
    </>
  )
}
