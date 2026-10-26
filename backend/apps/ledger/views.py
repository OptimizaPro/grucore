from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    AccountingPeriod, Account, JournalEntry, TaxRule, AccountMapping,
    EntryState,
)
from .serializers import (
    AccountingPeriodSerializer, AccountSerializer, AccountDetailSerializer,
    JournalEntrySerializer, TaxRuleSerializer, AccountMappingSerializer,
)

FINANCE_ROLES = ('admin', 'project_manager')


# ─── Períodos contables ───────────────────────────────────────────────────────

class AccountingPeriodListCreateView(generics.ListCreateAPIView):
    queryset           = AccountingPeriod.objects.select_related('closed_by')
    serializer_class   = AccountingPeriodSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['state', 'year']
    ordering_fields    = ['year', 'month']
    ordering           = ['-year', '-month']


class AccountingPeriodDetailView(generics.RetrieveUpdateAPIView):
    queryset           = AccountingPeriod.objects.all()
    serializer_class   = AccountingPeriodSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Catálogo de cuentas ──────────────────────────────────────────────────────

class AccountListView(generics.ListAPIView):
    """Catálogo completo — lectura. Útil para dropdowns y reportes."""
    serializer_class   = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['account_type', 'level', 'is_active', 'pl_group']
    search_fields      = ['code', 'name']
    ordering_fields    = ['code', 'name']
    ordering           = ['code']

    def get_queryset(self):
        return Account.objects.filter(is_active=True).select_related('parent')


class AccountDetailView(generics.RetrieveAPIView):
    queryset           = Account.objects.all()
    serializer_class   = AccountDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Asientos contables ───────────────────────────────────────────────────────

class JournalEntryListCreateView(generics.ListCreateAPIView):
    serializer_class   = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['state', 'origin_type', 'period']
    search_fields      = ['number', 'description', 'notes']
    ordering_fields    = ['date', 'number', 'created_at']
    ordering           = ['-date', '-number']

    def get_queryset(self):
        return JournalEntry.objects.select_related(
            'period', 'created_by'
        ).prefetch_related('lines__account')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class JournalEntryDetailView(generics.RetrieveUpdateAPIView):
    serializer_class   = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JournalEntry.objects.prefetch_related('lines__account')


