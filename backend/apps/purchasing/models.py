from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


# ─── Choices ─────────────────────────────────────────────────────────────────

class RequisitionStatus(models.TextChoices):
    DRAFT     = 'draft',     'Borrador'
    SUBMITTED = 'submitted', 'Enviada'
    APPROVED  = 'approved',  'Aprobada'
    CANCELLED = 'cancelled', 'Cancelada'


class POStatus(models.TextChoices):
    DRAFT              = 'draft',              'Borrador'
    SENT               = 'sent',               'Enviada al proveedor'
    CONFIRMED          = 'confirmed',          'Confirmada'
    PARTIALLY_RECEIVED = 'partially_received', 'Recepción parcial'
    RECEIVED           = 'received',           'Recibida completamente'
    INVOICED           = 'invoiced',           'Facturada'
    CANCELLED          = 'cancelled',          'Cancelada'


class GRStatus(models.TextChoices):
    DRAFT     = 'draft',     'Borrador'
    POSTED    = 'posted',    'Registrada'
    CANCELLED = 'cancelled', 'Cancelada'


class SupplierInvoiceStatus(models.TextChoices):
    DRAFT     = 'draft',     'Borrador'
    POSTED    = 'posted',    'Registrada'
    PAID      = 'paid',      'Pagada'
    CANCELLED = 'cancelled', 'Cancelada'


class PaymentMethod(models.TextChoices):
    BANK_TRANSFER = 'bank_transfer', 'Transferencia bancaria'
    CHECK         = 'check',         'Cheque'
    CASH          = 'cash',          'Efectivo'
    CREDIT_CARD   = 'credit_card',   'Tarjeta de crédito'


class SupplierPaymentStatus(models.TextChoices):
    DRAFT     = 'draft',     'Borrador'
    POSTED    = 'posted',    'Registrado'
    CANCELLED = 'cancelled', 'Cancelado'


# ─── Requisición de compra (PR) ───────────────────────────────────────────────

