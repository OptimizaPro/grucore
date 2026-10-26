from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import AssetCategory, FixedAsset, AssetDepreciationEntry, EquipmentUsageLog
from .serializers import (
    AssetCategorySerializer, FixedAssetSerializer,
    AssetDepreciationEntrySerializer, EquipmentUsageLogSerializer,
)


# ─── Categorías ───────────────────────────────────────────────────────────────

class AssetCategoryListCreateView(generics.ListCreateAPIView):
    queryset           = AssetCategory.objects.filter(is_active=True)
    serializer_class   = AssetCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [SearchFilter]
    search_fields      = ['name', 'description']


class AssetCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = AssetCategory.objects.all()
    serializer_class   = AssetCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Activos fijos ────────────────────────────────────────────────────────────

class FixedAssetListCreateView(generics.ListCreateAPIView):
    serializer_class   = FixedAssetSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'category', 'depreciation_method', 'current_project']
    search_fields      = ['name', 'asset_number', 'serial_number', 'brand', 'model']
    ordering_fields    = ['acquisition_date', 'purchase_cost_gtq', 'name']
    ordering           = ['category', 'name']

    def get_queryset(self):
        return FixedAsset.objects.select_related('category', 'created_by', 'current_project')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FixedAssetDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = FixedAsset.objects.select_related('category')
    serializer_class   = FixedAssetSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Entradas de depreciación (lectura) ───────────────────────────────────────

class AssetDepreciationEntryListView(generics.ListAPIView):
    serializer_class   = AssetDepreciationEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['is_posted', 'accounting_period']
    ordering_fields    = ['created_at']
    ordering           = ['-accounting_period__year', '-accounting_period__month']

    def get_queryset(self):
        return AssetDepreciationEntry.objects.filter(
            asset_id=self.kwargs['asset_pk']
        ).select_related('asset', 'accounting_period', 'created_by')


class AssetDepreciationEntryDetailView(generics.RetrieveAPIView):
    serializer_class   = AssetDepreciationEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AssetDepreciationEntry.objects.filter(asset_id=self.kwargs['asset_pk'])


# ─── Registros de uso de equipo ───────────────────────────────────────────────

class EquipmentUsageLogListCreateView(generics.ListCreateAPIView):
    serializer_class   = EquipmentUsageLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['project', 'asset']
    search_fields      = ['notes']
    ordering_fields    = ['usage_date', 'hours_used']
    ordering           = ['-usage_date']

    def get_queryset(self):
        qs = EquipmentUsageLog.objects.select_related(
            'asset', 'project', 'created_by'
        )
        # Si viene anclado a un activo específico
        if 'asset_pk' in self.kwargs:
            qs = qs.filter(asset_id=self.kwargs['asset_pk'])
        return qs

    def perform_create(self, serializer):
        kwargs = {'created_by': self.request.user}
        if 'asset_pk' in self.kwargs:
            from django.shortcuts import get_object_or_404
            asset = get_object_or_404(FixedAsset, pk=self.kwargs['asset_pk'])
            kwargs['asset'] = asset
        serializer.save(**kwargs)


class EquipmentUsageLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = EquipmentUsageLog.objects.select_related('asset', 'project')
    serializer_class   = EquipmentUsageLogSerializer
    permission_classes = [permissions.IsAuthenticated]
