# Reference: Guatemala accounting and tax guardrails

**Important:** This file is an implementation checklist, not legal or tax advice. Confirm current law, effective dates, the company’s tax regime, contract structure, and official guidance with a qualified Guatemalan accountant/tax adviser. Do not hard-code unverified rules.

## Areas that require local validation

### Commercial accounting and records
Validate the applicable requirements under Guatemala’s Commercial Code and the entity’s accounting framework, including books, supporting documentation, financial statements, record retention, and period-close procedures. Keep a clean audit trail and preserve source documents.

### Income tax (ISR)
The system must support the company’s actual tax regime. Do not assume the same tax base or calculation applies to all regimes. Separate accounting profit, taxable income adjustments, tax payments/withholdings, and current/deferred tax accounting where relevant. Keep tax rules versioned by effective date.

### Construction contracts
The applicable treatment may depend on the contract type, whether construction is performed on property owned by the company or by a third party, contract terms, progress evidence, and the current rules. Store contract value, estimated costs, actual costs, work schedule, technical progress evidence, approved changes, and period-end estimates. Have the accountant approve recognition and tax mappings before automating them.

### VAT (IVA)
Track input VAT, output VAT, settlement, credit notes, and supporting tax documents separately from revenue and cost. Do not assume every input tax amount is recoverable. The treatment of non-recoverable VAT depends on the applicable facts and policy.

### FEL and tax documents
Store electronic tax document identifiers/status and link invoices, credit notes, debit notes, and other relevant documents to customers/suppliers, contracts, POs, receipts, certifications, and ledger entries. Verify current technical and legal requirements with SAT or the authorized certification provider.

### Inventory reporting
Determine whether the company’s regime triggers specific inventory books, valuation, physical-count, or reporting obligations. Maintain quantities, valuation method, warehouse movements, physical counts, differences, and supporting approvals.

### Payroll and employment obligations
Configure payroll, employer contributions, withholdings, benefits/accruals, and employee records according to the current rules applicable to the employer and employees. Do not treat management accruals as a substitute for legal payroll obligations.

### Withholdings
Do not use one universal withholding rate. Determine treatment based on transaction type, supplier status, applicable regime, document type, and current law. Store rules with effective dates and maintain an audit trail.

## Required tax configuration design

Each tax rule should have:
- jurisdiction;
- tax type;
- applicable transaction/document type;
- entity and counterparty conditions;
- tax base and calculation method;
- rate or formula only when verified;
- effective-from and effective-to dates;
- source/reference and verification date;
- GL account mapping;
- validation status (`verified`, `pending accountant approval`, `inactive`);
- test cases and responsible approver.

If current primary-source verification is unavailable, leave the rule configurable and mark it `pending accountant approval`. Never fabricate a filing deadline, tax rate, exemption, deduction, or contract treatment.

## Suggested authoritative verification sources

- Guatemala Superintendencia de Administración Tributaria (SAT), current tax legislation and official technical guidance.
- Current official text of the Commercial Code and applicable tax laws/regulations.
- The company’s appointed accountant/tax adviser and documented tax position.

Record exact source title, article/section, publication/effective date, retrieval date, and a short interpretation in the project’s compliance decision log.
