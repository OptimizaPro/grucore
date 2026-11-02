from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from apps.core.admin_mixins import CRUDActionsMixin

from .models import DesignSession, SessionStatus


@admin.register(DesignSession)
class DesignSessionAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'model_badge', 'status_badge', 'renders_count', 'lead', 'user', 'created_at')
    list_filter     = ('status', 'session_type', 'style', 'project_type', 'model_key')
    search_fields   = ('user__email', 'lead__full_name', 'extra_description')
    ordering        = ('-created_at',)
    readonly_fields = (
        'status', 'renders', 'input_images', 'prompt_used',
        'error_message', 'renders_preview', 'created_at', 'updated_at',
    )

    # ── Display helpers ───────────────────────────────────────────────────────

    @admin.display(description='Modelo')
    def model_badge(self, obj):
        colors = {
            'flux_schnell_hf': ('#10B981', '#ECFDF5'),
            'dalle3_openai':   ('#6366F1', '#EEF2FF'),
            'flux_pro_fal':    ('#FF6B35', '#FFF3EE'),
        }
        color, bg = colors.get(obj.model_key, ('#64748B', '#F1F5F9'))
        return format_html(
            '<span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;'
            'color:{};background:{};white-space:nowrap;">{}</span>',
            color, bg, obj.get_model_key_display(),
        )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        cfg = {
            SessionStatus.PENDING:    ('#D97706', '#FFFBEB', '⏳ Pendiente'),
            SessionStatus.GENERATING: ('#3B82F6', '#EFF6FF', '⚡ Generando'),
            SessionStatus.COMPLETED:  ('#10B981', '#ECFDF5', '✓ Completado'),
            SessionStatus.FAILED:     ('#EF4444', '#FEF2F2', '✗ Fallido'),
        }
        color, bg, label = cfg.get(obj.status, ('#64748B', '#F1F5F9', obj.status))
        return format_html(
            '<span style="padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;'
            'color:{};background:{};white-space:nowrap;">{}</span>',
            color, bg, label,
        )

    @admin.display(description='Renders')
    def renders_count(self, obj):
        n = len(obj.renders or [])
        return f'{n} imagen{"es" if n != 1 else ""}'

    @admin.display(description='Vista previa de renders')
    def renders_preview(self, obj):
        if not obj.renders:
            return '—'
        from django.conf import settings
        imgs = ''
        for path in obj.renders:
            url = f'{settings.MEDIA_URL}{path}'
            imgs += (
                f'<a href="{url}" target="_blank">'
                f'<img src="{url}" style="height:120px;width:auto;border-radius:8px;'
                f'margin:4px;object-fit:cover;border:1px solid #334155;" />'
                f'</a>'
            )
        return format_html(
            '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">{}</div>',
            imgs,
        )

    # ── Fieldsets ─────────────────────────────────────────────────────────────

    fieldsets = (
        ('Parámetros del diseño', {
            'fields': (
                ('session_type', 'project_type'),
                ('style', 'floors'),
                'extra_description',
            ),
        }),
        ('Modelo de IA', {
            'fields': ('model_key',),
        }),
        ('Resultado', {
            'fields': ('status', 'error_message', 'prompt_used', 'renders_preview'),
        }),
        ('Vinculación', {
            'fields': ('lead', 'user'),
        }),
        ('Auditoría', {
            'fields': (('created_at', 'updated_at'),),
            'classes': ('collapse',),
        }),
    )
