from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import (
    AccountingPeriod, Account, JournalEntry, JournalLine,
    TaxRule, PeriodCloseLog, AccountMapping,
)


# ─── Período contable ────────────────────────────────────────────────────────

class PeriodCloseLogInline(TabularInline):
    model        = PeriodCloseLog
    extra        = 0
    fields       = ('action', 'performed_by', 'depreciation_entries_generated',
                    'journal_entries_draft_warnings', 'notes', 'created_at')
    readonly_fields = ('action', 'performed_by', 'depreciation_entries_generated',
                       'journal_entries_draft_warnings', 'created_at')
    can_delete   = False
    ordering     = ('-created_at',)
    verbose_name_plural = 'Historial de cierres'

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(AccountingPeriod)
class AccountingPeriodAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'label', 'state_badge', 'closed_by', 'closed_at')
    list_filter     = ('state',)
    search_fields   = ('year', 'month')
    readonly_fields = ('closed_by', 'closed_at')
    inlines         = [PeriodCloseLogInline]
    actions         = ['action_close', 'action_lock']

    fieldsets = (
        (None, {
            'fields': (('year', 'month'), 'state', 'notes'),
        }),
        ('Cierre', {
            'fields': (('closed_by', 'closed_at'),),
            'classes': ['collapse'],
        }),
    )

    @admin.display(description='Estado', ordering='state')
    def state_badge(self, obj):
        colors = {
            'open':   ('#22c55e', '#dcfce7'),
            'closed': ('#f59e0b', '#fef3c7'),
            'locked': ('#ef4444', '#fee2e2'),
        }
        color, bg = colors.get(obj.state, ('#8a95a5', '#1e2a3a'))
        return format_html(
            '<span style="padding:2px 10px;border-radius:9999px;font-size:11px;'
            'font-weight:600;color:{};background:{};">{}</span>',
            color, bg, obj.get_state_display(),
        )

    @admin.action(description='Cerrar períodos seleccionados')
    def action_close(self, request, queryset):
        ok, errors = 0, []
        for period in queryset:
            try:
                period.close(request.user)
                PeriodCloseLog.objects.create(
                    period=period, action='close', performed_by=request.user,
                    notes='Cierre manual desde admin.',
                )
                ok += 1
            except Exception as e:
                errors.append(f'{period}: {e}')
        if ok:
            self.message_user(request, f'{ok} período(s) cerrado(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    @admin.action(description='Bloquear períodos seleccionados (irreversible)')
    def action_lock(self, request, queryset):
        ok, errors = 0, []
        for period in queryset:
            try:
                period.lock(request.user)
                PeriodCloseLog.objects.create(
                    period=period, action='lock', performed_by=request.user,
                    notes='Bloqueo manual desde admin.',
                )
                ok += 1
            except Exception as e:
                errors.append(f'{period}: {e}')
        if ok:
            self.message_user(request, f'{ok} período(s) bloqueado(s).')
        for err in errors:
            self.message_user(request, err, level='error')


# ─── Catálogo de cuentas ─────────────────────────────────────────────────────

@admin.register(Account)
class AccountAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('code', 'name', 'account_type', 'nature', 'level_badge', 'pl_group', 'parent', 'is_active')
    list_filter   = ('account_type', 'level', 'is_active', 'pl_group')
    search_fields = ('code', 'name')
    ordering      = ('code',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': (
                ('code', 'name'),
                ('account_type', 'nature', 'level'),
                ('parent', 'pl_group'),
                'is_active',
            ),
        }),
        ('Notas', {
            'fields': ('notes',),
            'classes': ['collapse'],
        }),
        ('Auditoría', {
            'fields': (('created_at', 'updated_at'),),
            'classes': ['collapse'],
        }),
    )

    @admin.display(description='Nivel', ordering='level')
    def level_badge(self, obj):
        if obj.level == 'posting':
            return format_html(
                '<span style="padding:2px 8px;border-radius:9999px;font-size:11px;'
                'color:#22c55e;background:#dcfce7;">Imputable</span>'
            )
        return format_html(
            '<span style="padding:2px 8px;border-radius:9999px;font-size:11px;'
            'color:#8a95a5;background:#1e2a3a;">Cabecera</span>'
        )


# ─── Asientos contables ──────────────────────────────────────────────────────

class JournalLineInline(TabularInline):
    model          = JournalLine
    extra          = 2
    fields         = ('account', 'debit', 'credit', 'project', 'cost_center', 'cost_code', 'description')
    autocomplete_fields = ('account',)
    can_delete     = True


