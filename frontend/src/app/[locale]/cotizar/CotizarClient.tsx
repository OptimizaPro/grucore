'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import {
  ChevronLeft, ArrowRight, Loader2,
  Building2, Home, Hammer, Ruler, Factory, ChefHat,
} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useForm } from 'react-hook-form'
import { cn } from '@/lib/utils'
import type { CMSBlocks } from '@/lib/cms'

// ── Types ─────────────────────────────────────────────────────────────────────

type ServiceId   = 'residential' | 'renovation' | 'commercial' | 'design_build' | 'industrial' | 'kitchens_baths'
type StageId     = 'has_land' | 'has_property' | 'seeking_land' | 'exploring'
type TimelineId  = 'months_3' | 'months_6' | 'months_12' | 'exploring'
type BudgetId    = 'b1' | 'b2' | 'b3' | 'b4'
type FinancingId = 'own_funds' | 'credit' | 'mixed' | 'undefined'
type Tier        = 'hot' | 'warm' | 'cold'

interface Answers {
  service?:   ServiceId
  stage?:     StageId
  timeline?:  TimelineId
  budget?:    BudgetId
  financing?: FinancingId
}

interface ContactForm {
  full_name: string
  phone:     string
  email?:    string
  city?:     string
}

export interface CotizarCMS {
  panel:    CMSBlocks
  questions: CMSBlocks
  contact:  CMSBlocks
  result:   CMSBlocks
}

// ── Scoring ──────────────────────────────────────────────────────────────────

const SCORE_MAP = {
  service:   { residential: 4, renovation: 3, commercial: 5, design_build: 5, industrial: 4, kitchens_baths: 2 },
  stage:     { has_land: 5, has_property: 4, seeking_land: 2, exploring: 1 },
  timeline:  { months_3: 5, months_6: 4, months_12: 2, exploring: 1 },
  budget:    { b1: 1, b2: 3, b3: 4, b4: 5 },
  financing: { own_funds: 5, credit: 3, mixed: 4, undefined: 2 },
}

function calcScore(a: Answers): number {
  return (
    (a.service   ? (SCORE_MAP.service   as Record<string, number>)[a.service]   : 0) +
    (a.stage     ? (SCORE_MAP.stage     as Record<string, number>)[a.stage]     : 0) +
    (a.timeline  ? (SCORE_MAP.timeline  as Record<string, number>)[a.timeline]  : 0) +
    (a.budget    ? (SCORE_MAP.budget    as Record<string, number>)[a.budget]    : 0) +
    (a.financing ? (SCORE_MAP.financing as Record<string, number>)[a.financing] : 0)
  )
}

function getTier(score: number): Tier {
  if (score >= 20) return 'hot'
  if (score >= 13) return 'warm'
  return 'cold'
}

const TIER_CFG: Record<Tier, {
  label: string; emoji: string; color: string
  bar: string; ring: string; bg: string
}> = {
  hot:  { label: 'Proyecto prioritario',        emoji: '🔥', color: '#FF6B35', bar: 'bg-[#FF6B35]', ring: 'border-[#FF6B35]/40',  bg: 'bg-[#FF6B35]/8'  },
  warm: { label: 'Proyecto con alto potencial',  emoji: '⚡', color: '#F59E0B', bar: 'bg-amber-400', ring: 'border-amber-400/40',  bg: 'bg-amber-400/8'  },
  cold: { label: 'Proyecto en planificación',    emoji: '💡', color: '#8A95A5', bar: 'bg-[#8A95A5]', ring: 'border-[#8A95A5]/40', bg: 'bg-[#8A95A5]/8'  },
}

// ── Question data ─────────────────────────────────────────────────────────────

