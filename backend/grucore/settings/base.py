from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    DJANGO_ALLOWED_HOSTS=(list, ['localhost', '127.0.0.1']),
)

environ.Env.read_env(BASE_DIR.parent / '.env')

SECRET_KEY = env('DJANGO_SECRET_KEY')
DEBUG = env('DEBUG')
ALLOWED_HOSTS = env('DJANGO_ALLOWED_HOSTS')

# ─── Apps ─────────────────────────────────────────────────────────────────────
DJANGO_APPS = [
    # unfold DEBE ir antes de django.contrib.admin
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'unfold.contrib.inlines',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'django_celery_beat',
    'django_celery_results',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.core',
    'apps.users',
    'apps.projects',
    'apps.documents',
    'apps.change_orders',
    'apps.financials',
    'apps.ledger',
    'apps.communications',
    'apps.inventory',
    'apps.suppliers',
    'apps.cms',
    'apps.workers',
    'apps.crm',
    'apps.purchasing',
    'apps.assets',
    'apps.subcontractors',
    'apps.media_assets',
    'apps.portfolio',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ─── Middleware ───────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'grucore.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'grucore.wsgi.application'
ASGI_APPLICATION = 'grucore.asgi.application'

# ─── Base de datos ────────────────────────────────────────────────────────────
DATABASES = {
    'default': env.db('DATABASE_URL'),
}
DATABASES['default']['CONN_MAX_AGE'] = 60
DATABASES['default']['OPTIONS'] = {'connect_timeout': 10}

# ─── Modelo de usuario personalizado ─────────────────────────────────────────
AUTH_USER_MODEL = 'users.User'

# ─── Contraseñas ──────────────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ─── Internacionalización ─────────────────────────────────────────────────────
LANGUAGE_CODE = 'es'
TIME_ZONE = 'America/Guatemala'
USE_I18N = True
USE_TZ = True

# ─── Archivos estáticos ───────────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ─── Storage de archivos (Supabase S3-compatible) ────────────────────────────
USE_S3 = env.bool('USE_S3', default=bool(env('SUPABASE_ACCESS_KEY_ID', default='')))

if USE_S3:
    _S3_BUCKET = env('SUPABASE_S3_BUCKET', default='grucore-media')
    STORAGES = {
        'default': {
            'BACKEND': 'storages.backends.s3boto3.S3Boto3Storage',
            'OPTIONS': {
                'endpoint_url': env('SUPABASE_S3_ENDPOINT'),
                'bucket_name':  _S3_BUCKET,
                'access_key':   env('SUPABASE_ACCESS_KEY_ID'),
                'secret_key':   env('SUPABASE_SECRET_ACCESS_KEY'),
                'region_name':  env('SUPABASE_S3_REGION', default='us-east-1'),
                'default_acl':      'public-read',
                'file_overwrite':   False,
                'querystring_auth': False,
                'custom_domain':    f'rvprwttonwjolnwwrshp.supabase.co/storage/v1/object/public/{_S3_BUCKET}',
            },
        },
        'staticfiles': {
            'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
        },
    }
    MEDIA_URL = f"https://rvprwttonwjolnwwrshp.supabase.co/storage/v1/object/public/{_S3_BUCKET}/"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ─── Django REST Framework ────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# ─── API Docs (drf-spectacular) ───────────────────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'Grucore ERP API',
    'DESCRIPTION': (
        'API REST de Grucore ERP — gestión de proyectos de construcción, '
        'cotizaciones, hitos de pago, documentos, CRM, inventario y más.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'SWAGGER_UI_SETTINGS': {
        'persistAuthorization': True,
        'displayRequestDuration': True,
        'filter': True,
    },
    'COMPONENT_SPLIT_REQUEST': True,
    'SORT_OPERATIONS': False,
    'TAGS': [
        {'name': 'auth',            'description': 'Autenticación JWT'},
        {'name': 'projects',        'description': 'Proyectos, Fases, Tareas'},
        {'name': 'quotes',          'description': 'Cotizaciones'},
        {'name': 'milestones',      'description': 'Hitos de pago'},
        {'name': 'documents',       'description': 'Documentos, RFIs, Submittals, Punch items'},
        {'name': 'change-orders',   'description': 'Órdenes de cambio'},
        {'name': 'financials',      'description': 'Gastos y Facturas'},
        {'name': 'communications',  'description': 'Notificaciones y Mensajes'},
        {'name': 'inventory',       'description': 'Productos y Movimientos de stock'},
        {'name': 'crm',             'description': 'Leads, Pipelines y Actividades'},
        {'name': 'workers',         'description': 'Trabajadores y Registros de jornada'},
        {'name': 'suppliers',       'description': 'Proveedores'},
        {'name': 'cms',             'description': 'Páginas, Secciones y Bloques (CMS público)'},
        {'name': 'users',           'description': 'Usuarios y perfiles'},
        {'name': 'core',            'description': 'Configuración de empresa'},
    ],
}

