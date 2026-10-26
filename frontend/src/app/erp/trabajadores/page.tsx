'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ERPSidebar from '@/components/erp/ERPSidebar'
import Pagination from '@/components/erp/Pagination'
import { getMe, getMyProjects, type User as UserType } from '@/lib/api'
import {
  getWorkers, createWorker, updateWorker, deleteWorker,
  getWorkLogs, createWorkLog, deleteWorkLog, uploadWorkerAvatar,
  type Worker, type WorkLog, type WorkerPosition, type WorkerStatus,
} from '@/lib/api-workers'
import {
  HardHat, Plus, Search, X, Trash2, Clock, Calendar,
  Phone, AlertCircle, Pencil, Upload, ImagePlus, LayoutGrid, List,
  ArrowLeft, Menu,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const POSITION_LABELS: Record<WorkerPosition, string> = {
  peon: 'Peón', oficial: 'Oficial', maestro_obras: 'Maestro de obras',
  albanil: 'Albañil', electricista: 'Electricista', fontanero: 'Fontanero',
  soldador: 'Soldador', carpintero: 'Carpintero', supervisor: 'Supervisor', otro: 'Otro',
}
const POSITION_OPTIONS = Object.entries(POSITION_LABELS) as [WorkerPosition, string][]

const WORKERS_PER_PAGE = 18
const LOGS_PER_PAGE    = 10

function fmt(n: number) {
  return new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}
function fmtTime(t: string | null) {
  if (!t) return '—'
  return t.slice(0, 5)
}
function calcHours(start: string, end: string) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null
  let totalMins = (eh * 60 + em) - (sh * 60 + sm)
  if (totalMins <= 0) totalMins += 24 * 60
  const total    = Math.round(totalMins / 60 * 100) / 100
  const regular  = Math.min(8, total)
  const overtime = Math.max(0, Math.round((total - 8) * 100) / 100)
  return { regular, overtime, total }
}
function fmtDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── WorkerAvatar ─────────────────────────────────────────────────────────────

function WorkerAvatar({ avatarUrl, firstName, lastName, size = 'md' }: {
  avatarUrl: string | null; firstName: string; lastName: string; size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-xs' : size === 'lg' ? 'w-14 h-14 text-lg' : size === 'xl' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm'
  const initials  = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={`${firstName} ${lastName}`} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} />
  }
  return (
    <div className={`${sizeClass} rounded-full bg-[#FF6B35]/20 flex items-center justify-center flex-shrink-0`}>
      <span className="font-semibold text-[#FF6B35]">{initials}</span>
    </div>
  )
}

// ─── AvatarDropzone ───────────────────────────────────────────────────────────

