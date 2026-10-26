from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    Client, Project, Phase, Task,
    ProgressUpdate, PaymentMilestone, MilestoneEvidence, MilestoneApproval,
    MilestoneStatus, ApprovalStatus, ProjectContact, ProjectNote,
    Quote, QuoteLineItem,
    QuoteTemplate, QuoteTemplateLineItem,
)
from django.utils import timezone
from .serializers import (
    ClientSerializer,
    ProjectListSerializer, ProjectDetailSerializer,
    PhaseSerializer, TaskSerializer,
    ProgressUpdateSerializer,
    PaymentMilestoneSerializer, MilestoneEvidenceSerializer,
    MilestoneApprovalSerializer, ProjectContactSerializer, ProjectNoteSerializer,
    QuoteSerializer,
    QuoteTemplateSerializer,
)

INTERNAL_ROLES = ('admin', 'project_manager', 'site_supervisor', 'team_member', 'contractor')


def _assert_project_access(project_pk, user):
    """Devuelve el Project o lanza 403 si el cliente no es el dueño."""
    project = get_object_or_404(Project, pk=project_pk)
    if user.role not in INTERNAL_ROLES:
        client = getattr(user, 'client_profile', None)
        if client is None or project.client_id != client.id:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No tienes acceso a este proyecto.')
    return project


# ─── Clientes ─────────────────────────────────────────────────────────────────

class ClientListCreateView(generics.ListCreateAPIView):
    queryset           = Client.objects.all()
    serializer_class   = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [SearchFilter]
    search_fields      = ['name', 'email', 'company']


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Client.objects.all()
    serializer_class   = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]


# ─── Proyectos ────────────────────────────────────────────────────────────────

class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'project_type', 'is_public_portfolio']
    search_fields      = ['name', 'client__name', 'address']
    ordering_fields    = ['created_at', 'start_date', 'status']
    ordering           = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        qs   = Project.objects.select_related('client', 'project_manager')

        if user.role in ('admin', 'project_manager'):
            return qs.all()
        if user.role == 'client_portal':
            return qs.filter(client__portal_user=user)
        return qs.filter(phases__phase_tasks__assigned_to=user).distinct()

    def get_serializer_class(self):
        return ProjectListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs   = Project.objects.prefetch_related(
            'phases__phase_tasks',
            'progress_updates__photos',
            'milestones__evidence',
            'milestones__approval',
        ).select_related('client', 'project_manager')

        if user.role in ('admin', 'project_manager'):
            return qs.all()
        if user.role == 'client_portal':
            return qs.filter(client__portal_user=user)
        return qs.filter(phases__phase_tasks__assigned_to=user).distinct()

    def get_serializer_class(self):
        return ProjectDetailSerializer


# ─── Fases ────────────────────────────────────────────────────────────────────

class PhaseListCreateView(generics.ListCreateAPIView):
    serializer_class   = PhaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Phase.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project)


# ─── Tareas ───────────────────────────────────────────────────────────────────

class TaskListCreateView(generics.ListCreateAPIView):
    """Legacy: tasks nested under a phase."""
    serializer_class   = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    filterset_fields   = ['status', 'priority', 'assigned_to']
    search_fields      = ['title', 'description']

    def get_queryset(self):
        return Task.objects.filter(phase_id=self.kwargs['phase_pk'])

    def perform_create(self, serializer):
        phase = get_object_or_404(Phase, pk=self.kwargs['phase_pk'])
        serializer.save(phase=phase, project=phase.project, created_by=self.request.user)


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset           = Task.objects.all()
    serializer_class   = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]


class ProjectTaskListCreateView(generics.ListCreateAPIView):
    """Flat: tasks directly under a project (phase optional)."""
    serializer_class   = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'priority', 'assigned_to', 'phase']
    search_fields      = ['title', 'description']
    ordering_fields    = ['created_at', 'due_date', 'priority']
    ordering           = ['priority', 'due_date', '-created_at']

    def get_queryset(self):
        return Task.objects.filter(
            project_id=self.kwargs['project_pk']
        ).select_related('assigned_to', 'created_by', 'phase')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, created_by=self.request.user)


class ProjectTaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(project_id=self.kwargs['project_pk'])


# ─── Bitácora de progreso ─────────────────────────────────────────────────────

class ProgressUpdateListCreateView(generics.ListCreateAPIView):
    serializer_class   = ProgressUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProgressUpdate.objects.filter(
            project_id=self.kwargs['project_pk']
        ).prefetch_related('photos').order_by('-date')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project, created_by=self.request.user)


