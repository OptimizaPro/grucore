'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  LayoutDashboard, Camera, FileText, CreditCard,
  MessageSquare, Settings, LogOut, Bell, Menu, X,
  MapPin, Calendar, CheckCircle2, Clock, AlertTriangle,
  TrendingUp, ChevronRight, Download, Phone, Loader2, ZoomIn,
  ShieldCheck, ShieldAlert, AlertCircle, XCircle,
  Users, CloudSun, Package, ClipboardList, Hammer, Eye, EyeOff, Upload, Check, ChevronDown, FileEdit, Trash2, LayoutGrid, List,
  Send, RotateCcw, DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getMe, getMyProjects, getProject, getProjectProgress,
  getProjectMessages, sendProjectMessage,
  approveMilestone, getChangeOrders, approveChangeOrder, rejectChangeOrder, logout, updateMe, uploadAvatar, changePassword,
  getDocuments,
  getProjectQuotes, approveProjectQuote, requestChangesProjectQuote, rejectProjectQuote,
  type User, type ProjectList, type ProjectDetail, type ProgressUpdate,
  type PaymentMilestone, type MilestoneStatusValue,
  type ProjectMessage, type ChangeOrder, type ProjectDocument, type DocumentType,
  type Quote, type StockAlert,
} from '@/lib/api'
import { getCompanySettings } from '@/lib/company-settings'
import { toast } from 'sonner'

// ─── Nav items ────────────────────────────────────────────────────────────────

type TabId = 'dashboard' | 'progress' | 'photos' | 'milestones' | 'change_orders' | 'messages' | 'documents' | 'cotizacion'

// ─── Helpers visuales ─────────────────────────────────────────────────────────

function MilestoneStatusChip({ status }: { status: MilestoneStatusValue }) {
  const map: Record<MilestoneStatusValue, { label: string; cls: string; Icon: React.ElementType }> = {
    pending:            { label: 'Pendiente',           cls: 'bg-[#27384A]    text-[#8A95A5]', Icon: Clock },
    evidence_submitted: { label: 'Evidencia enviada',   cls: 'bg-amber-500/15 text-amber-400', Icon: Camera },
    awaiting_approval:  { label: 'Requiere tu firma',   cls: 'bg-[#FF6B35]/15 text-[#FF6B35]', Icon: ShieldAlert },
    approved:           { label: 'Aprobado',            cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]', Icon: ShieldCheck },
    paid:               { label: 'Pagado',              cls: 'bg-[#4A9E6B]/20 text-[#4A9E6B]', Icon: CheckCircle2 },
    disputed:           { label: 'En disputa',          cls: 'bg-red-500/15   text-red-400',   Icon: XCircle },
    cancelled:          { label: 'Cancelado',           cls: 'bg-[#4A5568]/20 text-[#8A95A5]', Icon: XCircle },
  }
  const { label, cls, Icon } = map[status] ?? map.pending
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>
      <Icon size={10} />
      {label}
    </span>
  )
}

// ─── Avatar con fallback a iniciales ─────────────────────────────────────────

function UserAvatar({
  name,
  avatarUrl,
  size = 48,
  className = '',
}: {
  name: string
  avatarUrl?: string | null
  size?: number
  className?: string
}) {
  const initials = name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className={className}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid rgba(255,107,53,0.3)',
          flexShrink: 0,
        }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: '#FF6B35',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35,
        fontWeight: 700,
        color: '#1A2530',
        fontFamily: 'Montserrat, sans-serif',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function PhaseStatusDot({ status }: { status: string }) {
  if (status === 'completed') return <CheckCircle2 size={13} className="text-[#4A9E6B] flex-shrink-0" />
  if (status === 'active')    return <div className="w-3 h-3 rounded-full border-2 border-[#FF6B35] flex-shrink-0" />
  return <div className="w-3 h-3 rounded-full border-2 border-[#27384A] flex-shrink-0" />
}

function fmtGtq(val: string | number) {
  const n = Math.round(Number(val))
  return `Q ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(d: string | null) {
  if (!d) return '—'
  const [y, m, day] = d.slice(0, 10).split('-')
  return `${day} ${MONTHS[parseInt(m, 10) - 1]} ${y}`
}

// ─── Modal de aprobación ──────────────────────────────────────────────────────

function ApprovalModal({
  milestone,
  projectId,
  onClose,
  onSuccess,
}: {
  milestone: PaymentMilestone
  projectId: number
  onClose: () => void
  onSuccess: (updated: PaymentMilestone) => void
}) {
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleApprove() {
    setLoading(true)
    setError('')
    try {
      const updated = await approveMilestone(projectId, milestone.id, notes)
      onSuccess(updated)
    } catch (e: any) {
      setError(e.message ?? 'Error al aprobar')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#27384A] flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-1" style={{ fontFamily: 'Space Mono, monospace' }}>
              Aprobación de hito
            </p>
            <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {milestone.name}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] flex-shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Resumen del hito */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Monto',          value: fmtGtq(milestone.amount_gtq) },
              { label: '% del contrato', value: `${milestone.percentage_of_total}%` },
              { label: 'Fecha estimada', value: fmtDate(milestone.due_date) },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 rounded-lg bg-[#1A2530] border border-[#27384A] text-center">
                <p className="text-[10px] text-[#8A95A5] mb-1">{label}</p>
                <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Descripción */}
          {milestone.description && (
            <p className="text-sm text-[#8A95A5] leading-relaxed">{milestone.description}</p>
          )}

          {/* Estado de firmas */}
          <div className="p-4 rounded-xl bg-[#1A2530] border border-[#27384A] space-y-3">
            <p className="text-xs font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Estado de firmas
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className={cn(
                'p-3 rounded-lg border text-center',
                milestone.approval?.company_approved_at
                  ? 'border-[#4A9E6B]/30 bg-[#4A9E6B]/5'
                  : 'border-[#27384A]'
              )}>
                <p className="text-[10px] text-[#8A95A5] mb-1">Constructora</p>
                {milestone.approval?.company_approved_at ? (
                  <>
                    <CheckCircle2 size={16} className="text-[#4A9E6B] mx-auto mb-1" />
                    <p className="text-[10px] text-[#4A9E6B]">
                      {milestone.approval.company_approved_by_name ?? 'Aprobado'}
                    </p>
                    <p className="text-[10px] text-[#64748b]">{fmtDate(milestone.approval.company_approved_at)}</p>
                  </>
                ) : (
                  <>
                    <Clock size={16} className="text-[#64748b] mx-auto mb-1" />
                    <p className="text-[10px] text-[#64748b]">Pendiente</p>
                  </>
                )}
              </div>
              <div className={cn(
                'p-3 rounded-lg border text-center',
                milestone.approval?.client_approved_at
                  ? 'border-[#4A9E6B]/30 bg-[#4A9E6B]/5'
                  : 'border-[#FF6B35]/20 bg-[#FF6B35]/5'
              )}>
                <p className="text-[10px] text-[#8A95A5] mb-1">Cliente (tú)</p>
                {milestone.approval?.client_approved_at ? (
                  <>
                    <CheckCircle2 size={16} className="text-[#4A9E6B] mx-auto mb-1" />
                    <p className="text-[10px] text-[#4A9E6B]">Aprobado</p>
                    <p className="text-[10px] text-[#64748b]">{fmtDate(milestone.approval.client_approved_at)}</p>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} className="text-[#FF6B35] mx-auto mb-1" />
                    <p className="text-[10px] text-[#FF6B35]">Requiere tu firma</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Evidencia fotográfica */}
          {milestone.evidence.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#F0EDE8] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Evidencia fotográfica ({milestone.evidence.length} fotos)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {milestone.evidence.map((ev) => (
                  <div key={ev.id} className="relative aspect-video rounded-lg overflow-hidden border border-[#27384A]">
                    <Image
                      src={ev.photo_url}
                      alt={ev.caption || 'Evidencia'}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    {ev.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-[#1A2530]/80 px-2 py-1">
                        <p className="text-[10px] text-[#8A95A5] truncate">{ev.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nota del cliente */}
          {!milestone.approval?.client_approved_at && (
            <div>
              <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">
                Nota (opcional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#1A2530] border border-[#27384A] rounded-lg px-4 py-3 text-sm text-[#F0EDE8] placeholder:text-[#64748b] focus:outline-none focus:border-[#FF6B35]/60 resize-none transition-colors"
                placeholder="Agrega un comentario o confirmación de tu revisión…"
              />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
          >
            Cancelar
          </button>
          {!milestone.approval?.client_approved_at && (
            <button
              onClick={handleApprove}
              disabled={loading}
              className="px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Firmando…</>
                : <><ShieldCheck size={14} /> Confirmar y firmar</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Modal de configuración ───────────────────────────────────────────────────

type SettingsTab = 'profile' | 'preferences' | 'security'

function SettingsModal({ user, onClose, onUpdate }: {
  user: User
  onClose: () => void
  onUpdate: (u: User) => void
}) {
  const [tab, setTab]             = useState<SettingsTab>('profile')

  // Perfil
  const [firstName, setFirstName] = useState(user.first_name)
  const [lastName, setLastName]   = useState(user.last_name)
  const [phone, setPhone]         = useState(user.phone)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileOk, setProfileOk]         = useState(false)
  const [profileErr, setProfileErr]       = useState('')

  // Preferencias
  const [lang, setLang]           = useState(user.preferred_language)
  const [currency, setCurrency]   = useState(user.preferred_currency)
  const [prefSaving, setPrefSaving] = useState(false)
  const [prefOk, setPrefOk]         = useState(false)

  // Seguridad
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [pwSaving, setPwSaving]   = useState(false)
  const [pwOk, setPwOk]           = useState(false)
  const [pwErr, setPwErr]         = useState('')

  // Cerrar con ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true); setProfileErr(''); setProfileOk(false)
    try {
      let updated = await updateMe({ first_name: firstName, last_name: lastName, phone })
      if (avatarFile) updated = await uploadAvatar(avatarFile)
      onUpdate(updated)
      setProfileOk(true)
      setTimeout(() => setProfileOk(false), 2500)
    } catch (err: any) {
      setProfileErr(err.message ?? 'Error al guardar')
    } finally { setProfileSaving(false) }
  }

  async function savePreferences(e: React.FormEvent) {
    e.preventDefault()
    setPrefSaving(true); setPrefOk(false)
    try {
      const updated = await updateMe({ preferred_language: lang, preferred_currency: currency })
      onUpdate(updated)
      setPrefOk(true)
      setTimeout(() => setPrefOk(false), 2500)
    } finally { setPrefSaving(false) }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwErr(''); setPwOk(false)
    if (newPw !== confirmPw) { setPwErr('Las contraseñas no coinciden.'); return }
    if (newPw.length < 8)    { setPwErr('Mínimo 8 caracteres.'); return }
    setPwSaving(true)
    try {
      await changePassword(currentPw, newPw)
      setPwOk(true)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwOk(false), 2500)
    } catch (err: any) {
      setPwErr(err.message ?? 'Error al cambiar contraseña')
    } finally { setPwSaving(false) }
  }

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: 'profile',     label: 'Perfil' },
    { id: 'preferences', label: 'Preferencias' },
    { id: 'security',    label: 'Seguridad' },
  ]

  const inputCls = 'w-full bg-[#1A2530] border border-[#27384A] rounded-lg px-3 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#64748b] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
  const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — bottom sheet en móvil, modal centrado en sm+ */}
      <div className="relative z-10 w-full sm:max-w-md bg-[#1F2D3A] border border-[#27384A] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[85vh]">

        {/* Header */}
        <div className="px-5 pt-5 pb-0 flex-shrink-0">
          {/* Handle (solo móvil) */}
          <div className="w-10 h-1 rounded-full bg-[#334155] mx-auto mb-4 sm:hidden" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Configuración
            </h2>
            <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-[#1A2530] rounded-lg p-1">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'flex-1 text-xs py-1.5 rounded-md font-medium transition-colors',
                  tab === id ? 'bg-[#FF6B35] text-[#1A2530]' : 'text-[#8A95A5] hover:text-[#F0EDE8]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-5">

          {/* ── Perfil ── */}
          {tab === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 pb-4 border-b border-[#27384A]">
                <div className="relative">
                  <UserAvatar
                    name={`${firstName} ${lastName}`.trim() || 'U'}
                    avatarUrl={avatarPreview}
                    size={72}
                  />
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#FF6B35] flex items-center justify-center cursor-pointer hover:bg-[#FF8557] transition-colors">
                    <Upload size={13} style={{ color: '#1A2530' }} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <p className="text-[10px] text-[#64748b]">JPG, PNG, WEBP · Máx. 5 MB</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Nombre</label>
                  <input className={inputCls} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Nombre" />
                </div>
                <div>
                  <label className={labelCls}>Apellido</label>
                  <input className={inputCls} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Apellido" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Teléfono</label>
                <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+502 0000 0000" type="tel" />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>

              {profileErr && <p className="text-xs text-red-400">{profileErr}</p>}

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: profileOk ? '#4A9E6B' : '#FF6B35', color: '#1A2530' }}
              >
                {profileSaving ? <Loader2 size={14} className="animate-spin" /> : profileOk ? <><Check size={14} /> Guardado</> : 'Guardar cambios'}
              </button>
            </form>
          )}

          {/* ── Preferencias ── */}
          {tab === 'preferences' && (
            <form onSubmit={savePreferences} className="space-y-4">
              <div>
                <label className={labelCls}>Idioma</label>
                <select className={inputCls} value={lang} onChange={e => setLang(e.target.value)}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Moneda</label>
                <select className={inputCls} value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option value="GTQ">Quetzal (Q)</option>
                  <option value="USD">Dólar ($)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={prefSaving}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: prefOk ? '#4A9E6B' : '#FF6B35', color: '#1A2530' }}
              >
                {prefSaving ? <Loader2 size={14} className="animate-spin" /> : prefOk ? <><Check size={14} /> Guardado</> : 'Guardar preferencias'}
              </button>
            </form>
          )}

          {/* ── Seguridad ── */}
          {tab === 'security' && (
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className={labelCls}>Contraseña actual</label>
                <div className="relative">
                  <input
                    className={inputCls + ' pr-10'}
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPw}
                    onChange={e => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#8A95A5]">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Nueva contraseña</label>
                <div className="relative">
                  <input
                    className={inputCls + ' pr-10'}
                    type={showNew ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#8A95A5]">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={labelCls}>Confirmar contraseña</label>
                <input
                  className={inputCls}
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                />
              </div>

              {pwErr && <p className="text-xs text-red-400">{pwErr}</p>}

              <button
                type="submit"
                disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: pwOk ? '#4A9E6B' : '#FF6B35', color: '#1A2530' }}
              >
                {pwSaving ? <Loader2 size={14} className="animate-spin" /> : pwOk ? <><Check size={14} /> Contraseña cambiada</> : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Modal de aprobación — Órdenes de cambio ─────────────────────────────────

const CO_STATUS_LABEL: Record<string, string> = {
  draft: 'Borrador', submitted: 'Enviada', in_review: 'En revisión',
  approved: 'Aprobada', rejected: 'Rechazada', withdrawn: 'Retirada',
}
const CO_STATUS_COLOR: Record<string, string> = {
  draft: '#8A95A5', submitted: '#F59E0B', in_review: '#6B8CFF',
  approved: '#4A9E6B', rejected: '#f87171', withdrawn: '#4A5568',
}
const CO_REASON_LABEL: Record<string, string> = {
  scope_change: 'Cambio de alcance', owner_request: 'Solicitud del cliente',
  unforeseen_condition: 'Condición imprevista', design_error: 'Error de diseño', other: 'Otro',
}

function COStatusChip({ status }: { status: string }) {
  const color = CO_STATUS_COLOR[status] ?? '#8A95A5'
  return (
    <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${color}20`, color }}>
      {CO_STATUS_LABEL[status] ?? status}
    </span>
  )
}

