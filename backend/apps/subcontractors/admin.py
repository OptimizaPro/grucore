from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import (
    SubcontractorContract, SubcontractorCertification,
    SubcontractorRetentionRelease,
    ContractStatus, CertificationStatus,
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
    'draft':      ('#1e2a3a', '#8A95A5'),
    'submitted':  ('#1a2540', '#6B9FD4'),
    'active':     ('#1a3a2a', '#4A9E6B'),
    'approved':   ('#1a3a2a', '#4A9E6B'),
    'suspended':  ('#2a2a1a', '#C9A227'),
    'completed':  ('#1a3a2a', '#4A9E6B'),
    'rejected':   ('#2a1a1a', '#E53E3E'),
    'terminated': ('#2a1a1a', '#E53E3E'),
    'posted':     ('#1a3a2a', '#4A9E6B'),
}


def _badge(label, key):
    bg, fg = _STATUS_COLORS.get(key, ('#1e2a3a', '#8A95A5'))
    return format_html(
        '<span style="background:{};color:{};padding:2px 8px;border-radius:4px;'
        'font-size:0.75rem;font-weight:600;">{}</span>',
        bg, fg, label,
    )


def _gtq(value):
    return format_html(
        '<span style="font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>', value
    )


def _pct(value, color='#F0EDE8'):
    return format_html(
        '<span style="color:{};font-family:\'Space Mono\',monospace;">{}%</span>',
        color, value,
    )


# ─── Certificaciones inline ───────────────────────────────────────────────────

class SubcontractorCertificationInline(StackedInline):
    model  = SubcontractorCertification
    extra  = 0
    fields = (
        ('certification_number', 'status'),
        ('period_from', 'period_to'),
        'description',
        ('amount_certified_gtq', 'retention_withheld_gtq', 'advance_recovery_gtq', 'net_payable_gtq'),
        ('approved_by', 'approved_at'),
        'supplier_invoice',
        'notes',
    )
    readonly_fields = ('certification_number', 'approved_by', 'approved_at')
    can_delete      = False
    ordering        = ('certification_number',)


class RetentionReleaseInline(TabularInline):
    model  = SubcontractorRetentionRelease
    extra  = 0
    fields = ('release_date', 'amount_released_gtq', 'status', 'supplier_invoice', 'notes')
    ordering = ('-release_date',)


# ─── Contrato de subcontratista ───────────────────────────────────────────────

