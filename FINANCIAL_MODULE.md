# Módulo Financiero ERP — Grucore

> Documento de implementación del módulo financiero integrado.
> Implementado con la skill `construction-remodeling-finance-gt`.
> Estado: **Bloques 0–10 + 11A + 11B + 11C completos. Módulo financiero cerrado.**

---

## Resumen ejecutivo

Grucore es un ERP de gestión de proyectos de construcción y remodelación para Guatemala.
Este documento cubre la implementación del módulo financiero completo, que eleva el sistema
de un tracker de proyectos a un ERP con contabilidad de doble entrada, control de costos
por proyecto, y reportería P&L por proyecto y por empresa.

**Stack:** Django 5.x + DRF · PostgreSQL 16 · Unfold admin  
**Moneda de gestión:** GTQ (Quetzal guatemalteco)  
**Jurisdicción:** Guatemala · IVA 12% · FEL (SAT) · IGSS

---

## Arquitectura general

```
contrato cliente
    └── ProjectBudget (versionado: original + revisiones OC)
            │
            ├── PurchaseRequisition → PurchaseOrder → GoodsReceipt → StockMovement
            │       └── SupplierInvoice → SupplierPayment
            │
            ├── SubcontractorContract → Certification → RetentionRelease
            │
            ├── WorkLog (mano de obra) ─────────────────┐
            ├── EquipmentUsageLog (maquinaria) ──────────┤
            ├── Expense (gastos varios) ─────────────────┤
            └── Invoice (factura al cliente) ────────────┤
                                                         ▼
                                              JournalEntry / JournalLine
                                              (doble entrada · Bloque 8)
```

---

## Apps instaladas

| App | Descripción | Migración |
|-----|-------------|-----------|
| `apps.core` | CostCenter, CostCode, CompanySettings | existente + extendida |
| `apps.ledger` | AccountingPeriod, Account (270), JournalEntry/Line, TaxRule, PeriodCloseLog, AccountMapping | `0001_initial` → `0004_accountmapping_add_labor_keys` |
| `apps.projects` | Project + **ProjectBudget versionado** | `0014_projectbudget_projectbudgetline` |
| `apps.purchasing` | PR → PO → GR → SupplierInvoice → SupplierPayment | `0001_initial` |
| `apps.assets` | FixedAsset, EquipmentUsageLog, Depreciation, Maintenance | `0001_initial` |
| `apps.subcontractors` | SubcontractorContract, Certification, RetentionRelease | `0001_initial` |

---

## Bloque 0 — Correcciones críticas de precisión

**Problema:** Aritmética `float()` en modelos financieros (pérdida de centavos en GTQ).

**Corrección en `apps.workers.models`:**
- `IGSS_PATRONAL = Decimal('0.1067')`, `IGSS_LABORAL = Decimal('0.0483')`
- Todas las propiedades de `WorkLog` usan `Decimal` + `ROUND_HALF_UP`
- `hourly_rate`, `regular_pay`, `overtime_pay`, `gross_pay`, `igss_patronal`, `total_cost`

**Corrección en `apps.financials.models`:**
- `Invoice.total_with_tax` → `Decimal` (era `float`)
- `Invoice.tax_amount` → nueva propiedad `Decimal`

**Regla:** Todo cálculo monetario usa `Decimal` con `ROUND_HALF_UP`. Nunca `float()`.

---

## Bloque 1 — Dimensiones analíticas y libro mayor

### `apps.core` — nuevos modelos

**`CostCenter`** (5 centros base):

| Código | Nombre | Tipo |
|--------|--------|------|
| OBRA | Obra directa | obra |
| ADMIN | Administración | admin |
| COMERCIAL | Comercial | comercial |
| MAQUINARIA | Maquinaria y equipo | maquinaria |
| OPERACIONES | Operaciones | operaciones |

**`CostCode`** (36 códigos base):
- Categorías: materiales, mano de obra, subcontratistas, equipos, logística, overhead
- `cost_behavior`: variable / fijo / semivariable
- `default_account` FK a `ledger.Account` (para posting automático en Bloque 8)

### `apps.ledger` — contabilidad de doble entrada

**`AccountingPeriod`**
- año + mes, estado open/closed/locked
- `close()` → closed; `lock()` → locked (irreversible)
- `get_or_create_for_date(date)` — helper para crear período al vuelo

**`Account`** — catálogo de cuentas
- 270 cuentas precargadas (clases 1–9, jerarquía padre/hijo)
- `PLGroup` enum → mapeo a 19 líneas del P&L (usada en Bloque 8 para reportes)
- `level`: header (no posteable) / posting (posteable)
- Tipos: asset / liability / equity / revenue / expense

**`JournalEntry`**
- Numeración: `AST-{year}-{seq:05d}`
- `origin_type` (15 valores): expense, invoice, worklog, po, goods_receipt, supplier_invoice, payment, depreciation, subcontractor_cert, retention_release, adjustment, opening, closing, other
- `GenericForeignKey` → drill-down desde cualquier asiento al documento fuente
- Estados: draft → posted → reversed
- `post()`: valida débitos == créditos, bloquea período locked
- `reverse()`: crea asiento simétrico, vincula `reversed_by`

**`JournalLine`**
- Debit / Credit (Decimal, nunca ambos en una línea)
- Dimensiones: project, phase, cost_code, cost_center
- `clean()`: valida cuenta nivel posting, exactamente un lado, no negativo

