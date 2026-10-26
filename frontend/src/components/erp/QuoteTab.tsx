'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import {
  Plus, Trash2, Send, FileText, CheckCircle2, XCircle,
  Loader2, AlertTriangle, Save, RotateCcw, Clock, Edit3,
  Download, LayoutTemplate, X, Package, ArrowLeft, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCompanySettings } from '@/lib/company-settings'
import { confirmToast } from '@/lib/confirm-toast'
import { toast } from 'sonner'
import {
  getProjectQuotes, createProjectQuote, updateProjectQuote,
  deleteProjectQuote, sendProjectQuote, downloadQuotePDF,
  getQuoteTemplates, createQuoteTemplate, deleteQuoteTemplate,
  getProducts, getInventoryCategories,
  type Quote, type QuoteLineItem, type QuoteCategory, type QuoteTemplate, type Product,
  type InventoryCategory, type StockAlert,
} from '@/lib/api'

// ─── Local line item type ─────────────────────────────────────────────────────

interface LocalLineItem extends QuoteLineItem {
  _sourceProductName?: string
  _sourceUnitPrice?:   number
  _priceModified?:     boolean
  _invCatId?:          number
}

function toApiItem(item: LocalLineItem, order: number): QuoteLineItem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _sourceProductName, _sourceUnitPrice, _priceModified, _invCatId, unit_display, ...rest } = item
  return { ...rest, order }
}


// Resolves a unit value to a human-readable label.
// Handles: display labels already stored ('m²', 'Saco'), raw codes ('m2', 'bag'),
// and falls back to the value itself if unrecognised.
const UNIT_MAP: Record<string, string> = {
  unit: 'Unidad', m2: 'm²', m3: 'm³', ml: 'Metro lineal',
  kg: 'Kilogramo', lb: 'Libra', ton: 'Tonelada', l: 'Litro',
  bag: 'Saco', roll: 'Rollo', box: 'Caja', gal: 'Galón',
}
function resolveUnit(unit: string | undefined | null): string {
  if (!unit) return ''
  return UNIT_MAP[unit] ?? unit
}

