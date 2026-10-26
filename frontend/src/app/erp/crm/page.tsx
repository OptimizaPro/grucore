'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, X, Menu, Loader2, AlertCircle, ChevronDown,
  GripVertical, Pencil, Trash2, Check, Phone, Mail,
  MessageSquare, CalendarDays, ArrowRightLeft, Trophy,
  Search, SlidersHorizontal, Users, Kanban, Settings2,
  Instagram, Linkedin, Youtube, Globe, RefreshCw,
} from 'lucide-react'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getPipelines, createPipeline, updatePipeline, deletePipeline,
  createStage, updateStage, deleteStage, reorderStages,
  getLeads, createLead, updateLead, deleteLead, moveLead,
  createLeadActivity,
  type Pipeline, type PipelineStage, type Lead, type LeadActivity,
  type LeadSourceValue, type ServiceTypeValue, type LeadStatusValue, type ActivityTypeValue,
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
  construction: 'Construcción',
  renovation:   'Remodelación',
  commercial:   'Comercial',
  residential:  'Residencial',
  other:        'Otro',
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
      className={`flex flex-col min-w-[240px] max-w-[280px] flex-shrink-0 rounded-xl border transition-colors ${
        isDragOver ? 'border-[#FF6B35]/60 bg-[#FF6B35]/5' : 'border-[#2A3A4A] bg-[#1A2535]'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); onDragOver(e) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, stage.id) }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: stage.color }}
        />
        <span className="text-[13px] font-medium text-[#F0EDE8] flex-1 truncate">{stage.name}</span>
        <span className="text-[11px] text-[#8A95A5] font-mono">{leads.length}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 px-3 pb-3 flex-1 min-h-[80px]">
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

  async function handleDelete() {
    if (!confirm(`¿Eliminar el lead "${lead.full_name}"?`)) return
    try {
      await deleteLead(lead.id)
      onDelete(lead.id)
      onClose()
    } catch {
      setError('No se pudo eliminar el lead.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A2535] border border-[#2A3A4A] rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
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

        <div className="overflow-y-auto flex-1 p-5">
          {tab === 'info' ? (
            <div className="space-y-4">
              {/* Status */}
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

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                {lead.email && (
                  <div>
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-[12px] text-[#F0EDE8] hover:text-[#FF6B35] transition-colors truncate block">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div>
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1">Teléfono</p>
                    <a href={`tel:${lead.phone}`} className="text-[12px] text-[#F0EDE8] hover:text-[#FF6B35] transition-colors">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.city && (
                  <div>
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1">Ciudad</p>
                    <p className="text-[12px] text-[#F0EDE8]">{lead.city}</p>
                  </div>
                )}
                {lead.estimated_value_gtq && (
                  <div>
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1">Valor estimado</p>
                    <p className="text-[12px] text-[#4A9E6B] font-medium">{fmtGtq(lead.estimated_value_gtq)}</p>
                  </div>
                )}
              </div>

              {/* Source + Service */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1">Fuente</p>
                  <SourceBadge source={lead.source} />
                </div>
                <div>
                  <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1">Servicio</p>
                  <span className="text-[12px] text-[#F0EDE8]">{SERVICE_LABEL[lead.service_type]}</span>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide mb-1">Notas</p>
                  <p className="text-[12px] text-[#8A95A5] leading-relaxed">{lead.notes}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-[#8A95A5]">Registrado {fmtDate(lead.created_at)}</p>
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

// ─── Pipeline Config tab ──────────────────────────────────────────────────────

function PipelineConfig({
  pipeline,
  onPipelineUpdate,
}: {
  pipeline: Pipeline
  onPipelineUpdate: (p: Pipeline) => void
}) {
  const [stages, setStages]           = useState<PipelineStage[]>(pipeline.stages)
  const [editingId, setEditingId]     = useState<number | null>(null)
  const [editName, setEditName]       = useState('')
  const [editColor, setEditColor]     = useState('')
  const [newName, setNewName]         = useState('')
  const [newColor, setNewColor]       = useState('#8A95A5')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const dragItem                      = useRef<number | null>(null)
  const dragOver                      = useRef<number | null>(null)

  async function handleAddStage() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const stage = await createStage(pipeline.id, {
        name: newName.trim(),
        color: newColor,
        order: stages.length + 1,
      })
      const updated = [...stages, stage]
      setStages(updated)
      onPipelineUpdate({ ...pipeline, stages: updated })
      setNewName('')
      setNewColor('#8A95A5')
    } catch {
      setError('No se pudo crear la etapa.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit(stage: PipelineStage) {
    try {
      const updated = await updateStage(pipeline.id, stage.id, { name: editName, color: editColor })
      const next = stages.map(s => s.id === updated.id ? updated : s)
      setStages(next)
      onPipelineUpdate({ ...pipeline, stages: next })
      setEditingId(null)
    } catch {
      setError('No se pudo actualizar la etapa.')
    }
  }

  async function handleDelete(stageId: number) {
    if (!confirm('¿Eliminar esta etapa? Los leads asignados quedarán sin etapa.')) return
    try {
      await deleteStage(pipeline.id, stageId)
      const next = stages.filter(s => s.id !== stageId)
      setStages(next)
      onPipelineUpdate({ ...pipeline, stages: next })
    } catch {
      setError('No se pudo eliminar la etapa.')
    }
  }

  function handleDragStart(index: number) {
    dragItem.current = index
  }

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
    } catch {
      setError('No se pudo reordenar las etapas.')
    }
    dragItem.current = null
    dragOver.current = null
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-[15px] font-semibold text-[#F0EDE8] mb-1">{pipeline.name}</h2>
        {pipeline.description && <p className="text-[12px] text-[#8A95A5]">{pipeline.description}</p>}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-[12px] bg-red-500/10 rounded-lg px-3 py-2">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      {/* Stage list */}
      <div className="space-y-2">
        <p className="text-[11px] text-[#8A95A5] uppercase tracking-wide">Etapas ({stages.length})</p>

        {stages.map((stage, index) => (
          <div
            key={stage.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-3 bg-[#1A2535] border border-[#2A3A4A] rounded-xl px-4 py-3
                       cursor-grab active:cursor-grabbing hover:border-[#3A4A5A] transition-colors"
          >
            <GripVertical size={14} className="text-[#8A95A5] flex-shrink-0" />
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />

            {editingId === stage.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(stage)}
                  className="flex-1 bg-[#131D28] text-[#F0EDE8] text-[13px] rounded-lg px-2 py-1 border border-[#FF6B35]/40 focus:outline-none"
                />
                <div className="flex gap-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setEditColor(c)}
                      className={`w-4 h-4 rounded-full flex-shrink-0 transition-transform ${editColor === c ? 'scale-125 ring-1 ring-white/40' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={() => handleSaveEdit(stage)} className="p-1 text-[#4A9E6B] hover:text-[#5BBF7F]">
                  <Check size={14} />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1 text-[#8A95A5] hover:text-[#8A95A5]">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-[13px] text-[#F0EDE8]">{stage.name}</span>
                <span className="text-[11px] text-[#8A95A5]">{stage.leads_count} leads</span>
                {stage.is_won && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4A9E6B]/20 text-[#4A9E6B]">Won</span>}
                {stage.is_lost && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Lost</span>}
                <button
                  onClick={() => { setEditingId(stage.id); setEditName(stage.name); setEditColor(stage.color) }}
                  className="p-1.5 text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] rounded-lg transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(stage.id)}
                  className="p-1.5 text-[#8A95A5] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </>
            )}
          </div>
        ))}

        {stages.length === 0 && (
          <div className="text-center py-8 text-[#8A95A5] text-[13px]">
            No hay etapas. Crea la primera abajo.
          </div>
        )}
      </div>

      {/* Add stage */}
      <div className="bg-[#1A2535] border border-[#2A3A4A] rounded-xl p-4 space-y-3">
        <p className="text-[12px] font-medium text-[#F0EDE8]">Agregar etapa</p>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
            placeholder="Nombre de la etapa"
            className="flex-1 bg-[#131D28] text-[#F0EDE8] text-[13px] rounded-lg px-3 py-2 border border-[#2A3A4A] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50 placeholder-[#4A5568]"
          />
          <button
            onClick={handleAddStage}
            disabled={!newName.trim() || saving}
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-[#FF6B35] text-white hover:bg-[#e85d2a] disabled:opacity-40 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-1 ring-white/40' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CRMPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView]               = useState<'kanban' | 'config'>('kanban')
  const [pipelines, setPipelines]     = useState<Pipeline[]>([])
  const [activePipelineId, setActivePipelineId] = useState<number | null>(null)
  const [leads, setLeads]             = useState<Lead[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showNewLead, setShowNewLead]   = useState(false)
  const [draggedLead, setDraggedLead]   = useState<Lead | null>(null)

  const activePipeline = pipelines.find(p => p.id === activePipelineId) ?? null

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
        currentPage="crm"
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

          {/* View toggle */}
          <div className="flex items-center bg-[#1A2535] rounded-lg p-0.5 border border-[#2A3A4A]">
            <button
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md transition-colors ${view === 'kanban' ? 'bg-[#2A3A4A] text-[#F0EDE8]' : 'text-[#8A95A5] hover:text-[#8A95A5]'}`}
              title="Kanban"
            >
              <Kanban size={14} />
            </button>
            <button
              onClick={() => setView('config')}
              className={`p-1.5 rounded-md transition-colors ${view === 'config' ? 'bg-[#2A3A4A] text-[#F0EDE8]' : 'text-[#8A95A5] hover:text-[#8A95A5]'}`}
              title="Configurar pipeline"
            >
              <Settings2 size={14} />
            </button>
          </div>

          {view === 'kanban' && (
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
          <div className="flex-1 overflow-y-auto p-6">
            <PipelineConfig
              pipeline={activePipeline}
              onPipelineUpdate={(updated) => {
                setPipelines(ps => ps.map(p => p.id === updated.id ? updated : p))
              }}
            />
          </div>
        ) : (
          <>
            {/* Search bar */}
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
              <button
                onClick={load}
                className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#2A3A4A] transition-colors"
                title="Recargar"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Kanban board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
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
