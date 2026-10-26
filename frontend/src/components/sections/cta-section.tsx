'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { SectionReveal } from '@/components/ui/section-reveal'
import { ArrowRight, Loader2 } from 'lucide-react'

interface CtaData {
  eyebrow: string; title: string; subtitle: string
  button: string; secondary: string
  trust_1: string; trust_2: string; trust_3: string
}

export function CtaSection({ data }: { data?: CtaData }) {
  const t = useTranslations('Home.cta')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      // TODO: conectar a /api/quote cuando esté disponible
      await new Promise((r) => setTimeout(r, 1200)) // simula request
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full h-11 px-4 rounded-lg bg-[#1F2D3A] border border-[#27384A] text-[#F0EDE8] text-sm placeholder-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'

  return (
    <section
      id="cta-section"
      className="relative py-24 overflow-hidden"
      aria-label="Formulario de cotización"
    >
      {/* Fondo con gradiente amber */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #1A2530 0%, #1A1508 50%, #1A2530 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,107,53,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,107,53,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,107,53,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Texto izquierda */}
          <SectionReveal className="space-y-6">
            <span
              className="text-xs font-semibold tracking-[0.2em] text-[#FF6B35] uppercase block"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              {data?.eyebrow ?? t('eyebrow')}
            </span>

            <h2
              className="text-[clamp(2.5rem,6vw,4.5rem)] font-semibold text-[#F0EDE8] leading-tight"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {data?.title ?? t('title')}
            </h2>

            <p className="text-base text-slate-400 leading-relaxed max-w-md">
              {data?.subtitle ?? t('subtitle')}
            </p>

            {/* Trust signals */}
            <div className="flex flex-col gap-3 pt-4">
              {[
                data?.trust_1 ?? 'Sin costo ni compromiso',
                data?.trust_2 ?? 'Respuesta en menos de 24 horas',
                data?.trust_3 ?? 'Asesor especializado asignado',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-[#8A95A5]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <p className="text-sm text-[#8A95A5] pt-2">
              {data?.secondary ?? t('secondary')}
            </p>
          </SectionReveal>

          {/* Formulario derecha */}
          <SectionReveal delay={0.15}>
            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 rounded-xl border border-[#FF6B35]/30 bg-[#1F2D3A] text-center">
                <div className="w-16 h-16 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-semibold text-[#F0EDE8]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  ¡Solicitud recibida!
                </h3>
                <p className="text-sm text-[#8A95A5]">
                  Un asesor se pondrá en contacto contigo en menos de 24 horas.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 rounded-xl border border-[#27384A] bg-[#1A2530]/80 backdrop-blur-sm space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8A95A5]">Nombre completo</label>
                    <input
                      type="text"
                      placeholder="Juan García"
                      required
                      className={inputClass}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#8A95A5]">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="+502 5712-2606"
                      required
                      className={inputClass}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8A95A5]">Tipo de proyecto</label>
                  <select
                    required
                    className={inputClass}
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    style={{ appearance: 'none' }}
                  >
                    <option value="" disabled>Selecciona un servicio</option>
                    <option value="residential_construction">Construcción Residencial</option>
                    <option value="remodeling">Remodelación Interior</option>
                    <option value="commercial">Proyecto Comercial</option>
                    <option value="design_build">Diseño y Construcción</option>
                    <option value="industrial">Construcción Industrial</option>
                    <option value="finishing">Acabados Premium</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#8A95A5]">
                    Cuéntanos sobre tu proyecto
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe brevemente el tipo de trabajo, ubicación y cualquier detalle relevante..."
                    className={`${inputClass} h-auto py-3 resize-none`}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-[#C44B3A]">
                    Hubo un error al enviar. Por favor intenta de nuevo o contáctanos por WhatsApp.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-14 bg-[#FF6B35] text-[#1A2530] font-semibold rounded-lg flex items-center justify-center gap-3 hover:bg-[#FF8557] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {data?.button ?? t('button')}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-[#8A95A5]">
                  Al enviar, aceptas nuestra{' '}
                  <a href="/privacy" className="text-[#FF6B35] hover:underline">
                    política de privacidad
                  </a>
                  .
                </p>
              </form>
            )}
          </SectionReveal>
        </div>
      </div>
    </section>
  )
}
