'use client'

import { useState, useEffect } from 'react'
import {
  Menu, BarChart2, Loader2, AlertCircle, ChevronDown, TrendingUp, TrendingDown,
  LayoutGrid, List, Receipt, FileText, Calendar, User,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import Pagination from '@/components/erp/Pagination'
import {
  getMe, getMyProjects, getExpenses, getInvoices,
  type User as UserType, type ProjectList, type Expense, type Invoice,
} from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const EXPENSE_CATEGORIES: Record<string, string> = {
  materials: 'Materiales', labor: 'Mano de obra', equipment: 'Equipos',
  subcontractor: 'Subcontratista', permits: 'Permisos', transportation: 'Transporte',
  utilities: 'Servicios', other: 'Otros',
}
const CATEGORY_COLORS = ['#FF6B35', '#4A9E6B', '#6B8CFF', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#8A95A5']

const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', sent: 'Enviada', viewed: 'Vista', paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada',
}
const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: '#8A95A5', sent: '#6B8CFF', viewed: '#F59E0B', paid: '#4A9E6B', overdue: '#f87171', cancelled: '#27384A',
}
const EXPENSE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente', approved: 'Aprobado', rejected: 'Rechazado', reimbursed: 'Reembolsado',
}
const EXPENSE_STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B', approved: '#4A9E6B', rejected: '#f87171', reimbursed: '#6B8CFF',
}

const EXPENSES_PER_PAGE = 10
const INVOICES_PER_PAGE = 8

function fmt(n: number) { return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' }) }

// ─── Custom tooltips ──────────────────────────────────────────────────────────

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1F2D3A] border border-[#27384A] rounded-lg px-3 py-2 text-xs space-y-1">
      <p className="text-[#8A95A5] font-medium truncate max-w-40">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: Q {Number(p.value).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1F2D3A] border border-[#27384A] rounded-lg px-3 py-2 text-xs">
      <p className="text-[#8A95A5]">{payload[0].name}</p>
      <p className="font-semibold text-[#F0EDE8]">{fmt(payload[0].value)}</p>
      <p className="text-[#4A5568]">{payload[0].payload.pct}%</p>
    </div>
  )
}

// ─── Section header with view toggle ─────────────────────────────────────────

