from django.contrib import admin
from unfold.admin import ModelAdmin, StackedInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import ChangeOrder, ChangeOrderApproval


class ChangeOrderApprovalInline(StackedInline):
    model           = ChangeOrderApproval
    extra           = 0
    readonly_fields = (
        'status',
        'company_approved_by', 'company_approved_at',
        'client_approved_at', 'client_ip_address',
        'created_at', 'updated_at',
    )


@admin.register(ChangeOrder)
class ChangeOrderAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('change_order_label', 'project', 'status', 'reason', 'amount_gtq', 'schedule_days_impact', 'requested_by', 'created_at')

    @admin.display(description='Orden de cambio', ordering='title')
    def change_order_label(self, obj):
        return str(obj)

    list_filter    = ('status', 'reason', 'project')
    search_fields  = ('title', 'description')
    inlines        = [ChangeOrderApprovalInline]
    date_hierarchy = 'created_at'

    fieldsets = (
        (None, {
            "fields": (
                ("title", "status"),
                ("project", "phase"),
                ("reason", "schedule_days_impact"),
                "description",
                ("amount_gtq", "requested_by"),
                "company_notes",
                "client_notes",
            ),
        }),
    )


@admin.register(ChangeOrderApproval)
class ChangeOrderApprovalAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('approval_label', 'status', 'company_approved_by', 'company_approved_at', 'client_approved_at')

    @admin.display(description='Aprobación de orden de cambio', ordering='change_order')
    def approval_label(self, obj):
        return str(obj)

    list_filter     = ('status',)
    readonly_fields = (
        'status',
        'company_approved_by', 'company_approved_at',
        'client_approved_at', 'client_ip_address',
        'created_at', 'updated_at',
    )
