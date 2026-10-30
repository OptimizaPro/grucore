'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, FolderKanban, BarChart2, HardHat, ClipboardList,
  CheckCircle2, ChevronRight, ChevronLeft, X, HelpCircle,
  Package, CreditCard, FileQuestion, ArrowUpDown, Users, Camera,
  Calendar, TrendingUp, Receipt, FileText, Hammer, MapPin,
  CloudSun, DollarSign, ClipboardCheck, FolderOpen, Images,
  LayoutDashboard, CheckSquare, Truck, UserSearch, MessageSquare,
  BookOpen, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'grucore_erp_onboarding_v2'

// ─── Wizard steps ─────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenido a Grucore ERP',
    subtitle: 'Tu plataforma de gestión integral para proyectos de construcción.',
    Icon: Building2,
    iconColor: '#FF6B35',
    features: [
      { Icon: FolderKanban,   text: 'Control completo de cada proyecto' },
      { Icon: Building2,      text: 'Gestión de clientes y portal privado' },
      { Icon: BarChart2,      text: 'Presupuesto, gastos y facturación' },
      { Icon: FileQuestion,   text: 'RFIs y órdenes de cambio digitales' },
      { Icon: MessageSquare,  text: 'Notas internas por proyecto' },
      { Icon: Images,         text: 'Galería, documentos y bitácora' },
    ],
  },
  {
    id: 'projects',
    title: 'Proyectos y clientes',
    subtitle: 'Crea proyectos, asigna clientes y gestiona cada obra desde un solo lugar.',
    Icon: FolderKanban,
    iconColor: '#6B8CFF',
    features: [
      { Icon: Building2,   text: 'Ficha de cliente con portal privado' },
      { Icon: Calendar,    text: 'Fechas de inicio y entrega estimada' },
      { Icon: DollarSign,  text: 'Presupuesto base del contrato' },
      { Icon: Hammer,      text: 'Fases de obra personalizables' },
      { Icon: CreditCard,  text: 'Hitos de pago con firma digital' },
      { Icon: MessageSquare, text: 'Notas internas del equipo por proyecto' },
    ],
  },
  {
    id: 'finances',
    title: 'Control financiero en tiempo real',
    subtitle: 'Registra gastos, emite facturas y gestiona cambios con flujo de aprobación.',
    Icon: BarChart2,
    iconColor: '#4A9E6B',
    features: [
      { Icon: Receipt,      text: 'Gastos por categoría con aprobación' },
      { Icon: FileText,     text: 'Facturas con IVA y control de pagos' },
      { Icon: FileQuestion, text: 'RFIs formales con respuesta documentada' },
      { Icon: ArrowUpDown,  text: 'Órdenes de cambio con firma digital' },
      { Icon: TrendingUp,   text: 'Reportes de rentabilidad y avance' },
      { Icon: CheckCircle2, text: 'Aprobaciones con flujo multi-firma' },
    ],
  },
  {
    id: 'team',
    title: 'Colaboradores y operaciones',
    subtitle: 'Gestiona tu equipo, trabajadores de obra, CRM y tareas desde un solo panel.',
    Icon: Users,
    iconColor: '#F59E0B',
    features: [
      { Icon: Users,          text: 'Equipo interno con roles y permisos' },
      { Icon: HardHat,        text: 'Trabajadores: días trabajados y tarifa' },
      { Icon: ClipboardCheck, text: 'Tareas asignadas con fecha límite' },
      { Icon: UserSearch,     text: 'CRM: pipeline de leads y seguimiento' },
      { Icon: Truck,          text: 'Proveedores e inventario de materiales' },
      { Icon: Package,        text: 'Stock de materiales con alertas de nivel' },
    ],
  },
  {
    id: 'tracking',
    title: 'Registro y documentación',
    subtitle: 'Bitácora diaria, galería fotográfica, documentos y notas internas centralizadas.',
    Icon: ClipboardList,
    iconColor: '#8B5CF6',
    features: [
      { Icon: ClipboardList, text: 'Entradas diarias de progreso con %' },
      { Icon: Camera,        text: 'Galería fotográfica por proyecto' },
      { Icon: CloudSun,      text: 'Condiciones climáticas y materiales' },
      { Icon: FolderOpen,    text: 'Documentos y planos centralizados' },
      { Icon: BookOpen,      text: 'Historial completo de bitácora' },
      { Icon: MessageSquare, text: 'Notas internas del equipo' },
    ],
  },
] as const

