from rest_framework import serializers
from .models import (
    SubcontractorContract, SubcontractorCertification, SubcontractorRetentionRelease,
)


class SubcontractorContractSerializer(serializers.ModelSerializer):
    subcontractor_name          = serializers.StringRelatedField(source='subcontractor', read_only=True)
    project_name                = serializers.StringRelatedField(source='project', read_only=True)
    created_by_name             = serializers.StringRelatedField(source='created_by', read_only=True)
    contract_value_with_tax_gtq = serializers.ReadOnlyField()
    total_certified_gtq         = serializers.ReadOnlyField()
    total_retention_withheld_gtq = serializers.ReadOnlyField()
    retention_balance_gtq       = serializers.ReadOnlyField()
    advance_balance_gtq         = serializers.ReadOnlyField()
    balance_to_certify_gtq      = serializers.ReadOnlyField()
    total_net_payable_gtq       = serializers.ReadOnlyField()
    completion_pct              = serializers.ReadOnlyField()
    number                      = serializers.SerializerMethodField()

    class Meta:
        model  = SubcontractorContract
        fields = '__all__'
        read_only_fields = (
            'id', 'year', 'sequence', 'created_by', 'created_at', 'updated_at',
        )

    def get_number(self, obj):
        return f'SC-{obj.year}-{obj.sequence:04d}'


class SubcontractorCertificationSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.StringRelatedField(source='approved_by', read_only=True)

    class Meta:
        model  = SubcontractorCertification
        fields = '__all__'
        read_only_fields = (
            'id', 'certification_number', 'approved_by', 'approved_at',
            'created_at', 'updated_at',
        )


class SubcontractorRetentionReleaseSerializer(serializers.ModelSerializer):
    contract_number = serializers.StringRelatedField(source='contract', read_only=True)

    class Meta:
        model  = SubcontractorRetentionRelease
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
