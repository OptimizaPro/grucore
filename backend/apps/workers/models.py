from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, date, timedelta
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class WorkerPosition(models.TextChoices):
    PEON          = 'peon',         'Peón'
    OFICIAL       = 'oficial',      'Oficial'
    MAESTRO_OBRAS = 'maestro_obras','Maestro de obras'
    ALBANIL       = 'albanil',      'Albañil'
    ELECTRICISTA  = 'electricista', 'Electricista'
    FONTANERO     = 'fontanero',    'Fontanero'
    SOLDADOR      = 'soldador',     'Soldador'
    CARPINTERO    = 'carpintero',   'Carpintero'
    SUPERVISOR    = 'supervisor',   'Supervisor'
    OTRO          = 'otro',         'Otro'


class WorkerStatus(models.TextChoices):
    ACTIVE   = 'active',   'Activo'
    INACTIVE = 'inactive', 'Inactivo'


# IGSS Guatemala (vigente 2024) — pending validación contador
IGSS_PATRONAL = Decimal('0.1067')   # 10.67 % a cargo del empleador
IGSS_LABORAL  = Decimal('0.0483')   # 4.83 % a cargo del trabajador


class Worker(models.Model):
    # ── Identificación ────────────────────────────────────────────────────────
    first_name = models.CharField(max_length=100, verbose_name='Nombre')
    last_name  = models.CharField(max_length=100, verbose_name='Apellidos')
    dpi        = models.CharField(max_length=20, blank=True, verbose_name='DPI')

    # ── Contacto ──────────────────────────────────────────────────────────────
    phone                   = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    emergency_contact_name  = models.CharField(max_length=200, blank=True, verbose_name='Contacto de emergencia')
    emergency_contact_phone = models.CharField(max_length=20,  blank=True, verbose_name='Teléfono de emergencia')

    # ── Laboral ───────────────────────────────────────────────────────────────
    position       = models.CharField(max_length=20, choices=WorkerPosition.choices, default=WorkerPosition.PEON, verbose_name='Cargo')
    daily_rate_gtq = models.DecimalField(max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name='Tarifa diaria (GTQ)')
    hire_date      = models.DateField(null=True, blank=True, verbose_name='Fecha de ingreso')
    status         = models.CharField(max_length=10, choices=WorkerStatus.choices, default=WorkerStatus.ACTIVE, verbose_name='Estado')

    # ── Proyecto actual (opcional) ────────────────────────────────────────────
    current_project = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='workers',
        verbose_name='Proyecto actual',
    )

    avatar     = models.ImageField(upload_to='workers/avatars/', null=True, blank=True, verbose_name='Foto')
    notes      = models.TextField(blank=True, verbose_name='Notas')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_workers',
        verbose_name='Registrado por',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Trabajador'
        verbose_name_plural = 'Trabajadores'
        ordering            = ['last_name', 'first_name']

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def avatar_url(self):
        if self.avatar:
            return self.avatar.url
        return None


class WorkLog(models.Model):
    worker         = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='work_logs', verbose_name='Trabajador')
    project        = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='work_logs', verbose_name='Proyecto')
    phase          = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='work_logs',
        verbose_name='Fase',
    )
    cost_code      = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='work_logs',
        verbose_name='Código de costo',
    )
    date           = models.DateField(verbose_name='Fecha')
    start_time     = models.TimeField(null=True, blank=True, verbose_name='Hora de inicio')
    end_time       = models.TimeField(null=True, blank=True, verbose_name='Hora de fin')
    regular_hours  = models.DecimalField(max_digits=5, decimal_places=2, default=8, validators=[MinValueValidator(0)], verbose_name='Horas regulares')
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0, validators=[MinValueValidator(0)], verbose_name='Horas extra')
    notes          = models.TextField(blank=True, verbose_name='Observaciones')
    created_by     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_work_logs',
    )
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Jornada de trabajo'
        verbose_name_plural = 'Jornadas de trabajo'
        ordering            = ['-date', '-start_time']
        unique_together     = [('worker', 'date', 'project')]

    def __str__(self):
        return f'{self.worker} — {self.date}'

    def save(self, *args, **kwargs):
        if self.start_time and self.end_time:
            start_dt = datetime.combine(date.today(), self.start_time)
            end_dt   = datetime.combine(date.today(), self.end_time)
            if end_dt <= start_dt:
                end_dt += timedelta(days=1)
            total = Decimal(str(round((end_dt - start_dt).total_seconds() / 3600, 2)))
            self.regular_hours  = min(Decimal('8'), total)
            self.overtime_hours = max(Decimal('0'), total - Decimal('8'))
        super().save(*args, **kwargs)

    # ── Propiedades de costo — aritmética Decimal ─────────────────────────────

    @property
    def hourly_rate(self):
        return (self.worker.daily_rate_gtq / Decimal('8')).quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP)

    @property
    def regular_pay(self):
        return (self.hourly_rate * self.regular_hours).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def overtime_pay(self):
        return (self.hourly_rate * Decimal('1.5') * self.overtime_hours).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def gross_pay(self):
        return (self.regular_pay + self.overtime_pay).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def igss_patronal(self):
        """Cuota patronal IGSS — pending validación contador para tasas vigentes."""
        return (self.gross_pay * IGSS_PATRONAL).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    @property
    def total_cost(self):
        """Costo total para la empresa: salario bruto + cuota patronal IGSS."""
        return (self.gross_pay + self.igss_patronal).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
