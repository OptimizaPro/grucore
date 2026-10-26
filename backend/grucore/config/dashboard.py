from django.http import HttpRequest
from django.urls import reverse, NoReverseMatch

# Estructura espejo del sidebar: mismo orden, mismos grupos, mismas entradas.
# Cada item: model (app.Model), label, description, icon, key (admin URL key).
# model=None → el item no tiene un modelo contable (p.ej. auth.Group usa app_label distinto).

QUICK_ACCESS_GROUPS = [

    # ── 1. Proyectos ──────────────────────────────────────────────────────────
    {
        "title": "Proyectos",
        "items": [
            {"model": "projects.Project",           "label": "Proyectos",           "description": "Proyectos activos",            "icon": "construction",        "key": "projects_project"},
            {"model": "projects.Client",            "label": "Clientes",            "description": "Cartera de clientes",          "icon": "people",              "key": "projects_client"},
            {"model": "projects.Quote",             "label": "Cotizaciones",        "description": "Presupuestos y propuestas",    "icon": "request_quote",       "key": "projects_quote"},
            {"model": "projects.QuoteTemplate",     "label": "Plantillas",          "description": "Plantillas de cotización",     "icon": "description",         "key": "projects_quotetemplate"},
            {"model": "projects.ProjectBudget",     "label": "Presupuestos",        "description": "Presupuestos aprobados",       "icon": "calculate",           "key": "projects_projectbudget"},
        ],
    },

    # ── 2. Ejecución de obra ──────────────────────────────────────────────────
    {
        "title": "Ejecución de obra",
        "items": [
            {"model": "projects.Phase",             "label": "Fases",               "description": "Fases de proyecto",            "icon": "account_tree",        "key": "projects_phase"},
            {"model": "projects.Task",              "label": "Tareas",              "description": "Seguimiento de obra",          "icon": "task_alt",            "key": "projects_task"},
            {"model": "projects.ProgressUpdate",    "label": "Avance de obra",      "description": "Bitácora de avance",           "icon": "edit_note",           "key": "projects_progressupdate"},
            {"model": "projects.PaymentMilestone",  "label": "Hitos de pago",       "description": "Control de cobros",            "icon": "payments",            "key": "projects_paymentmilestone"},
            {"model": "projects.MilestoneApproval", "label": "Aprobaciones",        "description": "Aprobaciones de hitos",        "icon": "verified",            "key": "projects_milestoneapproval"},
            {"model": "documents.Document",         "label": "Documentos",          "description": "Archivos del proyecto",        "icon": "folder_open",         "key": "documents_document"},
            {"model": "documents.RFI",              "label": "RFIs",                "description": "Solicitudes de información",   "icon": "help_outline",        "key": "documents_rfi"},
            {"model": "documents.Submittal",        "label": "Submittals",          "description": "Envíos de documentos",         "icon": "assignment_turned_in","key": "documents_submittal"},
            {"model": "documents.PunchItem",        "label": "Punch items",         "description": "Lista de pendientes",          "icon": "checklist",           "key": "documents_punchitem"},
            {"model": "change_orders.ChangeOrder",  "label": "Órdenes de cambio",   "description": "Cambios de alcance",           "icon": "change_circle",       "key": "change_orders_changeorder"},
        ],
    },

    # ── 3. Aprovisionamiento ──────────────────────────────────────────────────
    {
        "title": "Aprovisionamiento",
        "items": [
            {"model": "suppliers.Supplier",                         "label": "Proveedores",          "description": "Red de proveedores",           "icon": "local_shipping",  "key": "suppliers_supplier"},
            {"model": "purchasing.PurchaseRequisition",             "label": "Requisiciones",        "description": "Solicitudes de compra",        "icon": "list_alt",        "key": "purchasing_purchaserequisition"},
            {"model": "purchasing.PurchaseOrder",                   "label": "Órdenes de compra",    "description": "OC emitidas a proveedores",    "icon": "shopping_cart",   "key": "purchasing_purchaseorder"},
            {"model": "purchasing.GoodsReceipt",                    "label": "Recepciones",          "description": "Entradas de mercancía",        "icon": "move_to_inbox",   "key": "purchasing_goodsreceipt"},
            {"model": "purchasing.SupplierInvoice",                 "label": "Fact. proveedor",      "description": "Facturas de proveedores",      "icon": "receipt",         "key": "purchasing_supplierinvoice"},
            {"model": "purchasing.SupplierPayment",                 "label": "Pagos a proveedor",    "description": "Pagos realizados",             "icon": "payments",        "key": "purchasing_supplierpayment"},
            {"model": "subcontractors.SubcontractorContract",       "label": "Subcontratos",         "description": "Contratos de subcontratistas", "icon": "handshake",       "key": "subcontractors_subcontractorcontract"},
            {"model": "subcontractors.SubcontractorCertification",  "label": "Certificaciones",      "description": "Avances certificados",         "icon": "verified",        "key": "subcontractors_subcontractorcertification"},
            {"model": "inventory.Product",                          "label": "Productos",            "description": "Catálogo de materiales",       "icon": "inventory_2",     "key": "inventory_product"},
            {"model": "inventory.InventoryCategory",                "label": "Categorías",           "description": "Categorías de inventario",     "icon": "category",        "key": "inventory_inventorycategory"},
            {"model": "inventory.StockMovement",                    "label": "Movimientos de stock", "description": "Entradas y salidas",           "icon": "swap_vert",       "key": "inventory_stockmovement"},
        ],
    },

    # ── 4. Activos & Equipos ──────────────────────────────────────────────────
    {
        "title": "Activos & Equipos",
        "items": [
            {"model": "assets.FixedAsset",              "label": "Activos",           "description": "Maquinaria y equipo",          "icon": "precision_manufacturing", "key": "assets_fixedasset"},
            {"model": "assets.AssetCategory",           "label": "Categorías",        "description": "Categorías de activos",        "icon": "category",                "key": "assets_assetcategory"},
            {"model": "assets.EquipmentUsageLog",       "label": "Uso de equipos",    "description": "Horas y proyectos asignados",  "icon": "timer",                   "key": "assets_equipmentusagelog"},
            {"model": "assets.MaintenanceRecord",       "label": "Mantenimiento",     "description": "Historial de mantenimiento",   "icon": "build",                   "key": "assets_maintenancerecord"},
            {"model": "assets.AssetDepreciationEntry",  "label": "Depreciación",      "description": "Entradas de depreciación",     "icon": "trending_down",           "key": "assets_assetdepreciationentry"},
        ],
    },

    # ── 5. Finanzas ───────────────────────────────────────────────────────────
    {
        "title": "Finanzas",
        "items": [
            {"model": "financials.Expense", "label": "Gastos",   "description": "Control de gastos",  "icon": "receipt_long", "key": "financials_expense"},
            {"model": "financials.Invoice", "label": "Facturas", "description": "Facturación emitida", "icon": "description",  "key": "financials_invoice"},
        ],
    },

    # ── 6. Contabilidad ───────────────────────────────────────────────────────
    {
        "title": "Contabilidad",
        "items": [
            {"model": "ledger.JournalEntry",       "label": "Asientos",            "description": "Libro diario",                 "icon": "menu_book",       "key": "ledger_journalentry"},
            {"model": "ledger.Account",            "label": "Catálogo de cuentas", "description": "Plan de cuentas",              "icon": "account_tree",    "key": "ledger_account"},
            {"model": "ledger.AccountingPeriod",   "label": "Períodos",            "description": "Períodos contables",           "icon": "calendar_month",  "key": "ledger_accountingperiod"},
            {"model": "core.CostCenter",           "label": "Centros de costo",    "description": "Centros de responsabilidad",   "icon": "workspaces",      "key": "core_costcenter"},
            {"model": "core.CostCode",             "label": "Códigos de costo",    "description": "Clasificación de costos",      "icon": "tag",             "key": "core_costcode"},
            {"model": "ledger.TaxRule",            "label": "Reglas fiscales",     "description": "IVA y retenciones",            "icon": "gavel",           "key": "ledger_taxrule"},
            {"model": "ledger.AccountMapping",     "label": "Mapeos de cuentas",   "description": "Reglas de contabilización",    "icon": "swap_horiz",      "key": "ledger_accountmapping"},
            {"model": "ledger.PeriodCloseLog",     "label": "Logs de cierre",      "description": "Cierres de período",           "icon": "lock_clock",      "key": "ledger_periodcloselog"},
        ],
    },

    # ── 7. Trabajadores ───────────────────────────────────────────────────────
    {
        "title": "Trabajadores",
        "items": [
            {"model": "workers.Worker",  "label": "Trabajadores",        "description": "Personal de obra",   "icon": "engineering", "key": "workers_worker"},
            {"model": "workers.WorkLog", "label": "Registros de trabajo", "description": "Jornadas y pagos",   "icon": "punch_clock", "key": "workers_worklog"},
        ],
    },

    # ── 8. CRM ────────────────────────────────────────────────────────────────
    {
        "title": "CRM",
        "items": [
            {"model": "crm.Lead",         "label": "Leads",       "description": "Pipeline comercial",    "icon": "contacts",    "key": "crm_lead"},
            {"model": "crm.Pipeline",     "label": "Pipelines",   "description": "Pipelines de venta",    "icon": "view_kanban", "key": "crm_pipeline"},
            {"model": "crm.LeadActivity", "label": "Actividades", "description": "Actividades de leads",  "icon": "timeline",    "key": "crm_leadactivity"},
        ],
    },

    # ── 9. Comunicaciones ─────────────────────────────────────────────────────
    {
        "title": "Comunicaciones",
        "items": [
            {"model": "communications.Notification",    "label": "Notificaciones", "description": "Alertas del sistema",   "icon": "notifications", "key": "communications_notification"},
            {"model": "communications.ProjectMessage",  "label": "Mensajes",       "description": "Mensajes de proyecto",  "icon": "forum",         "key": "communications_projectmessage"},
        ],
    },

    # ── 10. Contenido web ─────────────────────────────────────────────────────
    {
        "title": "Contenido web",
        "items": [
            {"model": "cms.Page",                       "label": "Páginas",    "description": "Páginas del sitio",        "icon": "article",        "key": "cms_page"},
            {"model": "cms.Section",                    "label": "Secciones",  "description": "Secciones de página",      "icon": "view_module",    "key": "cms_section"},
            {"model": "cms.Block",                      "label": "Bloques",    "description": "Bloques de contenido",     "icon": "text_fields",    "key": "cms_block"},
            {"model": "media_assets.MediaAsset",        "label": "Multimedia", "description": "Imágenes y archivos",      "icon": "photo_library",  "key": "media_assets_mediaasset"},
            {"model": "portfolio.PortfolioProject",     "label": "Portafolio", "description": "Proyectos publicados",     "icon": "collections",    "key": "portfolio_portfolioproject"},
        ],
    },

    # ── 11. Administración ────────────────────────────────────────────────────
    {
        "title": "Administración",
        "items": [
            {"model": "users.User",        "label": "Usuarios",   "description": "Cuentas y accesos",    "icon": "manage_accounts", "key": "users_user"},
            {"model": "auth.Group",        "label": "Grupos",     "description": "Roles y permisos",     "icon": "group",           "key": "auth_group"},
            {"model": "core.CompanySettings", "label": "Empresa", "description": "Identidad y textos",   "icon": "domain",          "key": "core_companysettings"},
        ],
    },
]


def dashboard_callback(request: HttpRequest, context: dict) -> dict:
    from django.apps import apps

    groups = []
    for group in QUICK_ACCESS_GROUPS:
        cards = []
        for m in group["items"]:
            try:
                Model = apps.get_model(m["model"])
                count = Model.objects.count()
            except Exception:
                count = None

            try:
                admin_url = reverse(f'admin:{m["key"]}_changelist')
            except NoReverseMatch:
                admin_url = "#"

            cards.append({
                "label":       m["label"],
                "description": m["description"],
                "icon":        m["icon"],
                "count":       count,
                "admin_url":   admin_url,
            })

        if cards:
            groups.append({"title": group["title"], "cards": cards})

    context["quick_access_groups"] = groups
    return context
