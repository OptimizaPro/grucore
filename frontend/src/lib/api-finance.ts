/**
 * API client — módulo financiero Grucore.
 * Purchasing · Assets · Subcontractors · Ledger · P&L
 */
import { apiFetch } from './api'

// ─── Purchasing ───────────────────────────────────────────────────────────────

export interface PurchaseOrder {
  id: number
  number: string
  year: number
  sequence: number
  supplier: number
  supplier_name: string
  project: number
  phase: number | null
  status: string
  tax_percentage: string
  delivery_date: string | null
  notes: string
  confirmed_by: number | null
  confirmed_by_name: string | null
  confirmed_at: string | null
  created_by: number | null
  created_by_name: string | null
  subtotal_gtq: string
  tax_amount_gtq: string
  total_gtq: string
  lines: PurchaseOrderLine[]
  created_at: string
  updated_at: string
}

export interface PurchaseOrderLine {
  id: number
  purchase_order: number
  product: number | null
  description: string
  quantity: string
  unit: string
  unit_cost_gtq: string
  cost_code: number | null
  line_subtotal_gtq: string
  quantity_received_total: string
  remaining_qty: string
  is_fully_received: boolean
}

export interface SupplierInvoice {
  id: number
  number: string
  supplier: number
  supplier_name: string
  purchase_order: number | null
  supplier_invoice_number: string
  issue_date: string
  due_date: string | null
  status: string
  notes: string
  subtotal_gtq: string
  tax_amount_gtq: string
  total_gtq: string
  amount_paid_gtq: string
  balance_gtq: string
  is_overdue: boolean
  lines: SupplierInvoiceLine[]
  created_at: string
  updated_at: string
}

export interface SupplierInvoiceLine {
  id: number
  invoice: number
  description: string
  quantity: string
  unit_cost_gtq: string
  line_subtotal_gtq: string
  cost_code: number | null
  project: number | null
}

export interface SupplierPayment {
  id: number
  number: string
  supplier: number
  supplier_name: string
  payment_date: string
  payment_method: string
  amount_gtq: string
  reference_number: string
  status: string
  notes: string
  total_allocated_gtq: string
  allocations: SupplierPaymentAllocation[]
  created_at: string
  updated_at: string
}

