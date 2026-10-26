from django.db import models
from django.conf import settings


# ─── Pipeline ─────────────────────────────────────────────────────────────────

class Pipeline(models.Model):
    name        = models.CharField(max_length=200, verbose_name='Nombre')
    description = models.TextField(blank=True, verbose_name='Descripción')
    is_default  = models.BooleanField(default=False, verbose_name='Por defecto')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name        = 'Pipeline'
        verbose_name_plural = 'Pipelines'

    def __str__(self):
        return self.name


# ─── Etapa del pipeline ───────────────────────────────────────────────────────

class PipelineStage(models.Model):
    pipeline   = models.ForeignKey(
        Pipeline,
        on_delete=models.CASCADE,
        related_name='stages',
        verbose_name='Pipeline',
    )
    name       = models.CharField(max_length=150, verbose_name='Nombre')
    order      = models.PositiveIntegerField(default=0, verbose_name='Orden')
    color      = models.CharField(max_length=7, default='#8A95A5', verbose_name='Color')
    is_won     = models.BooleanField(default=False, verbose_name='Es ganado')
    is_lost    = models.BooleanField(default=False, verbose_name='Es perdido')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering        = ['pipeline', 'order']
        unique_together = [('pipeline', 'order')]
        verbose_name        = 'Etapa del pipeline'
        verbose_name_plural = 'Etapas del pipeline'

    def __str__(self):
        return f"{self.pipeline.name} — {self.name}"


# ─── Lead ─────────────────────────────────────────────────────────────────────

class LeadSource(models.TextChoices):
    INSTAGRAM      = 'instagram',      'Instagram'
    FACEBOOK       = 'facebook',       'Facebook'
    META_ADS       = 'meta_ads',       'Meta Ads'
    LINKEDIN       = 'linkedin',       'LinkedIn'
    YOUTUBE        = 'youtube',        'YouTube'
    TIKTOK         = 'tiktok',         'TikTok'
    ORGANIC_SEARCH = 'organic_search', 'Búsqueda orgánica'
    REFERRAL       = 'referral',       'Referido'
    WIDGET         = 'widget',         'Widget web'
    DIRECT         = 'direct',         'Directo'
    OTHER          = 'other',          'Otro'


class ServiceType(models.TextChoices):
    CONSTRUCTION = 'construction', 'Construcción'
    RENOVATION   = 'renovation',   'Remodelación'
    COMMERCIAL   = 'commercial',   'Comercial'
    RESIDENTIAL  = 'residential',  'Residencial'
    OTHER        = 'other',        'Otro'


class LeadStatus(models.TextChoices):
    ACTIVE   = 'active',   'Activo'
    WON      = 'won',      'Ganado'
    LOST     = 'lost',     'Perdido'
    ARCHIVED = 'archived', 'Archivado'


class Lead(models.Model):
    pipeline          = models.ForeignKey(
        Pipeline,
        on_delete=models.PROTECT,
        related_name='leads',
        verbose_name='Pipeline',
    )
    stage             = models.ForeignKey(
        PipelineStage,
        on_delete=models.PROTECT,
        related_name='leads',
        verbose_name='Etapa',
    )
    full_name         = models.CharField(max_length=300, verbose_name='Nombre completo')
    email             = models.EmailField(blank=True, verbose_name='Email')
    phone             = models.CharField(max_length=50, blank=True, verbose_name='Teléfono')
    company           = models.CharField(max_length=300, blank=True, verbose_name='Empresa')
    city              = models.CharField(max_length=150, blank=True, verbose_name='Ciudad')
    source            = models.CharField(
        max_length=20,
        choices=LeadSource.choices,
        default=LeadSource.OTHER,
        verbose_name='Fuente',
    )
    service_type      = models.CharField(
        max_length=20,
        choices=ServiceType.choices,
        default=ServiceType.OTHER,
        verbose_name='Tipo de servicio',
    )
    notes             = models.TextField(blank=True, verbose_name='Notas')
    estimated_value_gtq = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='Valor estimado (GTQ)',
    )
    assigned_to       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_leads',
        verbose_name='Asignado a',
    )
    converted_project = models.ForeignKey(
        'projects.Project',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='source_lead',
        verbose_name='Proyecto convertido',
    )
    converted_at      = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de conversión')
    status            = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.ACTIVE,
        verbose_name='Estado',
    )
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name        = 'Lead'
        verbose_name_plural = 'Leads'

    def __str__(self):
        return f"{self.full_name} — {self.stage.name}"


# ─── Actividad de lead ────────────────────────────────────────────────────────

class ActivityType(models.TextChoices):
    NOTE         = 'note',         'Nota'
    CALL         = 'call',         'Llamada'
    EMAIL        = 'email',        'Email'
    MEETING      = 'meeting',      'Reunión'
    STAGE_CHANGE = 'stage_change', 'Cambio de etapa'
    CONVERSION   = 'conversion',   'Conversión a proyecto'


class LeadActivity(models.Model):
    lead          = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name='activities',
        verbose_name='Lead',
    )
    user          = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        verbose_name='Usuario',
    )
    activity_type = models.CharField(
        max_length=20,
        choices=ActivityType.choices,
        verbose_name='Tipo de actividad',
    )
    content       = models.TextField(verbose_name='Contenido')
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name        = 'Actividad de lead'
        verbose_name_plural = 'Actividades de lead'

    def __str__(self):
        return f"{self.get_activity_type_display()} — {self.lead.full_name}"
