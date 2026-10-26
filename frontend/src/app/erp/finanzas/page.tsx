'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu, TrendingUp, RefreshCw, Loader2, ChevronRight, BarChart2, DollarSign, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import { getMe, getMyProjects, type User, type ProjectList } from '@/lib/api'
import { getCompanyPnL, getProjectPnL, type CompanyPnLResponse, type ProjectPnLResponse } from '@/lib/api-finance'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number | null | undefined) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
  return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(val: string | number | null | undefined) {
  if (val === null || val === undefined) return 'N/A'
  const n = Number(val)
  if (isNaN(n)) return 'N/A'
  return `${n.toFixed(1)}%`
}

function sign(val: string | number | null | undefined) {
  const n = Number(val ?? 0)
  return n >= 0 ? 'text-emerald-400' : 'text-red-400'
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

const MONTHS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

// ─── P&L Row ──────────────────────────────────────────────────────────────────

function PnLRow({
  label, value, indent = 0, bold = false, separator = false, accent = false, isExpense = false,
}: {
  label: string
  value: string | null | undefined
  indent?: number
  bold?: boolean
  separator?: boolean
  accent?: boolean
  isExpense?: boolean
}) {
  const n = Number(value ?? 0)
  const textColor = accent
    ? (n >= 0 ? 'text-emerald-400' : 'text-red-400')
    : (isExpense && n > 0 ? 'text-red-400' : 'text-[#F0EDE8]')

  return (
    <div className={cn(
      'flex items-center justify-between py-2 px-4',
      separator && 'border-t border-[#27384A]',
      bold && 'bg-[#131D28]',
    )}>
      <span
        className={cn('text-sm', bold ? 'font-semibold text-[#F0EDE8]' : 'text-[#8A95A5]')}
        style={{ paddingLeft: `${indent * 12}px` }}
      >
        {label}
      </span>
      <span
        className={cn('text-sm font-medium tabular-nums', textColor, bold && 'font-bold')}
        style={{ fontFamily: 'Space Mono, monospace' }}
      >
        {value === null || value === undefined ? 'N/A' : fmtGtq(value)}
      </span>
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="px-4 py-1.5 bg-[#0f172a] border-y border-[#27384A]">
      <span className="text-[10px] uppercase tracking-widest text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
        {label}
      </span>
    </div>
  )
}

// ─── Company P&L Panel ────────────────────────────────────────────────────────

function CompanyPnLPanel({ data }: { data: CompanyPnLResponse }) {
  const p = data.pnl
  return (
    <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#27384A]">
        <h2 className="text-sm font-semibold text-[#F0EDE8]">Estado de Resultados — Empresa</h2>
        <p className="text-xs text-[#8A95A5] mt-0.5">
          {data.year} · Meses {data.month_from}–{data.month_to} · {data.currency}
        </p>
      </div>

      <SectionDivider label="Ingresos" />
      <PnLRow label="Ingresos brutos reconocidos" value={p.gross_revenue} />
      <PnLRow label="Deducciones de ingresos" value={p.revenue_deductions} indent={1} isExpense />
      <PnLRow label="Ingresos netos" value={p.net_revenue} bold />

      <SectionDivider label="Costos directos" />
      <PnLRow label="Materiales directos" value={p.direct_materials} indent={1} isExpense />
      <PnLRow label="Mano de obra directa" value={p.direct_labor} indent={1} isExpense />
      <PnLRow label="Subcontratistas" value={p.subcontractors} indent={1} isExpense />
      <PnLRow label="Equipos y maquinaria" value={p.equipment} indent={1} isExpense />
      <PnLRow label="Otros costos directos" value={p.other_direct} indent={1} isExpense />
      <PnLRow label="Total costos directos" value={p.total_direct_cost} bold isExpense />
      <PnLRow label="Margen bruto" value={p.gross_margin} bold accent separator />
      {p.gross_margin_pct !== null && (
        <div className="px-4 pb-2 text-right">
          <span className={cn('text-xs font-medium', sign(p.gross_margin_pct))} style={{ fontFamily: 'Space Mono, monospace' }}>
            {fmtPct(p.gross_margin_pct)} margen bruto
          </span>
        </div>
      )}

      <SectionDivider label="Estructura y overhead" />
      <PnLRow label="Gastos de estructura / overhead" value={p.overhead} isExpense />
      <PnLRow label="EBITDA" value={p.ebitda} bold accent separator />

      <SectionDivider label="D&A y resultado" />
      <PnLRow label="Depreciación y amortización" value={p.depreciation} isExpense />
      <PnLRow label="EBIT / Resultado operativo" value={p.ebit} bold accent separator />
      <PnLRow label="Resultado financiero neto" value={p.financial_result} />
      <PnLRow label="Resultado antes de impuestos" value={p.profit_before_tax} bold separator />
      <PnLRow label="ISR" value={p.income_tax} isExpense />
      <PnLRow label="Resultado neto" value={p.net_profit} bold accent separator />
    </div>
  )
}

// ─── Project P&L Panel ────────────────────────────────────────────────────────

function ProjectPnLPanel({ data }: { data: ProjectPnLResponse }) {
  const p = data.pnl
  return (
    <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#27384A]">
        <h2 className="text-sm font-semibold text-[#F0EDE8]">{data.project_name}</h2>
        <p className="text-xs text-[#8A95A5] mt-0.5">P&L por proyecto · {data.currency}</p>
      </div>

      <SectionDivider label="Ingresos" />
      <PnLRow label="Ingresos brutos reconocidos" value={p.gross_revenue} />

      <SectionDivider label="Costos directos" />
      <PnLRow label="Materiales directos" value={p.direct_materials} indent={1} isExpense />
      <PnLRow label="Mano de obra directa" value={p.direct_labor} indent={1} isExpense />
      <PnLRow label="Subcontratistas" value={p.subcontractors} indent={1} isExpense />
      <PnLRow label="Equipos y maquinaria" value={p.equipment} indent={1} isExpense />
      <PnLRow label="Otros costos directos" value={p.other_direct} indent={1} isExpense />
      <PnLRow label="Total costos directos" value={p.total_direct_cost} bold isExpense />
      <PnLRow label="Margen bruto" value={p.gross_margin} bold accent separator />
      {p.gross_margin_pct !== null && (
        <div className="px-4 pb-2 text-right">
          <span className={cn('text-xs font-medium', sign(p.gross_margin_pct))} style={{ fontFamily: 'Space Mono, monospace' }}>
            {fmtPct(p.gross_margin_pct)} margen bruto
          </span>
        </div>
      )}

      <SectionDivider label="Vs. presupuesto" />
      <PnLRow label="Costo presupuestado (aprobado)" value={p.budget_cost} />
      <PnLRow label="Variación real vs. presupuesto" value={p.budget_variance} accent />

      {p.forecast_final_cost !== null && (
        <>
          <SectionDivider label="Forecast at completion" />
          <PnLRow label="Costo final estimado" value={p.forecast_final_cost} />
          <PnLRow label="Margen final estimado" value={p.forecast_final_margin} bold accent />
          {p.forecast_margin_pct !== null && (
            <div className="px-4 pb-2 text-right">
              <span className={cn('text-xs font-medium', sign(p.forecast_margin_pct))} style={{ fontFamily: 'Space Mono, monospace' }}>
                {fmtPct(p.forecast_margin_pct)} forecast
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Project selector card ────────────────────────────────────────────────────

function ProjectCard({
  proj, selected, onClick,
}: {
  proj: { id: number; name: string; gross_margin?: string; gross_margin_pct?: string | null }
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-colors',
        selected
          ? 'bg-[#FF6B35]/10 border-[#FF6B35]/40 text-[#FF6B35]'
          : 'bg-[#1e2a3a] border-[#27384A] text-[#F0EDE8] hover:bg-[#1F2D3A]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">{proj.name}</span>
        <ChevronRight size={13} className="flex-shrink-0" />
      </div>
      {proj.gross_margin !== undefined && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#8A95A5]">Margen bruto:</span>
          <span className={cn('text-xs font-medium', sign(proj.gross_margin))} style={{ fontFamily: 'Space Mono, monospace' }}>
            {fmtGtq(proj.gross_margin)}
          </span>
          {proj.gross_margin_pct !== null && (
            <span className={cn('text-[10px]', sign(proj.gross_margin_pct))}>
              ({fmtPct(proj.gross_margin_pct)})
            </span>
          )}
        </div>
      )}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FinanzasPage() {
  const [user, setUser]             = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [year, setYear]             = useState(CURRENT_YEAR)
  const [monthFrom, setMonthFrom]   = useState(1)
  const [monthTo, setMonthTo]       = useState(new Date().getMonth() + 1)

  const [companyData, setCompanyData] = useState<CompanyPnLResponse | null>(null)
  const [projectData, setProjectData] = useState<ProjectPnLResponse | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)

  const [loadingCompany, setLoadingCompany] = useState(false)
  const [loadingProject, setLoadingProject] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { getMe().then(setUser).catch(() => {}) }, [])

  const loadCompany = useCallback(async () => {
    setLoadingCompany(true)
    setError(null)
    try {
      const data = await getCompanyPnL(year, monthFrom, monthTo)
      setCompanyData(data)
    } catch (e: any) {
      setError(e.message ?? 'Error cargando P&L de empresa.')
    } finally {
      setLoadingCompany(false)
    }
  }, [year, monthFrom, monthTo])

  useEffect(() => { loadCompany() }, [loadCompany])

  useEffect(() => {
    if (!selectedProjectId) { setProjectData(null); return }
    setLoadingProject(true)
    getProjectPnL(selectedProjectId)
      .then(setProjectData)
      .catch(() => setProjectData(null))
      .finally(() => setLoadingProject(false))
  }, [selectedProjectId])

  const selectCls = 'bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60'

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <ERPSidebar
        currentPage="finanzas"
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
          <TrendingUp size={18} className="text-[#FF6B35]" />
          <h1 className="text-base font-semibold text-[#F0EDE8]">Finanzas</h1>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={loadCompany} className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A] transition-colors">
              <RefreshCw size={15} />
            </button>
            {user && <ERPAvatar avatarUrl={user.avatar_url} initials={`${user.first_name[0]}${user.last_name[0]}`} size="sm" />}
          </div>
        </div>

        <div className="px-4 md:px-6 py-5 max-w-7xl mx-auto space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8A95A5]">Año</label>
              <select value={year} onChange={e => setYear(Number(e.target.value))} className={selectCls}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8A95A5]">Desde</label>
              <select value={monthFrom} onChange={e => setMonthFrom(Number(e.target.value))} className={selectCls}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8A95A5]">Hasta</label>
              <select value={monthTo} onChange={e => setMonthTo(Number(e.target.value))} className={selectCls}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Left: Company P&L */}
            <div className="xl:col-span-2">
              {loadingCompany ? (
                <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] flex items-center justify-center py-24">
                  <Loader2 size={20} className="animate-spin text-[#8A95A5]" />
                </div>
              ) : companyData ? (
                <CompanyPnLPanel data={companyData} />
              ) : null}
            </div>

            {/* Right: Project list + drill-down */}
            <div className="space-y-4">
              {companyData?.by_project && companyData.by_project.length > 0 && (
                <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#27384A]">
                    <h3 className="text-sm font-semibold text-[#F0EDE8]">Por proyecto</h3>
                    <p className="text-xs text-[#8A95A5] mt-0.5">Selecciona para ver detalle</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {companyData.by_project.map(proj => (
                      <ProjectCard
                        key={proj.project_id}
                        proj={{ id: proj.project_id, name: proj.project_name, gross_margin: proj.gross_margin, gross_margin_pct: proj.gross_margin_pct }}
                        selected={selectedProjectId === proj.project_id}
                        onClick={() => setSelectedProjectId(
                          selectedProjectId === proj.project_id ? null : proj.project_id
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {loadingProject && (
                <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] flex items-center justify-center py-12">
                  <Loader2 size={18} className="animate-spin text-[#8A95A5]" />
                </div>
              )}

              {!loadingProject && projectData && (
                <ProjectPnLPanel data={projectData} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
