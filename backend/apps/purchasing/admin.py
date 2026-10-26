from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin, TabularInline, StackedInline
from apps.core.admin_mixins import CRUDActionsMixin
from .models import (
    PurchaseRequisition, PurchaseRequisitionLine,
    PurchaseOrder, PurchaseOrderLine,
    GoodsReceipt, GoodsReceiptLine,
    SupplierInvoice, SupplierInvoiceLine,
    SupplierPayment, SupplierPaymentAllocation,
    POStatus, GRStatus, SupplierInvoiceStatus, SupplierPaymentStatus,
)

# ─── Estilos de inputs ────────────────────────────────────────────────────────

_base = (
    'background-color:rgb(15 23 42);'
    'color:rgb(241 245 249);'
    'border:1px solid rgb(51 65 85);'
    'border-radius:0.375rem;'
    'padding:0.35rem 0.6rem;'
    'font-size:0.8125rem;'
    'outline:none;'
)

# ─── Badges de estado ─────────────────────────────────────────────────────────

_STATUS_COLORS = {
    'draft':              ('#1e2a3a', '#8A95A5'),
    'submitted':          ('#1a2540', '#6B9FD4'),
    'approved':           ('#1a3a2a', '#4A9E6B'),
    'sent':               ('#1a2540', '#6B9FD4'),
    'confirmed':          ('#1a3a2a', '#4A9E6B'),
    'partially_received': ('#2a2a1a', '#C9A227'),
    'received':           ('#1a3a2a', '#4A9E6B'),
    'invoiced':           ('#1a2540', '#A78BFA'),
    'cancelled':          ('#2a1a1a', '#E53E3E'),
    'posted':             ('#1a3a2a', '#4A9E6B'),
    'paid':               ('#1a3a2a', '#4A9E6B'),
}


def _status_badge(label, status_key):
    bg, fg = _STATUS_COLORS.get(status_key, ('#1e2a3a', '#8A95A5'))
    return format_html(
        '<span style="background:{};color:{};padding:2px 8px;border-radius:4px;'
        'font-size:0.75rem;font-weight:600;">{}</span>',
        bg, fg, label,
    )


def _gtq(value):
    return format_html('<span style="font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>', value)


# ─── Requisición de compra ────────────────────────────────────────────────────

class PurchaseRequisitionLineInline(TabularInline):
    model   = PurchaseRequisitionLine
    extra   = 0
    fields  = ('order', 'product', 'description', 'unit', 'quantity', 'estimated_unit_cost_gtq', 'cost_code')
    ordering = ('order',)

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'description':
            formfield.widget.attrs.update({'style': _base + 'min-width:200px;width:100%;'})
        elif db_field.name in ('quantity', 'order'):
            formfield.widget.attrs.update({'style': _base + 'width:70px;'})
        elif db_field.name == 'estimated_unit_cost_gtq':
            formfield.widget.attrs.update({'style': _base + 'width:110px;'})
        elif db_field.name == 'unit':
            formfield.widget.attrs.update({'style': _base + 'width:70px;'})
        return formfield