const SERVICE_OPTS = [
  { id: 'residential'    as ServiceId, label: 'Construcción Residencial', Icon: Home      },
  { id: 'renovation'     as ServiceId, label: 'Remodelación',             Icon: Hammer    },
  { id: 'commercial'     as ServiceId, label: 'Proyecto Comercial',       Icon: Building2 },
  { id: 'design_build'   as ServiceId, label: 'Design & Build',           Icon: Ruler     },
  { id: 'industrial'     as ServiceId, label: 'Industrial',               Icon: Factory   },
  { id: 'kitchens_baths' as ServiceId, label: 'Cocinas & Baños',          Icon: ChefHat   },
]
const STAGE_OPTS = [
  { id: 'has_land'     as StageId, label: 'Tengo terreno disponible'       },
  { id: 'has_property' as StageId, label: 'Tengo propiedad para remodelar' },
  { id: 'seeking_land' as StageId, label: 'Estoy buscando terreno'         },
  { id: 'exploring'    as StageId, label: 'Solo estoy explorando'          },
]
const TIMELINE_OPTS = [
  { id: 'months_3'  as TimelineId, label: 'En los próximos 3 meses'   },
  { id: 'months_6'  as TimelineId, label: 'Entre 3 y 6 meses'         },
  { id: 'months_12' as TimelineId, label: 'Entre 6 y 12 meses'        },
  { id: 'exploring' as TimelineId, label: 'Aún no lo tengo definido'  },
]
const BUDGET_OPTS = [
  { id: 'b1' as BudgetId, label: 'Menos de Q150,000',     value: 75000   },
  { id: 'b2' as BudgetId, label: 'Q150,000 – Q500,000',   value: 325000  },
  { id: 'b3' as BudgetId, label: 'Q500,000 – Q2,000,000', value: 1250000 },
  { id: 'b4' as BudgetId, label: 'Más de Q2,000,000',     value: 3000000 },
]
const FINANCING_OPTS = [
  { id: 'own_funds'  as FinancingId, label: 'Con fondos propios'       },
  { id: 'credit'     as FinancingId, label: 'Crédito bancario'         },
  { id: 'mixed'      as FinancingId, label: 'Fondos propios + crédito' },
  { id: 'undefined'  as FinancingId, label: 'Aún lo estoy definiendo'  },
]
const SVC_BACKEND: Record<ServiceId, string> = {
  residential: 'residential', renovation: 'renovation', commercial: 'commercial',
  design_build: 'construction', industrial: 'construction', kitchens_baths: 'kitchens_baths',
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_Q     = 5
const DATA_STEP   = 6
const RESULT_STEP = 7
const SESSION_KEY = 'grucore-cotizar'
const LETTERS     = ['A', 'B', 'C', 'D', 'E', 'F']

// ── Animations ────────────────────────────────────────────────────────────────

const slide = {
  enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const } },
  exit:   (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.14 } }),
}

// ── Sub-components ────────────────────────────────────────────────────────────

function QHeader({ n, text, note }: { n: number; text: string; note?: string }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#FF6B35] uppercase mb-3"
         style={{ fontFamily: 'Space Mono, monospace' }}>
        Pregunta {n} de {TOTAL_Q}
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-[#F0EDE8] leading-snug"
          style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {text}
      </h2>
      {note && <p className="text-xs text-[#8A95A5] mt-2">{note}</p>}
    </div>
  )
}

function Opt({
  letter, label, Icon, selected, onClick,
}: {
  letter: string
  label: string
  Icon?: React.ComponentType<{ size?: number }>
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left w-full',
        'transition-all duration-150 active:scale-[0.98]',
        selected
          ? 'border-[#FF6B35] bg-[#FF6B35]/10'
          : 'border-[#27384A] bg-[#1F2D3A] hover:border-[#FF6B35]/50 hover:bg-[#243344]'
      )}
    >
      <span className={cn(
        'flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors',
        selected
          ? 'bg-[#FF6B35] text-[#1A2530]'
          : 'bg-[#27384A] text-[#8A95A5] group-hover:bg-[#FF6B35]/20 group-hover:text-[#FF6B35]'
      )} style={{ fontFamily: 'Space Mono, monospace' }}>
        {letter}
      </span>
      {Icon && (
        <Icon size={15} className={cn(
          'flex-shrink-0 transition-colors',
          selected ? 'text-[#FF6B35]' : 'text-[#8A95A5] group-hover:text-[#FF6B35]'
        )} />
      )}
      <span className={cn('text-sm font-medium flex-1', selected ? 'text-[#FF6B35]' : 'text-[#F0EDE8]')}>
        {label}
      </span>
      <ArrowRight size={13} className={cn(
        'flex-shrink-0 transition-all',
        selected ? 'text-[#FF6B35]' : 'text-[#27384A] group-hover:text-[#FF6B35] group-hover:translate-x-0.5'
      )} />
    </button>
  )
}

