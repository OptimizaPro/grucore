'use client'

import { useState } from 'react'
import {
  Plus, Loader2, AlertCircle, X, Pencil, Trash2,
  MessageSquare, Calendar, LayoutGrid, List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createRFI, updateRFI, deleteRFI, answerRFI,
  type RFI, type RFIStatusValue, type RFIPriorityValue,
} from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_LABEL: Record<RFIStatusValue, string> = {
  open:      'Abierta',
  in_review: 'En revisión',
  answered:  'Respondida',
  closed:    'Cerrada',
}
const STATUS_COLOR: Record<RFIStatusValue, string> = {
  open:      '#FF6B35',
  in_review: '#F59E0B',
  answered:  '#4A9E6B',
  closed:    '#4A5568',
}
const PRIORITY_LABEL: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' }
const PRIORITY_COLOR: Record<string, string> = { low: '#8A95A5', medium: '#6B8CFF', high: '#FF6B35', urgent: '#f87171' }

function StatusChip({ status }: { status: RFIStatusValue }) {
  const color = STATUS_COLOR[status] ?? '#8A95A5'
  return (
    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${color}20`, color }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

// ─── Icon button with animated hover ──────────────────────────────────────────

function IconBtn({
  icon: Icon,
  label,
  onClick,
  variant = 'edit',
  size = 13,
}: {
  icon: React.ElementType
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'edit' | 'delete' | 'reply'
  size?: number
}) {
  const colors = {
    edit:   'text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10',
    delete: 'text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10',
    reply:  'text-[#8A95A5] hover:text-[#6B8CFF] hover:bg-[#6B8CFF]/10',
  }
  const rotate = { edit: 'hover:-rotate-12', delete: 'hover:rotate-12', reply: '' }
  return (
    <button
      title={label}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-lg transition-all duration-200',
        colors[variant],
      )}
    >
      <Icon
        size={size}
        className={cn('transition-all duration-200', rotate[variant])}
      />
    </button>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditRFIModal({
  rfi,
  projectId,
  onSave,
  onClose,
}: {
  rfi: RFI
  projectId: number
  onSave: (updated: RFI) => void
  onClose: () => void
}) {
  const [subject,     setSubject]     = useState(rfi.subject)
  const [description, setDescription] = useState(rfi.description)
  const [priority,    setPriority]    = useState<RFIPriorityValue>(rfi.priority)
  const [dueDate,     setDueDate]     = useState(rfi.due_date ?? '')
  const [status,      setStatus]      = useState<RFIStatusValue>(rfi.status)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) return
    setSaving(true); setError('')
    try {
      const updated = await updateRFI(projectId, rfi.id, {
        subject: subject.trim(), description: description.trim(),
        priority, due_date: dueDate || null, status,
      })
      onSave(updated)
    } catch (err: unknown) { setError((err as Error).message ?? 'Error al guardar'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#27384A] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>Editar RFI</p>
            <h2 className="text-base font-semibold text-[#F0EDE8] truncate max-w-[360px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{rfi.subject}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] p-1 rounded-lg hover:bg-[#27384A] transition-colors"><X size={17} /></button>
        </div>

        <form id="edit-rfi-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle size={13} className="flex-shrink-0" />{error}
            </div>
          )}
          <div>
            <label className={labelCls}>Asunto <span className="text-[#FF6B35]">*</span></label>
            <input required autoFocus value={subject} onChange={e => setSubject(e.target.value)} className={inputCls} placeholder="Descripción breve de la consulta…" />
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={cn(inputCls, 'resize-none')} placeholder="Detalle la consulta técnica…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prioridad</label>
              <select value={priority} onChange={e => setPriority(e.target.value as RFIPriorityValue)} className={cn(inputCls, 'cursor-pointer')}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value as RFIStatusValue)} className={cn(inputCls, 'cursor-pointer')}>
                {(Object.keys(STATUS_LABEL) as RFIStatusValue[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Fecha límite</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button form="edit-rfi-form" type="submit" disabled={saving}
            className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Answer modal ─────────────────────────────────────────────────────────────

function AnswerRFIModal({
  rfi,
  projectId,
  onSave,
  onClose,
}: {
  rfi: RFI
  projectId: number
  onSave: (updated: RFI) => void
  onClose: () => void
}) {
  const [answer, setAnswer] = useState(rfi.answer ?? '')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim()) return
    setSaving(true); setError('')
    try {
      const updated = await answerRFI(projectId, rfi.id, answer.trim())
      onSave(updated)
    } catch (err: unknown) { setError((err as Error).message ?? 'Error'); setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-[#27384A] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#6B8CFF] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>Responder RFI</p>
            <h2 className="text-sm font-semibold text-[#F0EDE8] truncate max-w-[360px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{rfi.subject}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] p-1 rounded-lg hover:bg-[#27384A] transition-colors"><X size={17} /></button>
        </div>
        <form id="answer-rfi-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && <div className="text-xs text-red-400">{error}</div>}
          <div className="p-3 rounded-lg bg-[#131D28] border border-[#27384A] text-xs text-[#8A95A5] leading-relaxed">
            <p className="text-[10px] text-[#8A95A5] mb-1">Consulta original:</p>
            {rfi.description}
          </div>
          <div>
            <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Respuesta <span className="text-[#FF6B35]">*</span></label>
            <textarea required autoFocus rows={5} value={answer} onChange={e => setAnswer(e.target.value)}
              className={cn(inputCls, 'resize-none')} placeholder="Respuesta técnica detallada…" />
          </div>
        </form>
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button form="answer-rfi-form" type="submit" disabled={saving}
            className="px-5 py-2 bg-[#6B8CFF] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#8BA8FF] disabled:opacity-60 transition-colors flex items-center gap-1.5">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Enviando…</> : <><MessageSquare size={12} /> Enviar respuesta</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RFIsTab({
  projectId,
  rfis,
  onRFIsChange,
}: {
  projectId: number
  rfis: RFI[]
  onRFIsChange: (rfis: RFI[]) => void
}) {
  const [viewMode,     setViewMode]     = useState<'cards' | 'list'>('cards')
  const [editingRFI,   setEditingRFI]   = useState<RFI | null>(null)
  const [answerRFI_,   setAnswerRFI_]   = useState<RFI | null>(null)
  const [deletingId,   setDeletingId]   = useState<number | null>(null)
  const [showForm,     setShowForm]     = useState(false)
  const [subject,      setSubject]      = useState('')
  const [description,  setDescription]  = useState('')
  const [priority,     setPriority]     = useState('medium')
  const [dueDate,      setDueDate]      = useState('')
  const [saving,       setSaving]       = useState(false)
  const [formError,    setFormError]    = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return
    setSaving(true); setFormError('')
    try {
      const newRFI = await createRFI(projectId, { subject, description, priority, due_date: dueDate || null })
      onRFIsChange([newRFI, ...rfis])
      setSubject(''); setDescription(''); setPriority('medium'); setDueDate(''); setShowForm(false)
    } catch (err: unknown) { setFormError((err as Error).message ?? 'Error') }
    finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    try {
      await deleteRFI(projectId, id)
      onRFIsChange(rfis.filter(r => r.id !== id))
    } catch {}
    setDeletingId(null)
  }

  function handleEditSave(updated: RFI) {
    onRFIsChange(rfis.map(r => r.id === updated.id ? updated : r))
    setEditingRFI(null)
  }

  function handleAnswerSave(updated: RFI) {
    onRFIsChange(rfis.map(r => r.id === updated.id ? updated : r))
    setAnswerRFI_(null)
  }

  const canAnswer = (rfi: RFI) => rfi.status === 'open' || rfi.status === 'in_review'

  return (
    <>
      {editingRFI && <EditRFIModal rfi={editingRFI} projectId={projectId} onSave={handleEditSave} onClose={() => setEditingRFI(null)} />}
      {answerRFI_ && <AnswerRFIModal rfi={answerRFI_} projectId={projectId} onSave={handleAnswerSave} onClose={() => setAnswerRFI_(null)} />}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Solicitudes de información</h2>
            <p className="text-xs text-[#8A95A5] mt-0.5">
              {rfis.length} RFI{rfis.length !== 1 ? 's' : ''} ·{' '}
              {rfis.filter(r => r.status === 'answered').length} respondidas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View toggle */}
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
              {showForm ? 'Cancelar' : 'Nueva RFI'}
            </button>
          </div>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle size={13} className="flex-shrink-0" />{formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Asunto <span className="text-[#FF6B35]">*</span></label>
                <input required autoFocus value={subject} onChange={e => setSubject(e.target.value)} className={inputCls} placeholder="Descripción breve de la consulta…" />
              </div>
              <div>
                <label className={labelCls}>Prioridad</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Fecha límite (opcional)</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Descripción / consulta <span className="text-[#FF6B35]">*</span></label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)}
                className={cn(inputCls, 'resize-none')} placeholder="Detalle la consulta técnica o de diseño…" />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
                {saving ? <><Loader2 size={12} className="animate-spin" /> Creando…</> : <><Plus size={12} /> Crear RFI</>}
              </button>
            </div>
          </form>
        )}

        {/* Empty state */}
        {rfis.length === 0 && !showForm && (
          <p className="text-sm text-[#8A95A5] py-10 text-center">Sin solicitudes de información registradas.</p>
        )}

        {/* Cards view */}
        {viewMode === 'cards' && rfis.length > 0 && (
          <div className="space-y-3">
            {rfis.map(rfi => (
              <div key={rfi.id} className={cn(
                'rounded-xl border bg-[#1F2D3A] p-5 group',
                rfi.status === 'open' || rfi.status === 'in_review' ? 'border-[#FF6B35]/30' : 'border-[#27384A]',
              )}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
                      RFI-{String(rfi.number).padStart(3, '0')}
                    </span>
                    <StatusChip status={rfi.status} />
                    {(rfi.priority === 'urgent' || rfi.priority === 'high') && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${PRIORITY_COLOR[rfi.priority]}20`, color: PRIORITY_COLOR[rfi.priority] }}>
                        {PRIORITY_LABEL[rfi.priority]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <span className="text-[10px] text-[#8A95A5] mr-2" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(rfi.created_at)}</span>
                    {rfi.due_date && (
                      <span className="flex items-center gap-1 text-[10px] text-[#8A95A5] mr-2">
                        <Calendar size={9} /> {fmtDate(rfi.due_date)}
                      </span>
                    )}
                    <IconBtn icon={Pencil} label="Editar" variant="edit" onClick={e => { e.stopPropagation(); setEditingRFI(rfi) }} />
                    {deletingId === rfi.id ? (
                      <div className="flex items-center gap-1 ml-1">
                        <span className="text-[9px] text-[#8A95A5]">¿Eliminar?</span>
                        <button onClick={() => setDeletingId(null)} className="text-[9px] px-1.5 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                        <button onClick={() => handleDelete(rfi.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                      </div>
                    ) : (
                      <IconBtn icon={Trash2} label="Eliminar" variant="delete" onClick={e => { e.stopPropagation(); setDeletingId(rfi.id) }} />
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-[#F0EDE8] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{rfi.subject}</h3>
                <p className="text-xs text-[#8A95A5] leading-relaxed mb-3">{rfi.description}</p>

                {rfi.answer && (
                  <div className="p-3 rounded-lg bg-[#4A9E6B]/5 border border-[#4A9E6B]/20 mb-3">
                    <p className="text-[10px] text-[#4A9E6B] mb-1">Respuesta · {fmtDate(rfi.answered_at)} — {rfi.answered_by_name}</p>
                    <p className="text-xs text-[#F0EDE8] leading-relaxed">{rfi.answer}</p>
                  </div>
                )}

                {canAnswer(rfi) && (
                  <button onClick={() => setAnswerRFI_(rfi)}
                    className="flex items-center gap-2 px-3 py-1.5 border border-[#6B8CFF]/30 text-xs text-[#6B8CFF] rounded-lg hover:bg-[#6B8CFF]/5 transition-all duration-200 hover:border-[#6B8CFF]/60">
                    <MessageSquare size={11} className="transition-all duration-200 hover:scale-110" /> Responder
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && rfis.length > 0 && (
          <div className="rounded-xl border border-[#27384A] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#131D28] border-b border-[#27384A]">
              <span className="w-[72px] text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider flex-shrink-0">#</span>
              <span className="flex-1 text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider">Asunto</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden sm:block w-20 text-center">Prioridad</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden md:block w-24 text-center">Estado</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden lg:block w-24 text-center">Fecha límite</span>
              <span className="w-20 flex-shrink-0" />
            </div>

            {rfis.map((rfi, i) => (
              <div key={rfi.id} className={cn(
                'flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors group',
                i > 0 && 'border-t border-[#27384A]',
              )}>
                <span className="text-[10px] text-[#FF6B35] flex-shrink-0 w-[72px]" style={{ fontFamily: 'Space Mono, monospace' }}>
                  RFI-{String(rfi.number).padStart(3, '0')}
                </span>
                <p className="flex-1 text-sm text-[#F0EDE8] font-medium truncate min-w-0">{rfi.subject}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0 hidden sm:flex">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: `${PRIORITY_COLOR[rfi.priority]}20`, color: PRIORITY_COLOR[rfi.priority] }}>
                    {PRIORITY_LABEL[rfi.priority]}
                  </span>
                </div>
                <div className="hidden md:block w-24 text-center flex-shrink-0">
                  <StatusChip status={rfi.status} />
                </div>
                <span className="text-[9px] text-[#8A95A5] hidden lg:block w-24 text-center flex-shrink-0">
                  {rfi.due_date ? fmtDate(rfi.due_date) : '—'}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0 w-20 justify-end">
                  {canAnswer(rfi) && (
                    <IconBtn icon={MessageSquare} label="Responder" variant="reply" size={12}
                      onClick={e => { e.stopPropagation(); setAnswerRFI_(rfi) }} />
                  )}
                  <IconBtn icon={Pencil} label="Editar" variant="edit" size={12}
                    onClick={e => { e.stopPropagation(); setEditingRFI(rfi) }} />
                  {deletingId === rfi.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDeletingId(null)} className="text-[9px] px-1 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                      <button onClick={() => handleDelete(rfi.id)} className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                    </div>
                  ) : (
                    <IconBtn icon={Trash2} label="Eliminar" variant="delete" size={12}
                      onClick={e => { e.stopPropagation(); setDeletingId(rfi.id) }} />
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
