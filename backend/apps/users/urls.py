from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListCreateView.as_view(), name='user-list'),
    path('me/', views.me, name='user-me'),
    path('me/avatar/', views.upload_avatar, name='user-me-avatar'),
    path('me/change-password/', views.change_password, name='user-change-password'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]