**Seed command:** `python manage.py seed_ledger`
- Idempotente (usa `get_or_create`)
- `--reset` para dev: elimina y recrea todo
- Salida: `✓ Seed completado correctamente.`

### Nuevos campos en modelos existentes

| Modelo | Campo nuevo |
|--------|-------------|
| `Expense` | `cost_code` FK, `cost_center` FK, `accounting_period` FK |
| `Expense` | `project` → nullable (overhead sin proyecto) |
| `Invoice` | `accounting_period` FK, `fel_number`, `fel_status`, `fel_certified_at` |
| `WorkLog` | `phase` FK, `cost_code` FK |
| `StockMovement` | `phase` FK, `cost_code` FK |

---

## Bloque 3 — Presupuesto de proyecto versionado

### Diseño

**Principio clave:** El presupuesto original es inmutable una vez aprobado.
Toda modificación se registra como una `revision` vinculada a una `ChangeOrder` aprobada.

**Fórmula:**
```
Valor de contrato vigente = Σ revenue_gtq de versiones APPROVED
Costo presupuestado vigente = Σ cost_gtq de versiones APPROVED
```

### Modelos en `apps.projects`

**`ProjectBudget`**

| Campo | Descripción |
|-------|-------------|
| `version_number` | Auto-incremento por proyecto |
| `version_type` | `original` / `revision` |
| `status` | `draft` → `approved` |
| `revenue_gtq` | Original: total contrato. Revisión: delta OC |
| `cost_gtq` | Original: costo total. Revisión: delta costo OC |
| `linked_quote` | Cotización que originó el presupuesto original |
| `linked_change_order` | OC que originó la revisión |

**Métodos:**
- `approve(user)`: valida único original, sincroniza `Project.total_budget_gtq`, immutabilidad
- `create_from_quote(quote, user)`: copia QuoteLineItems como líneas de presupuesto
- `create_revision_from_change_order(co, cost_delta, user)`: crea revisión desde OC aprobada

**`ProjectBudgetLine`**

| Campo | Descripción |
|-------|-------------|
| `cost_code` FK | Dimensión analítica |
| `quantity`, `unit_cost_gtq`, `unit_price_gtq` | Costo y precio por unidad |
| `delta_type` | `original` / `added` / `modified` / `removed` |

**Propiedades nuevas en `Project`:**
- `current_contract_value_gtq` — suma de revenue_gtq aprobados
- `current_budget_cost_gtq` — suma de cost_gtq aprobados  
- `original_budget` — primera versión original aprobada

---

## Bloque 4 — Módulo de compras

### Flujo completo: PR → PO → GR → SPI → PAY

```
PurchaseRequisition  →  PurchaseOrder  →  GoodsReceipt  →  SupplierInvoice  →  SupplierPayment
    (solicitud)           (compromiso)       (recepción)      (CxP / pasivo)      (liquidación)
```

### Numeración automática

| Documento | Formato |
|-----------|---------|
| Requisición | `PR-2026-0001` |
| Orden de compra | `PO-2026-0001` |
| Recepción | `GR-2026-0001` |
| Factura proveedor | `SPI-2026-0001` |
| Pago | `PAY-2026-0001` |

### Estados

**`PurchaseOrder`:** draft → sent → confirmed → partially_received → received → invoiced → cancelled

**`GoodsReceipt.post()`:**
1. Valida cantidades por línea (`quantity_received ≤ po_line.remaining_qty`)
2. Crea `StockMovement(IN)` en `apps.inventory` para líneas con producto
3. Actualiza estado PO (`partially_received` / `received`)

**`SupplierPayment.post()`:**
1. Valida total asignado ≤ monto del pago
2. Valida que facturas sean del mismo proveedor
3. Marca `SupplierInvoice.status = paid` cuando saldo cubierto

### Anti-doble conteo en inventario

El signal `post_save` en `inventory.StockMovement` actualiza `product.stock_quantity` automáticamente.
`GoodsReceipt.post()` crea el movimiento → el signal actualiza el stock.
No hay doble conteo porque el movimiento es el único origen del cambio de stock.

### IVA

Campo `tax_percentage` en `PurchaseOrder` y `SupplierInvoice`, default `12.00`.
**Marcado como: pending validación contador según régimen del proveedor.**

---

## Bloque 5 — Activos fijos y uso de equipos

### Modelos en `apps.assets`

**`AssetCategory`**
- `sat_max_depreciation_rate_pct`: tasa máxima SAT (referencia, no automática)
- **Pendiente validación contador** — no aplicar como deducción automática

**`FixedAsset`**

| Campo | Descripción |
|-------|-------------|
| `asset_number` | Auto `ACT-2026-0001` |
| `depreciation_method` | straight_line / declining_balance / units_of_production |
| `useful_life_years` | Vida útil contable |
| `residual_value_gtq` | Valor al final de vida útil |
| `in_service_date` | Inicio depreciación (default: acquisition_date) |
| `internal_rate_gtq_per_hour` | Tarifa analítica para cargar a proyectos |

**Propiedades calculadas:**
- `monthly_depreciation_gtq`: línea recta = (costo − residual) / (vida_útil_años × 12)
- `accumulated_depreciation_gtq`: suma de entradas posted
- `net_book_value_gtq`: costo − acumulada

**`FixedAsset.generate_depreciation_entry(period, user)`:**
- Idempotente (no duplica si ya existe para el período)
- Respeta valor residual (limita monto si net_book_value ≤ residual)

