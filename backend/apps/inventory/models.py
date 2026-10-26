from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver


class UnitType(models.TextChoices):
    UNIT   = 'unit', 'Unidad'
    M2     = 'm2',   'm²'
    M3     = 'm3',   'm³'
    ML     = 'ml',   'Metro lineal'
    KG     = 'kg',   'Kilogramo'
    LB     = 'lb',   'Libra'
    TON    = 'ton',  'Tonelada'
    LITER  = 'l',    'Litro'
    BAG    = 'bag',  'Saco'
    ROLL   = 'roll', 'Rollo'
    BOX    = 'box',  'Caja'
    GALLON = 'gal',  'Galón'


class InventoryCategory(models.Model):
    name         = models.CharField(max_length=100, verbose_name='Nombre de la categoría')
    description  = models.TextField(blank=True, verbose_name='Descripción')
    color        = models.CharField(max_length=7, default='#8A95A5', verbose_name='Color (hexadecimal)')
    tracks_stock = models.BooleanField(default=True, verbose_name='Gestiona stock', help_text='Desactivar en categorías de servicios (mano de obra, etc.) que no requieren control de inventario.')
    created_at   = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')

    class Meta:
        verbose_name = 'Categoría de inventario'
        verbose_name_plural = 'Categorías de inventario'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    name             = models.CharField(max_length=300, verbose_name='Nombre')
    description      = models.TextField(blank=True, verbose_name='Descripción')
    sku              = models.CharField(max_length=100, blank=True, unique=True, null=True, verbose_name='SKU')
    category         = models.ForeignKey(
        InventoryCategory,
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='products',
        verbose_name='Categoría',
    )
    unit             = models.CharField(max_length=10, choices=UnitType.choices, default=UnitType.UNIT, verbose_name='Unidad de medida')
    unit_price_gtq   = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='Precio unitario (GTQ)')
    stock_quantity   = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Cantidad en stock')
    min_stock_alert  = models.DecimalField(max_digits=12, decimal_places=3, default=0, verbose_name='Alerta de stock mínimo')
    supplier_name    = models.CharField(max_length=200, blank=True, verbose_name='Nombre del proveedor')
    supplier_contact = models.CharField(max_length=200, blank=True, verbose_name='Contacto del proveedor')
    is_active        = models.BooleanField(default=True)
    created_at       = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at       = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        try:
            if self.category_id and not self.category.tracks_stock:
                return False
        except Exception:
            pass
        return self.stock_quantity <= self.min_stock_alert


class MovementType(models.TextChoices):
    IN         = 'in',         'Entrada'
    OUT        = 'out',        'Salida'
    ADJUSTMENT = 'adjustment', 'Ajuste'


class StockMovement(models.Model):
    product          = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements', verbose_name='Producto')
    project          = models.ForeignKey(
        'projects.Project',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_movements',
        verbose_name='Proyecto',
    )
    phase            = models.ForeignKey(
        'projects.Phase',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_movements',
        verbose_name='Fase',
    )
    cost_code        = models.ForeignKey(
        'core.CostCode',
        on_delete=models.SET_NULL, null=True, blank=True,
        related_name='stock_movements',
        verbose_name='Código de costo',
    )
    movement_type    = models.CharField(max_length=15, choices=MovementType.choices, verbose_name='Tipo de movimiento')
    quantity         = models.DecimalField(max_digits=12, decimal_places=3, verbose_name='Cantidad')
    unit_price_gtq   = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='Precio unitario (GTQ)')
    notes            = models.TextField(blank=True, verbose_name='Notas')
    reference_number = models.CharField(max_length=100, blank=True, verbose_name='Número de referencia')
    performed_by     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL, null=True,
        related_name='stock_movements',
        verbose_name='Realizado por',
    )
    created_at       = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')

    class Meta:
        verbose_name = 'Movimiento de stock'
        verbose_name_plural = 'Movimientos de stock'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_movement_type_display()} — {self.product.name} x{self.quantity}'


@receiver(post_save, sender=StockMovement)
def update_stock(sender, instance, created, **kwargs):
    if not created:
        return
    product = instance.product
    try:
        if product.category_id and not product.category.tracks_stock:
            return
    except Exception:
        pass
    if instance.movement_type == MovementType.IN:
        product.stock_quantity += instance.quantity
    elif instance.movement_type == MovementType.OUT:
        product.stock_quantity -= instance.quantity
    elif instance.movement_type == MovementType.ADJUSTMENT:
        product.stock_quantity += instance.quantity  # pass signed value for adjustments
    product.save(update_fields=['stock_quantity', 'updated_at'])