@admin.register(JournalEntry)
class JournalEntryAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('number', 'date', 'period', 'origin_type', 'description', 'state_badge', 'balance_badge', 'created_by')
    list_filter   = ('state', 'origin_type', 'period')
    search_fields = ('number', 'description', 'notes')
    date_hierarchy = 'date'
    readonly_fields = ('number', 'total_debit_display', 'total_credit_display', 'created_by', 'created_at', 'updated_at')
    inlines       = [JournalLineInline]

    fieldsets = (
        (None, {
            'fields': (
                ('number', 'state'),
                ('date', 'period'),
                ('origin_type',),
                'description',
                'notes',
            ),
        }),
        ('Totales', {
            'fields': (('total_debit_display', 'total_credit_display'),),
        }),
        ('Auditoría', {
            'fields': (('created_by', 'created_at', 'updated_at'), 'reversed_by'),
            'classes': ['collapse'],
        }),
    )

    @admin.display(description='Estado')
    def state_badge(self, obj):
        colors = {
            'draft':    ('#f59e0b', '#fef3c7'),
            'posted':   ('#22c55e', '#dcfce7'),
            'reversed': ('#8a95a5', '#1e2a3a'),
        }
        color, bg = colors.get(obj.state, ('#8a95a5', '#1e2a3a'))
        return format_html(
            '<span style="padding:2px 10px;border-radius:9999px;font-size:11px;'
            'font-weight:600;color:{};background:{};">{}</span>',
            color, bg, obj.get_state_display(),
        )

    @admin.display(description='Cuadre')
    def balance_badge(self, obj):
        if obj.is_balanced:
            return format_html(
                '<span style="padding:2px 8px;border-radius:9999px;font-size:11px;'
                'color:#22c55e;background:#dcfce7;">Cuadrado</span>'
            )
        return format_html(
            '<span style="padding:2px 8px;border-radius:9999px;font-size:11px;'
            'color:#ef4444;background:#fee2e2;">Descuadrado</span>'
        )

    @admin.display(description='Total Débito')
    def total_debit_display(self, obj):
        return f'Q {obj.total_debit:,.2f}'

    @admin.display(description='Total Crédito')
    def total_credit_display(self, obj):
        return f'Q {obj.total_credit:,.2f}'

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Reglas fiscales ─────────────────────────────────────────────────────────

@admin.register(TaxRule)
class TaxRuleAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'tax_type', 'rate_pct_display', 'regime',
                     'applies_from', 'applies_to', 'requires_fel', 'active_badge')
    list_filter   = ('tax_type', 'is_active', 'requires_fel')
    search_fields = ('name', 'regime', 'description')
    ordering      = ('tax_type', '-applies_from')
    readonly_fields = ('created_by', 'created_at', 'updated_at')

    fieldsets = (
        ('Regla fiscal', {
            'fields': (
                ('name', 'tax_type', 'is_active'),
                ('rate_pct', 'requires_fel'),
                ('applies_from', 'applies_to'),
                'regime',
                'description',
            ),
        }),
        ('Auditoría', {
            'fields': (('created_by', 'created_at', 'updated_at'),),
            'classes': ['collapse'],
        }),
    )

    @admin.display(description='Tasa')
    def rate_pct_display(self, obj):
        return format_html(
            '<span style="font-family:\'Space Mono\',monospace;color:#F0EDE8;">{}%</span>',
            obj.rate_pct,
        )

    @admin.display(description='Activa')
    def active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="padding:2px 8px;border-radius:9999px;font-size:11px;'
                'color:#22c55e;background:#dcfce7;">Activa</span>'
            )
        return format_html(
            '<span style="padding:2px 8px;border-radius:9999px;font-size:11px;'
            'color:#8a95a5;background:#1e2a3a;">Inactiva</span>'
        )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Logs de cierre ──────────────────────────────────────────────────────────

@admin.register(PeriodCloseLog)
class PeriodCloseLogAdmin(ModelAdmin):
    list_display  = ('period', 'action', 'performed_by',
                     'depreciation_entries_generated', 'journal_entries_draft_warnings', 'created_at')
    list_filter   = ('action',)
    search_fields = ('period__year', 'period__month')
    ordering      = ('-created_at',)
    readonly_fields = ('period', 'action', 'performed_by', 'depreciation_entries_generated',
                       'journal_entries_draft_warnings', 'notes', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


# ─── Mapeos de cuentas ────────────────────────────────────────────────────────

@admin.register(AccountMapping)
class AccountMappingAdmin(ModelAdmin):
    list_display  = ('key', 'key_display', 'account_code', 'account_name')
    search_fields = ('key', 'account__code', 'account__name')
    autocomplete_fields = ('account',)

    fieldsets = (
        (None, {
            'fields': ('key', 'account'),
        }),
    )

    @admin.display(description='Clave')
    def key_display(self, obj):
        return obj.get_key_display()

    @admin.display(description='Código cuenta')
    def account_code(self, obj):
        return format_html(
            '<span style="font-family:\'Space Mono\',monospace;color:#F0EDE8;">{}</span>',
            obj.account.code,
        )

    @admin.display(description='Nombre cuenta')
    def account_name(self, obj):
        return obj.account.name
