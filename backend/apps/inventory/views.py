from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import InventoryCategory, Product, StockMovement
from .serializers import InventoryCategorySerializer, ProductSerializer, StockMovementSerializer


# ─── Categorías de inventario ─────────────────────────────────────────────────

class InventoryCategoryListCreateView(generics.ListCreateAPIView):
    queryset           = InventoryCategory.objects.all()
    serializer_class   = InventoryCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [SearchFilter, OrderingFilter]
    search_fields      = ['name', 'description']
    ordering_fields    = ['name', 'created_at']
    ordering           = ['name']


class InventoryCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = InventoryCategory.objects.all()
    serializer_class   = InventoryCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Productos ────────────────────────────────────────────────────────────────

class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['category', 'is_active', 'unit']
    search_fields      = ['name', 'sku', 'description', 'supplier_name']
    ordering_fields    = ['name', 'stock_quantity', 'unit_price_gtq', 'created_at']
    ordering           = ['name']

    def get_queryset(self):
        return Product.objects.select_related('category').all()


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Product.objects.select_related('category').all()
    serializer_class   = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Movimientos de stock ─────────────────────────────────────────────────────

class StockMovementListCreateView(generics.ListCreateAPIView):
    serializer_class   = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['product', 'movement_type', 'project']
    search_fields      = ['notes', 'reference_number']
    ordering_fields    = ['created_at']
    ordering           = ['-created_at']

    def get_queryset(self):
        return StockMovement.objects.select_related('product', 'project', 'performed_by').all()

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)


class StockMovementDetailView(generics.RetrieveAPIView):
    queryset           = StockMovement.objects.select_related('product', 'project', 'performed_by').all()
    serializer_class   = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