@admin.register(PurchaseRequisition)
class PurchaseRequisitionAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'project', 'status_badge', 'requested_by',
                       'estimated_total_display', 'needed_by', 'created_at')
    list_filter     = ('status',)
    search_fields   = ('project__name', 'project__client__name')
    ordering        = ('-created_at',)
    readonly_fields = ('year', 'sequence', 'approved_by', 'approved_at', 'created_at', 'updated_at',
                       'estimated_total_display')
    inlines         = [PurchaseRequisitionLineInline]
    actions         = ['action_approve']

    fieldsets = (
        ("Requisición", {
            "fields": (
                ("year", "sequence", "status"),
                "project",
                ("phase", "cost_center"),
                ("requested_by", "needed_by"),
                ("accounting_period", "estimated_total_display"),
                "notes",
            ),
        }),
        ("Aprobación", {
            "fields": (("approved_by", "approved_at"),),
            "classes": ["collapse"],
        }),
        ("Auditoría", {
            "fields": (("created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _status_badge(obj.get_status_display(), obj.status)

    @admin.display(description='Total estimado')
    def estimated_total_display(self, obj):
        return _gtq(obj.estimated_total_gtq)

    @admin.action(description='Aprobar requisiciones seleccionadas')
    def action_approve(self, request, queryset):
        ok, errors = 0, []
        for pr in queryset:
            try:
                pr.approve(request.user)
                ok += 1
            except Exception as e:
                errors.append(f'{pr}: {e}')
        if ok:
            self.message_user(request, f'{ok} requisición(es) aprobada(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.requested_by = request.user
        super().save_model(request, obj, form, change)


# ─── Orden de compra ──────────────────────────────────────────────────────────

class PurchaseOrderLineInline(TabularInline):
    model   = PurchaseOrderLine
    extra   = 0
    fields  = ('order', 'product', 'description', 'unit', 'quantity', 'unit_cost_gtq', 'cost_code')
    ordering = ('order',)

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'description':
            formfield.widget.attrs.update({'style': _base + 'min-width:200px;width:100%;'})
        elif db_field.name in ('quantity', 'order'):
            formfield.widget.attrs.update({'style': _base + 'width:70px;'})
        elif db_field.name == 'unit_cost_gtq':
            formfield.widget.attrs.update({'style': _base + 'width:110px;'})
        elif db_field.name == 'unit':
            formfield.widget.attrs.update({'style': _base + 'width:70px;'})
        return formfield


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'project', 'supplier', 'status_badge',
                       'subtotal_display', 'total_display', 'delivery_date', 'confirmed_at')
    list_filter     = ('status',)
    search_fields   = ('project__name', 'supplier__name')
    ordering        = ('-created_at',)
    readonly_fields = ('year', 'sequence', 'confirmed_by', 'confirmed_at',
                       'subtotal_display', 'tax_amount_display', 'total_display',
                       'created_by', 'created_at', 'updated_at')
    inlines         = [PurchaseOrderLineInline]
    actions         = ['action_confirm']

    fieldsets = (
        ("Orden de compra", {
            "fields": (
                ("year", "sequence", "status"),
                ("supplier", "project"),
                ("phase", "cost_center"),
                ("accounting_period", "requisition"),
                ("tax_percentage", "delivery_date"),
                "delivery_address",
                "notes",
            ),
        }),
        ("Totales", {
            "fields": (("subtotal_display", "tax_amount_display", "total_display"),),
        }),
        ("Confirmación", {
            "fields": (("confirmed_by", "confirmed_at"),),
            "classes": ["collapse"],
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _status_badge(obj.get_status_display(), obj.status)

    @admin.display(description='Subtotal')
    def subtotal_display(self, obj):
        return _gtq(obj.subtotal_gtq)

    @admin.display(description='IVA')
    def tax_amount_display(self, obj):
        return _gtq(obj.tax_amount_gtq)

    @admin.display(description='Total')
    def total_display(self, obj):
        return _gtq(obj.total_gtq)

    @admin.action(description='Confirmar órdenes de compra seleccionadas')
    def action_confirm(self, request, queryset):
        ok, errors = 0, []
        for po in queryset:
            try:
                po.confirm(request.user)
                ok += 1
            except Exception as e:
                errors.append(f'{po}: {e}')
        if ok:
            self.message_user(request, f'{ok} OC(s) confirmada(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Recepción de mercancía ───────────────────────────────────────────────────

class GoodsReceiptLineInline(TabularInline):
    model   = GoodsReceiptLine
    extra   = 0
    fields  = ('po_line', 'quantity_received', 'unit_cost_gtq', 'notes')

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name in ('quantity_received', 'unit_cost_gtq'):
            formfield.widget.attrs.update({'style': _base + 'width:110px;'})
        elif db_field.name == 'notes':
            formfield.widget.attrs.update({'style': _base + 'min-width:160px;width:100%;'})
        return formfield


@admin.register(GoodsReceipt)
class GoodsReceiptAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'purchase_order', 'received_by', 'status_badge', 'received_date', 'created_at')
    list_filter     = ('status',)
    search_fields   = ('purchase_order__supplier__name', 'purchase_order__project__name')
    ordering        = ('-received_date',)
    readonly_fields = ('year', 'sequence', 'created_by', 'created_at', 'updated_at')
    inlines         = [GoodsReceiptLineInline]
    actions         = ['action_post']

    fieldsets = (
        ("Recepción", {
            "fields": (
                ("year", "sequence", "status"),
                "purchase_order",
                ("received_by", "received_date"),
                "notes",
            ),
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _status_badge(obj.get_status_display(), obj.status)

    @admin.action(description='Registrar recepciones seleccionadas')
    def action_post(self, request, queryset):
        ok, errors = 0, []
        for gr in queryset:
            try:
                gr.post()
                ok += 1
            except Exception as e:
                errors.append(f'{gr}: {e}')
        if ok:
            self.message_user(request, f'{ok} recepción(es) registrada(s). Movimientos de inventario creados.')
        for err in errors:
            self.message_user(request, err, level='error')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Factura de proveedor ─────────────────────────────────────────────────────

class SupplierInvoiceLineInline(TabularInline):
    model   = SupplierInvoiceLine
    extra   = 0
    fields  = ('order', 'po_line', 'description', 'quantity', 'unit_cost_gtq', 'cost_code')
    ordering = ('order',)

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'description':
            formfield.widget.attrs.update({'style': _base + 'min-width:200px;width:100%;'})
        elif db_field.name in ('quantity', 'order'):
            formfield.widget.attrs.update({'style': _base + 'width:70px;'})
        elif db_field.name == 'unit_cost_gtq':
            formfield.widget.attrs.update({'style': _base + 'width:110px;'})
        return formfield


@admin.register(SupplierInvoice)
class SupplierInvoiceAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('internal_number', 'supplier', 'supplier_invoice_number', 'status_badge',
                       'issue_date', 'due_date', 'total_display', 'balance_display')
    list_filter     = ('status', 'fel_status')
    search_fields   = ('supplier__name', 'supplier_invoice_number', 'fel_number')
    ordering        = ('-issue_date',)
    readonly_fields = ('year', 'sequence', 'internal_number',
                       'subtotal_display', 'tax_amount_display', 'total_display',
                       'amount_paid_display', 'balance_display',
                       'created_by', 'created_at', 'updated_at')
    inlines         = [SupplierInvoiceLineInline]
    actions         = ['action_post']

    fieldsets = (
        ("Factura de proveedor", {
            "fields": (
                ("internal_number", "status"),
                "supplier",
                ("purchase_order", "goods_receipt"),
                ("supplier_invoice_number", "accounting_period"),
                ("issue_date", "due_date"),
                ("tax_percentage",),
                "notes",
            ),
        }),
        ("FEL del proveedor", {
            "fields": (("fel_number", "fel_status", "fel_certified_at"),),
            "classes": ["collapse"],
        }),
        ("Totales", {
            "fields": (("subtotal_display", "tax_amount_display", "total_display"),
                       ("amount_paid_display", "balance_display")),
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _status_badge(obj.get_status_display(), obj.status)

    @admin.display(description='Subtotal')
    def subtotal_display(self, obj):
        return _gtq(obj.subtotal_gtq)

    @admin.display(description='IVA')
    def tax_amount_display(self, obj):
        return _gtq(obj.tax_amount_gtq)

    @admin.display(description='Total')
    def total_display(self, obj):
        return _gtq(obj.total_gtq)

    @admin.display(description='Pagado')
    def amount_paid_display(self, obj):
        return _gtq(obj.amount_paid_gtq)

    @admin.display(description='Saldo pendiente')
    def balance_display(self, obj):
        b = obj.balance_due_gtq
        color = '#E53E3E' if b > 0 else '#4A9E6B'
        return format_html(
            '<span style="color:{};font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>',
            color, b,
        )

    @admin.action(description='Registrar facturas seleccionadas')
    def action_post(self, request, queryset):
        ok, errors = 0, []
        for inv in queryset:
            try:
                inv.post()
                ok += 1
            except Exception as e:
                errors.append(f'{inv}: {e}')
        if ok:
            self.message_user(request, f'{ok} factura(s) registrada(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ─── Pago a proveedor ─────────────────────────────────────────────────────────

class SupplierPaymentAllocationInline(TabularInline):
    model   = SupplierPaymentAllocation
    extra   = 0
    fields  = ('invoice', 'amount_allocated')

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, request, **kwargs)
        if db_field.name == 'amount_allocated':
            formfield.widget.attrs.update({'style': _base + 'width:130px;'})
        return formfield

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == 'invoice':
            # Mostrar solo facturas posted/parcialmente pagadas
            kwargs['queryset'] = SupplierInvoice.objects.filter(
                status__in=[SupplierInvoiceStatus.POSTED]
            ).select_related('supplier')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(SupplierPayment)
class SupplierPaymentAdmin(CRUDActionsMixin, ModelAdmin):
    list_display    = ('__str__', 'supplier', 'payment_method', 'status_badge',
                       'payment_date', 'amount_display', 'unallocated_display')
    list_filter     = ('status', 'payment_method')
    search_fields   = ('supplier__name', 'bank_reference')
    ordering        = ('-payment_date',)
    readonly_fields = ('year', 'sequence', 'amount_allocated_display', 'amount_unallocated_display',
                       'created_by', 'created_at', 'updated_at')
    inlines         = [SupplierPaymentAllocationInline]
    actions         = ['action_post']

    fieldsets = (
        ("Pago", {
            "fields": (
                ("year", "sequence", "status"),
                "supplier",
                ("payment_method", "payment_date"),
                ("amount_gtq", "bank_reference"),
                ("amount_allocated_display", "amount_unallocated_display"),
                "notes",
            ),
        }),
        ("Auditoría", {
            "fields": (("created_by", "created_at", "updated_at"),),
            "classes": ["collapse"],
        }),
    )

    @admin.display(description='Estado')
    def status_badge(self, obj):
        return _status_badge(obj.get_status_display(), obj.status)

    @admin.display(description='Monto')
    def amount_display(self, obj):
        return _gtq(obj.amount_gtq)

    @admin.display(description='Sin asignar')
    def unallocated_display(self, obj):
        u = obj.amount_unallocated_gtq
        color = '#C9A227' if u > 0 else '#4A9E6B'
        return format_html(
            '<span style="color:{};font-family:\'Space Mono\',monospace;">Q {:,.2f}</span>',
            color, u,
        )

    @admin.display(description='Asignado')
    def amount_allocated_display(self, obj):
        return _gtq(obj.amount_allocated_gtq)

    @admin.display(description='Sin asignar')
    def amount_unallocated_display(self, obj):
        return _gtq(obj.amount_unallocated_gtq)

    @admin.action(description='Registrar pagos seleccionados')
    def action_post(self, request, queryset):
        ok, errors = 0, []
        for pay in queryset:
            try:
                pay.post()
                ok += 1
            except Exception as e:
                errors.append(f'{pay}: {e}')
        if ok:
            self.message_user(request, f'{ok} pago(s) registrado(s).')
        for err in errors:
            self.message_user(request, err, level='error')

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
