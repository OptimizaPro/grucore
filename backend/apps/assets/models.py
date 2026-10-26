from decimal import Decimal, ROUND_HALF_UP
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone


# ─── Choices ─────────────────────────────────────────────────────────────────

class DepreciationMethod(models.TextChoices):
    STRAIGHT_LINE       = 'straight_line',       'Línea recta'
    DECLINING_BALANCE   = 'declining_balance',   'Saldo decreciente'
    UNITS_OF_PRODUCTION = 'units_of_production', 'Unidades de producción'


class AssetStatus(models.TextChoices):
    ACTIVE           = 'active',           'Activo'
    IN_MAINTENANCE   = 'in_maintenance',   'En mantenimiento'
    IDLE             = 'idle',             'Inactivo / depósito'
    DISPOSED         = 'disposed',         'Dado de baja'


class MaintenanceType(models.TextChoices):
    PREVENTIVE     = 'preventive',     'Preventivo'
    CORRECTIVE     = 'corrective',     'Correctivo'
    MAJOR_OVERHAUL = 'major_overhaul', 'Revisión mayor'
    INSPECTION     = 'inspection',     'Inspección'


# ─── Categoría de activo ──────────────────────────────────────────────────────

class AssetCategory(models.Model):
    """
    Tipo de activo fijo. Incluye la tasa máxima SAT y vida útil sugerida.

    IMPORTANTE — tasa SAT: pending validación contador según régimen fiscal y
    resolución SAT vigente. No hardcodear como deducción automática.
    """
    name                        = models.CharField(max_length=100, unique=True, verbose_name='Nombre')
    description                 = models.TextField(blank=True, verbose_name='Descripción')
    default_useful_life_years   = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('5.00'),
        verbose_name='Vida útil sugerida (años)',
    )
    default_depreciation_method = models.CharField(
        max_length=25, choices=DepreciationMethod.choices,
        default=DepreciationMethod.STRAIGHT_LINE,
        verbose_name='Método de depreciación sugerido',
    )
    # Tasa máxima SAT — informativa, requiere validación contador
    sat_max_depreciation_rate_pct = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('0'),
        verbose_name='Tasa máx. depreciación SAT (%)',
        help_text='Referencia de tasa máxima SAT — validar con contador antes de aplicar.',
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name        = 'Categoría de activo'
        verbose_name_plural = 'Categorías de activos'
        ordering            = ['name']

    def __str__(self):
        return self.name


# ─── Activo fijo ──────────────────────────────────────────────────────────────

