from django.urls import path
from . import views

urlpatterns = [
    path('pages/',         views.page_list,   name='cms-page-list'),
    path('pages/<slug:slug>/', views.page_detail, name='cms-page-detail'),
]
