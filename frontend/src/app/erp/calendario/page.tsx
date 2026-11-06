'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {
  Menu, Plus, X, Loader2, AlertCircle, ChevronLeft, ChevronRight,
  MapPin, Users, Calendar as CalendarIcon, Clock, Trash2, CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getMe, getMyProjects, getUsers, getLeads,
  getEvents, createEvent, updateEvent, deleteEvent, cancelEvent, completeEvent,
  type User, type ProjectList, type TeamMember, type Lead,
  type CalendarEvent, type CalendarEventPayload, type EventType, type EventStatus,
} from '@/lib/api'

// ─── Config ───────────────────────────────────────────────────────────────────

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'es': es },
})

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string }> = {
  meeting_client:   { label: 'Reunión cliente',       color: '#FF6B35', bg: 'rgba(255,107,53,0.15)' },
  supplier_visit:   { label: 'Visita proveedor',      color: '#6B8CFF', bg: 'rgba(107,140,255,0.15)' },
  site_inspection:  { label: 'Inspección de obra',    color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  supervisor_visit: { label: 'Visita supervisor',     color: '#4A9E6B', bg: 'rgba(74,158,107,0.15)' },
  call:             { label: 'Llamada',               color: '#8A95A5', bg: 'rgba(138,149,165,0.15)' },
  other:            { label: 'Otro',                  color: '#8A95A5', bg: 'rgba(138,149,165,0.15)' },
}

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string }> = {
  scheduled:  { label: 'Programado',  color: '#8A95A5' },
  confirmed:  { label: 'Confirmado',  color: '#4A9E6B' },
  cancelled:  { label: 'Cancelado',   color: '#f87171' },
  completed:  { label: 'Completado',  color: '#6B8CFF' },
}

// ─── Event Modal ──────────────────────────────────────────────────────────────

interface ModalProps {
  event?: CalendarEvent | null
  defaultStart?: Date
  projects: ProjectList[]
  leads: Lead[]
  teamMembers: TeamMember[]
  onClose: () => void
  onSaved: () => void
}

