from django.urls import path

from .views import (
    PipelineListCreateView,
    PipelineDetailView,
    StageListCreateView,
    StageReorderView,
    StageDetailView,
    LeadListCreateView,
    LeadDetailView,
    LeadMoveView,
    LeadConvertView,
    LeadActivityListCreateView,
    WidgetLeadView,
)

urlpatterns = [
    # Pipelines
    path('pipelines/',                                       PipelineListCreateView.as_view(),    name='pipeline-list-create'),
    path('pipelines/<int:pk>/',                              PipelineDetailView.as_view(),         name='pipeline-detail'),

    # Stages (nested under pipeline)
    path('pipelines/<int:pipeline_pk>/stages/',              StageListCreateView.as_view(),        name='stage-list-create'),
    path('pipelines/<int:pipeline_pk>/stages/reorder/',      StageReorderView.as_view(),           name='stage-reorder'),
    path('pipelines/<int:pipeline_pk>/stages/<int:pk>/',     StageDetailView.as_view(),            name='stage-detail'),

    # Leads
    path('leads/',                                           LeadListCreateView.as_view(),         name='lead-list-create'),
    path('leads/<int:pk>/',                                  LeadDetailView.as_view(),             name='lead-detail'),
    path('leads/<int:pk>/move/',                             LeadMoveView.as_view(),               name='lead-move'),
    path('leads/<int:pk>/convert/',                          LeadConvertView.as_view(),            name='lead-convert'),

    # Activities (nested under lead)
    path('leads/<int:lead_pk>/activities/',                  LeadActivityListCreateView.as_view(), name='lead-activity-list-create'),

    # Public widget endpoint
    path('widget/',                                          WidgetLeadView.as_view(),             name='widget-lead'),
]
