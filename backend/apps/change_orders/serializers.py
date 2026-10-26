from rest_framework import serializers
from .models import ChangeOrder, ChangeOrderApproval


class ChangeOrderApprovalSerializer(serializers.ModelSerializer):
    company_approved_by_name = serializers.StringRelatedField(
        source='company_approved_by', read_only=True
    )

    class Meta:
        model  = ChangeOrderApproval
        fields = '__all__'
        read_only_fields = (
            'id', 'change_order', 'status',
            'company_approved_by', 'company_approved_at',
            'client_approved_at', 'client_ip_address',
            'created_at', 'updated_at',
        )


class ChangeOrderSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.StringRelatedField(source='requested_by', read_only=True)
    approval          = ChangeOrderApprovalSerializer(read_only=True)

    class Meta:
        model  = ChangeOrder
        fields = '__all__'
        read_only_fields = (
            'id', 'number', 'requested_by',
            'submitted_at', 'created_at', 'updated_at',
        )
