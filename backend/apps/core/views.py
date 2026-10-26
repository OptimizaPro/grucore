from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from django.db import connection

from .models import CompanySettings
from .serializers import CompanySettingsSerializer

BRAND_ROLES = ('admin', 'project_manager')


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    db_ok = False
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        pass

    return Response({
        'status': 'ok' if db_ok else 'degraded',
        'timestamp': timezone.now().isoformat(),
        'database': 'connected' if db_ok else 'unavailable',
        'version': '0.1.0',
    })


# ─── Company Settings ─────────────────────────────────────────────────────────

class CompanySettingsView(APIView):
    """
    GET  /api/settings/company/  — público, sin autenticación.
    PATCH /api/settings/company/ — solo admin / project_manager.
    """

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        settings = CompanySettings.get()
        return Response(CompanySettingsSerializer(settings, context={'request': request}).data)

    def patch(self, request):
        if request.user.role not in BRAND_ROLES:
            raise PermissionDenied('Solo administradores pueden modificar la configuración de empresa.')
        settings = CompanySettings.get()
        serializer = CompanySettingsSerializer(
            settings, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_company_logo(request, variant):
    """
    POST /api/settings/company/logo/        — logo fondo oscuro
    POST /api/settings/company/logo-light/  — logo fondo claro
    """
    if request.user.role not in BRAND_ROLES:
        raise PermissionDenied('Solo administradores pueden subir el logo.')

    field_name = 'logo' if variant == 'dark' else 'logo_light'
    file_key   = 'logo'

    if file_key not in request.FILES:
        return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)

    file = request.FILES[file_key]
    if not file.content_type.startswith('image/'):
        return Response({'detail': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
    if file.size > 5 * 1024 * 1024:
        return Response({'detail': 'El archivo no puede superar 5 MB.'}, status=status.HTTP_400_BAD_REQUEST)

    settings = CompanySettings.get()
    setattr(settings, field_name, file)
    settings.save(update_fields=[field_name, 'updated_at'])

    return Response(CompanySettingsSerializer(settings, context={'request': request}).data)