function SectionHeader({ title, count, viewMode, onToggle }: {
  title: string; count: number
  viewMode: 'list' | 'grid'; onToggle: (v: 'list' | 'grid') => void
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs text-[#8A95A5] font-medium">{title} <span className="text-[#4A5568]">({count})</span></p>
      <div className="flex items-center gap-1 bg-[#131D28] border border-[#27384A] rounded-lg p-0.5">
        <button onClick={() => onToggle('list')} className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-[#FF6B35] text-white' : 'text-[#4A5568] hover:text-[#8A95A5]')} title="Vista lista">
          <List size={13} />
        </button>
        <button onClick={() => onToggle('grid')} className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-[#FF6B35] text-white' : 'text-[#4A5568] hover:text-[#8A95A5]')} title="Vista tarjetas">
          <LayoutGrid size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Expense components ───────────────────────────────────────────────────────

function ExpenseListRow({ exp }: { exp: Expense }) {
  const statusColor = EXPENSE_STATUS_COLORS[exp.status] ?? '#8A95A5'
  const statusLabel = EXPENSE_STATUS_LABELS[exp.status] ?? exp.status
  const catColor = CATEGORY_COLORS[Object.keys(EXPENSE_CATEGORIES).indexOf(exp.category) % CATEGORY_COLORS.length]
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#131D28] rounded-xl border border-[#27384A] hover:border-[#FF6B35]/10 transition-colors">
      <span className="text-[9px] px-2 py-1 rounded-full font-medium flex-shrink-0" style={{ background: `${catColor}20`, color: catColor }}>
        {EXPENSE_CATEGORIES[exp.category] ?? exp.category}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F0EDE8] truncate">{exp.description}</p>
        {exp.submitted_by_name && (
          <p className="text-[10px] text-[#4A5568] flex items-center gap-1 mt-0.5">
            <User size={9} />{exp.submitted_by_name}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-[#4A5568] flex-shrink-0">
        <Calendar size={9} />
        {fmtDate(exp.expense_date)}
      </div>
      <p className="text-sm font-semibold text-[#FF6B35] flex-shrink-0 font-mono">
        Q {Number(exp.amount_gtq).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
      </p>
      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: `${statusColor}20`, color: statusColor }}>
        {statusLabel}
      </span>
    </div>
  )
}

function ExpenseCard({ exp }: { exp: Expense }) {
  const statusColor = EXPENSE_STATUS_COLORS[exp.status] ?? '#8A95A5'
  const statusLabel = EXPENSE_STATUS_LABELS[exp.status] ?? exp.status
  const catIdx  = Object.keys(EXPENSE_CATEGORIES).indexOf(exp.category)
  const catColor = CATEGORY_COLORS[catIdx >= 0 ? catIdx % CATEGORY_COLORS.length : 0]
  return (
    <div className="bg-[#131D28] border border-[#27384A] rounded-xl overflow-hidden hover:border-[#FF6B35]/15 transition-colors">
      {/* color bar */}
      <div className="h-1" style={{ background: catColor }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${catColor}20`, color: catColor }}>
            {EXPENSE_CATEGORIES[exp.category] ?? exp.category}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: `${statusColor}20`, color: statusColor }}>
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-[#F0EDE8] leading-snug line-clamp-2">{exp.description}</p>
        <p className="text-xl font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
          Q {Number(exp.amount_gtq).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
        </p>
        <div className="flex items-center justify-between text-[10px] text-[#4A5568] pt-1 border-t border-[#27384A]/50">
          <span className="flex items-center gap-1"><Calendar size={9} />{fmtDate(exp.expense_date)}</span>
          {exp.submitted_by_name && <span className="flex items-center gap-1 truncate"><User size={9} />{exp.submitted_by_name}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Invoice components ───────────────────────────────────────────────────────

function InvoiceListRow({ inv }: { inv: Invoice }) {
  const color = INVOICE_STATUS_COLORS[inv.status] ?? '#8A95A5'
  const label = INVOICE_STATUS_LABELS[inv.status] ?? inv.status
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#131D28] rounded-xl border border-[#27384A] hover:border-[#FF6B35]/10 transition-colors">
      <div className="flex-shrink-0 flex items-center gap-2">
        <FileText size={14} className="text-[#4A5568]" />
        <span className="text-[10px] text-[#8A95A5] font-mono">{inv.invoice_number}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F0EDE8] truncate">{inv.title}</p>
        {inv.created_by_name && <p className="text-[10px] text-[#4A5568] flex items-center gap-1 mt-0.5"><User size={9} />{inv.created_by_name}</p>}
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#4A5568] flex-shrink-0">
        <Calendar size={9} />{fmtDate(inv.issue_date)}
      </div>
      {inv.due_date && (
        <div className={cn('hidden md:flex items-center gap-1 text-[10px] flex-shrink-0', inv.is_overdue ? 'text-red-400' : 'text-[#4A5568]')}>
          <Calendar size={9} />Vence: {fmtDate(inv.due_date)}
        </div>
      )}
      <p className="text-sm font-semibold flex-shrink-0 font-mono" style={{ color: inv.status === 'paid' ? '#4A9E6B' : '#F0EDE8' }}>
        Q {Number(inv.total_with_tax).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
      </p>
      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: `${color}20`, color }}>
        {label}
      </span>
    </div>
  )
}

function InvoiceCard({ inv }: { inv: Invoice }) {
  const color = INVOICE_STATUS_COLORS[inv.status] ?? '#8A95A5'
  const label = INVOICE_STATUS_LABELS[inv.status] ?? inv.status
  return (
    <div className="bg-[#131D28] border border-[#27384A] rounded-xl overflow-hidden hover:border-[#FF6B35]/15 transition-colors">
      <div className="h-1" style={{ background: color }} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] text-[#8A95A5] font-mono">{inv.invoice_number}</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0" style={{ background: `${color}20`, color }}>
            {label}
          </span>
        </div>
        <p className="text-sm text-[#F0EDE8] leading-snug line-clamp-2">{inv.title}</p>
        <p className="text-xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color: inv.status === 'paid' ? '#4A9E6B' : '#F0EDE8' }}>
          Q {Number(inv.total_with_tax).toLocaleString('es-GT', { maximumFractionDigits: 0 })}
        </p>
        {inv.is_overdue && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">Vencida</span>
        )}
        <div className="flex items-center justify-between text-[10px] text-[#4A5568] pt-1 border-t border-[#27384A]/50">
          <span className="flex items-center gap-1"><Calendar size={9} />{fmtDate(inv.issue_date)}</span>
          {inv.due_date && <span className={cn('flex items-center gap-1', inv.is_overdue ? 'text-red-400' : '')}>Vence: {fmtDate(inv.due_date)}</span>}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ERPPresupuestoPage() {
  const [me, setMe]             = useState<UserType | null>(null)
  const [projects, setProjects] = useState<ProjectList[]>([])
  const [selectedPid, setSelectedPid] = useState<number | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError]       = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // View modes
  const [expViewMode, setExpViewMode] = useState<'list' | 'grid'>('list')
  const [invViewMode, setInvViewMode] = useState<'list' | 'grid'>('list')

  // Pagination
  const [expPage, setExpPage] = useState(1)
  const [invPage, setInvPage] = useState(1)

  useEffect(() => {
    async function init() {
      try {
        const user = await getMe()
        if (user.role === 'client_portal') { window.location.href = '/portal'; return }
        setMe(user)
        const res  = await getMyProjects()
        const list = res.results ?? (res as any)
        setProjects(list)
        if (list.length > 0) setSelectedPid(list[0].id)
      } catch (e: any) {
        if (e.message === 'Sesión expirada') return
        setError(e.message ?? 'Error al cargar')
      } finally { setLoading(false) }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedPid) return
    loadDetail(selectedPid)
  }, [selectedPid])

  async function loadDetail(pid: number) {
    setDetailLoading(true)
    setExpPage(1)
    setInvPage(1)
    try {
      const [exps, invs] = await Promise.all([getExpenses(pid), getInvoices(pid)])
      setExpenses(exps)
      setInvoices(invs)
    } catch {} finally { setDetailLoading(false) }
  }

  // ── Global KPIs ─────────────────────────────────────────────────────────────

  const totalBudget    = projects.reduce((a, p) => a + Number(p.total_budget_gtq), 0)
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress').length
  const avgProgress    = projects.length > 0 ? Math.round(projects.reduce((a, p) => a + p.progress_percentage, 0) / projects.length) : 0

  const projectBudgetData = projects
    .filter(p => Number(p.total_budget_gtq) > 0)
    .sort((a, b) => Number(b.total_budget_gtq) - Number(a.total_budget_gtq))
    .slice(0, 8)
    .map(p => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + '…' : p.name, Presupuesto: Number(p.total_budget_gtq) }))

  // ── Detail computed ─────────────────────────────────────────────────────────

  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount_gtq), 0)
  const totalInvoiced = invoices.reduce((a, i) => a + Number(i.amount_gtq), 0)
  const totalPaid     = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + Number(i.amount_gtq), 0)
  const totalOverdue  = invoices.filter(i => i.status === 'overdue').reduce((a, i) => a + Number(i.amount_gtq), 0)

  const expByCategory = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount_gtq); return acc }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1])
    .map(([key, val], i) => ({
      name: EXPENSE_CATEGORIES[key] ?? key, value: val,
      pct: totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0,
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))

  const invoiceStatusData = Object.entries(
    invoices.reduce((acc, inv) => { acc[inv.status] = (acc[inv.status] ?? 0) + 1; return acc }, {} as Record<string, number>)
  ).map(([status, count]) => ({ status, count, label: INVOICE_STATUS_LABELS[status] ?? status, color: INVOICE_STATUS_COLORS[status] ?? '#8A95A5' }))

  const selectedProject = projects.find(p => p.id === selectedPid)
  const selectedBudget  = selectedProject ? Number(selectedProject.total_budget_gtq) : 0
  const budgetUsedPct   = selectedBudget > 0 ? Math.min((totalExpenses / selectedBudget) * 100, 100) : 0
  const budgetColor     = budgetUsedPct > 90 ? '#f87171' : budgetUsedPct > 70 ? '#F59E0B' : '#4A9E6B'

  // Paginated slices
  const pagedExpenses = expenses.slice((expPage - 1) * EXPENSES_PER_PAGE, expPage * EXPENSES_PER_PAGE)
  const pagedInvoices = invoices.slice((invPage - 1) * INVOICES_PER_PAGE, invPage * INVOICES_PER_PAGE)

  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST' : 'ST'

  if (loading) return (
    <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
        <p className="text-sm text-[#8A95A5]">Cargando presupuesto…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle size={32} className="text-red-400 mx-auto" />
        <p className="text-sm text-[#8A95A5]">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg">Reintentar</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#131D28] flex">
      <ERPSidebar
        currentPage="presupuesto"
        userName={me?.full_name} userInitials={initials} userAvatarUrl={me?.avatar_url}
        open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onUserUpdate={setMe}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Presupuesto y Finanzas</p>
          <ERPAvatar avatarUrl={me?.avatar_url} initials={initials} size="md" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* ── Global KPIs ─────────────────────────────────────────────── */}
            <div>
              <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-3 font-medium" style={{ fontFamily: 'Space Mono, monospace' }}>
                Vista global — todos los proyectos
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Presupuesto total (GTQ)', value: fmt(totalBudget), color: '#FF6B35' },
                  { label: 'Proyectos activos',       value: activeProjects,   color: '#4A9E6B' },
                  { label: 'Avance promedio',         value: `${avgProgress}%`, color: '#F59E0B' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                    <p className="text-xs text-[#8A95A5] mb-3">{label}</p>
                    <p className="text-xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Budget bar chart ─────────────────────────────────────────── */}
            {projectBudgetData.length > 0 && (
              <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                <p className="text-xs text-[#8A95A5] mb-4 font-medium">Presupuesto por proyecto (GTQ)</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectBudgetData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#27384A" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `Q${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#8A95A5', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="Presupuesto" fill="#FF6B35" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Project detail ───────────────────────────────────────────── */}
            <div className="border-t border-[#27384A] pt-6 space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest font-medium" style={{ fontFamily: 'Space Mono, monospace' }}>
                  Detalle por proyecto
                </p>
                <div className="relative">
                  <select
                    value={selectedPid ?? ''}
                    onChange={e => { setSelectedPid(Number(e.target.value)); setExpenses([]); setInvoices([]) }}
                    className="appearance-none bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-4 pr-9 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 cursor-pointer"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5] pointer-events-none" />
                </div>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#FF6B35]" /></div>
              ) : (
                <>
                  {/* Budget utilization */}
                  {selectedBudget > 0 && (
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                      <div className="flex items-start justify-between mb-4">
                        <p className="text-xs text-[#8A95A5] font-medium">Ejecución presupuestaria</p>
                        <span className="text-xs font-semibold" style={{ color: budgetColor }}>{budgetUsedPct.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#27384A] overflow-hidden mb-4">
                        <div className="h-full rounded-full transition-all" style={{ width: `${budgetUsedPct}%`, background: budgetColor }} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Presupuesto', value: fmt(selectedBudget), color: '#F0EDE8' },
                          { label: 'Gastado',     value: fmt(totalExpenses),  color: budgetColor },
                          { label: 'Facturado',   value: fmt(totalInvoiced),  color: '#6B8CFF' },
                          { label: 'Cobrado',     value: fmt(totalPaid),      color: '#4A9E6B' },
                        ].map(({ label, value, color }) => (
                          <div key={label}>
                            <p className="text-[10px] text-[#8A95A5] mb-1">{label}</p>
                            <p className="text-sm font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expenses donut */}
                    {expByCategory.length > 0 ? (
                      <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                        <p className="text-xs text-[#8A95A5] mb-4 font-medium">Gastos por categoría</p>
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={expByCategory} cx="40%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                                {expByCategory.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                              </Pie>
                              <Tooltip content={<PieTooltip />} />
                              <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(v) => <span className="text-[11px] text-[#8A95A5]">{v}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] flex items-center justify-center">
                        <p className="text-xs text-[#4A5568]">Sin gastos registrados.</p>
                      </div>
                    )}

                    {/* Invoice status */}
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                      <p className="text-xs text-[#8A95A5] mb-4 font-medium">Estado de facturas ({invoices.length})</p>
                      {invoices.length === 0 ? (
                        <div className="flex items-center justify-center h-40">
                          <p className="text-xs text-[#4A5568]">Sin facturas registradas.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {invoiceStatusData.map(({ status, count, label, color }) => (
                            <div key={status} className="flex items-center gap-3">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium w-36 text-center" style={{ background: `${color}20`, color }}>
                                {label}
                              </span>
                              <div className="flex-1 h-1.5 rounded-full bg-[#27384A] overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${(count / invoices.length) * 100}%`, background: color }} />
                              </div>
                              <span className="text-[10px] text-[#8A95A5] w-4 text-right">{count}</span>
                            </div>
                          ))}
                          {totalOverdue > 0 && (
                            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                              <TrendingDown size={12} className="text-red-400 flex-shrink-0" />
                              <p className="text-xs text-red-400">Facturas vencidas: <strong>{fmt(totalOverdue)}</strong></p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Expenses list ──────────────────────────────────────── */}
                  {expenses.length > 0 && (
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                      <SectionHeader title="Gastos" count={expenses.length} viewMode={expViewMode} onToggle={setExpViewMode} />
                      {expViewMode === 'list' ? (
                        <div className="space-y-2">
                          {pagedExpenses.map(exp => <ExpenseListRow key={exp.id} exp={exp} />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {pagedExpenses.map(exp => <ExpenseCard key={exp.id} exp={exp} />)}
                        </div>
                      )}
                      {expenses.length > EXPENSES_PER_PAGE && (
                        <div className="mt-4">
                          <Pagination page={expPage} total={expenses.length} perPage={EXPENSES_PER_PAGE} onChange={setExpPage} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Invoices list ──────────────────────────────────────── */}
                  {invoices.length > 0 && (
                    <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                      <SectionHeader title="Facturas" count={invoices.length} viewMode={invViewMode} onToggle={setInvViewMode} />
                      {invViewMode === 'list' ? (
                        <div className="space-y-2">
                          {pagedInvoices.map(inv => <InvoiceListRow key={inv.id} inv={inv} />)}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {pagedInvoices.map(inv => <InvoiceCard key={inv.id} inv={inv} />)}
                        </div>
                      )}
                      {invoices.length > INVOICES_PER_PAGE && (
                        <div className="mt-4">
                          <Pagination page={invPage} total={invoices.length} perPage={INVOICES_PER_PAGE} onChange={setInvPage} />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
