'use client'

import { useState, useEffect } from 'react'
import {
  Menu, Users, Plus, X, Loader2, AlertCircle,
  Mail, Phone, Shield, CheckCircle2, XCircle, Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import Pagination from '@/components/erp/Pagination'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getMe, getUsers, createUser, updateUser,
  type User, type TeamMember,
} from '@/lib/api'

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLES = [
  { value: 'admin',           label: 'Administrador',        cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
  { value: 'project_manager', label: 'Director de proyecto', cls: 'bg-blue-500/15 text-blue-400' },
  { value: 'site_supervisor', label: 'Supervisor de obra',   cls: 'bg-purple-500/15 text-purple-400' },
  { value: 'team_member',     label: 'Miembro del equipo',   cls: 'bg-[#27384A] text-[#8A95A5]' },
  { value: 'contractor',      label: 'Contratista externo',  cls: 'bg-amber-500/15 text-amber-400' },
  { value: 'client_portal',   label: 'Portal cliente',       cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]' },
  { value: 'viewer',          label: 'Observador',           cls: 'bg-[#27384A] text-[#8A95A5]' },
]

function getRoleInfo(role: string) {
  return ROLES.find(r => r.value === role) ?? { label: role, cls: 'bg-[#27384A] text-[#8A95A5]' }
}

// ─── Input styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

// ─── Team page ────────────────────────────────────────────────────────────────

const TEAM_PER_PAGE = 12

export default function ERPTeamPage() {
  const [me, setMe]                   = useState<User | null>(null)
  const [members, setMembers]         = useState<TeamMember[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [editMember, setEditMember]   = useState<TeamMember | null>(null)

  // New user form state
  const [fEmail, setFEmail]           = useState('')
  const [fFirstName, setFFirstName]   = useState('')
  const [fLastName, setFLastName]     = useState('')
  const [fRole, setFRole]             = useState('team_member')
  const [fPhone, setFPhone]           = useState('')
  const [fPassword, setFPassword]     = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError]     = useState('')

  // Edit role modal state
  const [editRole, setEditRole]       = useState('')

  const [teamPage, setTeamPage] = useState(1)

  useEffect(() => {
    async function init() {
      try {
        const user = await getMe()
        if (user.role === 'client_portal') { window.location.href = '/portal'; return }
        setMe(user)
        const team = await getUsers()
        setMembers(team)
      } catch (e: any) {
        if (e.message === 'Sesión expirada') return
        setError(e.message ?? 'Error al cargar equipo')
      } finally { setLoading(false) }
    }
    init()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const newMember = await createUser({
        email: fEmail,
        first_name: fFirstName,
        last_name: fLastName,
        role: fRole,
        phone: fPhone,
        password: fPassword,
      })
      setMembers(prev => [newMember, ...prev])
      setShowForm(false)
      setFEmail(''); setFFirstName(''); setFLastName('')
      setFRole('team_member'); setFPhone(''); setFPassword('')
      setFormError('')
      toast.success('Usuario creado')
    } catch (e: any) { setFormError(e.message) }
    finally { setFormLoading(false) }
  }

  async function handleRoleChange(member: TeamMember, newRole: string) {
    try {
      const updated = await updateUser(member.id, { role: newRole })
      setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
      setEditMember(null)
    } catch (e: any) { toast.error(e.message ?? 'Error al actualizar el rol') }
  }

  const initials = me
    ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : 'ST'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
          <p className="text-sm text-[#8A95A5]">Cargando equipo…</p>
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

  const internalMembers = members.filter(m => m.role !== 'client_portal')
  const totalInternal = internalMembers.length
  const totalClients  = members.filter(m => m.role === 'client_portal').length
  const totalActive   = internalMembers.filter(m => m.is_active).length

  const pagedMembers = internalMembers.slice((teamPage - 1) * TEAM_PER_PAGE, teamPage * TEAM_PER_PAGE)

  const stats = [
    { label: 'Total miembros',  value: totalInternal,  color: '#F0EDE8' },
    { label: 'Activos',         value: totalActive,    color: '#FF6B35' },
    { label: 'Clientes portal', value: totalClients,   color: '#4A9E6B' },
  ]

  return (
    <>
      {/* Edit role modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditMember(null)} />
          <div className="relative z-10 w-full max-w-sm bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-[#27384A] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
                  Editar rol
                </p>
                <h2 className="text-base font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {editMember.full_name}
                </h2>
              </div>
              <button onClick={() => setEditMember(null)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Rol del usuario</label>
                <select
                  value={editRole || editMember.role}
                  onChange={e => setEditRole(e.target.value)}
                  className={cn(inputCls, 'cursor-pointer')}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setEditMember(null)}
                  className="px-4 py-2 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRoleChange(editMember, editRole || editMember.role)}
                  className="px-5 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New user form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => { setShowForm(false); setFEmail(''); setFFirstName(''); setFLastName(''); setFRole('team_member'); setFPhone(''); setFPassword(''); setFormError('') }}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Nuevo usuario
              </h3>
              <button
                onClick={() => { setShowForm(false); setFEmail(''); setFFirstName(''); setFLastName(''); setFRole('team_member'); setFPhone(''); setFPassword(''); setFormError('') }}
                className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"
              >
                <X size={16} />
              </button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {formError && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre <span className="text-[#FF6B35]">*</span></label>
                  <input
                    form="create-user-form"
                    required
                    type="text"
                    value={fFirstName}
                    onChange={e => setFFirstName(e.target.value)}
                    className={inputCls}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className={labelCls}>Apellido <span className="text-[#FF6B35]">*</span></label>
                  <input
                    form="create-user-form"
                    required
                    type="text"
                    value={fLastName}
                    onChange={e => setFLastName(e.target.value)}
                    className={inputCls}
                    placeholder="Apellido"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email <span className="text-[#FF6B35]">*</span></label>
                <input
                  form="create-user-form"
                  required
                  type="email"
                  value={fEmail}
                  onChange={e => setFEmail(e.target.value)}
                  className={inputCls}
                  placeholder="usuario@grucore.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rol <span className="text-[#FF6B35]">*</span></label>
                  <select
                    form="create-user-form"
                    value={fRole}
                    onChange={e => setFRole(e.target.value)}
                    className={cn(inputCls, 'cursor-pointer')}
                  >
                    {ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input
                    form="create-user-form"
                    type="tel"
                    value={fPhone}
                    onChange={e => setFPhone(e.target.value)}
                    className={inputCls}
                    placeholder="+502 0000-0000"
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Contraseña <span className="text-[#FF6B35]">*</span></label>
                <input
                  form="create-user-form"
                  required
                  type="password"
                  minLength={8}
                  value={fPassword}
                  onChange={e => setFPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            </div>
            {/* Footer */}
            <form id="create-user-form" onSubmit={handleCreate} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button
                type="button"
                onClick={() => { setShowForm(false); setFEmail(''); setFFirstName(''); setFLastName(''); setFRole('team_member'); setFPhone(''); setFPassword(''); setFormError('') }}
                className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <><Loader2 size={13} className="animate-spin" /> Creando…</>
                ) : (
                  <><Plus size={13} /> Crear usuario</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#131D28] flex">
        <ERPSidebar
          currentPage="team"
          userName={me?.full_name}
          userInitials={initials}
          userAvatarUrl={me?.avatar_url}
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
            <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Equipo
            </p>
            {me?.role === 'admin' && (
              <button
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
              >
                <Plus size={13} />
                Nuevo usuario
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <ERPAvatar avatarUrl={me?.avatar_url} initials={initials} size="md" />
              <span className="hidden sm:block text-xs text-[#8A95A5]">{me?.full_name ?? 'Staff'}</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ label, value, color }) => (
                <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <p className="text-xs text-[#8A95A5] mb-3">{label}</p>
                  <p className="text-2xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>


            {/* Members grid */}
            {internalMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <Users size={40} className="text-[#27384A]" />
                <p className="text-[#8A95A5] text-sm">No hay miembros en el equipo aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pagedMembers.map(member => {
                  const role = getRoleInfo(member.role)
                  const memberInitials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase() || '??'
                  return (
                    <div key={member.id} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/30 transition-colors">
                      {/* Avatar + name */}
                      <div className="flex items-start gap-4 mb-4">
                        <ERPAvatar avatarUrl={member.avatar_url} initials={memberInitials} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#F0EDE8] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {member.full_name}
                          </p>
                          <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 ${role.cls}`}>
                            {role.label}
                          </span>
                        </div>
                        {member.is_active ? (
                          <CheckCircle2 size={14} className="text-[#4A9E6B] flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={14} className="text-[#8A95A5] flex-shrink-0 mt-0.5" />
                        )}
                      </div>

                      {/* Contact info */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
                          <Mail size={12} className="flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-xs text-[#8A95A5]">
                            <Phone size={12} className="flex-shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#27384A]">
                        <span className="text-[10px] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
                          {new Date(member.created_at).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        {me?.role === 'admin' && (
                          <button
                            onClick={() => { setEditMember(member); setEditRole(member.role) }}
                            className="flex items-center gap-1.5 text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors"
                          >
                            <Pencil size={11} />
                            Editar rol
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <Pagination
              page={teamPage}
              total={internalMembers.length}
              perPage={TEAM_PER_PAGE}
              onChange={p => { setTeamPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            />
          </main>
        </div>
      </div>
    </>
  )
}
