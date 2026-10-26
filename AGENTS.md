# AGENTS.md — Grucore ERP

> Context and instructions for AI coding agents (Claude Code, Codex, Cursor, etc.).
> Read this before making any changes to the codebase.

---

## What this project is

Grucore ERP is a full-stack construction management platform for Grucore (Guatemala). It is also the **White Label template** for OptimizaPro — new client instances are scaffolded from this repo using the `/wl-onboarding` skill.

---

## Repository layout

```
Grucore/
├── backend/                  Django 5 + DRF + Unfold admin
│   ├── apps/                 One directory per domain
│   │   ├── projects/         Core domain: Projects, Phases, Tasks, Quotes, Milestones
│   │   ├── documents/        Documents, RFIs, Submittals, PunchItems
│   │   ├── change_orders/    Change orders
│   │   ├── financials/       Expenses, Invoices
│   │   ├── communications/   Notifications, ProjectMessages
│   │   ├── inventory/        Products, InventoryCategories, StockMovements
│   │   ├── crm/              Leads, Pipelines, LeadActivities
│   │   ├── workers/          Workers, WorkLogs
│   │   ├── suppliers/        Suppliers
│   │   ├── users/            Custom user model (email-based auth)
│   │   ├── core/             CompanySettings singleton, CRUDActionsMixin
│   │   └── cms/              Pages, Sections, Blocks (public website CMS)
│   ├── grucore/              Django settings package
│   │   ├── settings/
│   │   │   ├── base.py       All settings + Unfold sidebar config
│   │   │   └── development.py  Dev overrides
│   │   ├── config/
│   │   │   └── dashboard.py  Admin dashboard card groups
│   │   ├── urls.py
│   │   ├── celery.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── static/css/admin_custom.css   Admin theme (dark, brand color #FF6B35)
│   ├── templates/admin/index.html    Dashboard template
│   └── requirements.txt
├── frontend/                 Next.js 15 + Tailwind CSS + shadcn/ui
│   └── src/
├── docker-compose.yml        Services: backend, frontend, postgres, redis, celery, celery-beat
├── Makefile                  Dev shortcuts
└── CLAUDE.md                 Claude Code project context
```

---

## Backend — rules and patterns

### Django admin (Unfold)

- **Base class:** always `unfold.admin.ModelAdmin` — never plain `django.contrib.admin.ModelAdmin`
- **Inlines:** `unfold.admin.TabularInline` (for lists) or `unfold.admin.StackedInline` (for detail forms)
- **CRUD actions:** every `ModelAdmin` must inherit `CRUDActionsMixin` from `apps.core.admin_mixins` — it adds view/edit/delete icon buttons to `list_display` and removes the default action dropdown
- **Fieldsets:** always use `fieldsets` — never rely on auto-generated form layout. Group related fields in tuples inside `"fields"`. Use `"classes": ["collapse"]` for secondary/audit sections
- **`list_display`:** keep to ≤7 columns to avoid horizontal scroll
- **`raw_id_fields`:** use for any FK that could have many rows (Client, User, Project, etc.)
- **`readonly_fields`:** always mark `created_at`, `updated_at`, `created_by` as readonly

```python
# Correct pattern for a new ModelAdmin
from unfold.admin import ModelAdmin, TabularInline
from apps.core.admin_mixins import CRUDActionsMixin

@admin.register(MyModel)
class MyModelAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('name', 'status', 'created_at')
    list_filter     = ('status',)
    search_fields   = ('name',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ("Main section title", {
            "fields": (
                ("name", "status"),
                "description",
            ),
        }),
        ("Metadatos", {
            "fields": (("created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )
```

### Unfold sidebar

Configured in `backend/grucore/settings/base.py` under `UNFOLD["SIDEBAR"]["navigation"]`. Each entry needs:
```python
{
    "title": _("Section title"),
    "icon": "material_symbol_name",
    "link": reverse_lazy("admin:app_model_changelist"),
    "permission": lambda request: request.user.has_perm("app.view_model"),
}
```
The sidebar must mirror the dashboard cards in `grucore/config/dashboard.py` — same order, same groups.

### Dashboard cards

`grucore/config/dashboard.py` — `QUICK_ACCESS_GROUPS` list of dicts:
```python
{
    "title": "Group name",
    "items": [
        {
            "model": "app.ModelName",   # for count query
            "label": "Display name",
            "description": "Short description",
            "icon": "material_symbol",
            "key": "app_modelname",     # admin URL key
        },
    ],
}
```
The `dashboard_callback` function in the same file builds the context. The template is `templates/admin/index.html`.

### FK widgets in inlines

