'use client'

import { useState, useEffect } from 'react'
import {
  Menu, Package, Plus, X, Loader2, AlertCircle,
  TrendingDown, ArrowDownCircle, ArrowUpCircle, RotateCcw,
  Search, LayoutGrid, List,
  Eye, Pencil, Trash2, Tag, Check, Boxes,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import Pagination from '@/components/erp/Pagination'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getMe, getInventoryCategories, createInventoryCategory, updateInventoryCategory, deleteInventoryCategory,
  getProducts, createProduct, updateProduct, deleteProduct,
  getStockMovements, createStockMovement, getMyProjects,
  type User, type InventoryCategory, type Product, type StockMovement, type ProjectList,
} from '@/lib/api'

// ─── Units config ─────────────────────────────────────────────────────────────

const UNITS = [
  { value: 'unit', label: 'Unidad' },
  { value: 'm2',   label: 'm²' },
  { value: 'm3',   label: 'm³' },
  { value: 'ml',   label: 'Metro lineal' },
  { value: 'kg',   label: 'Kilogramo' },
  { value: 'lb',   label: 'Libra' },
  { value: 'ton',  label: 'Tonelada' },
  { value: 'l',    label: 'Litro' },
  { value: 'bag',  label: 'Saco' },
  { value: 'roll', label: 'Rollo' },
  { value: 'box',  label: 'Caja' },
  { value: 'gal',  label: 'Galón' },
]

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  in: 'Entrada',
  out: 'Salida',
  adjustment: 'Ajuste',
}

const CAT_COLORS = [
  '#FF6B35', '#4A9E6B', '#6B8CFF', '#f59e0b',
  '#f87171', '#a78bfa', '#34d399', '#fb7185',
  '#38bdf8', '#8A95A5',
]

// ─── Input styles ─────────────────────────────────────────────────────────────

const inputCls =
  'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

// ─── Pagination constants ─────────────────────────────────────────────────────

const PRODUCTS_PER_PAGE  = 12
const MOVEMENTS_PER_PAGE = 15

// ─── Inventory page ───────────────────────────────────────────────────────────

