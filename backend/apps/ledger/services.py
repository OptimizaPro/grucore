"""
Bloque 8 — Servicios financieros de Grucore ERP

PostingService   — crea JournalEntry / JournalLine para cada evento operativo
ProjectPnLService — P&L por proyecto (basado en datos operativos)
CompanyPnLService — P&L consolidado de empresa

NOTA IVA: El tratamiento del IVA crédito fiscal requiere validación por
contador/asesor fiscal guatemalteco. Los métodos de posting incluyen la lógica
estructural, pero el asiento de IVA está marcado como pendiente de configuración.
"""
from decimal import Decimal, ROUND_HALF_UP
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone


# ─── PostingService ───────────────────────────────────────────────────────────

class PostingService:
    """
    Crea los asientos contables de doble entrada correspondientes a cada
    evento operativo del ERP.

    Uso:
        PostingService.post_supplier_invoice(spi)
        PostingService.post_supplier_payment(payment)
        PostingService.post_depreciation(dep_entry)
        ...

    Prerrequisito: configurar AccountMapping en el admin para todas las claves
    antes de activar el posting automático.
    """

    @staticmethod
    def _account(key):
        from apps.ledger.models import AccountMapping
        return AccountMapping.get(key)

    @staticmethod
    def _period(date):
        from apps.ledger.models import AccountingPeriod
        return AccountingPeriod.get_or_create_for_date(date)

    # ── Factura de proveedor ──────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def post_supplier_invoice(spi, include_iva_credit: bool = False):
        """
        Contabiliza una factura de proveedor con asiento de doble entrada.

        Esquema sin IVA (default — include_iva_credit=False):
            DR: Cuenta de gasto/inventario por línea (subtotal)
            CR: CxP Proveedores (subtotal)

        Esquema con IVA crédito fiscal (include_iva_credit=True):
            DR: Cuenta de gasto/inventario por línea (subtotal)
            DR: IVA Crédito Fiscal (tax_amount_gtq)
            CR: CxP Proveedores (total_gtq = subtotal + IVA)

        ADVERTENCIA IVA: El crédito fiscal IVA solo es recuperable bajo ciertas
        condiciones (régimen del proveedor, FEL certificada, cumplimiento SAT).
        Habilitar include_iva_credit=True requiere validación por contador guatemalteco.
        Pending validación contador antes de usar en producción.
        """
        from apps.ledger.models import (
            JournalEntry, JournalLine, EntryOrigin, MappingKey
        )
        from apps.purchasing.models import SupplierInvoiceStatus

        if spi.status != SupplierInvoiceStatus.POSTED:
            raise ValidationError('La factura de proveedor debe estar registrada (posted) para contabilizarse.')

        if hasattr(spi, 'journal_entry') and spi.journal_entry_id:
            return spi.journal_entry  # ya contabilizado — idempotente

        ap_account = PostingService._account(MappingKey.AP_SUPPLIERS)
        period     = PostingService._period(spi.issue_date)

        entry = JournalEntry.objects.create(
            date        = spi.issue_date,
            period      = period,
            origin_type = EntryOrigin.SUPPLIER_INVOICE,
            description = f'Factura proveedor {spi} — {spi.supplier}',
            created_by  = None,
        )

        # ── DR: líneas de gasto/inventario (siempre sobre subtotal, sin IVA) ──
        total_subtotal = Decimal('0.00')
        for line in spi.lines.select_related('cost_code__default_account').all():
            if line.cost_code and line.cost_code.default_account:
                debit_account = line.cost_code.default_account
            else:
                try:
                    debit_account = PostingService._account(MappingKey.INVENTORY_MATERIALS)
                except ValueError:
                    debit_account = ap_account
            amount = line.subtotal_gtq
            total_subtotal += amount
            JournalLine.objects.create(
                entry       = entry,
                account     = debit_account,
                debit       = amount,
                credit      = Decimal('0.00'),
                project     = spi.purchase_order.project if spi.purchase_order else None,
                phase       = spi.purchase_order.phase if spi.purchase_order else None,
                cost_code   = line.cost_code,
                description = line.description,
            )

        # ── DR: IVA Crédito Fiscal (solo cuando include_iva_credit=True) ──────
        iva_amount = spi.tax_amount_gtq
        if include_iva_credit and iva_amount and iva_amount > Decimal('0'):
            iva_account = PostingService._account(MappingKey.IVA_CREDIT_FISCAL)
            JournalLine.objects.create(
                entry       = entry,
                account     = iva_account,
                debit       = iva_amount,
                credit      = Decimal('0.00'),
                description = f'IVA Crédito Fiscal — {spi} (pending validación contador)',
            )
            ap_credit = (total_subtotal + iva_amount).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        else:
            ap_credit = total_subtotal

        # ── CR: CxP Proveedores ───────────────────────────────────────────────
        JournalLine.objects.create(
            entry       = entry,
            account     = ap_account,
            debit       = Decimal('0.00'),
            credit      = ap_credit,
            description = f'CxP {spi.supplier}',
        )

        entry.post()
        return entry

    # ── Pago a proveedor ──────────────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def post_supplier_payment(payment):
        """
        DR: CxP Proveedores (monto asignado a facturas)
        CR: Banco / Caja (monto total del pago)
        """
        from apps.ledger.models import (
            JournalEntry, JournalLine, EntryOrigin, MappingKey
        )
        from apps.purchasing.models import SupplierPaymentStatus

        if payment.status != SupplierPaymentStatus.POSTED:
            raise ValidationError('El pago debe estar registrado (posted) para contabilizarse.')

        ap_account   = PostingService._account(MappingKey.AP_SUPPLIERS)
        bank_account = PostingService._account(MappingKey.CASH_BANK)
        period       = PostingService._period(payment.payment_date)

        entry = JournalEntry.objects.create(
            date        = payment.payment_date,
            period      = period,
            origin_type = EntryOrigin.PAYMENT_MADE,
            description = f'Pago proveedor {payment} — {payment.supplier}',
            created_by  = None,
        )

        # DR: CxP por cada factura pagada
        for alloc in payment.allocations.select_related('invoice').all():
            JournalLine.objects.create(
                entry       = entry,
                account     = ap_account,
                debit       = alloc.amount_allocated,
                credit      = Decimal('0.00'),
                description = f'Cancelación {alloc.invoice}',
            )

        # CR: Banco / Caja
        JournalLine.objects.create(
            entry       = entry,
            account     = bank_account,
            debit       = Decimal('0.00'),
            credit      = payment.amount_gtq,
            description = payment.bank_reference or str(payment),
        )

        entry.post()
        return entry

    # ── Depreciación de activos ───────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def post_depreciation(dep_entry):
        """
        DR: Gasto de depreciación
        CR: Depreciación acumulada (contra-activo)
        """
        from apps.ledger.models import (
            JournalEntry, JournalLine, EntryOrigin, MappingKey
        )

        if dep_entry.is_posted:
            return  # idempotente

        depr_expense_account = PostingService._account(MappingKey.DEPRECIATION_EXPENSE)
        acc_depr_account     = PostingService._account(MappingKey.ACCUMULATED_DEPR)
        period               = dep_entry.accounting_period

        entry = JournalEntry.objects.create(
            date        = timezone.datetime(period.year, period.month, 1).date(),
            period      = period,
            origin_type = EntryOrigin.DEPRECIATION,
            description = f'Depreciación {dep_entry.asset} — {period}',
            created_by  = None,
        )

        JournalLine.objects.create(
            entry       = entry,
            account     = depr_expense_account,
            debit       = dep_entry.amount_gtq,
            credit      = Decimal('0.00'),
            description = f'Depreciación {dep_entry.asset.asset_number}',
        )
        JournalLine.objects.create(
            entry       = entry,
            account     = acc_depr_account,
            debit       = Decimal('0.00'),
            credit      = dep_entry.amount_gtq,
            description = f'Dep. acum. {dep_entry.asset.asset_number}',
        )

        entry.post()
        dep_entry.is_posted = True
        dep_entry.save(update_fields=['is_posted'])
        return entry

    # ── Certificación de subcontratista ───────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def post_subcontractor_certification(cert):
        """
        DR: Gasto de subcontratista (neto certificado) → cost_code.default_account
        DR: Retención pasivo (retention_withheld_gtq) — si hay
        CR: CxP Subcontratistas (net_payable_gtq)
        CR: Retención pasivo (retention_withheld_gtq)

        Esquema simplificado:
        DR: Subcontractor cost (bruto certificado)
        CR: CxP subcontratista (neto a pagar)
        CR: Retención por pagar (retención retenida)
        """
        from apps.ledger.models import (
            JournalEntry, JournalLine, EntryOrigin, MappingKey
        )
        from apps.subcontractors.models import CertificationStatus

        if cert.status != CertificationStatus.APPROVED:
            raise ValidationError('La certificación debe estar aprobada para contabilizarse.')

        # Cuentas
        try:
            subcontract_account = (
                cert.contract.cost_code.default_account
                if cert.contract.cost_code and cert.contract.cost_code.default_account
                else PostingService._account(MappingKey.AP_SUBCONTRACTORS)
            )
        except (AttributeError, ValueError):
            subcontract_account = PostingService._account(MappingKey.AP_SUBCONTRACTORS)

        ap_sub_account      = PostingService._account(MappingKey.AP_SUBCONTRACTORS)
        retention_account   = PostingService._account(MappingKey.RETENTION_LIABILITY)
        period              = PostingService._period(cert.period_to)

        entry = JournalEntry.objects.create(
            date        = cert.period_to,
            period      = period,
            origin_type = EntryOrigin.SUBCONTRACT_CERT,
            description = f'Cert. subcontrato #{cert.certification_number} — {cert.contract.subcontractor}',
            created_by  = None,
        )

        # DR: Costo subcontratista (bruto)
        JournalLine.objects.create(
            entry       = entry,
            account     = subcontract_account,
            debit       = cert.amount_certified_gtq,
            credit      = Decimal('0.00'),
            project     = cert.contract.project,
            phase       = cert.contract.phase,
            cost_code   = cert.contract.cost_code,
            description = f'Subcontrato {cert.contract}',
        )
        # CR: CxP subcontratista (neto a pagar)
        JournalLine.objects.create(
            entry       = entry,
            account     = ap_sub_account,
            debit       = Decimal('0.00'),
            credit      = cert.net_payable_gtq,
            description = f'Neto a pagar {cert.contract.subcontractor}',
        )
        # CR: Retención pasivo
        if cert.retention_withheld_gtq > Decimal('0'):
            JournalLine.objects.create(
                entry       = entry,
                account     = retention_account,
                debit       = Decimal('0.00'),
                credit      = cert.retention_withheld_gtq,
                description = f'Retención {cert.contract.subcontractor}',
            )

        entry.post()
        return entry

    # ── Liberación de retención ───────────────────────────────────────────────

    @staticmethod
    @transaction.atomic
    def post_retention_release(release):
        """
        DR: Retención pasivo (amount_released)
        CR: CxP Subcontratistas (amount_released) — ahora exigible
        """
        from apps.ledger.models import (
            JournalEntry, JournalLine, EntryOrigin, MappingKey
        )

        retention_account = PostingService._account(MappingKey.RETENTION_LIABILITY)
        ap_sub_account    = PostingService._account(MappingKey.AP_SUBCONTRACTORS)
        period            = PostingService._period(release.release_date)

        entry = JournalEntry.objects.create(
            date        = release.release_date,
            period      = period,
            origin_type = EntryOrigin.MANUAL,
            description = f'Liberación retención — {release.contract.subcontractor}',
            created_by  = None,
        )

        JournalLine.objects.create(
            entry=entry, account=retention_account,
            debit=release.amount_released_gtq, credit=Decimal('0.00'),
            description='Liberación retención',
        )
        JournalLine.objects.create(
            entry=entry, account=ap_sub_account,
            debit=Decimal('0.00'), credit=release.amount_released_gtq,
            description=f'CxP liberada {release.contract.subcontractor}',
        )

        entry.post()
        return entry

    # ── Recepción de mercancía (activo inventario) ────────────────────────────

    @staticmethod
    @transaction.atomic
    def post_goods_receipt(gr):
        """
        DR: Inventario de materiales (costo recibido)
        CR: Acumulaciones por pagar / GR accrual
        """
        from apps.ledger.models import (
            JournalEntry, JournalLine, EntryOrigin, MappingKey
        )
        from apps.purchasing.models import GRStatus

        if gr.status != GRStatus.POSTED:
            raise ValidationError('La recepción debe estar registrada para contabilizarse.')

        inventory_account = PostingService._account(MappingKey.INVENTORY_MATERIALS)
        accrual_account   = PostingService._account(MappingKey.ACCRUED_AP)
        period            = PostingService._period(gr.received_date)

        total = sum(line.subtotal_gtq for line in gr.lines.all())
        if total == Decimal('0'):
            return None

        entry = JournalEntry.objects.create(
            date        = gr.received_date,
            period      = period,
            origin_type = EntryOrigin.STOCK_IN,
            description = f'Recepción {gr} — OC {gr.purchase_order}',
            created_by  = None,
        )

        JournalLine.objects.create(
            entry=entry, account=inventory_account,
            debit=total, credit=Decimal('0.00'),
            project     = gr.purchase_order.project,
            description = f'Entrada inventario {gr}',
        )
        JournalLine.objects.create(
            entry=entry, account=accrual_account,
            debit=Decimal('0.00'), credit=total,
            description = f'Accrual GR {gr}',
        )

        entry.post()
        return entry

    # ── Lote de jornadas de trabajo (labor cost) ──────────────────────────────

    @staticmethod
    @transaction.atomic
    def post_worklog_batch(worklogs, period, user):
        """
        Contabiliza un lote de jornadas de trabajo en un único asiento por proyecto.

        Por cada proyecto presente en el lote se generan tres líneas:
            DR: Gasto de mano de obra directa  (gross_pay)
            DR: Cuota patronal IGSS por pagar  (igss_patronal)
            CR: Sueldos y salarios por pagar   (total_cost = gross_pay + igss_patronal)

        El asiento se agrupa por proyecto para preservar la dimensión analítica.
        Idempotencia: el llamador es responsable de no enviar worklogs ya contabilizados.

        Args:
            worklogs: QuerySet o lista de WorkLog; deben pertenecer al mismo mes/período.
            period:   AccountingPeriod — debe estar abierto.
            user:     User que autoriza el registro.

        Returns:
            Lista de JournalEntry creados (uno por proyecto distinto en el lote).

        NOTA IGSS: Las tasas IGSS_PATRONAL (10.67 %) usadas aquí provienen de
        workers.models. Requieren validación por contador guatemalteco.
        """
        from django.db.models import Sum
        from apps.ledger.models import (
            JournalEntry, JournalLine, EntryOrigin, MappingKey
        )
        from apps.workers.models import WorkLog

        if not worklogs:
            return []

        labor_account   = PostingService._account(MappingKey.DIRECT_LABOR_EXPENSE)
        igss_account    = PostingService._account(MappingKey.IGSS_PATRONAL_LIAB)
        payroll_account = PostingService._account(MappingKey.PAYROLL_LIABILITY)

        # Agrupa por proyecto
        from collections import defaultdict
        by_project = defaultdict(list)
        for wl in worklogs:
            by_project[wl.project_id].append(wl)

        entries = []
        for project_id, logs in by_project.items():
            gross_total = sum(wl.gross_pay  for wl in logs)
            igss_total  = sum(wl.igss_patronal for wl in logs)
            total_cost  = sum(wl.total_cost  for wl in logs)

            if total_cost == Decimal('0'):
                continue

            # Tomar el proyecto del primer worklog (todos son del mismo proyecto)
            project = logs[0].project

            entry = JournalEntry.objects.create(
                date        = period.end_date,
                period      = period,
                origin_type = EntryOrigin.MANUAL,
                description = (
                    f'Costo laboral {period} — {project} '
                    f'({len(logs)} jornadas)'
                ),
                created_by  = user,
            )

            JournalLine.objects.create(
                entry       = entry,
                account     = labor_account,
                debit       = gross_total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                credit      = Decimal('0.00'),
                project     = project,
                description = f'Mano de obra directa — {project} {period}',
            )
            JournalLine.objects.create(
                entry       = entry,
                account     = igss_account,
                debit       = igss_total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                credit      = Decimal('0.00'),
                project     = project,
                description = f'Cuota patronal IGSS — {project} {period}',
            )
            JournalLine.objects.create(
                entry       = entry,
                account     = payroll_account,
                debit       = Decimal('0.00'),
                credit      = total_cost.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                project     = project,
                description = f'Sueldos por pagar — {project} {period}',
            )

            entry.post()
            entries.append(entry)

        return entries


