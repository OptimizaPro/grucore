import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'en' ? 'Privacy Policy — Grucore' : 'Política de Privacidad — Grucore',
    description:
      locale === 'en'
        ? 'Learn how Grucore collects, uses, and protects your personal information.'
        : 'Conoce cómo Grucore recopila, usa y protege tu información personal.',
    robots: { index: true, follow: true },
  }
}

const LAST_UPDATED = '28 de octubre de 2025'
const LAST_UPDATED_EN = 'October 28, 2025'
const COMPANY = 'Grucore, S.A.'
const EMAIL = 'privacidad@grucore.com'
const ADDRESS = 'Ciudad de Guatemala, Guatemala'

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  const en = locale === 'en'

  return (
    <main className="bg-[#1A2530] min-h-screen">
      <PageHero
        eyebrow={en ? 'Legal' : 'Legal'}
        title={en ? 'Privacy Policy' : 'Política de Privacidad'}
        subtitle={
          en
            ? `Last updated: ${LAST_UPDATED_EN}`
            : `Última actualización: ${LAST_UPDATED}`
        }
      />

      <section className="max-w-3xl mx-auto px-6 py-16 text-[#B8C4CE] leading-relaxed space-y-10">

        {/* Intro */}
        <div>
          <p className="text-[#F0EDE8]">
            {en
              ? `${COMPANY} ("Grucore", "we", "us") operates the website grucore.com. This policy explains how we collect, use, and protect your personal information when you use our services.`
              : `${COMPANY} ("Grucore", "nosotros") opera el sitio web grucore.com. Esta política explica cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestros servicios.`}
          </p>
        </div>

        <LegalSection
          title={en ? '1. Information We Collect' : '1. Información que recopilamos'}
          items={
            en
              ? [
                  '**Contact information:** name, email address, phone number, and any message you send through our contact form or quote request form.',
                  '**Usage data:** pages visited, time on site, browser type, and device information (collected via cookies and analytics tools).',
                  '**Project data:** information you provide when requesting a quote or consulting about a construction or remodeling project.',
                ]
              : [
                  '**Información de contacto:** nombre, correo electrónico, teléfono y cualquier mensaje que nos envíes a través de nuestro formulario de contacto o solicitud de cotización.',
                  '**Datos de uso:** páginas visitadas, tiempo en el sitio, tipo de navegador e información del dispositivo (recopilados a través de cookies y herramientas de analítica).',
                  '**Datos del proyecto:** información que proporcionas al solicitar una cotización o consultar sobre un proyecto de construcción o remodelación.',
                ]
          }
        />

        <LegalSection
          title={en ? '2. How We Use Your Information' : '2. Cómo usamos tu información'}
          items={
            en
              ? [
                  'Respond to your inquiries and send project quotes.',
                  'Communicate about the status of your project.',
                  'Improve our website and services.',
                  'Send relevant service information (only with your consent).',
                  'Comply with our legal and contractual obligations.',
                ]
              : [
                  'Responder tus consultas y enviarte cotizaciones de proyectos.',
                  'Comunicarnos sobre el estado de tu proyecto.',
                  'Mejorar nuestro sitio web y servicios.',
                  'Enviarte información relevante sobre nuestros servicios (solo con tu consentimiento).',
                  'Cumplir nuestras obligaciones legales y contractuales.',
                ]
          }
        />

        <LegalSection
          title={en ? '3. Cookies' : '3. Cookies'}
          body={
            en
              ? 'We use essential cookies to operate the website and analytics cookies (Google Analytics) to understand how visitors use our site. You can disable cookies from your browser settings at any time, though some features may not function properly.'
              : 'Utilizamos cookies esenciales para el funcionamiento del sitio y cookies de analítica (Google Analytics) para comprender cómo los visitantes usan nuestro sitio. Puedes deshabilitar las cookies desde la configuración de tu navegador en cualquier momento, aunque es posible que algunas funciones dejen de funcionar correctamente.'
          }
        />

        <LegalSection
          title={en ? '4. Data Sharing' : '4. Compartición de datos'}
          body={
            en
              ? 'We do not sell, rent, or share your personal information with third parties for marketing purposes. We may share data with trusted service providers (hosting, email, analytics) who process it on our behalf and under confidentiality obligations. We may disclose information if required by law.'
              : 'No vendemos, alquilamos ni compartimos tu información personal con terceros con fines comerciales. Podemos compartir datos con proveedores de servicios de confianza (hosting, correo, analítica) que los procesan en nuestro nombre y bajo obligaciones de confidencialidad. Podemos divulgar información si la ley así lo requiere.'
          }
        />

        <LegalSection
          title={en ? '5. Data Retention' : '5. Retención de datos'}
          body={
            en
              ? 'We retain your personal data for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. Contact form data is retained for up to 2 years; project client data is retained for the duration of the contractual relationship plus 5 years.'
              : 'Conservamos tus datos personales durante el tiempo necesario para cumplir con los fines descritos en esta política, o según lo exija la legislación aplicable. Los datos de formularios de contacto se conservan hasta 2 años; los datos de clientes con proyecto activo se conservan durante la relación contractual más 5 años.'
          }
        />

        <LegalSection
          title={en ? '6. Your Rights' : '6. Tus derechos'}
          body={
            en
              ? `You have the right to access, correct, delete, or limit the use of your personal data. To exercise these rights, contact us at ${EMAIL}. We will respond within 30 business days.`
              : `Tienes derecho a acceder, rectificar, eliminar o limitar el uso de tus datos personales. Para ejercer estos derechos, contáctanos en ${EMAIL}. Responderemos en un plazo de 30 días hábiles.`
          }
        />

        <LegalSection
          title={en ? '7. Security' : '7. Seguridad'}
          body={
            en
              ? 'We implement technical and organizational security measures to protect your data against unauthorized access, alteration, disclosure, or destruction. All data transmissions are encrypted using SSL/TLS.'
              : 'Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos frente a acceso no autorizado, alteración, divulgación o destrucción. Todas las transmisiones de datos están cifradas mediante SSL/TLS.'
          }
        />

        <LegalSection
          title={en ? '8. Changes to This Policy' : '8. Cambios en esta política'}
          body={
            en
              ? 'We may update this Privacy Policy occasionally. We will notify you of significant changes by posting the new policy on this page with an updated date. We recommend reviewing this page periodically.'
              : 'Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cambios significativos publicando la nueva política en esta página con una fecha actualizada. Te recomendamos revisar esta página periódicamente.'
          }
        />

        <LegalSection
          title={en ? '9. Contact' : '9. Contacto'}
          body={
            en
              ? `For questions about this Privacy Policy, contact us at:\n\n${COMPANY}\n${ADDRESS}\n${EMAIL}`
              : `Para preguntas sobre esta Política de Privacidad, contáctanos en:\n\n${COMPANY}\n${ADDRESS}\n${EMAIL}`
          }
        />

        {/* Back link */}
        <div className="pt-4 border-t border-[#2E4156]">
          <Link
            href="/terms"
            className="text-[#FF6B35] hover:underline text-sm"
          >
            {en ? '→ Terms of Service' : '→ Términos de Servicio'}
          </Link>
        </div>

      </section>
    </main>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function LegalSection({
  title,
  body,
  items,
}: {
  title: string
  body?: string
  items?: string[]
}) {
  return (
    <div className="space-y-3">
      <h2
        className="text-lg font-semibold text-[#F0EDE8]"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {title}
      </h2>
      {body && (
        <p className="text-sm leading-7 whitespace-pre-line">
          {body}
        </p>
      )}
      {items && (
        <ul className="space-y-2 text-sm">
          {items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[#FF6B35] mt-1 flex-shrink-0">—</span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#F0EDE8]">$1</strong>') }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
