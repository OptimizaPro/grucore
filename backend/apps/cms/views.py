from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Page
from .serializers import PageSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def page_detail(request, slug):
    """
    GET /api/cms/pages/{slug}/
    Query param: ?lang=es (default) | ?lang=en
    """
    lang = request.query_params.get('lang', 'es')
    if lang not in ('es', 'en'):
        lang = 'es'

    try:
        page = Page.objects.prefetch_related(
            'sections', 'sections__blocks'
        ).get(slug=slug, is_published=True)
    except Page.DoesNotExist:
        return Response({'detail': 'Página no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PageSerializer(page, context={'lang': lang, 'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def page_list(request):
    """
    GET /api/cms/pages/
    Devuelve slugs de todas las páginas publicadas.
    """
    pages = Page.objects.filter(is_published=True).values('slug', 'title_es', 'title_en', 'updated_at')
    return Response(list(pages))
