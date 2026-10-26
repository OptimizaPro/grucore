# Reference: Costing, dimensions, and operational workflows

## Core analytical dimensions

Use stable IDs and controlled vocabularies.

| Dimension | Example | Required usage |
|---|---|---|
| Legal entity | `EMP-001` | Every financial record |
| Project/job | `OBR-2026-001` | Project revenue and direct project costs |
| Customer | `CLI-0001` | Contract and revenue reporting |
| Service line | `CONSTRUCCION`, `REMODELACION_INTEGRAL`, `REMODELACION_PARCIAL` | Commercial analysis |
| Cost center | `OBRA`, `ADMIN`, `COMERCIAL`, `MAQUINARIA` | Responsibility reporting |
| Activity/work package | `DEMOLICION`, `ESTRUCTURA`, `INSTALACIONES`, `ACABADOS` | Work-cost analysis |
| Budget line/cost code | `MAT-EST-001` | Budget-to-actual |
| Warehouse/location | `ALM-CENTRAL`, `ALM-OBRA-001` | Inventory traceability |
| Employee/crew | Stable employee or crew ID | Labor cost/time |
| Equipment asset | Stable asset ID | Usage, depreciation, maintenance |
| Supplier/subcontractor | `PRO-0001` | Purchasing and AP |
| Period | `2026-10` | Close and reports |
| Cost status | Budgeted/committed/incurred/invoiced/paid | Distinguish cost stages |

## Direct vs indirect vs overhead

Direct costs are reliably attributable to one job. Indirect production costs support multiple jobs. Corporate overhead supports the business generally. A cost’s classification depends on the actual operating model and documented policy; it is not decided only by account name.

Recommended allocation drivers:
- shared site supervision: time sheets by project;
- central warehouse: issue lines, order lines, or documented handling volume;
- shared transport: trips, kilometers, or loads;
- shared equipment: recorded usage hours;
- shared safety resources: worker-hours or other relevant exposure;
- shared technical services: time records by project.

Do not distribute all corporate overhead automatically by revenue without a documented management policy. Present direct gross margin separately from margin after indirect production cost allocations.

## Material purchase/consumption workflow

1. Requisition records project, activity, cost code, requested quantity, and approver.
2. Purchase order creates a commitment; it does not automatically create an expense.
3. Goods receipt updates inventory and/or goods-received-not-invoiced accrual under the accounting policy.
4. Supplier invoice matches PO and receipt and records AP/tax treatment.
5. Stock issue to project reduces inventory and records project consumption.
6. Return to stock reverses or reduces project consumption where applicable.
7. Payment settles AP and cash; it must not create another expense.
8. Cycle count/physical inventory differences require reason, approval, and auditable adjustment.

## Labor workflow

- Record employee/crew, date, project, activity, hours, and productive/nonproductive classification.
- Apply approved labor rates and employer-cost policy.
- Reconcile allocations to payroll and labor liabilities.
- Track overtime and rework separately where meaningful.
- Avoid charging the same salary to both a project and overhead.
- Do not assume every labor cost is direct: shared supervision and idle crew time may need indirect production treatment.

## Subcontractor workflow

- Approved contract/PO establishes commitment.
- Record progress certification/service acceptance.
- Match supplier invoice to the contract, certification, and receipt.
- Track advances, retention, and disputed amounts separately.
- Payment settles liability; it does not create a second cost.
- Retention treatment depends on the contractual role: a retention receivable from a customer differs from a retention payable to a subcontractor.

## Owned equipment

Maintain asset register, acquisition cost, date in service, useful life, depreciation method, maintenance, fuel, operating hours, productive hours, idle time, and project usage.

A management hourly rate may include depreciation, fuel, maintenance, operator cost, and other usage costs according to a documented policy. Reconcile the allocation to GL costs. Avoid posting the same depreciation or maintenance both as direct job cost and corporate overhead.

## Project budget and change control

A project budget line should support:
- code and description;
- unit of measure;
- quantity;
- budgeted selling price and cost;
- material quantity/cost;
- labor hours/rate/cost;
- subcontract amount;
- equipment/logistics;
- total cost and margin;
- owner/approver;
- version/date/reason.

Original budget is immutable after approval. Approved changes create a new version/current budget and should link to an approved change order. Keep unapproved requests separate from approved contract value.

## Revenue, billing, and cash are different

Track separately:
- contract value;
- approved change orders;
- recognized revenue;
- progress/certification evidence;
- invoice amount;
- cash collected;
- customer advance;
- contractual retention;
- accounts receivable;
- contract asset/liability where applicable.

Revenue recognition and tax recognition must follow the approved accounting policy and current Guatemalan rules for the contract type. Never infer recognition solely from invoice or payment status.

## Monthly close checklist

1. Lock or freeze operational cut-off for hours, stock movements, and progress.
2. Accrue known costs for work received but not yet invoiced, according to policy.
3. Reconcile supplier invoices, subcontract certifications, customer invoices, and retentions.
4. Reconcile inventory valuation to the GL.
5. Reconcile payroll allocations to payroll expense and liabilities.
6. Post depreciation and asset movements.
7. Reconcile banks, AR/AP, VAT, and other tax control accounts.
8. Review project cost-to-complete and contract changes.
9. Generate monthly/YTD/budget/forecast P&L and cash forecasts.
10. Review exceptions, approve close, lock period, and preserve audit trail.
