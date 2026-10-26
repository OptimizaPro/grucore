from django.urls import path
from . import views

urlpatterns = [
    # Workers
    path('',                               views.WorkerListCreateView.as_view(),  name='worker-list'),
    path('<int:pk>/',                      views.WorkerDetailView.as_view(),      name='worker-detail'),
    path('<int:pk>/avatar/',               views.upload_worker_avatar,            name='worker-avatar'),

    # Work logs nested under worker
    path('<int:worker_pk>/logs/',          views.WorkLogListCreateView.as_view(), name='worker-log-list'),
    path('<int:worker_pk>/logs/<int:pk>/', views.WorkLogDetailView.as_view(),     name='worker-log-detail'),

    # Batch labor-cost posting
    path('worklogs/post-batch/',           views.WorkLogPostBatchView.as_view(),  name='worklog-post-batch'),
]
