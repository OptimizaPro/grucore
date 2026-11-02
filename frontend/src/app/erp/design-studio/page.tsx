'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Sparkles, Menu, Loader2, AlertCircle, X, Upload,
  ImageIcon, RefreshCw, ChevronDown, Clock, CheckCircle2,
  XCircle, ZoomIn, Info, Wand2,
} from 'lucide-react'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import { toast } from 'sonner'
import {
  getDesignModels, generateDesign, getDesignSession, getDesignSessions,
  type AvailableModel, type DesignSession,
  type SessionTypeValue, type ArchStyleValue, type ProjectTypeValue, type ModelKeyValue,
} from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_TYPE_OPTIONS: { value: SessionTypeValue; label: string; desc: string }[] = [
  { value: 'new_construction', label: 'Nueva Construcción', desc: 'Tengo el terreno, necesito diseño' },
  { value: 'remodel',          label: 'Remodelación',       desc: 'Sube fotos del espacio actual' },
]

const STYLE_OPTIONS: { value: ArchStyleValue; label: string; emoji: string }[] = [
  { value: 'modern',        label: 'Moderno',        emoji: '⬜' },
  { value: 'minimalist',    label: 'Minimalista',    emoji: '◻️' },
  { value: 'mediterranean', label: 'Mediterráneo',   emoji: '🏛️' },
  { value: 'industrial',    label: 'Industrial',     emoji: '🏗️' },
  { value: 'rustic',        label: 'Rústico',        emoji: '🪵' },
  { value: 'contemporary',  label: 'Contemporáneo',  emoji: '🔷' },
  { value: 'colonial',      label: 'Colonial',       emoji: '🏠' },
]

const PROJECT_TYPE_OPTIONS: { value: ProjectTypeValue; label: string }[] = [
  { value: 'house',      label: 'Casa Residencial' },
  { value: 'apartment',  label: 'Apartamento'      },
  { value: 'commercial', label: 'Local Comercial'  },
  { value: 'office',     label: 'Oficina'          },
  { value: 'other',      label: 'Otro'             },
]

const POLL_INTERVAL_MS = 3000
const MAX_POLL_ATTEMPTS = 40 // 2 minutes max

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DesignSession['status'] }) {
  const cfg = {
    pending:    { icon: <Clock size={11} />,         label: 'En cola',    cls: 'text-[#D97706] bg-[#D97706]/10' },
    generating: { icon: <Loader2 size={11} className="animate-spin" />, label: 'Generando', cls: 'text-[#3B82F6] bg-[#3B82F6]/10' },
    completed:  { icon: <CheckCircle2 size={11} />,  label: 'Completado', cls: 'text-[#10B981] bg-[#10B981]/10' },
    failed:     { icon: <XCircle size={11} />,       label: 'Fallido',    cls: 'text-red-400 bg-red-400/10'     },
  }
  const { icon, label, cls } = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {icon}{label}
    </span>
  )
}

// ─── Image lightbox ───────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-[#1A2535] text-[#8A95A5] hover:text-[#F0EDE8]"
        onClick={onClose}
      >
        <X size={18} />
      </button>
      <img
        src={src}
        alt="Render"
        className="max-w-[90vw] max-h-[90vh] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

// ─── Renders gallery ──────────────────────────────────────────────────────────

