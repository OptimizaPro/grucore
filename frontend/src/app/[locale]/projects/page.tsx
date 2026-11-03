import type { Metadata } from 'next'
import { getCMSPage, blocks } from '@/lib/cms'
import { ProjectsClient } from './_projects-client'
import { buildMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const cms = await getCMSPage('projects', locale)
  const title       = cms ? `${cms.title} — Grucore` : 'Proyectos — Grucore'
  const description = cms?.meta_description ?? 'Portafolio de proyectos de construcción y remodelación en Guatemala.'
  return buildMetadata({
    title,
    description,
    locale,
    canonicalPath: locale === 'en' ? '/en/projects' : '/proyectos',
    alternatePaths: { es: '/proyectos', en: '/en/projects' },
  })
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  const cms = await getCMSPage('projects', locale)
  const hero = blocks(cms, 'hero')

  return (
    <ProjectsClient bgImage={hero.background_image as string | undefined} />
  )
}
