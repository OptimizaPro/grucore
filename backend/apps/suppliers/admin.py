from django.contrib import admin
from unfold.admin import ModelAdmin
from apps.core.admin_mixins import CRUDActionsMixin
from .models import Supplier


@admin.register(Supplier)
class SupplierAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('name', 'category', 'contact_person', 'phone', 'email', 'rating', 'is_active', 'created_at')
    list_filter    = ('category', 'is_active', 'rating')
    search_fields  = ('name', 'contact_person', 'email', 'nit')
    ordering       = ('name',)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = (
        ('Datos generales', {
            'fields': (
                ('name', 'category'),
                ('contact_person', 'nit'),
                ('email', 'phone'),
                ('website', 'is_active'),
            ),
        }),
        ('Ubicación & notas', {
            'fields': ('address', 'notes'),
        }),
        ('Evaluación', {
            'fields': ('rating',),
        }),
        ('Auditoría', {
            'fields': (('created_at', 'updated_at'),),
            'classes': ('collapse',),
        }),
    )
