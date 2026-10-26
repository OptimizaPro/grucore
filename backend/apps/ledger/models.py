from decimal import Decimal, ROUND_HALF_UP
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


# ─── Período contable ────────────────────────────────────────────────────────

class PeriodState(models.TextChoices):
    OPEN   = 'open',   'Abierto'
    CLOSED = 'closed', 'Cerrado'
    LOCKED = 'locked', 'Bloqueado'


class AccountingPeriod(models.Model):
    year      = models.PositiveSmallIntegerField(verbose_name='Año')
    month     = models.PositiveSmallIntegerField(verbose_name='Mes')   # 1–12
    state     = models.CharField(max_length=10, choices=PeriodState.choices, default=PeriodState.OPEN, verbose_name='Estado')
    closed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='closed_periods',
        verbose_name='Cerrado por',
    )
    closed_at = models.DateTimeField(null=True, blank=True, verbose_name='Cerrado el')
    notes     = models.TextField(blank=True, verbose_name='Notas de cierre')

    class Meta:
        verbose_name        = 'Período contable'
        verbose_name_plural = 'Períodos contables'
        unique_together     = [('year', 'month')]
        ordering            = ['-year', '-month']

    def __str__(self):
        return f'{self.year}-{str(self.month).zfill(2)}'

    @property
    def label(self):
        import calendar
        return f'{calendar.month_name[self.month]} {self.year}'

    def close(self, user):
        if self.state == PeriodState.LOCKED:
            raise ValidationError('El período está bloqueado y no puede cerrarse de nuevo.')
        self.state     = PeriodState.CLOSED
        self.closed_by = user
        self.closed_at = timezone.now()
        self.save(update_fields=['state', 'closed_by', 'closed_at'])

    def lock(self, user):
        if self.state != PeriodState.CLOSED:
            raise ValidationError('Solo se puede bloquear un período ya cerrado.')
        self.state     = PeriodState.LOCKED
        self.closed_by = user
        self.closed_at = timezone.now()
        self.save(update_fields=['state', 'closed_by', 'closed_at'])

    @classmethod
    def get_or_create_for_date(cls, date):
        period, _ = cls.objects.get_or_create(year=date.year, month=date.month)
        return period


# ─── Catálogo de cuentas ─────────────────────────────────────────────────────

class AccountType(models.TextChoices):
    ASSET     = 'asset',     'Activo'
    LIABILITY = 'liability', 'Pasivo'
    EQUITY    = 'equity',    'Patrimonio'
    REVENUE   = 'revenue',   'Ingreso'
    EXPENSE   = 'expense',   'Gasto'


class AccountNature(models.TextChoices):
    DEBIT  = 'debit',  'Deudora (incrementa con Débito)'
    CREDIT = 'credit', 'Acreedora (incrementa con Crédito)'


class AccountLevel(models.TextChoices):
    HEADER  = 'header',  'Cabecera (agrupación — no imputable)'
    POSTING = 'posting', 'Imputable (recibe movimientos)'


class PLGroup(models.TextChoices):
    # Ingresos
    GROSS_REVENUE              = 'gross_revenue',              '1 · Ingresos brutos reconocidos'
    REVENUE_DEDUCTIONS         = 'revenue_deductions',         '2 · Deducciones de ingresos'
    # Costos directos
    DIRECT_MATERIALS           = 'direct_materials',           '4 · Materiales consumidos'
    DIRECT_LABOR               = 'direct_labor',               '5 · Mano de obra directa'
    SUBCONTRACTORS             = 'subcontractors',             '6 · Subcontratistas'
    DIRECT_EQUIPMENT_LOGISTICS = 'direct_equipment_logistics', '7 · Maquinaria y logística directa'
    # Gastos de estructura
    OVERHEAD_STAFF             = 'overhead_staff',             '10 · Personal de estructura'
    OVERHEAD_GENERAL           = 'overhead_general',           '11 · Gastos generales de estructura'
    OVERHEAD_COMMERCIAL        = 'overhead_commercial',        '12 · Comercial y marketing'
    # D&A
    DEPRECIATION_AMORT         = 'depreciation_amort',         '14 · Depreciación y amortización'
    OTHER_OPERATING            = 'other_operating',            '14b · Otros resultados operativos'
    # Financiero
    FINANCIAL_INCOME           = 'financial_income',           '16a · Ingresos financieros'
    FINANCIAL_EXPENSE          = 'financial_expense',          '16b · Gastos financieros'
    # Impuesto
    INCOME_TAX                 = 'income_tax',                 '18 · Impuesto sobre beneficios'
    # Balance
    BALANCE_ASSET              = 'balance_asset',              'Balance · Activo'
    BALANCE_LIABILITY          = 'balance_liability',          'Balance · Pasivo'
    BALANCE_EQUITY             = 'balance_equity',             'Balance · Patrimonio'


