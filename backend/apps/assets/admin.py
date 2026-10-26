from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import (
    AssetCategory, FixedAsset,
    AssetDepreciationEntry, EquipmentUsageLog, MaintenanceRecord,
    AssetStatus, DepreciationMethod,
)

# ─── Estilos ──────────────────────────────────────────────────────────────────

_base = (
    'background-color:rgb(15 23 42);'
    'color:rgb(241 245 249);'
    'border:1px solid rgb(51 65 85);'
    'border-radius:0.375rem;'
    'padding:0.35rem 0.6rem;'
    'font-size:0.8125rem;'
    'outline:none;'
)

_STATUS_COLORS = {
    'active':         ('#1a3a2a', '#4A9E6B'),
    'in_maintenance': ('#2a2a1a', '#C9A227'),
    'idle':           ('#1e2a3a', '#8A95A5'),
    'disposed':       ('#2a1a1a', '#E53E3E'),
}


def _badge(label, key):
    bg, fg = _STATUS_COLORS.get(key, ('#1e2a3a', '#8A95A5'))
    return format_html(
        '<span style="background:{};color:{};padding:2px 8px;border-radius:4px;'
        'font-size:0.75rem;font-weight:600;">{}</span>',
        bg, fg, label,
    )


def _gtq(value):
    return format_html('<span style="font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>', value)


# ─── Categoría ────────────────────────────────────────────────────────────────

@admin.register(AssetCategory)
class AssetCategoryAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'default_useful_life_years', 'default_depreciation_method',
                     'sat_max_depreciation_rate_pct', 'is_active')
    list_filter   = ('is_active', 'default_depreciation_method')
    search_fields = ('name',)

    fieldsets = (
        ("Categoría", {
            "fields": (
                ("name", "is_active"),
                "description",
                ("default_useful_life_years", "default_depreciation_method"),
                ("sat_max_depreciation_rate_pct",),
            ),
        }),
    )


# ─── Activo fijo ──────────────────────────────────────────────────────────────

class DepreciationEntryInline(TabularInline):
    model        = AssetDepreciationEntry
    extra        = 0
    fields       = ('accounting_period', 'amount_gtq', 'method_used', 'is_posted', 'notes')
    readonly_fields = ('accounting_period', 'amount_gtq', 'method_used', 'is_posted')
    can_delete   = False
    ordering     = ('-accounting_period__year', '-accounting_period__month')
    verbose_name_plural = 'Entradas de depreciación'

    def has_add_permission(self, request, obj=None):
        return False


class MaintenanceRecordInline(StackedInline):
    model        = MaintenanceRecord
    extra        = 0
    fields       = ('maintenance_type', 'maintenance_date', 'description',
                    'cost_gtq', 'supplier', 'performed_internally', 'performed_by_notes',
                    'invoice_reference', 'next_maintenance_date',
                    'odometer_km', 'hours_at_service')
    ordering     = ('-maintenance_date',)
    can_delete   = True


