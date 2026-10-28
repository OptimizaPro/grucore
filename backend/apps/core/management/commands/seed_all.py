"""
Management command: seed_all
Pobla todas las secciones del admin con datos demo realistas para Grucore.

Ejecuta (en orden):
  1. seed_ledger          — catálogo de cuentas, centros de costo, códigos de costo
  2. seed_mano_de_obra    — productos de mano de obra en inventario
  3. create_demo_client   — cliente, proyecto y hitos demo
  4. seed_demo_erp        — workers, tasks, expenses, docs, RFIs, etc.
  5. seed_cms             — páginas CMS

Luego seed propio:
  6. Períodos contables   — 2026 (ene–dic) + 2025 (retroactivos cerrados)
  7. AccountMappings      — 14 claves GL → cuentas
  8. TaxRules             — IVA, IGSS, ISR (pending validación contador)
  9. AssetCategories      — 5 categorías de activos fijos
  10. FixedAssets          — 4 equipos de la empresa
  11. EquipmentUsageLogs   — uso de equipos en proyecto demo
  12. MaintenanceRecords   — mantenimientos preventivos
  13. CRM Pipeline+Stages  — pipeline "Construcción GT" con 7 etapas
  14. CRM Leads            — 12 leads demo
  15. CRM Activities       — actividades de seguimiento
  16. PurchaseOrders       — 3 OCs con líneas para el proyecto demo
  17. GoodsReceipts        — recepciones de las OCs
  18. SupplierInvoices      — facturas de proveedor con líneas
  19. CompanySettings      — datos de la empresa (si no existen)
  20. Subcontractors       — 3 subcontratistas con contratos y certificaciones

Uso:
    python manage.py seed_all
    python manage.py seed_all --skip-deps   # solo seed propio, asume deps ya ejecutadas
"""

import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.utils import timezone

DEMO_CLIENT_EMAIL = 'cliente@demo.grucore.com'


