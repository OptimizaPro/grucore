from django.contrib import admin
from unfold.admin import ModelAdmin, TabularInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import InventoryCategory, Product, StockMovement


class StockMovementInline(TabularInline):
    model           = StockMovement
    extra           = 0
    readonly_fields = ('movement_type', 'quantity', 'unit_price_gtq', 'notes', 'reference_number', 'performed_by', 'project', 'created_at')
    can_delete      = False


@admin.register(InventoryCategory)
class InventoryCategoryAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'color', 'created_at')
    search_fields = ('name', 'description')

    fieldsets = (
        (None, {
            "fields": (
                ("name", "color"),
                "description",
            ),
        }),
    )


@admin.register(Product)
class ProductAdmin(CRUDActionsMixin, ModelAdmin):
    list_display  = ('name', 'sku', 'category', 'unit', 'stock_quantity', 'unit_price_gtq', 'is_active')
    list_filter   = ('category', 'is_active', 'unit')
    search_fields = ('name', 'sku', 'supplier_name')
    inlines       = [StockMovementInline]
    readonly_fields = ('stock_quantity', 'created_at', 'updated_at')

    fieldsets = (
        ("Producto", {
            "fields": (
                ("name", "sku"),
                ("category", "unit"),
                "description",
                ("unit_price_gtq", "is_active"),
            ),
        }),
        ("Stock", {
            "fields": (
                ("stock_quantity", "min_stock_alert"),
            ),
        }),
        ("Proveedor", {
            "fields": (
                ("supplier_name", "supplier_contact"),
            ),
        }),
        ("Metadatos", {
            "fields": (
                ("created_at", "updated_at"),
            ),
            "classes": ["collapse"],
        }),
    )


@admin.register(StockMovement)
class StockMovementAdmin(CRUDActionsMixin, ModelAdmin):
    list_display   = ('product', 'movement_type', 'quantity', 'project', 'performed_by', 'reference_number', 'created_at')
    list_filter    = ('movement_type', 'project')
    search_fields  = ('notes', 'reference_number', 'product__name')
    date_hierarchy = 'created_at'
    readonly_fields = ('performed_by', 'created_at')

    fieldsets = (
        (None, {
            "fields": (
                ("product", "movement_type"),
                ("quantity", "unit_price_gtq"),
                ("project", "reference_number"),
                "notes",
                ("performed_by", "created_at"),
            ),
        }),
    )
