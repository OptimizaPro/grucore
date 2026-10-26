from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),

    # Company branding
    path('settings/company/',              views.CompanySettingsView.as_view(),                    name='company-settings'),
    path('settings/company/logo/',         views.upload_company_logo, {'variant': 'dark'},         name='company-logo'),
    path('settings/company/logo-light/',   views.upload_company_logo, {'variant': 'light'},        name='company-logo-light'),
]