function COApprovalModal({
  co, projectId, onClose, onSuccess,
}: {
  co: ChangeOrder
  projectId: number
  onClose: () => void
  onSuccess: (updated: ChangeOrder) => void
}) {
  const [mode, setMode]       = useState<'review' | 'reject'>('review')
  const [notes, setNotes]     = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const alreadySigned = !!co.approval?.client_approved_at

  async function handleApprove() {
    setLoading(true); setError('')
    try {
      const updated = await approveChangeOrder(projectId, co.id, notes, true)
      onSuccess(updated)
    } catch (e: any) {
      setError(e.message ?? 'Error al aprobar la orden de cambio')
      setLoading(false)
    }
  }

  async function handleReject() {
    setLoading(true); setError('')
    try {
      const updated = await rejectChangeOrder(projectId, co.id, rejectNotes)
      onSuccess(updated)
    } catch (e: any) {
      setError(e.message ?? 'Error al rechazar la orden de cambio')
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#1A2530] border border-[#27384A] rounded-lg px-4 py-3 text-sm text-[#F0EDE8] placeholder:text-[#64748b] focus:outline-none focus:border-[#FF6B35]/60 resize-none transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-[#27384A] flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-1" style={{ fontFamily: 'Space Mono, monospace' }}>
              OC-{String(co.number).padStart(3, '0')}
            </p>
            <h2 className="text-base font-semibold text-white leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {co.title}
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] flex-shrink-0 mt-0.5 transition-colors"><X size={18} /></button>
        </div>

        {/* Error — always visible, outside scroll area */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">

          {/* ── Modo revisión ── */}
          {mode === 'review' && (
            <>
              {/* Resumen */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#1A2530] border border-[#27384A] text-center">
                  <p className="text-[10px] text-[#8A95A5] mb-1">Monto adicional</p>
                  <p className="text-sm font-semibold" style={{ fontFamily: 'Space Mono, monospace', color: Number(co.amount_gtq) >= 0 ? '#F59E0B' : '#4A9E6B' }}>
                    {Number(co.amount_gtq) >= 0 ? '+' : ''}{fmtGtq(co.amount_gtq)}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#1A2530] border border-[#27384A] text-center">
                  <p className="text-[10px] text-[#8A95A5] mb-1">Impacto en plazo</p>
                  <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                    {co.schedule_days_impact > 0 ? '+' : ''}{co.schedule_days_impact} días
                  </p>
                </div>
              </div>

              {co.description && <p className="text-sm text-[#8A95A5] leading-relaxed">{co.description}</p>}

              <p className="text-xs text-[#8A95A5]">
                Razón: <span className="text-[#F0EDE8]">{CO_REASON_LABEL[co.reason] ?? co.reason}</span>
              </p>

              {/* Estado de firmas */}
              <div className="p-4 rounded-xl bg-[#1A2530] border border-[#27384A] space-y-3">
                <p className="text-xs font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Estado de firmas</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={cn('p-3 rounded-lg border text-center', co.approval?.company_approved_at ? 'border-[#4A9E6B]/30 bg-[#4A9E6B]/5' : 'border-[#27384A]')}>
                    <p className="text-[10px] text-[#8A95A5] mb-1">Constructora</p>
                    {co.approval?.company_approved_at ? (
                      <>
                        <CheckCircle2 size={16} className="text-[#4A9E6B] mx-auto mb-1" />
                        <p className="text-[10px] text-[#4A9E6B]">{co.approval.company_approved_by_name ?? 'Aprobado'}</p>
                        <p className="text-[10px] text-[#64748b]">{fmtDate(co.approval.company_approved_at)}</p>
                      </>
                    ) : (
                      <>
                        <Clock size={16} className="text-[#64748b] mx-auto mb-1" />
                        <p className="text-[10px] text-[#64748b]">Pendiente</p>
                      </>
                    )}
                  </div>
                  <div className={cn('p-3 rounded-lg border text-center', alreadySigned ? 'border-[#4A9E6B]/30 bg-[#4A9E6B]/5' : 'border-[#FF6B35]/20 bg-[#FF6B35]/5')}>
                    <p className="text-[10px] text-[#8A95A5] mb-1">Cliente (tú)</p>
                    {alreadySigned ? (
                      <>
                        <CheckCircle2 size={16} className="text-[#4A9E6B] mx-auto mb-1" />
                        <p className="text-[10px] text-[#4A9E6B]">Aprobado</p>
                        <p className="text-[10px] text-[#64748b]">{fmtDate(co.approval!.client_approved_at)}</p>
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={16} className="text-[#FF6B35] mx-auto mb-1" />
                        <p className="text-[10px] text-[#FF6B35]">Requiere tu firma</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Nota de aprobación */}
              {!alreadySigned && (
                <div>
                  <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">Nota de aprobación (opcional)</label>
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                    className={inputCls} placeholder="Comentario de confirmación…" />
                </div>
              )}
            </>
          )}

          {/* ── Modo rechazo ── */}
          {mode === 'reject' && (
            <>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Rechazar esta orden de cambio
                  </p>
                  <p className="text-xs text-[#8A95A5] leading-relaxed">
                    Al rechazar, la constructora recibirá una notificación y deberá revisar o retirar la orden.
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#8A95A5] mb-1.5 font-medium">
                  Motivo del rechazo <span className="text-red-400">*</span>
                </label>
                <textarea rows={4} value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
                  className={cn(inputCls, 'border-red-500/20 focus:border-red-500/50')}
                  placeholder="Explica por qué no puedes aceptar esta orden de cambio…" />
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#27384A] flex gap-3">
          {mode === 'review' ? (
            <>
              <button onClick={onClose}
                className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#334155] transition-colors">
                Cerrar
              </button>
              {!alreadySigned && (
                <>
                  <button onClick={() => { setMode('reject'); setError('') }}
                    className="px-4 py-2.5 border border-red-500/30 text-sm text-red-400 rounded-lg hover:bg-red-500/5 transition-colors">
                    Rechazar
                  </button>
                  <button onClick={handleApprove} disabled={loading}
                    className="ml-auto px-6 py-2.5 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Firmando…</> : <><ShieldCheck size={14} /> Confirmar y firmar</>}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button onClick={() => { setMode('review'); setError('') }}
                className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] transition-colors">
                Volver
              </button>
              <button onClick={handleReject} disabled={loading || !rejectNotes.trim()}
                className="ml-auto px-6 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2">
                {loading ? <><Loader2 size={14} className="animate-spin" /> Rechazando…</> : 'Confirmar rechazo'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export default function PortalDashboard() {
  const [activeTab, setActiveTab]         = useState<TabId>('dashboard')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [user, setUser]                   = useState<User | null>(null)
  const [projectList, setProjectList]     = useState<ProjectList[]>([])
  const [project, setProject]             = useState<ProjectDetail | null>(null)
  const [projectSwitching, setProjectSwitching] = useState(false)
  const [switcherOpen, setSwitcherOpen]   = useState(false)
  const [progressSectionOpen, setProgressSectionOpen] = useState(true)
  const [progress, setProgress]           = useState<ProgressUpdate[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [approvalModal, setApprovalModal]   = useState<PaymentMilestone | null>(null)
  const [coApprovalModal, setCoApprovalModal] = useState<ChangeOrder | null>(null)
  const [changeOrders, setChangeOrders]           = useState<ChangeOrder[]>([])
  const [changeOrdersLoaded, setChangeOrdersLoaded] = useState(false)
  const [coViewMode, setCoViewMode]               = useState<'cards' | 'list'>('cards')
  const [documents, setDocuments]                 = useState<ProjectDocument[]>([])
  const [documentsLoaded, setDocumentsLoaded]     = useState(false)
  const [docsLoading, setDocsLoading]             = useState(false)
  const [docsFilter, setDocsFilter]               = useState<DocumentType | 'all'>('all')

  // ── Cotización ────────────────────────────────────────────────────────────
  const [quote, setQuote]                         = useState<Quote | null>(null)
  const [quoteLoaded, setQuoteLoaded]             = useState(false)
  const [quoteActionLoading, setQuoteActionLoading] = useState(false)
  const [changesModal, setChangesModal]           = useState(false)
  const [rejectModal, setRejectModal]             = useState(false)
  const [approveModal, setApproveModal]           = useState(false)
  const [signatureConfirmed, setSignatureConfirmed] = useState(false)
  const [quoteComment, setQuoteComment]           = useState('')

  const [settingsOpen, setSettingsOpen]     = useState(false)
  const [brandLogoUrl, setBrandLogoUrl]     = useState<string | null>(null)
  const [brandName,    setBrandName]        = useState('Grucore')
  const [brandTagline, setBrandTagline]     = useState('')
  const [lightbox, setLightbox]           = useState<{ url: string; caption: string; idx: number; all: { url: string; caption: string }[] } | null>(null)

  // ── Mensajes ──────────────────────────────────────────────────────────────
  const [messages, setMessages]     = useState<ProjectMessage[]>([])
  const [msgInput, setMsgInput]     = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const msgBottomRef                = useRef<HTMLDivElement>(null)

  // Cerrar lightbox con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!lightbox) return
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight' && lightbox.idx < lightbox.all.length - 1) {
        const i = lightbox.idx + 1
        setLightbox({ ...lightbox, idx: i, url: lightbox.all[i].url, caption: lightbox.all[i].caption })
      }
      if (e.key === 'ArrowLeft' && lightbox.idx > 0) {
        const i = lightbox.idx - 1
        setLightbox({ ...lightbox, idx: i, url: lightbox.all[i].url, caption: lightbox.all[i].caption })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])
  const msgPollRef                  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Carga inicial
  useEffect(() => {
    getCompanySettings().then(s => {
      setBrandLogoUrl(s.logo_url)
      setBrandName(s.name || 'Grucore')
      setBrandTagline(s.tagline || '')
    })
    async function init() {
      try {
        const me      = await getMe()
        setUser(me)
        const list    = await getMyProjects()
        setProjectList(list.results)
        const first   = list.results[0]
        if (!first) { setLoading(false); return }
        const [detail, prog] = await Promise.all([
          getProject(first.id),
          getProjectProgress(first.id),
        ])
        setProject(detail)
        setProgress(prog.results)
      } catch (e: any) {
        if (e.message === 'Sesión expirada') return
        setError(e.message ?? 'Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Cambio de proyecto
  const switchProject = useCallback(async (id: number) => {
    if (id === project?.id) { setSwitcherOpen(false); return }
    setSwitcherOpen(false)
    setSidebarOpen(false)
    setProjectSwitching(true)
    setMessages([])
    setChangeOrders([])
    setChangeOrdersLoaded(false)
    setActiveTab('dashboard')
    try {
      const [detail, prog] = await Promise.all([
        getProject(id),
        getProjectProgress(id),
      ])
      setProject(detail)
      setProgress(prog.results)
    } catch (e: any) {
      if (e.message !== 'Sesión expirada') setError(e.message ?? 'Error al cambiar proyecto')
    } finally {
      setProjectSwitching(false)
    }
  }, [project?.id])

  // ── Mensajes: carga y polling ─────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!project?.id) return
    try {
      const msgs = await getProjectMessages(project.id)
      setMessages(msgs)
    } catch { /* silencioso en polling */ }
  }, [project?.id])

  useEffect(() => {
    if (activeTab !== 'messages' || !project?.id) return
    loadMessages()
    msgPollRef.current = setInterval(loadMessages, 10_000)
    return () => { if (msgPollRef.current) clearInterval(msgPollRef.current) }
  }, [activeTab, project?.id, loadMessages])

  // Auto-scroll al último mensaje
  useEffect(() => {
    msgBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Carga órdenes de cambio al abrir la pestaña
  useEffect(() => {
    if (activeTab !== 'change_orders' || !project?.id || changeOrdersLoaded) return
    getChangeOrders(project.id)
      .then(cos => { setChangeOrders(cos); setChangeOrdersLoaded(true) })
      .catch(() => {})
  }, [activeTab, project?.id, changeOrdersLoaded])

  // Carga cotización al abrir la pestaña
  useEffect(() => {
    if (activeTab !== 'cotizacion' || !project?.id || quoteLoaded) return
    getProjectQuotes(project.id)
      .then(list => { setQuote(list[0] ?? null); setQuoteLoaded(true) })
      .catch(() => setQuoteLoaded(true))
  }, [activeTab, project?.id, quoteLoaded])

  // Carga documentos al abrir la pestaña
  useEffect(() => {
    if (activeTab !== 'documents' || !project?.id || documentsLoaded) return
    setDocsLoading(true)
    getDocuments(project.id)
      .then(docs => { setDocuments(docs); setDocumentsLoaded(true) })
      .catch(() => {})
      .finally(() => setDocsLoading(false))
  }, [activeTab, project?.id, documentsLoaded])


  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    const body = msgInput.trim()
    if (!body || !project?.id || msgSending) return
    setMsgSending(true)
    setMsgInput('')
    try {
      await sendProjectMessage(project.id, body)
      await loadMessages()
    } catch { setMsgInput(body) }
    finally { setMsgSending(false) }
  }

  // Actualizar hito en la lista local
  const handleMilestoneApproved = useCallback((updated: PaymentMilestone) => {
    setProject((p) =>
      p
        ? {
            ...p,
            milestones: p.milestones.map((m) => (m.id === updated.id ? updated : m)),
          }
        : p,
    )
    setApprovalModal(null)
  }, [])

  const pendingApprovals = project?.milestones.filter(
    (m) => m.status === 'awaiting_approval' && !m.approval?.client_approved_at,
  ) ?? []

  const pendingCOs = changeOrders.filter(
    (co) => co.status === 'in_review' && !!co.approval?.company_approved_at && !co.approval?.client_approved_at,
  )

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
          <p className="text-sm text-[#8A95A5]">Cargando tu portal…</p>
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
            className="px-4 py-2 bg-[#FF6B35] text-[#1A2530] text-sm font-semibold rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }


  return (
    <>
      {approvalModal && project && (
        <ApprovalModal
          milestone={approvalModal}
          projectId={project.id}
          onClose={() => setApprovalModal(null)}
          onSuccess={handleMilestoneApproved}
        />
      )}

      {coApprovalModal && project && (
        <COApprovalModal
          co={coApprovalModal}
          projectId={project.id}
          onClose={() => setCoApprovalModal(null)}
          onSuccess={(updated) => {
            setChangeOrders(prev => prev.map(c => c.id === updated.id ? updated : c))
            setCoApprovalModal(null)
          }}
        />
      )}

      {settingsOpen && user && (
        <SettingsModal
          user={user}
          onClose={() => setSettingsOpen(false)}
          onUpdate={(updated) => { setUser(updated); setSettingsOpen(false) }}
        />
      )}

      {/* Overlay de cambio de proyecto */}
      {projectSwitching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#131D28]/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-[#FF6B35]" />
            <p className="text-sm text-[#8A95A5]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cambiando proyecto…</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#131D28] flex">

        {/* ── Sidebar ───────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          'fixed md:sticky top-0 left-0 h-screen w-64 bg-[#1A2530] border-r border-[#27384A] flex flex-col z-40 transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-[#27384A] flex-shrink-0">
            <a href="/"><Image src={brandLogoUrl ?? '/Grucore-white.png'} alt="Grucore" width={180} height={47} className="h-12 w-auto" unoptimized={!!brandLogoUrl} /></a>
            <button className="ml-auto md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Project switcher */}
          {project && (
            <div className="mx-4 mt-4 relative">
              <button
                onClick={() => projectList.length > 1 && setSwitcherOpen(v => !v)}
                className={cn(
                  'w-full p-3 rounded-lg bg-[#1F2D3A] border border-[#27384A] text-left transition-colors',
                  projectList.length > 1 && 'hover:border-[#FF6B35]/40 cursor-pointer',
                  projectList.length <= 1 && 'cursor-default',
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[10px] text-[#8A95A5] uppercase tracking-widest" style={{ fontFamily: 'Space Mono, monospace' }}>
                    Proyecto activo
                  </p>
                  {projectList.length > 1 && (
                    <ChevronDown size={12} className={cn('text-[#8A95A5] flex-shrink-0 transition-transform', switcherOpen && 'rotate-180')} />
                  )}
                </div>
                <p className="text-xs font-semibold text-[#F0EDE8] leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {projectSwitching ? 'Cargando…' : project.name}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-[#27384A] overflow-hidden">
                  <div className="h-full bg-[#FF6B35] rounded-full transition-all" style={{ width: `${project.progress_percentage}%` }} />
                </div>
                <p className="text-[10px] text-[#FF6B35] mt-1" style={{ fontFamily: 'Space Mono, monospace' }}>
                  {project.progress_percentage}% completado
                </p>
              </button>

              {/* Dropdown lista de proyectos */}
              {switcherOpen && projectList.length > 1 && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg bg-[#1F2D3A] border border-[#27384A] shadow-2xl overflow-hidden">
                    <p className="px-3 pt-2 pb-1 text-[10px] text-[#8A95A5] uppercase tracking-widest" style={{ fontFamily: 'Space Mono, monospace' }}>
                      Mis proyectos
                    </p>
                    {projectList.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => switchProject(p.id)}
                        className={cn(
                          'w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#27384A]',
                          p.id === project.id && 'bg-[#FF6B35]/10',
                        )}
                      >
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.id === project.id ? '#FF6B35' : '#27384A', marginTop: 5 }} />
                        <div className="min-w-0">
                          <p className={cn('text-xs font-medium leading-snug truncate', p.id === project.id ? 'text-[#FF6B35]' : 'text-[#F0EDE8]')} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {p.name}
                          </p>
                          <p className="text-[10px] text-[#8A95A5] mt-0.5">
                            {p.progress_percentage}% · {p.status}
                          </p>
                        </div>
                        {p.id === project.id && <Check size={12} className="text-[#FF6B35] flex-shrink-0 ml-auto mt-1" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Alerta de firmas pendientes */}
          {(pendingApprovals.length > 0 || pendingCOs.length > 0) && (
            <div className="mx-4 mt-3 p-3 rounded-lg bg-[#FF6B35]/10 border border-[#FF6B35]/30 space-y-1.5">
              {pendingApprovals.length > 0 && (
                <button
                  onClick={() => { setActiveTab('milestones'); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <ShieldAlert size={13} className="text-[#FF6B35] flex-shrink-0" />
                  <p className="text-[10px] text-[#FF6B35] font-semibold">
                    {pendingApprovals.length} hito{pendingApprovals.length > 1 ? 's' : ''} requiere{pendingApprovals.length > 1 ? 'n' : ''} tu firma
                  </p>
                </button>
              )}
              {pendingCOs.length > 0 && (
                <button
                  onClick={() => { setActiveTab('change_orders'); setSidebarOpen(false) }}
                  className="w-full flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                >
                  <ShieldAlert size={13} className="text-[#FF6B35] flex-shrink-0" />
                  <p className="text-[10px] text-[#FF6B35] font-semibold">
                    {pendingCOs.length} orden{pendingCOs.length > 1 ? 'es' : ''} de cambio requiere{pendingCOs.length > 1 ? 'n' : ''} tu firma
                  </p>
                </button>
              )}
            </div>
          )}

          {/* Nav */}
          <nav data-tour="portal-nav" className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

            {/* Resumen — ítem plano */}
            <button
              data-tour="portal-resumen"
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                activeTab === 'dashboard'
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
              )}
            >
              <LayoutDashboard size={16} />
              Resumen
            </button>

            {/* Avance de Obra — sección expandible */}
            <div>
              <button
                data-tour="portal-avance"
                onClick={() => setProgressSectionOpen(v => !v)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]"
              >
                <ClipboardList size={16} className="flex-shrink-0" />
                <span className="flex-1">Avance de obra</span>
                <ChevronDown size={14} className={cn('flex-shrink-0 transition-transform duration-200', progressSectionOpen && 'rotate-180')} />
              </button>

              {progressSectionOpen && (
                <div className="ml-3 pl-3 border-l border-[#27384A] mt-0.5 space-y-0.5">
                  <button
                    onClick={() => { setActiveTab('progress'); setSidebarOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                      activeTab === 'progress'
                        ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
                    )}
                  >
                    <ClipboardList size={15} />
                    Bitácora
                  </button>
                  <button
                    onClick={() => { setActiveTab('photos'); setSidebarOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                      activeTab === 'photos'
                        ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                        : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
                    )}
                  >
                    <Camera size={15} />
                    Fotos
                  </button>
                </div>
              )}
            </div>

            {/* Hitos y pagos — ítem plano */}
            <button
              data-tour="portal-hitos"
              onClick={() => { setActiveTab('milestones'); setSidebarOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                activeTab === 'milestones'
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
              )}
            >
              <CreditCard size={16} />
              <span className="flex-1">Hitos y pagos</span>
              {pendingApprovals.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FF6B35] text-[#1A2530] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {pendingApprovals.length}
                </span>
              )}
            </button>

            {/* Órdenes de cambio — ítem plano */}
            <button
              data-tour="portal-cambios"
              onClick={() => { setActiveTab('change_orders'); setSidebarOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                activeTab === 'change_orders'
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
              )}
            >
              <FileEdit size={16} />
              <span className="flex-1">Órdenes de cambio</span>
              {pendingCOs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FF6B35] text-[#1A2530] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {pendingCOs.length}
                </span>
              )}
            </button>

            {/* Mensajes — ítem plano */}
            <button
              data-tour="portal-mensajes"
              onClick={() => { setActiveTab('messages'); setSidebarOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                activeTab === 'messages'
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
              )}
            >
              <MessageSquare size={16} />
              Mensajes
            </button>

            {/* Cotización — ítem plano */}
            <button
              data-tour="portal-cotizacion"
              onClick={() => { setActiveTab('cotizacion'); setSidebarOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                activeTab === 'cotizacion'
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
              )}
            >
              <DollarSign size={16} />
              <span className="flex-1">Cotización</span>
              {quote?.status === 'sent' && (
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] flex-shrink-0" />
              )}
            </button>

            {/* Documentos — ítem plano */}
            <button
              data-tour="portal-documentos"
              onClick={() => { setActiveTab('documents'); setSidebarOpen(false) }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                activeTab === 'documents'
                  ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                  : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A]',
              )}
            >
              <FileText size={16} />
              Documentos
            </button>

          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-[#27384A] space-y-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A] transition-colors"
            >
              <Settings size={16} />
              Configuración
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8A95A5] hover:text-red-400 hover:bg-[#1F2D3A] transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Topbar */}
          <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
            <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {({ dashboard: 'Resumen', progress: 'Bitácora', photos: 'Fotos', milestones: 'Hitos y pagos', change_orders: 'Órdenes de cambio', messages: 'Mensajes', documents: 'Documentos', cotizacion: 'Cotización' } as Record<TabId, string>)[activeTab]}
            </p>
            {(pendingApprovals.length + pendingCOs.length > 0) && (
              <button
                onClick={() => setActiveTab(pendingApprovals.length > 0 ? 'milestones' : 'change_orders')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35]/10 border border-[#FF6B35]/30 text-xs text-[#FF6B35]"
              >
                <ShieldAlert size={12} />
                {pendingApprovals.length + pendingCOs.length} firma{(pendingApprovals.length + pendingCOs.length) > 1 ? 's' : ''} pendiente{(pendingApprovals.length + pendingCOs.length) > 1 ? 's' : ''}
              </button>
            )}
            <div className="flex items-center gap-2.5">
              <UserAvatar name={user?.full_name ?? 'CL'} avatarUrl={user?.avatar_url} size={32} />
              <span className="hidden sm:block text-xs text-[#8A95A5]">{user?.full_name ?? 'Cliente'}</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">

            {!project && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <AlertCircle size={32} className="text-[#8A95A5]" />
                <p className="text-[#8A95A5] text-sm">No tienes proyectos activos aún.</p>
              </div>
            )}

            {project && (
              <>
                {/* ── TAB: Resumen ──────────────────────────── */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6 max-w-6xl">
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Avance global',  value: `${project.progress_percentage}%`, sub: 'del proyecto',           color: '#FF6B35', Icon: TrendingUp },
                        { label: 'Inicio de obra', value: fmtDate(project.start_date),       sub: 'fecha de inicio',         color: '#4A9E6B', Icon: Calendar },
                        { label: 'Entrega est.',   value: fmtDate(project.estimated_end),    sub: 'fecha estimada',          color: '#8A95A5', Icon: Clock },
                        { label: 'Presupuesto',    value: fmtGtq(project.total_budget_gtq), sub: project.city,             color: '#8A95A5', Icon: MapPin },
                      ].map(({ label, value, sub, color, Icon }) => (
                        <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-xs text-[#8A95A5]">{label}</p>
                            <Icon size={14} style={{ color }} />
                          </div>
                          <p className="text-xl font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif', color }}>
                            {value}
                          </p>
                          <p className="text-[10px] text-[#8A95A5] mt-1 truncate">{sub}</p>
                        </div>
                      ))}
                    </div>

                    {/* Fases + Actividad reciente */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                        <h2 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Fases del proyecto
                        </h2>
                        {project.phases.length === 0 ? (
                          <p className="text-xs text-[#8A95A5]">Sin fases registradas aún.</p>
                        ) : (
                          <div className="space-y-4">
                            {project.phases.map((phase) => (
                              <div key={phase.id}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <PhaseStatusDot status={phase.status} />
                                    <span className="text-xs text-[#8A95A5]">{phase.name}</span>
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5]">
                                    {phase.status === 'completed' ? 'Completado' : phase.status === 'active' ? 'En progreso' : 'Pendiente'}
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#27384A] overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: phase.status === 'completed' ? '100%' : phase.status === 'active' ? '50%' : '0%',
                                      background: phase.status === 'completed' ? '#4A9E6B' : '#FF6B35',
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bitácora reciente */}
                      <div className="p-6 rounded-xl bg-[#1F2D3A] border border-[#27384A] flex flex-col">
                        <h2 className="text-sm font-semibold text-[#F0EDE8] mb-5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Actividad reciente
                        </h2>
                        {progress.length === 0 ? (
                          <p className="text-xs text-[#8A95A5]">Sin registros de avance aún.</p>
                        ) : (
                          <div className="space-y-4 flex-1">
                            {progress.slice(0, 4).map((p) => (
                              <div key={p.id} className="flex gap-3">
                                <div className="w-3 h-3 rounded-full bg-[#FF6B35]/40 border border-[#FF6B35] flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-[#64748b] mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
                                    {fmtDate(p.date)} · {p.progress_pct}% avance
                                  </p>
                                  <p className="text-xs text-[#8A95A5] leading-relaxed line-clamp-2">
                                    {p.notes || (p.activities.length > 0 ? p.activities.join(', ') : 'Avance registrado')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => setActiveTab('progress')}
                          className="mt-4 text-xs text-[#FF6B35] hover:text-[#FF8557] transition-colors text-left"
                        >
                          Ver bitácora completa →
                        </button>
                      </div>
                    </div>

                    {/* ── Fila inferior: PM + Próximo hito ── */}
                    {(() => {
                      const nextMilestone = project.milestones
                        .filter(m => m.status !== 'paid' && m.status !== 'cancelled')
                        .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))[0] ?? null

                      const needsSignature = nextMilestone?.status === 'awaiting_approval' &&
                        !nextMilestone.approval?.client_approved_at

                      const milestoneColor = needsSignature ? '#FF6B35'
                        : nextMilestone?.status === 'approved' ? '#4A9E6B'
                        : nextMilestone?.status === 'evidence_submitted' ? '#F59E0B'
                        : '#8A95A5'

                      const milestoneLabel = needsSignature ? 'Requiere tu firma'
                        : nextMilestone?.status === 'approved' ? 'Aprobado'
                        : nextMilestone?.status === 'evidence_submitted' ? 'Evidencia enviada'
                        : nextMilestone?.status === 'pending' ? 'Pendiente'
                        : '—'

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                          {/* Card PM */}
                          {project.project_manager_name && (
                            <div
                              className="relative overflow-hidden rounded-2xl p-5"
                              style={{ background: 'linear-gradient(135deg, #1F2D3A 0%, #1A2530 100%)', border: '1px solid rgba(255,107,53,0.25)' }}
                            >
                              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: 'linear-gradient(180deg, #FF6B35 0%, #FF8557 100%)' }} />
                              <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

                              <div className="pl-3 relative">
                                <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: '#FF6B35', fontFamily: 'Space Mono, monospace' }}>
                                  Tu director de proyecto
                                </p>
                                <div className="flex items-center gap-4 mb-4">
                                  <div className="relative shrink-0">
                                    <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(255,107,53,0.2)', transform: 'scale(1.15)' }} />
                                    <UserAvatar name={project.project_manager_name} avatarUrl={project.project_manager_avatar} size={64} className="relative" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-base font-bold text-white leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      {project.project_manager_name}
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: '#8A95A5' }}>Grucore · {project.city}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#4A9E6B]" />
                                      <span className="text-[11px]" style={{ color: '#4A9E6B' }}>Disponible</span>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setActiveTab('messages')}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
                                  style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8557)', color: '#131D28' }}
                                >
                                  <MessageSquare size={14} />
                                  Enviar mensaje
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Card próximo hito */}
                          <div
                            className="relative overflow-hidden rounded-2xl p-5"
                            style={{ background: 'linear-gradient(135deg, #1F2D3A 0%, #1A2530 100%)', border: `1px solid ${needsSignature ? 'rgba(255,107,53,0.35)' : 'rgba(74,158,107,0.2)'}` }}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: `linear-gradient(180deg, ${milestoneColor}, ${milestoneColor}88)` }} />
                            <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${milestoneColor}11 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

                            <div className="pl-3 relative h-full flex flex-col">
                              <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: milestoneColor, fontFamily: 'Space Mono, monospace' }}>
                                Próximo hito de pago
                              </p>

                              {nextMilestone ? (
                                <>
                                  <div className="flex-1 space-y-3 mb-4">
                                    <p className="text-sm font-semibold text-white leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      {nextMilestone.name}
                                    </p>

                                    <p className="text-2xl font-bold" style={{ fontFamily: 'Space Mono, monospace', color: milestoneColor }}>
                                      {fmtGtq(nextMilestone.amount_gtq)}
                                    </p>

                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${milestoneColor}18`, color: milestoneColor }}>
                                        {milestoneLabel}
                                      </span>
                                      {nextMilestone.due_date && (
                                        <span className="text-[10px] text-[#8A95A5] flex items-center gap-1">
                                          <Calendar size={9} />
                                          {fmtDate(nextMilestone.due_date)}
                                        </span>
                                      )}
                                    </div>

                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[10px] text-[#8A95A5]">
                                        <span>{nextMilestone.percentage_of_total}% del contrato</span>
                                        <span style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(project.total_budget_gtq)}</span>
                                      </div>
                                      <div className="h-1.5 rounded-full bg-[#27384A] overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${nextMilestone.percentage_of_total}%`, background: milestoneColor }} />
                                      </div>
                                    </div>
                                  </div>

                                  {needsSignature ? (
                                    <button
                                      onClick={() => setActiveTab('milestones')}
                                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
                                      style={{ background: 'linear-gradient(135deg, #FF6B35, #FF8557)', color: '#131D28' }}
                                    >
                                      <ShieldAlert size={14} />
                                      Firmar ahora
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setActiveTab('milestones')}
                                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
                                      style={{ border: '1px solid #27384A', color: '#8A95A5' }}
                                    >
                                      Ver hitos de pago →
                                    </button>
                                  )}
                                </>
                              ) : (
                                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-4">
                                  <CheckCircle2 size={28} style={{ color: '#4A9E6B' }} />
                                  <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Todo al día</p>
                                  <p className="text-xs" style={{ color: '#8A95A5' }}>No hay hitos de pago pendientes.</p>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* ── TAB: Bitácora ─────────────────────────── */}
                {activeTab === 'progress' && (() => {
                  // Estadísticas derivadas
                  const totalWorkers   = progress.reduce((s, e) => s + e.labor_count, 0)
                  const avgWorkers     = progress.length ? Math.round(totalWorkers / progress.length) : 0
                  const activityCount  = progress.flatMap(e => e.activities).reduce<Record<string, number>>((acc, a) => {
                    acc[a] = (acc[a] ?? 0) + 1; return acc
                  }, {})
                  const topActivities  = Object.entries(activityCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
                  const allProgressPhotos = progress.flatMap(e => e.photos)
                  const recentPhotos      = allProgressPhotos.slice(-8)
                  const progressFlatList  = allProgressPhotos.map(ph => ({ url: ph.photo_url, caption: ph.caption || '' }))
                  const latestPct      = progress.length ? progress[0].progress_pct : (project?.progress_percentage ?? 0)

                  return (
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

                      {/* ── Columna izquierda: lista de registros ── */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Bitácora de obra
                          </h2>
                          <span className="text-xs text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
                            {progress.length} registro{progress.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {progress.length === 0 && (
                          <p className="text-sm text-[#8A95A5]">Sin registros de avance aún.</p>
                        )}

                        {progress.map((entry) => (
                          <div key={entry.id} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div>
                                <p className="text-xs text-[#FF6B35] font-medium" style={{ fontFamily: 'Space Mono, monospace' }}>
                                  {fmtDate(entry.date)}
                                </p>
                                <p className="text-lg font-semibold text-[#F0EDE8] mt-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {entry.progress_pct}% de avance
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs text-[#8A95A5]">
                                {entry.labor_count > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Users size={11} className="text-[#FF6B35]" />
                                    {entry.labor_count} personas
                                  </span>
                                )}
                                {entry.weather && (
                                  <span className="flex items-center gap-1">
                                    <CloudSun size={11} className="text-[#FF6B35]" />
                                    {entry.weather}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="h-1.5 rounded-full bg-[#27384A] overflow-hidden mb-4">
                              <div className="h-full bg-[#FF6B35] rounded-full" style={{ width: `${entry.progress_pct}%` }} />
                            </div>

                            {entry.notes && (
                              <p className="text-sm text-[#8A95A5] leading-relaxed mb-4">{entry.notes}</p>
                            )}

                            {entry.activities.length > 0 && (
                              <div className="mb-3">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Hammer size={10} style={{ color: '#FF6B35' }} />
                                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#FF6B35' }}>Actividades</p>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,107,53,0.12)', color: '#FF8557' }}>
                                    {entry.activities.length}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {entry.activities.map((a, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                                      style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF8557' }}
                                    >
                                      <Hammer size={9} />
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.materials.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Package size={10} style={{ color: '#38BDF8' }} />
                                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#38BDF8' }}>Materiales</p>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8' }}>
                                    {entry.materials.length}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {entry.materials.map((m, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                                      style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.22)', color: '#38BDF8' }}
                                    >
                                      <Package size={9} />
                                      {m}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {entry.photos.length > 0 && (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                                {entry.photos.map((photo) => {
                                  const idx = progressFlatList.findIndex(f => f.url === photo.photo_url)
                                  return (
                                    <button
                                      key={photo.id}
                                      onClick={() => setLightbox({ url: photo.photo_url, caption: photo.caption || '', idx, all: progressFlatList })}
                                      className="relative aspect-video rounded-lg overflow-hidden border border-[#27384A] group focus:outline-none"
                                    >
                                      <Image src={photo.photo_url} alt={photo.caption || 'Foto'} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="150px" />
                                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="rounded-full p-1.5" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                          <ZoomIn size={13} style={{ color: '#fff' }} />
                                        </span>
                                      </span>
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* ── Columna derecha: panel de resumen ── */}
                      <div className="space-y-4 xl:sticky xl:top-6">

                        {/* Avance general */}
                        <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Avance general</p>
                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-3xl font-bold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {latestPct}%
                            </span>
                            <span className="text-xs text-slate-400 mb-1">completado</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#27384A] overflow-hidden">
                            <div className="h-full bg-[#FF6B35] rounded-full transition-all duration-700"
                              style={{ width: `${latestPct}%` }} />
                          </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Estadísticas</p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                <ClipboardList size={11} className="text-[#FF6B35]" /> Días registrados
                              </span>
                              <span className="text-sm font-semibold text-[#F0EDE8]">{progress.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                <Users size={11} className="text-[#FF6B35]" /> Prom. personal/día
                              </span>
                              <span className="text-sm font-semibold text-[#F0EDE8]">{avgWorkers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                <Camera size={11} className="text-[#FF6B35]" /> Fotos registradas
                              </span>
                              <span className="text-sm font-semibold text-[#F0EDE8]">
                                {progress.reduce((s, e) => s + e.photos.length, 0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actividades frecuentes */}
                        {topActivities.length > 0 && (
                          <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Actividades frecuentes</p>
                            <div className="space-y-2">
                              {topActivities.map(([name, count]) => (
                                <div key={name}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-400 truncate pr-2">{name}</span>
                                    <span className="text-[10px] text-slate-400 shrink-0">{count} {count === 1 ? 'día' : 'días'}</span>
                                  </div>
                                  <div className="h-1 rounded-full bg-[#27384A] overflow-hidden">
                                    <div className="h-full bg-[#FF6B35] rounded-full opacity-60"
                                      style={{ width: `${(count / (topActivities[0][1] || 1)) * 100}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Últimas fotos */}
                        {recentPhotos.length > 0 && (
                          <div className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3">Últimas fotos</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {recentPhotos.map((photo) => {
                                const idx = progressFlatList.findIndex(f => f.url === photo.photo_url)
                                return (
                                  <button
                                    key={photo.id}
                                    onClick={() => setLightbox({ url: photo.photo_url, caption: photo.caption || '', idx, all: progressFlatList })}
                                    className="relative aspect-video rounded-lg overflow-hidden border border-[#27384A] group focus:outline-none"
                                  >
                                    <Image src={photo.photo_url} alt={photo.caption || 'Foto'} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="130px" />
                                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="rounded-full p-1.5" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                        <ZoomIn size={13} style={{ color: '#fff' }} />
                                      </span>
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )
                })()}

                {/* ── TAB: Fotos ────────────────────────────── */}
                {activeTab === 'photos' && (() => {
                  const allPhotos = progress.flatMap((p) =>
                    p.photos.map((ph) => ({ ...ph, date: p.date, pct: p.progress_pct }))
                  )
                  // Agrupar por fecha de bitácora
                  const byDate = allPhotos.reduce<Record<string, typeof allPhotos>>((acc, ph) => {
                    const k = ph.date; (acc[k] ??= []).push(ph); return acc
                  }, {})
                  const flatList = allPhotos.map(ph => ({ url: ph.photo_url, caption: ph.caption || fmtDate(ph.date) }))

                  return (
                    <div className="max-w-6xl">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#F0EDE8' }}>
                          Fotos de obra
                        </h2>
                        {allPhotos.length > 0 && (
                          <span className="text-xs" style={{ color: '#8A95A5' }}>{allPhotos.length} foto{allPhotos.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>

                      {allPhotos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                          <Camera size={32} style={{ color: '#64748b' }} />
                          <p className="text-sm" style={{ color: '#8A95A5' }}>Sin fotos registradas aún.</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>El equipo de obra irá añadiendo fotos del avance.</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {Object.entries(byDate).sort(([a], [b]) => (b > a ? 1 : -1)).map(([date, photos]) => (
                            <div key={date}>
                              <div className="flex items-center gap-3 mb-3">
                                <p className="text-xs font-semibold" style={{ color: '#FF6B35', fontFamily: 'Space Mono, monospace' }}>
                                  {fmtDate(date)}
                                </p>
                                <div className="flex-1 h-px" style={{ background: '#27384A' }} />
                                <span className="text-[10px]" style={{ color: '#64748b' }}>{photos[0].pct}% avance · {photos.length} foto{photos.length !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {photos.map((photo) => {
                                  const globalIdx = flatList.findIndex(f => f.url === photo.photo_url)
                                  return (
                                    <button
                                      key={photo.id}
                                      onClick={() => setLightbox({ url: photo.photo_url, caption: photo.caption || fmtDate(photo.date), idx: globalIdx, all: flatList })}
                                      className="relative aspect-video rounded-xl overflow-hidden border group focus:outline-none"
                                      style={{ borderColor: '#27384A' }}
                                    >
                                      <Image
                                        src={photo.photo_url}
                                        alt={photo.caption || 'Foto de obra'}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                      />
                                      <span className="absolute inset-0 transition-colors group-hover:bg-black/20" />
                                      {/* Ícono zoom */}
                                      <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="rounded-full p-2" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                          <ZoomIn size={16} style={{ color: '#fff' }} />
                                        </span>
                                      </span>
                                      {photo.caption && (
                                        <span className="absolute bottom-0 inset-x-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(transparent, rgba(15,23,42,0.9))', display: 'block' }}>
                                          <span className="text-[10px] truncate block" style={{ color: '#F0EDE8' }}>{photo.caption}</span>
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* ── Lightbox ──────────────────────────────── */}
                {lightbox && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.92)' }}
                    onClick={() => setLightbox(null)}
                  >
                    {/* Cerrar */}
                    <button
                      className="absolute top-4 right-4 rounded-full p-2 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.1)', color: '#F0EDE8' }}
                      onClick={() => setLightbox(null)}
                    >
                      <X size={20} />
                    </button>

                    {/* Anterior */}
                    {lightbox.idx > 0 && (
                      <button
                        className="absolute left-4 rounded-full p-3 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#F0EDE8' }}
                        onClick={(e) => { e.stopPropagation(); const i = lightbox.idx - 1; setLightbox({ ...lightbox, idx: i, url: lightbox.all[i].url, caption: lightbox.all[i].caption }) }}
                      >
                        <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
                      </button>
                    )}

                    {/* Imagen */}
                    <div className="relative w-full max-w-5xl max-h-[85vh] mx-16" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={lightbox.url}
                        alt={lightbox.caption}
                        className="w-full h-full object-contain rounded-xl"
                        style={{ maxHeight: '80vh' }}
                      />
                      {lightbox.caption && (
                        <div className="mt-3 text-center">
                          <p className="text-sm" style={{ color: '#8A95A5' }}>{lightbox.caption}</p>
                          <p className="text-xs mt-1" style={{ color: '#64748b' }}>{lightbox.idx + 1} / {lightbox.all.length}</p>
                        </div>
                      )}
                    </div>

                    {/* Siguiente */}
                    {lightbox.idx < lightbox.all.length - 1 && (
                      <button
                        className="absolute right-4 rounded-full p-3 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.1)', color: '#F0EDE8' }}
                        onClick={(e) => { e.stopPropagation(); const i = lightbox.idx + 1; setLightbox({ ...lightbox, idx: i, url: lightbox.all[i].url, caption: lightbox.all[i].caption }) }}
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </div>
                )}

                {/* ── TAB: Hitos y pagos ────────────────────── */}
                {activeTab === 'milestones' && (
                  <div className="max-w-6xl space-y-6">
                    {/* Resumen financiero */}
                    {(() => {
                      const ms        = project.milestones
                      const total     = Number(project.total_budget_gtq)
                      const paid      = ms.filter((m) => m.status === 'paid').reduce((s, m) => s + Number(m.amount_gtq), 0)
                      const approved  = ms.filter((m) => m.status === 'approved').reduce((s, m) => s + Number(m.amount_gtq), 0)
                      const pending   = total - paid - approved
                      return (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[
                            { label: 'Total contrato', value: fmtGtq(total),    color: '#F0EDE8' },
                            { label: 'Pagado',         value: fmtGtq(paid),     color: '#4A9E6B' },
                            { label: 'Aprobado',       value: fmtGtq(approved), color: '#FF6B35' },
                            { label: 'Pendiente',      value: fmtGtq(pending),  color: '#8A95A5' },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] text-center">
                              <p className="text-xs text-[#8A95A5] mb-2">{label}</p>
                              <p className="text-lg font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>{value}</p>
                            </div>
                          ))}
                        </div>
                      )
                    })()}

                    {/* Lista de hitos */}
                    {project.milestones.length === 0 ? (
                      <p className="text-sm text-[#8A95A5]">Sin hitos de pago registrados aún.</p>
                    ) : (
                      <div className="space-y-3">
                        {project.milestones.map((milestone, idx) => {
                          const canApprove =
                            milestone.status === 'awaiting_approval' &&
                            !milestone.approval?.client_approved_at
                          const approval = milestone.approval

                          return (
                            <div
                              key={milestone.id}
                              className={cn(
                                'rounded-xl border bg-[#1F2D3A] transition-colors',
                                canApprove
                                  ? 'border-[#FF6B35]/40 hover:border-[#FF6B35]/60'
                                  : 'border-[#27384A] hover:border-[#27384A]',
                              )}
                            >
                              {/* Header del hito */}
                              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* Número */}
                                <span
                                  className="text-3xl font-bold flex-shrink-0 leading-none"
                                  style={{
                                    fontFamily: 'Montserrat, sans-serif',
                                    color: 'transparent',
                                    WebkitTextStroke: `1px ${
                                      canApprove                        ? '#FF6B35'
                                      : milestone.status === 'paid'     ? 'rgba(74,158,107,0.7)'
                                      : milestone.status === 'approved' ? 'rgba(255,107,53,0.6)'
                                      :                                   'rgba(255,107,53,0.35)'
                                    }`,
                                  }}
                                >
                                  {String(idx + 1).padStart(2, '0')}
                                </span>

                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3
                                      className="text-base font-semibold"
                                      style={{ fontFamily: 'Montserrat, sans-serif', color: '#F0EDE8' }}
                                    >
                                      {milestone.name}
                                    </h3>
                                    <MilestoneStatusChip status={milestone.status} />
                                  </div>
                                  <div className="flex flex-wrap gap-4 text-xs text-[#8A95A5]">
                                    {milestone.phase_name && (
                                      <span className="flex items-center gap-1">
                                        <ChevronRight size={10} className="text-[#FF6B35]" />
                                        {milestone.phase_name}
                                      </span>
                                    )}
                                    {milestone.progress_required_pct > 0 && (
                                      <span className="flex items-center gap-1">
                                        <TrendingUp size={10} className="text-[#FF6B35]" />
                                        Requiere {milestone.progress_required_pct}% de avance
                                      </span>
                                    )}
                                    {milestone.due_date && (
                                      <span className="flex items-center gap-1">
                                        <Calendar size={10} className="text-[#FF6B35]" />
                                        {fmtDate(milestone.due_date)}
                                      </span>
                                    )}
                                    {milestone.paid_at && (
                                      <span className="flex items-center gap-1 text-[#4A9E6B]">
                                        <CheckCircle2 size={10} />
                                        Pagado el {fmtDate(milestone.paid_at)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <p
                                    className="text-lg font-semibold"
                                    style={{
                                      fontFamily: 'Space Mono, monospace',
                                      color: milestone.status === 'paid'     ? '#4A9E6B'
                                           : milestone.status === 'approved' ? '#FF6B35'
                                           :                                   '#FF6B35',
                                    }}
                                  >
                                    {fmtGtq(milestone.amount_gtq)}
                                  </p>
                                  <p className="text-[10px] text-[#8A95A5]">
                                    {milestone.percentage_of_total}% del contrato
                                  </p>
                                </div>
                              </div>

                              {/* Firmas */}
                              {(approval || milestone.status !== 'pending') && (
                                <div className="border-t border-[#27384A] px-5 py-3 flex flex-wrap items-center gap-6">
                                  <div className="flex items-center gap-2 text-xs">
                                    {approval?.company_approved_at ? (
                                      <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                                    ) : (
                                      <Clock size={12} className="text-[#64748b]" />
                                    )}
                                    <span className={approval?.company_approved_at ? 'text-[#4A9E6B]' : 'text-[#64748b]'}>
                                      Constructora: {approval?.company_approved_at
                                        ? `${approval.company_approved_by_name ?? 'Firmado'} · ${fmtDate(approval.company_approved_at)}`
                                        : 'Pendiente'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    {approval?.client_approved_at ? (
                                      <CheckCircle2 size={12} className="text-[#4A9E6B]" />
                                    ) : (
                                      <Clock size={12} className={canApprove ? 'text-[#FF6B35]' : 'text-[#64748b]'} />
                                    )}
                                    <span className={
                                      approval?.client_approved_at
                                        ? 'text-[#4A9E6B]'
                                        : canApprove ? 'text-[#FF6B35]' : 'text-[#64748b]'
                                    }>
                                      Cliente: {approval?.client_approved_at
                                        ? `Firmado · ${fmtDate(approval.client_approved_at)}`
                                        : canApprove ? 'Requiere tu firma' : 'Pendiente'}
                                    </span>
                                  </div>

                                  {canApprove && (
                                    <button
                                      onClick={() => setApprovalModal(milestone)}
                                      className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-[#FF6B35] text-[#1A2530] text-xs font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                                    >
                                      <ShieldCheck size={12} />
                                      Revisar y firmar
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Evidencia (collapsible preview) */}
                              {milestone.evidence.length > 0 && (
                                <div className="border-t border-[#27384A] px-5 py-3">
                                  <p className="text-[10px] text-[#64748b] uppercase tracking-widest mb-2">
                                    {milestone.evidence.length} foto{milestone.evidence.length > 1 ? 's' : ''} de evidencia
                                  </p>
                                  <div className="flex gap-2 overflow-x-auto pb-1">
                                    {milestone.evidence.map((ev) => (
                                      <div key={ev.id} className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-[#27384A]">
                                        <Image src={ev.photo_url} alt={ev.caption || 'Evidencia'} fill className="object-cover" sizes="80px" />
                                      </div>
                                    ))}
                                    {milestone.status === 'awaiting_approval' && (
                                      <button
                                        onClick={() => setApprovalModal(milestone)}
                                        className="w-20 h-14 rounded-lg border border-dashed border-[#FF6B35]/40 flex items-center justify-center text-[#FF6B35] flex-shrink-0 hover:bg-[#FF6B35]/5 transition-colors text-[10px] text-center leading-tight p-1"
                                      >
                                        Ver y firmar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB: Mensajes ────────────────────────── */}
                {activeTab === 'messages' && (
                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-5" style={{ height: 'calc(100vh - 9rem)' }}>

                    {/* ── Chat ── */}
                    <div className="flex flex-col min-h-0">
                      <h2 className="text-lg font-semibold mb-4 shrink-0" style={{ fontFamily: 'Montserrat, sans-serif', color: '#F0EDE8' }}>
                        Mensajes con tu asesor
                      </h2>

                      <div className="flex-1 rounded-xl bg-[#1F2D3A] border border-[#27384A] flex flex-col overflow-hidden min-h-0">

                        {/* Lista */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                          {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center">
                              <div className="text-center space-y-2">
                                <MessageSquare size={28} style={{ color: '#8A95A5', margin: '0 auto' }} />
                                <p className="text-sm" style={{ color: '#8A95A5' }}>Aún no hay mensajes.</p>
                                <p className="text-xs" style={{ color: '#8A95A5' }}>Escribe tu primera consulta a tu asesor.</p>
                              </div>
                            </div>
                          ) : messages.map((msg) => {
                            const isOwn = msg.author === user?.id
                            const _d    = new Date(msg.created_at)
                            const time  = `${String(_d.getHours()).padStart(2,'0')}:${String(_d.getMinutes()).padStart(2,'0')}`
                            const date  = `${String(_d.getDate()).padStart(2,'0')} ${MONTHS[_d.getMonth()]}`
                            return (
                              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: '4px' }}>
                                {/* Autor */}
                                <span style={{ fontSize: '11px', fontWeight: 600, color: isOwn ? '#FF6B35' : '#8A95A5', paddingInline: '4px' }}>
                                  {isOwn ? 'Tú' : msg.author_name}
                                </span>
                                {/* Burbuja */}
                                <div
                                  style={{
                                    maxWidth: '78%',
                                    padding: '10px 14px',
                                    fontSize: '14px',
                                    lineHeight: '1.55',
                                    borderRadius: isOwn ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                                    background: isOwn ? '#FF6B35' : '#27384A',
                                    color: isOwn ? '#1A2530' : '#F0EDE8',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {msg.body}
                                </div>
                                {/* Timestamp */}
                                <span style={{ fontSize: '10px', color: '#8A95A5', paddingInline: '4px' }}>
                                  {time} · {date}
                                </span>

                                {/* Replies */}
                                {msg.replies.map((reply) => {
                                  const rOwn = reply.author === user?.id
                                  const _rd  = new Date(reply.created_at)
                                  const rt   = `${String(_rd.getHours()).padStart(2,'0')}:${String(_rd.getMinutes()).padStart(2,'0')}`
                                  return (
                                    <div key={reply.id} style={{ display: 'flex', flexDirection: 'column', alignItems: rOwn ? 'flex-end' : 'flex-start', gap: '2px', width: '100%', paddingLeft: '12px' }}>
                                      <div style={{
                                        maxWidth: '72%', padding: '7px 12px', fontSize: '13px', lineHeight: '1.5',
                                        borderRadius: rOwn ? '0.75rem 0.75rem 0.25rem 0.75rem' : '0.75rem 0.75rem 0.75rem 0.25rem',
                                        background: rOwn ? 'rgba(255,107,53,0.75)' : '#1A2530',
                                        color: rOwn ? '#1A2530' : '#C5CDD8',
                                      }}>
                                        {reply.body}
                                      </div>
                                      <span style={{ fontSize: '10px', color: '#8A95A5', paddingInline: '4px' }}>{rt}</span>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                          <div ref={msgBottomRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-[#27384A] flex gap-3 items-center shrink-0">
                          <input
                            type="text"
                            value={msgInput}
                            onChange={(e) => setMsgInput(e.target.value)}
                            placeholder="Escribe un mensaje…"
                            disabled={msgSending}
                            className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-60"
                            style={{ background: '#1A2530', border: '1px solid #334155', color: '#F0EDE8' }}
                            onFocus={(e) => (e.target.style.borderColor = '#FF6B35')}
                            onBlur={(e)  => (e.target.style.borderColor = '#334155')}
                          />
                          <button
                            type="submit"
                            disabled={msgSending || !msgInput.trim()}
                            className="flex items-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ background: '#FF6B35', color: '#1A2530', padding: '10px 18px' }}
                          >
                            {msgSending ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                            Enviar
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* ── Panel derecho: info del asesor ── */}
                    <div className="hidden xl:flex flex-col gap-4 pt-12">

                      {/* Asesor */}
                      <div className="rounded-xl p-5 flex flex-col items-center text-center gap-3" style={{ background: '#1F2D3A', border: '1px solid #27384A' }}>
                        <UserAvatar
                          name={project?.project_manager_name ?? 'Asesor'}
                          avatarUrl={project?.project_manager_avatar}
                          size={56}
                        />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#F0EDE8', fontFamily: 'Montserrat, sans-serif' }}>
                            {project?.project_manager_name ?? 'Tu asesor'}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#8A95A5' }}>Gestor de proyecto</p>
                        </div>
                        <div className="w-full pt-2 border-t" style={{ borderColor: '#27384A' }}>
                          <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: '#8A95A5' }}>Proyecto</p>
                          <p className="text-xs font-medium" style={{ color: '#F0EDE8' }}>{project?.name}</p>
                        </div>
                      </div>

                      {/* Estado del proyecto */}
                      <div className="rounded-xl p-5" style={{ background: '#1F2D3A', border: '1px solid #27384A' }}>
                        <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: '#8A95A5' }}>Avance actual</p>
                        <div className="flex items-end gap-1.5 mb-2">
                          <span className="text-2xl font-bold" style={{ color: '#F0EDE8', fontFamily: 'Montserrat, sans-serif' }}>
                            {project?.progress_percentage ?? 0}%
                          </span>
                          <span className="text-xs mb-0.5" style={{ color: '#8A95A5' }}>completado</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#27384A' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${project?.progress_percentage ?? 0}%`, background: '#FF6B35' }} />
                        </div>
                      </div>

                      {/* Nota */}
                      <div className="rounded-xl p-4" style={{ background: '#1A2530', border: '1px solid #27384A' }}>
                        <p className="text-xs leading-relaxed" style={{ color: '#8A95A5' }}>
                          Los mensajes son respondidos en horario laboral. Para urgencias contacta directamente a tu asesor.
                        </p>
                      </div>
                    </div>

                  </div>
                )}

                {/* ── TAB: Órdenes de cambio ───────────────── */}
                {activeTab === 'change_orders' && (
                  <div className="space-y-5 max-w-6xl">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Órdenes de cambio
                        </h2>
                        {changeOrdersLoaded && changeOrders.length > 0 && (
                          <p className="text-xs text-[#8A95A5] mt-0.5">
                            {changeOrders.length} orden{changeOrders.length !== 1 ? 'es' : ''}
                            {pendingCOs.length > 0 && (
                              <span className="text-[#FF6B35]"> · {pendingCOs.length} requiere{pendingCOs.length > 1 ? 'n' : ''} tu firma</span>
                            )}
                          </p>
                        )}
                      </div>
                      {changeOrdersLoaded && changeOrders.length > 0 && (
                        <div className="flex items-center gap-0.5 p-0.5 bg-[#131D28] border border-[#27384A] rounded-lg">
                          <button onClick={() => setCoViewMode('list')}
                            className={cn('p-1.5 rounded-md transition-colors', coViewMode === 'list' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                            title="Vista lista"><List size={13} /></button>
                          <button onClick={() => setCoViewMode('cards')}
                            className={cn('p-1.5 rounded-md transition-colors', coViewMode === 'cards' ? 'bg-[#FF6B35] text-[#131D28]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                            title="Vista tarjetas"><LayoutGrid size={13} /></button>
                        </div>
                      )}
                    </div>

                    {/* Loading */}
                    {!changeOrdersLoaded && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 size={24} className="animate-spin text-[#FF6B35]" />
                      </div>
                    )}

                    {/* Empty */}
                    {changeOrdersLoaded && changeOrders.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <FileEdit size={32} className="text-[#64748b]" />
                        <p className="text-sm text-[#8A95A5]">Sin órdenes de cambio registradas.</p>
                        <p className="text-xs text-[#64748b]">Aparecerán aquí cuando la constructora las registre.</p>
                      </div>
                    )}

                    {/* ── Cards view ── */}
                    {changeOrdersLoaded && changeOrders.length > 0 && coViewMode === 'cards' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {changeOrders.map((co) => {
                          const needsSignature = co.status === 'in_review' && !!co.approval?.company_approved_at && !co.approval?.client_approved_at
                          return (
                            <div key={co.id} className={cn(
                              'rounded-xl border bg-[#1F2D3A] flex flex-col transition-colors',
                              needsSignature ? 'border-[#FF6B35]/40 hover:border-[#FF6B35]/60' : 'border-[#27384A] hover:border-[#334155]',
                            )}>
                              {/* Body */}
                              <div className="p-5 flex-1 space-y-3">
                                {/* Top row: ref + status + date */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
                                      OC-{String(co.number).padStart(3, '0')}
                                    </span>
                                    <COStatusChip status={co.status} />
                                  </div>
                                  <span className="text-[10px] text-[#4A5568] flex-shrink-0">{fmtDate(co.created_at)}</span>
                                </div>

                                {/* Title */}
                                <h3 className="text-sm font-semibold text-white leading-snug" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {co.title}
                                </h3>

                                {/* Description */}
                                {co.description && (
                                  <p className="text-xs text-[#8A95A5] leading-relaxed line-clamp-2">{co.description}</p>
                                )}

                                {/* Stats row */}
                                <div className="flex items-center gap-5 pt-1">
                                  <div>
                                    <p className="text-[10px] text-[#4A5568] mb-0.5">Monto</p>
                                    <p className="text-sm font-semibold" style={{
                                      fontFamily: 'Space Mono, monospace',
                                      color: Number(co.amount_gtq) >= 0 ? '#F59E0B' : '#4A9E6B',
                                    }}>
                                      {Number(co.amount_gtq) >= 0 ? '+' : ''}Q {Number(co.amount_gtq).toLocaleString('es-GT')}
                                    </p>
                                  </div>
                                  {co.schedule_days_impact !== 0 && (
                                    <div>
                                      <p className="text-[10px] text-[#4A5568] mb-0.5">Plazo</p>
                                      <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                                        {co.schedule_days_impact > 0 ? '+' : ''}{co.schedule_days_impact} días
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Footer: firmas */}
                              {co.approval && (
                                <div className="border-t border-[#27384A] px-5 py-3 space-y-2">
                                  <div className="flex items-center gap-4 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-xs">
                                      {co.approval.company_approved_at
                                        ? <CheckCircle2 size={11} className="text-[#4A9E6B]" />
                                        : <Clock size={11} className="text-[#64748b]" />}
                                      <span className={co.approval.company_approved_at ? 'text-[#4A9E6B]' : 'text-[#4A5568]'}>
                                        Constructora: {co.approval.company_approved_at ? 'Firmado' : 'Pendiente'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                      {co.approval.client_approved_at
                                        ? <CheckCircle2 size={11} className="text-[#4A9E6B]" />
                                        : <Clock size={11} className={needsSignature ? 'text-[#FF6B35]' : 'text-[#64748b]'} />}
                                      <span className={co.approval.client_approved_at ? 'text-[#4A9E6B]' : needsSignature ? 'text-[#FF6B35]' : 'text-[#4A5568]'}>
                                        Cliente: {co.approval.client_approved_at ? 'Firmado' : needsSignature ? 'Requiere tu firma' : 'Pendiente'}
                                      </span>
                                    </div>
                                  </div>
                                  {needsSignature && (
                                    <button
                                      onClick={() => setCoApprovalModal(co)}
                                      className="w-full flex items-center justify-center gap-2 py-2 bg-[#FF6B35] text-[#1A2530] text-xs font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                                    >
                                      <ShieldCheck size={12} />
                                      Revisar y firmar
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* ── List view ── */}
                    {changeOrdersLoaded && changeOrders.length > 0 && coViewMode === 'list' && (
                      <div className="rounded-xl border border-[#27384A] overflow-hidden">
                        {/* Header row */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-[#131D28] border-b border-[#27384A]">
                          <span className="w-[72px] text-[10px] font-semibold text-[#4A5568] uppercase tracking-wider flex-shrink-0">#</span>
                          <span className="flex-1 text-[10px] font-semibold text-[#4A5568] uppercase tracking-wider">Título</span>
                          <span className="w-28 text-[10px] font-semibold text-[#4A5568] uppercase tracking-wider text-right hidden sm:block">Monto</span>
                          <span className="w-24 text-[10px] font-semibold text-[#4A5568] uppercase tracking-wider text-center hidden md:block">Estado</span>
                          <span className="w-28 flex-shrink-0" />
                        </div>
                        {changeOrders.map((co, i) => {
                          const needsSignature = co.status === 'in_review' && !!co.approval?.company_approved_at && !co.approval?.client_approved_at
                          return (
                            <div key={co.id} className={cn(
                              'flex items-center gap-3 px-4 py-3 hover:bg-[#1F2D3A]/60 transition-colors',
                              i > 0 && 'border-t border-[#27384A]',
                              needsSignature && 'border-l-2 border-l-[#FF6B35]',
                            )}>
                              <span className="text-[10px] text-[#FF6B35] flex-shrink-0 w-[72px]" style={{ fontFamily: 'Space Mono, monospace' }}>
                                OC-{String(co.number).padStart(3, '0')}
                              </span>
                              <p className="flex-1 text-sm text-white font-medium truncate min-w-0">{co.title}</p>
                              <span className={cn('text-xs w-28 text-right hidden sm:block flex-shrink-0', Number(co.amount_gtq) >= 0 ? 'text-amber-400' : 'text-[#4A9E6B]')}
                                style={{ fontFamily: 'Space Mono, monospace' }}>
                                {Number(co.amount_gtq) >= 0 ? '+' : ''}Q {Number(co.amount_gtq).toLocaleString('es-GT')}
                              </span>
                              <div className="w-24 hidden md:block flex-shrink-0 text-center">
                                <COStatusChip status={co.status} />
                              </div>
                              <div className="w-28 flex-shrink-0 flex justify-end">
                                {needsSignature && (
                                  <button
                                    onClick={() => setCoApprovalModal(co)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-[#1A2530] text-[10px] font-semibold rounded-lg hover:bg-[#FF8557] transition-colors"
                                  >
                                    <ShieldCheck size={11} />
                                    Firmar
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                  </div>
                )}

                {/* ── TAB: Documentos ──────────────────────── */}
                {activeTab === 'documents' && (() => {
                  const DOC_TYPES: { value: DocumentType | 'all'; label: string; Icon: React.ElementType }[] = [
                    { value: 'all',           label: 'Todos',          Icon: FileText },
                    { value: 'contract',      label: 'Contratos',      Icon: FileText },
                    { value: 'blueprint',     label: 'Planos',         Icon: FileText },
                    { value: 'specification', label: 'Especificaciones',Icon: FileText },
                    { value: 'report',        label: 'Reportes',       Icon: FileText },
                    { value: 'permit',        label: 'Permisos',       Icon: FileText },
                    { value: 'other',         label: 'Otros',          Icon: FileText },
                  ]
                  const TYPE_LABELS: Record<DocumentType, string> = {
                    contract: 'Contrato', blueprint: 'Plano', specification: 'Especificación',
                    report: 'Reporte', permit: 'Permiso', other: 'Otro',
                  }
                  const TYPE_COLORS: Record<DocumentType, string> = {
                    contract: '#FF6B35', blueprint: '#6B8CFF', specification: '#4A9E6B',
                    report: '#F59E0B', permit: '#EC4899', other: '#8A95A5',
                  }
                  const filtered = docsFilter === 'all' ? documents : documents.filter(d => d.document_type === docsFilter)

                  function fmtSize(kb: number | null) {
                    if (!kb) return ''
                    if (kb < 1024) return `${kb} KB`
                    return `${(kb / 1024).toFixed(1)} MB`
                  }

                  return (
                    <div className="space-y-5">
                      {/* Header */}
                      <div>
                        <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Documentos del proyecto</h2>
                        <p className="text-xs text-[#8A95A5] mt-0.5">{documents.length} documento{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''}</p>
                      </div>

                      {/* Filtros por tipo */}
                      <div className="flex gap-2 flex-wrap">
                        {DOC_TYPES.filter(t => t.value === 'all' || documents.some(d => d.document_type === t.value)).map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setDocsFilter(value)}
                            className={cn(
                              'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border',
                              docsFilter === value
                                ? 'bg-[#FF6B35] text-[#131D28] border-[#FF6B35]'
                                : 'border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#FF6B35]/30',
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Lista de documentos */}
                      {docsLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <Loader2 size={20} className="animate-spin text-[#FF6B35]" />
                        </div>
                      ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                          <div className="w-12 h-12 rounded-full bg-[#1F2D3A] border border-[#27384A] flex items-center justify-center">
                            <FileText size={20} className="text-[#4A5568]" />
                          </div>
                          <p className="text-sm text-[#8A95A5]">No hay documentos en esta categoría.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filtered.map(doc => (
                            <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/20 transition-colors group">
                              {/* Icono de tipo */}
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${TYPE_COLORS[doc.document_type]}18` }}
                              >
                                <FileText size={18} style={{ color: TYPE_COLORS[doc.document_type] }} />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm font-medium text-[#F0EDE8] truncate">{doc.title}</p>
                                  {doc.version && doc.version !== '1.0' && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#27384A] text-[#8A95A5] flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>v{doc.version}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-[#4A5568]">
                                  <span
                                    className="px-1.5 py-0.5 rounded font-medium"
                                    style={{ background: `${TYPE_COLORS[doc.document_type]}18`, color: TYPE_COLORS[doc.document_type] }}
                                  >
                                    {TYPE_LABELS[doc.document_type]}
                                  </span>
                                  {doc.file_name && <span className="truncate hidden sm:inline">{doc.file_name}</span>}
                                  {doc.file_size_kb && <span className="flex-shrink-0">{fmtSize(doc.file_size_kb)}</span>}
                                  <span className="flex-shrink-0" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtDate(doc.created_at.slice(0, 10))}</span>
                                </div>
                                {doc.description && (
                                  <p className="text-[10px] text-[#8A95A5] mt-0.5 truncate">{doc.description}</p>
                                )}
                              </div>

                              {/* Descarga */}
                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#FF6B35]/40 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                >
                                  <Download size={13} />
                                  <span className="hidden sm:inline">Descargar</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* ── TAB: Cotización ───────────────────────────────────────────────── */}
                {activeTab === 'cotizacion' && (() => {
                  if (!quoteLoaded) return (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 size={22} className="animate-spin text-[#FF6B35]" />
                    </div>
                  )
                  if (!quote) return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#27384A] flex items-center justify-center mb-4">
                        <DollarSign size={26} className="text-[#8A95A5]" />
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1">Sin cotización disponible</h3>
                      <p className="text-sm text-[#8A95A5] max-w-xs">El equipo aún no ha generado una cotización para este proyecto.</p>
                    </div>
                  )

                  const subtotal = quote.subtotal_amount
                  const discountAmt = quote.discount_amount
                  const taxAmt = quote.tax_amount
                  const total = quote.total_amount

                  const fmtQ = (n: number) => `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
                  const UNIT_MAP: Record<string, string> = { unit: 'Unidad', m2: 'm²', m3: 'm³', ml: 'Metro lineal', kg: 'Kilogramo', lb: 'Libra', ton: 'Tonelada', l: 'Litro', bag: 'Saco', roll: 'Rollo', box: 'Caja', gal: 'Galón' }
                  const resolveUnit = (u?: string | null) => { if (!u) return ''; return UNIT_MAP[u] ?? u }

                  const CATEGORY_LABELS: Record<string, string> = { materials: 'Materiales', labor: 'Mano de obra', equipment: 'Equipos', other: 'Otros' }
                  const CATEGORY_COLORS: Record<string, string> = { materials: 'text-[#FF6B35] bg-[#FF6B35]/10', labor: 'text-[#6B8CFF] bg-[#6B8CFF]/10', equipment: 'text-amber-400 bg-amber-400/10', other: 'text-[#8A95A5] bg-[#27384A]' }

                  return (
                    <div className="space-y-5 pb-6">

                      {/* Status banner */}
                      {quote.status === 'sent' && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                          <AlertTriangle size={16} className="text-[#FF6B35] flex-shrink-0" />
                          <p className="text-xs text-[#F0EDE8] font-medium">Tienes una cotización pendiente de revisión. Por favor revisa y aprueba, solicita cambios o rechaza.</p>
                        </div>
                      )}
                      {quote.status === 'approved' && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#4A9E6B]/10 border border-[#4A9E6B]/20">
                          <CheckCircle2 size={16} className="text-[#4A9E6B] flex-shrink-0" />
                          <p className="text-xs text-[#8A95A5]">Aprobaste esta cotización el {fmtD(quote.decided_at)}. Total: <span className="text-[#4A9E6B] font-semibold">{fmtQ(total)}</span></p>
                        </div>
                      )}
                      {quote.status === 'changes_requested' && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20">
                          <RotateCcw size={16} className="text-amber-400 flex-shrink-0" />
                          <p className="text-xs text-[#8A95A5]">Solicitaste cambios. El equipo está preparando una nueva versión.</p>
                        </div>
                      )}
                      {quote.status === 'rejected' && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                          <XCircle size={16} className="text-red-400 flex-shrink-0" />
                          <p className="text-xs text-[#8A95A5]">Rechazaste esta cotización. El equipo ha sido notificado.</p>
                        </div>
                      )}

                      {/* Quote document */}
                      <div className="bg-[#131D28] border border-[#27384A] rounded-2xl overflow-hidden">

                        {/* Document header with logo */}
                        <div className="px-6 py-5 border-b border-[#27384A] flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {brandLogoUrl ? (
                              <Image src={brandLogoUrl} alt={brandName} width={120} height={40} className="h-10 w-auto" unoptimized />
                            ) : (
                              <div className="h-10 w-28 rounded-lg bg-[#1F2D3A] border border-[#27384A] flex items-center justify-center">
                                <span className="text-xs font-bold text-[#FF6B35]">{brandName}</span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">{brandName}</p>
                              {brandTagline && <p className="text-[11px] text-[#8A95A5]">{brandTagline}</p>}
                            </div>
                          </div>
                          <div className="sm:text-right">
                            <div className="flex sm:flex-col sm:items-end gap-2 flex-wrap">
                              <span className="text-[10px] text-[#FF6B35] uppercase tracking-widest font-medium" style={{ fontFamily: 'Space Mono, monospace' }}>Cotización</span>
                              <span className="text-xs text-[#8A95A5]">Revisión {quote.revision}</span>
                              {quote.valid_until && <span className="text-[11px] text-[#8A95A5]">Válida hasta: {fmtD(quote.valid_until)}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Line items */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-[#27384A]">
                                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[120px]">Categoría</th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide">Descripción</th>
                                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[70px]">Cant.</th>
                                <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[70px]">Und.</th>
                                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[110px]">P. Unit.</th>
                                <th className="px-4 py-2.5 text-right text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[110px]">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quote.line_items.map((item, i) => (
                                <tr key={i} className="border-b border-[#1F2D3A]">
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.other}`}>
                                      {CATEGORY_LABELS[item.category] ?? item.category}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-[#F0EDE8]">{item.description}</td>
                                  <td className="px-4 py-3 text-xs text-[#F0EDE8] text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 text-xs text-[#8A95A5]">{resolveUnit(item.unit_display || item.unit) || '—'}</td>
                                  <td className="px-4 py-3 text-xs text-[#F0EDE8] text-right">{fmtQ(Number(item.unit_price))}</td>
                                  <td className="px-4 py-3 text-xs font-medium text-[#F0EDE8] text-right">{fmtQ(Number(item.quantity) * Number(item.unit_price))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Footer: notes + totals */}
                        <div className="px-6 py-5 border-t border-[#27384A] flex flex-col md:flex-row gap-6 justify-between">
                          {quote.notes ? (
                            <div className="flex-1 max-w-md">
                              <p className="text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide mb-2">Notas / Condiciones</p>
                              <p className="text-xs text-[#8A95A5] leading-relaxed whitespace-pre-wrap">{quote.notes}</p>
                            </div>
                          ) : <div className="flex-1" />}

                          {/* Totals */}
                          <div className="bg-[#1F2D3A] border border-[#27384A] rounded-xl p-4 w-full md:w-64 space-y-2 flex-shrink-0">
                            <div className="flex justify-between text-xs text-[#8A95A5]">
                              <span>Subtotal</span><span className="text-[#F0EDE8]">{fmtQ(subtotal)}</span>
                            </div>
                            {discountAmt > 0 && (
                              <div className="flex justify-between text-xs text-[#8A95A5]">
                                <span>Descuento ({quote.discount_pct}%)</span><span className="text-[#F0EDE8]">−{fmtQ(discountAmt)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-xs text-[#8A95A5]">
                              <span>IVA ({quote.tax_pct}%)</span><span className="text-[#F0EDE8]">{fmtQ(taxAmt)}</span>
                            </div>
                            <div className="border-t border-[#27384A] pt-2 flex justify-between items-center">
                              <span className="text-sm font-bold text-white">TOTAL</span>
                              <span className="text-lg font-bold text-[#FF6B35]">{fmtQ(total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action bar — only shown if status === 'sent' */}
                      {quote.status === 'sent' && (
                        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-[#131D28] border border-[#27384A] rounded-2xl">
                          <p className="text-xs text-[#8A95A5] flex-1 self-center">¿Esta cotización cumple con tus expectativas?</p>
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => { setRejectModal(true); setQuoteComment('') }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <XCircle size={13} /> Rechazar
                            </button>
                            <button
                              onClick={() => { setChangesModal(true); setQuoteComment('') }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-400/30 text-xs text-amber-400 hover:bg-amber-400/10 transition-colors"
                            >
                              <RotateCcw size={13} /> Solicitar cambios
                            </button>
                            <button
                              onClick={() => { setApproveModal(true); setSignatureConfirmed(false) }}
                              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#4A9E6B] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                              <CheckCircle2 size={13} />
                              Aprobar cotización
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Modal: solicitar cambios */}
                      {changesModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                          <div className="bg-[#1A2530] border border-[#27384A] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
                            <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Solicitar cambios</h3>
                            <p className="text-xs text-[#8A95A5]">Describe los cambios que necesitas. El equipo recibirá tu comentario y te enviará una nueva versión.</p>
                            <textarea
                              value={quoteComment}
                              onChange={e => setQuoteComment(e.target.value)}
                              rows={4}
                              placeholder="Ej: Por favor ajusta el presupuesto de materiales y añade mano de obra para instalación eléctrica…"
                              className="w-full bg-[#131D28] border border-[#27384A] rounded-xl px-3 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setChangesModal(false)} className="px-4 py-2 text-xs text-[#8A95A5] border border-[#27384A] rounded-xl hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                              <button
                                disabled={quoteActionLoading || !quoteComment.trim()}
                                onClick={async () => {
                                  if (!project) return
                                  setQuoteActionLoading(true)
                                  try {
                                    const updated = await requestChangesProjectQuote(project.id, quote.id, quoteComment)
                                    setQuote(updated)
                                    setChangesModal(false)
                                    toast.success('Solicitud enviada al equipo')
                                  } catch (e: any) {
                                    toast.error(e.message ?? 'Error')
                                  } finally { setQuoteActionLoading(false) }
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-[#131D28] text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                              >
                                {quoteActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                Enviar solicitud
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Modal: firma digital — aprobar */}
                      {approveModal && quote && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                          <div className="bg-[#1A2530] border border-[#27384A] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Firma digital — Aprobar cotización</h3>
                                <p className="text-xs text-[#8A95A5] mt-0.5">Al firmar aceptas los términos y el monto indicado en la cotización.</p>
                              </div>
                              <button onClick={() => setApproveModal(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors mt-0.5 flex-shrink-0">
                                <XCircle size={18} />
                              </button>
                            </div>

                            {/* Resumen de la cotización */}
                            <div className="bg-[#131D28] border border-[#27384A] rounded-xl p-4 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-[#8A95A5]">Número</span>
                                <span className="text-xs font-semibold text-[#FF6B35]">{quote.quote_number || `COT-${quote.id}`}</span>
                              </div>
                              {quote.revision > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-[#8A95A5]">Revisión</span>
                                  <span className="text-xs text-[#F0EDE8]">Rev. {quote.revision}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center border-t border-[#27384A] pt-2 mt-2">
                                <span className="text-xs font-semibold text-[#8A95A5]">Total</span>
                                <span className="text-sm font-bold text-[#F0EDE8]">
                                  {quote.currency} {Number(quote.total).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>

                            {/* Checkbox de confirmación */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <div className="relative flex-shrink-0 mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={signatureConfirmed}
                                  onChange={e => setSignatureConfirmed(e.target.checked)}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  signatureConfirmed
                                    ? 'bg-[#4A9E6B] border-[#4A9E6B]'
                                    : 'border-[#27384A] group-hover:border-[#4A9E6B]/60'
                                }`}>
                                  {signatureConfirmed && (
                                    <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                                      <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-[#8A95A5] leading-relaxed group-hover:text-[#F0EDE8] transition-colors">
                                He revisado la cotización en detalle y acepto los términos, alcance y monto indicado. Entiendo que esta aprobación es vinculante y autoriza al equipo a proceder con los trabajos descritos.
                              </span>
                            </label>

                            {/* Acciones */}
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                onClick={() => setApproveModal(false)}
                                className="px-4 py-2 text-xs text-[#8A95A5] border border-[#27384A] rounded-xl hover:text-[#F0EDE8] transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                disabled={quoteActionLoading || !signatureConfirmed}
                                onClick={async () => {
                                  if (!project) return
                                  setQuoteActionLoading(true)
                                  try {
                                    const updated = await approveProjectQuote(project.id, quote.id)
                                    setQuote(updated)
                                    setApproveModal(false)
                                    toast.success('¡Cotización aprobada con firma digital!')
                                  } catch (e: any) {
                                    toast.error(e.message ?? 'Error al aprobar')
                                  } finally { setQuoteActionLoading(false) }
                                }}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#4A9E6B] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {quoteActionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                Firmar y aprobar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Modal: rechazar */}
                      {rejectModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                          <div className="bg-[#1A2530] border border-[#27384A] rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
                            <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rechazar cotización</h3>
                            <p className="text-xs text-[#8A95A5]">Puedes opcionalmente indicar el motivo del rechazo para que el equipo pueda tomar acción.</p>
                            <textarea
                              value={quoteComment}
                              onChange={e => setQuoteComment(e.target.value)}
                              rows={3}
                              placeholder="Motivo del rechazo (opcional)…"
                              className="w-full bg-[#131D28] border border-[#27384A] rounded-xl px-3 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setRejectModal(false)} className="px-4 py-2 text-xs text-[#8A95A5] border border-[#27384A] rounded-xl hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                              <button
                                disabled={quoteActionLoading}
                                onClick={async () => {
                                  if (!project) return
                                  setQuoteActionLoading(true)
                                  try {
                                    const updated = await rejectProjectQuote(project.id, quote.id, quoteComment)
                                    setQuote(updated)
                                    setRejectModal(false)
                                    toast.success('Cotización rechazada')
                                  } catch (e: any) {
                                    toast.error(e.message ?? 'Error')
                                  } finally { setQuoteActionLoading(false) }
                                }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                              >
                                {quoteActionLoading ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                                Confirmar rechazo
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )
                })()}


              </>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
