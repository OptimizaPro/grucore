from django.urls import path
from . import views

urlpatterns = [
    path('<int:project_pk>/documents/', views.DocumentListCreateView.as_view()),
    path('<int:project_pk>/documents/<int:pk>/', views.DocumentDetailView.as_view()),
    path('<int:project_pk>/rfis/', views.RFIListCreateView.as_view()),
    path('<int:project_pk>/rfis/<int:pk>/', views.RFIDetailView.as_view()),
    path('<int:project_pk>/rfis/<int:rfi_pk>/answer/', views.RFIAnswerView.as_view()),
    path('<int:project_pk>/submittals/', views.SubmittalListCreateView.as_view()),
    path('<int:project_pk>/submittals/<int:pk>/', views.SubmittalDetailView.as_view()),
    path('<int:project_pk>/submittals/<int:submittal_pk>/review/', views.SubmittalReviewView.as_view()),
    path('<int:project_pk>/punchitems/', views.PunchItemListCreateView.as_view()),
    path('<int:project_pk>/punchitems/<int:pk>/', views.PunchItemDetailView.as_view()),
    path('<int:project_pk>/punchitems/<int:item_pk>/resolve/', views.PunchItemResolveView.as_view()),
]