class FixedAsset(models.Model):
    """
    Activo fijo: maquinaria, vehículo, herramienta mayor, equipo de cómputo, etc.

    La depreciación contable se registra mediante AssetDepreciationEntry.
    La asignación analítica a proyectos se registra mediante EquipmentUsageLog.
    Ambos costos deben conciliarse periódicamente — no duplicar en P&L.
    """
    # ── Numeración ────────────────────────────────────────────────────────────
    asset_number = models.CharField(
        max_length=30, unique=True, blank=True,
        verbose_name='N° de activo',
        help_text='Se genera automáticamente si se deja vacío.',
    )

    # ── Identificación ────────────────────────────────────────────────────────
    name          = models.CharField(max_length=300, verbose_name='Nombre del activo')
    description   = models.TextField(blank=True, verbose_name='Descripción')
    category      = models.ForeignKey(
        AssetCategory,
        on_delete=models.PROTECT,
        related_name='assets',
        verbose_name='Categoría',
    )
    brand         = models.CharField(max_length=100, blank=True, verbose_name='Marca')
    model         = models.CharField(max_length=100, blank=True, verbose_name='Modelo')
    serial_number = models.CharField(max_length=200, blank=True, verbose_name='N° de serie / placa')
    year_of_manufacture = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name='Año de fabricación')

    # ── Adquisición ───────────────────────────────────────────────────────────
    acquisition_date  = models.DateField(verbose_name='Fecha de adquisición')
    purchase_cost_gtq = models.DecimalField(
        max_digits=16, decimal_places=2,
        verbose_name='Costo de adquisición (GTQ)',
        help_text='Incluye flete, instalación y otros costos directamente atribuibles.',
    )
    supplier          = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='purchased_assets',
        verbose_name='Proveedor',
    )
    purchase_invoice_ref = models.CharField(max_length=100, blank=True, verbose_name='Referencia de factura de compra')

    # ── Depreciación ──────────────────────────────────────────────────────────
    depreciation_method  = models.CharField(
        max_length=25, choices=DepreciationMethod.choices,
        default=DepreciationMethod.STRAIGHT_LINE,
        verbose_name='Método de depreciación',
    )
    useful_life_years    = models.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal('5.00'),
        verbose_name='Vida útil (años)',
        help_text='Vida útil para depreciación contable.',
    )
    residual_value_gtq   = models.DecimalField(
        max_digits=14, decimal_places=2, default=Decimal('0.00'),
        verbose_name='Valor residual (GTQ)',
    )
    in_service_date      = models.DateField(
        null=True, blank=True,
        verbose_name='Fecha de puesta en servicio',
        help_text='La depreciación comienza en esta fecha. Si se deja vacía se usa la fecha de adquisición.',
    )

    # ── Estado y ubicación ────────────────────────────────────────────────────
    status          = models.CharField(
        max_length=20, choices=AssetStatus.choices,
        default=AssetStatus.ACTIVE, verbose_name='Estado',
    )
    current_project = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_assets',
        verbose_name='Proyecto actual',
    )
    current_phase   = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='assigned_assets',
        verbose_name='Fase actual',
    )
    location_notes  = models.CharField(max_length=300, blank=True, verbose_name='Ubicación / notas')

    # ── Tarifa de uso interna (gestión analítica) ─────────────────────────────
    # Esta tarifa se usa para asignar costo de equipo a proyectos en EquipmentUsageLog.
    # Debe cubrir depreciación + mantenimiento + combustible + otros.
    # NO debe duplicar la depreciación contable en el P&L.
    internal_rate_gtq_per_hour = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal('0.00'),
        verbose_name='Tarifa interna (GTQ/hora)',
        help_text='Tarifa de costo analítico por hora de uso. Revisar periódicamente para '
                  'que concilie con depreciación + mantenimiento real.',
    )
    rate_last_reviewed_at = models.DateField(null=True, blank=True, verbose_name='Tarifa revisada el')

    # ── Auditoría ─────────────────────────────────────────────────────────────
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_assets',
        verbose_name='Creado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Activo fijo'
        verbose_name_plural = 'Activos fijos'
        ordering            = ['category', 'name']

    def save(self, *args, **kwargs):
        if not self.asset_number:
            year = timezone.now().year
            last = FixedAsset.objects.filter(
                asset_number__startswith=f'ACT-{year}-'
            ).count()
            self.asset_number = f'ACT-{year}-{last + 1:04d}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.asset_number} — {self.name}'

    # ── Depreciación ──────────────────────────────────────────────────────────

    @property
    def depreciable_amount_gtq(self):
        """Monto depreciable = costo − valor residual."""
        return (self.purchase_cost_gtq - self.residual_value_gtq).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def monthly_depreciation_gtq(self):
        """
        Depreciación mensual (línea recta).
        Para otros métodos retorna None — calcular vía servicio.
        """
        if self.depreciation_method != DepreciationMethod.STRAIGHT_LINE:
            return None
        if not self.useful_life_years or self.useful_life_years <= 0:
            return Decimal('0.00')
        months = self.useful_life_years * Decimal('12')
        return (self.depreciable_amount_gtq / months).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def accumulated_depreciation_gtq(self):
        """Suma de todas las entradas de depreciación registradas (posted)."""
        from django.db.models import Sum
        result = self.depreciation_entries.filter(is_posted=True).aggregate(
            t=Sum('amount_gtq')
        )['t']
        return result or Decimal('0.00')

    @property
    def net_book_value_gtq(self):
        """Valor neto en libros = costo − depreciación acumulada."""
        return (self.purchase_cost_gtq - self.accumulated_depreciation_gtq).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def depreciation_start_date(self):
        return self.in_service_date or self.acquisition_date

    def generate_depreciation_entry(self, period, user, amount_override=None):
        """
        Genera (o retorna existente) la entrada de depreciación para un período.
        amount_override: usar si se aplica método diferente a línea recta.
        """
        existing = self.depreciation_entries.filter(accounting_period=period).first()
        if existing:
            return existing
        if amount_override is not None:
            amount = amount_override.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            amount = self.monthly_depreciation_gtq
            if amount is None:
                raise ValidationError(
                    f'Método {self.get_depreciation_method_display()} requiere amount_override explícito.'
                )
        # No depreciar si ya se alcanzó el valor residual
        remaining = self.net_book_value_gtq - self.residual_value_gtq
        if remaining <= Decimal('0'):
            return None
        amount = min(amount, remaining)
        entry = AssetDepreciationEntry.objects.create(
            asset             = self,
            accounting_period = period,
            amount_gtq        = amount,
            method_used       = self.depreciation_method,
            is_posted         = False,
            created_by        = user,
        )
        return entry


