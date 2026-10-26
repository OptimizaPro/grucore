'use client'

import { useState, useEffect } from 'react'
import {
  Menu, ClipboardList, Plus, X, Loader2, AlertCircle, ChevronDown,
  Cloud, Thermometer, Users, ChevronRight, ChevronUp, RefreshCw,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import Pagination from '@/components/erp/Pagination'
import {
  getMe, getMyProjects, getProjectProgress, createProgressUpdate, getProject,
  type User as UserType, type ProjectList, type ProgressUpdate, type CreateProgressPayload,
} from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const ENTRIES_PER_PAGE = 15

const WEATHER_OPTIONS = ['Soleado', 'Parcialmente nublado', 'Nublado', 'Lluvioso', 'Tormenta', 'Ventoso']

// WMO weather code → Spanish label
function wmoToLabel(code: number, windspeedKmh: number): string {
  if (windspeedKmh >= 30) return 'Ventoso'
  if (code === 0)              return 'Soleado'
  if (code <= 2)               return 'Parcialmente nublado'
  if (code === 3)              return 'Nublado'
  if (code <= 48)              return 'Nublado'       // niebla
  if (code <= 55)              return 'Lluvioso'      // llovizna
  if (code <= 65)              return 'Lluvioso'      // lluvia
  if (code <= 77)              return 'Nublado'       // nieve/aguanieve
  if (code <= 82)              return 'Lluvioso'      // chubascos
  return 'Tormenta'                                   // tormenta eléctrica
}

async function fetchWeatherForCity(city: string): Promise<{ label: string; temp: number } | null> {
  try {
    // 1. Geocoding
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`
    )
    const geoData = await geoRes.json()
    const loc = geoData.results?.[0]
    if (!loc) return null

    // 2. Current weather
    const wxRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weathercode,windspeed_10m&timezone=America%2FGuatemala`
    )
    const wxData = await wxRes.json()
    const current = wxData.current
    if (!current) return null

    return {
      label: wmoToLabel(current.weathercode, current.windspeed_10m),
      temp:  Math.round(current.temperature_2m),
    }
  } catch {
    return null
  }
}