# ─── ProjectPnLService ────────────────────────────────────────────────────────

class ProjectPnLService:
    """
    P&L por proyecto basado en datos operativos.

    Fuentes de datos:
    - Ingresos: financials.Invoice (issued to client, by project)
    - Materiales: purchasing.SupplierInvoice (posted, via PO.project)
                  + inventory.StockMovement (OUT, by project)
    - Mano de obra: workers.WorkLog (by project, total_cost)
    - Subcontratistas: subcontractors.SubcontractorCertification (approved)
    - Equipos: assets.EquipmentUsageLog (by project, allocated_cost)
    - Gastos varios: financials.Expense (by project, approved)
    """

    def __init__(self, project, date_from=None, date_to=None):
        self.project   = project
        self.date_from = date_from
        self.date_to   = date_to

    def _date_filter(self, qs, field='created_at'):
        if self.date_from:
            qs = qs.filter(**{f'{field}__gte': self.date_from})
        if self.date_to:
            qs = qs.filter(**{f'{field}__lte': self.date_to})
        return qs

    # ── Ingresos ──────────────────────────────────────────────────────────────

    def gross_revenue(self):
        from django.db.models import Sum
        from apps.financials.models import Invoice, InvoiceStatus
        qs = Invoice.objects.filter(
            project=self.project,
            status__in=[InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PAID],
        )
        qs = self._date_filter(qs, 'issue_date')
        result = qs.aggregate(t=Sum('amount_gtq'))['t']
        return result or Decimal('0.00')

    # ── Costos directos ───────────────────────────────────────────────────────

    def direct_materials_cost(self):
        """Materiales: SupplierInvoice lines vía PO del proyecto (posted)."""
        from django.db.models import Sum, F
        from apps.purchasing.models import SupplierInvoice, SupplierInvoiceStatus
        qs = SupplierInvoice.objects.filter(
            purchase_order__project=self.project,
            status__in=[SupplierInvoiceStatus.POSTED, SupplierInvoiceStatus.PAID],
        )
        qs = self._date_filter(qs, 'issue_date')
        from apps.purchasing.models import SupplierInvoiceLine
        lines_qs = SupplierInvoiceLine.objects.filter(
            invoice__purchase_order__project=self.project,
            invoice__status__in=[SupplierInvoiceStatus.POSTED, SupplierInvoiceStatus.PAID],
        )
        if self.date_from:
            lines_qs = lines_qs.filter(invoice__issue_date__gte=self.date_from)
        if self.date_to:
            lines_qs = lines_qs.filter(invoice__issue_date__lte=self.date_to)
        result = lines_qs.aggregate(
            t=Sum(F('quantity') * F('unit_cost_gtq'))
        )['t']
        return (result or Decimal('0.00')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def direct_labor_cost(self):
        """Mano de obra: WorkLog.total_cost por proyecto."""
        from django.db.models import Sum
        from apps.workers.models import WorkLog
        qs = WorkLog.objects.filter(project=self.project)
        qs = self._date_filter(qs, 'date')
        # total_cost es propiedad calculada — sumar componentes directamente
        result = qs.aggregate(
            gross=Sum('regular_hours'),
        )
        # Calcular usando queryset con valores
        logs = qs.select_related('worker')
        total = sum(log.total_cost for log in logs)
        return total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) if total else Decimal('0.00')

    def subcontractor_cost(self):
        """Subcontratistas: certificaciones aprobadas por proyecto."""
        from django.db.models import Sum
        from apps.subcontractors.models import SubcontractorCertification, CertificationStatus
        qs = SubcontractorCertification.objects.filter(
            contract__project=self.project,
            status=CertificationStatus.APPROVED,
        )
        qs = self._date_filter(qs, 'approved_at')
        result = qs.aggregate(t=Sum('amount_certified_gtq'))['t']
        return result or Decimal('0.00')

    def equipment_cost(self):
        """Equipos y maquinaria: EquipmentUsageLog.allocated_cost por proyecto."""
        from django.db.models import Sum, F
        from apps.assets.models import EquipmentUsageLog
        qs = EquipmentUsageLog.objects.filter(project=self.project)
        qs = self._date_filter(qs, 'usage_date')
        logs = qs.all()
        total = sum(log.total_cost_including_fuel_gtq for log in logs)
        return total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) if total else Decimal('0.00')

    def other_direct_cost(self):
        """Gastos varios directos imputados al proyecto."""
        from django.db.models import Sum
        from apps.financials.models import Expense, ExpenseStatus
        qs = Expense.objects.filter(
            project=self.project,
            status=ExpenseStatus.APPROVED,
        )
        qs = self._date_filter(qs, 'expense_date')
        result = qs.aggregate(t=Sum('amount_gtq'))['t']
        return result or Decimal('0.00')

    # ── P&L completo ──────────────────────────────────────────────────────────

    def get_pnl(self):
        """
        Retorna dict con el P&L completo del proyecto.
        Todos los montos en GTQ, Decimal.
        """
        gross_rev          = self.gross_revenue()
        direct_materials   = self.direct_materials_cost()
        direct_labor       = self.direct_labor_cost()
        subcontractors     = self.subcontractor_cost()
        equipment          = self.equipment_cost()
        other_direct       = self.other_direct_cost()
        total_direct_cost  = (
            direct_materials + direct_labor + subcontractors + equipment + other_direct
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        gross_margin       = (gross_rev - total_direct_cost).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        gross_margin_pct   = (
            (gross_margin / gross_rev * 100).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
            if gross_rev else Decimal('0.0')
        )
        # Budget comparison
        budget_revenue     = self.project.current_contract_value_gtq
        budget_cost        = self.project.current_budget_cost_gtq
        budget_margin      = (budget_revenue - budget_cost).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )
        cost_variance      = (budget_cost - total_direct_cost).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

        return {
            'project':              self.project,
            'date_from':            self.date_from,
            'date_to':              self.date_to,
            # Ingresos
            'gross_revenue':        gross_rev,
            'net_revenue':          gross_rev,          # sin deducciones por ahora
            # Costos directos por categoría
            'direct_materials':     direct_materials,
            'direct_labor':         direct_labor,
            'subcontractors':       subcontractors,
            'equipment':            equipment,
            'other_direct':         other_direct,
            'total_direct_cost':    total_direct_cost,
            # Márgenes
            'gross_margin':         gross_margin,
            'gross_margin_pct':     gross_margin_pct,
            # vs. presupuesto
            'budget_revenue':       budget_revenue,
            'budget_cost':          budget_cost,
            'budget_margin':        budget_margin,
            'cost_variance':        cost_variance,      # positivo = por debajo del presupuesto
            # Forecast (forecast = actual cost + remaining budget)
            'forecast_final_cost':  total_direct_cost + max(budget_cost - total_direct_cost, Decimal('0')),
            'forecast_final_margin': gross_rev - (total_direct_cost + max(budget_cost - total_direct_cost, Decimal('0'))),
        }

    def get_summary(self):
        """Versión compacta del P&L para dashboards."""
        pnl = self.get_pnl()
        return {
            'project_name':      self.project.name,
            'revenue':           pnl['gross_revenue'],
            'cost':              pnl['total_direct_cost'],
            'gross_margin':      pnl['gross_margin'],
            'gross_margin_pct':  pnl['gross_margin_pct'],
            'cost_variance':     pnl['cost_variance'],
        }


