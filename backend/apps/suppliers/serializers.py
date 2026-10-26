from rest_framework import serializers
from .models import Supplier


class SupplierSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model  = Supplier
        fields = [
            'id', 'name', 'category', 'category_display',
            'contact_person', 'email', 'phone', 'nit',
            'address', 'website', 'notes', 'rating',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'category_display']
