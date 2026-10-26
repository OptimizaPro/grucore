'use client'

import { useState, useEffect } from 'react'
import {
  Menu, FolderOpen, Plus, X, Loader2, AlertCircle, ExternalLink,
  FileText, FileCheck, CheckCircle2, Circle, Clock, XCircle,
  Archive, Trash2, Search, ChevronDown, MapPin, User, Eye, EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import Pagination from '@/components/erp/Pagination'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getMe, getMyProjects,
  getDocuments, createDocument, updateDocument, deleteDocument,
  getSubmittals, createSubmittal, reviewSubmittal,
  getPunchItems, createPunchItem, resolvePunchItem, updatePunchItem,
  type User as UserType, type ProjectList,
  type ProjectDocument, type DocumentType,
  type Submittal, type SubmittalStatus,
  type PunchItem, type PunchItemStatus, type PunchItemPriority, type PunchItemCategory,
} from '@/lib/api'

// ─── Pagination constants ─────────────────────────────────────────────────────

const DOCS_PER_PAGE       = 10
const SUBMITTALS_PER_PAGE = 10
const PUNCH_PER_PAGE      = 10

// ─── Constants ────────────────────────────────────────────────────────────────

const DOC_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'contract',      label: 'Contrato' },
  { value: 'blueprint',     label: 'Plano' },
  { value: 'specification', label: 'Especificación' },
  { value: 'report',        label: 'Reporte' },
  { value: 'permit',        label: 'Permiso' },
  { value: 'other',         label: 'Otro' },
]

const DOC_TYPE_COLORS: Record<DocumentType, string> = {
  contract:      '#FF6B35',
  blueprint:     '#6B8CFF',
  specification: '#4A9E6B',
  report:        '#F59E0B',
  permit:        '#8B5CF6',
  other:         '#8A95A5',
}

const SUBMITTAL_STATUS_LABELS: Record<SubmittalStatus, string> = {
  pending:                'Pendiente',
  submitted:              'Enviada',
  in_review:              'En revisión',
  approved:               'Aprobada',
  approved_with_comments: 'Aprobada c/comentarios',
  rejected:               'Rechazada',
  resubmit:               'Reenviar',
}

const SUBMITTAL_STATUS_COLORS: Record<SubmittalStatus, string> = {
  pending:                '#8A95A5',
  submitted:              '#6B8CFF',
  in_review:              '#F59E0B',
  approved:               '#4A9E6B',
  approved_with_comments: '#4A9E6B',
  rejected:               '#f87171',
  resubmit:               '#FF6B35',
}

const PUNCH_STATUS_CONFIG: Record<PunchItemStatus, { label: string; color: string; Icon: any }> = {
  open:        { label: 'Abierto',      color: '#f87171', Icon: Circle },
  in_progress: { label: 'En progreso',  color: '#F59E0B', Icon: Clock },
  resolved:    { label: 'Resuelto',     color: '#4A9E6B', Icon: CheckCircle2 },
  closed:      { label: 'Cerrado',      color: '#8A95A5', Icon: XCircle },
}

const PUNCH_PRIORITY_COLORS: Record<PunchItemPriority, string> = {
  low:      '#8A95A5',
  medium:   '#F59E0B',
  high:     '#FF6B35',
  critical: '#f87171',
}

const PUNCH_CATEGORY_CONFIG: Record<PunchItemCategory, { label: string; color: string }> = {
  correction:     { label: 'Corrección',     color: '#FF6B35' },
  observation:    { label: 'Observación',    color: '#6B8CFF' },
  non_conformity: { label: 'No conformidad', color: '#f87171' },
  risk:           { label: 'Riesgo',         color: '#F59E0B' },
  other:          { label: 'Otro',           color: '#8A95A5' },
}

const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors'
const labelCls = 'block text-xs text-[#8A95A5] mb-1.5 font-medium'

