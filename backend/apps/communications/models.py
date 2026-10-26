from django.db import models
from django.conf import settings


class NotificationType(models.TextChoices):
    MILESTONE_APPROVED     = 'milestone_approved',     'Hito aprobado'
    MILESTONE_PAID         = 'milestone_paid',         'Hito pagado'
    PROGRESS_UPDATE        = 'progress_update',        'Actualización de avance'
    DOCUMENT_UPLOADED      = 'document_uploaded',      'Documento subido'
    RFI_ANSWERED           = 'rfi_answered',           'RFI respondido'
    CHANGE_ORDER_SUBMITTED = 'change_order_submitted', 'Orden de cambio enviada'
    CHANGE_ORDER_APPROVED  = 'change_order_approved',  'Orden de cambio aprobada'
    MESSAGE_RECEIVED       = 'message_received',       'Mensaje recibido'
    SYSTEM                 = 'system',                 'Sistema'


class Notification(models.Model):
    recipient         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    sender            = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sent_notifications',
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    title             = models.CharField(max_length=300)
    body              = models.TextField()
    project           = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='notifications',
    )
    object_type       = models.CharField(max_length=50, blank=True)
    object_id         = models.PositiveIntegerField(null=True, blank=True)
    is_read           = models.BooleanField(default=False)
    read_at           = models.DateTimeField(null=True, blank=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.notification_type} → {self.recipient}'


class ProjectMessage(models.Model):
    project     = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='messages',
    )
    phase       = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL, null=True, blank=True,
    )
    author      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='project_messages',
    )
    body        = models.TextField()
    attachments = models.JSONField(default=list, blank=True)
    parent      = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='replies',
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Mensaje de proyecto'
        verbose_name_plural = 'Mensajes de proyecto'
        ordering = ['created_at']

    def __str__(self):
        return f'{self.author} → {self.project} ({self.created_at:%Y-%m-%d})'


def create_notification(
    recipient,
    notification_type,
    title,
    body,
    project=None,
    object_type='',
    object_id=None,
    sender=None,
):
    """
    Utility function to create and return a Notification instance.
    """
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        body=body,
        project=project,
        object_type=object_type,
        object_id=object_id,
    )
