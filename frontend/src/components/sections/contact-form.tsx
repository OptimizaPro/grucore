'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { SectionReveal } from '@/components/ui/section-reveal'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export interface ContactCMSData {
  eyebrow:    string
  title:      string
  subtitle:   string
  form: {
    name:         string
    email:        string
    phone:        string
    service:      string
    message:      string
    messagePh:    string
    submit:       string
    sending:      string
    successTitle: string
    successBody:  string
    errorTitle:   string
    errorBody:    string
    retry:        string
    footerTrust:  string
  }
  services:   string[]
  info: {
    address:  string
    phone:    string
    email:    string
    hours:    string
    whatsappCta: string
    mapsUrl:  string | null
  }
}

export function ContactForm({ data, locale }: { data: ContactCMSData; locale: string }) {
  const [formState, setFormState] = useState<FormState>('idle')
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('loading')
    try {
      await new Promise((r) => setTimeout(r, 1200))
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  const inputClass =
    'w-full bg-[#1A2530] border border-[#27384A] rounded-lg px-4 py-3 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors appearance-none'
  const labelClass = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  const contactCards = [
    { icon: MapPin, label: locale === 'es' ? 'Ubicación' : 'Location', value: data.info.address, href: null },
    { icon: Phone,  label: locale === 'es' ? 'Teléfono' : 'Phone',    value: data.info.phone,   href: `tel:${data.info.phone.replace(/\s/g, '')}` },
    { icon: Mail,   label: locale === 'es' ? 'Correo' : 'Email',      value: data.info.email,   href: `mailto:${data.info.email}` },
    { icon: Clock,  label: locale === 'es' ? 'Horario' : 'Hours',     value: data.info.hours,   href: null },
  ]

  return (
    <section className="bg-[#1A2530] pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 pt-12">

          {/* ── Sidebar info ── */}
          <aside className="lg:col-span-2 space-y-6">
            <SectionReveal>
              <div className="space-y-4">
                {contactCards.map(({ icon: Icon, label, value, href }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 p-5 rounded-xl border border-[#27384A] bg-[#1F2D3A]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[#FF6B35]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#8A95A5] mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-[#F0EDE8] hover:text-[#FF6B35] transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-[#F0EDE8]">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={`https://wa.me/${data.info.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-4 mt-4 mb-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/15 transition-colors text-sm text-[#25D366] font-medium"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                {data.info.whatsappCta}
              </a>

              {/* Map card — clicable si maps_url está configurado en CMS */}
              {(() => {
                const inner = (
                  <>
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        backgroundImage: `
                          linear-gradient(rgba(255,107,53,0.07) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,107,53,0.07) 1px, transparent 1px)
                        `,
                        backgroundSize: '24px 24px',
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <MapPin size={28} className="text-[#FF6B35]" />
                      <span className="text-xs text-[#8A95A5] text-center px-4">{data.info.address}</span>
                      {data.info.mapsUrl && (
                        <span className="text-xs text-[#FF6B35] mt-1">Ver en Google Maps →</span>
                      )}
                    </div>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-[#FF6B35]/10" />
                    <div className="absolute inset-y-0 left-1/2 w-px bg-[#FF6B35]/10" />
                  </>
                )
                const cardClass = 'rounded-xl overflow-hidden border border-[#27384A] h-48 relative'
                const cardStyle = { background: 'linear-gradient(135deg, #1F2D3A 0%, #27384A 100%)' }
                return data.info.mapsUrl ? (
                  <a href={data.info.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className={cardClass + ' hover:border-[#FF6B35]/40 transition-colors cursor-pointer'}
                    style={cardStyle}
                  >{inner}</a>
                ) : (
                  <div className={cardClass} style={cardStyle}>{inner}</div>
                )
              })()}
            </SectionReveal>
          </aside>

          {/* ── Contact form ── */}
          <div className="lg:col-span-3">
            <SectionReveal delay={0.1}>
              <div className="p-8 rounded-xl border border-[#27384A] bg-[#1F2D3A]">

                {formState === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#FF6B35]/10 flex items-center justify-center">
                      <CheckCircle2 size={32} className="text-[#FF6B35]" />
                    </div>
                    <h3 className="text-2xl font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {data.form.successTitle}
                    </h3>
                    <p className="text-sm text-[#8A95A5] max-w-xs leading-relaxed">{data.form.successBody}</p>
                  </div>
                ) : formState === 'error' ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertCircle size={32} className="text-red-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {data.form.errorTitle}
                    </h3>
                    <p className="text-sm text-[#8A95A5] max-w-xs leading-relaxed">{data.form.errorBody}</p>
                    <button
                      onClick={() => setFormState('idle')}
                      className="mt-2 px-6 py-2.5 rounded-lg border border-[#27384A] text-sm text-[#F0EDE8] hover:border-[#FF6B35]/40 transition-colors"
                    >
                      {data.form.retry}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>{data.form.name}</label>
                        <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Ana García" />
                      </div>
                      <div>
                        <label className={labelClass}>{data.form.email}</label>
                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="carlos@empresa.com" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelClass}>{data.form.phone}</label>
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+502 5000-0000" />
                      </div>
                      <div>
                        <label className={labelClass}>{data.form.service}</label>
                        <div className="relative">
                          <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className={inputClass + ' pr-10'}>
                            <option value="" disabled>{locale === 'es' ? 'Selecciona...' : 'Select...'}</option>
                            {data.services.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{data.form.message}</label>
                      <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputClass + ' resize-none'} placeholder={data.form.messagePh} />
                    </div>

                    <button
                      type="submit"
                      disabled={formState === 'loading'}
                      className="w-full h-12 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      {formState === 'loading' ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-[#1A2530]/30 border-t-[#1A2530] animate-spin" />
                          {data.form.sending}
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          {data.form.submit}
                        </>
                      )}
                    </button>

                    <p className="text-xs text-[#8A95A5] text-center">{data.form.footerTrust}</p>
                  </form>
                )}
              </div>
            </SectionReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
