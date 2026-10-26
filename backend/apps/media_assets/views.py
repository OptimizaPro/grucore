from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

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
