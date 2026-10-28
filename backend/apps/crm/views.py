from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Pipeline, PipelineStage, Lead, LeadActivity, ActivityType, LeadSource, ServiceType, LeadTier
from .serializers import (
    PipelineSerializer,
    PipelineStageSerializer,
    LeadSerializer,
    LeadActivitySerializer,
)


# ─── Pipelines ────────────────────────────────────────────────────────────────

class PipelineListCreateView(generics.ListCreateAPIView):
    queryset           = Pipeline.objects.prefetch_related('stages').all()
    serializer_class   = PipelineSerializer
    permission_classes = [permissions.IsAuthenticated]


class PipelineDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Pipeline.objects.prefetch_related('stages').all()
    serializer_class   = PipelineSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Stages ───────────────────────────────────────────────────────────────────

class StageListCreateView(generics.ListCreateAPIView):
    serializer_class   = PipelineStageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        pipeline_pk = self.kwargs['pipeline_pk']
        return PipelineStage.objects.filter(pipeline_id=pipeline_pk)

    def perform_create(self, serializer):
        pipeline = get_object_or_404(Pipeline, pk=self.kwargs['pipeline_pk'])
        serializer.save(pipeline=pipeline)


class StageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PipelineStageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        pipeline_pk = self.kwargs['pipeline_pk']
        return PipelineStage.objects.filter(pipeline_id=pipeline_pk)


class StageReorderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pipeline_pk):
        pipeline = get_object_or_404(Pipeline, pk=pipeline_pk)
        order_list = request.data.get('order', [])

        if not isinstance(order_list, list):
            return Response(
                {'detail': 'Se espera una lista de IDs en el campo "order".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        stages = PipelineStage.objects.filter(pipeline=pipeline, id__in=order_list)
        stage_map = {s.id: s for s in stages}

        if len(stage_map) != len(order_list):
            return Response(
                {'detail': 'Uno o más IDs de etapa no pertenecen a este pipeline.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for new_order, stage_id in enumerate(order_list, start=1):
            stage = stage_map[stage_id]
            stage.order = new_order

        PipelineStage.objects.bulk_update(list(stage_map.values()), ['order'])

        serializer = PipelineStageSerializer(
            PipelineStage.objects.filter(pipeline=pipeline).order_by('order'),
            many=True,
        )
        return Response(serializer.data)


# ─── Leads ────────────────────────────────────────────────────────────────────

class LeadListCreateView(generics.ListCreateAPIView):
    serializer_class   = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'source', 'service_type', 'stage', 'pipeline', 'assigned_to']
    search_fields      = ['full_name', 'email', 'phone', 'company', 'city']
    ordering_fields    = ['created_at', 'estimated_value_gtq', 'full_name']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Lead.objects.select_related(
            'pipeline', 'stage', 'assigned_to', 'converted_project',
        ).prefetch_related('activities__user').all()


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.select_related(
            'pipeline', 'stage', 'assigned_to', 'converted_project',
        ).prefetch_related('activities__user').all()


class LeadMoveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        lead = get_object_or_404(Lead, pk=pk)
        stage_id = request.data.get('stage')

        if not stage_id:
            return Response(
                {'detail': 'Se requiere el campo "stage".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_stage = get_object_or_404(PipelineStage, pk=stage_id, pipeline=lead.pipeline)
        old_stage_name = lead.stage.name
        new_stage_name = new_stage.name

        lead.stage = new_stage
        lead.save()

        LeadActivity.objects.create(
            lead=lead,
            user=request.user,
            activity_type=ActivityType.STAGE_CHANGE,
            content=f"Movido de '{old_stage_name}' a '{new_stage_name}'",
        )

        serializer = LeadSerializer(lead, context={'request': request})
        return Response(serializer.data)


class LeadConvertView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        from apps.projects.models import Project

        lead = get_object_or_404(Lead, pk=pk)
        project_id = request.data.get('project_id')

        if not project_id:
            return Response(
                {'detail': 'Se requiere el campo "project_id".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project = get_object_or_404(Project, pk=project_id)

        # Set the won stage if one exists in the pipeline
        won_stage = PipelineStage.objects.filter(pipeline=lead.pipeline, is_won=True).first()
        if won_stage:
            lead.stage = won_stage

        lead.converted_project = project
        lead.converted_at      = timezone.now()
        lead.status            = 'won'
        lead.save()

        LeadActivity.objects.create(
            lead=lead,
            user=request.user,
            activity_type=ActivityType.CONVERSION,
            content=f"Lead convertido al proyecto '{project.name}'",
        )

        serializer = LeadSerializer(lead, context={'request': request})
        return Response(serializer.data)


# ─── Public Widget Lead ───────────────────────────────────────────────────────

class WidgetLeadView(APIView):
    """Public endpoint — receives leads from the website qualification widget."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data

        full_name = (data.get('full_name') or '').strip()
        phone     = (data.get('phone') or '').strip()

        if not full_name or not phone:
            return Response(
                {'detail': 'Los campos nombre y teléfono son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate service_type
        valid_services = {choice[0] for choice in ServiceType.choices}
        service_type   = data.get('service_type', ServiceType.OTHER)
        if service_type not in valid_services:
            service_type = ServiceType.OTHER

        # Resolve pipeline + first stage
        pipeline = (
            Pipeline.objects.filter(is_default=True).first()
            or Pipeline.objects.order_by('id').first()
        )
        if not pipeline:
            return Response(
                {'detail': 'No existe ningún pipeline configurado. Crea uno desde el admin.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        stage = PipelineStage.objects.filter(pipeline=pipeline).order_by('order').first()
        if not stage:
            return Response(
                {'detail': 'El pipeline no tiene etapas configuradas.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Build notes
        budget_range = (data.get('budget_range') or '').strip()
        notes_parts  = []
        if budget_range:
            notes_parts.append(f'Presupuesto: {budget_range}')
        extra_notes = (data.get('notes') or '').strip()
        if extra_notes:
            notes_parts.append(extra_notes)
        notes = '\n'.join(notes_parts)

        # Validate lead_tier
        raw_tier   = (data.get('lead_tier') or '').strip()
        valid_tiers = {choice[0] for choice in LeadTier.choices}
        lead_tier  = raw_tier if raw_tier in valid_tiers else None

        # Validate lead_score (0-25)
        raw_score  = data.get('lead_score')
        try:
            lead_score = int(raw_score) if raw_score is not None else None
            if lead_score is not None and not (0 <= lead_score <= 25):
                lead_score = None
        except (TypeError, ValueError):
            lead_score = None

        lead, created = Lead.objects.update_or_create(
            phone    = phone,
            defaults = dict(
                full_name           = full_name,
                email               = (data.get('email') or '').strip(),
                city                = (data.get('city') or '').strip(),
                service_type        = service_type,
                source              = LeadSource.WIDGET,
                notes               = notes,
                estimated_value_gtq = data.get('estimated_value_gtq') or None,
                lead_score          = lead_score,
                lead_tier           = lead_tier,
                pipeline            = pipeline,
                stage               = stage,
            ),
        )

        detail = 'Lead creado exitosamente.' if created else 'Lead actualizado exitosamente.'
        return Response({'id': lead.id, 'created': created, 'detail': detail}, status=status.HTTP_201_CREATED)


# ─── Lead Activities ──────────────────────────────────────────────────────────

class LeadActivityListCreateView(generics.ListCreateAPIView):
    serializer_class   = LeadActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        lead_pk = self.kwargs['lead_pk']
        return LeadActivity.objects.filter(lead_id=lead_pk).select_related('user')

    def perform_create(self, serializer):
        lead = get_object_or_404(Lead, pk=self.kwargs['lead_pk'])
        serializer.save(lead=lead, user=self.request.user)
