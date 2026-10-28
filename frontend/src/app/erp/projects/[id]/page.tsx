'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, TrendingUp, ClipboardList, CreditCard, Camera,
  ChevronRight, Calendar, MapPin, Clock, CheckCircle2,
  AlertCircle, Loader2, X, Plus, ShieldCheck, ShieldAlert,
  Users, CloudSun, Package, XCircle, Pencil, Hammer,
  MessageSquare, DollarSign, FileQuestion, ArrowUpDown, RotateCcw, Send, Check,
  BarChart3, PieChart, LayoutGrid, List,
  FileEdit, Trash2, Phone, Mail, Info, FileText, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { confirmToast } from '@/lib/confirm-toast'
import ERPAvatar from '@/components/erp/ERPAvatar'
import KanbanBoard from '@/components/erp/KanbanBoard'
import RFIsTab from '@/components/erp/RFIsTab'
import ChangeOrdersTab from '@/components/erp/ChangeOrdersTab'
import ExpensesTab from '@/components/erp/ExpensesTab'
import QuoteTab from '@/components/erp/QuoteTab'
import {
  getMe, getProject, getProjectProgress, updateProject,
  createProgressUpdate, createMilestone, uploadMilestoneEvidence,
  approveMilestone, markMilestonePaid, uploadProjectCover,
  getRFIs, createRFI, answerRFI,
  getChangeOrders, createChangeOrder, submitChangeOrder, approveChangeOrder,
  getExpenses, createExpense, approveExpense,
  getInvoices, createInvoice, markInvoicePaid,
  getTasks, createTask, updateTask, deleteTask,
  getProjectContacts, createProjectContact, updateProjectContact, deleteProjectContact, uploadContactAvatar,
  getProjectNotes, createProjectNote, updateProjectNote, deleteProjectNote,
  type ProjectContact, type ProjectNote,
  type ProjectDetail, type ProgressUpdate, type PaymentMilestone,
  type MilestoneStatusValue, type MilestoneEvidence, type Phase,
  type CreateProgressPayload, type CreateMilestonePayload,
  type RFI, type RFIStatusValue,
  type ChangeOrder, type ChangeOrderStatusValue,
  type Expense, type Invoice,
  type Task, type TaskStatus, type TaskPriority,
} from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number) {
  return `Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 0 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

// ─── Status chips ─────────────────────────────────────────────────────────────

function ProjectStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Borrador',   cls: 'bg-[#4A5568]/20 text-[#8A95A5]' },
    active:    { label: 'Activo',     cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
    paused:    { label: 'En pausa',   cls: 'bg-amber-500/15 text-amber-400' },
    completed: { label: 'Completado', cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
    cancelled: { label: 'Cancelado',  cls: 'bg-red-500/15 text-red-400' },
  }
  const { label, cls } = map[status] ?? map.draft
  return (
    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {label}
    </span>
  )
}

function MilestoneStatusChip({ status }: { status: MilestoneStatusValue }) {
  const map: Record<MilestoneStatusValue, { label: string; cls: string; Icon: React.ElementType }> = {
    pending:            { label: 'Pendiente',         cls: 'bg-[#27384A] text-[#8A95A5]',    Icon: Clock },
    evidence_submitted: { label: 'Evidencia enviada', cls: 'bg-amber-500/15 text-amber-400',  Icon: Camera },
    awaiting_approval:  { label: 'Pend. aprobación',  cls: 'bg-[#FF6B35]/15 text-[#FF6B35]', Icon: ShieldAlert },
    approved:           { label: 'Aprobado',           cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]', Icon: ShieldCheck },
    paid:               { label: 'Pagado',             cls: 'bg-[#4A9E6B]/20 text-[#4A9E6B]', Icon: CheckCircle2 },
    disputed:           { label: 'En disputa',         cls: 'bg-red-500/15 text-red-400',     Icon: XCircle },
    cancelled:          { label: 'Cancelado',          cls: 'bg-[#4A5568]/20 text-[#8A95A5]', Icon: XCircle },
  }
  const { label, cls, Icon } = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>
      <Icon size={10} />
      {label}
    </span>
  )
}

function PhaseStatusDot({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 size={13} className="text-[#4A9E6B] flex-shrink-0" />
  if (status === 'active')    return <div className="w-3 h-3 rounded-full border-2 border-[#FF6B35] flex-shrink-0" />
  return <div className="w-3 h-3 rounded-full border-2 border-[#27384A] flex-shrink-0" />
}

// ─── Tag input component ──────────────────────────────────────────────────────

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')

  function addTag() {
    const t = input.trim()
    if (t && !tags.includes(t)) {
      onChange([...tags, t])
    }
    setInput('')
  }

  return (
    <div>
      <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          className="flex-1 bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={addTag}
          className="px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors whitespace-nowrap"
        >
          Agregar
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5]"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-[#8A95A5] hover:text-red-400 transition-colors"
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Photo URL input ──────────────────────────────────────────────────────────

function PhotoUrlInput({
  urls,
  onChange,
}: {
  urls: string[]
  onChange: (urls: string[]) => void
}) {
  const [input, setInput] = useState('')

  function add() {
    const u = input.trim()
    if (u && !urls.includes(u)) onChange([...urls, u])
    setInput('')
  }

  return (
    <div>
      <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Fotos (URLs)</label>
      <div className="flex gap-2 mb-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          className="flex-1 bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
          placeholder="https://…"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors whitespace-nowrap"
        >
          Agregar URL
        </button>
      </div>
      {urls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {urls.map((u) => (
            <div key={u} className="relative aspect-video rounded-lg overflow-hidden border border-[#27384A] group">
              <Image src={u} alt="Foto" fill className="object-cover" sizes="100px" />
              <button
                type="button"
                onClick={() => onChange(urls.filter((x) => x !== u))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Company sign modal ───────────────────────────────────────────────────────

function CompanySignModal({
  milestone,
  projectId,
  onClose,
  onSuccess,
}: {
  milestone: PaymentMilestone
  projectId: number
  onClose: () => void
  onSuccess: (updated: PaymentMilestone) => void
}) {
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSign() {
    setLoading(true)
    setError('')
    try {
      const updated = await approveMilestone(projectId, milestone.id, notes)
      onSuccess(updated)
    } catch (e: any) {
      setError(e.message ?? 'Error al firmar')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-[#27384A] flex items-center justify-between">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
              Firma como constructora
            </p>
            <h2 className="text-base font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {milestone.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Monto', value: fmtGtq(milestone.amount_gtq) },
              { label: '% contrato', value: `${milestone.percentage_of_total}%` },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg bg-[#1A2530] border border-[#27384A] text-center">
                <p className="text-[10px] text-[#8A95A5] mb-1">{label}</p>
                <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{value}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Notas (opcional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#1A2530] border border-[#27384A] rounded-lg px-4 py-3 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 resize-none transition-colors"
              placeholder="Notas internas sobre la aprobación…"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSign}
            disabled={loading}
            className="px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Firmando…</>
              : <><ShieldCheck size={14} /> Firmar</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Mark paid confirm modal ──────────────────────────────────────────────────

function MarkPaidModal({
  milestone,
  projectId,
  onClose,
  onSuccess,
}: {
  milestone: PaymentMilestone
  projectId: number
  onClose: () => void
  onSuccess: (updated: PaymentMilestone) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      const updated = await markMilestonePaid(projectId, milestone.id)
      onSuccess(updated)
    } catch (e: any) {
      setError(e.message ?? 'Error al confirmar pago')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-[#4A9E6B]/15 border border-[#4A9E6B]/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={22} className="text-[#4A9E6B]" />
          </div>
          <h2 className="text-base font-semibold text-[#F0EDE8] text-center mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Confirmar pago recibido
          </h2>
          <p className="text-sm text-[#8A95A5] text-center mb-1">{milestone.name}</p>
          <p className="text-lg font-semibold text-[#4A9E6B] text-center mb-5" style={{ fontFamily: 'Space Mono, monospace' }}>
            {fmtGtq(milestone.amount_gtq)}
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-4">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-2.5 bg-[#4A9E6B] text-white text-sm font-semibold rounded-lg hover:bg-[#5BB87C] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Confirmando…</>
                : <><CheckCircle2 size={14} /> Confirmar</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Phase 2 status chips ─────────────────────────────────────────────────────

function RFIStatusChip({ status }: { status: RFIStatusValue }) {
  const map = {
    open:      { label: 'Abierto',     cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
    in_review: { label: 'En revisión', cls: 'bg-amber-500/15 text-amber-400' },
    answered:  { label: 'Respondido',  cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
    closed:    { label: 'Cerrado',     cls: 'bg-[#27384A] text-[#8A95A5]' },
  }
  const { label, cls } = map[status] ?? map.open
  return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

function COStatusChip({ status }: { status: ChangeOrderStatusValue }) {
  const map = {
    draft:     { label: 'Borrador',    cls: 'bg-[#27384A] text-[#8A95A5]' },
    submitted: { label: 'Enviada',     cls: 'bg-amber-500/15 text-amber-400' },
    in_review: { label: 'En revisión', cls: 'bg-blue-500/15 text-blue-400' },
    approved:  { label: 'Aprobada',    cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
    rejected:  { label: 'Rechazada',   cls: 'bg-red-500/15 text-red-400' },
    withdrawn: { label: 'Retirada',    cls: 'bg-[#27384A] text-[#8A95A5]' },
  }
  const { label, cls } = map[status] ?? map.draft
  return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

function ExpenseStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending:    { label: 'Pend. aprobación', cls: 'bg-amber-500/15 text-amber-400' },
    approved:   { label: 'Aprobado',         cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
    rejected:   { label: 'Rechazado',        cls: 'bg-red-500/15 text-red-400' },
    reimbursed: { label: 'Reembolsado',      cls: 'bg-[#27384A] text-[#8A95A5]' },
  }
  const { label, cls } = map[status] ?? map.pending
  return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

function InvoiceStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Borrador',  cls: 'bg-[#27384A] text-[#8A95A5]' },
    sent:      { label: 'Enviada',   cls: 'bg-amber-500/15 text-amber-400' },
    viewed:    { label: 'Vista',     cls: 'bg-blue-500/15 text-blue-400' },
    paid:      { label: 'Pagada',    cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
    overdue:   { label: 'Vencida',   cls: 'bg-red-500/15 text-red-400' },
    cancelled: { label: 'Cancelada', cls: 'bg-[#27384A] text-[#8A95A5]' },
  }
  const { label, cls } = map[status] ?? map.draft
  return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

// ─── Answer RFI modal ─────────────────────────────────────────────────────────

function AnswerRFIModal({ rfi, projectId, onClose, onSuccess }: {
  rfi: RFI; projectId: number; onClose: () => void; onSuccess: (updated: RFI) => void
}) {
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!answer.trim()) return
    setLoading(true)
    try {
      const updated = await answerRFI(projectId, rfi.id, answer)
      onSuccess(updated)
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-[#27384A] flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-1" style={{ fontFamily: 'Space Mono, monospace' }}>Responder RFI-{String(rfi.number).padStart(3,'0')}</p>
            <h2 className="text-base font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{rfi.subject}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-lg bg-[#1A2530] border border-[#27384A]">
            <p className="text-xs text-[#8A95A5] mb-1">Consulta:</p>
            <p className="text-sm text-[#F0EDE8] leading-relaxed">{rfi.description}</p>
          </div>
          <div>
            <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Respuesta</label>
            <textarea rows={4} value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full bg-[#1A2530] border border-[#27384A] rounded-lg px-4 py-3 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 resize-none"
              placeholder="Escribe la respuesta técnica..." />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading || !answer.trim()}
            className="px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" />Enviando…</> : <><Send size={14} />Enviar respuesta</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CO Company Sign modal ────────────────────────────────────────────────────

function COSignModal({ co, projectId, onClose, onSuccess }: {
  co: ChangeOrder; projectId: number; onClose: () => void; onSuccess: (updated: ChangeOrder) => void
}) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSign() {
    setLoading(true)
    try {
      const updated = await approveChangeOrder(projectId, co.id, notes)
      onSuccess(updated)
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-[#27384A] flex items-start justify-between">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-1" style={{ fontFamily: 'Space Mono, monospace' }}>Aprobar OC-{String(co.number).padStart(3,'0')}</p>
            <h2 className="text-base font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{co.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-[#1A2530] border border-[#27384A] text-center">
              <p className="text-[10px] text-[#8A95A5] mb-1">Impacto económico</p>
              <p className={`text-sm font-semibold ${Number(co.amount_gtq) >= 0 ? 'text-amber-400' : 'text-[#4A9E6B]'}`} style={{ fontFamily: 'Space Mono, monospace' }}>
                {Number(co.amount_gtq) >= 0 ? '+' : ''}Q {Number(co.amount_gtq).toLocaleString('es-GT')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#1A2530] border border-[#27384A] text-center">
              <p className="text-[10px] text-[#8A95A5] mb-1">Impacto en plazo</p>
              <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                {co.schedule_days_impact > 0 ? '+' : ''}{co.schedule_days_impact} días
              </p>
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Notas internas (opcional)</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#1A2530] border border-[#27384A] rounded-lg px-4 py-3 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 resize-none" />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button onClick={handleSign} disabled={loading}
            className="px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
            {loading ? <><Loader2 size={14} className="animate-spin" />Firmando…</> : <><ShieldCheck size={14} />Firmar como constructora</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const NAV = [
  // ── Primarias (siempre visibles) ──────────────────────────────────────────
  { id: 'overview',      label: 'Resumen',          Icon: TrendingUp,    tooltip: undefined },
  { id: 'cotizacion',    label: 'Cotización',        Icon: FileText,      tooltip: 'Cotización enviable al cliente para su aprobación, solicitud de cambios o rechazo.' },
  { id: 'milestones',    label: 'Hitos y pagos',     Icon: CreditCard,    tooltip: undefined },
  { id: 'progress',      label: 'Bitácora',          Icon: ClipboardList, tooltip: undefined },
  { id: 'tasks',         label: 'Tareas',            Icon: CheckCircle2,  tooltip: undefined },
  // ── Secundarias (en menú "Más") ───────────────────────────────────────────
  { id: 'change_orders', label: 'Órdenes de cambio', Icon: ArrowUpDown,   tooltip: undefined },
  { id: 'expenses',      label: 'Gastos',             Icon: DollarSign,   tooltip: undefined },
  { id: 'rfis',          label: 'RFIs',               Icon: FileQuestion,
    tooltip: 'Preguntas formales dirigidas al equipo de diseño o al cliente para aclarar especificaciones técnicas, planos, materiales o cualquier punto ambiguo de la documentación del proyecto.' },
  { id: 'reports',       label: 'Reportes',           Icon: BarChart3,    tooltip: undefined },
  { id: 'photos',        label: 'Fotos',              Icon: Camera,       tooltip: undefined },
  { id: 'contacts',      label: 'Contactos',          Icon: Users,        tooltip: 'Equipo y contactos visibles al cliente en su portal.' },
  { id: 'notes',         label: 'Notas internas',     Icon: MessageSquare, tooltip: 'Comentarios internos del equipo, no visibles para el cliente.' },
] as const
type TabId = typeof NAV[number]['id']

const PRIMARY_TAB_IDS: TabId[] = ['overview', 'cotizacion', 'milestones', 'progress', 'tasks']
const PRIMARY_NAV = NAV.filter(t => (PRIMARY_TAB_IDS as string[]).includes(t.id))
const MORE_NAV    = NAV.filter(t => !(PRIMARY_TAB_IDS as string[]).includes(t.id))

const inputCls =
  'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

function ViewToggle({ mode, onChange }: { mode: 'list' | 'grid'; onChange: (m: 'list' | 'grid') => void }) {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-[#131D28] border border-[#27384A] rounded-lg">
      <button
        onClick={() => onChange('list')}
        className={cn('p-1.5 rounded-md transition-colors', mode === 'list' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
        title="Vista lista"
      >
        <List size={13} />
      </button>
      <button
        onClick={() => onChange('grid')}
        className={cn('p-1.5 rounded-md transition-colors', mode === 'grid' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
        title="Vista tarjetas"
      >
        <LayoutGrid size={13} />
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ERPProjectDetail() {
  const params = useParams()
  const projectId = Number(params.id)

  const [me, setMe]                     = useState<import('@/lib/api').User | null>(null)
  const [project, setProject]           = useState<ProjectDetail | null>(null)
  const [progress, setProgress]         = useState<ProgressUpdate[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [activeTab, setActiveTab]       = useState<TabId>('overview')
  const [moreOpen,  setMoreOpen]        = useState(false)
  const moreMenuRef                     = useRef<HTMLDivElement>(null)

  // Progress form
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [progressForm, setProgressForm] = useState({
    date: todayStr(),
    progress_pct: 0,
    labor_count: 0,
    weather: '',
    notes: '',
    activities: [] as string[],
    materials: [] as string[],
    photoUrls: [] as string[],
  })
  const [savingProgress, setSavingProgress] = useState(false)
  const [progressError, setProgressError]   = useState('')

  // Milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState({
    name: '',
    description: '',
    amount_gtq: '',
    order: '',
    progress_required_pct: '',
    due_date: '',
    phase: '',
    notes: '',
  })
  const [savingMilestone, setSavingMilestone] = useState(false)
  const [milestoneError, setMilestoneError]   = useState('')

  // Evidence form per milestone
  const [evidenceForms, setEvidenceForms] = useState<Record<number, { url: string; caption: string }>>({})
  const [uploadingEvidence, setUploadingEvidence] = useState<Record<number, boolean>>({})

  // Modals
  const [companySignModal, setCompanySignModal] = useState<PaymentMilestone | null>(null)
  const [markPaidModal, setMarkPaidModal]       = useState<PaymentMilestone | null>(null)

  // Phase 2 — RFIs
  const [rfis, setRfis]                 = useState<RFI[]>([])
  const [showRFIForm, setShowRFIForm]   = useState(false)
  const [rfiSubject, setRfiSubject]     = useState('')
  const [rfiPriority, setRfiPriority]   = useState('medium')
  const [rfiDueDate, setRfiDueDate]     = useState('')
  const [rfiDescription, setRfiDescription] = useState('')
  const [savingRFI, setSavingRFI]       = useState(false)
  const [rfiError, setRfiError]         = useState('')
  const [answerModal, setAnswerModal]   = useState<RFI | null>(null)

  // Phase 2 — Change Orders
  const [changeOrders, setChangeOrders]   = useState<ChangeOrder[]>([])
  const [showCOForm, setShowCOForm]       = useState(false)
  const [coTitle, setCoTitle]             = useState('')
  const [coReason, setCoReason]           = useState('scope_change')
  const [coDescription, setCoDescription] = useState('')
  const [coAmount, setCoAmount]           = useState('')
  const [coDays, setCoDays]               = useState('0')
  const [coPhase, setCoPhase]             = useState('')
  const [savingCO, setSavingCO]           = useState(false)
  const [coError, setCoError]             = useState('')
  const [coSignModal, setCOSignModal]     = useState<ChangeOrder | null>(null)

  // Phase 2 — Expenses & Invoices
  const [expenses, setExpenses]             = useState<Expense[]>([])
  const [invoices, setInvoices]             = useState<Invoice[]>([])
  const [expensesSubTab, setExpensesSubTab] = useState<'expenses' | 'invoices'>('expenses')
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [expCategory, setExpCategory]       = useState('materials')
  const [expDescription, setExpDescription] = useState('')
  const [expAmount, setExpAmount]           = useState('')
  const [expDate, setExpDate]               = useState(todayStr())
  const [expReceiptUrl, setExpReceiptUrl]   = useState('')
  const [expNotes, setExpNotes]             = useState('')
  const [savingExpense, setSavingExpense]   = useState(false)
  const [expenseError, setExpenseError]     = useState('')
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invNumber, setInvNumber]           = useState('')
  const [invTitle, setInvTitle]             = useState('')
  const [invAmount, setInvAmount]           = useState('')
  const [invIssueDate, setInvIssueDate]     = useState(todayStr())
  const [invDueDate, setInvDueDate]         = useState('')
  const [invTax, setInvTax]                 = useState('12')
  const [invDescription, setInvDescription] = useState('')
  const [savingInvoice, setSavingInvoice]   = useState(false)
  const [invoiceError, setInvoiceError]     = useState('')

  // Tasks
  const [tasks, setTasks]                   = useState<Task[]>([])
  const [showTaskForm, setShowTaskForm]     = useState(false)
  const [taskTitle, setTaskTitle]           = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskPriority, setTaskPriority]     = useState<TaskPriority>('medium')
  const [taskDueDate, setTaskDueDate]       = useState('')
  const [taskPhase, setTaskPhase]           = useState('')
  const [savingTask, setSavingTask]         = useState(false)
  const [taskError, setTaskError]           = useState('')
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)

  // Contacts
  const [contacts, setContacts]               = useState<ProjectContact[]>([])
  const [contactsLoaded, setContactsLoaded]   = useState(false)
  const [contactViewMode, setContactViewMode] = useState<'grid' | 'list'>('grid')
  const [showContactForm, setShowContactForm] = useState(false)
  const [editingContact, setEditingContact]   = useState<ProjectContact | null>(null)
  const [confirmDeleteContactId, setConfirmDeleteContactId] = useState<number | null>(null)
  const [contactForm, setContactForm]         = useState({ name: '', role: '', company: 'Grucore', email: '', phone: '', avatar_url: '', order: 0 })
  const [savingContact, setSavingContact]     = useState(false)
  const [contactError, setContactError]       = useState('')
  const [avatarFile, setAvatarFile]           = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview]     = useState<string>('')
  const [avatarDragging, setAvatarDragging]   = useState(false)
  const avatarInputRef                        = useRef<HTMLInputElement>(null)

  // Notes
  const [notes, setNotes]               = useState<ProjectNote[]>([])
  const [notesLoaded, setNotesLoaded]   = useState(false)
  const [noteInput, setNoteInput]       = useState('')
  const [noteSubmitting, setNoteSubmitting] = useState(false)
  const [editingNote, setEditingNote]   = useState<ProjectNote | null>(null)
  const [editNoteBody, setEditNoteBody] = useState('')
  const [noteError, setNoteError]       = useState('')
  const notesEndRef                     = useRef<HTMLDivElement>(null)

  // View modes
  const [expViewMode,  setExpViewMode]  = useState<'list' | 'grid'>('list')
  const [invViewMode,  setInvViewMode]  = useState<'list' | 'grid'>('list')
  const [rfiViewMode,  setRfiViewMode]  = useState<'list' | 'grid'>('grid')
  const [coViewMode,   setCoViewMode]   = useState<'list' | 'grid'>('grid')
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban')

  // Cover photo upload
  const [coverUploading, setCoverUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Edit project modal
  const [showEditProject, setShowEditProject] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '', status: '', project_type: '', address: '', city: '',
    department: '', start_date: '', estimated_end: '', total_budget_gtq: '', description: '',
  })
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError]   = useState('')

  // ── Data loading ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      const [detail, prog] = await Promise.all([
        getProject(projectId),
        getProjectProgress(projectId),
      ])
      setProject(detail)
      setProgress(prog.results)
    } catch (e: any) {
      if (e.message === 'Sesión expirada') return
      setError(e.message ?? 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Close "Más" dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    async function init() {
      try {
        const me = await getMe()
        if (me.role === 'client_portal') {
          window.location.href = '/portal'
          return
        }
        setMe(me)
      } catch {}
      fetchData()
    }
    init()
  }, [fetchData])

  // ── Lazy-load tab data ────────────────────────────────────────────────────

  useEffect(() => {
    if (!project) return
    if (activeTab === 'rfis' && rfis.length === 0) {
      getRFIs(project.id).then(res => setRfis(res.results ?? (res as any)))
    }
    if (activeTab === 'change_orders' && changeOrders.length === 0) {
      getChangeOrders(project.id).then(setChangeOrders)
    }
    if (activeTab === 'expenses' && expenses.length === 0) {
      Promise.all([getExpenses(project.id), getInvoices(project.id)])
        .then(([exp, inv]) => { setExpenses(exp); setInvoices(inv) })
    }
    if (activeTab === 'reports' && expenses.length === 0) {
      Promise.all([getExpenses(project.id), getInvoices(project.id)])
        .then(([exp, inv]) => { setExpenses(exp); setInvoices(inv) })
    }
    if (activeTab === 'tasks' && tasks.length === 0) {
      getTasks(project.id).then(setTasks)
    }
    if (activeTab === 'contacts' && !contactsLoaded) {
      getProjectContacts(project.id).then(c => { setContacts(c); setContactsLoaded(true) })
    }
    if (activeTab === 'notes' && !notesLoaded) {
      getProjectNotes(project.id).then(n => { setNotes(n); setNotesLoaded(true) })
    }
  }, [activeTab, project, contactsLoaded, notesLoaded])

  // ── Contact handlers ──────────────────────────────────────────────────────

  function openAddContact() {
    setEditingContact(null)
    setContactForm({ name: '', role: '', company: 'Grucore', email: '', phone: '', avatar_url: '', order: contacts.length })
    setAvatarFile(null)
    setAvatarPreview('')
    setContactError('')
    setShowContactForm(true)
  }

  function openEditContact(c: ProjectContact) {
    setEditingContact(c)
    setContactForm({ name: c.name, role: c.role, company: c.company, email: c.email, phone: c.phone, avatar_url: c.avatar_url, order: c.order })
    setAvatarFile(null)
    setAvatarPreview(c.resolved_avatar_url || c.avatar_url || '')
    setContactError('')
    setShowContactForm(true)
  }

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSaveContact(e: React.FormEvent) {
    e.preventDefault()
    if (!project || !contactForm.name.trim()) return
    setSavingContact(true); setContactError('')
    try {
      let saved: ProjectContact
      if (editingContact) {
        saved = await updateProjectContact(project.id, editingContact.id, contactForm)
      } else {
        saved = await createProjectContact(project.id, contactForm)
      }
      if (avatarFile) {
        saved = await uploadContactAvatar(project.id, saved.id, avatarFile)
      }
      if (editingContact) {
        setContacts(prev => prev.map(c => c.id === saved.id ? saved : c))
      } else {
        setContacts(prev => [...prev, saved])
      }
      setShowContactForm(false)
    } catch (e: any) { setContactError(e.message ?? 'Error al guardar') }
    finally { setSavingContact(false) }
  }

  async function handleDeleteContact(id: number) {
    if (!project) return
    await deleteProjectContact(project.id, id)
    setContacts(prev => prev.filter(c => c.id !== id))
    setConfirmDeleteContactId(null)
  }

  // ── Cover photo handler ───────────────────────────────────────────────────

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !project) return
    setCoverUploading(true)
    try {
      const updated = await uploadProjectCover(project.id, file)
      setProject(updated)
    } catch {}
    finally { setCoverUploading(false) }
    e.target.value = ''
  }

  // ── Progress form handlers ────────────────────────────────────────────────

  function setP(key: string, val: unknown) {
    setProgressForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmitProgress(e: React.FormEvent) {
    e.preventDefault()
    setSavingProgress(true)
    setProgressError('')
    try {
      const payload: CreateProgressPayload = {
        date: progressForm.date,
        progress_pct: progressForm.progress_pct,
        labor_count: progressForm.labor_count || undefined,
        weather: progressForm.weather || undefined,
        notes: progressForm.notes || undefined,
        activities: progressForm.activities.length ? progressForm.activities : undefined,
        materials: progressForm.materials.length ? progressForm.materials : undefined,
      }
      await createProgressUpdate(projectId, payload)
      setProgressForm({
        date: todayStr(), progress_pct: 0, labor_count: 0,
        weather: '', notes: '', activities: [], materials: [], photoUrls: [],
      })
      setShowProgressForm(false)
      setLoading(true)
      fetchData()
    } catch (e: any) {
      setProgressError(e.message ?? 'Error al guardar registro')
      setSavingProgress(false)
    }
  }

  // ── Milestone form handlers ────────────────────────────────────────────────

  function setM(key: string, val: string) {
    setMilestoneForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmitMilestone(e: React.FormEvent) {
    e.preventDefault()
    if (!milestoneForm.amount_gtq) { setMilestoneError('Ingresa el monto.'); return }
    setSavingMilestone(true)
    setMilestoneError('')
    try {
      const payload: CreateMilestonePayload = {
        name: milestoneForm.name,
        description: milestoneForm.description || undefined,
        amount_gtq: milestoneForm.amount_gtq,
        order: milestoneForm.order ? Number(milestoneForm.order) : undefined,
        progress_required_pct: milestoneForm.progress_required_pct ? Number(milestoneForm.progress_required_pct) : undefined,
        due_date: milestoneForm.due_date || null,
        phase: milestoneForm.phase ? Number(milestoneForm.phase) : null,
        notes: milestoneForm.notes || undefined,
      }
      await createMilestone(projectId, payload)
      setMilestoneForm({ name: '', description: '', amount_gtq: '', order: '', progress_required_pct: '', due_date: '', phase: '', notes: '' })
      setShowMilestoneForm(false)
      setLoading(true)
      fetchData()
    } catch (e: any) {
      setMilestoneError(e.message ?? 'Error al crear hito')
      setSavingMilestone(false)
    }
  }

  // ── Evidence upload ────────────────────────────────────────────────────────

  async function handleUploadEvidence(milestoneId: number) {
    const form = evidenceForms[milestoneId]
    if (!form?.url) return
    setUploadingEvidence((s) => ({ ...s, [milestoneId]: true }))
    try {
      await uploadMilestoneEvidence(projectId, milestoneId, form.url, form.caption ?? '')
      setEvidenceForms((f) => ({ ...f, [milestoneId]: { url: '', caption: '' } }))
      fetchData()
    } catch {}
    finally {
      setUploadingEvidence((s) => ({ ...s, [milestoneId]: false }))
    }
  }

  // ── Milestone update helpers ───────────────────────────────────────────────

  function handleMilestoneUpdated(updated: PaymentMilestone) {
    setProject((p) =>
      p ? { ...p, milestones: p.milestones.map((m) => (m.id === updated.id ? updated : m)) } : p,
    )
    setCompanySignModal(null)
    setMarkPaidModal(null)
  }

  // ── Edit project ──────────────────────────────────────────────────────────

  function openEditProject() {
    if (!project) return
    setEditForm({
      name:              project.name,
      status:            project.status,
      project_type:      project.project_type,
      address:           project.address ?? '',
      city:              project.city ?? '',
      department:        project.department ?? '',
      start_date:        project.start_date ?? '',
      estimated_end:     project.estimated_end ?? '',
      total_budget_gtq:  project.total_budget_gtq,
      description:       project.description ?? '',
    })
    setEditError('')
    setShowEditProject(true)
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault()
    if (!project) return
    setSavingEdit(true)
    setEditError('')
    try {
      const payload: Record<string, string | null> = {
        name:             editForm.name,
        status:           editForm.status,
        project_type:     editForm.project_type,
        address:          editForm.address || '',
        city:             editForm.city || '',
        department:       editForm.department || '',
        start_date:       editForm.start_date || null,
        estimated_end:    editForm.estimated_end || null,
        total_budget_gtq: editForm.total_budget_gtq,
        description:      editForm.description || '',
      }
      const updated = await updateProject(project.id, payload as any)
      setProject(updated)
      setShowEditProject(false)
      toast.success('Proyecto actualizado')
    } catch (e: any) {
      setEditError(e.message ?? 'Error al guardar')
    } finally { setSavingEdit(false) }
  }

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
          <p className="text-sm text-[#8A95A5]">Cargando proyecto…</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm text-[#8A95A5]">{error || 'Proyecto no encontrado.'}</p>
          <button
            onClick={() => { window.location.href = '/erp/dashboard' }}
            className="px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg"
          >
            Volver al panel
          </button>
        </div>
      </div>
    )
  }

  const financials = (() => {
    const ms       = project.milestones
    const total    = Number(project.total_budget_gtq)
    const paid     = ms.filter((m) => m.status === 'paid').reduce((s, m) => s + Number(m.amount_gtq), 0)
    const approved = ms.filter((m) => m.status === 'approved').reduce((s, m) => s + Number(m.amount_gtq), 0)
    const pending  = total - paid - approved
    return { total, paid, approved, pending }
  })()

  const allPhotos = progress.flatMap((p) =>
    p.photos.map((ph) => ({ ...ph, date: p.date }))
  )

  return (
    <>
      {companySignModal && (
        <CompanySignModal
          milestone={companySignModal}
          projectId={projectId}
          onClose={() => setCompanySignModal(null)}
          onSuccess={handleMilestoneUpdated}
        />
      )}
      {markPaidModal && (
        <MarkPaidModal
          milestone={markPaidModal}
          projectId={projectId}
          onClose={() => setMarkPaidModal(null)}
          onSuccess={handleMilestoneUpdated}
        />
      )}
      {answerModal && project && (
        <AnswerRFIModal
          rfi={answerModal}
          projectId={project.id}
          onClose={() => setAnswerModal(null)}
          onSuccess={(updated) => {
            setRfis(prev => prev.map(r => r.id === updated.id ? updated : r))
            setAnswerModal(null)
          }}
        />
      )}
      {coSignModal && project && (
        <COSignModal
          co={coSignModal}
          projectId={project.id}
          onClose={() => setCOSignModal(null)}
          onSuccess={(updated) => {
            setChangeOrders(prev => prev.map(c => c.id === updated.id ? updated : c))
            setCOSignModal(null)
          }}
        />
      )}

      <div className="min-h-screen bg-[#131D28] flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button
            onClick={() => { window.location.href = '/erp/dashboard' }}
            className="flex items-center gap-2 text-[#8A95A5] hover:text-[#F0EDE8] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Panel</span>
          </button>

          <div className="w-px h-5 bg-[#27384A]" />

          <div className="flex-1 min-w-0 flex items-center gap-3">
            <h1
              className="text-sm font-semibold text-[#F0EDE8] truncate"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {project.name}
            </h1>
            <ProjectStatusChip status={project.status} />
          </div>

          <button
            onClick={openEditProject}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/30 hover:text-[#FF6B35] transition-colors"
          >
            <Pencil size={12} />
            <span className="hidden sm:inline">Editar</span>
          </button>
          {me && (
            <div className="flex items-center gap-2.5">
              <ERPAvatar
                avatarUrl={me.avatar_url}
                initials={`${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'}
                size="md"
              />
              <span className="hidden sm:block text-xs text-[#8A95A5]">{me.full_name}</span>
            </div>
          )}
        </header>

        {/* Tab bar */}
        <div className="bg-[#1A2530] border-b border-[#27384A] flex-shrink-0">
          <div className="flex items-stretch px-6">

            {/* Primary tabs */}
            {PRIMARY_NAV.map(({ id, label, Icon, tooltip }) => (
              <div key={id} className="relative group flex-shrink-0">
                <button
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3.5 text-sm whitespace-nowrap border-b-2 transition-colors',
                    activeTab === id
                      ? 'border-[#FF6B35] text-[#FF6B35]'
                      : 'border-transparent text-[#8A95A5] hover:text-[#F0EDE8]',
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
                {tooltip && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-72 p-3 rounded-lg bg-[#0D1820] border border-[#27384A] text-xs text-[#8A95A5] leading-relaxed shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    {tooltip}
                  </div>
                )}
              </div>
            ))}

            {/* "Más" overflow dropdown */}
            <div ref={moreMenuRef} className="relative flex-shrink-0 ml-1">
              <button
                onClick={() => setMoreOpen(v => !v)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-3.5 text-sm whitespace-nowrap border-b-2 transition-colors',
                  MORE_NAV.some(t => t.id === activeTab)
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-[#8A95A5] hover:text-[#F0EDE8]',
                )}
              >
                Más
                <ChevronDown size={13} className={cn('transition-transform duration-200', moreOpen && 'rotate-180')} />
                {/* Dot indicator when a secondary tab is active */}
                {MORE_NAV.some(t => t.id === activeTab) && !moreOpen && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] ml-0.5" />
                )}
              </button>

              {moreOpen && (
                <div className="absolute top-full left-0 z-50 mt-1 w-52 bg-[#1A2530] border border-[#27384A] rounded-xl shadow-2xl overflow-hidden py-1">
                  {MORE_NAV.map(({ id, label, Icon, tooltip }) => (
                    <div key={id} className="relative group">
                      <button
                        onClick={() => { setActiveTab(id); setMoreOpen(false) }}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left',
                          activeTab === id
                            ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                            : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
                        )}
                      >
                        <Icon size={14} className="flex-shrink-0" />
                        {label}
                      </button>
                      {tooltip && (
                        <div className="absolute left-full top-0 z-50 ml-2 w-64 p-3 rounded-lg bg-[#0D1820] border border-[#27384A] text-xs text-[#8A95A5] leading-relaxed shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {tooltip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── TAB: Resumen ──────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Cover photo */}
              <div
                className="relative h-48 rounded-xl overflow-hidden border border-[#27384A] bg-[#1F2D3A] group cursor-pointer"
                onClick={() => coverInputRef.current?.click()}
              >
                {project.cover_photo_url ? (
                  <Image
                    src={project.cover_photo_url}
                    alt={project.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      className="text-6xl font-bold select-none"
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        color: 'transparent',
                        WebkitTextStroke: '1px rgba(255,107,53,0.3)',
                      }}
                    >
                      {project.name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                    </span>
                  </div>
                )}
                {/* Overlay with upload button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 rounded-lg bg-[#131D28]/80 border border-[#27384A] text-xs text-[#F0EDE8]">
                    {coverUploading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Camera size={13} />
                    )}
                    {project.cover_photo_url ? 'Cambiar foto de portada' : 'Subir foto de portada'}
                  </div>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>

              {/* Large progress bar */}
              <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Avance global del proyecto
                  </p>
                  <p
                    className="text-2xl font-bold text-[#FF6B35]"
                    style={{ fontFamily: 'Space Mono, monospace' }}
                  >
                    {project.progress_percentage}%
                  </p>
                </div>
                <div className="h-3 rounded-full bg-[#27384A] overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B35] rounded-full transition-all"
                    style={{ width: `${project.progress_percentage}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Avance',       value: `${project.progress_percentage}%`, Icon: TrendingUp,  color: '#FF6B35' },
                  { label: 'Inicio',       value: fmtDate(project.start_date),        Icon: Calendar,    color: '#4A9E6B' },
                  { label: 'Entrega est.', value: fmtDate(project.estimated_end),     Icon: Clock,       color: '#8A95A5' },
                  { label: 'Presupuesto',  value: fmtGtq(project.total_budget_gtq),   Icon: MapPin,      color: '#8A95A5' },
                ].map(({ label, value, Icon, color }) => (
                  <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs text-[#8A95A5]">{label}</p>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <p
                      className="text-lg font-semibold text-[#F0EDE8] truncate"
                      style={{ fontFamily: 'Montserrat, sans-serif', color }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Overview KPIs ─────────────────────────────────────────── */}
              {(() => {
                const phasesTotal     = project.phases.length
                const phasesCompleted = project.phases.filter(ph => ph.status === 'completed').length
                const recentEntries   = progress.slice(0, 3)
                const lastEntry       = progress[0]
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Fases */}
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>Fases</p>
                        <CheckCircle2 size={13} className="text-[#4A9E6B]" />
                      </div>
                      <p className="text-2xl font-bold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                        {phasesCompleted}<span className="text-sm text-[#8A95A5]">/{phasesTotal}</span>
                      </p>
                      <p className="text-[10px] text-[#8A95A5]">completadas</p>
                      {phasesTotal > 0 && (
                        <div className="h-1 rounded-full bg-[#27384A] overflow-hidden">
                          <div className="h-full bg-[#4A9E6B] rounded-full" style={{ width: `${Math.round(phasesCompleted / phasesTotal * 100)}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Última entrada bitácora */}
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>Última entrada</p>
                        <ClipboardList size={13} className="text-[#FF6B35]" />
                      </div>
                      {lastEntry ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{lastEntry.progress_pct}%</span>
                            {lastEntry.weather && <span className="text-xs text-[#8A95A5]">{lastEntry.weather}</span>}
                          </div>
                          <p className="text-[10px] text-[#8A95A5]">
                            {new Date(lastEntry.date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {lastEntry.labor_count > 0 && ` · ${lastEntry.labor_count} trabajadores`}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-[#8A95A5]">Sin entradas aún</p>
                      )}
                    </div>

                    {/* Presupuesto */}
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>Presupuesto</p>
                        <DollarSign size={13} className="text-[#6B8CFF]" />
                      </div>
                      <p className="text-lg font-bold text-[#6B8CFF] truncate" style={{ fontFamily: 'Space Mono, monospace' }}>
                        {fmtGtq(project.total_budget_gtq)}
                      </p>
                      {project.address && <p className="text-[10px] text-[#8A95A5] truncate flex items-center gap-1"><MapPin size={9} />{project.address}</p>}
                    </div>
                  </div>
                )
              })()}

              {/* ── Últimas entradas de bitácora ──────────────────────────── */}
              {progress.length > 0 && (
                <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Últimas entradas de bitácora
                    </h2>
                    <button
                      onClick={() => setActiveTab('progress')}
                      className="text-[10px] text-[#FF6B35] hover:text-[#FF8557] transition-colors flex items-center gap-1"
                    >
                      Ver todas <ChevronRight size={10} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {progress.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#131D28] border border-[#27384A]/50">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{entry.progress_pct}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs text-[#F0EDE8]">
                              {new Date(entry.date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            {entry.weather && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27384A] text-[#8A95A5]">{entry.weather}</span>
                            )}
                            {entry.labor_count > 0 && (
                              <span className="text-[10px] text-[#8A95A5] flex items-center gap-0.5"><Users size={9} />{entry.labor_count}</span>
                            )}
                          </div>
                          {entry.notes && <p className="text-[10px] text-[#8A95A5] truncate">{entry.notes}</p>}
                          {entry.activities && entry.activities.length > 0 && (
                            <p className="text-[10px] text-[#8A95A5] truncate">{entry.activities.slice(0, 3).join(' · ')}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phases + Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Phases */}
                <div className="lg:col-span-2 p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Fases del proyecto
                    </h2>
                    <button className="flex items-center gap-1 text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors">
                      <Plus size={11} />
                      Agregar fase
                    </button>
                  </div>
                  {project.phases.length === 0 ? (
                    <p className="text-xs text-[#8A95A5]">Sin fases registradas aún.</p>
                  ) : (
                    <div className="space-y-4">
                      {project.phases.map((phase) => (
                        <div key={phase.id} className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <PhaseStatusDot status={phase.status} />
                                <span className="text-xs text-[#8A95A5]">{phase.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5]">
                                  {phase.status === 'completed' ? 'Completado' : phase.status === 'active' ? 'En progreso' : 'Pendiente'}
                                </span>
                                <button className="text-[#8A95A5] hover:text-[#8A95A5] transition-colors">
                                  <Pencil size={10} />
                                </button>
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full bg-[#27384A] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: phase.status === 'completed' ? '100%' : phase.status === 'active' ? '50%' : '0%',
                                  background: phase.status === 'completed' ? '#4A9E6B' : '#FF6B35',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* PM + Client */}
                <div className="space-y-4">
                  {/* PM */}
                  {project.project_manager_name && (
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                      <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>
                        Director de proyecto
                      </p>
                      <div className="flex items-center gap-3">
                        <ERPAvatar
                          avatarUrl={project.project_manager_avatar}
                          initials={project.project_manager_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                          size="lg"
                        />
                        <div>
                          <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {project.project_manager_name}
                          </p>
                          <p className="text-xs text-[#8A95A5]">Grucore · {project.city}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Client */}
                  <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                    <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>
                      Cliente
                    </p>
                    <div className="flex items-center gap-3">
                      <ERPAvatar
                        avatarUrl={project.client.avatar_url}
                        initials={project.client.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                        size="lg"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#F0EDE8] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {project.client.name}
                        </p>
                        {project.client.email && (
                          <p className="text-xs text-[#8A95A5] truncate">{project.client.email}</p>
                        )}
                        {project.client.phone && (
                          <p className="text-xs text-[#8A95A5]">{project.client.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <h2 className="text-sm font-semibold text-[#F0EDE8] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Descripción
                  </h2>
                  <p className="text-sm text-[#8A95A5] leading-relaxed">{project.description}</p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Bitácora ───────────────────────────────────────────── */}
          {activeTab === 'progress' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Bitácora de obra
                </h2>
                <button
                  onClick={() => setShowProgressForm((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B35] text-[#131D28] text-sm font-semibold hover:bg-[#FF8557] transition-colors"
                >
                  <Plus size={14} />
                  Registrar avance
                </button>
              </div>

              {/* Create form */}
              {showProgressForm && (
                <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30">
                  <h3 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Nuevo registro de avance
                  </h3>
                  <form onSubmit={handleSubmitProgress} className="space-y-5">
                    {progressError && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        <AlertCircle size={14} />
                        {progressError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Fecha</label>
                        <input
                          type="date"
                          value={progressForm.date}
                          onChange={(e) => setP('date', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Avance % (0–100)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={progressForm.progress_pct}
                          onChange={(e) => setP('progress_pct', Number(e.target.value))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Personal en obra</label>
                        <input
                          type="number"
                          min={0}
                          value={progressForm.labor_count}
                          onChange={(e) => setP('labor_count', Number(e.target.value))}
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Clima</label>
                      <input
                        type="text"
                        value={progressForm.weather}
                        onChange={(e) => setP('weather', e.target.value)}
                        className={inputCls}
                        placeholder="Soleado, nublado, lluvioso…"
                      />
                    </div>

                    <div>
                      <label className={labelCls}>Notas</label>
                      <textarea
                        rows={3}
                        value={progressForm.notes}
                        onChange={(e) => setP('notes', e.target.value)}
                        className={cn(inputCls, 'resize-none')}
                        placeholder="Observaciones generales del día de trabajo…"
                      />
                    </div>

                    <TagInput
                      label="Actividades"
                      tags={progressForm.activities}
                      onChange={(t) => setP('activities', t)}
                      placeholder="Colada de losa, instalación de ventanas…"
                    />

                    <TagInput
                      label="Materiales"
                      tags={progressForm.materials}
                      onChange={(t) => setP('materials', t)}
                      placeholder="Block 15x20x40, cemento, arena…"
                    />

                    <PhotoUrlInput
                      urls={progressForm.photoUrls}
                      onChange={(u) => setP('photoUrls', u)}
                    />

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowProgressForm(false); setProgressError('') }}
                        className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingProgress}
                        className="px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2"
                      >
                        {savingProgress
                          ? <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                          : 'Guardar registro'
                        }
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* History */}
              {progress.length === 0 && !showProgressForm && (
                <p className="text-sm text-[#8A95A5]">Sin registros de avance aún.</p>
              )}

              {progress.map((entry) => (
                <div key={entry.id} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#FF6B35] font-medium" style={{ fontFamily: 'Space Mono, monospace' }}>
                        {fmtDate(entry.date)}
                      </p>
                      <p className="text-lg font-semibold text-[#F0EDE8] mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {entry.progress_pct}% de avance
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[#8A95A5]">
                      {entry.labor_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Users size={11} className="text-[#FF6B35]" />
                          {entry.labor_count} personas
                        </span>
                      )}
                      {entry.weather && (
                        <span className="flex items-center gap-1">
                          <CloudSun size={11} className="text-[#FF6B35]" />
                          {entry.weather}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-[#27384A] overflow-hidden mb-4">
                    <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: `${entry.progress_pct}%` }} />
                  </div>

                  {entry.notes && (
                    <p className="text-sm text-[#8A95A5] leading-relaxed mb-4">{entry.notes}</p>
                  )}

                  {entry.activities.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Hammer size={10} style={{ color: '#FF6B35' }} />
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#FF6B35' }}>Actividades</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,107,53,0.12)', color: '#FF8557' }}>
                          {entry.activities.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.activities.map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF8557' }}
                          >
                            <Hammer size={9} />
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.materials.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Package size={10} style={{ color: '#38BDF8' }} />
                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#38BDF8' }}>Materiales</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8' }}>
                          {entry.materials.length}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.materials.map((m, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.22)', color: '#38BDF8' }}
                          >
                            <Package size={9} />
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {entry.photos.map((photo) => (
                        <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden border border-[#27384A]">
                          <Image
                            src={photo.photo_url}
                            alt={photo.caption || 'Foto de obra'}
                            fill
                            className="object-cover"
                            sizes="150px"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── TAB: Hitos y pagos ──────────────────────────────────────── */}
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              {/* Financial summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total contrato', value: fmtGtq(financials.total),    color: '#F0EDE8' },
                  { label: 'Pagado',         value: fmtGtq(financials.paid),     color: '#4A9E6B' },
                  { label: 'Aprobado',       value: fmtGtq(financials.approved), color: '#FF6B35' },
                  { label: 'Pendiente',      value: fmtGtq(financials.pending),  color: '#64748b' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] text-center">
                    <p className="text-xs text-[#8A95A5] mb-2">{label}</p>
                    <p className="text-lg font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* New milestone button */}
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Hitos registrados
                </h2>
                <button
                  onClick={() => setShowMilestoneForm((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#27384A] text-sm text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"
                >
                  <Plus size={13} />
                  Nuevo hito
                </button>
              </div>

              {/* New milestone form */}
              {showMilestoneForm && (
                <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30">
                  <h3 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Nuevo hito de pago
                  </h3>
                  <form onSubmit={handleSubmitMilestone} className="space-y-4">
                    {milestoneError && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        <AlertCircle size={14} />
                        {milestoneError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Nombre <span className="text-[#FF6B35]">*</span></label>
                        <input
                          required
                          type="text"
                          value={milestoneForm.name}
                          onChange={(e) => setM('name', e.target.value)}
                          className={inputCls}
                          placeholder="Ej. Pago inicial"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Monto GTQ <span className="text-[#FF6B35]">*</span></label>
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={milestoneForm.amount_gtq}
                          onChange={(e) => setM('amount_gtq', e.target.value)}
                          className={inputCls}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Descripción</label>
                      <input
                        type="text"
                        value={milestoneForm.description}
                        onChange={(e) => setM('description', e.target.value)}
                        className={inputCls}
                        placeholder="Descripción del hito…"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Orden</label>
                        <input
                          type="number"
                          min="1"
                          value={milestoneForm.order}
                          onChange={(e) => setM('order', e.target.value)}
                          className={inputCls}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>% avance requerido</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={milestoneForm.progress_required_pct}
                          onChange={(e) => setM('progress_required_pct', e.target.value)}
                          className={inputCls}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Fecha estimada</label>
                        <input
                          type="date"
                          value={milestoneForm.due_date}
                          onChange={(e) => setM('due_date', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Fase vinculada</label>
                        <select
                          value={milestoneForm.phase}
                          onChange={(e) => setM('phase', e.target.value)}
                          className={cn(inputCls, 'cursor-pointer')}
                        >
                          <option value="">Sin fase</option>
                          {project.phases.map((ph) => (
                            <option key={ph.id} value={ph.id}>{ph.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Notas internas</label>
                        <input
                          type="text"
                          value={milestoneForm.notes}
                          onChange={(e) => setM('notes', e.target.value)}
                          className={inputCls}
                          placeholder="Condiciones, observaciones…"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => { setShowMilestoneForm(false); setMilestoneError('') }}
                        className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={savingMilestone}
                        className="px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2"
                      >
                        {savingMilestone
                          ? <><Loader2 size={14} className="animate-spin" /> Creando…</>
                          : <><Plus size={14} /> Crear hito</>
                        }
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Milestone list */}
              {project.milestones.length === 0 ? (
                <p className="text-sm text-[#8A95A5]">Sin hitos de pago registrados aún.</p>
              ) : (
                <div className="space-y-4">
                  {project.milestones.map((milestone, idx) => {
                    const approval     = milestone.approval
                    const canSign      = (milestone.status === 'evidence_submitted' || milestone.status === 'awaiting_approval') && !approval?.company_approved_at
                    const canMarkPaid  = milestone.status === 'approved'
                    const evForm       = evidenceForms[milestone.id] ?? { url: '', caption: '' }
                    const uploading    = uploadingEvidence[milestone.id] ?? false

                    return (
                      <div
                        key={milestone.id}
                        className={cn(
                          'rounded-xl border bg-[#1F2D3A] transition-colors',
                          canSign ? 'border-[#FF6B35]/40' : 'border-[#27384A]',
                        )}
                      >
                        {/* Header */}
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                          <span
                            className="text-3xl font-bold flex-shrink-0 leading-none"
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: 'transparent',
                              WebkitTextStroke: `1px ${
                                canSign                              ? '#FF6B35'
                                : milestone.status === 'paid'        ? 'rgba(74,158,107,0.7)'
                                : milestone.status === 'approved'    ? 'rgba(255,107,53,0.6)'
                                :                                      'rgba(255,107,53,0.45)'
                              }`,
                            }}
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#F0EDE8' }}>
                                {milestone.name}
                              </h3>
                              <MilestoneStatusChip status={milestone.status} />
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-[#8A95A5]">
                              {milestone.phase_name && (
                                <span className="flex items-center gap-1">
                                  <ChevronRight size={10} className="text-[#FF6B35]" />
                                  {milestone.phase_name}
                                </span>
                              )}
                              {milestone.progress_required_pct > 0 && (
                                <span className="flex items-center gap-1">
                                  <TrendingUp size={10} className="text-[#FF6B35]" />
                                  Requiere {milestone.progress_required_pct}%
                                </span>
                              )}
                              {milestone.due_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={10} className="text-[#FF6B35]" />
                                  {fmtDate(milestone.due_date)}
                                </span>
                              )}
                              {milestone.paid_at && (
                                <span className="flex items-center gap-1 text-[#4A9E6B]">
                                  <CheckCircle2 size={10} />
                                  Pagado el {fmtDate(milestone.paid_at)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="text-lg font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
                              {fmtGtq(milestone.amount_gtq)}
                            </p>
                            <p className="text-[10px] text-[#8A95A5]">{milestone.percentage_of_total}% del contrato</p>
                          </div>
                        </div>

                        {/* Signatures row */}
                        {(approval || milestone.status !== 'pending') && (
                          <div className="border-t border-[#27384A] px-5 py-3 flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-xs">
                              {approval?.company_approved_at
                                ? <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                                : <Clock size={12} className="text-[#8A95A5]" />}
                              <span className={approval?.company_approved_at ? 'text-[#4A9E6B]' : 'text-[#8A95A5]'}>
                                Constructora: {approval?.company_approved_at
                                  ? `${approval.company_approved_by_name ?? 'Firmado'} · ${fmtDate(approval.company_approved_at)}`
                                  : 'Pendiente'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {approval?.client_approved_at
                                ? <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                                : <Clock size={12} className="text-[#8A95A5]" />}
                              <span className={approval?.client_approved_at ? 'text-[#4A9E6B]' : 'text-[#8A95A5]'}>
                                Cliente: {approval?.client_approved_at
                                  ? `Firmado · ${fmtDate(approval.client_approved_at)}`
                                  : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Evidence photo strip */}
                        {milestone.evidence.length > 0 && (
                          <div className="border-t border-[#27384A] px-5 py-3">
                            <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-2">
                              {milestone.evidence.length} foto{milestone.evidence.length > 1 ? 's' : ''} de evidencia
                            </p>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                              {milestone.evidence.map((ev) => (
                                <div key={ev.id} className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#27384A]">
                                  <Image src={ev.photo_url} alt={ev.caption || 'Evidencia'} fill className="object-cover" sizes="80px" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Upload evidence (pending / evidence_submitted) */}
                        {(milestone.status === 'pending' || milestone.status === 'evidence_submitted') && (
                          <div className="border-t border-[#27384A] px-5 py-4 bg-[#1A2530]/50">
                            <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-3">
                              Subir evidencia fotográfica
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={evForm.url}
                                onChange={(e) => setEvidenceForms((f) => ({ ...f, [milestone.id]: { ...evForm, url: e.target.value } }))}
                                placeholder="URL de la foto…"
                                className="flex-1 bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                              />
                              <input
                                type="text"
                                value={evForm.caption}
                                onChange={(e) => setEvidenceForms((f) => ({ ...f, [milestone.id]: { ...evForm, caption: e.target.value } }))}
                                placeholder="Descripción (opcional)"
                                className="w-40 bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors hidden sm:block"
                              />
                              <button
                                onClick={() => handleUploadEvidence(milestone.id)}
                                disabled={uploading || !evForm.url}
                                className="px-4 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                              >
                                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                                Subir foto
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Company signature */}
                        {canSign && (
                          <div className="border-t border-[#27384A] px-5 py-4 bg-[#FF6B35]/5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs text-[#FF6B35] font-semibold mb-0.5">Firma pendiente de constructora</p>
                                <p className="text-[11px] text-[#8A95A5]">Verifica la evidencia y firma para continuar el flujo de aprobación.</p>
                              </div>
                              <button
                                onClick={() => setCompanySignModal(milestone)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] transition-colors whitespace-nowrap flex-shrink-0"
                              >
                                <ShieldCheck size={13} />
                                Firmar como constructora
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Mark as paid */}
                        {canMarkPaid && (
                          <div className="border-t border-[#27384A] px-5 py-4 bg-[#4A9E6B]/5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs text-[#4A9E6B] font-semibold mb-0.5">Hito aprobado — en espera de confirmación de pago</p>
                                <p className="text-[11px] text-[#8A95A5]">Cuando recibas el pago del cliente, confirma aquí.</p>
                              </div>
                              <button
                                onClick={() => setMarkPaidModal(milestone)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#4A9E6B] text-white text-xs font-semibold rounded-lg hover:bg-[#5BB87C] transition-colors whitespace-nowrap flex-shrink-0"
                              >
                                <CheckCircle2 size={13} />
                                Confirmar pago recibido
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: RFIs ───────────────────────────────────────────────── */}
          {activeTab === 'rfis' && project && (
            <RFIsTab
              projectId={project.id}
              rfis={rfis}
              onRFIsChange={setRfis}
            />
          )}
          {activeTab === 'rfis' && project && false && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-lg font-semibold text-[#F0EDE8]">
                  Solicitudes de información
                </h2>
                <div className="flex items-center gap-2">
                  <ViewToggle mode={rfiViewMode} onChange={setRfiViewMode} />
                  <button onClick={() => setShowRFIForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
                    <Plus size={14} /> Nueva RFI
                  </button>
                </div>
              </div>

              {showRFIForm && (
                <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
                  <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nueva RFI</p>
                  {rfiError && <p className="text-xs text-red-400">{rfiError}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Asunto <span className="text-[#FF6B35]">*</span></label>
                      <input type="text" value={rfiSubject} onChange={e => setRfiSubject(e.target.value)}
                        className={inputCls} placeholder="Descripción breve de la consulta…" />
                    </div>
                    <div>
                      <label className={labelCls}>Prioridad</label>
                      <select value={rfiPriority} onChange={e => setRfiPriority(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Fecha límite (opcional)</label>
                    <input type="date" value={rfiDueDate} onChange={e => setRfiDueDate(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Descripción / consulta <span className="text-[#FF6B35]">*</span></label>
                    <textarea rows={4} value={rfiDescription} onChange={e => setRfiDescription(e.target.value)}
                      className={cn(inputCls, 'resize-none')} placeholder="Detalle la consulta técnica o de diseño…" />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => { setShowRFIForm(false); setRfiError('') }}
                      className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">
                      Cancelar
                    </button>
                    <button disabled={savingRFI || !rfiSubject.trim() || !rfiDescription.trim()}
                      onClick={async () => {
                        if (!project) return
                        setSavingRFI(true); setRfiError('')
                        try {
                          const newRFI = await createRFI(project.id, {
                            subject: rfiSubject, description: rfiDescription,
                            priority: rfiPriority,
                            due_date: rfiDueDate || null,
                          })
                          setRfis(prev => [newRFI, ...prev])
                          setRfiSubject(''); setRfiDescription(''); setRfiPriority('medium'); setRfiDueDate('')
                          setShowRFIForm(false)
                        } catch (e: any) { setRfiError(e.message) }
                        finally { setSavingRFI(false) }
                      }}
                      className="px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
                      {savingRFI ? <><Loader2 size={14} className="animate-spin" />Creando…</> : <><Plus size={14} />Crear RFI</>}
                    </button>
                  </div>
                </div>
              )}

              {rfis.length === 0 ? (
                <p className="text-sm text-[#8A95A5] py-8 text-center">Sin solicitudes de información registradas.</p>
              ) : rfiViewMode === 'grid' ? (
                rfis.map(rfi => (
                  <div key={rfi.id} className={cn(
                    'rounded-xl border bg-[#1F2D3A] p-5',
                    rfi.status === 'open' || rfi.status === 'in_review' ? 'border-[#FF6B35]/30' : 'border-[#27384A]'
                  )}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>RFI-{String(rfi.number).padStart(3,'0')}</span>
                        <RFIStatusChip status={rfi.status} />
                        {(rfi.priority === 'urgent' || rfi.priority === 'high') && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
                            {rfi.priority === 'urgent' ? 'Urgente' : 'Alta'}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8A95A5] flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(rfi.created_at)}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#F0EDE8] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{rfi.subject}</h3>
                    <p className="text-xs text-[#8A95A5] leading-relaxed mb-3">{rfi.description}</p>
                    {rfi.answer && (
                      <div className="p-3 rounded-lg bg-[#4A9E6B]/5 border border-[#4A9E6B]/20 mb-3">
                        <p className="text-[10px] text-[#4A9E6B] mb-1">Respuesta · {fmtDate(rfi.answered_at)} — {rfi.answered_by_name}</p>
                        <p className="text-xs text-[#F0EDE8] leading-relaxed">{rfi.answer}</p>
                      </div>
                    )}
                    {(rfi.status === 'open' || rfi.status === 'in_review') && (
                      <button onClick={() => setAnswerModal(rfi)}
                        className="flex items-center gap-2 px-3 py-1.5 border border-[#FF6B35]/30 text-xs text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors">
                        <MessageSquare size={11} /> Responder
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-[#27384A] overflow-hidden">
                  {rfis.map((rfi, i) => (
                    <div key={rfi.id} className={cn(
                      'flex items-center gap-4 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors',
                      i > 0 && 'border-t border-[#27384A]'
                    )}>
                      <span className="text-[10px] text-[#FF6B35] flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>RFI-{String(rfi.number).padStart(3,'0')}</span>
                      <p className="flex-1 text-sm text-[#F0EDE8] font-medium truncate">{rfi.subject}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(rfi.priority === 'urgent' || rfi.priority === 'high') && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium hidden sm:inline">
                            {rfi.priority === 'urgent' ? 'Urgente' : 'Alta'}
                          </span>
                        )}
                        {rfi.answer && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4A9E6B]/15 text-[#4A9E6B] hidden md:inline">Respondida</span>}
                        <RFIStatusChip status={rfi.status} />
                        <span className="text-[10px] text-[#8A95A5] hidden lg:inline" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(rfi.created_at)}</span>
                        {(rfi.status === 'open' || rfi.status === 'in_review') && (
                          <button onClick={() => setAnswerModal(rfi)}
                            className="flex items-center gap-1 px-2 py-1 border border-[#FF6B35]/30 text-[9px] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors">
                            <MessageSquare size={9} /> Responder
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Órdenes de cambio ──────────────────────────────────── */}
          {activeTab === 'change_orders' && project && (
            <ChangeOrdersTab
              projectId={project.id}
              changeOrders={changeOrders}
              phases={project.phases}
              onChangeOrdersChange={setChangeOrders}
            />
          )}
          {activeTab === 'change_orders' && project && false && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-lg font-semibold text-[#F0EDE8]">
                  Órdenes de cambio
                </h2>
                <div className="flex items-center gap-2">
                  <ViewToggle mode={coViewMode} onChange={setCoViewMode} />
                  <button onClick={() => setShowCOForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
                    <Plus size={14} /> Nueva OC
                  </button>
                </div>
              </div>

              {showCOForm && (
                <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
                  <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nueva orden de cambio</p>
                  {coError && <p className="text-xs text-red-400">{coError}</p>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
                      <input type="text" value={coTitle} onChange={e => setCoTitle(e.target.value)} className={inputCls} placeholder="Resumen breve de la orden…" />
                    </div>
                    <div>
                      <label className={labelCls}>Razón</label>
                      <select value={coReason} onChange={e => setCoReason(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                        <option value="scope_change">Cambio de alcance</option>
                        <option value="owner_request">Solicitud del cliente</option>
                        <option value="unforeseen_condition">Condición imprevista</option>
                        <option value="design_error">Error de diseño</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Descripción <span className="text-[#FF6B35]">*</span></label>
                    <textarea rows={3} value={coDescription} onChange={e => setCoDescription(e.target.value)}
                      className={cn(inputCls, 'resize-none')} placeholder="Detalle los cambios y justificación…" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Monto GTQ (puede ser negativo)</label>
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
                        {project?.phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => { setShowCOForm(false); setCoError('') }}
                      className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">
                      Cancelar
                    </button>
                    <button disabled={savingCO || !coTitle.trim() || !coDescription.trim()}
                      onClick={async () => {
                        if (!project) return
                        setSavingCO(true); setCoError('')
                        try {
                          const newCO = await createChangeOrder(project.id, {
                            title: coTitle, description: coDescription, reason: coReason,
                            amount_gtq: coAmount || '0',
                            schedule_days_impact: Number(coDays) || 0,
                            phase: coPhase ? Number(coPhase) : null,
                          })
                          setChangeOrders(prev => [newCO, ...prev])
                          setCoTitle(''); setCoDescription(''); setCoReason('scope_change'); setCoAmount(''); setCoDays('0'); setCoPhase('')
                          setShowCOForm(false)
                        } catch (e: any) { setCoError(e.message) }
                        finally { setSavingCO(false) }
                      }}
                      className="px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
                      {savingCO ? <><Loader2 size={14} className="animate-spin" />Creando…</> : <><Plus size={14} />Crear OC</>}
                    </button>
                  </div>
                </div>
              )}

              {changeOrders.length === 0 ? (
                <p className="text-sm text-[#8A95A5] py-8 text-center">Sin órdenes de cambio registradas.</p>
              ) : coViewMode === 'grid' ? (
                changeOrders.map(co => {
                  const approval = co.approval
                  const canSubmit = co.status === 'draft'
                  const canSign = (co.status === 'submitted' || co.status === 'in_review') && !approval?.company_approved_at
                  const reasonLabel: Record<string, string> = {
                    scope_change: 'Cambio de alcance', owner_request: 'Solicitud del cliente',
                    unforeseen_condition: 'Condición imprevista', design_error: 'Error de diseño', other: 'Otro',
                  }
                  return (
                    <div key={co.id} className={cn('rounded-xl border bg-[#1F2D3A]', canSign ? 'border-[#FF6B35]/40' : 'border-[#27384A]')}>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>OC-{String(co.number).padStart(3,'0')}</span>
                            <COStatusChip status={co.status} />
                          </div>
                          <span className="text-[10px] text-[#8A95A5] flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(co.created_at)}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-[#F0EDE8] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>{co.title}</h3>
                        <p className="text-xs text-[#8A95A5] leading-relaxed mb-3">{co.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs mb-3">
                          <span className="text-[#8A95A5]">Razón: <span className="text-[#F0EDE8]">{reasonLabel[co.reason] ?? co.reason}</span></span>
                          <span className={Number(co.amount_gtq) >= 0 ? 'text-amber-400' : 'text-[#4A9E6B]'} style={{ fontFamily: 'Space Mono, monospace' }}>
                            {Number(co.amount_gtq) >= 0 ? '+' : ''}Q {Number(co.amount_gtq).toLocaleString('es-GT')}
                          </span>
                          <span className="text-[#8A95A5]">
                            Plazo: <span className="text-[#F0EDE8]">{co.schedule_days_impact > 0 ? '+' : ''}{co.schedule_days_impact} días</span>
                          </span>
                        </div>
                        {canSubmit && (
                          <button onClick={async () => {
                            if (!project) return
                            try {
                              const updated = await submitChangeOrder(project.id, co.id)
                              setChangeOrders(prev => prev.map(c => c.id === updated.id ? updated : c))
                            } catch {}
                          }}
                            className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/30 text-xs text-amber-400 rounded-lg hover:bg-amber-500/5 transition-colors">
                            <Send size={11} /> Enviar para aprobación
                          </button>
                        )}
                        {canSign && (
                          <button onClick={() => setCOSignModal(co)}
                            className="flex items-center gap-2 px-3 py-1.5 border border-[#FF6B35]/30 text-xs text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors">
                            <ShieldCheck size={11} /> Firmar como constructora
                          </button>
                        )}
                      </div>
                      {(approval || co.status !== 'draft') && (
                        <div className="border-t border-[#27384A] px-5 py-3 flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2 text-xs">
                            {approval?.company_approved_at
                              ? <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                              : <Clock size={12} className="text-[#8A95A5]" />}
                            <span className={approval?.company_approved_at ? 'text-[#4A9E6B]' : 'text-[#8A95A5]'}>
                              Constructora: {approval?.company_approved_at
                                ? `${approval.company_approved_by_name ?? 'Firmado'} · ${fmtDate(approval.company_approved_at)}`
                                : 'Pendiente'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {approval?.client_approved_at
                              ? <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                              : <Clock size={12} className="text-[#8A95A5]" />}
                            <span className={approval?.client_approved_at ? 'text-[#4A9E6B]' : 'text-[#8A95A5]'}>
                              Cliente: {approval?.client_approved_at ? `Firmado · ${fmtDate(approval.client_approved_at)}` : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="rounded-xl border border-[#27384A] overflow-hidden">
                  {changeOrders.map((co, i) => {
                    const canSubmit = co.status === 'draft'
                    const canSign = (co.status === 'submitted' || co.status === 'in_review') && !co.approval?.company_approved_at
                    return (
                      <div key={co.id} className={cn(
                        'flex items-center gap-4 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors',
                        i > 0 && 'border-t border-[#27384A]',
                        canSign && 'border-l-2 border-l-[#FF6B35]'
                      )}>
                        <span className="text-[10px] text-[#FF6B35] flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>OC-{String(co.number).padStart(3,'0')}</span>
                        <p className="flex-1 text-sm text-[#F0EDE8] font-medium truncate">{co.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={cn('text-xs hidden sm:inline', Number(co.amount_gtq) >= 0 ? 'text-amber-400' : 'text-[#4A9E6B]')} style={{ fontFamily: 'Space Mono, monospace' }}>
                            {Number(co.amount_gtq) >= 0 ? '+' : ''}Q {Number(co.amount_gtq).toLocaleString('es-GT')}
                          </span>
                          <COStatusChip status={co.status} />
                          <span className="text-[10px] text-[#8A95A5] hidden lg:inline" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(co.created_at)}</span>
                          {canSubmit && (
                            <button onClick={async () => {
                              if (!project) return
                              try {
                                const updated = await submitChangeOrder(project.id, co.id)
                                setChangeOrders(prev => prev.map(c => c.id === updated.id ? updated : c))
                              } catch {}
                            }}
                              className="flex items-center gap-1 px-2 py-1 border border-amber-500/30 text-[9px] text-amber-400 rounded-lg hover:bg-amber-500/5 transition-colors">
                              <Send size={9} /> Enviar
                            </button>
                          )}
                          {canSign && (
                            <button onClick={() => setCOSignModal(co)}
                              className="flex items-center gap-1 px-2 py-1 border border-[#FF6B35]/30 text-[9px] text-[#FF6B35] rounded-lg hover:bg-[#FF6B35]/5 transition-colors">
                              <ShieldCheck size={9} /> Firmar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Gastos ─────────────────────────────────────────────── */}
          {activeTab === 'expenses' && project && (
            <ExpensesTab
              projectId={project.id}
              expenses={expenses}
              invoices={invoices}
              onExpensesChange={setExpenses}
              onInvoicesChange={setInvoices}
            />
          )}
          {activeTab === 'expenses' && project && false && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: 'Montserrat, sans-serif' }} className="text-lg font-semibold text-[#F0EDE8]">
                  Gastos y facturas
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setExpensesSubTab('expenses')}
                    className={cn('px-4 py-2 text-sm rounded-lg font-medium transition-colors',
                      expensesSubTab === 'expenses' ? 'bg-[#FF6B35] text-[#1A2530]' : 'border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}>
                    Gastos
                  </button>
                  <button onClick={() => setExpensesSubTab('invoices')}
                    className={cn('px-4 py-2 text-sm rounded-lg font-medium transition-colors',
                      expensesSubTab === 'invoices' ? 'bg-[#FF6B35] text-[#1A2530]' : 'border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}>
                    Facturas
                  </button>
                </div>
              </div>

              {/* SUB-TAB: Gastos */}
              {expensesSubTab === 'expenses' && (
                <div className="space-y-4">
                  {expenses.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total gastos', value: fmtGtq(expenses.reduce((s, e) => s + Number(e.amount_gtq), 0)), color: '#F0EDE8' },
                        { label: 'Aprobado',     value: fmtGtq(expenses.filter(e => e.status === 'approved' || e.status === 'reimbursed').reduce((s, e) => s + Number(e.amount_gtq), 0)), color: '#4A9E6B' },
                        { label: 'Pendiente',    value: fmtGtq(expenses.filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.amount_gtq), 0)), color: '#FF6B35' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A] text-center">
                          <p className="text-xs text-[#8A95A5] mb-1">{label}</p>
                          <p className="text-base font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <ViewToggle mode={expViewMode} onChange={setExpViewMode} />
                    <button onClick={() => setShowExpenseForm(v => !v)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
                      <Plus size={14} /> Nuevo gasto
                    </button>
                  </div>

                  {showExpenseForm && (
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
                      <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Registrar gasto</p>
                      {expenseError && <p className="text-xs text-red-400">{expenseError}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Categoría</label>
                          <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                            <option value="materials">Materiales</option>
                            <option value="labor">Mano de obra</option>
                            <option value="equipment">Equipo y maquinaria</option>
                            <option value="subcontractor">Subcontratista</option>
                            <option value="permits">Permisos y trámites</option>
                            <option value="transportation">Transporte</option>
                            <option value="utilities">Servicios</option>
                            <option value="other">Otro</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Monto GTQ <span className="text-[#FF6B35]">*</span></label>
                          <input type="number" min="0" step="0.01" value={expAmount} onChange={e => setExpAmount(e.target.value)} className={inputCls} placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Descripción <span className="text-[#FF6B35]">*</span></label>
                        <input type="text" value={expDescription} onChange={e => setExpDescription(e.target.value)} className={inputCls} placeholder="Detalle del gasto…" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Fecha del gasto</label>
                          <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>URL del recibo (opcional)</label>
                          <input type="url" value={expReceiptUrl} onChange={e => setExpReceiptUrl(e.target.value)} className={inputCls} placeholder="https://…" />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Notas (opcional)</label>
                        <textarea rows={2} value={expNotes} onChange={e => setExpNotes(e.target.value)} className={cn(inputCls, 'resize-none')} />
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => { setShowExpenseForm(false); setExpenseError('') }}
                          className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                        <button disabled={savingExpense || !expDescription.trim() || !expAmount}
                          onClick={async () => {
                            if (!project) return
                            setSavingExpense(true); setExpenseError('')
                            try {
                              const newExp = await createExpense(project.id, {
                                category: expCategory, description: expDescription,
                                amount_gtq: expAmount, expense_date: expDate,
                                receipt_url: expReceiptUrl || undefined,
                                notes: expNotes || undefined,
                              })
                              setExpenses(prev => [newExp, ...prev])
                              setExpCategory('materials'); setExpDescription(''); setExpAmount(''); setExpDate(todayStr()); setExpReceiptUrl(''); setExpNotes('')
                              setShowExpenseForm(false)
                            } catch (e: any) { setExpenseError(e.message) }
                            finally { setSavingExpense(false) }
                          }}
                          className="px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
                          {savingExpense ? <><Loader2 size={14} className="animate-spin" />Guardando…</> : <><Plus size={14} />Guardar gasto</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {expenses.length === 0 ? (
                    <p className="text-sm text-[#8A95A5] py-8 text-center">Sin gastos registrados.</p>
                  ) : (() => {
                    const catLabel: Record<string, string> = {
                      materials: 'Materiales', labor: 'Mano de obra', equipment: 'Equipo y maquinaria',
                      subcontractor: 'Subcontratista', permits: 'Permisos y trámites',
                      transportation: 'Transporte', utilities: 'Servicios', other: 'Otro',
                    }
                    const catColor: Record<string, string> = {
                      materials: '#6B8CFF', labor: '#FF6B35', equipment: '#8B5CF6',
                      subcontractor: '#F59E0B', permits: '#EC4899', transportation: '#14B8A6',
                      utilities: '#4A9E6B', other: '#8A95A5',
                    }
                    const approveExp = async (exp: Expense) => {
                      if (!project) return
                      try {
                        const updated = await approveExpense(project.id, exp.id)
                        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e))
                      } catch {}
                    }
                    return expViewMode === 'list' ? (
                      <div className="space-y-2">
                        {expenses.map(exp => (
                          <div key={exp.id} className="rounded-xl border border-[#27384A] bg-[#1F2D3A] p-4 flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${catColor[exp.category] ?? '#8A95A5'}20`, color: catColor[exp.category] ?? '#8A95A5' }}>{catLabel[exp.category] ?? exp.category}</span>
                                <ExpenseStatusChip status={exp.status} />
                              </div>
                              <p className="text-sm text-[#F0EDE8] font-medium">{exp.description}</p>
                              <p className="text-[10px] text-[#8A95A5] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(exp.expense_date)}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <p className="text-sm font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(exp.amount_gtq)}</p>
                              {exp.status === 'pending' && (
                                <button onClick={() => approveExp(exp)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#4A9E6B]/30 text-xs text-[#4A9E6B] rounded-lg hover:bg-[#4A9E6B]/5 transition-colors">
                                  <Check size={11} /> Aprobar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {expenses.map(exp => (
                          <div key={exp.id} className="rounded-xl border border-[#27384A] bg-[#1F2D3A] overflow-hidden">
                            <div className="h-1" style={{ background: catColor[exp.category] ?? '#8A95A5' }} />
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${catColor[exp.category] ?? '#8A95A5'}20`, color: catColor[exp.category] ?? '#8A95A5' }}>{catLabel[exp.category] ?? exp.category}</span>
                                <ExpenseStatusChip status={exp.status} />
                              </div>
                              <p className="text-sm text-[#F0EDE8] font-medium mb-1 line-clamp-2">{exp.description}</p>
                              <p className="text-xl font-bold text-[#FF6B35] mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(exp.amount_gtq)}</p>
                              <div className="flex items-center justify-between text-[10px] text-[#8A95A5]">
                                <span style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(exp.expense_date)}</span>
                                {exp.status === 'pending' && (
                                  <button onClick={() => approveExp(exp)}
                                    className="flex items-center gap-1 px-2 py-1 border border-[#4A9E6B]/30 text-[#4A9E6B] rounded-lg hover:bg-[#4A9E6B]/5 transition-colors">
                                    <Check size={10} /> Aprobar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* SUB-TAB: Facturas */}
              {expensesSubTab === 'invoices' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <ViewToggle mode={invViewMode} onChange={setInvViewMode} />
                    <button onClick={() => setShowInvoiceForm(v => !v)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
                      <Plus size={14} /> Nueva factura
                    </button>
                  </div>

                  {showInvoiceForm && (
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
                      <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nueva factura</p>
                      {invoiceError && <p className="text-xs text-red-400">{invoiceError}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Número de factura <span className="text-[#FF6B35]">*</span></label>
                          <input type="text" value={invNumber} onChange={e => setInvNumber(e.target.value)} className={inputCls} placeholder="FAC-001" />
                        </div>
                        <div>
                          <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
                          <input type="text" value={invTitle} onChange={e => setInvTitle(e.target.value)} className={inputCls} placeholder="Ej. Pago hito 1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelCls}>Monto GTQ <span className="text-[#FF6B35]">*</span></label>
                          <input type="number" min="0" step="0.01" value={invAmount} onChange={e => setInvAmount(e.target.value)} className={inputCls} placeholder="0.00" />
                        </div>
                        <div>
                          <label className={labelCls}>IVA %</label>
                          <input type="number" min="0" max="100" value={invTax} onChange={e => setInvTax(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Fecha emisión</label>
                          <input type="date" value={invIssueDate} onChange={e => setInvIssueDate(e.target.value)} className={inputCls} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Fecha vencimiento (opcional)</label>
                          <input type="date" value={invDueDate} onChange={e => setInvDueDate(e.target.value)} className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Descripción (opcional)</label>
                          <input type="text" value={invDescription} onChange={e => setInvDescription(e.target.value)} className={inputCls} placeholder="Notas de la factura…" />
                        </div>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button onClick={() => { setShowInvoiceForm(false); setInvoiceError('') }}
                          className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                        <button disabled={savingInvoice || !invNumber.trim() || !invTitle.trim() || !invAmount}
                          onClick={async () => {
                            if (!project) return
                            setSavingInvoice(true); setInvoiceError('')
                            try {
                              const newInv = await createInvoice(project.id, {
                                invoice_number: invNumber, title: invTitle, amount_gtq: invAmount,
                                issue_date: invIssueDate, tax_percentage: invTax || '12',
                                due_date: invDueDate || null,
                                description: invDescription || undefined,
                              })
                              setInvoices(prev => [newInv, ...prev])
                              setInvNumber(''); setInvTitle(''); setInvAmount(''); setInvIssueDate(todayStr()); setInvDueDate(''); setInvTax('12'); setInvDescription('')
                              setShowInvoiceForm(false)
                            } catch (e: any) { setInvoiceError(e.message) }
                            finally { setSavingInvoice(false) }
                          }}
                          className="px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
                          {savingInvoice ? <><Loader2 size={14} className="animate-spin" />Creando…</> : <><Plus size={14} />Crear factura</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {invoices.length === 0 ? (
                    <p className="text-sm text-[#8A95A5] py-8 text-center">Sin facturas registradas.</p>
                  ) : (() => {
                    const invStatusColor: Record<string, string> = {
                      draft: '#8A95A5', sent: '#6B8CFF', viewed: '#F59E0B',
                      paid: '#4A9E6B', overdue: '#f87171', cancelled: '#4A5568',
                    }
                    const markPaid = async (inv: Invoice) => {
                      if (!project) return
                      try {
                        const updated = await markInvoicePaid(project.id, inv.id)
                        setInvoices(prev => prev.map(i => i.id === updated.id ? updated : i))
                      } catch {}
                    }
                    return invViewMode === 'list' ? (
                      <div className="space-y-2">
                        {invoices.map(inv => (
                          <div key={inv.id} className="rounded-xl border border-[#27384A] bg-[#1F2D3A] p-4 flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{inv.invoice_number}</span>
                                <InvoiceStatusChip status={inv.status} />
                                {inv.is_overdue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">Vencida</span>}
                              </div>
                              <p className="text-sm text-[#F0EDE8] font-medium">{inv.title}</p>
                              <p className="text-[10px] text-[#8A95A5] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
                                Emisión: {fmtDate(inv.issue_date)}{inv.due_date ? ` · Vence: ${fmtDate(inv.due_date)}` : ''}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <p className="text-sm font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(inv.amount_gtq)}</p>
                              <p className="text-[10px] text-[#4A9E6B]" style={{ fontFamily: 'Space Mono, monospace' }}>Total c/IVA: {fmtGtq(inv.total_with_tax)}</p>
                              {(inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'overdue') && (
                                <button onClick={() => markPaid(inv)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#4A9E6B]/30 text-xs text-[#4A9E6B] rounded-lg hover:bg-[#4A9E6B]/5 transition-colors">
                                  <Check size={11} /> Marcar como pagada
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invoices.map(inv => (
                          <div key={inv.id} className="rounded-xl border border-[#27384A] bg-[#1F2D3A] overflow-hidden">
                            <div className="h-1" style={{ background: invStatusColor[inv.status] ?? '#8A95A5' }} />
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{inv.invoice_number}</span>
                                <InvoiceStatusChip status={inv.status} />
                              </div>
                              {inv.is_overdue && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium mb-2 inline-block">Vencida</span>
                              )}
                              <p className="text-sm text-[#F0EDE8] font-medium mb-1 line-clamp-2">{inv.title}</p>
                              <p className="text-xl font-bold mb-1" style={{ fontFamily: 'Space Mono, monospace', color: inv.status === 'paid' ? '#4A9E6B' : '#FF6B35' }}>{fmtGtq(inv.amount_gtq)}</p>
                              <p className="text-[10px] text-[#4A9E6B] mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>c/IVA: {fmtGtq(inv.total_with_tax)}</p>
                              <div className="flex items-center justify-between text-[10px] text-[#8A95A5]">
                                <span style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(inv.issue_date)}</span>
                                {(inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'overdue') && (
                                  <button onClick={() => markPaid(inv)}
                                    className="flex items-center gap-1 px-2 py-1 border border-[#4A9E6B]/30 text-[#4A9E6B] rounded-lg hover:bg-[#4A9E6B]/5 transition-colors">
                                    <Check size={10} /> Pagar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Reportes ───────────────────────────────────────────── */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Reportes del proyecto
              </h2>

              {/* Budget overview */}
              {(() => {
                const totalBudget   = Number(project.total_budget_gtq)
                const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount_gtq), 0)
                const approvedExp   = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + Number(e.amount_gtq), 0)
                const pctUsed       = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
                const remaining     = Math.max(totalBudget - totalExpenses, 0)

                return (
                  <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                    <h3 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Presupuesto vs Gastos
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                      {[
                        { label: 'Presupuesto total',   value: `Q ${totalBudget.toLocaleString('es-GT')}`,   color: '#F0EDE8' },
                        { label: 'Gastos registrados',  value: `Q ${totalExpenses.toLocaleString('es-GT')}`, color: '#FF6B35' },
                        { label: 'Gastos aprobados',    value: `Q ${approvedExp.toLocaleString('es-GT')}`,   color: '#4A9E6B' },
                        { label: 'Disponible est.',     value: `Q ${remaining.toLocaleString('es-GT')}`,     color: pctUsed > 80 ? '#f87171' : '#8A95A5' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="text-center">
                          <p className="text-[10px] text-[#8A95A5] mb-1">{label}</p>
                          <p className="text-base font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Budget bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-[10px] text-[#8A95A5] mb-1">
                        <span>Utilización del presupuesto</span>
                        <span style={{ fontFamily: 'Space Mono, monospace', color: pctUsed > 80 ? '#f87171' : '#FF6B35' }}>{pctUsed.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-[#27384A] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pctUsed}%`,
                            background: pctUsed > 90 ? '#ef4444' : pctUsed > 70 ? '#f59e0b' : '#FF6B35',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Expenses by category */}
              {expenses.length > 0 && (() => {
                const CATEGORY_LABELS: Record<string, string> = {
                  materials: 'Materiales', labor: 'Mano de obra', equipment: 'Equipo',
                  subcontractor: 'Subcontratista', permits: 'Permisos', transportation: 'Transporte',
                  utilities: 'Servicios', other: 'Otro',
                }
                const byCategory = expenses.reduce((acc, e) => {
                  acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount_gtq)
                  return acc
                }, {} as Record<string, number>)
                const maxVal = Math.max(...Object.values(byCategory))
                const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

                return (
                  <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                    <h3 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Gastos por categoría
                    </h3>
                    <div className="space-y-3">
                      {entries.map(([cat, amount]) => (
                        <div key={cat}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[#8A95A5]">{CATEGORY_LABELS[cat] ?? cat}</span>
                            <span className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                              Q {amount.toLocaleString('es-GT')}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#27384A] overflow-hidden">
                            <div
                              className="h-full bg-[#FF6B35] rounded-full"
                              style={{ width: `${(amount / maxVal) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Milestone payment schedule */}
              {project.milestones.length > 0 && (
                <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <h3 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Calendario de pagos
                  </h3>
                  <div className="space-y-2">
                    {project.milestones.map((m, i) => {
                      const isPaid     = m.status === 'paid'
                      const isApproved = m.status === 'approved'
                      return (
                        <div key={m.id} className="flex items-center gap-4 p-3 rounded-lg bg-[#1A2530]">
                          <span
                            className="text-lg font-bold flex-shrink-0 w-8 text-center"
                            style={{
                              fontFamily: 'Montserrat, sans-serif',
                              color: 'transparent',
                              WebkitTextStroke: `1px ${isPaid ? '#4A9E6B' : isApproved ? 'rgba(255,107,53,0.6)' : 'rgba(255,107,53,0.45)'}`,
                            }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#F0EDE8] truncate">{m.name}</p>
                            <p className="text-[10px] text-[#8A95A5]">
                              {m.due_date
                                ? new Date(m.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—'}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
                              Q {Number(m.amount_gtq).toLocaleString('es-GT')}
                            </p>
                            <p className="text-[10px]" style={{ color: isPaid ? '#4A9E6B' : isApproved ? '#FF6B35' : '#4A5568' }}>
                              {isPaid ? '✓ Pagado' : isApproved ? '✓ Aprobado' : 'Pendiente'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {/* Totals row */}
                  <div className="mt-4 pt-4 border-t border-[#27384A] flex justify-between text-sm">
                    <span className="text-[#8A95A5]">Total contrato</span>
                    <span className="font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                      Q {Number(project.total_budget_gtq).toLocaleString('es-GT')}
                    </span>
                  </div>
                </div>
              )}

              {/* Phase completion */}
              {project.phases.length > 0 && (
                <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <h3 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Avance por fase
                  </h3>
                  <div className="space-y-4">
                    {project.phases.map(phase => {
                      const pct = phase.status === 'completed' ? 100 : phase.status === 'active' ? 50 : 0
                      return (
                        <div key={phase.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-[#8A95A5]">{phase.name}</span>
                            <span
                              className="text-[10px]"
                              style={{ fontFamily: 'Space Mono, monospace', color: phase.status === 'completed' ? '#4A9E6B' : '#FF6B35' }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#27384A] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: phase.status === 'completed' ? '#4A9E6B' : '#FF6B35' }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No data state */}
              {expenses.length === 0 && project.milestones.length === 0 && (
                <p className="text-sm text-[#8A95A5] py-8 text-center">Registra gastos e hitos para ver los reportes.</p>
              )}
            </div>
          )}

          {/* ── TAB: Fotos ──────────────────────────────────────────────── */}
          {activeTab === 'photos' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Galería de obra
                </h2>
                <span className="text-xs text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {allPhotos.length} foto{allPhotos.length !== 1 ? 's' : ''}
                </span>
              </div>

              {allPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <Camera size={36} className="text-[#27384A]" />
                  <p className="text-sm text-[#8A95A5]">Sin fotos de obra aún.</p>
                  <p className="text-xs text-[#8A95A5]">Las fotos se agregarán al registrar avances en la bitácora.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-video rounded-xl overflow-hidden border border-[#27384A] group cursor-zoom-in"
                    >
                      <Image
                        src={photo.photo_url}
                        alt={photo.caption || 'Foto de obra'}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-[#1A2530]/0 group-hover:bg-[#1A2530]/20 transition-colors" />
                      <div className="absolute bottom-0 inset-x-0 bg-[#1A2530]/80 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-[#8A95A5] truncate">
                          {photo.caption || fmtDate(photo.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Tareas ──────────────────────────────────────────────── */}
          {activeTab === 'tasks' && project && false && (() => {
            const PRIORITY_COLOR: Record<TaskPriority, string> = {
              low: '#8A95A5', medium: '#6B8CFF', high: '#FF6B35', critical: '#f87171', urgent: '#f87171',
            }
            const PRIORITY_LABEL: Record<TaskPriority, string> = {
              low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica', urgent: 'Urgente',
            }
            const STATUS_COLS: { id: TaskStatus; label: string; color: string }[] = [
              { id: 'pending',        label: 'Por hacer',   color: '#8A95A5' },
              { id: 'in_progress', label: 'En progreso', color: '#FF6B35' },
              { id: 'done',        label: 'Completado',  color: '#4A9E6B' },
            ]

            async function handleCreateTask(e: React.FormEvent) {
              e.preventDefault()
              if (!taskTitle.trim()) return
              setSavingTask(true)
              setTaskError('')
              try {
                const t = await createTask(project!.id, {
                  title: taskTitle.trim(),
                  description: taskDescription.trim() || undefined,
                  priority: taskPriority,
                  due_date: taskDueDate || null,
                  phase: taskPhase ? Number(taskPhase) : null,
                })
                setTasks(prev => [t, ...prev])
                setTaskTitle(''); setTaskDescription(''); setTaskPriority('medium'); setTaskDueDate(''); setTaskPhase('')
                setShowTaskForm(false)
              } catch (err: any) {
                setTaskError(err.message ?? 'Error al crear tarea')
              } finally {
                setSavingTask(false)
              }
            }

            async function handleMoveTask(task: Task, newStatus: TaskStatus) {
              try {
                const updated = await updateTask(project!.id, task.id, { status: newStatus })
                setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
              } catch {}
            }

            async function handleDeleteTask(taskId: number) {
              try {
                await deleteTask(project!.id, taskId)
                setTasks(prev => prev.filter(t => t.id !== taskId))
                setDeletingTaskId(null)
              } catch {}
            }

            const todoTasks       = tasks.filter(t => t.status === 'pending')
            const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
            const doneTasks       = tasks.filter(t => t.status === 'done')

            return (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Tareas</h2>
                    <p className="text-xs text-[#8A95A5] mt-0.5">{tasks.length} tarea{tasks.length !== 1 ? 's' : ''} · {doneTasks.length} completadas</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 p-0.5 bg-[#131D28] border border-[#27384A] rounded-lg">
                      <button
                        onClick={() => setTaskViewMode('list')}
                        className={cn('p-1.5 rounded-md transition-colors', taskViewMode === 'list' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                        title="Vista lista"
                      >
                        <List size={13} />
                      </button>
                      <button
                        onClick={() => setTaskViewMode('kanban')}
                        className={cn('p-1.5 rounded-md transition-colors', taskViewMode === 'kanban' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                        title="Vista kanban"
                      >
                        <LayoutGrid size={13} />
                      </button>
                    </div>
                    <button
                      onClick={() => setShowTaskForm(v => !v)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
                    >
                      <Plus size={13} />
                      Nueva tarea
                    </button>
                  </div>
                </div>

                {/* Create form */}
                {showTaskForm && (
                  <form onSubmit={handleCreateTask} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
                    {taskError && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                        <AlertCircle size={13} />{taskError}
                      </div>
                    )}
                    <div>
                      <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
                      <input required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className={inputCls} placeholder="Ej. Confirmar proveedor de concreto" />
                    </div>
                    <div>
                      <label className={labelCls}>Descripción</label>
                      <textarea value={taskDescription} onChange={e => setTaskDescription(e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} placeholder="Detalles opcionales…" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Prioridad</label>
                        <select value={taskPriority} onChange={e => setTaskPriority(e.target.value as TaskPriority)} className={cn(inputCls, 'cursor-pointer')}>
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="urgent">Urgente</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Fecha límite</label>
                        <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
                      </div>
                      <div>
                        <label className={labelCls}>Fase</label>
                        <select value={taskPhase} onChange={e => setTaskPhase(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                          <option value="">Sin fase</option>
                          {project?.phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                      <button type="submit" disabled={savingTask} className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
                        {savingTask ? <><Loader2 size={12} className="animate-spin" /> Creando…</> : <><Plus size={12} /> Crear tarea</>}
                      </button>
                    </div>
                  </form>
                )}

                {/* List view */}
                {taskViewMode === 'list' && tasks.filter(t => t.status !== 'cancelled').length > 0 && (
                  <div className="rounded-xl border border-[#27384A] overflow-hidden">
                    {tasks.filter(t => t.status !== 'cancelled').map((task, i) => (
                      <div key={task.id} className={cn(
                        'flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors',
                        i > 0 && 'border-t border-[#27384A]'
                      )}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLS.find(c => c.id === task.status)?.color ?? '#8A95A5' }} />
                        <p className={cn('flex-1 text-sm font-medium truncate', task.status === 'done' ? 'line-through text-[#8A95A5]' : 'text-[#F0EDE8]')}>{task.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium hidden sm:inline"
                            style={{ background: `${PRIORITY_COLOR[task.priority]}20`, color: PRIORITY_COLOR[task.priority] }}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                          {task.phase_name && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5] hidden md:inline">{task.phase_name}</span>}
                          {task.due_date && (
                            <span className={cn('text-[9px] flex items-center gap-0.5 hidden lg:flex', task.is_overdue ? 'text-red-400' : 'text-[#8A95A5]')}>
                              <Calendar size={9} />
                              {new Date(task.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                          {task.status !== 'done' && (
                            <button onClick={() => handleMoveTask(task, task.status === 'pending' ? 'in_progress' : 'done')}
                              className="text-[9px] text-[#FF6B35] hover:text-[#FF8557] transition-colors px-1.5 py-0.5 rounded bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20">
                              {task.status === 'pending' ? 'Iniciar →' : 'Completar →'}
                            </button>
                          )}
                          <button onClick={() => setDeletingTaskId(deletingTaskId === task.id ? null : task.id)}
                            className="text-[9px] text-[#8A95A5] hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10">
                            {deletingTaskId === task.id ? '¿Eliminar?' : '···'}
                          </button>
                          {deletingTaskId === task.id && (
                            <button onClick={() => handleDeleteTask(task.id)} className="text-[9px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-500/10">Sí</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Kanban board */}
                {taskViewMode === 'kanban' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {STATUS_COLS.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id)
                    return (
                      <div key={col.id} className="flex flex-col gap-3">
                        {/* Column header */}
                        <div className="flex items-center gap-2 px-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
                          <span className="text-xs font-semibold text-[#F0EDE8]">{col.label}</span>
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>{colTasks.length}</span>
                        </div>

                        {/* Cards */}
                        <div className="space-y-2 min-h-[60px]">
                          {colTasks.length === 0 && (
                            <div className="h-16 rounded-xl border border-dashed border-[#27384A] flex items-center justify-center">
                              <span className="text-[10px] text-[#8A95A5]">Sin tareas</span>
                            </div>
                          )}
                          {colTasks.map(task => (
                            <div key={task.id} className="p-3.5 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/20 transition-colors group">
                              {/* Priority + overdue badges */}
                              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                  style={{ background: `${PRIORITY_COLOR[task.priority]}20`, color: PRIORITY_COLOR[task.priority] }}>
                                  {PRIORITY_LABEL[task.priority]}
                                </span>
                                {task.is_overdue && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">Vencida</span>
                                )}
                                {task.phase_name && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5]">{task.phase_name}</span>
                                )}
                              </div>

                              {/* Title */}
                              <p className={cn('text-xs font-medium leading-snug mb-2', task.status === 'done' ? 'line-through text-[#8A95A5]' : 'text-[#F0EDE8]')}>
                                {task.title}
                              </p>

                              {/* Meta */}
                              <div className="flex items-center gap-2 text-[9px] text-[#8A95A5]">
                                {task.due_date && (
                                  <span className={cn('flex items-center gap-0.5', task.is_overdue ? 'text-red-400' : '')}>
                                    <Calendar size={9} />
                                    {new Date(task.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
                                  </span>
                                )}
                                {task.assigned_to_name && (
                                  <span className="flex items-center gap-0.5 ml-auto">
                                    <Users size={9} />
                                    {task.assigned_to_name.split(' ')[0]}
                                  </span>
                                )}
                              </div>

                              {/* Actions row */}
                              <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-[#27384A]/50">
                                {col.id !== 'pending' && (
                                  <button onClick={() => handleMoveTask(task, col.id === 'in_progress' ? 'pending' : 'in_progress')}
                                    className="text-[9px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors px-1.5 py-0.5 rounded bg-[#27384A]/50 hover:bg-[#27384A]">
                                    ← Atrás
                                  </button>
                                )}
                                {col.id !== 'done' && (
                                  <button onClick={() => handleMoveTask(task, col.id === 'pending' ? 'in_progress' : 'done')}
                                    className="text-[9px] text-[#FF6B35] hover:text-[#FF8557] transition-colors px-1.5 py-0.5 rounded bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20">
                                    {col.id === 'pending' ? 'Iniciar →' : 'Completar →'}
                                  </button>
                                )}
                                <button
                                  onClick={() => setDeletingTaskId(deletingTaskId === task.id ? null : task.id)}
                                  className="ml-auto text-[9px] text-[#8A95A5] hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                                >
                                  {deletingTaskId === task.id ? '¿Eliminar?' : '···'}
                                </button>
                                {deletingTaskId === task.id && (
                                  <button onClick={() => handleDeleteTask(task.id)} className="text-[9px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-500/10">Sí</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>}

                {/* Cancelled tasks (collapsed) */}
                {tasks.filter(t => t.status === 'cancelled').length > 0 && (
                  <details className="group">
                    <summary className="text-xs text-[#8A95A5] cursor-pointer hover:text-[#8A95A5] transition-colors select-none">
                      {tasks.filter(t => t.status === 'cancelled').length} tarea(s) canceladas
                    </summary>
                    <div className="mt-3 space-y-2">
                      {tasks.filter(t => t.status === 'cancelled').map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#1A2530] border border-[#27384A]/50 opacity-50">
                          <span className="text-xs line-through text-[#8A95A5]">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )
          })()}

          {/* ── TAB: Tareas — Kanban interactivo ─────────────────────────── */}
          {activeTab === 'tasks' && project && (
            <KanbanBoard
              projectId={project.id}
              tasks={tasks}
              phases={project.phases}
              onTasksChange={setTasks}
            />
          )}

          {/* ── TAB: Contactos ───────────────────────────────────────────── */}
          {activeTab === 'contacts' && (() => {
            const labelCls2 = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'
            return (
              <div className="space-y-5 w-full">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-base font-bold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contactos del proyecto</h2>
                    <p className="text-xs text-[#8A95A5] mt-0.5">Aparecen en el portal del cliente · visible para el equipo Grucore y el cliente</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #27384A' }}>
                      <button onClick={() => setContactViewMode('grid')} className="p-1.5 transition-colors" style={{ background: contactViewMode === 'grid' ? '#FF6B35' : '#1A2530' }}>
                        <LayoutGrid size={14} className={contactViewMode === 'grid' ? 'text-white' : 'text-[#8A95A5]'} />
                      </button>
                      <button onClick={() => setContactViewMode('list')} className="p-1.5 transition-colors" style={{ background: contactViewMode === 'list' ? '#FF6B35' : '#1A2530' }}>
                        <List size={14} className={contactViewMode === 'list' ? 'text-white' : 'text-[#8A95A5]'} />
                      </button>
                    </div>
                    <button onClick={openAddContact} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors" style={{ background: '#FF6B35', color: '#131D28' }}>
                      <Plus size={13} />Agregar contacto
                    </button>
                  </div>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs" style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  <Info size={14} className="text-[#FF6B35] shrink-0 mt-0.5" />
                  <p className="text-[#8A95A5] leading-relaxed">
                    El <span className="text-[#F0EDE8] font-medium">Director de Proyecto</span> y el <span className="text-[#F0EDE8] font-medium">Cliente</span> ya aparecen en el tab <span className="text-[#F0EDE8] font-medium">Resumen</span> y son visibles en el portal automáticamente.
                    Usa este tab para añadir contactos adicionales: supervisor de obra, arquitecto, notario, etc.
                  </p>
                </div>

                {/* Empty state */}
                {contacts.length === 0 && !showContactForm && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center rounded-xl" style={{ border: '1px dashed #27384A' }}>
                    <Users size={32} className="text-[#27384A]" />
                    <p className="text-sm text-[#8A95A5]">No hay contactos aún. Añade el equipo asignado al proyecto.</p>
                  </div>
                )}

                {/* Grid view */}
                {contactViewMode === 'grid' && contacts.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {contacts.map(c => (
                      <div key={c.id} className="relative rounded-xl p-4 flex flex-col gap-3" style={{ background: '#1F2D3A', border: '1px solid #27384A' }}>
                        {/* Actions */}
                        <div className="absolute top-3 right-3 flex gap-1">
                          {confirmDeleteContactId === c.id ? (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[#8A95A5]">¿Eliminar?</span>
                              <button onClick={() => setConfirmDeleteContactId(null)} className="px-2 py-0.5 rounded text-[#F0EDE8]" style={{ background: '#27384A' }}>No</button>
                              <button onClick={() => handleDeleteContact(c.id)} className="px-2 py-0.5 rounded text-white" style={{ background: '#EF4444' }}>Sí</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => openEditContact(c)} className="p-1 rounded hover:bg-[#27384A]" title="Editar">
                                <FileEdit size={13} className="text-[#8A95A5]" />
                              </button>
                              <button onClick={() => setConfirmDeleteContactId(c.id)} className="p-1 rounded hover:bg-[#27384A]" title="Eliminar">
                                <Trash2 size={13} className="text-[#8A95A5]" />
                              </button>
                            </>
                          )}
                        </div>
                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 pr-16">
                          <ERPAvatar initials={c.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()} avatarUrl={c.resolved_avatar_url || c.avatar_url || undefined} size="md" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#F0EDE8] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{c.name}</p>
                            {c.role && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#FF6B3520', color: '#FF6B35' }}>{c.role}</span>}
                          </div>
                        </div>
                        {/* Contact info */}
                        <div className="space-y-1.5 border-t pt-3" style={{ borderColor: '#27384A' }}>
                          {c.company && <p className="text-xs text-[#8A95A5]">{c.company}</p>}
                          {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors"><Mail size={11} className="shrink-0" />{c.email}</a>}
                          {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors"><Phone size={11} className="shrink-0" />{c.phone}</a>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* List view */}
                {contactViewMode === 'list' && contacts.length > 0 && (
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #27384A' }}>
                    {contacts.map((c, idx) => (
                      <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1A2530] transition-colors" style={{ background: '#1F2D3A', borderBottom: idx < contacts.length - 1 ? '1px solid #27384A' : 'none' }}>
                        <ERPAvatar initials={c.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()} avatarUrl={c.resolved_avatar_url || c.avatar_url || undefined} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-[#F0EDE8] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{c.name}</p>
                            {c.role && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#FF6B3520', color: '#FF6B35' }}>{c.role}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {c.company && <span className="text-xs text-[#8A95A5]">{c.company}</span>}
                            {c.email && <a href={`mailto:${c.email}`} className="text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors">{c.email}</a>}
                            {c.phone && <a href={`tel:${c.phone}`} className="text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors">{c.phone}</a>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {confirmDeleteContactId === c.id ? (
                            <div className="flex items-center gap-1 text-xs">
                              <button onClick={() => setConfirmDeleteContactId(null)} className="px-2 py-0.5 rounded text-[#F0EDE8]" style={{ background: '#27384A' }}>No</button>
                              <button onClick={() => handleDeleteContact(c.id)} className="px-2 py-0.5 rounded text-white" style={{ background: '#EF4444' }}>Sí</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => openEditContact(c)} className="p-1.5 rounded hover:bg-[#27384A]"><FileEdit size={14} className="text-[#8A95A5]" /></button>
                              <button onClick={() => setConfirmDeleteContactId(c.id)} className="p-1.5 rounded hover:bg-[#27384A]"><Trash2 size={14} className="text-[#8A95A5]" /></button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal form */}
                {showContactForm && (
                  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={() => setShowContactForm(false)}>
                    <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 space-y-4" style={{ background: '#1A2530', border: '1px solid #27384A' }} onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {editingContact ? 'Editar contacto' : 'Nuevo contacto'}
                        </h3>
                        <button onClick={() => setShowContactForm(false)} className="p-1 rounded hover:bg-[#27384A]"><X size={16} className="text-[#8A95A5]" /></button>
                      </div>
                      {contactError && <p className="text-xs text-red-400">{contactError}</p>}
                      <form onSubmit={handleSaveContact} className="space-y-4">

                        {/* ── Avatar drag & drop ── */}
                        <div>
                          <label className={labelCls2}>Foto de perfil</label>
                          <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f) }}
                          />
                          <div
                            onClick={() => avatarInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setAvatarDragging(true) }}
                            onDragLeave={() => setAvatarDragging(false)}
                            onDrop={e => {
                              e.preventDefault()
                              setAvatarDragging(false)
                              const f = e.dataTransfer.files?.[0]
                              if (f) handleAvatarFile(f)
                            }}
                            className="relative flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors"
                            style={{
                              border: `2px dashed ${avatarDragging ? '#FF6B35' : '#27384A'}`,
                              background: avatarDragging ? 'rgba(255,107,53,0.06)' : '#131D28',
                            }}
                          >
                            {avatarPreview ? (
                              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2" style={{ borderColor: '#FF6B35' }}>
                                <Image src={avatarPreview} alt="preview" fill className="object-cover" sizes="56px" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: '#1F2D3A', border: '1px solid #27384A' }}>
                                <Camera size={20} className="text-[#8A95A5]" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm text-[#F0EDE8]">
                                {avatarFile ? avatarFile.name : 'Arrastra una imagen o haz clic para seleccionar'}
                              </p>
                              <p className="text-xs text-[#8A95A5] mt-0.5">PNG, JPG, WEBP · máx. 5 MB</p>
                            </div>
                            {avatarPreview && (
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setAvatarFile(null); setAvatarPreview('') }}
                                className="absolute top-2 right-2 p-1 rounded-full hover:bg-[#27384A]"
                              >
                                <X size={12} className="text-[#8A95A5]" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* ── Campos de texto ── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { key: 'name',    label: 'Nombre *',   type: 'text',  placeholder: 'Ej. Juan Pérez' },
                            { key: 'role',    label: 'Cargo',      type: 'text',  placeholder: 'Ej. Director de proyecto' },
                            { key: 'company', label: 'Empresa',    type: 'text',  placeholder: 'Grucore' },
                            { key: 'email',   label: 'Email',      type: 'email', placeholder: 'correo@grucore.com' },
                            { key: 'phone',   label: 'Teléfono',   type: 'tel',   placeholder: '+502 0000-0000' },
                          ].map(({ key, label, type, placeholder }) => (
                            <div key={key}>
                              <label className={labelCls2}>{label}</label>
                              <input
                                type={type}
                                value={contactForm[key as keyof typeof contactForm] as string}
                                onChange={e => setContactForm(f => ({ ...f, [key]: e.target.value }))}
                                placeholder={placeholder}
                                required={key === 'name'}
                                className={inputCls}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={() => setShowContactForm(false)} className="flex-1 py-2 rounded-lg text-sm text-[#8A95A5]" style={{ border: '1px solid #27384A' }}>Cancelar</button>
                          <button type="submit" disabled={savingContact || !contactForm.name.trim()} className="flex-1 py-2 rounded-lg text-sm font-semibold text-[#131D28] disabled:opacity-40 flex items-center justify-center gap-2" style={{ background: '#FF6B35' }}>
                            {savingContact ? <><Loader2 size={13} className="animate-spin" />Guardando…</> : editingContact ? 'Guardar cambios' : 'Agregar'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── Notas internas ── */}
          {activeTab === 'notes' && (
            <div className="w-full">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-white">Notas internas</h2>
                  <p className="text-xs text-[#8A95A5] mt-0.5">Solo visibles para el equipo. El cliente no tiene acceso.</p>
                </div>
                <span className="text-xs text-[#8A95A5] px-2 py-1 rounded-md" style={{ background: '#131D28', border: '1px solid #27384A' }}>
                  {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
                </span>
              </div>

              {/* Split layout: composer | lista */}
              <div className="flex gap-5 items-start">

                {/* ── Composer (sticky izquierda) ── */}
                <div className="w-80 flex-shrink-0 sticky top-6">
                  <form
                    onSubmit={async e => {
                      e.preventDefault()
                      if (!noteInput.trim() || !project) return
                      setNoteSubmitting(true)
                      setNoteError('')
                      try {
                        const created = await createProjectNote(project.id, noteInput.trim())
                        setNotes(prev => [created, ...prev])
                        setNoteInput('')
                      } catch (err: any) {
                        setNoteError(err.message ?? 'Error al guardar la nota')
                      } finally {
                        setNoteSubmitting(false)
                      }
                    }}
                    className="rounded-xl p-4 space-y-3"
                    style={{ background: '#1F2D3A', border: '1px solid #27384A' }}
                  >
                    <p className="text-xs font-semibold text-white">Nueva nota</p>
                    <textarea
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                      placeholder="Escribe una nota interna…"
                      rows={5}
                      className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 transition-colors resize-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit()
                      }}
                    />
                    {noteError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} /> {noteError}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-[#8A95A5]">⌘ Enter para enviar</p>
                      <button
                        type="submit"
                        disabled={noteSubmitting || !noteInput.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#131D28] disabled:opacity-40 transition-opacity"
                        style={{ background: '#FF6B35' }}
                      >
                        {noteSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                        Publicar
                      </button>
                    </div>
                  </form>
                </div>

                {/* ── Lista de notas ── */}
                <div className="flex-1 min-w-0 space-y-3">
                  {!notesLoaded ? (
                    <div className="flex justify-center py-12">
                      <Loader2 size={20} className="animate-spin text-[#FF6B35]" />
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl" style={{ background: '#1F2D3A', border: '1px solid #27384A' }}>
                      <MessageSquare size={32} className="text-[#27384A] mb-3" />
                      <p className="text-sm text-[#8A95A5]">Sin notas todavía</p>
                      <p className="text-xs text-[#8A95A5] mt-1">Escribe la primera nota interna del proyecto.</p>
                    </div>
                  ) : (
                    notes.map(note => (
                      <div
                        key={note.id}
                        className="rounded-xl p-4"
                        style={{ background: '#1F2D3A', border: '1px solid #27384A' }}
                      >
                        {editingNote?.id === note.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editNoteBody}
                              onChange={e => setEditNoteBody(e.target.value)}
                              rows={3}
                              autoFocus
                              className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#FF6B35]/60 transition-colors resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingNote(null)}
                                className="px-3 py-1.5 rounded-lg text-xs text-[#8A95A5]"
                                style={{ border: '1px solid #27384A' }}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={async () => {
                                  if (!editNoteBody.trim() || !project) return
                                  try {
                                    const updated = await updateProjectNote(project.id, note.id, editNoteBody.trim())
                                    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
                                    setEditingNote(null)
                                  } catch {}
                                }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#131D28]"
                                style={{ background: '#FF6B35' }}
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <ERPAvatar
                                avatarUrl={note.author_avatar}
                                initials={note.author_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{note.author_name}</p>
                                <p className="text-[10px] text-[#8A95A5]">
                                  {new Date(note.created_at).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  {note.updated_at !== note.created_at && <span className="ml-1 italic">(editado)</span>}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => { setEditingNote(note); setEditNoteBody(note.body) }}
                                  className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (!project) return
                                    confirmToast({
                                      title: '¿Eliminar esta nota?',
                                      description: 'Esta acción no se puede deshacer.',
                                      onConfirm: async () => {
                                        await deleteProjectNote(project.id, note.id)
                                        setNotes(prev => prev.filter(n => n.id !== note.id))
                                      },
                                    })
                                  }}
                                  className="p-1.5 rounded-lg text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{note.body}</p>
                          </>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={notesEndRef} />
                </div>

              </div>
            </div>
          )}

          {/* ── TAB: Cotización ─────────────────────────────────────────────── */}
          {activeTab === 'cotizacion' && project && (
            <QuoteTab
              projectId={project.id}
              projectName={project.name}
              clientName={project.client_name || project.client?.name || '—'}
            />
          )}
        </main>
      </div>

      {/* ── Edit Project Modal ────────────────────────────────────────────────── */}
      {showEditProject && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setShowEditProject(false)}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
            style={{ maxHeight: '92dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Editar proyecto
              </h3>
              <button onClick={() => setShowEditProject(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
              {editError && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {editError}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Nombre <span className="text-[#FF6B35]">*</span></label>
                <input
                  required
                  form="edit-project-form"
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                />
              </div>

              {/* Estado + Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Estado</label>
                  <select
                    form="edit-project-form"
                    value={editForm.status}
                    onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 transition-colors cursor-pointer"
                  >
                    <option value="draft">Borrador</option>
                    <option value="active">Activo</option>
                    <option value="paused">En pausa</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Tipo</label>
                  <select
                    form="edit-project-form"
                    value={editForm.project_type}
                    onChange={e => setEditForm(f => ({ ...f, project_type: e.target.value }))}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 transition-colors cursor-pointer"
                  >
                    <option value="residential">Residencial</option>
                    <option value="commercial">Comercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="renovation">Remodelación</option>
                    <option value="kitchens_baths">Cocinas y Baños</option>
                    <option value="design_build">Diseño y construcción</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>

              {/* Presupuesto */}
              <div>
                <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Presupuesto total (GTQ) <span className="text-[#FF6B35]">*</span></label>
                <input
                  required
                  form="edit-project-form"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.total_budget_gtq}
                  onChange={e => setEditForm(f => ({ ...f, total_budget_gtq: e.target.value }))}
                  className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                  placeholder="0.00"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Fecha de inicio</label>
                  <input
                    form="edit-project-form"
                    type="date"
                    value={editForm.start_date}
                    onChange={e => setEditForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Fecha estimada fin</label>
                  <input
                    form="edit-project-form"
                    type="date"
                    value={editForm.estimated_end}
                    onChange={e => setEditForm(f => ({ ...f, estimated_end: e.target.value }))}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Dirección</label>
                <input
                  form="edit-project-form"
                  type="text"
                  value={editForm.address}
                  onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                  placeholder="Calle, zona, colonia…"
                />
              </div>

              {/* Ciudad + Departamento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Ciudad</label>
                  <input
                    form="edit-project-form"
                    type="text"
                    value={editForm.city}
                    onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                    placeholder="Guatemala"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Departamento</label>
                  <input
                    form="edit-project-form"
                    type="text"
                    value={editForm.department}
                    onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                    placeholder="Guatemala"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Descripción</label>
                <textarea
                  form="edit-project-form"
                  rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors resize-none"
                  placeholder="Descripción del proyecto…"
                />
              </div>
            </div>

            {/* Footer */}
            <form id="edit-project-form" onSubmit={handleSaveProject} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowEditProject(false)}
                className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {savingEdit
                  ? <><Loader2 size={13} className="animate-spin" /> Guardando…</>
                  : <><Pencil size={13} /> Guardar cambios</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
