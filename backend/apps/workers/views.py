from rest_framework import generics, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Worker, WorkLog
from .serializers import WorkerSerializer, WorkLogSerializer


FINANCE_ROLES = ('admin', 'project_manager')


def _finance_only(user):
    return getattr(user, 'role', None) in FINANCE_ROLES


class WorkerListCreateView(generics.ListCreateAPIView):
    serializer_class   = WorkerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['status', 'position', 'current_project']
    search_fields      = ['first_name', 'last_name', 'dpi']
    ordering_fields    = ['last_name', 'daily_rate_gtq', 'hire_date']
    ordering           = ['last_name', 'first_name']

    def get_queryset(self):
        return Worker.objects.select_related('current_project').all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class WorkerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = WorkerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Worker.objects.select_related('current_project').all()


class WorkLogListCreateView(generics.ListCreateAPIView):
    serializer_class   = WorkLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['worker', 'project', 'date']
    ordering_fields    = ['date', 'created_at']
    ordering           = ['-date']

    def get_queryset(self):
        worker_pk = self.kwargs.get('worker_pk')
        qs = WorkLog.objects.select_related('worker', 'project').all()
        if worker_pk:
            qs = qs.filter(worker_id=worker_pk)
        return qs

    def perform_create(self, serializer):
        worker_pk = self.kwargs.get('worker_pk')
        extra = {'created_by': self.request.user}
        if worker_pk:
            extra['worker_id'] = worker_pk
        serializer.save(**extra)


class WorkLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = WorkLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        worker_pk = self.kwargs.get('worker_pk')
        qs = WorkLog.objects.select_related('worker', 'project').all()
        if worker_pk:
            qs = qs.filter(worker_id=worker_pk)
        return qs


class WorkLogPostBatchView(APIView):
    """
    POST /api/workers/worklogs/post-batch/

    Contabiliza las jornadas de un período en el libro mayor.

    Body:
        { "year": 2025, "month": 3 }

    Requiere rol admin o project_manager.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not _finance_only(request.user):
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

        year  = request.data.get('year')
        month = request.data.get('month')

        if not year or not month:
            return Response({'detail': 'Se requieren "year" y "month".'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            year  = int(year)
            month = int(month)
        except (TypeError, ValueError):
            return Response({'detail': '"year" y "month" deben ser enteros.'}, status=status.HTTP_400_BAD_REQUEST)

        if not (1 <= month <= 12):
            return Response({'detail': '"month" debe estar entre 1 y 12.'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolver período contable
        from apps.ledger.models import AccountingPeriod, PeriodStatus
        try:
            period = AccountingPeriod.objects.get(year=year, month=month)
        except AccountingPeriod.DoesNotExist:
            return Response(
                {'detail': f'No existe AccountingPeriod para {year}-{month:02d}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if period.status == PeriodStatus.CLOSED:
            return Response(
                {'detail': f'El período {period} está cerrado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        worklogs = list(
            WorkLog.objects
            .select_related('worker', 'project')
            .filter(date__year=year, date__month=month)
        )

        if not worklogs:
            return Response({'detail': 'No hay jornadas en el período indicado.', 'entries_created': 0})

        try:
            from apps.ledger.services import PostingService
            entries = PostingService.post_worklog_batch(worklogs, period, request.user)
        except DjangoValidationError as exc:
            return Response({'detail': exc.message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'entries_created': len(entries),
            'period': str(period),
            'worklogs_processed': len(worklogs),
            'journal_entries': [
                {'id': e.id, 'number': e.number, 'description': e.description}
                for e in entries
            ],
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_worker_avatar(request, pk):
    """POST /api/workers/<pk>/avatar/ — sube foto del trabajador (multipart)."""
    try:
        worker = Worker.objects.get(pk=pk)
    except Worker.DoesNotExist:
        return Response({'detail': 'Trabajador no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if 'avatar' not in request.FILES:
        return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['avatar']
    if not file.content_type.startswith('image/'):
        return Response({'detail': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
    if file.size > 5 * 1024 * 1024:
        return Response({'detail': 'El archivo no puede superar 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    worker.avatar = file
    worker.save(update_fields=['avatar'])
    serializer = WorkerSerializer(worker)
    return Response(serializer.data)
