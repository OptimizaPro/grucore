'use client'

import { useState } from 'react'
import {
  Plus, Loader2, AlertCircle, X, Pencil, Trash2,
  Check, LayoutGrid, List, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createExpense, updateExpense, deleteExpense, approveExpense,
  createInvoice, updateInvoice, deleteInvoice, markInvoicePaid,
  type Expense, type Invoice,
} from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtGtq(val: string | number) {
  return `Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 0 })}`
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

const CAT_LABEL: Record<string, string> = {
  materials: 'Materiales', labor: 'Mano de obra', equipment: 'Equipo y maquinaria',
  subcontractor: 'Subcontratista', permits: 'Permisos y trámites',
  transportation: 'Transporte', utilities: 'Servicios', other: 'Otro',
}
const CAT_COLOR: Record<string, string> = {
  materials: '#6B8CFF', labor: '#FF6B35', equipment: '#8B5CF6',
  subcontractor: '#F59E0B', permits: '#EC4899', transportation: '#14B8A6',
  utilities: '#4A9E6B', other: '#8A95A5',
}
const EXP_STATUS_COLOR: Record<string, string> = {
  pending: '#F59E0B', approved: '#4A9E6B', rejected: '#f87171', reimbursed: '#6B8CFF',
}
const EXP_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', reimbursed: 'Reembolsado',
}
const INV_STATUS_COLOR: Record<string, string> = {
  draft: '#8A95A5', sent: '#6B8CFF', viewed: '#F59E0B', paid: '#4A9E6B', overdue: '#f87171', cancelled: '#4A5568',
}
const INV_STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', viewed: 'Vista', paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada',
}