# ─── Hitos de pago ────────────────────────────────────────────────────────────

class MilestoneListCreateView(generics.ListCreateAPIView):
    serializer_class   = PaymentMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentMilestone.objects.filter(
            project_id=self.kwargs['project_pk']
        ).prefetch_related('evidence', 'approval').select_related('phase')

    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project)


class MilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = PaymentMilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentMilestone.objects.filter(
            project_id=self.kwargs['project_pk']
        ).prefetch_related('evidence', 'approval')


class MilestoneApproveView(APIView):
    """
    POST /api/projects/<project_pk>/milestones/<milestone_pk>/approve/

    Cuerpo: { "notes": "..." }

    — Si el usuario es client_portal      → firma del cliente.
    — Si es admin / project_manager / site_supervisor → firma de la constructora.

    Cuando ambas partes firman, el hito pasa automáticamente a APPROVED.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, milestone_pk):
        milestone = get_object_or_404(
            PaymentMilestone, pk=milestone_pk, project_id=project_pk,
        )

        if milestone.status not in (
            MilestoneStatus.EVIDENCE_SUBMITTED,
            MilestoneStatus.AWAITING_APPROVAL,
        ):
            return Response(
                {'detail': 'El hito no está disponible para aprobación.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        approval, _ = MilestoneApproval.objects.get_or_create(milestone=milestone)
        notes = request.data.get('notes', '')
        user  = request.user

        if user.role == 'client_portal':
            if approval.client_approved_at:
                return Response(
                    {'detail': 'Ya aprobaste este hito.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            approval.approve_client(
                ip_address=request.META.get('REMOTE_ADDR'),
                notes=notes,
            )

        elif user.role in ('admin', 'project_manager', 'site_supervisor'):
            if approval.company_approved_at:
                return Response(
                    {'detail': 'La constructora ya aprobó este hito.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            approval.approve_company(user=user, notes=notes)
            if milestone.status == MilestoneStatus.EVIDENCE_SUBMITTED:
                milestone.status = MilestoneStatus.AWAITING_APPROVAL
                milestone.save(update_fields=['status', 'updated_at'])

        else:
            return Response(
                {'detail': 'No tienes permiso para aprobar hitos.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        milestone.refresh_from_db()
        return Response(PaymentMilestoneSerializer(milestone).data)


class MilestoneEvidenceCreateView(APIView):
    """
    POST /api/projects/<project_pk>/milestones/<milestone_pk>/evidence/

    Cuerpo: { "photo_url": "...", "caption": "..." }
    Solo personal interno puede subir evidencia.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, milestone_pk):
        if request.user.role not in ('admin', 'project_manager', 'site_supervisor'):
            return Response(
                {'detail': 'Solo personal interno puede subir evidencia.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        milestone = get_object_or_404(
            PaymentMilestone, pk=milestone_pk, project_id=project_pk,
        )

        serializer = MilestoneEvidenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evidence = serializer.save(milestone=milestone, uploaded_by=request.user)

        if milestone.status == MilestoneStatus.PENDING:
            milestone.status = MilestoneStatus.EVIDENCE_SUBMITTED
            milestone.save(update_fields=['status', 'updated_at'])

        return Response(
            MilestoneEvidenceSerializer(evidence).data,
            status=status.HTTP_201_CREATED,
        )


class MilestoneMarkPaidView(APIView):
    """
    POST /api/projects/<project_pk>/milestones/<milestone_pk>/mark_paid/

    Solo admins/PMs. Marca el hito como pagado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, milestone_pk):
        if request.user.role not in ('admin', 'project_manager'):
            return Response(
                {'detail': 'Solo administradores pueden confirmar pagos.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        milestone = get_object_or_404(
            PaymentMilestone, pk=milestone_pk, project_id=project_pk,
        )

        if milestone.status != MilestoneStatus.APPROVED:
            return Response(
                {'detail': 'El hito debe estar aprobado por ambas partes antes de marcar como pagado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.utils import timezone
        milestone.status  = MilestoneStatus.PAID
        milestone.paid_at = timezone.now()
        milestone.save(update_fields=['status', 'paid_at', 'updated_at'])

        return Response(PaymentMilestoneSerializer(milestone).data)


# ─── Cover photo upload ───────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_project_cover(request, project_pk):
    """POST /api/projects/{id}/cover/ — sube foto de portada (multipart)."""
    project = get_object_or_404(Project, pk=project_pk)

    if 'cover_photo' not in request.FILES:
        return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES['cover_photo']
    if not file.content_type.startswith('image/'):
        return Response({'detail': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)

    if file.size > 10 * 1024 * 1024:
        return Response({'detail': 'El archivo no puede superar 10 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    project.cover_photo = file
    project.save(update_fields=['cover_photo'])
    serializer = ProjectDetailSerializer(project, context={'request': request})
    return Response(serializer.data)


# ─── Contactos del proyecto ───────────────────────────────────────────────────

class ProjectContactListCreateView(generics.ListCreateAPIView):
    serializer_class   = ProjectContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        _assert_project_access(self.kwargs['project_pk'], self.request.user)
        return ProjectContact.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_create(self, serializer):
        project = _assert_project_access(self.kwargs['project_pk'], self.request.user)
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede gestionar contactos.')
        serializer.save(project=project)


class ProjectContactDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ProjectContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        _assert_project_access(self.kwargs['project_pk'], self.request.user)
        return ProjectContact.objects.filter(project_id=self.kwargs['project_pk'])

    def update(self, request, *args, **kwargs):
        if request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede editar contactos.')
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede eliminar contactos.')
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_client_avatar(request, pk):
    """POST /api/projects/clients/<pk>/avatar/ — sube avatar del cliente."""
    if request.user.role not in INTERNAL_ROLES:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied('Solo el equipo interno puede gestionar clientes.')
    client = get_object_or_404(Client, pk=pk)

    if 'avatar' not in request.FILES:
        return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)
    file = request.FILES['avatar']
    if not file.content_type.startswith('image/'):
        return Response({'detail': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
    if file.size > 5 * 1024 * 1024:
        return Response({'detail': 'El archivo no puede superar 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    client.avatar = file
    client.save(update_fields=['avatar'])
    serializer = ClientSerializer(client, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_contact_avatar(request, project_pk, pk):
    """POST /api/projects/<project_pk>/contacts/<pk>/avatar/ — sube avatar del contacto."""
    if request.user.role not in INTERNAL_ROLES:
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied('Solo el equipo interno puede gestionar contactos.')
    _assert_project_access(project_pk, request.user)
    contact = get_object_or_404(ProjectContact, pk=pk, project_id=project_pk)

    if 'avatar' not in request.FILES:
        return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)
    file = request.FILES['avatar']
    if not file.content_type.startswith('image/'):
        return Response({'detail': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
    if file.size > 5 * 1024 * 1024:
        return Response({'detail': 'El archivo no puede superar 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    contact.avatar = file
    contact.save(update_fields=['avatar'])
    serializer = ProjectContactSerializer(contact, context={'request': request})
    return Response(serializer.data)


# ─── Notas internas ───────────────────────────────────────────────────────────

class ProjectNoteListCreateView(generics.ListCreateAPIView):
    serializer_class   = ProjectNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_pk = self.kwargs['project_pk']
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede ver notas internas.')
        return ProjectNote.objects.filter(project_id=project_pk).select_related('author')

    def perform_create(self, serializer):
        project_pk = self.kwargs['project_pk']
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede añadir notas.')
        project = get_object_or_404(Project, pk=project_pk)
        serializer.save(project=project, author=self.request.user)


class ProjectNoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = ProjectNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProjectNote.objects.filter(project_id=self.kwargs['project_pk'])

    def perform_update(self, serializer):
        note = self.get_object()
        if note.author != self.request.user and self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el autor o un administrador puede editar esta nota.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user and self.request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el autor o un administrador puede eliminar esta nota.')
        instance.delete()


# ─── Cotizaciones ─────────────────────────────────────────────────────────────

class QuoteListCreateView(generics.ListCreateAPIView):
    serializer_class   = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_pk = self.kwargs['project_pk']
        user = self.request.user
        _assert_project_access(project_pk, user)
        qs = Quote.objects.filter(project_id=project_pk).prefetch_related('line_items__product')
        if user.role not in INTERNAL_ROLES:
            qs = qs.exclude(status='draft')
        return qs

    def perform_create(self, serializer):
        project_pk = self.kwargs['project_pk']
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede crear cotizaciones.')
        project = get_object_or_404(Project, pk=project_pk)
        last = Quote.objects.filter(project=project).order_by('-revision').first()
        revision = (last.revision + 1) if last else 1
        serializer.save(project=project, created_by=self.request.user, revision=revision)


class QuoteDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        _assert_project_access(self.kwargs['project_pk'], user)
        qs = Quote.objects.filter(project_id=self.kwargs['project_pk']).prefetch_related('line_items__product')
        if user.role not in INTERNAL_ROLES:
            qs = qs.exclude(status='draft')
        return qs

    def perform_update(self, serializer):
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede editar cotizaciones.')
        quote = self.get_object()
        if quote.status not in ('draft', 'changes_requested'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Solo se pueden editar cotizaciones en borrador o con cambios solicitados.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede eliminar cotizaciones.')
        if instance.status != 'draft':
            from rest_framework.exceptions import ValidationError
            raise ValidationError('Solo se pueden eliminar cotizaciones en borrador.')
        instance.delete()


def _send_quote_email(quote: Quote, request=None):
    """Send email notification to client when a quote is sent/revised."""
    from django.core.mail import send_mail
    from django.conf import settings as django_settings

    project = quote.project
    client = getattr(project, 'client', None)
    if not client:
        return

    # Get client email from portal user or client record
    client_email = None
    if client.portal_user and client.portal_user.email:
        client_email = client.portal_user.email
    elif client.email:
        client_email = client.email

    if not client_email:
        return

    from decimal import Decimal
    total = quote.total_amount if hasattr(quote, 'total_amount') else 0

    is_revision = quote.revision > 1
    subject = (
        f'Cotización revisada {quote.quote_number} — {project.name}'
        if is_revision else
        f'Nueva cotización {quote.quote_number} — {project.name}'
    )

    # Get company name for email
    try:
        from apps.core.models import CompanySettings
        company = CompanySettings.objects.get_or_create(pk=1)[0]
        company_name = company.name or 'Grucore'
    except Exception:
        company_name = 'Grucore'

    total_items = quote.line_items.count()
    from decimal import Decimal
    subtotal_val = sum(i.quantity * i.unit_price for i in quote.line_items.all())
    discount_val = subtotal_val * quote.discount_pct / 100
    after_disc   = subtotal_val - discount_val
    tax_val      = after_disc * quote.tax_pct / 100
    total_val    = after_disc + tax_val

    html_message = f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 24px; }}
    .card {{ background: #ffffff; border-radius: 12px; max-width: 560px; margin: 0 auto; overflow: hidden; }}
    .header {{ background: #131D28; padding: 28px 32px; }}
    .header h1 {{ color: #FF6B35; font-size: 20px; margin: 0 0 4px; }}
    .header p {{ color: #8A95A5; font-size: 13px; margin: 0; }}
    .body {{ padding: 28px 32px; }}
    .badge {{ display: inline-block; background: #FF6B35; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px; margin-bottom: 16px; }}
    .total-block {{ background: #f8f8f8; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0; }}
    .total-block .label {{ font-size: 12px; color: #6b7280; }}
    .total-block .amount {{ font-size: 22px; font-weight: 700; color: #FF6B35; }}
    .cta {{ display: block; text-align: center; background: #FF6B35; color: #fff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 8px; margin: 24px 0 0; }}
    .footer {{ padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>{company_name}</h1>
      <p>Panel de cliente — {project.name}</p>
    </div>
    <div class="body">
      <span class="badge">{'Revisión ' + str(quote.revision) if is_revision else 'Nueva cotización'}</span>
      <p style="font-size:15px; color:#111827; font-weight:600; margin: 0 0 8px;">
        {'Se ha actualizado tu cotización' if is_revision else 'Tienes una cotización lista para revisar'}
      </p>
      <p style="font-size:13px; color:#6b7280; margin:0 0 4px;">Proyecto: <strong style="color:#111827;">{project.name}</strong></p>
      <p style="font-size:13px; color:#6b7280; margin:0 0 16px;">Número: <strong style="color:#111827;">{quote.quote_number}</strong> &nbsp;·&nbsp; {total_items} partida{'s' if total_items != 1 else ''}</p>
      <div class="total-block">
        <div class="label">Total cotizado</div>
        <div class="amount">Q {float(total_val):,.2f}</div>
      </div>
      {'<p style="font-size:13px;color:#6b7280;margin:0 0 4px;"><strong>Válida hasta:</strong> ' + str(quote.valid_until) + '</p>' if quote.valid_until else ''}
      <p style="font-size:13px;color:#6b7280;">Por favor ingresa a tu portal para revisar el detalle, aprobar, solicitar cambios o rechazar.</p>
      <a href="#" class="cta">Ver cotización en el portal</a>
    </div>
    <div class="footer">Este mensaje fue generado automáticamente por {company_name}. No responder a este correo.</div>
  </div>
</body>
</html>
"""

    plain_message = (
        f"{'Cotización revisada' if is_revision else 'Nueva cotización'}: {quote.quote_number}\n"
        f"Proyecto: {project.name}\n"
        f"Total: Q {float(total_val):,.2f}\n"
        f"{'Válida hasta: ' + str(quote.valid_until) if quote.valid_until else ''}\n\n"
        f"Ingresa a tu portal para revisar los detalles."
    )

    from_email = getattr(django_settings, 'DEFAULT_FROM_EMAIL', f'noreply@grucore.com')

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=from_email,
        recipient_list=[client_email],
        html_message=html_message,
        fail_silently=True,
    )


class QuoteSendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, pk):
        if request.user.role not in INTERNAL_ROLES:
            return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)
        quote = get_object_or_404(Quote, pk=pk, project_id=project_pk)
        if quote.status not in ('draft', 'changes_requested'):
            return Response({'detail': 'Solo se puede enviar una cotización en borrador o con cambios solicitados.'}, status=status.HTTP_400_BAD_REQUEST)
        if not quote.line_items.exists():
            return Response({'detail': 'La cotización debe tener al menos una partida.'}, status=status.HTTP_400_BAD_REQUEST)
        if quote.status == 'changes_requested':
            quote.revision = quote.revision + 1
        quote.status = 'sent'
        quote.sent_at = timezone.now()
        quote.client_comment = ''
        quote.save()
        # ── Email notification ────────────────────────────────────────────────
        try:
            _send_quote_email(quote, request)
        except Exception:
            pass  # Never block the response due to email failure
        serializer = QuoteSerializer(quote, context={'request': request})
        return Response(serializer.data)


class QuoteApproveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, pk):
        if request.user.role in INTERNAL_ROLES:
            return Response({'detail': 'Solo el cliente puede aprobar cotizaciones.'}, status=status.HTTP_403_FORBIDDEN)
        _assert_project_access(project_pk, request.user)
        quote = get_object_or_404(Quote, pk=pk, project_id=project_pk)
        if quote.status != 'sent':
            return Response({'detail': 'Solo se puede aprobar una cotización enviada.'}, status=status.HTTP_400_BAD_REQUEST)
        quote.status = 'approved'
        quote.decided_at = timezone.now()
        quote.save()
        serializer = QuoteSerializer(quote, context={'request': request})
        # Verificación de stock
        stock_alerts = []
        for item in quote.line_items.select_related('product').all():
            if item.product_id:
                product = item.product
                if product.stock_quantity < item.quantity:
                    stock_alerts.append({
                        'line_description': item.description,
                        'product_name': product.name,
                        'required': float(item.quantity),
                        'available': float(product.stock_quantity),
                        'unit': product.unit,
                        'shortage': float(item.quantity - product.stock_quantity),
                    })
        data = serializer.data
        data['stock_alerts'] = stock_alerts
        return Response(data)


class QuoteRequestChangesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, pk):
        if request.user.role in INTERNAL_ROLES:
            return Response({'detail': 'Solo el cliente puede solicitar cambios.'}, status=status.HTTP_403_FORBIDDEN)
        _assert_project_access(project_pk, request.user)
        quote = get_object_or_404(Quote, pk=pk, project_id=project_pk)
        if quote.status != 'sent':
            return Response({'detail': 'Solo se puede solicitar cambios en una cotización enviada.'}, status=status.HTTP_400_BAD_REQUEST)
        comment = request.data.get('comment', '').strip()
        if not comment:
            return Response({'detail': 'Debes proporcionar un comentario con los cambios solicitados.'}, status=status.HTTP_400_BAD_REQUEST)
        quote.status = 'changes_requested'
        quote.client_comment = comment
        quote.decided_at = timezone.now()
        quote.save()
        serializer = QuoteSerializer(quote, context={'request': request})
        return Response(serializer.data)


class QuoteRejectView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, project_pk, pk):
        if request.user.role in INTERNAL_ROLES:
            return Response({'detail': 'Solo el cliente puede rechazar cotizaciones.'}, status=status.HTTP_403_FORBIDDEN)
        _assert_project_access(project_pk, request.user)
        quote = get_object_or_404(Quote, pk=pk, project_id=project_pk)
        if quote.status != 'sent':
            return Response({'detail': 'Solo se puede rechazar una cotización enviada.'}, status=status.HTTP_400_BAD_REQUEST)
        comment = request.data.get('comment', '').strip()
        quote.status = 'rejected'
        quote.client_comment = comment
        quote.decided_at = timezone.now()
        quote.save()
        serializer = QuoteSerializer(quote, context={'request': request})
        return Response(serializer.data)


