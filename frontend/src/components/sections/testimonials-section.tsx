import { useTranslations } from 'next-intl'
import { SectionReveal, StaggerReveal } from '@/components/ui/section-reveal'

interface TestimonialItem { quote: string; name: string; role: string; company: string }
interface TestimonialsData { eyebrow: string; title: string; items: TestimonialItem[] }

export function TestimonialsSection({ data }: { data?: TestimonialsData }) {
  const t = useTranslations('Home.testimonials')
  const rawItems = (data?.items ?? t.raw('items')) as Array<{
    quote: string; name?: string; author?: string; role: string; company: string
  }>
  const items = rawItems.map(item => ({ ...item, author: item.name ?? item.author ?? '' }))

  return (
    <section className="py-24 bg-[#131D28]" aria-label="Testimonios de clientes">
      <div className="max-w-7xl mx-auto px-6">
        <SectionReveal className="mb-16">
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

        <StaggerReveal
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          staggerDelay={0.1}
        >
          {items.map((item, i) => (
            <figure
              key={i}
              className="flex flex-col gap-6 p-8 rounded-xl border border-[#2E4156] bg-[#1F2D3A]"
            >
              {/* Quote mark */}
              <div
                className="text-5xl leading-none text-[#FF6B35]/40 select-none"
                aria-hidden
                style={{ fontFamily: 'Georgia, serif' }}
              >
                "
              </div>

              <blockquote
                className="flex-1 text-base leading-relaxed"
                style={{ color: '#E8E4DC' }}
              >
                {item.quote}
              </blockquote>

              <figcaption className="flex items-center gap-3 pt-4 border-t border-[#27384A]">
                {/* Avatar placeholder */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-[#1A2530] flex-shrink-0"
                  style={{ background: '#FF6B35' }}
                  aria-hidden
                >
                  {item.author[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F0EDE8]">{item.author}</div>
                  <div className="text-xs text-[#8A95A5]">
                    {item.role} · {item.company}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
