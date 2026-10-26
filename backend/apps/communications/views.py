from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.projects.models import Project
from .models import Notification, ProjectMessage
from .serializers import NotificationSerializer, ProjectMessageSerializer


# ─── Notificaciones ───────────────────────────────────────────────────────────

class NotificationListView(generics.ListAPIView):
    serializer_class   = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['is_read', 'notification_type']
    ordering_fields    = ['created_at']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class NotificationMarkReadView(APIView):
    """
    POST /api/notifications/<pk>/read/

    Marca una notificación individual como leída.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at'])

        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    """
    POST /api/notifications/read-all/

    Marca todas las notificaciones no leídas del usuario como leídas.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        now = timezone.now()
        updated = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
        ).update(is_read=True, read_at=now)

        return Response({'detail': f'{updated} notificaciones marcadas como leídas.'})


# ─── Mensajes de proyecto ─────────────────────────────────────────────────────

class ProjectMessageListCreateView(generics.ListCreateAPIView):
    serializer_class   = ProjectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [SearchFilter, OrderingFilter]
    search_fields      = ['body']
    ordering_fields    = ['created_at']
    ordering           = ['created_at']

    def get_queryset(self):
        # Only return top-level messages (replies are nested via serializer)
        return ProjectMessage.objects.filter(
            project_id=self.kwargs['project_pk'],
            parent__isnull=True,
        ).prefetch_related('replies')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, author=self.request.user)


class ProjectMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ProjectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProjectMessage.objects.filter(
            project_id=self.kwargs['project_pk'],
        ).prefetch_related('replies')
