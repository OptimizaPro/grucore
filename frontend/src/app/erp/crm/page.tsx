'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Plus, X, Menu, Loader2, AlertCircle, ChevronDown, ChevronUp,
  GripVertical, Pencil, Trash2, Check, Phone, Mail,
  MessageSquare, CalendarDays, ArrowRightLeft, Trophy,
  Search, SlidersHorizontal, Users, Kanban, Settings2, List,
  Instagram, Linkedin, Youtube, Globe, RefreshCw,
} from 'lucide-react'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import { confirmToast } from '@/lib/confirm-toast'
import { toast } from 'sonner'
import {
  getPipelines, createPipeline, updatePipeline, deletePipeline,
  createStage, updateStage, deleteStage, reorderStages,
  getLeads, createLead, updateLead, deleteLead, moveLead,
  createLeadActivity,
  type Pipeline, type PipelineStage, type Lead, type LeadActivity,
  type LeadSourceValue, type ServiceTypeValue, type LeadStatusValue, type ActivityTypeValue, type LeadTierValue,
} from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<LeadSourceValue, string> = {
  instagram:      'Instagram',
  facebook:       'Facebook',
  meta_ads:       'Meta Ads',
  linkedin:       'LinkedIn',
  youtube:        'YouTube',
  tiktok:         'TikTok',
  organic_search: 'Búsqueda orgánica',
  referral:       'Referido',
  widget:         'Widget',
  direct:         'Directo',
  other:          'Otro',
}

const SERVICE_LABEL: Record<ServiceTypeValue, string> = {
  construction:   'Construcción',
  renovation:     'Remodelación',
  kitchens_baths: 'Cocinas y Baños',
  commercial:     'Comercial',
  residential:    'Residencial',
  other:          'Otro',
}

const STATUS_LABEL: Record<LeadStatusValue, string> = {
  active:   'Activo',
  won:      'Ganado',
  lost:     'Perdido',
  archived: 'Archivado',
}

const STATUS_COLOR: Record<LeadStatusValue, string> = {
  active:   'bg-[#FF6B35]/15 text-[#FF6B35]',
  won:      'bg-[#4A9E6B]/15 text-[#4A9E6B]',
  lost:     'bg-red-500/15 text-red-400',
  archived: 'bg-[#4A5568]/20 text-[#8A95A5]',
}

const ACTIVITY_ICON: Record<ActivityTypeValue, React.ReactNode> = {
  note:         <MessageSquare size={12} />,
  call:         <Phone size={12} />,
  email:        <Mail size={12} />,
  meeting:      <CalendarDays size={12} />,
  stage_change: <ArrowRightLeft size={12} />,
  conversion:   <Trophy size={12} />,
}

const ACTIVITY_LABEL: Record<ActivityTypeValue, string> = {
  note:         'Nota',
  call:         'Llamada',
  email:        'Email',
  meeting:      'Reunión',
  stage_change: 'Cambio de etapa',
  conversion:   'Conversión',
}

const PRESET_COLORS = [
  '#8A95A5', '#FF6B35', '#4A9E6B', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F59E0B', '#14B8A6', '#EF4444', '#6366F1',
]

const TIER_CFG: Record<LeadTierValue, { label: string; color: string; bg: string; bar: string }> = {
  hot:  { label: '🔥 Caliente', color: '#FF6B35', bg: 'rgba(255,107,53,0.12)', bar: '#FF6B35' },
  warm: { label: '⚡ Tibio',    color: '#D97706', bg: 'rgba(217,119,6,0.12)',  bar: '#D97706' },
  cold: { label: '💡 Exploración', color: '#8A95A5', bg: 'rgba(138,149,165,0.12)', bar: '#64748B' },
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtGtq(v: string | null | undefined) {
  if (!v) return null
  const n = Number(v)
  if (isNaN(n)) return null
  return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 0 })}`
}

// ─── Source badge ─────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: LeadSourceValue }) {
  const iconMap: Partial<Record<LeadSourceValue, React.ReactNode>> = {
    instagram: <Instagram size={10} />,
    facebook:  <Globe size={10} />,
    meta_ads:  <Globe size={10} />,
    linkedin:  <Linkedin size={10} />,
    youtube:   <Youtube size={10} />,
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#1F2D3A] text-[#8A95A5]">
      {iconMap[source] ?? <Globe size={10} />}
      {SOURCE_LABEL[source] ?? source}
    </span>
  )
}

// ─── Lead card (Kanban) ───────────────────────────────────────────────────────

function LeadCard({
  lead,
  onDragStart,
  onClick,
}: {
  lead: Lead
  onDragStart: (e: React.DragEvent, lead: Lead) => void
  onClick: (lead: Lead) => void
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={() => onClick(lead)}
      className="bg-[#131D28] border border-[#2A3A4A] rounded-lg p-3 cursor-pointer
                 hover:border-[#FF6B35]/40 transition-colors active:scale-[0.98] select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-[13px] font-medium text-[#F0EDE8] leading-snug line-clamp-1">
          {lead.full_name}
        </p>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLOR[lead.status]}`}>
          {STATUS_LABEL[lead.status]}
        </span>
      </div>

      {lead.company && (
        <p className="text-[11px] text-[#8A95A5] mb-1.5 truncate">{lead.company}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <SourceBadge source={lead.source} />
        {lead.estimated_value_gtq && (
          <span className="text-[11px] font-medium text-[#4A9E6B]">
            {fmtGtq(lead.estimated_value_gtq)}
          </span>
        )}
      </div>

      {lead.lead_tier && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ color: TIER_CFG[lead.lead_tier].color, background: TIER_CFG[lead.lead_tier].bg }}
          >
            {TIER_CFG[lead.lead_tier].label}
          </span>
          {lead.lead_score !== null && (
            <span className="text-[10px] text-[#8A95A5] font-mono">{lead.lead_score}/25</span>
          )}
        </div>
      )}

      {lead.days_in_stage > 0 && (
        <p className="text-[10px] text-[#8A95A5] mt-1.5">{lead.days_in_stage}d en etapa</p>
      )}
    </div>
  )
}

