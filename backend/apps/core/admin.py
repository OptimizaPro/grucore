from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import CompanySettings, CostCenter, CostCode


@admin.register(CompanySettings)
class CompanySettingsAdmin(ModelAdmin):
    fieldsets = (
        ('Identidad visual', {
            'fields': (('logo', 'logo_light'),),
        }),
        ('Textos', {
            'fields': ('name', 'tagline'),
        }),
    )
    readonly_fields = ('updated_at',)

    def has_add_permission(self, request):
        return not CompanySettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(CostCenter)
class CostCenterAdmin(ModelAdmin):
    list_display  = ('code', 'name', 'center_type', 'is_active')
    list_filter   = ('center_type', 'is_active')
    search_fields = ('code', 'name')
    ordering      = ('code',)

    fieldsets = (
        (None, {
            'fields': (('code', 'name'), ('center_type', 'is_active')),
        }),
    )


@admin.register(CostCode)
class CostCodeAdmin(ModelAdmin):
    list_display  = ('code', 'description', 'category', 'cost_behavior', 'default_account', 'is_active')
    list_filter   = ('category', 'cost_behavior', 'is_active')
    search_fields = ('code', 'description')
    ordering      = ('code',)
    autocomplete_fields = ('default_account',)

    fieldsets = (
        (None, {
            'fields': (
                ('code', 'description'),
                ('category', 'cost_behavior'),
                ('default_account', 'is_active'),
            ),
        }),
    )