class Command(BaseCommand):
    help = 'Pobla todas las secciones del admin con datos demo realistas'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skip-deps',
            action='store_true',
            help='Omite seed_ledger, seed_mano_de_obra, create_demo_client, seed_demo_erp, seed_cms',
        )

    def ok(self, msg):
        self.stdout.write(self.style.SUCCESS(f'  ✓ {msg}'))

    def info(self, msg):
        self.stdout.write(f'  · {msg}')

    # ─── handle ──────────────────────────────────────────────────────────────

    def handle(self, *args, **options):
        self.stdout.write('\n' + '─' * 60)
        self.stdout.write('  GRUCORE — Seed completo de datos demo')
        self.stdout.write('─' * 60 + '\n')

        skip_deps = options['skip_deps']

        # ── 1–5. Seeds dependientes ───────────────────────────────────────────
        if not skip_deps:
            self.stdout.write('\n[1/5] seed_ledger')
            call_command('seed_ledger', verbosity=0)
            self.ok('Catálogo de cuentas, centros y códigos de costo')

            self.stdout.write('\n[2/5] seed_mano_de_obra')
            call_command('seed_mano_de_obra', verbosity=0)
            self.ok('Productos de mano de obra')

            self.stdout.write('\n[3/5] create_demo_client')
            call_command('create_demo_client', verbosity=0)
            self.ok('Cliente, proyecto y hitos demo')

            self.stdout.write('\n[4/5] seed_demo_erp')
            call_command('seed_demo_erp', verbosity=0)
            self.ok('Workers, tasks, expenses, docs, RFIs, mensajes')

            self.stdout.write('\n[5/5] seed_cms')
            call_command('seed_cms', verbosity=0)
            self.ok('Páginas CMS')
        else:
            self.info('Dependencias omitidas (--skip-deps)')

        self.stdout.write('\n[Seed propio]')

        # ── Importar modelos ──────────────────────────────────────────────────
        from apps.users.models import User
        from apps.projects.models import Project, Client
        from apps.ledger.models import (
            Account, AccountMapping, MappingKey,
            TaxRule, TaxType, AccountingPeriod, PeriodState,
        )
        from apps.assets.models import (
            AssetCategory, FixedAsset, EquipmentUsageLog, MaintenanceRecord,
            DepreciationMethod, AssetStatus, MaintenanceType,
        )
        from apps.crm.models import (
            Pipeline, PipelineStage, Lead, LeadSource, LeadStatus, ServiceType,
        )
        from apps.purchasing.models import (
            PurchaseOrder, PurchaseOrderLine, GoodsReceipt, GoodsReceiptLine,
            SupplierInvoice, SupplierInvoiceLine, POStatus, GRStatus,
            SupplierInvoiceStatus,
        )
        from apps.subcontractors.models import (
            SubcontractorContract, SubcontractorCertification,
        )
        from apps.suppliers.models import Supplier
        from apps.inventory.models import Product
        from apps.core.models import CostCenter, CostCode, CompanySettings

        # ── Localizar proyecto demo ───────────────────────────────────────────
        try:
            demo_user = User.objects.get(email=DEMO_CLIENT_EMAIL)
            client    = Client.objects.get(portal_user=demo_user)
            project   = Project.objects.get(client=client)
            pm        = project.project_manager
        except Exception as e:
            self.stdout.write(self.style.WARNING(
                f'  ⚠ Proyecto demo no encontrado ({e}). '
                'Algunos datos de compras y activos no se crearán.'
            ))
            project = pm = None

        phases = list(project.phases.order_by('order')) if project else []

        # ── 6. Períodos contables ─────────────────────────────────────────────
        self.stdout.write('\n  6. Períodos contables')
        periods_created = 0

        # 2025 — retroactivos cerrados
        for month in range(1, 13):
            _, created = AccountingPeriod.objects.get_or_create(
                year=2025, month=month,
                defaults={'state': PeriodState.CLOSED},
            )
            if created:
                periods_created += 1

        # 2026 — ene–oct cerrados, nov–dic abiertos
        for month in range(1, 13):
            state = PeriodState.CLOSED if month <= 9 else PeriodState.OPEN
            _, created = AccountingPeriod.objects.get_or_create(
                year=2026, month=month,
                defaults={'state': state},
            )
            if created:
                periods_created += 1

        self.ok(f'{periods_created} períodos creados (2025 + 2026)')

        # ── 7. AccountMappings ────────────────────────────────────────────────
        self.stdout.write('\n  7. AccountMappings (claves GL)')

        # Mapeos: clave → código de cuenta (del catálogo seed_ledger)
        MAPPING_CONFIG = [
            (MappingKey.AP_SUPPLIERS,         '2101', 'CxP Proveedores nacionales'),
            (MappingKey.AP_SUBCONTRACTORS,    '2110', 'CxP Subcontratistas por pagar'),
            (MappingKey.RETENTION_LIABILITY,  '2130', 'Retenciones a subcontratistas por pagar'),
            (MappingKey.INVENTORY_MATERIALS,  '1401', 'Inventario cemento y agregados'),
            (MappingKey.CASH_BANK,            '1130', 'Bancos en quetzales'),
            (MappingKey.ACCRUED_AP,           '2120', 'Facturas pendientes de recibir'),
            (MappingKey.DEPRECIATION_EXPENSE, '5450', 'Depreciación de maquinaria asignada a obra'),
            (MappingKey.ACCUMULATED_DEPR,     '1792', 'Depreciación acumulada — maquinaria'),
            (MappingKey.DIRECT_LABOR_EXPENSE, '5210', 'Albañiles y ayudantes (mano de obra directa)'),
            (MappingKey.IVA_CREDIT_FISCAL,    '1301', 'IVA crédito fiscal'),
            (MappingKey.AR_CLIENTS,           '1201', 'Clientes nacionales'),
            (MappingKey.REVENUE_SERVICES,     '4110', 'Ingresos — construcción residencial'),
            (MappingKey.PAYROLL_LIABILITY,    '2201', 'Sueldos y salarios por pagar'),
            (MappingKey.IGSS_PATRONAL_LIAB,   '2206', 'Cuotas patronales por pagar'),
        ]

        mappings_created = 0
        for key, account_code, notes in MAPPING_CONFIG:
            account = Account.objects.filter(code=account_code).first()
            if not account:
                self.stdout.write(self.style.WARNING(
                    f'    ⚠ Cuenta {account_code} no encontrada para clave {key}'
                ))
                continue
            _, created = AccountMapping.objects.get_or_create(
                key=key,
                defaults={'account': account, 'notes': notes},
            )
            if created:
                mappings_created += 1

        self.ok(f'{mappings_created} mappings configurados')

        # ── 8. TaxRules ───────────────────────────────────────────────────────
        self.stdout.write('\n  8. Reglas fiscales (pending validación contador)')

        tax_rules = [
            {
                'name':         'IVA 12% — Tasa general',
                'tax_type':     TaxType.IVA,
                'rate_pct':     Decimal('12.0000'),
                'applies_from': datetime.date(2025, 1, 1),
                'regime':       'General',
                'description':  'IVA Decreto 27-92 Guatemala. Tasa general 12%. Pending validación contador.',
                'requires_fel': True,
            },
            {
                'name':         'IGSS patronal — 12.67%',
                'tax_type':     TaxType.IGSS_PATRONAL,
                'rate_pct':     Decimal('12.6700'),
                'applies_from': datetime.date(2025, 1, 1),
                'regime':       'IGSS — Cuota patronal',
                'description':  'Cuota patronal IGSS sobre salario mensual. Pending validación contador.',
                'requires_fel': False,
            },
            {
                'name':         'IGSS laboral — 4.83%',
                'tax_type':     TaxType.IGSS_LABORAL,
                'rate_pct':     Decimal('4.8300'),
                'applies_from': datetime.date(2025, 1, 1),
                'regime':       'IGSS — Cuota laboral',
                'description':  'Cuota laboral IGSS sobre salario mensual. Pending validación contador.',
                'requires_fel': False,
            },
            {
                'name':         'ISR retención sobre servicios — 5%',
                'tax_type':     TaxType.ISR_RETENTION,
                'rate_pct':     Decimal('5.0000'),
                'applies_from': datetime.date(2025, 1, 1),
                'regime':       'Régimen sobre utilidades',
                'description':  'Retención ISR 5% sobre servicios a no residentes o personas jurídicas según régimen. '
                                'Pending validación contador y régimen fiscal del proveedor.',
                'requires_fel': True,
            },
            {
                'name':         'ISR corporativo — 25%',
                'tax_type':     TaxType.ISR_CORPORATE,
                'rate_pct':     Decimal('25.0000'),
                'applies_from': datetime.date(2025, 1, 1),
                'regime':       'Régimen sobre utilidades',
                'description':  'Tasa ISR empresarial sobre utilidades. Pending validación contador según régimen vigente.',
                'requires_fel': False,
            },
        ]

        tax_created = 0
        for data in tax_rules:
            _, created = TaxRule.objects.get_or_create(
                name=data['name'],
                defaults=data,
            )
            if created:
                tax_created += 1

        self.ok(f'{tax_created} reglas fiscales (marcar como validadas con contador)')

        # ── 9. AssetCategories ────────────────────────────────────────────────
        self.stdout.write('\n  9. Categorías de activos fijos')

        asset_cats = [
            # (name, life_years, method, sat_rate, description)
            ('Maquinaria pesada',        10, 'straight_line',  10, 'Mezcladoras, compactadoras, retroexcavadoras'),
            ('Vehículos de carga',        5, 'straight_line',  20, 'Camiones, pick-ups, furgones'),
            ('Herramientas mayores',       5, 'straight_line',  20, 'Andamios, vibradores, compresoras, sierras'),
            ('Equipo de cómputo',          3, 'straight_line',  33, 'Laptops, tablets, impresoras, servidores'),
            ('Equipo de oficina y mobiliario', 5, 'straight_line', 20, 'Escritorios, sillas, archiveros, AC'),
        ]

        cat_map = {}
        cats_created = 0
        for name, life, method, sat_rate, desc in asset_cats:
            obj, created = AssetCategory.objects.get_or_create(
                name=name,
                defaults={
                    'description':                  desc,
                    'default_useful_life_years':     Decimal(str(life)),
                    'default_depreciation_method':   method,
                    'sat_max_depreciation_rate_pct': Decimal(str(sat_rate)),
                    'is_active':                     True,
                },
            )
            cat_map[name] = obj
            if created:
                cats_created += 1

        self.ok(f'{cats_created} categorías de activos')

        # ── 10. FixedAssets ───────────────────────────────────────────────────
        self.stdout.write('\n  10. Activos fijos')

        supplier_alq = Supplier.objects.filter(name__icontains='Palencia').first()

        assets_data = [
            {
                'name':                      'Mezcladora de concreto 1 saco — Honda GX160',
                'category':                  'Maquinaria pesada',
                'brand':                     'Honda',
                'model':                     'GX160 1 saco',
                'serial_number':             'HGX160-2024-001',
                'year_of_manufacture':       2024,
                'acquisition_date':          datetime.date(2024, 6, 15),
                'purchase_cost_gtq':         Decimal('14500.00'),
                'useful_life_years':         Decimal('10.00'),
                'residual_value_gtq':        Decimal('1000.00'),
                'in_service_date':           datetime.date(2024, 6, 20),
                'status':                    'active',
                'internal_rate_gtq_per_hour': Decimal('85.00'),
                'rate_last_reviewed_at':     datetime.date(2026, 1, 10),
                'purchase_invoice_ref':      'FAC-2024-0347',
                'location_notes':            'Bodega central Villa Nueva',
            },
            {
                'name':                      'Vibrador de concreto eléctrico 1.5" — Wacker Neuson',
                'category':                  'Herramientas mayores',
                'brand':                     'Wacker Neuson',
                'model':                     'IREN 38/042',
                'serial_number':             'WN-VIB-2024-002',
                'year_of_manufacture':       2023,
                'acquisition_date':          datetime.date(2024, 3, 10),
                'purchase_cost_gtq':         Decimal('8200.00'),
                'useful_life_years':         Decimal('5.00'),
                'residual_value_gtq':        Decimal('500.00'),
                'in_service_date':           datetime.date(2024, 3, 12),
                'status':                    'active',
                'internal_rate_gtq_per_hour': Decimal('45.00'),
                'rate_last_reviewed_at':     datetime.date(2026, 1, 10),
                'purchase_invoice_ref':      'FAC-2024-0188',
                'location_notes':            'Proyecto Los Palmerales — fase paredes',
            },
            {
                'name':                      'Pick-up Toyota Hilux 2022 — Carga',
                'category':                  'Vehículos de carga',
                'brand':                     'Toyota',
                'model':                     'Hilux 4x4 2022',
                'serial_number':             'JTFNX22P100123456',
                'year_of_manufacture':       2022,
                'acquisition_date':          datetime.date(2022, 8, 1),
                'purchase_cost_gtq':         Decimal('195000.00'),
                'useful_life_years':         Decimal('5.00'),
                'residual_value_gtq':        Decimal('50000.00'),
                'in_service_date':           datetime.date(2022, 8, 5),
                'status':                    'active',
                'internal_rate_gtq_per_hour': Decimal('120.00'),
                'rate_last_reviewed_at':     datetime.date(2026, 1, 10),
                'purchase_invoice_ref':      'FAC-Toyota-2022-1892',
                'location_notes':            'En circulación — supervisor de obra',
            },
            {
                'name':                      'Andamio tubular metálico — juego 20 secciones',
                'category':                  'Herramientas mayores',
                'brand':                     'Acero Guatemala',
                'model':                     'Tubular 1.5m',
                'serial_number':             'AND-AG-2023-015',
                'year_of_manufacture':       2023,
                'acquisition_date':          datetime.date(2023, 4, 20),
                'purchase_cost_gtq':         Decimal('22000.00'),
                'useful_life_years':         Decimal('5.00'),
                'residual_value_gtq':        Decimal('2000.00'),
                'in_service_date':           datetime.date(2023, 4, 25),
                'status':                    'active',
                'internal_rate_gtq_per_hour': Decimal('25.00'),
                'rate_last_reviewed_at':     datetime.date(2026, 1, 10),
                'purchase_invoice_ref':      'FAC-AG-2023-0567',
                'location_notes':            'Proyecto Los Palmerales — fachada',
            },
        ]

        assets_map = {}
        assets_created = 0
        for data in assets_data:
            cat_name = data.pop('category')
            category = cat_map.get(cat_name) or AssetCategory.objects.filter(name=cat_name).first()
            asset, created = FixedAsset.objects.get_or_create(
                name=data['name'],
                defaults={
                    **data,
                    'category':   category,
                    'supplier':   supplier_alq,
                    'created_by': pm,
                },
            )
            assets_map[asset.name] = asset
            if created:
                assets_created += 1

        self.ok(f'{assets_created} activos fijos creados')

        # ── 11. EquipmentUsageLogs ────────────────────────────────────────────
        if project and assets_map:
            self.stdout.write('\n  11. Registros de uso de equipos')
            phases_list = list(project.phases.order_by('order'))
            fase_acabados = phases_list[2] if len(phases_list) >= 3 else None

            mezcladora = next((a for k, a in assets_map.items() if 'Mezcladora' in k), None)
            vibrador   = next((a for k, a in assets_map.items() if 'Vibrador' in k), None)
            andamio    = next((a for k, a in assets_map.items() if 'Andamio' in k), None)

            usage_data = []
            if mezcladora:
                usage_data += [
                    (mezcladora, datetime.date(2026, 8, 5),  8, 'Colado losa fase acabados'),
                    (mezcladora, datetime.date(2026, 8, 12), 6, 'Mezcla repello primer nivel'),
                    (mezcladora, datetime.date(2026, 9, 3),  8, 'Colado rampa de acceso'),
                ]
            if vibrador:
                usage_data += [
                    (vibrador,   datetime.date(2026, 8, 5),  6, 'Vibrado losa fase acabados'),
                    (vibrador,   datetime.date(2026, 9, 3),  4, 'Vibrado rampa acceso'),
                ]
            if andamio:
                usage_data += [
                    (andamio,    datetime.date(2026, 8, 15), 8, 'Trabajos fachada 2do nivel'),
                    (andamio,    datetime.date(2026, 9, 10), 8, 'Pintura exterior primer nivel'),
                    (andamio,    datetime.date(2026, 10, 5), 8, 'Impermeabilización cubierta'),
                ]

            usage_created = 0
            for asset, date_, hours, notes in usage_data:
                _, created = EquipmentUsageLog.objects.get_or_create(
                    asset=asset,
                    project=project,
                    usage_date=date_,
                    defaults={
                        'phase':             fase_acabados,
                        'hours_used':        Decimal(str(hours)),
                        'rate_gtq_per_hour': asset.internal_rate_gtq_per_hour,
                        'notes':             notes,
                        'created_by':        pm,
                    },
                )
                if created:
                    usage_created += 1

            self.ok(f'{usage_created} registros de uso')

            # ── 12. MaintenanceRecords ────────────────────────────────────────
            self.stdout.write('\n  12. Registros de mantenimiento')
            maint_data = [
                (mezcladora, 'preventive', datetime.date(2026, 9, 20),
                 'Cambio de aceite y filtro de aire. Limpieza tambor.',
                 350, datetime.date(2026, 12, 20)),
                (andamio,    'inspection', datetime.date(2026, 10, 1),
                 'Revisión de pines, conectores y bases. Estado: bueno.',
                 0, datetime.date(2027, 4, 1)),
            ] if mezcladora and andamio else []

            maint_created = 0
            for asset, m_type, m_date, desc, cost, next_date in maint_data:
                _, created = MaintenanceRecord.objects.get_or_create(
                    asset=asset,
                    maintenance_date=m_date,
                    defaults={
                        'maintenance_type':      m_type,
                        'description':           desc,
                        'cost_gtq':              Decimal(str(cost)),
                        'performed_internally':  True,
                        'next_maintenance_date': next_date,
                        'created_by':            pm,
                    },
                )
                if created:
                    maint_created += 1

            self.ok(f'{maint_created} registros de mantenimiento')
        else:
            self.info('Uso de equipos omitido (no hay proyecto demo)')

        # ── 13. CRM Pipeline + Stages ─────────────────────────────────────────
        self.stdout.write('\n  13. CRM — Pipeline y etapas')

        pipeline, _ = Pipeline.objects.get_or_create(
            name='Construcción Guatemala',
            defaults={
                'description': 'Pipeline principal para leads de construcción y remodelación',
                'is_default':  True,
            },
        )

        stages_data = [
            # (name, order, color, is_won, is_lost)
            ('Nuevo lead',            1, '#8A95A5', False, False),
            ('Contactado',            2, '#3B82F6', False, False),
            ('Visita / sitio',        3, '#6366F1', False, False),
            ('Propuesta enviada',     4, '#F59E0B', False, False),
            ('Negociación',           5, '#FF6B35', False, False),
            ('Ganado — contrato',     6, '#10B981', True,  False),
            ('Perdido',               7, '#EF4444', False, True),
        ]

        stages_created = 0
        stage_map = {}
        for name, order, color, is_won, is_lost in stages_data:
            stage, created = PipelineStage.objects.get_or_create(
                pipeline=pipeline,
                order=order,
                defaults={
                    'name':    name,
                    'color':   color,
                    'is_won':  is_won,
                    'is_lost': is_lost,
                },
            )
            stage_map[name] = stage
            if created:
                stages_created += 1

        self.ok(f'Pipeline "{pipeline.name}" — {stages_created} etapas creadas')

        # ── 14. CRM Leads ─────────────────────────────────────────────────────
        self.stdout.write('\n  14. CRM — Leads demo')

        default_stage = stage_map.get('Nuevo lead') or PipelineStage.objects.filter(pipeline=pipeline).order_by('order').first()
        prop_stage    = stage_map.get('Propuesta enviada') or default_stage
        visit_stage   = stage_map.get('Visita / sitio') or default_stage
        neg_stage     = stage_map.get('Negociación') or default_stage
        won_stage     = stage_map.get('Ganado — contrato') or default_stage
        lost_stage    = stage_map.get('Perdido') or default_stage

        leads_data = [
            # (full_name, email, phone, city, source, service_type, stage_name, estimated_value, status, notes)
            ('Ana González de Herrera', 'ana.gonzalez@hotmail.com', '+502 5555-0101',
             'Ciudad de Guatemala', 'referral', 'residential', 'Propuesta enviada',
             Decimal('480000'), 'active',
             'Residencia 2 niveles en Cayalá, Zona 16. Familia de 4. Plazo: inicio feb 2027.'),
            ('Carlos Eduardo Menchú', 'cemench@gmail.com', '+502 5555-0202',
             'Ciudad de Guatemala', 'instagram', 'kitchens_baths', 'Negociación',
             Decimal('85000'), 'active',
             'Remodelación cocina y 2 baños, Vista Hermosa III. Muy interesado en propuesta.'),
            ('Inversiones Petromet S.A.', 'proyectos@petromet.com.gt', '+502 2380-5000',
             'Guatemala', 'direct', 'commercial', 'Ganado — contrato',
             Decimal('1250000'), 'won',
             'Oficinas corporativas 800 m² en Zona 10. Contrato firmado oct 2026.'),
            ('Familia Arriaza López', 'arriaza.lopez@gmail.com', '+502 5555-0303',
             'Antigua Guatemala', 'referral', 'renovation', 'Visita / sitio',
             Decimal('320000'), 'active',
             'Remodelación total casa colonial 350 m² en Antigua. Visita programada nov 5.'),
            ('Restaurant Grupo Cacao', 'gerencia@grupocacao.com.gt', '+502 2340-8800',
             'Ciudad de Guatemala', 'organic_search', 'commercial', 'Contactado',
             Decimal('560000'), 'active',
             'Segundo local restaurante en Miraflores, Z.11. Solicitan propuesta esta semana.'),
            ('Luis Monterroso Pac', 'lmonterroso@yahoo.com', '+502 5555-0404',
             'Quetzaltenango', 'facebook', 'residential', 'Nuevo lead',
             Decimal('280000'), 'active',
             'Casa 1 nivel en Xela, terreno 600 m². Sin prisa, explorando opciones.'),
            ('Clinica Dental Smile Pro', 'admin@smilepro.gt', '+502 2350-7700',
             'Ciudad de Guatemala', 'meta_ads', 'commercial', 'Propuesta enviada',
             Decimal('190000'), 'active',
             'Construcción clínica 2 consultorios + recepción, Pradera Z.10.'),
            ('Roberto Ajú Xinico', 'roberto.aju@construcentro.com', '+502 5555-0505',
             'Ciudad de Guatemala', 'referral', 'kitchens_baths', 'Contactado',
             Decimal('65000'), 'active',
             'Cocina americana + baño master en apartamento Z.14. Referido de Carlos Menchú.'),
            ('Bodega LogiGT Express', 'operaciones@logigt.com', '+502 2460-9900',
             'Villa Nueva', 'direct', 'construction', 'Nuevo lead',
             Decimal('2100000'), 'active',
             'Bodega 2,800 m² en Zona Franca. RFQ recibido. Requiere propuesta técnica + económica.'),
            ('Margarita Caal de Pac', 'mcaal.pac@gmail.com', '+502 5555-0606',
             'Ciudad de Guatemala', 'organic_search', 'renovation', 'Perdido',
             Decimal('95000'), 'lost',
             'Remodelación sala-comedor. Eligió otra empresa por precio más bajo.'),
            ('Hotel Boutique Cielo', 'propietario@hotelboutiquecielo.com', '+502 5555-0707',
             'Antigua Guatemala', 'instagram', 'commercial', 'Visita / sitio',
             Decimal('780000'), 'active',
             'Ampliación 8 habitaciones + piscina en Antigua. Visita realizada, esperan propuesta.'),
            ('Fam. Sánchez Peralta', 'gusanche@correo.com', '+502 5555-0808',
             'Ciudad de Guatemala', 'widget', 'kitchens_baths', 'Nuevo lead',
             Decimal('45000'), 'active',
             'Baño principal y medio baño, Zona 15. Contactó por widget del sitio web.'),
        ]

        leads_created = 0
        stage_lookup = {s.name: s for s in PipelineStage.objects.filter(pipeline=pipeline)}

        for (full_name, email, phone, city, source, svc_type,
             stage_name, value, status, notes) in leads_data:
            stage = stage_lookup.get(stage_name, default_stage)
            _, created = Lead.objects.get_or_create(
                email=email,
                defaults={
                    'pipeline':             pipeline,
                    'stage':                stage,
                    'full_name':            full_name,
                    'phone':                phone,
                    'city':                 city,
                    'source':               source,
                    'service_type':         svc_type,
                    'estimated_value_gtq':  value,
                    'status':               status,
                    'notes':                notes,
                    'assigned_to':          pm,
                },
            )
            if created:
                leads_created += 1

        self.ok(f'{leads_created} leads creados')

        # ── 15. CRM Activities ────────────────────────────────────────────────
        self.stdout.write('\n  15. CRM — Actividades de seguimiento')
        try:
            from apps.crm.models import LeadActivity, ActivityType

            lead_ana    = Lead.objects.filter(email='ana.gonzalez@hotmail.com').first()
            lead_carlos = Lead.objects.filter(email='cemench@gmail.com').first()
            lead_hotel  = Lead.objects.filter(email='propietario@hotelboutiquecielo.com').first()

            activities_data = []
            if lead_ana:
                activities_data.append({
                    'lead': lead_ana,
                    'activity_type': ActivityType.CALL,
                    'subject': 'Llamada inicial — presentación de servicios',
                    'notes': 'Se presentó el portafolio. Interesada, pedirá fecha para visita.',
                })
                activities_data.append({
                    'lead': lead_ana,
                    'activity_type': ActivityType.MEETING,
                    'subject': 'Visita a terreno en Cayalá — levantamiento',
                    'notes': 'Levantamiento de requerimientos. Familia confirmó 5 dormitorios, sala familiar, área de juegos.',
                })
            if lead_carlos:
                activities_data.append({
                    'lead': lead_carlos,
                    'activity_type': ActivityType.NOTE,
                    'subject': 'Envío de propuesta cocina y baños',
                    'notes': 'Se envió propuesta PDF por WhatsApp. Pendiente respuesta.',
                })
            if lead_hotel:
                activities_data.append({
                    'lead': lead_hotel,
                    'activity_type': ActivityType.MEETING,
                    'subject': 'Visita Hotel Boutique Cielo — relevamiento',
                    'notes': 'Se recorrió el predio. 8 habitaciones nuevas, piscina 10×4m, terraza. Propuesta en 2 semanas.',
                })

            act_created = 0
            for data in activities_data:
                _, created = LeadActivity.objects.get_or_create(
                    lead=data['lead'],
                    activity_type=data['activity_type'],
                    content=data.get('notes', ''),
                    defaults={
                        'user': pm,
                    },
                )
                if created:
                    act_created += 1

            self.ok(f'{act_created} actividades CRM')
        except (ImportError, AttributeError) as e:
            self.info(f'Actividades CRM: {e}')

        # ── 16. Purchase Orders ───────────────────────────────────────────────
        if project:
            self.stdout.write('\n  16. Órdenes de compra')

            supplier_cempro = Supplier.objects.filter(name__icontains='CEMPRO').first()
            supplier_improsa = Supplier.objects.filter(name__icontains='IMPROSA').first()
            supplier_dist   = Supplier.objects.filter(name__icontains='Eléctrica').first()

            prod_cemento = Product.objects.filter(sku='CEM-UGC-001').first()
            prod_arena   = Product.objects.filter(sku='MAT-ARE-001').first()
            prod_piedrin = Product.objects.filter(sku='MAT-PIE-001').first()
            prod_azulejo = Product.objects.filter(sku='ACB-AZU-001').first()
            prod_pintura = Product.objects.filter(sku='ACB-PIN-001').first()

            fase_acabados = phases[2] if len(phases) >= 3 else None

            period_sep2 = AccountingPeriod.objects.filter(year=2026, month=9).first()
            period_oct  = AccountingPeriod.objects.filter(year=2026, month=10).first()

            po_data = [
                {
                    'supplier':       supplier_cempro,
                    'status':         POStatus.RECEIVED,
                    'delivery_date':  datetime.date(2026, 9, 12),
                    'delivery_address': 'Zona 15, Vista Hermosa — Proyecto Los Palmerales',
                    'notes':          'Cemento para repello y cernido. Entrega en obra.',
                    'period':         period_sep2,
                    'lines': [
                        (prod_cemento, 200, Decimal('42.50'), 'Cemento UGC 42.5 kg'),
                    ],
                },
                {
                    'supplier':       supplier_improsa,
                    'status':         POStatus.RECEIVED,
                    'delivery_date':  datetime.date(2026, 9, 15),
                    'delivery_address': 'Zona 15, Vista Hermosa — Proyecto Los Palmerales',
                    'notes':          'Azulejo y pintura para fase acabados.',
                    'period':         period_sep2,
                    'lines': [
                        (prod_azulejo, 120, Decimal('95.00'), 'Azulejo 30×30 cm baños y cocina'),
                        (prod_pintura, 60,  Decimal('98.00'), 'Pintura látex interior blanco'),
                    ],
                },
                {
                    'supplier':       supplier_dist,
                    'status':         POStatus.CONFIRMED,
                    'delivery_date':  datetime.date(2026, 10, 28),
                    'delivery_address': 'Zona 15, Vista Hermosa — Proyecto Los Palmerales',
                    'notes':          'Materiales eléctricos para CO-001 ampliación puntos cocina.',
                    'period':         period_oct,
                    'lines':          [],
                },
            ]

            po_created = 0
            po_objects = []
            for po_info in po_data:
                if not po_info['supplier']:
                    continue
                po, created = PurchaseOrder.objects.get_or_create(
                    project=project,
                    supplier=po_info['supplier'],
                    status=po_info['status'],
                    defaults={
                        'phase':             fase_acabados,
                        'accounting_period': po_info.get('period'),
                        'delivery_date':     po_info['delivery_date'],
                        'delivery_address':  po_info['delivery_address'],
                        'notes':             po_info['notes'],
                        'created_by':        pm,
                        'tax_percentage':    Decimal('12.00'),
                    },
                )
                po_objects.append(po)
                if created:
                    po_created += 1
                    for product, qty, price, desc in po_info.get('lines', []):
                        if product:
                            PurchaseOrderLine.objects.get_or_create(
                                purchase_order=po,
                                description=desc,
                                defaults={
                                    'product':       product,
                                    'quantity':      Decimal(str(qty)),
                                    'unit_cost_gtq': price,
                                },
                            )

            self.ok(f'{po_created} órdenes de compra')

            # ── 17. GoodsReceipts ─────────────────────────────────────────────
            self.stdout.write('\n  17. Recepciones de mercancía')
            gr_created = 0

            for po in po_objects:
                if po.status not in (POStatus.RECEIVED, POStatus.INVOICED):
                    continue
                gr, created = GoodsReceipt.objects.get_or_create(
                    purchase_order=po,
                    defaults={
                        'received_date': po.delivery_date,
                        'status':        GRStatus.POSTED,
                        'received_by':   pm,
                        'notes':         'Recepción completa conforme OC.',
                        'created_by':    pm,
                    },
                )
                if created:
                    gr_created += 1
                    for line in po.lines.all():
                        GoodsReceiptLine.objects.get_or_create(
                            receipt=gr,
                            po_line=line,
                            defaults={
                                'quantity_received': line.quantity,
                                'unit_cost_gtq':     line.unit_cost_gtq,
                                'notes':             'Recibido completo.',
                            },
                        )

            self.ok(f'{gr_created} recepciones creadas')

            # ── 18. SupplierInvoices ──────────────────────────────────────────
            self.stdout.write('\n  18. Facturas de proveedor')
            period_sep = AccountingPeriod.objects.filter(year=2026, month=9).first()
            inv_created = 0
            for po in po_objects[:2]:
                if po.status not in (POStatus.RECEIVED, POStatus.INVOICED):
                    continue
                inv_date = po.delivery_date + datetime.timedelta(days=3)
                si, created = SupplierInvoice.objects.get_or_create(
                    supplier=po.supplier,
                    issue_date=inv_date,
                    defaults={
                        'purchase_order':         po,
                        'accounting_period':      period_sep,
                        'supplier_invoice_number': f'F-{po.supplier.nit or "0000"}-001',
                        'due_date':               inv_date + datetime.timedelta(days=30),
                        'tax_percentage':         Decimal('12.00'),
                        'status':                 SupplierInvoiceStatus.POSTED,
                        'notes':                  'Factura FEL recibida y verificada.',
                        'created_by':             pm,
                    },
                )
                if created:
                    inv_created += 1
                    for po_line in po.lines.all():
                        SupplierInvoiceLine.objects.get_or_create(
                            invoice=si,
                            description=po_line.description,
                            defaults={
                                'quantity':      po_line.quantity,
                                'unit_cost_gtq': po_line.unit_cost_gtq,
                            },
                        )

            self.ok(f'{inv_created} facturas de proveedor')

        # ── 19. CompanySettings ───────────────────────────────────────────────
        self.stdout.write('\n  19. Configuración de empresa')
        cs, created = CompanySettings.objects.get_or_create(
            pk=1,
            defaults={
                'name':    'Grucore Construcciones',
                'tagline': 'Construcción y Remodelación Premium en Guatemala',
            },
        )
        if created:
            self.ok('CompanySettings creado')
        else:
            self.info('CompanySettings ya existe')

        # ── 20. Subcontratistas ───────────────────────────────────────────────
        # SubcontractorContract usa Supplier con category='subcontractor'
        self.stdout.write('\n  20. Subcontratistas — contratos y certificaciones')
        try:
            from apps.subcontractors.models import (
                SubcontractorContract, SubcontractorCertification,
                ContractStatus,
            )

            # Crear proveedores subcontratistas adicionales si no existen
            sub_suppliers_data = [
                ('Fontanería y Drenajes Velásquez', 'subcontractor', 'Raúl Velásquez',
                 'velasquez.plomeria@gmail.com', '+502 5580-0302', '5678901-2', 4),
                ('Acabados y Pisos Interalia', 'subcontractor', 'María García',
                 'interalia.acabados@gmail.com', '+502 5580-0403', '6789012-3', 4),
            ]
            for name, cat, contact, email, phone, nit, rating in sub_suppliers_data:
                Supplier.objects.get_or_create(
                    name=name,
                    defaults={
                        'category': cat, 'contact_person': contact,
                        'email': email, 'phone': phone,
                        'nit': nit, 'rating': rating, 'is_active': True,
                    },
                )

            if not project:
                self.info('Contratos de subcontratistas omitidos (no hay proyecto demo)')
            else:
                fase_acabados = phases[2] if len(phases) >= 3 else None
                period_aug = AccountingPeriod.objects.filter(year=2026, month=8).first()

                sub_elec = Supplier.objects.filter(category='subcontractor').order_by('name').first()
                sub_font = Supplier.objects.filter(name__icontains='Velásquez').first()

                contracts_data = [
                    (sub_elec, 'Instalación eléctrica completa — Los Palmerales',
                     datetime.date(2026, 8, 1), datetime.date(2026, 11, 30),
                     Decimal('42000.00'), Decimal('10.00')),
                ]
                if sub_font:
                    contracts_data.append(
                        (sub_font, 'Instalación hidráulica y drenajes — Los Palmerales',
                         datetime.date(2026, 8, 15), datetime.date(2026, 12, 15),
                         Decimal('28500.00'), Decimal('10.00'))
                    )

                contracts_created = 0
                first_contract = None
                for sub, title, start, end, amount, ret_pct in contracts_data:
                    if not sub:
                        continue
                    contract, created = SubcontractorContract.objects.get_or_create(
                        subcontractor=sub,
                        project=project,
                        defaults={
                            'title':              title,
                            'start_date':         start,
                            'end_date':           end,
                            'contract_value_gtq': amount,
                            'retention_pct':      ret_pct,
                            'status':             ContractStatus.ACTIVE,
                            'phase':              fase_acabados,
                            'accounting_period':  period_aug,
                            'created_by':         pm,
                        },
                    )
                    if created:
                        contracts_created += 1
                    if first_contract is None:
                        first_contract = contract

                self.ok(f'{contracts_created} contratos de subcontratistas')

                # Certificación del primer contrato
                if first_contract:
                    _, cert_created = SubcontractorCertification.objects.get_or_create(
                        contract=first_contract,
                        period_from=datetime.date(2026, 8, 1),
                        defaults={
                            'period_to':              datetime.date(2026, 8, 31),
                            'amount_certified_gtq':   Decimal('22000.00'),
                            'retention_withheld_gtq': Decimal('2200.00'),
                            'advance_recovery_gtq':   Decimal('0.00'),
                            'description':            'Instalación eléctrica primer nivel completada.',
                        },
                    )
                    if cert_created:
                        self.ok('1 certificación creada')

        except (ImportError, AttributeError) as e:
            self.info(f'Subcontratistas omitidos: {e}')

        # ── Resumen final ─────────────────────────────────────────────────────
        self.stdout.write('\n' + '─' * 60)
        self.stdout.write(self.style.SUCCESS(
            '\n  ✅  Seed completo exitoso\n\n'
            '  Módulos poblados:\n'
            '  · Catálogo de cuentas · Centros y códigos de costo\n'
            '  · Períodos contables 2025–2026\n'
            '  · AccountMappings (14 claves GL)\n'
            '  · Reglas fiscales (IVA, IGSS, ISR) — validar con contador\n'
            '  · Activos fijos (4 equipos + categorías)\n'
            '  · Uso de equipos + mantenimientos\n'
            '  · CRM pipeline + 7 etapas + 12 leads\n'
            '  · Órdenes de compra + recepciones + facturas de proveedor\n'
            '  · Subcontratistas + contratos + certificaciones\n'
            '  · CompanySettings\n'
        ))
        self.stdout.write('─' * 60 + '\n')