function invCatToQuoteCat(name: string): QuoteCategory {
  const n = name.toLowerCase()
  if (n.includes('mano') || n.includes('labor') || n.includes('person') || n.includes('servicio')) return 'labor'
  if (n.includes('equipo') || n.includes('maquinaria') || n.includes('herramienta')) return 'equipment'
  return 'materials'
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtQ(n: number) {
  return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

const CATEGORY_LABELS: Record<QuoteCategory, string> = {
  materials: 'Materiales',
  labor:     'Mano de obra',
  equipment: 'Equipos',
  other:     'Otros',
}

const CATEGORY_COLORS: Record<QuoteCategory, string> = {
  materials: 'text-[#FF6B35] bg-[#FF6B35]/10',
  labor:     'text-[#6B8CFF] bg-[#6B8CFF]/10',
  equipment: 'text-amber-400 bg-amber-400/10',
  other:     'text-[#8A95A5] bg-[#27384A]',
}

const STATUS_CARD: Record<Quote['status'], { bar: string; cls: string }> = {
  draft:             { bar: 'bg-[#27384A]',    cls: 'border-[#27384A]' },
  sent:              { bar: 'bg-[#6B8CFF]',    cls: 'border-[#6B8CFF]/30' },
  changes_requested: { bar: 'bg-amber-400',    cls: 'border-amber-400/30' },
  approved:          { bar: 'bg-[#4A9E6B]',    cls: 'border-[#4A9E6B]/30' },
  rejected:          { bar: 'bg-red-500',      cls: 'border-red-500/30' },
}

// ─── Status chip ──────────────────────────────────────────────────────────────

function QuoteStatusChip({ status }: { status: Quote['status'] }) {
  const map = {
    draft:             { label: 'Borrador',            cls: 'bg-[#27384A] text-[#8A95A5]',    Icon: Edit3 },
    sent:              { label: 'Enviada al cliente',   cls: 'bg-[#6B8CFF]/15 text-[#6B8CFF]', Icon: Send },
    changes_requested: { label: 'Cambios solicitados',  cls: 'bg-amber-400/15 text-amber-400', Icon: RotateCcw },
    approved:          { label: 'Aprobada',             cls: 'bg-[#4A9E6B]/15 text-[#4A9E6B]', Icon: CheckCircle2 },
    rejected:          { label: 'Rechazada',            cls: 'bg-red-500/15 text-red-400',     Icon: XCircle },
  }
  const { label, cls, Icon } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  )
}

// ─── Module-level caches ──────────────────────────────────────────────────────

let _productsCache: Product[] | null = null
let _cachePromise: Promise<Product[]> | null = null

function loadProductCache(): Promise<Product[]> {
  if (_productsCache) return Promise.resolve(_productsCache)
  if (_cachePromise) return _cachePromise
  _cachePromise = getProducts({ is_active: true }).then(p => {
    _productsCache = p; _cachePromise = null; return p
  }).catch(() => { _cachePromise = null; return [] })
  return _cachePromise
}

let _invCatsCache: InventoryCategory[] | null = null
let _invCatsPromise: Promise<InventoryCategory[]> | null = null

function loadInvCatsCache(): Promise<InventoryCategory[]> {
  if (_invCatsCache) return Promise.resolve(_invCatsCache)
  if (_invCatsPromise) return _invCatsPromise
  _invCatsPromise = getInventoryCategories().then(c => {
    _invCatsCache = c; _invCatsPromise = null; return c
  }).catch(() => { _invCatsPromise = null; return [] })
  return _invCatsPromise
}

// ─── Description input with inline inventory autocomplete ─────────────────────

function DescriptionInput({
  value, onChange, onProductSelect, catId,
}: {
  value: string
  onChange: (v: string) => void
  onProductSelect: (p: Product) => void
  catId?: number
}) {
  const [allProds,   setAllProds]   = useState<Product[]>(_productsCache ?? [])
  const [loading,    setLoading]    = useState(false)
  const [open,       setOpen]       = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const dropRef   = useRef<HTMLDivElement>(null)
  const closeRef  = useRef(() => setOpen(false))

  useEffect(() => {
    if (_productsCache) return
    setLoading(true)
    loadProductCache().then(p => { setAllProds(p); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!open) return
    function onOut(e: MouseEvent) {
      const t = e.target as Node
      if (inputRef.current?.contains(t) || dropRef.current?.contains(t)) return
      closeRef.current()
    }
    document.addEventListener('mousedown', onOut, true)
    return () => document.removeEventListener('mousedown', onOut, true)
  }, [open])

  const query    = value.trim().toLowerCase()
  const byCat    = catId != null ? allProds.filter(p => p.category === catId) : allProds
  const filtered = (query.length >= 1 ? byCat.filter(p => p.name.toLowerCase().includes(query)) : byCat).slice(0, 20)

  function openDrop() {
    if (inputRef.current) setAnchorRect(inputRef.current.getBoundingClientRect())
    setOpen(true)
  }

  function handleChange(v: string) {
    onChange(v)
    if (!open && inputRef.current) setAnchorRect(inputRef.current.getBoundingClientRect())
    setOpen(true)
  }

  const DROP_MAX_H = 280
  const dropdown = open && anchorRect ? createPortal(
    <div
      ref={dropRef}
      style={{
        position:  'fixed',
        top:       window.innerHeight - anchorRect.bottom >= DROP_MAX_H
                     ? anchorRect.bottom + 4
                     : anchorRect.top - DROP_MAX_H - 4,
        left:      anchorRect.left,
        width:     Math.max(anchorRect.width, 280),
        maxHeight: DROP_MAX_H,
        zIndex:    9999,
        display:   'flex',
        flexDirection: 'column',
      }}
      className="bg-[#1A2530] border border-[#27384A] rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#27384A] flex-shrink-0">
        <Package size={10} className="text-[#FF6B35]" />
        <span className="text-[10px] text-[#8A95A5]">
          {loading
            ? 'Cargando inventario…'
            : query.length >= 1
              ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`
              : catId != null
                ? `${byCat.length} producto${byCat.length !== 1 ? 's' : ''} en esta categoría`
                : 'Inventario — escribe para filtrar o elige categoría'}
        </span>
      </div>
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-5">
            <Loader2 size={14} className="animate-spin text-[#8A95A5]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-[11px] text-[#8A95A5] py-5">Sin resultados</p>
        ) : filtered.map(p => (
          <button
            key={p.id}
            onMouseDown={e => { e.preventDefault(); onProductSelect(p); setOpen(false) }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#27384A] transition-colors text-left border-b border-[#1F2D3A] last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#F0EDE8] truncate font-medium">{p.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {p.category_name && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#27384A] text-[#8A95A5] whitespace-nowrap">{p.category_name}</span>
                )}
                <span className="text-[10px] text-[#8A95A5]">{resolveUnit(p.unit_display || p.unit)}</span>
                {Number(p.stock_quantity) > 0
                  ? <span className="text-[10px] text-[#4A9E6B]">✓ {p.stock_quantity}</span>
                  : <span className="text-[10px] text-red-400">Sin stock</span>}
              </div>
            </div>
            <span className="text-xs text-[#FF6B35] font-semibold flex-shrink-0">
              {fmtQ(parseFloat(p.unit_price_gtq))}
            </span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  ) : null

  return (
    <div className="flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        onFocus={openDrop}
        placeholder="Descripción o buscar en inventario…"
        className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-2 py-1.5 text-xs text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60"
      />
      {dropdown}
    </div>
  )
}

// ─── Line item row ────────────────────────────────────────────────────────────

interface LineItemRowProps {
  item:            LocalLineItem
  index:           number
  editable:        boolean
  invCats:         InventoryCategory[]
  onChange:        (index: number, field: keyof QuoteLineItem, value: string | number) => void
  onDelete:        (index: number) => void
  onProductSelect: (index: number, p: Product) => void
  onCatSelect:     (index: number, invCatId: number | null, qCat: QuoteCategory) => void
}

function LineItemRow({ item, index, editable, invCats, onChange, onDelete, onProductSelect, onCatSelect }: LineItemRowProps) {
  const subtotal      = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
  const fromCatalog   = !!item.product_id
  const priceModified = fromCatalog && item._priceModified

  const catLabel = item._invCatId
    ? (invCats.find(c => c.id === item._invCatId)?.name ?? CATEGORY_LABELS[item.category])
    : CATEGORY_LABELS[item.category]

  return (
    <tr className="border-b border-[#1F2D3A] group">
      <td className="px-3 py-2.5 w-[150px]">
        {editable ? (
          <select
            value={item._invCatId ?? ''}
            onChange={e => {
              const id = e.target.value ? Number(e.target.value) : null
              const cat = invCats.find(c => c.id === id)
              onCatSelect(index, id, cat ? invCatToQuoteCat(cat.name) : 'other')
            }}
            className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-2 py-1.5 text-xs text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
          >
            <option value="">Categoría…</option>
            {invCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        ) : (
          <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[item.category]}`}>
            {catLabel}
          </span>
        )}
      </td>
      <td className="px-3 py-2.5">
        {editable ? (
          <div>
            <DescriptionInput
              value={item.description}
              onChange={v => onChange(index, 'description', v)}
              onProductSelect={p => onProductSelect(index, p)}
              catId={item._invCatId}
            />
            {fromCatalog && (
              <p className="flex items-center gap-1 mt-0.5 text-[9px] text-[#4A9E6B]">
                <Package size={9} /> {item._sourceProductName ?? item.product_name}
              </p>
            )}
          </div>
        ) : (
          <div>
            <span className="text-xs text-[#F0EDE8]">{item.description}</span>
            {fromCatalog && (
              <p className="flex items-center gap-1 mt-0.5 text-[9px] text-[#4A9E6B]">
                <Package size={9} /> {item._sourceProductName ?? item.product_name}
              </p>
            )}
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 w-[80px]">
        {editable ? (
          <input type="number" value={item.quantity} min={0}
            onChange={e => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
            className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-2 py-1.5 text-xs text-right text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
          />
        ) : (
          <span className="text-xs text-[#F0EDE8] block text-right">{item.quantity}</span>
        )}
      </td>
      <td className="px-3 py-2.5 w-[80px]">
        {editable ? (
          <input type="text" value={item.unit} onChange={e => onChange(index, 'unit', e.target.value)}
            placeholder="m², hr…"
            className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-2 py-1.5 text-xs text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60"
          />
        ) : (
          <span className="text-xs text-[#8A95A5]">{resolveUnit(item.unit_display || item.unit) || '—'}</span>
        )}
      </td>
      <td className="px-3 py-2.5 w-[120px]">
        {editable ? (
          <div>
            <input type="number" value={item.unit_price} min={0} step={0.01}
              onChange={e => onChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
              className={cn(
                'w-full bg-[#131D28] border rounded-lg px-2 py-1.5 text-xs text-right text-[#F0EDE8] focus:outline-none transition-colors',
                priceModified
                  ? 'border-amber-400/50 focus:border-amber-400/80'
                  : 'border-[#27384A] focus:border-[#FF6B35]/60',
              )}
            />
            {priceModified && item._sourceUnitPrice !== undefined && (
              <p className="text-[9px] text-amber-400 text-right mt-0.5">Orig: {fmtQ(item._sourceUnitPrice)}</p>
            )}
          </div>
        ) : (
          <div className="text-right">
            <span className="text-xs text-[#F0EDE8] block">{fmtQ(Number(item.unit_price))}</span>
            {priceModified && item._sourceUnitPrice !== undefined && (
              <span className="text-[9px] text-amber-400">Orig: {fmtQ(item._sourceUnitPrice)}</span>
            )}
          </div>
        )}
      </td>
      <td className="px-3 py-2.5 w-[120px] text-right">
        <span className="text-xs font-medium text-[#F0EDE8]">{fmtQ(subtotal)}</span>
      </td>
      <td className="px-2 py-2.5 w-[40px]">
        {editable && (
          <button onClick={() => onDelete(index)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8A95A5] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── Totals block ─────────────────────────────────────────────────────────────

function TotalsBlock({ items, discountPct, taxPct, editable, onDiscountChange, onTaxChange }: {
  items: QuoteLineItem[]; discountPct: number; taxPct: number
  editable: boolean; onDiscountChange: (v: number) => void; onTaxChange: (v: number) => void
}) {
  const subtotal      = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)
  const discountAmt   = subtotal * discountPct / 100
  const afterDiscount = subtotal - discountAmt
  const taxAmt        = afterDiscount * taxPct / 100
  const total         = afterDiscount + taxAmt
  return (
    <div className="bg-[#131D28] border border-[#27384A] rounded-xl p-4 w-72 space-y-2">
      <div className="flex justify-between text-xs text-[#8A95A5]">
        <span>Subtotal</span><span className="text-[#F0EDE8]">{fmtQ(subtotal)}</span>
      </div>
      <div className="flex justify-between items-center text-xs text-[#8A95A5]">
        <span>Descuento (%)</span>
        <div className="flex items-center gap-1.5">
          {editable ? (
            <input type="number" min={0} max={100} step={0.5} value={discountPct}
              onChange={e => onDiscountChange(parseFloat(e.target.value) || 0)}
              className="w-14 bg-[#1F2D3A] border border-[#27384A] rounded px-1.5 py-0.5 text-xs text-right text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
            />
          ) : <span>{discountPct}%</span>}
          <span className="text-[#F0EDE8]">−{fmtQ(discountAmt)}</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-[#8A95A5]">
        <span>IVA (%)</span>
        <div className="flex items-center gap-1.5">
          {editable ? (
            <input type="number" min={0} max={100} step={0.5} value={taxPct}
              onChange={e => onTaxChange(parseFloat(e.target.value) || 0)}
              className="w-14 bg-[#1F2D3A] border border-[#27384A] rounded px-1.5 py-0.5 text-xs text-right text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
            />
          ) : <span>{taxPct}%</span>}
          <span className="text-[#F0EDE8]">{fmtQ(taxAmt)}</span>
        </div>
      </div>
      <div className="border-t border-[#27384A] pt-2 flex justify-between items-center">
        <span className="text-sm font-bold text-white">TOTAL</span>
        <span className="text-lg font-bold text-[#FF6B35]">{fmtQ(total)}</span>
      </div>
    </div>
  )
}

// ─── Quote card (list view) ───────────────────────────────────────────────────

function QuoteCard({ quote, onOpen }: { quote: Quote; onOpen: () => void }) {
  const s = STATUS_CARD[quote.status]
  const total = quote.total_amount
    ? fmtQ(Number(quote.total_amount))
    : quote.line_items.length > 0
      ? fmtQ(quote.line_items.reduce((acc, li) => acc + (Number(li.quantity) || 0) * (Number(li.unit_price) || 0), 0))
      : null

  return (
    <button
      onClick={onOpen}
      className={cn(
        'w-full text-left bg-[#1A2530] border rounded-2xl overflow-hidden hover:bg-[#1F2D3A] transition-colors group',
        s.cls,
      )}
    >
      <div className={cn('h-1 w-full', s.bar)} />
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {quote.quote_number || 'Cotización'}
          </p>
          <QuoteStatusChip status={quote.status} />
        </div>
        <div className="flex items-center justify-between text-xs text-[#8A95A5]">
          <span>Rev. {quote.revision}</span>
          {total && <span className="text-[#FF6B35] font-semibold">{total}</span>}
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#8A95A5]">
          <span>{quote.line_items.length} partida{quote.line_items.length !== 1 ? 's' : ''}</span>
          <span>{fmtDate(quote.created_at)}</span>
        </div>
      </div>
    </button>
  )
}

// ─── Template card (list view) ────────────────────────────────────────────────

function TemplateCard({
  template, onUse, onDelete,
}: {
  template: QuoteTemplate
  onUse: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-[#1A2530] border border-[#27384A] rounded-2xl overflow-hidden group">
      <div className="h-1 w-full bg-[#FF6B35]/30" />
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
            <LayoutTemplate size={14} className="text-[#FF6B35]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{template.name}</p>
            <p className="text-xs text-[#8A95A5] mt-0.5">
              {template.line_items.length} partida{template.line_items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onUse}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-xs text-[#FF6B35] font-medium hover:bg-[#FF6B35]/20 transition-colors"
          >
            <Plus size={12} /> Usar plantilla
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#8A95A5] hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── List view ────────────────────────────────────────────────────────────────

interface QuoteListViewProps {
  quotes:           Quote[]
  templates:        QuoteTemplate[]
  loadingTemplates: boolean
  saving:           boolean
  onCreateNew:      () => void
  onOpenQuote:      (q: Quote) => void
  onUseTemplate:    (t: QuoteTemplate) => void
  onDeleteTemplate: (id: number) => void
}

function QuoteListView({
  quotes, templates, loadingTemplates, saving,
  onCreateNew, onOpenQuote, onUseTemplate, onDeleteTemplate,
}: QuoteListViewProps) {
  return (
    <div className="space-y-8">

      {/* ── Quotes section ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cotizaciones
          </h3>
          <button
            onClick={onCreateNew}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B35] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Nueva cotización
          </button>
        </div>

        {quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-[#1A2530] rounded-2xl border border-[#27384A] border-dashed">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center mb-3">
              <FileText size={22} className="text-[#FF6B35]" />
            </div>
            <p className="text-sm font-medium text-white mb-1">Sin cotizaciones</p>
            <p className="text-xs text-[#8A95A5] max-w-xs">
              Crea la primera cotización o usa una plantilla para comenzar rápidamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quotes.map(q => (
              <QuoteCard key={q.id} quote={q} onOpen={() => onOpenQuote(q)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Templates section ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Plantillas guardadas
          </h3>
          <span className="text-[10px] text-[#8A95A5] bg-[#27384A] px-2 py-0.5 rounded-full">
            Reutilizables
          </span>
        </div>

        {loadingTemplates ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={16} className="animate-spin text-[#8A95A5]" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1A2530] border border-[#27384A] border-dashed">
            <LayoutTemplate size={16} className="text-[#8A95A5] flex-shrink-0" />
            <p className="text-xs text-[#8A95A5]">
              Sin plantillas aún. Al guardar una cotización como plantilla aparecerá aquí para reutilizarla en futuros proyectos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                onUse={() => onUseTemplate(t)}
                onDelete={() => onDeleteTemplate(t.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Catalog modal ───────────────────────────────────────────────────────────

function CatalogModal({
  open, onClose, onAdd, invCats,
}: {
  open:     boolean
  onClose:  () => void
  onAdd:    (items: LocalLineItem[]) => void
  invCats:  InventoryCategory[]
}) {
  const [allProds,     setAllProds]     = useState<Product[]>(_productsCache ?? [])
  const [loading,      setLoading]      = useState(false)
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null)
  const [search,       setSearch]       = useState('')
  const [selections,   setSelections]   = useState<Map<number, { product: Product; qty: number }>>(new Map())

  useEffect(() => {
    if (!open) return
    // Reset state on open
    setSelectedCatId(null)
    setSearch('')
    setSelections(new Map())
    if (_productsCache) {
      setAllProds(_productsCache)
      return
    }
    setLoading(true)
    loadProductCache().then(p => { setAllProds(p); setLoading(false) })
  }, [open])

  if (!open) return null

  const filtered = allProds.filter(p => {
    const matchesCat  = selectedCatId == null || p.category === selectedCatId
    const matchesSearch = search.trim() === '' || p.name.toLowerCase().includes(search.trim().toLowerCase())
    return matchesCat && matchesSearch
  })

  function toggleProduct(p: Product) {
    setSelections(prev => {
      const next = new Map(prev)
      if (next.has(p.id)) {
        next.delete(p.id)
      } else {
        next.set(p.id, { product: p, qty: 1 })
      }
      return next
    })
  }

  function updateQty(id: number, qty: number) {
    setSelections(prev => {
      const next = new Map(prev)
      const entry = next.get(id)
      if (entry) next.set(id, { ...entry, qty: Math.max(1, qty) })
      return next
    })
  }

  function handleAdd() {
    const newItems: LocalLineItem[] = Array.from(selections.values()).map(sel => {
      const p     = sel.product
      const price = parseFloat(p.unit_price_gtq) || 0
      const catId = typeof p.category === 'number' ? p.category : null
      const invCat = catId != null ? invCats.find(c => c.id === catId) : null
      const qCat  = invCat ? invCatToQuoteCat(invCat.name) : 'materials' as const
      return {
        product_id:         p.id,
        product_name:       p.name,
        description:        p.name,
        unit:               resolveUnit(p.unit_display || p.unit),
        unit_price:         price,
        quantity:           sel.qty,
        category:           qCat,
        order:              0,
        _invCatId:          catId ?? undefined,
        _sourceProductName: p.name,
        _sourceUnitPrice:   price,
        _priceModified:     false,
      }
    })
    onAdd(newItems)
    onClose()
  }

  const selCount = selections.size

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#1A2530] border border-[#27384A] rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Package size={16} className="text-[#FF6B35]" />
            <h3 className="text-sm font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Agregar del catálogo
            </h3>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* Left sidebar — categories */}
          <div className="w-44 flex-shrink-0 border-r border-[#27384A] overflow-y-auto py-2">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                selectedCatId === null
                  ? 'text-[#FF6B35] bg-[#FF6B35]/10'
                  : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#27384A]'
              }`}
            >
              Todos
            </button>
            {invCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors truncate ${
                  selectedCatId === cat.id
                    ? 'text-[#FF6B35] bg-[#FF6B35]/10'
                    : 'text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#27384A]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right — search + product list */}
          <div className="flex flex-col flex-1 min-w-0">

            {/* Search */}
            <div className="px-4 py-3 border-b border-[#27384A] flex-shrink-0">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto…"
                className="w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-xs text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60"
              />
            </div>

            {/* Product list */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={18} className="animate-spin text-[#8A95A5]" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-xs text-[#8A95A5] py-12">Sin resultados</p>
              ) : filtered.map(p => {
                const isSelected = selections.has(p.id)
                const sel        = selections.get(p.id)
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-[#1F2D3A] last:border-0 hover:bg-[#1F2D3A] transition-colors cursor-pointer"
                    onClick={() => toggleProduct(p)}
                  >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                      isSelected
                        ? 'bg-[#FF6B35] border-[#FF6B35]'
                        : 'border-[#27384A] bg-transparent'
                    }`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#F0EDE8] font-medium truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {p.category_name && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#27384A] text-[#8A95A5] whitespace-nowrap">
                            {p.category_name}
                          </span>
                        )}
                        <span className="text-[10px] text-[#8A95A5]">{resolveUnit(p.unit_display || p.unit)}</span>
                        {Number(p.stock_quantity) > 0
                          ? <span className="text-[10px] text-[#4A9E6B]">✓ {p.stock_quantity}</span>
                          : <span className="text-[10px] text-red-400">Sin stock</span>}
                      </div>
                    </div>

                    {/* Qty control (when selected) */}
                    {isSelected && sel && (
                      <div
                        className="flex items-center gap-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => updateQty(p.id, sel.qty - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-[#27384A] text-[#F0EDE8] text-xs hover:bg-[#FF6B35]/20 transition-colors"
                        >−</button>
                        <input
                          type="number"
                          value={sel.qty}
                          min={1}
                          onChange={e => updateQty(p.id, parseFloat(e.target.value) || 1)}
                          className="w-10 bg-[#131D28] border border-[#27384A] rounded px-1 py-0.5 text-xs text-center text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60"
                        />
                        <button
                          onClick={() => updateQty(p.id, sel.qty + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-[#27384A] text-[#F0EDE8] text-xs hover:bg-[#FF6B35]/20 transition-colors"
                        >+</button>
                      </div>
                    )}

                    {/* Price */}
                    <span className="text-xs text-[#FF6B35] font-semibold flex-shrink-0">
                      {fmtQ(parseFloat(p.unit_price_gtq) || 0)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#27384A] flex-shrink-0">
          <span className="text-xs text-[#8A95A5]">
            {selCount > 0 ? `${selCount} producto${selCount !== 1 ? 's' : ''} seleccionado${selCount !== 1 ? 's' : ''}` : 'Ningún producto seleccionado'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8A95A5] border border-[#27384A] rounded-xl hover:text-[#F0EDE8] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={selCount === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B35] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Plus size={12} /> Agregar {selCount > 0 ? `${selCount} partida${selCount !== 1 ? 's' : ''}` : 'partidas'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  projectId:   number
  projectName: string
  clientName:  string
}

export default function QuoteTab({ projectId, projectName, clientName }: Props) {
  const [view,          setView]          = useState<'list' | 'form'>('list')
  const [quotes,        setQuotes]        = useState<Quote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [templates,     setTemplates]     = useState<QuoteTemplate[]>([])

  const [loading,          setLoading]          = useState(true)
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [saving,           setSaving]           = useState(false)
  const [sending,          setSending]          = useState(false)
  const [logoUrl,          setLogoUrl]          = useState<string | null>(null)
  const [companyName,      setCompanyName]      = useState('Grucore')
  const [tagline,          setTagline]          = useState('')
  const [saveAsModal,      setSaveAsModal]      = useState(false)
  const [tmplName,         setTmplName]         = useState('')
  const [tmplSaving,       setTmplSaving]       = useState(false)
  const [invCats,          setInvCats]          = useState<InventoryCategory[]>(_invCatsCache ?? [])

  const [items,       setItems]       = useState<LocalLineItem[]>([])
  const [validUntil,  setValidUntil]  = useState('')
  const [notes,       setNotes]       = useState('')
  const [discountPct, setDiscountPct] = useState(0)
  const [taxPct,      setTaxPct]      = useState(12)
  const [dirty,       setDirty]       = useState(false)
  const [catalogOpen, setCatalogOpen] = useState(false)

  const isEditable = !selectedQuote || selectedQuote.status === 'draft' || selectedQuote.status === 'changes_requested'

  useEffect(() => {
    getCompanySettings().then(s => {
      setLogoUrl(s.logo_url)
      setCompanyName(s.name || 'Grucore')
      setTagline(s.tagline || '')
    })
    getProjectQuotes(projectId)
      .then(list => { setQuotes(list); setLoading(false) })
      .catch(() => setLoading(false))
    getQuoteTemplates()
      .then(list => { setTemplates(list); setLoadingTemplates(false) })
      .catch(() => setLoadingTemplates(false))
    if (!_invCatsCache) loadInvCatsCache().then(cats => setInvCats(cats))
  }, [projectId])

  function hydrateForm(q: Quote) {
    setItems(q.line_items.map((li, i) => ({
      ...li,
      order:              li.order ?? i,
      _sourceProductName: li.product_name ?? undefined,
      _sourceUnitPrice:   li.product_id ? Number(li.unit_price) : undefined,
      _priceModified:     false,
    })))
    setValidUntil(q.valid_until ?? '')
    setNotes(q.notes)
    setDiscountPct(parseFloat(q.discount_pct) || 0)
    setTaxPct(parseFloat(q.tax_pct) || 12)
    setDirty(false)
  }

  function markDirty() { setDirty(true) }

  function handleAddFromCatalog(newItems: LocalLineItem[]) {
    setItems(prev => [
      ...prev,
      ...newItems.map((item, i) => ({ ...item, order: prev.length + i })),
    ])
    markDirty()
  }

  function addItem() {
    setItems(prev => [...prev, { category: 'other', description: '', quantity: 1, unit: '', unit_price: 0, order: prev.length }])
    markDirty()
  }

  function updateItem(index: number, field: keyof QuoteLineItem, value: string | number) {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const updated: LocalLineItem = { ...item, [field]: value }
      if (item.product_id && field === 'unit_price') {
        updated._priceModified = Number(value) !== item._sourceUnitPrice
      }
      return updated
    }))
    markDirty()
  }

  function handleProductSelect(index: number, p: Product) {
    const price  = parseFloat(p.unit_price_gtq) || 0
    const catId  = typeof p.category === 'number' ? p.category : null
    const invCat = catId != null ? invCats.find(c => c.id === catId) : null
    const qCat   = invCat ? invCatToQuoteCat(invCat.name) : 'materials'
    setItems(prev => prev.map((item, i) => i === index ? {
      ...item,
      product_id:         p.id,
      product_name:       p.name,
      description:        p.name,
      unit:               resolveUnit(p.unit_display || p.unit),
      unit_price:         price,
      category:           qCat,
      _invCatId:          catId ?? undefined,
      _sourceProductName: p.name,
      _sourceUnitPrice:   price,
      _priceModified:     false,
    } : item))
    markDirty()
  }

  function handleCatSelect(index: number, invCatId: number | null, qCat: QuoteCategory) {
    setItems(prev => prev.map((item, i) => i !== index ? item : {
      ...item, category: qCat, _invCatId: invCatId ?? undefined,
    }))
    markDirty()
  }

  function deleteItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
    markDirty()
  }

  // Create new blank quote (or with template items pre-loaded)
  async function handleCreate(templateItems?: QuoteLineItem[]) {
    setSaving(true)
    try {
      const q = await createProjectQuote(projectId, {
        line_items:   templateItems ? templateItems.map((li, i) => ({ ...li, order: i })) : [],
        valid_until:  null,
        notes:        '',
        discount_pct: '0',
        tax_pct:      '12',
      })
      setQuotes(prev => [q, ...prev])
      setSelectedQuote(q)
      hydrateForm(q)
      setView('form')
      toast.success(templateItems ? 'Cotización creada desde plantilla' : 'Cotización creada')
    } catch (e: any) { toast.error(e.message ?? 'Error al crear') }
    finally { setSaving(false) }
  }

  function handleOpenQuote(q: Quote) {
    setSelectedQuote(q)
    hydrateForm(q)
    setView('form')
  }

  function handleBackToList() {
    setSelectedQuote(null)
    setView('list')
  }

  async function handleSave() {
    if (!selectedQuote) return
    setSaving(true)
    try {
      const updated = await updateProjectQuote(projectId, selectedQuote.id, {
        line_items:   items.map((li, i) => toApiItem(li, i)),
        valid_until:  validUntil || null,
        notes, discount_pct: String(discountPct), tax_pct: String(taxPct),
      })
      setSelectedQuote(updated)
      setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q))
      const restoredItems: LocalLineItem[] = updated.line_items.map((li, i) => ({
        ...li,
        order:              li.order ?? i,
        _sourceProductName: li.product_name ?? items[i]?._sourceProductName,
        _sourceUnitPrice:   items[i]?._sourceUnitPrice,
        _priceModified:     items[i]?._priceModified,
      }))
      setItems(restoredItems)
      setValidUntil(updated.valid_until ?? '')
      setNotes(updated.notes)
      setDiscountPct(parseFloat(updated.discount_pct) || 0)
      setTaxPct(parseFloat(updated.tax_pct) || 12)
      setDirty(false)
      toast.success('Cotización guardada')
    } catch (e: any) { toast.error(e.message ?? 'Error al guardar') }
    finally { setSaving(false) }
  }

  async function handleSend() {
    if (!selectedQuote) return
    if (dirty) await handleSave()
    setSending(true)
    try {
      const updated = await sendProjectQuote(projectId, selectedQuote.id)
      setSelectedQuote(updated)
      setQuotes(prev => prev.map(q => q.id === updated.id ? updated : q))
      hydrateForm(updated)
      toast.success('Cotización enviada al cliente')
    } catch (e: any) { toast.error(e.message ?? 'Error al enviar') }
    finally { setSending(false) }
  }

  async function handleSaveAsTemplate() {
    if (!tmplName.trim()) return
    setTmplSaving(true)
    try {
      const newTmpl = await createQuoteTemplate({
        name:        tmplName.trim(),
        description: '',
        line_items:  items.map((li, i) => ({
          category: li.category, description: li.description,
          quantity: Number(li.quantity), unit: li.unit,
          unit_price: Number(li.unit_price), order: i,
        })),
      })
      setTemplates(prev => [newTmpl, ...prev])
      setSaveAsModal(false); setTmplName('')
      toast.success('Plantilla guardada')
    } catch (e: any) { toast.error(e.message ?? 'Error al guardar plantilla') }
    finally { setTmplSaving(false) }
  }

  async function handleUseTemplate(t: QuoteTemplate) {
    const lineItems: QuoteLineItem[] = t.line_items.map((li, i) => ({
      category:    li.category as QuoteCategory,
      description: li.description,
      quantity:    Number(li.quantity),
      unit:        li.unit,
      unit_price:  Number(li.unit_price),
      order:       i,
    }))
    await handleCreate(lineItems)
  }

  async function handleDeleteTemplate(id: number) {
    await deleteQuoteTemplate(id)
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success('Plantilla eliminada')
  }

  function handleDeleteQuote() {
    if (!selectedQuote) return
    confirmToast({
      title:        '¿Eliminar cotización?',
      description:  'Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        await deleteProjectQuote(projectId, selectedQuote.id)
        setQuotes(prev => prev.filter(q => q.id !== selectedQuote.id))
        setSelectedQuote(null)
        setView('list')
        toast.success('Cotización eliminada')
      },
    })
  }

  // ── Loading ──
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={22} className="animate-spin text-[#FF6B35]" />
    </div>
  )

  // ── List view ──
  if (view === 'list') return (
    <QuoteListView
      quotes={quotes}
      templates={templates}
      loadingTemplates={loadingTemplates}
      saving={saving}
      onCreateNew={() => handleCreate()}
      onOpenQuote={handleOpenQuote}
      onUseTemplate={handleUseTemplate}
      onDeleteTemplate={handleDeleteTemplate}
    />
  )

  // ── Form view ──
  return (
    <div className="space-y-5">

      {/* ── Back nav + header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={handleBackToList}
            className="flex items-center gap-1.5 text-xs text-[#8A95A5] hover:text-[#F0EDE8] transition-colors mb-3"
          >
            <ArrowLeft size={13} /> Cotizaciones
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {selectedQuote?.quote_number || 'Cotización'}
            </h2>
            {selectedQuote && <QuoteStatusChip status={selectedQuote.status} />}
            {selectedQuote && (
              <span className="text-xs text-[#8A95A5] bg-[#27384A] px-2 py-0.5 rounded-full">
                Rev. {selectedQuote.revision}
              </span>
            )}
          </div>
          {selectedQuote && (
            <div className="flex items-center gap-3 mt-1 text-xs text-[#8A95A5]">
              {selectedQuote.sent_at    && <span>Enviada: {fmtDate(selectedQuote.sent_at)}</span>}
              {selectedQuote.decided_at && <span>Decidida: {fmtDate(selectedQuote.decided_at)}</span>}
              {selectedQuote.created_by_name && <span>Por: {selectedQuote.created_by_name}</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedQuote && selectedQuote.status !== 'draft' && (
            <button
              onClick={() => downloadQuotePDF(projectId, selectedQuote.id).catch(e => toast.error(e.message ?? 'Error al descargar PDF'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
            >
              <Download size={13} /> PDF
            </button>
          )}
          {isEditable && (
            <>
              {items.length > 0 && (
                <button
                  onClick={() => setSaveAsModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors"
                >
                  <LayoutTemplate size={13} /> Guardar plantilla
                </button>
              )}
              {selectedQuote?.status === 'draft' && (
                <button
                  onClick={handleDeleteQuote}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-red-400 hover:border-red-400/30 transition-colors"
                >
                  <Trash2 size={13} /> Eliminar
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#27384A] text-xs text-[#8A95A5] hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors disabled:opacity-40"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Guardar
              </button>
              <button
                onClick={handleSend}
                disabled={sending || items.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF6B35] text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Enviar al cliente
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Banners ── */}
      {selectedQuote && (selectedQuote.status === 'changes_requested' || selectedQuote.status === 'rejected') && selectedQuote.client_comment && (
        <div className={cn('flex items-start gap-3 p-4 rounded-xl border', selectedQuote.status === 'rejected' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-400/10 border-amber-400/20')}>
          <AlertTriangle size={16} className={cn('flex-shrink-0 mt-0.5', selectedQuote.status === 'rejected' ? 'text-red-400' : 'text-amber-400')} />
          <div>
            <p className={cn('text-xs font-semibold mb-0.5', selectedQuote.status === 'rejected' ? 'text-red-400' : 'text-amber-400')}>
              {selectedQuote.status === 'rejected' ? 'Cotización rechazada' : 'El cliente solicitó cambios'}
            </p>
            <p className="text-xs text-[#8A95A5] leading-relaxed">{selectedQuote.client_comment}</p>
          </div>
        </div>
      )}
      {selectedQuote?.status === 'sent' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#6B8CFF]/10 border border-[#6B8CFF]/20">
          <Clock size={16} className="text-[#6B8CFF] flex-shrink-0" />
          <p className="text-xs text-[#8A95A5]">Cotización enviada el {fmtDate(selectedQuote.sent_at)}. Esperando respuesta del cliente.</p>
        </div>
      )}
      {selectedQuote?.status === 'approved' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#4A9E6B]/10 border border-[#4A9E6B]/20">
          <CheckCircle2 size={16} className="text-[#4A9E6B] flex-shrink-0" />
          <p className="text-xs text-[#8A95A5]">El cliente aprobó esta cotización el {fmtDate(selectedQuote.decided_at)}. Total: <span className="text-[#4A9E6B] font-semibold">{fmtQ(selectedQuote.total_amount)}</span></p>
        </div>
      )}

      {/* ── Stock alerts ── */}
      {selectedQuote?.status === 'approved' && selectedQuote.stock_alerts && selectedQuote.stock_alerts.length > 0 && (
        <div className="rounded-xl border border-amber-400/25 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-400/10 border-b border-amber-400/20">
            <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-400">
              Alertas de inventario — {selectedQuote.stock_alerts.length} {selectedQuote.stock_alerts.length === 1 ? 'material sin stock suficiente' : 'materiales sin stock suficiente'}
            </p>
          </div>
          <div className="divide-y divide-[#27384A]">
            {selectedQuote.stock_alerts.map((alert: StockAlert, idx: number) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-[#131D28]">
                <div>
                  <p className="text-xs text-[#F0EDE8] font-medium">{alert.product_name}</p>
                  <p className="text-[10px] text-[#8A95A5]">{alert.line_description}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-xs text-red-400 font-medium">Requerido: {alert.required} {alert.unit}</p>
                  <p className="text-[10px] text-[#8A95A5]">
                    Disponible: <span className="text-amber-400">{alert.available} {alert.unit}</span>
                    {' · '}Faltante: <span className="text-red-400">{alert.shortage.toFixed(2)} {alert.unit}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 bg-[#131D28] border-t border-[#27384A]">
            <p className="text-[10px] text-[#8A95A5]">Gestiona el abastecimiento en el módulo de <span className="text-[#FF6B35]">Inventario</span> antes de iniciar los trabajos.</p>
          </div>
        </div>
      )}

      {/* ── Modified-price banner ── */}
      {(() => {
        const modCount = items.filter(i => i._priceModified).length
        return modCount > 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-400/8 border border-amber-400/20">
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
            <p className="text-[11px] text-amber-400">
              {modCount} {modCount === 1 ? 'partida tiene' : 'partidas tienen'} precio modificado respecto al catálogo de inventario.
            </p>
          </div>
        ) : null
      })()}

      {/* ── Quote document ── */}
      <div className="bg-[#131D28] border border-[#27384A] rounded-2xl overflow-hidden">

        {/* Document header */}
        <div className="px-6 py-5 border-b border-[#27384A] flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {logoUrl
              ? (
                <div className="flex flex-col gap-0.5">
                  <Image src={logoUrl} alt={companyName} width={120} height={40} className="h-10 w-auto" unoptimized />
                  {tagline && <p className="text-[11px] text-[#8A95A5]">{tagline}</p>}
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-white">{companyName}</p>
                  {tagline && <p className="text-[11px] text-[#8A95A5]">{tagline}</p>}
                </div>
              )
            }
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8A95A5]">Para</p>
            <p className="text-sm font-semibold text-white">{clientName}</p>
            <p className="text-[11px] text-[#8A95A5]">{projectName}</p>
            {selectedQuote?.created_at && (
              <p className="text-[11px] text-[#8A95A5] mt-0.5">
                Creada: {fmtDate(selectedQuote.created_at)}
              </p>
            )}
            <p className="text-[11px] text-[#8A95A5] mt-1">
              {isEditable ? (
                <span className="inline-flex items-center gap-1">Válida hasta:
                  <input type="date" value={validUntil} onChange={e => { setValidUntil(e.target.value); markDirty() }}
                    className="bg-transparent border-b border-[#27384A] text-[#F0EDE8] text-[11px] focus:outline-none focus:border-[#FF6B35]/60 ml-1"
                  />
                </span>
              ) : validUntil ? `Válida hasta: ${fmtDate(validUntil)}` : null}
            </p>
          </div>
        </div>

        {/* Line items table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#27384A]">
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[130px]">Categoría</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide">Descripción</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[80px]">Cant.</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[80px]">Unidad</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[120px]">P. Unitario</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide w-[120px]">Subtotal</th>
                <th className="w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-8 text-center text-xs text-[#8A95A5]">
                  {isEditable ? 'Añade partidas a la cotización.' : 'Sin partidas.'}
                </td></tr>
              ) : items.map((item, i) => (
                <LineItemRow key={i} item={item} index={i} editable={isEditable}
                  invCats={invCats}
                  onChange={updateItem} onDelete={deleteItem}
                  onProductSelect={handleProductSelect}
                  onCatSelect={handleCatSelect}
                />
              ))}
            </tbody>
          </table>
        </div>

        {isEditable && (
          <div className="px-4 py-3 border-t border-[#1F2D3A] flex items-center gap-3">
            <button
              onClick={() => setCatalogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-xs text-[#FF6B35] font-medium hover:bg-[#FF6B35]/20 transition-colors"
            >
              <Package size={13} /> Agregar del catálogo
            </button>
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs text-[#8A95A5] hover:text-[#F0EDE8] transition-colors"
            >
              <Plus size={13} /> Partida libre
            </button>
          </div>
        )}

        {/* Footer: notes + totals */}
        <div className="px-6 py-5 border-t border-[#27384A] flex flex-col md:flex-row gap-6 justify-between">
          <div className="flex-1 max-w-md">
            <p className="text-[11px] font-medium text-[#8A95A5] uppercase tracking-wide mb-2">Notas / Condiciones</p>
            {isEditable ? (
              <textarea value={notes} onChange={e => { setNotes(e.target.value); markDirty() }} rows={4}
                placeholder="Condiciones de pago, vigencia, aclaraciones…"
                className="w-full bg-[#1F2D3A] border border-[#27384A] rounded-xl px-3 py-2.5 text-xs text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60 resize-none"
              />
            ) : notes ? (
              <p className="text-xs text-[#8A95A5] leading-relaxed whitespace-pre-wrap">{notes}</p>
            ) : (
              <p className="text-xs text-[#8A95A5] italic">Sin notas adicionales.</p>
            )}
          </div>
          <TotalsBlock items={items} discountPct={discountPct} taxPct={taxPct} editable={isEditable}
            onDiscountChange={v => { setDiscountPct(v); markDirty() }}
            onTaxChange={v => { setTaxPct(v); markDirty() }}
          />
        </div>
      </div>

      {dirty && isEditable && (
        <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
          <AlertTriangle size={11} /> Hay cambios sin guardar. Pulsa "Guardar" o "Enviar al cliente" para confirmarlos.
        </p>
      )}

      {/* ── Catalog modal ── */}
      <CatalogModal
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onAdd={handleAddFromCatalog}
        invCats={invCats}
      />

      {/* ── Save as template modal ── */}
      {saveAsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1A2530] border border-[#27384A] rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Guardar como plantilla</h3>
              <button onClick={() => setSaveAsModal(false)} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={16} /></button>
            </div>
            <p className="text-xs text-[#8A95A5]">Las partidas actuales se guardarán como plantilla reutilizable en futuras cotizaciones.</p>
            <input
              type="text" value={tmplName} onChange={e => setTmplName(e.target.value)}
              placeholder="Nombre de la plantilla (ej. Obra civil residencial)"
              className="w-full bg-[#131D28] border border-[#27384A] rounded-xl px-3 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#8A95A5] focus:outline-none focus:border-[#FF6B35]/60"
              onKeyDown={e => { if (e.key === 'Enter') handleSaveAsTemplate() }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSaveAsModal(false)} className="px-4 py-2 text-xs text-[#8A95A5] border border-[#27384A] rounded-xl hover:text-[#F0EDE8] transition-colors">Cancelar</button>
              <button onClick={handleSaveAsTemplate} disabled={tmplSaving || !tmplName.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B35] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {tmplSaving ? <Loader2 size={12} className="animate-spin" /> : <LayoutTemplate size={12} />}
                Guardar plantilla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
