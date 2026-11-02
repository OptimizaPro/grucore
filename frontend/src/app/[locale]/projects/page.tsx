import type { Metadata } from 'next'
import { getCMSPage, blocks } from '@/lib/cms'
import { ProjectsClient } from './_projects-client'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const cms = await getCMSPage('projects', locale)
  return {
    title: cms ? `${cms.title} — Grucore` : 'Proyectos — Grucore',
    description: cms?.meta_description ?? 'Portafolio de proyectos de construcción y remodelación en Guatemala.',
  }
}

export default async function ProjectsPage({ params }: Props) {
  const { locale } = await params
  const cms = await getCMSPage('projects', locale)
  const hero = blocks(cms, 'hero')

  return (
    <ProjectsClient bgImage={hero.background_image as string | undefined} />
  )
}
