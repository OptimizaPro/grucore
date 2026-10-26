import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { getCMSPage, blocks } from '@/lib/cms'
import { ContactForm, type ContactCMSData } from '@/components/sections/contact-form'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const cms = await getCMSPage('contact', locale)
  return {
    title: cms ? `${cms.title} — Grucore` : 'Contacto — Grucore',
    description: cms?.meta_description ?? 'Contáctanos para una cotización gratuita. Respondemos en menos de 24 horas.',
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const cms = await getCMSPage('contact', locale)

  const hero       = blocks(cms, 'hero')
  const info       = blocks(cms, 'info')
  const form       = blocks(cms, 'form')
  const formStates = blocks(cms, 'form_states')

  const data: ContactCMSData = {
    eyebrow:  hero.eyebrow  ?? '',
    title:    hero.title    ?? '',
    subtitle: hero.subtitle ?? '',
    form: {
      name:         form.field_name       ?? '',
      email:        form.field_email      ?? '',
      phone:        form.field_phone      ?? '',
      service:      form.field_type       ?? '',
      message:      form.field_message    ?? '',
      messagePh:    form.field_message_ph ?? '',
      submit:       form.btn_submit       ?? '',
      sending:      form.btn_submitting   ?? '',
      successTitle: formStates.success_title ?? '',
      successBody:  formStates.success_body  ?? '',
      errorTitle:   formStates.error_title   ?? '',
      errorBody:    formStates.error_body    ?? '',
      retry:        formStates.retry_button  ?? '',
      footerTrust:  form.footer_trust        ?? '',
    },
    services: (form.project_types ?? []) as string[],
    info: {
      address:     info.location     ?? '',
      phone:       info.phone        ?? '',
      email:       info.email        ?? '',
      hours:       info.hours        ?? '',
      whatsappCta: info.whatsapp_cta ?? '',
    },
  }

  return (
    <>
      <PageHero
        eyebrow={data.eyebrow}
        title={data.title}
        subtitle={data.subtitle}
        accentLast
        bgImage="https://images.unsplash.com/photo-1768926968986-a88590ce5025?auto=format&fit=crop&w=1600&q=60"
        size="md"
        split
        subtitleVariant="card"
      />
      <ContactForm data={data} locale={locale} />
    </>
  )
}
