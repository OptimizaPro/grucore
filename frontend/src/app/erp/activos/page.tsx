'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu, Wrench, RefreshCw, Loader2, Clock, Search, AlertCircle, GitCompare, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import { getMe, getMyProjects, type User, type ProjectList } from '@/lib/api'
import {
  getFixedAssets, getEquipmentUsageLogs,
  getEquipmentReconciliation, createEquipmentUsageLog,
  type FixedAsset, type EquipmentUsageLog,
  type EquipmentReconciliationResponse, type EquipmentReconciliationRow,
} from '@/lib/api-finance'

// ─── Form helpers ─────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 placeholder:text-[#4A5568]'
const selectCls = `${inputCls} appearance-none`

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-[#8A95A5] mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Registrar uso modal ──────────────────────────────────────────────────────

function RegistrarUsoModal({ asset, projects, onClose, onCreated }: {
  asset: FixedAsset
  projects: ProjectList[]
  onClose: () => void
  onCreated: (log: EquipmentUsageLog) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    project: '', usage_date: today, hours_used: '', rate_gtq_per_hour: asset.internal_rate_gtq_per_hour, notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.project || !form.hours_used) { toast.error('Proyecto y horas son obligatorios.'); return }
    setSaving(true)
    try {
      const log = await createEquipmentUsageLog(asset.id, {
        project:            Number(form.project),
        usage_date:         form.usage_date,
        hours_used:         form.hours_used,
        rate_gtq_per_hour:  form.rate_gtq_per_hour,
        notes:              form.notes,
      })
      toast.success('Registro de uso creado.')
      onCreated(log)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al registrar el uso.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A]">
          <div>
            <h2 className="text-sm font-semibold text-[#F0EDE8]">Registrar uso de equipo</h2>
            <p className="text-xs text-[#8A95A5] mt-0.5">{asset.asset_number} — {asset.name}</p>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Proyecto" required>
            <select className={selectCls} value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} required>
              <option value="">Seleccionar proyecto…</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha" required>
              <input type="date" className={inputCls} value={form.usage_date}
                onChange={e => setForm(f => ({ ...f, usage_date: e.target.value }))} required />
            </Field>
            <Field label="Horas usadas" required>
              <input type="number" className={inputCls} value={form.hours_used} min="0.1" step="0.1" placeholder="0.0"
                onChange={e => setForm(f => ({ ...f, hours_used: e.target.value }))} required />
            </Field>
            <Field label="Tarifa GTQ/h">
              <input type="number" className={inputCls} value={form.rate_gtq_per_hour} min="0" step="0.01"
                onChange={e => setForm(f => ({ ...f, rate_gtq_per_hour: e.target.value }))} />
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
              Registrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number | null | undefined) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
  return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const ASSET_STATUS: Record<string, { label: string; cls: string }> = {
  active:         { label: 'Activo',          cls: 'bg-emerald-500/15 text-emerald-400' },
  in_maintenance: { label: 'En mantenimiento',cls: 'bg-amber-500/15 text-amber-400' },
  idle:           { label: 'Inactivo',        cls: 'bg-[#27384A] text-[#8A95A5]' },
  disposed:       { label: 'Baja',            cls: 'bg-red-500/15 text-red-400' },
}