# ─── Entrada de depreciación ──────────────────────────────────────────────────

class AssetDepreciationEntry(models.Model):
    """
    Depreciación periódica de un activo fijo.
    is_posted=True indica que el asiento contable fue creado (Bloque 8).
    """
    asset             = models.ForeignKey(
        FixedAsset, on_delete=models.CASCADE,
        related_name='depreciation_entries', verbose_name='Activo',
    )
    accounting_period = models.ForeignKey(
        'ledger.AccountingPeriod',
        on_delete=models.PROTECT,
        related_name='depreciation_entries',
        verbose_name='Período contable',
    )
    amount_gtq  = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='Monto depreciación (GTQ)')
    method_used = models.CharField(max_length=25, choices=DepreciationMethod.choices, verbose_name='Método aplicado')
    is_posted   = models.BooleanField(default=False, verbose_name='Asiento contable creado')
    # journal_entry FK añadido en Bloque 8 (PostingService)
    notes       = models.TextField(blank=True, verbose_name='Notas')
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_depreciation_entries',
        verbose_name='Creado por',
    )
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Entrada de depreciación'
        verbose_name_plural = 'Entradas de depreciación'
        unique_together     = [('asset', 'accounting_period')]
        ordering            = ['-accounting_period__year', '-accounting_period__month']

    def __str__(self):
        return f'Depreciación {self.asset.asset_number} — {self.accounting_period} Q{self.amount_gtq}'


# ─── Registro de uso de equipo ────────────────────────────────────────────────

