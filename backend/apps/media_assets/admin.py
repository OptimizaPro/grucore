from django.contrib import admin
from django.db.models import Q
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from apps.core.admin_mixins import CRUDActionsMixin
from .models import MediaAsset


# ── Filtro: dónde se usa el asset ─────────────────────────────────────────────

class UsageFilter(admin.SimpleListFilter):
    title         = 'Uso'
    parameter_name = 'usage'

    def lookups(self, request, model_admin):
        return [
            ('service',   'Servicios'),
            ('portfolio', 'Portfolio'),
            ('cms_block', 'Bloques CMS'),
            ('unused',    'Sin asignar'),
        ]

    def queryset(self, request, queryset):
        v = self.value()
        if v == 'service':
            return queryset.filter(
                Q(service_covers__isnull=False) |
                Q(service_befores__isnull=False) |
                Q(service_afters__isnull=False)
            ).distinct()
        if v == 'portfolio':
            return queryset.filter(
                Q(portfolio_covers__isnull=False) |
                Q(portfolio_gallery__isnull=False)
            ).distinct()
        if v == 'cms_block':
            return queryset.filter(cms_blocks__isnull=False).distinct()
        if v == 'unused':
            return queryset.filter(
                service_covers__isnull=True,
                service_befores__isnull=True,
                service_afters__isnull=True,
                portfolio_covers__isnull=True,
                portfolio_gallery__isnull=True,
                cms_blocks__isnull=True,
            ).distinct()
        return queryset


@admin.register(MediaAsset)
class MediaAssetAdmin(CRUDActionsMixin, ModelAdmin):
    list_display        = ('thumbnail_preview', 'name', 'context', 'alt_es', 'uploaded_by', 'uploaded_at')
    list_display_links  = ('thumbnail_preview', 'name')
    list_editable       = ('context',)
    search_fields       = ('name', 'alt_es', 'alt_en', 'context')
    list_filter         = (UsageFilter,)
    readonly_fields     = ('uploaded_at', 'uploaded_by', 'image_preview', 'public_url', 'usage_summary')
    ordering            = ('-uploaded_at',)

    fieldsets = [
        ('Archivo', {
            'fields': ('file', 'image_preview', 'public_url'),
        }),
        ('Metadatos', {
            'fields': ('name', 'context', 'alt_es', 'alt_en'),
        }),
        ('Uso actual', {
            'fields': ('usage_summary',),
        }),
        ('Auditoría', {
            'fields': ('uploaded_by', 'uploaded_at'),
            'classes': ['collapse'],
        }),
    ]

    # ── list thumbnail ──────────────────────────────────────────────────────
    @admin.display(description='Preview')
    def thumbnail_preview(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html(
                '<img src="{}" style="height:48px;width:72px;object-fit:cover;border-radius:4px;" />',
                obj.url,
            )
        return '—'

    # ── detail preview ──────────────────────────────────────────────────────
    @admin.display(description='Vista previa')
    def image_preview(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html(
                '<img src="{}" style="max-height:320px;max-width:640px;object-fit:contain;border-radius:6px;" />',
                obj.url,
            )
        return '—'

    # ── public URL copyable ─────────────────────────────────────────────────
    @admin.display(description='URL pública')
    def public_url(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html('<code style="font-size:0.8em;">{}</code>', obj.url)
        return '—'

    # ── uso real (reverse FK lookup) ────────────────────────────────────────
    @admin.display(description='Usado en')
    def usage_summary(self, obj: MediaAsset) -> str:
        if not obj.pk:
            return format_html('<span style="color:#64748b;font-size:11px;">Guarda el archivo primero</span>')

        refs = []

        # ServicePage
        for sp in obj.service_covers.all():
            refs.append(('service', f'{sp} — Portada'))
        for sp in obj.service_befores.all():
            refs.append(('service', f'{sp} — Antes'))
        for sp in obj.service_afters.all():
            refs.append(('service', f'{sp} — Después'))

        # PortfolioProject
        for pp in obj.portfolio_covers.all():
            refs.append(('portfolio', f'{pp} — Portada'))
        for pi in obj.portfolio_gallery.all():
            refs.append(('portfolio', f'{pi.project} — Galería'))

        # CMS Blocks
        for b in obj.cms_blocks.select_related('section__page').all():
            refs.append(('cms', f'{b.section.page.slug} › {b.section.key} › {b.key}'))

        if not refs:
            return format_html('<span style="color:#64748b;font-size:11px;">Sin asignar</span>')

        COLOR = {'service': '#FF6B35', 'portfolio': '#6B8CFF', 'cms': '#34D399'}
        badges = []
        for kind, label in refs:
            color = COLOR.get(kind, '#8A95A5')
            badges.append(format_html(
                '<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;'
                'border-radius:4px;font-size:11px;font-weight:600;'
                'background:{0}22;color:{0};border:1px solid {0}44">{1}</span>',
                color, label,
            ))
        return format_html(''.join(b for b in badges))

    # ── auto-assign uploader on create ─────────────────────────────────────
    def save_model(self, request, obj, form, change):
        import traceback, sys
        try:
            if not change:
                obj.uploaded_by = request.user
            super().save_model(request, obj, form, change)
        except Exception:
            traceback.print_exc(file=sys.stdout)
            raise