**`EquipmentUsageLog`**
- `rate_gtq_per_hour`: snapshot inmutable al crear el registro
- `allocated_cost_gtq = hours_used × rate_gtq_per_hour`
- Auto-snapshot de tarifa en `save()` si no se especifica

### Principio anti-doble conteo equipos

La tarifa analítica (uso) y la depreciación contable son **dos vistas del mismo costo**:
- La depreciación va al libro mayor (GL expense)
- La tarifa analítica va al proyecto (management accounting)
- **No sumar ambas en el P&L** — el Bloque 8 implementará la conciliación

---

## Bloque 6 — Subcontratistas

### Modelos en `apps.subcontractors`

**`SubcontractorContract`**

| Campo | Descripción |
|-------|-------------|
| Numeración | `SC-2026-0001` |
| `subcontractor` | FK a `suppliers.Supplier` (filtrado: category='subcontractor') |
| `contract_value_gtq` | Valor total acordado (compromiso) |
| `retention_pct` | % retenido por certificación (default 10%) |
| `advance_paid_gtq` | Total anticipos desembolsados |
| `advance_recovered_gtq` | Total recuperado en certificaciones |

**Estados financieros distinguidos:**

```
contract_value_gtq       → monto comprometido
total_certified_gtq      → suma certificaciones aprobadas (costo incurrido)
total_retention_withheld → retención acumulada
retention_balance_gtq    → retención pendiente de liberar
advance_balance_gtq      → anticipo pendiente de recuperar
```

**`SubcontractorCertification`**

Valoración de avance de obra:

```
net_payable = amount_certified − retention_withheld − advance_recovery
```

- Número secuencial por contrato
- `approve(user)`: valida que total certificado no supere valor de contrato
- Vinculación a `purchasing.SupplierInvoice` (OneToOne) para el flujo de pago

**`SubcontractorRetentionRelease`**

- Libera retención al completar el contrato (o por hito)
- `post()`: valida que no se libere más del saldo disponible
- Vinculación a `purchasing.SupplierInvoice` para que el subcontratista facture la retención

---

## Estados financieros distinguidos (principio global)

El sistema distingue explícitamente los siguientes estados en todos los módulos:

| Estado | Dónde se registra |
|--------|-------------------|
| **Presupuestado** | `ProjectBudget.cost_gtq` (aprobado) |
| **Comprometido** | `PurchaseOrder` confirmed / `SubcontractorContract` active |
| **Incurrido/accrual** | `GoodsReceipt` posted / `SubcontractorCertification` approved |
| **Facturado** | `SupplierInvoice` posted |
| **Pagado** | `SupplierPayment` posted / `SupplierInvoice.status = paid` |

---

## Dimensiones analíticas obligatorias

Todas las transacciones de costo directo tienen:

| Dimensión | Obligatoria en costo directo |
|-----------|------------------------------|
| `project` | Sí |
| `phase` | Opcional |
| `cost_code` | Recomendado |
| `cost_center` | Obligatorio si no hay proyecto (overhead) |
| `accounting_period` | Recomendado |

---

## Guatemala-specific

| Feature | Estado | Nota |
|---------|--------|------|
| FEL en `Invoice` (factura cliente) | Implementado | `fel_number`, `fel_status`, `fel_certified_at` |
| FEL en `SupplierInvoice` (factura proveedor) | Implementado | Para crédito IVA |
| IVA 12% en PO y SupplierInvoice | Implementado | **Pending validación contador** |
| IGSS patronal 10.67% | Implementado | **Pending validación contador** |
| IGSS laboral 4.83% | Implementado | **Pending validación contador** |
| Tasas SAT depreciación | En `AssetCategory` (referencia) | **Pending validación contador** |
| ISR | No hardcodeado | `TaxRule` configurable — ver Bloque 7 |
| Reporte semestral inventario SAT | Implementado | `manage.py sat_inventory_report` |

---

## Bloque 7 — TaxRule + cierre de período

### `TaxRule` — Reglas fiscales configurables

**Diseño:** Nunca hardcodear tasas. Toda tasa tributaria es una fila en `TaxRule`.

| Campo | Descripción |
|-------|-------------|
| `tax_type` | iva / isr_retention / isr_corporate / igss_patronal / igss_laboral / stamp_duty / other |
| `rate_pct` | `DecimalField(max_digits=7, decimal_places=4)` |
| `applies_from` / `applies_to` | Rango de vigencia |
| `regime` | Texto libre (ej. "Opcional Simplificado sobre Ingresos") |
| `requires_fel` | Si la regla exige FEL para aplicar |

**Uso:**
```python
rate = TaxRule.get_active_rate('iva', date=today)  # → Decimal o None
# None = no hay regla configurada → pending validación contador
```

**Admin:** `TaxRuleAdmin` con badge de tasa en monospace y badge activa/inactiva.

### `PeriodCloseLog` — Auditoría de cierre

Cada acción de cierre (`close`) o bloqueo (`lock`) genera una fila con:
- usuario que realizó la acción
- número de entradas de depreciación generadas
- número de asientos en borrador que quedaron sin postear (advertencia)
- notas de auditoría

### Comando `close_period`

```bash
python manage.py close_period --year 2026 --month 9
python manage.py close_period --year 2026 --month 9 --dry-run   # solo informe
python manage.py close_period --year 2026 --month 9 --lock      # cierre + bloqueo
python manage.py close_period --year 2026 --month 9 --user admin
```

