'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu, ShoppingCart, CheckCircle2, Clock, Truck, FileText, CreditCard, AlertCircle, Loader2, ChevronDown, ChevronUp, RefreshCw, Plus, X, Trash2, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import { getMe, getSuppliers, getMyProjects, type User, type Supplier, type ProjectList } from '@/lib/api'
import {
  getPurchaseOrders, getSupplierInvoices, getSupplierPayments,
  confirmPurchaseOrder, postSupplierInvoice, postSupplierPayment,
  createPurchaseOrder, createSupplierInvoice, createSupplierPayment,
  downloadPurchaseOrderPDF,
  type PurchaseOrder, type SupplierInvoice, type SupplierPayment,
  type PurchaseOrderLineInput,
} from '@/lib/api-finance'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number | null | undefined) {
  if (val === null || val === undefined) return '—'
  return `Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const PO_STATUS: Record<string, { label: string; cls: string }> = {
  draft:              { label: 'Borrador',       cls: 'bg-[#27384A] text-[#8A95A5]' },
  sent:               { label: 'Enviada',        cls: 'bg-blue-500/15 text-blue-400' },
  confirmed:          { label: 'Confirmada',     cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
  partially_received: { label: 'Recep. parcial', cls: 'bg-amber-500/15 text-amber-400' },
  received:           { label: 'Recibida',       cls: 'bg-emerald-500/15 text-emerald-400' },
  invoiced:           { label: 'Facturada',      cls: 'bg-purple-500/15 text-purple-400' },
  cancelled:          { label: 'Cancelada',      cls: 'bg-red-500/15 text-red-400' },
}

const SPI_STATUS: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Borrador',   cls: 'bg-[#27384A] text-[#8A95A5]' },
  posted:    { label: 'Registrada', cls: 'bg-emerald-500/15 text-emerald-400' },
  paid:      { label: 'Pagada',     cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
  cancelled: { label: 'Cancelada',  cls: 'bg-red-500/15 text-red-400' },
}

function StatusBadge({ map, val }: { map: Record<string, { label: string; cls: string }>; val: string }) {
  const { label, cls } = map[val] ?? { label: val, cls: 'bg-[#27384A] text-[#8A95A5]' }
  return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'orders' | 'invoices' | 'payments'

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'orders',   label: 'Órdenes de compra',    Icon: ShoppingCart },
  { id: 'invoices', label: 'Facturas de proveedor', Icon: FileText },
  { id: 'payments', label: 'Pagos',                 Icon: CreditCard },
]

// ─── PO Table ─────────────────────────────────────────────────────────────────

function POTable({ orders, onConfirm, loading }: { orders: PurchaseOrder[]; onConfirm: (id: number) => void; loading: boolean }) {
  const [expanded, setExpanded]   = useState<number | null>(null)
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)

  async function handlePDF(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setPdfLoading(id)
    try {
      await downloadPurchaseOrderPDF(id)
    } catch {
      toast.error('Error generando el PDF.')
    } finally {
      setPdfLoading(null)
    }
  }

  if (loading) return <Loader className />
  if (!orders.length) return <Empty text="No hay órdenes de compra." />

  return (
    <div className="divide-y divide-[#27384A]">
      {orders.map(po => (
        <div key={po.id}>
          <div
            className="flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A] cursor-pointer transition-colors"
            onClick={() => setExpanded(expanded === po.id ? null : po.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {po.number}
                </span>
                <StatusBadge map={PO_STATUS} val={po.status} />
              </div>
              <p className="text-xs text-[#8A95A5] mt-0.5 truncate">{po.supplier_name}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(po.total_gtq)}</p>
              <p className="text-xs text-[#8A95A5]">{fmtDate(po.delivery_date)}</p>
            </div>
            {expanded === po.id ? <ChevronUp size={14} className="text-[#8A95A5] flex-shrink-0" /> : <ChevronDown size={14} className="text-[#8A95A5] flex-shrink-0" />}
          </div>

          {expanded === po.id && (
            <div className="px-4 pb-4 bg-[#131D28] border-t border-[#27384A]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 mb-3">
                <Stat label="Subtotal" value={fmtGtq(po.subtotal_gtq)} />
                <Stat label="IVA" value={fmtGtq(po.tax_amount_gtq)} />
                <Stat label="Total" value={fmtGtq(po.total_gtq)} accent />
                <Stat label="Entrega esperada" value={fmtDate(po.delivery_date)} />
              </div>

              {po.lines.length > 0 && (
                <div className="rounded-lg overflow-hidden border border-[#27384A] mb-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#1e2a3a] text-[#8A95A5]">
                        <th className="text-left px-3 py-2">Descripción</th>
                        <th className="text-right px-3 py-2 hidden sm:table-cell">Cant.</th>
                        <th className="text-right px-3 py-2 hidden sm:table-cell">P. Unit</th>
                        <th className="text-right px-3 py-2">Subtotal</th>
                        <th className="text-right px-3 py-2 hidden md:table-cell">Recibido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27384A]">
                      {po.lines.map(l => (
                        <tr key={l.id} className="text-[#F0EDE8]">
                          <td className="px-3 py-2">{l.description}</td>
                          <td className="px-3 py-2 text-right hidden sm:table-cell">{l.quantity} {l.unit}</td>
                          <td className="px-3 py-2 text-right hidden sm:table-cell">{fmtGtq(l.unit_cost_gtq)}</td>
                          <td className="px-3 py-2 text-right" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(l.line_subtotal_gtq)}</td>
                          <td className="px-3 py-2 text-right hidden md:table-cell text-[#8A95A5]">{l.quantity_received_total}/{l.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={e => handlePDF(e, po.id)}
                  disabled={pdfLoading === po.id}
                  className="flex items-center gap-2 text-xs px-3 py-1.5 bg-[#1e2a3a] border border-[#27384A] text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/40 transition-colors disabled:opacity-50"
                >
                  {pdfLoading === po.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <FileDown size={12} />
                  }
                  PDF
                </button>
                {(po.status === 'draft' || po.status === 'sent') && (
                  <button
                    onClick={e => { e.stopPropagation(); onConfirm(po.id) }}
                    className="flex items-center gap-2 text-xs px-3 py-1.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 transition-colors"
                  >
                    <CheckCircle2 size={12} />
                    Confirmar orden
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Invoice Table ────────────────────────────────────────────────────────────

function InvoiceTable({ invoices, onPost, loading }: { invoices: SupplierInvoice[]; onPost: (id: number) => void; loading: boolean }) {
  if (loading) return <Loader className />
  if (!invoices.length) return <Empty text="No hay facturas de proveedor." />

  return (
    <div className="divide-y divide-[#27384A]">
      {invoices.map(inv => (
        <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A] transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                {inv.number}
              </span>
              <StatusBadge map={SPI_STATUS} val={inv.status} />
              {inv.is_overdue && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                  <AlertCircle size={9} />Vencida
                </span>
              )}
            </div>
            <p className="text-xs text-[#8A95A5] mt-0.5">{inv.supplier_name} · {inv.supplier_invoice_number || '—'} · {fmtDate(inv.issue_date)}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(inv.total_gtq)}</p>
            <p className="text-xs text-[#8A95A5]">Saldo: {fmtGtq(inv.balance_gtq)}</p>
          </div>
          {inv.status === 'draft' && (
            <button
              onClick={() => onPost(inv.id)}
              className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/30 rounded-lg hover:bg-[#FF6B35]/20 transition-colors"
            >
              <CheckCircle2 size={11} />
              Registrar
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Payment Table ────────────────────────────────────────────────────────────

const PAY_STATUS: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Borrador',   cls: 'bg-[#27384A] text-[#8A95A5]' },
  posted:    { label: 'Registrado', cls: 'bg-emerald-500/15 text-emerald-400' },
  cancelled: { label: 'Cancelado',  cls: 'bg-red-500/15 text-red-400' },
}

function PaymentTable({ payments, onPost, loading }: { payments: SupplierPayment[]; onPost: (id: number) => void; loading: boolean }) {
  if (loading) return <Loader className />
  if (!payments.length) return <Empty text="No hay pagos registrados." />

  return (
    <div className="divide-y divide-[#27384A]">
      {payments.map(pay => (
        <div key={pay.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A] transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                {pay.number}
              </span>
              <StatusBadge map={PAY_STATUS} val={pay.status} />
            </div>
            <p className="text-xs text-[#8A95A5] mt-0.5">{pay.supplier_name} · {fmtDate(pay.payment_date)} · {pay.reference_number || '—'}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(pay.amount_gtq)}</p>
          </div>
          {pay.status === 'draft' && (
            <button
              onClick={() => onPost(pay.id)}
              className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/30 rounded-lg hover:bg-[#FF6B35]/20 transition-colors"
            >
              <CheckCircle2 size={11} />
              Registrar
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-[#8A95A5] mb-0.5">{label}</p>
      <p className={cn('text-sm font-medium', accent ? 'text-[#FF6B35]' : 'text-[#F0EDE8]')} style={{ fontFamily: 'Space Mono, monospace' }}>
        {value}
      </p>
    </div>
  )
}

function Loader({ className }: { className?: boolean }) {
  return (
    <div className="flex items-center justify-center py-16 text-[#8A95A5]">
      <Loader2 size={20} className="animate-spin mr-2" />
      <span className="text-sm">Cargando...</span>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#8A95A5]">
      <ShoppingCart size={32} className="mb-3 opacity-30" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, Icon, color }: {
  label: string; value: string; sub?: string; Icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-[#1e2a3a] rounded-xl p-4 border border-[#27384A]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[#8A95A5] mb-1">{label}</p>
          <p className="text-lg font-bold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{value}</p>
          {sub && <p className="text-[10px] text-[#8A95A5] mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg`} style={{ background: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
    </div>
  )
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-[#8A95A5] mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 placeholder:text-[#4A5568]'
const selectCls = `${inputCls} appearance-none`

// ─── Nueva OC modal ───────────────────────────────────────────────────────────

function NuevaOCModal({ suppliers, projects, onClose, onCreated }: {
  suppliers: Supplier[]
  projects: ProjectList[]
  onClose: () => void
  onCreated: (po: PurchaseOrder) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    supplier: '', project: '', tax_percentage: '12', delivery_date: '', notes: '',
  })
  const [lines, setLines] = useState<PurchaseOrderLineInput[]>([
    { description: '', quantity: '1', unit: 'unidad', unit_cost_gtq: '0.00' },
  ])

  function setLine(i: number, k: keyof PurchaseOrderLineInput, v: string) {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  }
  function addLine() {
    setLines(prev => [...prev, { description: '', quantity: '1', unit: 'unidad', unit_cost_gtq: '0.00' }])
  }
  function removeLine(i: number) {
    if (lines.length === 1) return
    setLines(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier || !form.project) { toast.error('Proveedor y proyecto son obligatorios.'); return }
    if (lines.some(l => !l.description.trim())) { toast.error('Todas las líneas necesitan descripción.'); return }
    setSaving(true)
    try {
      const po = await createPurchaseOrder({
        supplier: Number(form.supplier),
        project:  Number(form.project),
        tax_percentage: form.tax_percentage || '12',
        delivery_date:  form.delivery_date || null,
        notes: form.notes,
        lines,
      })
      toast.success(`OC ${po.number} creada.`)
      onCreated(po)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al crear la orden de compra.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A]">
          <h2 className="text-sm font-semibold text-[#F0EDE8]">Nueva orden de compra</h2>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Proveedor" required>
              <select className={selectCls} value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} required>
                <option value="">Seleccionar proveedor…</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Proyecto" required>
              <select className={selectCls} value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} required>
                <option value="">Seleccionar proyecto…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="% IVA">
              <input type="number" className={inputCls} value={form.tax_percentage} min="0" max="100" step="0.01"
                onChange={e => setForm(f => ({ ...f, tax_percentage: e.target.value }))} />
            </Field>
            <Field label="Fecha entrega esperada">
              <input type="date" className={inputCls} value={form.delivery_date}
                onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))} />
            </Field>
          </div>
          <Field label="Notas">
            <textarea className={inputCls} rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Field>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-[#F0EDE8]">Líneas de la orden</p>
              <button type="button" onClick={addLine} className="text-xs text-[#FF6B35] hover:underline flex items-center gap-1">
                <Plus size={11} />Añadir línea
              </button>
            </div>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start bg-[#131D28] rounded-lg p-2">
                  <div className="col-span-5">
                    <input className={inputCls} placeholder="Descripción*" value={line.description}
                      onChange={e => setLine(i, 'description', e.target.value)} required />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className={inputCls} placeholder="Cant." value={line.quantity} min="0.001" step="0.001"
                      onChange={e => setLine(i, 'quantity', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input className={inputCls} placeholder="Unidad" value={line.unit}
                      onChange={e => setLine(i, 'unit', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <input type="number" className={inputCls} placeholder="P.Unit" value={line.unit_cost_gtq} min="0" step="0.01"
                      onChange={e => setLine(i, 'unit_cost_gtq', e.target.value)} />
                  </div>
                  <div className="col-span-1 flex justify-center pt-1.5">
                    <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1}
                      className="text-[#8A95A5] hover:text-red-400 disabled:opacity-30">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear OC
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Nueva factura modal ──────────────────────────────────────────────────────

function NuevaFacturaModal({ suppliers, orders, onClose, onCreated }: {
  suppliers: Supplier[]
  orders: PurchaseOrder[]
  onClose: () => void
  onCreated: (inv: SupplierInvoice) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    supplier: '', purchase_order: '', supplier_invoice_number: '',
    issue_date: today, due_date: '', subtotal_gtq: '', tax_percentage: '12', notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier || !form.supplier_invoice_number || !form.issue_date) {
      toast.error('Proveedor, N° factura y fecha son obligatorios.'); return
    }
    const subtotal = parseFloat(form.subtotal_gtq) || 0
    const tax = subtotal * (parseFloat(form.tax_percentage) / 100)
    setSaving(true)
    try {
      const inv = await createSupplierInvoice({
        supplier: Number(form.supplier),
        purchase_order: form.purchase_order ? Number(form.purchase_order) : null,
        supplier_invoice_number: form.supplier_invoice_number,
        issue_date: form.issue_date,
        due_date: form.due_date || null,
        tax_percentage: form.tax_percentage,
        notes: form.notes,
        lines: [{
          description: 'Factura de proveedor',
          quantity: '1',
          unit_cost_gtq: form.subtotal_gtq,
        }],
      })
      toast.success(`Factura ${inv.number} creada.`)
      onCreated(inv)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al crear la factura.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A]">
          <h2 className="text-sm font-semibold text-[#F0EDE8]">Nueva factura de proveedor</h2>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Proveedor" required>
              <select className={selectCls} value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} required>
                <option value="">Seleccionar proveedor…</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="OC vinculada">
              <select className={selectCls} value={form.purchase_order} onChange={e => setForm(f => ({ ...f, purchase_order: e.target.value }))}>
                <option value="">Sin OC</option>
                {orders.map(o => <option key={o.id} value={o.id}>{o.number}</option>)}
              </select>
            </Field>
            <Field label="N° factura proveedor" required>
              <input className={inputCls} value={form.supplier_invoice_number} placeholder="ej. FE-001-2026"
                onChange={e => setForm(f => ({ ...f, supplier_invoice_number: e.target.value }))} required />
            </Field>
            <Field label="Fecha emisión" required>
              <input type="date" className={inputCls} value={form.issue_date}
                onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} required />
            </Field>
            <Field label="Fecha vencimiento">
              <input type="date" className={inputCls} value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
            </Field>
            <Field label="Subtotal (GTQ)" required>
              <input type="number" className={inputCls} value={form.subtotal_gtq} min="0" step="0.01" placeholder="0.00"
                onChange={e => setForm(f => ({ ...f, subtotal_gtq: e.target.value }))} required />
            </Field>
            <Field label="% IVA">
              <input type="number" className={inputCls} value={form.tax_percentage} min="0" max="100" step="0.01"
                onChange={e => setForm(f => ({ ...f, tax_percentage: e.target.value }))} />
            </Field>
          </div>
          <Field label="Notas">
            <textarea className={inputCls} rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#8A95A5] hover:text-[#F0EDE8]">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear factura
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Nuevo pago modal ─────────────────────────────────────────────────────────

function NuevoPagoModal({ suppliers, onClose, onCreated }: {
  suppliers: Supplier[]
  onClose: () => void
  onCreated: (pay: SupplierPayment) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    supplier: '', payment_date: today, payment_method: 'bank_transfer',
    amount_gtq: '', reference_number: '', notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.supplier || !form.amount_gtq) { toast.error('Proveedor e importe son obligatorios.'); return }
    setSaving(true)
    try {
      const pay = await createSupplierPayment({
        supplier: Number(form.supplier),
        payment_date: form.payment_date,
        payment_method: form.payment_method,
        amount_gtq: form.amount_gtq,
        reference_number: form.reference_number,
        notes: form.notes,
      })
      toast.success(`Pago ${pay.number} creado.`)
      onCreated(pay)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al crear el pago.')
    } finally {
      setSaving(false)
    }
  }

  const METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'bank_transfer', label: 'Transferencia bancaria' },
    { value: 'check', label: 'Cheque' },
    { value: 'other', label: 'Otro' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A]">
          <h2 className="text-sm font-semibold text-[#F0EDE8]">Nuevo pago a proveedor</h2>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Proveedor" required>
              <select className={selectCls} value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} required>
                <option value="">Seleccionar proveedor…</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Fecha de pago" required>
              <input type="date" className={inputCls} value={form.payment_date}
                onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} required />
            </Field>
            <Field label="Método de pago">
              <select className={selectCls} value={form.payment_method} onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}>
                {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Importe (GTQ)" required>
              <input type="number" className={inputCls} value={form.amount_gtq} min="0.01" step="0.01" placeholder="0.00"
                onChange={e => setForm(f => ({ ...f, amount_gtq: e.target.value }))} required />
            </Field>
            <Field label="N° referencia / cheque">
              <input className={inputCls} value={form.reference_number} placeholder="Opcional"
                onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} />
            </Field>
          </div>
          <Field label="Notas">
            <textarea className={inputCls} rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#8A95A5] hover:text-[#F0EDE8]">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear pago
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ComprasPage() {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('orders')

  const [orders,   setOrders]   = useState<PurchaseOrder[]>([])
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([])
  const [payments, setPayments] = useState<SupplierPayment[]>([])
  const [loading,  setLoading]  = useState(true)
  const [acting,   setActing]   = useState(false)

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [projects,  setProjects]  = useState<ProjectList[]>([])
  const [showNewOC,  setShowNewOC]  = useState(false)
  const [showNewInv, setShowNewInv] = useState(false)
  const [showNewPay, setShowNewPay] = useState(false)

  useEffect(() => { getMe().then(setUser).catch(() => {}) }, [])
  useEffect(() => {
    getSuppliers({ is_active: true }).then(setSuppliers).catch(() => {})
    getMyProjects().then(r => setProjects(r.results)).catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ords, invs, pays] = await Promise.all([
        getPurchaseOrders('ordering=-created_at'),
        getSupplierInvoices('ordering=-issue_date'),
        getSupplierPayments('ordering=-payment_date'),
      ])
      setOrders(ords.results)
      setInvoices(invs.results)
      setPayments(pays.results)
    } catch {
      toast.error('Error cargando datos de compras.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleConfirmPO(id: number) {
    if (acting) return
    setActing(true)
    try {
      const updated = await confirmPurchaseOrder(id)
      setOrders(prev => prev.map(o => o.id === id ? updated : o))
      toast.success('Orden confirmada.')
    } catch (e: any) {
      toast.error(e.message ?? 'Error al confirmar la orden.')
    } finally {
      setActing(false)
    }
  }

  async function handlePostInvoice(id: number) {
    if (acting) return
    setActing(true)
    try {
      const updated = await postSupplierInvoice(id)
      setInvoices(prev => prev.map(i => i.id === id ? updated : i))
      toast.success('Factura registrada.')
    } catch (e: any) {
      toast.error(e.message ?? 'Error al registrar la factura.')
    } finally {
      setActing(false)
    }
  }

  async function handlePostPayment(id: number) {
    if (acting) return
    setActing(true)
    try {
      const updated = await postSupplierPayment(id)
      setPayments(prev => prev.map(p => p.id === id ? updated : p))
      toast.success('Pago registrado.')
    } catch (e: any) {
      toast.error(e.message ?? 'Error al registrar el pago.')
    } finally {
      setActing(false)
    }
  }

  // Summary stats
  const confirmedTotal = orders
    .filter(o => ['confirmed','partially_received','received','invoiced'].includes(o.status))
    .reduce((s, o) => s + Number(o.total_gtq), 0)

  const pendingInvoices = invoices.filter(i => i.status === 'posted' && Number(i.balance_gtq) > 0).length
  const overdueInvoices = invoices.filter(i => i.is_overdue).length

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <ERPSidebar
        currentPage="compras"
        userName={user ? `${user.first_name} ${user.last_name}` : undefined}
        userInitials={user ? `${user.first_name[0]}${user.last_name[0]}` : undefined}
        userAvatarUrl={user?.avatar_url}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur border-b border-[#27384A] px-4 md:px-6 h-14 flex items-center gap-3">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(v => !v)}>
            <Menu size={20} />
          </button>
          <ShoppingCart size={18} className="text-[#FF6B35]" />
          <h1 className="text-base font-semibold text-[#F0EDE8]">Compras</h1>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={load} className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A] transition-colors">
              <RefreshCw size={15} />
            </button>
            {user && <ERPAvatar avatarUrl={user.avatar_url} initials={`${user.first_name[0]}${user.last_name[0]}`} size="sm" />}
          </div>
        </div>

        <div className="px-4 md:px-6 py-5 space-y-5 max-w-6xl mx-auto">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard
              label="OC confirmadas"
              value={fmtGtq(confirmedTotal)}
              sub={`${orders.filter(o => o.status === 'confirmed').length} órdenes activas`}
              Icon={CheckCircle2}
              color="#FF6B35"
            />
            <SummaryCard
              label="Facturas pendientes"
              value={String(pendingInvoices)}
              sub="con saldo por pagar"
              Icon={FileText}
              color="#4A9E6B"
            />
            <SummaryCard
              label="Facturas vencidas"
              value={String(overdueInvoices)}
              sub={overdueInvoices > 0 ? 'Requieren atención' : 'Al día'}
              Icon={AlertCircle}
              color={overdueInvoices > 0 ? '#ef4444' : '#4A9E6B'}
            />
            <SummaryCard
              label="En recepción parcial"
              value={String(orders.filter(o => o.status === 'partially_received').length)}
              sub="pendientes de completar"
              Icon={Truck}
              color="#6B8CFF"
            />
          </div>

          {/* Tabs */}
          <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
            <div className="flex items-center border-b border-[#27384A]">
              <div className="flex flex-1">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2',
                      activeTab === tab.id
                        ? 'text-[#FF6B35] border-[#FF6B35] bg-[#FF6B35]/5'
                        : 'text-[#8A95A5] border-transparent hover:text-[#F0EDE8]',
                    )}
                  >
                    <tab.Icon size={14} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
              <div className="pr-3">
                {activeTab === 'orders' && (
                  <button
                    onClick={() => setShowNewOC(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-medium rounded-lg hover:bg-[#FF8557] transition-colors"
                  >
                    <Plus size={12} />
                    <span className="hidden sm:inline">Nueva OC</span>
                    <span className="sm:hidden">Nueva</span>
                  </button>
                )}
                {activeTab === 'invoices' && (
                  <button
                    onClick={() => setShowNewInv(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-medium rounded-lg hover:bg-[#FF8557] transition-colors"
                  >
                    <Plus size={12} />
                    <span className="hidden sm:inline">Nueva factura</span>
                    <span className="sm:hidden">Nueva</span>
                  </button>
                )}
                {activeTab === 'payments' && (
                  <button
                    onClick={() => setShowNewPay(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-medium rounded-lg hover:bg-[#FF8557] transition-colors"
                  >
                    <Plus size={12} />
                    <span className="hidden sm:inline">Nuevo pago</span>
                    <span className="sm:hidden">Nuevo</span>
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'orders'   && <POTable      orders={orders}     onConfirm={handleConfirmPO}   loading={loading} />}
            {activeTab === 'invoices' && <InvoiceTable invoices={invoices} onPost={handlePostInvoice}    loading={loading} />}
            {activeTab === 'payments' && <PaymentTable payments={payments} onPost={handlePostPayment}    loading={loading} />}
          </div>
        </div>
      </main>

      {showNewOC && (
        <NuevaOCModal
          suppliers={suppliers}
          projects={projects}
          onClose={() => setShowNewOC(false)}
          onCreated={po => { setOrders(prev => [po, ...prev]); setShowNewOC(false) }}
        />
      )}
      {showNewInv && (
        <NuevaFacturaModal
          suppliers={suppliers}
          orders={orders}
          onClose={() => setShowNewInv(false)}
          onCreated={inv => { setInvoices(prev => [inv, ...prev]); setShowNewInv(false) }}
        />
      )}
      {showNewPay && (
        <NuevoPagoModal
          suppliers={suppliers}
          onClose={() => setShowNewPay(false)}
          onCreated={pay => { setPayments(prev => [pay, ...prev]); setShowNewPay(false) }}
        />
      )}
    </div>
  )
}