// ─── Spotlight steps ──────────────────────────────────────────────────────────

const SPOTLIGHT_STEPS = [
  {
    selector: '[data-tour="erp-nav"]',
    title: 'Navegación principal',
    description: 'Accede a todas las secciones del ERP desde aquí. Los módulos están agrupados por área: proyectos, clientes, colaboradores, recursos, registro y operaciones.',
    Icon: LayoutDashboard,
    iconColor: '#FF6B35',
  },
  {
    selector: '[data-tour="erp-dashboard"]',
    title: 'Proyectos',
    description: 'Tu dashboard principal. KPIs en tiempo real, estado de avance y acceso rápido a cada proyecto activo.',
    Icon: FolderKanban,
    iconColor: '#6B8CFF',
  },
  {
    selector: '[data-tour="erp-clients"]',
    title: 'Clientes',
    description: 'Directorio completo de clientes con acceso a su portal privado, proyectos activos y datos de contacto.',
    Icon: Building2,
    iconColor: '#FF6B35',
  },
  {
    selector: '[data-tour="erp-colaboradores"]',
    title: 'Colaboradores',
    description: 'Gestiona tu equipo interno y trabajadores de obra: días trabajados, tarifa diaria y proyectos asignados.',
    Icon: Users,
    iconColor: '#F59E0B',
  },
  {
    selector: '[data-tour="erp-recursos"]',
    title: 'Recursos',
    description: 'Inventario de materiales con alertas de stock bajo y directorio de proveedores por categoría.',
    Icon: Package,
    iconColor: '#14B8A6',
  },
  {
    selector: '[data-tour="erp-registro"]',
    title: 'Registro',
    description: 'Bitácora diaria de avance, galería fotográfica y documentos del proyecto centralizados en un solo lugar.',
    Icon: ClipboardList,
    iconColor: '#EC4899',
  },
  {
    selector: '[data-tour="erp-crm"]',
    title: 'CRM',
    description: 'Pipeline de leads con etapas personalizables. Registra actividades, seguimientos y convierte oportunidades en proyectos.',
    Icon: UserSearch,
    iconColor: '#14B8A6',
  },
  {
    selector: '[data-tour="erp-operaciones"]',
    title: 'Operaciones',
    description: 'Tareas asignables con prioridad, fecha límite y responsable. Mantén el equipo enfocado en lo que importa.',
    Icon: CheckSquare,
    iconColor: '#8B5CF6',
  },
  {
    selector: '[data-tour="erp-presupuesto"]',
    title: 'Presupuesto',
    description: 'Control de gastos por categoría, facturas con IVA, RFIs formales y órdenes de cambio con firma digital.',
    Icon: BarChart2,
    iconColor: '#4A9E6B',
  },
  {
    selector: '[data-tour="erp-financiero"]',
    title: 'Financiero',
    description: 'Compras, finanzas y P&L, activos fijos, subcontratistas y tesorería. Vista completa de la salud financiera de la empresa.',
    Icon: TrendingUp,
    iconColor: '#F59E0B',
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

  const PAD      = 10
  const spotTop  = rect.top    - PAD
  const spotLeft = rect.left   - PAD
  const spotW    = rect.width  + PAD * 2
  const spotH    = rect.height + PAD * 2

  const TOOLTIP_W = 296
  const TOOLTIP_H = 210
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
      <div className="fixed inset-0 z-[190]" style={{ cursor: 'default' }} onClick={onClose} />

      <motion.div
        className="fixed z-[200] rounded-xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, top: spotTop, left: spotLeft, width: spotW, height: spotH }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.78), 0 0 0 2.5px ${step.iconColor}, 0 0 32px ${step.iconColor}55`,
          background: 'transparent',
        }}
      />

      <motion.div
        className="fixed z-[210]"
        animate={{ top: tipTop, left: toRight ? tipLeft : spotLeft }}
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
            <div className="h-1" style={{ background: step.iconColor }} />

            {toRight && (
              <div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: -9, width: 0, height: 0, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderRight: '9px solid #27384A' }}
              />
            )}

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${step.iconColor}20` }}>
                    <step.Icon size={15} style={{ color: step.iconColor }} />
                  </div>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {step.title}
                  </h3>
                </div>
                <span className="text-[10px] text-[#8A95A5] flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {currentStep + 1}/{steps.length}
                </span>
              </div>

              <p className="text-xs text-[#8A95A5] leading-relaxed mb-4">{step.description}</p>

              <div className="flex items-center gap-1 mb-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{ width: i === currentStep ? 20 : 6, background: i === currentStep ? step.iconColor : '#27384A', opacity: i < currentStep ? 0.5 : 1 }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="text-[10px] text-[#8A95A5] hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-[#27384A]"
                >
                  Saltar
                </button>
                <div className="flex items-center gap-1.5">
                  {!isFirst && (
                    <button
                      onClick={onPrev}
                      className="flex items-center gap-0.5 px-2.5 py-1.5 border border-[#27384A] text-[10px] text-[#8A95A5] rounded-lg hover:text-white hover:border-[#FF6B35]/30 transition-colors"
                    >
                      <ChevronLeft size={11} /> Atrás
                    </button>
                  )}
                  <button
                    onClick={onNext}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-[#131D28] hover:opacity-90 transition-opacity"
                    style={{ background: step.iconColor }}
                  >
                    {isLast ? <><CheckCircle2 size={11} /> ¡Listo!</> : <>Siguiente <ChevronRight size={11} /></>}
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

export default function ERPOnboarding() {
  const pathname = usePathname()
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register')

  const [wizardOpen,     setWizardOpen]     = useState(false)
  const [spotlightOpen,  setSpotlightOpen]  = useState(false)
  const [spotlightStep,  setSpotlightStep]  = useState(0)
  const [wizardStep,     setWizardStep]     = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [helpOpen,       setHelpOpen]       = useState(false)
  const [mounted,        setMounted]        = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthPage) return
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
  }, [isAuthPage])

  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedSteps: [...completedSteps], lastSeen: new Date().toISOString() }))
    } catch {}
  }, [completedSteps, mounted])

  const step     = WIZARD_STEPS[wizardStep]
  const isFirst  = wizardStep === 0
  const isLast   = wizardStep === WIZARD_STEPS.length - 1
  const progress = ((wizardStep + 1) / WIZARD_STEPS.length) * 100

  function startSpotlight() { setSpotlightStep(0); setSpotlightOpen(true); setHelpOpen(false) }

  function nextWizardStep() {
    setCompletedSteps(prev => new Set([...prev, wizardStep]))
    if (isLast) { setWizardOpen(false); setTimeout(startSpotlight, 480) }
    else setWizardStep(s => s + 1)
  }

  function prevWizardStep()  { if (!isFirst) setWizardStep(s => s - 1) }
  function dismissWizard()   { setCompletedSteps(prev => new Set([...prev, wizardStep])); setWizardOpen(false) }
  function reopenWizard()    { setWizardStep(0); setWizardOpen(true); setHelpOpen(false); setSpotlightOpen(false) }

  function nextSpotlightStep() {
    if (spotlightStep >= SPOTLIGHT_STEPS.length - 1) setSpotlightOpen(false)
    else setSpotlightStep(s => s + 1)
  }
  function prevSpotlightStep() { if (spotlightStep > 0) setSpotlightStep(s => s - 1) }

  if (!mounted) return null

  const showHelp = !wizardOpen && !spotlightOpen

  return (
    <>
      {/* ── Wizard ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {wizardOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={dismissWizard} />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px] pointer-events-none" style={{ background: step.iconColor }} />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-[0.08] blur-[100px] pointer-events-none" style={{ background: '#6B8CFF' }} />

            <motion.div
              className="relative z-10 w-full max-w-lg bg-[#1A2530] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl"
              variants={cardVariants} initial="hidden" animate="visible" exit="exit"
            >
              <div className="h-1 bg-[#27384A]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${step.iconColor}, ${step.iconColor}CC)` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>

              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <div className="flex items-center gap-1.5">
                  {WIZARD_STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setWizardStep(i)}
                      className={cn('h-2 rounded-full transition-all duration-300', i === wizardStep ? 'w-5' : 'w-2')}
                      style={{ background: i === wizardStep ? step.iconColor : '#8A95A5', opacity: i === wizardStep ? 1 : completedSteps.has(i) ? 0.6 : 0.3 }}
                    />
                  ))}
                </div>
                <button
                  onClick={dismissWizard}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-[#27384A] text-[#8A95A5] hover:text-white hover:bg-[#1F2D3A] transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={wizardStep}
                  className="px-6 pb-6 pt-3"
                  variants={contentVariants} initial="hidden" animate="visible" exit="exit"
                >
                  <motion.div className="flex justify-center mb-5" variants={floatVariants} animate="animate">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: `${step.iconColor}18`, border: `1.5px solid ${step.iconColor}30` }}
                    >
                      <step.Icon size={38} style={{ color: step.iconColor }} />
                    </div>
                  </motion.div>

                  <motion.div className="text-center mb-5" variants={itemVariants}>
                    <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
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
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${step.iconColor}18` }}>
                          <Icon size={12} style={{ color: step.iconColor }} />
                        </div>
                        <span className="text-[11px] text-[#8A95A5] leading-tight">{text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div className="flex items-center justify-between" variants={itemVariants}>
                    <button onClick={dismissWizard} className="text-xs text-[#8A95A5] hover:text-white transition-colors">
                      Saltar tour
                    </button>
                    <div className="flex items-center gap-2">
                      {!isFirst && (
                        <button
                          onClick={prevWizardStep}
                          className="flex items-center gap-1.5 px-3 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-white hover:border-[#FF6B35]/30 transition-colors"
                        >
                          <ChevronLeft size={13} /> Anterior
                        </button>
                      )}
                      <button
                        onClick={nextWizardStep}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-[#131D28] hover:opacity-90 transition-opacity"
                        style={{ background: step.iconColor }}
                      >
                        {isLast ? <><CheckCircle2 size={13} /> ¡Ver el panel!</> : <>Siguiente <ChevronRight size={13} /></>}
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

      {/* ── Floating Help Button ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="fixed bottom-20 right-6 z-50"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1.2, duration: 0.3 }}
          >
            <AnimatePresence>
              {helpOpen && (
                <motion.div
                  className="absolute bottom-14 right-0 bg-[#1A2530] border border-[#27384A] rounded-2xl shadow-2xl overflow-hidden"
                  style={{ width: 272 }}
                  initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 py-3 border-b border-[#27384A]">
                    <p className="text-xs font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Centro de ayuda</p>
                    <p className="text-[10px] text-[#8A95A5] mt-0.5">Grucore · Panel de Gestión</p>
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
                        <p className="text-xs text-white font-medium">Tour de bienvenida</p>
                        <p className="text-[10px] text-[#8A95A5]">Resumen de todas las funciones</p>
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
                        <p className="text-xs text-white font-medium">Tour visual del panel</p>
                        <p className="text-[10px] text-[#8A95A5]">Recorrido guiado por el sidebar</p>
                      </div>
                    </button>
                    <a
                      href="/erp/dashboard"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#131D28] border border-[#27384A] hover:border-[#FF6B35]/30 transition-colors"
                      onClick={() => setHelpOpen(false)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#6B8CFF]/15 flex items-center justify-center flex-shrink-0">
                        <FolderKanban size={13} className="text-[#6B8CFF]" />
                      </div>
                      <div>
                        <p className="text-xs text-white font-medium">Ir a Proyectos</p>
                        <p className="text-[10px] text-[#8A95A5]">Dashboard principal del ERP</p>
                      </div>
                    </a>
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
