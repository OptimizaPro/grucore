from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline

from apps.core.admin_mixins import CRUDActionsMixin
from .models import PortfolioProject, PortfolioImage


class PortfolioImageInline(TabularInline):
    model          = PortfolioImage
    extra          = 1
    fields         = ('asset', 'caption_es', 'caption_en', 'sort_order')
    can_delete     = True
    show_change_link = False


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(CRUDActionsMixin, ModelAdmin):
    list_display       = ('cover_thumb', 'title_es', 'project_type', 'year', 'location', 'status', 'featured', 'sort_order')
    list_display_links = ('cover_thumb', 'title_es')
    list_filter        = ('status', 'project_type', 'featured')
    search_fields      = ('title_es', 'title_en', 'location')
    prepopulated_fields = {}      # slug auto-filled in model.save()
    readonly_fields    = ('slug', 'created_at', 'updated_at', 'cover_preview')
    inlines            = [PortfolioImageInline]

    fieldsets = [
        ('Identificación', {
            'fields': ('title_es', 'title_en', 'slug'),
        }),
        ('Clasificación', {
            'fields': ('project_type', 'location', 'year', 'area_m2'),
        }),
        ('Textos', {
            'fields': ('tagline_es', 'tagline_en', 'description_es', 'description_en'),
        }),
        ('Imagen de portada', {
            'fields': ('cover_image', 'cover_preview'),
        }),
        ('Publicación', {
            'fields': ('status', 'featured', 'sort_order'),
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse'],
        }),
    ]

    @admin.display(description='Portada')
    def cover_thumb(self, obj: PortfolioProject) -> str:
        url = obj.cover_url
        if url:
            return format_html(
                '<img src="{}" style="height:48px;width:72px;object-fit:cover;border-radius:4px;" />',
                url,
            )
        return '—'

    @admin.display(description='Vista previa portada')
    def cover_preview(self, obj: PortfolioProject) -> str:
        url = obj.cover_url
        if url:
            return format_html(
                '<img src="{}" style="max-height:280px;max-width:560px;object-fit:contain;border-radius:6px;" />',
                url,
            )
        return '—'
