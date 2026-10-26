from rest_framework import generics, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Supplier
from .serializers import SupplierSerializer


class SupplierListCreateView(generics.ListCreateAPIView):
    serializer_class   = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['category', 'is_active', 'rating']
    search_fields      = ['name', 'contact_person', 'email', 'phone', 'nit', 'notes']
    ordering_fields    = ['name', 'rating', 'category', 'created_at']
    ordering           = ['name']

    def get_queryset(self):
        return Supplier.objects.all()


class SupplierDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Supplier.objects.all()
    serializer_class   = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
