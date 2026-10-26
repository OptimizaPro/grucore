from django.db import models
from django.conf import settings


class Page(models.Model):
    slug                = models.SlugField(unique=True, help_text='Identificador único: home, about, contact, services, projects, global')
    title_es            = models.CharField(max_length=200, verbose_name='Título (ES)')
    title_en            = models.CharField(max_length=200, verbose_name='Título (EN)')
    meta_description_es = models.TextField(blank=True, verbose_name='Meta descripción (ES)')
    meta_description_en = models.TextField(blank=True, verbose_name='Meta descripción (EN)')
    is_published        = models.BooleanField(default=True, verbose_name='Publicada')
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Página'
        verbose_name_plural = 'Páginas'
        ordering            = ['slug']

    def __str__(self):
        return self.slug


class Section(models.Model):
    page       = models.ForeignKey(Page, related_name='sections', on_delete=models.CASCADE, verbose_name='Página')
    key        = models.SlugField(help_text='Ej: hero, trust_bar, services, cta')
    label      = models.CharField(max_length=100, verbose_name='Nombre visible en admin')
    order      = models.PositiveIntegerField(default=0, verbose_name='Orden')
    is_visible = models.BooleanField(default=True, verbose_name='Visible')

    class Meta:
        verbose_name        = 'Sección'
        verbose_name_plural = 'Secciones'
        ordering            = ['order']
        unique_together     = ['page', 'key']

    def __str__(self):
        return f'{self.page.slug} › {self.key}'


class Block(models.Model):
    TYPE_TEXT     = 'text'
    TYPE_RICHTEXT = 'richtext'
    TYPE_IMAGE    = 'image'       # legacy: URL textual
    TYPE_IMAGE_ASSET = 'image_asset'  # FK a MediaAsset (preferred)
    TYPE_URL      = 'url'
    TYPE_NUMBER   = 'number'
    TYPE_BOOLEAN  = 'boolean'
    TYPE_JSON     = 'json'

    BLOCK_TYPES = [
        (TYPE_TEXT,         'Texto'),
        (TYPE_RICHTEXT,     'Texto enriquecido'),
        (TYPE_IMAGE,        'Imagen (URL legacy)'),
        (TYPE_IMAGE_ASSET,  'Imagen (MediaAsset)'),
        (TYPE_URL,          'URL'),
        (TYPE_NUMBER,       'Número'),
        (TYPE_BOOLEAN,      'Booleano'),
        (TYPE_JSON,         'JSON (lista o objeto)'),
    ]

    section    = models.ForeignKey(Section, related_name='blocks', on_delete=models.CASCADE, verbose_name='Sección')
    key        = models.SlugField(help_text='Ej: headline, subtitle, cta_text')
    label      = models.CharField(max_length=100, verbose_name='Nombre visible en admin')
    block_type = models.CharField(max_length=20, choices=BLOCK_TYPES, default=TYPE_TEXT, verbose_name='Tipo')
    value_es   = models.TextField(blank=True, verbose_name='Valor (ES)')
    value_en   = models.TextField(blank=True, verbose_name='Valor (EN)')
    # FK para bloques de tipo image_asset
    image_asset = models.ForeignKey(
        'media_assets.MediaAsset',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='cms_blocks',
        verbose_name='Activo de imagen',
        help_text='Usar en lugar de value_es/en cuando block_type = image_asset.',
    )
    order      = models.PositiveIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Bloque'
        verbose_name_plural = 'Bloques'
        ordering            = ['order']
        unique_together     = ['section', 'key']

    def __str__(self):
        return f'{self.section} › {self.key}'
