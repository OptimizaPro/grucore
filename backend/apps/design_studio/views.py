import os
import uuid
from pathlib import Path

from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DesignSession, SessionStatus, ModelKey
from .serializers import DesignSessionSerializer, AvailableModelSerializer
from .tasks import generate_renders_task


# ─── Available models endpoint ────────────────────────────────────────────────

_AVAILABLE_MODELS = [
    {
        'key':         ModelKey.FLUX_SCHNELL_HF,
        'label':       'FLUX.1-schnell — HuggingFace',
        'is_free':     True,
        'description': 'Modelo gratuito, ideal para testing. Requiere HUGGINGFACE_API_TOKEN.',
    },
    {
        'key':         ModelKey.DALLE3_OPENAI,
        'label':       'DALL·E 3 — OpenAI',
        'is_free':     False,
        'description': 'Alta calidad general. Requiere OPENAI_API_KEY.',
    },
    {
        'key':         ModelKey.FLUX_PRO_FAL,
        'label':       'FLUX.1-pro — fal.ai',
        'is_free':     False,
        'description': 'Máxima calidad para renders arquitectónicos profesionales. Requiere FAL_API_KEY.',
    },
]


class AvailableModelsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = AvailableModelSerializer(_AVAILABLE_MODELS, many=True)
        return Response(serializer.data)


# ─── Generate ─────────────────────────────────────────────────────────────────

class GenerateView(APIView):
    """
    POST /api/design-studio/generate/

    Accepts multipart/form-data:
      - session_type, style, project_type, model_key  (required)
      - floors, extra_description, lead               (optional)
      - images[]                                      (files — required for remodel, optional for new_construction)

    Returns the new DesignSession immediately with status='pending'.
    The frontend polls GET /sessions/{id}/ until status='completed'.
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        data = request.data

        # ── Validate required fields ──────────────────────────────────────────
        required = ['session_type', 'style', 'project_type', 'model_key']
        missing  = [f for f in required if not data.get(f)]
        if missing:
            return Response(
                {'detail': f'Campos requeridos: {", ".join(missing)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Save input images ─────────────────────────────────────────────────
        input_images = []
        uploaded_files = request.FILES.getlist('images')
        if uploaded_files:
            save_dir = Path(settings.MEDIA_ROOT) / 'design_studio' / 'input'
            save_dir.mkdir(parents=True, exist_ok=True)
            for f in uploaded_files:
                ext      = Path(f.name).suffix or '.jpg'
                filename = f'{uuid.uuid4()}{ext}'
                dest     = save_dir / filename
                with open(dest, 'wb') as out:
                    for chunk in f.chunks():
                        out.write(chunk)
                input_images.append(f'design_studio/input/{filename}')

        # ── Resolve optional lead ─────────────────────────────────────────────
        lead_id = data.get('lead')
        lead    = None
        if lead_id:
            from apps.crm.models import Lead
            try:
                lead = Lead.objects.get(pk=lead_id)
            except Lead.DoesNotExist:
                pass

        # ── Create session ────────────────────────────────────────────────────
        session = DesignSession.objects.create(
            user              = request.user,
            lead              = lead,
            session_type      = data.get('session_type'),
            style             = data.get('style'),
            project_type      = data.get('project_type'),
            floors            = data.get('floors') or None,
            extra_description = data.get('extra_description', ''),
            model_key         = data.get('model_key', ModelKey.FLUX_SCHNELL_HF),
            input_images      = input_images,
            status            = SessionStatus.PENDING,
        )

        # ── Dispatch Celery task ──────────────────────────────────────────────
        generate_renders_task.delay(session.id)

        serializer = DesignSessionSerializer(session, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─── Session list & detail ────────────────────────────────────────────────────

class SessionListView(generics.ListAPIView):
    serializer_class   = DesignSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            DesignSession.objects
            .filter(user=self.request.user)
            .select_related('lead')
            .order_by('-created_at')
        )


class SessionDetailView(generics.RetrieveAPIView):
    serializer_class   = DesignSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return DesignSession.objects.filter(user=self.request.user)
