# Reference: Acceptance tests and invariants

Use these as domain acceptance criteria. Adapt them to the existing codebase and approved accounting policy.

## A. P&L arithmetic
1. Given net revenue Q500,000 and direct costs Q350,000, gross margin is Q150,000 and gross margin percentage is 30%.
2. Given gross margin Q150,000 and operating overhead before D&A Q65,000, EBITDA under the declared policy is Q85,000.
3. Given EBITDA Q85,000 and D&A below EBITDA Q10,000, EBIT is Q75,000.
4. Given EBIT Q75,000 and net finance expense Q8,000, profit before tax is Q67,000 before other applicable items.
5. Given zero net revenue, percentage ratios do not produce an infinite or misleading result; show N/A or the approved behavior.
6. GTQ money calculations use decimal-safe arithmetic and documented rounding.

## B. No double counting
1. Buying materials into stock does not automatically charge a project cost if inventory accounting requires later consumption.
2. Issuing stock to a project reduces inventory and records the project cost once.
3. Paying a supplier invoice settles AP and cash; it does not create a second expense.
4. Payroll allocation to jobs reconciles to payroll expense; the same salary is not also charged to overhead.
5. Equipment depreciation appears once in the GL/P&L. Analytical allocation does not duplicate it.
6. Open purchase commitments are included exactly once in forecast-at-completion.
7. Customer advance receipt does not automatically become recognized revenue.
8. A subcontractor retention payable is not confused with a customer retention receivable.
9. Recoverable VAT is not included in revenue or cost by default; non-recoverable VAT follows the approved treatment.

## C. Project budget and forecast
1. Original approved budget cannot be overwritten by a revision.
2. Every approved revision has approver, timestamp, reason, and linked change order.
3. Forecast final cost equals incurred-to-date plus estimate-to-complete, with commitment inclusion logic explicit.
4. Unapproved change requests do not silently increase approved contract revenue.
5. Project margin reconciles to project revenue/cost records plus explicitly identified management allocations.
6. Cost overruns trigger a visible variance with both amount and percentage where meaningful.

## D. Inventory
1. Every stock movement records item, quantity, unit, warehouse/location, source document, and actor.
2. Issue/return/transfer movements preserve an audit trail.
3. Inventory valuation reconciles to the general ledger at close.
4. Negative stock is blocked or explicitly controlled by an approved exception workflow.
5. Physical-count adjustments require a reason and authorization.

## E. Accounting integrity
1. Journal entries balance: total debits equal total credits.
2. Posting to a closed period is blocked or follows an authorized reopening/adjustment process.
3. Posting operations are idempotent; retrying does not create duplicate journals or movements.
4. Reversals and corrections preserve the original posted record and audit trail.
5. Every posting account has a valid account mapping and allowed dimensions.
6. Corporate P&L reconciles to the GL.
7. VAT, ISR, and withholding reports reconcile to their control accounts, subject to approved mappings.

## F. Security and multi-tenant isolation
1. Users cannot access another company/tenant’s projects, ledgers, inventory, or reports without explicit authorization.
2. Server-side authorization applies to exports, APIs, background jobs, and reports, not only the UI.
3. Audit logs capture sensitive changes to accounts, budgets, tax settings, and closed periods.

## G. Monthly and annual reporting
1. Monthly actual and budget use the same reporting period and comparable classification.
2. YTD is the sum of P&L activity from fiscal-year start through the selected period.
3. Forecast is clearly labeled as an estimate and is not automatically annualized from YTD.
4. Reports identify currency, period, filters, basis, and timestamp.
5. Variance direction is clearly documented: actual minus budget; favorable/unfavorable meaning depends on revenue/cost type.