// ─── Kanban column ────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  leads,
  onDragStart,
  onDrop,
  onDragOver,
  onLeadClick,
}: {
  stage: PipelineStage
  leads: Lead[]
  onDragStart: (e: React.DragEvent, lead: Lead) => void
  onDrop: (e: React.DragEvent, stageId: number) => void
  onDragOver: (e: React.DragEvent) => void
  onLeadClick: (lead: Lead) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div
      className={`flex flex-col min-w-[240px] max-w-[280px] flex-shrink-0 rounded-xl border transition-colors h-full ${
        isDragOver ? 'border-[#FF6B35]/60 bg-[#FF6B35]/5' : 'border-[#2A3A4A] bg-[#1A2535]'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); onDragOver(e) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, stage.id) }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 flex-shrink-0">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        <span className="text-[13px] font-medium text-[#F0EDE8] flex-1 truncate">{stage.name}</span>
        <span className="text-[11px] text-[#8A95A5] font-mono">{leads.length}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 px-3 pb-3 overflow-y-auto flex-1 min-h-[80px]">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onDragStart={onDragStart}
            onClick={onLeadClick}
          />
        ))}
        {leads.length === 0 && (
          <div className="flex items-center justify-center flex-1 min-h-[60px]">
            <p className="text-[11px] text-[#8A95A5]">Sin leads</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Lead detail modal ────────────────────────────────────────────────────────

function LeadModal({
  lead: initialLead,
  pipeline,
  onClose,
  onUpdate,
  onDelete,
}: {
  lead: Lead
  pipeline: Pipeline
  onClose: () => void
  onUpdate: (lead: Lead) => void
  onDelete: (leadId: number) => void
}) {
  const [lead, setLead]           = useState(initialLead)
  const [tab, setTab]             = useState<'info' | 'activity'>('info')
  const [actType, setActType]     = useState<ActivityTypeValue>('note')
  const [actContent, setActContent] = useState('')
  const [saving, setSaving]       = useState(false)
  const [addingActivity, setAddingActivity] = useState(false)
  const [error, setError]         = useState('')

  async function handleAddActivity() {
    if (!actContent.trim()) return
    setAddingActivity(true)
    try {
      const act = await createLeadActivity(lead.id, { activity_type: actType, content: actContent.trim() })
      setLead(prev => ({ ...prev, activities: [act, ...prev.activities] }))
      setActContent('')
    } catch {
      setError('No se pudo registrar la actividad.')
    } finally {
      setAddingActivity(false)
    }
  }

  async function handleStatusChange(status: LeadStatusValue) {
    try {
      const updated = await updateLead(lead.id, { status })
      setLead(updated)
      onUpdate(updated)
    } catch {
      setError('No se pudo actualizar el estado.')
    }
  }

  function handleDelete() {
    confirmToast({
      title:        `Eliminar lead`,
      description:  `"${lead.full_name}" será eliminado permanentemente.`,
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        try {
          await deleteLead(lead.id)
          onDelete(lead.id)
          onClose()
          toast.success('Lead eliminado.')
        } catch {
          toast.error('No se pudo eliminar el lead.')
        }
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A2535] border border-[#2A3A4A] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-[#2A3A4A]">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: lead.stage_color }}
              />
              <span className="text-[11px] text-[#8A95A5]">{lead.stage_name}</span>
            </div>
            <h2 className="text-lg font-semibold text-[#F0EDE8] leading-snug">{lead.full_name}</h2>
            {lead.company && <p className="text-[12px] text-[#8A95A5] mt-0.5">{lead.company}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-[#8A95A5] hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#2A3A4A] px-5">
          {(['info', 'activity'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2.5 px-1 mr-4 text-[12px] font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#FF6B35] text-[#FF6B35]'
                  : 'border-transparent text-[#8A95A5] hover:text-[#F0EDE8]'
              }`}
            >
              {t === 'info' ? 'Información' : 'Actividad'}
            </button>
          ))}
        </div>

        <div className={tab === 'activity' ? 'overflow-y-auto max-h-[60vh] p-5' : 'p-5'}>
          {tab === 'info' ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-0">

              {/* ── Columna izquierda: datos de contacto ── */}
              <div className="space-y-3">

                {/* Estado */}
                <div>
                  <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1.5">Estado</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['active', 'won', 'lost', 'archived'] as LeadStatusValue[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                          lead.status === s
                            ? STATUS_COLOR[s]
                            : 'bg-[#131D28] text-[#8A95A5] hover:text-[#8A95A5]'
                        }`}
                      >
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {lead.email && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-0.5">Email</p>
                      <a href={`mailto:${lead.email}`} className="text-[12px] text-[#F0EDE8] hover:text-[#FF6B35] transition-colors truncate block">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  {lead.phone && (
                    <div>
                      <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-0.5">Teléfono</p>
                      <a href={`tel:${lead.phone}`} className="text-[12px] text-[#F0EDE8] hover:text-[#FF6B35] transition-colors">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                  {lead.city && (
                    <div>
                      <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-0.5">Ciudad</p>
                      <p className="text-[12px] text-[#F0EDE8]">{lead.city}</p>
                    </div>
                  )}
                  {lead.estimated_value_gtq && (
                    <div>
                      <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-0.5">Valor estimado</p>
                      <p className="text-[12px] text-[#4A9E6B] font-medium">{fmtGtq(lead.estimated_value_gtq)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-0.5">Fuente</p>
                    <SourceBadge source={lead.source} />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-0.5">Servicio</p>
                    <span className="text-[12px] text-[#F0EDE8]">{SERVICE_LABEL[lead.service_type]}</span>
                  </div>
                </div>

                <p className="text-[10px] text-[#8A95A5]">Registrado {fmtDate(lead.created_at)}</p>
              </div>

              {/* ── Separador vertical ── */}
              <div className="border-l border-[#2A3A4A] pl-5 space-y-3">

                {/* Calificación */}
                {lead.lead_tier && (
                  <div className="bg-[#131D28] rounded-xl p-3 border border-[#2A3A4A]">
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-2">Calificación</p>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[11px] font-semibold px-3 py-1 rounded-full flex-shrink-0"
                        style={{ color: TIER_CFG[lead.lead_tier].color, background: TIER_CFG[lead.lead_tier].bg }}
                      >
                        {TIER_CFG[lead.lead_tier].label}
                      </span>
                      {lead.lead_score !== null && (
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="flex-1 h-1.5 bg-[#2A3A4A] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.round((lead.lead_score / 25) * 100)}%`,
                                background: TIER_CFG[lead.lead_tier].bar,
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-bold font-mono flex-shrink-0" style={{ color: TIER_CFG[lead.lead_tier].color }}>
                            {lead.lead_score}/25
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quiz answers */}
                {lead.notes && (() => {
                  const lines = lead.notes.split('\n').map(l => l.trim()).filter(Boolean)
                  const pairs = lines.map(l => {
                    const idx = l.indexOf(':')
                    return idx > 0
                      ? { key: l.slice(0, idx).trim(), val: l.slice(idx + 1).trim() }
                      : { key: null, val: l }
                  })
                  const hasPairs = pairs.some(p => p.key)
                  return (
                    <div>
                      <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-2">Respuestas del quiz</p>
                      {hasPairs ? (
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                          {pairs.map((p, i) =>
                            p.key ? (
                              <div key={i}>
                                <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide leading-none mb-0.5">{p.key}</p>
                                <p className="text-[12px] text-[#F0EDE8] font-medium leading-snug">{p.val}</p>
                              </div>
                            ) : (
                              <div key={i} className="col-span-2">
                                <p className="text-[12px] text-[#8A95A5] leading-relaxed">{p.val}</p>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {lines.map((l, i) => (
                            <p key={i} className="text-[12px] text-[#8A95A5] leading-relaxed">{l}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {!lead.lead_tier && !lead.notes && (
                  <p className="text-[12px] text-[#4A5568]">Sin calificación registrada</p>
                )}
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              {/* Add activity */}
              <div className="bg-[#131D28] rounded-xl p-3 space-y-2">
                <div className="flex gap-1.5 flex-wrap">
                  {(['note', 'call', 'email', 'meeting'] as ActivityTypeValue[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActType(t)}
                      className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-colors ${
                        actType === t
                          ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                          : 'bg-[#1A2535] text-[#8A95A5] hover:text-[#F0EDE8]'
                      }`}
                    >
                      {ACTIVITY_ICON[t]}
                      {ACTIVITY_LABEL[t]}
                    </button>
                  ))}
                </div>
                <textarea
                  value={actContent}
                  onChange={(e) => setActContent(e.target.value)}
                  placeholder="Descripción de la actividad…"
                  rows={2}
                  className="w-full bg-[#1A2535] text-[#F0EDE8] text-[12px] rounded-lg px-3 py-2 resize-none
                             placeholder-[#4A5568] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50
                             border border-[#2A3A4A]"
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!actContent.trim() || addingActivity}
                  className="w-full py-1.5 rounded-lg text-[12px] font-medium bg-[#FF6B35] text-white
                             hover:bg-[#e85d2a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {addingActivity ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Registrar actividad'}
                </button>
              </div>

              {/* Activity list */}
              <div className="space-y-2">
                {lead.activities.length === 0 && (
                  <p className="text-[12px] text-[#8A95A5] text-center py-4">Sin actividades registradas</p>
                )}
                {lead.activities.map((act) => (
                  <div key={act.id} className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#131D28] border border-[#2A3A4A] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#8A95A5]">
                      {ACTIVITY_ICON[act.activity_type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-[#FF6B35] font-medium">{ACTIVITY_LABEL[act.activity_type]}</span>
                        <span className="text-[10px] text-[#8A95A5]">{fmtDate(act.created_at)}</span>
                        {act.user_name && <span className="text-[10px] text-[#8A95A5]">· {act.user_name}</span>}
                      </div>
                      <p className="text-[12px] text-[#8A95A5] leading-relaxed">{act.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── New lead modal ───────────────────────────────────────────────────────────

function NewLeadModal({
  pipeline,
  defaultStageId,
  onClose,
  onCreate,
}: {
  pipeline: Pipeline
  defaultStageId?: number
  onClose: () => void
  onCreate: (lead: Lead) => void
}) {
  const [form, setForm] = useState({
    full_name:           '',
    email:               '',
    phone:               '',
    company:             '',
    city:                '',
    source:              'other' as LeadSourceValue,
    service_type:        'other' as ServiceTypeValue,
    stage:               defaultStageId ?? pipeline.stages[0]?.id ?? 0,
    estimated_value_gtq: '',
    notes:               '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) { setError('El nombre es requerido.'); return }
    setSaving(true)
    setError('')
    try {
      const lead = await createLead({
        ...form,
        pipeline: pipeline.id,
        estimated_value_gtq: form.estimated_value_gtq || null,
      } as any)
      onCreate(lead)
      onClose()
    } catch (err: any) {
      setError(err.message ?? 'Error al crear el lead.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-[#131D28] text-[#F0EDE8] text-[13px] rounded-lg px-3 py-2 border border-[#2A3A4A] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50 placeholder-[#4A5568]'
  const labelCls = 'block text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A2535] border border-[#2A3A4A] rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2A3A4A]">
          <h2 className="text-[15px] font-semibold text-[#F0EDE8]">Nuevo Lead</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] transition-colors">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">
            <AlertCircle size={12} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-3">
          <div>
            <label className={labelCls}>Nombre completo *</label>
            <input className={inputCls} value={form.full_name} onChange={set('full_name')} placeholder="Nombre del lead" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+502 …" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Empresa</label>
              <input className={inputCls} value={form.company} onChange={set('company')} placeholder="Empresa (opcional)" />
            </div>
            <div>
              <label className={labelCls}>Ciudad</label>
              <input className={inputCls} value={form.city} onChange={set('city')} placeholder="Ciudad" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fuente</label>
              <select className={inputCls} value={form.source} onChange={set('source')}>
                {Object.entries(SOURCE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Servicio</label>
              <select className={inputCls} value={form.service_type} onChange={set('service_type')}>
                {Object.entries(SERVICE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Etapa</label>
              <select className={inputCls} value={form.stage} onChange={set('stage')}>
                {pipeline.stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Valor estimado (GTQ)</label>
              <input className={inputCls} type="number" min="0" value={form.estimated_value_gtq} onChange={set('estimated_value_gtq')} placeholder="0.00" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={form.notes}
              onChange={set('notes')}
              placeholder="Información adicional…"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-[#8A95A5] bg-[#131D28] hover:bg-[#2A3A4A] transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium bg-[#FF6B35] text-white hover:bg-[#e85d2a] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Crear lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Pipeline Config — stages panel ──────────────────────────────────────────

function StagesPanel({
  pipeline,
  onPipelineUpdate,
}: {
  pipeline: Pipeline
  onPipelineUpdate: (p: Pipeline) => void
}) {
  const [stages, setStages]       = useState<PipelineStage[]>(pipeline.stages)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName]   = useState('')
  const [editColor, setEditColor] = useState('')
  const [newName, setNewName]     = useState('')
  const [newColor, setNewColor]   = useState('#8A95A5')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const dragItem                  = useRef<number | null>(null)
  const dragOver                  = useRef<number | null>(null)

  // Sync when pipeline changes
  useEffect(() => { setStages(pipeline.stages) }, [pipeline.id])

  async function handleAddStage() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const stage = await createStage(pipeline.id, { name: newName.trim(), color: newColor, order: stages.length + 1 })
      const updated = [...stages, stage]
      setStages(updated)
      onPipelineUpdate({ ...pipeline, stages: updated })
      setNewName('')
      setNewColor('#8A95A5')
    } catch { setError('No se pudo crear la etapa.') }
    finally { setSaving(false) }
  }

  async function handleSaveEdit(stage: PipelineStage) {
    try {
      const updated = await updateStage(pipeline.id, stage.id, { name: editName, color: editColor })
      const next = stages.map(s => s.id === updated.id ? updated : s)
      setStages(next)
      onPipelineUpdate({ ...pipeline, stages: next })
      setEditingId(null)
    } catch { setError('No se pudo actualizar la etapa.') }
  }

  function handleDeleteStage(stage: PipelineStage) {
    confirmToast({
      title:        'Eliminar etapa',
      description:  `"${stage.name}" será eliminada. Los leads asignados quedarán sin etapa.`,
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        try {
          await deleteStage(pipeline.id, stage.id)
          const next = stages.filter(s => s.id !== stage.id)
          setStages(next)
          onPipelineUpdate({ ...pipeline, stages: next })
          toast.success('Etapa eliminada.')
        } catch { toast.error('No se pudo eliminar la etapa.') }
      },
    })
  }

  function handleDragStart(index: number) { dragItem.current = index }
  function handleDragEnter(index: number) {
    dragOver.current = index
    const next = [...stages]
    const dragged = next.splice(dragItem.current!, 1)[0]
    next.splice(index, 0, dragged)
    dragItem.current = index
    setStages(next)
  }
  async function handleDragEnd() {
    try {
      await reorderStages(pipeline.id, stages.map(s => s.id))
      onPipelineUpdate({ ...pipeline, stages })
    } catch { setError('No se pudo reordenar las etapas.') }
    dragItem.current = null
    dragOver.current = null
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[15px] font-semibold text-[#F0EDE8]">{pipeline.name}</p>
        {pipeline.description && <p className="text-[12px] text-[#8A95A5] mt-0.5">{pipeline.description}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-[12px] bg-red-500/10 rounded-lg px-3 py-2">
          <AlertCircle size={12} />{error}
        </div>
      )}

      {/* Stage list */}
      <div className="space-y-2">
        <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide">Etapas ({stages.length})</p>
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-3 bg-[#131D28] border border-[#2A3A4A] rounded-xl px-3 py-2.5
                       cursor-grab active:cursor-grabbing hover:border-[#3A4A5A] transition-colors"
          >
            <GripVertical size={13} className="text-[#8A95A5] flex-shrink-0" />
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
            {editingId === stage.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(stage)}
                  className="flex-1 bg-[#1A2535] text-[#F0EDE8] text-[12px] rounded-lg px-2 py-1 border border-[#FF6B35]/40 focus:outline-none"
                />
                <div className="flex gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} onClick={() => setEditColor(c)}
                      className={`w-3.5 h-3.5 rounded-full flex-shrink-0 transition-transform ${editColor === c ? 'scale-125 ring-1 ring-white/40' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={() => handleSaveEdit(stage)} className="p-1 text-[#4A9E6B]"><Check size={13} /></button>
                <button onClick={() => setEditingId(null)} className="p-1 text-[#8A95A5]"><X size={13} /></button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-[12px] text-[#F0EDE8]">{stage.name}</span>
                <span className="text-[10px] text-[#8A95A5]">{stage.leads_count} leads</span>
                {stage.is_won  && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A9E6B]/20 text-[#4A9E6B]">Won</span>}
                {stage.is_lost && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Lost</span>}
                <button onClick={() => { setEditingId(stage.id); setEditName(stage.name); setEditColor(stage.color) }}
                  className="p-1.5 text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] rounded-lg transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDeleteStage(stage)}
                  className="p-1.5 text-[#8A95A5] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        ))}
        {stages.length === 0 && (
          <p className="text-center py-6 text-[#8A95A5] text-[12px]">Sin etapas. Crea la primera abajo.</p>
        )}
      </div>

      {/* Add stage */}
      <div className="bg-[#131D28] border border-[#2A3A4A] rounded-xl p-3 space-y-2.5">
        <p className="text-[11px] font-medium text-[#F0EDE8]">Agregar etapa</p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
            placeholder="Nombre de la etapa"
            className="flex-1 bg-[#1A2535] text-[#F0EDE8] text-[12px] rounded-lg px-3 py-2 border border-[#2A3A4A] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50 placeholder-[#4A5568]"
          />
          <button onClick={handleAddStage} disabled={!newName.trim() || saving}
            className="px-3 py-2 rounded-lg text-[12px] font-medium bg-[#FF6B35] text-white hover:bg-[#e85d2a] disabled:opacity-40 transition-colors">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button key={c} onClick={() => setNewColor(c)}
              className={`w-4 h-4 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-1 ring-white/40' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Pipeline Config — pipelines panel (left) ─────────────────────────────────

function PipelinesPanel({
  pipelines,
  selectedId,
  onSelect,
  onPipelinesChange,
}: {
  pipelines: Pipeline[]
  selectedId: number | null
  onSelect: (id: number) => void
  onPipelinesChange: (pipelines: Pipeline[]) => void
}) {
  const [editingId, setEditingId]   = useState<number | null>(null)
  const [editName, setEditName]     = useState('')
  const [editDesc, setEditDesc]     = useState('')
  const [newName, setNewName]       = useState('')
  const [newDesc, setNewDesc]       = useState('')
  const [creating, setCreating]     = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [error, setError]           = useState('')

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const p = await createPipeline({ name: newName.trim(), description: newDesc.trim() })
      onPipelinesChange([...pipelines, p])
      onSelect(p.id)
      setNewName('')
      setNewDesc('')
      setShowForm(false)
      toast.success(`Pipeline "${p.name}" creado.`)
    } catch { setError('No se pudo crear el pipeline.') }
    finally { setCreating(false) }
  }

  async function handleSaveEdit(p: Pipeline) {
    try {
      const updated = await updatePipeline(p.id, { name: editName, description: editDesc })
      onPipelinesChange(pipelines.map(x => x.id === updated.id ? { ...x, ...updated } : x))
      setEditingId(null)
      toast.success('Pipeline actualizado.')
    } catch { toast.error('No se pudo actualizar el pipeline.') }
  }

  async function handleSetDefault(p: Pipeline) {
    try {
      await updatePipeline(p.id, { is_default: true })
      onPipelinesChange(pipelines.map(x => ({ ...x, is_default: x.id === p.id })))
    } catch { toast.error('No se pudo cambiar el pipeline por defecto.') }
  }

  function handleDelete(p: Pipeline) {
    confirmToast({
      title:        'Eliminar pipeline',
      description:  `"${p.name}" y todas sus etapas serán eliminados.`,
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        try {
          await deletePipeline(p.id)
          const next = pipelines.filter(x => x.id !== p.id)
          onPipelinesChange(next)
          if (selectedId === p.id && next.length > 0) onSelect(next[0].id)
          toast.success('Pipeline eliminado.')
        } catch { toast.error('No se pudo eliminar el pipeline.') }
      },
    })
  }

  const inputCls = 'w-full bg-[#1A2535] text-[#F0EDE8] text-[12px] rounded-lg px-3 py-2 border border-[#2A3A4A] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50 placeholder-[#4A5568]'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide">Pipelines ({pipelines.length})</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 text-[11px] text-[#FF6B35] hover:text-[#FF8557] transition-colors font-medium"
        >
          <Plus size={12} />
          Nuevo
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-[11px] bg-red-500/10 rounded-lg px-3 py-2 mb-3">
          <AlertCircle size={11} />{error}
        </div>
      )}

      {/* New pipeline form */}
      {showForm && (
        <div className="bg-[#131D28] border border-[#FF6B35]/30 rounded-xl p-3 space-y-2 mb-3">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Nombre del pipeline *"
            className={inputCls}
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Descripción (opcional)"
            className={inputCls}
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim() || creating}
              className="flex-1 py-1.5 rounded-lg text-[12px] font-medium bg-[#FF6B35] text-white hover:bg-[#e85d2a] disabled:opacity-40 transition-colors">
              {creating ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Crear pipeline'}
            </button>
            <button onClick={() => { setShowForm(false); setNewName(''); setNewDesc('') }}
              className="px-3 py-1.5 rounded-lg text-[12px] text-[#8A95A5] bg-[#1A2535] hover:bg-[#2A3A4A] transition-colors">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Pipeline list */}
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
        {pipelines.map((p) => (
          <div
            key={p.id}
            onClick={() => { if (editingId !== p.id) onSelect(p.id) }}
            className={`rounded-xl border transition-colors cursor-pointer ${
              selectedId === p.id
                ? 'border-[#FF6B35]/50 bg-[#FF6B35]/5'
                : 'border-[#2A3A4A] bg-[#131D28] hover:border-[#3A4A5A]'
            }`}
          >
            {editingId === p.id ? (
              <div className="p-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(p)}
                  className={inputCls}
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className={inputCls}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdit(p)}
                    className="flex-1 py-1.5 rounded-lg text-[12px] font-medium bg-[#FF6B35] text-white hover:bg-[#e85d2a] transition-colors">
                    Guardar
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-lg text-[12px] text-[#8A95A5] bg-[#1A2535] hover:bg-[#2A3A4A] transition-colors">
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-[#F0EDE8] flex-1 truncate">{p.name}</span>
                  {p.is_default && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF6B35]/15 text-[#FF6B35] font-semibold flex-shrink-0">
                      DEFAULT
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="text-[11px] text-[#8A95A5] truncate mb-1.5">{p.description}</p>
                )}
                <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                  {!p.is_default && (
                    <button onClick={() => handleSetDefault(p)}
                      className="text-[10px] text-[#8A95A5] hover:text-[#FF6B35] transition-colors px-1.5 py-0.5 rounded hover:bg-[#FF6B35]/10">
                      Set default
                    </button>
                  )}
                  <div className="flex-1" />
                  <button onClick={() => { setEditingId(p.id); setEditName(p.name); setEditDesc(p.description) }}
                    className="p-1 text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] rounded transition-colors">
                    <Pencil size={11} />
                  </button>
                  {pipelines.length > 1 && (
                    <button onClick={() => handleDelete(p)}
                      className="p-1 text-[#8A95A5] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Lead list view ──────────────────────────────────────────────────────────

const PAGE_SIZE = 25

type SortField = 'full_name' | 'lead_score' | 'estimated_value_gtq' | 'created_at' | 'stage_name'
type SortDir   = 'asc' | 'desc'

function LeadListView({
  leads,
  pipeline,
  onLeadClick,
}: {
  leads: Lead[]
  pipeline: Pipeline
  onLeadClick: (lead: Lead) => void
}) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir]     = useState<SortDir>('desc')
  const [page, setPage]           = useState(1)

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
    setPage(1)
  }

  const sorted = [...leads].sort((a, b) => {
    let va: any = a[sortField]
    let vb: any = b[sortField]
    if (sortField === 'estimated_value_gtq') { va = Number(va) || 0; vb = Number(vb) || 0 }
    if (sortField === 'lead_score')          { va = va ?? -1; vb = vb ?? -1 }
    if (typeof va === 'string') va = va.toLowerCase()
    if (typeof vb === 'string') vb = vb.toLowerCase()
    if (va < vb) return sortDir === 'asc' ? -1 : 1
    if (va > vb) return sortDir === 'asc' ?  1 : -1
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronDown size={11} className="text-[#4A5568]" />
    return sortDir === 'asc'
      ? <ChevronUp   size={11} className="text-[#FF6B35]" />
      : <ChevronDown size={11} className="text-[#FF6B35]" />
  }

  const thCls = 'text-left text-[10px] text-[#8A95A5] uppercase tracking-wide px-3 py-2.5 select-none'
  const thBtn = 'flex items-center gap-1 hover:text-[#F0EDE8] transition-colors cursor-pointer'

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead className="sticky top-0 bg-[#131D28] border-b border-[#2A3A4A] z-10">
            <tr>
              <th className={thCls} style={{ minWidth: 180 }}>
                <button className={thBtn} onClick={() => toggleSort('full_name')}>
                  Nombre <SortIcon field="full_name" />
                </button>
              </th>
              <th className={thCls} style={{ minWidth: 130 }}>
                <button className={thBtn} onClick={() => toggleSort('lead_score')}>
                  Calificación <SortIcon field="lead_score" />
                </button>
              </th>
              <th className={thCls} style={{ minWidth: 120 }}>
                <button className={thBtn} onClick={() => toggleSort('stage_name')}>
                  Etapa <SortIcon field="stage_name" />
                </button>
              </th>
              <th className={thCls} style={{ minWidth: 110 }}>Servicio</th>
              <th className={thCls} style={{ minWidth: 110 }}>
                <button className={thBtn} onClick={() => toggleSort('estimated_value_gtq')}>
                  Valor <SortIcon field="estimated_value_gtq" />
                </button>
              </th>
              <th className={thCls} style={{ minWidth: 100 }}>Fuente</th>
              <th className={thCls} style={{ minWidth: 100 }}>
                <button className={thBtn} onClick={() => toggleSort('created_at')}>
                  Registro <SortIcon field="created_at" />
                </button>
              </th>
              <th className={thCls} style={{ minWidth: 80 }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-[#8A95A5] text-[13px]">
                  Sin leads en este pipeline
                </td>
              </tr>
            )}
            {paginated.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onLeadClick(lead)}
                className="border-b border-[#2A3A4A]/60 hover:bg-[#1A2535] cursor-pointer transition-colors group"
              >
                {/* Nombre */}
                <td className="px-3 py-2.5">
                  <p className="text-[13px] font-medium text-[#F0EDE8] group-hover:text-[#FF6B35] transition-colors leading-snug">
                    {lead.full_name}
                  </p>
                  {lead.company && (
                    <p className="text-[11px] text-[#8A95A5] mt-0.5 truncate max-w-[160px]">{lead.company}</p>
                  )}
                </td>

                {/* Calificación */}
                <td className="px-3 py-2.5">
                  {lead.lead_tier ? (
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit"
                        style={{ color: TIER_CFG[lead.lead_tier].color, background: TIER_CFG[lead.lead_tier].bg }}
                      >
                        {TIER_CFG[lead.lead_tier].label}
                      </span>
                      {lead.lead_score !== null && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1 bg-[#2A3A4A] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.round((lead.lead_score / 25) * 100)}%`,
                                background: TIER_CFG[lead.lead_tier].bar,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-[#8A95A5]">{lead.lead_score}/25</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#4A5568]">—</span>
                  )}
                </td>

                {/* Etapa */}
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lead.stage_color }} />
                    <span className="text-[12px] text-[#F0EDE8]">{lead.stage_name}</span>
                  </span>
                </td>

                {/* Servicio */}
                <td className="px-3 py-2.5">
                  <span className="text-[12px] text-[#8A95A5]">{SERVICE_LABEL[lead.service_type]}</span>
                </td>

                {/* Valor */}
                <td className="px-3 py-2.5">
                  <span className="text-[12px] font-medium text-[#4A9E6B]">
                    {fmtGtq(lead.estimated_value_gtq) ?? '—'}
                  </span>
                </td>

                {/* Fuente */}
                <td className="px-3 py-2.5">
                  <SourceBadge source={lead.source} />
                </td>

                {/* Registro */}
                <td className="px-3 py-2.5">
                  <span className="text-[11px] text-[#8A95A5]">{fmtDate(lead.created_at)}</span>
                </td>

                {/* Estado */}
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[lead.status]}`}>
                    {STATUS_LABEL[lead.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-[#2A3A4A] flex-shrink-0">
          <span className="text-[11px] text-[#8A95A5]">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} de {sorted.length} leads
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-lg text-[12px] text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ‹ Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | '…')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('…')
                acc.push(n)
                return acc
              }, [])
              .map((n, i) =>
                n === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-[#8A95A5] text-[12px]">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
                      page === n
                        ? 'bg-[#FF6B35] text-white'
                        : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A]'
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-lg text-[12px] text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const searchParams = useSearchParams()

  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [view, setView]                 = useState<'kanban' | 'list' | 'config'>(
    searchParams.get('config') === '1' ? 'config' : 'kanban'
  )
  const [pipelines, setPipelines]       = useState<Pipeline[]>([])
  const [activePipelineId, setActivePipelineId]   = useState<number | null>(null)
  const [configPipelineId, setConfigPipelineId]   = useState<number | null>(null)
  const [leads, setLeads]               = useState<Lead[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [search, setSearch]             = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showNewLead, setShowNewLead]   = useState(false)
  const [draggedLead, setDraggedLead]   = useState<Lead | null>(null)

  const activePipeline = pipelines.find(p => p.id === activePipelineId) ?? null
  const configPipeline = pipelines.find(p => p.id === (configPipelineId ?? activePipelineId)) ?? pipelines[0] ?? null

  // Load pipelines + leads
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [ps, ls] = await Promise.all([getPipelines(), getLeads()])
      setPipelines(ps)
      setLeads(ls)
      if (!activePipelineId && ps.length > 0) {
        const def = ps.find(p => p.is_default) ?? ps[0]
        setActivePipelineId(def.id)
      }
    } catch {
      setError('No se pudo cargar el CRM.')
    } finally {
      setLoading(false)
    }
  }, [activePipelineId])

  useEffect(() => { load() }, [])

  // Drag and drop
  function handleDragStart(e: React.DragEvent, lead: Lead) {
    setDraggedLead(lead)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  async function handleDrop(e: React.DragEvent, stageId: number) {
    e.preventDefault()
    if (!draggedLead || draggedLead.stage === stageId) { setDraggedLead(null); return }
    const prev = leads
    // Optimistic
    setLeads(ls => ls.map(l => l.id === draggedLead.id ? { ...l, stage: stageId } : l))
    setDraggedLead(null)
    try {
      const updated = await moveLead(draggedLead.id, stageId)
      setLeads(ls => ls.map(l => l.id === updated.id ? updated : l))
    } catch {
      setLeads(prev)
      setError('No se pudo mover el lead.')
    }
  }

  // Filtered leads for active pipeline
  const pipelineLeads = leads.filter(l => {
    if (l.pipeline !== activePipelineId) return false
    if (search && !l.full_name.toLowerCase().includes(search.toLowerCase()) &&
        !l.company.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const leadsPerStage = (stageId: number) => pipelineLeads.filter(l => l.stage === stageId)

  return (
    <div className="flex h-screen bg-[#131D28] overflow-hidden">
      <ERPSidebar
        currentPage={view === 'config' ? 'crm_config' : 'crm'}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-[#2A3A4A] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A]"
          >
            <Menu size={18} />
          </button>

          <h1 className="text-[15px] font-semibold text-[#F0EDE8] flex items-center gap-2">
            <Users size={16} className="text-[#FF6B35]" />
            CRM
          </h1>

          <div className="flex-1" />

          {/* Pipeline selector */}
          {pipelines.length > 1 && (
            <select
              value={activePipelineId ?? ''}
              onChange={(e) => setActivePipelineId(Number(e.target.value))}
              className="text-[12px] bg-[#1A2535] text-[#F0EDE8] border border-[#2A3A4A] rounded-lg px-2 py-1 focus:outline-none"
            >
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}

          {(view === 'kanban' || view === 'list') && (
            <button
              onClick={() => setShowNewLead(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-white text-[12px] font-medium rounded-lg hover:bg-[#e85d2a] transition-colors"
            >
              <Plus size={14} />
              Nuevo lead
            </button>
          )}

          <ERPAvatar initials="?" />
        </header>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-[12px] bg-red-500/10 px-6 py-2.5 border-b border-red-500/20">
            <AlertCircle size={12} />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-[#8A95A5] hover:text-red-400"><X size={12} /></button>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-[#FF6B35]" />
          </div>
        ) : !activePipeline ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
            <Users size={40} className="text-[#8A95A5]" />
            <p className="text-[#8A95A5] text-[14px]">No hay pipelines configurados</p>
          </div>
        ) : view === 'config' ? (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left: pipelines list */}
            <div className="w-64 flex-shrink-0 border-r border-[#2A3A4A] p-4 flex flex-col min-h-0">
              <PipelinesPanel
                pipelines={pipelines}
                selectedId={configPipelineId ?? activePipelineId}
                onSelect={(id) => setConfigPipelineId(id)}
                onPipelinesChange={(updated) => {
                  setPipelines(updated)
                  // keep activePipelineId valid
                  if (updated.length > 0 && !updated.find(p => p.id === activePipelineId)) {
                    setActivePipelineId(updated[0].id)
                  }
                }}
              />
            </div>
            {/* Right: stages for selected pipeline */}
            <div className="flex-1 overflow-y-auto p-6">
              {configPipeline ? (
                <StagesPanel
                  pipeline={configPipeline}
                  onPipelineUpdate={(updated) => {
                    setPipelines(ps => ps.map(p => p.id === updated.id ? updated : p))
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#8A95A5] text-[13px]">
                  Selecciona un pipeline
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Search + view toggle bar */}
            <div className="px-4 md:px-6 py-3 border-b border-[#2A3A4A] flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar leads…"
                  className="w-full bg-[#1A2535] text-[#F0EDE8] text-[12px] rounded-lg pl-8 pr-3 py-1.5 border border-[#2A3A4A] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/40 placeholder-[#4A5568]"
                />
              </div>
              <span className="text-[11px] text-[#8A95A5]">{pipelineLeads.length} leads</span>

              <div className="flex-1" />

              {/* View toggle */}
              <div className="flex items-center bg-[#1A2535] rounded-lg p-0.5 border border-[#2A3A4A]">
                <button
                  onClick={() => setView('kanban')}
                  className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-[#2A3A4A] text-[#F0EDE8]' : 'text-[#8A95A5] hover:text-[#F0EDE8]'}`}
                  title="Kanban"
                >
                  <Kanban size={14} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-[#2A3A4A] text-[#F0EDE8]' : 'text-[#8A95A5] hover:text-[#F0EDE8]'}`}
                  title="Lista"
                >
                  <List size={14} />
                </button>
              </div>

              <button
                onClick={load}
                className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] transition-colors"
                title="Recargar"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {view === 'list' ? (
              <LeadListView
                leads={pipelineLeads}
                pipeline={activePipeline}
                onLeadClick={(lead) => setSelectedLead(lead)}
              />
            ) : (
              /* Kanban board */
              <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
                <div className="flex gap-3 h-full px-4 md:px-6 py-4 min-w-max">
                  {activePipeline.stages.map((stage) => (
                    <KanbanColumn
                      key={stage.id}
                      stage={stage}
                      leads={leadsPerStage(stage.id)}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onLeadClick={(lead) => setSelectedLead(lead)}
                    />
                  ))}

                  {activePipeline.stages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                      <Settings2 size={32} className="text-[#8A95A5]" />
                      <p className="text-[#8A95A5] text-[14px]">No hay etapas configuradas</p>
                      <button
                        onClick={() => setView('config')}
                        className="text-[12px] text-[#FF6B35] hover:underline"
                      >
                        Configurar pipeline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedLead && activePipeline && (
        <LeadModal
          lead={selectedLead}
          pipeline={activePipeline}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updated) => {
            setLeads(ls => ls.map(l => l.id === updated.id ? updated : l))
            setSelectedLead(updated)
          }}
          onDelete={(id) => setLeads(ls => ls.filter(l => l.id !== id))}
        />
      )}

      {showNewLead && activePipeline && (
        <NewLeadModal
          pipeline={activePipeline}
          onClose={() => setShowNewLead(false)}
          onCreate={(lead) => setLeads(ls => [lead, ...ls])}
        />
      )}
    </div>
  )
}
