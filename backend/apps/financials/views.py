from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.projects.models import Project
from .models import Expense, Invoice, ExpenseStatus, InvoiceStatus
from .serializers import ExpenseSerializer, InvoiceSerializer


# ─── Gastos ───────────────────────────────────────────────────────────────────

class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class   = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'category']
    search_fields      = ['description', 'notes']
    ordering_fields    = ['expense_date', 'amount_gtq', 'created_at']
    ordering           = ['-expense_date']

    def get_queryset(self):
        return Expense.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, submitted_by=self.request.user)


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(project_id=self.kwargs['project_pk'])


class ExpenseApproveView(APIView):
    """
    POST /api/projects/<project_pk>/expenses/<expense_pk>/approve/

    Solo admins y project managers pueden aprobar gastos.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, expense_pk):
        if request.user.role not in ('admin', 'project_manager'):
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden aprobar gastos.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        expense = get_object_or_404(Expense, pk=expense_pk, project_id=project_pk)

        if expense.status != ExpenseStatus.PENDING:
            return Response(
                {'detail': 'Solo se pueden aprobar gastos en estado pendiente.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        expense.approved_by = request.user
        expense.approved_at = timezone.now()
        expense.status      = ExpenseStatus.APPROVED
        expense.save(update_fields=['approved_by', 'approved_at', 'status', 'updated_at'])

        return Response(ExpenseSerializer(expense).data)


# ─── Facturas ─────────────────────────────────────────────────────────────────

class InvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class   = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status']
    search_fields      = ['title', 'invoice_number', 'description']
    ordering_fields    = ['issue_date', 'amount_gtq', 'due_date']
    ordering           = ['-issue_date']

    def get_queryset(self):
        return Invoice.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, created_by=self.request.user)


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.filter(project_id=self.kwargs['project_pk'])


class InvoiceMarkPaidView(APIView):
    """
    POST /api/projects/<project_pk>/invoices/<invoice_pk>/mark-paid/

    Solo admins y project managers pueden marcar facturas como pagadas.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, invoice_pk):
        if request.user.role not in ('admin', 'project_manager'):
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden confirmar pagos.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        invoice = get_object_or_404(Invoice, pk=invoice_pk, project_id=project_pk)

        if invoice.status == InvoiceStatus.PAID:
            return Response(
                {'detail': 'Esta factura ya está marcada como pagada.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if invoice.status == InvoiceStatus.CANCELLED:
            return Response(
                {'detail': 'No se puede marcar como pagada una factura cancelada.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invoice.paid_at = timezone.now()
        invoice.status  = InvoiceStatus.PAID
        invoice.save(update_fields=['paid_at', 'status', 'updated_at'])

        return Response(InvoiceSerializer(invoice).data)
