from django.urls import path
from . import views
from .views import ProjectTaskListCreateView, ProjectTaskDetailView, ProjectContactListCreateView, ProjectContactDetailView, upload_contact_avatar, upload_client_avatar, ProjectNoteListCreateView, ProjectNoteDetailView, QuoteListCreateView, QuoteDetailView, QuoteSendView, QuoteApproveView, QuoteRequestChangesView, QuoteRejectView, QuoteTemplateListCreateView, QuoteTemplateDetailView, QuotePDFView

urlpatterns = [
    # Clientes
    path('clients/',                       views.ClientListCreateView.as_view(), name='client-list'),
    path('clients/<int:pk>/',              views.ClientDetailView.as_view(),     name='client-detail'),
    path('clients/<int:pk>/avatar/',       upload_client_avatar,                 name='client-avatar'),

    # Proyectos
    path('',                           views.ProjectListCreateView.as_view(), name='project-list'),
    path('<int:pk>/',                  views.ProjectDetailView.as_view(),     name='project-detail'),
    path('<int:project_pk>/cover/',    views.upload_project_cover,            name='project-cover'),

    # Fases
    path('<int:project_pk>/phases/',
         views.PhaseListCreateView.as_view(), name='phase-list'),

    # Tareas
    path('<int:project_pk>/phases/<int:phase_pk>/tasks/',
         views.TaskListCreateView.as_view(), name='task-list'),
    path('<int:project_pk>/phases/<int:phase_pk>/tasks/<int:pk>/',
         views.TaskDetailView.as_view(), name='task-detail'),

    # Tareas (flat, por proyecto)
    path('<int:project_pk>/tasks/',
         ProjectTaskListCreateView.as_view(), name='project-task-list'),
    path('<int:project_pk>/tasks/<int:pk>/',
         ProjectTaskDetailView.as_view(), name='project-task-detail'),

    # Bitácora de progreso
    path('<int:project_pk>/progress/',
         views.ProgressUpdateListCreateView.as_view(), name='progress-list'),

    # Hitos de pago
    path('<int:project_pk>/milestones/',
         views.MilestoneListCreateView.as_view(), name='milestone-list'),
    path('<int:project_pk>/milestones/<int:pk>/',
         views.MilestoneDetailView.as_view(), name='milestone-detail'),

    # Acciones de hito
    path('<int:project_pk>/milestones/<int:milestone_pk>/approve/',
         views.MilestoneApproveView.as_view(), name='milestone-approve'),
    path('<int:project_pk>/milestones/<int:milestone_pk>/evidence/',
         views.MilestoneEvidenceCreateView.as_view(), name='milestone-evidence'),
    path('<int:project_pk>/milestones/<int:milestone_pk>/mark_paid/',
         views.MilestoneMarkPaidView.as_view(), name='milestone-mark-paid'),

    # Contactos del proyecto
    path('<int:project_pk>/contacts/',
         ProjectContactListCreateView.as_view(), name='project-contact-list'),
    path('<int:project_pk>/contacts/<int:pk>/',
         ProjectContactDetailView.as_view(), name='project-contact-detail'),
    path('<int:project_pk>/contacts/<int:pk>/avatar/',
         upload_contact_avatar, name='project-contact-avatar'),

    # Notas internas
    path('<int:project_pk>/notes/',
         ProjectNoteListCreateView.as_view(), name='project-note-list'),
    path('<int:project_pk>/notes/<int:pk>/',
         ProjectNoteDetailView.as_view(), name='project-note-detail'),

    # Cotizaciones
    path('<int:project_pk>/quotes/',
         QuoteListCreateView.as_view(), name='quote-list'),
    path('<int:project_pk>/quotes/<int:pk>/',
         QuoteDetailView.as_view(), name='quote-detail'),
    path('<int:project_pk>/quotes/<int:pk>/send/',
         QuoteSendView.as_view(), name='quote-send'),
    path('<int:project_pk>/quotes/<int:pk>/approve/',
         QuoteApproveView.as_view(), name='quote-approve'),
    path('<int:project_pk>/quotes/<int:pk>/request_changes/',
         QuoteRequestChangesView.as_view(), name='quote-request-changes'),
    path('<int:project_pk>/quotes/<int:pk>/reject/',
         QuoteRejectView.as_view(), name='quote-reject'),

    # Plantillas de cotización
    path('quote-templates/',
         QuoteTemplateListCreateView.as_view(), name='quote-template-list'),
    path('quote-templates/<int:pk>/',
         QuoteTemplateDetailView.as_view(), name='quote-template-detail'),

    # PDF de cotización
    path('<int:project_pk>/quotes/<int:pk>/pdf/',
         QuotePDFView.as_view(), name='quote-pdf'),
]