const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('')
  function add() {
    const v = input.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setInput('')
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          className={inputCls} placeholder={placeholder} />
        <button type="button" onClick={add} className="px-3 py-2 bg-[#27384A] text-[#8A95A5] rounded-lg text-xs hover:text-[#F0EDE8] transition-colors flex-shrink-0">
          <Plus size={13} />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map(v => (
            <span key={v} className="flex items-center gap-1 px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-[11px] rounded-full">
              {v}
              <button type="button" onClick={() => onChange(values.filter(x => x !== v))} className="hover:text-red-400 transition-colors"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1F2D3A] border border-[#27384A] rounded-lg px-3 py-2">
      <p className="text-[10px] text-[#8A95A5] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#FF6B35]">{payload[0].value}%</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ERPBitacoraPage() {
  const [me, setMe]             = useState<UserType | null>(null)
  const [projects, setProjects] = useState<ProjectList[]>([])
  const [selectedPid, setSelectedPid] = useState<number | null>(null)
  const [updates, setUpdates]   = useState<ProgressUpdate[]>([])
  const [loading, setLoading]   = useState(true)
  const [updatesLoading, setUpdatesLoading] = useState(false)
  const [error, setError]       = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [entryPage, setEntryPage] = useState(1)

  // Form state
  const [showForm, setShowForm]   = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [fDate, setFDate]         = useState(new Date().toISOString().split('T')[0])
  const [fProgress, setFProgress] = useState('')
  const [fWeather, setFWeather]   = useState('Soleado')
  const [fTemp, setFTemp]         = useState('')
  const [fLabor, setFLabor]       = useState('')
  const [fNotes, setFNotes]       = useState('')
  const [fActivities, setFActivities] = useState<string[]>([])
  const [fMaterials, setFMaterials]   = useState<string[]>([])

  // Weather auto-fetch state
  const [weatherFetching, setWeatherFetching] = useState(false)
  const [weatherAutoCity, setWeatherAutoCity]   = useState<string | null>(null)

  const isAdmin = me?.role === 'admin' || me?.role === 'project_manager' || me?.role === 'site_supervisor'

  useEffect(() => {
    async function init() {
      try {
        const user = await getMe()
        if (user.role === 'client_portal') { window.location.href = '/portal'; return }
        setMe(user)
        const res = await getMyProjects()
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
    setEntryPage(1)
    loadUpdates(selectedPid)
  }, [selectedPid])

  async function autoFetchWeather(pid: number) {
    setWeatherFetching(true)
    setWeatherAutoCity(null)
    try {
      const detail = await getProject(pid)
      const city = detail.city || detail.department || 'Guatemala'
      const result = await fetchWeatherForCity(city)
      if (result) {
        setFWeather(result.label)
        setFTemp(String(result.temp))
        setWeatherAutoCity(city)
      }
    } catch {}
    finally { setWeatherFetching(false) }
  }

  function openForm() {
    setShowForm(true)
    setWeatherAutoCity(null)
    if (selectedPid) autoFetchWeather(selectedPid)
  }

  async function loadUpdates(pid: number) {
    setUpdatesLoading(true)
    try {
      const res = await getProjectProgress(pid)
      const list = res.results ?? (res as any)
      setUpdates(list)
    } catch {} finally { setUpdatesLoading(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPid) return
    setFormLoading(true); setFormError('')
    try {
      const payload: CreateProgressPayload = {
        date: fDate,
        progress_pct: Number(fProgress),
        weather: fWeather,
        temperature: fTemp ? Number(fTemp) : null,
        labor_count: fLabor ? Number(fLabor) : 0,
        notes: fNotes,
        activities: fActivities,
        materials: fMaterials,
      }
      const created = await createProgressUpdate(selectedPid, payload)
      setUpdates(prev => [created, ...prev])
      setShowForm(false)
      setFDate(new Date().toISOString().split('T')[0])
      setFProgress(''); setFWeather('Soleado'); setFTemp(''); setFLabor('')
      setFNotes(''); setFActivities([]); setFMaterials([])
      toast.success('Entrada registrada')
    } catch (e: any) { setFormError(e.message) }
    finally { setFormLoading(false) }
  }

  // Chart data: progress over time (last 20 entries, oldest first)
  const chartData = [...updates]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-20)
    .map(u => ({
      date: new Date(u.date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' }),
      progress: u.progress_pct,
    }))

  const selectedProject = projects.find(p => p.id === selectedPid)
  const latestProgress = updates[0]?.progress_pct ?? selectedProject?.progress_percentage ?? 0
  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST' : 'ST'

  if (loading) return (
    <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
        <p className="text-sm text-[#8A95A5]">Cargando bitácora…</p>
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
        currentPage="bitacora"
        userName={me?.full_name} userInitials={initials} userAvatarUrl={me?.avatar_url}
        open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onUserUpdate={setMe}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Bitácora de Obra</p>
          {isAdmin && (
            <button onClick={() => showForm ? setShowForm(false) : openForm()} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors">
              <Plus size={13} /><span className="hidden sm:inline">Nueva entrada</span>
            </button>
          )}
          <ERPAvatar avatarUrl={me?.avatar_url} initials={initials} size="md" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Project selector */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs text-[#8A95A5] whitespace-nowrap">Proyecto</label>
              <div className="relative">
                <select value={selectedPid ?? ''} onChange={e => { setSelectedPid(Number(e.target.value)); setUpdates([]) }}
                  className="appearance-none bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-4 pr-9 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 cursor-pointer">
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5] pointer-events-none" />
              </div>
              {selectedProject && (
                <span className="text-xs text-[#4A5568]">{selectedProject.status}</span>
              )}
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Entradas en bitácora', value: updates.length,                              color: '#F0EDE8' },
                { label: 'Progreso actual',       value: `${latestProgress}%`,                       color: '#FF6B35' },
                { label: 'Último reporte',        value: updates[0] ? new Date(updates[0].date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' }) : '—', color: '#4A9E6B' },
                { label: 'Promedio mano de obra', value: updates.length > 0 ? Math.round(updates.slice(0, 7).reduce((a, b) => a + b.labor_count, 0) / Math.min(updates.length, 7)) : 0, color: '#F59E0B' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <p className="text-xs text-[#8A95A5] mb-3">{label}</p>
                  <p className="text-xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Progress chart */}
            {chartData.length > 1 && (
              <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                <p className="text-xs text-[#8A95A5] mb-4 font-medium">Progreso acumulado (%)</p>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27384A" />
                      <XAxis dataKey="date" tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#4A5568', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="progress" stroke="#FF6B35" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FF6B35' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Create form — bottom-sheet / centered modal */}
            {showForm && (
              <div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
                onClick={() => setShowForm(false)}
              >
                <div
                  className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
                  style={{ maxHeight: '90dvh' }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
                    <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nueva entrada de bitácora</h3>
                    <button onClick={() => setShowForm(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"><X size={16} /></button>
                  </div>

                  {/* Scrollable body */}
                  <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                    {formError && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        <AlertCircle size={14} />{formError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Fecha <span className="text-[#FF6B35]">*</span></label>
                        <input form="bitacora-form" required type="date" value={fDate} onChange={e => setFDate(e.target.value)} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Avance (%) <span className="text-[#FF6B35]">*</span></label>
                        <input form="bitacora-form" required type="number" min="0" max="100" value={fProgress} onChange={e => setFProgress(e.target.value)} className={inputCls} placeholder="45" />
                      </div>
                      <div>
                        <label className={labelCls}>Mano de obra</label>
                        <input form="bitacora-form" type="number" min="0" value={fLabor} onChange={e => setFLabor(e.target.value)} className={inputCls} placeholder="12 personas" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs text-[#8A95A5] font-medium">Clima</label>
                          {weatherFetching
                            ? <span className="flex items-center gap-1 text-[10px] text-[#4A5568]"><Loader2 size={10} className="animate-spin" />Obteniendo…</span>
                            : weatherAutoCity
                              ? <span className="flex items-center gap-1 text-[10px] text-[#4A9E6B]"><Cloud size={10} />Auto · {weatherAutoCity}</span>
                              : null
                          }
                        </div>
                        <select form="bitacora-form" value={fWeather} onChange={e => { setFWeather(e.target.value); setWeatherAutoCity(null) }} className={cn(inputCls, 'cursor-pointer')}>
                          {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs text-[#8A95A5] font-medium">Temperatura (°C)</label>
                          {!weatherFetching && weatherAutoCity && (
                            <button type="button" onClick={() => selectedPid && autoFetchWeather(selectedPid)}
                              className="flex items-center gap-1 text-[10px] text-[#4A5568] hover:text-[#FF6B35] transition-colors">
                              <RefreshCw size={9} />Actualizar
                            </button>
                          )}
                        </div>
                        <input form="bitacora-form" type="number" value={fTemp} onChange={e => { setFTemp(e.target.value); setWeatherAutoCity(null) }} className={inputCls} placeholder="28" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Actividades realizadas</label>
                      <TagInput values={fActivities} onChange={setFActivities} placeholder="Ej: Fundición de losa nivel 3… Enter" />
                    </div>
                    <div>
                      <label className={labelCls}>Materiales utilizados</label>
                      <TagInput values={fMaterials} onChange={setFMaterials} placeholder="Ej: 50 sacos cemento… Enter" />
                    </div>
                    <div>
                      <label className={labelCls}>Notas del supervisor</label>
                      <textarea form="bitacora-form" rows={3} value={fNotes} onChange={e => setFNotes(e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Observaciones generales del día…" />
                    </div>
                  </div>

                  {/* Footer */}
                  <form id="bitacora-form" onSubmit={handleCreate} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">Cancelar</button>
                    <button type="submit" disabled={formLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                      {formLoading ? <><Loader2 size={13} className="animate-spin" />Guardando…</> : <><Plus size={13} />Registrar entrada</>}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Log entries */}
            {updatesLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#FF6B35]" /></div>
            ) : updates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <ClipboardList size={40} className="text-[#27384A]" />
                <p className="text-[#8A95A5] text-sm">No hay entradas en la bitácora.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {updates.slice((entryPage - 1) * ENTRIES_PER_PAGE, entryPage * ENTRIES_PER_PAGE).map(u => {
                  const isExpanded = expandedId === u.id
                  return (
                    <div key={u.id} className="rounded-xl bg-[#1F2D3A] border border-[#27384A] overflow-hidden">
                      {/* Header row */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : u.id)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#27384A]/30 transition-colors text-left"
                      >
                        <div className="flex-shrink-0 text-center">
                          <p className="text-lg font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
                            {new Date(u.date).toLocaleDateString('es-GT', { day: '2-digit' })}
                          </p>
                          <p className="text-[10px] text-[#8A95A5] uppercase tracking-wide">
                            {new Date(u.date).toLocaleDateString('es-GT', { month: 'short' })}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1 text-xs text-[#8A95A5]">
                              <Cloud size={12} />{u.weather}
                              {u.temperature != null && <><Thermometer size={10} className="ml-1" />{u.temperature}°C</>}
                            </div>
                            {u.labor_count > 0 && (
                              <div className="flex items-center gap-1 text-xs text-[#8A95A5]">
                                <Users size={12} />{u.labor_count} personas
                              </div>
                            )}
                          </div>
                          {u.notes && <p className="text-xs text-[#8A95A5] mt-0.5 truncate">{u.notes}</p>}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{u.progress_pct}%</p>
                            <p className="text-[10px] text-[#4A5568]">avance</p>
                          </div>
                          {isExpanded ? <ChevronUp size={14} className="text-[#8A95A5]" /> : <ChevronRight size={14} className="text-[#8A95A5]" />}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-[#27384A] grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {u.activities.length > 0 && (
                            <div>
                              <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-2 font-medium">Actividades</p>
                              <ul className="space-y-1">
                                {u.activities.map((a, i) => (
                                  <li key={i} className="text-xs text-[#F0EDE8] flex items-start gap-2">
                                    <span className="text-[#FF6B35] mt-0.5">·</span>{a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {u.materials.length > 0 && (
                            <div>
                              <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-2 font-medium">Materiales</p>
                              <ul className="space-y-1">
                                {u.materials.map((m, i) => (
                                  <li key={i} className="text-xs text-[#F0EDE8] flex items-start gap-2">
                                    <span className="text-[#4A9E6B] mt-0.5">·</span>{m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {u.photos.length > 0 && (
                            <div className="sm:col-span-2">
                              <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-2 font-medium">Fotos ({u.photos.length})</p>
                              <div className="flex gap-2 flex-wrap">
                                {u.photos.map(photo => (
                                  <a key={photo.id} href={photo.photo_url} target="_blank" rel="noopener noreferrer">
                                    <img src={photo.photo_url} alt={photo.caption || 'foto'} className="w-20 h-20 object-cover rounded-lg border border-[#27384A] hover:border-[#FF6B35]/40 transition-colors" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {u.notes && !(u.activities.length + u.materials.length + u.photos.length) && (
                            <div className="sm:col-span-2">
                              <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest mb-2 font-medium">Notas</p>
                              <p className="text-xs text-[#F0EDE8]">{u.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            {updates.length > ENTRIES_PER_PAGE && (
              <Pagination
                page={entryPage}
                total={updates.length}
                perPage={ENTRIES_PER_PAGE}
                onChange={setEntryPage}
              />
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