class Account(models.Model):
    code         = models.CharField(max_length=10, unique=True, verbose_name='Código')
    name         = models.CharField(max_length=200, verbose_name='Nombre')
    account_type = models.CharField(max_length=15, choices=AccountType.choices, verbose_name='Tipo')
    nature       = models.CharField(max_length=10, choices=AccountNature.choices, verbose_name='Naturaleza')
    level        = models.CharField(max_length=10, choices=AccountLevel.choices, default=AccountLevel.POSTING, verbose_name='Nivel')
    parent       = models.ForeignKey(
        'self',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='children',
        verbose_name='Cuenta padre',
    )
    pl_group     = models.CharField(
        max_length=30,
        choices=PLGroup.choices,
        blank=True,
        verbose_name='Grupo P&L',
        help_text='Línea del estado de resultados a la que pertenece esta cuenta.',
    )
    is_active    = models.BooleanField(default=True, verbose_name='Activa')
    notes        = models.TextField(blank=True, verbose_name='Notas')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Cuenta contable'
        verbose_name_plural = 'Catálogo de cuentas'
        ordering            = ['code']

    def __str__(self):
        return f'{self.code} — {self.name}'

    def clean(self):
        if self.parent and self.parent.pk == self.pk:
            raise ValidationError('Una cuenta no puede ser su propio padre.')
        if self.parent and self.parent.level == AccountLevel.POSTING:
            raise ValidationError('La cuenta padre no puede ser de nivel Imputable.')

    @property
    def full_path(self):
        parts = [self.code]
        node = self
        while node.parent_id:
            node = node.parent
            parts.insert(0, node.code)
        return ' › '.join(parts)


# ─── Asientos contables ──────────────────────────────────────────────────────

class EntryOrigin(models.TextChoices):
    INVOICE          = 'invoice',          'Factura emitida a cliente'
    CREDIT_NOTE      = 'credit_note',      'Nota de crédito a cliente'
    EXPENSE          = 'expense',          'Gasto operativo'
    SUPPLIER_INVOICE = 'supplier_invoice', 'Factura de proveedor'
    PAYMENT_RECEIVED = 'payment_received', 'Cobro recibido'
    PAYMENT_MADE     = 'payment_made',     'Pago realizado'
    STOCK_IN         = 'stock_in',         'Entrada de inventario'
    STOCK_OUT        = 'stock_out',        'Consumo de inventario a obra'
    STOCK_ADJUSTMENT = 'stock_adjustment', 'Ajuste de inventario'
    WORKLOG          = 'worklog',          'Parte de horas / nómina'
    DEPRECIATION     = 'depreciation',     'Depreciación de activo'
    EQUIPMENT_USE    = 'equipment_use',    'Uso de maquinaria en obra'
    SUBCONTRACT_CERT = 'subcontract_cert', 'Certificación de subcontrato'
    PERIOD_CLOSE     = 'period_close',     'Asiento de cierre de período'
    MANUAL           = 'manual',           'Asiento manual'
    REVERSAL         = 'reversal',         'Reversión de asiento'


class EntryState(models.TextChoices):
    DRAFT    = 'draft',    'Borrador'
    POSTED   = 'posted',   'Contabilizado'
    REVERSED = 'reversed', 'Revertido'


