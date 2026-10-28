from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Page, MarqueeItem, ServicePage
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
def marquee_list(request):
    """
    GET /api/cms/marquee/?lang=es
    Devuelve los elementos activos del ticker de servicios.
    """
    lang  = request.query_params.get('lang', 'es')
    items = MarqueeItem.objects.filter(is_active=True).values('id', 'title_es', 'title_en', 'order')
    data  = [
        {'id': i['id'], 'title': i[f'title_{lang}'] or i['title_es'], 'order': i['order']}
        for i in items
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def service_images(request, slug):
    """
    GET /api/cms/services/{slug}/
    Devuelve las URLs de cover, before y after para un servicio.
    Retorna null en los campos no configurados (el frontend usa su fallback).
    """
    try:
        svc = ServicePage.objects.select_related(
            'cover_image', 'before_image', 'after_image'
        ).get(slug=slug)
    except ServicePage.DoesNotExist:
        return Response({'cover': None, 'before': None, 'after': None})

    def url(asset):
        return asset.url if asset else None

    return Response({
        'cover':  url(svc.cover_image),
        'before': url(svc.before_image),
        'after':  url(svc.after_image),
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def page_list(request):
    """
    GET /api/cms/pages/
    Devuelve slugs de todas las páginas publicadas.
    """
    pages = Page.objects.filter(is_published=True).values('slug', 'title_es', 'title_en', 'updated_at')
    return Response(list(pages))