**Flujo de cierre:**
1. Preflight: cuenta asientos draft + facturas SPI draft no procesadas
2. Genera depreciación para todos los `FixedAsset` activos con `straight_line` (idempotente)
3. Llama `period.close(user)`
4. Si `--lock`: llama `period.lock(user)`
5. Registra en `PeriodCloseLog`

### Comando `sat_inventory_report`

```bash
python manage.py sat_inventory_report
python manage.py sat_inventory_report --date 2026-06-30 --output libro_inv.csv
python manage.py sat_inventory_report --include-zero
```

Genera CSV con Libro de Inventarios (Decreto 10-2012, Art. 21):
- Agrupado por categoría con subtotales
- Columnas: N°, SKU, Descripción, Categoría, Unidad, Cantidad, Costo Unitario, Valor Total, Precio Venta
- Encabezado con advertencia explícita: **PENDIENTE VALIDACIÓN CONTADOR antes de presentar a SAT**

---

## Bloque 8 — PostingService + P&L Services + AccountMapping

### `AccountMapping` — Mapeo configurable de cuentas del sistema

Permite configurar desde el admin qué cuenta GL usa cada tipo de transacción. **Sin esto el sistema no puede postear asientos.**

| Clave (`MappingKey`) | Descripción |
|----------------------|-------------|
| `ap_suppliers` | CxP — Proveedores |
| `ap_subcontractors` | CxP — Subcontratistas |
| `retention_liability` | Retención de subcontratistas (pasivo) |
| `inventory_materials` | Inventario de materiales |
| `cash_bank` | Banco / Caja |
| `accrued_ap` | Acumulaciones por pagar |
| `depreciation_expense` | Gasto de depreciación |
| `accumulated_depr` | Depreciación acumulada (activo contra) |
| `direct_labor_expense` | Gasto de mano de obra directa |
| `iva_credit_fiscal` | IVA Crédito Fiscal (activo) |
| `ar_clients` | CxC — Clientes |
| `revenue_services` | Ingresos por servicios / obra |

**Uso:**
```python
from apps.ledger.models import AccountMapping
account = AccountMapping.get('ap_suppliers')  # → Account instance
# Lanza ValueError si no está configurado
```

**Admin:** `AccountMappingAdmin` con código de cuenta en monospace. Sidebar: Contabilidad → Mapeos de cuentas.

**Migration:** `ledger.0003_accountmapping`

### `PostingService` — `apps/ledger/services.py`

Todos los métodos son `@transaction.atomic` e idempotentes (no duplican asientos).

| Método | Crea asiento | Débito | Crédito |
|--------|-------------|--------|---------|
| `create_po_commitment(po)` | Nota de compromiso (memo) | — | — |
| `post_goods_receipt(gr)` | `goods_receipt` | `inventory_materials` (subtotal) | `accrued_ap` |
| `post_supplier_invoice(spi)` | `supplier_invoice` | cuenta de costo por línea (subtotal) | `ap_suppliers` |
| `post_supplier_payment(pay)` | `payment` | `ap_suppliers` (por factura asignada) | `cash_bank` (total) |
| `post_depreciation(dep)` | `depreciation` | `depreciation_expense` | `accumulated_depr` |
| `post_subcontractor_certification(cert)` | `subcontractor_cert` | cuenta de costo (bruto) | `ap_subcontractors` (neto) + `retention_liability` |
| `post_retention_release(release)` | `retention_release` | `retention_liability` | `ap_subcontractors` |

**Llamadas automáticas:** Cada `post()` / `approve()` operacional llama al `PostingService` correspondiente dentro de un `try/except`. La falla de contabilización **no bloquea el flujo operacional** — solo registra en log. Esto permite operar antes de configurar los `AccountMapping`.

**IVA Crédito Fiscal:** No se split automático en `post_supplier_invoice`. Documentado como **pending validación contador** — depende del régimen, documentación FEL, y elegibilidad.

### `ProjectPnLService` — P&L por proyecto

```python
from apps.ledger.services import ProjectPnLService

svc = ProjectPnLService(project, date_from=None, date_to=None)
pnl = svc.get_pnl()
```

**Fuentes de datos por línea:**

| Línea P&L | Fuente |
|-----------|--------|
| Ingresos brutos | `financials.Invoice` posted, filtrado por proyecto |
| Materiales directos | `purchasing.SupplierInvoiceLine` posted, filtrado por proyecto |
| Mano de obra | `workers.WorkLog.total_cost` × horas del proyecto |
| Subcontratistas | `subcontractors.SubcontractorCertification` approved |
| Equipos | `assets.EquipmentUsageLog.allocated_cost_gtq` por proyecto |
| Otros costos directos | `financials.Expense` approved con proyecto |

**Comparación presupuesto:** Incluye `current_budget_cost_gtq` y `current_contract_value_gtq` del proyecto.

**Forecast at completion:**
```
forecast_final_cost = incurred_to_date + estimate_to_complete
forecast_final_margin = approved_contract_value − forecast_final_cost
```
*(estimate_to_complete = campo manual en ProjectBudget — pendiente UI)*

### `CompanyPnLService` — P&L consolidado de empresa

```python
from apps.ledger.services import CompanyPnLService

svc = CompanyPnLService(year=2026, month_from=1, month_to=12)
pnl = svc.get_pnl()             # dict con 19 líneas
by_project = svc.get_by_project()  # lista resumen por proyecto activo
```

**Estructura del P&L (19 líneas, mapeadas a `PLGroup` en `Account`):**