# ─── CompanyPnLService ────────────────────────────────────────────────────────

class CompanyPnLService:
    """
    P&L consolidado de la empresa para un año (o rango de meses).

    Incluye:
    - Suma de todos los proyectos activos
    - Gastos de estructura (Expense sin proyecto)
    - Depreciación registrada en el período
    - Desglosa por mes o acumulado YTD
    """

    def __init__(self, year, month_from=1, month_to=12):
        self.year       = year
        self.month_from = month_from
        self.month_to   = month_to
        import datetime
        import calendar
        self.date_from  = datetime.date(year, month_from, 1)
        last_day        = calendar.monthrange(year, month_to)[1]
        self.date_to    = datetime.date(year, month_to, last_day)

    def _df(self):
        return self.date_from

    def _dt(self):
        return self.date_to

    # ── Ingresos ──────────────────────────────────────────────────────────────

    def total_revenue(self):
        from django.db.models import Sum
        from apps.financials.models import Invoice, InvoiceStatus
        result = Invoice.objects.filter(
            status__in=[InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.PAID],
            issue_date__gte=self._df(),
            issue_date__lte=self._dt(),
        ).aggregate(t=Sum('amount_gtq'))['t']
        return result or Decimal('0.00')

    # ── Costos directos totales ───────────────────────────────────────────────

    def total_direct_materials(self):
        from django.db.models import Sum, F
        from apps.purchasing.models import SupplierInvoiceLine, SupplierInvoiceStatus
        result = SupplierInvoiceLine.objects.filter(
            invoice__status__in=[SupplierInvoiceStatus.POSTED, SupplierInvoiceStatus.PAID],
            invoice__issue_date__gte=self._df(),
            invoice__issue_date__lte=self._dt(),
            invoice__purchase_order__isnull=False,
        ).aggregate(t=Sum(F('quantity') * F('unit_cost_gtq')))['t']
        return (result or Decimal('0.00')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

    def total_direct_labor(self):
        from apps.workers.models import WorkLog
        logs = WorkLog.objects.filter(
            project__isnull=False,
            date__gte=self._df(),
            date__lte=self._dt(),
        ).select_related('worker')
        total = sum(log.total_cost for log in logs)
        return total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) if total else Decimal('0.00')

    def total_subcontractors(self):
        from django.db.models import Sum
        from apps.subcontractors.models import SubcontractorCertification, CertificationStatus
        result = SubcontractorCertification.objects.filter(
            status=CertificationStatus.APPROVED,
            approved_at__date__gte=self._df(),
            approved_at__date__lte=self._dt(),
        ).aggregate(t=Sum('amount_certified_gtq'))['t']
        return result or Decimal('0.00')

    def total_equipment(self):
        from apps.assets.models import EquipmentUsageLog
        logs = EquipmentUsageLog.objects.filter(
            usage_date__gte=self._df(),
            usage_date__lte=self._dt(),
        )
        total = sum(log.total_cost_including_fuel_gtq for log in logs)
        return total.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP) if total else Decimal('0.00')

    def total_direct_expenses(self):
        """Gastos directos de proyecto (Expense con project != None)."""
        from django.db.models import Sum
        from apps.financials.models import Expense, ExpenseStatus
        result = Expense.objects.filter(
            project__isnull=False,
            status=ExpenseStatus.APPROVED,
            expense_date__gte=self._df(),
            expense_date__lte=self._dt(),
        ).aggregate(t=Sum('amount_gtq'))['t']
        return result or Decimal('0.00')

    # ── Gastos de estructura ──────────────────────────────────────────────────

    def total_overhead_expenses(self):
        """Gastos de estructura (Expense sin proyecto)."""
        from django.db.models import Sum
        from apps.financials.models import Expense, ExpenseStatus
        result = Expense.objects.filter(
            project__isnull=True,
            status=ExpenseStatus.APPROVED,
            expense_date__gte=self._df(),
            expense_date__lte=self._dt(),
        ).aggregate(t=Sum('amount_gtq'))['t']
        return result or Decimal('0.00')

    def total_depreciation(self):
        """Depreciación del período (entradas generadas, posted o no)."""
        from django.db.models import Sum
        from apps.assets.models import AssetDepreciationEntry
        result = AssetDepreciationEntry.objects.filter(
            accounting_period__year=self.year,
            accounting_period__month__gte=self.month_from,
            accounting_period__month__lte=self.month_to,
        ).aggregate(t=Sum('amount_gtq'))['t']
        return result or Decimal('0.00')

    # ── P&L consolidado ───────────────────────────────────────────────────────

    def get_pnl(self):
        revenue           = self.total_revenue()
        direct_materials  = self.total_direct_materials()
        direct_labor      = self.total_direct_labor()
        subcontractors    = self.total_subcontractors()
        equipment         = self.total_equipment()
        direct_expenses   = self.total_direct_expenses()
        total_direct      = (
            direct_materials + direct_labor + subcontractors + equipment + direct_expenses
        ).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        gross_margin      = (revenue - total_direct).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        overhead          = self.total_overhead_expenses()
        depreciation      = self.total_depreciation()
        ebitda            = (gross_margin - overhead).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        ebit              = (ebitda - depreciation).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        gross_margin_pct  = (
            (gross_margin / revenue * 100).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
            if revenue else Decimal('0.0')
        )
        ebitda_pct        = (
            (ebitda / revenue * 100).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
            if revenue else Decimal('0.0')
        )

        return {
            'year': self.year,
            'month_from': self.month_from,
            'month_to': self.month_to,
            'date_from': self.date_from,
            'date_to': self.date_to,
            # Ingresos
            'gross_revenue':     revenue,
            'net_revenue':       revenue,
            # Costos directos
            'direct_materials':  direct_materials,
            'direct_labor':      direct_labor,
            'subcontractors':    subcontractors,
            'equipment':         equipment,
            'other_direct':      direct_expenses,
            'total_direct_cost': total_direct,
            # Márgenes
            'gross_margin':      gross_margin,
            'gross_margin_pct':  gross_margin_pct,
            # Estructura
            'overhead':          overhead,
            'ebitda':            ebitda,
            'ebitda_pct':        ebitda_pct,
            # D&A
            'depreciation':      depreciation,
            'ebit':              ebit,
            # Financiero e ISR pendientes de Bloque 7 TaxRule
            'financial_result':  Decimal('0.00'),   # TODO: integrar ingresos/gastos financieros
            'income_tax':        Decimal('0.00'),   # TODO: integrar ISR vía TaxRule
            'net_profit':        ebit,              # placeholder hasta tener financiero + ISR
        }

    def get_by_project(self):
        """P&L resumido de cada proyecto activo en el período."""
        from apps.projects.models import Project, ProjectStatus
        projects = Project.objects.filter(
            status__in=[ProjectStatus.ACTIVE, ProjectStatus.COMPLETED],
        ).filter(
            # proyectos con actividad en el período
            invoices__issue_date__lte=self.date_to,
        ).distinct()

        results = []
        for project in projects:
            svc = ProjectPnLService(project, self.date_from, self.date_to)
            results.append(svc.get_summary())
        return results