class EquipmentUsageInline(TabularInline):
    model        = EquipmentUsageLog
    extra        = 0
    fields       = ('usage_date', 'project', 'phase', 'hours_used', 'rate_gtq_per_hour', 'operator')
    readonly_fields = ('rate_gtq_per_hour',)
    ordering     = ('-usage_date',)
    can_delete   = False
    verbose_name_plural = 'Últimos registros de uso'

    def get_queryset(self, request):
        return super().get_queryset(request).order_by('-usage_date')[:20]

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(FixedAsset)
class FixedAssetAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('asset_number', 'name', 'category', 'status_badge',
                       'current_project', 'net_book_value_display',
                       'internal_rate_gtq_per_hour', 'acquisition_date')
    list_filter     = ('status', 'category', 'depreciation_method')
    search_fields   = ('asset_number', 'name', 'serial_number', 'brand')
    ordering        = ['category', 'name']
    readonly_fields = ('asset_number', 'created_by', 'created_at', 'updated_at',
                       'depreciable_amount_display', 'monthly_depreciation_display',
                       'accumulated_depreciation_display', 'net_book_value_display')
    inlines         = [DepreciationEntryInline, MaintenanceRecordInline]

    fieldsets = (
        ("Identificación", {
            "fields": (
                ("asset_number", "status"),
                ("name", "category"),
                "description",
                ("brand", "model", "serial_number", "year_of_manufacture"),
            ),
        }),
        ("Adquisición", {
            "fields": (
                ("acquisition_date", "purchase_cost_gtq"),
                ("supplier", "purchase_invoice_ref"),
            ),
        }),
        ("Depreciación", {
            "fields": (
                ("depreciation_method", "useful_life_years"),
                ("residual_value_gtq", "in_service_date"),
                ("depreciable_amount_display", "monthly_depreciation_display"),
                ("accumulated_depreciation_display", "net_book_value_display"),
            ),
        }),
        ("Ubicación actual", {
            "fields": (
                ("current_project", "current_phase"),
                "location_notes",
            ),
        }),
        ("Tarifa interna (gestión analítica)", {
            "fields": (
                ("internal_rate_gtq_per_hour", "rate_last_reviewed_at"),
            ),
            "description": (
                "La tarifa analítica asigna costo de equipo a proyectos. "
                "Debe conciliarse periódicamente con depreciación + mantenimiento real."
            ),
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _badge(obj.get_status_display(), obj.status)

    @admin.display(description='Monto depreciable')
    def depreciable_amount_display(self, obj):
        return _gtq(obj.depreciable_amount_gtq)

    @admin.display(description='Depreciación mensual')
    def monthly_depreciation_display(self, obj):
        val = obj.monthly_depreciation_gtq
        if val is None:
            return format_html('<span style="color:#8A95A5;">Calculado manualmente</span>')
        return _gtq(val)

    @admin.display(description='Depreciación acumulada')
    def accumulated_depreciation_display(self, obj):
        return _gtq(obj.accumulated_depreciation_gtq)

    @admin.display(description='Valor neto en libros')
    def net_book_value_display(self, obj):
        val = obj.net_book_value_gtq
        color = '#4A9E6B' if val > 0 else '#8A95A5'
        return format_html(
            '<span style="color:{};font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>',
            color, val,
        )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Entradas de depreciación (vista global) ──────────────────────────────────

@admin.register(AssetDepreciationEntry)
class AssetDepreciationEntryAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('asset', 'accounting_period', 'amount_display', 'method_used', 'posted_badge', 'created_at')
    list_filter   = ('is_posted', 'method_used', 'accounting_period__year')
    search_fields = ('asset__asset_number', 'asset__name')
    ordering      = ('-accounting_period__year', '-accounting_period__month')
    readonly_fields = ('created_by', 'created_at')

    fieldsets = (
        ("Depreciación", {
            "fields": (
                ("asset", "accounting_period"),
                ("amount_gtq", "method_used", "is_posted"),
                "notes",
                ("created_by", "created_at"),
            ),
        }),
    )

    @admin.display(description='Monto')
    def amount_display(self, obj):
        return _gtq(obj.amount_gtq)

    @admin.display(description='Registrado')
    def posted_badge(self, obj):
        if obj.is_posted:
            return format_html('<span style="color:#4A9E6B;">✓ Sí</span>')
        return format_html('<span style="color:#8A95A5;">— No</span>')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Registro de uso de equipo ────────────────────────────────────────────────

@admin.register(EquipmentUsageLog)
class EquipmentUsageLogAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('asset', 'project', 'usage_date', 'hours_display',
                     'rate_display', 'allocated_cost_display', 'operator')
    list_filter   = ('asset__category', 'project')
    search_fields = ('asset__asset_number', 'asset__name', 'project__name')
    ordering      = ('-usage_date',)
    readonly_fields = ('allocated_cost_display', 'total_cost_display', 'created_by', 'created_at', 'updated_at')

    fieldsets = (
        ("Uso", {
            "fields": (
                ("asset", "usage_date"),
                ("project", "phase", "cost_code"),
                ("hours_used", "operator"),
            ),
        }),
        ("Tarifa y costo analítico", {
            "fields": (
                ("rate_gtq_per_hour", "allocated_cost_display"),
            ),
        }),
        ("Combustible (opcional)", {
            "fields": (("fuel_liters", "fuel_cost_gtq"), "total_cost_display"),
            "classes": ["collapse"],
        }),
        ("Notas", {
            "fields": ("notes",),
            "classes": ["collapse"],
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Horas')
    def hours_display(self, obj):
        return format_html(
            '<span style="font-family:\'Space Mono\',monospace;">{} h</span>',
            obj.hours_used,
        )

    @admin.display(description='Tarifa/h')
    def rate_display(self, obj):
        return _gtq(obj.rate_gtq_per_hour)

    @admin.display(description='Costo asignado')
    def allocated_cost_display(self, obj):
        return _gtq(obj.allocated_cost_gtq)

    @admin.display(description='Costo total (incl. combustible)')
    def total_cost_display(self, obj):
        return _gtq(obj.total_cost_including_fuel_gtq)

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Registros de mantenimiento (vista global) ────────────────────────────────

@admin.register(MaintenanceRecord)
class MaintenanceRecordAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('asset', 'maintenance_type', 'maintenance_date', 'cost_display',
                     'supplier', 'performed_internally', 'next_maintenance_date')
    list_filter   = ('maintenance_type', 'performed_internally')
    search_fields = ('asset__asset_number', 'asset__name', 'supplier__name')
    ordering      = ('-maintenance_date',)
    readonly_fields = ('created_by', 'created_at')

    fieldsets = (
        ("Mantenimiento", {
            "fields": (
                ("asset", "maintenance_type", "maintenance_date"),
                "description",
                ("cost_gtq", "invoice_reference"),
                ("supplier", "performed_internally", "performed_by_notes"),
                "next_maintenance_date",
            ),
        }),
        ("Métricas de máquina", {
            "fields": (("odometer_km", "hours_at_service"),),
            "classes": ["collapse"],
        }),
        ("Notas", {
            "fields": ("notes",),
            "classes": ["collapse"],
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Costo')
    def cost_display(self, obj):
        return _gtq(obj.cost_gtq)

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