class JournalEntry(models.Model):
    number       = models.CharField(max_length=20, unique=True, editable=False, verbose_name='Número')
    date         = models.DateField(verbose_name='Fecha')
    period       = models.ForeignKey(
        AccountingPeriod,
        on_delete=models.PROTECT,
        related_name='entries',
        verbose_name='Período',
    )
    origin_type  = models.CharField(max_length=20, choices=EntryOrigin.choices, verbose_name='Origen')

    # Referencia al documento fuente (FK genérica)
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Tipo de documento fuente',
    )
    object_id    = models.PositiveIntegerField(null=True, blank=True, verbose_name='ID documento fuente')
    source       = GenericForeignKey('content_type', 'object_id')

    state        = models.CharField(max_length=10, choices=EntryState.choices, default=EntryState.DRAFT, verbose_name='Estado')
    description  = models.CharField(max_length=500, blank=True, verbose_name='Descripción')
    notes        = models.TextField(blank=True, verbose_name='Notas internas')
    created_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='journal_entries',
        verbose_name='Creado por',
    )
    reversed_by  = models.OneToOneField(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='reverses',
        verbose_name='Revertido por asiento',
    )
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Asiento contable'
        verbose_name_plural = 'Asientos contables'
        ordering            = ['-date', '-number']

    def __str__(self):
        return f'{self.number} — {self.description or self.get_origin_type_display()}'

    def save(self, *args, **kwargs):
        if not self.number:
            self.number = self._next_number()
        if not self.period_id:
            self.period = AccountingPeriod.get_or_create_for_date(self.date)
        super().save(*args, **kwargs)

    @staticmethod
    def _next_number():
        from django.utils import timezone
        year  = timezone.now().year
        count = JournalEntry.objects.filter(date__year=year).count()
        return f'AST-{year}-{str(count + 1).zfill(5)}'

    def clean(self):
        if self.period and self.period.state == PeriodState.LOCKED:
            raise ValidationError('No se puede crear ni modificar asientos en un período bloqueado.')
        if self.period and self.period.state == PeriodState.CLOSED and self.state == EntryState.DRAFT:
            raise ValidationError('El período está cerrado. Solo se permiten asientos ya contabilizados de ajuste.')

    @property
    def total_debit(self):
        return self.lines.aggregate(t=models.Sum('debit'))['t'] or Decimal('0.00')

    @property
    def total_credit(self):
        return self.lines.aggregate(t=models.Sum('credit'))['t'] or Decimal('0.00')

    @property
    def is_balanced(self):
        return self.total_debit == self.total_credit

    def post(self):
        """Contabiliza el asiento tras verificar que esté cuadrado."""
        if not self.is_balanced:
            raise ValidationError(
                f'El asiento no está cuadrado: Débito {self.total_debit} ≠ Crédito {self.total_credit}.'
            )
        if self.state != EntryState.DRAFT:
            raise ValidationError('Solo se pueden contabilizar asientos en estado Borrador.')
        self.state = EntryState.POSTED
        self.save(update_fields=['state', 'updated_at'])

    def reverse(self, user, description=''):
        """Crea un asiento de reversión simétrico."""
        if self.state != EntryState.POSTED:
            raise ValidationError('Solo se pueden revertir asientos contabilizados.')
        reversal = JournalEntry.objects.create(
            date        = timezone.now().date(),
            origin_type = EntryOrigin.REVERSAL,
            state       = EntryState.DRAFT,
            description = description or f'Reversión de {self.number}',
            created_by  = user,
        )
        for line in self.lines.all():
            JournalLine.objects.create(
                entry       = reversal,
                account     = line.account,
                debit       = line.credit,
                credit      = line.debit,
                project     = line.project,
                phase       = line.phase,
                cost_code   = line.cost_code,
                cost_center = line.cost_center,
                description = line.description,
            )
        reversal.post()
        self.state      = EntryState.REVERSED
        self.reversed_by = reversal
        self.save(update_fields=['state', 'reversed_by', 'updated_at'])
        return reversal


# ─── Mapeo de cuentas del sistema ────────────────────────────────────────────

