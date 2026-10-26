from django.db import models


# ─── Dimensiones analíticas ───────────────────────────────────────────────────

class CostBehavior(models.TextChoices):
    VARIABLE     = 'variable',     'Variable'
    FIXED        = 'fixed',        'Fijo'
    SEMI_VARIABLE = 'semi_variable', 'Semivariable'


class CostCategory(models.TextChoices):
    MATERIALS     = 'materials',     'Materiales'
    LABOR         = 'labor',         'Mano de obra'
    SUBCONTRACTOR = 'subcontractor', 'Subcontratistas'
    EQUIPMENT     = 'equipment',     'Equipos y maquinaria'
    LOGISTICS     = 'logistics',     'Logística y auxiliares'
    OVERHEAD      = 'overhead',      'Gastos de estructura'


class CostCenterType(models.TextChoices):
    OBRA        = 'obra',        'Obra'
    ADMIN       = 'admin',       'Administración'
    COMERCIAL   = 'comercial',   'Comercial'
    MAQUINARIA  = 'maquinaria',  'Maquinaria'
    OPERACIONES = 'operaciones', 'Operaciones'


class CostCenter(models.Model):
    code        = models.CharField(max_length=20, unique=True, verbose_name='Código')
    name        = models.CharField(max_length=100, verbose_name='Nombre')
    center_type = models.CharField(max_length=20, choices=CostCenterType.choices, verbose_name='Tipo')
    is_active   = models.BooleanField(default=True, verbose_name='Activo')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Centro de costo'
        verbose_name_plural = 'Centros de costo'
        ordering            = ['code']

    def __str__(self):
        return f'{self.code} — {self.name}'


class CostCode(models.Model):
    code            = models.CharField(max_length=30, unique=True, verbose_name='Código')
    description     = models.CharField(max_length=200, verbose_name='Descripción')
    category        = models.CharField(max_length=20, choices=CostCategory.choices, verbose_name='Categoría')
    cost_behavior   = models.CharField(max_length=15, choices=CostBehavior.choices, default=CostBehavior.VARIABLE, verbose_name='Comportamiento')
    default_account = models.ForeignKey(
        'ledger.Account',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='cost_codes',
        verbose_name='Cuenta GL por defecto',
    )
    is_active       = models.BooleanField(default=True, verbose_name='Activo')
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Código de costo'
        verbose_name_plural = 'Códigos de costo'
        ordering            = ['code']

    def __str__(self):
        return f'{self.code} — {self.description}'


# ─── Configuración de empresa ─────────────────────────────────────────────────

class CompanySettings(models.Model):
    """
    Singleton — siempre existe una sola fila (pk=1).
    Almacena la identidad visual de la empresa.
    """
    logo        = models.ImageField(
        upload_to='brand/', blank=True, null=True,
        verbose_name='Logo (fondo oscuro)',
        help_text='Versión del logo para fondos oscuros (ERP, portal, pie de página).',
    )
    logo_light  = models.ImageField(
        upload_to='brand/', blank=True, null=True,
        verbose_name='Logo (fondo claro)',
        help_text='Versión del logo para fondos claros (sitio público con header transparente).',
    )
    name        = models.CharField(max_length=200, default='Grucore', verbose_name='Nombre de empresa')
    tagline     = models.CharField(max_length=300, blank=True, default='Construcción y Remodelación Premium',
                                   verbose_name='Tagline')
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Configuración de empresa'
        verbose_name_plural = 'Configuración de empresa'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # no se puede eliminar

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1, defaults={
            'name': 'Grucore',
            'tagline': 'Construcción y Remodelación Premium',
        })
        return obj