function EventModal({ event, defaultStart, projects, leads, teamMembers, onClose, onSaved }: ModalProps) {
  const isEdit = !!event

  const toLocalDatetime = (iso: string) =>
    new Date(iso).toISOString().slice(0, 16)

  const defaultEnd = defaultStart ? new Date(defaultStart.getTime() + 60 * 60 * 1000) : new Date()

  const [form, setForm] = useState({
    title:             event?.title ?? '',
    description:       event?.description ?? '',
    event_type:        (event?.event_type ?? 'meeting_client') as EventType,
    location:          event?.location ?? '',
    start_datetime:    event ? toLocalDatetime(event.start_datetime) : (defaultStart ? defaultStart.toISOString().slice(0,16) : new Date().toISOString().slice(0,16)),
    end_datetime:      event ? toLocalDatetime(event.end_datetime) : defaultEnd.toISOString().slice(0,16),
    project:           event?.project ?? (null as number | null),
    lead:              event?.lead ?? (null as number | null),
    attendees:         event?.attendee_ids ?? ([] as number[]),
    is_client_meeting: event?.is_client_meeting ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function toggleAttendee(id: number) {
    set('attendees', form.attendees.includes(id)
      ? form.attendees.filter(a => a !== id)
      : [...form.attendees, id])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('El título es requerido.'); return }
    if (form.end_datetime <= form.start_datetime) { setError('La hora de fin debe ser posterior al inicio.'); return }

    setSaving(true)
    setError('')
    try {
      const payload: CalendarEventPayload = {
        title:             form.title.trim(),
        description:       form.description,
        event_type:        form.event_type,
        location:          form.location,
        start_datetime:    new Date(form.start_datetime).toISOString(),
        end_datetime:      new Date(form.end_datetime).toISOString(),
        project:           form.project,
        lead:              form.lead,
        attendees:         form.attendees,
        is_client_meeting: form.is_client_meeting,
      }
      if (isEdit && event) {
        await updateEvent(event.id, payload)
        toast.success('Evento actualizado')
      } else {
        await createEvent(payload)
        toast.success('Evento creado')
      }
      onSaved()
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar.')
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#27384A] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
              Calendario · {isEdit ? 'Editar' : 'Nuevo'} evento
            </p>
            <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {isEdit ? form.title || 'Editar evento' : 'Nuevo evento'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 mb-5">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}
          <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
              <input required type="text" value={form.title} onChange={e => set('title', e.target.value)}
                className={inputCls} placeholder="Ej. Reunión de seguimiento — Proyecto García" />
            </div>

            {/* Tipo */}
            <div>
              <label className={labelCls}>Tipo de evento</label>
              <select value={form.event_type} onChange={e => set('event_type', e.target.value as EventType)} className={cn(inputCls, 'cursor-pointer')}>
                {Object.entries(EVENT_TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Inicio <span className="text-[#FF6B35]">*</span></label>
                <input type="datetime-local" value={form.start_datetime}
                  onChange={e => set('start_datetime', e.target.value)}
                  className={cn(inputCls, 'cursor-pointer')} />
              </div>
              <div>
                <label className={labelCls}>Fin <span className="text-[#FF6B35]">*</span></label>
                <input type="datetime-local" value={form.end_datetime}
                  onChange={e => set('end_datetime', e.target.value)}
                  className={cn(inputCls, 'cursor-pointer')} />
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <label className={labelCls}>Ubicación / Link</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)}
                className={inputCls} placeholder="Dirección física o enlace de videollamada" />
            </div>

            {/* Proyecto y Lead */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Proyecto</label>
                <select value={form.project ?? ''} onChange={e => set('project', e.target.value ? Number(e.target.value) : null)} className={cn(inputCls, 'cursor-pointer')}>
                  <option value="">Sin proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Lead</label>
                <select value={form.lead ?? ''} onChange={e => set('lead', e.target.value ? Number(e.target.value) : null)} className={cn(inputCls, 'cursor-pointer')}>
                  <option value="">Sin lead</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.full_name}</option>)}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className={labelCls}>Descripción / Notas</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                className={cn(inputCls, 'resize-none')} placeholder="Agenda, temas a tratar…" />
            </div>

            {/* Asistentes */}
            {teamMembers.length > 0 && (
              <div>
                <label className={labelCls}>Asistentes internos</label>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map(m => (
                    <button key={m.id} type="button"
                      onClick={() => toggleAttendee(m.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors',
                        form.attendees.includes(m.id)
                          ? 'bg-[#FF6B35]/15 border-[#FF6B35]/40 text-[#FF6B35]'
                          : 'border-[#27384A] text-[#8A95A5] hover:border-[#FF6B35]/30 hover:text-[#F0EDE8]',
                      )}
                    >
                      <ERPAvatar avatarUrl={m.avatar_url} initials={`${m.first_name[0]}${m.last_name[0]}`} size="sm" />
                      {m.first_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reunión con cliente */}
            <label className="flex items-center gap-3 p-3 rounded-lg bg-[#131D28] border border-[#27384A] cursor-pointer hover:border-[#FF6B35]/30 transition-colors">
              <input type="checkbox" checked={form.is_client_meeting}
                onChange={e => set('is_client_meeting', e.target.checked)}
                className="w-4 h-4 accent-[#FF6B35]" />
              <div>
                <p className="text-sm text-[#F0EDE8]">Reunión con cliente</p>
                <p className="text-xs text-[#8A95A5]">Aparece en el portal del cliente para su confirmación</p>
              </div>
            </label>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end flex-shrink-0">
          <button onClick={onClose}
            className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">
            Cancelar
          </button>
          <button form="event-form" type="submit" disabled={saving}
            className="px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Guardando…</> : (isEdit ? 'Guardar cambios' : 'Crear evento')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Event Detail Popover ─────────────────────────────────────────────────────

function EventDetail({ event, onEdit, onClose, onDelete, onCancel, onComplete }: {
  event: CalendarEvent
  onEdit: () => void
  onClose: () => void
  onDelete: () => void
  onCancel: () => void
  onComplete: () => void
}) {
  const cfg = EVENT_TYPE_CONFIG[event.event_type]
  const sCfg = STATUS_CONFIG[event.status]

  const fmtDt = (iso: string) => new Date(iso).toLocaleString('es-GT', {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-[#1F2D3A] border border-[#27384A] rounded-2xl shadow-2xl">
        {/* Color bar */}
        <div className="h-1.5 rounded-t-2xl" style={{ background: cfg.color }} />
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
              <CalendarIcon size={14} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: cfg.color, fontFamily: 'Space Mono, monospace' }}>{cfg.label}</p>
              <h3 className="text-sm font-semibold text-[#F0EDE8] leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>{event.title}</h3>
            </div>
            <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] flex-shrink-0"><X size={16} /></button>
          </div>

          {/* Meta */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
              <Clock size={12} className="flex-shrink-0" />
              <span>{fmtDt(event.start_datetime)} → {new Date(event.end_datetime).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
                <MapPin size={12} className="flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {(event.project_name || event.lead_name) && (
              <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
                <Users size={12} className="flex-shrink-0" />
                <span>{event.project_name ?? event.lead_name}</span>
              </div>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${sCfg.color}20`, color: sCfg.color }}>
              {sCfg.label}
            </span>
            {event.is_client_meeting && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#FF6B35]/15 text-[#FF6B35]">
                Reunión con cliente · {event.client_approval_display}
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-xs text-[#8A95A5] mb-4 leading-relaxed">{event.description}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              <>
                <button onClick={onEdit}
                  className="flex-1 py-2 text-xs font-medium border border-[#27384A] text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">
                  Editar
                </button>
                <button onClick={onComplete}
                  className="flex-1 py-2 text-xs font-medium bg-[#4A9E6B]/15 text-[#4A9E6B] rounded-lg hover:bg-[#4A9E6B]/25 transition-colors flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} /> Completar
                </button>
                <button onClick={onCancel}
                  className="py-2 px-3 text-xs font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-lg transition-colors">
                  Cancelar
                </button>
              </>
            )}
            <button onClick={onDelete}
              className="py-2 px-3 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const [user, setUser]               = useState<User | null>(null)
  const [events, setEvents]           = useState<CalendarEvent[]>([])
  const [projects, setProjects]       = useState<ProjectList[]>([])
  const [leads, setLeads]             = useState<Lead[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading]         = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [view, setView]               = useState<View>(Views.MONTH)
  const [date, setDate]               = useState(new Date())
  const [showModal, setShowModal]     = useState(false)
  const [editEvent, setEditEvent]     = useState<CalendarEvent | null>(null)
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null)
  const [defaultStart, setDefaultStart] = useState<Date | undefined>()

  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'ST' : 'ST'

  const load = useCallback(async () => {
    try {
      const [me, evts, projs, membrs, ldsRes] = await Promise.all([
        getMe(),
        getEvents(),
        getMyProjects().then(r => r.results),
        getUsers(),
        getLeads(),
      ])
      setUser(me)
      setEvents(evts)
      setProjects(projs)
      setTeamMembers(membrs)
      setLeads(ldsRes)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // Convert events to react-big-calendar format
  const rbcEvents = events
    .filter(e => e.status !== 'cancelled')
    .map(e => ({
      id:    e.id,
      title: e.title,
      start: new Date(e.start_datetime),
      end:   new Date(e.end_datetime),
      resource: e,
    }))

  function eventStyleGetter(evt: typeof rbcEvents[0]) {
    const cfg = EVENT_TYPE_CONFIG[evt.resource.event_type]
    return {
      style: {
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        color: cfg.color,
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 500,
      },
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteEvent(id)
      toast.success('Evento eliminado')
      setDetailEvent(null)
      load()
    } catch { toast.error('No se pudo eliminar') }
  }

  async function handleCancel(id: number) {
    try {
      await cancelEvent(id)
      toast.success('Evento cancelado')
      setDetailEvent(null)
      load()
    } catch { toast.error('No se pudo cancelar') }
  }

  async function handleComplete(id: number) {
    try {
      await completeEvent(id)
      toast.success('Evento completado')
      setDetailEvent(null)
      load()
    } catch { toast.error('No se pudo completar') }
  }

  const monthLabel = date.toLocaleString('es-GT', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
      </div>
    )
  }

  return (
    <>
      {(showModal || editEvent) && (
        <EventModal
          event={editEvent}
          defaultStart={defaultStart}
          projects={projects}
          leads={leads}
          teamMembers={teamMembers}
          onClose={() => { setShowModal(false); setEditEvent(null); setDefaultStart(undefined) }}
          onSaved={() => { setShowModal(false); setEditEvent(null); setDefaultStart(undefined); load() }}
        />
      )}
      {detailEvent && (
        <EventDetail
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onEdit={() => { setEditEvent(detailEvent); setDetailEvent(null) }}
          onDelete={() => handleDelete(detailEvent.id)}
          onCancel={() => handleCancel(detailEvent.id)}
          onComplete={() => handleComplete(detailEvent.id)}
        />
      )}

      <div className="min-h-screen bg-[#131D28] flex">
        <ERPSidebar
          currentPage="calendario"
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
            <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Calendario</p>
            <button onClick={() => { setDefaultStart(new Date()); setShowModal(true) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors">
              <Plus size={13} /> Nuevo evento
            </button>
            <ERPAvatar avatarUrl={user?.avatar_url} initials={initials} size="md" />
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {/* Calendar toolbar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setDate(subMonths(date, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#FF6B35]/40 transition-colors">
                  <ChevronLeft size={15} />
                </button>
                <h2 className="text-base font-semibold text-[#F0EDE8] capitalize w-44 text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {monthLabel}
                </h2>
                <button onClick={() => setDate(addMonths(date, 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#FF6B35]/40 transition-colors">
                  <ChevronRight size={15} />
                </button>
                <button onClick={() => setDate(new Date())}
                  className="px-3 py-1.5 text-xs border border-[#27384A] text-[#8A95A5] rounded-lg hover:border-[#FF6B35]/40 hover:text-[#F0EDE8] transition-colors">
                  Hoy
                </button>
              </div>

              {/* View switcher */}
              <div className="flex gap-1 p-1 bg-[#1A2530] rounded-lg border border-[#27384A]">
                {([Views.MONTH, Views.WEEK, Views.DAY] as View[]).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-md transition-colors capitalize',
                      view === v ? 'bg-[#FF6B35] text-[#131D28] font-semibold' : 'text-[#8A95A5] hover:text-[#F0EDE8]',
                    )}>
                    {{ month: 'Mes', week: 'Semana', day: 'Día' }[v as string]}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-5">
              {Object.entries(EVENT_TYPE_CONFIG).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                  <span className="text-[10px] text-[#8A95A5]">{v.label}</span>
                </div>
              ))}
            </div>

            {/* Calendar */}
            <div className="rounded-xl overflow-hidden border border-[#27384A] erp-calendar">
              <Calendar
                localizer={localizer}
                events={rbcEvents}
                view={view}
                date={date}
                onView={setView}
                onNavigate={setDate}
                culture="es"
                eventPropGetter={eventStyleGetter}
                onSelectEvent={evt => setDetailEvent(evt.resource)}
                onSelectSlot={slotInfo => {
                  setDefaultStart(slotInfo.start)
                  setShowModal(true)
                }}
                selectable
                popup
                style={{ height: 620 }}
                messages={{
                  next: 'Siguiente', back: 'Anterior', today: 'Hoy',
                  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
                  date: 'Fecha', time: 'Hora', event: 'Evento',
                  noEventsInRange: 'Sin eventos en este período.',
                  showMore: total => `+${total} más`,
                }}
              />
            </div>
          </main>
        </div>
      </div>

      {/* Calendar CSS overrides */}
      <style>{`
        .erp-calendar .rbc-calendar { background: transparent; color: #F0EDE8; font-family: inherit; }
        .erp-calendar .rbc-header { background: #1A2530; border-color: #27384A; padding: 10px 4px; color: #8A95A5; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
        .erp-calendar .rbc-month-view, .erp-calendar .rbc-time-view { border-color: #27384A; background: #131D28; }
        .erp-calendar .rbc-day-bg { border-color: #27384A !important; }
        .erp-calendar .rbc-day-bg:hover { background: rgba(255,107,53,0.03); }
        .erp-calendar .rbc-off-range-bg { background: #0f1a24; }
        .erp-calendar .rbc-today { background: rgba(255,107,53,0.05) !important; }
        .erp-calendar .rbc-date-cell { color: #8A95A5; font-size: 12px; padding: 6px 8px; }
        .erp-calendar .rbc-date-cell.rbc-now { color: #FF6B35; font-weight: 700; }
        .erp-calendar .rbc-event { padding: 2px 6px; }
        .erp-calendar .rbc-event:focus { outline: none; }
        .erp-calendar .rbc-event.rbc-selected { box-shadow: 0 0 0 2px #FF6B35; }
        .erp-calendar .rbc-show-more { color: #FF6B35; font-size: 10px; background: transparent; }
        .erp-calendar .rbc-toolbar { display: none; }
        .erp-calendar .rbc-time-slot { border-color: #27384A; color: #4A5568; font-size: 10px; }
        .erp-calendar .rbc-time-gutter { background: #1A2530; }
        .erp-calendar .rbc-current-time-indicator { background: #FF6B35; }
        .erp-calendar .rbc-row-segment .rbc-event-content { font-size: 11px; }
      `}</style>
    </>
  )
}