| # | Línea | `PLGroup` |
|---|-------|-----------|
| 1 | Ingresos brutos reconocidos | `revenue` |
| 2 | Deducciones de ingresos | `revenue_deductions` |
| 3 | **Ingresos netos** | — |
| 4 | Materiales directos consumidos | `direct_materials` |
| 5 | Mano de obra directa + IGSS patronal | `direct_labor` |
| 6 | Subcontratistas | `subcontractors` |
| 7 | Equipos y maquinaria | `equipment` |
| 8 | Costos directos logística / obra | `direct_other` |
| 9 | **Total costos directos** | — |
| 10 | **Margen bruto de proyecto** | — |
| 11 | Costos indirectos de producción | `indirect_production` |
| 12 | Gastos corporativos por departamento | `corporate_overhead` |
| 13 | **EBITDA** | — |
| 14 | Depreciación y amortización | `depreciation_amortization` |
| 15 | **EBIT / Resultado operativo** | — |
| 16 | Resultado financiero neto | `financial_result` |
| 17 | **Resultado antes de impuestos** | — |
| 18 | ISR | `income_tax` |
| 19 | **Resultado neto** | — |

**Política EBITDA:** Costos indirectos de producción se incluyen **por encima** del EBITDA. No se restan dos veces. Depreciación de línea 14 excluye la ya incluida en costos directos de equipos.

---

## Comandos de desarrollo

```bash
# Seed del catálogo de cuentas + centros y códigos de costo
python manage.py seed_ledger
python manage.py seed_ledger --reset    # dev: elimina y recrea

# Cierre de período
python manage.py close_period --year 2026 --month 9
python manage.py close_period --year 2026 --month 9 --dry-run
python manage.py close_period --year 2026 --month 9 --lock

# Reporte Libro de Inventarios (SAT)
python manage.py sat_inventory_report
python manage.py sat_inventory_report --date 2026-06-30 --output libro.csv

# Migraciones
make migrate
```

---

## Decisiones de diseño documentadas

1. **Doble entrada real, no parche**: Se eligió implementar `apps.ledger` con doble entrada
   completa en lugar de un módulo de reportes sobre datos existentes. Eleva el producto
   de tracker a ERP auténtico.

2. **Presupuesto aditivo por deltas**: Las revisiones de presupuesto almacenan deltas,
   no copias completas. `current = original + Σ revisiones aprobadas`. Trazabilidad total.

3. **Tarifa analítica vs. depreciación contable**: El uso de equipos usa una tarifa interna
   (gestión) y la depreciación va al GL. El Bloque 8 implementará la conciliación para
   evitar doble conteo en P&L.

4. **FKs de string para referencias cruzadas**: Todos los FKs entre apps usan string
   references (`'projects.Project'`) para evitar imports circulares.

5. **Snapshot de tarifa en EquipmentUsageLog**: La tarifa GTQ/hora se copia al momento
   del registro (inmutable). Cambios futuros en la tarifa no afectan registros históricos.

6. **Retención de subcontratistas como pasivo explícito**: `retention_withheld_gtq` se
   registra en cada certificación y se libera explícitamente. El saldo siempre es auditable.

7. **IVA y tasas de impuesto configurables**: Ninguna tasa está hardcodeada como definitiva.
   Todo campo de tasa viene acompañado de `help_text` indicando **pending validación contador**.

8. **PostingService no bloquea flujo operacional**: Las llamadas a PostingService desde `post()`/`approve()` están envueltas en `try/except`. Si `AccountMapping` no está configurado, la operación operacional procede igual. Permite arrancar el sistema sin configuración contable completa.

9. **AccountMapping como tabla de configuración**: En lugar de hardcodear claves de cuentas en el código, se usa `AccountMapping` con `MappingKey` choices. Configurable desde el admin sin deployments.

10. **IVA Crédito Fiscal no auto-split**: `post_supplier_invoice` no crea línea de IVA Crédito Fiscal automáticamente. Pendiente validación contador — la elegibilidad depende del régimen, la documentación FEL, y las resoluciones SAT vigentes.

---

---

## Bloque 9 — REST API (capa de integración Next.js / frontend)

### Alcance

Serializers + Views + URLs para todos los módulos financieros nuevos:

| App | Prefijo | Archivos creados |
|-----|---------|-----------------|
| `apps.purchasing` | `/api/purchasing/` | `serializers.py`, `views.py`, `urls.py` |
| `apps.assets` | `/api/assets/` | `serializers.py`, `views.py`, `urls.py` |
| `apps.subcontractors` | `/api/subcontractors/` | `serializers.py`, `views.py`, `urls.py` |
| `apps.ledger` | `/api/ledger/` | `serializers.py`, `views.py`, `urls.py` |

Todos registrados en `grucore/urls.py`.

### Endpoints

**Purchasing** (`/api/purchasing/`):

| Método | URL | Descripción |
|--------|-----|-------------|
| GET/POST | `requisitions/` | Listar / crear PR |
| GET/PUT/DELETE | `requisitions/<pk>/` | Detalle PR |
| POST | `requisitions/<pk>/approve/` | Aprobar PR |
| GET/POST | `orders/` | Listar / crear PO |
| GET/PUT/DELETE | `orders/<pk>/` | Detalle PO |
| POST | `orders/<pk>/confirm/` | Confirmar PO (crea compromiso) |
| GET/POST | `receipts/` | Listar / crear GR |
| POST | `receipts/<pk>/post/` | Registrar recepción |
| GET/POST | `invoices/` | Listar / crear SPI |
| POST | `invoices/<pk>/post/` | Registrar factura proveedor |
| GET/POST | `payments/` | Listar / crear pago |
| POST | `payments/<pk>/post/` | Registrar pago |

