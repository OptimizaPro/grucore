from rest_framework import serializers
from .models import (
    AssetCategory, FixedAsset,
    AssetDepreciationEntry, EquipmentUsageLog,
)


class AssetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = AssetCategory
        fields = '__all__'
        read_only_fields = ('id',)


class FixedAssetSerializer(serializers.ModelSerializer):
    category_name                = serializers.StringRelatedField(source='category', read_only=True)
    created_by_name              = serializers.StringRelatedField(source='created_by', read_only=True)
    monthly_depreciation_gtq     = serializers.ReadOnlyField()
    accumulated_depreciation_gtq = serializers.ReadOnlyField()
    net_book_value_gtq           = serializers.ReadOnlyField()
    depreciable_amount_gtq       = serializers.ReadOnlyField()

    class Meta:
        model  = FixedAsset
        fields = '__all__'
        read_only_fields = ('id', 'asset_number', 'created_by', 'created_at', 'updated_at')


class AssetDepreciationEntrySerializer(serializers.ModelSerializer):
    asset_number = serializers.StringRelatedField(source='asset', read_only=True)
    period_label = serializers.StringRelatedField(source='accounting_period', read_only=True)

    class Meta:
        model  = AssetDepreciationEntry
        fields = '__all__'
        read_only_fields = ('id', 'asset', 'created_by', 'created_at')


class EquipmentUsageLogSerializer(serializers.ModelSerializer):
    asset_number                  = serializers.StringRelatedField(source='asset', read_only=True)
    project_name                  = serializers.StringRelatedField(source='project', read_only=True)
    created_by_name               = serializers.StringRelatedField(source='created_by', read_only=True)
    allocated_cost_gtq            = serializers.ReadOnlyField()
    total_cost_including_fuel_gtq = serializers.ReadOnlyField()

    class Meta:
        model  = EquipmentUsageLog
        fields = '__all__'
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')
