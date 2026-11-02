from django.db import models
from django.conf import settings


# ─── Choices ──────────────────────────────────────────────────────────────────

class SessionType(models.TextChoices):
    NEW_CONSTRUCTION = 'new_construction', 'Nueva Construcción'
    REMODEL          = 'remodel',          'Remodelación'


class ArchStyle(models.TextChoices):
    MODERN        = 'modern',        'Moderno'
    MINIMALIST    = 'minimalist',    'Minimalista'
    MEDITERRANEAN = 'mediterranean', 'Mediterráneo'
    INDUSTRIAL    = 'industrial',    'Industrial'
    RUSTIC        = 'rustic',        'Rústico'
    CONTEMPORARY  = 'contemporary',  'Contemporáneo'
    COLONIAL      = 'colonial',      'Colonial / Clásico'


class ProjectType(models.TextChoices):
    HOUSE      = 'house',      'Casa Residencial'
    APARTMENT  = 'apartment',  'Apartamento'
    COMMERCIAL = 'commercial', 'Local Comercial'
    OFFICE     = 'office',     'Oficina'
    OTHER      = 'other',      'Otro'


class SessionStatus(models.TextChoices):
    PENDING    = 'pending',    'Pendiente'
    GENERATING = 'generating', 'Generando'
    COMPLETED  = 'completed',  'Completado'
    FAILED     = 'failed',     'Fallido'


class ModelKey(models.TextChoices):
    FLUX_SCHNELL_HF = 'flux_schnell_hf', 'FLUX.1-schnell — HuggingFace (Gratis)'
    DALLE3_OPENAI   = 'dalle3_openai',   'DALL·E 3 — OpenAI'
    FLUX_PRO_FAL    = 'flux_pro_fal',    'FLUX.1-pro — fal.ai (Producción)'


# ─── DesignSession ─────────────────────────────────────────────────────────────

class DesignSession(models.Model):
    user         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='design_sessions',
        verbose_name='Usuario',
    )
    lead         = models.ForeignKey(
        'crm.Lead',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='design_sessions',
        verbose_name='Lead vinculado',
    )

    # ── Session parameters ────────────────────────────────────────────────────
    session_type = models.CharField(
        max_length=20,
        choices=SessionType.choices,
        default=SessionType.NEW_CONSTRUCTION,
        verbose_name='Tipo de proyecto',
    )
    style        = models.CharField(
        max_length=20,
        choices=ArchStyle.choices,
        default=ArchStyle.MODERN,
        verbose_name='Estilo arquitectónico',
    )
    project_type = models.CharField(
        max_length=20,
        choices=ProjectType.choices,
        default=ProjectType.HOUSE,
        verbose_name='Tipo de inmueble',
    )
    floors       = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        verbose_name='Número de pisos',
    )
    extra_description = models.TextField(
        blank=True,
        verbose_name='Descripción adicional',
        help_text='Detalles extra para guiar la generación: materiales, ambientes, preferencias.',
    )

    # ── AI model selection ────────────────────────────────────────────────────
    model_key    = models.CharField(
        max_length=30,
        choices=ModelKey.choices,
        default=ModelKey.FLUX_SCHNELL_HF,
        verbose_name='Modelo de IA',
    )

    # ── Input images (for remodeling) ─────────────────────────────────────────
    input_images = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Imágenes de entrada',
        help_text='Lista de rutas relativas a MEDIA_ROOT.',
    )

    # ── Generated renders ─────────────────────────────────────────────────────
    renders      = models.JSONField(
        default=list,
        blank=True,
        verbose_name='Renders generados',
    )

    # ── Status ────────────────────────────────────────────────────────────────
    status        = models.CharField(
        max_length=15,
        choices=SessionStatus.choices,
        default=SessionStatus.PENDING,
        verbose_name='Estado',
    )
    error_message = models.TextField(blank=True, verbose_name='Error')

    # ── Prompt saved for transparency ─────────────────────────────────────────
    prompt_used   = models.TextField(blank=True, verbose_name='Prompt utilizado')

    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering        = ['-created_at']
        verbose_name        = 'Sesión de diseño'
        verbose_name_plural = 'Sesiones de diseño'

    def __str__(self):
        return f"{self.get_session_type_display()} — {self.get_style_display()} ({self.user})"
