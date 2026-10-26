'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu, HardHat, RefreshCw, Loader2, CheckCircle2, ChevronRight, AlertCircle, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import ERPSidebar from '@/components/erp/ERPSidebar'
import ERPAvatar from '@/components/erp/ERPAvatar'
import { getMe, type User } from '@/lib/api'
import {
  getSubcontractorContracts, getSubcontractorCertifications, approveSubcontractorCertification,
  createSubcontractorCertification,
  type SubcontractorContract, type SubcontractorCertification, type CreateSubcontractorCertificationInput,
} from '@/lib/api-finance'

// ─── Form helpers ─────────────────────────────────────────────────────────────

const inputCls = 'w-full bg-[#131D28] border border-[#27384A] rounded-lg px-3 py-2 text-sm text-[#F0EDE8] focus:outline-none focus:border-[#FF6B35]/60 placeholder:text-[#4A5568]'

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-[#8A95A5] mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ─── Nueva certificación modal ────────────────────────────────────────────────

function NuevaCertModal({ contract, onClose, onCreated }: {
  contract: SubcontractorContract
  onClose: () => void
  onCreated: (cert: SubcontractorCertification) => void
}) {
  const today = new Date().toISOString().slice(0, 10)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<{
    period_start: string; period_end: string; amount_certified_gtq: string;
    retention_withheld_gtq: string; advance_recovery_gtq: string; notes: string;
  }>({
    period_start: today, period_end: today,
    amount_certified_gtq: '', retention_withheld_gtq: '0.00', advance_recovery_gtq: '0.00', notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.period_start || !form.period_end || !form.amount_certified_gtq) {
      toast.error('Período y monto certificado son obligatorios.'); return
    }
    setSaving(true)
    try {
      const cert = await createSubcontractorCertification(contract.id, {
        period_start:           form.period_start,
        period_end:             form.period_end,
        amount_certified_gtq:   form.amount_certified_gtq,
        retention_withheld_gtq: form.retention_withheld_gtq || '0.00',
        advance_recovery_gtq:   form.advance_recovery_gtq || '0.00',
        notes:                  form.notes,
      })
      toast.success(`Certificación #${cert.certification_number} creada.`)
      onCreated(cert)
    } catch (e: any) {
      toast.error(e.message ?? 'Error al crear la certificación.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-[#1A2530] border border-[#27384A] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27384A]">
          <div>
            <h2 className="text-sm font-semibold text-[#F0EDE8]">Nueva certificación</h2>
            <p className="text-xs text-[#8A95A5] mt-0.5">{contract.number} — {contract.subcontractor_name}</p>
          </div>
          <button onClick={onClose} className="text-[#8A95A5] hover:text-[#F0EDE8]"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Período desde" required>
              <input type="date" className={inputCls} value={form.period_start}
                onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} required />
            </Field>
            <Field label="Período hasta" required>
              <input type="date" className={inputCls} value={form.period_end}
                onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} required />
            </Field>
            <Field label="Monto bruto certificado (GTQ)" required>
              <input type="number" className={inputCls} value={form.amount_certified_gtq} min="0" step="0.01" placeholder="0.00"
                onChange={e => setForm(f => ({ ...f, amount_certified_gtq: e.target.value }))} required />
            </Field>
            <Field label="Retención withheld (GTQ)">
              <input type="number" className={inputCls} value={form.retention_withheld_gtq} min="0" step="0.01" placeholder="0.00"
                onChange={e => setForm(f => ({ ...f, retention_withheld_gtq: e.target.value }))} />
            </Field>
            <Field label="Recuperación anticipo (GTQ)">
              <input type="number" className={inputCls} value={form.advance_recovery_gtq} min="0" step="0.01" placeholder="0.00"
                onChange={e => setForm(f => ({ ...f, advance_recovery_gtq: e.target.value }))} />
            </Field>
          </div>
          <Field label="Notas">
            <textarea className={inputCls} rows={2} value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-[#8A95A5] hover:text-[#F0EDE8]">Cancelar</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg hover:bg-[#FF8557] disabled:opacity-60 transition-colors">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Crear certificación
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtGtq(val: string | number | null | undefined) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (isNaN(n)) return '—'
  return `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Status badges ────────────────────────────────────────────────────────────

const CONTRACT_STATUS: Record<string, { label: string; cls: string }> = {
  draft:      { label: 'Borrador',   cls: 'bg-[#27384A] text-[#8A95A5]' },
  active:     { label: 'Activo',     cls: 'bg-emerald-500/15 text-emerald-400' },
  suspended:  { label: 'Suspendido', cls: 'bg-amber-500/15 text-amber-400' },
  completed:  { label: 'Completado', cls: 'bg-[#FF6B35]/15 text-[#FF6B35]' },
  terminated: { label: 'Rescindido', cls: 'bg-red-500/15 text-red-400' },
}

const CERT_STATUS: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Borrador',  cls: 'bg-[#27384A] text-[#8A95A5]' },
  submitted: { label: 'Enviada',   cls: 'bg-blue-500/15 text-blue-400' },
  approved:  { label: 'Aprobada',  cls: 'bg-emerald-500/15 text-emerald-400' },
  rejected:  { label: 'Rechazada', cls: 'bg-red-500/15 text-red-400' },
}

function StatusBadge({ map, val }: { map: Record<string, { label: string; cls: string }>; val: string }) {
  const { label, cls } = map[val] ?? { label: val, cls: 'bg-[#27384A] text-[#8A95A5]' }
  return <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function CompletionBar({ pct }: { pct: string }) {
  const n = Math.max(0, Math.min(100, Number(pct)))
  const color = n >= 80 ? '#4A9E6B' : n >= 40 ? '#FF6B35' : '#f59e0b'
  return (
    <div className="w-full h-1.5 bg-[#27384A] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${n}%`, background: color }} />
    </div>
  )
}

