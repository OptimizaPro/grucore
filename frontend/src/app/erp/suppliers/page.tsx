'use client'

import { useState, useEffect } from 'react'
import {
  Menu, Truck, Plus, X, Loader2, AlertCircle,
  Search, Star, Phone, Mail, Globe, MapPin, User, Edit2, Trash2,
  LayoutGrid, List,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import Pagination from '@/components/erp/Pagination'
import {
  getMe, getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  type User as UserType, type Supplier, type SupplierCategory,
} from '@/lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: SupplierCategory; label: string }[] = [
  { value: 'materials',     label: 'Materiales' },
  { value: 'equipment',     label: 'Equipos y maquinaria' },
  { value: 'subcontractor', label: 'Subcontratista' },
  { value: 'services',      label: 'Servicios' },
  { value: 'tools',         label: 'Herramientas' },
  { value: 'transport',     label: 'Transporte' },
  { value: 'other',         label: 'Otro' },
]

const CATEGORY_COLORS: Record<SupplierCategory, string> = {
  materials:     '#FF6B35',
  equipment:     '#4A9E6B',
  subcontractor: '#6B8CFF',
  services:      '#F59E0B',
  tools:         '#8B5CF6',
  transport:     '#EC4899',
  other:         '#8A95A5',
}

const SUPPLIERS_PER_PAGE = 12

const inputCls =
  'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