function LeftPanel({ cms }: { cms: CMSBlocks }) {
  const b = (key: string, fallback: string) => cms[key] ?? fallback

  return (
    <aside className="hidden lg:flex w-[38%] flex-col relative bg-[#131D28] border-r border-[#27384A] overflow-hidden">
      {/* Blueprint grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden style={{
        backgroundImage: `linear-gradient(rgba(255,107,53,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.05) 1px, transparent 1px)`,
        backgroundSize: '56px 56px',
      }} />
      {/* Glow top-right */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 65%)' }} />
      {/* Glow bottom-left */}
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 65%)' }} />

      <div className="relative z-10 flex flex-col justify-between h-full px-10 pt-32 pb-12">

        {/* ── Eyebrow ── */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-6 h-px bg-[#FF6B35]" />
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#FF6B35] uppercase"
             style={{ fontFamily: 'Space Mono, monospace' }}>
            {b('eyebrow', 'Calificación de proyecto')}
          </p>
        </div>

        {/* ── Headline ── */}
        <h2 className="text-[2.4rem] font-bold text-[#F0EDE8] leading-[1.1] mb-5"
            style={{ fontFamily: 'Montserrat, sans-serif' }}>
          {b('headline', 'Cuéntanos tu proyecto')}
        </h2>

        {/* ── Description ── */}
        <p className="text-sm text-[#8A95A5] leading-relaxed mb-10">
          {b('description', 'En menos de 2 minutos sabremos si somos la empresa ideal para hacerlo realidad y te haremos una propuesta personalizada.')}
        </p>

        {/* ── Benefits ── */}
        <ul className="flex flex-col gap-3 mb-10">
          {[
            b('benefit_1', 'Propuesta sin costo ni compromiso'),
            b('benefit_2', 'Respuesta en menos de 24 horas'),
            b('benefit_3', 'Asesoría de especialistas certificados'),
          ].map((text) => (
            <li key={text} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-[#FF6B35]/15 border border-[#FF6B35]/40 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-sm text-[#8A95A5] leading-snug">{text}</span>
            </li>
          ))}
        </ul>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 py-7 border-t border-b border-[#27384A]/60 mt-auto">
          {[
            { v: b('stat_1_value', '10+'), l: b('stat_1_label', 'Años de\nexperiencia') },
            { v: b('stat_2_value', '50+'), l: b('stat_2_label', 'Proyectos\nentregados') },
            { v: b('stat_3_value', '5★'),  l: b('stat_3_label', 'Calificación\nGoogle') },
          ].map(({ v, l }) => (
            <div key={v} className="flex flex-col items-center gap-1">
              <p className="text-2xl font-bold text-[#FF6B35]"
                 style={{ fontFamily: 'Space Mono, monospace' }}>
                {v}
              </p>
              <p className="text-[10px] text-[#8A95A5] leading-snug whitespace-pre-line text-center">{l}</p>
            </div>
          ))}
        </div>

        {/* ── Footer tagline ── */}
        <p className="pt-6 text-[10px] text-[#8A95A5]/40 tracking-[0.2em] uppercase"
           style={{ fontFamily: 'Space Mono, monospace' }}>
          {b('tagline', 'Guatemala · Construcción & Remodelación')}
        </p>

      </div>
    </aside>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CotizarClient({ cms }: { cms: CotizarCMS }) {
  const locale = useLocale()

  const [step,      setStep]      = useState(1)
  const [dir,       setDir]       = useState(1)
  const [answers,   setAnswers]   = useState<Answers>({})
  const [loading,   setLoading]   = useState(false)
  const [aiMsg,     setAiMsg]     = useState('')
  const [score,     setScore]     = useState(0)
  const [tier,      setTier]      = useState<Tier>('cold')

  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>()

  const q  = (key: string, fallback: string) => cms.questions[key]  ?? fallback
  const ct = (key: string, fallback: string) => cms.contact[key]    ?? fallback
  const r  = (key: string, fallback: string) => cms.result[key]     ?? fallback

  // Restore session
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) {
        const { s, a } = JSON.parse(raw)
        if (typeof s === 'number' && s >= 1 && s < DATA_STEP && a) {
          setStep(s); setAnswers(a)
        }
      }
    } catch {}
  }, [])

  // Persist session
  useEffect(() => {
    if (step < DATA_STEP) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ s: step, a: answers }))
    }
  }, [step, answers])

  const goBack = useCallback(() => { setDir(-1); setStep(s => Math.max(1, s - 1)) }, [])

  function pick<K extends keyof Answers>(key: K, val: Answers[K]) {
    setAnswers(prev => ({ ...prev, [key]: val }))
    setDir(1)
    setStep(s => s + 1)
  }

  const onSubmit = async (data: ContactForm) => {
    const finalScore = calcScore(answers)
    const finalTier  = getTier(finalScore)
    setScore(finalScore)
    setTier(finalTier)
    setLoading(true)
    setDir(1)
    setStep(RESULT_STEP)

    const budget      = BUDGET_OPTS.find(o => o.id === answers.budget)
    const backendSvc  = answers.service ? SVC_BACKEND[answers.service] : 'other'
    const budgetLabel = budget?.label ?? ''
    const budgetValue = budget?.value ?? null

    const notesLines = [
      answers.service   && `Servicio: ${SERVICE_OPTS.find(o => o.id === answers.service)?.label}`,
      answers.stage     && `Etapa: ${STAGE_OPTS.find(o => o.id === answers.stage)?.label}`,
      answers.timeline  && `Timeline: ${TIMELINE_OPTS.find(o => o.id === answers.timeline)?.label}`,
      answers.budget    && `Presupuesto: ${budgetLabel}`,
      answers.financing && `Financiamiento: ${FINANCING_OPTS.find(o => o.id === answers.financing)?.label}`,
    ].filter(Boolean)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/crm/widget/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name, phone: data.phone,
          email: data.email ?? '', city: data.city ?? '',
          service_type: backendSvc, budget_range: budgetLabel,
          estimated_value_gtq: budgetValue,
          lead_score: finalScore, lead_tier: finalTier,
          notes: notesLines.join('\n'),
        }),
      })

      const aiRes = await fetch('/api/qualify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.full_name, service: backendSvc, budget: budgetLabel, tier: finalTier, locale }),
      })
      const aiData = await aiRes.json()
      setAiMsg(aiData.message ?? '')
    } catch {}

    setLoading(false)
    sessionStorage.removeItem(SESSION_KEY)
  }

  const progress = step <= TOTAL_Q
    ? (step - 1) / TOTAL_Q
    : step === DATA_STEP ? 0.92 : 1

  return (
    <div className="min-h-screen flex bg-[#1A2530]">
      <LeftPanel cms={cms.panel} />

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top bar — aligned with left panel headline */}
        <div className="flex items-center gap-4 px-6 pt-40 shrink-0 w-full max-w-2xl mx-auto">
          {/* Back / home */}
          {step === 1 || step === RESULT_STEP ? (
            <Link href="/"
              className="flex items-center gap-1 text-[#8A95A5] hover:text-[#F0EDE8] transition-colors text-sm">
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
          ) : (
            <button onClick={goBack}
              className="flex items-center gap-1 text-[#8A95A5] hover:text-[#F0EDE8] transition-colors text-sm">
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Atrás</span>
            </button>
          )}

          {/* Progress bar (hidden on result) */}
          {step < RESULT_STEP && (
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-1 bg-[#27384A] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FF6B35] rounded-full origin-left"
                  animate={{ scaleX: progress, opacity: 1 }}
                  style={{ transformOrigin: 'left' }}
                  initial={{ scaleX: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-[10px] text-[#8A95A5] whitespace-nowrap flex-shrink-0 tabular-nums"
                    style={{ fontFamily: 'Space Mono, monospace' }}>
                {step <= TOTAL_Q ? `${step} / ${TOTAL_Q}` : 'Contacto'}
              </span>
            </div>
          )}
        </div>

        {/* Quiz content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10 w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait" custom={dir}>

            {/* ── Q1: Service ──────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="q1" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <QHeader n={1} text={q('q1', '¿Qué tipo de proyecto tienes en mente?')} />
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_OPTS.map((o, i) => (
                    <Opt key={o.id} letter={LETTERS[i]} label={o.label} Icon={o.Icon}
                         selected={answers.service === o.id} onClick={() => pick('service', o.id)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Q2: Stage ───────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="q2" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <QHeader n={2} text={q('q2', '¿En qué etapa te encuentras?')} />
                <div className="flex flex-col gap-2">
                  {STAGE_OPTS.map((o, i) => (
                    <Opt key={o.id} letter={LETTERS[i]} label={o.label}
                         selected={answers.stage === o.id} onClick={() => pick('stage', o.id)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Q3: Timeline ────────────────────────────────── */}
            {step === 3 && (
              <motion.div key="q3" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <QHeader n={3} text={q('q3', '¿Cuándo te gustaría iniciar el proyecto?')} />
                <div className="flex flex-col gap-2">
                  {TIMELINE_OPTS.map((o, i) => (
                    <Opt key={o.id} letter={LETTERS[i]} label={o.label}
                         selected={answers.timeline === o.id} onClick={() => pick('timeline', o.id)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Q4: Budget ──────────────────────────────────── */}
            {step === 4 && (
              <motion.div key="q4" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <QHeader n={4} text={q('q4', '¿Cuál es tu presupuesto aproximado?')} note={q('q4_note', 'En quetzales guatemaltecos (GTQ)')} />
                <div className="flex flex-col gap-2">
                  {BUDGET_OPTS.map((o, i) => (
                    <Opt key={o.id} letter={LETTERS[i]} label={o.label}
                         selected={answers.budget === o.id} onClick={() => pick('budget', o.id)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Q5: Financing ───────────────────────────────── */}
            {step === 5 && (
              <motion.div key="q5" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <QHeader n={5} text={q('q5', '¿Cómo financiarías el proyecto?')} />
                <div className="flex flex-col gap-2">
                  {FINANCING_OPTS.map((o, i) => (
                    <Opt key={o.id} letter={LETTERS[i]} label={o.label}
                         selected={answers.financing === o.id} onClick={() => pick('financing', o.id)} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── DATA STEP: Contact form ──────────────────────── */}
            {step === DATA_STEP && (
              <motion.div key="data" custom={dir} variants={slide} initial="enter" animate="center" exit="exit">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-[#FF6B35] uppercase mb-3"
                   style={{ fontFamily: 'Space Mono, monospace' }}>
                  {ct('eyebrow', 'Último paso')}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-[#F0EDE8] mb-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {ct('title', '¿Cómo podemos contactarte?')}
                </h2>
                <p className="text-sm text-[#8A95A5] mb-8 leading-relaxed">
                  {ct('description', 'Un especialista revisará tu perfil y te contactará con una propuesta personalizada.')}
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                  <input
                    {...register('full_name', { required: true })}
                    placeholder="Nombre completo *"
                    autoComplete="name"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-[#1F2D3A] border text-sm text-[#F0EDE8] placeholder-[#8A95A5] outline-none transition-colors',
                      errors.full_name ? 'border-red-400/60' : 'border-[#27384A] focus:border-[#FF6B35]'
                    )}
                  />
                  <input
                    {...register('phone', { required: true })}
                    placeholder="Teléfono / WhatsApp *"
                    type="tel"
                    autoComplete="tel"
                    className={cn(
                      'w-full px-4 py-3 rounded-xl bg-[#1F2D3A] border text-sm text-[#F0EDE8] placeholder-[#8A95A5] outline-none transition-colors',
                      errors.phone ? 'border-red-400/60' : 'border-[#27384A] focus:border-[#FF6B35]'
                    )}
                  />
                  <input
                    {...register('email')}
                    placeholder="Correo electrónico"
                    type="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl bg-[#1F2D3A] border border-[#27384A] text-sm text-[#F0EDE8] placeholder-[#8A95A5] outline-none focus:border-[#FF6B35] transition-colors"
                  />
                  <input
                    {...register('city')}
                    placeholder="Ciudad"
                    autoComplete="address-level2"
                    className="w-full px-4 py-3 rounded-xl bg-[#1F2D3A] border border-[#27384A] text-sm text-[#F0EDE8] placeholder-[#8A95A5] outline-none focus:border-[#FF6B35] transition-colors"
                  />
                  <button
                    type="submit"
                    className="mt-2 h-12 rounded-xl bg-[#FF6B35] text-[#1A2530] font-bold text-sm hover:bg-[#FF8557] active:scale-[0.98] transition-all"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {ct('submit_label', 'Ver mi resultado')}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── RESULT STEP ─────────────────────────────────── */}
            {step === RESULT_STEP && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-5 py-20">
                    <Loader2 size={36} className="text-[#FF6B35] animate-spin" />
                    <p className="text-sm text-[#8A95A5]">{r('loading', 'Analizando tu perfil…')}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">

                    {/* Tier card */}
                    <div className={cn('rounded-2xl border p-6', TIER_CFG[tier].ring, TIER_CFG[tier].bg)}>
                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <p className="text-[10px] text-[#8A95A5] uppercase tracking-[0.16em] mb-1.5"
                             style={{ fontFamily: 'Space Mono, monospace' }}>
                            {r('classification_label', 'Clasificación de tu proyecto')}
                          </p>
                          <p className="text-lg font-bold text-[#F0EDE8]"
                             style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {TIER_CFG[tier].emoji} {TIER_CFG[tier].label}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-3xl font-bold tabular-nums"
                             style={{ color: TIER_CFG[tier].color, fontFamily: 'Space Mono, monospace' }}>
                            {score}
                          </p>
                          <p className="text-[10px] text-[#8A95A5]">/ 25 pts</p>
                        </div>
                      </div>
                      {/* Score bar */}
                      <div className="h-1.5 bg-[#27384A] rounded-full overflow-hidden">
                        <motion.div
                          className={cn('h-full rounded-full', TIER_CFG[tier].bar)}
                          initial={{ width: 0 }}
                          animate={{ width: `${(score / 25) * 100}%` }}
                          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      {/* Score labels */}
                      <div className="flex justify-between mt-2">
                        {[
                          { label: '💡 Exploración', range: '5–12' },
                          { label: '⚡ Tibio', range: '13–19' },
                          { label: '🔥 Prioritario', range: '20–25' },
                        ].map(({ label, range }) => (
                          <div key={range} className="text-center">
                            <p className="text-[9px] text-[#8A95A5]/60">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI message */}
                    {aiMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-xl bg-[#1F2D3A] border border-[#27384A] p-5"
                      >
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center flex-shrink-0">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" className="text-[#1A2530]">
                              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.5 21l3.948-.93A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-[#FF6B35]"
                                style={{ fontFamily: 'Space Mono, monospace' }}>
                            Especialista Grucore
                          </span>
                        </div>
                        <p className="text-sm text-[#8A95A5] leading-relaxed">{aiMsg}</p>
                      </motion.div>
                    )}

                    {/* CTA buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="flex flex-col sm:flex-row gap-3"
                    >
                      <Link
                        href="/projects"
                        className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] text-[#1A2530] text-sm font-bold hover:bg-[#FF8557] transition-colors"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {r('cta_projects', 'Ver proyectos')} <ArrowRight size={14} />
                      </Link>
                      <a
                        href={buildWA(answers, r('wa_intro', 'Hola, respondí el cuestionario en grucore.com.'))}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border border-[#27384A] text-[#F0EDE8] text-sm font-medium hover:border-[#25D366]/40 hover:bg-[#1F2D3A] transition-colors"
                      >
                        <WAIcon />
                        {r('cta_whatsapp', 'Enviar por WhatsApp')}
                      </a>
                    </motion.div>

                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildWA(a: Answers, intro: string): string {
  const lines = [
    intro,
    '',
    a.service   && `Servicio: ${SERVICE_OPTS.find(o => o.id === a.service)?.label}`,
    a.stage     && `Etapa: ${STAGE_OPTS.find(o => o.id === a.stage)?.label}`,
    a.timeline  && `Timeline: ${TIMELINE_OPTS.find(o => o.id === a.timeline)?.label}`,
    a.budget    && `Presupuesto: ${BUDGET_OPTS.find(o => o.id === a.budget)?.label}`,
    a.financing && `Financiamiento: ${FINANCING_OPTS.find(o => o.id === a.financing)?.label}`,
  ].filter(Boolean).join('\n')
  return `https://wa.me/50220000000?text=${encodeURIComponent(lines)}`
}

function WAIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366] flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}
