from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import MediaAsset
from .serializers import MediaAssetSerializer


class MediaAssetListView(ListAPIView):
    """GET /api/media-assets/ — lista pública de activos multimedia."""
    queryset           = MediaAsset.objects.all()
    serializer_class   = MediaAssetSerializer
    permission_classes = [AllowAny]


class MediaAssetDetailView(RetrieveAPIView):
    """GET /api/media-assets/<id>/ — detalle de un activo."""
    queryset           = MediaAsset.objects.all()
    serializer_class   = MediaAssetSerializer
    permission_classes = [AllowAny]


class MediaAssetUploadView(APIView):
    """
    POST /api/media-assets/upload/
    Sube una imagen y crea un MediaAsset. Requiere staff.
    Body: multipart/form-data con campos:
      - file (obligatorio): archivo de imagen
      - name (opcional): nombre descriptivo
      - context (opcional): contexto de uso
      - alt_es / alt_en (opcional): textos alternativos
    """
    permission_classes = [IsAdminUser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'detail': 'No se proporcionó ningún archivo.'}, status=status.HTTP_400_BAD_REQUEST)
        if not file.content_type.startswith('image/'):
            return Response({'detail': 'El archivo debe ser una imagen.'}, status=status.HTTP_400_BAD_REQUEST)
        if file.size > 15 * 1024 * 1024:
            return Response({'detail': 'El archivo no puede superar 15 MB.'}, status=status.HTTP_400_BAD_REQUEST)

        asset = MediaAsset(
            name=request.data.get('name', '') or file.name,
            context=request.data.get('context', ''),
            alt_es=request.data.get('alt_es', ''),
            alt_en=request.data.get('alt_en', ''),
            uploaded_by=request.user,
        )
        asset.file.save(file.name, file, save=True)
        return Response(MediaAssetSerializer(asset).data, status=status.HTTP_201_CREATED)
