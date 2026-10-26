from django.urls import path
from . import views

urlpatterns = [
    path('<int:project_pk>/expenses/', views.ExpenseListCreateView.as_view()),
    path('<int:project_pk>/expenses/<int:pk>/', views.ExpenseDetailView.as_view()),
    path('<int:project_pk>/expenses/<int:expense_pk>/approve/', views.ExpenseApproveView.as_view()),
    path('<int:project_pk>/invoices/', views.InvoiceListCreateView.as_view()),
    path('<int:project_pk>/invoices/<int:pk>/', views.InvoiceDetailView.as_view()),
    path('<int:project_pk>/invoices/<int:invoice_pk>/mark-paid/', views.InvoiceMarkPaidView.as_view()),
]
