from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.projects.models import Project
from .models import Document, RFI, Submittal, PunchItem, RFIStatus, SubmittalStatus, PunchItemStatus
from .serializers import DocumentSerializer, RFISerializer, SubmittalSerializer, PunchItemSerializer

INTERNAL_ROLES = ('admin', 'project_manager', 'site_supervisor', 'team_member', 'contractor')


def _get_project_or_403(project_pk, user):
    """
    Devuelve el Project si el usuario tiene acceso:
    - Staff interno: cualquier proyecto.
    - Cliente (rol 'client'): solo sus proyectos (client.portal_user == user).
    Lanza 403 si no tiene acceso.
    """
    project = get_object_or_404(Project, pk=project_pk)
    if user.role not in INTERNAL_ROLES:
        # El usuario es cliente — verificar que el proyecto le pertenece
        client = getattr(user, 'client_profile', None)
        if client is None or project.client_id != client.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No tienes acceso a este proyecto.')
    return project


# ─── Documentos ───────────────────────────────────────────────────────────────

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class   = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['document_type', 'is_archived', 'visible_to_client']
    search_fields      = ['title', 'description', 'file_name']
    ordering_fields    = ['created_at', 'title']
    ordering           = ['-created_at']

    def get_queryset(self):
        _get_project_or_403(self.kwargs['project_pk'], self.request.user)
        qs = Document.objects.filter(project_id=self.kwargs['project_pk'])
        # Clientes solo ven documentos marcados como visibles y no archivados
        if self.request.user.role not in INTERNAL_ROLES:
            qs = qs.filter(visible_to_client=True, is_archived=False)
        return qs

    def perform_create(self, serializer):
        project = _get_project_or_403(self.kwargs['project_pk'], self.request.user)
        serializer.save(project=project, uploaded_by=self.request.user)


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        _get_project_or_403(self.kwargs['project_pk'], self.request.user)
        qs = Document.objects.filter(project_id=self.kwargs['project_pk'])
        if self.request.user.role not in INTERNAL_ROLES:
            qs = qs.filter(visible_to_client=True, is_archived=False)
        return qs


# ─── RFIs ─────────────────────────────────────────────────────────────────────

class RFIListCreateView(generics.ListCreateAPIView):
    serializer_class   = RFISerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'priority']
    search_fields      = ['subject', 'description']
    ordering_fields    = ['created_at', 'due_date', 'priority']
    ordering           = ['-created_at']

    def get_queryset(self):
        return RFI.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, submitted_by=self.request.user)


class RFIDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = RFISerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RFI.objects.filter(project_id=self.kwargs['project_pk'])


class RFIAnswerView(APIView):
    """
    POST /api/projects/<project_pk>/rfis/<rfi_pk>/answer/

    Cuerpo: { "answer": "..." }
    Solo personal interno puede responder RFIs.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, rfi_pk):
        if request.user.role not in INTERNAL_ROLES:
            return Response(
                {'detail': 'No tienes permiso para responder RFIs.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        rfi = get_object_or_404(RFI, pk=rfi_pk, project_id=project_pk)

        answer = request.data.get('answer', '').strip()
        if not answer:
            return Response(
                {'detail': 'El campo answer es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rfi.answer      = answer
        rfi.answered_by = request.user
        rfi.answered_at = timezone.now()
        rfi.status      = RFIStatus.ANSWERED
        rfi.save(update_fields=['answer', 'answered_by', 'answered_at', 'status', 'updated_at'])

        return Response(RFISerializer(rfi).data)


# ─── Submittals ───────────────────────────────────────────────────────────────

class SubmittalListCreateView(generics.ListCreateAPIView):
    serializer_class   = SubmittalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status']
    search_fields      = ['title', 'description']
    ordering_fields    = ['created_at', 'title']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Submittal.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, submitted_by=self.request.user)


class SubmittalDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = SubmittalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Submittal.objects.filter(project_id=self.kwargs['project_pk'])


class SubmittalReviewView(APIView):
    """
    POST /api/projects/<project_pk>/submittals/<submittal_pk>/review/

    Cuerpo: { "status": "approved", "review_notes": "..." }
    Solo personal interno puede revisar submittals.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, submittal_pk):
        if request.user.role not in INTERNAL_ROLES:
            return Response(
                {'detail': 'No tienes permiso para revisar submittals.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        submittal = get_object_or_404(Submittal, pk=submittal_pk, project_id=project_pk)

        new_status = request.data.get('status', '').strip()
        valid_statuses = [s.value for s in SubmittalStatus]
        if new_status not in valid_statuses:
            return Response(
                {'detail': f'Estado inválido. Opciones válidas: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from datetime import date
        submittal.reviewed_by  = request.user
        submittal.review_date  = date.today()
        submittal.status       = new_status
        submittal.review_notes = request.data.get('review_notes', '')
        submittal.save(update_fields=['reviewed_by', 'review_date', 'status', 'review_notes', 'updated_at'])

        return Response(SubmittalSerializer(submittal).data)


# ─── Punch Items ──────────────────────────────────────────────────────────────

class PunchItemListCreateView(generics.ListCreateAPIView):
    serializer_class   = PunchItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'priority', 'category']
    search_fields      = ['description', 'location']
    ordering_fields    = ['created_at', 'priority', 'due_date']
    ordering           = ['priority', '-created_at']

    def get_queryset(self):
        return PunchItem.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, created_by=self.request.user)


class PunchItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PunchItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PunchItem.objects.filter(project_id=self.kwargs['project_pk'])


class PunchItemResolveView(APIView):
    """
    POST /api/projects/<project_pk>/punchitems/<item_pk>/resolve/

    Cuerpo: { "resolution_notes": "..." }
    Marca el punch item como resuelto.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, item_pk):
        item = get_object_or_404(PunchItem, pk=item_pk, project_id=project_pk)

        if item.status == PunchItemStatus.RESOLVED:
            return Response(
                {'detail': 'Este punch item ya está resuelto.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.resolution_notes = request.data.get('resolution_notes', '')
        item.status           = PunchItemStatus.RESOLVED
        item.resolved_at      = timezone.now()
        item.save(update_fields=['resolution_notes', 'status', 'resolved_at', 'updated_at'])

        return Response(PunchItemSerializer(item).data)
