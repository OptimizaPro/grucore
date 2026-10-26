from rest_framework import serializers
from .models import Expense, Invoice


class ExpenseSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.StringRelatedField(source='submitted_by', read_only=True)
    approved_by_name  = serializers.StringRelatedField(source='approved_by', read_only=True)

    class Meta:
        model  = Expense
        fields = '__all__'
        read_only_fields = (
            'id', 'submitted_by', 'approved_by',
            'approved_at', 'created_at', 'updated_at',
        )


class InvoiceSerializer(serializers.ModelSerializer):
    created_by_name = serializers.StringRelatedField(source='created_by', read_only=True)
    total_with_tax  = serializers.ReadOnlyField()
    is_overdue      = serializers.ReadOnlyField()

    class Meta:
        model  = Invoice
        fields = '__all__'
        read_only_fields = (
            'id', 'created_by',
            'paid_at', 'created_at', 'updated_at',
        )
