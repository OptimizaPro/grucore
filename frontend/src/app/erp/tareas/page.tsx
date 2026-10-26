'use client'

import { useState, useEffect } from 'react'
import { Menu, Loader2, AlertCircle, Calendar, Users, CheckSquare, Plus, ChevronRight, Pencil, Trash2, X, LayoutGrid, List } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import Pagination from '@/components/erp/Pagination'
import { getMe, getMyProjects, getTasks, createTask, updateTask, deleteTask, type User, type ProjectList, type Task, type TaskStatus, type TaskPriority } from '@/lib/api'

// ─── Config ───────────────────────────────────────────────────────────────────

const TASKS_PER_PAGE = 15

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: '#8A95A5', medium: '#6B8CFF', high: '#FF6B35', critical: '#f87171', urgent: '#f87171',
}
const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica', urgent: 'Urgente',
}
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  pending:     { label: 'Por hacer',   color: '#8A95A5' },
  in_progress: { label: 'En progreso', color: '#FF6B35' },
  review:      { label: 'En revisión', color: '#6B8CFF' },
  done:        { label: 'Completado',  color: '#4A9E6B' },
  blocked:     { label: 'Bloqueado',   color: '#F59E0B' },
  cancelled:   { label: 'Cancelado',   color: '#4A5568' },
}

type EnrichedTask = Task & { projectId: number; projectName: string }

// ─── Shared action buttons ────────────────────────────────────────────────────

