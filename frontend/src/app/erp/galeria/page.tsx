'use client'

import { useState, useEffect, useMemo } from 'react'
import { Menu, Images, Loader2, AlertCircle, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import {
  getMe, getMyProjects, getProjectProgress,
  type User as UserType, type ProjectList, type ProgressUpdate, type ProgressPhoto,
} from '@/lib/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryPhoto extends ProgressPhoto {
  projectName: string
  date: string
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ photos, index, onClose }: { photos: GalleryPhoto[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index)
  const photo = photos[current]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setCurrent(i => Math.min(i + 1, photos.length - 1))
      if (e.key === 'ArrowLeft')  setCurrent(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [photos.length, onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors z-10">
          <X size={24} />
        </button>

        {/* Image */}
        <img
          src={photo.photo_url} alt={photo.caption || 'foto de obra'}
          className="w-full max-h-[75vh] object-contain rounded-xl"
        />

        {/* Caption */}
        <div className="mt-3 text-center space-y-1">
          {photo.caption && <p className="text-sm text-white/80">{photo.caption}</p>}
          <p className="text-xs text-white/40">{photo.projectName} · {new Date(photo.date).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrent(i => Math.max(i - 1, 0))}
            disabled={current === 0}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-xs text-white/40">{current + 1} / {photos.length}</span>
          <button
            onClick={() => setCurrent(i => Math.min(i + 1, photos.length - 1))}
            disabled={current === photos.length - 1}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ERPGaleriaPage() {
  const [me, setMe]                     = useState<UserType | null>(null)
  const [projects, setProjects]         = useState<ProjectList[]>([])
  const [selectedPid, setSelectedPid]   = useState<number | 'all'>('all')
  const [allPhotos, setAllPhotos]       = useState<GalleryPhoto[]>([])
  const [loading, setLoading]           = useState(true)
  const [photosLoading, setPhotosLoading] = useState(false)
  const [error, setError]               = useState('')
  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const user = await getMe()
        if (user.role === 'client_portal') { window.location.href = '/portal'; return }
        setMe(user)
        const res = await getMyProjects()
        const list = res.results ?? (res as any)
        setProjects(list)
      } catch (e: any) {
        if (e.message === 'Sesión expirada') return
        setError(e.message ?? 'Error al cargar')
      } finally { setLoading(false) }
    }
    init()
  }, [])

  useEffect(() => {
    loadPhotos()
  }, [selectedPid, projects])

  async function loadPhotos() {
    if (projects.length === 0) return
    setPhotosLoading(true)
    try {
      const targets = selectedPid === 'all' ? projects : projects.filter(p => p.id === selectedPid)
      const results = await Promise.all(
        targets.map(async p => {
          const res = await getProjectProgress(p.id)
          const updates: ProgressUpdate[] = res.results ?? (res as any)
          return updates.flatMap(u =>
            u.photos.map(ph => ({
              ...ph,
              projectName: p.name,
              date: u.date,
            }))
          )
        })
      )
      const photos = results.flat().sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
      setAllPhotos(photos)
    } catch {} finally { setPhotosLoading(false) }
  }

  const filteredPhotos = allPhotos

  const initials = me ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase() || 'ST' : 'ST'

  if (loading) return (
    <div className="min-h-screen bg-[#131D28] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-[#FF6B35]" />
        <p className="text-sm text-[#8A95A5]">Cargando galería…</p>
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
        currentPage="galeria"
        userName={me?.full_name} userInitials={initials} userAvatarUrl={me?.avatar_url}
        open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onUserUpdate={setMe}
      />

      {lightboxIndex !== null && (
        <Lightbox
          photos={filteredPhotos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-[#1A2530] border-b border-[#27384A] flex items-center px-6 gap-4 flex-shrink-0">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <p className="flex-1 text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Galería de Obra</p>
          <ERPAvatar avatarUrl={me?.avatar_url} initials={initials} size="md" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="text-xs text-[#8A95A5] whitespace-nowrap">Proyecto</label>
              <div className="relative">
                <select
                  value={selectedPid}
                  onChange={e => setSelectedPid(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="appearance-none bg-[#1F2D3A] border border-[#27384A] rounded-lg pl-4 pr-9 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 cursor-pointer"
                >
                  <option value="all">Todos los proyectos</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A95A5] pointer-events-none" />
              </div>
              <span className="text-xs text-[#4A5568]">{filteredPhotos.length} foto{filteredPhotos.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Stats row */}
            {allPhotos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total fotos',    value: allPhotos.length },
                  { label: 'Proyectos',      value: new Set(allPhotos.map(p => p.projectName)).size },
                  { label: 'Con descripción',value: allPhotos.filter(p => p.caption).length },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-xl bg-[#1F2D3A] border border-[#27384A]">
                    <p className="text-xs text-[#8A95A5] mb-2">{label}</p>
                    <p className="text-xl font-semibold text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery grid */}
            {photosLoading ? (
              <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-[#FF6B35]" /></div>
            ) : filteredPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <Images size={40} className="text-[#27384A]" />
                <p className="text-[#8A95A5] text-sm">No hay fotos en la galería.</p>
                <p className="text-xs text-[#4A5568]">Las fotos se agregan desde la Bitácora de Obra de cada proyecto.</p>
              </div>
            ) : (
              <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                {filteredPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="break-inside-avoid cursor-pointer group relative rounded-xl overflow-hidden border border-[#27384A] hover:border-[#FF6B35]/40 transition-colors"
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || 'foto de obra'}
                      className="w-full object-cover group-hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.caption && <p className="text-xs text-white truncate">{photo.caption}</p>}
                      <p className="text-[10px] text-white/60">{photo.projectName}</p>
                      <p className="text-[10px] text-white/40">{new Date(photo.date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
