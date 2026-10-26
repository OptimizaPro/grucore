import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed', // /es omitido para español, /en para inglés
  pathnames: {
    '/': '/',
    '/services': {
      es: '/servicios',
      en: '/services',
    },
    '/services/[slug]': {
      es: '/servicios/[slug]',
      en: '/services/[slug]',
    },
    '/projects': {
      es: '/proyectos',
      en: '/projects',
    },
    '/projects/[slug]': {
      es: '/proyectos/[slug]',
      en: '/projects/[slug]',
    },
    '/about': {
      es: '/nosotros',
      en: '/about',
    },
    '/contact': {
      es: '/contacto',
      en: '/contact',
    },
    '/privacy': '/privacy',
    '/terms': '/terms',
  },
})