function ActionButtons({
  task, confirmDeleteId, onEdit, onDelete, onConfirmDelete, onCancelDelete,
}: {
  task: EnrichedTask
  confirmDeleteId: number | null
  onEdit: (t: EnrichedTask) => void
  onDelete: (t: EnrichedTask) => void
  onConfirmDelete: (t: EnrichedTask) => void
  onCancelDelete: () => void
}) {
  if (confirmDeleteId === task.id) {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] text-red-400">¿Eliminar?</span>
        <button onClick={onCancelDelete} className="text-[10px] px-2 py-0.5 rounded border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
        <button onClick={() => onConfirmDelete(task)} className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors">Sí</button>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <button
        onClick={() => onEdit(task)}
        className="p-1.5 rounded text-[#4A5568] hover:text-[#6B8CFF] hover:bg-[#6B8CFF]/10 transition-colors"
        title="Editar"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={() => onDelete(task)}
        className="p-1.5 rounded text-[#4A5568] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title="Eliminar"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── List row ─────────────────────────────────────────────────────────────────

function TaskListRow({
  task, confirmDeleteId, onStatusChange, onEdit, onDelete, onConfirmDelete, onCancelDelete,
}: {
  task: EnrichedTask
  confirmDeleteId: number | null
  onStatusChange: (task: EnrichedTask, newStatus: TaskStatus) => void
  onEdit: (t: EnrichedTask) => void
  onDelete: (t: EnrichedTask) => void
  onConfirmDelete: (t: EnrichedTask) => void
  onCancelDelete: () => void
}) {
  const statusCfg = STATUS_CONFIG[task.status]
  const priColor  = PRIORITY_COLOR[task.priority]

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/20 transition-colors">
      {/* Status dot */}
      <button
        onClick={() => {
          const next: TaskStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'pending'
          onStatusChange(task, next)
        }}
        className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors"
        style={{ borderColor: statusCfg.color, background: task.status === 'done' ? statusCfg.color : 'transparent' }}
        title="Cambiar estado"
      />

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-sm', task.status === 'done' ? 'line-through text-[#4A5568]' : 'text-[#F0EDE8]')}>
            {task.title}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${priColor}20`, color: priColor }}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.is_overdue && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">Vencida</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#8A95A5]">
          <a href={`/erp/projects/${task.projectId}`} className="hover:text-[#FF6B35] transition-colors flex items-center gap-1">
            <ChevronRight size={9} />{task.projectName}
          </a>
          {task.phase_name && <span className="text-[#4A5568]">· {task.phase_name}</span>}
          {task.assigned_to_name && <span className="flex items-center gap-1"><Users size={9} />{task.assigned_to_name.split(' ')[0]}</span>}
        </div>
      </div>

      {/* Due date */}
      {task.due_date && (
        <span className={cn('text-[10px] flex items-center gap-1 flex-shrink-0', task.is_overdue ? 'text-red-400' : 'text-[#4A5568]')}>
          <Calendar size={10} />
          {new Date(task.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
        </span>
      )}

      {/* Status chip */}
      <span
        className="text-[9px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 hidden sm:inline-flex"
        style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}
      >
        {statusCfg.label}
      </span>

      <ActionButtons
        task={task}
        confirmDeleteId={confirmDeleteId}
        onEdit={onEdit}
        onDelete={onDelete}
        onConfirmDelete={onConfirmDelete}
        onCancelDelete={onCancelDelete}
      />
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function TaskCard({
  task, confirmDeleteId, onStatusChange, onEdit, onDelete, onConfirmDelete, onCancelDelete,
}: {
  task: EnrichedTask
  confirmDeleteId: number | null
  onStatusChange: (task: EnrichedTask, newStatus: TaskStatus) => void
  onEdit: (t: EnrichedTask) => void
  onDelete: (t: EnrichedTask) => void
  onConfirmDelete: (t: EnrichedTask) => void
  onCancelDelete: () => void
}) {
  const statusCfg = STATUS_CONFIG[task.status]
  const priColor  = PRIORITY_COLOR[task.priority]

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/20 transition-colors">
      {/* Top row: status dot + priority chip + actions */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <button
            onClick={() => {
              const next: TaskStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'pending'
              onStatusChange(task, next)
            }}
            className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors mt-0.5"
            style={{ borderColor: statusCfg.color, background: task.status === 'done' ? statusCfg.color : 'transparent' }}
            title="Cambiar estado"
          />
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: `${priColor}20`, color: priColor }}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.is_overdue && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">Vencida</span>}
        </div>
        <ActionButtons
          task={task}
          confirmDeleteId={confirmDeleteId}
          onEdit={onEdit}
          onDelete={onDelete}
          onConfirmDelete={onConfirmDelete}
          onCancelDelete={onCancelDelete}
        />
      </div>

      {/* Title */}
      <p className={cn('text-sm leading-snug', task.status === 'done' ? 'line-through text-[#4A5568]' : 'text-[#F0EDE8]')}>
        {task.title}
      </p>

      {/* Description snippet */}
      {task.description && (
        <p className="text-[11px] text-[#4A5568] leading-relaxed line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#27384A]/60">
        <a href={`/erp/projects/${task.projectId}`} className="text-[10px] text-[#8A95A5] hover:text-[#FF6B35] transition-colors flex items-center gap-1 truncate">
          <ChevronRight size={9} />{task.projectName}
        </a>
        <div className="flex items-center gap-2 flex-shrink-0">
          {task.due_date && (
            <span className={cn('text-[10px] flex items-center gap-1', task.is_overdue ? 'text-red-400' : 'text-[#4A5568]')}>
              <Calendar size={10} />
              {new Date(task.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
            </span>
          )}
          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${statusCfg.color}15`, color: statusCfg.color }}>
            {statusCfg.label}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TareasPage() {
  const [user, setUser]         = useState<User | null>(null)
  const [projects, setProjects] = useState<ProjectList[]>([])
  const [tasks, setTasks]       = useState<EnrichedTask[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Filters
  const [filterStatus,   setFilterStatus]   = useState<TaskStatus | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [filterProject,  setFilterProject]  = useState<number | 'all'>('all')
  const [taskPage, setTaskPage] = useState(1)

  useEffect(() => { setTaskPage(1) }, [filterStatus, filterPriority, filterProject])

  // CRUD state
  const [showForm,        setShowForm]        = useState(false)
  const [editingTask,     setEditingTask]      = useState<EnrichedTask | null>(null)
  const [confirmDeleteId, setConfirmDeleteId]  = useState<number | null>(null)
  const [formLoading,     setFormLoading]      = useState(false)
  const [formError,       setFormError]        = useState('')

  // Form fields
  const [fProject,  setFProject]  = useState<number | ''>('')
  const [fTitle,    setFTitle]    = useState('')
  const [fPriority, setFPriority] = useState<TaskPriority>('medium')
  const [fStatus,   setFStatus]   = useState<TaskStatus>('pending')
  const [fDueDate,  setFDueDate]  = useState('')
  const [fDesc,     setFDesc]     = useState('')

  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'draft')

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : 'ST'

  useEffect(() => {
    async function load() {
      try {
        const me = await getMe()
        if (me.role === 'client_portal') { window.location.href = '/portal'; return }
        setUser(me)

        const projRes = await getMyProjects()
        const projs   = projRes.results
        setProjects(projs)

        const actProjs  = projs.filter(p => p.status === 'active' || p.status === 'draft')
        const taskLists = await Promise.all(actProjs.map(p => getTasks(p.id).catch(() => [] as Task[])))

        const allTasks = taskLists.flatMap((list, i) =>
          list.map(t => ({ ...t, projectId: actProjs[i].id, projectName: actProjs[i].name }))
        )
        setTasks(allTasks)
      } catch (e: any) {
        if (e.message !== 'Sesión expirada') setError(e.message ?? 'Error al cargar tareas')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function openCreate() {
    setEditingTask(null)
    setFProject(activeProjects[0]?.id ?? '')
    setFTitle('')
    setFPriority('medium')
    setFStatus('pending')
    setFDueDate('')
    setFDesc('')
    setFormError('')
    setShowForm(true)
  }

  function openEdit(task: EnrichedTask) {
    setEditingTask(task)
    setFProject(task.projectId)
    setFTitle(task.title)
    setFPriority(task.priority)
    setFStatus(task.status)
    setFDueDate(task.due_date ?? '')
    setFDesc(task.description ?? '')
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTask(null)
  }

  async function handleSaveTask(e: React.FormEvent) {
    e.preventDefault()
    if (!fProject) { setFormError('Selecciona un proyecto'); return }
    if (!fTitle.trim()) { setFormError('El título es requerido'); return }
    setFormLoading(true)
    setFormError('')
    try {
      const proj = projects.find(p => p.id === fProject)!
      if (editingTask) {
        const updated = await updateTask(editingTask.projectId, editingTask.id, {
          title: fTitle.trim(),
          description: fDesc || undefined,
          priority: fPriority,
          status: fStatus,
          due_date: fDueDate || null,
        })
        setTasks(prev => prev.map(t =>
          t.id === editingTask.id && t.projectId === editingTask.projectId
            ? { ...updated, projectId: editingTask.projectId, projectName: editingTask.projectName }
            : t
        ))
        toast.success('Tarea actualizada')
      } else {
        const created = await createTask(fProject as number, {
          title: fTitle.trim(),
          description: fDesc || undefined,
          priority: fPriority,
          due_date: fDueDate || null,
        })
        setTasks(prev => [{ ...created, projectId: fProject as number, projectName: proj.name }, ...prev])
        toast.success('Tarea creada')
      }
      closeForm()
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleStatusChange(task: EnrichedTask, newStatus: TaskStatus) {
    try {
      const updated = await updateTask(task.projectId, task.id, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === task.id && t.projectId === task.projectId
        ? { ...updated, projectId: task.projectId, projectName: task.projectName }
        : t
      ))
    } catch {}
  }

  async function handleConfirmDelete(task: EnrichedTask) {
    try {
      await deleteTask(task.projectId, task.id)
      setTasks(prev => prev.filter(t => !(t.id === task.id && t.projectId === task.projectId)))
      toast.success('Tarea eliminada')
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar')
    } finally {
      setConfirmDeleteId(null)
    }
  }

  // Stats
  const total      = tasks.length
  const todo       = tasks.filter(t => t.status === 'pending').length
  const inProgress = tasks.filter(t => t.status === 'in_progress').length
  const done       = tasks.filter(t => t.status === 'done').length
  const overdue    = tasks.filter(t => t.is_overdue).length

  // Filtered + sorted
  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all'   && t.status   !== filterStatus)   return false
    if (filterPriority !== 'all' && t.priority  !== filterPriority) return false
    if (filterProject !== 'all'  && t.projectId !== filterProject)  return false
    return true
  }).sort((a, b) => {
    if (a.is_overdue && !b.is_overdue) return -1
    if (!a.is_overdue && b.is_overdue) return 1
    const priorityOrder: Record<TaskPriority, number> = { urgent: 0, critical: 0, high: 1, medium: 2, low: 3 }
    return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
  })

  const paginated = filtered.slice((taskPage - 1) * TASKS_PER_PAGE, taskPage * TASKS_PER_PAGE)

  const sharedRowProps = {
    confirmDeleteId,
    onStatusChange: handleStatusChange,
    onEdit: openEdit,
    onDelete: (t: EnrichedTask) => setConfirmDeleteId(t.id),
    onConfirmDelete: handleConfirmDelete,
    onCancelDelete: () => setConfirmDeleteId(null),
  }

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] placeholder-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'

  if (loading) return (
    <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
        <p className="text-sm text-[#8A95A5]">Cargando tareas…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#131D28] flex">
      <ERPSidebar
        currentPage="tareas"
        userName={user?.full_name}
        userInitials={initials}
        userAvatarUrl={user?.avatar_url}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Tareas
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-xs font-medium transition-colors"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Nueva tarea</span>
          </button>
          <div className="flex items-center gap-2.5">
            <ERPAvatar avatarUrl={user?.avatar_url} initials={initials} size="md" />
            <span className="hidden sm:block text-xs text-[#8A95A5]">{user?.full_name ?? 'Staff'}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle size={16} />{error}
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total',       value: total,      color: '#F0EDE8' },
              { label: 'Por hacer',   value: todo,       color: '#8A95A5' },
              { label: 'En progreso', value: inProgress, color: '#FF6B35' },
              { label: 'Completadas', value: done,       color: '#4A9E6B' },
              { label: 'Vencidas',    value: overdue,    color: '#f87171' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                <p className="text-[10px] text-[#8A95A5] mb-2">{label}</p>
                <p className="text-2xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filters + view toggle */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] text-[#4A5568] uppercase tracking-widest mr-1" style={{ fontFamily: 'Space Mono, monospace' }}>Filtrar:</span>

            {(['all', 'pending', 'in_progress', 'done'] as const).map(s => (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={cn('text-[10px] px-2.5 py-1 rounded-full transition-colors', filterStatus === s ? 'bg-[#FF6B35] text-[#131D28] font-semibold' : 'border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}
              >
                {s === 'all' ? 'Todos' : STATUS_CONFIG[s].label}
              </button>
            ))}

            <div className="w-px h-4 bg-[#27384A]" />

            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map(p => (
              <button key={p}
                onClick={() => setFilterPriority(p)}
                className={cn('text-[10px] px-2.5 py-1 rounded-full transition-colors', filterPriority === p ? 'text-[#131D28] font-semibold' : 'border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}
                style={filterPriority === p ? { background: p === 'all' ? '#FF6B35' : PRIORITY_COLOR[p] } : {}}
              >
                {p === 'all' ? 'Toda prioridad' : PRIORITY_LABEL[p]}
              </button>
            ))}

            {projects.length > 1 && (
              <>
                <div className="w-px h-4 bg-[#27384A]" />
                <select
                  value={filterProject}
                  onChange={e => setFilterProject(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="text-[10px] bg-[#1F2D3A] border border-[#27384A] rounded-full px-2.5 py-1 text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 cursor-pointer"
                >
                  <option value="all">Todos los proyectos</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </>
            )}

            {/* View toggle — pushed to the right */}
            <div className="ml-auto flex items-center gap-1 bg-[#1F2D3A] border border-[#27384A] rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-[#FF6B35] text-white' : 'text-[#4A5568] hover:text-[#8A95A5]')}
                title="Vista lista"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-[#FF6B35] text-white' : 'text-[#4A5568] hover:text-[#8A95A5]')}
                title="Vista tarjetas"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {/* Task list / grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <CheckSquare size={40} className="text-[#27384A]" />
              <p className="text-[#8A95A5] text-sm">
                {tasks.length === 0 ? 'No hay tareas en proyectos activos.' : 'Sin tareas con estos filtros.'}
              </p>
              {tasks.length === 0 && (
                <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-medium hover:bg-[#FF6B35]/90 transition-colors">
                  <Plus size={14} /> Nueva tarea
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-2">
              {paginated.map(task => (
                <TaskListRow key={`${task.projectId}-${task.id}`} task={task} {...sharedRowProps} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map(task => (
                <TaskCard key={`${task.projectId}-${task.id}`} task={task} {...sharedRowProps} />
              ))}
            </div>
          )}

          {filtered.length > TASKS_PER_PAGE && (
            <Pagination
              page={taskPage}
              total={filtered.length}
              perPage={TASKS_PER_PAGE}
              onChange={setTaskPage}
            />
          )}
        </main>
      </div>

      {/* ── Create / Edit modal ─────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeForm}>
          <div
            className="w-full sm:max-w-lg bg-[#1A2530] rounded-t-2xl sm:rounded-xl border border-[#27384A] flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#27384A] flex-shrink-0">
              <h2 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editingTask ? 'Editar tarea' : 'Nueva tarea'}
              </h2>
              <button onClick={closeForm} className="text-[#4A5568] hover:text-[#F0EDE8] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle size={14} />{formError}
                </div>
              )}

              {!editingTask && (
                <div>
                  <label className="block text-[10px] text-[#8A95A5] uppercase tracking-widest mb-1.5">Proyecto *</label>
                  <select form="task-form" value={fProject} onChange={e => setFProject(Number(e.target.value))} required className={inputCls}>
                    <option value="">Seleccionar proyecto</option>
                    {activeProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-[#8A95A5] uppercase tracking-widest mb-1.5">Título *</label>
                <input form="task-form" type="text" value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Nombre de la tarea" required className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#8A95A5] uppercase tracking-widest mb-1.5">Prioridad</label>
                  <select form="task-form" value={fPriority} onChange={e => setFPriority(e.target.value as TaskPriority)} className={inputCls}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#8A95A5] uppercase tracking-widest mb-1.5">Estado</label>
                  <select form="task-form" value={fStatus} onChange={e => setFStatus(e.target.value as TaskStatus)} className={inputCls}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#8A95A5] uppercase tracking-widest mb-1.5">Fecha límite</label>
                <input form="task-form" type="date" value={fDueDate} onChange={e => setFDueDate(e.target.value)} className={cn(inputCls, 'text-[#8A95A5]')} />
              </div>

              <div>
                <label className="block text-[10px] text-[#8A95A5] uppercase tracking-widest mb-1.5">Descripción</label>
                <textarea form="task-form" value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Descripción opcional…" rows={3} className={cn(inputCls, 'resize-none')} />
              </div>
            </div>

            {/* Footer */}
            <form id="task-form" onSubmit={handleSaveTask} className="px-5 py-4 border-t border-[#27384A] flex gap-3 flex-shrink-0">
              <button type="button" onClick={closeForm} className="flex-1 py-2 rounded-lg border border-[#27384A] text-sm text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#4A5568] transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 py-2 rounded-lg bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {formLoading && <Loader2 size={14} className="animate-spin" />}
                {editingTask ? 'Guardar cambios' : 'Crear tarea'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
