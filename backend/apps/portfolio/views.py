from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import PortfolioProject
from .serializers import PortfolioProjectListSerializer, PortfolioProjectDetailSerializer


class PortfolioProjectListView(ListAPIView):
    """GET /api/portfolio/ — proyectos publicados."""
    serializer_class   = PortfolioProjectListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = PortfolioProject.objects.filter(
            status=PortfolioProject.Status.PUBLISHED,
        ).select_related('cover_image')

        project_type = self.request.query_params.get('type')
        if project_type:
            qs = qs.filter(project_type=project_type)

        featured = self.request.query_params.get('featured')
        if featured == 'true':
            qs = qs.filter(featured=True)

        return qs


class PortfolioProjectDetailView(RetrieveAPIView):
    """GET /api/portfolio/<slug>/ — detalle de un proyecto."""
    serializer_class   = PortfolioProjectDetailSerializer
    permission_classes = [AllowAny]
    lookup_field       = 'slug'

    def get_queryset(self):
        return PortfolioProject.objects.filter(
            status=PortfolioProject.Status.PUBLISHED,
        ).select_related('cover_image').prefetch_related('gallery_images__asset')