class MappingKey(models.TextChoices):
    AP_SUPPLIERS         = 'ap_suppliers',         'CxP — Proveedores'
    AP_SUBCONTRACTORS    = 'ap_subcontractors',    'CxP — Subcontratistas'
    RETENTION_LIABILITY  = 'retention_liability',  'Retención de subcontratistas (pasivo)'
    INVENTORY_MATERIALS  = 'inventory_materials',  'Inventario de materiales'
    CASH_BANK            = 'cash_bank',            'Banco / Caja'
    ACCRUED_AP           = 'accrued_ap',           'Acumulaciones por pagar'
    DEPRECIATION_EXPENSE = 'depreciation_expense', 'Gasto de depreciación'
    ACCUMULATED_DEPR     = 'accumulated_depr',     'Depreciación acumulada (activo contra)'
    DIRECT_LABOR_EXPENSE = 'direct_labor_expense', 'Gasto de mano de obra directa'
    IVA_CREDIT_FISCAL    = 'iva_credit_fiscal',    'IVA Crédito Fiscal (activo)'
    AR_CLIENTS           = 'ar_clients',           'CxC — Clientes'
    REVENUE_SERVICES     = 'revenue_services',     'Ingresos por servicios / obra'
    PAYROLL_LIABILITY    = 'payroll_liability',    'Sueldos y salarios por pagar (pasivo)'
    IGSS_PATRONAL_LIAB   = 'igss_patronal_liab',   'Cuota patronal IGSS por pagar (pasivo)'


class AccountMapping(models.Model):
    """
    Mapeo de claves de sistema a cuentas GL.
    Permite que PostingService sepa a qué cuenta GL asignar cada tipo de movimiento
    sin hardcodear códigos de cuenta. Configurar en el admin antes de activar el posting.
    """
    key     = models.CharField(max_length=30, choices=MappingKey.choices, unique=True, verbose_name='Clave')
    account = models.ForeignKey(
        'Account',
        on_delete=models.PROTECT,
        related_name='system_mappings',
        verbose_name='Cuenta GL',
    )
    notes   = models.TextField(blank=True, verbose_name='Notas / justificación')
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='account_mappings_updated',
        verbose_name='Actualizado por',
    )

    class Meta:
        verbose_name        = 'Mapeo de cuenta'
        verbose_name_plural = 'Mapeos de cuentas del sistema'
        ordering            = ['key']

    def __str__(self):
        return f'{self.get_key_display()} → {self.account}'

    @classmethod
    def get(cls, key):
        """Retorna la cuenta para una clave. Lanza ValueError si no está configurado."""
        try:
            return cls.objects.select_related('account').get(key=key).account
        except cls.DoesNotExist:
            raise ValueError(
                f'AccountMapping para "{key}" no configurado. '
                f'Configure el mapeo en Contabilidad → Mapeos de cuentas antes de activar el posting.'
            )


# ─── Reglas fiscales configurables ───────────────────────────────────────────

class TaxType(models.TextChoices):
    IVA           = 'iva',           'IVA'
    ISR_RETENTION = 'isr_retention', 'Retención ISR (pagos a terceros)'
    ISR_CORPORATE = 'isr_corporate', 'ISR empresarial'
    IGSS_PATRONAL = 'igss_patronal', 'IGSS patronal'
    IGSS_LABORAL  = 'igss_laboral',  'IGSS laboral'
    STAMP_DUTY    = 'stamp_duty',    'Timbre fiscal'
    OTHER         = 'other',         'Otro'


class TaxRule(models.Model):
    """
    Regla fiscal configurable.

    IMPORTANTE: Todas las tasas y reglas requieren validación por contador /
    asesor fiscal guatemalteco antes de aplicarse. No utilizar como definición
    legal definitiva.
    """
    name         = models.CharField(max_length=200, verbose_name='Nombre de la regla')
    tax_type     = models.CharField(max_length=20, choices=TaxType.choices, verbose_name='Tipo de impuesto')
    rate_pct     = models.DecimalField(
        max_digits=7, decimal_places=4,
        verbose_name='Tasa (%)',
        help_text='Porcentaje. Ej: 12.0000 para IVA 12%. Pending validación contador.',
    )
    applies_from = models.DateField(verbose_name='Vigente desde')
    applies_to   = models.DateField(
        null=True, blank=True,
        verbose_name='Vigente hasta',
        help_text='Dejar vacío si la regla sigue vigente.',
    )
    regime       = models.CharField(
        max_length=200, blank=True,
        verbose_name='Régimen fiscal',
        help_text='Ej: "Régimen sobre utilidades", "Régimen simplificado", "General".',
    )
    description  = models.TextField(blank=True, verbose_name='Descripción / base legal')
    requires_fel = models.BooleanField(
        default=False,
        verbose_name='Requiere FEL',
        help_text='Si la deducción de este impuesto requiere factura FEL certificada por SAT.',
    )
    is_active    = models.BooleanField(default=True, verbose_name='Activa')
    created_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_tax_rules',
        verbose_name='Creado por',
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Regla fiscal'
        verbose_name_plural = 'Reglas fiscales'
        ordering            = ['tax_type', '-applies_from']

    def __str__(self):
        return f'{self.name} ({self.rate_pct}%) — {self.get_tax_type_display()}'

    @classmethod
    def get_active_rate(cls, tax_type, date=None):
        """
        Retorna la tasa activa para un tipo de impuesto en una fecha.
        Si no existe regla activa retorna None — nunca asume tasa default.
        """
        from datetime import date as date_type
        if date is None:
            date = date_type.today()
        rule = cls.objects.filter(
            tax_type=tax_type,
            is_active=True,
            applies_from__lte=date,
        ).filter(
            models.Q(applies_to__isnull=True) | models.Q(applies_to__gte=date)
        ).order_by('-applies_from').first()
        return rule.rate_pct if rule else None


