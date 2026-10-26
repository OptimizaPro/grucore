from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import Pipeline, PipelineStage, Lead, LeadActivity


# ─── Inlines ─────────────────────────────────────────────────────────────────

class PipelineStageInline(TabularInline):
    model   = PipelineStage
    extra   = 0
    fields  = ('name', 'order', 'color', 'is_won', 'is_lost')
    ordering = ('order',)


class LeadActivityInline(StackedInline):
    model           = LeadActivity
    extra           = 0
    fields          = ('activity_type', 'content', 'user', 'created_at')
    readonly_fields = ('created_at',)
    ordering        = ('-created_at',)


# ─── Pipeline ─────────────────────────────────────────────────────────────────

@admin.register(Pipeline)
class PipelineAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'is_default', 'created_at')
    list_filter   = ('is_default',)
    search_fields = ('name',)
    inlines       = [PipelineStageInline]

    fieldsets = (
        (None, {
            'fields': (('name', 'is_default'), 'description'),
        }),
    )


@admin.register(PipelineStage)
class PipelineStageAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'pipeline', 'order', 'color', 'is_won', 'is_lost')
    list_filter   = ('pipeline', 'is_won', 'is_lost')
    search_fields = ('name',)
    ordering      = ('pipeline', 'order')


# ─── Leads ────────────────────────────────────────────────────────────────────

@admin.register(Lead)
class LeadAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('full_name', 'company', 'stage', 'status', 'source', 'service_type', 'assigned_to', 'estimated_value_gtq', 'created_at')
    list_filter   = ('status', 'source', 'service_type', 'pipeline', 'stage')
    search_fields = ('full_name', 'email', 'phone', 'company', 'city')
    ordering      = ('-created_at',)
    raw_id_fields = ('assigned_to', 'converted_project')
    readonly_fields = ('converted_at', 'created_at', 'updated_at')
    inlines       = [LeadActivityInline]

    fieldsets = (
        ('Contacto', {
            'fields': (
                'full_name',
                ('email', 'phone'),
                ('company', 'city'),
            ),
        }),
        ('Pipeline', {
            'fields': (
                ('pipeline', 'stage', 'status'),
                ('source', 'service_type'),
                'estimated_value_gtq',
                'assigned_to',
            ),
        }),
        ('Notas', {
            'fields': ('notes',),
        }),
        ('Conversión', {
            'fields': (('converted_project', 'converted_at'),),
            'classes': ('collapse',),
        }),
        ('Auditoría', {
            'fields': (('created_at', 'updated_at'),),
            'classes': ('collapse',),
        }),
    )


@admin.register(LeadActivity)
class LeadActivityAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('lead', 'activity_type', 'user', 'created_at')
    list_filter   = ('activity_type',)
    search_fields = ('lead__full_name', 'content')
    ordering      = ('-created_at',)
    readonly_fields = ('created_at',)