type Tab = 'documentos' | 'submittals' | 'punch'

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ERPDocumentosPage() {
  const [me, setMe]               = useState<UserType | null>(null)
  const [projects, setProjects]   = useState<ProjectList[]>([])
  const [selectedPid, setSelectedPid] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('documentos')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Documents state
  const [docs, setDocs]                 = useState<ProjectDocument[]>([])
  const [docsLoading, setDocsLoading]   = useState(false)
  const [docSearch, setDocSearch]       = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState<DocumentType | ''>('')
  const [showDocForm, setShowDocForm]   = useState(false)
  const [docFormLoading, setDocFormLoading] = useState(false)
  const [docFormError, setDocFormError] = useState('')
  const [dTitle, setDTitle]   = useState('')
  const [dType, setDType]     = useState<DocumentType>('other')
  const [dFileUrl, setDFileUrl] = useState('')
  const [dFileName, setDFileName] = useState('')
  const [dDesc, setDDesc]     = useState('')
  const [dVersion, setDVersion] = useState('1.0')
  const [dVisibleToClient, setDVisibleToClient] = useState(false)

  // Submittals state
  const [submittals, setSubmittals]     = useState<Submittal[]>([])
  const [submittalsLoading, setSubmittalsLoading] = useState(false)
  const [showSubmittalForm, setShowSubmittalForm] = useState(false)
  const [submittalFormLoading, setSubmittalFormLoading] = useState(false)
  const [submittalFormError, setSubmittalFormError] = useState('')
  const [sTitle, setSTitle]   = useState('')
  const [sDesc, setSDesc]     = useState('')
  const [sFileUrl, setSFileUrl] = useState('')
  const [reviewingId, setReviewingId]   = useState<number | null>(null)
  const [reviewStatus, setReviewStatus] = useState<SubmittalStatus>('approved')
  const [reviewNotes, setReviewNotes]   = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  // Punch list state
  const [punchItems, setPunchItems]     = useState<PunchItem[]>([])
  const [punchLoading, setPunchLoading] = useState(false)
  const [punchStatusFilter, setPunchStatusFilter]     = useState<PunchItemStatus | ''>('')
  const [punchCategoryFilter, setPunchCategoryFilter] = useState<PunchItemCategory | ''>('')
  const [showPunchForm, setShowPunchForm] = useState(false)
  const [punchFormLoading, setPunchFormLoading] = useState(false)
  const [punchFormError, setPunchFormError] = useState('')
  const [pDesc, setPDesc]           = useState('')
  const [pLocation, setPLocation]   = useState('')
  const [pPriority, setPPriority]   = useState<PunchItemPriority>('medium')
  const [pCategory, setPCategory]   = useState<PunchItemCategory>('correction')
  const [pDueDate, setPDueDate] = useState('')
  const [resolvingId, setResolvingId]   = useState<number | null>(null)
  const [resolveNotes, setResolveNotes] = useState('')
  const [resolveLoading, setResolveLoading] = useState(false)
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<number | null>(null)

  // Pagination state
  const [docPage, setDocPage]             = useState(1)
  const [submittalPage, setSubmittalPage] = useState(1)
  const [punchPage, setPunchPage]         = useState(1)

  const isAdmin = me?.role === 'admin' || me?.role === 'project_manager'

  useEffect(() => {
    async function init() {
      try {
        const user = await getMe()
        if (user.role === 'client_portal') { window.location.href = '/portal'; return }
        setMe(user)
        const res = await getMyProjects()
        const list = res.results ?? (res as any)
        setProjects(list)
        if (list.length > 0) setSelectedPid(list[0].id)
      } catch (e: any) {
        if (e.message === 'Sesión expirada') return
        setError(e.message ?? 'Error al cargar')
      } finally { setLoading(false) }
    }
    init()
  }, [])

  useEffect(() => {
    if (!selectedPid) return
    loadTabData(activeTab, selectedPid)
  }, [selectedPid, activeTab])

  async function loadTabData(tab: Tab, pid: number) {
    if (tab === 'documentos') {
      setDocsLoading(true)
      try { setDocs(await getDocuments(pid)) } catch {} finally { setDocsLoading(false) }
    } else if (tab === 'submittals') {
      setSubmittalsLoading(true)
      try { setSubmittals(await getSubmittals(pid)) } catch {} finally { setSubmittalsLoading(false) }
    } else if (tab === 'punch') {
      setPunchLoading(true)
      try { setPunchItems(await getPunchItems(pid)) } catch {} finally { setPunchLoading(false) }
    }
  }

  function changeProject(pid: number) {
    setSelectedPid(pid)
    setShowDocForm(false); setShowSubmittalForm(false); setShowPunchForm(false)
    setDocs([]); setSubmittals([]); setPunchItems([])
    setDocPage(1); setSubmittalPage(1); setPunchPage(1)
  }

  // ── Documents handlers ────────────────────────────────────────────────────

  async function handleCreateDoc(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPid) return
    setDocFormLoading(true); setDocFormError('')
    try {
      const doc = await createDocument(selectedPid, {
        title: dTitle, document_type: dType, file_url: dFileUrl,
        file_name: dFileName || dTitle, description: dDesc, version: dVersion,
        visible_to_client: dVisibleToClient,
      })
      setDocs(prev => [doc, ...prev])
      setShowDocForm(false); setDTitle(''); setDType('other'); setDFileUrl(''); setDFileName(''); setDDesc(''); setDVersion('1.0'); setDVisibleToClient(false)
      toast.success('Documento creado')
    } catch (e: any) { setDocFormError(e.message) }
    finally { setDocFormLoading(false) }
  }

  async function handleArchiveDoc(doc: ProjectDocument) {
    if (!selectedPid) return
    const updated = await updateDocument(selectedPid, doc.id, { is_archived: !doc.is_archived })
    setDocs(prev => prev.map(d => d.id === doc.id ? updated : d))
  }

  async function handleDeleteDoc(id: number) {
    if (!selectedPid) return
    const name = docs.find(d => d.id === id)?.title ?? 'Documento'
    try {
      await deleteDocument(selectedPid, id)
      setDocs(prev => prev.filter(d => d.id !== id))
      setConfirmDeleteDocId(null)
      toast.success(`"${name}" eliminado`)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al eliminar el documento')
    }
  }

  // ── Submittals handlers ───────────────────────────────────────────────────

  async function handleCreateSubmittal(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPid) return
    setSubmittalFormLoading(true); setSubmittalFormError('')
    try {
      const s = await createSubmittal(selectedPid, { title: sTitle, description: sDesc, file_url: sFileUrl })
      setSubmittals(prev => [s, ...prev])
      setShowSubmittalForm(false); setSTitle(''); setSDesc(''); setSFileUrl('')
      toast.success('Solicitud creada')
    } catch (e: any) { setSubmittalFormError(e.message) }
    finally { setSubmittalFormLoading(false) }
  }

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPid || !reviewingId) return
    setReviewLoading(true)
    try {
      const updated = await reviewSubmittal(selectedPid, reviewingId, reviewStatus, reviewNotes)
      setSubmittals(prev => prev.map(s => s.id === reviewingId ? updated : s))
      setReviewingId(null); setReviewNotes('')
      toast.success('Revisión registrada')
    } catch (e: any) { toast.error(e.message ?? 'Error al revisar la solicitud') }
    finally { setReviewLoading(false) }
  }

  // ── Punch list handlers ───────────────────────────────────────────────────

  async function handleCreatePunch(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPid) return
    setPunchFormLoading(true); setPunchFormError('')
    try {
      const item = await createPunchItem(selectedPid, {
        description: pDesc, location: pLocation, priority: pPriority,
        category: pCategory, due_date: pDueDate || null,
      })
      setPunchItems(prev => [item, ...prev])
      setShowPunchForm(false); setPDesc(''); setPLocation(''); setPPriority('medium'); setPCategory('correction'); setPDueDate('')
      toast.success('Punto de corrección creado')
    } catch (e: any) { setPunchFormError(e.message) }
    finally { setPunchFormLoading(false) }
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPid || !resolvingId) return
    setResolveLoading(true)
    try {
      const updated = await resolvePunchItem(selectedPid, resolvingId, resolveNotes)
      setPunchItems(prev => prev.map(p => p.id === resolvingId ? updated : p))
      setResolvingId(null); setResolveNotes('')
      toast.success('Punto resuelto')
    } catch (e: any) { toast.error(e.message ?? 'Error al resolver el punto') }
    finally { setResolveLoading(false) }
  }

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredDocs = docs.filter(d => {
    const matchSearch = !docSearch || d.title.toLowerCase().includes(docSearch.toLowerCase()) || d.file_name.toLowerCase().includes(docSearch.toLowerCase())
    const matchType = !docTypeFilter || d.document_type === docTypeFilter
    return matchSearch && matchType
  })

  const filteredPunch = punchItems.filter(p =>
    (!punchStatusFilter || p.status === punchStatusFilter) &&
    (!punchCategoryFilter || p.category === punchCategoryFilter)
  )

  // Paginated slices
  const pagedDocs       = filteredDocs.slice((docPage - 1) * DOCS_PER_PAGE, docPage * DOCS_PER_PAGE)
  const pagedSubmittals = submittals.slice((submittalPage - 1) * SUBMITTALS_PER_PAGE, submittalPage * SUBMITTALS_PER_PAGE)
  const pagedPunch      = filteredPunch.slice((punchPage - 1) * PUNCH_PER_PAGE, punchPage * PUNCH_PER_PAGE)

  const punchStats = {
    open:        punchItems.filter(p => p.status === 'open').length,
    in_progress: punchItems.filter(p => p.status === 'in_progress').length,
    resolved:    punchItems.filter(p => p.status === 'resolved').length,
    closed:      punchItems.filter(p => p.status === 'closed').length,
  }

  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST' : 'ST'
  const selectedProject = projects.find(p => p.id === selectedPid)

  if (loading) return (
    <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
        <p className="text-sm text-[#8A95A5]">Cargando…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
      <div className="text-center space-y-4">
        <AlertCircle size={32} className="text-red-400 mx-auto" />
        <p className="text-sm text-[#8A95A5]">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg">Reintentar</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#131D28] flex">
      <ERPSidebar
        currentPage="documentos"
        userName={me?.full_name} userInitials={initials} userAvatarUrl={me?.avatar_url}
        open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onUserUpdate={setMe}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Documentos
          </p>
          <ERPAvatar avatarUrl={me?.avatar_url} initials={initials} size="md" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Project selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#8A95A5] whitespace-nowrap">Proyecto</label>
              <div className="relative">
                <select
                  value={selectedPid ?? ''}
                  onChange={e => changeProject(Number(e.target.value))}
                  className="appearance-none bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-4 pr-9 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 cursor-pointer transition-colors"
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5] pointer-events-none" />
              </div>
              {selectedProject && (
                <span className="text-xs text-[#4A5568]">{selectedProject.status} · {selectedProject.client_name}</span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-[#27384A]">
              {([
                { key: 'documentos', label: 'Documentos' },
                { key: 'submittals', label: 'Solicitudes de Aprobación' },
                { key: 'punch',      label: `Lista de Correcciones${punchItems.length > 0 ? ` (${punchStats.open + punchStats.in_progress})` : ''}` },
              ] as { key: Tab; label: string }[]).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === key ? 'border-[#FF6B35] text-[#FF6B35]' : 'border-transparent text-[#8A95A5] hover:text-[#F0EDE8]',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Tab: Documentos ─────────────────────────────────────── */}
            {activeTab === 'documentos' && (
              <div className="space-y-4">
                {/* Actions row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
                    <input type="text" value={docSearch} onChange={e => { setDocSearch(e.target.value); setDocPage(1) }}
                      placeholder="Buscar documento…"
                      className="w-full bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] placeholder:text-[#4A5568] focus:outline-none focus:border-[#FF6B35]/60 transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <button onClick={() => { setDocTypeFilter(''); setDocPage(1) }} className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors', !docTypeFilter ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}>Todos</button>
                    {DOC_TYPES.map(t => (
                      <button key={t.value} onClick={() => { setDocTypeFilter(t.value); setDocPage(1) }}
                        className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors', docTypeFilter === t.value ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}
                      >{t.label}</button>
                    ))}
                  </div>
                  {isAdmin && (
                    <button onClick={() => setShowDocForm(v => !v)} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors">
                      <Plus size={13} /><span className="hidden sm:inline">Subir documento</span>
                    </button>
                  )}
                </div>


                {/* Doc list */}
                {docsLoading ? (
                  <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#FF6B35]" /></div>
                ) : filteredDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <FolderOpen size={40} className="text-[#27384A]" />
                    <p className="text-[#8A95A5] text-sm">{docs.length === 0 ? 'No hay documentos para este proyecto.' : 'Sin resultados.'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pagedDocs.map(doc => {
                      const color = DOC_TYPE_COLORS[doc.document_type]
                      return (
                        <div key={doc.id} className={cn('flex items-start gap-4 p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/20 transition-colors', doc.is_archived && 'opacity-50')}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
                            <FileText size={16} style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>
                                {DOC_TYPES.find(t => t.value === doc.document_type)?.label}
                              </span>
                              {doc.is_archived && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27384A] text-[#8A95A5] font-medium">Archivado</span>}
                              {doc.visible_to_client
                                ? <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#4A9E6B20', color: '#4A9E6B' }}>Visible al cliente</span>
                                : <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27384A] text-[#4A5568] font-medium">Solo interno</span>
                              }
                              <span className="text-[10px] text-[#4A5568]" style={{ fontFamily: 'Space Mono, monospace' }}>v{doc.version}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#F0EDE8] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{doc.title}</p>
                            {doc.description && <p className="text-xs text-[#8A95A5] mt-0.5 truncate">{doc.description}</p>}
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] text-[#4A5568]">{doc.file_name}</span>
                              {doc.uploaded_by_name && <span className="text-[10px] text-[#4A5568]">{doc.uploaded_by_name}</span>}
                              <span className="text-[10px] text-[#4A5568]">{new Date(doc.created_at).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {doc.file_url && (
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-[#8A95A5] hover:text-[#FF6B35] hover:bg-[#FF6B35]/10 transition-colors">
                                <ExternalLink size={13} />
                              </a>
                            )}
                            {isAdmin && (
                              <>
                                <button
                                  onClick={async () => {
                                    const updated = await updateDocument(selectedPid!, doc.id, { visible_to_client: !doc.visible_to_client })
                                    setDocs(prev => prev.map(d => d.id === doc.id ? updated : d))
                                  }}
                                  className="p-1.5 rounded-md transition-colors"
                                  style={{ color: doc.visible_to_client ? '#4A9E6B' : '#4A5568' }}
                                  title={doc.visible_to_client ? 'Ocultar al cliente' : 'Mostrar al cliente'}
                                >
                                  {doc.visible_to_client ? <Eye size={13} /> : <EyeOff size={13} />}
                                </button>
                                <button onClick={() => handleArchiveDoc(doc)} className="p-1.5 rounded-md text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#27384A] transition-colors" title={doc.is_archived ? 'Desarchivar' : 'Archivar'}>
                                  <Archive size={13} />
                                </button>
                                {confirmDeleteDocId === doc.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => setConfirmDeleteDocId(null)} className="px-2 py-1 rounded border border-[#27384A] text-[10px] text-[#8A95A5] hover:text-[#F0EDE8] transition-colors">No</button>
                                    <button onClick={() => handleDeleteDoc(doc.id)} className="px-2 py-1 rounded bg-red-500/15 border border-red-500/30 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors">Sí</button>
                                  </div>
                                ) : (
                                  <button onClick={() => setConfirmDeleteDocId(doc.id)} className="p-1.5 rounded-md text-[#8A95A5] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <Pagination page={docPage} total={filteredDocs.length} perPage={DOCS_PER_PAGE} onChange={setDocPage} />
              </div>
            )}

            {/* ── Tab: Solicitudes de Aprobación ───────────────────────── */}
            {activeTab === 'submittals' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={() => setShowSubmittalForm(v => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors">
                    <Plus size={13} />Nueva solicitud
                  </button>
                </div>


                {submittalsLoading ? (
                  <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#FF6B35]" /></div>
                ) : submittals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <FileCheck size={40} className="text-[#27384A]" />
                    <p className="text-[#8A95A5] text-sm">No hay solicitudes de aprobación para este proyecto.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pagedSubmittals.map(s => {
                      const color = SUBMITTAL_STATUS_COLORS[s.status]
                      return (
                        <div key={s.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/20 transition-colors">
                          <span className="text-[10px] text-[#4A5568] font-mono mt-0.5 w-8 flex-shrink-0">#{s.number}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{s.title}</p>
                            {s.description && <p className="text-xs text-[#8A95A5] mt-0.5">{s.description}</p>}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${color}20`, color }}>
                                {SUBMITTAL_STATUS_LABELS[s.status]}
                              </span>
                              {s.submitted_by_name && <span className="text-[10px] text-[#4A5568]">Por: {s.submitted_by_name}</span>}
                              {s.reviewed_by_name && <span className="text-[10px] text-[#4A5568]">Revisado por: {s.reviewed_by_name}</span>}
                              {s.review_notes && <span className="text-[10px] text-[#8A95A5] italic">"{s.review_notes}"</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {s.file_url && (
                              <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md text-[#8A95A5] hover:text-[#FF6B35] transition-colors">
                                <ExternalLink size={13} />
                              </a>
                            )}
                            {isAdmin && s.status !== 'approved' && (
                              <button onClick={() => { setReviewingId(s.id); setReviewStatus('approved'); setReviewNotes('') }}
                                className="px-2.5 py-1 rounded-md text-xs text-[#8A95A5] border border-[#27384A] hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">
                                Revisar
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <Pagination page={submittalPage} total={submittals.length} perPage={SUBMITTALS_PER_PAGE} onChange={setSubmittalPage} />
              </div>
            )}

            {/* ── Tab: Lista de Correcciones ──────────────────────────── */}
            {activeTab === 'punch' && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(Object.entries(punchStats) as [PunchItemStatus, number][]).map(([status, count]) => {
                    const cfg = PUNCH_STATUS_CONFIG[status]
                    return (
                      <button key={status} onClick={() => { setPunchStatusFilter(punchStatusFilter === status ? '' : status); setPunchPage(1) }}
                        className={cn('p-4 rounded-xl bg-[#1F2D3A] border text-left transition-colors', punchStatusFilter === status ? 'border-[#FF6B35]/50' : 'border-[#27384A] hover:border-[#FF6B35]/20')}>
                        <p className="text-xs text-[#8A95A5] mb-2">{cfg.label}</p>
                        <p className="text-xl font-semibold" style={{ fontFamily: 'Space Mono, monospace', color: cfg.color }}>{count}</p>
                      </button>
                    )
                  })}
                </div>

                {/* Category filter pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => { setPunchCategoryFilter(''); setPunchPage(1) }}
                    className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors', !punchCategoryFilter ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}
                  >
                    Todas
                  </button>
                  {(Object.entries(PUNCH_CATEGORY_CONFIG) as [PunchItemCategory, { label: string; color: string }][]).map(([val, { label, color }]) => (
                    <button
                      key={val}
                      onClick={() => { setPunchCategoryFilter(punchCategoryFilter === val ? '' : val); setPunchPage(1) }}
                      className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors', punchCategoryFilter === val ? 'bg-[#FF6B35]/15 text-[#FF6B35]' : 'bg-[#1F2D3A] border border-[#27384A] text-[#8A95A5] hover:text-[#F0EDE8]')}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  {(punchStatusFilter || punchCategoryFilter) && (
                    <button onClick={() => { setPunchStatusFilter(''); setPunchCategoryFilter(''); setPunchPage(1) }} className="text-xs text-[#FF6B35] hover:underline">← Ver todos</button>
                  )}
                  <div className="ml-auto">
                    <button onClick={() => setShowPunchForm(v => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#131D28] text-xs font-semibold hover:bg-[#FF8557] transition-colors">
                      <Plus size={13} />Nuevo ítem
                    </button>
                  </div>
                </div>


                {punchLoading ? (
                  <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-[#FF6B35]" /></div>
                ) : filteredPunch.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <CheckCircle2 size={40} className="text-[#27384A]" />
                    <p className="text-[#8A95A5] text-sm">{punchItems.length === 0 ? 'No hay correcciones registradas.' : 'Sin resultados.'}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pagedPunch.map(item => {
                      const cfg = PUNCH_STATUS_CONFIG[item.status]
                      const StatusIcon = cfg.Icon
                      const priColor = PUNCH_PRIORITY_COLORS[item.priority]
                      return (
                        <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A] hover:border-[#FF6B35]/20 transition-colors">
                          <StatusIcon size={16} className="flex-shrink-0 mt-0.5" style={{ color: cfg.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] text-[#4A5568] font-mono">#{item.number}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${priColor}20`, color: priColor }}>
                                {item.priority === 'low' ? 'Baja' : item.priority === 'medium' ? 'Media' : item.priority === 'high' ? 'Alta' : 'Crítica'}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
                              {item.category && (() => {
                                const catCfg = PUNCH_CATEGORY_CONFIG[item.category as PunchItemCategory]
                                return catCfg ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${catCfg.color}20`, color: catCfg.color }}>{catCfg.label}</span>
                                ) : null
                              })()}
                            </div>
                            <p className="text-sm text-[#F0EDE8]">{item.description}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {item.location && <span className="text-[10px] text-[#8A95A5] flex items-center gap-1"><MapPin size={9} />{item.location}</span>}
                              {item.assigned_to_name && <span className="text-[10px] text-[#8A95A5] flex items-center gap-1"><User size={9} />{item.assigned_to_name}</span>}
                              {item.due_date && <span className="text-[10px] text-[#4A5568]">Límite: {new Date(item.due_date).toLocaleDateString('es-GT')}</span>}
                              {item.resolution_notes && <span className="text-[10px] text-[#8A95A5] italic">"{item.resolution_notes}"</span>}
                            </div>
                          </div>
                          {isAdmin && (item.status === 'open' || item.status === 'in_progress') && (
                            <button onClick={() => { setResolvingId(item.id); setResolveNotes('') }}
                              className="flex-shrink-0 px-2.5 py-1 rounded-md text-xs text-[#4A9E6B] border border-[#4A9E6B]/30 hover:bg-[#4A9E6B]/10 transition-colors">
                              Resolver
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                <Pagination page={punchPage} total={filteredPunch.length} perPage={PUNCH_PER_PAGE} onChange={setPunchPage} />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Modal: Subir documento ─────────────────────────────────────────── */}
      {showDocForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setShowDocForm(false)}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nuevo documento</h3>
              <button onClick={() => setShowDocForm(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {docFormError && <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"><AlertCircle size={14} />{docFormError}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
                  <input form="doc-form" required type="text" value={dTitle} onChange={e => setDTitle(e.target.value)} className={inputCls} placeholder="Plano estructural nivel 1" />
                </div>
                <div>
                  <label className={labelCls}>Tipo <span className="text-[#FF6B35]">*</span></label>
                  <select form="doc-form" value={dType} onChange={e => setDType(e.target.value as DocumentType)} className={cn(inputCls, 'cursor-pointer')}>
                    {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>URL del archivo <span className="text-[#FF6B35]">*</span></label>
                  <input form="doc-form" required type="url" value={dFileUrl} onChange={e => setDFileUrl(e.target.value)} className={inputCls} placeholder="https://drive.google.com/…" />
                </div>
                <div>
                  <label className={labelCls}>Nombre del archivo</label>
                  <input form="doc-form" type="text" value={dFileName} onChange={e => setDFileName(e.target.value)} className={inputCls} placeholder="plano-estructural-n1.pdf" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Versión</label>
                  <input form="doc-form" type="text" value={dVersion} onChange={e => setDVersion(e.target.value)} className={inputCls} placeholder="1.0" />
                </div>
                <div>
                  <label className={labelCls}>Descripción</label>
                  <input form="doc-form" type="text" value={dDesc} onChange={e => setDDesc(e.target.value)} className={inputCls} placeholder="Descripción breve" />
                </div>
              </div>
              {/* Toggle visible al cliente */}
              <button
                type="button"
                onClick={() => setDVisibleToClient(v => !v)}
                className="flex items-center gap-3 w-full p-3 rounded-lg border transition-colors text-left"
                style={{ background: dVisibleToClient ? '#4A9E6B15' : '#131D28', borderColor: dVisibleToClient ? '#4A9E6B50' : '#27384A' }}
              >
                <div
                  className="w-10 h-6 rounded-full flex items-center transition-all flex-shrink-0"
                  style={{ background: dVisibleToClient ? '#4A9E6B' : '#27384A', justifyContent: dVisibleToClient ? 'flex-end' : 'flex-start', padding: '2px' }}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: dVisibleToClient ? '#4A9E6B' : '#8A95A5' }}>
                    {dVisibleToClient ? 'Visible al cliente' : 'Solo interno'}
                  </p>
                  <p className="text-xs text-[#4A5568]">
                    {dVisibleToClient ? 'El cliente podrá ver y descargar este documento en su portal.' : 'El documento no aparecerá en el portal del cliente.'}
                  </p>
                </div>
              </button>
            </div>
            <form id="doc-form" onSubmit={handleCreateDoc} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button type="button" onClick={() => setShowDocForm(false)} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">Cancelar</button>
              <button type="submit" disabled={docFormLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {docFormLoading ? <><Loader2 size={13} className="animate-spin" />Guardando…</> : <><Plus size={13} />Guardar</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Nueva solicitud de aprobación ──────────────────────────── */}
      {showSubmittalForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setShowSubmittalForm(false)}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nueva solicitud de aprobación</h3>
              <button onClick={() => setShowSubmittalForm(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {submittalFormError && <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"><AlertCircle size={14} />{submittalFormError}</div>}
              <div>
                <label className={labelCls}>Título <span className="text-[#FF6B35]">*</span></label>
                <input form="submittal-form" required type="text" value={sTitle} onChange={e => setSTitle(e.target.value)} className={inputCls} placeholder="Especificación de concreto clase B" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>URL del archivo</label>
                  <input form="submittal-form" type="url" value={sFileUrl} onChange={e => setSFileUrl(e.target.value)} className={inputCls} placeholder="https://…" />
                </div>
                <div>
                  <label className={labelCls}>Descripción</label>
                  <input form="submittal-form" type="text" value={sDesc} onChange={e => setSDesc(e.target.value)} className={inputCls} placeholder="Descripción breve" />
                </div>
              </div>
            </div>
            <form id="submittal-form" onSubmit={handleCreateSubmittal} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button type="button" onClick={() => setShowSubmittalForm(false)} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">Cancelar</button>
              <button type="submit" disabled={submittalFormLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {submittalFormLoading ? <><Loader2 size={13} className="animate-spin" />Guardando…</> : <><Plus size={13} />Crear</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Revisar solicitud ───────────────────────────────────────── */}
      {reviewingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => { setReviewingId(null); setReviewNotes('') }}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-md shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Revisar solicitud de aprobación</h3>
              <button onClick={() => { setReviewingId(null); setReviewNotes('') }} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div>
                <label className={labelCls}>Decisión <span className="text-[#FF6B35]">*</span></label>
                <select form="review-form" value={reviewStatus} onChange={e => setReviewStatus(e.target.value as SubmittalStatus)} className={cn(inputCls, 'cursor-pointer')}>
                  {(['approved', 'approved_with_comments', 'rejected', 'resubmit', 'in_review'] as SubmittalStatus[]).map(s => (
                    <option key={s} value={s}>{SUBMITTAL_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Notas de revisión</label>
                <textarea form="review-form" rows={3} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Observaciones…" />
              </div>
            </div>
            <form id="review-form" onSubmit={handleReview} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button type="button" onClick={() => { setReviewingId(null); setReviewNotes('') }} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">Cancelar</button>
              <button type="submit" disabled={reviewLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {reviewLoading ? <><Loader2 size={13} className="animate-spin" />Guardando…</> : <><FileCheck size={13} />Guardar revisión</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Nueva corrección (punch) ───────────────────────────────── */}
      {showPunchForm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => setShowPunchForm(false)}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Nueva corrección</h3>
              <button onClick={() => setShowPunchForm(false)} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {punchFormError && <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400"><AlertCircle size={14} />{punchFormError}</div>}
              <div>
                <label className={labelCls}>Descripción <span className="text-[#FF6B35]">*</span></label>
                <textarea form="punch-form" required rows={2} value={pDesc} onChange={e => setPDesc(e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Grieta en columna eje 3-B, nivel 2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría <span className="text-[#FF6B35]">*</span></label>
                  <select form="punch-form" value={pCategory} onChange={e => setPCategory(e.target.value as PunchItemCategory)} className={cn(inputCls, 'cursor-pointer')}>
                    {Object.entries(PUNCH_CATEGORY_CONFIG).map(([val, { label }]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Prioridad</label>
                  <select form="punch-form" value={pPriority} onChange={e => setPPriority(e.target.value as PunchItemPriority)} className={cn(inputCls, 'cursor-pointer')}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Ubicación</label>
                  <input form="punch-form" type="text" value={pLocation} onChange={e => setPLocation(e.target.value)} className={inputCls} placeholder="Nivel 2, eje 3-B" />
                </div>
                <div>
                  <label className={labelCls}>Fecha límite</label>
                  <input form="punch-form" type="date" value={pDueDate} onChange={e => setPDueDate(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
            <form id="punch-form" onSubmit={handleCreatePunch} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button type="button" onClick={() => setShowPunchForm(false)} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">Cancelar</button>
              <button type="submit" disabled={punchFormLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#FF6B35] text-[#131D28] text-sm font-semibold rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {punchFormLoading ? <><Loader2 size={13} className="animate-spin" />Guardando…</> : <><Plus size={13} />Crear</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Resolver ítem de punch ─────────────────────────────────── */}
      {resolvingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
          onClick={() => { setResolvingId(null); setResolveNotes('') }}
        >
          <div
            className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-xl w-full sm:max-w-md shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A] flex-shrink-0">
              <h3 className="text-sm font-semibold text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Resolver ítem #{punchItems.find(p => p.id === resolvingId)?.number}
              </h3>
              <button onClick={() => { setResolvingId(null); setResolveNotes('') }} className="text-[#8A95A5] hover:text-[#F0EDE8] transition-colors p-1"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              <div>
                <label className={labelCls}>Notas de resolución</label>
                <textarea form="resolve-form" rows={3} value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} className={cn(inputCls, 'resize-none')} placeholder="Describe cómo se resolvió…" />
              </div>
            </div>
            <form id="resolve-form" onSubmit={handleResolve} className="flex gap-3 justify-end px-5 py-4 border-t border-[#27384A] flex-shrink-0">
              <button type="button" onClick={() => { setResolvingId(null); setResolveNotes('') }} className="px-4 py-2.5 border border-[#27384A] text-sm text-[#8A95A5] rounded-lg hover:text-[#F0EDE8] hover:border-[#FF6B35]/30 transition-colors">Cancelar</button>
              <button type="submit" disabled={resolveLoading} className="flex-1 sm:flex-none px-6 py-2.5 bg-[#4A9E6B] text-white text-sm font-semibold rounded-lg hover:bg-[#3D8A5C] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {resolveLoading ? <><Loader2 size={13} className="animate-spin" />…</> : <><CheckCircle2 size={13} />Marcar resuelto</>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
