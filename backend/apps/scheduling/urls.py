from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    EventCancelView,
    EventCompleteView,
    EventClientApproveView,
    EventClientRejectView,
    UpcomingEventsView,
)

urlpatterns = [
    path('events/',                          EventListCreateView.as_view(),   name='event-list-create'),
    path('events/upcoming/',                 UpcomingEventsView.as_view(),    name='event-upcoming'),
    path('events/<int:pk>/',                 EventDetailView.as_view(),       name='event-detail'),
    path('events/<int:pk>/cancel/',          EventCancelView.as_view(),       name='event-cancel'),
    path('events/<int:pk>/complete/',        EventCompleteView.as_view(),     name='event-complete'),
    path('events/<int:pk>/client-approve/',  EventClientApproveView.as_view(), name='event-client-approve'),
    path('events/<int:pk>/client-reject/',   EventClientRejectView.as_view(),  name='event-client-reject'),
]
