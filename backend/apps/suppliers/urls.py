from django.urls import path
from . import views

urlpatterns = [
    path('', views.SupplierListCreateView.as_view()),
    path('<int:pk>/', views.SupplierDetailView.as_view()),
]
