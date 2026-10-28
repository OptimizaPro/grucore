from django.contrib import admin
from django.utils.html import format_html
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
    list_display    = ('full_name', 'tier_badge', 'score_bar', 'service_type', 'stage', 'status', 'estimated_value_gtq', 'created_at')
    list_filter     = ('status', 'source', 'service_type', 'pipeline', 'stage', 'lead_tier')
    search_fields   = ('full_name', 'email', 'phone', 'company', 'city')
    ordering        = ('-created_at',)
    raw_id_fields   = ('assigned_to', 'converted_project')
    readonly_fields = ('converted_at', 'created_at', 'updated_at', 'lead_score', 'lead_tier', 'tier_badge', 'score_bar')
    inlines         = [LeadActivityInline]

    # ── Display helpers ───────────────────────────────────────────────────────

    @admin.display(description='Tier', ordering='lead_tier')
    def tier_badge(self, obj):
        cfg = {
            'hot':  ('#FF6B35', '#FFF3EE', '🔥 Caliente'),
            'warm': ('#D97706', '#FFFBEB', '⚡ Tibio'),
            'cold': ('#64748B', '#F1F5F9', '💡 Exploración'),
        }
        if not obj.lead_tier:
            return '—'
        color, bg, label = cfg.get(obj.lead_tier, ('#64748B', '#F1F5F9', obj.lead_tier))
        return format_html(
            '<span style="display:inline-flex;align-items:center;gap:4px;'
            'padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;'
            'color:{};background:{};white-space:nowrap;">{}</span>',
            color, bg, label,
        )

    @admin.display(description='Puntuación')
    def score_bar(self, obj):
        if obj.lead_score is None:
            return '—'
        pct   = int((obj.lead_score / 25) * 100)
        color = '#FF6B35' if obj.lead_score >= 20 else '#D97706' if obj.lead_score >= 13 else '#64748B'
        return format_html(
            '<div style="display:flex;align-items:center;gap:8px;min-width:120px;">'
            '<div style="flex:1;height:6px;background:#E2E8F0;border-radius:999px;overflow:hidden;">'
            '<div style="width:{}%;height:100%;background:{};border-radius:999px;"></div>'
            '</div>'
            '<span style="font-size:11px;font-weight:700;color:{};">{}/25</span>'
            '</div>',
            pct, color, color, obj.lead_score,
        )

    # ── Fieldsets ─────────────────────────────────────────────────────────────

    fieldsets = (
        ('Contacto', {
            'fields': (
                'full_name',
                ('email', 'phone'),
                ('company', 'city'),
            ),
        }),
        ('Calificación del Lead', {
            'fields': (
                ('tier_badge', 'score_bar'),
                ('lead_tier', 'lead_score'),
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