class PurchaseRequisition(models.Model):
    """
    Solicitud interna de compra originada por el equipo de proyecto.
    Puede dar origen a uno o más POs al ser aprobada.
    """
    year     = models.PositiveSmallIntegerField(editable=False, verbose_name='Año')
    sequence = models.PositiveIntegerField(editable=False, verbose_name='Secuencia')

    project           = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='purchase_requisitions',
        verbose_name='Proyecto',
    )
    phase             = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchase_requisitions',
        verbose_name='Fase',
    )
    cost_center       = models.ForeignKey(
        'core.CostCenter',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchase_requisitions',
        verbose_name='Centro de costo',
    )
    accounting_period = models.ForeignKey(
        'ledger.AccountingPeriod',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchase_requisitions',
        verbose_name='Período contable',
    )
    status      = models.CharField(
        max_length=15, choices=RequisitionStatus.choices,
        default=RequisitionStatus.DRAFT, verbose_name='Estado',
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='purchase_requisitions',
        verbose_name='Solicitado por',
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='approved_requisitions',
        verbose_name='Aprobado por',
    )
    approved_at = models.DateTimeField(null=True, blank=True, verbose_name='Aprobado el')
    needed_by   = models.DateField(null=True, blank=True, verbose_name='Necesario para')
    notes       = models.TextField(blank=True, verbose_name='Notas / justificación')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Requisición de compra'
        verbose_name_plural = 'Requisiciones de compra'
        ordering            = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.year = timezone.now().year
            last = PurchaseRequisition.objects.filter(year=self.year).aggregate(
                m=models.Max('sequence')
            )['m'] or 0
            self.sequence = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'PR-{self.year}-{self.sequence:04d}'

    def approve(self, user):
        if self.status not in (RequisitionStatus.DRAFT, RequisitionStatus.SUBMITTED):
            raise ValidationError('Solo se puede aprobar una requisición en borrador o enviada.')
        self.status      = RequisitionStatus.APPROVED
        self.approved_by = user
        self.approved_at = timezone.now()
        self.save(update_fields=['status', 'approved_by', 'approved_at', 'updated_at'])

    @property
    def estimated_total_gtq(self):
        from django.db.models import Sum, F
        result = self.lines.aggregate(
            total=Sum(F('quantity') * F('estimated_unit_cost_gtq'))
        )['total']
        return (result or Decimal('0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


class PurchaseRequisitionLine(models.Model):
    requisition           = models.ForeignKey(
        PurchaseRequisition, on_delete=models.CASCADE,
        related_name='lines', verbose_name='Requisición',
    )
    product               = models.ForeignKey(
        'inventory.Product',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='requisition_lines',
        verbose_name='Producto (inventario)',
    )
    description           = models.CharField(max_length=500, verbose_name='Descripción')
    unit                  = models.CharField(max_length=50, blank=True, verbose_name='Unidad')
    quantity              = models.DecimalField(max_digits=12, decimal_places=3, verbose_name='Cantidad')
    estimated_unit_cost_gtq = models.DecimalField(
        max_digits=14, decimal_places=2, default=0,
        verbose_name='Costo estimado unitario (GTQ)',
    )
    cost_code             = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='requisition_lines',
        verbose_name='Código de costo',
    )
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Línea de requisición'
        verbose_name_plural = 'Líneas de requisición'
        ordering            = ['order', 'id']

    def __str__(self):
        return f'{self.description} × {self.quantity}'

    @property
    def estimated_subtotal_gtq(self):
        return (self.quantity * self.estimated_unit_cost_gtq).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


# ─── Orden de compra (PO) ─────────────────────────────────────────────────────

class PurchaseOrder(models.Model):
    """
    Compromiso formal con un proveedor.
    Una vez confirmada, el total es un costo comprometido (no incurrido).
    Los compromisos se consolidan en el módulo de reportes (Bloque 8).
    """
    year     = models.PositiveSmallIntegerField(editable=False, verbose_name='Año')
    sequence = models.PositiveIntegerField(editable=False, verbose_name='Secuencia')

    requisition       = models.ForeignKey(
        PurchaseRequisition,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchase_orders',
        verbose_name='Requisición origen',
    )
    supplier          = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.PROTECT,
        related_name='purchase_orders',
        verbose_name='Proveedor',
    )
    project           = models.ForeignKey(
        'projects.Project',
        on_delete=models.CASCADE,
        related_name='purchase_orders',
        verbose_name='Proyecto',
    )
    phase             = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchase_orders',
        verbose_name='Fase',
    )
    cost_center       = models.ForeignKey(
        'core.CostCenter',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchase_orders',
        verbose_name='Centro de costo',
    )
    accounting_period = models.ForeignKey(
        'ledger.AccountingPeriod',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchase_orders',
        verbose_name='Período contable',
    )
    status          = models.CharField(
        max_length=20, choices=POStatus.choices,
        default=POStatus.DRAFT, verbose_name='Estado',
    )
    # IVA — pending validación contador; 12% tasa general Guatemala
    tax_percentage  = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('12.00'),
        verbose_name='IVA (%)',
        help_text='12% tasa general GT — validar con contador si aplica deducción.',
    )
    delivery_date    = models.DateField(null=True, blank=True, verbose_name='Fecha de entrega esperada')
    delivery_address = models.TextField(blank=True, verbose_name='Dirección de entrega')
    confirmed_by     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='confirmed_purchase_orders',
        verbose_name='Confirmada por',
    )
    confirmed_at     = models.DateTimeField(null=True, blank=True, verbose_name='Confirmada el')
    notes            = models.TextField(blank=True, verbose_name='Notas / condiciones')
    created_by       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_purchase_orders',
        verbose_name='Creada por',
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Orden de compra'
        verbose_name_plural = 'Órdenes de compra'
        ordering            = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.year = timezone.now().year
            last = PurchaseOrder.objects.filter(year=self.year).aggregate(
                m=models.Max('sequence')
            )['m'] or 0
            self.sequence = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'PO-{self.year}-{self.sequence:04d} — {self.supplier}'

    # ── Totales ───────────────────────────────────────────────────────────────

    @property
    def subtotal_gtq(self):
        from django.db.models import Sum, F
        result = self.lines.aggregate(total=Sum(F('quantity') * F('unit_cost_gtq')))['total']
        return (result or Decimal('0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def tax_amount_gtq(self):
        return (self.subtotal_gtq * self.tax_percentage / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def total_gtq(self):
        return (self.subtotal_gtq + self.tax_amount_gtq).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    # ── Transiciones ─────────────────────────────────────────────────────────

    def confirm(self, user):
        """Confirma la OC y registra el compromiso financiero."""
        if self.status not in (POStatus.DRAFT, POStatus.SENT):
            raise ValidationError('Solo se puede confirmar una OC en borrador o enviada.')
        if not self.lines.exists():
            raise ValidationError('La OC debe tener al menos una línea antes de confirmar.')
        self.status       = POStatus.CONFIRMED
        self.confirmed_by = user
        self.confirmed_at = timezone.now()
        self.save(update_fields=['status', 'confirmed_by', 'confirmed_at', 'updated_at'])
        try:
            from apps.ledger.services import PostingService
            PostingService.create_po_commitment(self)
        except Exception:
            pass  # contabilización no bloquea flujo operacional

    def refresh_receipt_status(self):
        """Recalcula el estado de recepción. Llamado por GoodsReceipt.post()."""
        if self.status == POStatus.CANCELLED:
            return
        lines = list(self.lines.all())
        if not lines:
            return
        all_received = all(line.is_fully_received for line in lines)
        any_received = any(line.quantity_received_total > Decimal('0') for line in lines)
        if all_received:
            new_status = POStatus.RECEIVED
        elif any_received:
            new_status = POStatus.PARTIALLY_RECEIVED
        else:
            return
        self.status = new_status
        self.save(update_fields=['status', 'updated_at'])


class PurchaseOrderLine(models.Model):
    purchase_order = models.ForeignKey(
        PurchaseOrder, on_delete=models.CASCADE,
        related_name='lines', verbose_name='Orden de compra',
    )
    product        = models.ForeignKey(
        'inventory.Product',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='po_lines',
        verbose_name='Producto (inventario)',
    )
    description    = models.CharField(max_length=500, verbose_name='Descripción')
    unit           = models.CharField(max_length=50, blank=True, verbose_name='Unidad')
    quantity       = models.DecimalField(max_digits=12, decimal_places=3, verbose_name='Cantidad pedida')
    unit_cost_gtq  = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='Costo unitario (GTQ)')
    cost_code      = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='po_lines',
        verbose_name='Código de costo',
    )
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Línea de OC'
        verbose_name_plural = 'Líneas de OC'
        ordering            = ['order', 'id']

    def __str__(self):
        return f'{self.description} × {self.quantity}'

    @property
    def subtotal_gtq(self):
        return (self.quantity * self.unit_cost_gtq).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def quantity_received_total(self):
        """Cantidad total recibida en recepciones registradas (posted)."""
        from django.db.models import Sum
        result = self.receipt_lines.filter(
            receipt__status=GRStatus.POSTED
        ).aggregate(t=Sum('quantity_received'))['t']
        return result or Decimal('0')

    @property
    def remaining_qty(self):
        return max(self.quantity - self.quantity_received_total, Decimal('0'))

    @property
    def is_fully_received(self):
        return self.remaining_qty == Decimal('0')


# ─── Recepción de mercancía (GR) ──────────────────────────────────────────────

class GoodsReceipt(models.Model):
    """
    Entrada física de mercancía contra una OC.
    Al registrar (post), crea StockMovements en inventario para líneas con producto.
    """
    year     = models.PositiveSmallIntegerField(editable=False, verbose_name='Año')
    sequence = models.PositiveIntegerField(editable=False, verbose_name='Secuencia')

    purchase_order = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.PROTECT,
        related_name='goods_receipts',
        verbose_name='Orden de compra',
    )
    received_by    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='goods_receipts',
        verbose_name='Recibido por',
    )
    received_date  = models.DateField(verbose_name='Fecha de recepción')
    status         = models.CharField(
        max_length=15, choices=GRStatus.choices,
        default=GRStatus.DRAFT, verbose_name='Estado',
    )
    notes          = models.TextField(blank=True, verbose_name='Notas / observaciones')
    created_by     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_goods_receipts',
        verbose_name='Creado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Recepción de mercancía'
        verbose_name_plural = 'Recepciones de mercancía'
        ordering            = ['-received_date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.year = timezone.now().year
            last = GoodsReceipt.objects.filter(year=self.year).aggregate(
                m=models.Max('sequence')
            )['m'] or 0
            self.sequence = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'GR-{self.year}-{self.sequence:04d}'

    def post(self):
        """
        Registra la recepción:
        1. Valida que no se exceda la cantidad pendiente por línea.
        2. Crea StockMovement (IN) para cada línea que tenga producto de inventario.
        3. Actualiza el estado de la OC.
        """
        if self.status != GRStatus.DRAFT:
            raise ValidationError('Solo se puede registrar una recepción en borrador.')
        lines = list(self.lines.select_related('po_line__product').all())
        if not lines:
            raise ValidationError('La recepción debe tener al menos una línea.')

        from apps.inventory.models import StockMovement, MovementType

        for line in lines:
            if line.quantity_received <= Decimal('0'):
                raise ValidationError(
                    f'La cantidad recibida de "{line.po_line.description}" debe ser mayor a cero.'
                )
            remaining = line.po_line.remaining_qty
            if line.quantity_received > remaining:
                raise ValidationError(
                    f'Se intenta recibir {line.quantity_received} '
                    f'de "{line.po_line.description}" pero solo quedan {remaining} pendientes.'
                )
            # Crear movimiento de inventario para productos registrados
            if line.po_line.product:
                StockMovement.objects.create(
                    product          = line.po_line.product,
                    project          = self.purchase_order.project,
                    phase            = self.purchase_order.phase,
                    cost_code        = line.po_line.cost_code,
                    movement_type    = MovementType.IN,
                    quantity         = line.quantity_received,
                    unit_price_gtq   = line.unit_cost_gtq,
                    notes            = f'Recepción {self} — OC {self.purchase_order}',
                    reference_number = str(self),
                    performed_by     = self.received_by,
                )

        self.status = GRStatus.POSTED
        self.save(update_fields=['status', 'updated_at'])
        self.purchase_order.refresh_receipt_status()
        try:
            from apps.ledger.services import PostingService
            PostingService.post_goods_receipt(self)
        except Exception:
            pass  # contabilización no bloquea flujo operacional


class GoodsReceiptLine(models.Model):
    receipt           = models.ForeignKey(
        GoodsReceipt, on_delete=models.CASCADE,
        related_name='lines', verbose_name='Recepción',
    )
    po_line           = models.ForeignKey(
        PurchaseOrderLine,
        on_delete=models.PROTECT,
        related_name='receipt_lines',
        verbose_name='Línea de OC',
    )
    quantity_received = models.DecimalField(max_digits=12, decimal_places=3, verbose_name='Cantidad recibida')
    unit_cost_gtq     = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name='Costo unitario real (GTQ)',
        help_text='Por defecto igual al de la OC. Editar si hay discrepancia.',
    )
    notes = models.CharField(max_length=300, blank=True, verbose_name='Notas de línea')

    class Meta:
        verbose_name        = 'Línea de recepción'
        verbose_name_plural = 'Líneas de recepción'

    def __str__(self):
        return f'{self.po_line.description} × {self.quantity_received}'

    @property
    def subtotal_gtq(self):
        return (self.quantity_received * self.unit_cost_gtq).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