// ─── Contract card ────────────────────────────────────────────────────────────

function ContractCard({ contract, selected, onClick }: {
  contract: SubcontractorContract; selected: boolean; onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-4 cursor-pointer transition-colors',
        selected
          ? 'bg-[#FF6B35]/10 border-[#FF6B35]/40'
          : 'bg-[#1e2a3a] border-[#27384A] hover:bg-[#1F2D3A]',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-[#FF6B35]" style={{ fontFamily: 'Space Mono, monospace' }}>{contract.number}</span>
            <StatusBadge map={CONTRACT_STATUS} val={contract.status} />
          </div>
          <p className="text-sm font-semibold text-[#F0EDE8] mt-0.5 truncate">{contract.title}</p>
          <p className="text-xs text-[#8A95A5] truncate">{contract.subcontractor_name}</p>
          <p className="text-xs text-[#8A95A5] truncate">{contract.project_name}</p>
        </div>
        <ChevronRight size={14} className={cn('flex-shrink-0 mt-1', selected ? 'text-[#FF6B35]' : 'text-[#8A95A5]')} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div>
          <p className="text-[#8A95A5]">Valor contrato</p>
          <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(contract.contract_value_gtq)}</p>
        </div>
        <div>
          <p className="text-[#8A95A5]">Certificado</p>
          <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(contract.total_certified_gtq)}</p>
        </div>
        <div>
          <p className="text-[#8A95A5]">Retención pendiente</p>
          <p className={cn('font-medium', Number(contract.retention_balance_gtq) > 0 ? 'text-amber-400' : 'text-[#F0EDE8]')} style={{ fontFamily: 'Space Mono, monospace' }}>
            {fmtGtq(contract.retention_balance_gtq)}
          </p>
        </div>
        <div>
          <p className="text-[#8A95A5]">Por certificar</p>
          <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(contract.balance_to_certify_gtq)}</p>
        </div>
      </div>

      <CompletionBar pct={contract.completion_pct} />
      <p className="text-[10px] text-[#8A95A5] mt-1 text-right">{Number(contract.completion_pct).toFixed(1)}% completado</p>
    </div>
  )
}

