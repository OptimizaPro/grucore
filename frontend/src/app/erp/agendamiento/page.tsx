'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Menu, Plus, X, Loader2, AlertCircle, Calendar, Clock, MapPin,
  CheckCircle2, XCircle, Users, ChevronRight, Filter,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getMe, getMyProjects, getLeads,
  getEvents, cancelEvent, completeEvent,
  type User, type ProjectList, type Lead, type CalendarEvent, type ClientApproval,
} from '@/lib/api'

// ─── Config ───────────────────────────────────────────────────────────────────

const APPROVAL_CONFIG: Record<ClientApproval, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pendiente',          color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  approved: { label: 'Confirmado cliente', color: '#4A9E6B', bg: 'rgba(74,158,107,0.12)' },
  rejected: { label: 'Rechazado cliente',  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}

// ─── Meeting card ─────────────────────────────────────────────────────────────

function MeetingCard({
  event,
  onCancel,
  onComplete,
}: {
  event: CalendarEvent
  onCancel: (id: number) => void
  onComplete: (id: number) => void
}) {
  const approval = APPROVAL_CONFIG[event.client_approval]
  const isPast   = new Date(event.end_datetime) < new Date()
  const isCancelled = event.status === 'cancelled'
  const isCompleted = event.status === 'completed'

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={cn(
      'bg-[#1F2D3A] border rounded-xl p-4 transition-colors flex flex-col',
      isCancelled ? 'border-[#27384A] opacity-60' : 'border-[#27384A] hover:border-[#FF6B35]/30',
    )}>
      <div className="flex items-start gap-3">
        {/* Date block */}
        <div className="flex-shrink-0 w-14 text-center">
          <p className="text-2xl font-bold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
            {new Date(event.start_datetime).getDate()}
          </p>
          <p className="text-[10px] text-[#8A95A5] uppercase tracking-wider">
            {new Date(event.start_datetime).toLocaleString('es-GT', { month: 'short' })}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold text-[#F0EDE8] leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {event.title}
            </h3>
            {/* Approval badge */}
            <span
              className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: approval.bg, color: approval.color }}
            >
              {approval.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8A95A5] mb-3">
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {fmtTime(event.start_datetime)} – {fmtTime(event.end_datetime)}
            </span>
            {event.location && (
              <span className="flex items-center gap-1 truncate max-w-xs">
                <MapPin size={11} />
                {event.location}
              </span>
            )}
            {event.project_name && (
              <span className="flex items-center gap-1">
                <Users size={11} />
                {event.project_name}
              </span>
            )}
            {event.lead_name && !event.project_name && (
              <span className="flex items-center gap-1">
                <Users size={11} />
                {event.lead_name} (lead)
              </span>
            )}
          </div>

          {event.client_notes && (
            <div className="p-2.5 rounded-lg bg-[#131D28] border border-[#27384A] mb-3">
              <p className="text-[11px] text-[#8A95A5] italic">"{event.client_notes}"</p>
            </div>
          )}

          {/* Actions */}
          {!isCancelled && !isCompleted && (
            <div className="flex gap-2">
              {!isPast ? (
                <button
                  onClick={() => onCancel(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#3D5166] text-[#8A95A5] rounded-lg hover:border-red-500/40 hover:text-red-400 transition-colors"
                >
                  <XCircle size={12} /> Cancelar
                </button>
              ) : (
                <button
                  onClick={() => onComplete(event.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#4A9E6B]/15 text-[#4A9E6B] rounded-lg hover:bg-[#4A9E6B]/25 transition-colors"
                >
                  <CheckCircle2 size={12} /> Marcar completado
                </button>
              )}
              <a
                href="/erp/calendario"
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#3D5166] text-[#8A95A5] rounded-lg hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"
              >
                Ver en calendario <ChevronRight size={11} />
              </a>
            </div>
          )}

          {isCancelled && (
            <span className="text-[11px] text-red-400">Evento cancelado</span>
          )}
          {isCompleted && (
            <span className="text-[11px] text-[#4A9E6B] flex items-center gap-1">
              <CheckCircle2 size={11} /> Completado
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

export default function AgendamientoPage() {
  const [user, setUser]               = useState<User | null>(null)
  const [events, setEvents]           = useState<CalendarEvent[]>([])
  const [loading, setLoading]         = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterTab, setFilterTab]     = useState<FilterTab>('all')

  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'ST' : 'ST'

  const load = useCallback(async () => {
    try {
      const [me, evts] = await Promise.all([
        getMe(),
        getEvents({ is_client_meeting: true }),
      ])
      setUser(me)
      setEvents(evts)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCancel(id: number) {
    try {
      await cancelEvent(id)
      toast.success('Reunión cancelada')
      load()
    } catch { toast.error('No se pudo cancelar') }
  }

  async function handleComplete(id: number) {
    try {
      await completeEvent(id)
      toast.success('Reunión marcada como completada')
      load()
    } catch { toast.error('No se pudo completar') }
  }

  const filtered = events.filter(e => {
    if (filterTab === 'all') return true
    return e.client_approval === filterTab
  })

  const counts = {
    all:      events.length,
    pending:  events.filter(e => e.client_approval === 'pending').length,
    approved: events.filter(e => e.client_approval === 'approved').length,
    rejected: events.filter(e => e.client_approval === 'rejected').length,
  }

  const TABS: { key: FilterTab; label: string; color?: string }[] = [
    { key: 'all',      label: 'Todas' },
    { key: 'pending',  label: 'Pendientes',  color: '#F59E0B' },
    { key: 'approved', label: 'Confirmadas', color: '#4A9E6B' },
    { key: 'rejected', label: 'Rechazadas',  color: '#f87171' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#131D28] flex">
      <ERPSidebar
        currentPage="agendamiento"
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
            Agendamiento
          </p>
          <a
            href="/erp/calendario"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#27384A] text-[#8A95A5] text-xs hover:text-[#F0EDE8] hover:border-[#FF6B35]/40 transition-colors"
          >
            <Calendar size={13} /> Ver calendario
          </a>
          <ERPAvatar avatarUrl={user?.avatar_url} initials={initials} size="md" />
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#F0EDE8] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Reuniones con clientes
            </h1>
            <p className="text-sm text-[#8A95A5]">
              Gestiona las reuniones programadas con clientes y su estado de confirmación.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {TABS.map(t => (
              <div key={t.key} className="p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                <p className="text-[10px] text-[#8A95A5] mb-2">{t.label}</p>
                <p className="text-2xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color: t.color ?? '#F0EDE8' }}>
                  {counts[t.key]}
                </p>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-5 border-b border-[#27384A] pb-0">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setFilterTab(t.key)}
                className={cn(
                  'px-4 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px',
                  filterTab === t.key
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-[#8A95A5] hover:text-[#F0EDE8]',
                )}
              >
                {t.label}
                {counts[t.key] > 0 && (
                  <span className={cn(
                    'ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]',
                    filterTab === t.key ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'bg-[#27384A] text-[#8A95A5]',
                  )}>
                    {counts[t.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Calendar size={36} className="text-[#27384A]" />
              <p className="text-sm text-[#8A95A5]">
                {filterTab === 'all' ? 'No hay reuniones con clientes programadas.' : `No hay reuniones ${TABS.find(t => t.key === filterTab)?.label.toLowerCase()}.`}
              </p>
              <a
                href="/erp/calendario"
                className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
              >
                <Plus size={14} /> Crear desde calendario
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered
                .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
                .map(e => (
                  <MeetingCard key={e.id} event={e} onCancel={handleCancel} onComplete={handleComplete} />
                ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