function ExpenseStatusChip({ status }: { status: string }) {
  const color = EXP_STATUS_COLOR[status] ?? '#8A95A5'
  return <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>{EXP_STATUS_LABEL[status] ?? status}</span>
}
function InvoiceStatusChip({ status }: { status: string }) {
  const color = INV_STATUS_COLOR[status] ?? '#8A95A5'
  return <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>{INV_STATUS_LABEL[status] ?? status}</span>
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconBtn({
  icon: Icon, label, onClick, variant = 'edit', size = 13,
}: {
  icon: React.ElementType
  label: string
  onClick: (e: React.MouseEvent) => void
  variant?: 'edit' | 'delete' | 'approve'
  size?: number
}) {
  const colors = {
    edit:    'text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10',
    delete:  'text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10',
    approve: 'text-[#8A95A5] hover:text-[#4A9E6B] hover:bg-[#4A9E6B]/10',
  }
  const rotate = { edit: 'hover:-rotate-12', delete: 'hover:rotate-12', approve: 'hover:scale-110' }
  return (
    <button title={label} onClick={onClick}
      className={cn('p-1.5 rounded-lg transition-all duration-200', colors[variant])}>
      <Icon size={size} className={cn('transition-all duration-200', rotate[variant])} />
    </button>
  )
}

// ─── Edit Expense modal ───────────────────────────────────────────────────────

function EditExpenseModal({
  expense, projectId, onSave, onClose,
}: {
  expense: Expense
  projectId: number
  onSave: (updated: Expense) => void
  onClose: () => void
}) {
  const [category,    setCategory]    = useState(expense.category)
  const [description, setDescription] = useState(expense.description)
  const [amount,      setAmount]      = useState(String(expense.amount_gtq))
  const [date,        setDate]        = useState(expense.expense_date)
  const [receiptUrl,  setReceiptUrl]  = useState(expense.receipt_url ?? '')
  const [notes,       setNotes]       = useState(expense.notes ?? '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const updated = await updateExpense(projectId, expense.id, {
        category, description: description.trim(), amount_gtq: amount,
        expense_date: date, receipt_url: receiptUrl || undefined, notes: notes || undefined,
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
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>Editar gasto</p>
            <h2 className="text-base font-semibold text-[#F0EDE8] truncate max-w-[360px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{expense.description}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] p-1 rounded-lg hover:bg-[#27384A] transition-colors"><X size={17} /></button>
        </div>
        <form id="edit-exp-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={13} className="flex-shrink-0" />{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Categoría</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Monto GTQ <span className="text-[#FF6B35]">*</span></label>
              <input type="number" min="0" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Descripción <span className="text-[#FF6B35]">*</span></label>
            <input required autoFocus value={description} onChange={e => setDescription(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha del gasto</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
            </div>
            <div>
              <label className={labelCls}>URL del recibo</label>
              <input type="url" value={receiptUrl} onChange={e => setReceiptUrl(e.target.value)} className={inputCls} placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Notas</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={cn(inputCls, 'resize-none')} />
          </div>
        </form>
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button form="edit-exp-form" type="submit" disabled={saving}
            className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Invoice modal ───────────────────────────────────────────────────────

function EditInvoiceModal({
  invoice, projectId, onSave, onClose,
}: {
  invoice: Invoice
  projectId: number
  onSave: (updated: Invoice) => void
  onClose: () => void
}) {
  const [number,      setNumber]      = useState(invoice.invoice_number)
  const [title,       setTitle]       = useState(invoice.title)
  const [amount,      setAmount]      = useState(String(invoice.amount_gtq))
  const [tax,         setTax]         = useState(String(invoice.tax_percentage))
  const [issueDate,   setIssueDate]   = useState(invoice.issue_date)
  const [dueDate,     setDueDate]     = useState(invoice.due_date ?? '')
  const [description, setDescription] = useState(invoice.description ?? '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const updated = await updateInvoice(projectId, invoice.id, {
        invoice_number: number.trim(), title: title.trim(), amount_gtq: amount,
        tax_percentage: tax || '12', issue_date: issueDate,
        due_date: dueDate || null, description: description || undefined,
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
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>Editar factura</p>
            <h2 className="text-base font-semibold text-[#F0EDE8] truncate max-w-[360px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{invoice.title}</h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] p-1 rounded-lg hover:bg-[#27384A] transition-colors"><X size={17} /></button>
        </div>
        <form id="edit-inv-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={13} className="flex-shrink-0" />{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Número de factura <span className="text-[#FF6B35]">*</span></label>
              <input required autoFocus value={number} onChange={e => setNumber(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Monto GTQ <span className="text-[#FF6B35]">*</span></label>
              <input type="number" min="0" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>IVA %</label>
              <input type="number" min="0" max="100" value={tax} onChange={e => setTax(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Fecha emisión</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha vencimiento</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className={inputCls} placeholder="Notas de la factura…" />
            </div>
          </div>
        </form>
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
          <button form="edit-inv-form" type="submit" disabled={saving}
            className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExpensesTab({
  projectId, expenses, invoices, onExpensesChange, onInvoicesChange,
}: {
  projectId: number
  expenses: Expense[]
  invoices: Invoice[]
  onExpensesChange: (exp: Expense[]) => void
  onInvoicesChange: (inv: Invoice[]) => void
}) {
  const [subTab,       setSubTab]       = useState<'expenses' | 'invoices'>('expenses')
  const [expViewMode,  setExpViewMode]  = useState<'cards' | 'list'>('cards')
  const [invViewMode,  setInvViewMode]  = useState<'cards' | 'list'>('cards')

  // Expense CRUD state
  const [editingExp,   setEditingExp]   = useState<Expense | null>(null)
  const [deletingExpId,setDeletingExpId]= useState<number | null>(null)
  const [showExpForm,  setShowExpForm]  = useState(false)
  const [expCategory,  setExpCategory]  = useState('materials')
  const [expDesc,      setExpDesc]      = useState('')
  const [expAmount,    setExpAmount]    = useState('')
  const [expDate,      setExpDate]      = useState(todayStr())
  const [expReceipt,   setExpReceipt]   = useState('')
  const [expNotes,     setExpNotes]     = useState('')
  const [savingExp,    setSavingExp]    = useState(false)
  const [expError,     setExpError]     = useState('')

  // Invoice CRUD state
  const [editingInv,   setEditingInv]   = useState<Invoice | null>(null)
  const [deletingInvId,setDeletingInvId]= useState<number | null>(null)
  const [showInvForm,  setShowInvForm]  = useState(false)
  const [invNumber,    setInvNumber]    = useState('')
  const [invTitle,     setInvTitle]     = useState('')
  const [invAmount,    setInvAmount]    = useState('')
  const [invTax,       setInvTax]       = useState('12')
  const [invIssueDate, setInvIssueDate] = useState(todayStr())
  const [invDueDate,   setInvDueDate]   = useState('')
  const [invDesc,      setInvDesc]      = useState('')
  const [savingInv,    setSavingInv]    = useState(false)
  const [invError,     setInvError]     = useState('')

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  // ── Expense handlers ────────────────────────────────────────────────────────

  async function handleCreateExp(e: React.FormEvent) {
    e.preventDefault()
    if (!expDesc.trim() || !expAmount) return
    setSavingExp(true); setExpError('')
    try {
      const newExp = await createExpense(projectId, {
        category: expCategory, description: expDesc.trim(),
        amount_gtq: expAmount, expense_date: expDate,
        receipt_url: expReceipt || undefined, notes: expNotes || undefined,
      })
      onExpensesChange([newExp, ...expenses])
      setExpDesc(''); setExpAmount(''); setExpDate(todayStr()); setExpReceipt(''); setExpNotes('')
      setShowExpForm(false)
    } catch (err: unknown) { setExpError((err as Error).message ?? 'Error') }
    finally { setSavingExp(false) }
  }

  async function handleApproveExp(exp: Expense) {
    try {
      const updated = await approveExpense(projectId, exp.id)
      onExpensesChange(expenses.map(e => e.id === updated.id ? updated : e))
    } catch {}
  }

  async function handleDeleteExp(id: number) {
    try { await deleteExpense(projectId, id); onExpensesChange(expenses.filter(e => e.id !== id)) } catch {}
    setDeletingExpId(null)
  }

  function handleEditExpSave(updated: Expense) {
    onExpensesChange(expenses.map(e => e.id === updated.id ? updated : e))
    setEditingExp(null)
  }

  // ── Invoice handlers ─────────────────────────────────────────────────────────

  async function handleCreateInv(e: React.FormEvent) {
    e.preventDefault()
    if (!invNumber.trim() || !invTitle.trim() || !invAmount) return
    setSavingInv(true); setInvError('')
    try {
      const newInv = await createInvoice(projectId, {
        invoice_number: invNumber.trim(), title: invTitle.trim(), amount_gtq: invAmount,
        issue_date: invIssueDate, tax_percentage: invTax || '12',
        due_date: invDueDate || null, description: invDesc || undefined,
      })
      onInvoicesChange([newInv, ...invoices])
      setInvNumber(''); setInvTitle(''); setInvAmount(''); setInvIssueDate(todayStr()); setInvDueDate(''); setInvTax('12'); setInvDesc('')
      setShowInvForm(false)
    } catch (err: unknown) { setInvError((err as Error).message ?? 'Error') }
    finally { setSavingInv(false) }
  }

  async function handleMarkPaid(inv: Invoice) {
    try {
      const updated = await markInvoicePaid(projectId, inv.id)
      onInvoicesChange(invoices.map(i => i.id === updated.id ? updated : i))
    } catch {}
  }

  async function handleDeleteInv(id: number) {
    try { await deleteInvoice(projectId, id); onInvoicesChange(invoices.filter(i => i.id !== id)) } catch {}
    setDeletingInvId(null)
  }

  function handleEditInvSave(updated: Invoice) {
    onInvoicesChange(invoices.map(i => i.id === updated.id ? updated : i))
    setEditingInv(null)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const canEditExp = (exp: Expense) => exp.status === 'pending'
  const canEditInv = (inv: Invoice) => inv.status === 'draft' || inv.status === 'sent'
  const canMarkPaid = (inv: Invoice) => inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'overdue'

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {editingExp && <EditExpenseModal expense={editingExp} projectId={projectId} onSave={handleEditExpSave} onClose={() => setEditingExp(null)} />}
      {editingInv && <EditInvoiceModal invoice={editingInv} projectId={projectId} onSave={handleEditInvSave} onClose={() => setEditingInv(null)} />}

      <div className="space-y-4">
        {/* Header + Sub-tabs */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Gastos y facturas</h2>
          <div className="flex gap-2">
            <button onClick={() => setSubTab('expenses')}
              className={cn('px-4 py-1.5 text-xs rounded-lg font-medium transition-colors',
                subTab === 'expenses' ? 'bg-[#FF6B35] text-[#1A2530]' : 'border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}>
              Gastos
            </button>
            <button onClick={() => setSubTab('invoices')}
              className={cn('px-4 py-1.5 text-xs rounded-lg font-medium transition-colors',
                subTab === 'invoices' ? 'bg-[#FF6B35] text-[#1A2530]' : 'border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}>
              Facturas
            </button>
          </div>
        </div>

        {/* ── EXPENSES SUB-TAB ── */}
        {subTab === 'expenses' && (
          <div className="space-y-4">
            {/* Stats */}
            {expenses.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total gastos', value: fmtGtq(expenses.reduce((s, e) => s + Number(e.amount_gtq), 0)), color: '#F0EDE8' },
                  { label: 'Aprobado', value: fmtGtq(expenses.filter(e => e.status === 'approved' || e.status === 'reimbursed').reduce((s, e) => s + Number(e.amount_gtq), 0)), color: '#4A9E6B' },
                  { label: 'Pendiente', value: fmtGtq(expenses.filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.amount_gtq), 0)), color: '#FF6B35' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A] text-center">
                    <p className="text-xs text-[#8A95A5] mb-1">{label}</p>
                    <p className="text-base font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5 p-0.5 bg-[#131D28] border border-[#27384A] rounded-lg">
                <button onClick={() => setExpViewMode('list')}
                  className={cn('p-1.5 rounded-md transition-colors', expViewMode === 'list' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')} title="Vista lista">
                  <List size={13} />
                </button>
                <button onClick={() => setExpViewMode('cards')}
                  className={cn('p-1.5 rounded-md transition-colors', expViewMode === 'cards' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')} title="Vista tarjetas">
                  <LayoutGrid size={13} />
                </button>
              </div>
              <button onClick={() => setShowExpForm(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
                {showExpForm ? <X size={13} /> : <Plus size={13} />}
                {showExpForm ? 'Cancelar' : 'Nuevo gasto'}
              </button>
            </div>

            {/* Create form */}
            {showExpForm && (
              <form onSubmit={handleCreateExp} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
                {expError && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={13} className="flex-shrink-0" />{expError}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Categoría</label>
                    <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                      {Object.entries(CAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Monto GTQ <span className="text-[#FF6B35]">*</span></label>
                    <input type="number" min="0" step="0.01" required value={expAmount} onChange={e => setExpAmount(e.target.value)} className={inputCls} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Descripción <span className="text-[#FF6B35]">*</span></label>
                  <input required autoFocus value={expDesc} onChange={e => setExpDesc(e.target.value)} className={inputCls} placeholder="Detalle del gasto…" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Fecha</label>
                    <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
                  </div>
                  <div>
                    <label className={labelCls}>URL del recibo</label>
                    <input type="url" value={expReceipt} onChange={e => setExpReceipt(e.target.value)} className={inputCls} placeholder="https://…" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Notas</label>
                  <textarea rows={2} value={expNotes} onChange={e => setExpNotes(e.target.value)} className={cn(inputCls, 'resize-none')} />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowExpForm(false)} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                  <button type="submit" disabled={savingExp}
                    className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
                    {savingExp ? <><Loader2 size={12} className="animate-spin" /> Guardando…</> : <><Plus size={12} /> Guardar gasto</>}
                  </button>
                </div>
              </form>
            )}

            {expenses.length === 0 && !showExpForm && (
              <p className="text-sm text-[#8A95A5] py-10 text-center">Sin gastos registrados.</p>
            )}

            {/* Cards */}
            {expViewMode === 'cards' && expenses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenses.map(exp => (
                  <div key={exp.id} className="rounded-xl border border-[#27384A] bg-[#1F2D3A] overflow-hidden group">
                    <div className="h-1" style={{ background: CAT_COLOR[exp.category] ?? '#8A95A5' }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${CAT_COLOR[exp.category] ?? '#8A95A5'}20`, color: CAT_COLOR[exp.category] ?? '#8A95A5' }}>
                            {CAT_LABEL[exp.category] ?? exp.category}
                          </span>
                          <ExpenseStatusChip status={exp.status} />
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                          {canEditExp(exp) && <IconBtn icon={Pencil} label="Editar" variant="edit" size={12} onClick={e => { e.stopPropagation(); setEditingExp(exp) }} />}
                          {deletingExpId === exp.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setDeletingExpId(null)} className="text-[9px] px-1 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                              <button onClick={() => handleDeleteExp(exp.id)} className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                            </div>
                          ) : (
                            <IconBtn icon={Trash2} label="Eliminar" variant="delete" size={12} onClick={e => { e.stopPropagation(); setDeletingExpId(exp.id) }} />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-[#F0EDE8] font-medium mb-1 line-clamp-2">{exp.description}</p>
                      <p className="text-xl font-bold text-[#FF6B35] mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(exp.amount_gtq)}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#8A95A5]">
                        <span style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(exp.expense_date)}</span>
                        <div className="flex items-center gap-1">
                          {exp.receipt_url && (
                            <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1 rounded hover:bg-[#27384A] text-[#8A95A5] hover:text-[#6B8CFF] transition-all duration-200">
                              <ExternalLink size={10} />
                            </a>
                          )}
                          {exp.status === 'pending' && (
                            <IconBtn icon={Check} label="Aprobar" variant="approve" size={11} onClick={e => { e.stopPropagation(); handleApproveExp(exp) }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List */}
            {expViewMode === 'list' && expenses.length > 0 && (
              <div className="rounded-xl border border-[#27384A] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#131D28] border-b border-[#27384A]">
                  <span className="flex-1 text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider">Descripción</span>
                  <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden sm:block w-24 text-center">Categoría</span>
                  <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden md:block w-20 text-center">Estado</span>
                  <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider w-24 text-right">Monto</span>
                  <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden lg:block w-24 text-center">Fecha</span>
                  <span className="w-20 flex-shrink-0" />
                </div>
                {expenses.map((exp, i) => (
                  <div key={exp.id} className={cn(
                    'flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors group',
                    i > 0 && 'border-t border-[#27384A]',
                  )}>
                    <p className="flex-1 text-sm text-[#F0EDE8] font-medium truncate min-w-0">{exp.description}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium hidden sm:inline flex-shrink-0"
                      style={{ background: `${CAT_COLOR[exp.category] ?? '#8A95A5'}20`, color: CAT_COLOR[exp.category] ?? '#8A95A5' }}>
                      {CAT_LABEL[exp.category] ?? exp.category}
                    </span>
                    <div className="hidden md:block w-20 text-center flex-shrink-0"><ExpenseStatusChip status={exp.status} /></div>
                    <span className="text-xs font-semibold text-[#FF6B35] w-24 text-right flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(exp.amount_gtq)}</span>
                    <span className="text-[9px] text-[#8A95A5] hidden lg:block w-24 text-center flex-shrink-0">{fmtDate(exp.expense_date)}</span>
                    <div className="flex items-center gap-0.5 flex-shrink-0 w-20 justify-end">
                      {exp.status === 'pending' && <IconBtn icon={Check} label="Aprobar" variant="approve" size={12} onClick={e => { e.stopPropagation(); handleApproveExp(exp) }} />}
                      {canEditExp(exp) && <IconBtn icon={Pencil} label="Editar" variant="edit" size={12} onClick={e => { e.stopPropagation(); setEditingExp(exp) }} />}
                      {deletingExpId === exp.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDeletingExpId(null)} className="text-[9px] px-1 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                          <button onClick={() => handleDeleteExp(exp.id)} className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                        </div>
                      ) : (
                        <IconBtn icon={Trash2} label="Eliminar" variant="delete" size={12} onClick={e => { e.stopPropagation(); setDeletingExpId(exp.id) }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INVOICES SUB-TAB ── */}
        {subTab === 'invoices' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-0.5 p-0.5 bg-[#131D28] border border-[#27384A] rounded-lg">
                <button onClick={() => setInvViewMode('list')}
                  className={cn('p-1.5 rounded-md transition-colors', invViewMode === 'list' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')} title="Vista lista">
                  <List size={13} />
                </button>
                <button onClick={() => setInvViewMode('cards')}
                  className={cn('p-1.5 rounded-md transition-colors', invViewMode === 'cards' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')} title="Vista tarjetas">
                  <LayoutGrid size={13} />
                </button>
              </div>
              <button onClick={() => setShowInvForm(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
                {showInvForm ? <X size={13} /> : <Plus size={13} />}
                {showInvForm ? 'Cancelar' : 'Nueva factura'}
              </button>
            </div>

            {/* Create form */}
            {showInvForm && (
              <form onSubmit={handleCreateInv} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
                {invError && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400"><AlertCircle size={13} className="flex-shrink-0" />{invError}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Número de factura <span className="text-[#FF6B35]">*</span></label>
                    <input required autoFocus value={invNumber} onChange={e => setInvNumber(e.target.value)} className={inputCls} placeholder="FAC-001" />
                  </div>
                  <div>
                    <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
                    <input required value={invTitle} onChange={e => setInvTitle(e.target.value)} className={inputCls} placeholder="Ej. Pago hito 1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Monto GTQ <span className="text-[#FF6B35]">*</span></label>
                    <input type="number" min="0" step="0.01" required value={invAmount} onChange={e => setInvAmount(e.target.value)} className={inputCls} placeholder="0.00" />
                  </div>
                  <div>
                    <label className={labelCls}>IVA %</label>
                    <input type="number" min="0" max="100" value={invTax} onChange={e => setInvTax(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Fecha emisión</label>
                    <input type="date" value={invIssueDate} onChange={e => setInvIssueDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Fecha vencimiento</label>
                    <input type="date" value={invDueDate} onChange={e => setInvDueDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
                  </div>
                  <div>
                    <label className={labelCls}>Descripción</label>
                    <input value={invDesc} onChange={e => setInvDesc(e.target.value)} className={inputCls} placeholder="Notas de la factura…" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowInvForm(false)} className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                  <button type="submit" disabled={savingInv}
                    className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
                    {savingInv ? <><Loader2 size={12} className="animate-spin" /> Creando…</> : <><Plus size={12} /> Crear factura</>}
                  </button>
                </div>
              </form>
            )}

            {invoices.length === 0 && !showInvForm && (
              <p className="text-sm text-[#8A95A5] py-10 text-center">Sin facturas registradas.</p>
            )}

            {/* Cards */}
            {invViewMode === 'cards' && invoices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices.map(inv => (
                  <div key={inv.id} className="rounded-xl border border-[#27384A] bg-[#1F2D3A] overflow-hidden group">
                    <div className="h-1" style={{ background: INV_STATUS_COLOR[inv.status] ?? '#8A95A5' }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{inv.invoice_number}</span>
                          <InvoiceStatusChip status={inv.status} />
                          {inv.is_overdue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">Vencida</span>}
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                          {canEditInv(inv) && <IconBtn icon={Pencil} label="Editar" variant="edit" size={12} onClick={e => { e.stopPropagation(); setEditingInv(inv) }} />}
                          {deletingInvId === inv.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setDeletingInvId(null)} className="text-[9px] px-1 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                              <button onClick={() => handleDeleteInv(inv.id)} className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                            </div>
                          ) : (
                            <IconBtn icon={Trash2} label="Eliminar" variant="delete" size={12} onClick={e => { e.stopPropagation(); setDeletingInvId(inv.id) }} />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-[#F0EDE8] font-medium mb-1 line-clamp-2">{inv.title}</p>
                      <p className="text-xl font-bold mb-1" style={{ fontFamily: 'Space Mono, monospace', color: inv.status === 'paid' ? '#4A9E6B' : '#FF6B35' }}>{fmtGtq(inv.amount_gtq)}</p>
                      <p className="text-[10px] text-[#4A9E6B] mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>c/IVA: {fmtGtq(inv.total_with_tax)}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#8A95A5]">
                        <span style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(inv.issue_date)}</span>
                        {canMarkPaid(inv) && (
                          <IconBtn icon={Check} label="Marcar pagada" variant="approve" size={11} onClick={e => { e.stopPropagation(); handleMarkPaid(inv) }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List */}
            {invViewMode === 'list' && invoices.length > 0 && (
              <div className="rounded-xl border border-[#27384A] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#131D28] border-b border-[#27384A]">
                  <span className="w-[80px] text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider flex-shrink-0">#</span>
                  <span className="flex-1 text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider">Título</span>
                  <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden md:block w-20 text-center">Estado</span>
                  <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider w-24 text-right">Monto</span>
                  <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden lg:block w-24 text-center">Emisión</span>
                  <span className="w-24 flex-shrink-0" />
                </div>
                {invoices.map((inv, i) => (
                  <div key={inv.id} className={cn(
                    'flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors group',
                    i > 0 && 'border-t border-[#27384A]',
                    inv.is_overdue && 'bg-red-500/[0.03]',
                  )}>
                    <span className="text-[10px] text-[#FF6B35] flex-shrink-0 w-[80px]" style={{ fontFamily: 'Space Mono, monospace' }}>{inv.invoice_number}</span>
                    <p className="flex-1 text-sm text-[#F0EDE8] font-medium truncate min-w-0">{inv.title}</p>
                    <div className="hidden md:block w-20 text-center flex-shrink-0"><InvoiceStatusChip status={inv.status} /></div>
                    <div className="flex flex-col items-end w-24 flex-shrink-0">
                      <span className="text-xs font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(inv.amount_gtq)}</span>
                      <span className="text-[9px] text-[#4A9E6B]" style={{ fontFamily: 'Space Mono, monospace' }}>+IVA: {fmtGtq(inv.total_with_tax)}</span>
                    </div>
                    <span className="text-[9px] text-[#8A95A5] hidden lg:block w-24 text-center flex-shrink-0">{fmtDate(inv.issue_date)}</span>
                    <div className="flex items-center gap-0.5 flex-shrink-0 w-24 justify-end">
                      {canMarkPaid(inv) && <IconBtn icon={Check} label="Marcar pagada" variant="approve" size={12} onClick={e => { e.stopPropagation(); handleMarkPaid(inv) }} />}
                      {canEditInv(inv) && <IconBtn icon={Pencil} label="Editar" variant="edit" size={12} onClick={e => { e.stopPropagation(); setEditingInv(inv) }} />}
                      {deletingInvId === inv.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDeletingInvId(null)} className="text-[9px] px-1 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8]">No</button>
                          <button onClick={() => handleDeleteInv(inv.id)} className="text-[9px] px-1 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25">Sí</button>
                        </div>
                      ) : (
                        <IconBtn icon={Trash2} label="Eliminar" variant="delete" size={12} onClick={e => { e.stopPropagation(); setDeletingInvId(inv.id) }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
