import { useTranslations } from 'next-intl'
import { SectionReveal } from '@/components/ui/section-reveal'
import { BeforeAfterSlider } from '@/components/ui/before-after-slider'

interface BeforeAfterData { eyebrow: string; title: string; before_label: string; after_label: string; drag_hint: string }

export function BeforeAfterSection({ data }: { data?: BeforeAfterData }) {
  const t = useTranslations('Home.before_after')

  return (
    <section className="pt-12 pb-24 bg-[#1F2D3A]" aria-label="Comparación antes y después">
      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="mb-12">
          <span
            className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block mb-4"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {data?.eyebrow ?? t('eyebrow')}
          </span>
          <h2
            className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-[#F0EDE8] leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {data?.title ?? t('title')}
          </h2>
        </SectionReveal>

        <SectionReveal delay={0.15}>
          <BeforeAfterSlider
            beforeImage="/antes-edificio.jpg"
            afterImage="/despues-edificio.png"
            beforeLabel={data?.before_label ?? t('before_label')}
            afterLabel={data?.after_label ?? t('after_label')}
            dragHint={data?.drag_hint ?? t('drag_hint')}
          />
        </SectionReveal>
      </div>
    </section>
  )
}
