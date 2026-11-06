from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Event, EventStatus, ClientApproval
from .serializers import EventSerializer, EventWriteSerializer


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _is_client(user):
    return getattr(user, 'role', None) == 'client_portal'


def _client_projects(user):
    """Return QuerySet of projects the client portal user is linked to."""
    from apps.projects.models import Project
    return Project.objects.filter(client__portal_user=user)


# ─── Event list / create ──────────────────────────────────────────────────────

class EventListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['event_type', 'status', 'is_client_meeting', 'project', 'lead']
    ordering_fields    = ['start_datetime', 'created_at']
    ordering           = ['start_datetime']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventWriteSerializer
        return EventSerializer

    def get_queryset(self):
        user = self.request.user
        if _is_client(user):
            # Clients only see their own project meetings
            return (
                Event.objects
                .filter(project__in=_client_projects(user), is_client_meeting=True)
                .select_related('project', 'lead', 'created_by')
                .prefetch_related('attendees')
            )
        return (
            Event.objects
            .select_related('project', 'lead', 'created_by')
            .prefetch_related('attendees')
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ─── Event detail ─────────────────────────────────────────────────────────────

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return EventWriteSerializer
        return EventSerializer

    def get_queryset(self):
        user = self.request.user
        if _is_client(user):
            return Event.objects.filter(
                project__in=_client_projects(user),
                is_client_meeting=True,
            )
        return Event.objects.select_related('project', 'lead', 'created_by').prefetch_related('attendees')


# ─── Staff actions ────────────────────────────────────────────────────────────

class EventCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        event.status = EventStatus.CANCELLED
        event.save(update_fields=['status', 'updated_at'])
        return Response(EventSerializer(event).data)


class EventCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        event.status = EventStatus.COMPLETED
        event.save(update_fields=['status', 'updated_at'])
        return Response(EventSerializer(event).data)


# ─── Client portal actions ────────────────────────────────────────────────────

class EventClientApproveView(APIView):
    """Client confirms an event from the portal."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        qs = Event.objects.filter(
            project__in=_client_projects(user),
            is_client_meeting=True,
        ) if _is_client(user) else Event.objects.all()

        try:
            event = qs.get(pk=pk)
        except Event.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        notes = request.data.get('notes', '')
        event.client_approval = ClientApproval.APPROVED
        event.client_notes    = notes
        event.status          = EventStatus.CONFIRMED
        event.save(update_fields=['client_approval', 'client_notes', 'status', 'updated_at'])
        return Response(EventSerializer(event).data)


class EventClientRejectView(APIView):
    """Client rejects an event from the portal."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        qs = Event.objects.filter(
            project__in=_client_projects(user),
            is_client_meeting=True,
        ) if _is_client(user) else Event.objects.all()

        try:
            event = qs.get(pk=pk)
        except Event.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        notes = request.data.get('notes', '')
        event.client_approval = ClientApproval.REJECTED
        event.client_notes    = notes
        event.status          = EventStatus.CANCELLED
        event.save(update_fields=['client_approval', 'client_notes', 'status', 'updated_at'])
        return Response(EventSerializer(event).data)


# ─── Upcoming events (portal widget) ─────────────────────────────────────────

class UpcomingEventsView(APIView):
    """Returns next N events for the authenticated user (client or staff)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user  = request.user
        limit = int(request.query_params.get('limit', 5))
        now   = timezone.now()

        if _is_client(user):
            qs = Event.objects.filter(
                project__in=_client_projects(user),
                is_client_meeting=True,
                start_datetime__gte=now,
            ).exclude(status=EventStatus.CANCELLED)
        else:
            qs = Event.objects.filter(
                start_datetime__gte=now,
            ).exclude(status=EventStatus.CANCELLED)

        events = qs.select_related('project', 'lead', 'created_by').order_by('start_datetime')[:limit]
        return Response(EventSerializer(events, many=True).data)
