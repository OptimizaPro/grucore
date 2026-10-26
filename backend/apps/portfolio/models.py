from django.db import models
from django.utils.text import slugify
from apps.projects.models import ProjectType


class PortfolioProject(models.Model):
    """
    Proyecto público de portafolio.
    Desacoplado de apps.projects.Project para poder publicar casos de estudio
    sin exponer datos internos (costos, fases, tareas).
    """

    class Status(models.TextChoices):
        DRAFT     = 'draft',     'Borrador'
        PUBLISHED = 'published', 'Publicado'

    # ── Identificación ──────────────────────────────────────────────────────
    title_es   = models.CharField(max_length=200, verbose_name='Título (ES)')
    title_en   = models.CharField(max_length=200, blank=True, verbose_name='Título (EN)')
    slug       = models.SlugField(max_length=220, unique=True, blank=True, verbose_name='Slug')

    # ── Clasificación ───────────────────────────────────────────────────────
    project_type = models.CharField(
        max_length=30,
        choices=ProjectType.choices,
        verbose_name='Tipo de proyecto',
    )
    location   = models.CharField(max_length=200, blank=True, verbose_name='Ubicación')
    year       = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name='Año')
    area_m2    = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True,
        verbose_name='Área (m²)',
    )

    # ── Textos ──────────────────────────────────────────────────────────────
    tagline_es      = models.CharField(max_length=300, blank=True, verbose_name='Tagline (ES)')
    tagline_en      = models.CharField(max_length=300, blank=True, verbose_name='Tagline (EN)')
    description_es  = models.TextField(blank=True, verbose_name='Descripción (ES)')
    description_en  = models.TextField(blank=True, verbose_name='Descripción (EN)')

    # ── Imágenes ─────────────────────────────────────────────────────────────
    cover_image = models.ForeignKey(
        'media_assets.MediaAsset',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='portfolio_covers',
        verbose_name='Imagen de portada',
    )

    # ── Publicación ──────────────────────────────────────────────────────────
    status       = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name='Estado',
    )
    featured     = models.BooleanField(default=False, verbose_name='Destacado')
    sort_order   = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Proyecto de portafolio'
        verbose_name_plural = 'Proyectos de portafolio'
        ordering            = ['sort_order', '-year', '-created_at']

    def __str__(self):
        return self.title_es

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title_es)
            slug, n = base, 1
            while PortfolioProject.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def cover_url(self) -> str:
        return self.cover_image.url if self.cover_image_id else ''


class PortfolioImage(models.Model):
    """Galería de imágenes adicionales para un proyecto de portafolio."""

    project    = models.ForeignKey(
        PortfolioProject,
        on_delete=models.CASCADE,
        related_name='gallery_images',
        verbose_name='Proyecto',
    )
    asset      = models.ForeignKey(
        'media_assets.MediaAsset',
        on_delete=models.CASCADE,
        related_name='portfolio_gallery',
        verbose_name='Activo multimedia',
    )
    caption_es = models.CharField(max_length=300, blank=True, verbose_name='Pie de foto (ES)')
    caption_en = models.CharField(max_length=300, blank=True, verbose_name='Pie de foto (EN)')
    sort_order = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Imagen de galería'
        verbose_name_plural = 'Imágenes de galería'
        ordering            = ['sort_order']

    def __str__(self):
        return f'{self.project} — imagen {self.sort_order}'
