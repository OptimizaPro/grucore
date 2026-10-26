from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class ProjectType(models.TextChoices):
    RESIDENTIAL  = 'residential',  'Residencial'
    COMMERCIAL   = 'commercial',   'Comercial'
    INDUSTRIAL   = 'industrial',   'Industrial'
    RENOVATION   = 'renovation',   'Remodelación'
    DESIGN_BUILD = 'design_build', 'Diseño y construcción'


class ProjectStatus(models.TextChoices):
    DRAFT      = 'draft',      'Borrador'
    ACTIVE     = 'active',     'Activo'
    PAUSED     = 'paused',     'Pausado'
    COMPLETED  = 'completed',  'Completado'
    CANCELLED  = 'cancelled',  'Cancelado'


class TaskStatus(models.TextChoices):
    PENDING     = 'pending',     'Pendiente'
    IN_PROGRESS = 'in_progress', 'En progreso'
    REVIEW      = 'review',      'En revisión'
    DONE        = 'done',        'Completado'
    BLOCKED     = 'blocked',     'Bloqueado'
    CANCELLED   = 'cancelled',   'Cancelado'


class TaskPriority(models.TextChoices):
    LOW      = 'low',      'Baja'
    MEDIUM   = 'medium',   'Media'
    HIGH     = 'high',     'Alta'
    CRITICAL = 'critical', 'Crítica'
    URGENT   = 'urgent',   'Urgente'


class Currency(models.TextChoices):
    GTQ = 'GTQ', 'Quetzal (Q)'
    USD = 'USD', 'Dólar ($)'


# ─── Cliente ──────────────────────────────────────────────────────────────────

class Client(models.Model):
    name             = models.CharField(max_length=200, verbose_name='Nombre')
    email            = models.EmailField(blank=True)
    phone            = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    company          = models.CharField(max_length=200, blank=True, verbose_name='Empresa')
    nit              = models.CharField(max_length=20, blank=True, verbose_name='NIT')
    address          = models.TextField(blank=True, verbose_name='Dirección')
    portal_user      = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='client_profile',
        verbose_name='Usuario del portal',
    )
    avatar           = models.ImageField(upload_to='clients/avatars/', blank=True, null=True, verbose_name='Avatar')
    preferred_language = models.CharField(max_length=5, default='es')
    preferred_currency = models.CharField(max_length=3, choices=Currency.choices, default='GTQ')
    created_at       = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at       = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['name']

    def __str__(self):
        return self.name


# ─── Proyecto ─────────────────────────────────────────────────────────────────

