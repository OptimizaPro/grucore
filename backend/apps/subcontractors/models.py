from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


# ─── Choices ─────────────────────────────────────────────────────────────────

class ContractStatus(models.TextChoices):
    DRAFT      = 'draft',      'Borrador'
    ACTIVE     = 'active',     'Activo'
    SUSPENDED  = 'suspended',  'Suspendido'
    COMPLETED  = 'completed',  'Completado'
    TERMINATED = 'terminated', 'Rescindido'


class CertificationStatus(models.TextChoices):
    DRAFT     = 'draft',     'Borrador'
    SUBMITTED = 'submitted', 'Enviada'
    APPROVED  = 'approved',  'Aprobada'
    REJECTED  = 'rejected',  'Rechazada'


class RetentionReleaseStatus(models.TextChoices):
    DRAFT  = 'draft',  'Borrador'
    POSTED = 'posted', 'Registrada'


# ─── Contrato de subcontratista ───────────────────────────────────────────────

class SubcontractorContract(models.Model):
    """
    Contrato formal con un subcontratista para un alcance definido de obra.

    Flujo de estados financieros distinguidos:
    - contract_value_gtq: valor de contrato aprobado (monto comprometido).
    - total_certified_gtq: suma de certificaciones aprobadas (costo incurrido).
    - total_paid_gtq: suma de pagos registrados (costo pagado).
    - retention_withheld_gtq: retención acumulada pendiente de liberar.
    """
    year     = models.PositiveSmallIntegerField(editable=False, verbose_name='Año')
    sequence = models.PositiveIntegerField(editable=False, verbose_name='Secuencia')

    # ── Partes ────────────────────────────────────────────────────────────────
    subcontractor = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.PROTECT,
        related_name='subcontracts',
        verbose_name='Subcontratista',
        limit_choices_to={'category': 'subcontractor'},
    )
    project       = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='subcontracts',
        verbose_name='Proyecto',
    )
    phase         = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='subcontracts',
        verbose_name='Fase',
    )
    cost_code     = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='subcontracts',
        verbose_name='Código de costo',
    )
    accounting_period = models.ForeignKey(
        'ledger.AccountingPeriod',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='subcontracts',
        verbose_name='Período contable',
    )

    # ── Alcance y valor ───────────────────────────────────────────────────────
    title               = models.CharField(max_length=300, verbose_name='Título / alcance')
    description         = models.TextField(blank=True, verbose_name='Descripción del alcance de trabajo')
    contract_value_gtq  = models.DecimalField(
        max_digits=16, decimal_places=2,
        verbose_name='Valor de contrato (GTQ)',
        help_text='Monto total acordado. Actualizaciones por adendas deben crear una revisión documentada.',
    )
    # IVA — pending validación contador
    tax_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('12.00'),
        verbose_name='IVA (%)',
        help_text='12% tasa general GT — validar con contador si el subcontratista está en régimen exento.',
    )

    # ── Retención ─────────────────────────────────────────────────────────────
    retention_pct = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('10.00'),
        verbose_name='Retención (%)',
        help_text='Porcentaje retenido de cada certificación. Se libera al completar el contrato.',
    )

    # ── Avances ───────────────────────────────────────────────────────────────
    advance_paid_gtq      = models.DecimalField(
        max_digits=14, decimal_places=2, default=Decimal('0.00'),
        verbose_name='Anticipo pagado (GTQ)',
        help_text='Total de anticipos desembolsados. Se recupera mediante descuentos en certificaciones.',
    )
    advance_recovered_gtq = models.DecimalField(
        max_digits=14, decimal_places=2, default=Decimal('0.00'),
        verbose_name='Anticipo recuperado (GTQ)',
        help_text='Total recuperado hasta la fecha. Actualizar manualmente o vía certifications.',
    )

    # ── Fechas ────────────────────────────────────────────────────────────────
    start_date = models.DateField(null=True, blank=True, verbose_name='Fecha de inicio')
    end_date   = models.DateField(null=True, blank=True, verbose_name='Fecha de finalización')

    # ── Estado ────────────────────────────────────────────────────────────────
    status = models.CharField(
        max_length=15, choices=ContractStatus.choices,
        default=ContractStatus.DRAFT, verbose_name='Estado',
    )

    notes      = models.TextField(blank=True, verbose_name='Notas / condiciones')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_subcontracts',
        verbose_name='Creado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Contrato de subcontratista'
        verbose_name_plural = 'Contratos de subcontratistas'
        ordering            = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.year = timezone.now().year
            last = SubcontractorContract.objects.filter(year=self.year).aggregate(
                m=models.Max('sequence')
            )['m'] or 0
            self.sequence = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'SC-{self.year}-{self.sequence:04d} — {self.subcontractor} / {self.project}'

    # ── Totales calculados ────────────────────────────────────────────────────

    @property
    def contract_value_with_tax_gtq(self):
        tax = (self.contract_value_gtq * self.tax_percentage / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        return (self.contract_value_gtq + tax).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def total_certified_gtq(self):
        """Suma de importes brutos de certificaciones aprobadas."""
        from django.db.models import Sum
        result = self.certifications.filter(
            status=CertificationStatus.APPROVED
        ).aggregate(t=Sum('amount_certified_gtq'))['t']
        return result or Decimal('0.00')

    @property
    def total_retention_withheld_gtq(self):
        """Retención acumulada de certificaciones aprobadas (sin liberar)."""
        from django.db.models import Sum
        result = self.certifications.filter(
            status=CertificationStatus.APPROVED
        ).aggregate(t=Sum('retention_withheld_gtq'))['t']
        return result or Decimal('0.00')

    @property
    def total_retention_released_gtq(self):
        """Retención liberada mediante RetentionRelease registradas."""
        from django.db.models import Sum
        result = self.retention_releases.filter(
            status=RetentionReleaseStatus.POSTED
        ).aggregate(t=Sum('amount_released_gtq'))['t']
        return result or Decimal('0.00')

    @property
    def retention_balance_gtq(self):
        """Retención pendiente de liberar = retenida − liberada."""
        return (
            self.total_retention_withheld_gtq - self.total_retention_released_gtq
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def advance_balance_gtq(self):
        """Anticipo pendiente de recuperar."""
        return (self.advance_paid_gtq - self.advance_recovered_gtq).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def balance_to_certify_gtq(self):
        """Saldo pendiente de certificar = valor contrato − total certificado."""
        return (self.contract_value_gtq - self.total_certified_gtq).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def total_net_payable_gtq(self):
        """Total neto pagable = suma de net_payable de certificaciones aprobadas."""
        from django.db.models import Sum
        result = self.certifications.filter(
            status=CertificationStatus.APPROVED
        ).aggregate(t=Sum('net_payable_gtq'))['t']
        return result or Decimal('0.00')

    @property
    def completion_pct(self):
        """Porcentaje de avance certificado respecto al valor de contrato."""
        if not self.contract_value_gtq:
            return Decimal('0')
        return (self.total_certified_gtq / self.contract_value_gtq * 100).quantize(
            Decimal('0.1'), rounding=ROUND_HALF_UP
        )


# ─── Certificación de avance ──────────────────────────────────────────────────

class SubcontractorCertification(models.Model):
    """
    Valoración de avance de obra del subcontratista.

    Flujo estándar:
    1. Subcontratista presenta la certificación (draft → submitted).
    2. Constructora revisa y aprueba (approved) o rechaza (rejected).
    3. Al aprobar, el neto pagable genera (o vincula a) una factura de proveedor.

    Fórmula:
        net_payable = amount_certified − retention_withheld − advance_recovery
    """
    contract             = models.ForeignKey(
        SubcontractorContract,
        on_delete=models.CASCADE,
        related_name='certifications',
        verbose_name='Contrato',
    )
    certification_number = models.PositiveSmallIntegerField(
        editable=False, verbose_name='N° de certificación',
    )

    # ── Período y montos ──────────────────────────────────────────────────────
    period_from           = models.DateField(verbose_name='Período desde')
    period_to             = models.DateField(verbose_name='Período hasta')
    description           = models.TextField(blank=True, verbose_name='Descripción del trabajo certificado')
    amount_certified_gtq  = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name='Importe bruto certificado (GTQ)',
    )
    # Retención: default calculado del contrato, overridable
    retention_withheld_gtq = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name='Retención retenida (GTQ)',
        help_text='Por defecto: importe × % retención del contrato.',
    )
    # Descuento de anticipo en esta certificación
    advance_recovery_gtq  = models.DecimalField(
        max_digits=14, decimal_places=2, default=Decimal('0.00'),
        verbose_name='Recuperación de anticipo (GTQ)',
    )
    # Neto a pagar (calculado, pero guardado para auditoría)
    net_payable_gtq       = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name='Neto a pagar (GTQ)',
        help_text='= Importe certificado − Retención − Recuperación anticipo.',
    )

    # ── Estado y aprobación ───────────────────────────────────────────────────
    status      = models.CharField(
        max_length=15, choices=CertificationStatus.choices,
        default=CertificationStatus.DRAFT, verbose_name='Estado',
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_certifications',
        verbose_name='Aprobado por',
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='Aprobado el')

    # ── Vínculo con factura proveedor ─────────────────────────────────────────
    supplier_invoice = models.OneToOneField(
        'purchasing.SupplierInvoice',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='subcontractor_certification',
        verbose_name='Factura de proveedor vinculada',
        help_text='Factura del subcontratista correspondiente al neto pagable de esta certificación.',
    )

    notes      = models.TextField(blank=True, verbose_name='Notas')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_certifications',
        verbose_name='Creado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Certificación de avance'
        verbose_name_plural = 'Certificaciones de avance'
        unique_together     = [('contract', 'certification_number')]
        ordering            = ['contract', 'certification_number']

    def save(self, *args, **kwargs):
        # Auto-incrementar número de certificación por contrato
        if not self.pk:
            last = SubcontractorCertification.objects.filter(
                contract=self.contract
            ).aggregate(m=models.Max('certification_number'))['m'] or 0
            self.certification_number = last + 1
        # Calcular net_payable si no fue especificado manualmente
        if not self.retention_withheld_gtq and self.amount_certified_gtq:
            self.retention_withheld_gtq = (
                self.amount_certified_gtq * self.contract.retention_pct / Decimal('100')
            ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        if not self.net_payable_gtq and self.amount_certified_gtq:
            self._compute_net_payable()
        super().save(*args, **kwargs)

    def _compute_net_payable(self):
        self.net_payable_gtq = (
            self.amount_certified_gtq
            - (self.retention_withheld_gtq or Decimal('0'))
            - self.advance_recovery_gtq
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def __str__(self):
        return (
            f'Cert. #{self.certification_number} — {self.contract} '
            f'(Q{self.amount_certified_gtq})'
        )

    def approve(self, user):
        if self.status not in (CertificationStatus.DRAFT, CertificationStatus.SUBMITTED):
            raise ValidationError('Solo se puede aprobar una certificación en borrador o enviada.')
        # Validar que el acumulado no supere el valor de contrato
        already_certified = (
            self.contract.total_certified_gtq
            - (self.amount_certified_gtq if self.status == CertificationStatus.APPROVED else Decimal('0'))
        )
        if already_certified + self.amount_certified_gtq > self.contract.contract_value_gtq:
            raise ValidationError(
                f'El total certificado (Q{already_certified + self.amount_certified_gtq:,.2f}) '
                f'superaría el valor de contrato (Q{self.contract.contract_value_gtq:,.2f}).'
            )
        self._compute_net_payable()
        self.status      = CertificationStatus.APPROVED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save(update_fields=[
            'status', 'approved_by', 'approved_at',
            'net_payable_gtq', 'updated_at',
        ])
        try:
            from apps.ledger.services import PostingService
            PostingService.post_subcontractor_certification(self)
        except Exception:
            pass  # contabilización no bloquea flujo operacional

    def reject(self, user, notes=''):
        if self.status not in (CertificationStatus.DRAFT, CertificationStatus.SUBMITTED):
            raise ValidationError('No se puede rechazar una certificación en este estado.')
        self.status = CertificationStatus.REJECTED
        if notes:
            self.notes = (self.notes + '\n\n' + notes).strip()
        self.save(update_fields=['status', 'notes', 'updated_at'])


# ─── Liberación de retención ──────────────────────────────────────────────────

class SubcontractorRetentionRelease(models.Model):
    """
    Liberación de la retención acumulada al completar el contrato
    (o por hito de cumplimiento parcial).

    La liberación genera un pasivo exigible: el subcontratista puede facturar
    el monto liberado, que se vincula a un SupplierInvoice en purchasing.
    """
    contract      = models.ForeignKey(
        SubcontractorContract,
        on_delete=models.CASCADE,
        related_name='retention_releases',
        verbose_name='Contrato',
    )
    release_date  = models.DateField(verbose_name='Fecha de liberación')
    amount_released_gtq = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name='Monto liberado (GTQ)',
    )
    status        = models.CharField(
        max_length=10, choices=RetentionReleaseStatus.choices,
        default=RetentionReleaseStatus.DRAFT, verbose_name='Estado',
    )
    supplier_invoice = models.OneToOneField(
        'purchasing.SupplierInvoice',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='retention_release',
        verbose_name='Factura de retención liberada',
    )
    notes         = models.TextField(blank=True, verbose_name='Notas')
    created_by    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_retention_releases',
        verbose_name='Creado por',
    )
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Liberación de retención'
        verbose_name_plural = 'Liberaciones de retención'
        ordering            = ['-release_date']

    def __str__(self):
        return f'Liberación retención — {self.contract} Q{self.amount_released_gtq} ({self.release_date})'

    def post(self, user=None):
        if self.status != RetentionReleaseStatus.DRAFT:
            raise ValidationError('Solo se puede registrar una liberación en borrador.')
        # Validar que no se libere más de lo retenido pendiente
        max_releasable = self.contract.retention_balance_gtq
        if self.amount_released_gtq > max_releasable:
            raise ValidationError(
                f'Se intenta liberar Q{self.amount_released_gtq:,.2f} '
                f'pero el saldo de retención disponible es Q{max_releasable:,.2f}.'
            )
        self.status = RetentionReleaseStatus.POSTED
        self.save(update_fields=['status', 'updated_at'])
        try:
            from apps.ledger.services import PostingService
            PostingService.post_retention_release(self)
        except Exception:
            pass  # contabilización no bloquea flujo operacional
