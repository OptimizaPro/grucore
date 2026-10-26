from django.db import models
from django.conf import settings
from django.db.models import Max


class DocumentType(models.TextChoices):
    CONTRACT      = 'contract',      'Contrato'
    BLUEPRINT     = 'blueprint',     'Plano'
    SPECIFICATION = 'specification', 'Especificación'
    REPORT        = 'report',        'Reporte'
    PERMIT        = 'permit',        'Permiso'
    OTHER         = 'other',         'Otro'


class Document(models.Model):
    project       = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='documents', verbose_name='Proyecto')
    phase         = models.ForeignKey('projects.Phase', on_delete=models.SET_NULL, null=True, blank=True, related_name='documents', verbose_name='Fase')
    document_type = models.CharField(max_length=20, choices=DocumentType.choices, default=DocumentType.OTHER, verbose_name='Tipo de documento')
    title         = models.CharField(max_length=300, verbose_name='Título')
    description   = models.TextField(blank=True, verbose_name='Descripción')
    file_url      = models.URLField(verbose_name='URL del archivo')
    file_name     = models.CharField(max_length=300, blank=True, verbose_name='Nombre del archivo')
    file_size_kb  = models.PositiveIntegerField(default=0, verbose_name='Tamaño del archivo (KB)')
    version       = models.PositiveSmallIntegerField(default=1, verbose_name='Versión')
    uploaded_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='uploaded_documents',
        verbose_name='Subido por'
    )
    tags              = models.JSONField(default=list, blank=True, verbose_name='Etiquetas')
    is_archived       = models.BooleanField(default=False, verbose_name='Archivado')
    visible_to_client = models.BooleanField(default=False, verbose_name='Visible al cliente')
    created_at    = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at    = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name        = 'Documento'
        verbose_name_plural = 'Documentos'
        ordering            = ['-created_at']

    def __str__(self):
        return f'{self.title} (v{self.version})'


class RFIPriority(models.TextChoices):
    LOW    = 'low',    'Baja'
    MEDIUM = 'medium', 'Media'
    HIGH   = 'high',   'Alta'
    URGENT = 'urgent', 'Urgente'


class RFIStatus(models.TextChoices):
    OPEN      = 'open',      'Abierto'
    IN_REVIEW = 'in_review', 'En revisión'
    ANSWERED  = 'answered',  'Respondido'
    CLOSED    = 'closed',    'Cerrado'


class RFI(models.Model):
    """
    RFI = Request for Information (Solicitud de Información)                                                                                 
                                                                                                                                         
    Es un documento formal usado en la industria de la construcción cuando el contratista o supervisor de obra necesita aclarar algo del     
    proyecto antes de continuar. Ejemplos típicos:
                                                                                                                                            
    - "Los planos dicen 'revestimiento tipo A' pero no especifican el material exacto — ¿cuál usamos?"                                     
    - "Hay una discrepancia entre el plano arquitectónico y el estructural en el eje B-3"
    - "El detalle de la viga no coincide con la especificación técnica"

    Flujo estándar:
    Supervisor/Contratista        →  crea RFI con la consulta
    Arquitecto/Director de obra   →  responde con la aclaración oficial
    Ambas partes                  →  quedan con registro documentado

    Es un mecanismo de protección legal para ambas partes — si algo sale mal, hay un registro de quién preguntó, qué se respondió y cuándo.

    En Grucore está implementado exactamente así: el staff interno crea la RFI desde el ERP, la responde desde el mismo panel, y el cliente
    puede verla desde su portal.
    
    """
    project      = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='rfis', verbose_name='Proyecto')
    phase        = models.ForeignKey('projects.Phase', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Fase')
    number       = models.PositiveIntegerField(editable=False, verbose_name='Número')
    subject      = models.CharField(max_length=300, verbose_name='Asunto')
    description  = models.TextField(verbose_name='Descripción')
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='submitted_rfis',
        verbose_name='Presentado por'
    )
    assigned_to  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_rfis',
        verbose_name='Asignado a'
    )
    status       = models.CharField(max_length=20, choices=RFIStatus.choices, default=RFIStatus.OPEN, verbose_name='Estado')
    priority     = models.CharField(max_length=10, choices=RFIPriority.choices, default=RFIPriority.MEDIUM, verbose_name='Prioridad')
    due_date     = models.DateField(null=True, blank=True, verbose_name='Fecha de vencimiento')
    answer       = models.TextField(blank=True, verbose_name='Respuesta')
    answered_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='answered_rfis',
        verbose_name='Respondido por'
    )
    answered_at  = models.DateTimeField(null=True, blank=True, verbose_name='Respondido el')
    attachments  = models.JSONField(default=list, blank=True, verbose_name='Archivos adjuntos')
    created_at   = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at   = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name        = 'Solicitud de Información (RFI)'
        verbose_name_plural = 'Solicitudes de Información (RFIs)'
        ordering            = ['-created_at']
        unique_together     = [('project', 'number')]

    def save(self, *args, **kwargs):
        if not self.pk:
            last = RFI.objects.filter(project=self.project).aggregate(Max('number'))['number__max'] or 0
            self.number = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'RFI-{self.number:03d}: {self.subject}'