class Project(models.Model):
    client           = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='projects', verbose_name='Cliente')
    project_manager  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='managed_projects',
        verbose_name='Director de proyecto',
    )
    name             = models.CharField(max_length=300, verbose_name='Nombre del proyecto')
    slug             = models.SlugField(unique=True, blank=True, verbose_name='Slug (URL amigable)')
    description      = models.TextField(blank=True, verbose_name='Descripción del proyecto')
    project_type     = models.CharField(max_length=20, choices=ProjectType.choices, default=ProjectType.RESIDENTIAL, verbose_name='Tipo de proyecto')
    status           = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.DRAFT, verbose_name='Estado del proyecto')

    # Ubicación
    address          = models.TextField(blank=True, verbose_name='Dirección de la obra')
    city             = models.CharField(max_length=100, blank=True, default='Ciudad de Guatemala')
    department       = models.CharField(max_length=100, blank=True, default='Guatemala')

    # Fechas
    start_date       = models.DateField(null=True, blank=True, verbose_name='Fecha de inicio')
    estimated_end    = models.DateField(null=True, blank=True, verbose_name='Fecha estimada de finalización')
    actual_end       = models.DateField(null=True, blank=True, verbose_name='Fecha de finalización real')

    # Presupuesto — siempre en GTQ; USD se calcula al vuelo
    base_currency           = models.CharField(max_length=3, choices=Currency.choices, default='GTQ', verbose_name='Moneda base')
    total_budget_gtq        = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='Presupuesto total (GTQ)')
    exchange_rate_snapshot  = models.DecimalField(
        max_digits=10, decimal_places=4,
        default=7.75,
        verbose_name='Tipo de cambio GTQ/USD al crear',
    )

    # Portafolio público
    is_public_portfolio = models.BooleanField(default=False, verbose_name='Mostrar en portafolio público')
    cover_photo         = models.ImageField(
        upload_to='project_covers/',
        null=True, blank=True,
        verbose_name='Foto de portada (archivo)',
    )
    cover_photo_url     = models.URLField(blank=True, verbose_name='Foto de portada (URL externa)')

    # SEO (para páginas de portafolio)
    name_en          = models.CharField(max_length=300, blank=True, verbose_name='Nombre (inglés)')
    description_en   = models.TextField(blank=True, verbose_name='Descripción (inglés)')
    seo_description  = models.CharField(max_length=160, blank=True)

    created_by       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_projects',
        verbose_name='Creado por'
    )
    created_at       = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at       = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def total_budget_usd(self):
        if self.exchange_rate_snapshot:
            return round(float(self.total_budget_gtq) / float(self.exchange_rate_snapshot), 2)
        return None

    @property
    def progress_percentage(self):
        phases = self.phases.all()
        if not phases.exists():
            return 0
        completed = phases.filter(status='completed').count()
        return round((completed / phases.count()) * 100)

    # ── Propiedades de presupuesto (calculadas desde versiones aprobadas) ──────

    @property
    def current_contract_value_gtq(self):
        """Valor de contrato vigente = suma de revenue_gtq de todas las versiones aprobadas."""
        from decimal import Decimal
        from django.db.models import Sum
        result = self.budgets.filter(status='approved').aggregate(total=Sum('revenue_gtq'))['total']
        return result or Decimal('0')

    @property
    def current_budget_cost_gtq(self):
        """Costo presupuestado vigente = suma de cost_gtq de todas las versiones aprobadas."""
        from decimal import Decimal
        from django.db.models import Sum
        result = self.budgets.filter(status='approved').aggregate(total=Sum('cost_gtq'))['total']
        return result or Decimal('0')

    @property
    def original_budget(self):
        """Primera versión original aprobada, o None si aún no existe."""
        return self.budgets.filter(version_type='original', status='approved').first()


# ─── Fase ─────────────────────────────────────────────────────────────────────

class Phase(models.Model):
    project    = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='phases', verbose_name='Proyecto')
    name       = models.CharField(max_length=200, verbose_name='Nombre de la fase')
    order      = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')
    status     = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.DRAFT, verbose_name='Estado')
    start_date = models.DateField(null=True, blank=True, verbose_name='Fecha de inicio')
    end_date   = models.DateField(null=True, blank=True, verbose_name='Fecha de finalización')
    budget_allocated_gtq = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='Presupuesto asignado (GTQ)')

    class Meta:
        verbose_name = 'Fase'
        verbose_name_plural = 'Fases'
        ordering = ['order']

    def __str__(self):
        return f'{self.project.name} — {self.name}'


# ─── Tarea ────────────────────────────────────────────────────────────────────

class Task(models.Model):
    project      = models.ForeignKey(
        'Project',
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name='Proyecto',
        null=True, blank=True,          # nullable for backward compat; filled on create
    )
    phase        = models.ForeignKey(Phase, on_delete=models.SET_NULL, null=True, blank=True, related_name='phase_tasks', verbose_name='Fase')
    assigned_to  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_tasks',
        verbose_name='Asignada a'
    )
    created_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_tasks',
    )
    title        = models.CharField(max_length=300, verbose_name='Título de la tarea')
    description  = models.TextField(blank=True, verbose_name='Descripción de la tarea')
    status       = models.CharField(max_length=20, choices=TaskStatus.choices, default=TaskStatus.PENDING, verbose_name='Estado de la tarea')
    priority     = models.CharField(max_length=10, choices=TaskPriority.choices, default=TaskPriority.MEDIUM, verbose_name='Prioridad')
    due_date     = models.DateField(null=True, blank=True, verbose_name='Fecha de vencimiento')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='Completado el')
    estimated_hours = models.DecimalField(max_digits=6, decimal_places=1, default=0, verbose_name='Horas estimadas')
    actual_hours    = models.DecimalField(max_digits=6, decimal_places=1, default=0, verbose_name='Horas reales')
    created_at   = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at   = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'
        ordering = ['priority', 'due_date']

    def save(self, *args, **kwargs):
        if self.status == TaskStatus.DONE and not self.completed_at:
            self.completed_at = timezone.now()
        elif self.status != TaskStatus.DONE:
            self.completed_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


