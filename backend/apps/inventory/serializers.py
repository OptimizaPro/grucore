from rest_framework import serializers
from .models import InventoryCategory, Product, StockMovement


class InventoryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = InventoryCategory
        fields = '__all__'
        read_only_fields = ('id', 'created_at')


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.StringRelatedField(source='category', read_only=True)
    is_low_stock  = serializers.ReadOnlyField()
    unit_display  = serializers.CharField(source='get_unit_display', read_only=True)

    class Meta:
        model  = Product
        fields = '__all__'
        read_only_fields = ('id', 'stock_quantity', 'created_at', 'updated_at')


class StockMovementSerializer(serializers.ModelSerializer):
    product_name    = serializers.StringRelatedField(source='product', read_only=True)
    performed_by_name = serializers.StringRelatedField(source='performed_by', read_only=True)

    class Meta:
        model  = StockMovement
        fields = '__all__'
        read_only_fields = ('id', 'performed_by', 'created_at')
