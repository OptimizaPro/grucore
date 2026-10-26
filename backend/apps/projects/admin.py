from django import forms
from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import (
    Client, Project, Phase, Task,
    ProgressUpdate, ProgressPhoto,
    PaymentMilestone, MilestoneEvidence, MilestoneApproval,
    Quote, QuoteLineItem, QuoteTemplate, QuoteTemplateLineItem,
    ProjectContact, ProjectNote,
    ProjectBudget, ProjectBudgetLine,
)

# ─── Inline forms (control de anchos por columna) ─────────────────────────────

_base = (
    'background-color:rgb(15 23 42);'
    'color:rgb(241 245 249);'
    'border:1px solid rgb(51 65 85);'
    'border-radius:0.375rem;'
    'padding:0.35rem 0.6rem;'
    'font-size:0.8125rem;'
    'outline:none;'
)
_text  = {'style': _base + 'min-width:200px;width:100%;'}
_date  = {'style': _base + 'width:130px;', 'type': 'date'}
_num_s = {'style': _base + 'width:60px;'}
_num_m = {'style': _base + 'width:120px;'}


class PhaseInlineForm(forms.ModelForm):
    class Meta:
        model  = Phase
        fields = ('name', 'order', 'status', 'start_date', 'end_date', 'budget_allocated_gtq')
        widgets = {
            'name':                 forms.TextInput(attrs=_text),
            'order':                forms.NumberInput(attrs=_num_s),
            'start_date':           forms.DateInput(attrs=_date),
            'end_date':             forms.DateInput(attrs=_date),
            'budget_allocated_gtq': forms.NumberInput(attrs=_num_m),
        }


class MilestoneInlineForm(forms.ModelForm):
    class Meta:
        model  = PaymentMilestone
        fields = ('name', 'order', 'amount_gtq', 'progress_required_pct', 'status', 'due_date')
        labels = {
            'progress_required_pct': mark_safe('% avance<br>para desbloquear'),
        }
        widgets = {
            'name':                  forms.TextInput(attrs=_text),
            'order':                 forms.NumberInput(attrs=_num_s),
            'amount_gtq':            forms.NumberInput(attrs=_num_m),
            'progress_required_pct': forms.NumberInput(attrs=_num_s),
            'due_date':              forms.DateInput(attrs=_date),
        }


# ─── Clientes ─────────────────────────────────────────────────────────────────

@admin.register(Client)
class ClientAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'email', 'phone', 'company', 'portal_user', 'created_at')
    search_fields = ('name', 'email', 'company', 'nit')
    raw_id_fields = ('portal_user',)

    fieldsets = (
        ("Datos del cliente", {
            "fields": (
                ("name", "company"),
                ("email", "phone"),
                "nit",
                "address",
            ),
        }),
        ("Portal & Preferencias", {
            "fields": (
                "portal_user",
                ("preferred_language", "preferred_currency"),
            ),
        }),
    )


# ─── Proyecto — Inlines ───────────────────────────────────────────────────────

_PENCIL = (
    '<a href="{url}" title="Modificar" style="'
    'display:inline-flex;align-items:center;justify-content:center;'
    'background:rgb(15 23 42);'
    'border:1px solid rgb(51 65 85);'
    'border-radius:0.375rem;'
    'padding:0.35rem 0.5rem;'
    'color:#64748b;transition:color 0.15s,border-color 0.15s;" '
    'onmouseover="this.style.color=\'#FF6B35\';this.style.borderColor=\'#FF6B35\'" '
    'onmouseout="this.style.color=\'#64748b\';this.style.borderColor=\'rgb(51 65 85)\'">'
    '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" '
    'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>'
    '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'
    '</svg></a>'
)


class PhaseInline(TabularInline):
    model            = Phase
    form             = PhaseInlineForm
    extra            = 1
    fields           = ('name', 'order', 'status', 'start_date', 'end_date', 'budget_allocated_gtq', 'edit_link')
    readonly_fields  = ('edit_link',)
    show_change_link = False

    @admin.display(description='')
    def edit_link(self, obj):
        if obj.pk:
            url = reverse('admin:projects_phase_change', args=[obj.pk])
            return format_html(_PENCIL, url=url)
        return ''