class SubmittalStatus(models.TextChoices):
    PENDING                = 'pending',                'Pendiente'
    SUBMITTED              = 'submitted',              'Enviado'
    IN_REVIEW              = 'in_review',              'En revisión'
    APPROVED               = 'approved',               'Aprobado'
    APPROVED_WITH_COMMENTS = 'approved_with_comments', 'Aprobado con comentarios'
    REJECTED               = 'rejected',               'Rechazado'
    RESUBMIT               = 'resubmit',               'Re-enviar'


class Submittal(models.Model):
    """
    donde es un documento o muestra que el contratista envía al arquitecto/director de obra para su revisión y aprobación antes de usar  
    el material o ejecutar el trabajo.                                                                                                     
                                                                                                                                            
    Es básicamente decir: "¿Confirmas que esto es lo que pediste antes de que lo compremos/instalemos?"                                      
                                                                                                                                            
    Ejemplos típicos:                                                                                                                      
    - Ficha técnica del porcelanato que se va a instalar
    - Muestra de color de pintura para aprobación
    - Especificación del sistema de ventanas
    - Catálogo del modelo de grifería seleccionado
    - Plano de taller de estructura metálica
    - Certificado de calidad del concreto

    Flujo estándar:
    Contratista     →  envía submittal (documento/muestra/ficha)
    Arquitecto      →  revisa
                    →  Aprobado ✓
                    →  Aprobado con comentarios ✓ (con condiciones)
                    →  Rechazado ✗ (debe re-enviar)
                    →  Re-enviar (necesita correcciones)

    Estados en Grucore:
    pending → submitted → in_review → approved
                                    ↘ approved_with_comments
                                    ↘ rejected → resubmit → ...

    ---
    La diferencia clave con un RFI:

    ┌──────────────┬────────────────────────────┬────────────────────────────────────────┐
    │              │            RFI             │               Submittal                │
    ├──────────────┼────────────────────────────┼────────────────────────────────────────┤
    │ Quién inicia │ Contratista tiene una duda │ Contratista propone un material/método │
    ├──────────────┼────────────────────────────┼────────────────────────────────────────┤
    │ Objetivo     │ Obtener una aclaración     │ Obtener una aprobación                 │
    ├──────────────┼────────────────────────────┼────────────────────────────────────────┤
    │ Resultado    │ Respuesta técnica          │ Aprobado / Rechazado                   │
    └──────────────┴────────────────────────────┴────────────────────────────────────────┘

    En español se traduce como "entregable técnico" o "documento de sometimiento", aunque en la industria de construcción en Guatemala se usa
    directamente el término en inglés.
    """
    project      = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='submittals', verbose_name='Proyecto')
    phase        = models.ForeignKey('projects.Phase', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Fase')
    number       = models.PositiveIntegerField(editable=False, verbose_name='Número')
    title        = models.CharField(max_length=300, verbose_name='Título')
    description  = models.TextField(blank=True, verbose_name='Descripción')
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='submitted_submittals',
        verbose_name='Presentado por'
    )
    reviewed_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='reviewed_submittals',
        verbose_name='Revisado por'
    )
    status       = models.CharField(max_length=30, choices=SubmittalStatus.choices, default=SubmittalStatus.PENDING, verbose_name='Estado')
    file_url     = models.URLField(blank=True, verbose_name='URL del archivo')
    review_notes = models.TextField(blank=True, verbose_name='Notas de revisión')
    review_date  = models.DateField(null=True, blank=True, verbose_name='Fecha de revisión')
    created_at   = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at   = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name        = 'Entregable técnico (Submittal)'
        verbose_name_plural = 'Entregables técnicos (Submittals)'
        ordering            = ['-created_at']
        unique_together     = [('project', 'number')]

    def save(self, *args, **kwargs):
        if not self.pk:
            last = Submittal.objects.filter(project=self.project).aggregate(Max('number'))['number__max'] or 0
            self.number = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'SUB-{self.number:03d}: {self.title}'