# ─── ARAgingService ───────────────────────────────────────────────────────────

class ARAgingService:
    """
    Análisis de CxC vencida (AR Aging) por cliente.

    Buckets estándar (días de vencimiento respecto a la fecha de referencia):
        current  : no vencida (due_date >= as_of o sin due_date pero emitida ≤ 30 días)
        bucket_1_30  : 1–30 días vencida
        bucket_31_60 : 31–60 días vencida
        bucket_61_90 : 61–90 días vencida
        bucket_over_90 : > 90 días vencida

    Fuente: financials.Invoice (status SENT / VIEWED / OVERDUE).
    No incluye facturas PAID ni CANCELLED.
    """

    UNPAID_STATUSES = ('sent', 'viewed', 'overdue')

    def __init__(self, as_of_date=None, project_id=None):
        import datetime
        self.as_of_date = as_of_date or datetime.date.today()
        self.project_id = project_id

    def _days_overdue(self, invoice):
        """Días de vencimiento. Negativo = días que faltan para vencer. 0 = vence hoy."""
        import datetime
        ref_date = invoice.due_date or (invoice.issue_date + datetime.timedelta(days=30))
        return (self.as_of_date - ref_date).days

    def _bucket(self, days):
        if days <= 0:
            return 'current'
        if days <= 30:
            return '1_30'
        if days <= 60:
            return '31_60'
        if days <= 90:
            return '61_90'
        return 'over_90'

    def _empty_buckets(self):
        return {
            'current':   Decimal('0.00'),
            '1_30':      Decimal('0.00'),
            '31_60':     Decimal('0.00'),
            '61_90':     Decimal('0.00'),
            'over_90':   Decimal('0.00'),
            'total':     Decimal('0.00'),
        }

    def get_aging(self):
        """
        Retorna:
        {
          'as_of_date': date,
          'currency': 'GTQ',
          'by_client': [
              {
                'client_id': int, 'client_name': str,
                'current': Decimal, '1_30': ..., '31_60': ..., '61_90': ..., 'over_90': ..., 'total': ...
                'invoices': [{'invoice_number', 'issue_date', 'due_date', 'amount_gtq', 'days_overdue', 'bucket'}]
              }
          ],
          'totals': {'current': ..., '1_30': ..., '31_60': ..., '61_90': ..., 'over_90': ..., 'total': ...},
        }
        """
        from collections import defaultdict
        from apps.financials.models import Invoice

        qs = Invoice.objects.filter(
            status__in=self.UNPAID_STATUSES,
        ).select_related('project__client')

        if self.project_id:
            qs = qs.filter(project_id=self.project_id)

        # Group by client
        by_client = defaultdict(lambda: {
            'client_id':   None,
            'client_name': '',
            'buckets':     self._empty_buckets(),
            'invoices':    [],
        })

        grand = self._empty_buckets()

        for inv in qs:
            # Skip invoices without a project or without a client on the project
            if not inv.project_id or not inv.project or not inv.project.client_id:
                continue
            client = inv.project.client
            key    = client.id
            rec    = by_client[key]
            rec['client_id']   = client.id
            rec['client_name'] = client.name

            days   = self._days_overdue(inv)
            bucket = self._bucket(days)
            amount = inv.total_with_tax

            rec['buckets'][bucket] += amount
            rec['buckets']['total'] += amount
            grand[bucket] += amount
            grand['total'] += amount

            rec['invoices'].append({
                'invoice_number': inv.invoice_number,
                'title':          inv.title,
                'issue_date':     inv.issue_date.isoformat(),
                'due_date':       inv.due_date.isoformat() if inv.due_date else None,
                'amount_gtq':     str(inv.total_with_tax),
                'days_overdue':   days,
                'bucket':         bucket,
                'project_name':   inv.project.name,
            })

        # Sort invoices within each client by days_overdue desc
        client_rows = []
        for rec in by_client.values():
            rec['invoices'].sort(key=lambda x: x['days_overdue'], reverse=True)
            row = {
                'client_id':   rec['client_id'],
                'client_name': rec['client_name'],
                'invoices':    rec['invoices'],
            }
            row.update(rec['buckets'])
            # Quantize
            for k in ('current', '1_30', '31_60', '61_90', 'over_90', 'total'):
                row[k] = row[k].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            client_rows.append(row)

        # Sort clients by total overdue desc
        client_rows.sort(key=lambda x: x['total'], reverse=True)

        # Quantize grand totals
        for k in ('current', '1_30', '31_60', '61_90', 'over_90', 'total'):
            grand[k] = grand[k].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        return {
            'as_of_date': self.as_of_date.isoformat(),
            'currency':   'GTQ',
            'by_client':  client_rows,
            'totals':     grand,
        }


