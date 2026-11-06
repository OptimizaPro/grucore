from django.db import models
from django.conf import settings


# ─── Choices ──────────────────────────────────────────────────────────────────

class EventType(models.TextChoices):
    MEETING_CLIENT   = 'meeting_client',   'Reunión con cliente'
    SUPPLIER_VISIT   = 'supplier_visit',   'Visita de proveedor'
    SITE_INSPECTION  = 'site_inspection',  'Inspección de obra'
    SUPERVISOR_VISIT = 'supervisor_visit', 'Visita de supervisor'
    CALL             = 'call',             'Llamada'
    OTHER            = 'other',            'Otro'


class EventStatus(models.TextChoices):
    SCHEDULED  = 'scheduled',  'Programado'
    CONFIRMED  = 'confirmed',  'Confirmado'
    CANCELLED  = 'cancelled',  'Cancelado'
    COMPLETED  = 'completed',  'Completado'


class ClientApproval(models.TextChoices):
    PENDING  = 'pending',  'Pendiente'
    APPROVED = 'approved', 'Aprobado'
    REJECTED = 'rejected', 'Rechazado'


# ─── Event ────────────────────────────────────────────────────────────────────

class Event(models.Model):
    # Core
    title       = models.CharField(max_length=200, verbose_name='Título')
    description = models.TextField(blank=True, verbose_name='Descripción')
    event_type  = models.CharField(
        max_length=30,
        choices=EventType.choices,
        default=EventType.MEETING_CLIENT,
        verbose_name='Tipo',
    )
    location = models.CharField(max_length=300, blank=True, verbose_name='Ubicación / Link')

    # Timing
    start_datetime = models.DateTimeField(verbose_name='Inicio')
    end_datetime   = models.DateTimeField(verbose_name='Fin')

    # Links — both optional: an event can be linked to a project, a lead, or neither
    project = models.ForeignKey(
        'projects.Project',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='events',
        verbose_name='Proyecto',
    )
    lead = models.ForeignKey(
        'crm.Lead',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='events',
        verbose_name='Lead',
    )

    # People
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name='created_events',
        verbose_name='Creado por',
    )
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name='attending_events',
        verbose_name='Asistentes internos',
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=EventStatus.choices,
        default=EventStatus.SCHEDULED,
        verbose_name='Estado',
    )

    # Client meeting — visible in client portal and requires client approval
    is_client_meeting = models.BooleanField(
        default=False,
        verbose_name='Reunión con cliente',
        help_text='Si está activo, el cliente verá esta reunión en su portal.',
    )
    client_approval = models.CharField(
        max_length=20,
        choices=ClientApproval.choices,
        default=ClientApproval.PENDING,
        verbose_name='Aprobación del cliente',
    )
    client_notes = models.TextField(
        blank=True,
        verbose_name='Notas del cliente',
        help_text='Comentario enviado por el cliente al aprobar o rechazar.',
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering            = ['start_datetime']
        verbose_name        = 'Evento'
        verbose_name_plural = 'Eventos'

    def __str__(self):
        return f'{self.title} — {self.start_datetime:%d/%m/%Y %H:%M}'