function RendersGallery({ session }: { session: DesignSession }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (session.status === 'pending' || session.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-[#FF6B35]/20 border-t-[#FF6B35] animate-spin" />
          <Sparkles size={20} className="absolute inset-0 m-auto text-[#FF6B35]" />
        </div>
        <p className="text-[13px] text-[#8A95A5]">
          {session.status === 'pending' ? 'Preparando la generación…' : 'Generando diseños con IA…'}
        </p>
        <p className="text-[11px] text-[#4A5568]">Esto puede tardar entre 15 y 60 segundos</p>
      </div>
    )
  }

  if (session.status === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <XCircle size={32} className="text-red-400" />
        <p className="text-[13px] text-red-400 font-medium">La generación falló</p>
        <p className="text-[11px] text-[#8A95A5] max-w-xs">{session.error_message || 'Error desconocido. Intenta con otro modelo o parámetros.'}</p>
      </div>
    )
  }

  if (!session.renders_urls?.length) {
    return (
      <div className="flex items-center justify-center py-16 text-[#8A95A5] text-[13px]">
        Sin renders disponibles
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {session.renders_urls.map((url, i) => (
          <div
            key={i}
            className="relative group rounded-xl overflow-hidden aspect-video bg-[#131D28] border border-[#2A3A4A] cursor-pointer"
            onClick={() => setLightbox(url)}
          >
            <img
              src={url}
              alt={`Diseño opción ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/80 bg-black/50 rounded px-1.5 py-0.5">
              Opción {i + 1}
            </span>
          </div>
        ))}
      </div>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  )
}

// ─── History card ─────────────────────────────────────────────────────────────

function HistoryCard({ session, onClick }: { session: DesignSession; onClick: () => void }) {
  const style = STYLE_OPTIONS.find(s => s.value === session.style)
  const projType = PROJECT_TYPE_OPTIONS.find(p => p.value === session.project_type)
  const thumb = session.renders_urls?.[0]

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#131D28] border border-[#2A3A4A] rounded-xl overflow-hidden
                 hover:border-[#FF6B35]/40 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-[#1A2535] relative overflow-hidden">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={20} className="text-[#4A5568]" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={session.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[12px] font-medium text-[#F0EDE8] truncate">
          {style?.emoji} {style?.label} · {projType?.label}
        </p>
        <p className="text-[11px] text-[#8A95A5] mt-0.5">
          {session.session_type === 'remodel' ? 'Remodelación' : 'Nueva Construcción'}
        </p>
        <p className="text-[10px] text-[#4A5568] mt-1.5">
          {new Date(session.created_at).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DesignStudioPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Form state
  const [sessionType,      setSessionType]      = useState<SessionTypeValue>('new_construction')
  const [style,            setStyle]            = useState<ArchStyleValue>('modern')
  const [projectType,      setProjectType]      = useState<ProjectTypeValue>('house')
  const [floors,           setFloors]           = useState('')
  const [extraDescription, setExtraDescription] = useState('')
  const [modelKey,         setModelKey]         = useState<ModelKeyValue>('flux_schnell_hf')
  const [uploadedFiles,    setUploadedFiles]    = useState<File[]>([])
  const [previewUrls,      setPreviewUrls]      = useState<string[]>([])

  // Models
  const [models,     setModels]     = useState<AvailableModel[]>([])
  const [loadingModels, setLoadingModels] = useState(true)

  // Session state
  const [activeSession, setActiveSession] = useState<DesignSession | null>(null)
  const [generating,    setGenerating]    = useState(false)
  const [error,         setError]         = useState('')
  const pollRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollAttemptsRef = useRef(0)

  // History
  const [sessions,        setSessions]        = useState<DesignSession[]>([])
  const [loadingHistory,  setLoadingHistory]  = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load models + history
  useEffect(() => {
    getDesignModels()
      .then(setModels)
      .catch(() => toast.error('No se pudieron cargar los modelos de IA'))
      .finally(() => setLoadingModels(false))

    getDesignSessions()
      .then(data => setSessions(data.filter(s => s.status === 'completed')))
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  // Polling
  const startPolling = useCallback((sessionId: number) => {
    pollAttemptsRef.current = 0
    pollRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1
      if (pollAttemptsRef.current > MAX_POLL_ATTEMPTS) {
        clearInterval(pollRef.current!)
        setGenerating(false)
        setError('La generación tardó demasiado. Intenta de nuevo.')
        return
      }

      try {
        const updated = await getDesignSession(sessionId)
        setActiveSession(updated)

        if (updated.status === 'completed' || updated.status === 'failed') {
          clearInterval(pollRef.current!)
          setGenerating(false)
          if (updated.status === 'completed') {
            setSessions(prev => [updated, ...prev.filter(s => s.id !== updated.id)])
            toast.success('¡Diseños generados con éxito!')
          } else {
            toast.error('La generación falló. Verifica el modelo o intenta con otros parámetros.')
          }
        }
      } catch {
        // silent — keep polling
      }
    }, POLL_INTERVAL_MS)
  }, [])

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  // File upload
  function handleFiles(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).slice(0, 4)
    setUploadedFiles(newFiles)
    setPreviewUrls(newFiles.map(f => URL.createObjectURL(f)))
  }

  function removeFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  // Generate
  async function handleGenerate() {
    if (!style || !projectType) return
    if (sessionType === 'remodel' && uploadedFiles.length === 0) {
      setError('Para remodelación, sube al menos una foto del espacio actual.')
      return
    }

    setError('')
    setGenerating(true)
    setActiveSession(null)

    const fd = new FormData()
    fd.append('session_type',      sessionType)
    fd.append('style',             style)
    fd.append('project_type',      projectType)
    fd.append('model_key',         modelKey)
    if (floors) fd.append('floors', floors)
    if (extraDescription.trim()) fd.append('extra_description', extraDescription.trim())
    uploadedFiles.forEach(f => fd.append('images', f))

    try {
      const session = await generateDesign(fd)
      setActiveSession(session)
      startPolling(session.id)
    } catch (err: any) {
      setError(err.message ?? 'Error al iniciar la generación.')
      setGenerating(false)
    }
  }

  const selectedModel = models.find(m => m.key === modelKey)

  const inputCls   = 'w-full bg-[#0f172a] text-[#F0EDE8] text-[13px] rounded-lg px-3 py-2 border border-[#2A3A4A] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50 placeholder-[#4A5568]'
  const labelCls   = 'block text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1.5'

  return (
    <div className="flex h-screen bg-[#131D28] overflow-hidden">
      <ERPSidebar
        currentPage="design_studio"
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-col flex-1 min-w-0">

        {/* ── Topbar ── */}
        <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-[#2A3A4A] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A]"
          >
            <Menu size={18} />
          </button>

          <h1 className="text-[15px] font-semibold text-[#F0EDE8] flex items-center gap-2">
            <Sparkles size={16} className="text-[#FF6B35]" />
            Estudio Visual
          </h1>

          <div className="flex-1" />

          {/* Model selector */}
          <div className="relative flex items-center gap-2">
            <label className="text-[11px] text-[#8A95A5] hidden sm:block">Modelo:</label>
            <div className="relative">
              {loadingModels ? (
                <div className="h-8 w-48 bg-[#1A2535] rounded-lg border border-[#2A3A4A] animate-pulse" />
              ) : (
                <div className="relative">
                  <select
                    value={modelKey}
                    onChange={(e) => setModelKey(e.target.value as ModelKeyValue)}
                    className="appearance-none bg-[#1A2535] text-[#F0EDE8] text-[12px] border border-[#2A3A4A] rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/40 cursor-pointer"
                  >
                    {models.map(m => (
                      <option key={m.key} value={m.key}>
                        {m.label}{m.is_free ? ' ✓ Gratis' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A95A5] pointer-events-none" />
                </div>
              )}
            </div>
            {selectedModel && (
              <span className={`hidden lg:inline text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                selectedModel.is_free
                  ? 'bg-[#10B981]/10 text-[#10B981]'
                  : 'bg-[#FF6B35]/10 text-[#FF6B35]'
              }`}>
                {selectedModel.is_free ? 'Gratis' : 'Pro'}
              </span>
            )}
          </div>

          <ERPAvatar initials="?" />
        </header>

        {/* ── Content ── */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

            {/* ── Error ── */}
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-[12px] bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError('')}><X size={13} /></button>
              </div>
            )}

            {/* ── Main grid: form + results ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* ─── Form panel ─── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Session type */}
                <div>
                  <label className={labelCls}>Tipo de proyecto</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SESSION_TYPE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSessionType(opt.value); setUploadedFiles([]); setPreviewUrls([]) }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          sessionType === opt.value
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                            : 'border-[#2A3A4A] bg-[#1A2535] hover:border-[#3A4A5A]'
                        }`}
                      >
                        <p className={`text-[12px] font-semibold ${sessionType === opt.value ? 'text-[#FF6B35]' : 'text-[#F0EDE8]'}`}>
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-[#8A95A5] mt-0.5 leading-snug">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style selector */}
                <div>
                  <label className={labelCls}>Estilo arquitectónico</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {STYLE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setStyle(opt.value)}
                        className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all ${
                          style === opt.value
                            ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                            : 'border-[#2A3A4A] bg-[#1A2535] hover:border-[#3A4A5A]'
                        }`}
                      >
                        <span className="text-base leading-none">{opt.emoji}</span>
                        <span className={`text-[9px] font-medium leading-tight ${style === opt.value ? 'text-[#FF6B35]' : 'text-[#8A95A5]'}`}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Project type + floors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Tipo de inmueble</label>
                    <div className="relative">
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value as ProjectTypeValue)}
                        className={`${inputCls} appearance-none pr-8`}
                      >
                        {PROJECT_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Número de pisos</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={floors}
                      onChange={(e) => setFloors(e.target.value)}
                      placeholder="Ej: 2"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Extra description */}
                <div>
                  <label className={labelCls}>Descripción adicional <span className="normal-case text-[#4A5568]">(opcional)</span></label>
                  <textarea
                    rows={3}
                    value={extraDescription}
                    onChange={(e) => setExtraDescription(e.target.value)}
                    placeholder="Ej: jardín amplio, piscina, doble garaje, techo plano, materiales de madera y piedra…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                {/* Image upload (remodel only) */}
                {sessionType === 'remodel' && (
                  <div>
                    <label className={labelCls}>Fotos del espacio actual <span className="text-[#FF6B35]">*</span></label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                      className="border-2 border-dashed border-[#2A3A4A] rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer
                                 hover:border-[#FF6B35]/50 hover:bg-[#FF6B35]/5 transition-colors text-center"
                    >
                      <Upload size={20} className="text-[#8A95A5]" />
                      <p className="text-[12px] text-[#8A95A5]">Arrastra fotos o haz clic</p>
                      <p className="text-[10px] text-[#4A5568]">Máximo 4 imágenes · JPG, PNG, WEBP</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#2A3A4A]">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                              className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500/80"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex items-start gap-2.5 bg-[#1A2535] border border-[#2A3A4A] rounded-xl px-3 py-3">
                  <Info size={13} className="text-[#8A95A5] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#8A95A5] leading-relaxed">
                    <span className="font-semibold text-[#F0EDE8]">Concepto visual, no diseño técnico.</span>{' '}
                    Las imágenes generadas por IA son representaciones conceptuales para explorar estilos.
                    No constituyen planos, especificaciones estructurales ni documentos técnicos oficiales.
                    Requieren diseño arquitectónico profesional para su ejecución.
                  </p>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3 rounded-xl font-semibold text-[14px] bg-[#FF6B35] text-white
                             hover:bg-[#e85d2a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                             flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <><Loader2 size={16} className="animate-spin" /> Generando…</>
                  ) : (
                    <><Wand2 size={16} /> Generar 3 diseños</>
                  )}
                </button>

                {/* Model info */}
                {selectedModel && (
                  <p className="text-[10px] text-[#4A5568] text-center">
                    Usando: <span className="text-[#8A95A5]">{selectedModel.label}</span>
                    {' · '}{selectedModel.description}
                  </p>
                )}
              </div>

              {/* ─── Results panel ─── */}
              <div className="lg:col-span-3">
                <div className="bg-[#1A2535] border border-[#2A3A4A] rounded-2xl overflow-hidden h-full min-h-[400px]">

                  {/* Results header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A3A4A]">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={15} className="text-[#8A95A5]" />
                      <span className="text-[13px] font-medium text-[#F0EDE8]">Resultados</span>
                      {activeSession && (
                        <StatusBadge status={activeSession.status} />
                      )}
                    </div>
                    {activeSession?.status === 'completed' && (
                      <p className="text-[10px] text-[#8A95A5]">
                        {STYLE_OPTIONS.find(s => s.value === activeSession.style)?.label}
                        {' · '}
                        {PROJECT_TYPE_OPTIONS.find(p => p.value === activeSession.project_type)?.label}
                      </p>
                    )}
                  </div>

                  {/* Results body */}
                  <div className="p-5">
                    {!activeSession ? (
                      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-[#FF6B35]/10 flex items-center justify-center">
                          <Sparkles size={28} className="text-[#FF6B35]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-[#F0EDE8]">Configura tu diseño</p>
                          <p className="text-[12px] text-[#8A95A5] mt-1">Selecciona estilo, tipo de proyecto y genera tus renders</p>
                        </div>
                      </div>
                    ) : (
                      <RendersGallery session={activeSession} />
                    )}
                  </div>

                  {/* Prompt used */}
                  {activeSession?.prompt_used && (
                    <div className="px-5 pb-4 border-t border-[#2A3A4A] pt-3">
                      <p className="text-[9px] text-[#4A5568] uppercase tracking-wide mb-1">Prompt utilizado</p>
                      <p className="text-[10px] text-[#8A95A5] leading-relaxed font-mono">{activeSession.prompt_used}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── History ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-semibold text-[#F0EDE8] flex items-center gap-2">
                  <Clock size={14} className="text-[#8A95A5]" />
                  Historial de diseños
                </h2>
                <button
                  onClick={() => {
                    setLoadingHistory(true)
                    getDesignSessions()
                      .then(data => setSessions(data.filter(s => s.status === 'completed')))
                      .catch(() => {})
                      .finally(() => setLoadingHistory(false))
                  }}
                  className="p-1.5 text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] rounded-lg transition-colors"
                >
                  <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingHistory ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-[#1A2535] border border-[#2A3A4A] overflow-hidden animate-pulse">
                      <div className="aspect-video bg-[#2A3A4A]" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-[#2A3A4A] rounded" />
                        <div className="h-2 bg-[#2A3A4A] rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center border border-dashed border-[#2A3A4A] rounded-2xl">
                  <ImageIcon size={24} className="text-[#4A5568]" />
                  <p className="text-[12px] text-[#8A95A5]">Sin diseños generados aún</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {sessions.slice(0, 12).map(session => (
                    <HistoryCard
                      key={session.id}
                      session={session}
                      onClick={() => setActiveSession(session)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
