'use client'

import { useState } from 'react'
import {
  Plus, Loader2, AlertCircle, X, Pencil, Trash2,
  Send, ShieldCheck, CheckCircle2, Clock, LayoutGrid, List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createChangeOrder, updateChangeOrder, deleteChangeOrder,
  submitChangeOrder, approveChangeOrder,
  type ChangeOrder, type ChangeOrderStatusValue, type Phase,
} from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtGtq(val: string | number) {
  return `Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 0 })}`
}

const STATUS_LABEL: Record<ChangeOrderStatusValue, string> = {
  draft:     'Borrador',
  submitted: 'Enviada',
  in_review: 'En revisión',
  approved:  'Aprobada',
  rejected:  'Rechazada',
  withdrawn: 'Retirada',
}
const STATUS_COLOR: Record<ChangeOrderStatusValue, string> = {
  draft:     '#8A95A5',
  submitted: '#F59E0B',
  in_review: '#6B8CFF',
  approved:  '#4A9E6B',
  rejected:  '#f87171',
  withdrawn: '#4A5568',
}
const REASON_LABEL: Record<string, string> = {
  scope_change:         'Cambio de alcance',
  owner_request:        'Solicitud del cliente',
  unforeseen_condition: 'Condición imprevista',
  design_error:         'Error de diseño',
  other:                'Otro',
}