// ─── Star rating component ────────────────────────────────────────────────────

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={cn('transition-colors', readonly ? 'cursor-default' : 'hover:text-yellow-400')}
        >
          <Star
            size={readonly ? 12 : 16}
            className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-[#27384A]'}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Supplier form ────────────────────────────────────────────────────────────

interface SupplierFormState {
  name: string
  category: SupplierCategory
  contact_person: string
  email: string
  phone: string
  nit: string
  address: string
  website: string
  notes: string
  rating: number
}

const EMPTY_FORM: SupplierFormState = {
  name: '', category: 'other', contact_person: '', email: '',
  phone: '', nit: '', address: '', website: '', notes: '', rating: 0,
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ERPSuppliersPage() {
  const [me, setMe]                         = useState<UserType | null>(null)
  const [suppliers, setSuppliers]           = useState<Supplier[]>([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  const [searchQuery, setSearchQuery]       = useState('')
  const [filterCategory, setFilterCategory] = useState<SupplierCategory | ''>('')
  const [showForm, setShowForm]             = useState(false)
  const [editingId, setEditingId]           = useState<number | null>(null)
  const [formLoading, setFormLoading]       = useState(false)
  const [formError, setFormError]           = useState('')
  const [deleteConfirm, setDeleteConfirm]   = useState<number | null>(null)
  const [form, setForm]                     = useState<SupplierFormState>(EMPTY_FORM)
  const [supplierPage, setSupplierPage]     = useState(1)
  const [viewMode, setViewMode]             = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    async function init() {
      try {
        const user = await getMe()
        if (user.role === 'client_portal') { window.location.href = '/portal'; return }
        setMe(user)
        const data = await getSuppliers()
        setSuppliers(data)
      } catch (e: any) {
        if (e.message === 'Sesión expirada') return
        setError(e.message ?? 'Error al cargar proveedores')
      } finally { setLoading(false) }
    }
    init()
  }, [])

  const filtered = suppliers.filter(s => {
    const matchSearch = !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
    const matchCat = !filterCategory || s.category === filterCategory
    return matchSearch && matchCat
  })

  const pagedSuppliers = filtered.slice((supplierPage - 1) * SUPPLIERS_PER_PAGE, supplierPage * SUPPLIERS_PER_PAGE)

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(s: Supplier) {
    setForm({
      name: s.name, category: s.category, contact_person: s.contact_person,
      email: s.email, phone: s.phone, nit: s.nit, address: s.address,
      website: s.website, notes: s.notes, rating: s.rating,
    })
    setEditingId(s.id)
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  function setField<K extends keyof SupplierFormState>(key: K, value: SupplierFormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      if (editingId) {
        const updated = await updateSupplier(editingId, form)
        setSuppliers(prev => prev.map(s => s.id === editingId ? updated : s))
      } else {
        const created = await createSupplier(form)
        setSuppliers(prev => [created, ...prev])
      }
      closeForm()
      toast.success(editingId ? 'Proveedor actualizado' : 'Proveedor creado')
    } catch (e: any) { setFormError(e.message) }
    finally { setFormLoading(false) }
  }

  async function handleDelete(id: number) {
    const name = suppliers.find(s => s.id === id)?.name ?? 'Proveedor'
    try {
      await deleteSupplier(id)
      setSuppliers(prev => prev.filter(s => s.id !== id))
      setDeleteConfirm(null)
      toast.success(`"${name}" eliminado`)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar el proveedor')
    }
  }

  const initials = me
    ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : 'ST'

  const isAdmin = me?.role === 'admin' || me?.role === 'project_manager'

  // Stats
  const activeCount    = suppliers.filter(s => s.is_active).length
  const ratedCount     = suppliers.filter(s => s.rating > 0).length
  const avgRating      = ratedCount > 0
    ? (suppliers.filter(s => s.rating > 0).reduce((a, b) => a + b.rating, 0) / ratedCount).toFixed(1)
    : '—'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
          <p className="text-sm text-[#8A95A5]">Cargando proveedores…</p>
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

  return (
    <div className="min-h-screen bg-[#131D28] flex">
      <ERPSidebar
        currentPage="suppliers"
        userName={me?.full_name}
        userInitials={initials}
        userAvatarUrl={me?.avatar_url}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onUserUpdate={setMe}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Proveedores
          </p>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Nuevo proveedor</span>
            </button>
          )}
          <ERPAvatar avatarUrl={me?.avatar_url} initials={initials} size="md" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total proveedores', value: suppliers.length,           color: '#F0EDE8' },
                { label: 'Activos',           value: activeCount,                color: '#4A9E6B' },
                { label: 'Categorías',        value: CATEGORIES.length,          color: '#FF6B35' },
                { label: 'Rating promedio',   value: avgRating,                  color: '#F59E0B' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <p className="text-xs text-[#8A95A5] mb-3">{label}</p>
                  <p className="text-2xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Filters + view toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" />
                <input
                  type="text" value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSupplierPage(1) }}
                  placeholder="Buscar proveedor, contacto, email…"
                  className="w-full bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => { setFilterCategory(''); setSupplierPage(1) }}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    !filterCategory ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]',
                  )}
                >
                  Todos
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => { setFilterCategory(cat.value); setSupplierPage(1) }}
                    className={cn(
                      'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      filterCategory === cat.value ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]',
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* View toggle */}
              <div className="flex items-center gap-1 bg-[#1F2D3A] border border-[#27384A] rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => { setViewMode('grid'); setSupplierPage(1) }}
                  className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                  title="Vista cuadrícula"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  onClick={() => { setViewMode('list'); setSupplierPage(1) }}
                  className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                  title="Vista lista"
                >
                  <List size={14} />
                </button>
              </div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <Truck size={40} className="text-[#27384A]" />
                <p className="text-[#8A95A5] text-sm">
                  {suppliers.length === 0 ? 'No hay proveedores registrados aún.' : 'Sin resultados para esta búsqueda.'}
                </p>
                {suppliers.length === 0 && isAdmin && (
                  <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-[#131D28] text-xs font-semibold rounded-lg hover:bg-[#FF8557] transition-colors">
                    <Plus size={13} /> Agregar primer proveedor
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {pagedSuppliers.map(supplier => {
                    const catColor = CATEGORY_COLORS[supplier.category]
                    const isConfirmingDelete = deleteConfirm === supplier.id
                    return (
                      <div key={supplier.id} className={cn('p-5 rounded-xl bg-[#1F2D3A] border transition-colors', supplier.is_active ? 'border-[#27384A] hover:border-[#FF6B35]/30' : 'border-[#27384A]/50 opacity-60')}>
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${catColor}20` }}>
                              <Truck size={14} style={{ color: catColor }} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-[#F0EDE8] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>{supplier.name}</h3>
                              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-0.5" style={{ background: `${catColor}20`, color: catColor }}>{supplier.category_display}</span>
                            </div>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => openEdit(supplier)} className="p-1.5 rounded-md text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#27384A] transition-colors"><Edit2 size={12} /></button>
                              <button onClick={() => setDeleteConfirm(supplier.id)} className="p-1.5 rounded-md text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={12} /></button>
                            </div>
                          )}
                        </div>
                        {supplier.rating > 0 && <div className="mb-3"><StarRating value={supplier.rating} readonly /></div>}
                        <div className="space-y-1.5 mb-4">
                          {supplier.contact_person && <div className="flex items-center gap-2 text-xs text-[#8A95A5]"><User size={11} className="flex-shrink-0" /><span className="truncate">{supplier.contact_person}</span></div>}
                          {supplier.phone && <div className="flex items-center gap-2 text-xs text-[#8A95A5]"><Phone size={11} className="flex-shrink-0" /><a href={`tel:${supplier.phone}`} className="truncate hover:text-[#FF6B35] transition-colors">{supplier.phone}</a></div>}
                          {supplier.email && <div className="flex items-center gap-2 text-xs text-[#8A95A5]"><Mail size={11} className="flex-shrink-0" /><a href={`mailto:${supplier.email}`} className="truncate hover:text-[#FF6B35] transition-colors">{supplier.email}</a></div>}
                          {supplier.address && <div className="flex items-center gap-2 text-xs text-[#8A95A5]"><MapPin size={11} className="flex-shrink-0" /><span className="truncate">{supplier.address}</span></div>}
                          {supplier.website && <div className="flex items-center gap-2 text-xs text-[#8A95A5]"><Globe size={11} className="flex-shrink-0" /><a href={supplier.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-[#FF6B35] transition-colors">{supplier.website.replace(/^https?:\/\//, '')}</a></div>}
                        </div>
                        {supplier.notes && <p className="text-[11px] text-[#8A95A5] italic line-clamp-2 mb-3">{supplier.notes}</p>}
                        {supplier.nit && <p className="text-[10px] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>NIT: {supplier.nit}</p>}
                        {isConfirmingDelete && (
                          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-xs text-red-400 mb-2">¿Eliminar este proveedor?</p>
                            <div className="flex gap-2">
                              <button onClick={() => handleDelete(supplier.id)} className="flex-1 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors">Eliminar</button>
                              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-1.5 border border-[#27384A] text-xs text-[#8A95A5] rounded-md hover:text-[#F0EDE8] transition-colors">Cancelar</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <Pagination page={supplierPage} total={filtered.length} perPage={SUPPLIERS_PER_PAGE} onChange={p => { setSupplierPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
              </>
            ) : (
              /* ── List view ── */
              <>
                <div className="rounded-xl border border-[#27384A] overflow-hidden">
                  <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-4 px-4 py-2 bg-[#131D28] text-[10px] text-[#8A95A5] uppercase tracking-wider font-medium">
                    <span>Proveedor</span>
                    <span>Contacto</span>
                    <span>Teléfono / Email</span>
                    <span>Rating</span>
                    <span />
                  </div>
                  <div className="divide-y divide-[#27384A]">
                    {pagedSuppliers.map(supplier => {
                      const catColor = CATEGORY_COLORS[supplier.category]
                      const isConfirmingDelete = deleteConfirm === supplier.id
                      return (
                        <div key={supplier.id} className={cn('grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-4 items-center px-4 py-3 bg-[#1F2D3A] hover:bg-[#243344] transition-colors', !supplier.is_active && 'opacity-60')}>
                          {/* Name + category */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${catColor}20` }}>
                              <Truck size={12} style={{ color: catColor }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#F0EDE8] truncate">{supplier.name}</p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${catColor}20`, color: catColor }}>{supplier.category_display}</span>
                            </div>
                          </div>
                          {/* Contact */}
                          <div className="hidden sm:block min-w-0">
                            {supplier.contact_person
                              ? <p className="text-xs text-[#8A95A5] truncate">{supplier.contact_person}</p>
                              : <p className="text-xs text-[#8A95A5]">—</p>}
                            {supplier.nit && <p className="text-[10px] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>NIT: {supplier.nit}</p>}
                          </div>
                          {/* Phone / Email */}
                          <div className="hidden sm:block min-w-0 space-y-0.5">
                            {supplier.phone && <a href={`tel:${supplier.phone}`} className="flex items-center gap-1.5 text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors"><Phone size={10} />{supplier.phone}</a>}
                            {supplier.email && <a href={`mailto:${supplier.email}`} className="flex items-center gap-1.5 text-xs text-[#8A95A5] hover:text-[#FF6B35] transition-colors truncate"><Mail size={10} />{supplier.email}</a>}
                          </div>
                          {/* Rating */}
                          <div className="hidden sm:block">
                            {supplier.rating > 0 ? <StarRating value={supplier.rating} readonly /> : <span className="text-xs text-[#8A95A5]">—</span>}
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isConfirmingDelete ? (
                              <>
                                <span className="text-[10px] text-[#8A95A5] mr-1">¿Eliminar?</span>
                                <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded border border-[#27384A] text-[10px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
                                <button onClick={() => handleDelete(supplier.id)} className="px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors">Sí</button>
                              </>
                            ) : isAdmin ? (
                              <>
                                <button onClick={() => openEdit(supplier)} className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"><Edit2 size={13} /></button>
                                <button onClick={() => setDeleteConfirm(supplier.id)} className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:border-red-500/40 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <Pagination page={supplierPage} total={filtered.length} perPage={SUPPLIERS_PER_PAGE} onChange={p => { setSupplierPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Supplier create / edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={closeForm}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editingId ? 'Editar proveedor' : 'Nuevo proveedor'}
              </h3>
              <button onClick={closeForm} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
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

              {/* Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre <span className="text-[#FF6B35]">*</span></label>
                  <input
                    form="supplier-form"
                    required type="text" value={form.name}
                    onChange={e => setField('name', e.target.value)}
                    className={inputCls} placeholder="Cementos del Sur, S.A." />
                </div>
                <div>
                  <label className={labelCls}>Categoría <span className="text-[#FF6B35]">*</span></label>
                  <select
                    form="supplier-form"
                    value={form.category}
                    onChange={e => setField('category', e.target.value as SupplierCategory)}
                    className={cn(inputCls, 'cursor-pointer')}
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Persona de contacto</label>
                  <input
                    form="supplier-form"
                    type="text" value={form.contact_person}
                    onChange={e => setField('contact_person', e.target.value)}
                    className={inputCls} placeholder="Juan Pérez" />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input
                    form="supplier-form"
                    type="tel" value={form.phone}
                    onChange={e => setField('phone', e.target.value)}
                    className={inputCls} placeholder="+502 1234-5678" />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Correo electrónico</label>
                  <input
                    form="supplier-form"
                    type="email" value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    className={inputCls} placeholder="contacto@proveedor.com" />
                </div>
                <div>
                  <label className={labelCls}>NIT</label>
                  <input
                    form="supplier-form"
                    type="text" value={form.nit}
                    onChange={e => setField('nit', e.target.value)}
                    className={inputCls} placeholder="1234567-8" />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Sitio web</label>
                  <input
                    form="supplier-form"
                    type="url" value={form.website}
                    onChange={e => setField('website', e.target.value)}
                    className={inputCls} placeholder="https://proveedor.com" />
                </div>
                <div>
                  <label className={labelCls}>Dirección</label>
                  <input
                    form="supplier-form"
                    type="text" value={form.address}
                    onChange={e => setField('address', e.target.value)}
                    className={inputCls} placeholder="Zona 10, Ciudad de Guatemala" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notas</label>
                <textarea
                  form="supplier-form"
                  rows={2} value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  className={cn(inputCls, 'resize-none')}
                  placeholder="Condiciones de pago, tiempos de entrega, observaciones…"
                />
              </div>

              {/* Rating */}
              <div>
                <label className={labelCls}>Rating</label>
                <StarRating value={form.rating} onChange={v => setField('rating', v)} />
                <p className="text-[10px] text-[#8A95A5] mt-1">Haz clic en la misma estrella para quitar el rating.</p>
              </div>
            </div>

            {/* Footer */}
            <form
              id="supplier-form"
              onSubmit={handleSubmit}
              className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0"
            >
              <button
                type="button" onClick={closeForm}
                className="px-4 py-2 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit" disabled={formLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {formLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Guardando…</>
                  : <><Plus size={13} /> {editingId ? 'Guardar cambios' : 'Crear proveedor'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
