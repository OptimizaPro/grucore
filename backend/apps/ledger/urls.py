from django.urls import path
from . import views

urlpatterns = [
    # Períodos contables
    path('periods/',          views.AccountingPeriodListCreateView.as_view(), name='period-list'),
    path('periods/<int:pk>/', views.AccountingPeriodDetailView.as_view(),     name='period-detail'),

    # Catálogo de cuentas (lectura)
    path('accounts/',          views.AccountListView.as_view(),   name='account-list'),
    path('accounts/<int:pk>/', views.AccountDetailView.as_view(), name='account-detail'),

    # Asientos contables
    path('journal/',                     views.JournalEntryListCreateView.as_view(), name='journal-list'),
    path('journal/<int:pk>/',            views.JournalEntryDetailView.as_view(),     name='journal-detail'),
    path('journal/<int:pk>/post/',       views.JournalEntryPostView.as_view(),       name='journal-post'),

    # Reglas fiscales
    path('tax-rules/',          views.TaxRuleListCreateView.as_view(), name='tax-rule-list'),
    path('tax-rules/<int:pk>/', views.TaxRuleDetailView.as_view(),     name='tax-rule-detail'),

    # Mapeos de cuentas
    path('account-mappings/',          views.AccountMappingListView.as_view(),   name='account-mapping-list'),
    path('account-mappings/<int:pk>/', views.AccountMappingUpdateView.as_view(), name='account-mapping-detail'),

    # P&L
    path('pnl/company/',                   views.CompanyPnLView.as_view(),   name='pnl-company'),
    path('pnl/project/<int:project_pk>/',  views.ProjectPnLView.as_view(),   name='pnl-project'),

    # Tesorería
    path('ar-aging/',       views.ARAgingView.as_view(),          name='ar-aging'),
    path('cash-forecast/',  views.CashFlowForecastView.as_view(), name='cash-forecast'),

    # Conciliación equipos
    path('equipment-reconciliation/', views.EquipmentReconciliationView.as_view(), name='equipment-reconciliation'),
]
