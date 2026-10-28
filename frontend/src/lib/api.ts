/**
 * API client para el portal de cliente Grucore.
 * Gestiona tokens JWT (access en sessionStorage, refresh en localStorage).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ─── Token helpers ────────────────────────────────────────────────────────────

// Duración cookie = lifetime del refresh token (7 días)
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
  // Cookie para middleware (no httpOnly — se setea desde cliente)
  document.cookie = `grucore_session=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('access_token')
}

export function clearTokens() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  document.cookie = 'grucore_session=; path=/; max-age=0; SameSite=Lax'
  document.cookie = 'grucore_role=; path=/; max-age=0; SameSite=Lax'
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) return null

  const res = await fetch(`${API_URL}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) { clearTokens(); return null }

  const data = await res.json()
  sessionStorage.setItem('access_token', data.access)
  if (data.refresh) localStorage.setItem('refresh_token', data.refresh)
  return data.access
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = options.body instanceof FormData
  const makeReq = (token: string | null) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    })

  let token = getAccessToken()

  // Si no hay access token en sessionStorage pero hay refresh token,
  // intentar renovar antes de la primera llamada (ej: nueva pestaña o recarga)
  if (!token) {
    token = await refreshAccessToken()
  }

  let res = await makeReq(token)

  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      res = await makeReq(newToken)
    } else {
      if (typeof window !== 'undefined') {
        const isERP = window.location.pathname.startsWith('/erp')
        window.location.href = isERP ? '/erp/login' : '/portal'
      }
      throw new Error('Sesión expirada')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).detail ?? `Error ${res.status}`)
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  phone: string
  avatar_url: string
  preferred_language: string
  preferred_currency: string
}

export interface Phase {
  id: number
  project: number
  name: string
  order: number
  status: string
  start_date: string | null
  end_date: string | null
  budget_allocated_gtq: string
}

export interface MilestoneEvidence {
  id: number
  milestone: number
  photo_url: string
  caption: string
  uploaded_by_name: string
  uploaded_at: string
}

export interface MilestoneApproval {
  id: number
  milestone: number
  status: string
  company_approved_by: number | null
  company_approved_by_name: string | null
  company_approved_at: string | null
  company_notes: string
  client_approved_at: string | null
  client_notes: string
  created_at: string
  updated_at: string
}

export interface PaymentMilestone {
  id: number
  project: number
  phase: number | null
  phase_name: string | null
  name: string
  description: string
  order: number
  amount_gtq: string
  amount_usd: number | null
  percentage_of_total: number
  progress_required_pct: number
  status: MilestoneStatusValue
  due_date: string | null
  paid_at: string | null
  notes: string
  evidence: MilestoneEvidence[]
  approval: MilestoneApproval | null
  created_at: string
  updated_at: string
}

export type MilestoneStatusValue =
  | 'pending'
  | 'evidence_submitted'
  | 'awaiting_approval'
  | 'approved'
  | 'paid'
  | 'disputed'
  | 'cancelled'

export interface ProgressPhoto {
  id: number
  update: number
  photo_url: string
  caption: string
  taken_at: string | null
  uploaded_at: string
}

export interface ProgressUpdate {
  id: number
  project: number
  phase: number | null
  date: string
  progress_pct: number
  weather: string
  temperature: number | null
  labor_count: number
  activities: string[]
  materials: string[]
  notes: string
  photos: ProgressPhoto[]
  created_at: string
}

export interface ClientInfo {
  id: number
  name: string
  email: string
  phone: string
  company: string
  avatar_url: string | null
}

export interface ProjectList {
  id: number
  name: string
  slug: string
  project_type: string
  status: string
  client_id: number | null
  client_name: string
  project_manager_name: string | null
  project_manager_avatar: string | null
  start_date: string | null
  estimated_end: string | null
  actual_end: string | null
  total_budget_gtq: string
  total_budget_usd: number | null
  base_currency: string
  progress_percentage: number
  cover_photo_url: string | null
  created_at: string
}

export interface ProjectDetail extends ProjectList {
  description: string
  address: string
  city: string
  department: string
  exchange_rate_snapshot: string
  phases: Phase[]
  milestones: PaymentMilestone[]
  client: ClientInfo
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<User> {
  const data = await apiFetch<{ access: string; refresh: string }>(
    '/api/auth/token/',
    { method: 'POST', body: JSON.stringify({ email, password }) },
  )
  setTokens(data.access, data.refresh)
  const user = await getMe()
  // Cookie de rol para que el middleware pueda distinguir cliente vs. staff
  if (typeof window !== 'undefined') {
    document.cookie = `grucore_role=${user.role}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
  }
  return user
}

export function logout() {
  clearTokens()
  if (typeof window !== 'undefined') window.location.href = '/portal'
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export function getMe(): Promise<User> {
  return apiFetch<User>('/api/users/me/')
}

export function updateMe(data: Partial<Pick<User, 'first_name' | 'last_name' | 'phone' | 'preferred_language' | 'preferred_currency'>>): Promise<User> {
  return apiFetch<User>('/api/users/me/', { method: 'PATCH', body: JSON.stringify(data) })
}

export async function uploadAvatar(file: File): Promise<User> {
  const token = getAccessToken()
  const form  = new FormData()
  form.append('avatar', file)
  const res = await fetch(`${API_URL}/api/users/me/avatar/`, {
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

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/api/users/me/change-password/', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}

// ─── Proyectos ────────────────────────────────────────────────────────────────

export function getMyProjects(): Promise<PaginatedResponse<ProjectList>> {
  return apiFetch<PaginatedResponse<ProjectList>>('/api/projects/')
}

export function getProject(id: number): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/projects/${id}/`)
}

// ─── Bitácora ─────────────────────────────────────────────────────────────────

export function getProjectProgress(
  projectId: number,
  page = 1,
): Promise<PaginatedResponse<ProgressUpdate>> {
  return apiFetch<PaginatedResponse<ProgressUpdate>>(
    `/api/projects/${projectId}/progress/?page=${page}&page_size=12`,
  )
}

// ─── Mensajes ─────────────────────────────────────────────────────────────────

export interface ProjectMessage {
  id: number
  project: number
  author: number | null
  author_name: string
  body: string
  parent: number | null
  replies: ProjectMessage[]
  created_at: string
  updated_at: string
}

export function getProjectMessages(projectId: number): Promise<ProjectMessage[]> {
  return apiFetch<any>(`/api/projects/${projectId}/messages/`)
    .then((res) => res.results ?? res)
}

export function sendProjectMessage(projectId: number, body: string, parentId?: number): Promise<ProjectMessage> {
  return apiFetch<ProjectMessage>(`/api/projects/${projectId}/messages/`, {
    method: 'POST',
    body: JSON.stringify({ body, ...(parentId ? { parent: parentId } : {}) }),
  })
}

// ─── Hitos ────────────────────────────────────────────────────────────────────

export function getMilestones(projectId: number): Promise<PaymentMilestone[]> {
  // El endpoint devuelve lista directa (no paginada en este caso)
  return apiFetch<PaymentMilestone[]>(
    `/api/projects/${projectId}/milestones/`,
  ).then((res: any) => res.results ?? res)
}

export function approveMilestone(
  projectId: number,
  milestoneId: number,
  notes = '',
): Promise<PaymentMilestone> {
  return apiFetch<PaymentMilestone>(
    `/api/projects/${projectId}/milestones/${milestoneId}/approve/`,
    { method: 'POST', body: JSON.stringify({ notes }) },
  )
}

// ─── ERP — Proyectos ──────────────────────────────────────────────────────────

export interface CreateProjectPayload {
  name: string
  client: number
  project_type: string
  status: string
  address?: string
  city?: string
  department?: string
  start_date?: string | null
  estimated_end?: string | null
  total_budget_gtq: string
  description?: string
  cover_photo_url?: string
}

export function createProject(data: CreateProjectPayload): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>('/api/projects/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProject(id: number, data: Partial<CreateProjectPayload>): Promise<ProjectDetail> {
  return apiFetch<ProjectDetail>(`/api/projects/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function uploadProjectCover(id: number, file: File): Promise<ProjectDetail> {
  const form = new FormData()
  form.append('cover_photo', file)
  return apiFetch<ProjectDetail>(`/api/projects/${id}/cover/`, {
    method: 'POST',
    body: form,
  })
}

// ─── ERP — Bitácora ───────────────────────────────────────────────────────────

export interface CreateProgressPayload {
  date: string
  progress_pct: number
  weather?: string
  temperature?: number | null
  labor_count?: number
  activities?: string[]
  materials?: string[]
  notes?: string
  phase?: number | null
}

export function createProgressUpdate(
  projectId: number,
  data: CreateProgressPayload,
): Promise<ProgressUpdate> {
  return apiFetch<ProgressUpdate>(`/api/projects/${projectId}/progress/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── ERP — Hitos ──────────────────────────────────────────────────────────────

export interface CreateMilestonePayload {
  name: string
  description?: string
  order?: number
  amount_gtq: string
  progress_required_pct?: number
  due_date?: string | null
  phase?: number | null
  notes?: string
}

export function createMilestone(
  projectId: number,
  data: CreateMilestonePayload,
): Promise<PaymentMilestone> {
  return apiFetch<PaymentMilestone>(`/api/projects/${projectId}/milestones/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function uploadMilestoneEvidence(
  projectId: number,
  milestoneId: number,
  photoUrl: string,
  caption = '',
): Promise<MilestoneEvidence> {
  return apiFetch<MilestoneEvidence>(
    `/api/projects/${projectId}/milestones/${milestoneId}/evidence/`,
    { method: 'POST', body: JSON.stringify({ photo_url: photoUrl, caption }) },
  )
}

export function markMilestonePaid(
  projectId: number,
  milestoneId: number,
): Promise<PaymentMilestone> {
  return apiFetch<PaymentMilestone>(
    `/api/projects/${projectId}/milestones/${milestoneId}/mark_paid/`,
    { method: 'POST' },
  )
}

// ─── ERP — Clientes ───────────────────────────────────────────────────────────

export interface ClientListItem {
  id: number
  name: string
  email: string
  phone: string
  company: string
  nit: string
  address: string
  avatar_url: string | null
  portal_user: number | null
  preferred_language: string
  preferred_currency: string
  created_at: string
  updated_at: string
}

export type ClientPayload = Pick<ClientListItem, 'name' | 'email' | 'phone' | 'company' | 'nit' | 'address'>

export function getClients(search?: string): Promise<PaginatedResponse<ClientListItem>> {
  const q = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch<PaginatedResponse<ClientListItem>>(`/api/projects/clients/${q}`)
}

export function createClient(data: ClientPayload): Promise<ClientListItem> {
  return apiFetch<ClientListItem>('/api/projects/clients/', { method: 'POST', body: JSON.stringify(data) })
}

export function updateClient(id: number, data: Partial<ClientPayload>): Promise<ClientListItem> {
  return apiFetch<ClientListItem>(`/api/projects/clients/${id}/`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteClient(id: number): Promise<void> {
  return apiFetch<void>(`/api/projects/clients/${id}/`, { method: 'DELETE' })
}

export async function uploadClientAvatar(id: number, file: File): Promise<ClientListItem> {
  const token = getAccessToken()
  const form = new FormData()
  form.append('avatar', file)
  const res = await fetch(`${API_URL}/api/projects/clients/${id}/avatar/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error((err as any).detail ?? `Error ${res.status}`) }
  return res.json()
}

export function logoutERP() {
  clearTokens()
  if (typeof window !== 'undefined') window.location.href = '/erp/login'
}

// ─── Company Settings ─────────────────────────────────────────────────────────

export async function updateCompanySettings(data: { name?: string; tagline?: string }) {
  return apiFetch<{ name: string; tagline: string; logo_url: string | null; logo_light_url: string | null }>('/api/settings/company/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function uploadCompanyLogo(variant: 'dark' | 'light', file: File) {
  const token = getAccessToken()
  const form  = new FormData()
  form.append('logo', file)
  const url = variant === 'dark' ? '/api/settings/company/logo/' : '/api/settings/company/logo-light/'
  const res = await fetch(`${API_URL}${url}`, {
    method:  'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body:    form,
  })
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).detail ?? `Error ${res.status}`) }
  return res.json()
}

// ─── Project Notes ────────────────────────────────────────────────────────────

export interface ProjectNote {
  id:           number
  body:         string
  author:       number | null
  author_name:  string
  author_avatar: string | null
  created_at:   string
  updated_at:   string
}

export function getProjectNotes(projectId: number): Promise<ProjectNote[]> {
  return apiFetch<{ results: ProjectNote[] } | ProjectNote[]>(`/api/projects/${projectId}/notes/`)
    .then(r => (Array.isArray(r) ? r : r.results))
}

export function createProjectNote(projectId: number, body: string): Promise<ProjectNote> {
  return apiFetch<ProjectNote>(`/api/projects/${projectId}/notes/`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export function updateProjectNote(projectId: number, noteId: number, body: string): Promise<ProjectNote> {
  return apiFetch<ProjectNote>(`/api/projects/${projectId}/notes/${noteId}/`, {
    method: 'PATCH',
    body: JSON.stringify({ body }),
  })
}

export function deleteProjectNote(projectId: number, noteId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/notes/${noteId}/`, { method: 'DELETE' })
}

// ─── ERP — RFIs ───────────────────────────────────────────────────────────────

export type RFIStatusValue = 'open' | 'in_review' | 'answered' | 'closed'
export type RFIPriorityValue = 'low' | 'medium' | 'high' | 'urgent'

export interface RFI {
  id: number
  project: number
  phase: number | null
  number: number
  subject: string
  description: string
  submitted_by: number | null
  submitted_by_name: string | null
  assigned_to: number | null
  assigned_to_name: string | null
  status: RFIStatusValue
  priority: RFIPriorityValue
  due_date: string | null
  answer: string
  answered_by: number | null
  answered_by_name: string | null
  answered_at: string | null
  attachments: string[]
  created_at: string
  updated_at: string
}

export function getRFIs(projectId: number): Promise<PaginatedResponse<RFI>> {
  return apiFetch<PaginatedResponse<RFI>>(
    `/api/projects/${projectId}/rfis/?page_size=50`,
  ).then((res: any) => res.results !== undefined ? res : { count: res.length, next: null, previous: null, results: res })
}

export function createRFI(
  projectId: number,
  data: { subject: string; description: string; priority?: string; due_date?: string | null; phase?: number | null },
): Promise<RFI> {
  return apiFetch<RFI>(`/api/projects/${projectId}/rfis/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function answerRFI(
  projectId: number,
  rfiId: number,
  answer: string,
): Promise<RFI> {
  return apiFetch<RFI>(`/api/projects/${projectId}/rfis/${rfiId}/answer/`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  })
}

export function updateRFI(
  projectId: number,
  rfiId: number,
  data: Partial<{ subject: string; description: string; priority: string; due_date: string | null; status: RFIStatusValue }>,
): Promise<RFI> {
  return apiFetch<RFI>(`/api/projects/${projectId}/rfis/${rfiId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteRFI(projectId: number, rfiId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/rfis/${rfiId}/`, { method: 'DELETE' })
}

// ─── ERP — Órdenes de cambio ──────────────────────────────────────────────────

export type ChangeOrderStatusValue = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected' | 'withdrawn'

export interface ChangeOrderApprovalData {
  id: number
  status: string
  company_approved_by: number | null
  company_approved_by_name: string | null
  company_approved_at: string | null
  company_notes: string
  client_approved_at: string | null
  client_notes: string
}

export interface ChangeOrder {
  id: number
  project: number
  phase: number | null
  number: number
  title: string
  description: string
  reason: string
  amount_gtq: string
  schedule_days_impact: number
  requested_by: number | null
  requested_by_name: string | null
  status: ChangeOrderStatusValue
  submitted_at: string | null
  company_notes: string
  client_notes: string
  approval: ChangeOrderApprovalData | null
  created_at: string
  updated_at: string
}

export function getChangeOrders(projectId: number): Promise<ChangeOrder[]> {
  return apiFetch<any>(`/api/projects/${projectId}/change-orders/?page_size=50`)
    .then((res: any) => res.results ?? res)
}

export function createChangeOrder(
  projectId: number,
  data: {
    title: string
    description: string
    reason: string
    amount_gtq: string
    schedule_days_impact?: number
    phase?: number | null
  },
): Promise<ChangeOrder> {
  return apiFetch<ChangeOrder>(`/api/projects/${projectId}/change-orders/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function submitChangeOrder(projectId: number, coId: number): Promise<ChangeOrder> {
  return apiFetch<ChangeOrder>(`/api/projects/${projectId}/change-orders/${coId}/submit/`, {
    method: 'POST',
  })
}

export function approveChangeOrder(
  projectId: number,
  coId: number,
  notes = '',
  asClient = false,
): Promise<ChangeOrder> {
  return apiFetch<ChangeOrder>(`/api/projects/${projectId}/change-orders/${coId}/approve/`, {
    method: 'POST',
    body: JSON.stringify({ notes, ...(asClient && { approve_as_client: true }) }),
  })
}

export function updateChangeOrder(
  projectId: number,
  coId: number,
  data: Partial<{ title: string; description: string; reason: string; amount_gtq: string; schedule_days_impact: number; phase: number | null }>,
): Promise<ChangeOrder> {
  return apiFetch<ChangeOrder>(`/api/projects/${projectId}/change-orders/${coId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteChangeOrder(projectId: number, coId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/change-orders/${coId}/`, { method: 'DELETE' })
}

export function rejectChangeOrder(
  projectId: number,
  coId: number,
  notes = '',
): Promise<ChangeOrder> {
  return apiFetch<ChangeOrder>(`/api/projects/${projectId}/change-orders/${coId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  })
}

// ─── ERP — Gastos ─────────────────────────────────────────────────────────────

export type ExpenseStatusValue = 'pending' | 'approved' | 'rejected' | 'reimbursed'

export interface Expense {
  id: number
  project: number
  phase: number | null
  category: string
  description: string
  amount_gtq: string
  receipt_url: string
  expense_date: string
  submitted_by: number | null
  submitted_by_name: string | null
  approved_by: number | null
  approved_by_name: string | null
  approved_at: string | null
  status: ExpenseStatusValue
  notes: string
  created_at: string
  updated_at: string
}

export function getExpenses(projectId: number): Promise<Expense[]> {
  return apiFetch<any>(`/api/projects/${projectId}/expenses/?page_size=100`)
    .then((res: any) => res.results ?? res)
}

export function createExpense(
  projectId: number,
  data: {
    category: string
    description: string
    amount_gtq: string
    expense_date: string
    receipt_url?: string
    notes?: string
    phase?: number | null
  },
): Promise<Expense> {
  return apiFetch<Expense>(`/api/projects/${projectId}/expenses/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function approveExpense(projectId: number, expenseId: number): Promise<Expense> {
  return apiFetch<Expense>(`/api/projects/${projectId}/expenses/${expenseId}/approve/`, {
    method: 'POST',
  })
}

export function updateExpense(
  projectId: number,
  expenseId: number,
  data: Partial<{ category: string; description: string; amount_gtq: string; expense_date: string; receipt_url: string; notes: string }>,
): Promise<Expense> {
  return apiFetch<Expense>(`/api/projects/${projectId}/expenses/${expenseId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteExpense(projectId: number, expenseId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/expenses/${expenseId}/`, { method: 'DELETE' })
}

// ─── ERP — Facturas ───────────────────────────────────────────────────────────

export type InvoiceStatusValue = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: number
  project: number
  milestone: number | null
  invoice_number: string
  title: string
  description: string
  amount_gtq: string
  tax_percentage: string
  total_with_tax: number
  issue_date: string
  due_date: string | null
  paid_at: string | null
  status: InvoiceStatusValue
  notes: string
  created_by: number | null
  created_by_name: string | null
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export function getInvoices(projectId: number): Promise<Invoice[]> {
  return apiFetch<any>(`/api/projects/${projectId}/invoices/?page_size=100`)
    .then((res: any) => res.results ?? res)
}

export function createInvoice(
  projectId: number,
  data: {
    invoice_number: string
    title: string
    amount_gtq: string
    issue_date: string
    description?: string
    tax_percentage?: string
    due_date?: string | null
    milestone?: number | null
    notes?: string
  },
): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/projects/${projectId}/invoices/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function markInvoicePaid(projectId: number, invoiceId: number): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/projects/${projectId}/invoices/${invoiceId}/mark-paid/`, {
    method: 'POST',
  })
}

export function updateInvoice(
  projectId: number,
  invoiceId: number,
  data: Partial<{ invoice_number: string; title: string; amount_gtq: string; tax_percentage: string; issue_date: string; due_date: string | null; description: string; notes: string }>,
): Promise<Invoice> {
  return apiFetch<Invoice>(`/api/projects/${projectId}/invoices/${invoiceId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteInvoice(projectId: number, invoiceId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/invoices/${invoiceId}/`, { method: 'DELETE' })
}

// ─── ERP — Equipo ─────────────────────────────────────────────────────────────

export interface TeamMember {
  id: number
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: string
  phone: string
  avatar_url: string
  is_active: boolean
  created_at: string
}

export function getUsers(): Promise<TeamMember[]> {
  return apiFetch<any>('/api/users/?page_size=100')
    .then((res: any) => res.results ?? res)
}

export function createUser(data: {
  email: string
  first_name: string
  last_name: string
  role: string
  phone?: string
  password: string
}): Promise<TeamMember> {
  return apiFetch<TeamMember>('/api/users/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateUser(id: number, data: Partial<TeamMember>): Promise<TeamMember> {
  return apiFetch<TeamMember>(`/api/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ─── ERP — Inventario ─────────────────────────────────────────────────────────

export interface InventoryCategory {
  id: number
  name: string
  description: string
  color: string
  tracks_stock: boolean
  created_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  sku: string | null
  category: number | null
  category_name: string | null
  unit: string
  unit_display: string
  unit_price_gtq: string
  stock_quantity: string
  min_stock_alert: string
  supplier_name: string
  supplier_contact: string
  is_active: boolean
  is_low_stock: boolean
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: number
  product: number
  product_name: string
  project: number | null
  movement_type: 'in' | 'out' | 'adjustment'
  quantity: string
  unit_price_gtq: string | null
  notes: string
  reference_number: string
  performed_by: number | null
  performed_by_name: string | null
  created_at: string
}

export function getInventoryCategories(): Promise<InventoryCategory[]> {
  return apiFetch<any>('/api/inventory/categories/')
    .then((res: any) => res.results ?? res)
}

export function createInventoryCategory(data: { name: string; description?: string; color?: string; tracks_stock?: boolean }): Promise<InventoryCategory> {
  return apiFetch<InventoryCategory>('/api/inventory/categories/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateInventoryCategory(id: number, data: { name?: string; description?: string; color?: string; tracks_stock?: boolean }): Promise<InventoryCategory> {
  return apiFetch<InventoryCategory>(`/api/inventory/categories/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteInventoryCategory(id: number): Promise<void> {
  return apiFetch<void>(`/api/inventory/categories/${id}/`, { method: 'DELETE' })
}

export function getProducts(params?: { category?: number; is_active?: boolean; search?: string }): Promise<Product[]> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', String(params.category))
  if (params?.is_active !== undefined) qs.set('is_active', String(params.is_active))
  if (params?.search) qs.set('search', params.search)
  qs.set('page_size', '100')
  return apiFetch<any>(`/api/inventory/products/?${qs.toString()}`)
    .then((res: any) => res.results ?? res)
}

export function createProduct(data: {
  name: string
  description?: string
  sku?: string
  category?: number | null
  unit: string
  unit_price_gtq: string
  min_stock_alert?: string
  supplier_name?: string
  supplier_contact?: string
}): Promise<Product> {
  return apiFetch<Product>('/api/inventory/products/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProduct(id: number, data: Partial<Parameters<typeof createProduct>[0]>): Promise<Product> {
  return apiFetch<Product>(`/api/inventory/products/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteProduct(id: number): Promise<void> {
  return apiFetch<void>(`/api/inventory/products/${id}/`, { method: 'DELETE' })
}

export function getStockMovements(params?: { product?: number; movement_type?: string }): Promise<StockMovement[]> {
  const qs = new URLSearchParams()
  if (params?.product) qs.set('product', String(params.product))
  if (params?.movement_type) qs.set('movement_type', params.movement_type)
  qs.set('page_size', '50')
  return apiFetch<any>(`/api/inventory/movements/?${qs.toString()}`)
    .then((res: any) => res.results ?? res)
}

export function createStockMovement(data: {
  product: number
  movement_type: 'in' | 'out' | 'adjustment'
  quantity: string
  unit_price_gtq?: string
  project?: number | null
  notes?: string
  reference_number?: string
}): Promise<StockMovement> {
  return apiFetch<StockMovement>('/api/inventory/movements/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── ERP — Proveedores ────────────────────────────────────────────────────────

export type SupplierCategory =
  | 'materials'
  | 'equipment'
  | 'subcontractor'
  | 'services'
  | 'tools'
  | 'transport'
  | 'other'

export interface Supplier {
  id: number
  name: string
  category: SupplierCategory
  category_display: string
  contact_person: string
  email: string
  phone: string
  nit: string
  address: string
  website: string
  notes: string
  rating: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export function getSuppliers(params?: { category?: SupplierCategory; is_active?: boolean; search?: string }): Promise<Supplier[]> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.is_active !== undefined) qs.set('is_active', String(params.is_active))
  if (params?.search) qs.set('search', params.search)
  qs.set('page_size', '100')
  return apiFetch<any>(`/api/suppliers/?${qs.toString()}`)
    .then((res: any) => res.results ?? res)
}

export function createSupplier(data: {
  name: string
  category?: SupplierCategory
  contact_person?: string
  email?: string
  phone?: string
  nit?: string
  address?: string
  website?: string
  notes?: string
  rating?: number
}): Promise<Supplier> {
  return apiFetch<Supplier>('/api/suppliers/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateSupplier(id: number, data: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'category_display'>>): Promise<Supplier> {
  return apiFetch<Supplier>(`/api/suppliers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteSupplier(id: number): Promise<void> {
  return apiFetch<void>(`/api/suppliers/${id}/`, { method: 'DELETE' })
}

// ─── ERP — Documentos ─────────────────────────────────────────────────────────

export type DocumentType = 'contract' | 'blueprint' | 'specification' | 'report' | 'permit' | 'other'

export interface ProjectDocument {
  id: number
  project: number
  phase: number | null
  document_type: DocumentType
  title: string
  description: string
  file_url: string
  file_name: string
  file_size_kb: number | null
  version: string
  uploaded_by: number | null
  uploaded_by_name: string | null
  tags: string[]
  is_archived: boolean
  visible_to_client: boolean
  created_at: string
  updated_at: string
}

// ─── Contactos del proyecto ───────────────────────────────────────────────────

export interface ProjectContact {
  id: number
  project: number
  name: string
  role: string
  company: string
  email: string
  phone: string
  avatar_url: string
  resolved_avatar_url?: string
  order: number
  created_at: string
  updated_at: string
}

export function getProjectContacts(projectId: number): Promise<ProjectContact[]> {
  return apiFetch<{ results: ProjectContact[] }>(`/api/projects/${projectId}/contacts/`)
    .then(r => r.results)
}

export function createProjectContact(projectId: number, data: Omit<ProjectContact, 'id' | 'project' | 'created_at' | 'updated_at'>): Promise<ProjectContact> {
  return apiFetch<ProjectContact>(`/api/projects/${projectId}/contacts/`, { method: 'POST', body: JSON.stringify(data) })
}

export function updateProjectContact(projectId: number, contactId: number, data: Partial<ProjectContact>): Promise<ProjectContact> {
  return apiFetch<ProjectContact>(`/api/projects/${projectId}/contacts/${contactId}/`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteProjectContact(projectId: number, contactId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/contacts/${contactId}/`, { method: 'DELETE' })
}

export async function uploadContactAvatar(projectId: number, contactId: number, file: File): Promise<ProjectContact> {
  const token = getAccessToken()
  const form = new FormData()
  form.append('avatar', file)
  const res = await fetch(`${API_URL}/api/projects/${projectId}/contacts/${contactId}/avatar/`, {
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

export function getDocuments(projectId: number, params?: { document_type?: DocumentType; is_archived?: boolean }): Promise<ProjectDocument[]> {
  const qs = new URLSearchParams()
  if (params?.document_type) qs.set('document_type', params.document_type)
  if (params?.is_archived !== undefined) qs.set('is_archived', String(params.is_archived))
  qs.set('page_size', '100')
  return apiFetch<any>(`/api/projects/${projectId}/documents/?${qs.toString()}`)
    .then((res: any) => res.results ?? res)
}

export function createDocument(projectId: number, data: {
  title: string
  document_type: DocumentType
  file_url: string
  file_name?: string
  description?: string
  version?: string
  tags?: string[]
  phase?: number | null
  visible_to_client?: boolean
}): Promise<ProjectDocument> {
  return apiFetch<ProjectDocument>(`/api/projects/${projectId}/documents/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateDocument(projectId: number, docId: number, data: Partial<ProjectDocument>): Promise<ProjectDocument> {
  return apiFetch<ProjectDocument>(`/api/projects/${projectId}/documents/${docId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteDocument(projectId: number, docId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/documents/${docId}/`, { method: 'DELETE' })
}

// ─── ERP — Submittals ─────────────────────────────────────────────────────────

export type SubmittalStatus =
  | 'pending' | 'submitted' | 'in_review'
  | 'approved' | 'approved_with_comments' | 'rejected' | 'resubmit'

export interface Submittal {
  id: number
  project: number
  phase: number | null
  number: number
  title: string
  description: string
  submitted_by: number | null
  submitted_by_name: string | null
  reviewed_by: number | null
  reviewed_by_name: string | null
  status: SubmittalStatus
  file_url: string
  review_notes: string
  review_date: string | null
  created_at: string
  updated_at: string
}

export function getSubmittals(projectId: number): Promise<Submittal[]> {
  return apiFetch<any>(`/api/projects/${projectId}/submittals/?page_size=100`)
    .then((res: any) => res.results ?? res)
}

export function createSubmittal(projectId: number, data: {
  title: string
  description?: string
  file_url?: string
  phase?: number | null
}): Promise<Submittal> {
  return apiFetch<Submittal>(`/api/projects/${projectId}/submittals/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function reviewSubmittal(projectId: number, submittalId: number, status: SubmittalStatus, notes: string): Promise<Submittal> {
  return apiFetch<Submittal>(`/api/projects/${projectId}/submittals/${submittalId}/review/`, {
    method: 'POST',
    body: JSON.stringify({ status, review_notes: notes }),
  })
}

// ─── ERP — Punch List ─────────────────────────────────────────────────────────

export type PunchItemStatus   = 'open' | 'in_progress' | 'resolved' | 'closed'
export type PunchItemPriority = 'low' | 'medium' | 'high' | 'critical'
export type PunchItemCategory = 'correction' | 'observation' | 'non_conformity' | 'risk' | 'other'

export interface PunchItem {
  id: number
  project: number
  phase: number | null
  number: number
  description: string
  location: string
  assigned_to: number | null
  assigned_to_name: string | null
  created_by: number | null
  created_by_name: string | null
  status: PunchItemStatus
  priority: PunchItemPriority
  category: PunchItemCategory
  photo_urls: string[]
  resolution_notes: string
  due_date: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
}

export function getPunchItems(projectId: number, params?: { status?: PunchItemStatus; priority?: PunchItemPriority }): Promise<PunchItem[]> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.priority) qs.set('priority', params.priority)
  qs.set('page_size', '100')
  return apiFetch<any>(`/api/projects/${projectId}/punchitems/?${qs.toString()}`)
    .then((res: any) => res.results ?? res)
}

export function createPunchItem(projectId: number, data: {
  description: string
  location?: string
  priority?: PunchItemPriority
  category?: PunchItemCategory
  due_date?: string | null
  phase?: number | null
  assigned_to?: number | null
}): Promise<PunchItem> {
  return apiFetch<PunchItem>(`/api/projects/${projectId}/punchitems/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function resolvePunchItem(projectId: number, itemId: number, resolution_notes: string): Promise<PunchItem> {
  return apiFetch<PunchItem>(`/api/projects/${projectId}/punchitems/${itemId}/resolve/`, {
    method: 'POST',
    body: JSON.stringify({ resolution_notes }),
  })
}

export function updatePunchItem(projectId: number, itemId: number, data: Partial<Pick<PunchItem, 'status' | 'assigned_to' | 'due_date'>>): Promise<PunchItem> {
  return apiFetch<PunchItem>(`/api/projects/${projectId}/punchitems/${itemId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskStatus   = 'pending' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical' | 'urgent'

export interface Task {
  id: number
  project: number
  phase: number | null
  phase_name: string | null
  title: string
  description: string
  assigned_to: number | null
  assigned_to_name: string | null
  created_by: number | null
  created_by_name: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  completed_at: string | null
  is_overdue: boolean
  created_at: string
  updated_at: string
}

export async function getTasks(projectId: number, params?: { status?: TaskStatus; priority?: TaskPriority }): Promise<Task[]> {
  const qs = new URLSearchParams()
  if (params?.status)   qs.set('status', params.status)
  if (params?.priority) qs.set('priority', params.priority)
  const q = qs.toString()
  const res = await apiFetch<Task[] | PaginatedResponse<Task>>(`/api/projects/${projectId}/tasks/${q ? `?${q}` : ''}`)
  return Array.isArray(res) ? res : res.results
}

export function createTask(
  projectId: number,
  data: { title: string; description?: string; assigned_to?: number | null; phase?: number | null; priority?: TaskPriority; due_date?: string | null },
): Promise<Task> {
  return apiFetch<Task>(`/api/projects/${projectId}/tasks/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateTask(projectId: number, taskId: number, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'assigned_to' | 'due_date' | 'phase'>>): Promise<Task> {
  return apiFetch<Task>(`/api/projects/${projectId}/tasks/${taskId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteTask(projectId: number, taskId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/tasks/${taskId}/`, { method: 'DELETE' })
}

// ─── ERP — Trabajadores ──────────────────────────────────────────────────────

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
  start_time: string | null   // "HH:MM:SS"
  end_time: string | null     // "HH:MM:SS"
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

export function getWorkers(params?: { status?: WorkerStatus; position?: WorkerPosition; current_project?: number; search?: string }): Promise<Worker[]> {
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

export function updateWorker(id: number, data: Partial<Parameters<typeof createWorker>[0]>): Promise<Worker> {
  return apiFetch<Worker>(`/api/workers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteWorker(id: number): Promise<void> {
  return apiFetch<void>(`/api/workers/${id}/`, { method: 'DELETE' })
}

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

// ─── CRM ─────────────────────────────────────────────────────────────────────

export type LeadSourceValue =
  | 'instagram' | 'facebook' | 'meta_ads' | 'linkedin'
  | 'youtube' | 'tiktok' | 'organic_search' | 'referral'
  | 'widget' | 'direct' | 'other'

export type ServiceTypeValue =
  | 'construction' | 'renovation' | 'kitchens_baths' | 'commercial' | 'residential' | 'other'

export type LeadStatusValue = 'active' | 'won' | 'lost' | 'archived'

export type ActivityTypeValue =
  | 'note' | 'call' | 'email' | 'meeting' | 'stage_change' | 'conversion'

export interface PipelineStage {
  id: number
  pipeline: number
  name: string
  order: number
  color: string
  is_won: boolean
  is_lost: boolean
  leads_count: number
  created_at: string
  updated_at: string
}

export interface Pipeline {
  id: number
  name: string
  description: string
  is_default: boolean
  stages: PipelineStage[]
  created_at: string
  updated_at: string
}

export interface LeadActivity {
  id: number
  lead: number
  activity_type: ActivityTypeValue
  content: string
  user: number | null
  user_name: string | null
  created_at: string
}

export type LeadTierValue = 'hot' | 'warm' | 'cold'

export interface Lead {
  id: number
  pipeline: number
  stage: number
  stage_name: string
  stage_color: string
  full_name: string
  email: string
  phone: string
  company: string
  city: string
  source: LeadSourceValue
  service_type: ServiceTypeValue
  status: LeadStatusValue
  estimated_value_gtq: string | null
  notes: string
  lead_score: number | null
  lead_tier: LeadTierValue | null
  assigned_to: number | null
  assigned_to_name: string | null
  converted_project: number | null
  converted_project_name: string | null
  converted_at: string | null
  days_in_stage: number
  activities: LeadActivity[]
  created_at: string
  updated_at: string
}

// Pipelines
export function getPipelines(): Promise<Pipeline[]> {
  return apiFetch<{ results: Pipeline[] } | Pipeline[]>('/api/crm/pipelines/')
    .then(r => (Array.isArray(r) ? r : r.results))
}

export function createPipeline(data: { name: string; description?: string; is_default?: boolean }): Promise<Pipeline> {
  return apiFetch<Pipeline>('/api/crm/pipelines/', { method: 'POST', body: JSON.stringify(data) })
}

export function updatePipeline(id: number, data: Partial<{ name: string; description: string; is_default: boolean }>): Promise<Pipeline> {
  return apiFetch<Pipeline>(`/api/crm/pipelines/${id}/`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deletePipeline(id: number): Promise<void> {
  return apiFetch<void>(`/api/crm/pipelines/${id}/`, { method: 'DELETE' })
}

// Stages (nested under pipeline)
export function createStage(pipelineId: number, data: { name: string; order?: number; color?: string; is_won?: boolean; is_lost?: boolean }): Promise<PipelineStage> {
  return apiFetch<PipelineStage>(`/api/crm/pipelines/${pipelineId}/stages/`, { method: 'POST', body: JSON.stringify(data) })
}

export function updateStage(pipelineId: number, stageId: number, data: Partial<{ name: string; order: number; color: string; is_won: boolean; is_lost: boolean }>): Promise<PipelineStage> {
  return apiFetch<PipelineStage>(`/api/crm/pipelines/${pipelineId}/stages/${stageId}/`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteStage(pipelineId: number, stageId: number): Promise<void> {
  return apiFetch<void>(`/api/crm/pipelines/${pipelineId}/stages/${stageId}/`, { method: 'DELETE' })
}

export function reorderStages(pipelineId: number, orderedIds: number[]): Promise<PipelineStage[]> {
  return apiFetch<PipelineStage[]>(`/api/crm/pipelines/${pipelineId}/stages/reorder/`, {
    method: 'POST',
    body: JSON.stringify({ order: orderedIds }),
  })
}

// Leads
export function getLeads(params?: { pipeline?: number; stage?: number; status?: string; search?: string }): Promise<Lead[]> {
  const qs = params ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : ''
  return apiFetch<{ results: Lead[] } | Lead[]>(`/api/crm/leads/${qs}`)
    .then(r => (Array.isArray(r) ? r : r.results))
}

export function createLead(data: Partial<Lead>): Promise<Lead> {
  return apiFetch<Lead>('/api/crm/leads/', { method: 'POST', body: JSON.stringify(data) })
}

export function updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
  return apiFetch<Lead>(`/api/crm/leads/${id}/`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteLead(id: number): Promise<void> {
  return apiFetch<void>(`/api/crm/leads/${id}/`, { method: 'DELETE' })
}

export function moveLead(leadId: number, stageId: number): Promise<Lead> {
  return apiFetch<Lead>(`/api/crm/leads/${leadId}/move/`, {
    method: 'POST',
    body: JSON.stringify({ stage: stageId }),
  })
}

export function convertLead(leadId: number, projectId: number): Promise<Lead> {
  return apiFetch<Lead>(`/api/crm/leads/${leadId}/convert/`, {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId }),
  })
}

export function createLeadActivity(leadId: number, data: { activity_type: ActivityTypeValue; content: string }): Promise<LeadActivity> {
  return apiFetch<LeadActivity>(`/api/crm/leads/${leadId}/activities/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── Cotizaciones ─────────────────────────────────────────────────────────────

export type QuoteStatus   = 'draft' | 'sent' | 'changes_requested' | 'approved' | 'rejected'
export type QuoteCategory = 'materials' | 'labor' | 'equipment' | 'other'

export interface StockAlert {
  line_description: string
  product_name:     string
  required:         number
  available:        number
  unit:             string
  shortage:         number
}

export interface QuoteLineItem {
  id?:           number
  product_id?:   number | null
  product_name?: string | null
  category:      QuoteCategory
  description:   string
  quantity:      number
  unit:          string
  unit_display?: string
  unit_price:    number
  subtotal?:     number
  order:         number
}

export interface QuoteTemplate {
  id:              number
  name:            string
  description:     string
  created_by:      number | null
  created_by_name: string | null
  created_at:      string
  updated_at:      string
  line_items:      Omit<QuoteLineItem, 'id' | 'subtotal'>[]
}

export interface Quote {
  id:              number
  project:         number
  revision:        number
  quote_number:    string
  status:          QuoteStatus
  valid_until:    string | null
  notes:          string
  discount_pct:   string
  tax_pct:        string
  client_comment: string
  created_by:     number | null
  created_by_name: string | null
  sent_at:        string | null
  decided_at:     string | null
  created_at:     string
  updated_at:     string
  line_items:     QuoteLineItem[]
  subtotal_amount: number
  discount_amount: number
  tax_amount:     number
  total_amount:   number
  stock_alerts?:  StockAlert[]
}

export function getProjectQuotes(projectId: number): Promise<Quote[]> {
  return apiFetch<Quote[] | { results: Quote[] }>(`/api/projects/${projectId}/quotes/`)
    .then(r => Array.isArray(r) ? r : r.results)
}

export function createProjectQuote(projectId: number, data: Partial<Omit<Quote, 'id' | 'project' | 'revision' | 'status' | 'created_by' | 'created_by_name' | 'sent_at' | 'decided_at' | 'created_at' | 'updated_at' | 'subtotal_amount' | 'discount_amount' | 'tax_amount' | 'total_amount'>>): Promise<Quote> {
  return apiFetch<Quote>(`/api/projects/${projectId}/quotes/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProjectQuote(projectId: number, quoteId: number, data: Partial<Omit<Quote, 'id' | 'project' | 'revision' | 'status' | 'created_by' | 'created_by_name' | 'sent_at' | 'decided_at' | 'created_at' | 'updated_at' | 'subtotal_amount' | 'discount_amount' | 'tax_amount' | 'total_amount'>>): Promise<Quote> {
  return apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteProjectQuote(projectId: number, quoteId: number): Promise<void> {
  return apiFetch<void>(`/api/projects/${projectId}/quotes/${quoteId}/`, { method: 'DELETE' })
}

export function sendProjectQuote(projectId: number, quoteId: number): Promise<Quote> {
  return apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/send/`, { method: 'POST' })
}

export function approveProjectQuote(projectId: number, quoteId: number): Promise<Quote> {
  return apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/approve/`, { method: 'POST' })
}

export function requestChangesProjectQuote(projectId: number, quoteId: number, comment: string): Promise<Quote> {
  return apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/request_changes/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  })
}

export function rejectProjectQuote(projectId: number, quoteId: number, comment: string): Promise<Quote> {
  return apiFetch<Quote>(`/api/projects/${projectId}/quotes/${quoteId}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  })
}

export async function downloadQuotePDF(projectId: number, quoteId: number): Promise<void> {
  let token = getAccessToken()
  if (!token) token = await refreshAccessToken()

  async function fetchPDF(t: string | null) {
    return fetch(`${API_URL}/api/projects/${projectId}/quotes/${quoteId}/pdf/`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
    })
  }

  let res = await fetchPDF(token)

  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (!newToken) throw new Error('No autenticado')
    res = await fetchPDF(newToken)
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try { const j = await res.json(); detail = j.detail ?? JSON.stringify(j) } catch {}
    throw new Error(detail)
  }

  const blob = await res.blob()
  openBlob(blob)
}

function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

// ─── Quote Templates ─────────────────────────────────────────────────────────

export function getQuoteTemplates(): Promise<QuoteTemplate[]> {
  return apiFetch<QuoteTemplate[] | { results: QuoteTemplate[] }>('/api/projects/quote-templates/')
    .then(r => Array.isArray(r) ? r : r.results)
}

export function createQuoteTemplate(data: Pick<QuoteTemplate, 'name' | 'description' | 'line_items'>): Promise<QuoteTemplate> {
  return apiFetch<QuoteTemplate>('/api/projects/quote-templates/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateQuoteTemplate(id: number, data: Partial<Pick<QuoteTemplate, 'name' | 'description' | 'line_items'>>): Promise<QuoteTemplate> {
  return apiFetch<QuoteTemplate>(`/api/projects/quote-templates/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteQuoteTemplate(id: number): Promise<void> {
  return apiFetch<void>(`/api/projects/quote-templates/${id}/`, { method: 'DELETE' })
}
