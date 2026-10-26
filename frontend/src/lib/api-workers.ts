/**
 * Workers API — tipos y funciones para el módulo de trabajadores.
 * Separado de api.ts para evitar límites del TS language server.
 */
import { apiFetch, getAccessToken } from './api'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkerStatus   = 'active' | 'inactive'
export type WorkerPosition =
  | 'peon' | 'oficial' | 'maestro_obras' | 'albanil' | 'electricista'
  | 'fontanero' | 'soldador' | 'carpintero' | 'supervisor' | 'otro'

export interface Worker {
  id: number
  first_name: string
  last_name: string
  full_name: string
  avatar_url: string | null
  dpi: string
  phone: string
  emergency_contact_name: string
  emergency_contact_phone: string
  position: WorkerPosition
  daily_rate_gtq: string
  hire_date: string | null
  status: WorkerStatus
  current_project: number | null
  current_project_name: string | null
  notes: string
  current_month_gross: number
  current_month_days: number
  current_month_cost: number
  total_days_worked: number
  created_at: string
  updated_at: string
}

export interface WorkLog {
  id: number
  worker: number
  project: number
  project_name: string | null
  date: string
  start_time: string | null
  end_time: string | null
  regular_hours: string
  overtime_hours: string
  notes: string
  regular_pay: number
  overtime_pay: number
  gross_pay: number
  igss_patronal: number
  total_cost: number
  created_at: string
}

// ─── Workers ──────────────────────────────────────────────────────────────────

export function getWorkers(params?: {
  status?: WorkerStatus
  position?: WorkerPosition
  current_project?: number
  search?: string
}): Promise<Worker[]> {
  const qs = new URLSearchParams()
  if (params?.status)          qs.set('status', params.status)
  if (params?.position)        qs.set('position', params.position)
  if (params?.current_project) qs.set('current_project', String(params.current_project))
  if (params?.search)          qs.set('search', params.search)
  qs.set('page_size', '200')
  return apiFetch<any>(`/api/workers/?${qs.toString()}`)
    .then((res: any) => res.results ?? res)
}

export function getWorker(id: number): Promise<Worker> {
  return apiFetch<Worker>(`/api/workers/${id}/`)
}

export function createWorker(data: {
  first_name: string
  last_name: string
  dpi?: string
  phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  position: WorkerPosition
  daily_rate_gtq: string
  hire_date?: string | null
  status?: WorkerStatus
  current_project?: number | null
  notes?: string
}): Promise<Worker> {
  return apiFetch<Worker>('/api/workers/', { method: 'POST', body: JSON.stringify(data) })
}

export function updateWorker(
  id: number,
  data: Partial<Parameters<typeof createWorker>[0]>,
): Promise<Worker> {
  return apiFetch<Worker>(`/api/workers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteWorker(id: number): Promise<void> {
  return apiFetch<void>(`/api/workers/${id}/`, { method: 'DELETE' })
}

// ─── Work Logs ────────────────────────────────────────────────────────────────

export function getWorkLogs(workerId: number): Promise<WorkLog[]> {
  return apiFetch<any>(`/api/workers/${workerId}/logs/?page_size=100`)
    .then((res: any) => res.results ?? res)
}

export function createWorkLog(workerId: number, data: {
  project: number
  date: string
  start_time?: string | null
  end_time?: string | null
  regular_hours?: string
  overtime_hours?: string
  notes?: string
}): Promise<WorkLog> {
  return apiFetch<WorkLog>(`/api/workers/${workerId}/logs/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function deleteWorkLog(workerId: number, logId: number): Promise<void> {
  return apiFetch<void>(`/api/workers/${workerId}/logs/${logId}/`, { method: 'DELETE' })
}

export async function uploadWorkerAvatar(workerId: number, file: File): Promise<Worker> {
  const token = getAccessToken()
  const form  = new FormData()
  form.append('avatar', file)
  const res = await fetch(`${API_URL}/api/workers/${workerId}/avatar/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).detail ?? `Error ${res.status}`)
  }
  return res.json()
}
