import type { Metadata } from 'next'
import { getCMSPage, blocks } from '@/lib/cms'
import CotizarClient from './CotizarClient'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    title: 'Cotizar proyecto — Grucore',
    description: 'Obtén una estimación de costo para tu proyecto de construcción o remodelación en Guatemala. Rápido, sin compromiso.',
    locale,
    canonicalPath: '/cotizar',
  })
}

export default async function CotizarPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const page = await getCMSPage('cotizar', locale)

  return (
    <CotizarClient
      cms={{
        panel:     blocks(page, 'panel'),
        questions: blocks(page, 'questions'),
        contact:   blocks(page, 'contact_step'),
        result:    blocks(page, 'result'),
      }}
    />
  )
}
