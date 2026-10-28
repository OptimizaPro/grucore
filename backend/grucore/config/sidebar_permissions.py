"""
Funciones de permiso para cada ítem del sidebar de Unfold.
Cada función recibe `request` y devuelve True/False.
Se referencian como string en UNFOLD["SIDEBAR"]["navigation"].
"""


def _has_any(request, *perms):
    return any(request.user.has_perm(p) for p in perms)


# ── Proyectos ─────────────────────────────────────────────────────────────────
def perm_projects(request):       return _has_any(request, 'projects.view_project')
def perm_clients(request):        return _has_any(request, 'projects.view_client')
def perm_quotes(request):         return _has_any(request, 'projects.view_quote')
def perm_quote_templates(request):return _has_any(request, 'projects.view_quotetemplate')
def perm_budgets(request):        return _has_any(request, 'projects.view_projectbudget')

# ── Ejecución de obra ─────────────────────────────────────────────────────────
def perm_phases(request):         return _has_any(request, 'projects.view_phase')
def perm_tasks(request):          return _has_any(request, 'projects.view_task')
def perm_progress(request):       return _has_any(request, 'projects.view_progressupdate')
def perm_milestones(request):     return _has_any(request, 'projects.view_paymentmilestone')
def perm_approvals(request):      return _has_any(request, 'projects.view_milestoneapproval')
def perm_documents(request):      return _has_any(request, 'documents.view_document')
def perm_rfis(request):           return _has_any(request, 'documents.view_rfi')
def perm_submittals(request):     return _has_any(request, 'documents.view_submittal')
def perm_punch(request):          return _has_any(request, 'documents.view_punchitem')
def perm_change_orders(request):  return _has_any(request, 'change_orders.view_changeorder')

# ── Aprovisionamiento ─────────────────────────────────────────────────────────
def perm_suppliers(request):      return _has_any(request, 'suppliers.view_supplier')
def perm_requisitions(request):   return _has_any(request, 'purchasing.view_purchaserequisition')
def perm_po(request):             return _has_any(request, 'purchasing.view_purchaseorder')
def perm_receipts(request):       return _has_any(request, 'purchasing.view_goodsreceipt')
def perm_sup_invoices(request):   return _has_any(request, 'purchasing.view_supplierinvoice')
def perm_sup_payments(request):   return _has_any(request, 'purchasing.view_supplierpayment')
def perm_subcontracts(request):   return _has_any(request, 'subcontractors.view_subcontractorcontract')
def perm_certifications(request): return _has_any(request, 'subcontractors.view_subcontractorcertification')
def perm_products(request):       return _has_any(request, 'inventory.view_product')
def perm_inv_categories(request): return _has_any(request, 'inventory.view_inventorycategory')
def perm_stock(request):          return _has_any(request, 'inventory.view_stockmovement')

# ── Activos & Equipos ─────────────────────────────────────────────────────────
def perm_assets(request):         return _has_any(request, 'assets.view_fixedasset')
def perm_asset_cats(request):     return _has_any(request, 'assets.view_assetcategory')
def perm_usage_logs(request):     return _has_any(request, 'assets.view_equipmentusagelog')
def perm_maintenance(request):    return _has_any(request, 'assets.view_maintenancerecord')
def perm_depreciation(request):   return _has_any(request, 'assets.view_assetdepreciationentry')

# ── Finanzas ──────────────────────────────────────────────────────────────────
def perm_expenses(request):       return _has_any(request, 'financials.view_expense')
def perm_invoices(request):       return _has_any(request, 'financials.view_invoice')

# ── Contabilidad ──────────────────────────────────────────────────────────────
def perm_journal(request):        return _has_any(request, 'ledger.view_journalentry')
def perm_accounts(request):       return _has_any(request, 'ledger.view_account')
def perm_periods(request):        return _has_any(request, 'ledger.view_accountingperiod')
def perm_cost_centers(request):   return _has_any(request, 'core.view_costcenter')
def perm_cost_codes(request):     return _has_any(request, 'core.view_costcode')
def perm_tax_rules(request):      return _has_any(request, 'ledger.view_taxrule')
def perm_mappings(request):       return _has_any(request, 'ledger.view_accountmapping')
def perm_close_logs(request):     return _has_any(request, 'ledger.view_periodcloselog')

# ── Trabajadores ──────────────────────────────────────────────────────────────
def perm_workers(request):        return _has_any(request, 'workers.view_worker')
def perm_worklogs(request):       return _has_any(request, 'workers.view_worklog')

# ── CRM ───────────────────────────────────────────────────────────────────────
def perm_leads(request):          return _has_any(request, 'crm.view_lead')
def perm_pipelines(request):      return _has_any(request, 'crm.view_pipeline')
def perm_activities(request):     return _has_any(request, 'crm.view_leadactivity')

# ── Comunicaciones ────────────────────────────────────────────────────────────
def perm_notifications(request):  return _has_any(request, 'communications.view_notification')
def perm_messages(request):       return _has_any(request, 'communications.view_projectmessage')

# ── Contenido web ─────────────────────────────────────────────────────────────
def perm_cms_pages(request):      return _has_any(request, 'cms.view_page')
def perm_cms_sections(request):   return _has_any(request, 'cms.view_section')
def perm_cms_blocks(request):     return _has_any(request, 'cms.view_block')
def perm_media(request):          return _has_any(request, 'media_assets.view_mediaasset')
def perm_portfolio(request):      return _has_any(request, 'portfolio.view_portfolioproject')

# ── Administración ────────────────────────────────────────────────────────────
def perm_users(request):          return _has_any(request, 'users.view_user')
def perm_groups(request):         return _has_any(request, 'auth.view_group')
def perm_celery_tasks(request):   return _has_any(request, 'django_celery_beat.view_periodictask')
def perm_celery_results(request): return _has_any(request, 'django_celery_results.view_taskresult')
def perm_company(request):        return _has_any(request, 'core.view_companysettings')
