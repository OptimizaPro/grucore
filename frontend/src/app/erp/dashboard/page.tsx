'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus, Menu, X,AlertCircle, Loader2, TrendingUp, Calendar,CheckCircle2, PauseCircle, 
  Building2, ChevronRight,FileText, DollarSign, BarChart2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,PieChart, Pie,
} from 'recharts'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getMe, getMyProjects, getClients, createProject,
  type User, type ProjectList, type ClientListItem,
  type CreateProjectPayload,
} from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number) {
  return `Q ${Number(val).toLocaleString('es-GT', { minimumFractionDigits: 0 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Status chip ─────────────────────────────────────────────────────────────

function ProjectStatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Borrador',    cls: 'bg-[#4A5568]/20 text-[#8A95A5]' },
    active:    { label: 'Activo',      cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
    paused:    { label: 'En pausa',    cls: 'bg-amber-500/15 text-amber-400' },
    completed: { label: 'Completado',  cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
    cancelled: { label: 'Cancelado',   cls: 'bg-red-500/15 text-red-400' },
  }
  const { label, cls } = map[status] ?? map.draft
  return (
    <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {label}
    </span>
  )
}

// ─── Project type labels ──────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: 'residential',   label: 'Residencial' },
  { value: 'commercial',    label: 'Comercial' },
  { value: 'industrial',    label: 'Industrial' },
  { value: 'renovation',    label: 'Renovación' },
  { value: 'design_build',  label: 'Diseño y construcción' },
]

// ─── New project modal ────────────────────────────────────────────────────────

function NewProjectModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [clients, setClients]   = useState<ClientListItem[]>([])
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const [form, setForm] = useState<{
    name: string
    client: string
    project_type: string
    status: string
    address: string
    city: string
    total_budget_gtq: string
    start_date: string
    estimated_end: string
    description: string
  }>({
    name: '',
    client: '',
    project_type: 'residential',
    status: 'draft',
    address: '',
    city: 'Guatemala',
    total_budget_gtq: '',
    start_date: '',
    estimated_end: '',
    description: '',
  })

  useEffect(() => {
    setLoading(true)
    getClients()
      .then((r) => setClients(r.results))
      .catch(() => setError('No se pudieron cargar los clientes.'))
      .finally(() => setLoading(false))
  }, [])

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.client) { setError('Selecciona un cliente.'); return }
    if (!form.total_budget_gtq) { setError('Ingresa el presupuesto.'); return }

    setSaving(true)
    setError('')
    try {
      const payload: CreateProjectPayload = {
        name: form.name,
        client: Number(form.client),
        project_type: form.project_type,
        status: form.status,
        address: form.address || undefined,
        city: form.city || undefined,
        total_budget_gtq: form.total_budget_gtq,
        start_date: form.start_date || null,
        estimated_end: form.estimated_end || null,
        description: form.description || undefined,
      }
      await createProject(payload)
      onSuccess()
    } catch (e: any) {
      setError(e.message ?? 'Error al crear el proyecto.')
      setSaving(false)
    }
  }

  const inputCls =
    'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#27384A] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
              ERP · Proyectos
            </p>
            <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Nuevo proyecto
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#FF6B35]" />
            </div>
          ) : (
            <form id="new-project-form" onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className={labelCls}>Nombre del proyecto <span className="text-[#FF6B35]">*</span></label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={inputCls}
                  placeholder="Ej. Residencia García — Zona 15"
                />
              </div>

              {/* Cliente + Tipo en grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Cliente <span className="text-[#FF6B35]">*</span></label>
                  <select
                    required
                    value={form.client}
                    onChange={(e) => set('client', e.target.value)}
                    className={cn(inputCls, 'cursor-pointer')}
                  >
                    <option value="">Seleccionar cliente…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo de proyecto</label>
                  <select
                    value={form.project_type}
                    onChange={(e) => set('project_type', e.target.value)}
                    className={cn(inputCls, 'cursor-pointer')}
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estado + Ciudad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Estado inicial</label>
                  <select
                    value={form.status}
                    onChange={(e) => set('status', e.target.value)}
                    className={cn(inputCls, 'cursor-pointer')}
                  >
                    <option value="draft">Borrador</option>
                    <option value="active">Activo</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Ciudad</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    className={inputCls}
                    placeholder="Guatemala"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className={labelCls}>Dirección</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  className={inputCls}
                  placeholder="Zona, colonia, dirección exacta…"
                />
              </div>

              {/* Presupuesto */}
              <div>
                <label className={labelCls}>Presupuesto total (GTQ) <span className="text-[#FF6B35]">*</span></label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total_budget_gtq}
                  onChange={(e) => set('total_budget_gtq', e.target.value)}
                  className={inputCls}
                  placeholder="0.00"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Fecha de inicio</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => set('start_date', e.target.value)}
                    className={cn(inputCls, 'cursor-pointer')}
                  />
                </div>
                <div>
                  <label className={labelCls}>Entrega estimada</label>
                  <input
                    type="date"
                    value={form.estimated_end}
                    onChange={(e) => set('estimated_end', e.target.value)}
                    className={cn(inputCls, 'cursor-pointer')}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  className={cn(inputCls, 'resize-none')}
                  placeholder="Descripción general del proyecto, alcance, especificaciones…"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="new-project-form"
            type="submit"
            disabled={saving || loading}
            className="px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Creando…</>
            ) : (
              <><Plus size={14} /> Crear proyecto</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: ProjectList }) {
  const initials = project.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const gradients: Record<string, string> = {
    active:    'from-[#FF6B35]/30 to-[#FF6B35]/5',
    completed: 'from-[#4A9E6B]/30 to-[#4A9E6B]/5',
    paused:    'from-amber-500/30 to-amber-500/5',
    draft:     'from-[#4A5568]/30 to-[#4A5568]/5',
    cancelled: 'from-red-500/30 to-red-500/5',
  }

  return (
    <div className="bg-[#1F2D3A] border border-[#27384A] rounded-xl overflow-hidden hover:border-[#FF6B35]/30 transition-colors group">
      {/* Cover */}
      <div className="relative h-40">
        {project.cover_photo_url ? (
          <Image
            src={project.cover_photo_url}
            alt={project.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradients[project.status] ?? gradients.draft} flex items-center justify-center`}>
            <span
              className="text-4xl font-bold"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,107,53,0.4)',
              }}
            >
              {initials}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <ProjectStatusChip status={project.status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3
          className="text-sm font-semibold text-[#F0EDE8] mb-0.5 line-clamp-1"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {project.name}
        </h3>
        <p className="text-xs text-[#8A95A5] mb-3">{project.client_name}</p>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-[#8A95A5]">Avance</p>
            <p className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
              {project.progress_percentage}%
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-[#27384A] overflow-hidden">
            <div
              className="h-full bg-[#FF6B35] rounded-full transition-all"
              style={{ width: `${project.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-[10px] text-[#8A95A5] mb-4">
          <span className="flex items-center gap-1" style={{ fontFamily: 'Space Mono, monospace' }}>
            {fmtGtq(project.total_budget_gtq)}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={9} />
            {fmtDate(project.start_date)} → {fmtDate(project.estimated_end)}
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/erp/projects/${project.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-1 border-slate-300 text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"
        >
          Ver proyecto
          <ChevronRight size={11} />
        </Link>
      </div>
    </div>
  )
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function ERPDashboard() {
  const router = useRouter()
  const [user, setUser]               = useState<User | null>(null)
  const [projects, setProjects]       = useState<ProjectList[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal]     = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const me = await getMe()

      // Guard: redirect client portal users
      if (me.role === 'client_portal') {
        router.push('/portal')
        return
      }

      setUser(me)
      const list = await getMyProjects()
      setProjects(list.results)
    } catch (e: any) {
      if (e.message === 'Sesión expirada') return
      setError(e.message ?? 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const activeProjects    = projects.filter((p) => p.status === 'active')
  const completedProjects = projects.filter((p) => p.status === 'completed')
  const pausedProjects    = projects.filter((p) => p.status === 'paused' || p.status === 'draft')
  const totalBudget       = projects.reduce((s, p) => s + Number(p.total_budget_gtq), 0)
  const avgProgress       = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.progress_percentage, 0) / projects.length)
    : 0

  const stats = [
    { label: 'Total proyectos',     value: projects.length,            Icon: Building2,   color: '#F0EDE8' },
    { label: 'Activos',             value: activeProjects.length,      Icon: TrendingUp,  color: '#FF6B35' },
    { label: 'Completados',         value: completedProjects.length,   Icon: CheckCircle2,color: '#4A9E6B' },
    { label: 'En pausa / borrador', value: pausedProjects.length,      Icon: PauseCircle, color: '#8A95A5' },
    { label: 'Presupuesto total',   value: fmtGtq(totalBudget),        Icon: DollarSign,  color: '#6B8CFF' },
    { label: 'Avance promedio',     value: `${avgProgress}%`,          Icon: BarChart2,   color: '#FF6B35' },
  ]

  const budgetChartData = projects
    .filter((p) => Number(p.total_budget_gtq) > 0)
    .sort((a, b) => Number(b.total_budget_gtq) - Number(a.total_budget_gtq))
    .slice(0, 8)
    .map((p) => ({
      name: p.name.split(' ').slice(0, 3).join(' '),
      budget: Number(p.total_budget_gtq),
      progress: p.progress_percentage,
    }))

  const statusPieData = [
    { name: 'Activos',    value: activeProjects.length,    color: '#FF6B35' },
    { name: 'Completados',value: completedProjects.length, color: '#4A9E6B' },
    { name: 'En pausa',   value: pausedProjects.length,    color: '#8A95A5' },
  ].filter((d) => d.value > 0)

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : 'ST'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
          <p className="text-sm text-[#8A95A5]">Cargando panel…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm text-[#8A95A5]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setLoading(true)
            fetchData()
          }}
        />
      )}

      <div className="min-h-screen bg-[#131D28] flex">
        <ERPSidebar
          currentPage="dashboard"
          userName={user?.full_name}
          userInitials={initials}
          userAvatarUrl={user?.avatar_url}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
            <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>

            <p
              className="flex-1 text-sm font-medium text-[#F0EDE8]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Proyectos
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
            >
              <Plus size={13} />
              Nuevo proyecto
            </button>
            <div className="flex items-center gap-2.5">
              <ERPAvatar avatarUrl={user?.avatar_url} initials={initials} size="md" />
              <span className="hidden sm:block text-xs text-[#8A95A5]">{user?.full_name ?? 'Staff'}</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {stats.map(({ label, value, Icon, color }) => (
                <div key={label} className="p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] text-[#8A95A5] leading-tight">{label}</p>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <p className="text-xl font-semibold truncate" style={{ fontFamily: 'Space Mono, monospace', color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            {projects.length > 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {/* Budget by project */}
                <div className="lg:col-span-2 p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <p className="text-xs font-semibold text-[#F0EDE8] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Presupuesto por proyecto
                  </p>
                  {budgetChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={budgetChartData} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                        <XAxis
                          type="number"
                          tick={{ fill: '#4A5568', fontSize: 9, fontFamily: 'Space Mono, monospace' }}
                          tickFormatter={(v) => `Q${(v / 1000).toFixed(0)}k`}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={90}
                          tick={{ fill: '#8A95A5', fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{ background: '#131D28', border: '1px solid #27384A', borderRadius: 8, fontSize: 11 }}
                          formatter={(v) => [`Q ${Number(v).toLocaleString('es-GT')}`, 'Presupuesto']}
                          cursor={{ fill: 'rgba(255,107,53,0.05)' }}
                        />
                        <Bar dataKey="budget" radius={[0, 4, 4, 0]}>
                          {budgetChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.progress >= 80 ? '#4A9E6B' : '#FF6B35'} opacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-[#4A5568] text-center py-12">Sin datos de presupuesto</p>
                  )}
                </div>

                {/* Status donut */}
                <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] flex flex-col">
                  <p className="text-xs font-semibold text-[#F0EDE8] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Estado de proyectos
                  </p>
                  {statusPieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={140}>
                        <PieChart>
                          <Pie
                            data={statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={62}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statusPieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#131D28', border: '1px solid #27384A', borderRadius: 8, fontSize: 11 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 mt-2">
                        {statusPieData.map(({ name, value, color }) => (
                          <div key={name} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                              <span className="text-[#8A95A5]">{name}</span>
                            </div>
                            <span style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-[#4A5568] text-center py-12">Sin proyectos</p>
                  )}
                </div>
              </div>
            )}

            {/* Projects grid */}
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <FileText size={40} className="text-[#27384A]" />
                <p className="text-[#8A95A5] text-sm">No hay proyectos registrados aún.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                >
                  <Plus size={14} />
                  Crear primer proyecto
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
