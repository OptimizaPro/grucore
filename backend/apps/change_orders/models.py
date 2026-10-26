from django.db import models
from django.conf import settings
from django.db.models import Max
from django.utils import timezone


class ChangeOrderReason(models.TextChoices):
    SCOPE_CHANGE         = 'scope_change',         'Cambio de alcance'
    OWNER_REQUEST        = 'owner_request',         'Solicitud del cliente'
    UNFORESEEN_CONDITION = 'unforeseen_condition',  'Condición imprevista'
    DESIGN_ERROR         = 'design_error',          'Error de diseño'
    OTHER                = 'other',                 'Otro'


class ChangeOrderStatus(models.TextChoices):
    DRAFT     = 'draft',     'Borrador'
    SUBMITTED = 'submitted', 'Enviada'
    IN_REVIEW = 'in_review', 'En revisión'
    APPROVED  = 'approved',  'Aprobada'
    REJECTED  = 'rejected',  'Rechazada'
    WITHDRAWN = 'withdrawn', 'Retirada'


class ChangeOrder(models.Model):
    project              = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='change_orders')
    phase                = models.ForeignKey('projects.Phase', on_delete=models.SET_NULL, null=True, blank=True)
    number               = models.PositiveIntegerField(editable=False)
    title                = models.CharField(max_length=300)
    description          = models.TextField()
    reason               = models.CharField(max_length=30, choices=ChangeOrderReason.choices, default=ChangeOrderReason.OTHER)
    amount_gtq           = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name='Monto GTQ (positivo=aumento, negativo=reducción)',
    )
    schedule_days_impact = models.IntegerField(default=0, verbose_name='Impacto en días (positivo=extensión)')
    requested_by         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='requested_change_orders',
    )
    status               = models.CharField(max_length=20, choices=ChangeOrderStatus.choices, default=ChangeOrderStatus.DRAFT)
    submitted_at         = models.DateTimeField(null=True, blank=True)
    company_notes        = models.TextField(blank=True)
    client_notes         = models.TextField(blank=True)
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Orden de cambio'
        verbose_name_plural = 'Órdenes de cambio'
        ordering = ['-created_at']
        unique_together = [('project', 'number')]

    def save(self, *args, **kwargs):
        if not self.pk:
            last = ChangeOrder.objects.filter(project=self.project).aggregate(Max('number'))['number__max'] or 0
            self.number = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'CO-{self.number:03d}: {self.title}'


class ChangeOrderApprovalStatus(models.TextChoices):
    PENDING          = 'pending',          'Pendiente'
    COMPANY_APPROVED = 'company_approved', 'Aprobada por constructora'
    CLIENT_APPROVED  = 'client_approved',  'Aprobada por cliente'
    FULLY_APPROVED   = 'fully_approved',   'Aprobada por ambas partes'
    REJECTED         = 'rejected',         'Rechazada'


class ChangeOrderApproval(models.Model):
    change_order        = models.OneToOneField(ChangeOrder, on_delete=models.CASCADE, related_name='approval')
    status              = models.CharField(max_length=20, choices=ChangeOrderApprovalStatus.choices, default=ChangeOrderApprovalStatus.PENDING)
    company_approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='co_company_approvals',
    )
    company_approved_at = models.DateTimeField(null=True, blank=True)
    company_notes       = models.TextField(blank=True)
    client_approved_at  = models.DateTimeField(null=True, blank=True)
    client_ip_address   = models.GenericIPAddressField(null=True, blank=True)
    client_notes        = models.TextField(blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Aprobación de orden de cambio'
        verbose_name_plural = 'Aprobaciones de órdenes de cambio'

    def __str__(self):
        return f'Aprobación — {self.change_order}'

    def _sync_status(self):
        has_company = bool(self.company_approved_at)
        has_client  = bool(self.client_approved_at)
        if has_company and has_client:
            self.status = ChangeOrderApprovalStatus.FULLY_APPROVED
            self.change_order.status = ChangeOrderStatus.APPROVED
            self.change_order.save(update_fields=['status', 'updated_at'])
        elif has_company:
            self.status = ChangeOrderApprovalStatus.COMPANY_APPROVED
        elif has_client:
            self.status = ChangeOrderApprovalStatus.CLIENT_APPROVED

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
