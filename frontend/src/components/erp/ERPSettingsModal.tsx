'use client'

import { useState, useEffect, useRef } from 'react'
import { X, User, Lock, Loader2, Check, AlertCircle, Upload, Eye, EyeOff, Building2, ImagePlus, RefreshCw } from 'lucide-react'
import { getMe, updateMe, uploadAvatar, changePassword, updateCompanySettings, uploadCompanyLogo, type User as UserType } from '@/lib/api'
import { getCompanySettings, invalidateCompanySettings, type CompanySettings } from '@/lib/company-settings'
import ERPAvatar from './ERPAvatar'
import Image from 'next/image'

type Tab = 'profile' | 'security' | 'marca'

const inputCls =
  'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#64748b] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

interface Props {
  onClose: () => void
  onSuccess: (user: UserType) => void
}

export default function ERPSettingsModal({ onClose, onSuccess }: Props) {
  const [tab, setTab]           = useState<Tab>('profile')
  const [user, setUser]         = useState<UserType | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Profile
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile]       = useState<File | null>(null)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileOk, setProfileOk]         = useState(false)
  const [profileErr, setProfileErr]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Brand
  const [brand, setBrand]                   = useState<CompanySettings | null>(null)
  const [brandName, setBrandName]           = useState('')
  const [brandTagline, setBrandTagline]     = useState('')
  const [logoDarkFile, setLogoDarkFile]     = useState<File | null>(null)
  const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(null)
  const [logoLightFile, setLogoLightFile]   = useState<File | null>(null)
  const [logoLightPreview, setLogoLightPreview] = useState<string | null>(null)
  const [brandDraggingDark, setBrandDraggingDark]   = useState(false)
  const [brandDraggingLight, setBrandDraggingLight] = useState(false)
  const [brandSaving, setBrandSaving]       = useState(false)
  const [brandOk, setBrandOk]               = useState(false)
  const [brandErr, setBrandErr]             = useState('')
  const logoDarkRef  = useRef<HTMLInputElement>(null)
  const logoLightRef = useRef<HTMLInputElement>(null)

  // Security
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew]         = useState(false)
  const [pwSaving, setPwSaving]     = useState(false)
  const [pwOk, setPwOk]             = useState(false)
  const [pwErr, setPwErr]           = useState('')

  // Load user on mount
  useEffect(() => {
    getMe().then(u => {
      setUser(u)
      setFirstName(u.first_name)
      setLastName(u.last_name)
      setPhone(u.phone ?? '')
      setAvatarPreview(u.avatar_url ?? null)
    }).finally(() => setLoadingUser(false))
    // Load brand settings
    getCompanySettings().then(s => {
      setBrand(s)
      setBrandName(s.name)
      setBrandTagline(s.tagline)
      setLogoDarkPreview(s.logo_url)
      setLogoLightPreview(s.logo_light_url)
    })
  }, [])

  // Close on ESC
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
    setProfileSaving(true)
    setProfileErr('')
    setProfileOk(false)
    try {
      let updated = await updateMe({ first_name: firstName, last_name: lastName, phone })
      if (avatarFile) updated = await uploadAvatar(avatarFile)
      setUser(updated)
      setAvatarPreview(updated.avatar_url ?? null)
      setAvatarFile(null)
      setProfileOk(true)
      onSuccess(updated)
      setTimeout(() => setProfileOk(false), 2500)
    } catch (err: any) {
      setProfileErr(err.message ?? 'Error al guardar')
    } finally {
      setProfileSaving(false)
    }
  }

  // ── Drag & drop helpers ──────────────────────────────────────────────────
  function handleLogoDrop(e: React.DragEvent, variant: 'dark' | 'light') {
    e.preventDefault()
    if (variant === 'dark') setBrandDraggingDark(false)
    else setBrandDraggingLight(false)
    const file = e.dataTransfer.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    if (variant === 'dark') {
      setLogoDarkFile(file)
      setLogoDarkPreview(URL.createObjectURL(file))
    } else {
      setLogoLightFile(file)
      setLogoLightPreview(URL.createObjectURL(file))
    }
  }

  function handleLogoInputChange(e: React.ChangeEvent<HTMLInputElement>, variant: 'dark' | 'light') {
    const file = e.target.files?.[0]
    if (!file) return
    if (variant === 'dark') {
      setLogoDarkFile(file)
      setLogoDarkPreview(URL.createObjectURL(file))
    } else {
      setLogoLightFile(file)
      setLogoLightPreview(URL.createObjectURL(file))
    }
  }

  async function saveBrand(e: React.FormEvent) {
    e.preventDefault()
    setBrandSaving(true)
    setBrandErr('')
    setBrandOk(false)
    try {
      await updateCompanySettings({ name: brandName, tagline: brandTagline })
      if (logoDarkFile)  await uploadCompanyLogo('dark',  logoDarkFile)
      if (logoLightFile) await uploadCompanyLogo('light', logoLightFile)
      invalidateCompanySettings()
      // Refresh local previews from fresh settings
      const fresh = await getCompanySettings()
      setBrand(fresh)
      setLogoDarkPreview(fresh.logo_url)
      setLogoLightPreview(fresh.logo_light_url)
      setLogoDarkFile(null)
      setLogoLightFile(null)
      setBrandOk(true)
      setTimeout(() => setBrandOk(false), 2500)
    } catch (err: any) {
      setBrandErr(err.message ?? 'Error al guardar marca')
    } finally {
      setBrandSaving(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) { setPwErr('Las contraseñas no coinciden.'); return }
    if (newPw.length < 8)    { setPwErr('La contraseña debe tener al menos 8 caracteres.'); return }
    setPwSaving(true)
    setPwErr('')
    setPwOk(false)
    try {
      await changePassword(currentPw, newPw)
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setPwOk(true)
      setTimeout(() => setPwOk(false), 2500)
    } catch (err: any) {
      setPwErr(err.message ?? 'Error al cambiar contraseña')
    } finally {
      setPwSaving(false)
    }
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : 'ST'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-[#1F2D3A] border border-[#27384A] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#27384A] flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-[10px] text-[#FF6B35] uppercase tracking-widest mb-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
              ERP · Configuración
            </p>
            <h2 className="text-lg font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Mi cuenta
            </h2>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#27384A] flex-shrink-0">
          {([
            { id: 'profile'  as Tab, label: 'Perfil',    Icon: User },
            { id: 'security' as Tab, label: 'Seguridad', Icon: Lock },
            { id: 'marca'    as Tab, label: 'Marca',     Icon: Building2 },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${
                tab === id
                  ? 'border-[#FF6B35] text-[#FF6B35]'
                  : 'border-transparent text-[#8A95A5] hover:text-[#F0EDE8]'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {loadingUser ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[#FF6B35]" />
            </div>
          ) : (
            <>
              {/* ── Perfil ── */}
              {tab === 'profile' && (
                <form onSubmit={saveProfile} className="space-y-5">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    <ERPAvatar avatarUrl={avatarPreview} initials={initials} size="lg" />
                    <div>
                      <p className="text-xs text-[#8A95A5] mb-2">Foto de perfil</p>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"
                      >
                        <Upload size={11} />
                        {avatarFile ? avatarFile.name : 'Cambiar foto'}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nombre <span className="text-[#FF6B35]">*</span></label>
                      <input
                        required
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className={inputCls}
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Apellido <span className="text-[#FF6B35]">*</span></label>
                      <input
                        required
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className={inputCls}
                        placeholder="Apellido"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Teléfono</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className={inputCls}
                      placeholder="+502 0000-0000"
                    />
                  </div>

                  <div>
                    <label className={labelCls}>Correo electrónico</label>
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className={`${inputCls} opacity-50 cursor-not-allowed`}
                    />
                    <p className="text-[10px] text-[#8A95A5] mt-1">El correo no puede modificarse desde aquí.</p>
                  </div>

                  {profileErr && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {profileErr}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full h-10 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors"
                  >
                    {profileSaving ? (
                      <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                    ) : profileOk ? (
                      <><Check size={14} /> Guardado</>
                    ) : (
                      'Guardar cambios'
                    )}
                  </button>
                </form>
              )}

              {/* ── Marca ── */}
              {tab === 'marca' && (
                <form onSubmit={saveBrand} className="space-y-6">
                  {/* Logo dark */}
                  <div>
                    <label className={labelCls}>Logo (fondo oscuro)</label>
                    <p className="text-[10px] text-[#8A95A5] mb-2">ERP sidebar, portal, exportaciones PDF</p>
                    <div
                      onDragOver={e => { e.preventDefault(); setBrandDraggingDark(true) }}
                      onDragLeave={() => setBrandDraggingDark(false)}
                      onDrop={e => handleLogoDrop(e, 'dark')}
                      onClick={() => logoDarkRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors h-28 ${
                        brandDraggingDark
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                          : 'border-[#27384A] hover:border-[#FF6B35]/40 bg-[#131D28]'
                      }`}
                    >
                      {logoDarkPreview ? (
                        <>
                          <Image
                            src={logoDarkPreview}
                            alt="Logo oscuro"
                            width={160}
                            height={64}
                            className="max-h-16 w-auto object-contain"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setLogoDarkFile(null); setLogoDarkPreview(null) }}
                            className="absolute top-2 right-2 text-[#8A95A5] hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={20} className="text-[#8A95A5]" />
                          <p className="text-xs text-[#8A95A5]">Arrastra o haz clic para subir</p>
                          <p className="text-[10px] text-[#8A95A5]">PNG, SVG o WebP recomendado</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={logoDarkRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleLogoInputChange(e, 'dark')}
                    />
                  </div>

                  {/* Logo light */}
                  <div>
                    <label className={labelCls}>Logo (fondo claro)</label>
                    <p className="text-[10px] text-[#8A95A5] mb-2">Sitio público — cabecera transparente</p>
                    <div
                      onDragOver={e => { e.preventDefault(); setBrandDraggingLight(true) }}
                      onDragLeave={() => setBrandDraggingLight(false)}
                      onDrop={e => handleLogoDrop(e, 'light')}
                      onClick={() => logoLightRef.current?.click()}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors h-28 ${
                        brandDraggingLight
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                          : 'border-[#27384A] hover:border-[#FF6B35]/40 bg-white/5'
                      }`}
                    >
                      {logoLightPreview ? (
                        <>
                          <Image
                            src={logoLightPreview}
                            alt="Logo claro"
                            width={160}
                            height={64}
                            className="max-h-16 w-auto object-contain"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); setLogoLightFile(null); setLogoLightPreview(null) }}
                            className="absolute top-2 right-2 text-[#8A95A5] hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={20} className="text-[#8A95A5]" />
                          <p className="text-xs text-[#8A95A5]">Arrastra o haz clic para subir</p>
                          <p className="text-[10px] text-[#8A95A5]">PNG, SVG o WebP recomendado</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={logoLightRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleLogoInputChange(e, 'light')}
                    />
                  </div>

                  {/* Name & Tagline */}
                  <div>
                    <label className={labelCls}>Nombre de empresa <span className="text-[#FF6B35]">*</span></label>
                    <input
                      required
                      type="text"
                      value={brandName}
                      onChange={e => setBrandName(e.target.value)}
                      className={inputCls}
                      placeholder="Grucore"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tagline</label>
                    <input
                      type="text"
                      value={brandTagline}
                      onChange={e => setBrandTagline(e.target.value)}
                      className={inputCls}
                      placeholder="Construcción y Remodelación Premium"
                    />
                  </div>

                  {brandErr && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {brandErr}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={brandSaving}
                    className="w-full h-10 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors"
                  >
                    {brandSaving ? (
                      <><Loader2 size={14} className="animate-spin" /> Guardando…</>
                    ) : brandOk ? (
                      <><Check size={14} /> Marca actualizada</>
                    ) : (
                      'Guardar marca'
                    )}
                  </button>
                </form>
              )}

              {/* ── Seguridad ── */}
              {tab === 'security' && (
                <form onSubmit={savePassword} className="space-y-5">
                  <div>
                    <label className={labelCls}>Contraseña actual <span className="text-[#FF6B35]">*</span></label>
                    <div className="relative">
                      <input
                        required
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPw}
                        onChange={e => setCurrentPw(e.target.value)}
                        className={`${inputCls} pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5] hover:text-[#8A95A5] transition-colors"
                      >
                        {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Nueva contraseña <span className="text-[#FF6B35]">*</span></label>
                    <div className="relative">
                      <input
                        required
                        type={showNew ? 'text' : 'password'}
                        value={newPw}
                        onChange={e => setNewPw(e.target.value)}
                        className={`${inputCls} pr-10`}
                        placeholder="Mínimo 8 caracteres"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5] hover:text-[#8A95A5] transition-colors"
                      >
                        {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Confirmar nueva contraseña <span className="text-[#FF6B35]">*</span></label>
                    <input
                      required
                      type="password"
                      value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)}
                      className={inputCls}
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>

                  {pwErr && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {pwErr}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={pwSaving}
                    className="w-full h-10 flex items-center justify-center gap-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors"
                  >
                    {pwSaving ? (
                      <><Loader2 size={14} className="animate-spin" /> Cambiando…</>
                    ) : pwOk ? (
                      <><Check size={14} /> Contraseña actualizada</>
                    ) : (
                      'Cambiar contraseña'
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
