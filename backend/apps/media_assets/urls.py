from django.urls import path
from .views import MediaAssetListView, MediaAssetDetailView, MediaAssetUploadView

urlpatterns = [
    path('',          MediaAssetListView.as_view(),   name='media-asset-list'),
    path('upload/',   MediaAssetUploadView.as_view(), name='media-asset-upload'),
    path('<int:pk>/', MediaAssetDetailView.as_view(), name='media-asset-detail'),
]
