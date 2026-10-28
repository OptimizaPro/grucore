from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    PurchaseRequisition, PurchaseOrder,
    GoodsReceipt, SupplierInvoice, SupplierPayment,
    POStatus, GRStatus, SupplierInvoiceStatus, SupplierPaymentStatus,
)
from .serializers import (
    PurchaseRequisitionSerializer,
    PurchaseOrderSerializer,
    GoodsReceiptSerializer,
    SupplierInvoiceSerializer,
    SupplierPaymentSerializer,
)

FINANCE_ROLES = ('admin', 'project_manager')


def _finance_only(user):
    return user.role in FINANCE_ROLES


# ─── Requisiciones ────────────────────────────────────────────────────────────

class PurchaseRequisitionListCreateView(generics.ListCreateAPIView):
    serializer_class   = PurchaseRequisitionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'project']
    search_fields      = ['notes']
    ordering_fields    = ['created_at', 'needed_by']
    ordering           = ['-created_at']

    def get_queryset(self):
        return PurchaseRequisition.objects.select_related(
            'project', 'requested_by', 'approved_by'
        ).prefetch_related('lines')

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)


class PurchaseRequisitionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = PurchaseRequisition.objects.prefetch_related('lines')
    serializer_class   = PurchaseRequisitionSerializer
    permission_classes = [permissions.IsAuthenticated]


class PurchaseRequisitionApproveView(APIView):
    """POST /api/purchasing/requisitions/<pk>/approve/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not _finance_only(request.user):
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden aprobar requisiciones.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        from django.shortcuts import get_object_or_404
        req = get_object_or_404(PurchaseRequisition, pk=pk)
        try:
            req.approve(request.user)
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PurchaseRequisitionSerializer(req).data)


# ─── Órdenes de compra ────────────────────────────────────────────────────────

class PurchaseOrderListCreateView(generics.ListCreateAPIView):
    serializer_class   = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'project', 'supplier']
    search_fields      = ['notes']
    ordering_fields    = ['created_at', 'delivery_date']
    ordering           = ['-created_at']

    def get_queryset(self):
        return PurchaseOrder.objects.select_related(
            'supplier', 'project', 'created_by', 'confirmed_by'
        ).prefetch_related('lines')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PurchaseOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = PurchaseOrder.objects.prefetch_related('lines')
    serializer_class   = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]


class PurchaseOrderConfirmView(APIView):
    """POST /api/purchasing/orders/<pk>/confirm/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not _finance_only(request.user):
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden confirmar órdenes.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        from django.shortcuts import get_object_or_404
        po = get_object_or_404(PurchaseOrder, pk=pk)
        try:
            po.confirm(request.user)
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PurchaseOrderSerializer(po).data)


# ─── Recepciones de mercancía ─────────────────────────────────────────────────

class GoodsReceiptListCreateView(generics.ListCreateAPIView):
    serializer_class   = GoodsReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'purchase_order__project']
    search_fields      = ['notes']
    ordering_fields    = ['receipt_date', 'created_at']
    ordering           = ['-receipt_date']

    def get_queryset(self):
        return GoodsReceipt.objects.select_related(
            'purchase_order', 'received_by'
        ).prefetch_related('lines')

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)


class GoodsReceiptDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = GoodsReceipt.objects.prefetch_related('lines')
    serializer_class   = GoodsReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]


class GoodsReceiptPostView(APIView):
    """POST /api/purchasing/receipts/<pk>/post/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not _finance_only(request.user):
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden registrar recepciones.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        from django.shortcuts import get_object_or_404
        gr = get_object_or_404(GoodsReceipt, pk=pk)
        try:
            gr.post()
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(GoodsReceiptSerializer(gr).data)


# ─── Facturas de proveedor ────────────────────────────────────────────────────

class SupplierInvoiceListCreateView(generics.ListCreateAPIView):
    serializer_class   = SupplierInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'supplier', 'purchase_order__project']
    search_fields      = ['supplier_invoice_number', 'notes']
    ordering_fields    = ['issue_date', 'due_date', 'created_at']
    ordering           = ['-issue_date']

    def get_queryset(self):
        return SupplierInvoice.objects.select_related(
            'supplier', 'purchase_order'
        ).prefetch_related('lines')


class SupplierInvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = SupplierInvoice.objects.prefetch_related('lines')
    serializer_class   = SupplierInvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]


class SupplierInvoicePostView(APIView):
    """POST /api/purchasing/invoices/<pk>/post/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not _finance_only(request.user):
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden registrar facturas.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        from django.shortcuts import get_object_or_404
        spi = get_object_or_404(SupplierInvoice, pk=pk)
        try:
            spi.post()
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(SupplierInvoiceSerializer(spi).data)


# ─── Pagos a proveedores ──────────────────────────────────────────────────────

class SupplierPaymentListCreateView(generics.ListCreateAPIView):
    serializer_class   = SupplierPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'supplier', 'payment_method']
    search_fields      = ['reference_number', 'notes']
    ordering_fields    = ['payment_date', 'created_at']
    ordering           = ['-payment_date']

    def get_queryset(self):
        return SupplierPayment.objects.select_related('supplier').prefetch_related('allocations')


class SupplierPaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = SupplierPayment.objects.prefetch_related('allocations')
    serializer_class   = SupplierPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


class PurchaseOrderPDFView(APIView):
    """GET /api/purchasing/orders/<pk>/pdf/  → application/pdf"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        from django.shortcuts import get_object_or_404
        from django.template.loader import render_to_string
        from django.utils.timezone import localtime
        from django.utils import timezone
        import weasyprint
        import base64, os

        po = get_object_or_404(
            PurchaseOrder.objects.select_related(
                'supplier', 'project', 'project__client', 'phase',
                'confirmed_by', 'created_by',
            ).prefetch_related('lines'),
            pk=pk,
        )

        # Company settings (singleton)
        try:
            from apps.core.models import CompanySettings
            company = CompanySettings.objects.first() or CompanySettings(name='Grucore')
        except Exception:
            from types import SimpleNamespace
            company = SimpleNamespace(name='Grucore', tagline='', logo_light=None)

        # Logo as base64 data-URI so weasyprint can embed it without HTTP
        logo_url = ''
        try:
            if company.logo_light and company.logo_light.name:
                logo_path = company.logo_light.path
                if os.path.exists(logo_path):
                    with open(logo_path, 'rb') as f:
                        ext = os.path.splitext(logo_path)[1].lower().lstrip('.')
                        mime = {'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
                                'svg': 'image/svg+xml', 'webp': 'image/webp'}.get(ext, 'image/png')
                        logo_url = f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"
        except Exception:
            pass

        po_number = f'PO-{po.year}-{po.sequence:04d}'
        now_local = localtime(timezone.now())

        html_string = render_to_string('purchasing/po_pdf.html', {
            'po':           po,
            'company':      company,
            'logo_url':     logo_url,
            'po_number':    po_number,
            'generated_at': now_local.strftime('%d/%m/%Y %H:%M'),
        }, request=request)

        pdf_bytes = weasyprint.HTML(string=html_string, base_url=request.build_absolute_uri('/')).write_pdf()

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{po_number}.pdf"'
        return response


class SupplierPaymentPostView(APIView):
    """POST /api/purchasing/payments/<pk>/post/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if not _finance_only(request.user):
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden registrar pagos.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        from django.shortcuts import get_object_or_404
        pay = get_object_or_404(SupplierPayment, pk=pk)
        try:
            pay.post()
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(SupplierPaymentSerializer(pay).data)