class MilestoneInline(TabularInline):
    model            = PaymentMilestone
    form             = MilestoneInlineForm
    extra            = 0
    fields           = ('name', 'order', 'amount_gtq', 'progress_required_pct', 'status', 'due_date', 'edit_link')
    readonly_fields  = ('edit_link',)
    show_change_link = False

    @admin.display(description='')
    def edit_link(self, obj):
        if obj.pk:
            url = reverse('admin:projects_paymentmilestone_change', args=[obj.pk])
            return format_html(_PENCIL, url=url)
        return ''


class ProjectContactInline(TabularInline):
    model   = ProjectContact
    extra   = 0
    fields  = ('name', 'role', 'company', 'email', 'phone', 'order')


class ProjectNoteInline(StackedInline):
    model           = ProjectNote
    extra           = 0
    fields          = ('body', 'author', 'created_at')
    readonly_fields = ('created_at',)
    ordering        = ('-created_at',)


# ─── Proyecto ─────────────────────────────────────────────────────────────────

@admin.register(Project)
class ProjectAdmin(CRUDActionsMixin, ModelAdmin):
    list_display        = ('name', 'client', 'project_type', 'status', 'project_manager', 'start_date', 'is_public_portfolio')
    list_filter         = ('project_type', 'status', 'is_public_portfolio')
    search_fields       = ('name', 'client__name', 'address')
    prepopulated_fields = {'slug': ('name',)}
    inlines             = [PhaseInline, MilestoneInline, ProjectContactInline, ProjectNoteInline]
    raw_id_fields       = ('client', 'project_manager', 'created_by')
    readonly_fields     = ('created_by', 'created_at', 'updated_at')

    fieldsets = (
        ("Información general", {
            "fields": (
                ("name", "status"),
                ("client", "project_manager"),
                ("project_type", "base_currency"),
                "description",
            ),
        }),
        ("Ubicación", {
            "fields": (
                "address",
                ("city", "department"),
            ),
        }),
        ("Fechas", {
            "fields": (
                ("start_date", "estimated_end", "actual_end"),
            ),
        }),
        ("Presupuesto", {
            "fields": (
                ("total_budget_gtq", "exchange_rate_snapshot"),
            ),
        }),
        ("Portafolio público", {
            "fields": (
                "is_public_portfolio",
                "cover_photo_url",
            ),
        }),
        ("SEO & Multilenguaje", {
            "fields": (
                "slug",
                ("name_en", "seo_description"),
                "description_en",
            ),
            "classes": ["collapse"],
        }),
        ("Metadatos", {
            "fields": (
                ("created_by", "created_at", "updated_at"),
            ),
            "classes": ["collapse"],
        }),
    )


# ─── Fases & Tareas ───────────────────────────────────────────────────────────

class TaskInline(TabularInline):
    model  = Task
    extra  = 1
    fields = ('title', 'status', 'priority', 'assigned_to', 'due_date')


@admin.register(Phase)
class PhaseAdmin(CRUDActionsMixin, ModelAdmin):
    list_display = ('name', 'project', 'order', 'status', 'start_date', 'end_date', 'budget_allocated_gtq')
    list_filter  = ('status',)
    search_fields = ('name', 'project__name')
    inlines      = [TaskInline]

    fieldsets = (
        (None, {
            "fields": (
                ("name", "order", "status"),
                "project",
                ("start_date", "end_date"),
                "budget_allocated_gtq",
            ),
        }),
    )


@admin.register(Task)
class TaskAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('title', 'phase', 'status', 'priority', 'assigned_to', 'due_date')
    list_filter   = ('status', 'priority')
    search_fields = ('title', 'description')

    fieldsets = (
        (None, {
            "fields": (
                "title",
                ("phase", "assigned_to"),
                ("status", "priority"),
                ("start_date", "due_date"),
                "description",
                "notes",
            ),
        }),
    )