# ─── Plantillas de cotización ─────────────────────────────────────────────────

class QuoteTemplateListCreateView(generics.ListCreateAPIView):
    serializer_class   = QuoteTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede acceder a plantillas.')
        return QuoteTemplate.objects.prefetch_related('line_items').all()

    def perform_create(self, serializer):
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede crear plantillas.')
        serializer.save(created_by=self.request.user)


class QuoteTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class   = QuoteTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset           = QuoteTemplate.objects.prefetch_related('line_items').all()

    def perform_update(self, serializer):
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede editar plantillas.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role not in INTERNAL_ROLES:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el equipo interno puede eliminar plantillas.')
        instance.delete()


class QuotePDFView(APIView):
    """Generate and return a PDF for a quote using ReportLab."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_pk, pk):
        from io import BytesIO
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.platypus import (
            SimpleDocTemplate, Table, TableStyle, Paragraph,
            Spacer, HRFlowable,
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
        from django.http import HttpResponse

        user = request.user
        _assert_project_access(project_pk, user)
        quote = get_object_or_404(
            Quote.objects.select_related('project__client').prefetch_related('line_items__product'),
            pk=pk, project_id=project_pk,
        )
        if user.role not in INTERNAL_ROLES:
            if quote.status == 'draft':
                return Response({'detail': 'No disponible.'}, status=status.HTTP_403_FORBIDDEN)

        # ── Company info ──────────────────────────────────────────────────────
        try:
            from apps.core.models import CompanySettings
            cs = CompanySettings.objects.get_or_create(pk=1)[0]
            company_name    = cs.name    or 'Grucore'
            company_tagline = cs.tagline or ''
        except Exception:
            company_name    = 'Grucore'
            company_tagline = ''

        project = quote.project

        # ── Colors ───────────────────────────────────────────────────────────
        ORANGE    = colors.HexColor('#FF6B35')
        DARK_BG   = colors.HexColor('#131D28')
        BORDER    = colors.HexColor('#27384A')
        MUTED     = colors.HexColor('#8A95A5')
        WHITE     = colors.white
        TEXT      = colors.HexColor('#1a1a1a')
        TEXT_MED  = colors.HexColor('#4a4a4a')
        CAT_MAT   = colors.HexColor('#FF6B35')
        CAT_LAB   = colors.HexColor('#5B7FE8')
        CAT_EQP   = colors.HexColor('#D97706')
        CAT_OTH   = colors.HexColor('#6B7280')

        # ── Helpers ───────────────────────────────────────────────────────────
        MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

        def fmt_date(d):
            try:
                from datetime import date as _date
                v = _date.fromisoformat(str(d))
                return f'{v.day} {MONTHS_ES[v.month - 1]} {v.year}'
            except Exception:
                return str(d)

        def fmt_pct(pct_str):
            v = float(pct_str)
            return f'{v:.0f}%' if v == int(v) else f'{v}%'

        # ── Styles ────────────────────────────────────────────────────────────
        base_styles = getSampleStyleSheet()
        normal      = base_styles['Normal']

        def style(name, **kwargs):
            return ParagraphStyle(name, parent=normal, **kwargs)

        s_company = style('company', fontSize=16, fontName='Helvetica-Bold', textColor=ORANGE, spaceAfter=6)
        s_tagline = style('tagline', fontSize=8,  fontName='Helvetica',      textColor=MUTED)
        s_h2      = style('h2',      fontSize=10, fontName='Helvetica-Bold', textColor=TEXT,  spaceAfter=4)
        s_label   = style('label',   fontSize=8,  fontName='Helvetica',      textColor=MUTED, spaceAfter=2)
        s_note    = style('note',    fontSize=8,  fontName='Helvetica',      textColor=TEXT_MED, leading=13)
        s_th      = style('th',      fontSize=7,  fontName='Helvetica-Bold', textColor=WHITE)
        s_td      = style('td',      fontSize=8,  fontName='Helvetica',      textColor=TEXT)
        s_td_r    = style('td_r',    fontSize=8,  fontName='Helvetica',      textColor=TEXT,  alignment=TA_RIGHT)
        s_td_bold = style('td_bold', fontSize=8,  fontName='Helvetica-Bold', textColor=TEXT,  alignment=TA_RIGHT)

        CATEGORY_LABELS = {'materials': 'Materiales', 'labor': 'Mano de obra', 'equipment': 'Equipos', 'other': 'Otros'}
        CATEGORY_COLORS = {'materials': CAT_MAT, 'labor': CAT_LAB, 'equipment': CAT_EQP, 'other': CAT_OTH}
        UNIT_MAP = {'unit': 'Unidad', 'm2': 'm²', 'm3': 'm³', 'ml': 'Metro lineal', 'kg': 'Kilogramo', 'lb': 'Libra', 'ton': 'Tonelada', 'l': 'Litro', 'bag': 'Saco', 'roll': 'Rollo', 'box': 'Caja', 'gal': 'Galón'}

        def resolve_unit(item):
            if item.product_id and item.product:
                return item.product.get_unit_display()
            return UNIT_MAP.get(item.unit, item.unit) or '—'

        # ── Document ──────────────────────────────────────────────────────────
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=1.8*cm, rightMargin=1.8*cm,
            topMargin=2*cm, bottomMargin=2*cm,
        )

        story = []

        # ── Header ────────────────────────────────────────────────────────────
        header_left = [Paragraph(company_name, s_company)]
        if company_tagline:
            header_left.append(Paragraph(company_tagline, s_tagline))

        header_right = [
            Paragraph(quote.quote_number,
                      style('qn', fontSize=12, fontName='Helvetica-Bold', textColor=ORANGE, alignment=TA_RIGHT)),
            Paragraph(f'Rev. {quote.revision}  ·  {fmt_date(quote.created_at)}',
                      style('rev', fontSize=8, fontName='Helvetica', textColor=MUTED, alignment=TA_RIGHT, spaceBefore=3)),
            Spacer(1, 6),
            Paragraph(f'<b>Para:</b> {project.client.name}',
                      style('cli', fontSize=9, fontName='Helvetica', textColor=TEXT, alignment=TA_RIGHT)),
            Paragraph(project.name,
                      style('proj', fontSize=8, fontName='Helvetica', textColor=TEXT_MED, alignment=TA_RIGHT)),
        ]

        header_tbl = Table([[header_left, header_right]], colWidths=['55%', '45%'])
        header_tbl.setStyle(TableStyle([
            ('VALIGN',       (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING',  (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(header_tbl)
        story.append(HRFlowable(width='100%', thickness=1.5, color=ORANGE, spaceAfter=14, spaceBefore=12))

        # ── Line items ────────────────────────────────────────────────────────
        th_row = [
            Paragraph('CATEGORÍA',  s_th),
            Paragraph('DESCRIPCIÓN', s_th),
            Paragraph('CANT.',  s_th),
            Paragraph('UNID.',  s_th),
            Paragraph('P.UNIT.', s_th),
            Paragraph('SUBTOTAL', s_th),
        ]
        rows = [th_row]
        for item in quote.line_items.order_by('order'):
            cat_label = CATEGORY_LABELS.get(item.category, item.category)
            cat_color = CATEGORY_COLORS.get(item.category, CAT_OTH)
            subtotal  = float(item.quantity * item.unit_price)
            unit_str  = resolve_unit(item)
            # Quantity: strip trailing zeros for display
            qty_str   = f'{float(item.quantity):g}'
            rows.append([
                Paragraph(cat_label, style(f'cat_{item.category}', fontSize=8, fontName='Helvetica-Bold', textColor=cat_color)),
                Paragraph(item.description, s_td),
                Paragraph(qty_str,           s_td_r),
                Paragraph(unit_str,          s_td),
                Paragraph(f'Q {float(item.unit_price):,.2f}', s_td_r),
                Paragraph(f'Q {subtotal:,.2f}', s_td_bold),
            ])

        col_widths = [2.8*cm, 7.0*cm, 1.3*cm, 1.5*cm, 2.3*cm, 2.3*cm]
        items_tbl = Table(rows, colWidths=col_widths, repeatRows=1)
        items_tbl.setStyle(TableStyle([
            ('BACKGROUND',    (0,0), (-1,0), DARK_BG),
            ('ROWBACKGROUNDS',(0,1), (-1,-1), [WHITE, colors.HexColor('#F7F8FA')]),
            ('LINEBELOW',     (0,0), (-1,-2), 0.3, colors.HexColor('#E5E7EB')),
            ('LINEBEFORE',    (0,0), (0,-1), 0.3, colors.HexColor('#E5E7EB')),
            ('LINEAFTER',     (-1,0),(-1,-1), 0.3, colors.HexColor('#E5E7EB')),
            ('LINEBELOW',     (0,-1),(-1,-1), 0.3, colors.HexColor('#E5E7EB')),
            ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING',    (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING',   (0,0), (-1,-1), 7),
            ('RIGHTPADDING',  (0,0), (-1,-1), 7),
        ]))
        story.append(items_tbl)
        story.append(Spacer(1, 10))

        # ── Totals (right-aligned compact block) ──────────────────────────────
        subtotal_val  = sum(float(i.quantity * i.unit_price) for i in quote.line_items.all())
        discount_val  = subtotal_val * float(quote.discount_pct) / 100
        after_disc    = subtotal_val - discount_val
        tax_val       = after_disc * float(quote.tax_pct) / 100
        total_val     = after_disc + tax_val

        s_tl = style('tl', fontSize=8,  fontName='Helvetica',      textColor=TEXT_MED, alignment=TA_RIGHT)
        s_tv = style('tv', fontSize=8,  fontName='Helvetica',      textColor=TEXT,     alignment=TA_RIGHT)
        s_TL = style('TL', fontSize=10, fontName='Helvetica-Bold', textColor=TEXT,     alignment=TA_RIGHT)
        s_TV = style('TV', fontSize=11, fontName='Helvetica-Bold', textColor=ORANGE,   alignment=TA_RIGHT)

        tot_rows = [[Paragraph('Subtotal', s_tl), Paragraph(f'Q {subtotal_val:,.2f}', s_tv)]]
        if discount_val > 0:
            tot_rows.append([
                Paragraph(f'Descuento ({fmt_pct(quote.discount_pct)})', s_tl),
                Paragraph(f'−Q {discount_val:,.2f}', s_tv),
            ])
        tot_rows.append([
            Paragraph(f'IVA ({fmt_pct(quote.tax_pct)})', s_tl),
            Paragraph(f'Q {tax_val:,.2f}', s_tv),
        ])
        tot_rows.append([Paragraph('TOTAL', s_TL), Paragraph(f'Q {total_val:,.2f}', s_TV)])

        tot_tbl = Table(tot_rows, colWidths=[3.8*cm, 3.0*cm])
        tot_tbl.setStyle(TableStyle([
            ('TOPPADDING',    (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING',   (0,0), (-1,-1), 4),
            ('RIGHTPADDING',  (0,0), (-1,-1), 4),
            ('LINEABOVE',     (0, len(tot_rows)-1), (-1, len(tot_rows)-1), 1, ORANGE),
            ('TOPPADDING',    (0, len(tot_rows)-1), (-1, len(tot_rows)-1), 6),
        ]))

        # Wrap totals table in a right-aligned outer table
        page_w = A4[0] - 1.8*cm*2
        wrapper = Table([[Paragraph(''), tot_tbl]], colWidths=[page_w - 6.8*cm, 6.8*cm])
        wrapper.setStyle(TableStyle([
            ('LEFTPADDING',  (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING',   (0,0), (-1,-1), 0),
            ('BOTTOMPADDING',(0,0), (-1,-1), 0),
            ('VALIGN',       (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(wrapper)

        # ── Notes & validity ─────────────────────────────────────────────────
        if quote.notes or quote.valid_until:
            story.append(Spacer(1, 16))
            story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#E5E7EB'), spaceAfter=10))

        if quote.notes:
            story.append(Paragraph('Notas y condiciones', s_h2))
            story.append(Paragraph(quote.notes.replace('\n', '<br/>'), s_note))

        if quote.valid_until:
            story.append(Spacer(1, 8))
            story.append(Paragraph(
                f'Cotización válida hasta: <b>{fmt_date(quote.valid_until)}</b>',
                style('vu', fontSize=8, fontName='Helvetica', textColor=MUTED),
            ))

        doc.build(story)
        buffer.seek(0)

        filename = f'{quote.quote_number}.pdf'
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response
