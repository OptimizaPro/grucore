import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { Link } from '@/i18n/navigation'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'en' ? 'Terms of Service — Grucore' : 'Términos de Servicio — Grucore',
    description:
      locale === 'en'
        ? 'Terms and conditions governing the use of Grucore\'s website and construction services.'
        : 'Términos y condiciones que rigen el uso del sitio web y los servicios de construcción de Grucore.',
    robots: { index: true, follow: true },
  }
}

const LAST_UPDATED = '28 de octubre de 2025'
const LAST_UPDATED_EN = 'October 28, 2025'
const COMPANY = 'Grucore, S.A.'
const EMAIL = 'legal@grucore.com'

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  const en = locale === 'en'

  return (
    <main className="bg-[#1A2530] min-h-screen">
      <PageHero
        eyebrow={en ? 'Legal' : 'Legal'}
        title={en ? 'Terms of Service' : 'Términos de Servicio'}
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
              ? `By accessing grucore.com or contracting services from ${COMPANY} ("Grucore"), you agree to these Terms of Service. If you do not agree, please refrain from using our website or services.`
              : `Al acceder a grucore.com o contratar servicios de ${COMPANY} ("Grucore"), aceptas estos Términos de Servicio. Si no estás de acuerdo, te pedimos que te abstengas de usar nuestro sitio o servicios.`}
          </p>
        </div>

        <LegalSection
          title={en ? '1. Services' : '1. Servicios'}
          body={
            en
              ? 'Grucore provides construction, remodeling, and renovation services in Guatemala. Information on this website is for general informational purposes. Specific project details, timelines, and pricing are defined in individual service contracts.'
              : 'Grucore presta servicios de construcción, remodelación y renovación en Guatemala. La información en este sitio web es de carácter informativo general. Los detalles específicos de cada proyecto, plazos y precios se definen en contratos de servicio individuales.'
          }
        />

        <LegalSection
          title={en ? '2. Quotes and Contracts' : '2. Cotizaciones y contratos'}
          items={
            en
              ? [
                  'Quotes issued are valid for **30 calendar days** from the date of issue.',
                  'A quote does not constitute a firm contract until both parties have signed the corresponding service agreement.',
                  'Prices are in **Guatemalan Quetzales (GTQ)** unless otherwise specified in writing.',
                  'A **down payment** is required to begin work, as specified in each contract.',
                ]
              : [
                  'Las cotizaciones emitidas tienen validez de **30 días calendario** desde su fecha de emisión.',
                  'Una cotización no constituye un contrato firme hasta que ambas partes hayan firmado el contrato de servicios correspondiente.',
                  'Los precios están expresados en **Quetzales guatemaltecos (GTQ)** salvo que se especifique lo contrario por escrito.',
                  'Se requiere un **anticipo** para iniciar los trabajos, según lo especificado en cada contrato.',
                ]
          }
        />

        <LegalSection
          title={en ? '3. Client Responsibilities' : '3. Responsabilidades del cliente'}
          items={
            en
              ? [
                  'Provide access to the property at agreed-upon times.',
                  'Ensure the work area is free of valuables and personal belongings.',
                  'Make payments on the dates established in the contract.',
                  'Notify Grucore of any changes or modifications to the original project scope.',
                ]
              : [
                  'Proveer acceso a la propiedad en los horarios acordados.',
                  'Asegurarse de que el área de trabajo esté libre de objetos de valor y pertenencias personales.',
                  'Realizar los pagos en las fechas establecidas en el contrato.',
                  'Notificar a Grucore cualquier cambio o modificación al alcance original del proyecto.',
                ]
          }
        />

        <LegalSection
          title={en ? '4. Warranties' : '4. Garantías'}
          body={
            en
              ? 'Grucore warrants the quality of work performed for a period of **1 year** from project completion for construction defects directly attributable to our workmanship. This warranty does not cover damage caused by improper use, lack of maintenance, acts of nature, or third-party modifications.'
              : 'Grucore garantiza la calidad de los trabajos realizados por un período de **1 año** a partir de la entrega del proyecto por defectos de construcción directamente atribuibles a nuestra ejecución. Esta garantía no cubre daños causados por uso inadecuado, falta de mantenimiento, actos de la naturaleza o modificaciones por parte de terceros.'
          }
        />

        <LegalSection
          title={en ? '5. Limitation of Liability' : '5. Limitación de responsabilidad'}
          body={
            en
              ? "Grucore's liability is limited to the contracted value of the project. We are not responsible for indirect, incidental, or consequential damages arising from the use of our services or website. Grucore is not responsible for delays caused by factors beyond our control (weather, supply chain, permits)."
              : 'La responsabilidad de Grucore se limita al valor contratado del proyecto. No somos responsables de daños indirectos, incidentales o consecuentes derivados del uso de nuestros servicios o sitio web. Grucore no se responsabiliza por retrasos causados por factores ajenos a nuestro control (clima, cadena de suministro, permisos).'
          }
        />

        <LegalSection
          title={en ? '6. Intellectual Property' : '6. Propiedad intelectual'}
          body={
            en
              ? 'All content on grucore.com (texts, images, designs, logos) is the property of Grucore or its licensors and is protected by Guatemalan and international intellectual property laws. Any reproduction without written permission is prohibited.'
              : 'Todo el contenido de grucore.com (textos, imágenes, diseños, logotipos) es propiedad de Grucore o sus licenciantes y está protegido por las leyes de propiedad intelectual de Guatemala y normas internacionales. Se prohíbe su reproducción sin autorización escrita.'
          }
        />

        <LegalSection
          title={en ? '7. Acceptable Use' : '7. Uso aceptable'}
          items={
            en
              ? [
                  'You may not use this website for fraudulent or illegal activities.',
                  'Attempting to access systems or data without authorization is prohibited.',
                  'Transmitting harmful content (viruses, spam, malware) is prohibited.',
                  'Grucore reserves the right to block access to users who violate these terms.',
                ]
              : [
                  'No puedes utilizar este sitio web para actividades fraudulentas o ilegales.',
                  'Se prohíbe intentar acceder a sistemas o datos sin autorización.',
                  'Se prohíbe transmitir contenido dañino (virus, spam, malware).',
                  'Grucore se reserva el derecho de bloquear el acceso a usuarios que violen estos términos.',
                ]
          }
        />

        <LegalSection
          title={en ? '8. Governing Law' : '8. Ley aplicable'}
          body={
            en
              ? 'These Terms are governed by the laws of the Republic of Guatemala. Any dispute arising from these Terms or Grucore\'s services shall be submitted to the competent courts of Guatemala City.'
              : 'Estos Términos se rigen por las leyes de la República de Guatemala. Cualquier disputa derivada de estos Términos o de los servicios de Grucore se someterá a los tribunales competentes de la Ciudad de Guatemala.'
          }
        />

        <LegalSection
          title={en ? '9. Changes to Terms' : '9. Cambios en los términos'}
          body={
            en
              ? 'Grucore reserves the right to modify these Terms at any time. Changes take effect upon publication on this page. Continued use of our services after changes constitutes acceptance of the new terms.'
              : 'Grucore se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios entran en vigor al ser publicados en esta página. El uso continuado de nuestros servicios después de los cambios constituye la aceptación de los nuevos términos.'
          }
        />

        <LegalSection
          title={en ? '10. Contact' : '10. Contacto'}
          body={
            en
              ? `For questions about these Terms, contact us at:\n\n${COMPANY}\nCiudad de Guatemala, Guatemala\n${EMAIL}`
              : `Para preguntas sobre estos Términos, contáctanos en:\n\n${COMPANY}\nCiudad de Guatemala, Guatemala\n${EMAIL}`
          }
        />

        {/* Back link */}
        <div className="pt-4 border-t border-[#2E4156]">
          <Link
            href="/privacy"
            className="text-[#FF6B35] hover:underline text-sm"
          >
            {en ? '→ Privacy Policy' : '→ Política de Privacidad'}
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