# ─── Actualización de progreso / Bitácora ────────────────────────────────────

class ProgressUpdate(models.Model):
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='progress_updates', verbose_name='Proyecto')
    phase       = models.ForeignKey(Phase, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Fase')
    date        = models.DateField(verbose_name='Fecha')
    progress_pct = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='Avance (%)',
    )
    weather     = models.CharField(max_length=50, blank=True, verbose_name='Clima')
    temperature = models.SmallIntegerField(null=True, blank=True, verbose_name='Temperatura')
    labor_count = models.PositiveSmallIntegerField(default=0, verbose_name='Personal en obra')
    activities  = models.JSONField(default=list, verbose_name='Actividades')
    equipment   = models.JSONField(default=list, verbose_name='Equipo')
    materials   = models.JSONField(default=list, verbose_name='Materiales')
    notes       = models.TextField(blank=True, verbose_name='Notas')
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        verbose_name='Creado por',
    )
    created_at  = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')

    class Meta:
        verbose_name = 'Actualización de progreso'
        verbose_name_plural = 'Actualizaciones de progreso'
        ordering = ['-date']

    def __str__(self):
        return f'{self.project.name} — {self.date} ({self.progress_pct}%)'


class ProgressPhoto(models.Model):
    update      = models.ForeignKey(ProgressUpdate, on_delete=models.CASCADE, related_name='photos', verbose_name='Actualización de progreso')
    photo       = models.ImageField(upload_to='progress/%Y/%m/', null=True, blank=True, verbose_name='Foto (subir archivo)')
    photo_url   = models.URLField(blank=True, verbose_name='URL de foto externa')
    caption     = models.CharField(max_length=300, blank=True, verbose_name='Leyenda')
    taken_at    = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de toma')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Subido el')

    @property
    def image_url(self):
        """Retorna la URL de la imagen: archivo subido tiene prioridad sobre URL externa."""
        if self.photo:
            return self.photo.url
        return self.photo_url

    class Meta:
        verbose_name = 'Foto de progreso'
        verbose_name_plural = 'Fotos de progreso'


# ─── Hitos de pago ────────────────────────────────────────────────────────────

class MilestoneStatus(models.TextChoices):
    PENDING            = 'pending',            'Pendiente'
    EVIDENCE_SUBMITTED = 'evidence_submitted', 'Evidencia enviada'
    AWAITING_APPROVAL  = 'awaiting_approval',  'Pendiente de aprobación'
    APPROVED           = 'approved',           'Aprobado por ambas partes'
    PAID               = 'paid',               'Pagado'
    DISPUTED           = 'disputed',           'En disputa'