export interface SupplierPaymentAllocation {
  id: number
  payment: number
  invoice: number
  invoice_number: string
  amount_allocated: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface PurchaseOrderLineInput {
  description:    string
  quantity:       string
  unit:           string
  unit_cost_gtq:  string
  cost_code?:     number | null
}

export interface CreatePurchaseOrderInput {
  supplier:        number
  project:         number
  phase?:          number | null
  tax_percentage?: string
  delivery_date?:  string | null
  notes?:          string
  lines:           PurchaseOrderLineInput[]
}

export interface CreateSupplierInvoiceInput {
  supplier:                number
  purchase_order?:         number | null
  supplier_invoice_number: string
  issue_date:              string
  due_date?:               string | null
  tax_percentage?:         string
  notes?:                  string
  lines: Array<{
    description:    string
    quantity:       string
    unit_cost_gtq:  string
    project?:       number | null
    cost_code?:     number | null
  }>
}

export interface CreateSupplierPaymentInput {
  supplier:         number
  payment_date:     string
  payment_method:   string
  amount_gtq:       string
  reference_number?: string
  notes?:           string
}

export interface CreateSubcontractorCertificationInput {
  period_start:          string
  period_end:            string
  amount_certified_gtq:  string
  retention_withheld_gtq: string
  advance_recovery_gtq?: string
  notes?:                string
}

export function getPurchaseOrders(params?: string) {
  return apiFetch<PaginatedResponse<PurchaseOrder>>(
    `/api/purchasing/orders/${params ? `?${params}` : ''}`
  )
}

export function confirmPurchaseOrder(id: number) {
  return apiFetch<PurchaseOrder>(`/api/purchasing/orders/${id}/confirm/`, { method: 'POST' })
}

export function getSupplierInvoices(params?: string) {
  return apiFetch<PaginatedResponse<SupplierInvoice>>(
    `/api/purchasing/invoices/${params ? `?${params}` : ''}`
  )
}

export function postSupplierInvoice(id: number) {
  return apiFetch<SupplierInvoice>(`/api/purchasing/invoices/${id}/post/`, { method: 'POST' })
}

export function getSupplierPayments(params?: string) {
  return apiFetch<PaginatedResponse<SupplierPayment>>(
    `/api/purchasing/payments/${params ? `?${params}` : ''}`
  )
}

export function postSupplierPayment(id: number) {
  return apiFetch<SupplierPayment>(`/api/purchasing/payments/${id}/post/`, { method: 'POST' })
}

export function createPurchaseOrder(data: CreatePurchaseOrderInput) {
  return apiFetch<PurchaseOrder>('/api/purchasing/orders/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function createSupplierInvoice(data: CreateSupplierInvoiceInput) {
  return apiFetch<SupplierInvoice>('/api/purchasing/invoices/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function createSupplierPayment(data: CreateSupplierPaymentInput) {
  return apiFetch<SupplierPayment>('/api/purchasing/payments/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── Assets ───────────────────────────────────────────────────────────────────

export interface AssetCategory {
  id: number
  name: string
  description: string
  default_useful_life_years: string
  default_depreciation_method: string
  sat_max_depreciation_rate_pct: string
  is_active: boolean
}

export interface FixedAsset {
  id: number
  asset_number: string
  name: string
  description: string
  category: number
  category_name: string
  brand: string
  model: string
  serial_number: string
  year_of_manufacture: number | null
  acquisition_date: string
  purchase_cost_gtq: string
  supplier: number | null
  depreciation_method: string
  useful_life_years: string
  residual_value_gtq: string
  in_service_date: string | null
  status: string
  current_project: number | null
  internal_rate_gtq_per_hour: string
  monthly_depreciation_gtq: string | null
  accumulated_depreciation_gtq: string
  net_book_value_gtq: string
  depreciable_amount_gtq: string
  created_by: number | null
  created_at: string
  updated_at: string
}

export interface EquipmentUsageLog {
  id: number
  asset: number
  asset_number: string
  project: number
  project_name: string
  phase: number | null
  usage_date: string
  hours_used: string
  rate_gtq_per_hour: string
  fuel_liters: string | null
  fuel_cost_gtq: string | null
  notes: string
  allocated_cost_gtq: string
  total_cost_including_fuel_gtq: string
  created_by: number | null
  created_at: string
  updated_at: string
}

export function getFixedAssets(params?: string) {
  return apiFetch<PaginatedResponse<FixedAsset>>(
    `/api/assets/${params ? `?${params}` : ''}`
  )
}

export function getAssetCategories() {
  return apiFetch<PaginatedResponse<AssetCategory>>('/api/assets/categories/')
}

export function getEquipmentUsageLogs(params?: string) {
  return apiFetch<PaginatedResponse<EquipmentUsageLog>>(
    `/api/assets/usage/${params ? `?${params}` : ''}`
  )
}

export function createEquipmentUsageLog(assetId: number, data: Partial<EquipmentUsageLog>) {
  return apiFetch<EquipmentUsageLog>(`/api/assets/${assetId}/usage/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ─── Subcontractors ───────────────────────────────────────────────────────────

export interface SubcontractorContract {
  id: number
  number: string
  year: number
  sequence: number
  subcontractor: number
  subcontractor_name: string
  project: number
  project_name: string
  phase: number | null
  title: string
  description: string
  contract_value_gtq: string
  tax_percentage: string
  retention_pct: string
  advance_paid_gtq: string
  advance_recovered_gtq: string
  start_date: string | null
  end_date: string | null
  status: string
  notes: string
  contract_value_with_tax_gtq: string
  total_certified_gtq: string
  retention_balance_gtq: string
  advance_balance_gtq: string
  balance_to_certify_gtq: string
  total_net_payable_gtq: string
  completion_pct: string
  created_by: number | null
  created_at: string
  updated_at: string
}

export interface SubcontractorCertification {
  id: number
  contract: number
  certification_number: number
  period_start: string
  period_end: string
  amount_certified_gtq: string
  retention_withheld_gtq: string
  advance_recovery_gtq: string
  net_payable_gtq: string
  status: string
  approved_by: number | null
  approved_by_name: string | null
  approved_at: string | null
  notes: string
  created_at: string
  updated_at: string
}

export function getSubcontractorContracts(params?: string) {
  return apiFetch<PaginatedResponse<SubcontractorContract>>(
    `/api/subcontractors/contracts/${params ? `?${params}` : ''}`
  )
}

export function getSubcontractorCertifications(contractId: number) {
  return apiFetch<PaginatedResponse<SubcontractorCertification>>(
    `/api/subcontractors/contracts/${contractId}/certifications/`
  )
}

export function approveSubcontractorCertification(contractId: number, certId: number) {
  return apiFetch<SubcontractorCertification>(
    `/api/subcontractors/contracts/${contractId}/certifications/${certId}/approve/`,
    { method: 'POST' }
  )
}

export function createSubcontractorCertification(contractId: number, data: CreateSubcontractorCertificationInput) {
  return apiFetch<SubcontractorCertification>(
    `/api/subcontractors/contracts/${contractId}/certifications/`,
    { method: 'POST', body: JSON.stringify(data) }
  )
}

// ─── Ledger / P&L ─────────────────────────────────────────────────────────────

export interface AccountingPeriod {
  id: number
  year: number
  month: number
  state: string
  label: string
  closed_by: number | null
  closed_by_name: string | null
  closed_at: string | null
  notes: string
}

export interface CompanyPnL {
  gross_revenue: string
  revenue_deductions: string
  net_revenue: string
  direct_materials: string
  direct_labor: string
  subcontractors: string
  equipment: string
  other_direct: string
  total_direct_cost: string
  gross_margin: string
  gross_margin_pct: string | null
  overhead: string
  ebitda: string
  depreciation: string
  ebit: string
  financial_result: string
  profit_before_tax: string
  income_tax: string
  net_profit: string
}

export interface ProjectPnLSummary {
  project_id: number
  project_name: string
  gross_revenue: string
  total_direct_cost: string
  gross_margin: string
  gross_margin_pct: string | null
  forecast_final_margin: string | null
}

export interface CompanyPnLResponse {
  year: number
  month_from: number
  month_to: number
  currency: string
  pnl: CompanyPnL
  by_project: ProjectPnLSummary[]
}

export interface ProjectPnL {
  gross_revenue: string
  direct_materials: string
  direct_labor: string
  subcontractors: string
  equipment: string
  other_direct: string
  total_direct_cost: string
  gross_margin: string
  gross_margin_pct: string | null
  budget_cost: string
  budget_variance: string
  forecast_final_cost: string | null
  forecast_final_margin: string | null
  forecast_margin_pct: string | null
}

export interface ProjectPnLResponse {
  project_id: number
  project_name: string
  currency: string
  date_from: string | null
  date_to: string | null
  pnl: ProjectPnL
  summary: Record<string, string>
}

export function getCompanyPnL(year: number, monthFrom = 1, monthTo = 12) {
  return apiFetch<CompanyPnLResponse>(
    `/api/ledger/pnl/company/?year=${year}&month_from=${monthFrom}&month_to=${monthTo}`
  )
}

export function getProjectPnL(projectId: number, dateFrom?: string, dateTo?: string) {
  const params = new URLSearchParams()
  if (dateFrom) params.set('date_from', dateFrom)
  if (dateTo)   params.set('date_to', dateTo)
  const qs = params.toString()
  return apiFetch<ProjectPnLResponse>(`/api/ledger/pnl/project/${projectId}/${qs ? `?${qs}` : ''}`)
}

export function getAccountingPeriods() {
  return apiFetch<PaginatedResponse<AccountingPeriod>>('/api/ledger/periods/?ordering=-year,-month')
}

// ─── AR Aging ─────────────────────────────────────────────────────────────────

export interface ARAgingInvoice {
  invoice_number: string
  title: string
  issue_date: string
  due_date: string | null
  amount_gtq: string
  days_overdue: number
  bucket: 'current' | '1_30' | '31_60' | '61_90' | 'over_90'
  project_name: string
}

export interface ARAgingClientRow {
  client_id: number
  client_name: string
  current: string
  '1_30': string
  '31_60': string
  '61_90': string
  over_90: string
  total: string
  invoices: ARAgingInvoice[]
}

export interface ARAgingTotals {
  current: string
  '1_30': string
  '31_60': string
  '61_90': string
  over_90: string
  total: string
}

export interface ARAgingResponse {
  as_of_date: string
  currency: string
  by_client: ARAgingClientRow[]
  totals: ARAgingTotals
}

export function getARaging(asOf?: string, projectId?: number) {
  const params = new URLSearchParams()
  if (asOf)      params.set('as_of', asOf)
  if (projectId) params.set('project_id', String(projectId))
  const qs = params.toString()
  return apiFetch<ARAgingResponse>(`/api/ledger/ar-aging/${qs ? `?${qs}` : ''}`)
}

// ─── Cash Flow Forecast ───────────────────────────────────────────────────────

export interface CashFlowPeriod {
  label: string
  date_from: string
  date_to: string
  inflows: {
    invoices: string
    milestones: string
    total: string
  }
  outflows: {
    supplier_invoices: string
    subcontractors: string
    total: string
  }
  net: string
  cumulative: string
}

export interface CashFlowUnscheduled {
  inflows: { invoices: string; milestones: string; total: string }
  outflows: { supplier_invoices: string; subcontractors: string; total: string }
}

export interface CashFlowForecastResponse {
  as_of_date: string
  currency: string
  months: number
  periods: CashFlowPeriod[]
  unscheduled: CashFlowUnscheduled
}

export function getCashFlowForecast(asOf?: string, months = 6, projectId?: number) {
  const params = new URLSearchParams()
  if (asOf)      params.set('as_of', asOf)
  params.set('months', String(months))
  if (projectId) params.set('project_id', String(projectId))
  return apiFetch<CashFlowForecastResponse>(`/api/ledger/cash-forecast/?${params.toString()}`)
}

// ─── Equipment Reconciliation ─────────────────────────────────────────────────

export interface EquipmentReconciliationRow {
  asset_id: number
  asset_number: string
  asset_name: string
  category: string
  internal_rate: string
  rate_last_reviewed: string | null
  depreciation_cost: string
  maintenance_cost: string
  accounting_cost: string
  analytical_cost: string
  hours_logged: string
  variance: string
  variance_pct: string | null
  rate_review_needed: boolean
}

export interface EquipmentReconciliationResponse {
  year: number
  month_from: number
  month_to: number
  date_from: string
  date_to: string
  currency: string
  assets: EquipmentReconciliationRow[]
  totals: {
    accounting_cost: string
    analytical_cost: string
    variance: string
    variance_pct: string | null
    hours_logged: string
  }
  summary: {
    assets_reviewed: number
    assets_alert: number
    variance_threshold_pct: string
  }
}

export function getEquipmentReconciliation(year: number, monthFrom = 1, monthTo = 12) {
  return apiFetch<EquipmentReconciliationResponse>(
    `/api/ledger/equipment-reconciliation/?year=${year}&month_from=${monthFrom}&month_to=${monthTo}`
  )
}
