from django.urls import path
from . import views

urlpatterns = [
    # Notifications (no project_pk prefix — included under '' in grucore/urls.py)
    path('notifications/', views.NotificationListView.as_view()),
    path('notifications/read-all/', views.NotificationMarkAllReadView.as_view()),
    path('notifications/<int:pk>/read/', views.NotificationMarkReadView.as_view()),
    # Project messages (project-nested — included under 'projects/' in grucore/urls.py)
    path('<int:project_pk>/messages/', views.ProjectMessageListCreateView.as_view()),
    path('<int:project_pk>/messages/<int:pk>/', views.ProjectMessageDetailView.as_view()),
]