// ─── Certifications panel ─────────────────────────────────────────────────────

function CertificationsPanel({ contract, canApprove }: { contract: SubcontractorContract; canApprove: boolean }) {
  const [certs, setCerts]         = useState<SubcontractorCertification[]>([])
  const [loading, setLoading]     = useState(true)
  const [acting, setActing]       = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    getSubcontractorCertifications(contract.id)
      .then(r => setCerts(r.results))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false))
  }, [contract.id])

  async function handleApprove(certId: number) {
    if (acting) return
    setActing(true)
    try {
      const updated = await approveSubcontractorCertification(contract.id, certId)
      setCerts(prev => prev.map(c => c.id === certId ? updated : c))
      toast.success('Certificación aprobada.')
    } catch (e: any) {
      toast.error(e.message ?? 'Error al aprobar la certificación.')
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#27384A]">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#F0EDE8]">{contract.number} — Certificaciones</h3>
          <p className="text-xs text-[#8A95A5] mt-0.5">{contract.subcontractor_name} · {contract.project_name}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35] text-white text-xs font-medium rounded-lg hover:bg-[#FF8557] transition-colors"
        >
          <Plus size={12} />
          Nueva certificación
        </button>
      </div>

      {/* Contract summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3 border-b border-[#27384A] bg-[#131D28]">
        {[
          { label: 'Valor contrato', value: fmtGtq(contract.contract_value_gtq) },
          { label: 'Total certificado', value: fmtGtq(contract.total_certified_gtq) },
          { label: 'Neto pagable total', value: fmtGtq(contract.total_net_payable_gtq) },
          { label: 'Retención pendiente', value: fmtGtq(contract.retention_balance_gtq) },
        ].map(s => (
          <div key={s.label}>
            <p className="text-[10px] text-[#8A95A5]">{s.label}</p>
            <p className="text-sm font-medium text-[#F0EDE8] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={18} className="animate-spin text-[#8A95A5]" />
        </div>
      ) : certs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-[#8A95A5]">
          <HardHat size={28} className="mb-2 opacity-30" />
          <p className="text-sm">Sin certificaciones registradas.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#27384A]">
          {certs.map(cert => (
            <div key={cert.id} className="px-4 py-3 hover:bg-[#1F2D3A] transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                      Cert. #{cert.certification_number}
                    </span>
                    <StatusBadge map={CERT_STATUS} val={cert.status} />
                  </div>
                  <p className="text-xs text-[#8A95A5] mt-0.5">
                    {fmtDate(cert.period_start)} — {fmtDate(cert.period_end)}
                    {cert.approved_by_name && ` · Aprobado por ${cert.approved_by_name}`}
                  </p>
                </div>
                {canApprove && (cert.status === 'draft' || cert.status === 'submitted') && (
                  <button
                    onClick={() => handleApprove(cert.id)}
                    disabled={acting}
                    className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={11} />
                    Aprobar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                <div>
                  <p className="text-[#8A95A5]">Monto bruto</p>
                  <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(cert.amount_certified_gtq)}</p>
                </div>
                <div>
                  <p className="text-[#8A95A5]">Retención</p>
                  <p className="text-amber-400" style={{ fontFamily: 'Space Mono, monospace' }}>({fmtGtq(cert.retention_withheld_gtq)})</p>
                </div>
                <div>
                  <p className="text-[#8A95A5]">Recuper. anticipo</p>
                  <p className="text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>({fmtGtq(cert.advance_recovery_gtq)})</p>
                </div>
                <div>
                  <p className="text-[#8A95A5]">Neto pagable</p>
                  <p className="text-[#FF6B35] font-semibold" style={{ fontFamily: 'Space Mono, monospace' }}>{fmtGtq(cert.net_payable_gtq)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NuevaCertModal
          contract={contract}
          onClose={() => setShowModal(false)}
          onCreated={cert => { setCerts(prev => [cert, ...prev]); setShowModal(false) }}
        />
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubcontratistasPage() {
  const [user, setUser]             = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [contracts, setContracts]   = useState<SubcontractorContract[]>([])
  const [selected, setSelected]     = useState<SubcontractorContract | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => { getMe().then(setUser).catch(() => {}) }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSubcontractorContracts('ordering=-created_at')
      setContracts(data.results)
    } catch {
      toast.error('Error cargando contratos de subcontratistas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const canApprove = user?.role === 'admin' || user?.role === 'project_manager'

  // Summary
  const totalContracted = contracts.reduce((s, c) => s + Number(c.contract_value_gtq), 0)
  const totalCertified  = contracts.reduce((s, c) => s + Number(c.total_certified_gtq), 0)
  const totalRetention  = contracts.reduce((s, c) => s + Number(c.retention_balance_gtq), 0)

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <ERPSidebar
        currentPage="subcontratistas"
        userName={user ? `${user.first_name} ${user.last_name}` : undefined}
        userInitials={user ? `${user.first_name[0]}${user.last_name[0]}` : undefined}
        userAvatarUrl={user?.avatar_url}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur border-b border-[#27384A] px-4 md:px-6 h-14 flex items-center gap-3">
          <button className="md:hidden text-[#8A95A5]" onClick={() => setSidebarOpen(v => !v)}>
            <Menu size={20} />
          </button>
          <HardHat size={18} className="text-[#FF6B35]" />
          <h1 className="text-base font-semibold text-[#F0EDE8]">Subcontratistas</h1>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={load} className="p-1.5 rounded-lg text-[#8A95A5] hover:text-[#F0EDE8] hover:bg-[#1F2D3A] transition-colors">
              <RefreshCw size={15} />
            </button>
            {user && <ERPAvatar avatarUrl={user.avatar_url} initials={`${user.first_name[0]}${user.last_name[0]}`} size="sm" />}
          </div>
        </div>

        <div className="px-4 md:px-6 py-5 max-w-7xl mx-auto space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Total contratado', value: fmtGtq(totalContracted) },
              { label: 'Total certificado', value: fmtGtq(totalCertified) },
              { label: 'Retención pendiente de liberar', value: fmtGtq(totalRetention) },
            ].map(s => (
              <div key={s.label} className="bg-[#1e2a3a] rounded-xl border border-[#27384A] p-4">
                <p className="text-[11px] text-[#8A95A5] mb-1">{s.label}</p>
                <p className="text-lg font-bold text-[#F0EDE8]" style={{ fontFamily: 'Space Mono, monospace' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#8A95A5]">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Cargando contratos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Contract list */}
              <div className="lg:col-span-2 space-y-3">
                {contracts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#8A95A5]">
                    <HardHat size={28} className="mb-2 opacity-30" />
                    <p className="text-sm">No hay contratos de subcontratistas.</p>
                  </div>
                ) : (
                  contracts.map(c => (
                    <ContractCard
                      key={c.id}
                      contract={c}
                      selected={selected?.id === c.id}
                      onClick={() => setSelected(selected?.id === c.id ? null : c)}
                    />
                  ))
                )}
              </div>

              {/* Certifications */}
              <div className="lg:col-span-3">
                {selected ? (
                  <CertificationsPanel contract={selected} canApprove={canApprove} />
                ) : (
                  <div className="bg-[#1e2a3a] rounded-xl border border-[#27384A] flex flex-col items-center justify-center py-20 text-[#8A95A5]">
                    <HardHat size={32} className="mb-3 opacity-30" />
                    <p className="text-sm">Selecciona un contrato para ver sus certificaciones.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