# ─── Bitácora de progreso ─────────────────────────────────────────────────────

class ProgressPhotoInline(TabularInline):
    model               = ProgressPhoto
    extra               = 1
    fields              = ('photo', 'photo_url', 'caption', 'taken_at')
    verbose_name        = 'Foto'
    verbose_name_plural = 'Fotos de avance'


@admin.register(ProgressUpdate)
class ProgressUpdateAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('project', 'phase', 'date', 'progress_pct', 'labor_count', 'created_by')
    list_filter   = ('project',)
    search_fields = ('notes',)
    inlines       = [ProgressPhotoInline]
    readonly_fields = ('created_by', 'created_at')

    fieldsets = (
        ("Registro de avance", {
            "fields": (
                ("project", "phase"),
                ("date", "progress_pct"),
                ("weather", "temperature"),
                "labor_count",
                "activities",
                "materials",
                "notes",
            ),
        }),
        ("Metadatos", {
            "fields": (("created_by", "created_at"),),
            "classes": ["collapse"],
        }),
    )


# ─── Hitos de pago ────────────────────────────────────────────────────────────

class MilestoneEvidenceInline(TabularInline):
    model           = MilestoneEvidence
    extra           = 0
    fields          = ('photo_url', 'caption', 'uploaded_by', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


class MilestoneApprovalInline(StackedInline):
    model           = MilestoneApproval
    extra           = 0
    fields          = (
        'status',
        ('company_approved_by', 'company_approved_at', 'company_notes'),
        ('client_approved_at', 'client_ip_address', 'client_notes'),
    )
    readonly_fields = ('company_approved_at', 'client_approved_at', 'client_ip_address')


@admin.register(PaymentMilestone)
class PaymentMilestoneAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('name', 'project', 'phase', 'order', 'amount_gtq', 'progress_required_pct', 'status', 'due_date')
    list_filter     = ('status', 'project')
    search_fields   = ('name', 'project__name')
    ordering        = ('project', 'order')
    inlines         = [MilestoneEvidenceInline, MilestoneApprovalInline]
    readonly_fields = ('created_at', 'updated_at', 'paid_at')

    fieldsets = (
        (None, {
            "fields": (
                ("name", "order", "status"),
                ("project", "phase"),
                ("amount_gtq", "progress_required_pct"),
                ("due_date", "paid_at"),
                "description",
                "notes",
            ),
        }),
    )


@admin.register(MilestoneApproval)
class MilestoneApprovalAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('milestone', 'status', 'company_approved_by', 'company_approved_at', 'client_approved_at')
    list_filter     = ('status',)
    readonly_fields = ('company_approved_at', 'client_approved_at', 'client_ip_address', 'created_at', 'updated_at')


# ─── Cotizaciones ─────────────────────────────────────────────────────────────

class QuoteLineItemInline(TabularInline):
    model      = QuoteLineItem
    extra      = 0
    fields     = ('order', 'category', 'description', 'quantity', 'unit', 'unit_price', 'product')
    ordering   = ('order',)
    can_delete = False  # el trash del FK product ya sirve para desvincular; ocultamos el botón de fila de Unfold

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'product' and hasattr(formfield, 'widget') and hasattr(formfield.widget, 'can_add_related'):
            formfield.widget.can_add_related = False
        return formfield


@admin.register(Quote)
class QuoteAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('quote_number', 'project', 'revision', 'status', 'created_by', 'created_at')
    list_filter     = ('status',)
    search_fields   = ('quote_number', 'project__name', 'project__client__name')
    ordering        = ('-created_at',)
    readonly_fields = ('quote_number', 'revision', 'created_by', 'sent_at', 'decided_at', 'created_at', 'updated_at')
    inlines         = [QuoteLineItemInline]

    fieldsets = (
        ("Cotización", {
            "fields": (
                ("quote_number", "revision", "status"),
                "project",
                ("valid_until", "created_by"),
                ("discount_pct", "tax_pct"),
                "notes",
                "client_comment",
            ),
        }),
        ("Fechas", {
            "fields": (("sent_at", "decided_at", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )


class QuoteTemplateLineItemInline(TabularInline):
    model   = QuoteTemplateLineItem
    extra   = 0
    fields  = ('order', 'category', 'description', 'quantity', 'unit', 'unit_price')
    ordering = ('order',)


@admin.register(QuoteTemplate)
class QuoteTemplateAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'description', 'created_by', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    inlines       = [QuoteTemplateLineItemInline]


# ─── Presupuesto de proyecto (versionado) ────────────────────────────────────

class ProjectBudgetLineInline(TabularInline):
    model      = ProjectBudgetLine
    extra      = 0
    fields     = ('order', 'cost_code', 'description', 'unit', 'quantity', 'unit_cost_gtq', 'unit_price_gtq', 'delta_type')
    ordering   = ('order',)
    can_delete = True

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'description':
            formfield.widget.attrs.update({'style': _base + 'min-width:240px;width:100%;'})
        elif db_field.name in ('unit_cost_gtq', 'unit_price_gtq'):
            formfield.widget.attrs.update({'style': _base + 'width:110px;'})
        elif db_field.name == 'quantity':
            formfield.widget.attrs.update({'style': _base + 'width:90px;'})
        elif db_field.name == 'unit':
            formfield.widget.attrs.update({'style': _base + 'width:70px;'})
        elif db_field.name == 'order':
            formfield.widget.attrs.update({'style': _base + 'width:50px;'})
        return formfield


@admin.register(ProjectBudget)
class ProjectBudgetAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('project', 'version_number', 'version_type', 'status_badge',
                       'revenue_gtq', 'cost_gtq', 'margin_display', 'approved_by', 'approved_at')
    list_filter     = ('status', 'version_type')
    search_fields   = ('project__name', 'project__client__name', 'notes')
    ordering        = ('project', 'version_number')
    readonly_fields = ('version_number', 'approved_by', 'approved_at', 'created_by', 'created_at', 'updated_at',
                       'margin_display', 'margin_pct_display')
    inlines         = [ProjectBudgetLineInline]
    actions         = ['action_approve']

    fieldsets = (
        ("Versión de presupuesto", {
            "fields": (
                "project",
                ("version_number", "version_type", "status"),
                ("revenue_gtq", "cost_gtq"),
                ("margin_display", "margin_pct_display"),
            ),
        }),
        ("Documentos fuente", {
            "fields": ("linked_quote", "linked_change_order"),
            "classes": ["collapse"],
        }),
        ("Aprobación", {
            "fields": (("approved_by", "approved_at"), "notes"),
            "classes": ["collapse"],
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        colors = {
            'draft':    ('#27384A', '#8A95A5'),
            'approved': ('#1A3A2A', '#4A9E6B'),
        }
        bg, fg = colors.get(obj.status, ('#27384A', '#8A95A5'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 8px;border-radius:4px;font-size:0.75rem;font-weight:600;">{}</span>',
            bg, fg, obj.get_status_display(),
        )

    @admin.display(description='Margen (GTQ)')
    def margin_display(self, obj):
        m = obj.margin_gtq
        color = '#4A9E6B' if m >= 0 else '#E53E3E'
        return format_html('<span style="color:{};">Q {:,.2f}</span>', color, m)

    @admin.display(description='Margen %')
    def margin_pct_display(self, obj):
        pct = obj.margin_pct
        if pct is None:
            return '—'
        color = '#4A9E6B' if pct >= 0 else '#E53E3E'
        return format_html('<span style="color:{};">{}%</span>', color, pct)

    @admin.action(description='Aprobar presupuestos seleccionados')
    def action_approve(self, request, queryset):
        approved = 0
        errors   = []
        for budget in queryset:
            try:
                budget.approve(request.user)
                approved += 1
            except Exception as e:
                errors.append(f'{budget}: {e}')
        if approved:
            self.message_user(request, f'{approved} presupuesto(s) aprobado(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
