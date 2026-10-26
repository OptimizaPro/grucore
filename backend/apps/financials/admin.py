from django.contrib import admin
from unfold.admin import ModelAdmin
from apps.core.admin_mixins import CRUDActionsMixin
from .models import Expense, Invoice


@admin.register(Expense)
class ExpenseAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('description', 'category', 'amount_gtq', 'status', 'project', 'cost_center', 'submitted_by', 'expense_date')
    list_filter    = ('status', 'category', 'cost_center')
    search_fields  = ('description', 'notes')
    date_hierarchy = 'expense_date'
    readonly_fields = ('submitted_by', 'approved_by', 'approved_at', 'created_at', 'updated_at')
    autocomplete_fields = ('cost_code',)

    fieldsets = (
        (None, {
            'fields': (
                ('category', 'status'),
                ('project', 'phase'),
                ('cost_center', 'cost_code'),
                'accounting_period',
                'description',
                ('amount_gtq', 'expense_date'),
                'receipt_url',
                'notes',
            ),
        }),
        ('Aprobación', {
            'fields': (
                ('submitted_by', 'approved_by', 'approved_at'),
            ),
            'classes': ['collapse'],
        }),
        ('Auditoría', {
            'fields': (('created_at', 'updated_at'),),
            'classes': ['collapse'],
        }),
    )


@admin.register(Invoice)
class InvoiceAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('invoice_number', 'title', 'amount_gtq', 'tax_amount', 'total_with_tax', 'status', 'fel_status', 'project', 'issue_date')
    list_filter    = ('status', 'fel_status')
    search_fields  = ('invoice_number', 'title', 'fel_number', 'description')
    date_hierarchy = 'issue_date'
    readonly_fields = ('created_by', 'paid_at', 'tax_amount', 'total_with_tax', 'created_at', 'updated_at')

    fieldsets = (
        (None, {
            'fields': (
                ('invoice_number', 'status'),
                ('project', 'milestone'),
                'accounting_period',
                ('title', 'tax_percentage'),
                'description',
                ('amount_gtq', 'issue_date'),
                ('due_date', 'paid_at'),
                'notes',
            ),
        }),
        ('FEL — Facturación Electrónica (SAT)', {
            'fields': (
                ('fel_number', 'fel_status', 'fel_certified_at'),
            ),
            'classes': ['collapse'],
        }),
        ('Totales', {
            'fields': (('tax_amount', 'total_with_tax'),),
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.created_by_id:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
