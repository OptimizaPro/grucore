'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, TrendingUp, CreditCard, MessageSquare,
  CheckCircle2, ChevronRight, ChevronLeft, X, HelpCircle,
  Camera, FileText, Users, ShieldCheck, Bell, ClipboardList,
  LayoutDashboard, ArrowUpDown, BarChart2, Calendar,
  Clock, DollarSign, Eye, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'grucore_portal_onboarding_v2'

// ─── Wizard steps (perspectiva del cliente) ───────────────────────────────────

const WIZARD_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenido a tu Portal',
    subtitle: 'Sigue el avance de tu proyecto de construcción en tiempo real, desde cualquier dispositivo.',
    Icon: Building2,
    iconColor: '#FF6B35',
    features: [
      { Icon: TrendingUp,    text: 'Estado del proyecto en tiempo real' },
      { Icon: Camera,        text: 'Bitácora fotográfica de obra' },
      { Icon: CreditCard,    text: 'Hitos y pagos del contrato' },
      { Icon: ArrowUpDown,   text: 'Órdenes de cambio con firma' },
      { Icon: MessageSquare, text: 'Chat directo con el equipo' },
      { Icon: FileText,      text: 'Documentos compartidos del proyecto' },
    ],
  },
  {
    id: 'overview',
    title: 'Tu proyecto de un vistazo',
    subtitle: 'El resumen muestra los KPIs más importantes: avance, hitos pendientes y alertas activas.',
    Icon: BarChart2,
    iconColor: '#6B8CFF',
    features: [
      { Icon: TrendingUp,  text: 'Porcentaje de avance general' },
      { Icon: CheckCircle2,text: 'Hitos completados y pendientes' },
      { Icon: Bell,        text: 'Alertas de aprobaciones activas' },
      { Icon: Camera,      text: 'Fotos más recientes de obra' },
      { Icon: DollarSign,  text: 'Presupuesto total del contrato' },
      { Icon: Users,       text: 'Equipo asignado al proyecto' },
    ],
  },
  {
    id: 'milestones',
    title: 'Hitos y firma digital',
    subtitle: 'Revisa la evidencia fotográfica de cada hito y firma tu aprobación sin papeleo.',
    Icon: CreditCard,
    iconColor: '#4A9E6B',
    features: [
      { Icon: Camera,      text: 'Evidencia fotográfica de cada hito' },
      { Icon: ShieldCheck, text: 'Firma digital desde el portal' },
      { Icon: DollarSign,  text: 'Estado de cada pago del contrato' },
      { Icon: Clock,       text: 'Historial completo de aprobaciones' },
      { Icon: Bell,        text: 'Notificación de hitos pendientes' },
      { Icon: Lock,        text: 'Proceso seguro y documentado' },
    ],
  },
  {
    id: 'messages',
    title: 'Comunicación directa',
    subtitle: 'Mantén conversaciones directas con el equipo de obra. Historial completo siempre disponible.',
    Icon: MessageSquare,
    iconColor: '#8B5CF6',
    features: [
      { Icon: MessageSquare, text: 'Chat directo con el equipo de obra' },
      { Icon: FileText,      text: 'Historial completo de mensajes' },
      { Icon: Eye,           text: 'Adjuntar archivos e imágenes' },
      { Icon: Bell,          text: 'Notificaciones en tiempo real' },
      { Icon: Clock,         text: 'Todo documentado y trazable' },
      { Icon: Users,         text: 'Sin llamadas ni correos perdidos' },
    ],
  },
] as const

// ─── Spotlight steps ──────────────────────────────────────────────────────────

