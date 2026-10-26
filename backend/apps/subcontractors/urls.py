from django.urls import path
from . import views

urlpatterns = [
    # Contratos de subcontratistas
    path('contracts/',                                          views.SubcontractorContractListCreateView.as_view(),      name='sc-list'),
    path('contracts/<int:pk>/',                                 views.SubcontractorContractDetailView.as_view(),           name='sc-detail'),

    # Certificaciones (anidadas bajo contrato)
    path('contracts/<int:contract_pk>/certifications/',         views.SubcontractorCertificationListCreateView.as_view(),  name='sc-cert-list'),
    path('contracts/<int:contract_pk>/certifications/<int:pk>/', views.SubcontractorCertificationDetailView.as_view(),    name='sc-cert-detail'),
    path('contracts/<int:contract_pk>/certifications/<int:pk>/approve/', views.SubcontractorCertificationApproveView.as_view(), name='sc-cert-approve'),

    # Liberaciones de retención
    path('retentions/',          views.SubcontractorRetentionReleaseListCreateView.as_view(), name='retention-list'),
    path('retentions/<int:pk>/', views.SubcontractorRetentionReleaseDetailView.as_view(),     name='retention-detail'),
    path('retentions/<int:pk>/post/', views.SubcontractorRetentionReleasePostView.as_view(),  name='retention-post'),
]