class EquipmentUsageLog(models.Model):
    """
    Registro de uso de un activo (equipo/maquinaria) en un proyecto.

    Genera el costo analítico de equipo asignado al proyecto:
        allocated_cost_gtq = hours_used × rate_gtq_per_hour

    Esta asignación analítica debe conciliarse con los costos contables reales
    (depreciación + mantenimiento + combustible) para evitar doble conteo.
    """
    asset      = models.ForeignKey(
        FixedAsset, on_delete=models.CASCADE,
        related_name='usage_logs', verbose_name='Activo',
    )
    project    = models.ForeignKey(
        'projects.Project', on_delete=models.CASCADE,
        related_name='equipment_usage_logs', verbose_name='Proyecto',
    )
    phase      = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='equipment_usage_logs', verbose_name='Fase',
    )
    cost_code  = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='equipment_usage_logs', verbose_name='Código de costo',
    )
    operator   = models.ForeignKey(
        'workers.Worker',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='equipment_usage_logs', verbose_name='Operador',
    )
    usage_date = models.DateField(verbose_name='Fecha de uso')
    hours_used = models.DecimalField(
        max_digits=8, decimal_places=2,
        verbose_name='Horas utilizadas',
    )
    # Tarifa snapshot al momento del registro (inmutable para trazabilidad)
    rate_gtq_per_hour = models.DecimalField(
        max_digits=10, decimal_places=2,
        verbose_name='Tarifa (GTQ/hora)',
        help_text='Snapshot de la tarifa interna al momento del registro.',
    )
    # Combustible (opcional — puede registrarse por separado vía Expense)
    fuel_liters   = models.DecimalField(
        max_digits=8, decimal_places=3, null=True, blank=True,
        verbose_name='Combustible consumido (litros)',
    )
    fuel_cost_gtq = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        verbose_name='Costo de combustible (GTQ)',
        help_text='Si se registra aquí, no crear también un Expense para evitar doble conteo.',
    )
    notes      = models.TextField(blank=True, verbose_name='Notas')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_usage_logs', verbose_name='Creado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Registro de uso de equipo'
        verbose_name_plural = 'Registros de uso de equipo'
        ordering            = ['-usage_date', '-created_at']

    def __str__(self):
        return f'{self.asset.asset_number} — {self.project} — {self.usage_date} ({self.hours_used}h)'

    @property
    def allocated_cost_gtq(self):
        """Costo analítico asignado al proyecto."""
        return (self.hours_used * self.rate_gtq_per_hour).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    @property
    def total_cost_including_fuel_gtq(self):
        """Costo total incluyendo combustible si fue capturado aquí."""
        fuel = self.fuel_cost_gtq or Decimal('0')
        return (self.allocated_cost_gtq + fuel).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    def save(self, *args, **kwargs):
        # Snapshot automático de la tarifa si no se especificó
        if not self.pk and not self.rate_gtq_per_hour:
            self.rate_gtq_per_hour = self.asset.internal_rate_gtq_per_hour
        super().save(*args, **kwargs)


# ─── Registro de mantenimiento ────────────────────────────────────────────────

class MaintenanceRecord(models.Model):
    """
    Evento de mantenimiento de un activo fijo.
    El costo se registra aquí como referencia; el gasto contable se gestiona
    vía apps.financials.Expense o apps.purchasing.SupplierInvoice para evitar doble conteo.
    """
    asset             = models.ForeignKey(
        FixedAsset, on_delete=models.CASCADE,
        related_name='maintenance_records', verbose_name='Activo',
    )
    maintenance_type  = models.CharField(
        max_length=20, choices=MaintenanceType.choices,
        verbose_name='Tipo de mantenimiento',
    )
    maintenance_date  = models.DateField(verbose_name='Fecha')
    description       = models.TextField(verbose_name='Descripción del trabajo')
    cost_gtq          = models.DecimalField(
        max_digits=14, decimal_places=2, default=Decimal('0.00'),
        verbose_name='Costo (GTQ)',
        help_text='Referencia de costo. El gasto contable se registra en Gastos o Factura de proveedor.',
    )
    supplier          = models.ForeignKey(
        'suppliers.Supplier',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='maintenance_jobs',
        verbose_name='Proveedor de mantenimiento',
    )
    performed_internally = models.BooleanField(default=False, verbose_name='Realizado internamente')
    performed_by_notes   = models.CharField(max_length=300, blank=True, verbose_name='Realizado por (notas)')
    invoice_reference    = models.CharField(max_length=100, blank=True, verbose_name='Referencia de factura')
    next_maintenance_date = models.DateField(null=True, blank=True, verbose_name='Próximo mantenimiento')
    # Campos de control
    odometer_km       = models.DecimalField(
        max_digits=10, decimal_places=1, null=True, blank=True,
        verbose_name='Odómetro (km)',
        help_text='Solo aplica para vehículos.',
    )
    hours_at_service  = models.DecimalField(
        max_digits=10, decimal_places=1, null=True, blank=True,
        verbose_name='Horas de máquina al servicio',
    )
    notes             = models.TextField(blank=True, verbose_name='Notas adicionales')
    created_by        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='created_maintenance_records',
        verbose_name='Creado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Registro de mantenimiento'
        verbose_name_plural = 'Registros de mantenimiento'
        ordering            = ['-maintenance_date']

    def __str__(self):
        return f'{self.get_maintenance_type_display()} — {self.asset.asset_number} ({self.maintenance_date})'
