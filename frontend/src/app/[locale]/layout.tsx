import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { fetchCompanySettings } from '@/lib/company-settings'
import { LanguageSwitcherFloat } from '@/components/ui/language-switcher-float'
import { LeadQualifierPanel } from '@/components/ui/lead-qualifier-panel'
import type { Metadata } from 'next'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: {
        es: '/',
        en: '/en',
      },
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const messages = await getMessages()
  const settings = await fetchCompanySettings()
  const logoUrl = settings.logo_light_url ?? settings.logo_url ?? null

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grucore.com').replace(/\/$/, '')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: settings.name || 'Grucore',
    description: settings.description || settings.tagline || 'Construcción y remodelación premium en Guatemala',
    url: siteUrl,
    ...(settings.logo_url ? { logo: settings.logo_url } : {}),
    ...(settings.phone    ? { telephone: settings.phone } : {}),
    ...(settings.email    ? { email: settings.email } : {}),
    ...(settings.address  ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: settings.address,
        addressCountry: 'GT',
      },
    } : {}),
    areaServed: {
      '@type': 'Country',
      name: 'Guatemala',
    },
    sameAs: [
      settings.instagram,
      settings.linkedin,
      settings.facebook,
    ].filter(Boolean),
  }

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;900&family=Roboto:wght@400;500&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header logoUrl={logoUrl} />
          <main id="main-content">{children}</main>
          <Footer />
          {/* Floating action bar — centered at bottom */}
          <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
            <LanguageSwitcherFloat />
            <LeadQualifierPanel />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
