from django.urls import path
from . import views

urlpatterns = [
    path('<int:project_pk>/change-orders/', views.ChangeOrderListCreateView.as_view()),
    path('<int:project_pk>/change-orders/<int:pk>/', views.ChangeOrderDetailView.as_view()),
    path('<int:project_pk>/change-orders/<int:co_pk>/approve/', views.ChangeOrderApproveView.as_view()),
    path('<int:project_pk>/change-orders/<int:co_pk>/reject/', views.ChangeOrderRejectView.as_view()),
    path('<int:project_pk>/change-orders/<int:co_pk>/submit/', views.ChangeOrderSubmitView.as_view()),
]
