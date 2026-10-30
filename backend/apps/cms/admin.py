from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline
from .models import Page, Section, Block, MarqueeItem, ServicePage

_PAGE_COLORS = {
    'home':     '#FF6B35',
    'about':    '#6B8CFF',
    'services': '#34D399',
    'contact':  '#F59E0B',
    'projects': '#A78BFA',
    'global':   '#64748B',
}

def _page_color(slug: str) -> str:
    return _PAGE_COLORS.get(slug, '#8A95A5')


class BlockInline(TabularInline):
    model        = Block
    extra        = 0
    fields       = ('order', 'key', 'label', 'block_type', 'value_es', 'value_en', 'image_asset')
    ordering     = ('order',)
    show_change_link = True

    class Media:
        css = {'all': ('css/cms_admin.css',)}
        js  = ('js/cms_block_inline.js',)


class SectionInline(TabularInline):
    model        = Section
    extra        = 0
    fields       = ('order', 'key', 'label', 'is_visible')
    ordering     = ('order',)
    show_change_link = True


@admin.register(Page)
class PageAdmin(ModelAdmin):
    list_display  = ('slug', 'title_es', 'is_published', 'updated_at')
    list_filter   = ('is_published',)
    search_fields = ('slug', 'title_es', 'title_en')
    readonly_fields = ('updated_at',)
    inlines       = [SectionInline]
    fieldsets     = [
        ('Identificación', {'fields': ('slug', 'is_published', 'updated_at')}),
        ('Título',         {'fields': ('title_es', 'title_en')}),
        ('Meta SEO',       {'fields': ('meta_description_es', 'meta_description_en'), 'classes': ['collapse']}),
    ]


@admin.register(Section)
class SectionAdmin(ModelAdmin):
    list_display  = ('page_badge', 'section_key', 'label', 'order', 'is_visible')
    ordering      = ('page__slug', 'order')

    @admin.display(description='Página', ordering='page__slug')
    def page_badge(self, obj):
        slug  = obj.page.slug
        color = _page_color(slug)
        return format_html(
            '<span style="'
            'display:inline-block;padding:2px 10px;border-radius:4px;'
            'font-size:11px;font-weight:600;letter-spacing:.05em;'
            'background:{}22;color:{};border:1px solid {}44'
            '">{}</span>',
            color, color, color, slug.upper(),
        )

    @admin.display(description='Sección', ordering='key')
    def section_key(self, obj):
        return obj.key

    list_filter   = ('page', 'is_visible')
    search_fields = ('key', 'label', 'page__slug')
    inlines       = [BlockInline]
    fieldsets     = [
        (None, {'fields': ('page', 'key', 'label', 'order', 'is_visible')}),
    ]


@admin.register(Block)
class BlockAdmin(ModelAdmin):
    list_display  = ('page_badge', 'section_key', 'block_key', 'label', 'block_type', 'order')
    ordering      = ('section__page__slug', 'section__order', 'order')

    @admin.display(description='Página', ordering='section__page__slug')
    def page_badge(self, obj):
        slug  = obj.section.page.slug
        color = _page_color(slug)
        return format_html(
            '<span style="'
            'display:inline-block;padding:2px 10px;border-radius:4px;'
            'font-size:11px;font-weight:600;letter-spacing:.05em;'
            'background:{}22;color:{};border:1px solid {}44'
            '">{}</span>',
            color, color, color, slug.upper(),
        )

    @admin.display(description='Sección', ordering='section__key')
    def section_key(self, obj):
        return obj.section.key

    @admin.display(description='Bloque', ordering='key')
    def block_key(self, obj):
        return obj.key

    list_filter   = ('section__page', 'block_type')
    search_fields = ('key', 'label', 'value_es', 'value_en', 'section__key', 'section__page__slug')
    readonly_fields = ('image_preview',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('section__page', 'image_asset')
    fieldsets     = [
        (None,         {'fields': ('section', 'key', 'label', 'block_type', 'order')}),
        ('Contenido texto / URL / número', {'fields': ('value_es', 'value_en')}),
        ('Contenido imagen (MediaAsset)',   {'fields': ('image_asset', 'image_preview')}),
    ]

    @admin.display(description='Vista previa')
    def image_preview(self, obj):
        from django.utils.html import format_html
        if obj.image_asset_id:
            return format_html(
                '<img src="{}" style="max-height:200px;max-width:400px;object-fit:contain;border-radius:4px;" />',
                obj.image_asset.url,
            )
        return '—'


@admin.register(ServicePage)
class ServicePageAdmin(ModelAdmin):
    list_display  = ('service_label', 'cover_preview', 'before_preview', 'after_preview', 'updated_at')
    readonly_fields = ('cover_preview', 'before_preview', 'after_preview', 'updated_at')
    ordering      = ('slug',)
    fieldsets     = [
        ('Servicio', {'fields': ('slug', 'updated_at')}),
        ('Imágenes', {'fields': (
            ('cover_image',  'cover_preview'),
            ('before_image', 'before_preview'),
            ('after_image',  'after_preview'),
        )}),
    ]

    @admin.display(description='Servicio')
    def service_label(self, obj):
        return obj.__str__()

    def _thumb(self, asset, label=''):
        if asset:
            return format_html(
                '<img src="{}" style="height:56px;width:80px;object-fit:cover;'
                'border-radius:4px;border:1px solid #27384A;" title="{}" />',
                asset.url, label,
            )
        return format_html('<span style="color:#64748b;font-size:11px;">Sin imagen</span>')

    @admin.display(description='Portada')
    def cover_preview(self, obj):
        return self._thumb(obj.cover_image, 'Portada')

    @admin.display(description='Antes')
    def before_preview(self, obj):
        return self._thumb(obj.before_image, 'Antes')

    @admin.display(description='Después')
    def after_preview(self, obj):
        return self._thumb(obj.after_image, 'Después')


@admin.register(MarqueeItem)
class MarqueeItemAdmin(ModelAdmin):
    list_display         = ('order', 'title_es', 'title_en', 'is_active')
    list_editable        = ('title_es', 'title_en', 'is_active')
    list_display_links   = ('order',)
    ordering             = ('order',)
    list_per_page        = 30
    fieldsets            = [
        (None, {'fields': ('title_es', 'title_en', 'order', 'is_active')}),
    ]
