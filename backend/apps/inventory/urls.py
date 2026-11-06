from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.InventoryCategoryListCreateView.as_view()),
    path('categories/<int:pk>/', views.InventoryCategoryDetailView.as_view()),

    # Specific product routes before <int:pk>
    path('products/import/template/', views.ProductImportTemplateView.as_view()),
    path('products/import/preview/', views.ProductImportPreviewView.as_view()),
    path('products/import/confirm/', views.ProductImportConfirmView.as_view()),
    path('products/bulk-delete/', views.ProductBulkDeleteView.as_view()),
    path('products/', views.ProductListCreateView.as_view()),
    path('products/<int:pk>/', views.ProductDetailView.as_view()),

    path('movements/', views.StockMovementListCreateView.as_view()),
    path('movements/<int:pk>/', views.StockMovementDetailView.as_view()),
]