# ─── Factura de proveedor (SPI) ───────────────────────────────────────────────

class SupplierInvoice(models.Model):
    """
    Factura recibida de un proveedor — representa el pasivo (Cuentas por Pagar).
    Distinto de financials.Invoice, que es la factura emitida al cliente.
    """
    year     = models.PositiveSmallIntegerField(editable=False, verbose_name='Año')
    sequence = models.PositiveIntegerField(editable=False, verbose_name='Secuencia')

    supplier          = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.PROTECT,
        related_name='invoices_received',
        verbose_name='Proveedor',
    )
    purchase_order    = models.ForeignKey(
        PurchaseOrder,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='supplier_invoices',
        verbose_name='Orden de compra',
    )
    goods_receipt     = models.ForeignKey(
        GoodsReceipt,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='supplier_invoices',
        verbose_name='Recepción de mercancía',
    )
    accounting_period = models.ForeignKey(
        'ledger.AccountingPeriod',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='supplier_invoices',
        verbose_name='Período contable',
    )
    # N° de factura del proveedor (su documento)
    supplier_invoice_number = models.CharField(max_length=100, blank=True, verbose_name='N° factura del proveedor')
    # FEL del proveedor — para deducción de IVA (pending validación contador)
    fel_number       = models.CharField(max_length=100, blank=True, verbose_name='N° FEL del proveedor (SAT)')
    fel_status       = models.CharField(
        max_length=15,
        choices=[('pending', 'Pendiente'), ('certified', 'Certificada'), ('cancelled', 'Anulada')],
        default='pending',
        verbose_name='Estado FEL',
    )
    fel_certified_at = models.DateTimeField(null=True, blank=True, verbose_name='Certificada FEL el')

    issue_date      = models.DateField(verbose_name='Fecha de la factura')
    due_date        = models.DateField(null=True, blank=True, verbose_name='Fecha de vencimiento')
    # IVA — pending validación contador; 12% tasa general Guatemala
    tax_percentage  = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('12.00'),
        verbose_name='IVA (%)',
        help_text='Validar deducibilidad del IVA con contador según régimen.',
    )
    status          = models.CharField(
        max_length=15, choices=SupplierInvoiceStatus.choices,
        default=SupplierInvoiceStatus.DRAFT, verbose_name='Estado',
    )
    notes           = models.TextField(blank=True, verbose_name='Notas')
    created_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_supplier_invoices',
        verbose_name='Creada por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Factura de proveedor'
        verbose_name_plural = 'Facturas de proveedor'
        ordering            = ['-issue_date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.year = timezone.now().year
            last = SupplierInvoice.objects.filter(year=self.year).aggregate(
                m=models.Max('sequence')
            )['m'] or 0
            self.sequence = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        ref = self.supplier_invoice_number or self.internal_number
        return f'{ref} — {self.supplier}'

    @property
    def internal_number(self):
        return f'SPI-{self.year}-{self.sequence:04d}'

    # ── Totales ───────────────────────────────────────────────────────────────

    @property
    def subtotal_gtq(self):
        from django.db.models import Sum, F
        result = self.lines.aggregate(total=Sum(F('quantity') * F('unit_cost_gtq')))['total']
        return (result or Decimal('0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def tax_amount_gtq(self):
        return (self.subtotal_gtq * self.tax_percentage / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def total_gtq(self):
        return (self.subtotal_gtq + self.tax_amount_gtq).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def amount_paid_gtq(self):
        from django.db.models import Sum
        result = self.payment_allocations.filter(
            payment__status=SupplierPaymentStatus.POSTED
        ).aggregate(t=Sum('amount_allocated'))['t']
        return result or Decimal('0')

    @property
    def balance_due_gtq(self):
        return (self.total_gtq - self.amount_paid_gtq).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def is_overdue(self):
        from datetime import date
        return (
            self.due_date is not None
            and self.due_date < date.today()
            and self.status not in (SupplierInvoiceStatus.PAID, SupplierInvoiceStatus.CANCELLED)
        )

    def post(self):
        if self.status != SupplierInvoiceStatus.DRAFT:
            raise ValidationError('Solo se puede registrar una factura en borrador.')
        if not self.lines.exists():
            raise ValidationError('La factura debe tener al menos una línea.')
        self.status = SupplierInvoiceStatus.POSTED
        self.save(update_fields=['status', 'updated_at'])
        # Avanzar estado de la OC si ya se recibió todo
        if self.purchase_order and self.purchase_order.status == POStatus.RECEIVED:
            self.purchase_order.status = POStatus.INVOICED
            self.purchase_order.save(update_fields=['status', 'updated_at'])
        try:
            from apps.ledger.services import PostingService
            PostingService.post_supplier_invoice(self)
        except Exception:
            pass  # contabilización no bloquea flujo operacional


class SupplierInvoiceLine(models.Model):
    invoice       = models.ForeignKey(
        SupplierInvoice, on_delete=models.CASCADE,
        related_name='lines', verbose_name='Factura',
    )
    po_line       = models.ForeignKey(
        PurchaseOrderLine,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='invoice_lines',
        verbose_name='Línea de OC',
    )
    description   = models.CharField(max_length=500, verbose_name='Descripción')
    quantity      = models.DecimalField(max_digits=12, decimal_places=3, verbose_name='Cantidad')
    unit_cost_gtq = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='Costo unitario (GTQ)')
    cost_code     = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='supplier_invoice_lines',
        verbose_name='Código de costo',
    )
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Orden')

    class Meta:
        verbose_name        = 'Línea de factura de proveedor'
        verbose_name_plural = 'Líneas de factura de proveedor'
        ordering            = ['order', 'id']

    def __str__(self):
        return f'{self.description} × {self.quantity}'

    @property
    def subtotal_gtq(self):
        return (self.quantity * self.unit_cost_gtq).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


# ─── Pago a proveedor (PAY) ───────────────────────────────────────────────────

class SupplierPayment(models.Model):
    """
    Pago emitido a un proveedor.
    Se asigna a facturas mediante SupplierPaymentAllocation (N:N con montos parciales).
    """
    year     = models.PositiveSmallIntegerField(editable=False, verbose_name='Año')
    sequence = models.PositiveIntegerField(editable=False, verbose_name='Secuencia')

    supplier        = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name='Proveedor',
    )
    payment_method  = models.CharField(
        max_length=20, choices=PaymentMethod.choices,
        default=PaymentMethod.BANK_TRANSFER, verbose_name='Método de pago',
    )
    payment_date    = models.DateField(verbose_name='Fecha de pago')
    amount_gtq      = models.DecimalField(max_digits=16, decimal_places=2, verbose_name='Monto total pagado (GTQ)')
    bank_reference  = models.CharField(max_length=200, blank=True, verbose_name='Referencia bancaria / cheque')
    status          = models.CharField(
        max_length=15, choices=SupplierPaymentStatus.choices,
        default=SupplierPaymentStatus.DRAFT, verbose_name='Estado',
    )
    notes           = models.TextField(blank=True, verbose_name='Notas')
    created_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_supplier_payments',
        verbose_name='Creado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Pago a proveedor'
        verbose_name_plural = 'Pagos a proveedor'
        ordering            = ['-payment_date', '-created_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            self.year = timezone.now().year
            last = SupplierPayment.objects.filter(year=self.year).aggregate(
                m=models.Max('sequence')
            )['m'] or 0
            self.sequence = last + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f'PAY-{self.year}-{self.sequence:04d} — {self.supplier}'

    @property
    def amount_allocated_gtq(self):
        from django.db.models import Sum
        result = self.allocations.aggregate(t=Sum('amount_allocated'))['t']
        return result or Decimal('0')

    @property
    def amount_unallocated_gtq(self):
        return (self.amount_gtq - self.amount_allocated_gtq).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def post(self):
        """
        Registra el pago:
        1. Valida que el total asignado no supere el monto del pago.
        2. Valida que todas las facturas sean del mismo proveedor.
        3. Marca como pagadas las facturas cubiertas completamente.
        """
        if self.status != SupplierPaymentStatus.DRAFT:
            raise ValidationError('Solo se puede registrar un pago en borrador.')
        allocations = list(self.allocations.select_related('invoice').all())
        if not allocations:
            raise ValidationError('El pago debe tener al menos una asignación a factura.')

        total_allocated = sum(a.amount_allocated for a in allocations)
        if total_allocated > self.amount_gtq:
            raise ValidationError(
                f'El total asignado (Q {total_allocated}) supera el monto del pago (Q {self.amount_gtq}).'
            )

        for alloc in allocations:
            if alloc.invoice.supplier_id != self.supplier_id:
                raise ValidationError(
                    f'La factura {alloc.invoice} pertenece a un proveedor distinto.'
                )
            alloc.invoice.refresh_from_db()
            new_paid = alloc.invoice.amount_paid_gtq + alloc.amount_allocated
            if new_paid >= alloc.invoice.total_gtq:
                alloc.invoice.status = SupplierInvoiceStatus.PAID
                alloc.invoice.save(update_fields=['status', 'updated_at'])

        self.status = SupplierPaymentStatus.POSTED
        self.save(update_fields=['status', 'updated_at'])
        try:
            from apps.ledger.services import PostingService
            PostingService.post_supplier_payment(self)
        except Exception:
            pass  # contabilización no bloquea flujo operacional


class SupplierPaymentAllocation(models.Model):
    """
    Asignación parcial de un pago a una factura de proveedor.
    Permite cubrir múltiples facturas con un mismo pago.
    """
    payment          = models.ForeignKey(
        SupplierPayment, on_delete=models.CASCADE,
        related_name='allocations', verbose_name='Pago',
    )
    invoice          = models.ForeignKey(
        SupplierInvoice, on_delete=models.PROTECT,
        related_name='payment_allocations', verbose_name='Factura',
    )
    amount_allocated = models.DecimalField(max_digits=16, decimal_places=2, verbose_name='Monto asignado (GTQ)')

    class Meta:
        verbose_name        = 'Asignación de pago'
        verbose_name_plural = 'Asignaciones de pago'
        unique_together     = [('payment', 'invoice')]

    def __str__(self):
        return f'{self.payment} → {self.invoice} Q{self.amount_allocated}'

    def clean(self):
        if self.amount_allocated <= Decimal('0'):
            raise ValidationError('El monto asignado debe ser mayor a cero.')
