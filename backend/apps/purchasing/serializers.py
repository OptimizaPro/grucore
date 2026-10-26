from rest_framework import serializers
from .models import (
    PurchaseRequisition, PurchaseRequisitionLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine,
    SupplierInvoice, SupplierInvoiceLine,
    SupplierPayment, SupplierPaymentAllocation,
)


# ─── Requisición ──────────────────────────────────────────────────────────────

class PurchaseRequisitionLineSerializer(serializers.ModelSerializer):
    estimated_subtotal_gtq = serializers.ReadOnlyField()

    class Meta:
        model  = PurchaseRequisitionLine
        fields = '__all__'
        read_only_fields = ('id', 'requisition')


class PurchaseRequisitionSerializer(serializers.ModelSerializer):
    lines                  = PurchaseRequisitionLineSerializer(many=True, read_only=True)
    requested_by_name      = serializers.StringRelatedField(source='requested_by', read_only=True)
    approved_by_name       = serializers.StringRelatedField(source='approved_by', read_only=True)
    estimated_total_gtq    = serializers.ReadOnlyField()
    number                 = serializers.SerializerMethodField()

    class Meta:
        model  = PurchaseRequisition
        fields = '__all__'
        read_only_fields = (
            'id', 'year', 'sequence', 'requested_by',
            'approved_by', 'approved_at', 'created_at', 'updated_at',
        )

    def get_number(self, obj):
        return str(obj)


# ─── Orden de compra ──────────────────────────────────────────────────────────

class PurchaseOrderLineSerializer(serializers.ModelSerializer):
    line_subtotal_gtq     = serializers.ReadOnlyField()
    quantity_received_total = serializers.ReadOnlyField()
    remaining_qty         = serializers.ReadOnlyField()
    is_fully_received     = serializers.ReadOnlyField()

    class Meta:
        model  = PurchaseOrderLine
        fields = '__all__'
        read_only_fields = ('id', 'purchase_order')


class PurchaseOrderSerializer(serializers.ModelSerializer):
    lines            = PurchaseOrderLineSerializer(many=True, read_only=True)
    supplier_name    = serializers.StringRelatedField(source='supplier', read_only=True)
    created_by_name  = serializers.StringRelatedField(source='created_by', read_only=True)
    confirmed_by_name = serializers.StringRelatedField(source='confirmed_by', read_only=True)
    subtotal_gtq     = serializers.ReadOnlyField()
    tax_amount_gtq   = serializers.ReadOnlyField()
    total_gtq        = serializers.ReadOnlyField()
    number           = serializers.SerializerMethodField()

    class Meta:
        model  = PurchaseOrder
        fields = '__all__'
        read_only_fields = (
            'id', 'year', 'sequence', 'created_by',
            'confirmed_by', 'confirmed_at', 'created_at', 'updated_at',
        )

    def get_number(self, obj):
        return str(obj).split(' — ')[0]


# ─── Recepción de mercancía ───────────────────────────────────────────────────

class GoodsReceiptLineSerializer(serializers.ModelSerializer):
    class Meta:
        model  = GoodsReceiptLine
        fields = '__all__'
        read_only_fields = ('id', 'receipt')


class GoodsReceiptSerializer(serializers.ModelSerializer):
    lines           = GoodsReceiptLineSerializer(many=True, read_only=True)
    received_by_name = serializers.StringRelatedField(source='received_by', read_only=True)
    number          = serializers.SerializerMethodField()

    class Meta:
        model  = GoodsReceipt
        fields = '__all__'
        read_only_fields = (
            'id', 'year', 'sequence', 'received_by',
            'created_at', 'updated_at',
        )

    def get_number(self, obj):
        return str(obj)


# ─── Factura de proveedor ─────────────────────────────────────────────────────

class SupplierInvoiceLineSerializer(serializers.ModelSerializer):
    line_subtotal_gtq = serializers.ReadOnlyField()

    class Meta:
        model  = SupplierInvoiceLine
        fields = '__all__'
        read_only_fields = ('id', 'invoice')


class SupplierInvoiceSerializer(serializers.ModelSerializer):
    lines             = SupplierInvoiceLineSerializer(many=True, read_only=True)
    supplier_name     = serializers.StringRelatedField(source='supplier', read_only=True)
    subtotal_gtq      = serializers.ReadOnlyField()
    tax_amount_gtq    = serializers.ReadOnlyField()
    total_gtq         = serializers.ReadOnlyField()
    amount_paid_gtq   = serializers.ReadOnlyField()
    balance_gtq       = serializers.ReadOnlyField()
    is_overdue        = serializers.ReadOnlyField()
    number            = serializers.SerializerMethodField()

    class Meta:
        model  = SupplierInvoice
        fields = '__all__'
        read_only_fields = (
            'id', 'year', 'sequence', 'created_at', 'updated_at',
        )

    def get_number(self, obj):
        return str(obj)


# ─── Pago a proveedor ─────────────────────────────────────────────────────────

class SupplierPaymentAllocationSerializer(serializers.ModelSerializer):
    invoice_number = serializers.StringRelatedField(source='invoice', read_only=True)

    class Meta:
        model  = SupplierPaymentAllocation
        fields = '__all__'
        read_only_fields = ('id', 'payment')


class SupplierPaymentSerializer(serializers.ModelSerializer):
    allocations      = SupplierPaymentAllocationSerializer(many=True, read_only=True)
    supplier_name    = serializers.StringRelatedField(source='supplier', read_only=True)
    total_allocated_gtq = serializers.ReadOnlyField()
    number           = serializers.SerializerMethodField()

    class Meta:
        model  = SupplierPayment
        fields = '__all__'
        read_only_fields = (
            'id', 'year', 'sequence', 'created_at', 'updated_at',
        )

    def get_number(self, obj):
        return str(obj)
