'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu, Landmark, RefreshCw, Loader2, ChevronDown, ChevronRight, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import { getMe, type User } from '@/lib/api'
import {
  getARaging, getCashFlowForecast,
  type ARAgingResponse, type ARAgingClientRow,
  type CashFlowForecastResponse, type CashFlowPeriod,
} from '@/lib/api-finance'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number | null | undefined) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
  return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function n(v: string | number) { return Number(v) }

// ─── Bucket badge ─────────────────────────────────────────────────────────────

const BUCKET_LABEL: Record<string, string> = {
  current: 'Al día',
  '1_30':  '1–30 d',
  '31_60': '31–60 d',
  '61_90': '61–90 d',
  over_90: '+90 d',
}
const BUCKET_CLS: Record<string, string> = {
  current: 'bg-emerald-500/15 text-emerald-400',
  '1_30':  'bg-amber-500/15 text-amber-400',
  '31_60': 'bg-orange-500/15 text-orange-400',
  '61_90': 'bg-red-500/15 text-red-400',
  over_90: 'bg-red-700/30 text-red-300',
}

function BucketBadge({ bucket }: { bucket: string }) {
  return (
    <span className={cn('inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium', BUCKET_CLS[bucket] ?? 'bg-[#27384A] text-[#8A95A5]')}>
      {BUCKET_LABEL[bucket] ?? bucket}
    </span>
  )
}

// ─── AR Aging table ───────────────────────────────────────────────────────────