**Assets** (`/api/assets/`):

| Método | URL | Descripción |
|--------|-----|-------------|
| GET/POST | `categories/` | Categorías |
| GET/POST | `` (raíz) | Activos fijos |
| GET | `<pk>/depreciation/` | Entradas de depreciación del activo |
| GET/POST | `<pk>/usage/` | Registros de uso del activo |
| GET/POST | `usage/` | Todos los registros de uso (filtrar por `?project=`) |

**Subcontractors** (`/api/subcontractors/`):

| Método | URL | Descripción |
|--------|-----|-------------|
| GET/POST | `contracts/` | Contratos |
| GET/POST | `contracts/<pk>/certifications/` | Certificaciones del contrato |
| POST | `contracts/<contract_pk>/certifications/<pk>/approve/` | Aprobar certificación |
| GET/POST | `retentions/` | Liberaciones de retención |
| POST | `retentions/<pk>/post/` | Registrar liberación |

**Ledger** (`/api/ledger/`):

| Método | URL | Descripción |
|--------|-----|-------------|
| GET/POST | `periods/` | Períodos contables |
| GET | `accounts/` | Catálogo de cuentas (lectura) |
| GET/POST | `journal/` | Asientos contables |
| POST | `journal/<pk>/post/` | Contabilizar asiento draft |
| GET/POST | `tax-rules/` | Reglas fiscales |
| GET | `account-mappings/` | Mapeos de cuentas del sistema |
| PUT/PATCH | `account-mappings/<pk>/` | Actualizar mapeo |
| GET | `pnl/company/?year=&month_from=&month_to=` | P&L consolidado empresa |
| GET | `pnl/project/<pk>/?date_from=&date_to=` | P&L detallado por proyecto |

### Patrones de diseño

- `generics.ListCreateAPIView` + `generics.RetrieveUpdateDestroyAPIView` para CRUD estándar
- `APIView` para acciones de transición de estado (`approve`, `confirm`, `post`)
- Permisos: `permissions.IsAuthenticated` base; acciones financieras requieren `role in ('admin', 'project_manager')`
- Campos calculados expuestos como `ReadOnlyField` (no se duplican en BD)
- Filtros: `DjangoFilterBackend` + `SearchFilter` + `OrderingFilter` en todos los listados
- Computed properties del modelo (totales, balances, `is_overdue`, etc.) expuestos en serializer sin lógica de negocio en la vista

### Respuesta de P&L Company (estructura)

```json
{
  "year": 2026, "month_from": 1, "month_to": 12, "currency": "GTQ",
  "pnl": {
    "gross_revenue": "...",
    "net_revenue": "...",
    "direct_materials": "...",
    "gross_margin": "...",
    "ebitda": "...",
    "ebit": "...",
    "net_profit": "..."
  },
  "by_project": [
    {"project_id": 1, "project_name": "...", "gross_revenue": "...", "gross_margin": "..."}
  ]
}
```

### Respuesta de P&L Project (estructura)

```json
{
  "project_id": 1, "project_name": "...", "currency": "GTQ",
  "pnl": {
    "gross_revenue": "...",
    "direct_materials": "...",
    "gross_margin": "...",
    "budget_cost": "...",
    "budget_variance": "...",
    "forecast_final_cost": "...",
    "forecast_final_margin": "..."
  },
  "summary": { ... }
}
```

---

---

## Bloque 10 — Frontend Next.js (módulo financiero)

### Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `frontend/src/lib/api-finance.ts` | API client tipado para todos los módulos financieros |
| `frontend/src/app/erp/compras/page.tsx` | Página de compras (OC, facturas, pagos) |
| `frontend/src/app/erp/finanzas/page.tsx` | Dashboard P&L (empresa + proyectos) |
| `frontend/src/app/erp/activos/page.tsx` | Activos fijos + registros de uso |
| `frontend/src/app/erp/subcontratistas/page.tsx` | Contratos + certificaciones |
| `frontend/src/components/erp/ERPSidebar.tsx` | + grupo "Financiero" en el sidebar |

### `lib/api-finance.ts` — Tipos exportados

`PurchaseOrder`, `PurchaseOrderLine`, `SupplierInvoice`, `SupplierInvoiceLine`, `SupplierPayment`, `SupplierPaymentAllocation`, `AssetCategory`, `FixedAsset`, `EquipmentUsageLog`, `SubcontractorContract`, `SubcontractorCertification`, `AccountingPeriod`, `CompanyPnL`, `ProjectPnL`, `CompanyPnLResponse`, `ProjectPnLResponse`

### Rutas disponibles

| Ruta | Descripción |
|------|-------------|
| `/erp/compras` | OC con expand inline de líneas · Confirm / Registrar factura / Registrar pago |
| `/erp/finanzas` | P&L empresa con selector año/mes · Drill-down por proyecto |
| `/erp/activos` | Grilla de activos con NBV bar · Panel de uso por activo |
| `/erp/subcontratistas` | Contratos con progreso · Panel de certificaciones con Aprobar |

### Sidebar — grupo "Financiero"

```
Financiero ▾
  Compras          /erp/compras
  Finanzas / P&L   /erp/finanzas
  Activos fijos    /erp/activos
  Subcontratistas  /erp/subcontratistas
```

