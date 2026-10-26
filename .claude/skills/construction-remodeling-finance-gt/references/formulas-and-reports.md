# Reference: P&L, KPIs, and reporting formulas

## P&L definitions

Use one company-wide policy and display it in report metadata.

- Gross recognized operating revenue: revenue recognized under the applicable accounting policy before deductions.
- Revenue deductions: discounts, credit notes, returns, and other items classified as reductions of revenue under the approved policy.
- Net revenue = gross recognized revenue − revenue deductions.
- Direct project cost = direct materials consumed + direct labor and employer costs + subcontractors + project equipment + direct logistics/site costs.
- Gross job margin = net revenue − direct project cost.
- Gross margin % = gross job margin / net revenue × 100.
- Indirect production cost: shared site/production costs not directly attributable to one project.
- Contribution after indirect production = gross job margin − indirect production cost, where the company uses this view.
- EBITDA = operating profit before depreciation/amortization, interest, and income tax, using a declared classification policy.
- EBIT = EBITDA − depreciation/amortization included below EBITDA.
- Net financial result = financial income − financial expense.
- Profit before tax = EBIT + net financial result + other items classified before tax under the accounting policy.
- Net profit = profit before tax − income tax expense.

Prevent duplicate depreciation if some depreciation is already included in direct job cost. Do not label an EBITDA definition ambiguously when indirect production costs are treated differently between reports.

## Budget and forecast formulas

- Budget variance = actual − budget.
- Revenue variance: positive is normally favorable; negative is normally unfavorable.
- Cost variance: positive actual-minus-budget is normally unfavorable; negative is normally favorable.
- Forecast final cost = cost incurred to date + estimate to complete.
- Forecast final margin = forecast contract revenue − forecast final cost.
- Forecast final margin % = forecast final margin / forecast contract revenue × 100.
- Budget consumption % = actual cost to date / current approved budget × 100.
- Cost-to-complete must include unincurred commitments exactly once. If estimate-to-complete already includes open commitments, do not add commitments again.
- Forecast contract revenue should include approved contract value and approved change orders under the applicable recognition policy. Do not include unapproved claims or speculative changes as certain revenue.

## Productivity formulas

- Direct labor cost per productive hour = allocated direct labor cost / productive hours.
- Hours per completed unit = actual hours / accepted units completed.
- Labor-hour variance = actual hours − budgeted hours for equivalent earned progress.
- Material yield = accepted units completed / material quantity consumed, where units are compatible.
- Rework rate = attributable rework cost / direct project cost × 100.
- Warranty cost ratio = attributable warranty cost / related project revenue × 100.
- Equipment utilization = productive equipment hours / available equipment hours × 100.

Use activity-specific units and compare like with like. Do not compare square meters of tile work with linear meters of pipework as one productivity metric.

## Break-even

- Contribution margin = net revenue − variable costs.
- Contribution ratio = contribution margin / net revenue.
- Break-even sales = fixed costs / contribution ratio.

Do not assume all direct costs are variable. Permanent crews, idle equipment, and fixed site resources may be fixed or semi-variable. Maintain documented cost-behavior classifications. Handle zero or negative denominators explicitly.

## Working capital and cash

- Overdue AR ratio = overdue receivables / trade receivables × 100.
- Days sales outstanding (DSO) = average trade receivables / credit sales for the comparable period × days in period.
- Days payable outstanding (DPO) = average trade payables / credit purchases for the comparable period × days in period.
- Cash requirement over horizon = forecast payments − forecast receipts, with opening cash and financing sources shown separately.
- Cash variance = actual cash − forecast cash.
- Customer advances unapplied = advance balance not yet applied to recognized work under the contract/accounting policy.

Use consistent VAT treatment in numerator/denominator and average balances where appropriate. Do not present DSO/DPO as reliable when the base is zero or not comparable.

## Required report periods

For each P&L line, show:
- current month actual;
- current month budget;
- current month variance in GTQ and %;
- year-to-date actual;
- year-to-date budget;
- YTD variance;
- full-year original budget;
- full-year current approved budget;
- full-year forecast;
- prior-year comparison if available and comparable.

YTD sums P&L activity from the start of the fiscal year through the selected period. Do not sum balance-sheet balances to derive P&L values. Full-year forecast is an estimate, not a mechanical annualization of YTD actuals.

## Report guardrails

- Label currency, period, accounting basis, and filters.
- For zero or negative revenue, show margin ratios as N/A or according to an explicitly approved policy; do not create misleading percentages.
- Define favorable/unfavorable variance per line type.
- Reconcile corporate reports to the GL.
- Reconcile project reports to posted costs/revenue plus clearly labeled management-only allocations.
- Show unallocated costs separately rather than hiding them.
