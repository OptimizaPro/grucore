from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from apps.core.admin_mixins import CRUDActionsMixin
from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(CRUDActionsMixin, ModelAdmin):
    list_display        = ('thumbnail_preview', 'name', 'alt_es', 'uploaded_by', 'uploaded_at')
    list_display_links  = ('thumbnail_preview', 'name')
    search_fields       = ('name', 'alt_es', 'alt_en')
    readonly_fields     = ('uploaded_at', 'uploaded_by', 'image_preview', 'public_url')
    ordering            = ('-uploaded_at',)

    fieldsets = [
        ('Archivo', {
            'fields': ('file', 'image_preview', 'public_url'),
        }),
        ('Metadatos', {
            'fields': ('name', 'alt_es', 'alt_en'),
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
                '<img src="{}" style="height:48px;width:72px;object-fit:cover;'
                'border-radius:4px;" />',
                obj.url,
            )
        return '—'

    # ── detail preview ──────────────────────────────────────────────────────
    @admin.display(description='Vista previa')
    def image_preview(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html(
                '<img src="{}" style="max-height:320px;max-width:640px;'
                'object-fit:contain;border-radius:6px;" />',
                obj.url,
            )
        return '—'

    # ── public URL copyable ─────────────────────────────────────────────────
    @admin.display(description='URL pública')
    def public_url(self, obj: MediaAsset) -> str:
        if obj.file:
            return format_html('<code style="font-size:0.8em;">{}</code>', obj.url)
        return '—'

    # ── auto-assign uploader on create ─────────────────────────────────────
    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
