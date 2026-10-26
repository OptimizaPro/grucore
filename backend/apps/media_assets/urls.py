from django.urls import path
from .views import MediaAssetListView, MediaAssetDetailView

urlpatterns = [
    path('',      MediaAssetListView.as_view(),   name='media-asset-list'),
    path('<int:pk>/', MediaAssetDetailView.as_view(), name='media-asset-detail'),
]