const SPOTLIGHT_STEPS = [
  {
    selector: '[data-tour="portal-nav"]',
    title: 'Tu panel de seguimiento',
    description: 'Toda la información de tu proyecto está aquí. Navega entre secciones desde esta barra lateral.',
    Icon: LayoutDashboard,
    iconColor: '#FF6B35',
  },
  {
    selector: '[data-tour="portal-resumen"]',
    title: 'Resumen del proyecto',
    description: 'Vista general con KPIs en tiempo real: avance, hitos completados, pagos y alertas activas.',
    Icon: BarChart2,
    iconColor: '#6B8CFF',
  },
  {
    selector: '[data-tour="portal-avance"]',
    title: 'Avance de obra',
    description: 'Bitácora diaria con fotos, actividades del día y condiciones de trabajo registradas por el equipo.',
    Icon: ClipboardList,
    iconColor: '#4A9E6B',
  },
  {
    selector: '[data-tour="portal-hitos"]',
    title: 'Hitos y pagos',
    description: 'Revisa la evidencia de cada hito y firma tu aprobación digitalmente. Sin papeleo, sin demoras.',
    Icon: CreditCard,
    iconColor: '#F59E0B',
  },
  {
    selector: '[data-tour="portal-cambios"]',
    title: 'Órdenes de cambio',
    description: 'Cambios al alcance o presupuesto del proyecto que requieren tu revisión y firma de aprobación.',
    Icon: ArrowUpDown,
    iconColor: '#EC4899',
  },
  {
    selector: '[data-tour="portal-mensajes"]',
    title: 'Mensajes',
    description: 'Canal directo con el equipo de obra. Todas las conversaciones quedan documentadas aquí.',
    Icon: MessageSquare,
    iconColor: '#8B5CF6',
  },
  {
    selector: '[data-tour="portal-cotizacion"]',
    title: 'Cotización',
    description: 'Revisa el desglose económico de tu proyecto: materiales, mano de obra y costos adicionales detallados.',
    Icon: DollarSign,
    iconColor: '#FF6B35',
  },
  {
    selector: '[data-tour="portal-documentos"]',
    title: 'Documentos',
    description: 'Accede a contratos, planos, permisos y toda la documentación oficial de tu proyecto en un solo lugar.',
    Icon: FileText,
    iconColor: '#4A9E6B',
  },
]

// ─── Animation variants ───────────────────────────────────────────────────────

const cardVariants = {
  hidden:  { opacity: 0, scale: 0.92, y: 24 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
  exit:    { opacity: 0, scale: 0.95, y: -16, transition: { duration: 0.25, ease: 'easeIn' as const } },
}

const contentVariants = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0,   transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const, staggerChildren: 0.06 } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.3 } },
}

const floatVariants = {
  animate: {
    y: [-6, 6, -6],
    transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const },
  },
}

// ─── Spotlight overlay ────────────────────────────────────────────────────────