export default function ERPInventoryPage() {
  const [me, setMe]                               = useState<User | null>(null)
  const [categories, setCategories]               = useState<InventoryCategory[]>([])
  const [products, setProducts]                   = useState<Product[]>([])
  const [movements, setMovements]                 = useState<StockMovement[]>([])
  const [projects, setProjects]                   = useState<ProjectList[]>([])
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState('')
  const [sidebarOpen, setSidebarOpen]             = useState(false)
  const [activeTab, setActiveTab]                 = useState<'products' | 'movements' | 'categories'>('products')
  const [viewMode, setViewMode]                   = useState<'grid' | 'list'>('grid')
  const [productPage, setProductPage]             = useState(1)
  const [movementPage, setMovementPage]           = useState(1)
  const [searchQuery, setSearchQuery]             = useState('')
  const [selectedCategory, setSelectedCategory]   = useState<number | null>(null)
  const [showProductForm, setShowProductForm]     = useState(false)
  const [showMovementForm, setShowMovementForm]   = useState(false)
  const [viewingProduct, setViewingProduct]       = useState<Product | null>(null)
  const [editingProduct, setEditingProduct]       = useState<Product | null>(null)
  const [deletingId, setDeletingId]               = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId]     = useState<number | null>(null)
  const [formLoading, setFormLoading]             = useState(false)
  const [formError, setFormError]                 = useState('')

  // Product form (shared create / edit)
  const [pName, setPName]         = useState('')
  const [pSku, setPSku]           = useState('')
  const [pCategory, setPCategory] = useState('')
  const [pUnit, setPUnit]         = useState('unit')
  const [pPrice, setPPrice]       = useState('')
  const [pMinStock, setPMinStock] = useState('0')
  const [pSupplier, setPSupplier] = useState('')
  const [pDesc, setPDesc]         = useState('')

  // Movement form
  const [mProduct, setMProduct]   = useState('')
  const [mType, setMType]         = useState<'in' | 'out' | 'adjustment'>('in')
  const [mQty, setMQty]           = useState('')
  const [mPrice, setMPrice]       = useState('')
  const [mProject, setMProject]   = useState('')
  const [mNotes, setMNotes]       = useState('')
  const [mRef, setMRef]           = useState('')

  // Category form
  const [showCatForm, setShowCatForm]           = useState(false)
  const [editingCat, setEditingCat]             = useState<InventoryCategory | null>(null)
  const [catName, setCatName]                   = useState('')
  const [catColor, setCatColor]                 = useState('#FF6B35')
  const [catDesc, setCatDesc]                   = useState('')
  const [catTracksStock, setCatTracksStock]     = useState(true)
  const [catFormLoading, setCatFormLoading]     = useState(false)
  const [catFormError, setCatFormError]         = useState('')
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<number | null>(null)
  const [deletingCatId, setDeletingCatId]       = useState<number | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const user = await getMe()
        if (user.role === 'client_portal') { window.location.href = '/portal'; return }
        setMe(user)
        const [cats, prods, movs, projs] = await Promise.all([
          getInventoryCategories(),
          getProducts(),
          getStockMovements(),
          getMyProjects().then(r => r.results ?? (r as any)),
        ])
        setCategories(cats)
        setProducts(prods)
        setMovements(movs)
        setProjects(projs)
      } catch (e: any) {
        if (e.message === 'Sesión expirada') return
        setError(e.message ?? 'Error al cargar inventario')
      } finally { setLoading(false) }
    }
    init()
  }, [])

  const filteredProducts = products.filter(p => {
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = !selectedCategory || p.category === selectedCategory
    return matchSearch && matchCat
  })

  const isServiceProduct = (p: Product) =>
    categories.find(c => c.id === p.category)?.tracks_stock === false

  const lowStockProducts = products.filter(p => !isServiceProduct(p) && p.is_low_stock)

  // Paginated slices
  const pagedProducts  = filteredProducts.slice((productPage - 1) * PRODUCTS_PER_PAGE, productPage * PRODUCTS_PER_PAGE)
  const pagedMovements = movements.slice((movementPage - 1) * MOVEMENTS_PER_PAGE, movementPage * MOVEMENTS_PER_PAGE)

  function generateSku() {
    const existing = products.map(p => p.sku ?? '').filter(s => /^PRD-\d+$/.test(s))
    const maxN = existing.reduce((max, s) => {
      const n = parseInt(s.replace('PRD-', ''), 10)
      return n > max ? n : max
    }, 0)
    return `PRD-${String(maxN + 1).padStart(3, '0')}`
  }

  function openCreateProduct() {
    setEditingProduct(null)
    setPName(''); setPSku(generateSku()); setPCategory(''); setPUnit('unit')
    setPPrice(''); setPMinStock('0'); setPSupplier(''); setPDesc('')
    setFormError('')
    setShowProductForm(true)
    setShowMovementForm(false)
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p)
    setPName(p.name); setPSku(p.sku ?? ''); setPCategory(p.category ? String(p.category) : '')
    setPUnit(p.unit); setPPrice(p.unit_price_gtq); setPMinStock(p.min_stock_alert)
    setPSupplier(p.supplier_name ?? ''); setPDesc(p.description ?? '')
    setFormError('')
    setShowProductForm(true)
    setShowMovementForm(false)
    setViewingProduct(null)
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    const payload = {
      name: pName,
      description: pDesc || undefined,
      sku: pSku || undefined,
      category: pCategory ? Number(pCategory) : null,
      unit: pUnit,
      unit_price_gtq: pPrice,
      min_stock_alert: pMinStock || '0',
      supplier_name: pSupplier || undefined,
    }
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload)
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
      } else {
        const created = await createProduct(payload)
        setProducts(prev => [created, ...prev])
      }
      setShowProductForm(false)
      setEditingProduct(null)
      toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado')
    } catch (e: any) { setFormError(e.message) }
    finally { setFormLoading(false) }
  }

  async function handleDeleteProduct(id: number) {
    setConfirmDeleteId(null)
    setDeletingId(id)
    const name = products.find(p => p.id === id)?.name ?? 'Producto'
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      if (viewingProduct?.id === id) setViewingProduct(null)
      toast.success(`"${name}" eliminado`)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar el producto')
    } finally { setDeletingId(null) }
  }

  async function handleCreateMovement(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const newMovement = await createStockMovement({
        product: Number(mProduct),
        movement_type: mType,
        quantity: mQty,
        unit_price_gtq: mPrice || undefined,
        project: mProject ? Number(mProject) : null,
        notes: mNotes || undefined,
        reference_number: mRef || undefined,
      })
      setMovements(prev => [newMovement, ...prev])
      // Update product stock in local state
      setProducts(prev => prev.map(p => {
        if (p.id !== Number(mProduct)) return p
        const qty = Number(p.stock_quantity)
        const delta = Number(mQty)
        let newQty: number
        if (mType === 'in') newQty = qty + delta
        else if (mType === 'out') newQty = qty - delta
        else newQty = delta // adjustment sets absolute value
        return { ...p, stock_quantity: String(newQty) }
      }))
      setShowMovementForm(false)
      setMProduct(''); setMType('in'); setMQty(''); setMPrice('')
      setMProject(''); setMNotes(''); setMRef('')
      setActiveTab('movements')
      toast.success('Movimiento registrado')
    } catch (e: any) {
      setFormError(e.message)
      toast.error(e.message ?? 'Error al registrar el movimiento')
    }
    finally { setFormLoading(false) }
  }

  function openCreateCat() {
    setEditingCat(null)
    setCatName(''); setCatColor('#FF6B35'); setCatDesc(''); setCatTracksStock(true)
    setCatFormError('')
    setShowCatForm(true)
  }

  function openEditCat(c: InventoryCategory) {
    setEditingCat(c)
    setCatName(c.name); setCatColor(c.color); setCatDesc(c.description ?? ''); setCatTracksStock(c.tracks_stock)
    setCatFormError('')
    setShowCatForm(true)
  }

  async function handleSaveCat(e: React.FormEvent) {
    e.preventDefault()
    setCatFormLoading(true)
    setCatFormError('')
    const payload = { name: catName, description: catDesc || undefined, color: catColor, tracks_stock: catTracksStock }
    try {
      if (editingCat) {
        const updated = await updateInventoryCategory(editingCat.id, payload)
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)))
        toast.success('Categoría actualizada')
      } else {
        const created = await createInventoryCategory(payload)
        setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
        toast.success('Categoría creada')
      }
      setShowCatForm(false)
      setEditingCat(null)
    } catch (e: any) { setCatFormError(e.message) }
    finally { setCatFormLoading(false) }
  }

  async function handleDeleteCat(id: number) {
    setConfirmDeleteCatId(null)
    setDeletingCatId(id)
    const name = categories.find(c => c.id === id)?.name ?? 'Categoría'
    try {
      await deleteInventoryCategory(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success(`"${name}" eliminada`)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar la categoría')
    } finally { setDeletingCatId(null) }
  }

  const initials = me
    ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST'
    : 'ST'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
          <p className="text-sm text-[#8A95A5]">Cargando inventario…</p>
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
        currentPage="inventory"
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
            Inventario
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setFormError(''); setShowMovementForm(true) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#27384A] text-[#8A95A5] text-xs font-medium hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Registrar movimiento</span>
            </button>
            <button
              onClick={openCreateProduct}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Nuevo producto</span>
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <ERPAvatar avatarUrl={me?.avatar_url} initials={initials} size="md" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">

          {/* Low stock alert */}
          {lowStockProducts.length > 0 && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <TrendingDown size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-400">
                <strong>{lowStockProducts.length} producto{lowStockProducts.length > 1 ? 's' : ''}</strong> con stock bajo:{' '}
                {lowStockProducts.map(p => p.name).join(', ')}
              </p>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total productos',      value: products.length,          color: '#F0EDE8' },
                { label: 'Stock bajo',           value: lowStockProducts.length,  color: lowStockProducts.length > 0 ? '#f87171' : '#8A95A5' },
                { label: 'Movimientos recientes',value: movements.length,         color: '#FF6B35' },
                { label: 'Categorías',           value: categories.length,        color: '#4A9E6B' },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                  <p className="text-xs text-[#8A95A5] mb-3">{label}</p>
                  <p className="text-2xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>



            {/* Tab switcher */}
            <div className="flex gap-1 border-b border-[#27384A]">
              {([
                { id: 'categories', label: 'Categorías',  icon: <Tag size={13} /> },
                { id: 'products',   label: 'Productos',   icon: <Package size={13} /> },
                { id: 'movements',  label: 'Movimientos', icon: <RotateCcw size={13} /> },
              ] as const).map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === id
                      ? 'border-[#FF6B35] text-[#FF6B35]'
                      : 'border-transparent text-[#8A95A5] hover:text-[#F0EDE8]',
                  )}
                >
                  {icon}{label}
                </button>
              ))}
            </div>

            {/* Tab: Productos */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                {/* Filters + view toggle */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A95A5]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setProductPage(1) }}
                      placeholder="Buscar producto o SKU…"
                      className="w-full bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                    />
                  </div>
                  {/* Category pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={() => { setSelectedCategory(null); setProductPage(1) }}
                      className={cn(
                        'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                        !selectedCategory ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]',
                      )}
                    >
                      Todas
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setProductPage(1) }}
                        className={cn(
                          'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                          selectedCategory === cat.id ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]',
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  {/* View toggle */}
                  <div className="flex items-center gap-1 bg-[#1F2D3A] border border-[#27384A] rounded-lg p-1 flex-shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn('p-1.5 rounded transition-colors', viewMode === 'grid' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                      title="Vista cuadrícula"
                    >
                      <LayoutGrid size={14} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn('p-1.5 rounded transition-colors', viewMode === 'list' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-[#8A95A5] hover:text-[#F0EDE8]')}
                      title="Vista lista"
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <Package size={40} className="text-[#27384A]" />
                    <p className="text-[#8A95A5] text-sm">
                      {products.length === 0 ? 'No hay productos registrados aún.' : 'Sin resultados para esta búsqueda.'}
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {pagedProducts.map(product => {
                        const service  = isServiceProduct(product)
                        const stock    = Number(product.stock_quantity)
                        const minStock = Number(product.min_stock_alert)
                        const stockPct = minStock > 0
                          ? Math.min((stock / (minStock * 2)) * 100, 100)
                          : stock > 0 ? 100 : 0
                        const stockColor = product.is_low_stock ? '#f87171' : stockPct < 50 ? '#f59e0b' : '#4A9E6B'
                        return (
                          <div key={product.id} className="p-5 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/30 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                {product.category && (
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: categories.find(c => c.id === product.category)?.color ?? '#FF6B35' }} />
                                )}
                                <span className="text-[10px] text-[#8A95A5] truncate">{product.category_name ?? 'Sin categoría'}</span>
                              </div>
                              {service ? (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#6B8CFF]/15 text-[#6B8CFF] font-medium">
                                  Servicio
                                </span>
                              ) : product.is_low_stock && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
                                  <TrendingDown size={9} /> Stock bajo
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold text-[#F0EDE8] mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>{product.name}</h3>
                            {product.sku && (
                              <p className="text-[10px] text-[#8A95A5] mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>{product.sku}</p>
                            )}
                            {service ? (
                              <div className="mb-3 px-3 py-2 rounded-lg bg-[#131D28] border border-[#27384A]">
                                <p className="text-[10px] text-[#8A95A5]">Sin control de stock — ítem de servicio</p>
                              </div>
                            ) : (
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-[#8A95A5]">Stock actual</span>
                                  <span className="text-[10px] font-medium" style={{ fontFamily: 'Space Mono, monospace', color: stockColor }}>
                                    {stock} / {minStock} min ({UNITS.find(u => u.value === product.unit)?.label ?? product.unit})
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#27384A] overflow-hidden">
                                  <div className="h-full rounded-full transition-all" style={{ width: `${stockPct}%`, background: stockColor }} />
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs mb-4">
                              <span className="text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
                                Q {Number(product.unit_price_gtq).toLocaleString('es-GT')} / {UNITS.find(u => u.value === product.unit)?.label ?? product.unit}
                              </span>
                              {product.supplier_name && <span className="text-[#8A95A5] truncate ml-2">{product.supplier_name}</span>}
                            </div>
                            {confirmDeleteId === product.id ? (
                              <div className="flex gap-1.5 items-center">
                                <span className="flex-1 text-[10px] text-[#8A95A5] truncate">¿Eliminar?</span>
                                <button onClick={() => setConfirmDeleteId(null)}
                                  className="px-3 py-1.5 rounded-lg border border-[#27384A] text-[10px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
                                  No
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id)}
                                  disabled={deletingId === product.id}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40 flex items-center gap-1">
                                  {deletingId === product.id ? <Loader2 size={10} className="animate-spin" /> : null}
                                  Sí, eliminar
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1.5">
                                <button onClick={() => setViewingProduct(product)} title="Ver detalle"
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors">
                                  <Eye size={11} />
                                </button>
                                <button onClick={() => openEditProduct(product)} title="Editar"
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors">
                                  <Pencil size={11} />
                                </button>
                                {!service && (
                                  <button onClick={() => { setMProduct(String(product.id)); setShowMovementForm(true); setShowProductForm(false) }} title="Registrar movimiento"
                                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors">
                                    <RotateCcw size={11} />
                                  </button>
                                )}
                                <button onClick={() => setConfirmDeleteId(product.id)}
                                  title="Eliminar"
                                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-red-500/40 hover:text-red-400 transition-colors">
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <Pagination page={productPage} total={filteredProducts.length} perPage={PRODUCTS_PER_PAGE} onChange={p => { setProductPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
                  </>
                ) : (
                  /* ── List view ── */
                  <>
                    <div className="rounded-xl border border-[#27384A] overflow-hidden">
                      {/* Header row */}
                      <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 px-4 py-2 bg-[#131D28] text-[10px] text-[#8A95A5] uppercase tracking-wider font-medium">
                        <span>Producto</span>
                        <span>Categoría</span>
                        <span>Stock</span>
                        <span>Precio unitario</span>
                        <span />
                      </div>
                      <div className="divide-y divide-[#27384A]">
                        {pagedProducts.map(product => {
                          const service  = isServiceProduct(product)
                          const stock    = Number(product.stock_quantity)
                          const minStock = Number(product.min_stock_alert)
                          const stockPct = minStock > 0 ? Math.min((stock / (minStock * 2)) * 100, 100) : stock > 0 ? 100 : 0
                          const stockColor = product.is_low_stock ? '#f87171' : stockPct < 50 ? '#f59e0b' : '#4A9E6B'
                          const unitLabel  = UNITS.find(u => u.value === product.unit)?.label ?? product.unit
                          return (
                            <div key={product.id} className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-center px-4 py-3 bg-[#1F2D3A] hover:bg-[#243344] transition-colors">
                              {/* Name + SKU */}
                              <div className="flex items-center gap-2 min-w-0">
                                {product.category && (
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: categories.find(c => c.id === product.category)?.color ?? '#FF6B35' }} />
                                )}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-[#F0EDE8] truncate">{product.name}</p>
                                  {product.sku && <p className="text-[10px] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>{product.sku}</p>}
                                </div>
                                {!service && product.is_low_stock && (
                                  <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">
                                    <TrendingDown size={8} />
                                  </span>
                                )}
                              </div>
                              {/* Category */}
                              <span className="text-xs text-[#8A95A5] truncate hidden sm:block">{product.category_name ?? '—'}</span>
                              {/* Stock */}
                              <div className="hidden sm:block">
                                {service ? (
                                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-[#6B8CFF]/15 text-[#6B8CFF]">Servicio</span>
                                ) : (
                                  <>
                                    <p className="text-xs font-medium" style={{ color: stockColor, fontFamily: 'Space Mono, monospace' }}>
                                      {stock} {unitLabel}
                                    </p>
                                    <div className="h-1 rounded-full bg-[#27384A] overflow-hidden mt-1 w-20">
                                      <div className="h-full rounded-full" style={{ width: `${stockPct}%`, background: stockColor }} />
                                    </div>
                                  </>
                                )}
                              </div>
                              {/* Price */}
                              <span className="text-xs text-[#FF6B35] hidden sm:block" style={{ fontFamily: 'Space Mono, monospace' }}>
                                Q {Number(product.unit_price_gtq).toLocaleString('es-GT')} / {unitLabel}
                              </span>
                              {/* Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {confirmDeleteId === product.id ? (
                                  <>
                                    <span className="text-[10px] text-[#8A95A5] mr-1">¿Eliminar?</span>
                                    <button onClick={() => setConfirmDeleteId(null)}
                                      className="px-2 py-1 rounded border border-[#27384A] text-[10px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
                                      No
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id)}
                                      disabled={deletingId === product.id}
                                      className="px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40 flex items-center gap-1">
                                      {deletingId === product.id ? <Loader2 size={10} className="animate-spin" /> : null}
                                      Sí
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => setViewingProduct(product)} title="Ver"
                                      className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors">
                                      <Eye size={13} />
                                    </button>
                                    <button onClick={() => openEditProduct(product)} title="Editar"
                                      className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors">
                                      <Pencil size={13} />
                                    </button>
                                    {!service && (
                                      <button onClick={() => { setMProduct(String(product.id)); setShowMovementForm(true); setShowProductForm(false) }} title="Movimiento"
                                        className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors">
                                        <RotateCcw size={13} />
                                      </button>
                                    )}
                                    <button onClick={() => setConfirmDeleteId(product.id)} title="Eliminar"
                                      className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:border-red-500/40 hover:text-red-400 transition-colors">
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <Pagination page={productPage} total={filteredProducts.length} perPage={PRODUCTS_PER_PAGE} onChange={p => { setProductPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
                  </>
                )}
              </div>
            )}

            {/* Tab: Movimientos */}
            {activeTab === 'movements' && (
              <div className="space-y-3">
                {movements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <RotateCcw size={40} className="text-[#27384A]" />
                    <p className="text-[#8A95A5] text-sm">No hay movimientos registrados aún.</p>
                  </div>
                ) : (
                  pagedMovements.map(mv => {
                    const isIn  = mv.movement_type === 'in'
                    const isAdj = mv.movement_type === 'adjustment'
                    return (
                      <div key={mv.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                          isIn ? 'bg-[#4A9E6B]/15' : isAdj ? 'bg-[#8A95A5]/15' : 'bg-red-500/15',
                        )}>
                          {isIn
                            ? <ArrowDownCircle size={16} className="text-[#4A9E6B]" />
                            : isAdj
                              ? <RotateCcw size={16} className="text-[#8A95A5]" />
                              : <ArrowUpCircle size={16} className="text-red-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-[#F0EDE8]">{mv.product_name}</p>
                              <p className="text-xs text-[#8A95A5]">
                                {MOVEMENT_TYPE_LABELS[mv.movement_type]} · {mv.quantity} unidades
                                {mv.project && <span> · Proyecto #{mv.project}</span>}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[10px] text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
                                {new Date(mv.created_at).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </p>
                              {mv.performed_by_name && (
                                <p className="text-[10px] text-[#8A95A5]">{mv.performed_by_name}</p>
                              )}
                            </div>
                          </div>
                          {mv.notes && <p className="text-xs text-[#8A95A5] mt-1">{mv.notes}</p>}
                          {mv.reference_number && (
                            <p className="text-[10px] text-[#8A95A5] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>
                              Ref: {mv.reference_number}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                {movements.length > 0 && (
                  <Pagination page={movementPage} total={movements.length} perPage={MOVEMENTS_PER_PAGE} onChange={setMovementPage} />
                )}
              </div>
            )}

            {/* Tab: Categorías */}
            {activeTab === 'categories' && (
              <div className="space-y-5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Categorías de inventario
                    </p>
                    <p className="text-xs text-[#8A95A5] mt-0.5">
                      {categories.length} categoría{categories.length !== 1 ? 's' : ''} · organiza y clasifica tus productos y servicios
                    </p>
                  </div>
                  <button
                    onClick={openCreateCat}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors"
                  >
                    <Plus size={13} /> Nueva categoría
                  </button>
                </div>

                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#1F2D3A] border border-[#27384A] flex items-center justify-center">
                      <Boxes size={26} className="text-[#27384A]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#F0EDE8] mb-1">Sin categorías</p>
                      <p className="text-xs text-[#8A95A5]">Crea tu primera categoría para organizar el inventario.</p>
                    </div>
                    <button onClick={openCreateCat} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#FF6B35]/40 text-xs text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors">
                      <Plus size={12} /> Nueva categoría
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {categories.map(cat => {
                      const productCount = products.filter(p => p.category === cat.id).length
                      return (
                        <div key={cat.id} className="relative overflow-hidden rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/30 transition-all group">
                          {/* Left color accent */}
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: cat.color }} />

                          <div className="pl-5 pr-4 pt-4 pb-4">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ background: cat.color }} />
                                <h3 className="text-sm font-semibold text-[#F0EDE8] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {cat.name}
                                </h3>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                                <button
                                  onClick={() => openEditCat(cat)}
                                  className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:text-[#FF6B35] hover:border-[#FF6B35]/40 transition-colors"
                                  title="Editar"
                                >
                                  <Pencil size={11} />
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteCatId(cat.id)}
                                  className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:text-red-400 hover:border-red-500/40 transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>

                            {/* Description */}
                            {cat.description ? (
                              <p className="text-xs text-[#8A95A5] mb-3 leading-relaxed line-clamp-2">{cat.description}</p>
                            ) : (
                              <p className="text-xs text-[#4A5568] mb-3 italic">Sin descripción</p>
                            )}

                            {/* Badges row */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                'inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium',
                                cat.tracks_stock
                                  ? 'bg-[#4A9E6B]/15 text-[#4A9E6B]'
                                  : 'bg-[#6B8CFF]/15 text-[#6B8CFF]',
                              )}>
                                {cat.tracks_stock ? 'Gestiona stock' : 'Servicio'}
                              </span>
                              <span className="text-[10px] text-[#8A95A5]">
                                {productCount} producto{productCount !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {/* Inline delete confirm */}
                            {confirmDeleteCatId === cat.id && (
                              <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[#27384A]">
                                <span className="flex-1 text-[10px] text-[#8A95A5]">¿Eliminar categoría?</span>
                                <button
                                  onClick={() => setConfirmDeleteCatId(null)}
                                  className="px-2.5 py-1 rounded border border-[#27384A] text-[10px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors"
                                >
                                  No
                                </button>
                                <button
                                  onClick={() => handleDeleteCat(cat.id)}
                                  disabled={deletingCatId === cat.id}
                                  className="px-2.5 py-1 rounded bg-red-500/15 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40 flex items-center gap-1"
                                >
                                  {deletingCatId === cat.id ? <Loader2 size={9} className="animate-spin" /> : null}
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Product create / edit modal ── */}
      {showProductForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => { setShowProductForm(false); setEditingProduct(null) }}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button onClick={() => { setShowProductForm(false); setEditingProduct(null) }} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre <span className="text-[#FF6B35]">*</span></label>
                  <input required form="product-form" type="text" value={pName} onChange={e => setPName(e.target.value)} className={inputCls} placeholder="Cemento Portland" />
                </div>
                <div>
                  <label className={labelCls}>SKU / Código</label>
                  <div className="relative">
                    <input form="product-form" type="text" value={pSku} onChange={e => setPSku(e.target.value)} className={cn(inputCls, !editingProduct && 'pr-9')} placeholder="PRD-001" />
                    {!editingProduct && (
                      <button
                        type="button"
                        onClick={() => setPSku(generateSku())}
                        title="Regenerar SKU"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8A95A5] hover:text-[#FF6B35] transition-colors"
                      >
                        <RotateCcw size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select form="product-form" value={pCategory} onChange={e => setPCategory(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Unidad <span className="text-[#FF6B35]">*</span></label>
                  <select required form="product-form" value={pUnit} onChange={e => setPUnit(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                    {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Precio unitario GTQ <span className="text-[#FF6B35]">*</span></label>
                  <input required form="product-form" type="number" min="0" step="0.01" value={pPrice} onChange={e => setPPrice(e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
                {categories.find(c => c.id === Number(pCategory))?.tracks_stock !== false && (
                  <div>
                    <label className={labelCls}>Stock mínimo (alerta)</label>
                    <input form="product-form" type="number" min="0" value={pMinStock} onChange={e => setPMinStock(e.target.value)} className={inputCls} placeholder="0" />
                  </div>
                )}
              </div>
              <div>
                <label className={labelCls}>Proveedor</label>
                <input form="product-form" type="text" value={pSupplier} onChange={e => setPSupplier(e.target.value)} className={inputCls} placeholder="Nombre del proveedor" />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea form="product-form" rows={2} value={pDesc} onChange={e => setPDesc(e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Descripción opcional…" />
              </div>
            </div>

            {/* Sticky footer */}
            <form id="product-form" onSubmit={handleSaveProduct} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null) }} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {formLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Guardando…</>
                  : editingProduct ? <><Pencil size={13} /> Guardar cambios</> : <><Plus size={13} /> Crear producto</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Movement form modal ── */}
      {showMovementForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowMovementForm(false)}>
          <div className="bg-[#1A2530] border border-[#27384A] rounded-xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-[#27384A]">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Registrar movimiento de stock
              </h3>
              <button onClick={() => setShowMovementForm(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateMovement} className="p-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Producto <span className="text-[#FF6B35]">*</span></label>
                  <select required value={mProduct} onChange={e => setMProduct(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                    <option value="">Seleccionar producto…</option>
                    {products.filter(p => !isServiceProduct(p)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tipo de movimiento <span className="text-[#FF6B35]">*</span></label>
                  <select value={mType} onChange={e => setMType(e.target.value as 'in' | 'out' | 'adjustment')} className={cn(inputCls, 'cursor-pointer')}>
                    <option value="in">Entrada</option>
                    <option value="out">Salida</option>
                    <option value="adjustment">Ajuste</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Cantidad <span className="text-[#FF6B35]">*</span></label>
                  <input required type="number" min="0" step="0.001" value={mQty} onChange={e => setMQty(e.target.value)} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>Precio unitario GTQ (opcional)</label>
                  <input type="number" min="0" step="0.01" value={mPrice} onChange={e => setMPrice(e.target.value)} className={inputCls} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Proyecto (opcional)</label>
                  <select value={mProject} onChange={e => setMProject(e.target.value)} className={cn(inputCls, 'cursor-pointer')}>
                    <option value="">Sin proyecto</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Referencia (opcional)</label>
                  <input type="text" value={mRef} onChange={e => setMRef(e.target.value)} className={inputCls} placeholder="OC-001, factura, etc." />
                </div>
              </div>
              <div>
                <label className={labelCls}>Notas</label>
                <textarea rows={2} value={mNotes} onChange={e => setMNotes(e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Observaciones adicionales…" />
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setShowMovementForm(false)} className="px-4 py-2 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={formLoading} className="px-6 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center gap-2">
                  {formLoading ? <><Loader2 size={13} className="animate-spin" /> Guardando…</> : <><RotateCcw size={13} /> Registrar</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product detail modal ── */}
      {viewingProduct && (() => {
        const p        = viewingProduct
        const service  = isServiceProduct(p)
        const stock    = Number(p.stock_quantity)
        const minStock = Number(p.min_stock_alert)
        const stockPct = minStock > 0 ? Math.min((stock / (minStock * 2)) * 100, 100) : stock > 0 ? 100 : 0
        const stockColor = p.is_low_stock ? '#f87171' : stockPct < 50 ? '#f59e0b' : '#4A9E6B'
        const unitLabel  = UNITS.find(u => u.value === p.unit)?.label ?? p.unit
        const catColor   = categories.find(c => c.id === p.category)?.color ?? '#FF6B35'
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setViewingProduct(null)}
          >
            <div
              className="bg-[#1A2530] border border-[#27384A] rounded-xl w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-[#27384A]">
                <div className="flex items-center gap-3 min-w-0">
                  {p.category && <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: catColor }} />}
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#F0EDE8] leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {p.name}
                    </h2>
                    {p.sku && (
                      <p className="text-[11px] text-[#8A95A5] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>{p.sku}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <button
                    onClick={() => openEditProduct(p)}
                    className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setViewingProduct(null)}
                    className="p-1.5 rounded border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Stock bar / service badge */}
                {service ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#6B8CFF]/10 border border-[#6B8CFF]/20">
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#6B8CFF] font-medium">
                      Ítem de servicio — sin control de stock
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#8A95A5]">Stock actual</span>
                      <span className="text-xs font-semibold" style={{ color: stockColor, fontFamily: 'Space Mono, monospace' }}>
                        {stock} / {minStock} min {unitLabel}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#27384A] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${stockPct}%`, background: stockColor }} />
                    </div>
                    {p.is_low_stock && (
                      <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                        <TrendingDown size={10} /> Stock por debajo del mínimo
                      </p>
                    )}
                  </div>
                )}

                {/* KPI row */}
                <div className={service ? '' : 'grid grid-cols-2 gap-3'}>
                  <div className="p-3 rounded-lg bg-[#131D28] border border-[#27384A]">
                    <p className="text-[10px] text-[#8A95A5] mb-1">Precio unitario</p>
                    <p className="text-sm font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>
                      Q {Number(p.unit_price_gtq).toLocaleString('es-GT')}
                    </p>
                    <p className="text-[10px] text-[#8A95A5]">/ {unitLabel}</p>
                  </div>
                  {!service && (
                    <div className="p-3 rounded-lg bg-[#131D28] border border-[#27384A]">
                      <p className="text-[10px] text-[#8A95A5] mb-1">Valor en stock</p>
                      <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                        Q {(stock * Number(p.unit_price_gtq)).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-[#8A95A5]">{stock} × Q {Number(p.unit_price_gtq).toLocaleString('es-GT')}</p>
                    </div>
                  )}
                </div>

                {/* Detail rows */}
                <dl className="space-y-2">
                  {p.category_name && (
                    <div className="flex items-center justify-between text-xs">
                      <dt className="text-[#8A95A5]">Categoría</dt>
                      <dd className="text-[#F0EDE8] flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: catColor }} />
                        {p.category_name}
                      </dd>
                    </div>
                  )}
                  {p.supplier_name && (
                    <div className="flex items-center justify-between text-xs">
                      <dt className="text-[#8A95A5]">Proveedor</dt>
                      <dd className="text-[#F0EDE8]">{p.supplier_name}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-[#8A95A5]">Unidad</dt>
                    <dd className="text-[#F0EDE8]">{unitLabel}</dd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-[#8A95A5]">Estado</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${p.is_low_stock ? 'bg-red-500/15 text-red-400' : 'bg-[#4A9E6B]/15 text-[#4A9E6B]'}`}>
                        {p.is_low_stock ? 'Stock bajo' : 'OK'}
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <dt className="text-[#8A95A5]">Creado</dt>
                    <dd className="text-[#8A95A5]" style={{ fontFamily: 'Space Mono, monospace' }}>
                      {new Date(p.created_at).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </dd>
                  </div>
                </dl>

                {/* Description */}
                {p.description && (
                  <p className="text-xs text-[#8A95A5] leading-relaxed border-t border-[#27384A] pt-3">{p.description}</p>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex gap-2 p-5 pt-0">
                {!service && (
                  <button
                    onClick={() => { setMProduct(String(p.id)); setViewingProduct(null); setShowMovementForm(true); setShowProductForm(false) }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-[#FF6B35]/40 hover:text-[#FF6B35] transition-colors"
                  >
                    <RotateCcw size={12} /> Registrar movimiento
                  </button>
                )}
                {confirmDeleteId === p.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8A95A5]">¿Eliminar?</span>
                    <button onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
                      No
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)}
                      disabled={deletingId === p.id}
                      className="px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-40 flex items-center gap-1.5">
                      {deletingId === p.id ? <Loader2 size={12} className="animate-spin" /> : null}
                      Sí, eliminar
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDeleteId(p.id)}
                    className="px-4 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:border-red-500/40 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Category create / edit modal ── */}
      {showCatForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => { setShowCatForm(false); setEditingCat(null) }}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-md shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm transition-colors" style={{ background: catColor }} />
                <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {editingCat ? 'Editar categoría' : 'Nueva categoría'}
                </h3>
              </div>
              <button onClick={() => { setShowCatForm(false); setEditingCat(null) }} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <form id="cat-form" onSubmit={handleSaveCat} className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
              {catFormError && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {catFormError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className={labelCls}>Nombre <span className="text-[#FF6B35]">*</span></label>
                <input
                  required
                  type="text"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className={inputCls}
                  placeholder="Ej: Materiales de construcción"
                />
              </div>

              {/* Color */}
              <div>
                <label className={labelCls}>Color</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {CAT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110 flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ background: c }}
                    >
                      {catColor === c && <Check size={11} className="text-white drop-shadow" strokeWidth={3} />}
                    </button>
                  ))}
                  {/* Custom color */}
                  <label
                    className="relative w-7 h-7 rounded-full border-2 border-dashed border-[#27384A] flex items-center justify-center cursor-pointer hover:border-[#FF6B35]/50 transition-colors overflow-hidden flex-shrink-0"
                    title="Color personalizado"
                  >
                    {!CAT_COLORS.includes(catColor) && (
                      <div className="absolute inset-0 rounded-full" style={{ background: catColor }} />
                    )}
                    {!CAT_COLORS.includes(catColor)
                      ? <Check size={11} className="text-white drop-shadow relative z-10" strokeWidth={3} />
                      : <Plus size={11} className="text-[#8A95A5] relative z-10" />
                    }
                    <input
                      type="color"
                      value={catColor}
                      onChange={e => setCatColor(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={e => setCatDesc(e.target.value)}
                  className={cn(inputCls, 'resize-none')}
                  placeholder="Descripción opcional de la categoría…"
                />
              </div>

              {/* tracks_stock toggle */}
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#131D28] border border-[#27384A]">
                <div className="min-w-0">
                  <p className="text-sm text-[#F0EDE8] font-medium">Gestiona stock</p>
                  <p className="text-xs text-[#8A95A5] mt-0.5 leading-snug">
                    Desactivar en servicios — mano de obra, alquiler, etc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCatTracksStock(v => !v)}
                  className={cn(
                    'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none',
                    catTracksStock ? 'bg-[#4A9E6B]' : 'bg-[#27384A]',
                  )}
                >
                  <span className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                    catTracksStock ? 'translate-x-6' : 'translate-x-1',
                  )} />
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button
                type="button"
                onClick={() => { setShowCatForm(false); setEditingCat(null) }}
                className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="cat-form"
                disabled={catFormLoading || !catName.trim()}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
              >
                {catFormLoading
                  ? <><Loader2 size={13} className="animate-spin" /> Guardando…</>
                  : editingCat ? <><Pencil size={13} /> Guardar cambios</> : <><Plus size={13} /> Crear categoría</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