function StatusBadge({ val }: { val: string }) {
  const { label, cls } = ASSET_STATUS[val] ?? { label: val, cls: 'bg-[#27384A] text-[#8A95A5]' }
  return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

// ─── NBV progress bar ─────────────────────────────────────────────────────────

function DepreciationBar({ asset }: { asset: FixedAsset }) {
  const cost = Number(asset.purchase_cost_gtq)
  const nbv  = Number(asset.net_book_value_gtq)
  if (!cost) return null
  const pct  = Math.max(0, Math.min(100, (nbv / cost) * 100))
  const color = pct > 50 ? '#4A9E6B' : pct > 20 ? '#f59e0b' : '#ef4444'
  return (
    <div className="w-full h-1 bg-[#27384A] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

// ─── Asset card ───────────────────────────────────────────────────────────────

function AssetCard({ asset, selected, onClick }: { asset: FixedAsset; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 cursor-pointer transition-colors',
        selected
          ? 'bg-[#FF6B35]/10 border-[#FF6B35]/40'
          : 'bg-[#1e2a3a] border-[#27384A] hover:bg-[#1F2D3A]',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{asset.asset_number}</p>
          <p className="text-sm font-semibold text-[#F0EDE8] truncate">{asset.name}</p>
          <p className="text-xs text-[#8A95A5] truncate">{asset.category_name}</p>
        </div>
        <StatusBadge val={asset.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <p className="text-[#8A95A5]">Costo adq.</p>
          <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(asset.purchase_cost_gtq)}</p>
        </div>
        <div>
          <p className="text-[#8A95A5]">Valor neto</p>
          <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(asset.net_book_value_gtq)}</p>
        </div>
        {asset.monthly_depreciation_gtq && (
          <div>
            <p className="text-[#8A95A5]">Depr. mensual</p>
            <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(asset.monthly_depreciation_gtq)}</p>
          </div>
        )}
        <div>
          <p className="text-[#8A95A5]">Tarifa uso</p>
          <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>Q{Number(asset.internal_rate_gtq_per_hour).toFixed(2)}/h</p>
        </div>
      </div>

      <DepreciationBar asset={asset} />
      <p className="text-[10px] text-[#8A95A5] mt-1 text-right">
        {(((Number(asset.net_book_value_gtq) / Math.max(1, Number(asset.purchase_cost_gtq))) * 100)).toFixed(0)}% valor residual
      </p>
    </div>
  )
}

// ─── Usage log panel ──────────────────────────────────────────────────────────

function UsagePanel({ asset, projects }: { asset: FixedAsset; projects: ProjectList[] }) {
  const [logs, setLogs]           = useState<EquipmentUsageLog[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    getEquipmentUsageLogs(`asset=${asset.id}&ordering=-usage_date`)
      .then(r => setLogs(r.results))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [asset.id])

  const totalHours = logs.reduce((s, l) => s + Number(l.hours_used), 0)
  const totalCost  = logs.reduce((s, l) => s + Number(l.allocated_cost_gtq), 0)

  return (
    <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#27384A]">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#F0EDE8]">{asset.asset_number} — Registros de uso</h3>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-[#8A95A5]">
              <span className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{totalHours.toFixed(1)}h</span> totales
            </p>
            <p className="text-xs text-[#8A95A5]">
              Costo analítico: <span className="text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(totalCost)}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-medium rounded-lg hover:bg-[#FF8557] transition-colors"
        >
          <Plus size={12} />
          Registrar uso
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={18} className="animate-spin text-[#8A95A5]" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-[#8A95A5]">
          <Clock size={28} className="mb-2 opacity-30" />
          <p className="text-sm">Sin registros de uso.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#27384A]">
          {logs.map(log => (
            <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#F0EDE8]">{log.project_name}</p>
                <p className="text-xs text-[#8A95A5] mt-0.5">{fmtDate(log.usage_date)}{log.notes ? ` · ${log.notes}` : ''}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{Number(log.hours_used).toFixed(1)}h</p>
                <p className="text-xs text-[#8A95A5]">{fmtGtq(log.allocated_cost_gtq)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <RegistrarUsoModal
          asset={asset}
          projects={projects}
          onClose={() => setShowModal(false)}
          onCreated={log => { setLogs(prev => [log, ...prev]); setShowModal(false) }}
        />
      )}
    </div>
  )
}

// ─── Reconciliation table ─────────────────────────────────────────────────────

function VariancePill({ pct }: { pct: string | null }) {
  if (pct === null) return <span className="text-[#8A95A5]">—</span>
  const v = Number(pct)
  const cls = Math.abs(v) > 20
    ? (v > 0 ? 'bg-amber-500/15 text-amber-400' : 'bg-blue-500/15 text-blue-400')
    : 'bg-emerald-500/15 text-emerald-400'
  return (
    <span className={cn('inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium font-mono', cls)}>
      {v >= 0 ? '+' : ''}{v.toFixed(1)}%
    </span>
  )
}

function ReconciliationPanel({ data }: { data: EquipmentReconciliationResponse }) {
  const alertCount = data.summary.assets_alert

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Costo contable',   value: fmtGtq(data.totals.accounting_cost),  cls: 'text-[#F0EDE8]' },
          { label: 'Costo analítico',  value: fmtGtq(data.totals.analytical_cost),  cls: 'text-[#F0EDE8]' },
          { label: 'Horas registradas', value: `${Number(data.totals.hours_logged).toFixed(1)} h`, cls: 'text-[#F0EDE8]' },
          { label: 'Variación global', value: fmtGtq(data.totals.variance), cls: Number(data.totals.variance) >= 0 ? 'text-amber-400' : 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#1e2a3a] rounded-xl border border-[#27384A] p-3">
            <p className="text-[10px] text-[#8A95A5] mb-1">{s.label}</p>
            <p className={cn('text-sm font-bold', s.cls)} style={{ fontFamily: 'Space Mono, monospace' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {alertCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400">
          <AlertCircle size={13} />
          <span>{alertCount} activo{alertCount > 1 ? 's' : ''} con variación &gt;{data.summary.variance_threshold_pct}% — revisar tarifa interna.</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-[#8A95A5]">
        <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-amber-400" />Analítico &gt; Contable (tarifa posiblemente alta)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-blue-400" />Contable &gt; Analítico (tarifa posiblemente baja)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />Dentro del umbral ({data.summary.variance_threshold_pct}%)</span>
      </div>

      {/* Table */}
      <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
        {data.assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8A95A5]">
            <GitCompare size={28} className="mb-2 opacity-30" />
            <p className="text-sm">Sin datos de conciliación para el período.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#27384A]">
                  <th className="px-4 py-2.5 text-left text-[#8A95A5] font-medium">Activo</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Horas</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Tarifa/h</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Depr.</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Mant.</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Contable</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Analítico</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Variación</th>
                  <th className="px-4 py-2.5 text-right text-[#8A95A5] font-medium">Var.%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27384A]">
                {data.assets.map((row: EquipmentReconciliationRow) => (
                  <tr
                    key={row.asset_id}
                    className={cn(
                      'hover:bg-[#1F2D3A] transition-colors',
                      row.rate_review_needed && 'border-l-2 border-amber-500/60',
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <p className="text-[#F0EDE8] font-medium">{row.asset_name}</p>
                      <p className="text-[#8A95A5] text-[10px]">{row.asset_number} · {row.category}</p>
                      {row.rate_last_reviewed && (
                        <p className="text-[#4A5568] text-[10px]">Tarifa rev. {fmtDate(row.rate_last_reviewed)}</p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#F0EDE8]">{Number(row.hours_logged).toFixed(1)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#8A95A5]">Q{Number(row.internal_rate).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#8A95A5]">{fmtGtq(row.depreciation_cost)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#8A95A5]">{Number(row.maintenance_cost) > 0 ? fmtGtq(row.maintenance_cost) : '—'}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#F0EDE8]">{fmtGtq(row.accounting_cost)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#F0EDE8]">{fmtGtq(row.analytical_cost)}</td>
                    <td className={cn('px-4 py-2.5 text-right font-mono font-medium', Number(row.variance) >= 0 ? 'text-amber-400' : 'text-blue-400')}>
                      {Number(row.variance) >= 0 ? '+' : ''}{fmtGtq(row.variance)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <VariancePill pct={row.variance_pct} />
                    </td>
                  </tr>
                ))}
                {/* Totals */}
                <tr className="bg-[#151e2b] border-t-2 border-[#27384A]">
                  <td className="px-4 py-2.5 text-[#8A95A5] font-semibold">TOTAL</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[#F0EDE8] font-semibold">{Number(data.totals.hours_logged).toFixed(1)}</td>
                  <td colSpan={3} />
                  <td className="px-4 py-2.5 text-right font-mono text-[#F0EDE8] font-semibold">{fmtGtq(data.totals.accounting_cost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-[#F0EDE8] font-semibold">{fmtGtq(data.totals.analytical_cost)}</td>
                  <td className={cn('px-4 py-2.5 text-right font-mono font-semibold', Number(data.totals.variance) >= 0 ? 'text-amber-400' : 'text-blue-400')}>
                    {Number(data.totals.variance) >= 0 ? '+' : ''}{fmtGtq(data.totals.variance)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <VariancePill pct={data.totals.variance_pct} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[10px] text-[#8A95A5]">
        * Costo contable = depreciación posted + mantenimiento referencial del período.
        El costo real de mantenimiento puede estar en Gastos o Facturas de proveedor.
        Pendiente validación contador para ajuste de tarifas.
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'assets' | 'reconciliation'

export default function ActivosPage() {
  const [user, setUser]           = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab]             = useState<Tab>('assets')

  // Assets tab state
  const [assets, setAssets]       = useState<FixedAsset[]>([])
  const [filtered, setFiltered]   = useState<FixedAsset[]>([])
  const [selected, setSelected]   = useState<FixedAsset | null>(null)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [projects, setProjects]   = useState<ProjectList[]>([])

  // Reconciliation tab state
  const [reconYear, setReconYear]         = useState(new Date().getFullYear())
  const [reconMonthFrom, setReconMonthFrom] = useState(1)
  const [reconMonthTo, setReconMonthTo]   = useState(12)
  const [reconData, setReconData]         = useState<EquipmentReconciliationResponse | null>(null)
  const [reconLoading, setReconLoading]   = useState(false)

  useEffect(() => { getMe().then(setUser).catch(() => {}) }, [])
  useEffect(() => { getMyProjects().then(r => setProjects(r.results)).catch(() => {}) }, [])

  const loadAssets = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFixedAssets('ordering=category,name')
      setAssets(data.results)
      setFiltered(data.results)
    } catch {
      toast.error('Error cargando activos fijos.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadReconciliation = useCallback(async () => {
    setReconLoading(true)
    try {
      setReconData(await getEquipmentReconciliation(reconYear, reconMonthFrom, reconMonthTo))
    } catch {
      toast.error('Error cargando conciliación de equipos.')
    } finally {
      setReconLoading(false)
    }
  }, [reconYear, reconMonthFrom, reconMonthTo])

  useEffect(() => { loadAssets() }, [loadAssets])
  useEffect(() => { if (tab === 'reconciliation') loadReconciliation() }, [tab, loadReconciliation])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? assets.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.asset_number.toLowerCase().includes(q) ||
      a.category_name.toLowerCase().includes(q) ||
      a.serial_number.toLowerCase().includes(q)
    ) : assets)
  }, [search, assets])

  const totalCost  = assets.reduce((s, a) => s + Number(a.purchase_cost_gtq), 0)
  const totalNBV   = assets.reduce((s, a) => s + Number(a.net_book_value_gtq), 0)
  const totalDeprM = assets.reduce((s, a) => s + (a.monthly_depreciation_gtq ? Number(a.monthly_depreciation_gtq) : 0), 0)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i)
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <ERPSidebar
        currentPage="activos"
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
          <Wrench size={18} className="text-[#FF6B35]" />
          <h1 className="text-base font-semibold text-[#F0EDE8]">Activos fijos</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => tab === 'assets' ? loadAssets() : loadReconciliation()}
              className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A] transition-colors"
            >
              <RefreshCw size={15} />
            </button>
            {user && <ERPAvatar avatarUrl={user.avatar_url} initials={`${user.first_name[0]}${user.last_name[0]}`} size="sm" />}
          </div>
        </div>

        <div className="px-4 md:px-6 py-5 max-w-7xl mx-auto space-y-5">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#1e2a3a] rounded-lg p-1 w-fit border border-[#27384A]">
            {([['assets', 'Activos y uso'], ['reconciliation', 'Conciliación equipos']] as [Tab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 py-2 text-sm rounded-md transition-colors',
                  tab === t
                    ? 'bg-[#FF6B35] text-white font-medium'
                    : 'text-[#8A95A5] hover:text-[#F0EDE8]',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── Assets tab ── */}
          {tab === 'assets' && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Costo de adquisición total', value: fmtGtq(totalCost) },
                  { label: 'Valor neto en libros (NBV)', value: fmtGtq(totalNBV) },
                  { label: 'Depreciación mensual (línea recta)', value: fmtGtq(totalDeprM) },
                ].map(s => (
                  <div key={s.label} className="bg-[#1e2a3a] rounded-xl border border-[#27384A] p-4">
                    <p className="text-[11px] text-[#8A95A5] mb-1">{s.label}</p>
                    <p className="text-lg font-bold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, número, categoría..."
                  className="w-full bg-[#1e2a3a] border border-[#27384A] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20 text-[#8A95A5]">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span className="text-sm">Cargando activos...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 content-start">
                    {filtered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-[#8A95A5] sm:col-span-2 lg:col-span-1">
                        <Wrench size={28} className="mb-2 opacity-30" />
                        <p className="text-sm">No hay activos fijos.</p>
                      </div>
                    ) : (
                      filtered.map(a => (
                        <AssetCard
                          key={a.id}
                          asset={a}
                          selected={selected?.id === a.id}
                          onClick={() => setSelected(selected?.id === a.id ? null : a)}
                        />
                      ))
                    )}
                  </div>
                  <div className="lg:col-span-2">
                    {selected ? (
                      <UsagePanel asset={selected} projects={projects} />
                    ) : (
                      <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] flex flex-col items-center justify-center py-20 text-[#8A95A5]">
                        <Clock size={32} className="mb-3 opacity-30" />
                        <p className="text-sm">Selecciona un activo para ver su historial de uso.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Reconciliation tab ── */}
          {tab === 'reconciliation' && (
            <>
              {/* Period controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#8A95A5]">Año:</label>
                  <select
                    value={reconYear}
                    onChange={e => setReconYear(Number(e.target.value))}
                    className="bg-[#1e2a3a] border border-[#27384A] rounded-lg px-3 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#8A95A5]">Desde:</label>
                  <select
                    value={reconMonthFrom}
                    onChange={e => setReconMonthFrom(Number(e.target.value))}
                    className="bg-[#1e2a3a] border border-[#27384A] rounded-lg px-3 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
                  >
                    {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-[#8A95A5]">Hasta:</label>
                  <select
                    value={reconMonthTo}
                    onChange={e => setReconMonthTo(Number(e.target.value))}
                    className="bg-[#1e2a3a] border border-[#27384A] rounded-lg px-3 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
                  >
                    {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <button
                  onClick={loadReconciliation}
                  className="px-3 py-1.5 text-sm bg-[#FF6B35] text-white rounded-lg hover:bg-[#e85a25] transition-colors"
                >
                  Aplicar
                </button>
              </div>

              {reconLoading ? (
                <div className="flex items-center justify-center py-20 text-[#8A95A5]">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span className="text-sm">Calculando conciliación...</span>
                </div>
              ) : reconData ? (
                <ReconciliationPanel data={reconData} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-[#8A95A5]">
                  <GitCompare size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Selecciona un período y pulsa Aplicar.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
