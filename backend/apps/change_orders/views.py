from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.projects.models import Project
from .models import ChangeOrder, ChangeOrderApproval, ChangeOrderStatus
from .serializers import ChangeOrderSerializer


# ─── Órdenes de cambio ────────────────────────────────────────────────────────

class ChangeOrderListCreateView(generics.ListCreateAPIView):
    serializer_class   = ChangeOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'reason']
    search_fields      = ['title', 'description']
    ordering_fields    = ['created_at', 'amount_gtq', 'number']
    ordering           = ['-created_at']

    def get_queryset(self):
        return ChangeOrder.objects.filter(
            project_id=self.kwargs['project_pk']
        ).select_related('approval')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, requested_by=self.request.user)


class ChangeOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ChangeOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChangeOrder.objects.filter(
            project_id=self.kwargs['project_pk']
        ).select_related('approval')


class ChangeOrderSubmitView(APIView):
    """
    POST /api/projects/<project_pk>/change-orders/<co_pk>/submit/

    Avanza el estado de DRAFT a SUBMITTED y registra submitted_at.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, co_pk):
        co = get_object_or_404(ChangeOrder, pk=co_pk, project_id=project_pk)

        if co.status != ChangeOrderStatus.DRAFT:
            return Response(
                {'detail': 'Solo se pueden enviar órdenes de cambio en estado borrador.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        co.status       = ChangeOrderStatus.SUBMITTED
        co.submitted_at = timezone.now()
        co.save(update_fields=['status', 'submitted_at', 'updated_at'])

        return Response(ChangeOrderSerializer(co).data)


class ChangeOrderApproveView(APIView):
    """
    POST /api/projects/<project_pk>/change-orders/<co_pk>/approve/

    Cuerpo: { "notes": "..." }

    — Si el usuario es client_portal       → firma del cliente.
    — Si es admin / project_manager / site_supervisor → firma de la constructora.

    Cuando ambas partes firman, la orden pasa automáticamente a APPROVED.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, co_pk):
        co = get_object_or_404(ChangeOrder, pk=co_pk, project_id=project_pk)

        if co.status not in (
            ChangeOrderStatus.SUBMITTED,
            ChangeOrderStatus.IN_REVIEW,
        ):
            return Response(
                {'detail': 'La orden de cambio no está disponible para aprobación.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        approval, _ = ChangeOrderApproval.objects.get_or_create(change_order=co)
        notes            = request.data.get('notes', '')
        approve_as_client = request.data.get('approve_as_client', False)
        user             = request.user

        # Firma del cliente: rol client_portal O solicitud explícita desde el portal
        is_client_action = user.role == 'client_portal' or approve_as_client

        if is_client_action:
            if approval.client_approved_at:
                return Response(
                    {'detail': 'Esta orden de cambio ya fue aprobada por el cliente.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            approval.approve_client(
                ip_address=request.META.get('REMOTE_ADDR'),
                notes=notes,
            )

        elif user.role in ('admin', 'project_manager', 'site_supervisor'):
            if approval.company_approved_at:
                return Response(
                    {'detail': 'La constructora ya aprobó esta orden de cambio.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            approval.approve_company(user=user, notes=notes)
            # Advance to IN_REVIEW when constructora approves from SUBMITTED
            co.refresh_from_db()
            if co.status in (ChangeOrderStatus.DRAFT, ChangeOrderStatus.SUBMITTED):
                co.status = ChangeOrderStatus.IN_REVIEW
                co.save(update_fields=['status', 'updated_at'])

        else:
            return Response(
                {'detail': 'No tienes permiso para aprobar órdenes de cambio.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        co.refresh_from_db()
        return Response(ChangeOrderSerializer(co).data)


class ChangeOrderRejectView(APIView):
    """
    POST /api/projects/<project_pk>/change-orders/<co_pk>/reject/

    Cuerpo: { "notes": "..." }

    — Cualquier parte autenticada (cliente o constructora) puede rechazar
      mientras la orden esté en SUBMITTED o IN_REVIEW.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, co_pk):
        co = get_object_or_404(ChangeOrder, pk=co_pk, project_id=project_pk)

        if co.status not in (
            ChangeOrderStatus.SUBMITTED,
            ChangeOrderStatus.IN_REVIEW,
        ):
            return Response(
                {'detail': 'La orden de cambio no puede rechazarse en su estado actual.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        notes = request.data.get('notes', '')
        user  = request.user

        co.status = ChangeOrderStatus.REJECTED
        if user.role == 'client_portal':
            co.client_notes = notes
            co.save(update_fields=['status', 'client_notes', 'updated_at'])
        else:
            co.company_notes = notes
            co.save(update_fields=['status', 'company_notes', 'updated_at'])

        return Response(ChangeOrderSerializer(co).data)