class PaymentMilestone(models.Model):
    project               = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    phase                 = models.ForeignKey(
        Phase, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='milestones',
        verbose_name='Fase vinculada',
    )
    name                  = models.CharField(max_length=300, verbose_name='Nombre del hito')
    description           = models.TextField(blank=True, verbose_name='Descripción')
    order                 = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')
    amount_gtq            = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name='Monto (GTQ)',
    )
    progress_required_pct = models.PositiveSmallIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name='% de avance requerido para desbloquear',
    )
    status                = models.CharField(
        max_length=30,
        choices=MilestoneStatus.choices,
        default=MilestoneStatus.PENDING,
    )
    due_date              = models.DateField(null=True, blank=True, verbose_name='Fecha estimada')
    paid_at               = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de pago')
    notes                 = models.TextField(blank=True, verbose_name='Notas internas')
    created_at            = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at            = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name        = 'Hito de pago'
        verbose_name_plural = 'Hitos de pago'
        ordering            = ['order']

    def __str__(self):
        return f'{self.project.name} — {self.name}'

    @property
    def amount_usd(self):
        rate = self.project.exchange_rate_snapshot
        if rate:
            return round(float(self.amount_gtq) / float(rate), 2)
        return None

    @property
    def percentage_of_total(self):
        budget = self.project.total_budget_gtq
        if budget:
            return round(float(self.amount_gtq) / float(budget) * 100, 1)
        return 0


class MilestoneEvidence(models.Model):
    """Fotografías de evidencia adjuntas a un hito de pago."""
    milestone   = models.ForeignKey(PaymentMilestone, on_delete=models.CASCADE, related_name='evidence')
    photo_url   = models.URLField(verbose_name='URL de la foto')
    caption     = models.CharField(max_length=300, blank=True, verbose_name='Leyenda')
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='uploaded_evidence',
        verbose_name='Subido por'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Subido el')

    class Meta:
        verbose_name        = 'Evidencia de hito'
        verbose_name_plural = 'Evidencias de hito'
        ordering            = ['-uploaded_at']

    def __str__(self):
        return f'Evidencia — {self.milestone.name}'


class ApprovalStatus(models.TextChoices):
    PENDING          = 'pending',          'Pendiente'
    COMPANY_APPROVED = 'company_approved', 'Aprobado por constructora'
    CLIENT_APPROVED  = 'client_approved',  'Aprobado por cliente'
    FULLY_APPROVED   = 'fully_approved',   'Aprobado por ambas partes'
    REJECTED         = 'rejected',         'Rechazado'


class MilestoneApproval(models.Model):
    """
    Registro de doble firma: constructora + cliente.
    Se crea automáticamente cuando un hito pasa a AWAITING_APPROVAL.
    """
    milestone = models.OneToOneField(
        PaymentMilestone, on_delete=models.CASCADE,
        related_name='approval',
        verbose_name='Hito de pago',
    )
    status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        verbose_name='Estado de aprobación',
    )

    # — Lado constructora —
    company_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='company_approvals',
        verbose_name='Aprobado por (constructora)',
    )
    company_approved_at = models.DateTimeField(null=True, blank=True, verbose_name='Aprobado por (constructora) el')
    company_notes       = models.TextField(blank=True, verbose_name='Notas (constructora)')

    # — Lado cliente —
    client_approved_at  = models.DateTimeField(null=True, blank=True, verbose_name='Aprobado por (cliente) el')
    client_ip_address   = models.GenericIPAddressField(null=True, blank=True, verbose_name='Dirección IP (cliente)')
    client_notes        = models.TextField(blank=True, verbose_name='Notas (cliente)')

    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name        = 'Aprobación de hito'
        verbose_name_plural = 'Aprobaciones de hito'

    def __str__(self):
        return f'Aprobación — {self.milestone.name} ({self.status})'

    def _sync_status(self):
        """Actualiza status según qué partes han aprobado."""
        has_company = bool(self.company_approved_at)
        has_client  = bool(self.client_approved_at)
        if has_company and has_client:
            self.status = ApprovalStatus.FULLY_APPROVED
            self.milestone.status = MilestoneStatus.APPROVED
            self.milestone.save(update_fields=['status', 'updated_at'])
        elif has_company:
            self.status = ApprovalStatus.COMPANY_APPROVED
        elif has_client:
            self.status = ApprovalStatus.CLIENT_APPROVED

    def approve_company(self, user, notes=''):
        self.company_approved_by = user
        self.company_approved_at = timezone.now()
        self.company_notes       = notes
        self._sync_status()
        self.save()

    def approve_client(self, ip_address=None, notes=''):
        self.client_approved_at = timezone.now()
        self.client_ip_address  = ip_address
        self.client_notes       = notes
        self._sync_status()
        self.save()