class JournalEntryPostView(APIView):
    """POST /api/ledger/journal/<pk>/post/  — contabiliza un asiento draft."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role not in FINANCE_ROLES:
            return Response(
                {'detail': 'Solo administradores y directores de proyecto pueden contabilizar asientos.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        entry = get_object_or_404(JournalEntry, pk=pk)
        try:
            entry.post()
        except DjangoValidationError as e:
            return Response({'detail': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(JournalEntrySerializer(entry).data)


# ─── Reglas fiscales ──────────────────────────────────────────────────────────

class TaxRuleListCreateView(generics.ListCreateAPIView):
    serializer_class   = TaxRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    filterset_fields   = ['tax_type', 'is_active', 'requires_fel']
    search_fields      = ['name', 'regime', 'description']

    def get_queryset(self):
        return TaxRule.objects.select_related('created_by')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TaxRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = TaxRule.objects.all()
    serializer_class   = TaxRuleSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Mapeos de cuentas ────────────────────────────────────────────────────────

class AccountMappingListView(generics.ListAPIView):
    """Lista todos los mapeos configurados (y los que faltan no aparecen)."""
    queryset           = AccountMapping.objects.select_related('account')
    serializer_class   = AccountMappingSerializer
    permission_classes = [permissions.IsAuthenticated]


class AccountMappingUpdateView(generics.RetrieveUpdateAPIView):
    queryset           = AccountMapping.objects.select_related('account')
    serializer_class   = AccountMappingSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Endpoints de P&L ─────────────────────────────────────────────────────────

class CompanyPnLView(APIView):
    """
    GET /api/ledger/pnl/company/?year=2026&month_from=1&month_to=12

    Devuelve el P&L consolidado de empresa para el rango seleccionado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            year       = int(request.query_params.get('year', 0))
            month_from = int(request.query_params.get('month_from', 1))
            month_to   = int(request.query_params.get('month_to', 12))
        except (TypeError, ValueError):
            return Response(
                {'detail': 'Parámetros inválidos. Use ?year=YYYY&month_from=M&month_to=M'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not year:
            from django.utils import timezone
            year = timezone.now().year

        from .services import CompanyPnLService
        svc = CompanyPnLService(year=year, month_from=month_from, month_to=month_to)

        return Response({
            'year':       year,
            'month_from': month_from,
            'month_to':   month_to,
            'currency':   'GTQ',
            'pnl':        svc.get_pnl(),
            'by_project': svc.get_by_project(),
        })


class EquipmentReconciliationView(APIView):
    """
    GET /api/ledger/equipment-reconciliation/

    Concilia costo analítico de equipo (tarifa × horas) vs. costo contable
    (depreciación + mantenimiento) para un período.

    Parámetros:
        year=YYYY          (obligatorio)
        month_from=1       (por defecto 1)
        month_to=12        (por defecto 12)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            year       = int(request.query_params.get('year', 0))
            month_from = int(request.query_params.get('month_from', 1))
            month_to   = int(request.query_params.get('month_to', 12))
        except (TypeError, ValueError):
            return Response({'detail': 'Parámetros inválidos.'}, status=status.HTTP_400_BAD_REQUEST)

        if not year:
            from django.utils import timezone
            year = timezone.now().year

        if not (1 <= month_from <= 12 and 1 <= month_to <= 12 and month_from <= month_to):
            return Response({'detail': 'Rango de meses inválido.'}, status=400)

        from .services import EquipmentReconciliationService
        svc = EquipmentReconciliationService(year=year, month_from=month_from, month_to=month_to)
        return Response(svc.get_reconciliation())


class ARAgingView(APIView):
    """
    GET /api/ledger/ar-aging/

    Análisis de CxC vencida (AR aging) por cliente.

    Parámetros opcionales:
        as_of=YYYY-MM-DD   (por defecto hoy)
        project_id=<int>   (filtra a un proyecto)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        import datetime
        as_of_str  = request.query_params.get('as_of')
        project_id = request.query_params.get('project_id')

        as_of_date = None
        if as_of_str:
            try:
                as_of_date = datetime.date.fromisoformat(as_of_str)
            except ValueError:
                return Response({'detail': 'as_of inválido. Use YYYY-MM-DD.'}, status=400)

        proj_id = None
        if project_id:
            try:
                proj_id = int(project_id)
            except ValueError:
                return Response({'detail': 'project_id inválido.'}, status=400)

        from .services import ARAgingService
        svc = ARAgingService(as_of_date=as_of_date, project_id=proj_id)
        return Response(svc.get_aging())


class CashFlowForecastView(APIView):
    """
    GET /api/ledger/cash-forecast/

    Pronóstico de flujo de caja mensual.

    Parámetros opcionales:
        as_of=YYYY-MM-DD   (por defecto hoy)
        months=6           (número de meses a proyectar, máx 24)
        project_id=<int>   (filtra a un proyecto)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        import datetime
        as_of_str  = request.query_params.get('as_of')
        months_str = request.query_params.get('months', '6')
        project_id = request.query_params.get('project_id')

        as_of_date = None
        if as_of_str:
            try:
                as_of_date = datetime.date.fromisoformat(as_of_str)
            except ValueError:
                return Response({'detail': 'as_of inválido. Use YYYY-MM-DD.'}, status=400)

        try:
            months = min(int(months_str), 24)
        except ValueError:
            return Response({'detail': 'months inválido.'}, status=400)

        proj_id = None
        if project_id:
            try:
                proj_id = int(project_id)
            except ValueError:
                return Response({'detail': 'project_id inválido.'}, status=400)

        from .services import CashFlowForecastService
        svc = CashFlowForecastService(as_of_date=as_of_date, months=months, project_id=proj_id)
        return Response(svc.get_forecast())


class ProjectPnLView(APIView):
    """
    GET /api/ledger/pnl/project/<project_pk>/?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD

    Devuelve el P&L detallado de un proyecto con comparativa presupuesto.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_pk):
        from django.shortcuts import get_object_or_404
        from apps.projects.models import Project
        project = get_object_or_404(Project, pk=project_pk)

        date_from_str = request.query_params.get('date_from')
        date_to_str   = request.query_params.get('date_to')

        date_from = date_to = None
        if date_from_str:
            from datetime import date
            try:
                date_from = date.fromisoformat(date_from_str)
            except ValueError:
                return Response({'detail': 'date_from inválido. Use YYYY-MM-DD.'}, status=400)
        if date_to_str:
            from datetime import date
            try:
                date_to = date.fromisoformat(date_to_str)
            except ValueError:
                return Response({'detail': 'date_to inválido. Use YYYY-MM-DD.'}, status=400)

        from .services import ProjectPnLService
        svc = ProjectPnLService(project, date_from=date_from, date_to=date_to)

        return Response({
            'project_id':   project.pk,
            'project_name': str(project),
            'currency':     'GTQ',
            'date_from':    date_from_str,
            'date_to':      date_to_str,
            'pnl':          svc.get_pnl(),
            'summary':      svc.get_summary(),
        })
