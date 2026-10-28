import { getCMSPage, blocks } from '@/lib/cms'
import CotizarClient from './CotizarClient'

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