@admin.register(SubcontractorContract)
class SubcontractorContractAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'subcontractor', 'project', 'status_badge',
                       'contract_value_display', 'certified_display',
                       'completion_pct_display', 'retention_balance_display')
    list_filter     = ('status', 'project')
    search_fields   = ('subcontractor__name', 'project__name', 'title')
    ordering        = ('-created_at',)
    readonly_fields = (
        'year', 'sequence',
        'contract_value_with_tax_display',
        'total_certified_display', 'balance_to_certify_display',
        'total_retention_withheld_display', 'total_retention_released_display', 'retention_balance_display',
        'advance_balance_display', 'completion_pct_display',
        'created_by', 'created_at', 'updated_at',
    )
    inlines         = [SubcontractorCertificationInline, RetentionReleaseInline]
    actions         = ['action_activate', 'action_complete']

    fieldsets = (
        ("Contrato", {
            "fields": (
                ("year", "sequence", "status"),
                ("subcontractor", "project"),
                ("phase", "cost_code"),
                ("accounting_period",),
                "title",
                "description",
            ),
        }),
        ("Valor y condiciones financieras", {
            "fields": (
                ("contract_value_gtq", "tax_percentage"),
                ("contract_value_with_tax_display",),
                ("retention_pct",),
                ("advance_paid_gtq", "advance_recovered_gtq", "advance_balance_display"),
            ),
        }),
        ("Resumen de ejecución", {
            "fields": (
                ("total_certified_display", "balance_to_certify_display", "completion_pct_display"),
                ("total_retention_withheld_display", "total_retention_released_display", "retention_balance_display"),
            ),
        }),
        ("Fechas y notas", {
            "fields": (("start_date", "end_date"), "notes"),
            "classes": ["collapse"],
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _badge(obj.get_status_display(), obj.status)

    @admin.display(description='Valor contrato')
    def contract_value_display(self, obj):
        return _gtq(obj.contract_value_gtq)

    @admin.display(description='Valor c/ IVA')
    def contract_value_with_tax_display(self, obj):
        return _gtq(obj.contract_value_with_tax_gtq)

    @admin.display(description='Total certificado')
    def certified_display(self, obj):
        return _gtq(obj.total_certified_gtq)

    @admin.display(description='Total certificado')
    def total_certified_display(self, obj):
        return _gtq(obj.total_certified_gtq)

    @admin.display(description='Saldo x certificar')
    def balance_to_certify_display(self, obj):
        val = obj.balance_to_certify_gtq
        color = '#C9A227' if val > 0 else '#4A9E6B'
        return format_html(
            '<span style="color:{};font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>',
            color, val,
        )

    @admin.display(description='Avance %')
    def completion_pct_display(self, obj):
        pct = obj.completion_pct
        color = '#4A9E6B' if pct >= 80 else '#C9A227' if pct >= 40 else '#8A95A5'
        return _pct(pct, color)

    @admin.display(description='Retención retenida')
    def total_retention_withheld_display(self, obj):
        return _gtq(obj.total_retention_withheld_gtq)

    @admin.display(description='Retención liberada')
    def total_retention_released_display(self, obj):
        return _gtq(obj.total_retention_released_gtq)

    @admin.display(description='Retención pendiente')
    def retention_balance_display(self, obj):
        val = obj.retention_balance_gtq
        color = '#C9A227' if val > 0 else '#4A9E6B'
        return format_html(
            '<span style="color:{};font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>',
            color, val,
        )

    @admin.display(description='Anticipo pendiente')
    def advance_balance_display(self, obj):
        val = obj.advance_balance_gtq
        color = '#C9A227' if val > 0 else '#4A9E6B'
        return format_html(
            '<span style="color:{};font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>',
            color, val,
        )

    @admin.action(description='Activar contratos seleccionados')
    def action_activate(self, request, queryset):
        updated = queryset.filter(status=ContractStatus.DRAFT).update(
            status=ContractStatus.ACTIVE
        )
        self.message_user(request, f'{updated} contrato(s) activado(s).')

    @admin.action(description='Marcar como completados')
    def action_complete(self, request, queryset):
        updated = queryset.filter(status=ContractStatus.ACTIVE).update(
            status=ContractStatus.COMPLETED
        )
        self.message_user(request, f'{updated} contrato(s) marcado(s) como completado(s).')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Certificaciones (vista global) ──────────────────────────────────────────

@admin.register(SubcontractorCertification)
class SubcontractorCertificationAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'contract', 'status_badge', 'period_from', 'period_to',
                       'gross_display', 'retention_display', 'net_display', 'approved_by')
    list_filter     = ('status', 'contract__project')
    search_fields   = ('contract__subcontractor__name', 'contract__project__name')
    ordering        = ('-contract', '-certification_number')
    readonly_fields = ('certification_number', 'approved_by', 'approved_at',
                       'created_by', 'created_at', 'updated_at')
    actions         = ['action_approve', 'action_reject']

    fieldsets = (
        ("Certificación", {
            "fields": (
                ("contract", "certification_number", "status"),
                ("period_from", "period_to"),
                "description",
            ),
        }),
        ("Montos", {
            "fields": (
                ("amount_certified_gtq",),
                ("retention_withheld_gtq", "advance_recovery_gtq"),
                ("net_payable_gtq",),
            ),
        }),
        ("Aprobación y factura", {
            "fields": (
                ("approved_by", "approved_at"),
                "supplier_invoice",
                "notes",
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

    @admin.display(description='Bruto certificado')
    def gross_display(self, obj):
        return _gtq(obj.amount_certified_gtq)

    @admin.display(description='Retención')
    def retention_display(self, obj):
        return format_html(
            '<span style="color:#C9A227;font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>',
            obj.retention_withheld_gtq,
        )

    @admin.display(description='Neto a pagar')
    def net_display(self, obj):
        return _gtq(obj.net_payable_gtq)

    @admin.action(description='Aprobar certificaciones seleccionadas')
    def action_approve(self, request, queryset):
        ok, errors = 0, []
        for cert in queryset:
            try:
                cert.approve(request.user)
                ok += 1
            except Exception as e:
                errors.append(f'{cert}: {e}')
        if ok:
            self.message_user(request, f'{ok} certificación(es) aprobada(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    @admin.action(description='Rechazar certificaciones seleccionadas')
    def action_reject(self, request, queryset):
        ok = 0
        for cert in queryset:
            try:
                cert.reject(request.user)
                ok += 1
            except Exception as e:
                self.message_user(request, f'{cert}: {e}', level='error')
        if ok:
            self.message_user(request, f'{ok} certificación(es) rechazada(s).')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Liberaciones de retención (vista global) ─────────────────────────────────

@admin.register(SubcontractorRetentionRelease)
class SubcontractorRetentionReleaseAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('contract', 'release_date', 'amount_display', 'status_badge', 'supplier_invoice')
    list_filter   = ('status',)
    search_fields = ('contract__subcontractor__name', 'contract__project__name')
    ordering      = ('-release_date',)
    readonly_fields = ('created_by', 'created_at')
    actions         = ['action_post']

    fieldsets = (
        ("Liberación de retención", {
            "fields": (
                ("contract", "status"),
                ("release_date", "amount_released_gtq"),
                "supplier_invoice",
                "notes",
                ("created_by", "created_at"),
            ),
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _badge(obj.get_status_display(), obj.status)

    @admin.display(description='Monto liberado')
    def amount_display(self, obj):
        return _gtq(obj.amount_released_gtq)

    @admin.action(description='Registrar liberaciones seleccionadas')
    def action_post(self, request, queryset):
        ok, errors = 0, []
        for rel in queryset:
            try:
                rel.post()
                ok += 1
            except Exception as e:
                errors.append(f'{rel}: {e}')
        if ok:
            self.message_user(request, f'{ok} liberación(es) registrada(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
