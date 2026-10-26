from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    SubcontractorContract, SubcontractorCertification, SubcontractorRetentionRelease,
    CertificationStatus,
)
from .serializers import (
    SubcontractorContractSerializer,
    SubcontractorCertificationSerializer,
    SubcontractorRetentionReleaseSerializer,
)

FINANCE_ROLES = ('admin', 'project_manager')


# ─── Contratos ────────────────────────────────────────────────────────────────

class SubcontractorContractListCreateView(generics.ListCreateAPIView):
    serializer_class   = SubcontractorContractSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'project', 'subcontractor']
    search_fields      = ['title', 'description', 'notes']
    ordering_fields    = ['created_at', 'start_date', 'contract_value_gtq']
    ordering           = ['-created_at']

    def get_queryset(self):
        return SubcontractorContract.objects.select_related(
            'subcontractor', 'project', 'created_by'
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SubcontractorContractDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = SubcontractorContract.objects.select_related('subcontractor', 'project')
    serializer_class   = SubcontractorContractSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Certificaciones ──────────────────────────────────────────────────────────

class SubcontractorCertificationListCreateView(generics.ListCreateAPIView):
    serializer_class   = SubcontractorCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['status']
    ordering_fields    = ['period_start', 'created_at']
    ordering           = ['-created_at']

    def get_queryset(self):
        return SubcontractorCertification.objects.filter(
            contract_id=self.kwargs['contract_pk']
        ).select_related('contract', 'approved_by')

    def perform_create(self, serializer):
        contract = get_object_or_404(SubcontractorContract, pk=self.kwargs['contract_pk'])
        serializer.save(contract=contract)


class SubcontractorCertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SubcontractorCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SubcontractorCertification.objects.filter(
            contract_id=self.kwargs['contract_pk']
        )


class SubcontractorCertificationApproveView(APIView):
    """POST /api/subcontractors/contracts/<contract_pk>/certifications/<pk>/approve/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, contract_pk, pk):
        if request.user.role not in FINANCE_ROLES:
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden aprobar certificaciones.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        cert = get_object_or_404(SubcontractorCertification, pk=pk, contract_id=contract_pk)
        try:
            cert.approve(request.user)
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(SubcontractorCertificationSerializer(cert).data)


# ─── Liberaciones de retención ────────────────────────────────────────────────

class SubcontractorRetentionReleaseListCreateView(generics.ListCreateAPIView):
    serializer_class   = SubcontractorRetentionReleaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['status', 'contract']
    ordering_fields    = ['release_date', 'created_at']
    ordering           = ['-release_date']

    def get_queryset(self):
        return SubcontractorRetentionRelease.objects.select_related('contract')


class SubcontractorRetentionReleaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = SubcontractorRetentionRelease.objects.all()
    serializer_class   = SubcontractorRetentionReleaseSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubcontractorRetentionReleasePostView(APIView):
    """POST /api/subcontractors/retentions/<pk>/post/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in FINANCE_ROLES:
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden registrar liberaciones.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        release = get_object_or_404(SubcontractorRetentionRelease, pk=pk)
        try:
            release.post(user=request.user)
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(SubcontractorRetentionReleaseSerializer(release).data)