# ─── JWT ──────────────────────────────────────────────────────────────────────
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ─── Celery ───────────────────────────────────────────────────────────────────
CELERY_BROKER_URL = env('REDIS_URL', default='redis://redis:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'django-cache'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_ROUTES = {
    'apps.*.tasks.*': {'queue': 'default'},
}

# ─── Moneda ───────────────────────────────────────────────────────────────────
DEFAULT_CURRENCY = 'GTQ'
SUPPORTED_CURRENCIES = ['GTQ', 'USD']
DEFAULT_EXCHANGE_RATE = 7.75  # GTQ por 1 USD — actualizable desde Settings

# ─── Django Unfold Admin ──────────────────────────────────────────────────────

from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _

UNFOLD = {
    # ── Estilos personalizados ────────────────────────────────────────────────
    "STYLES": [
        "/static/css/admin_custom.css",
    ],
    "SCRIPTS": ["/static/js/admin_inline_delete.js"],
    "THEME": "dark",

    # ── Branding ─────────────────────────────────────────────────────────────
    "SITE_TITLE":   "Grucore ERP",
    "SITE_HEADER":  "Grucore",
    "SITE_URL":     "/",
    "SITE_SYMBOL":  "construction",
    "SITE_LOGO": {
        "light": "/static/images/Grucore.png",
        "dark":  "/static/images/Grucore-Negativo.png",
    },
    "SITE_FAVICONS": [{
        "rel":  "icon",
        "type": "image/png",
        "href": "/static/images/favicon.ico",
    }],

    # ── Colores — Naranja Grucore #FF6B35 ─────────────────────────────────────
    "COLORS": {
        "font": {
            "subtle-light":    "100 116 139",   # slate-500
            "subtle-dark":     "148 163 184",   # slate-400
            "default-light":   "15 23 42",      # slate-900
            "default-dark":    "241 245 249",   # slate-100
            "important-light": "2 6 23",        # slate-950
            "important-dark":  "248 250 252",   # slate-50
        },
        "base": {
            "50":  "248 250 252",
            "100": "241 245 249",
            "200": "226 232 240",
            "300": "203 213 225",
            "400": "148 163 184",
            "500": "100 116 139",
            "600": "71 85 105",
            "700": "51 65 85",
            "800": "30 41 59",
            "900": "15 23 42",
            "950": "2 6 23",
        },
        "primary": {
            "50":  "255 245 240",
            "100": "255 231 220",
            "200": "255 205 185",
            "300": "255 167 130",
            "400": "255 120 75",
            "500": "255 107 53",    # #FF6B35 — color base Grucore
            "600": "230 82 28",
            "700": "190 60 15",
            "800": "150 45 10",
            "900": "105 30 5",
            "950": "60 15 2",
        },
    },

    "SHOW_HISTORY":      True,
    "SHOW_VIEW_ON_SITE": False,
    "SHOW_BACK_BUTTON":  True,
    "SITE_SUBHEADER":    "Construcción & Remodelación",
    "ENVIRONMENT":       "grucore.config.unfold.environment_callback",
    "DASHBOARD_CALLBACK": "grucore.config.dashboard.dashboard_callback",
    "COMMAND": {
        "search_models": True,
    },

    # ── Sidebar ───────────────────────────────────────────────────────────────
    "SIDEBAR": {
        "show_search":           True,
        "show_all_applications": False,
        "navigation": [

            # ── 1. Proyectos ──────────────────────────────────────────────────
            {
                "title": _("Proyectos"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Proyectos"),           "icon": "construction",    "link": reverse_lazy("admin:projects_project_changelist"),                          "permission": "grucore.config.sidebar_permissions.perm_projects"},
                    {"title": _("Clientes"),            "icon": "people",          "link": reverse_lazy("admin:projects_client_changelist"),                           "permission": "grucore.config.sidebar_permissions.perm_clients"},
                    {"title": _("Cotizaciones"),        "icon": "request_quote",   "link": reverse_lazy("admin:projects_quote_changelist"),                            "permission": "grucore.config.sidebar_permissions.perm_quotes"},
                    {"title": _("Plantillas de cot."),  "icon": "description",     "link": reverse_lazy("admin:projects_quotetemplate_changelist"),                    "permission": "grucore.config.sidebar_permissions.perm_quote_templates"},
                    {"title": _("Presupuestos"),        "icon": "calculate",       "link": reverse_lazy("admin:projects_projectbudget_changelist"),                    "permission": "grucore.config.sidebar_permissions.perm_budgets"},
                ],
            },

            # ── 2. Ejecución de obra ──────────────────────────────────────────
            {
                "title": _("Ejecución de obra"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Fases"),               "icon": "account_tree",        "link": reverse_lazy("admin:projects_phase_changelist"),                        "permission": "grucore.config.sidebar_permissions.perm_phases"},
                    {"title": _("Tareas"),              "icon": "task_alt",            "link": reverse_lazy("admin:projects_task_changelist"),                         "permission": "grucore.config.sidebar_permissions.perm_tasks"},
                    {"title": _("Avance de obra"),      "icon": "edit_note",           "link": reverse_lazy("admin:projects_progressupdate_changelist"),               "permission": "grucore.config.sidebar_permissions.perm_progress"},
                    {"title": _("Hitos de pago"),       "icon": "payments",            "link": reverse_lazy("admin:projects_paymentmilestone_changelist"),             "permission": "grucore.config.sidebar_permissions.perm_milestones"},
                    {"title": _("Aprobaciones"),        "icon": "verified",            "link": reverse_lazy("admin:projects_milestoneapproval_changelist"),            "permission": "grucore.config.sidebar_permissions.perm_approvals"},
                    {"title": _("Documentos"),          "icon": "folder_open",         "link": reverse_lazy("admin:documents_document_changelist"),                    "permission": "grucore.config.sidebar_permissions.perm_documents"},
                    {"title": _("RFIs"),                "icon": "help_outline",        "link": reverse_lazy("admin:documents_rfi_changelist"),                        "permission": "grucore.config.sidebar_permissions.perm_rfis"},
                    {"title": _("Submittals"),          "icon": "assignment_turned_in","link": reverse_lazy("admin:documents_submittal_changelist"),                   "permission": "grucore.config.sidebar_permissions.perm_submittals"},
                    {"title": _("Punch items"),         "icon": "checklist",           "link": reverse_lazy("admin:documents_punchitem_changelist"),                   "permission": "grucore.config.sidebar_permissions.perm_punch"},
                    {"title": _("Órdenes de cambio"),   "icon": "change_circle",       "link": reverse_lazy("admin:change_orders_changeorder_changelist"),             "permission": "grucore.config.sidebar_permissions.perm_change_orders"},
                ],
            },

            # ── 3. Aprovisionamiento ──────────────────────────────────────────
            {
                "title": _("Aprovisionamiento"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Proveedores"),         "icon": "local_shipping",  "link": reverse_lazy("admin:suppliers_supplier_changelist"),                        "permission": "grucore.config.sidebar_permissions.perm_suppliers"},
                    {"title": _("Requisiciones"),       "icon": "list_alt",        "link": reverse_lazy("admin:purchasing_purchaserequisition_changelist"),            "permission": "grucore.config.sidebar_permissions.perm_requisitions"},
                    {"title": _("Órdenes de compra"),   "icon": "shopping_cart",   "link": reverse_lazy("admin:purchasing_purchaseorder_changelist"),                  "permission": "grucore.config.sidebar_permissions.perm_po"},
                    {"title": _("Recepciones"),         "icon": "move_to_inbox",   "link": reverse_lazy("admin:purchasing_goodsreceipt_changelist"),                   "permission": "grucore.config.sidebar_permissions.perm_receipts"},
                    {"title": _("Fact. proveedor"),     "icon": "receipt",         "link": reverse_lazy("admin:purchasing_supplierinvoice_changelist"),                "permission": "grucore.config.sidebar_permissions.perm_sup_invoices"},
                    {"title": _("Pagos a proveedor"),   "icon": "payments",        "link": reverse_lazy("admin:purchasing_supplierpayment_changelist"),                "permission": "grucore.config.sidebar_permissions.perm_sup_payments"},
                    {"title": _("Subcontratos"),        "icon": "handshake",       "link": reverse_lazy("admin:subcontractors_subcontractorcontract_changelist"),      "permission": "grucore.config.sidebar_permissions.perm_subcontracts"},
                    {"title": _("Certificaciones"),     "icon": "verified",        "link": reverse_lazy("admin:subcontractors_subcontractorcertification_changelist"), "permission": "grucore.config.sidebar_permissions.perm_certifications"},
                    {"title": _("Productos"),           "icon": "inventory_2",     "link": reverse_lazy("admin:inventory_product_changelist"),                        "permission": "grucore.config.sidebar_permissions.perm_products"},
                    {"title": _("Categorías"),          "icon": "category",        "link": reverse_lazy("admin:inventory_inventorycategory_changelist"),               "permission": "grucore.config.sidebar_permissions.perm_inv_categories"},
                    {"title": _("Movimientos de stock"),"icon": "swap_vert",       "link": reverse_lazy("admin:inventory_stockmovement_changelist"),                   "permission": "grucore.config.sidebar_permissions.perm_stock"},
                ],
            },

            # ── 4. Activos & Equipos ──────────────────────────────────────────
            {
                "title": _("Activos & Equipos"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Activos"),             "icon": "precision_manufacturing", "link": reverse_lazy("admin:assets_fixedasset_changelist"),                 "permission": "grucore.config.sidebar_permissions.perm_assets"},
                    {"title": _("Categorías"),          "icon": "category",                "link": reverse_lazy("admin:assets_assetcategory_changelist"),              "permission": "grucore.config.sidebar_permissions.perm_asset_cats"},
                    {"title": _("Uso de equipos"),      "icon": "timer",                   "link": reverse_lazy("admin:assets_equipmentusagelog_changelist"),          "permission": "grucore.config.sidebar_permissions.perm_usage_logs"},
                    {"title": _("Mantenimiento"),       "icon": "build",                   "link": reverse_lazy("admin:assets_maintenancerecord_changelist"),          "permission": "grucore.config.sidebar_permissions.perm_maintenance"},
                    {"title": _("Depreciación"),        "icon": "trending_down",           "link": reverse_lazy("admin:assets_assetdepreciationentry_changelist"),     "permission": "grucore.config.sidebar_permissions.perm_depreciation"},
                ],
            },

            # ── 5. Finanzas ───────────────────────────────────────────────────
            {
                "title": _("Finanzas"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Gastos"),              "icon": "receipt_long",    "link": reverse_lazy("admin:financials_expense_changelist"),                        "permission": "grucore.config.sidebar_permissions.perm_expenses"},
                    {"title": _("Facturas"),            "icon": "description",     "link": reverse_lazy("admin:financials_invoice_changelist"),                       "permission": "grucore.config.sidebar_permissions.perm_invoices"},
                ],
            },

            # ── 6. Contabilidad ───────────────────────────────────────────────
            {
                "title": _("Contabilidad"),
                "separator": False,
                "collapsible": True,
                "items": [
                    {"title": _("Asientos"),            "icon": "menu_book",       "link": reverse_lazy("admin:ledger_journalentry_changelist"),                      "permission": "grucore.config.sidebar_permissions.perm_journal"},
                    {"title": _("Catálogo de cuentas"), "icon": "account_tree",    "link": reverse_lazy("admin:ledger_account_changelist"),                           "permission": "grucore.config.sidebar_permissions.perm_accounts"},
                    {"title": _("Períodos"),            "icon": "calendar_month",  "link": reverse_lazy("admin:ledger_accountingperiod_changelist"),                  "permission": "grucore.config.sidebar_permissions.perm_periods"},
                    {"title": _("Centros de costo"),    "icon": "workspaces",      "link": reverse_lazy("admin:core_costcenter_changelist"),                          "permission": "grucore.config.sidebar_permissions.perm_cost_centers"},
                    {"title": _("Códigos de costo"),    "icon": "tag",             "link": reverse_lazy("admin:core_costcode_changelist"),                            "permission": "grucore.config.sidebar_permissions.perm_cost_codes"},
                    {"title": _("Reglas fiscales"),     "icon": "gavel",           "link": reverse_lazy("admin:ledger_taxrule_changelist"),                           "permission": "grucore.config.sidebar_permissions.perm_tax_rules"},
                    {"title": _("Mapeos de cuentas"),   "icon": "swap_horiz",      "link": reverse_lazy("admin:ledger_accountmapping_changelist"),                    "permission": "grucore.config.sidebar_permissions.perm_mappings"},
                    {"title": _("Logs de cierre"),      "icon": "lock_clock",      "link": reverse_lazy("admin:ledger_periodcloselog_changelist"),                    "permission": "grucore.config.sidebar_permissions.perm_close_logs"},
                ],
            },

            # ── 7. Trabajadores ───────────────────────────────────────────────
            {
                "title": _("Trabajadores"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Trabajadores"),        "icon": "engineering",     "link": reverse_lazy("admin:workers_worker_changelist"),                           "permission": "grucore.config.sidebar_permissions.perm_workers"},
                    {"title": _("Registros de trabajo"),"icon": "punch_clock",     "link": reverse_lazy("admin:workers_worklog_changelist"),                          "permission": "grucore.config.sidebar_permissions.perm_worklogs"},
                ],
            },

            # ── 8. CRM ────────────────────────────────────────────────────────
            {
                "title": _("CRM"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Leads"),               "icon": "contacts",        "link": reverse_lazy("admin:crm_lead_changelist"),                                 "permission": "grucore.config.sidebar_permissions.perm_leads"},
                    {"title": _("Pipelines"),           "icon": "view_kanban",     "link": reverse_lazy("admin:crm_pipeline_changelist"),                             "permission": "grucore.config.sidebar_permissions.perm_pipelines"},
                    {"title": _("Actividades"),         "icon": "timeline",        "link": reverse_lazy("admin:crm_leadactivity_changelist"),                         "permission": "grucore.config.sidebar_permissions.perm_activities"},
                ],
            },

            # ── 9. Comunicaciones ─────────────────────────────────────────────
            {
                "title": _("Comunicaciones"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Notificaciones"),      "icon": "notifications",   "link": reverse_lazy("admin:communications_notification_changelist"),              "permission": "grucore.config.sidebar_permissions.perm_notifications"},
                    {"title": _("Mensajes"),            "icon": "forum",           "link": reverse_lazy("admin:communications_projectmessage_changelist"),            "permission": "grucore.config.sidebar_permissions.perm_messages"},
                ],
            },

            # ── 10. Contenido web ─────────────────────────────────────────────
            {
                "title": _("Contenido web"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Páginas"),             "icon": "article",         "link": reverse_lazy("admin:cms_page_changelist"),                                 "permission": "grucore.config.sidebar_permissions.perm_cms_pages"},
                    {"title": _("Secciones"),           "icon": "view_module",     "link": reverse_lazy("admin:cms_section_changelist"),                              "permission": "grucore.config.sidebar_permissions.perm_cms_sections"},
                    {"title": _("Bloques"),             "icon": "text_fields",     "link": reverse_lazy("admin:cms_block_changelist"),                                "permission": "grucore.config.sidebar_permissions.perm_cms_blocks"},
                    {"title": _("Multimedia"),          "icon": "photo_library",   "link": reverse_lazy("admin:media_assets_mediaasset_changelist"),                  "permission": "grucore.config.sidebar_permissions.perm_media"},
                    {"title": _("Portafolio"),          "icon": "collections",     "link": reverse_lazy("admin:portfolio_portfolioproject_changelist"),                "permission": "grucore.config.sidebar_permissions.perm_portfolio"},
                ],
            },

            # ── 11. Administración ────────────────────────────────────────────
            {
                "title": _("Administración"),
                "separator": True,
                "collapsible": True,
                "items": [
                    {"title": _("Usuarios"),            "icon": "manage_accounts", "link": reverse_lazy("admin:users_user_changelist"),                               "permission": "grucore.config.sidebar_permissions.perm_users"},
                    {"title": _("Grupos"),              "icon": "group",           "link": reverse_lazy("admin:auth_group_changelist"),                               "permission": "grucore.config.sidebar_permissions.perm_groups"},
                    {"title": _("Tareas periódicas"),   "icon": "schedule",        "link": reverse_lazy("admin:django_celery_beat_periodictask_changelist"),          "permission": "grucore.config.sidebar_permissions.perm_celery_tasks"},
                    {"title": _("Resultados Celery"),   "icon": "assignment",      "link": reverse_lazy("admin:django_celery_results_taskresult_changelist"),         "permission": "grucore.config.sidebar_permissions.perm_celery_results"},
                    {"title": _("Empresa"),             "icon": "domain",          "link": reverse_lazy("admin:core_companysettings_changelist"),                     "permission": "grucore.config.sidebar_permissions.perm_company"},
                ],
            },
        ],
    },
}

# ─── Auth redirects ──────────────────────────────────────────────────────────
LOGIN_REDIRECT_URL  = '/djamasy/'
LOGOUT_REDIRECT_URL = '/djamasy/login/'
LOGIN_URL           = '/djamasy/login/'

# ─── Email (Brevo SMTP) ───────────────────────────────────────────────────────
EMAIL_BACKEND         = env('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST            = env('EMAIL_HOST',    default='smtp-relay.brevo.com')
EMAIL_PORT            = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS         = True
EMAIL_HOST_USER       = env('EMAIL_HOST_USER',     default='')
EMAIL_HOST_PASSWORD   = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL    = env('DEFAULT_FROM_EMAIL',  default='noreply@grucore.com')
