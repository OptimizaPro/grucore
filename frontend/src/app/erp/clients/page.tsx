'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Menu, Search, Building2, Mail, Phone, Hash, MapPin,
  AlertCircle, Loader2, Pencil, Trash2, X, Check,
  ChevronRight, Globe, Users, FolderOpen, LayoutGrid, List,
  Upload, ImagePlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import Pagination from '@/components/erp/Pagination'
import {
  getMe, getClients, getMyProjects, createClient, updateClient, deleteClient, uploadClientAvatar,
  type User, type ClientListItem, type ClientPayload, type ProjectList,
} from '@/lib/api'

const CLIENTS_PER_PAGE = 12

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number) {
  const n = Number(val)
  if (!n) return '—'
  return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 0 })}`
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

const STATUS_CHIP: Record<string, { label: string; cls: string }> = {
  active:    { label: 'Activo',     cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
  completed: { label: 'Completado', cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
  paused:    { label: 'En pausa',   cls: 'bg-amber-500/15 text-amber-400' },
  draft:     { label: 'Borrador',   cls: 'bg-[#4A5568]/20 text-[#8A95A5]' },
  cancelled: { label: 'Cancelado',  cls: 'bg-red-500/15   text-red-400' },
}

// ─── Modal crear / editar cliente ─────────────────────────────────────────────

const EMPTY_FORM: ClientPayload = { name: '', company: '', email: '', phone: '', nit: '', address: '' }

function ClientModal({
  client,
  onClose,
  onSaved,
}: {
  client: ClientListItem | null
  onClose: () => void
  onSaved: (c: ClientListItem) => void
}) {
  const [form, setForm]         = useState<ClientPayload>(
    client
      ? { name: client.name, company: client.company, email: client.email, phone: client.phone, nit: client.nit, address: client.address }
      : EMPTY_FORM
  )
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [avatarFile, setAvatarFile]     = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(client?.avatar_url ?? null)
  const [dragging, setDragging]         = useState(false)
  const fileInputRef                    = useRef<HTMLInputElement>(null)

  function set(k: keyof ClientPayload, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleAvatarFile(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    setSaving(true)
    setError('')
    try {
      let saved = client
        ? await updateClient(client.id, form)
        : await createClient(form)
      if (avatarFile) {
        saved = await uploadClientAvatar(saved.id, avatarFile)
      }
      onSaved(saved)
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar')
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2.5 text-sm text-[#F0EDE8] placeholder-[#4A5568] focus:outline-none focus:border-[#FF6B35]/50 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'
  const initials = form.name ? getInitials(form.name) : '?'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#27384A] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
              {client ? 'Editar cliente' : 'Nuevo cliente'}
            </p>
            <h2 className="text-base font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {client ? client.name : 'Registrar cliente'}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400 mb-4">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <form id="client-form" onSubmit={handleSubmit} className="space-y-4">

            {/* Avatar drag & drop */}
            <div>
              <label className={labelCls}>Foto / Avatar</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f) }}
              />
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="relative flex-shrink-0">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#FF6B35]/40"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold border-2 border-dashed border-[#27384A]"
                      style={{ background: '#131D28', color: '#4A5568', fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {initials}
                    </div>
                  )}
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1F2D3A] border border-[#27384A] flex items-center justify-center text-[#8A95A5] hover:text-red-400 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Drop zone */}
                <div
                  className={cn(
                    'flex-1 rounded-xl border-2 border-dashed px-4 py-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors',
                    dragging
                      ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                      : 'border-[#27384A] hover:border-[#FF6B35]/50 hover:bg-[#FF6B35]/3'
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,107,53,0.1)' }}>
                    {dragging ? <Upload size={14} className="text-[#FF6B35]" /> : <ImagePlus size={14} className="text-[#FF6B35]" />}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#8A95A5]">
                      {dragging ? 'Suelta la imagen aquí' : 'Arrastra o haz clic para subir'}
                    </p>
                    <p className="text-[10px] text-[#8A95A5] mt-0.5">PNG, JPG, WEBP · máx. 5 MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label className={labelCls}>Nombre <span className="text-red-400">*</span></label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={inputCls}
                placeholder="Nombre completo del cliente"
                autoFocus
              />
            </div>

            {/* Empresa */}
            <div>
              <label className={labelCls}>Empresa</label>
              <input
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                className={inputCls}
                placeholder="Razón social o nombre de empresa"
              />
            </div>

            {/* Email + Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={inputCls}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className={labelCls}>Teléfono</label>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className={inputCls}
                  placeholder="+502 5555-5555"
                />
              </div>
            </div>

            {/* NIT */}
            <div>
              <label className={labelCls}>NIT</label>
              <input
                value={form.nit}
                onChange={(e) => set('nit', e.target.value)}
                className={inputCls}
                placeholder="1234567-8"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className={labelCls}>Dirección</label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                className={cn(inputCls, 'resize-none')}
                placeholder="Ciudad, departamento, Guatemala"
              />
            </div>
          </form>
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
            form="client-form"
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Guardando…</>
            ) : (
              <><Check size={14} /> {client ? 'Guardar cambios' : 'Crear cliente'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm delete ────────────────────────────────────────────────────────────

function DeleteConfirm({
  client,
  onCancel,
  onConfirm,
  loading,
}: {
  client: ClientListItem
  onCancel: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-[#1F2D3A] border border-[#27384A] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Trash2 size={16} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Eliminar cliente
            </p>
            <p className="text-xs text-[#8A95A5] mt-1 leading-relaxed">
              ¿Eliminar a <span className="text-[#F0EDE8] font-medium">{client.name}</span>? Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Client card ──────────────────────────────────────────────────────────────

function ClientCard({
  client,
  projects,
  onEdit,
  onDelete,
}: {
  client: ClientListItem
  projects: ProjectList[]
  onEdit: (c: ClientListItem) => void
  onDelete: (c: ClientListItem) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const activeProjects = projects.filter((p) => p.status === 'active')
  const totalBudget    = projects.reduce((s, p) => s + Number(p.total_budget_gtq), 0)
  const initials       = getInitials(client.name)

  return (
    <div
      className="bg-[#1F2D3A] border border-[#27384A] rounded-xl overflow-hidden hover:border-[#FF6B35]/25 transition-colors"
    >
      {/* Header de la card */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {client.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={client.avatar_url}
                alt={client.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#FF6B35]/30"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
                style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8557)', color: '#131D28', fontFamily: 'Montserrat, sans-serif' }}
              >
                {initials}
              </div>
            )}
            {client.portal_user && (
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#1F2D3A] flex items-center justify-center"
                style={{ background: '#4A9E6B' }}
                title="Tiene acceso al portal"
              >
                <Globe size={8} className="text-white" />
              </div>
            )}
          </div>

          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#F0EDE8] leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {client.name}
            </h3>
            {client.company && (
              <p className="text-xs text-[#8A95A5] mt-0.5 flex items-center gap-1">
                <Building2 size={10} className="flex-shrink-0" />
                {client.company}
              </p>
            )}
            {client.portal_user && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full mt-1.5 bg-[#4A9E6B]/15 text-[#4A9E6B]">
                <Globe size={9} />
                Portal activo
              </span>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(client)}
              className="p-1.5 text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-lg transition-colors"
              title="Editar"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(client)}
              className="p-1.5 text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="mt-4 space-y-1.5">
          {client.email && (
            <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
              <Mail size={11} className="flex-shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
              <Phone size={11} className="flex-shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          {client.nit && (
            <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
              <Hash size={11} className="flex-shrink-0" />
              <span>NIT {client.nit}</span>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-2 text-xs text-[#8A95A5]">
              <MapPin size={11} className="flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{client.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Separador + resumen proyectos */}
      <div className="border-t border-[#27384A] px-5 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-base font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>
                {projects.length}
              </p>
              <p className="text-[10px] text-[#8A95A5]">proyectos</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold" style={{ fontFamily: 'Space Mono, monospace', color: '#FF6B35' }}>
                {activeProjects.length}
              </p>
              <p className="text-[10px] text-[#8A95A5]">activos</p>
            </div>
            {totalBudget > 0 && (
              <div>
                <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {fmtGtq(totalBudget)}
                </p>
                <p className="text-[10px] text-[#8A95A5]">presupuesto total</p>
              </div>
            )}
          </div>
          {projects.length > 0 && (
            <ChevronRight
              size={14}
              className={cn('text-[#8A95A5] group-hover:text-[#FF6B35] transition-all', expanded && 'rotate-90')}
            />
          )}
        </button>

        {/* Lista de proyectos expandida */}
        {expanded && projects.length > 0 && (
          <div className="mt-3 space-y-2 pt-3 border-t border-[#27384A]">
            {projects.map((p) => {
              const chip = STATUS_CHIP[p.status] ?? STATUS_CHIP.draft
              return (
                <Link
                  key={p.id}
                  href={`/erp/projects/${p.id}`}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[#131D28] hover:bg-[#1A2530] hover:border-[#FF6B35]/20 border border-[#27384A] transition-colors group/proj"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F0EDE8] truncate group-hover/proj:text-[#FF6B35] transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${chip.cls}`}>
                        {chip.label}
                      </span>
                      <span className="text-[10px] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
                        {p.progress_percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[11px] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
                      {fmtGtq(p.total_budget_gtq)}
                    </p>
                  </div>
                  <ChevronRight size={12} className="text-[#8A95A5] group-hover/proj:text-[#FF6B35] flex-shrink-0 transition-colors" />
                </Link>
              )
            })}
          </div>
        )}

        {expanded && projects.length === 0 && (
          <p className="mt-3 pt-3 border-t border-[#27384A] text-xs text-[#8A95A5] text-center">
            Sin proyectos registrados
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Clients page ──────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const router = useRouter()

  const [user, setUser]               = useState<User | null>(null)
  const [clients, setClients]         = useState<ClientListItem[]>([])
  const [projects, setProjects]       = useState<ProjectList[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [search, setSearch]           = useState('')
  const [searchInput, setSearchInput] = useState('')
  const searchTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [editingClient, setEditingClient]     = useState<ClientListItem | null | 'new'>('new' as any)
  const [showModal, setShowModal]             = useState(false)
  const [deletingClient, setDeletingClient]   = useState<ClientListItem | null>(null)
  const [deleteLoading, setDeleteLoading]     = useState(false)
  const [viewMode, setViewMode]               = useState<'grid' | 'list'>('grid')
  const [page, setPage]                       = useState(1)

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : 'ST'

  const fetchAll = useCallback(async (q?: string) => {
    try {
      const [me, cl, pr] = await Promise.all([
        getMe(),
        getClients(q),
        getMyProjects(),
      ])
      if (me.role === 'client_portal') { router.push('/portal'); return }
      setUser(me)
      setClients(cl.results)
      setProjects(pr.results)
    } catch (e: any) {
      if (e.message === 'Sesión expirada') return
      setError(e.message ?? 'Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Debounce search
  function handleSearchChange(val: string) {
    setSearchInput(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(val)
      setPage(1)
      fetchAll(val)
    }, 350)
  }

  // Map: clientId → projects
  const projectsByClient = projects.reduce<Record<number, ProjectList[]>>((acc, p) => {
    if (p.client_id != null) {
      acc[p.client_id] = [...(acc[p.client_id] ?? []), p]
    }
    return acc
  }, {})

  // Stats
  const withPortal    = clients.filter((c) => c.portal_user).length
  const activeClients = clients.filter((c) => (projectsByClient[c.id] ?? []).some((p) => p.status === 'active')).length

  // Paginación (front-end sobre los resultados ya filtrados por el backend)
  const pagedClients  = clients.slice((page - 1) * CLIENTS_PER_PAGE, page * CLIENTS_PER_PAGE)

  function openNew() {
    setEditingClient(null)
    setShowModal(true)
  }
  function openEdit(c: ClientListItem) {
    setEditingClient(c)
    setShowModal(true)
  }
  function handleSaved(saved: ClientListItem) {
    setClients((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    setShowModal(false)
  }
  async function handleDelete() {
    if (!deletingClient) return
    setDeleteLoading(true)
    try {
      await deleteClient(deletingClient.id)
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id))
      setDeletingClient(null)
    } catch (e: any) {
      alert(e.message ?? 'Error al eliminar')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm text-[#8A95A5]">{error}</p>
          <button onClick={() => { setLoading(true); fetchAll() }} className="px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Modals */}
      {showModal && (
        <ClientModal
          client={editingClient instanceof Object ? editingClient as ClientListItem : null}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
      {deletingClient && (
        <DeleteConfirm
          client={deletingClient}
          onCancel={() => setDeletingClient(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      <div className="min-h-screen bg-[#131D28] flex">
        <ERPSidebar
          currentPage="clients"
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
              Clientes
            </p>
            <button
              onClick={openNew}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
            >
              <Plus size={13} />
              Nuevo cliente
            </button>
            <div className="flex items-center gap-2.5">
              <ERPAvatar avatarUrl={user?.avatar_url} initials={initials} size="md" />
              <span className="hidden sm:block text-xs text-[#8A95A5]">{user?.full_name ?? 'Staff'}</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total clientes',    value: clients.length,  Icon: Users,       color: '#F0EDE8' },
                { label: 'Con portal activo', value: withPortal,      Icon: Globe,       color: '#4A9E6B' },
                { label: 'Con proy. activos', value: activeClients,   Icon: FolderOpen,  color: '#FF6B35' },
                { label: 'Total proyectos',   value: projects.length, Icon: Building2,   color: '#6B8CFF' },
              ].map(({ label, value, Icon, color }) => (
                <div key={label} className="p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[10px] text-[#8A95A5] leading-tight">{label}</p>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <p className="text-2xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Search + toggle + add (mobile) */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" />
                <input
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Buscar por nombre, empresa o email…"
                  className="w-full bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] placeholder-[#4A5568] focus:outline-none focus:border-[#FF6B35]/40 transition-colors"
                />
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-[#1F2D3A] border border-[#27384A] rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-[#FF6B35] text-white' : 'text-[#8A95A5] hover:text-[#8A95A5]')}
                  title="Vista tarjetas"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-[#FF6B35] text-white' : 'text-[#8A95A5] hover:text-[#8A95A5]')}
                  title="Vista lista"
                >
                  <List size={14} />
                </button>
              </div>

              <button
                onClick={openNew}
                className="sm:hidden flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Content */}
            {clients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1F2D3A] border border-[#27384A] flex items-center justify-center">
                  <Building2 size={28} className="text-[#27384A]" />
                </div>
                <div>
                  <p className="text-[#8A95A5] text-sm mb-1">
                    {search ? 'No hay clientes que coincidan con la búsqueda.' : 'No hay clientes registrados aún.'}
                  </p>
                  {!search && (
                    <p className="text-[#8A95A5] text-xs">Los clientes son la base de cada proyecto.</p>
                  )}
                </div>
                {!search && (
                  <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                  >
                    <Plus size={14} />
                    Crear primer cliente
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
                  {pagedClients.map((c) => (
                    <ClientCard
                      key={c.id}
                      client={c}
                      projects={projectsByClient[c.id] ?? []}
                      onEdit={openEdit}
                      onDelete={setDeletingClient}
                    />
                  ))}
                </div>
                <Pagination page={page} total={clients.length} perPage={CLIENTS_PER_PAGE} onChange={setPage} />
              </>
            ) : (
              <>
                {/* Vista lista */}
                <div className="rounded-xl border border-[#27384A] overflow-hidden mb-4">
                  {/* Header */}
                  <div className="hidden sm:grid grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-4 px-4 py-2.5 bg-[#1A2530] border-b border-[#27384A]">
                    {['Cliente', 'Contacto', 'Proyectos', 'Presupuesto', ''].map((h) => (
                      <p key={h} className="text-[10px] text-[#8A95A5] uppercase tracking-wider font-medium">{h}</p>
                    ))}
                  </div>

                  {pagedClients.map((c, i) => {
                    const cProjects     = projectsByClient[c.id] ?? []
                    const cActive       = cProjects.filter((p) => p.status === 'active').length
                    const cBudget       = cProjects.reduce((s, p) => s + Number(p.total_budget_gtq), 0)
                    const cInitials     = getInitials(c.name)
                    return (
                      <div
                        key={c.id}
                        className={cn(
                          'grid grid-cols-1 sm:grid-cols-[2fr_1.5fr_1fr_1fr_80px] gap-3 sm:gap-4 px-4 py-3.5 items-center hover:bg-[#1A2530] transition-colors',
                          i < pagedClients.length - 1 && 'border-b border-[#27384A]',
                        )}
                      >
                        {/* Nombre */}
                        <div className="flex items-center gap-3 min-w-0">
                          {c.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.avatar_url} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-[#FF6B35]/30 flex-shrink-0" />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8557)', color: '#131D28', fontFamily: 'Montserrat, sans-serif' }}
                            >
                              {cInitials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#F0EDE8] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {c.name}
                            </p>
                            {c.company && (
                              <p className="text-[11px] text-[#8A95A5] truncate">{c.company}</p>
                            )}
                          </div>
                          {c.portal_user && (
                            <span className="hidden lg:inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-[#4A9E6B]/15 text-[#4A9E6B] flex-shrink-0">
                              <Globe size={8} /> Portal
                            </span>
                          )}
                        </div>

                        {/* Contacto */}
                        <div className="space-y-0.5">
                          {c.email && (
                            <p className="text-xs text-[#8A95A5] flex items-center gap-1.5 truncate">
                              <Mail size={10} className="flex-shrink-0" />{c.email}
                            </p>
                          )}
                          {c.phone && (
                            <p className="text-xs text-[#8A95A5] flex items-center gap-1.5">
                              <Phone size={10} className="flex-shrink-0" />{c.phone}
                            </p>
                          )}
                          {!c.email && !c.phone && <p className="text-xs text-[#8A95A5]">—</p>}
                        </div>

                        {/* Proyectos */}
                        <div>
                          <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>
                            {cProjects.length}
                          </p>
                          <p className="text-[10px] text-[#8A95A5]">
                            {cActive > 0 ? <span style={{ color: '#FF6B35' }}>{cActive} activos</span> : 'sin activos'}
                          </p>
                        </div>

                        {/* Presupuesto */}
                        <div>
                          <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>
                            {fmtGtq(cBudget)}
                          </p>
                          <p className="text-[10px] text-[#8A95A5]">acumulado</p>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(c)} className="p-1.5 text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded-lg transition-colors" title="Editar">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeletingClient(c)} className="p-1.5 text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <Pagination page={page} total={clients.length} perPage={CLIENTS_PER_PAGE} onChange={setPage} />
              </>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
