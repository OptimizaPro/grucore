# Grucore ERP

Construction & remodeling ERP for Grucore — serves as the White Label template for OptimizaPro clients.

## Stack
- **Backend:** Django 5.x + Django REST Framework + Unfold admin (`unfold.admin.ModelAdmin`)
- **Frontend:** Next.js 15 + Tailwind CSS + shadcn/ui
- **DB:** PostgreSQL 16 (Docker dev) → Railway (prod)
- **Queue:** Celery + Redis
- **Auth:** NextAuth + JWT

## Brand
- **Primary color:** `#FF6B35`
- **Fonts:** Montserrat (headings) + Space Mono (numbers/mono) — loaded via Google Fonts in `admin_custom.css`
- **Theme:** Dark (`#0f172a` base, `#1e2a3a` cards)

## Project structure
```
Grucore/
├── backend/
│   ├── apps/              # Django apps
│   │   ├── projects/      # Projects, Phases, Tasks, Quotes, Milestones
│   │   ├── documents/     # Documents, RFIs, Submittals, PunchItems
│   │   ├── change_orders/ # Change orders
│   │   ├── financials/    # Expenses, Invoices
│   │   ├── communications/# Notifications, Messages
│   │   ├── inventory/     # Products, Categories, StockMovements
│   │   ├── crm/           # Leads, Pipelines, Activities
│   │   ├── workers/       # Workers, WorkLogs
│   │   ├── suppliers/     # Suppliers
│   │   ├── users/         # Custom user model
│   │   ├── core/          # CompanySettings (singleton), admin mixins
│   │   └── cms/           # Pages, Sections, Blocks
│   ├── grucore/           # Django settings package
│   │   ├── settings/
│   │   │   ├── base.py        # Main settings + Unfold config + sidebar
│   │   │   └── development.py # Dev overrides (WhiteNoise disabled)
│   │   └── config/
│   │       └── dashboard.py   # Admin dashboard cards (mirrors sidebar)
│   ├── static/css/admin_custom.css  # Admin theme overrides
│   └── templates/admin/index.html  # Dashboard template
├── frontend/              # Next.js app
├── docker-compose.yml
└── Makefile
```

## Admin patterns
- All ModelAdmins inherit `CRUDActionsMixin, ModelAdmin` from `unfold.admin`
- `CRUDActionsMixin` is in `apps/core/admin_mixins.py`
- Fieldsets use tuple-of-tuples format with `"classes": ["collapse"]` for secondary sections
- Inlines: `TabularInline` for lists, `StackedInline` for detail forms
- Edit link buttons use the `_PENCIL` SVG pattern in `projects/admin.py`
- `can_delete = False` on inlines where deletion is handled elsewhere

## Key models
- `core.CompanySettings` — singleton (pk=1), holds logo + brand name
- `projects.Project` → has Phases → has Tasks
- `projects.Quote` → has QuoteLineItems (linked to inventory.Product)
- `projects.PaymentMilestone` → has MilestoneApproval + MilestoneEvidence

## Dev commands
| Command | Action |
|---|---|
| `make up` | Start all services |
| `make migrate` | Make + apply migrations |
| `make superuser` | Create Django superuser |
| `make logs` | Tail all logs |
| `make collectstatic` | Sync static files to STATIC_ROOT |

## Static files (dev)
WhiteNoise is disabled in `development.py` via:
```python
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
MIDDLEWARE = [m for m in MIDDLEWARE if 'whitenoise' not in m.lower()]
```
CSS changes in `admin_custom.css` apply immediately after `docker compose restart backend`.

## White Label
Use `/wl-onboarding` skill to scaffold a new client instance.
