import type { Metadata } from 'next'
import { getCMSPage, blocks, getMarqueeItems } from '@/lib/cms'
import { HeroSection } from '@/components/sections/hero-section'
import { TrustBar } from '@/components/sections/trust-bar'
import { ServicesScroll } from '@/components/sections/services-scroll'
import { ServicesSection } from '@/components/sections/services-section'
import { ProcessSection } from '@/components/sections/process-section'
import { PortfolioPreview } from '@/components/sections/portfolio-preview'
import { BeforeAfterSection } from '@/components/sections/before-after-section'
import { PricingSection } from '@/components/sections/pricing-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { GoogleReviewCta } from '@/components/sections/google-review-cta'
import { CtaSection } from '@/components/sections/cta-section'
import { CtaBanner } from '@/components/sections/cta-banner'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const cms = await getCMSPage('global', locale)
  const meta = blocks(cms, 'metadata')
  return {
    title:       meta.site_title       ?? 'Grucore — Construcción y Remodelación en Guatemala',
    description: meta.site_description ?? 'Empresa de construcción y remodelación premium en Guatemala.',
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  const [cms, marqueeItems] = await Promise.all([
    getCMSPage('home', locale),
    getMarqueeItems(locale),
  ])

  const hero         = blocks(cms, 'hero')
  const trustBar     = blocks(cms, 'trust_bar')
  const services     = blocks(cms, 'services')
  const process      = blocks(cms, 'process')
  const beforeAfter  = blocks(cms, 'before_after')
  const pricing      = blocks(cms, 'pricing')
  const testimonials = blocks(cms, 'testimonials')
  const cta          = blocks(cms, 'cta')

  const heroData = Object.keys(hero).length ? {
    eyebrow: hero.eyebrow, headline_1: hero.headline_1, headline_2: hero.headline_2,
    headline_3: hero.headline_3, cta_primary: hero.cta_primary, cta_secondary: hero.cta_secondary,
  } : undefined

  const trustData = trustBar.stat_1_value ? [
    { value: trustBar.stat_1_value, label: trustBar.stat_1_label },
    { value: trustBar.stat_2_value, label: trustBar.stat_2_label },
    { value: trustBar.stat_3_value, label: trustBar.stat_3_label },
    { value: trustBar.stat_4_value, label: trustBar.stat_4_label },
  ] : undefined

  const servicesData = services.items ? {
    eyebrow: services.eyebrow, title: services.title,
    subtitle: services.subtitle, items: services.items,
  } : undefined

  const processData = process.steps ? {
    eyebrow: process.eyebrow, title: process.title, steps: process.steps,
  } : undefined

  const beforeAfterData = beforeAfter.eyebrow ? {
    eyebrow: beforeAfter.eyebrow, title: beforeAfter.title,
    before_label: beforeAfter.before_label, after_label: beforeAfter.after_label,
    drag_hint: beforeAfter.drag_hint,
  } : undefined

  const pricingData = pricing.tiers ? {
    eyebrow: pricing.eyebrow, title: pricing.title, subtitle: pricing.subtitle,
    disclaimer: pricing.disclaimer, tiers: pricing.tiers,
  } : undefined

  const testimonialsData = testimonials.items ? {
    eyebrow: testimonials.eyebrow, title: testimonials.title, items: testimonials.items,
  } : undefined

  const ctaData = cta.title ? {
    eyebrow: cta.eyebrow, title: cta.title, subtitle: cta.subtitle,
    button: cta.button, secondary: cta.secondary,
    trust_1: cta.trust_1, trust_2: cta.trust_2, trust_3: cta.trust_3,
  } : undefined

  return (
    <>
      <HeroSection data={heroData} />
      <TrustBar data={trustData} />
      <ServicesScroll items={marqueeItems} />
      <ServicesSection data={servicesData} />
      <ProcessSection data={processData} />
      <PortfolioPreview />
      <BeforeAfterSection data={beforeAfterData} />
      <PricingSection data={pricingData} />
      <TestimonialsSection data={testimonialsData} />
      {/* <GoogleReviewCta /> */}
      <CtaSection data={ctaData} />
      <CtaBanner />
    </>
  )
}