# ─── CashFlowForecastService ──────────────────────────────────────────────────

class CashFlowForecastService:
    """
    Pronóstico de flujo de caja por período (mensual, por defecto 6 meses adelante).

    Inflows (cobros esperados):
        - Invoice (SENT / VIEWED / OVERDUE): usa due_date; si nulo → primer período
        - PaymentMilestone (no PAID): usa due_date; si nulo → período 'sin fecha'

    Outflows (pagos pendientes):
        - SupplierInvoice (POSTED, no PAID): usa due_date; si nulo → primer período
        - SubcontractorCertification (APPROVED): importe neto a pagar (amount_certified - retención)

    Limitación: no incluye nómina futura ni compras no comprometidas.
    """

    def __init__(self, as_of_date=None, months=6, project_id=None):
        import datetime
        self.as_of_date = as_of_date or datetime.date.today()
        self.months     = months
        self.project_id = project_id

    def _periods(self):
        """Genera lista de (period_label, date_from, date_to) para los próximos N meses."""
        import datetime
        import calendar
        periods = []
        year  = self.as_of_date.year
        month = self.as_of_date.month
        for _ in range(self.months):
            last_day = calendar.monthrange(year, month)[1]
            df = datetime.date(year, month, 1)
            dt = datetime.date(year, month, last_day)
            periods.append((f'{year}-{month:02d}', df, dt))
            month += 1
            if month > 12:
                month = 1
                year  += 1
        return periods

    def _period_for(self, d, periods):
        """Retorna la etiqueta del período al que pertenece la fecha d, o None si está fuera."""
        for label, df, dt in periods:
            if df <= d <= dt:
                return label
        return None

    def get_forecast(self):
        """
        Retorna:
        {
          'as_of_date': str,
          'currency': 'GTQ',
          'periods': [
              {
                'label': '2026-10',
                'date_from': str, 'date_to': str,
                'inflows':  { 'invoices': D, 'milestones': D, 'total': D },
                'outflows': { 'supplier_invoices': D, 'subcontractors': D, 'total': D },
                'net': D,
                'cumulative': D,
              }
          ],
          'unscheduled': {
              'inflows':  { 'invoices': D, 'milestones': D, 'total': D },
              'outflows': { 'supplier_invoices': D, 'subcontractors': D, 'total': D },
          }
        }
        """
        import datetime
        from apps.financials.models import Invoice, InvoiceStatus
        from apps.projects.models import PaymentMilestone, MilestoneStatus
        from apps.purchasing.models import SupplierInvoice, SupplierInvoiceStatus
        from apps.subcontractors.models import SubcontractorCertification, CertificationStatus

        periods    = self._periods()
        first_date = periods[0][1]
        last_date  = periods[-1][2]

        # ── Build empty period buckets ────────────────────────────────────────
        def empty_period(label, df, dt):
            z = Decimal('0.00')
            return {
                'label':    label,
                'date_from': df.isoformat(),
                'date_to':   dt.isoformat(),
                'inflows':  {'invoices': z, 'milestones': z, 'total': z},
                'outflows': {'supplier_invoices': z, 'subcontractors': z, 'total': z},
                'net':       z,
                'cumulative': z,
            }

        period_map = {label: empty_period(label, df, dt) for label, df, dt in periods}
        period_list = [period_map[label] for label, _, _ in periods]
        first_label = periods[0][0]

        unscheduled = {
            'inflows':  {'invoices': Decimal('0.00'), 'milestones': Decimal('0.00'), 'total': Decimal('0.00')},
            'outflows': {'supplier_invoices': Decimal('0.00'), 'subcontractors': Decimal('0.00'), 'total': Decimal('0.00')},
        }

        # ── Inflows: unpaid client invoices ───────────────────────────────────
        inv_qs = Invoice.objects.filter(
            status__in=['sent', 'viewed', 'overdue'],
        ).select_related('project')
        if self.project_id:
            inv_qs = inv_qs.filter(project_id=self.project_id)

        for inv in inv_qs:
            amount = inv.total_with_tax
            if inv.due_date:
                label = self._period_for(inv.due_date, periods)
                if label:
                    period_map[label]['inflows']['invoices'] += amount
                else:
                    # Past due or beyond forecast window → put in first period
                    if inv.due_date < first_date:
                        period_map[first_label]['inflows']['invoices'] += amount
                    else:
                        unscheduled['inflows']['invoices'] += amount
            else:
                # No due_date: put in first period
                period_map[first_label]['inflows']['invoices'] += amount

        # ── Inflows: payment milestones ───────────────────────────────────────
        ms_qs = PaymentMilestone.objects.filter(
            status__in=[
                MilestoneStatus.PENDING,
                MilestoneStatus.EVIDENCE_SUBMITTED,
                MilestoneStatus.AWAITING_APPROVAL,
                MilestoneStatus.APPROVED,
            ],
        ).select_related('project')
        if self.project_id:
            ms_qs = ms_qs.filter(project_id=self.project_id)

        for ms in ms_qs:
            amount = ms.amount_gtq
            if ms.due_date:
                label = self._period_for(ms.due_date, periods)
                if label:
                    period_map[label]['inflows']['milestones'] += amount
                elif ms.due_date < first_date:
                    period_map[first_label]['inflows']['milestones'] += amount
                else:
                    unscheduled['inflows']['milestones'] += amount
            else:
                unscheduled['inflows']['milestones'] += amount

        # ── Outflows: unpaid supplier invoices ────────────────────────────────
        spi_qs = SupplierInvoice.objects.filter(
            status=SupplierInvoiceStatus.POSTED,
        ).select_related('purchase_order')
        if self.project_id:
            spi_qs = spi_qs.filter(purchase_order__project_id=self.project_id)

        for spi in spi_qs:
            amount = spi.balance_gtq   # amount pending (not yet paid)
            if amount <= Decimal('0'):
                continue
            if spi.due_date:
                label = self._period_for(spi.due_date, periods)
                if label:
                    period_map[label]['outflows']['supplier_invoices'] += amount
                elif spi.due_date < first_date:
                    period_map[first_label]['outflows']['supplier_invoices'] += amount
                else:
                    unscheduled['outflows']['supplier_invoices'] += amount
            else:
                period_map[first_label]['outflows']['supplier_invoices'] += amount

        # ── Outflows: approved subcontractor certifications (net payable) ─────
        cert_qs = SubcontractorCertification.objects.filter(
            status=CertificationStatus.APPROVED,
        ).select_related('contract__project')
        if self.project_id:
            cert_qs = cert_qs.filter(contract__project_id=self.project_id)

        for cert in cert_qs:
            amount = cert.net_payable_gtq
            if amount <= Decimal('0'):
                continue
            ref_date = getattr(cert, 'approved_at', None)
            if ref_date:
                cert_date = ref_date.date() if hasattr(ref_date, 'date') else ref_date
                label = self._period_for(cert_date, periods)
                if label:
                    period_map[label]['outflows']['subcontractors'] += amount
                else:
                    period_map[first_label]['outflows']['subcontractors'] += amount
            else:
                period_map[first_label]['outflows']['subcontractors'] += amount

        # ── Compute totals, net, cumulative ───────────────────────────────────
        cumulative = Decimal('0.00')
        for p in period_list:
            # Quantize inflows
            p['inflows']['invoices']   = p['inflows']['invoices'].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            p['inflows']['milestones'] = p['inflows']['milestones'].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            p['inflows']['total']      = (p['inflows']['invoices'] + p['inflows']['milestones']).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            # Quantize outflows
            p['outflows']['supplier_invoices'] = p['outflows']['supplier_invoices'].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            p['outflows']['subcontractors']    = p['outflows']['subcontractors'].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            p['outflows']['total']             = (p['outflows']['supplier_invoices'] + p['outflows']['subcontractors']).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            # Net & cumulative
            p['net']        = (p['inflows']['total'] - p['outflows']['total']).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            cumulative      += p['net']
            p['cumulative'] = cumulative.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        # Quantize unscheduled
        for side in ('inflows', 'outflows'):
            for k in list(unscheduled[side].keys()):
                unscheduled[side][k] = unscheduled[side][k].quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        unscheduled['inflows']['total']  = (unscheduled['inflows']['invoices'] + unscheduled['inflows']['milestones']).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        unscheduled['outflows']['total'] = (unscheduled['outflows']['supplier_invoices'] + unscheduled['outflows']['subcontractors']).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        return {
            'as_of_date':   self.as_of_date.isoformat(),
            'currency':     'GTQ',
            'months':       self.months,
            'periods':      period_list,
            'unscheduled':  unscheduled,
        }


