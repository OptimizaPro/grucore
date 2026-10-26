from django.urls import path
from . import views

urlpatterns = [
    # Categorías
    path('categories/',          views.AssetCategoryListCreateView.as_view(), name='asset-category-list'),
    path('categories/<int:pk>/', views.AssetCategoryDetailView.as_view(),     name='asset-category-detail'),

    # Activos fijos
    path('',                     views.FixedAssetListCreateView.as_view(),  name='asset-list'),
    path('<int:pk>/',            views.FixedAssetDetailView.as_view(),      name='asset-detail'),

    # Depreciaciones por activo (lectura)
    path('<int:asset_pk>/depreciation/',          views.AssetDepreciationEntryListView.as_view(),   name='asset-depreciation-list'),
    path('<int:asset_pk>/depreciation/<int:pk>/', views.AssetDepreciationEntryDetailView.as_view(), name='asset-depreciation-detail'),

    # Registros de uso por activo
    path('<int:asset_pk>/usage/',          views.EquipmentUsageLogListCreateView.as_view(), name='asset-usage-list'),
    path('<int:asset_pk>/usage/<int:pk>/', views.EquipmentUsageLogDetailView.as_view(),     name='asset-usage-detail'),

    # Registros de uso (global — filtrar por ?project= o ?asset=)
    path('usage/',          views.EquipmentUsageLogListCreateView.as_view(), name='usage-list'),
    path('usage/<int:pk>/', views.EquipmentUsageLogDetailView.as_view(),     name='usage-detail'),
]
