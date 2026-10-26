from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.InventoryCategoryListCreateView.as_view()),
    path('categories/<int:pk>/', views.InventoryCategoryDetailView.as_view()),
    path('products/', views.ProductListCreateView.as_view()),
    path('products/<int:pk>/', views.ProductDetailView.as_view()),
    path('movements/', views.StockMovementListCreateView.as_view()),
    path('movements/<int:pk>/', views.StockMovementDetailView.as_view()),
]
