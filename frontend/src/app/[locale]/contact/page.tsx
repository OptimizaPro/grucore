import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/page-hero'
import { getCMSPage, blocks } from '@/lib/cms'
import { ContactForm, type ContactCMSData } from '@/components/sections/contact-form'

type Props = { params: Promise<{ locale: string }> }

const FB = {
  es: {
    eyebrow:  'Contacto',
    title:    'Hablemos de tu proyecto',
    subtitle: 'Cuéntanos qué tienes en mente. Sin compromiso, sin costo — solo una conversación para entender tu visión.',
    name:     'Nombre completo',
    email:    'Correo electrónico',
    phone:    'Teléfono / WhatsApp',
    service:  'Tipo de proyecto',
    message:  'Cuéntanos tu proyecto',
    messagePh:'Describe brevemente qué quieres construir o remodelar, el área aproximada y la ubicación...',
    submit:   'Enviar mensaje',
    sending:  'Enviando…',
    successTitle: '¡Mensaje recibido!',
    successBody:  'Nuestro equipo se pondrá en contacto contigo en menos de 24 horas.',
    errorTitle:   'Error al enviar',
    errorBody:    'Intenta de nuevo o escríbenos directamente por WhatsApp.',
    retry:        'Intentar de nuevo',
    footerTrust:  'Sin costo · Sin compromiso · Respuesta en menos de 24 h',
    services: ['Construcción residencial','Remodelación','Proyecto comercial','Diseño y construcción','Industrial','Acabados','Otro'],
    address:     'Ciudad de Guatemala, Guatemala',
    phone_info:  '+502 2000-0000',
    email_info:  'info@grucore.gt',
    hours:       'Lun – Vie, 8:00 – 18:00',
    whatsappCta: 'Escribir por WhatsApp ahora',
  },
  en: {
    eyebrow:  'Contact',
    title:    "Let's talk about your project",
    subtitle: 'Tell us what you have in mind. No obligation, no cost — just a conversation to understand your vision.',
    name:     'Full name',
    email:    'Email address',
    phone:    'Phone / WhatsApp',
    service:  'Project type',
    message:  'Tell us about your project',
    messagePh:'Briefly describe what you want to build or remodel, approximate area and location...',
    submit:   'Send message',
    sending:  'Sending…',
    successTitle: 'Message received!',
    successBody:  'Our team will get back to you within 24 hours.',
    errorTitle:   'Failed to send',
    errorBody:    'Please try again or write to us directly on WhatsApp.',
    retry:        'Try again',
    footerTrust:  'No cost · No obligation · Response within 24 h',
    services: ['Residential construction','Remodeling','Commercial project','Design & build','Industrial','Finishing','Other'],
    address:     'Guatemala City, Guatemala',
    phone_info:  '+502 2000-0000',
    email_info:  'info@grucore.gt',
    hours:       'Mon – Fri, 8:00 – 18:00',
    whatsappCta: 'Write on WhatsApp now',
  },
} as const

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

  const fb = locale === 'en' ? FB.en : FB.es

  const data: ContactCMSData = {
    eyebrow:  hero.eyebrow  ?? fb.eyebrow,
    title:    hero.title    ?? fb.title,
    subtitle: hero.subtitle ?? fb.subtitle,
    form: {
      name:         form.field_name       ?? fb.name,
      email:        form.field_email      ?? fb.email,
      phone:        form.field_phone      ?? fb.phone,
      service:      form.field_type       ?? fb.service,
      message:      form.field_message    ?? fb.message,
      messagePh:    form.field_message_ph ?? fb.messagePh,
      submit:       form.btn_submit       ?? fb.submit,
      sending:      form.btn_submitting   ?? fb.sending,
      successTitle: formStates.success_title ?? fb.successTitle,
      successBody:  formStates.success_body  ?? fb.successBody,
      errorTitle:   formStates.error_title   ?? fb.errorTitle,
      errorBody:    formStates.error_body    ?? fb.errorBody,
      retry:        formStates.retry_button  ?? fb.retry,
      footerTrust:  form.footer_trust        ?? fb.footerTrust,
    },
    services: ((form.project_types ?? []) as string[]).length
      ? (form.project_types as string[])
      : fb.services as unknown as string[],
    info: {
      address:     info.location     ?? fb.address,
      phone:       info.phone        ?? fb.phone_info,
      email:       info.email        ?? fb.email_info,
      hours:       info.hours        ?? fb.hours,
      whatsappCta: info.whatsapp_cta ?? fb.whatsappCta,
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