---

## Nota sobre numeración de bloques

**El Bloque 2 no existe.** Fue omitido en la numeración original porque su contenido
(extensiones a modelos existentes: `Expense.cost_code`, `Invoice.fel_number`,
`WorkLog.phase`, `StockMovement.cost_code`) fue incorporado directamente en el Bloque 1
como parte de la sección "Nuevos campos en modelos existentes". No hay implementación faltante;
simplemente se saltó el número 2 en la secuencia de bloques.

La secuencia correcta es: 0 · 1 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11A

---

## Bloque 11A — Costo laboral: posting y conciliación

### Objetivo

Conectar las jornadas de trabajo (`WorkLog`) al libro mayor mediante un asiento de doble
entrada que reconoce: salario bruto (gasto directo), cuota patronal IGSS (gasto/pasivo) y
la obligación de nómina total (sueldos por pagar).

### Nuevas claves en `MappingKey`

| Clave | Descripción |
|-------|-------------|
| `payroll_liability` | Sueldos y salarios por pagar (pasivo) |
| `igss_patronal_liab` | Cuota patronal IGSS por pagar (pasivo) |

Migración: `ledger/migrations/0004_accountmapping_add_labor_keys.py`

### Asiento generado por `PostingService.post_worklog_batch()`

Por cada proyecto presente en el lote:

```
DR  Gasto mano de obra directa   [direct_labor_expense]   gross_pay
DR  Cuota patronal IGSS por pagar[igss_patronal_liab]      igss_patronal
CR  Sueldos y salarios por pagar [payroll_liability]        total_cost
```

Donde `total_cost = gross_pay + igss_patronal`.

**NOTA IGSS:** Las tasas `IGSS_PATRONAL = 10.67 %` provienen de `workers.models`.
Requieren validación por contador guatemalteco antes de usar en producción.

### Idempotencia

El llamador (comando o vista) es responsable de enviar únicamente los worklogs del período.
`post_worklog_batch` no verifica si ya existe asiento previo; la validación de duplicados
debe hacerse antes de invocar el método (por ejemplo, verificar que el período no tenga
asientos `WORKLOG` previos).

### Management command

```bash
# Simula sin crear asientos
python manage.py post_labor_costs --year 2025 --month 3 --dry-run

# Contabiliza (usa primer superusuario como autorizador)
python manage.py post_labor_costs --year 2025 --month 3

# Especifica usuario autorizador
python manage.py post_labor_costs --year 2025 --month 3 --user-id 2
```

### API endpoint

```
POST /api/workers/worklogs/post-batch/
Body: { "year": 2025, "month": 3 }
Requiere: rol admin o project_manager
```

Respuesta exitosa (`201`):
```json
{
  "entries_created": 2,
  "period": "2025-03",
  "worklogs_processed": 47,
  "journal_entries": [
    {"id": 15, "number": "AST-2025-00015", "description": "Costo laboral ..."},
    ...
  ]
}
```

### Archivos modificados / creados

| Archivo | Cambio |
|---------|--------|
| `backend/apps/ledger/models.py` | + `PAYROLL_LIABILITY`, `IGSS_PATRONAL_LIAB` en `MappingKey` |
| `backend/apps/ledger/migrations/0004_…` | Migración para nuevas claves |
| `backend/apps/ledger/services.py` | + `PostingService.post_worklog_batch()` |
| `backend/apps/workers/views.py` | + `WorkLogPostBatchView` + helpers `_finance_only` |
| `backend/apps/workers/urls.py` | + `worklogs/post-batch/` |
| `backend/apps/workers/management/commands/post_labor_costs.py` | Nuevo comando |

---

---

## Bloque 11B — AR Aging + Pronóstico de flujo de caja

### Objetivo

Exponer dos vistas de liquidez que complementan el P&L: la antigüedad de la CxC vencida
(para gestión de cobranza) y el pronóstico de flujo de caja mensual (para planificación
de liquidez a corto plazo).

### `ARAgingService`

Fuente: `financials.Invoice` (status `sent` / `viewed` / `overdue`).

**Buckets de vencimiento** (relativo a `as_of_date`, por defecto hoy):

| Bucket | Descripción |
|--------|-------------|
| `current` | No vencida (due_date ≥ hoy, o sin due_date ≤ 30 días desde emisión) |
| `1_30` | 1–30 días vencida |
| `31_60` | 31–60 días vencida |
| `61_90` | 61–90 días vencida |
| `over_90` | Más de 90 días vencida |

Salida: `by_client` (array por cliente con detalle de facturas) + `totals` (grand total por bucket).

### `CashFlowForecastService`

Fuente de **inflows**: `Invoice` (unpaid) + `PaymentMilestone` (no PAID).  
Fuente de **outflows**: `SupplierInvoice` (POSTED/balance pendiente) + `SubcontractorCertification` (approved, net_payable).

Lógica de distribución: cada item va al período cuya `due_date` lo contiene.
- Items vencidos antes del primer período → se vuelcan al primer período.
- Items con `due_date` nulo → primer período (facturas/supplier invoices) o `unscheduled` (hitos sin fecha).
- Items más allá de la ventana → `unscheduled`.

Salida por período: `inflows.total`, `outflows.total`, `net`, `cumulative`.

**Limitación documentada:** no incluye nómina futura ni compras no comprometidas (PO sin factura).

### Endpoints

