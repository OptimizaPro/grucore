from django.db import models


class SupplierCategory(models.TextChoices):
    MATERIALS      = 'materials',     'Materiales'
    EQUIPMENT      = 'equipment',     'Equipos y maquinaria'
    SUBCONTRACTOR  = 'subcontractor', 'Subcontratista'
    SERVICES       = 'services',      'Servicios'
    TOOLS          = 'tools',         'Herramientas'
    TRANSPORT      = 'transport',     'Transporte'
    OTHER          = 'other',         'Otro'


class Supplier(models.Model):
    name           = models.CharField(max_length=300, verbose_name='Nombre')
    category       = models.CharField(
        max_length=20,
        choices=SupplierCategory.choices,
        default=SupplierCategory.OTHER,
        verbose_name='Categoría',
    )
    contact_person = models.CharField(max_length=200, blank=True, verbose_name='Persona de contacto')
    email          = models.EmailField(blank=True, verbose_name='Correo electrónico')
    phone          = models.CharField(max_length=50, blank=True, verbose_name='Teléfono')
    nit            = models.CharField(max_length=50, blank=True, verbose_name='NIT')
    address        = models.TextField(blank=True, verbose_name='Dirección')
    website        = models.URLField(blank=True, verbose_name='Sitio web')
    notes          = models.TextField(blank=True, verbose_name='Notas')
    rating         = models.PositiveSmallIntegerField(
        default=0,
        verbose_name='Rating (0–5)',
        help_text='0 = sin rating, 1–5 estrellas',
    )
    is_active      = models.BooleanField(default=True, verbose_name='Activo')
    created_at     = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at     = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name        = 'Proveedor'
        verbose_name_plural = 'Proveedores'
        ordering            = ['name']

    def __str__(self):
        return self.name
