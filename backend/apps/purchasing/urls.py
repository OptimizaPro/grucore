from django.urls import path
from . import views

urlpatterns = [
    # Requisiciones
    path('requisitions/',            views.PurchaseRequisitionListCreateView.as_view(), name='pr-list'),
    path('requisitions/<int:pk>/',   views.PurchaseRequisitionDetailView.as_view(),     name='pr-detail'),
    path('requisitions/<int:pk>/approve/', views.PurchaseRequisitionApproveView.as_view(), name='pr-approve'),

    # Órdenes de compra
    path('orders/',                  views.PurchaseOrderListCreateView.as_view(), name='po-list'),
    path('orders/<int:pk>/',         views.PurchaseOrderDetailView.as_view(),     name='po-detail'),
    path('orders/<int:pk>/confirm/', views.PurchaseOrderConfirmView.as_view(),    name='po-confirm'),
    path('orders/<int:pk>/pdf/',     views.PurchaseOrderPDFView.as_view(),        name='po-pdf'),

    # Recepciones
    path('receipts/',                views.GoodsReceiptListCreateView.as_view(), name='gr-list'),
    path('receipts/<int:pk>/',       views.GoodsReceiptDetailView.as_view(),     name='gr-detail'),
    path('receipts/<int:pk>/post/',  views.GoodsReceiptPostView.as_view(),       name='gr-post'),

    # Facturas de proveedor
    path('invoices/',                views.SupplierInvoiceListCreateView.as_view(), name='spi-list'),
    path('invoices/<int:pk>/',       views.SupplierInvoiceDetailView.as_view(),     name='spi-detail'),
    path('invoices/<int:pk>/post/',  views.SupplierInvoicePostView.as_view(),       name='spi-post'),

    # Pagos
    path('payments/',                views.SupplierPaymentListCreateView.as_view(), name='pay-list'),
    path('payments/<int:pk>/',       views.SupplierPaymentDetailView.as_view(),     name='pay-detail'),
    path('payments/<int:pk>/post/',  views.SupplierPaymentPostView.as_view(),       name='pay-post'),
]