# ─── Contactos del proyecto ───────────────────────────────────────────────────

class ProjectContact(models.Model):
    project    = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='contacts', verbose_name='Proyecto')
    name       = models.CharField(max_length=200, verbose_name='Nombre')
    role       = models.CharField(max_length=200, blank=True, verbose_name='Cargo')
    company    = models.CharField(max_length=200, blank=True, verbose_name='Empresa')
    email      = models.EmailField(blank=True, verbose_name='Email')
    phone      = models.CharField(max_length=30, blank=True, verbose_name='Teléfono')
    avatar_url = models.URLField(blank=True, verbose_name='Avatar URL')
    avatar     = models.ImageField(upload_to='contacts/avatars/', blank=True, null=True, verbose_name='Avatar (archivo)')
    order      = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Contacto del proyecto'
        verbose_name_plural = 'Contactos del proyecto'
        ordering            = ['order', 'created_at']

    def __str__(self):
        return f'{self.name} — {self.project.name}'


# ─── Notas internas del proyecto ─────────────────────────────────────────────

class ProjectNote(models.Model):
    project    = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes', verbose_name='Proyecto')
    author     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='project_notes',
        verbose_name='Autor',
    )
    body       = models.TextField(verbose_name='Contenido')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Nota interna'
        verbose_name_plural = 'Notas internas'
        ordering            = ['-created_at']

    def __str__(self):
        return f'Nota — {self.project.name} ({self.author})'


# ─── Cotización ──────────────────────────────────────────────────────────────

class Quote(models.Model):
    STATUS_CHOICES = [
        ('draft',             'Borrador'),
        ('sent',              'Enviada'),
        ('changes_requested', 'Cambios solicitados'),
        ('approved',          'Aprobada'),
        ('rejected',          'Rechazada'),
    ]

    project        = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='quotes', verbose_name='Proyecto')
    revision       = models.PositiveSmallIntegerField(default=1, verbose_name='Revisión')
    quote_number   = models.CharField(max_length=30, unique=True, blank=True, verbose_name='Número de cotización')
    status         = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft', verbose_name='Estado')
    valid_until    = models.DateField(null=True, blank=True, verbose_name='Válida hasta')
    notes          = models.TextField(blank=True, verbose_name='Notas / Condiciones')
    discount_pct   = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='Descuento (%)')
    tax_pct        = models.DecimalField(max_digits=5, decimal_places=2, default=12, verbose_name='IVA (%)')
    client_comment = models.TextField(blank=True, verbose_name='Comentario del cliente')
    created_by     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='quotes_created',
        verbose_name='Creada por',
    )
    sent_at    = models.DateTimeField(null=True, blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Cotización'
        verbose_name_plural = 'Cotizaciones'
        ordering            = ['-revision', '-created_at']

    def save(self, *args, **kwargs):
        if not self.quote_number:
            from django.utils import timezone
            year = timezone.now().year
            count = Quote.objects.filter(created_at__year=year).count()
            self.quote_number = f'COT-{year}-{str(count + 1).zfill(3)}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Cotización #{self.revision} — {self.project.name} ({self.get_status_display()})'


class QuoteLineItem(models.Model):
    CATEGORY_CHOICES = [
        ('materials', 'Materiales'),
        ('labor',     'Mano de obra'),
        ('equipment', 'Equipos'),
        ('other',     'Otros'),
    ]

    quote       = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='line_items', verbose_name='Cotización')
    product     = models.ForeignKey(
        'inventory.Product',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='quote_line_items',
        verbose_name='Producto de inventario',
    )
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other', verbose_name='Categoría')
    description = models.CharField(max_length=500, verbose_name='Descripción')
    quantity    = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Cantidad')
    unit        = models.CharField(max_length=50, blank=True, verbose_name='Unidad')
    unit_price  = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='Precio unitario')
    order       = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Partida de cotización'
        verbose_name_plural = 'Partidas de cotización'
        ordering            = ['order', 'id']

    @property
    def subtotal(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f'{self.description} ({self.quantity} {self.unit} × Q{self.unit_price})'


# ─── Plantillas de cotización ─────────────────────────────────────────────────

class QuoteTemplate(models.Model):
    name        = models.CharField(max_length=200, verbose_name='Nombre')
    description = models.TextField(blank=True, verbose_name='Descripción')
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='quote_templates_created',
        verbose_name='Creada por',
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Plantilla de cotización'
        verbose_name_plural = 'Plantillas de cotización'
        ordering            = ['name']

    def __str__(self):
        return self.name


class QuoteTemplateLineItem(models.Model):
    CATEGORY_CHOICES = [
        ('materials', 'Materiales'),
        ('labor',     'Mano de obra'),
        ('equipment', 'Equipos'),
        ('other',     'Otros'),
    ]

    template    = models.ForeignKey(QuoteTemplate, on_delete=models.CASCADE, related_name='line_items', verbose_name='Plantilla')
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other', verbose_name='Categoría')
    description = models.CharField(max_length=500, verbose_name='Descripción')
    quantity    = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Cantidad')
    unit        = models.CharField(max_length=50, blank=True, verbose_name='Unidad')
    unit_price  = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='Precio referencia')
    order       = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Partida de plantilla'
        verbose_name_plural = 'Partidas de plantilla'
        ordering            = ['order', 'id']

    def __str__(self):
        return f'{self.description} — {self.template.name}'