# ─── EquipmentReconciliationService ──────────────────────────────────────────

class EquipmentReconciliationService:
    """
    Concilia el costo analítico de equipo (tarifa interna × horas) con el
    costo contable real (depreciación + mantenimiento) para un período.

    Propósito: verificar que la tarifa interna del activo sea adecuada y que
    los costos analíticos asignados a proyectos reflejen correctamente el
    costo real de usar ese equipo.

    Fuentes:
        Costo contable:
            - AssetDepreciationEntry (is_posted, para el período)
            - MaintenanceRecord.cost_gtq (como referencia — el gasto real
              puede estar en Expense o SupplierInvoice)
        Costo analítico:
            - EquipmentUsageLog.total_cost_including_fuel_gtq (por fecha en el período)

    Anti-doble-conteo:
        Si el combustible se registra TAMBIÉN como Expense o SupplierInvoice,
        el costo analítico (que incluye fuel_cost_gtq del UsageLog) puede estar
        inflado. Esto se muestra como variación positiva en el reporte.

    Salida por activo:
        - accounting_cost: depreciación del período + mantenimiento del período
        - analytical_cost: suma de allocated_cost + fuel de UsageLogs del período
        - variance:        analytical_cost − accounting_cost
        - variance_pct:    variance / accounting_cost × 100  (si accounting_cost > 0)
        - hours_logged:    suma de hours_used en el período
        - rate_review_needed: True si abs(variance_pct) > threshold (20 % por defecto)
    """

    VARIANCE_THRESHOLD_PCT = Decimal('20.0')  # % de variación que dispara alerta

    def __init__(self, year: int, month_from: int = 1, month_to: int = 12):
        import datetime
        import calendar
        self.year       = year
        self.month_from = month_from
        self.month_to   = month_to
        self.date_from  = datetime.date(year, month_from, 1)
        last_day        = calendar.monthrange(year, month_to)[1]
        self.date_to    = datetime.date(year, month_to, last_day)

    def get_reconciliation(self):
        """
        Retorna:
        {
          'year': int, 'month_from': int, 'month_to': int,
          'date_from': str, 'date_to': str,
          'currency': 'GTQ',
          'assets': [ <per-asset row> ],
          'totals': { 'accounting_cost', 'analytical_cost', 'variance', 'hours_logged' },
          'summary': { 'assets_reviewed', 'assets_alert', 'avg_variance_pct' }
        }
        """
        from django.db.models import Sum
        from apps.assets.models import FixedAsset, AssetDepreciationEntry, EquipmentUsageLog, MaintenanceRecord

        # All assets that have either depreciation entries OR usage logs in the period
        active_asset_ids = set()

        dep_ids = AssetDepreciationEntry.objects.filter(
            accounting_period__year=self.year,
            accounting_period__month__gte=self.month_from,
            accounting_period__month__lte=self.month_to,
        ).values_list('asset_id', flat=True)
        active_asset_ids.update(dep_ids)

        usage_ids = EquipmentUsageLog.objects.filter(
            usage_date__gte=self.date_from,
            usage_date__lte=self.date_to,
        ).values_list('asset_id', flat=True)
        active_asset_ids.update(usage_ids)

        assets = FixedAsset.objects.filter(
            id__in=active_asset_ids
        ).select_related('category').order_by('category__name', 'name')

        rows = []
        total_accounting  = Decimal('0.00')
        total_analytical  = Decimal('0.00')
        total_hours       = Decimal('0.00')
        alert_count       = 0

        for asset in assets:
            # Costo contable: depreciación posted en el período
            dep_cost = AssetDepreciationEntry.objects.filter(
                asset=asset,
                is_posted=True,
                accounting_period__year=self.year,
                accounting_period__month__gte=self.month_from,
                accounting_period__month__lte=self.month_to,
            ).aggregate(t=Sum('amount_gtq'))['t'] or Decimal('0.00')

            # Mantenimiento del período (referencial — costo puede estar en Expense/SPI)
            maint_cost = MaintenanceRecord.objects.filter(
                asset=asset,
                maintenance_date__gte=self.date_from,
                maintenance_date__lte=self.date_to,
            ).aggregate(t=Sum('cost_gtq'))['t'] or Decimal('0.00')

            accounting_cost = (dep_cost + maint_cost).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

            # Costo analítico: UsageLogs del período
            usage_logs = EquipmentUsageLog.objects.filter(
                asset=asset,
                usage_date__gte=self.date_from,
                usage_date__lte=self.date_to,
            )
            analytical_cost = sum(
                log.total_cost_including_fuel_gtq for log in usage_logs
            )
            analytical_cost = (analytical_cost or Decimal('0.00')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            hours_logged = usage_logs.aggregate(h=Sum('hours_used'))['h'] or Decimal('0.00')

            variance = (analytical_cost - accounting_cost).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            variance_pct = (
                (variance / accounting_cost * Decimal('100')).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
                if accounting_cost > Decimal('0') else None
            )
            rate_review_needed = (
                variance_pct is not None and abs(variance_pct) > self.VARIANCE_THRESHOLD_PCT
            ) or (accounting_cost == Decimal('0') and analytical_cost > Decimal('0'))

            if rate_review_needed:
                alert_count += 1

            rows.append({
                'asset_id':           asset.id,
                'asset_number':       asset.asset_number,
                'asset_name':         asset.name,
                'category':           asset.category.name,
                'internal_rate':      str(asset.internal_rate_gtq_per_hour),
                'rate_last_reviewed': asset.rate_last_reviewed_at.isoformat() if asset.rate_last_reviewed_at else None,
                'depreciation_cost':  str(dep_cost.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)),
                'maintenance_cost':   str(maint_cost.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)),
                'accounting_cost':    str(accounting_cost),
                'analytical_cost':    str(analytical_cost),
                'hours_logged':       str(hours_logged.quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)),
                'variance':           str(variance),
                'variance_pct':       str(variance_pct) if variance_pct is not None else None,
                'rate_review_needed': rate_review_needed,
            })

            total_accounting += accounting_cost
            total_analytical += analytical_cost
            total_hours      += hours_logged

        grand_variance = (total_analytical - total_accounting).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        avg_var_pct = (
            (grand_variance / total_accounting * Decimal('100')).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
            if total_accounting > Decimal('0') else None
        )

        return {
            'year':            self.year,
            'month_from':      self.month_from,
            'month_to':        self.month_to,
            'date_from':       self.date_from.isoformat(),
            'date_to':         self.date_to.isoformat(),
            'currency':        'GTQ',
            'assets':          rows,
            'totals': {
                'accounting_cost':  str(total_accounting.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)),
                'analytical_cost':  str(total_analytical.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)),
                'variance':         str(grand_variance),
                'variance_pct':     str(avg_var_pct) if avg_var_pct is not None else None,
                'hours_logged':     str(total_hours.quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)),
            },
            'summary': {
                'assets_reviewed': len(rows),
                'assets_alert':    alert_count,
                'variance_threshold_pct': str(self.VARIANCE_THRESHOLD_PCT),
            },
        }
