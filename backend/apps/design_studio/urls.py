from django.urls import path

from .views import (
    AvailableModelsView,
    GenerateView,
    SessionListView,
    SessionDetailView,
)

urlpatterns = [
    path('models/',             AvailableModelsView.as_view(), name='design-studio-models'),
    path('generate/',           GenerateView.as_view(),        name='design-studio-generate'),
    path('sessions/',           SessionListView.as_view(),     name='design-studio-sessions'),
    path('sessions/<int:pk>/',  SessionDetailView.as_view(),   name='design-studio-session-detail'),
]