function StatusChip({ status }: { status: ChangeOrderStatusValue }) {
  const color = STATUS_COLOR[status] ?? '#8A95A5'
  return (
    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${color}20`, color }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconBtn({
  icon: Icon, label, onClick, variant = 'edit', size = 13,
}: {
  icon: React.ElementType
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'edit' | 'delete' | 'action'
  size?: number
}) {
  const colors = {
    edit:   'text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10',
    delete: 'text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10',
    action: 'text-[#8A95A5] hover:text-[#F59E0B] hover:bg-[#F59E0B]/10',
  }
  const rotate = { edit: 'hover:-rotate-12', delete: 'hover:rotate-12', action: '' }
  return (
    <button title={label} onClick={onClick}
      className={cn('p-1.5 rounded-lg transition-all duration-200', colors[variant])}>
      <Icon size={size} className={cn('transition-all duration-200', rotate[variant])} />
    </button>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditCOModal({
  co, phases, projectId, onSave, onClose,
}: {
  co: ChangeOrder
  phases: Phase[]
  projectId: number
  onSave: (updated: ChangeOrder) => void
  onClose: () => void
}) {
  const [title,       setTitle]       = useState(co.title)
  const [description, setDescription] = useState(co.description)
  const [reason,      setReason]      = useState(co.reason)
  const [amount,      setAmount]      = useState(String(co.amount_gtq))
  const [days,        setDays]        = useState(String(co.schedule_days_impact))
  const [phase,       setPhase]       = useState(co.phase ? String(co.phase) : '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true); setError('')
    try {
      const updated = await updateChangeOrder(projectId, co.id, {
        title: title.trim(), description: description.trim(), reason,
        amount_gtq: amount || '0',
        schedule_days_impact: Number(days) || 0,
        phase: phase ? Number(phase) : null,
      })
      onSave(updated)
    } catch (err: unknown) { setError((err as Error).message ?? 'Error'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#27384A] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>Editar OC</p>
            <h2 className="text-base font-semibold text-[#F0EDE8] truncate max-w-[360px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{co.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] p-1 rounded-lg hover:bg-[#27384A] transition-colors"><X size={17} /></button>
        </div>
        <form id="edit-co-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={13} className="flex-shrink-0" />{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
              <input required autoFocus value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Razón</label>
              <select value={reason} onChange={e => setReason(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                {Object.entries(REASON_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Fase</label>
              <select value={phase} onChange={e => setPhase(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                <option value="">Sin fase</option>
                {phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={cn(inputCls, 'resize-none')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Monto GTQ</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Impacto en plazo (días)</label>
              <input type="number" value={days} onChange={e => setDays(e.target.value)} className={inputCls} placeholder="0" />
            </div>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button form="edit-co-form" type="submit" disabled={saving}
            className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Approve modal ────────────────────────────────────────────────────────────

function ApproveCOModal({
  co, projectId, onSave, onClose,
}: {
  co: ChangeOrder
  projectId: number
  onSave: (updated: ChangeOrder) => void
  onClose: () => void
}) {
  const [notes,  setNotes]  = useState('')
  const [saving, setSaving] = useState(false)

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'

  async function handle() {
    setSaving(true)
    try {
      const updated = await approveChangeOrder(projectId, co.id, notes)
      onSave(updated)
    } catch { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-[#27384A] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#4A9E6B] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>Firmar como constructora</p>
            <h2 className="text-sm font-semibold text-[#F0EDE8] truncate max-w-[320px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{co.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] p-1 rounded-lg hover:bg-[#27384A] transition-colors"><X size={17} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="p-3 rounded-lg bg-[#131D28] border border-[#27384A] text-xs space-y-1">
            <div className="flex gap-4">
              <span className="text-[#8A95A5]">Monto:</span>
              <span className="font-semibold" style={{ fontFamily: 'Space Mono, monospace', color: Number(co.amount_gtq) >= 0 ? '#F59E0B' : '#4A9E6B' }}>
                {Number(co.amount_gtq) >= 0 ? '+' : ''}{fmtGtq(co.amount_gtq)}
              </span>
            </div>
            <div className="flex gap-4">
              <span className="text-[#8A95A5]">Plazo:</span>
              <span className="text-[#F0EDE8]">{co.schedule_days_impact > 0 ? '+' : ''}{co.schedule_days_impact} días</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Notas de aprobación (opcional)</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              className={cn(inputCls, 'resize-none')} placeholder="Comentarios de la constructora…" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button onClick={handle} disabled={saving}
            className="px-5 py-2 bg-[#4A9E6B] text-white text-xs font-semibold rounded-lg hover:bg-[#5DB87D] disabled:opacity-60 transition-colors flex items-center gap-1.5">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Firmando…</> : <><ShieldCheck size={12} /> Firmar y aprobar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ChangeOrdersTab({
  projectId, changeOrders, phases, onChangeOrdersChange,
}: {
  projectId: number
  changeOrders: ChangeOrder[]
  phases: Phase[]
  onChangeOrdersChange: (cos: ChangeOrder[]) => void
}) {
  const [viewMode,   setViewMode]   = useState<'cards' | 'list'>('cards')
  const [editingCO,  setEditingCO]  = useState<ChangeOrder | null>(null)
  const [approveCO,  setApproveCO]  = useState<ChangeOrder | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showForm,   setShowForm]   = useState(false)
  const [coTitle,    setCoTitle]    = useState('')
  const [coDesc,     setCoDesc]     = useState('')
  const [coReason,   setCoReason]   = useState('scope_change')
  const [coAmount,   setCoAmount]   = useState('')
  const [coDays,     setCoDays]     = useState('0')
  const [coPhase,    setCoPhase]    = useState('')
  const [saving,     setSaving]     = useState(false)
  const [formError,  setFormError]  = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!coTitle.trim() || !coDesc.trim()) return
    setSaving(true); setFormError('')
    try {
      const newCO = await createChangeOrder(projectId, {
        title: coTitle, description: coDesc, reason: coReason,
        amount_gtq: coAmount || '0',
        schedule_days_impact: Number(coDays) || 0,
        phase: coPhase ? Number(coPhase) : null,
      })
      onChangeOrdersChange([newCO, ...changeOrders])
      setCoTitle(''); setCoDesc(''); setCoReason('scope_change'); setCoAmount(''); setCoDays('0'); setCoPhase('')
      setShowForm(false)
    } catch (err: unknown) { setFormError((err as Error).message ?? 'Error') }
    finally { setSaving(false) }
  }

  async function handleSubmitCO(coId: number) {
    try {
      const updated = await submitChangeOrder(projectId, coId)
      onChangeOrdersChange(changeOrders.map(c => c.id === updated.id ? updated : c))
    } catch {}
  }

  async function handleDelete(id: number) {
    try {
      await deleteChangeOrder(projectId, id)
      onChangeOrdersChange(changeOrders.filter(c => c.id !== id))
    } catch {}
    setDeletingId(null)
  }

  function handleEditSave(updated: ChangeOrder) {
    onChangeOrdersChange(changeOrders.map(c => c.id === updated.id ? updated : c))
    setEditingCO(null)
  }

  function handleApproveSave(updated: ChangeOrder) {
    onChangeOrdersChange(changeOrders.map(c => c.id === updated.id ? updated : c))
    setApproveCO(null)
  }

  const canEdit   = (co: ChangeOrder) => co.status !== 'approved'
  const canSubmit = (co: ChangeOrder) => co.status === 'draft'
  const canSign   = (co: ChangeOrder) => (co.status === 'submitted' || co.status === 'in_review') && !co.approval?.company_approved_at
  const canDelete = (_co: ChangeOrder) => true

  return (
    <>
      {editingCO && <EditCOModal co={editingCO} phases={phases} projectId={projectId} onSave={handleEditSave} onClose={() => setEditingCO(null)} />}
      {approveCO && <ApproveCOModal co={approveCO} projectId={projectId} onSave={handleApproveSave} onClose={() => setApproveCO(null)} />}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Órdenes de cambio</h2>
            <p className="text-xs text-[#8A95A5] mt-0.5">
              {changeOrders.length} orden{changeOrders.length !== 1 ? 'es' : ''} ·{' '}
              Q {changeOrders.filter(c => c.status === 'approved').reduce((s, c) => s + Number(c.amount_gtq), 0).toLocaleString('es-GT')} aprobado
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 p-0.5 bg-[#131D28] border border-[#27384A] rounded-lg">
              <button onClick={() => setViewMode('list')}
                className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')} title="Vista lista">
                <List size={13} />
              </button>
              <button onClick={() => setViewMode('cards')}
                className={cn('p-1.5 rounded-md transition-colors', viewMode === 'cards' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')} title="Vista tarjetas">
                <LayoutGrid size={13} />
              </button>
            </div>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
              {showForm ? <X size={13} /> : <Plus size={13} />}
              {showForm ? 'Cancelar' : 'Nueva OC'}
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
            {formError && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={13} className="flex-shrink-0" />{formError}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
                <input required autoFocus value={coTitle} onChange={e => setCoTitle(e.target.value)} className={inputCls} placeholder="Resumen breve de la orden…" />
              </div>
              <div>
                <label className={labelCls}>Razón</label>
                <select value={coReason} onChange={e => setCoReason(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                  {Object.entries(REASON_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Descripción <span className="text-[#FF6B35]">*</span></label>
              <textarea required rows={3} value={coDesc} onChange={e => setCoDesc(e.target.value)}
                className={cn(inputCls, 'resize-none')} placeholder="Detalle los cambios y justificación…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Monto GTQ</label>
                <input type="number" step="0.01" value={coAmount} onChange={e => setCoAmount(e.target.value)} className={inputCls} placeholder="0.00" />
              </div>
              <div>
                <label className={labelCls}>Impacto en plazo (días)</label>
                <input type="number" value={coDays} onChange={e => setCoDays(e.target.value)} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className={labelCls}>Fase vinculada</label>
                <select value={coPhase} onChange={e => setCoPhase(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                  <option value="">Sin fase</option>
                  {phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
                {saving ? <><Loader2 size={12} className="animate-spin" /> Creando…</> : <><Plus size={12} /> Crear OC</>}
              </button>
            </div>
          </form>
        )}

        {changeOrders.length === 0 && !showForm && (
          <p className="text-sm text-[#8A95A5] py-10 text-center">Sin órdenes de cambio registradas.</p>
        )}

        {/* Cards view */}
        {viewMode === 'cards' && changeOrders.length > 0 && (
          <div className="space-y-3">
            {changeOrders.map(co => (
              <div key={co.id} className={cn(
                'rounded-xl border bg-[#1F2D3A] group',
                canSign(co) ? 'border-[#FF6B35]/40' : 'border-[#27384A]',
              )}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>OC-{String(co.number).padStart(3, '0')}</span>
                      <StatusChip status={co.status} />
                    </div>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <span className="text-[10px] text-[#8A95A5] mr-2" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(co.created_at)}</span>
                      {canEdit(co) && <IconBtn icon={Pencil} label="Editar" variant="edit" onClick={e => { e.stopPropagation(); setEditingCO(co) }} />}
                      {canSign(co) && <IconBtn icon={ShieldCheck} label="Firmar" variant="action" onClick={e => { e.stopPropagation(); setApproveCO(co) }} />}
                      {deletingId === co.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <span className="text-[9px] text-[#8A95A5]">¿Eliminar?</span>
                          <button onClick={() => setDeletingId(null)} className="text-[9px] px-1.5 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                          <button onClick={() => handleDelete(co.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                        </div>
                      ) : (
                        <IconBtn icon={Trash2} label="Eliminar" variant="delete" onClick={e => { e.stopPropagation(); setDeletingId(co.id) }} />
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-[#F0EDE8] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{co.title}</h3>
                  <p className="text-xs text-[#8A95A5] leading-relaxed mb-3">{co.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs mb-3">
                    <span className="text-[#8A95A5]">Razón: <span className="text-[#F0EDE8]">{REASON_LABEL[co.reason] ?? co.reason}</span></span>
                    <span className={Number(co.amount_gtq) >= 0 ? 'text-amber-400' : 'text-[#4A9E6B]'} style={{ fontFamily: 'Space Mono, monospace' }}>
                      {Number(co.amount_gtq) >= 0 ? '+' : ''}Q {Number(co.amount_gtq).toLocaleString('es-GT')}
                    </span>
                    <span className="text-[#8A95A5]">Plazo: <span className="text-[#F0EDE8]">{co.schedule_days_impact > 0 ? '+' : ''}{co.schedule_days_impact} días</span></span>
                  </div>

                  {canSubmit(co) && (
                    <button onClick={() => handleSubmitCO(co.id)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/30 text-xs text-amber-400 rounded-lg hover:bg-amber-500/5 transition-all duration-200 hover:border-amber-500/60">
                      <Send size={11} className="transition-all duration-200 group-hover:translate-x-0.5" /> Enviar para aprobación
                    </button>
                  )}
                  {canSign(co) && (
                    <button onClick={() => setApproveCO(co)}
                      className="flex items-center gap-2 px-3 py-1.5 border border-[#4A9E6B]/30 text-xs text-[#4A9E6B] rounded-lg hover:bg-[#4A9E6B]/5 transition-all duration-200 hover:border-[#4A9E6B]/60">
                      <ShieldCheck size={11} className="transition-all duration-200" /> Firmar como constructora
                    </button>
                  )}
                </div>

                {/* Approval footer */}
                {(co.approval || co.status !== 'draft') && (
                  <div className="border-t border-[#27384A] px-5 py-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2 text-xs">
                        {co.approval?.company_approved_at
                          ? <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                          : <Clock size={12} className="text-[#8A95A5]" />}
                        <span className={co.approval?.company_approved_at ? 'text-[#4A9E6B]' : 'text-[#8A95A5]'}>
                          Constructora: {co.approval?.company_approved_at
                            ? `${co.approval.company_approved_by_name ?? 'Firmado'} · ${fmtDate(co.approval.company_approved_at)}`
                            : 'Pendiente'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {co.approval?.client_approved_at
                          ? <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                          : <Clock size={12} className="text-[#8A95A5]" />}
                        <span className={co.approval?.client_approved_at ? 'text-[#4A9E6B]' : 'text-[#8A95A5]'}>
                          Cliente: {co.approval?.client_approved_at ? `Firmado · ${fmtDate(co.approval.client_approved_at)}` : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                    {co.approval?.client_notes && (
                      <div className="flex items-start gap-2 pt-1">
                        <span className="text-[10px] text-[#8A95A5] flex-shrink-0 mt-0.5">Nota del cliente:</span>
                        <p className="text-[10px] text-[#8A95A5] italic leading-relaxed">"{co.approval.client_notes}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && changeOrders.length > 0 && (
          <div className="rounded-xl border border-[#27384A] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2 bg-[#131D28] border-b border-[#27384A]">
              <span className="w-[72px] text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider flex-shrink-0">#</span>
              <span className="flex-1 text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider">Título</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden sm:block w-24 text-right">Monto</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden md:block w-24 text-center">Estado</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden lg:block w-24 text-center">Fecha</span>
              <span className="w-24 flex-shrink-0" />
            </div>

            {changeOrders.map((co, i) => (
              <div key={co.id} className={cn(
                'flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors group',
                i > 0 && 'border-t border-[#27384A]',
                canSign(co) && 'border-l-2 border-l-[#FF6B35]',
              )}>
                <span className="text-[10px] text-[#FF6B35] flex-shrink-0 w-[72px]" style={{ fontFamily: 'Space Mono, monospace' }}>
                  OC-{String(co.number).padStart(3, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F0EDE8] font-medium truncate">{co.title}</p>
                  {co.approval?.client_notes && (
                    <p className="text-[10px] text-[#8A95A5] italic truncate mt-0.5">
                      Cliente: "{co.approval.client_notes}"
                    </p>
                  )}
                </div>
                <span className={cn('text-xs hidden sm:block w-24 text-right flex-shrink-0', Number(co.amount_gtq) >= 0 ? 'text-amber-400' : 'text-[#4A9E6B]')}
                  style={{ fontFamily: 'Space Mono, monospace' }}>
                  {Number(co.amount_gtq) >= 0 ? '+' : ''}Q {Number(co.amount_gtq).toLocaleString('es-GT')}
                </span>
                <div className="hidden md:block w-24 text-center flex-shrink-0">
                  <StatusChip status={co.status} />
                </div>
                <span className="text-[9px] text-[#8A95A5] hidden lg:block w-24 text-center flex-shrink-0">
                  {fmtDate(co.created_at)}
                </span>
                <div className="flex items-center gap-0.5 flex-shrink-0 w-24 justify-end">
                  {canSubmit(co) && (
                    <IconBtn icon={Send} label="Enviar" variant="action" size={12} onClick={e => { e.stopPropagation(); handleSubmitCO(co.id) }} />
                  )}
                  {canSign(co) && (
                    <IconBtn icon={ShieldCheck} label="Firmar" variant="action" size={12} onClick={e => { e.stopPropagation(); setApproveCO(co) }} />
                  )}
                  {canEdit(co) && (
                    <IconBtn icon={Pencil} label="Editar" variant="edit" size={12} onClick={e => { e.stopPropagation(); setEditingCO(co) }} />
                  )}
                  {deletingId === co.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDeletingId(null)} className="text-[9px] px-1 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                      <button onClick={() => handleDelete(co.id)} className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                    </div>
                  ) : (
                    <IconBtn icon={Trash2} label="Eliminar" variant="delete" size={12} onClick={e => { e.stopPropagation(); setDeletingId(co.id) }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
