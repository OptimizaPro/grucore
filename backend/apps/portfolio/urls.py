from django.urls import path
from .views import PortfolioProjectListView, PortfolioProjectDetailView

urlpatterns = [
    path('',         PortfolioProjectListView.as_view(),  name='portfolio-list'),
    path('<slug:slug>/', PortfolioProjectDetailView.as_view(), name='portfolio-detail'),
]
