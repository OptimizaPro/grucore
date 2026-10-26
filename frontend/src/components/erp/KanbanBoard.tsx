'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Plus, Loader2, AlertCircle, Calendar, Users,
  GripVertical, Trash2, X, ChevronDown, Pencil,
  AlertTriangle, Clock, LayoutGrid, List,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  createTask, updateTask, deleteTask,
  type Task, type TaskStatus, type TaskPriority, type Phase,
} from '@/lib/api'

// ─── Config ───────────────────────────────────────────────────────────────────

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string }[] = [
  { id: 'pending',     label: 'Por hacer',   color: '#8A95A5', bg: 'rgba(138,149,165,0.08)' },
  { id: 'in_progress', label: 'En progreso', color: '#FF6B35', bg: 'rgba(255,107,53,0.08)'  },
  { id: 'review',      label: 'En revisión', color: '#6B8CFF', bg: 'rgba(107,140,255,0.08)' },
  { id: 'done',        label: 'Completado',  color: '#4A9E6B', bg: 'rgba(74,158,107,0.08)'  },
  { id: 'blocked',     label: 'Bloqueado',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
]

const STATUS_LABEL: Record<TaskStatus, string> = {
  pending:     'Por hacer',
  in_progress: 'En progreso',
  review:      'En revisión',
  done:        'Completado',
  blocked:     'Bloqueado',
  cancelled:   'Cancelado',
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending:     '#8A95A5',
  in_progress: '#FF6B35',
  review:      '#6B8CFF',
  done:        '#4A9E6B',
  blocked:     '#F59E0B',
  cancelled:   '#4A5568',
}

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: '#8A95A5', medium: '#6B8CFF', high: '#FF6B35', critical: '#f87171', urgent: '#f87171',
}
const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica', urgent: 'Urgente',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysOverdue(dueDateStr: string): number {
  const due   = new Date(dueDateStr)
  const today = new Date()
  due.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86_400_000))
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditTaskModal({
  task,
  phases,
  projectId,
  onSave,
  onClose,
}: {
  task: Task
  phases: Phase[]
  projectId: number
  onSave: (updated: Task) => void
  onClose: () => void
}) {
  const [title,    setTitle]    = useState(task.title)
  const [desc,     setDesc]     = useState(task.description ?? '')
  const [status,   setStatus]   = useState<TaskStatus>(task.status)
  const [priority, setPriority] = useState<TaskPriority>(task.priority)
  const [dueDate,  setDueDate]  = useState(task.due_date ?? '')
  const [phase,    setPhase]    = useState(task.phase ? String(task.phase) : '')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  const inputCls =
    'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] ' +
    'placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const updated = await updateTask(projectId, task.id, {
        title:    title.trim(),
        description: desc.trim(),
        status,
        priority,
        due_date: dueDate || null,
        phase:    phase ? Number(phase) : null,
      })
      onSave(updated)
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#27384A] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
              Editar tarea
            </p>
            <h2 className="text-base font-semibold text-[#F0EDE8] truncate max-w-[360px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {task.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1 rounded-lg hover:bg-[#27384A]">
            <X size={17} />
          </button>
        </div>

        <form id="edit-task-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <AlertCircle size={13} className="flex-shrink-0" />{error}
            </div>
          )}
          <div>
            <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
            <input required autoFocus value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Título de la tarea" />
          </div>
          <div>
            <label className={labelCls}>Descripción</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className={cn(inputCls, 'resize-none')} placeholder="Detalles, contexto, instrucciones…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Estado</label>
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={cn(inputCls, 'cursor-pointer')}>
                {(Object.keys(STATUS_LABEL) as TaskStatus[]).filter(s => s !== 'cancelled').map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Prioridad</label>
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={cn(inputCls, 'cursor-pointer')}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Fecha límite</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={cn(inputCls, 'cursor-pointer')} />
            </div>
            <div>
              <label className={labelCls}>Fase</label>
              <select value={phase} onChange={e => setPhase(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                <option value="">Sin fase</option>
                {phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
              </select>
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">
            Cancelar
          </button>
          <button form="edit-task-form" type="submit" disabled={saving}
            className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
            {saving ? <><Loader2 size={12} className="animate-spin" /> Guardando…</> : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Task card (Kanban) ───────────────────────────────────────────────────────

function TaskCard({
  task,
  isDragging,
  onDragStart,
  onTouchStart,
  onDelete,
  onEdit,
}: {
  task: Task
  isDragging: boolean
  onDragStart: (e: React.DragEvent, taskId: number) => void
  onTouchStart: (e: React.TouchEvent, taskId: number) => void
  onDelete: (taskId: number) => void
  onEdit: (task: Task) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const priColor = PRIORITY_COLOR[task.priority]
  const overdueDays = task.is_overdue && task.due_date ? daysOverdue(task.due_date) : 0

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onTouchStart={e => onTouchStart(e, task.id)}
      onClick={() => onEdit(task)}
      className={cn(
        'group relative p-3.5 rounded-xl bg-[#1A2530] border border-[#27384A]',
        'cursor-pointer select-none touch-none',
        'hover:border-[#FF6B35]/30 hover:bg-[#1F2D3A] transition-all duration-150',
        isDragging && 'opacity-40 scale-[0.97] border-dashed',
        task.is_overdue && task.status !== 'done' && 'border-red-500/25',
      )}
    >
      <GripVertical size={13} className="absolute top-3 right-3 text-[#27384A] group-hover:text-[#8A95A5] transition-colors cursor-grab active:cursor-grabbing" />

      <div className="flex items-center gap-1.5 mb-2 flex-wrap pr-5">
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: `${priColor}20`, color: priColor }}>
          {PRIORITY_LABEL[task.priority]}
        </span>
        {task.phase_name && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5] truncate max-w-[90px]">
            {task.phase_name}
          </span>
        )}
      </div>

      <p className={cn('text-xs font-medium leading-snug mb-2.5', task.status === 'done' ? 'line-through text-[#8A95A5]' : 'text-[#F0EDE8]')}>
        {task.title}
      </p>

      {task.due_date && (
        <div className="mb-2.5">
          {task.is_overdue && task.status !== 'done' ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={10} className="text-red-400 flex-shrink-0" />
              <span className="text-[10px] text-red-400 font-medium">
                {overdueDays === 0 ? 'Venció hoy' : `${overdueDays} día${overdueDays !== 1 ? 's' : ''} de retraso`}
              </span>
              <span className="text-[9px] text-red-400/60 ml-auto">
                {new Date(task.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[#8A95A5]">
              <Clock size={9} />
              {new Date(task.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      )}

      {task.assigned_to_name && (
        <div className="flex items-center gap-1 text-[9px] text-[#8A95A5] mb-2.5">
          <Users size={9} />
          {task.assigned_to_name.split(' ').slice(0, 2).join(' ')}
        </div>
      )}

      <div className="flex items-center gap-1 pt-2 border-t border-[#27384A]/40" onClick={e => e.stopPropagation()}>
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={() => onEdit(task)}
          className="flex items-center gap-1 text-[9px] text-[#8A95A5] hover:text-[#FF6B35] transition-colors px-1.5 py-0.5 rounded hover:bg-[#FF6B35]/10"
        >
          <Pencil size={9} /> Editar
        </button>

        {confirmDelete ? (
          <>
            <span className="text-[9px] text-[#8A95A5] ml-auto">¿Eliminar?</span>
            <button onPointerDown={e => e.stopPropagation()} onClick={() => setConfirmDelete(false)}
              className="text-[9px] px-1.5 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
              No
            </button>
            <button onPointerDown={e => e.stopPropagation()} onClick={() => onDelete(task.id)}
              className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
              Sí
            </button>
          </>
        ) : (
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => setConfirmDelete(true)}
            className="ml-auto text-[#8A95A5] hover:text-red-400 transition-colors p-0.5 rounded hover:bg-red-500/10"
          >
            <Trash2 size={10} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Task row (List view) ─────────────────────────────────────────────────────

function TaskRow({
  task,
  isLast,
  movingId,
  onEdit,
  onDelete,
  onMove,
}: {
  task: Task
  isLast: boolean
  movingId: number | null
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onMove: (taskId: number, status: TaskStatus) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const overdueDays = task.is_overdue && task.due_date ? daysOverdue(task.due_date) : 0
  const statusColor = STATUS_COLOR[task.status]
  const priColor    = PRIORITY_COLOR[task.priority]

  return (
    <div className={cn(
      'relative flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors cursor-pointer group',
      !isLast && 'border-b border-[#27384A]',
      task.is_overdue && task.status !== 'done' && 'bg-red-500/[0.03]',
    )}
      onClick={() => onEdit(task)}
    >
      {/* Moving overlay */}
      {movingId === task.id && (
        <div className="absolute inset-0 z-10 bg-[#1A2530]/70 flex items-center justify-center rounded">
          <Loader2 size={14} className="animate-spin text-[#FF6B35]" />
        </div>
      )}

      {/* Status dot + quick-change */}
      <div className="relative flex-shrink-0" onClick={e => { e.stopPropagation(); setShowStatusMenu(v => !v) }}>
        <span
          className="w-2.5 h-2.5 rounded-full block cursor-pointer hover:ring-2 ring-offset-1 ring-offset-[#131D28] transition-all"
          style={{ background: statusColor, '--tw-ring-color': statusColor } as React.CSSProperties}
          title="Cambiar estado"
        />
        {showStatusMenu && (
          <div className="absolute left-0 top-5 z-30 w-36 bg-[#1F2D3A] border border-[#27384A] rounded-xl shadow-2xl py-1 overflow-hidden">
            {(Object.keys(STATUS_LABEL) as TaskStatus[]).filter(s => s !== 'cancelled').map(s => (
              <button
                key={s}
                onClick={e => { e.stopPropagation(); onMove(task.id, s); setShowStatusMenu(false) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-1.5 text-[10px] hover:bg-[#27384A] transition-colors text-left',
                  task.status === s ? 'text-[#F0EDE8]' : 'text-[#8A95A5]',
                )}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLOR[s] }} />
                {STATUS_LABEL[s]}
                {task.status === s && <span className="ml-auto text-[#FF6B35]">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <p className={cn(
        'flex-1 text-sm font-medium truncate min-w-0',
        task.status === 'done' ? 'line-through text-[#8A95A5]' : 'text-[#F0EDE8]',
      )}>
        {task.title}
      </p>

      {/* Priority */}
      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 hidden sm:inline"
        style={{ background: `${priColor}20`, color: priColor }}>
        {PRIORITY_LABEL[task.priority]}
      </span>

      {/* Phase */}
      {task.phase_name && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5] flex-shrink-0 hidden md:inline truncate max-w-[100px]">
          {task.phase_name}
        </span>
      )}

      {/* Status label */}
      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 hidden lg:inline"
        style={{ background: `${statusColor}18`, color: statusColor }}>
        {STATUS_LABEL[task.status]}
      </span>

      {/* Due date */}
      {task.due_date ? (
        task.is_overdue && task.status !== 'done' ? (
          <div className="flex items-center gap-1 flex-shrink-0 hidden sm:flex">
            <AlertTriangle size={9} className="text-red-400" />
            <span className="text-[9px] text-red-400 font-medium">
              {overdueDays === 0 ? 'Hoy' : `${overdueDays}d`}
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-1 text-[9px] text-[#8A95A5] flex-shrink-0 hidden sm:flex">
            <Calendar size={9} />
            {new Date(task.due_date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
          </span>
        )
      ) : (
        <span className="w-[52px] hidden sm:block" />
      )}

      {/* Assignee */}
      {task.assigned_to_name ? (
        <span className="flex items-center gap-1 text-[9px] text-[#8A95A5] flex-shrink-0 hidden md:flex">
          <Users size={9} />
          {task.assigned_to_name.split(' ')[0]}
        </span>
      ) : (
        <span className="w-[52px] hidden md:block" />
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-all duration-200"
          title="Editar"
        >
          <Pencil size={11} className="transition-all duration-200 hover:-rotate-12" />
        </button>
        {confirmDelete ? (
          <>
            <button onClick={() => setConfirmDelete(false)} className="text-[9px] px-1.5 py-0.5 rounded text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
            <button onClick={() => onDelete(task.id)} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">Sí</button>
          </>
        ) : (
          <button onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            title="Eliminar">
            <Trash2 size={11} className="transition-all duration-200 hover:rotate-12" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface KanbanBoardProps {
  projectId: number
  tasks: Task[]
  phases: Phase[]
  onTasksChange: (tasks: Task[]) => void
}

export default function KanbanBoard({ projectId, tasks, phases, onTasksChange }: KanbanBoardProps) {

  // ── View mode ──────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  // ── Mouse drag ─────────────────────────────────────────────────────────────
  const mouseDraggedIdRef = useRef<number | null>(null)
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null)
  const [draggingId,  setDraggingId]  = useState<number | null>(null)
  const [movingId,    setMovingId]    = useState<number | null>(null)

  // ── Touch drag ─────────────────────────────────────────────────────────────
  const touchGhostRef  = useRef<HTMLDivElement | null>(null)
  const touchDragIdRef = useRef<number | null>(null)
  const touchOffsetRef = useRef({ x: 0, y: 0 })
  const tasksRef       = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  // ── Edit modal ─────────────────────────────────────────────────────────────
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // ── Create form ────────────────────────────────────────────────────────────
  const [showForm,     setShowForm]     = useState(false)
  const [formTitle,    setFormTitle]    = useState('')
  const [formDesc,     setFormDesc]     = useState('')
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium')
  const [formDue,      setFormDue]      = useState('')
  const [formPhase,    setFormPhase]    = useState('')
  const [saving,       setSaving]       = useState(false)
  const [formError,    setFormError]    = useState('')
  const [showCancelled,setShowCancelled]= useState(false)

  // ── Shared move ────────────────────────────────────────────────────────────

  async function performMove(taskId: number, newStatus: TaskStatus) {
    const snapshot = tasksRef.current
    const task     = snapshot.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    onTasksChange(snapshot.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    setMovingId(taskId)
    try {
      const updated = await updateTask(projectId, taskId, { status: newStatus })
      onTasksChange(tasksRef.current.map(t => t.id === taskId ? updated : t))
    } catch {
      onTasksChange(tasksRef.current.map(t => t.id === taskId ? task : t))
    } finally {
      setMovingId(null)
    }
  }

  // ── Mouse drag handlers ────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, taskId: number) {
    mouseDraggedIdRef.current = taskId
    setDraggingId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragEnd() {
    mouseDraggedIdRef.current = null
    setDraggingId(null)
    setDragOverCol(null)
  }

  function handleDragOver(e: React.DragEvent, colId: TaskStatus) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverCol(null)
    }
  }

  async function handleDrop(e: React.DragEvent, newStatus: TaskStatus) {
    e.preventDefault()
    setDragOverCol(null)
    setDraggingId(null)
    const taskId = mouseDraggedIdRef.current
    mouseDraggedIdRef.current = null
    if (taskId) performMove(taskId, newStatus)
  }

  // ── Touch drag handlers ────────────────────────────────────────────────────

  function handleTouchStart(e: React.TouchEvent, taskId: number) {
    if ((e.target as HTMLElement).closest('button')) return

    const touch  = e.touches[0]
    const cardEl = e.currentTarget as HTMLElement
    const rect   = cardEl.getBoundingClientRect()

    touchOffsetRef.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    touchDragIdRef.current = taskId

    const ghost = cardEl.cloneNode(true) as HTMLDivElement
    Object.assign(ghost.style, {
      position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`,
      width: `${rect.width}px`, opacity: '0.88', pointerEvents: 'none',
      zIndex: '9999', transform: 'scale(1.05) rotate(1.5deg)',
      boxShadow: '0 24px 48px rgba(0,0,0,0.55)', borderRadius: '12px',
      transition: 'none', willChange: 'transform, left, top',
    })
    document.body.appendChild(ghost)
    touchGhostRef.current = ghost
    setDraggingId(taskId)
  }

  useEffect(() => {
    function getColAt(x: number, y: number): TaskStatus | null {
      const ghost = touchGhostRef.current
      if (ghost) ghost.style.visibility = 'hidden'
      const el = document.elementFromPoint(x, y)
      if (ghost) ghost.style.visibility = ''
      return (el?.closest('[data-col]')?.getAttribute('data-col') ?? null) as TaskStatus | null
    }

    function onTouchMove(e: TouchEvent) {
      if (!touchDragIdRef.current || !touchGhostRef.current) return
      e.preventDefault()
      const touch  = e.touches[0]
      const ghost  = touchGhostRef.current
      const offset = touchOffsetRef.current
      ghost.style.left = `${touch.clientX - offset.x}px`
      ghost.style.top  = `${touch.clientY - offset.y}px`
      setDragOverCol(getColAt(touch.clientX, touch.clientY))
    }

    function onTouchEnd(e: TouchEvent) {
      if (!touchDragIdRef.current) return
      const touch  = e.changedTouches[0]
      const taskId = touchDragIdRef.current
      const colId  = getColAt(touch.clientX, touch.clientY)
      touchGhostRef.current?.remove()
      touchGhostRef.current  = null
      touchDragIdRef.current = null
      setDraggingId(null)
      setDragOverCol(null)
      if (colId && taskId) performMove(taskId, colId)
    }

    function onTouchCancel() {
      touchGhostRef.current?.remove()
      touchGhostRef.current  = null
      touchDragIdRef.current = null
      setDraggingId(null)
      setDragOverCol(null)
    }

    document.addEventListener('touchmove',   onTouchMove,   { passive: false })
    document.addEventListener('touchend',    onTouchEnd)
    document.addEventListener('touchcancel', onTouchCancel)
    return () => {
      document.removeEventListener('touchmove',   onTouchMove)
      document.removeEventListener('touchend',    onTouchEnd)
      document.removeEventListener('touchcancel', onTouchCancel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async function handleDelete(taskId: number) {
    try {
      await deleteTask(projectId, taskId)
      onTasksChange(tasks.filter(t => t.id !== taskId))
    } catch {}
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) return
    setSaving(true); setFormError('')
    try {
      const t = await createTask(projectId, {
        title: formTitle.trim(), description: formDesc.trim() || undefined,
        priority: formPriority, due_date: formDue || null,
        phase: formPhase ? Number(formPhase) : null,
      })
      onTasksChange([t, ...tasks])
      setFormTitle(''); setFormDesc(''); setFormPriority('medium')
      setFormDue(''); setFormPhase(''); setShowForm(false)
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Error al crear tarea')
    } finally {
      setSaving(false)
    }
  }

  function handleEditSave(updated: Task) {
    onTasksChange(tasks.map(t => t.id === updated.id ? updated : t))
    setEditingTask(null)
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const inputCls =
    'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] ' +
    'placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  const activeTasks    = tasks.filter(t => t.status !== 'cancelled')
  const doneTasks      = tasks.filter(t => t.status === 'done')
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled')
  const overdueTasks   = tasks.filter(t => t.is_overdue && t.status !== 'done' && t.status !== 'cancelled')
  const blockedTasks   = tasks.filter(t => t.status === 'blocked')

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Edit modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          phases={phases}
          projectId={projectId}
          onSave={handleEditSave}
          onClose={() => setEditingTask(null)}
        />
      )}

      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Tareas
            </h2>
            <p className="text-xs text-[#8A95A5] mt-0.5">
              {activeTasks.length} tarea{activeTasks.length !== 1 ? 's' : ''} · {doneTasks.length} completadas
              {overdueTasks.length > 0 && (
                <span className="ml-2 text-red-400 font-medium">
                  · {overdueTasks.length} vencida{overdueTasks.length !== 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex items-center gap-0.5 p-0.5 bg-[#131D28] border border-[#27384A] rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                title="Vista lista"
              >
                <List size={13} />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn('p-1.5 rounded-md transition-colors', viewMode === 'kanban' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                title="Vista kanban"
              >
                <LayoutGrid size={13} />
              </button>
            </div>

            {/* New task button */}
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
            >
              {showForm ? <X size={13} /> : <Plus size={13} />}
              {showForm ? 'Cancelar' : 'Nueva tarea'}
            </button>
          </div>
        </div>

        {/* ── Stats bar ── */}
        {activeTasks.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'En progreso', value: tasks.filter(t => t.status === 'in_progress').length, color: '#FF6B35' },
              { label: 'En revisión', value: tasks.filter(t => t.status === 'review').length,       color: '#6B8CFF' },
              { label: 'Vencidas',    value: overdueTasks.length,                                   color: '#f87171' },
              { label: 'Bloqueadas',  value: blockedTasks.length,                                   color: '#F59E0B' },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-3 py-2 rounded-lg bg-[#1F2D3A] border border-[#27384A] flex items-center gap-2">
                <span className="text-base font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>
                  {value}
                </span>
                <span className="text-[10px] text-[#8A95A5] leading-tight">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Create form ── */}
        {showForm && (
          <form onSubmit={handleCreate} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#FF6B35]/30 space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertCircle size={13} className="flex-shrink-0" />{formError}
              </div>
            )}
            <div>
              <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
              <input required autoFocus value={formTitle} onChange={e => setFormTitle(e.target.value)}
                className={inputCls} placeholder="Ej. Confirmar proveedor de concreto" />
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)}
                rows={2} className={cn(inputCls, 'resize-none')} placeholder="Detalles opcionales…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Prioridad</label>
                <select value={formPriority} onChange={e => setFormPriority(e.target.value as TaskPriority)}
                  className={cn(inputCls, 'cursor-pointer')}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Fecha límite</label>
                <input type="date" value={formDue} onChange={e => setFormDue(e.target.value)}
                  className={cn(inputCls, 'cursor-pointer')} />
              </div>
              <div>
                <label className={labelCls}>Fase</label>
                <select value={formPhase} onChange={e => setFormPhase(e.target.value)}
                  className={cn(inputCls, 'cursor-pointer')}>
                  <option value="">Sin fase</option>
                  {phases.map(ph => <option key={ph.id} value={ph.id}>{ph.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-[#27384A] text-xs text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-1.5">
                {saving ? <><Loader2 size={12} className="animate-spin" /> Creando…</> : <><Plus size={12} /> Crear</>}
              </button>
            </div>
          </form>
        )}

        {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
        {viewMode === 'list' && (
          <div className="rounded-xl border border-[#27384A] overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#131D28] border-b border-[#27384A]">
              <span className="w-2.5 flex-shrink-0" />
              <span className="flex-1 text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider">Tarea</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden sm:block w-14 text-center">Prioridad</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden md:block w-24 text-center">Fase</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden lg:block w-20 text-center">Estado</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden sm:block w-14 text-center">Fecha</span>
              <span className="text-[10px] font-semibold text-[#8A95A5] uppercase tracking-wider hidden md:block w-16 text-center">Asignado</span>
              <span className="w-16 flex-shrink-0" />
            </div>

            {/* Empty state */}
            {activeTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-[#8A95A5]">Sin tareas activas</p>
                <p className="text-xs text-[#27384A] mt-1">Crea la primera tarea con el botón de arriba</p>
              </div>
            )}

            {/* Rows grouped by status */}
            {COLUMNS.map(col => {
              const colTasks = activeTasks.filter(t => t.status === col.id)
              if (colTasks.length === 0) return null
              return (
                <div key={col.id}>
                  {/* Group header */}
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1A2530]/60 border-b border-[#27384A]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
                    <span className="text-[10px] font-semibold" style={{ color: col.color }}>{col.label}</span>
                    <span className="text-[9px] text-[#8A95A5] ml-1">{colTasks.length}</span>
                  </div>
                  {colTasks.map((task, i) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isLast={i === colTasks.length - 1}
                      movingId={movingId}
                      onEdit={setEditingTask}
                      onDelete={handleDelete}
                      onMove={performMove}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* ── KANBAN VIEW ───────────────────────────────────────────────────── */}
        {viewMode === 'kanban' && (
          <div className="overflow-x-auto -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(5, minmax(190px, 1fr))', minHeight: 320 }}
            >
              {COLUMNS.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id)
                const isOver   = dragOverCol === col.id

                return (
                  <div
                    key={col.id}
                    data-col={col.id}
                    onDragOver={e => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, col.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'flex flex-col gap-2 rounded-xl p-2.5 min-h-[320px] transition-all duration-150',
                      isOver && 'scale-[1.015]',
                    )}
                    style={{
                      background:    isOver ? col.bg : 'rgba(31,45,58,0.45)',
                      outline:       isOver ? `2px solid ${col.color}` : '2px solid transparent',
                      outlineOffset: '0px',
                    }}
                  >
                    <div className="flex items-center gap-2 px-0.5 mb-1 flex-shrink-0">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
                      <span className="text-[11px] font-semibold text-[#F0EDE8] truncate flex-1">{col.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5] flex-shrink-0"
                        style={{ fontFamily: 'Space Mono, monospace' }}>
                        {colTasks.length}
                      </span>
                    </div>

                    {isOver && colTasks.length === 0 && (
                      <div className="flex-1 rounded-lg border-2 border-dashed flex items-center justify-center"
                        style={{ borderColor: col.color, minHeight: 60 }}>
                        <span className="text-[10px]" style={{ color: col.color }}>Soltar aquí</span>
                      </div>
                    )}

                    {!isOver && colTasks.length === 0 && (
                      <div className="flex-1 rounded-lg border border-dashed border-[#27384A]/60 flex items-center justify-center min-h-[60px]">
                        <span className="text-[10px] text-[#8A95A5]">Sin tareas</span>
                      </div>
                    )}

                    <div className="space-y-2 flex-1">
                      {colTasks.map(task => (
                        <div key={task.id} className="relative">
                          {movingId === task.id && (
                            <div className="absolute inset-0 z-10 rounded-xl bg-[#1A2530]/60 flex items-center justify-center">
                              <Loader2 size={14} className="animate-spin text-[#FF6B35]" />
                            </div>
                          )}
                          <TaskCard
                            task={task}
                            isDragging={draggingId === task.id}
                            onDragStart={handleDragStart}
                            onTouchStart={handleTouchStart}
                            onDelete={handleDelete}
                            onEdit={setEditingTask}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Cancelled tasks ── */}
        {cancelledTasks.length > 0 && (
          <div>
            <button onClick={() => setShowCancelled(v => !v)}
              className="flex items-center gap-2 text-xs text-[#8A95A5] hover:text-[#8A95A5] transition-colors">
              <ChevronDown size={14} className={cn('transition-transform', showCancelled && 'rotate-180')} />
              {cancelledTasks.length} tarea{cancelledTasks.length !== 1 ? 's' : ''} cancelada{cancelledTasks.length !== 1 ? 's' : ''}
            </button>
            {showCancelled && (
              <div className="mt-3 space-y-2">
                {cancelledTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#1A2530] border border-[#27384A]/40 opacity-50">
                    <span className="text-xs line-through text-[#8A95A5] flex-1">{task.title}</span>
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
