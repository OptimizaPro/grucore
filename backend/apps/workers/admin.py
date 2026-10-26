from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import Worker, WorkLog


class WorkLogInline(TabularInline):
    model        = WorkLog
    extra        = 0
    readonly_fields = ['regular_pay', 'overtime_pay', 'gross_pay', 'igss_patronal', 'total_cost']
    fields       = ['date', 'project', 'regular_hours', 'overtime_hours', 'notes',
                    'regular_pay', 'overtime_pay', 'gross_pay', 'igss_patronal', 'total_cost']


@admin.register(Worker)
class WorkerAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ['full_name', 'position', 'daily_rate_gtq', 'status', 'current_project', 'hire_date']
    list_filter    = ['status', 'position', 'current_project']
    search_fields  = ['first_name', 'last_name', 'dpi', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    inlines        = [WorkLogInline]

    fieldsets = (
        ('Identificación', {'fields': ('first_name', 'last_name', 'dpi')}),
        ('Contacto', {'fields': ('phone', 'emergency_contact_name', 'emergency_contact_phone')}),
        ('Laboral', {'fields': ('position', 'daily_rate_gtq', 'hire_date', 'status', 'current_project')}),
        ('Notas', {'fields': ('notes',)}),
        ('Auditoría', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(WorkLog)
class WorkLogAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ['worker', 'date', 'project', 'regular_hours', 'overtime_hours', 'gross_pay', 'total_cost']
    list_filter   = ['project', 'date']
    search_fields = ['worker__first_name', 'worker__last_name']
    readonly_fields = ['regular_pay', 'overtime_pay', 'gross_pay', 'igss_patronal', 'total_cost', 'created_at']
    date_hierarchy = 'date'
