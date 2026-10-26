from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from apps.users.views import EmailTokenObtainView

api_v1_patterns = [
    # Auth — login por email
    path('auth/token/', EmailTokenObtainView.as_view(), name='token_obtain'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    # Apps
    path('', include('apps.core.urls')),
    path('users/', include('apps.users.urls')),
    path('projects/', include('apps.projects.urls')),
    path('projects/', include('apps.documents.urls')),
    path('projects/', include('apps.change_orders.urls')),
    path('projects/', include('apps.financials.urls')),
    path('projects/', include('apps.communications.urls')),
    path('', include('apps.communications.urls')),        # /api/notifications/ paths
    path('inventory/',      include('apps.inventory.urls')),
    path('suppliers/',      include('apps.suppliers.urls')),
    path('cms/',            include('apps.cms.urls')),
    path('workers/',        include('apps.workers.urls')),
    path('crm/',            include('apps.crm.urls')),
    path('purchasing/',     include('apps.purchasing.urls')),
    path('assets/',         include('apps.assets.urls')),
    path('subcontractors/', include('apps.subcontractors.urls')),
    path('ledger/',         include('apps.ledger.urls')),
    path('media-assets/',   include('apps.media_assets.urls')),
    path('portfolio/',      include('apps.portfolio.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_v1_patterns)),

    # ── API Docs ──────────────────────────────────────────────────────────────
    path('api/schema/',         SpectacularAPIView.as_view(),       name='schema'),
    path('api/docs/',           SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',          SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

# Servir media: filesystem local (dev) o Railway Volume (producción)
# Cuando USE_S3=True los archivos los sirve Supabase CDN directamente
if not getattr(settings, 'USE_S3', False):
    urlpatterns += [
        re_path(r'^media/(?P<path>.+)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