# ─── Presupuesto de proyecto (versionado) ────────────────────────────────────

class BudgetVersionType(models.TextChoices):
    ORIGINAL = 'original', 'Original (primer presupuesto aprobado)'
    REVISION = 'revision', 'Revisión (orden de cambio aprobada)'


class BudgetStatus(models.TextChoices):
    DRAFT    = 'draft',    'Borrador'
    APPROVED = 'approved', 'Aprobado'


class ProjectBudget(models.Model):
    """
    Versión de presupuesto de un proyecto.

    Reglas de integridad:
    - Solo puede existir UN registro con version_type='original' y status='approved' por proyecto.
    - Una vez aprobado (status='approved'), los campos financieros son inmutables.
    - El valor de contrato actual = suma de revenue_gtq de todas las versiones aprobadas.
    - El costo presupuestado actual = suma de cost_gtq de todas las versiones aprobadas.
    - Las revisiones se originan siempre desde una ChangeOrder aprobada.
    """
    project              = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='budgets',
        verbose_name='Proyecto',
    )
    version_number       = models.PositiveSmallIntegerField(editable=False, verbose_name='Versión')
    version_type         = models.CharField(max_length=10, choices=BudgetVersionType.choices, verbose_name='Tipo')
    status               = models.CharField(max_length=10, choices=BudgetStatus.choices, default=BudgetStatus.DRAFT, verbose_name='Estado')

    # ── Montos (deltas) ───────────────────────────────────────────────────────
    # Para 'original': monto total del contrato / costo presupuestado inicial.
    # Para 'revision': delta de la orden de cambio (positivo=aumento, negativo=reducción).
    revenue_gtq          = models.DecimalField(
        max_digits=16, decimal_places=2, default=0,
        verbose_name='Ingreso contractual (GTQ)',
        help_text='Original: valor total del contrato. Revisión: delta de la OC (+ aumento / − reducción).',
    )
    cost_gtq             = models.DecimalField(
        max_digits=16, decimal_places=2, default=0,
        verbose_name='Costo presupuestado (GTQ)',
        help_text='Original: costo total presupuestado. Revisión: delta de costo de la OC.',
    )

    # ── Documentos fuente ─────────────────────────────────────────────────────
    linked_quote         = models.ForeignKey(
        'Quote',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='budget_versions',
        verbose_name='Cotización origen',
        help_text='Cotización aprobada que originó este presupuesto (solo versión original).',
    )
    linked_change_order  = models.ForeignKey(
        'change_orders.ChangeOrder',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='budget_revisions',
        verbose_name='Orden de cambio origen',
        help_text='Orden de cambio que originó esta revisión.',
    )

    # ── Aprobación ────────────────────────────────────────────────────────────
    approved_by          = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_budgets',
        verbose_name='Aprobado por',
    )
    approved_at          = models.DateTimeField(null=True, blank=True, verbose_name='Aprobado el')

    notes                = models.TextField(blank=True, verbose_name='Notas / motivo del cambio')
    created_by           = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_budgets',
        verbose_name='Creado por',
    )
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Versión de presupuesto'
        verbose_name_plural = 'Presupuesto (versiones)'
        unique_together     = [('project', 'version_number')]
        ordering            = ['project', 'version_number']

    def __str__(self):
        return f'{self.project.name} — v{self.version_number} ({self.get_version_type_display()}) [{self.get_status_display()}]'

    def save(self, *args, **kwargs):
        # Auto-incrementar version_number por proyecto
        if not self.pk:
            last = ProjectBudget.objects.filter(project=self.project).aggregate(
                m=models.Max('version_number')
            )['m'] or 0
            self.version_number = last + 1
        # Bloquear modificación de campos financieros en presupuestos aprobados
        if self.pk:
            original = ProjectBudget.objects.filter(pk=self.pk).values(
                'status', 'revenue_gtq', 'cost_gtq', 'version_type', 'project_id'
            ).first()
            if original and original['status'] == BudgetStatus.APPROVED:
                immutable = ['revenue_gtq', 'cost_gtq', 'version_type', 'project_id']
                for field in immutable:
                    if getattr(self, field if field != 'project_id' else 'project_id') != original[field]:
                        from django.core.exceptions import ValidationError
                        raise ValidationError(
                            f'El presupuesto aprobado es inmutable. No se puede modificar "{field}".'
                        )
        super().save(*args, **kwargs)

    def approve(self, user):
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        if self.status == BudgetStatus.APPROVED:
            raise ValidationError('Este presupuesto ya está aprobado.')
        if self.version_type == BudgetVersionType.ORIGINAL:
            already = ProjectBudget.objects.filter(
                project=self.project,
                version_type=BudgetVersionType.ORIGINAL,
                status=BudgetStatus.APPROVED,
            ).exclude(pk=self.pk).exists()
            if already:
                raise ValidationError('Ya existe un presupuesto original aprobado para este proyecto.')
        self.status      = BudgetStatus.APPROVED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])
        # Sincronizar total_budget_gtq en el proyecto (campo legacy — se mantiene actualizado)
        self.project.total_budget_gtq = self.project.current_budget_cost_gtq
        self.project.save(update_fields=['total_budget_gtq', 'updated_at'])

    # ── Propiedades calculadas ─────────────────────────────────────────────────

    @property
    def margin_gtq(self):
        return self.revenue_gtq - self.cost_gtq

    @property
    def margin_pct(self):
        if self.revenue_gtq:
            from decimal import Decimal, ROUND_HALF_UP
            return (self.margin_gtq / self.revenue_gtq * 100).quantize(
                Decimal('0.1'), rounding=ROUND_HALF_UP
            )
        return None

    # ── Constructores desde documentos fuente ─────────────────────────────────

    @classmethod
    def create_from_quote(cls, quote, user):
        """
        Crea el presupuesto original desde una cotización aprobada.
        Las partidas de cotización se copian como líneas de presupuesto.
        El costo unitario se inicializa en 0 — el equipo lo completa luego.
        """
        from django.core.exceptions import ValidationError
        if quote.status != 'approved':
            raise ValidationError('La cotización debe estar aprobada para generar el presupuesto.')
        existing = cls.objects.filter(
            project=quote.project,
            version_type=BudgetVersionType.ORIGINAL,
        ).exists()
        if existing:
            raise ValidationError('Ya existe una versión original para este proyecto.')

        # Calcular revenue total de la cotización (con descuento, sin IVA)
        lines = quote.line_items.all()
        subtotal = sum(li.subtotal for li in lines)
        discount = subtotal * quote.discount_pct / 100
        revenue  = subtotal - discount

        budget = cls.objects.create(
            project             = quote.project,
            version_type        = BudgetVersionType.ORIGINAL,
            status              = BudgetStatus.DRAFT,
            revenue_gtq         = revenue,
            cost_gtq            = 0,
            linked_quote        = quote,
            notes               = f'Generado desde cotización {quote.quote_number}',
            created_by          = user,
        )
        for i, li in enumerate(lines.order_by('order', 'id'), start=1):
            ProjectBudgetLine.objects.create(
                budget          = budget,
                description     = li.description,
                unit            = li.unit,
                quantity        = li.quantity,
                unit_price_gtq  = li.unit_price,
                unit_cost_gtq   = 0,   # completar: costo interno estimado
                order           = i,
            )
        return budget

    @classmethod
    def create_revision_from_change_order(cls, change_order, cost_delta_gtq, user, notes=''):
        """
        Crea una revisión de presupuesto desde una orden de cambio aprobada.
        cost_delta_gtq: impacto en costo (puede ser negativo si reduce costos).
        """
        from django.core.exceptions import ValidationError
        from change_orders.models import ChangeOrderStatus
        if change_order.status != ChangeOrderStatus.APPROVED:
            raise ValidationError('La orden de cambio debe estar aprobada.')
        if cls.objects.filter(linked_change_order=change_order).exists():
            raise ValidationError('Ya existe una revisión de presupuesto para esta orden de cambio.')

        budget = cls.objects.create(
            project              = change_order.project,
            version_type         = BudgetVersionType.REVISION,
            status               = BudgetStatus.DRAFT,
            revenue_gtq          = change_order.amount_gtq,
            cost_gtq             = cost_delta_gtq,
            linked_change_order  = change_order,
            notes                = notes or f'Revisión por OC-{change_order.number:03d}: {change_order.title}',
            created_by           = user,
        )
        return budget