# ─── Log de cierre de período ─────────────────────────────────────────────────

class PeriodCloseLog(models.Model):
    """Registro auditable de cada acción de cierre / apertura / bloqueo de período."""

    ACTION_CHOICES = [
        ('close',  'Cierre de período'),
        ('lock',   'Bloqueo de período'),
        ('reopen', 'Reapertura de período'),
    ]

    period                          = models.ForeignKey(
        AccountingPeriod,
        on_delete=models.CASCADE,
        related_name='close_logs',
        verbose_name='Período',
    )
    action                          = models.CharField(max_length=10, choices=ACTION_CHOICES, verbose_name='Acción')
    performed_by                    = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='period_close_logs',
        verbose_name='Realizado por',
    )
    depreciation_entries_generated  = models.PositiveIntegerField(default=0, verbose_name='Entradas depreciación generadas')
    journal_entries_draft_warnings  = models.PositiveIntegerField(default=0, verbose_name='Asientos borrador (advertencias)')
    notes                           = models.TextField(blank=True, verbose_name='Notas')
    created_at                      = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Log de cierre'
        verbose_name_plural = 'Logs de cierre de período'
        ordering            = ['-created_at']

    def __str__(self):
        return f'{self.get_action_display()} — {self.period} ({self.created_at:%Y-%m-%d %H:%M})'


class JournalLine(models.Model):
    entry       = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='lines', verbose_name='Asiento')
    account     = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='journal_lines', verbose_name='Cuenta')
    debit       = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0.00'), verbose_name='Débito (GTQ)')
    credit      = models.DecimalField(max_digits=16, decimal_places=2, default=Decimal('0.00'), verbose_name='Crédito (GTQ)')

    # Dimensiones analíticas
    project     = models.ForeignKey(
        'projects.Project',
        on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='journal_lines',
        verbose_name='Proyecto',
    )
    phase       = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='journal_lines',
        verbose_name='Fase',
    )
    cost_code   = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='journal_lines',
        verbose_name='Código de costo',
    )
    cost_center = models.ForeignKey(
        'core.CostCenter',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='journal_lines',
        verbose_name='Centro de costo',
    )
    description = models.CharField(max_length=500, blank=True, verbose_name='Descripción')

    class Meta:
        verbose_name        = 'Línea de asiento'
        verbose_name_plural = 'Líneas de asiento'

    def __str__(self):
        side = f'D:{self.debit}' if self.debit else f'C:{self.credit}'
        return f'{self.account.code} | {side}'

    def clean(self):
        if self.debit < Decimal('0') or self.credit < Decimal('0'):
            raise ValidationError('Los importes de débito y crédito no pueden ser negativos.')
        if self.debit > Decimal('0') and self.credit > Decimal('0'):
            raise ValidationError('Una línea no puede tener débito y crédito simultáneamente.')
        if self.debit == Decimal('0') and self.credit == Decimal('0'):
            raise ValidationError('Una línea debe tener importe en débito o en crédito.')
        if self.account.level == AccountLevel.HEADER:
            raise ValidationError(
                f'La cuenta {self.account.code} es de cabecera y no puede recibir movimientos.'
            )

    @property
    def amount(self):
        """Retorna el importe con signo: positivo = débito, negativo = crédito."""
        return self.debit - self.credit