| Ruta | Descripción |
|------|-------------|
| `GET /api/ledger/ar-aging/` | AR aging por cliente · `?as_of=YYYY-MM-DD&project_id=N` |
| `GET /api/ledger/cash-forecast/` | Pronóstico flujo de caja · `?months=6&as_of=YYYY-MM-DD&project_id=N` |

### Frontend — `tesoreria/page.tsx`

Dos tabs:

**CxC / Aging:**
- Summary cards: Al día / 1–30 / 31–60 / 61–90 / +90 días
- Alerta si hay CxC vencida
- Tabla expandible por cliente → facturas individuales con bucket badge

**Flujo de caja:**
- Selector de meses (3 / 6 / 9 / 12)
- Grilla de tarjetas por período: cobros esperados, pagos pendientes, barra de neto, acumulado
- Panel "Sin fecha programada" cuando hay items sin due_date

### Sidebar

`Tesorería` añadido al grupo `Financiero`:
```
Financiero ▾
  Compras          /erp/compras
  Finanzas / P&L   /erp/finanzas
  Activos fijos    /erp/activos
  Subcontratistas  /erp/subcontratistas
  Tesorería        /erp/tesoreria   ← nuevo
```

### Archivos modificados / creados

| Archivo | Cambio |
|---------|--------|
| `backend/apps/ledger/services.py` | + `ARAgingService`, `CashFlowForecastService` |
| `backend/apps/ledger/views.py` | + `ARAgingView`, `CashFlowForecastView` |
| `backend/apps/ledger/urls.py` | + `ar-aging/`, `cash-forecast/` |
| `frontend/src/lib/api-finance.ts` | + 7 tipos, `getARaging()`, `getCashFlowForecast()` |
| `frontend/src/app/erp/tesoreria/page.tsx` | Nueva página |
| `frontend/src/components/erp/ERPSidebar.tsx` | + `tesoreria` en ERPPage + grupo Financiero |

---

---

## Bloque 11C — IVA crédito fiscal + conciliación equipos

### Parte A — IVA Crédito Fiscal en factura de proveedor

`PostingService.post_supplier_invoice` acepta ahora el parámetro `include_iva_credit: bool = False`.

**Esquema sin IVA (default — comportamiento anterior sin cambio):**
```
DR Gasto/Inventario (subtotal por línea)
CR CxP Proveedores   (subtotal)
```

**Esquema con IVA crédito fiscal (`include_iva_credit=True`):**
```
DR Gasto/Inventario (subtotal por línea)
DR IVA Crédito Fiscal [iva_credit_fiscal]  (tax_amount_gtq)
CR CxP Proveedores                         (total_gtq = subtotal + IVA)
```

**ADVERTENCIA:** El crédito fiscal IVA solo es recuperable si la factura tiene FEL
certificada, el proveedor es contribuyente del régimen correcto, y se cumplen los
requisitos SAT vigentes. **Requiere validación por contador guatemalteco antes de activar
`include_iva_credit=True` en producción.**

La clave de mapeo `iva_credit_fiscal` ya existía desde el Bloque 7.

---

### Parte B — Conciliación de costo de equipos

**Objetivo:** verificar que la `internal_rate_gtq_per_hour` de cada activo refleje
adecuadamente el costo contable real (depreciación + mantenimiento), detectando tarifas
desactualizadas antes de que inflen o subestimen el costo de proyecto.

**`EquipmentReconciliationService`:**

| Columna | Fuente |
|---------|--------|
| `depreciation_cost` | `AssetDepreciationEntry` (is_posted) del período |
| `maintenance_cost` | `MaintenanceRecord.cost_gtq` del período (referencial) |
| `accounting_cost` | `depreciation_cost + maintenance_cost` |
| `analytical_cost` | Σ `EquipmentUsageLog.total_cost_including_fuel_gtq` del período |
| `variance` | `analytical_cost − accounting_cost` |
| `variance_pct` | `variance / accounting_cost × 100` |
| `rate_review_needed` | `abs(variance_pct) > 20 %` o analítico sin contable |

**Alerta:** Si el combustible se captura TAMBIÉN en `Expense` o `SupplierInvoice`, el
costo analítico estará inflado. El reporte lo mostrará como variación positiva.

**Endpoint:**
```
GET /api/ledger/equipment-reconciliation/?year=2026&month_from=1&month_to=12
```

**Frontend — nueva tab "Conciliación equipos" en `activos/page.tsx`:**
- Selector de período (año + mes desde/hasta)
- 4 tarjetas resumen: Contable / Analítico / Horas / Variación global
- Alerta si hay activos con variación > umbral
- Tabla completa con leyenda de colores (amber = tarifa alta, blue = tarifa baja)

### Archivos modificados / creados

| Archivo | Cambio |
|---------|--------|
| `backend/apps/ledger/services.py` | `post_supplier_invoice` + param `include_iva_credit` · + `EquipmentReconciliationService` |
| `backend/apps/ledger/views.py` | + `EquipmentReconciliationView` |
| `backend/apps/ledger/urls.py` | + `equipment-reconciliation/` |
| `frontend/src/lib/api-finance.ts` | + `EquipmentReconciliationRow`, `EquipmentReconciliationResponse`, `getEquipmentReconciliation()` |
| `frontend/src/app/erp/activos/page.tsx` | + tab "Conciliación equipos" con `ReconciliationPanel` |

---

*Documento cerrado el 2026-10-25 — Bloques 0–10 + 11A + 11B + 11C implementados. Módulo financiero completo.*