Django wraps FK fields with `RelatedFieldWidgetWrapper` *after* `formfield_for_foreignkey` runs. To disable the `+`/`-` related buttons on inline FK fields, override `formfield_for_dbfield` (not `formfield_for_foreignkey`):

```python
def formfield_for_dbfield(self, db_field, request, **kwargs):
    formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
    if db_field.name == 'my_fk_field':
        if hasattr(formfield, 'widget') and hasattr(formfield.widget, 'can_add_related'):
            formfield.widget.can_add_related = False
            formfield.widget.can_delete_related = False
    return formfield
```

### Models — conventions

- Use `verbose_name` and `verbose_name_plural` on every model's `Meta`
- `CompanySettings` in `apps.core` is a singleton (always pk=1) — never instantiate it directly, use `CompanySettings.get()`
- Custom user model is `apps.users.User` — referenced as `AUTH_USER_MODEL = 'users.User'`
- All monetary amounts are stored in GTQ (Guatemalan Quetzal) with `_gtq` suffix

### Adding a new app

1. Create `apps/<appname>/` with `models.py`, `admin.py`, `views.py`, `serializers.py`, `urls.py`
2. Add `'apps.<appname>'` to `LOCAL_APPS` in `backend/grucore/settings/base.py`
3. Add admin entries to the Unfold sidebar in `base.py`
4. Add dashboard cards to `grucore/config/dashboard.py`
5. Run `make migrate`

---

## Frontend — rules and patterns

- **Framework:** Next.js 15 App Router
- **Styling:** Tailwind CSS + shadcn/ui components
- **API calls:** always via `NEXT_PUBLIC_API_URL` env var — never hardcode `localhost:8000`
- **Auth:** NextAuth with JWT strategy; backend issues tokens via `/api/token/`
- **i18n:** Spanish primary, English secondary — use `next-intl` if translations are needed

---

## Environment variables

All env vars live in `.env` at the repo root (next to `docker-compose.yml`). Backend reads them via `django-environ`. Frontend reads `NEXT_PUBLIC_*` vars at build time.

Required vars:
```
DJANGO_SECRET_KEY
DEBUG
DJANGO_ALLOWED_HOSTS
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_API_URL
```

---

## Running the project

```bash
make up          # Start all Docker services
make migrate     # Run makemigrations + migrate
make superuser   # Create Django admin superuser
make logs        # Tail logs
make collectstatic  # Sync static files (needed in prod, not in dev)
```

Services after `make up`:
- Django admin: http://localhost:8000/admin/
- DRF API: http://localhost:8000/api/
- Next.js: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Static files — important gotcha

In **development**, WhiteNoise is disabled in `development.py`:
```python
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'
MIDDLEWARE = [m for m in MIDDLEWARE if 'whitenoise' not in m.lower()]
```
This means CSS/JS changes in `backend/static/` are served directly and take effect after `docker compose restart backend` — **no `collectstatic` needed in dev**.

In **production**, WhiteNoise is active (via `base.py`) and `collectstatic` must run as part of the deploy command.

---

## Admin theme

- Dark theme: background `#0f172a`, card surfaces `#1e2a3a`
- Brand color: `#FF6B35` (Grucore orange) — used for hover states, active elements, fieldset titles
- Fonts: Montserrat (headings) + Space Mono (numbers) — loaded via `@import` in `admin_custom.css`
- Custom CSS: `backend/static/css/admin_custom.css`
- Material Symbols Outlined icon font — loaded in Unfold base template

Do **not** add inline `<style>` blocks to admin templates unless absolutely necessary — put all CSS in `admin_custom.css`.

---

## White Label

This repo is the template for new client instances. To scaffold a new client:
```
/wl-onboarding "ClientName | slug | #HEXCOLOR | domain.com | sector"
```
The skill is at `~/.claude/commands/wl-onboarding.md`. It renames the settings module, swaps the brand color, generates `.env` and `CLAUDE.md` for the new instance.

---

## What to avoid

- Do not use `django.contrib.admin.ModelAdmin` — always use Unfold's version
- Do not add more than 7 columns to `list_display` — causes horizontal scroll
- Do not override `formfield_for_foreignkey` to disable FK widget buttons — use `formfield_for_dbfield` instead (the wrapper is applied after `for_foreignkey` returns)
- Do not run `collectstatic` in development — it populates `STATIC_ROOT` and WhiteNoise will serve stale files on restart
- Do not hardcode `grucore` strings in new apps — use `settings.SITE_TITLE` or `CompanySettings.get().name` so White Label renaming works cleanly
- Do not create a `CompanySettings` row manually — use the singleton pattern via `CompanySettings.get()`