function SpotlightOverlay({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
}: {
  steps: typeof SPOTLIGHT_STEPS
  currentStep: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const step   = steps[currentStep]
  const isFirst = currentStep === 0
  const isLast  = currentStep === steps.length - 1

  useEffect(() => {
    function measure() {
      const el = document.querySelector(step.selector)
      if (el) setRect(el.getBoundingClientRect())
    }
    const t = setTimeout(measure, 60)
    window.addEventListener('resize', measure)
    return () => { clearTimeout(t); window.removeEventListener('resize', measure) }
  }, [currentStep, step.selector])

  if (!rect) return null

  const PAD       = 10
  const spotTop   = rect.top    - PAD
  const spotLeft  = rect.left   - PAD
  const spotW     = rect.width  + PAD * 2
  const spotH     = rect.height + PAD * 2

  const TOOLTIP_W = 296
  const TOOLTIP_H = 220
  const tipLeft   = spotLeft + spotW + 18
  const screenW   = typeof window !== 'undefined' ? window.innerWidth  : 1200
  const screenH   = typeof window !== 'undefined' ? window.innerHeight : 800
  const toRight   = tipLeft + TOOLTIP_W < screenW - 16
  const tipTop    = Math.max(16, Math.min(
    spotTop + spotH / 2 - TOOLTIP_H / 2,
    screenH - TOOLTIP_H - 16,
  ))

  return (
    <>
      {/* Dismiss backdrop */}
      <div className="fixed inset-0 z-[190]" style={{ cursor: 'default' }} onClick={onClose} />

      {/* Spotlight hole */}
      <motion.div
        className="fixed z-[200] rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          top:    spotTop,
          left:   spotLeft,
          width:  spotW,
          height: spotH,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.78), 0 0 0 2.5px ${step.iconColor}, 0 0 32px ${step.iconColor}55`,
          background: 'transparent',
        }}
      />

      {/* Tooltip card */}
      <motion.div
        className="fixed z-[210]"
        animate={{
          top:  tipTop,
          left: toRight ? tipLeft : spotLeft,
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: TOOLTIP_W }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className="w-full bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.94, x: toRight ? -10 : 0, y: toRight ? 0 : 10 }}
            animate={{ opacity: 1, scale: 1,    x: 0,               y: 0 }}
            exit={{    opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top color bar */}
            <div className="h-1" style={{ background: step.iconColor }} />

            {/* Arrow pointing left (to element) */}
            {toRight && (
              <div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: -9,
                  width: 0, height: 0,
                  borderTop: '9px solid transparent',
                  borderBottom: '9px solid transparent',
                  borderRight: '9px solid #27384A',
                }}
              />
            )}

            <div className="p-4">
              {/* Icon + title + counter */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${step.iconColor}20` }}
                  >
                    <step.Icon size={15} style={{ color: step.iconColor }} />
                  </div>
                  <h3 className="text-sm font-bold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {step.title}
                  </h3>
                </div>
                <span className="text-[10px] text-[#8A95A5] flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {currentStep + 1}/{steps.length}
                </span>
              </div>

              <p className="text-xs text-[#8A95A5] leading-relaxed mb-4">{step.description}</p>

              {/* Progress dots */}
              <div className="flex items-center gap-1 mb-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: i === currentStep ? 20 : 6,
                      background: i === currentStep ? step.iconColor : '#27384A',
                      opacity: i < currentStep ? 0.5 : 1,
                    }}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="text-[10px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors px-2 py-1 rounded-lg hover:bg-[#27384A]"
                >
                  Saltar
                </button>
                <div className="flex items-center gap-1.5">
                  {!isFirst && (
                    <button
                      onClick={onPrev}
                      className="flex items-center gap-0.5 px-2.5 py-1.5 border border-[#27384A] text-[10px] text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
                    >
                      <ChevronLeft size={11} /> Atrás
                    </button>
                  )}
                  <button
                    onClick={onNext}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-[#131D28] hover:opacity-90 transition-opacity"
                    style={{ background: step.iconColor }}
                  >
                    {isLast
                      ? <><CheckCircle2 size={11} /> ¡Listo!</>
                      : <>Siguiente <ChevronRight size={11} /></>
                    }
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PortalOnboarding() {
  const [wizardOpen,    setWizardOpen]    = useState(false)
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [spotlightStep, setSpotlightStep] = useState(0)
  const [wizardStep,    setWizardStep]    = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [helpOpen, setHelpOpen] = useState(false)
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const t = setTimeout(() => setWizardOpen(true), 900)
        return () => clearTimeout(t)
      } else {
        const saved = JSON.parse(raw)
        if (saved.completedSteps) setCompletedSteps(new Set(saved.completedSteps))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        completedSteps: [...completedSteps],
        lastSeen: new Date().toISOString(),
      }))
    } catch {}
  }, [completedSteps, mounted])

  const step    = WIZARD_STEPS[wizardStep]
  const isFirst = wizardStep === 0
  const isLast  = wizardStep === WIZARD_STEPS.length - 1
  const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100

  function startSpotlight() {
    setSpotlightStep(0)
    setSpotlightOpen(true)
    setHelpOpen(false)
  }

  function nextWizardStep() {
    setCompletedSteps(prev => new Set([...prev, wizardStep]))
    if (isLast) {
      setWizardOpen(false)
      setTimeout(startSpotlight, 480)
    } else {
      setWizardStep(s => s + 1)
    }
  }

  function prevWizardStep() {
    if (!isFirst) setWizardStep(s => s - 1)
  }

  function dismissWizard() {
    setCompletedSteps(prev => new Set([...prev, wizardStep]))
    setWizardOpen(false)
  }

  function reopenWizard() {
    setWizardStep(0)
    setWizardOpen(true)
    setHelpOpen(false)
    setSpotlightOpen(false)
  }

  function nextSpotlightStep() {
    if (spotlightStep >= SPOTLIGHT_STEPS.length - 1) {
      setSpotlightOpen(false)
    } else {
      setSpotlightStep(s => s + 1)
    }
  }

  function prevSpotlightStep() {
    if (spotlightStep > 0) setSpotlightStep(s => s - 1)
  }

  if (!mounted) return null

  const showHelp = !wizardOpen && !spotlightOpen

  return (
    <>
      {/* ── Wizard ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {wizardOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={dismissWizard} />

            {/* Decorative orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px] pointer-events-none" style={{ background: step.iconColor }} />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.08] blur-[100px] pointer-events-none" style={{ background: '#6B8CFF' }} />

            <motion.div
              className="relative z-10 w-full max-w-lg bg-[#1A2530] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Progress bar */}
              <div className="h-1 bg-[#27384A]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${step.iconColor}, ${step.iconColor}CC)` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <div className="flex items-center gap-1.5">
                  {WIZARD_STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setWizardStep(i)}
                      className={cn('h-2 rounded-full transition-all duration-300', i === wizardStep ? 'w-5' : 'w-2')}
                      style={{
                        background: i === wizardStep ? step.iconColor : '#8A95A5',
                        opacity: i === wizardStep ? 1 : completedSteps.has(i) ? 0.6 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={dismissWizard}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A] transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={wizardStep}
                  className="px-6 pb-6 pt-3"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Floating icon */}
                  <motion.div className="flex justify-center mb-5" variants={floatVariants} animate="animate">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: `${step.iconColor}18`, border: `1.5px solid ${step.iconColor}30` }}
                    >
                      <step.Icon size={38} style={{ color: step.iconColor }} />
                    </div>
                  </motion.div>

                  <motion.div className="text-center mb-5" variants={itemVariants}>
                    <h2 className="text-xl font-bold text-[#F0EDE8] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {step.title}
                    </h2>
                    <p className="text-sm text-[#8A95A5] leading-relaxed">{step.subtitle}</p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {step.features.map(({ Icon, text }, i) => (
                      <motion.div
                        key={i}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#131D28] border border-[#27384A]"
                        variants={itemVariants}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${step.iconColor}18` }}
                        >
                          <Icon size={12} style={{ color: step.iconColor }} />
                        </div>
                        <span className="text-[11px] text-[#8A95A5] leading-tight">{text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div className="flex items-center justify-between" variants={itemVariants}>
                    <button onClick={dismissWizard} className="text-xs text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
                      Saltar tour
                    </button>
                    <div className="flex items-center gap-2">
                      {!isFirst && (
                        <button
                          onClick={prevWizardStep}
                          className="flex items-center gap-1.5 px-3 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
                        >
                          <ChevronLeft size={13} /> Anterior
                        </button>
                      )}
                      <button
                        onClick={nextWizardStep}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#131D28] hover:opacity-90 transition-opacity"
                        style={{ background: step.iconColor }}
                      >
                        {isLast
                          ? <><CheckCircle2 size={13} /> ¡Ver mi proyecto!</>
                          : <>Siguiente <ChevronRight size={13} /></>
                        }
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Spotlight ──────────────────────────────────────────────────────── */}
      {spotlightOpen && (
        <SpotlightOverlay
          steps={SPOTLIGHT_STEPS}
          currentStep={spotlightStep}
          onNext={nextSpotlightStep}
          onPrev={prevSpotlightStep}
          onClose={() => setSpotlightOpen(false)}
        />
      )}

      {/* ── Floating help button ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1.2, duration: 0.3 }}
          >
            <AnimatePresence>
              {helpOpen && (
                <motion.div
                  className="absolute bottom-14 right-0 bg-[#1A2530] border border-[#27384A] rounded-2xl shadow-2xl overflow-hidden"
                  style={{ width: 272 }}
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1,   y: 0 }}
                  exit={{    opacity: 0, scale: 0.9, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 py-3 border-b border-[#27384A]">
                    <p className="text-xs font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Centro de ayuda</p>
                    <p className="text-[10px] text-[#8A95A5] mt-0.5">Portal de cliente · Grucore</p>
                  </div>
                  <div className="p-3 space-y-1">
                    <button
                      onClick={reopenWizard}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#131D28] border border-[#27384A] hover:border-[#FF6B35]/30 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#FF6B35]/15 flex items-center justify-center flex-shrink-0">
                        <Building2 size={13} className="text-[#FF6B35]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#F0EDE8] font-medium">Tour de bienvenida</p>
                        <p className="text-[10px] text-[#8A95A5]">Resumen de todas las secciones</p>
                      </div>
                    </button>
                    <button
                      onClick={startSpotlight}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#131D28] border border-[#27384A] hover:border-[#FF6B35]/30 transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center flex-shrink-0">
                        <LayoutDashboard size={13} className="text-[#8B5CF6]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#F0EDE8] font-medium">Tour visual del panel</p>
                        <p className="text-[10px] text-[#8A95A5]">Recorrido guiado por el sidebar</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => setHelpOpen(v => !v)}
              className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8557)' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              title="Ayuda y tour"
            >
              <AnimatePresence mode="wait">
                {helpOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={18} /></motion.div>
                  : <motion.div key="h" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><HelpCircle size={18} /></motion.div>
                }
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