function AgingClientRow({ row }: { row: ARAgingClientRow }) {
  const [open, setOpen] = useState(false)
  const total = n(row.total)
  return (
    <>
      <tr
        onClick={() => setOpen(v => !v)}
        className="cursor-pointer hover:bg-[#1F2D3A] transition-colors border-b border-[#27384A]"
      >
        <td className="px-4 py-3 text-sm text-[#F0EDE8] flex items-center gap-2">
          {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {row.client_name}
        </td>
        <td className="px-4 py-3 text-sm text-right text-emerald-400 font-mono">{fmtGtq(row.current)}</td>
        <td className="px-4 py-3 text-sm text-right text-amber-400 font-mono">{n(row['1_30']) > 0 ? fmtGtq(row['1_30']) : '—'}</td>
        <td className="px-4 py-3 text-sm text-right text-orange-400 font-mono">{n(row['31_60']) > 0 ? fmtGtq(row['31_60']) : '—'}</td>
        <td className="px-4 py-3 text-sm text-right text-red-400 font-mono">{n(row['61_90']) > 0 ? fmtGtq(row['61_90']) : '—'}</td>
        <td className="px-4 py-3 text-sm text-right text-red-300 font-mono">{n(row.over_90) > 0 ? fmtGtq(row.over_90) : '—'}</td>
        <td className={cn('px-4 py-3 text-sm text-right font-semibold font-mono', total > 0 ? 'text-[#FF6B35]' : 'text-[#8A95A5]')}>
          {fmtGtq(row.total)}
        </td>
      </tr>
      {open && row.invoices.map(inv => (
        <tr key={inv.invoice_number} className="bg-[#151e2b] border-b border-[#27384A]/50">
          <td className="pl-10 pr-4 py-2.5 text-xs text-[#8A95A5]">
            <span className="text-[#F0EDE8] mr-2">{inv.invoice_number}</span>
            {inv.title}
            <span className="ml-2 text-[#4A5568]">· {inv.project_name}</span>
          </td>
          <td colSpan={5} className="px-4 py-2.5 text-xs text-[#8A95A5]">
            Emitida {fmtDate(inv.issue_date)} · Vence {fmtDate(inv.due_date)}
            <span className="ml-2"><BucketBadge bucket={inv.bucket} /></span>
          </td>
          <td className="px-4 py-2.5 text-xs text-right font-mono text-[#F0EDE8]">{fmtGtq(inv.amount_gtq)}</td>
        </tr>
      ))}
    </>
  )
}

function ARAgingPanel({ data }: { data: ARAgingResponse }) {
  const BUCKETS: Array<{ key: keyof typeof data.totals; label: string; cls: string }> = [
    { key: 'current', label: 'Al día',   cls: 'text-emerald-400' },
    { key: '1_30',    label: '1–30 d',   cls: 'text-amber-400' },
    { key: '31_60',   label: '31–60 d',  cls: 'text-orange-400' },
    { key: '61_90',   label: '61–90 d',  cls: 'text-red-400' },
    { key: 'over_90', label: '+90 d',    cls: 'text-red-300' },
    { key: 'total',   label: 'Total CxC', cls: 'text-[#FF6B35]' },
  ]

  const overdue = n(data.totals['1_30']) + n(data.totals['31_60']) + n(data.totals['61_90']) + n(data.totals.over_90)

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {BUCKETS.map(b => (
          <div key={b.key} className="bg-[#1e2a3a] rounded-xl border border-[#27384A] p-3">
            <p className="text-[10px] text-[#8A95A5] mb-1">{b.label}</p>
            <p className={cn('text-sm font-bold', b.cls)} style={{ fontFamily: 'Space Mono, monospace' }}>
              {fmtGtq(data.totals[b.key])}
            </p>
          </div>
        ))}
      </div>

      {overdue > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
          <AlertCircle size={13} />
          <span>CxC vencida: <strong style={{ fontFamily: 'Space Mono' }}>{fmtGtq(overdue)}</strong> — requiere seguimiento.</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
        <p className="px-4 py-3 text-[10px] text-[#8A95A5] border-b border-[#27384A]">
          Fecha de referencia: <span className="text-[#F0EDE8]">{fmtDate(data.as_of_date)}</span>
          <span className="ml-3">Click en cliente para ver facturas.</span>
        </p>
        {data.by_client.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#8A95A5]">
            <Landmark size={28} className="mb-2 opacity-30" />
            <p className="text-sm">Sin CxC pendiente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#27384A]">
                  <th className="px-4 py-2.5 text-left text-[10px] text-[#8A95A5] font-medium">Cliente</th>
                  <th className="px-4 py-2.5 text-right text-[10px] text-[#8A95A5] font-medium">Al día</th>
                  <th className="px-4 py-2.5 text-right text-[10px] text-[#8A95A5] font-medium">1–30 d</th>
                  <th className="px-4 py-2.5 text-right text-[10px] text-[#8A95A5] font-medium">31–60 d</th>
                  <th className="px-4 py-2.5 text-right text-[10px] text-[#8A95A5] font-medium">61–90 d</th>
                  <th className="px-4 py-2.5 text-right text-[10px] text-[#8A95A5] font-medium">+90 d</th>
                  <th className="px-4 py-2.5 text-right text-[10px] text-[#8A95A5] font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.by_client.map(row => (
                  <AgingClientRow key={row.client_id} row={row} />
                ))}
                {/* Grand total row */}
                <tr className="bg-[#151e2b] border-t-2 border-[#27384A]">
                  <td className="px-4 py-3 text-xs font-semibold text-[#8A95A5]">TOTAL</td>
                  <td className="px-4 py-3 text-xs text-right font-mono font-semibold text-emerald-400">{fmtGtq(data.totals.current)}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono font-semibold text-amber-400">{fmtGtq(data.totals['1_30'])}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono font-semibold text-orange-400">{fmtGtq(data.totals['31_60'])}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono font-semibold text-red-400">{fmtGtq(data.totals['61_90'])}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono font-semibold text-red-300">{fmtGtq(data.totals.over_90)}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono font-semibold text-[#FF6B35]">{fmtGtq(data.totals.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Cash flow forecast ───────────────────────────────────────────────────────

function NetIcon({ net }: { net: string }) {
  const v = n(net)
  if (v > 0) return <TrendingUp size={14} className="text-emerald-400 flex-shrink-0" />
  if (v < 0) return <TrendingDown size={14} className="text-red-400 flex-shrink-0" />
  return <Minus size={14} className="text-[#8A95A5] flex-shrink-0" />
}

function CashForecastPanel({ data }: { data: CashFlowForecastResponse }) {
  const maxAbsNet = Math.max(...data.periods.map(p => Math.abs(n(p.net))), 1)

  const hasUnscheduled =
    n(data.unscheduled.inflows.total) !== 0 ||
    n(data.unscheduled.outflows.total) !== 0

  return (
    <div className="space-y-4">
      {/* Period cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.periods.map(p => {
          const net = n(p.net)
          const cum = n(p.cumulative)
          const barPct = Math.abs(net) / maxAbsNet * 100
          const isPositive = net >= 0
          return (
            <div key={p.label} className="bg-[#1e2a3a] rounded-xl border border-[#27384A] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{p.label}</p>
                <NetIcon net={p.net} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div>
                  <p className="text-[#8A95A5] mb-0.5">Cobros esp.</p>
                  <p className="text-emerald-400 font-mono font-medium">{fmtGtq(p.inflows.total)}</p>
                  {n(p.inflows.milestones) > 0 && (
                    <p className="text-[#4A5568] text-[10px]">Hitos: {fmtGtq(p.inflows.milestones)}</p>
                  )}
                </div>
                <div>
                  <p className="text-[#8A95A5] mb-0.5">Pagos pend.</p>
                  <p className="text-red-400 font-mono font-medium">{fmtGtq(p.outflows.total)}</p>
                  {n(p.outflows.subcontractors) > 0 && (
                    <p className="text-[#4A5568] text-[10px]">Subcon: {fmtGtq(p.outflows.subcontractors)}</p>
                  )}
                </div>
              </div>

              {/* Net bar */}
              <div className="h-1 bg-[#27384A] rounded-full overflow-hidden mb-2">
                <div
                  className={cn('h-full rounded-full', isPositive ? 'bg-emerald-500' : 'bg-red-500')}
                  style={{ width: `${barPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#8A95A5]">Neto período</span>
                <span className={cn('font-mono font-semibold', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                  {net >= 0 ? '+' : ''}{fmtGtq(p.net)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-0.5">
                <span className="text-[#8A95A5]">Acumulado</span>
                <span className={cn('font-mono', cum >= 0 ? 'text-[#F0EDE8]' : 'text-red-400')}>
                  {fmtGtq(p.cumulative)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Unscheduled */}
      {hasUnscheduled && (
        <div className="bg-[#1e2a3a] rounded-xl border border-amber-500/30 p-4">
          <p className="text-xs font-semibold text-amber-400 mb-3">Sin fecha programada</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[#8A95A5] mb-1">Cobros sin fecha</p>
              <p className="text-emerald-400 font-mono">{fmtGtq(data.unscheduled.inflows.total)}</p>
              {n(data.unscheduled.inflows.milestones) > 0 && (
                <p className="text-[#8A95A5] mt-0.5">Hitos: {fmtGtq(data.unscheduled.inflows.milestones)}</p>
              )}
            </div>
            <div>
              <p className="text-[#8A95A5] mb-1">Pagos sin fecha</p>
              <p className="text-red-400 font-mono">{fmtGtq(data.unscheduled.outflows.total)}</p>
              {n(data.unscheduled.outflows.subcontractors) > 0 && (
                <p className="text-[#8A95A5] mt-0.5">Subcon: {fmtGtq(data.unscheduled.outflows.subcontractors)}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'aging' | 'forecast'

export default function TesoreriaPage() {
  const [user, setUser]             = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tab, setTab]               = useState<Tab>('aging')
  const [loadingAging, setLoadingAging]       = useState(true)
  const [loadingForecast, setLoadingForecast] = useState(true)
  const [aging, setAging]           = useState<ARAgingResponse | null>(null)
  const [forecast, setForecast]     = useState<CashFlowForecastResponse | null>(null)
  const [months, setMonths]         = useState(6)

  useEffect(() => { getMe().then(setUser).catch(() => {}) }, [])

  const loadAging = useCallback(async () => {
    setLoadingAging(true)
    try {
      setAging(await getARaging())
    } catch {
      toast.error('Error cargando CxC.')
    } finally {
      setLoadingAging(false)
    }
  }, [])

  const loadForecast = useCallback(async () => {
    setLoadingForecast(true)
    try {
      setForecast(await getCashFlowForecast(undefined, months))
    } catch {
      toast.error('Error cargando pronóstico.')
    } finally {
      setLoadingForecast(false)
    }
  }, [months])

  useEffect(() => { loadAging() }, [loadAging])
  useEffect(() => { loadForecast() }, [loadForecast])

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <ERPSidebar
        currentPage="tesoreria"
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
          <Landmark size={18} className="text-[#FF6B35]" />
          <h1 className="text-base font-semibold text-[#F0EDE8]">Tesorería</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => { loadAging(); loadForecast() }}
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
            {([['aging', 'CxC / Aging'], ['forecast', 'Flujo de caja']] as [Tab, string][]).map(([t, label]) => (
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

          {/* ── AR Aging tab ── */}
          {tab === 'aging' && (
            loadingAging ? (
              <div className="flex items-center justify-center py-20 text-[#8A95A5]">
                <Loader2 size={20} className="animate-spin mr-2" />
                <span className="text-sm">Cargando CxC...</span>
              </div>
            ) : aging ? (
              <ARAgingPanel data={aging} />
            ) : null
          )}

          {/* ── Cash forecast tab ── */}
          {tab === 'forecast' && (
            <>
              {/* Controls */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-[#8A95A5]">Meses a proyectar:</label>
                <select
                  value={months}
                  onChange={e => setMonths(Number(e.target.value))}
                  className="bg-[#1e2a3a] border border-[#27384A] rounded-lg px-3 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
                >
                  {[3, 6, 9, 12].map(m => <option key={m} value={m}>{m} meses</option>)}
                </select>
              </div>

              {loadingForecast ? (
                <div className="flex items-center justify-center py-20 text-[#8A95A5]">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  <span className="text-sm">Cargando pronóstico...</span>
                </div>
              ) : forecast ? (
                <CashForecastPanel data={forecast} />
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