function AvatarDropzone({ currentUrl, firstName, lastName, onFile }: {
  currentUrl: string | null; firstName: string; lastName: string
  onFile: (file: File, preview: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const handle = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => onFile(file, e.target?.result as string)
    reader.readAsDataURL(file)
  }
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handle(f) }}
      onClick={() => inputRef.current?.click()}
      className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragging ? 'border-[#FF6B35] bg-[#FF6B35]/10' : 'border-[#27384A] hover:border-[#FF6B35]/60 hover:bg-[#FF6B35]/5'}`}
      style={{ height: 120 }}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handle(f) }} />
      {currentUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentUrl} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
          <span className="text-[10px] text-[#8A95A5] group-hover:text-[#FF6B35] transition-colors">Cambiar foto</span>
        </>
      ) : firstName || lastName ? (
        <>
          <div className="w-16 h-16 rounded-full bg-[#FF6B35]/20 flex items-center justify-center">
            <span className="text-2xl font-semibold text-[#FF6B35]">{(firstName[0] ?? '').toUpperCase()}{(lastName[0] ?? '').toUpperCase()}</span>
          </div>
          <span className="text-[10px] text-[#8A95A5] group-hover:text-[#FF6B35] transition-colors flex items-center gap-1"><Upload size={10} /> Añadir foto</span>
        </>
      ) : (
        <>
          <ImagePlus size={28} className="text-[#27384A] group-hover:text-[#FF6B35]/60 transition-colors" />
          <span className="text-xs text-[#8A95A5]">Arrastra o haz clic para subir foto</span>
          <span className="text-[10px] text-[#8A95A5]">JPG, PNG, WEBP — máx. 5 MB</span>
        </>
      )}
    </div>
  )
}

// ─── Form data ────────────────────────────────────────────────────────────────

interface WorkerFormData {
  first_name: string; last_name: string; dpi: string; phone: string
  emergency_contact_name: string; emergency_contact_phone: string
  position: WorkerPosition; daily_rate_gtq: string; hire_date: string
  status: WorkerStatus; current_project: string; notes: string
}
const EMPTY_FORM: WorkerFormData = {
  first_name: '', last_name: '', dpi: '', phone: '',
  emergency_contact_name: '', emergency_contact_phone: '',
  position: 'peon', daily_rate_gtq: '', hire_date: '',
  status: 'active', current_project: '', notes: '',
}

// ─── Worker Card ──────────────────────────────────────────────────────────────

function WorkerCard({ w, onSelect, onEdit, onDelete, confirmDeleteId, onConfirmDelete, onCancelDelete }: {
  w: Worker
  onSelect: (w: Worker) => void
  onEdit: (w: Worker) => void
  onDelete: (id: number) => void
  confirmDeleteId: number | null
  onConfirmDelete: (id: number) => void
  onCancelDelete: () => void
}) {
  return (
    <div className="bg-[#1F2D3A] border border-[#27384A] rounded-xl p-4 flex flex-col gap-3 hover:border-[#FF6B35]/20 transition-colors">
      {/* Top: avatar + actions */}
      <div className="flex items-start justify-between">
        <button onClick={() => onSelect(w)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <WorkerAvatar avatarUrl={w.avatar_url} firstName={w.first_name} lastName={w.last_name} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#F0EDE8] truncate">{w.full_name}</p>
            <p className="text-[11px] text-[#8A95A5]">{POSITION_LABELS[w.position]}</p>
          </div>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button onClick={() => onEdit(w)} className="p-1.5 rounded text-[#8A95A5] hover:text-[#6B8CFF] hover:bg-[#6B8CFF]/10 transition-colors" title="Editar">
            <Pencil size={13} />
          </button>
          {confirmDeleteId === w.id ? (
            <div className="flex items-center gap-1">
              <button onClick={onCancelDelete} className="text-[10px] px-1.5 py-0.5 rounded border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
              <button onClick={() => onConfirmDelete(w.id)} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors">Sí</button>
            </div>
          ) : (
            <button onClick={() => onDelete(w.id)} className="p-1.5 rounded text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Eliminar">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Status + project */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', w.status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-[#27384A] text-[#8A95A5]')}>
          {w.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
        {w.current_project_name && (
          <span className="text-[10px] text-[#FF6B35] truncate">{w.current_project_name}</span>
        )}
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#27384A]/60 text-[11px]">
        <span className="text-[#8A95A5]">Días (mes): <span className="text-[#F0EDE8] font-medium">{w.current_month_days}</span></span>
        <span className="text-[#8A95A5]">Q <span className="text-green-400 font-medium">{fmt(Number(w.daily_rate_gtq))}</span>/día</span>
      </div>

      {/* View detail */}
      <button
        onClick={() => onSelect(w)}
        className="w-full py-1.5 rounded-lg border border-[#27384A] text-[11px] text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"
      >
        Ver ficha completa
      </button>
    </div>
  )
}

// ─── Worker List Row ──────────────────────────────────────────────────────────

function WorkerListRow({ w, onSelect, onEdit, onDelete, confirmDeleteId, onConfirmDelete, onCancelDelete }: {
  w: Worker
  onSelect: (w: Worker) => void
  onEdit: (w: Worker) => void
  onDelete: (id: number) => void
  confirmDeleteId: number | null
  onConfirmDelete: (id: number) => void
  onCancelDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#1F2D3A] border border-[#27384A] rounded-xl hover:border-[#FF6B35]/20 transition-colors">
      <button onClick={() => onSelect(w)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <WorkerAvatar avatarUrl={w.avatar_url} firstName={w.first_name} lastName={w.last_name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F0EDE8] truncate">{w.full_name}</p>
          <p className="text-[11px] text-[#8A95A5]">{POSITION_LABELS[w.position]}</p>
        </div>
        <div className="hidden md:block min-w-[140px]">
          <p className="text-[11px] text-[#8A95A5] truncate">{w.current_project_name ?? '—'}</p>
        </div>
        <div className="hidden sm:block min-w-[80px] text-center">
          <p className="text-[11px] text-[#F0EDE8]">{w.current_month_days} días</p>
          <p className="text-[10px] text-green-400">Q {fmt(Number(w.daily_rate_gtq))}/día</p>
        </div>
        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0', w.status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-[#27384A] text-[#8A95A5]')}>
          {w.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </button>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onEdit(w)} className="p-1.5 rounded text-[#8A95A5] hover:text-[#6B8CFF] hover:bg-[#6B8CFF]/10 transition-colors" title="Editar">
          <Pencil size={13} />
        </button>
        {confirmDeleteId === w.id ? (
          <div className="flex items-center gap-1">
            <button onClick={onCancelDelete} className="text-[10px] px-1.5 py-0.5 rounded border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
            <button onClick={() => onConfirmDelete(w.id)} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors">Sí</button>
          </div>
        ) : (
          <button onClick={() => onDelete(w.id)} className="p-1.5 rounded text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Eliminar">
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrabajadoresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [me, setMe]                   = useState<UserType | null>(null)

  // Workers list
  const [workers, setWorkers]           = useState<Worker[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState<WorkerStatus | ''>('')
  const [viewMode, setViewMode]         = useState<'grid' | 'list'>('grid')
  const [workerPage, setWorkerPage]     = useState(1)

  // Detail
  const [selected, setSelected]       = useState<Worker | null>(null)
  const [logs, setLogs]               = useState<WorkLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logPage, setLogPage]         = useState(1)

  // Projects
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([])

  // Worker form modal
  const [showForm, setShowForm]           = useState(false)
  const [editing, setEditing]             = useState<Worker | null>(null)
  const [form, setForm]                   = useState<WorkerFormData>(EMPTY_FORM)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving]               = useState(false)
  const [formError, setFormError]         = useState('')

  // Delete confirms
  const [confirmDeleteWorkerId, setConfirmDeleteWorkerId] = useState<number | null>(null)
  const [confirmDeleteLogId, setConfirmDeleteLogId]       = useState<number | null>(null)

  // Log form
  const [showLogForm, setShowLogForm] = useState(false)
  const [logForm, setLogForm]         = useState({ project: '', date: new Date().toISOString().slice(0, 10), start_time: '07:00', end_time: '16:00', notes: '' })
  const [savingLog, setSavingLog]     = useState(false)
  const [logError, setLogError]       = useState('')

  // ── Load ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    getMe().then(setMe).catch(() => {})
    getMyProjects().then(p => setProjects(p.results ?? []))
    loadWorkers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadWorkers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getWorkers(filterStatus ? { status: filterStatus } : undefined)
      setWorkers(data)
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { loadWorkers() }, [loadWorkers])

  const loadLogs = useCallback(async (worker: Worker) => {
    setLoadingLogs(true)
    try { setLogs(await getWorkLogs(worker.id)) }
    finally { setLoadingLogs(false) }
  }, [])

  const selectWorker = (w: Worker) => {
    setSelected(w)
    setShowLogForm(false)
    setLogPage(1)
    loadLogs(w)
  }

  const goBack = () => {
    setSelected(null)
    setConfirmDeleteWorkerId(null)
  }

  // ── Worker CRUD ───────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setAvatarFile(null)
    setAvatarPreview(null)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (w: Worker) => {
    setEditing(w)
    setForm({
      first_name: w.first_name, last_name: w.last_name, dpi: w.dpi,
      phone: w.phone, emergency_contact_name: w.emergency_contact_name,
      emergency_contact_phone: w.emergency_contact_phone,
      position: w.position, daily_rate_gtq: w.daily_rate_gtq,
      hire_date: w.hire_date ?? '', status: w.status,
      current_project: w.current_project ? String(w.current_project) : '',
      notes: w.notes,
    })
    setAvatarFile(null)
    setAvatarPreview(w.avatar_url)
    setFormError('')
    setShowForm(true)
  }

  const saveWorker = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.daily_rate_gtq) {
      setFormError('Nombre, apellidos y tarifa diaria son obligatorios.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = { ...form, hire_date: form.hire_date || null, current_project: form.current_project ? Number(form.current_project) : null }
      let saved: Worker
      if (editing) {
        saved = await updateWorker(editing.id, payload)
      } else {
        saved = await createWorker(payload as any)
      }
      if (avatarFile) saved = await uploadWorkerAvatar(saved.id, avatarFile)
      setWorkers(ws => editing ? ws.map(w => w.id === saved.id ? saved : w) : [...ws, saved])
      if (selected?.id === saved.id) setSelected(saved)
      setShowForm(false)
      toast.success(editing ? 'Trabajador actualizado' : 'Trabajador creado')
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const name = workers.find(w => w.id === id)?.full_name ?? 'Trabajador'
    setConfirmDeleteWorkerId(null)
    try {
      await deleteWorker(id)
      setWorkers(ws => ws.filter(w => w.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success(`"${name}" eliminado`)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar el trabajador')
    }
  }

  // ── Work Log CRUD ─────────────────────────────────────────────────────────────

  const saveLog = async () => {
    if (!selected || !logForm.project || !logForm.date) { setLogError('Proyecto y fecha son obligatorios.'); return }
    if (!logForm.start_time || !logForm.end_time) { setLogError('Hora de inicio y fin son obligatorias.'); return }
    const preview = calcHours(logForm.start_time, logForm.end_time)
    if (!preview || preview.total <= 0) { setLogError('La hora de fin debe ser posterior a la de inicio.'); return }
    setSavingLog(true)
    setLogError('')
    try {
      const log = await createWorkLog(selected.id, { project: Number(logForm.project), date: logForm.date, start_time: logForm.start_time, end_time: logForm.end_time, notes: logForm.notes })
      setLogs(ls => [log, ...ls])
      const refreshed = await getWorkers()
      const updated = refreshed.find(w => w.id === selected.id)
      if (updated) { setSelected(updated); setWorkers(ws => ws.map(w => w.id === updated.id ? updated : w)) }
      setShowLogForm(false)
      setLogForm({ project: '', date: new Date().toISOString().slice(0, 10), start_time: '07:00', end_time: '16:00', notes: '' })
      toast.success('Jornada registrada')
    } catch (e: any) {
      setLogError(e.message ?? 'Error al guardar')
    } finally {
      setSavingLog(false)
    }
  }

  const handleDeleteLog = async (logId: number) => {
    if (!selected) return
    setConfirmDeleteLogId(null)
    try {
      await deleteWorkLog(selected.id, logId)
      setLogs(ls => ls.filter(l => l.id !== logId))
      toast.success('Jornada eliminada')
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar la jornada')
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const filtered     = workers.filter(w => { const q = search.toLowerCase(); return !q || w.full_name.toLowerCase().includes(q) || w.dpi.includes(q) })
  const pagedWorkers = filtered.slice((workerPage - 1) * WORKERS_PER_PAGE, workerPage * WORKERS_PER_PAGE)
  const pagedLogs    = logs.slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE)
  const userInitials = me ? `${me.first_name[0] ?? ''}${me.last_name[0] ?? ''}`.toUpperCase() : '?'
  const dropzoneUrl  = avatarPreview

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#131D28] flex text-[#F0EDE8]">
      <ERPSidebar
        currentPage={'trabajadores' as never}
        userName={me?.full_name}
        userInitials={userInitials}
        userAvatarUrl={me?.avatar_url}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          {selected ? (
            /* Detail header */
            <>
              <button onClick={goBack} className="flex items-center gap-1.5 text-[#8A95A5] hover:text-[#F0EDE8] transition-colors text-sm">
                <ArrowLeft size={16} /> Trabajadores
              </button>
              <span className="text-[#27384A]">/</span>
              <span className="text-sm font-medium text-[#F0EDE8] truncate">{selected.full_name}</span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => openEdit(selected)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#4A5568] transition-colors">
                  <Pencil size={13} /> Editar
                </button>
                {confirmDeleteWorkerId === selected.id ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-red-400">¿Eliminar?</span>
                    <button onClick={() => setConfirmDeleteWorkerId(null)} className="text-[10px] px-2 py-1 rounded border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
                    <button onClick={() => handleDelete(selected.id)} className="text-[10px] px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors">Sí</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteWorkerId(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-red-400 hover:border-red-500/30 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* List header */
            <>
              <HardHat size={18} className="text-[#FF6B35]" />
              <h1 className="font-semibold text-sm flex-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Trabajadores</h1>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative hidden sm:block">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setWorkerPage(1) }}
                    placeholder="Buscar nombre o DPI…"
                    className="pl-8 pr-3 py-1.5 bg-[#131D28] border border-[#27384A] rounded-lg text-xs text-[#F0EDE8] placeholder-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 w-48"
                  />
                </div>
                {/* Status filter */}
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as WorkerStatus | '')}
                  className="bg-[#131D28] border border-[#27384A] rounded-lg px-2 py-1.5 text-xs text-[#F0EDE8] focus:outline-none hidden sm:block"
                >
                  <option value="">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
                {/* View toggle */}
                <div className="flex items-center gap-1 bg-[#1F2D3A] border border-[#27384A] rounded-lg p-0.5">
                  <button onClick={() => setViewMode('grid')} className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-[#FF6B35] text-white' : 'text-[#8A95A5] hover:text-[#8A95A5]')} title="Vista tarjetas">
                    <LayoutGrid size={14} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-[#FF6B35] text-white' : 'text-[#8A95A5] hover:text-[#8A95A5]')} title="Vista lista">
                    <List size={14} />
                  </button>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A25] text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                  <Plus size={14} />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
              </div>
            </>
          )}
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── Workers browse ── */}
          {!selected && (
            <>
              {/* Mobile search */}
              <div className="sm:hidden mb-4 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setWorkerPage(1) }}
                  placeholder="Buscar nombre o DPI…"
                  className="w-full pl-8 pr-3 py-2 bg-[#1F2D3A] border border-[#27384A] rounded-lg text-sm text-[#F0EDE8] placeholder-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24 text-[#8A95A5] text-sm">Cargando…</div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#8A95A5]">
                  <HardHat size={40} className="opacity-20" />
                  <p className="text-sm">Sin trabajadores registrados</p>
                  <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-medium hover:bg-[#E55A25] transition-colors">
                    <Plus size={14} /> Nuevo trabajador
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {pagedWorkers.map(w => (
                    <WorkerCard
                      key={w.id} w={w}
                      onSelect={selectWorker} onEdit={openEdit} onDelete={id => setConfirmDeleteWorkerId(id)}
                      confirmDeleteId={confirmDeleteWorkerId} onConfirmDelete={handleDelete} onCancelDelete={() => setConfirmDeleteWorkerId(null)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {pagedWorkers.map(w => (
                    <WorkerListRow
                      key={w.id} w={w}
                      onSelect={selectWorker} onEdit={openEdit} onDelete={id => setConfirmDeleteWorkerId(id)}
                      confirmDeleteId={confirmDeleteWorkerId} onConfirmDelete={handleDelete} onCancelDelete={() => setConfirmDeleteWorkerId(null)}
                    />
                  ))}
                </div>
              )}

              {filtered.length > WORKERS_PER_PAGE && (
                <div className="mt-6">
                  <Pagination page={workerPage} total={filtered.length} perPage={WORKERS_PER_PAGE} onChange={setWorkerPage} />
                </div>
              )}
            </>
          )}

          {/* ── Worker detail ── */}
          {selected && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Profile header */}
              <div className="flex items-start gap-5 p-5 bg-[#1F2D3A] border border-[#27384A] rounded-xl">
                <WorkerAvatar avatarUrl={selected.avatar_url} firstName={selected.first_name} lastName={selected.last_name} size="xl" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-[#F0EDE8]">{selected.full_name}</h2>
                  <p className="text-[#8A95A5] text-sm">{POSITION_LABELS[selected.position]}</p>
                  {selected.current_project_name && (
                    <p className="text-xs text-[#FF6B35] mt-1">Proyecto: {selected.current_project_name}</p>
                  )}
                  <span className={cn('inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium', selected.status === 'active' ? 'bg-green-900/40 text-green-400' : 'bg-[#27384A] text-[#8A95A5]')}>
                    {selected.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Días (mes)',          value: selected.current_month_days,              suffix: 'días' },
                  { label: 'Bruto (mes)',          value: `Q ${fmt(selected.current_month_gross)}`, suffix: '' },
                  { label: 'Costo empresa (mes)',  value: `Q ${fmt(selected.current_month_cost)}`,  suffix: '' },
                  { label: 'Total días laborados', value: selected.total_days_worked,              suffix: 'días' },
                ].map(({ label, value, suffix }) => (
                  <div key={label} className="bg-[#1F2D3A] border border-[#27384A] rounded-xl p-4">
                    <p className="text-[10px] text-[#8A95A5] mb-1">{label}</p>
                    <p className="text-lg font-semibold text-[#F0EDE8]">{value}{suffix && <span className="text-xs text-[#8A95A5] ml-1">{suffix}</span>}</p>
                  </div>
                ))}
              </div>

              {/* Ficha */}
              <div className="bg-[#1F2D3A] border border-[#27384A] rounded-xl p-5">
                <h3 className="text-sm font-medium text-[#8A95A5] mb-4">Ficha del trabajador</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {selected.dpi && <div><span className="text-[#8A95A5]">DPI: </span>{selected.dpi}</div>}
                  {selected.phone && (
                    <div className="flex items-center gap-1.5"><Phone size={12} className="text-[#8A95A5]" />{selected.phone}</div>
                  )}
                  {selected.emergency_contact_name && (
                    <div><span className="text-[#8A95A5]">Emergencia: </span>{selected.emergency_contact_name}{selected.emergency_contact_phone && ` · ${selected.emergency_contact_phone}`}</div>
                  )}
                  <div><span className="text-[#8A95A5]">Tarifa diaria: </span>Q {fmt(Number(selected.daily_rate_gtq))}</div>
                  {selected.hire_date && (
                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-[#8A95A5]" />Ingreso: {fmtDate(selected.hire_date)}</div>
                  )}
                </div>
                {selected.notes && <p className="mt-4 text-xs text-[#8A95A5] border-t border-[#27384A] pt-4">{selected.notes}</p>}
              </div>

              {/* Work logs */}
              <div className="bg-[#1F2D3A] border border-[#27384A] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A]">
                  <h3 className="text-sm font-medium">Bitácora de jornadas</h3>
                  <button
                    onClick={() => setShowLogForm(v => !v)}
                    className="flex items-center gap-1.5 text-xs text-[#FF6B35] hover:text-[#E55A25] transition-colors"
                  >
                    <Plus size={13} /> Registrar jornada
                  </button>
                </div>

                {loadingLogs ? (
                  <p className="text-center py-8 text-[#8A95A5] text-sm">Cargando jornadas…</p>
                ) : logs.length === 0 ? (
                  <p className="text-center py-8 text-[#8A95A5] text-sm">Sin jornadas registradas.</p>
                ) : (
                  <>
                    <div className="divide-y divide-[#27384A]">
                      {pagedLogs.map(log => (
                        <div key={log.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                          <div className="flex-shrink-0 min-w-[130px]">
                            <div className="flex items-center gap-1 text-[#8A95A5] text-xs"><Calendar size={11} />{fmtDate(log.date)}</div>
                            {log.start_time && log.end_time && (
                              <div className="flex items-center gap-1 text-xs text-[#F0EDE8] mt-0.5"><Clock size={10} className="text-[#8A95A5]" />{fmtTime(log.start_time)} – {fmtTime(log.end_time)}</div>
                            )}
                            <p className="text-xs text-[#8A95A5] truncate max-w-[130px]">{log.project_name}</p>
                          </div>
                          <div className="flex-1 grid grid-cols-3 gap-2 text-xs text-center">
                            <div><p className="text-[#8A95A5]">Hrs reg.</p><p className="font-medium">{Number(log.regular_hours).toFixed(1)}h</p></div>
                            <div><p className="text-[#8A95A5]">Hrs extra</p><p className={Number(log.overtime_hours) > 0 ? 'font-medium text-[#FF6B35]' : ''}>{Number(log.overtime_hours).toFixed(1)}h</p></div>
                            <div><p className="text-[#8A95A5]">Bruto</p><p className="font-medium text-green-400">Q {fmt(log.gross_pay)}</p></div>
                          </div>
                          <div className="text-right flex-shrink-0 hidden sm:block">
                            <p className="text-xs text-[#8A95A5]">Costo</p>
                            <p className="text-xs font-medium">Q {fmt(log.total_cost)}</p>
                          </div>
                          {confirmDeleteLogId === log.id ? (
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button onClick={() => setConfirmDeleteLogId(null)} className="px-2 py-1 rounded border border-[#27384A] text-[10px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
                              <button onClick={() => handleDeleteLog(log.id)} className="px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors">Sí</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteLogId(log.id)} className="p-1.5 rounded text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="px-5 pb-4">
                      <Pagination page={logPage} total={logs.length} perPage={LOGS_PER_PAGE} onChange={setLogPage} />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Log Form Modal ────────────────────────────────────────────────────── */}
      {showLogForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={() => setShowLogForm(false)}>
          <div className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col" style={{ maxHeight: '90dvh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Registrar jornada</h3>
              <button onClick={() => setShowLogForm(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {logError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle size={13} className="flex-shrink-0" />{logError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Proyecto *</label>
                  <select form="log-form" value={logForm.project} onChange={e => setLogForm(f => ({ ...f, project: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-2 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]">
                    <option value="">Seleccionar…</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Fecha *</label>
                  <input form="log-form" type="date" value={logForm.date} onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-2 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Hora inicio *</label>
                  <input form="log-form" type="time" value={logForm.start_time} onChange={e => setLogForm(f => ({ ...f, start_time: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-2 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Hora fin *</label>
                  <input form="log-form" type="time" value={logForm.end_time} onChange={e => setLogForm(f => ({ ...f, end_time: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-2 py-1.5 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
              </div>
              {(() => {
                const preview = calcHours(logForm.start_time, logForm.end_time)
                return preview ? (
                  <div className="flex gap-3 bg-[#0F1923] rounded px-3 py-2 text-xs">
                    <span className="text-[#8A95A5]">Total: <span className="text-[#F0EDE8] font-medium">{preview.total}h</span></span>
                    <span className="text-[#8A95A5]">Regulares: <span className="text-green-400 font-medium">{preview.regular}h</span></span>
                    {preview.overtime > 0 && <span className="text-[#8A95A5]">Extra: <span className="text-[#FF6B35] font-medium">{preview.overtime}h</span></span>}
                  </div>
                ) : null
              })()}
              <div>
                <label className="text-xs text-[#8A95A5] mb-1 block">Observaciones</label>
                <input form="log-form" value={logForm.notes} onChange={e => setLogForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones…" className="w-full bg-[#0F1923] border border-[#27384A] rounded px-2 py-1.5 text-sm text-[#F0EDE8] placeholder-[#8A95A5] focus:outline-none focus:border-[#FF6B35]" />
              </div>
            </div>
            <form id="log-form" onSubmit={e => { e.preventDefault(); saveLog() }} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button type="button" onClick={() => { setShowLogForm(false); setLogError('') }} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">Cancelar</button>
              <button type="submit" disabled={savingLog} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {savingLog ? 'Guardando…' : 'Guardar jornada'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Worker Form Modal ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg flex flex-col" style={{ maxHeight: '90dvh' }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h2 className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>{editing ? 'Editar trabajador' : 'Nuevo trabajador'}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <AvatarDropzone currentUrl={dropzoneUrl} firstName={form.first_name} lastName={form.last_name} onFile={(file, preview) => { setAvatarFile(file); setAvatarPreview(preview) }} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Nombre *</label>
                  <input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Apellidos *</label>
                  <input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">DPI</label>
                  <input value={form.dpi} onChange={e => setForm(f => ({ ...f, dpi: e.target.value }))} placeholder="0000 00000 0000" className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Teléfono</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="5555-5555" className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Contacto emergencia</label>
                  <input value={form.emergency_contact_name} onChange={e => setForm(f => ({ ...f, emergency_contact_name: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Teléfono emergencia</label>
                  <input value={form.emergency_contact_phone} onChange={e => setForm(f => ({ ...f, emergency_contact_phone: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Cargo</label>
                  <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value as WorkerPosition }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]">
                    {POSITION_OPTIONS.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Tarifa diaria (GTQ) *</label>
                  <input type="number" min="0" step="0.01" value={form.daily_rate_gtq} onChange={e => setForm(f => ({ ...f, daily_rate_gtq: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Fecha de ingreso</label>
                  <input type="date" value={form.hire_date} onChange={e => setForm(f => ({ ...f, hire_date: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]" />
                </div>
                <div>
                  <label className="text-xs text-[#8A95A5] mb-1 block">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as WorkerStatus }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]">
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#8A95A5] mb-1 block">Proyecto actual</label>
                <select value={form.current_project} onChange={e => setForm(f => ({ ...f, current_project: e.target.value }))} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]">
                  <option value="">Sin asignar</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#8A95A5] mb-1 block">Notas</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full bg-[#0F1923] border border-[#27384A] rounded px-3 py-2 text-sm text-[#F0EDE8] placeholder-[#8A95A5] focus:outline-none focus:border-[#FF6B35] resize-none" />
              </div>
              {formError && (
                <div className="flex items-center gap-2 text-red-400 text-xs"><AlertCircle size={13} />{formError}</div>
              )}
            </div>
            <div className="flex gap-3 px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-[#8A95A5] hover:text-[#F0EDE8] text-sm border border-[#27384A] rounded-lg hover:bg-[#27384A] transition-colors">Cancelar</button>
              <button onClick={saveWorker} disabled={saving} className="flex-1 bg-[#FF6B35] hover:bg-[#E55A25] text-white text-sm py-2 rounded-lg transition-colors disabled:opacity-50">
                {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear trabajador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
