import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { fetchCompanySettings } from '@/lib/company-settings'

export async function Footer() {
  const t     = await getTranslations('Navigation')
  const year  = new Date().getFullYear()
  const brand = await fetchCompanySettings()
  const logoSrc = brand.logo_url ?? '/Grucore-white.png'

  return (
    <footer className="bg-[#131D28] border-t border-[#27384A]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <Link href="/" aria-label="Grucore — Inicio">
                <Image
                  src={logoSrc}
                  alt="Grucore — Construcción y Remodelaciones"
                  width={520}
                  height={60}
                  className="h-20 w-auto"
                  style={{ width: 'auto' }}
                  unoptimized={!!brand.logo_url}
                />
              </Link>
              <p className="mt-4 text-sm text-[#8A95A5] leading-relaxed max-w-sm">
                Empresa guatemalteca de construcción y remodelación premium. Más de 10 años
                construyendo espacios que perduran.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <a
                href="https://wa.me/50220000000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8A95A5] hover:text-[#FF6B35] transition-colors"
                aria-label="WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/grucore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8A95A5] hover:text-[#FF6B35] transition-colors"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/grucore"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8A95A5] hover:text-[#FF6B35] transition-colors"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3
              className="text-xs font-semibold tracking-widest text-[#F0EDE8] uppercase"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Empresa
            </h3>
            <nav className="flex flex-col gap-3">
              {[
                { label: t('services'), href: '/services' as const },
                { label: t('projects'), href: '/projects' as const },
                { label: t('about'),    href: '/about'    as const },
                { label: t('contact'),  href: '/contact'  as const },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-[#8A95A5] hover:text-[#F0EDE8] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3
              className="text-xs font-semibold tracking-widest text-[#F0EDE8] uppercase"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Contacto
            </h3>
            <div className="flex flex-col gap-3 text-sm text-[#8A95A5]">
              <p>Ciudad de Guatemala, Guatemala</p>
              <a href="tel:+50220000000" className="hover:text-[#FF6B35] transition-colors">
                +502 2000-0000
              </a>
              <a href="mailto:info@grucore.com" className="hover:text-[#FF6B35] transition-colors">
                info@grucore.com
              </a>
              <div className="pt-1">
                <a
                  href="/portal"
                  className="text-[#FF6B35] hover:text-[#FF8557] transition-colors"
                >
                  {t('portal')} →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 pb-12 border-t border-[#27384A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8A95A5]">
            © {year} Grucore. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-[#8A95A5]">
            <Link href="/privacy" className="hover:text-[#F0EDE8] transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-[#F0EDE8] transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