class PunchItemStatus(models.TextChoices):
    OPEN        = 'open',        'Abierto'
    IN_PROGRESS = 'in_progress', 'En progreso'
    RESOLVED    = 'resolved',    'Resuelto'
    CLOSED      = 'closed',      'Cerrado'


class PunchItemPriority(models.TextChoices):
    LOW      = 'low',      'Baja'
    MEDIUM   = 'medium',   'Media'
    HIGH     = 'high',     'Alta'
    CRITICAL = 'critical', 'Crítica'


class PunchItem(models.Model):
    """
    Punch Item (también llamado "Punch List item") es una observación o defecto que se documenta durante la inspección final de una obra     
    antes de la entrega al cliente.                                                                                                        
                                                                                                                                            
    Es básicamente una lista de pendientes o correcciones que el contratista debe resolver antes de que el proyecto se considere 100%        
    terminado.                                                                                                                               
                                                                                                                                            
    Ejemplos típicos:
    - "La puerta del baño principal no cierra correctamente"
    - "Falta pintura en la esquina del pasillo"
    - "El tomacorriente de la cocina no tiene tapa"
    - "Hay una grieta en el porcelanato del piso"
    - "El extractor de la cocina hace ruido anormal"

    Flujo estándar:
    Inspector/Cliente   →  detecta el defecto durante recorrido final
    Supervisor          →  crea el Punch Item con foto, ubicación y prioridad
    Contratista         →  lo corrige
    Supervisor          →  verifica y cierra el item

    Estados en Grucore:
    open → in_progress → resolved → closed

    ---
    En Guatemala/Centroamérica también se le llama "lista de observaciones" o "lista de defectos". El término punch list viene del inglés
    pero es el estándar en la industria de construcción a nivel internacional.

    """

    project          = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='punch_items', verbose_name='Proyecto')
    phase            = models.ForeignKey('projects.Phase', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Fase')
    number           = models.PositiveIntegerField(editable=False, verbose_name='Número')
    description      = models.TextField(verbose_name='Descripción')
    location         = models.CharField(max_length=200, blank=True, verbose_name='Ubicación')
    assigned_to      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='punch_items',
        verbose_name='Asignado a'
    )
    created_by       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_punch_items',
        verbose_name='Creado por'
    )
    status           = models.CharField(max_length=20, choices=PunchItemStatus.choices, default=PunchItemStatus.OPEN, verbose_name='Estado')
    priority         = models.CharField(max_length=10, choices=PunchItemPriority.choices, default=PunchItemPriority.MEDIUM, verbose_name='Prioridad')
    photo_urls       = models.JSONField(default=list, blank=True, verbose_name='URLs de fotos')
    resolution_notes = models.TextField(blank=True, verbose_name='Notas de resolución')
    due_date         = models.DateField(null=True, blank=True, verbose_name='Fecha de vencimiento')
    resolved_at      = models.DateTimeField(null=True, blank=True, verbose_name='Resuelto el')
    created_at       = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at       = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name            = 'Lista de observaciones (Punch Item)'
        verbose_name_plural     = 'Listas de observaciones (Punch Items)'
        ordering                = ['priority', '-created_at']
        unique_together         = [('project', 'number')]

    def save(self, *args, **kwargs):
        if not self.pk:
            last = PunchItem.objects.filter(project=self.project).aggregate(Max('number'))['number__max'] or 0
            self.number = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'PUNCH-{self.number:03d}: {self.description[:60]}'
