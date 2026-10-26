from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.conf import settings
from django.utils import timezone


class ExpenseCategory(models.TextChoices):
    MATERIALS      = 'materials',      'Materiales'
    LABOR          = 'labor',          'Mano de obra'
    EQUIPMENT      = 'equipment',      'Equipo y maquinaria'
    SUBCONTRACTOR  = 'subcontractor',  'Subcontratista'
    PERMITS        = 'permits',        'Permisos y trámites'
    TRANSPORTATION = 'transportation', 'Transporte'
    UTILITIES      = 'utilities',      'Servicios'
    OTHER          = 'other',          'Otro'


class ExpenseStatus(models.TextChoices):
    PENDING    = 'pending',    'Pendiente de aprobación'
    APPROVED   = 'approved',   'Aprobado'
    REJECTED   = 'rejected',   'Rechazado'
    REIMBURSED = 'reimbursed', 'Reembolsado'


class Expense(models.Model):
    # project es nullable para permitir gastos de estructura (overhead)
    project      = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='expenses',
        verbose_name='Proyecto',
        help_text='Dejar vacío para gastos de estructura no imputables a una obra.',
    )
    phase        = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        verbose_name='Fase',
    )
    cost_code    = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='expenses',
        verbose_name='Código de costo',
    )
    cost_center  = models.ForeignKey(
        'core.CostCenter',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='expenses',
        verbose_name='Centro de costo',
        help_text='Obligatorio cuando el gasto no está imputado a un proyecto.',
    )
    accounting_period = models.ForeignKey(
        'ledger.AccountingPeriod',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='expenses',
        verbose_name='Período contable',
    )
    category     = models.CharField(max_length=20, choices=ExpenseCategory.choices, default=ExpenseCategory.OTHER, verbose_name='Categoría')
    description  = models.CharField(max_length=500, verbose_name='Descripción')
    amount_gtq   = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='Monto (GTQ)')
    receipt_url  = models.URLField(blank=True, verbose_name='URL del comprobante')
    expense_date = models.DateField(verbose_name='Fecha del gasto')
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='submitted_expenses',
        verbose_name='Enviado por',
    )
    approved_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_expenses',
        verbose_name='Aprobado por',
    )
    approved_at  = models.DateTimeField(null=True, blank=True, verbose_name='Aprobado el')
    status       = models.CharField(max_length=15, choices=ExpenseStatus.choices, default=ExpenseStatus.PENDING, verbose_name='Estado')
    notes        = models.TextField(blank=True, verbose_name='Notas')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Gasto'
        verbose_name_plural = 'Gastos'
        ordering            = ['-expense_date']

    def __str__(self):
        project_label = self.project.name if self.project else (self.cost_center.name if self.cost_center else 'Overhead')
        return f'{self.get_category_display()} — Q{self.amount_gtq} | {project_label} ({self.expense_date})'

    def clean(self):
        from django.core.exceptions import ValidationError
        if not self.project and not self.cost_center:
            raise ValidationError('Un gasto sin proyecto debe tener un Centro de costo asignado.')


class InvoiceStatus(models.TextChoices):
    DRAFT     = 'draft',     'Borrador'
    SENT      = 'sent',      'Enviada'
    VIEWED    = 'viewed',    'Vista'
    PAID      = 'paid',      'Pagada'
    OVERDUE   = 'overdue',   'Vencida'
    CANCELLED = 'cancelled', 'Cancelada'


class Invoice(models.Model):
    project           = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='invoices',
        verbose_name='Proyecto',
    )
    milestone         = models.ForeignKey(
        'projects.PaymentMilestone',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='invoices',
        verbose_name='Hito de pago vinculado',
    )
    accounting_period = models.ForeignKey(
        'ledger.AccountingPeriod',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='invoices',
        verbose_name='Período contable',
    )
    invoice_number    = models.CharField(max_length=50, unique=True, verbose_name='Número de factura')
    # Referencia FEL (Facturación Electrónica en Línea — SAT Guatemala)
    fel_number        = models.CharField(max_length=100, blank=True, verbose_name='Número FEL (SAT)')
    fel_status        = models.CharField(
        max_length=15,
        choices=[('pending', 'Pendiente'), ('certified', 'Certificada'), ('cancelled', 'Anulada')],
        default='pending',
        verbose_name='Estado FEL',
    )
    fel_certified_at  = models.DateTimeField(null=True, blank=True, verbose_name='Certificada FEL el')
    title             = models.CharField(max_length=300, verbose_name='Concepto')
    description       = models.TextField(blank=True, verbose_name='Descripción')
    amount_gtq        = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='Monto base (GTQ)')
    tax_percentage    = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0'), verbose_name='IVA (%)')
    issue_date        = models.DateField(verbose_name='Fecha de emisión')
    due_date          = models.DateField(null=True, blank=True, verbose_name='Fecha de vencimiento')
    paid_at           = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de pago')
    status            = models.CharField(max_length=15, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT, verbose_name='Estado')
    notes             = models.TextField(blank=True, verbose_name='Notas')
    created_by        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_invoices',
        verbose_name='Creada por',
    )
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Factura'
        verbose_name_plural = 'Facturas'
        ordering            = ['-issue_date']

    def __str__(self):
        return f'{self.invoice_number} — Q{self.amount_gtq}'

    @property
    def tax_amount(self):
        return (self.amount_gtq * self.tax_percentage / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def total_with_tax(self):
        return (self.amount_gtq + self.tax_amount).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def is_overdue(self):
        from datetime import date
        return (
            self.due_date is not None
            and self.due_date < date.today()
            and self.status not in (InvoiceStatus.PAID, InvoiceStatus.CANCELLED)
        )