class ProjectBudgetLine(models.Model):
    """
    Partida de presupuesto.
    Para versión 'original': conjunto completo de partidas.
    Para revisión: deltas (partidas añadidas, modificadas o eliminadas por la OC).
    """
    DELTA_TYPE_CHOICES = [
        ('original', 'Partida original'),
        ('added',    'Añadida por OC'),
        ('modified', 'Modificada por OC'),
        ('removed',  'Eliminada por OC'),
    ]

    budget         = models.ForeignKey(
        ProjectBudget,
        on_delete=models.CASCADE,
        related_name='lines',
        verbose_name='Versión de presupuesto',
    )
    cost_code      = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='budget_lines',
        verbose_name='Código de costo',
    )
    description    = models.CharField(max_length=500, verbose_name='Descripción')
    unit           = models.CharField(max_length=50, blank=True, verbose_name='Unidad')
    quantity       = models.DecimalField(max_digits=12, decimal_places=3, verbose_name='Cantidad')
    unit_cost_gtq  = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name='Costo unitario (GTQ)',
        help_text='Costo interno estimado por unidad.',
    )
    unit_price_gtq = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name='Precio unitario (GTQ)',
        help_text='Precio de venta al cliente por unidad.',
    )
    delta_type     = models.CharField(
        max_length=10,
        choices=DELTA_TYPE_CHOICES,
        default='original',
        verbose_name='Tipo de partida',
    )
    order          = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Partida de presupuesto'
        verbose_name_plural = 'Partidas de presupuesto'
        ordering            = ['order', 'id']

    def __str__(self):
        return f'{self.description} ({self.quantity} {self.unit})'

    @property
    def subtotal_cost(self):
        return self.quantity * self.unit_cost_gtq

    @property
    def subtotal_revenue(self):
        return self.quantity * self.unit_price_gtq

    @property
    def margin(self):
        return self.subtotal_revenue - self.subtotal_cost
