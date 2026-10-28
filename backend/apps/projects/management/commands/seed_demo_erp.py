"""
Management command: seed_demo_erp
Puebla todos los módulos ERP internos para el proyecto demo:
  Workers, WorkLogs, Tasks, Expenses, Invoices, ChangeOrders,
  Documents, RFIs, Submittals, PunchItems, Messages,
  Notifications, InventoryCategories, Products, StockMovements,
  Suppliers.

Prerequisito:
    python manage.py create_demo_client

Uso:
    python manage.py seed_demo_erp
    python manage.py seed_demo_erp --reset
"""

import datetime
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone

DEMO_CLIENT_EMAIL = 'cliente@demo.grucore.com'


class Command(BaseCommand):
    help = 'Puebla todos los módulos ERP del proyecto demo'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Elimina datos ERP demo existentes antes de recrearlos',
        )

    def ok(self, msg):
        self.stdout.write(self.style.SUCCESS(f'  ✓ {msg}'))

    def handle(self, *args, **options):
        # ── Imports internos ──────────────────────────────────────────────────
        from apps.users.models import User
        from apps.projects.models import Client, Project, Phase, Task
        from apps.workers.models import Worker, WorkLog
        from apps.financials.models import Expense, Invoice
        from apps.change_orders.models import ChangeOrder, ChangeOrderApproval
        from apps.documents.models import Document, RFI, Submittal, PunchItem
        from apps.communications.models import Notification, ProjectMessage
        from apps.inventory.models import InventoryCategory, Product, StockMovement
        from apps.suppliers.models import Supplier

        # ── Localizar proyecto demo ───────────────────────────────────────────
        try:
            demo_user = User.objects.get(email=DEMO_CLIENT_EMAIL)
            client    = Client.objects.get(portal_user=demo_user)
            project   = Project.objects.get(client=client)
        except (User.DoesNotExist, Client.DoesNotExist, Project.DoesNotExist):
            raise CommandError(
                'Proyecto demo no encontrado. '
                'Ejecuta primero: python manage.py create_demo_client'
            )

        pm     = project.project_manager
        phases = list(project.phases.order_by('order'))

        if len(phases) < 4:
            raise CommandError(
                'El proyecto demo debe tener 4 fases. '
                'Ejecuta: python manage.py create_demo_client --reset'
            )

        fase_cimientos, fase_paredes, fase_acabados, fase_exteriores = phases

        self.stdout.write(f'\nPoblando ERP demo → {project.name}\n')

        # ── Reset ─────────────────────────────────────────────────────────────
        if options['reset']:
            project.tasks.all().delete()
            project.expenses.all().delete()
            project.invoices.all().delete()
            project.change_orders.all().delete()
            project.documents.all().delete()
            project.rfis.all().delete()
            project.submittals.all().delete()
            project.punchitems.all().delete()
            project.messages.all().delete()
            project.notifications.all().delete()
            StockMovement.objects.filter(project=project).delete()
            Worker.objects.filter(current_project=project).delete()
            Supplier.objects.all().delete()
            InventoryCategory.objects.all().delete()  # cascades Products
            self.stdout.write('  Datos ERP demo anteriores eliminados.')

        # ── 1. Supervisor de obra ─────────────────────────────────────────────
        supervisor, created = User.objects.get_or_create(
            username='supervisor_demo',
            defaults={
                'email': 'supervisor@grucore.com',
                'first_name': 'Héctor',
                'last_name': 'Barrios',
                'role': 'site_supervisor',
            },
        )
        if created:
            supervisor.set_password('Super1234!')
            supervisor.save()
        self.ok(f'Supervisor: {supervisor.get_full_name()}')

        # ── 2. Workers ────────────────────────────────────────────────────────
        # positions válidas: peon, oficial, maestro_obras, albanil,
        #                    electricista, fontanero, soldador, carpintero,
        #                    supervisor, otro
        workers_data = [
            ('Juan',     'López Pérez',     'maestro_obras', 350, '+502 4455-1001'),
            ('Pedro',    'Ajú Caal',        'albanil',       280, '+502 4455-1002'),
            ('Carlos',   'Coj Xol',         'albanil',       280, '+502 4455-1003'),
            ('Miguel',   'Choc Tec',        'peon',          200, '+502 4455-1004'),
            ('Roberto',  'Ixcoy Tzoc',      'electricista',  320, '+502 4455-1005'),
            ('Diego',    'Pérez Batz',      'fontanero',     300, '+502 4455-1006'),
            ('Fernando', 'Batz Chávez',     'soldador',      310, '+502 4455-1007'),
            ('Luis',     'Xoc Mendoza',     'oficial',       270, '+502 4455-1008'),
            ('Andrés',   'Caal Maas',       'peon',          200, '+502 4455-1009'),
            ('Ernesto',  'Juárez Figueroa', 'carpintero',    295, '+502 4455-1010'),
        ]

        workers = []
        for first, last, position, rate, phone in workers_data:
            w, _ = Worker.objects.get_or_create(
                first_name=first,
                last_name=last,
                defaults={
                    'position':              position,
                    'daily_rate_gtq':        rate,
                    'phone':                 phone,
                    'hire_date':             datetime.date(2025, 1, 15),
                    'status':                'active',
                    'current_project':       project,
                    'created_by':            pm,
                    'emergency_contact_name': 'Contacto familiar',
                    'emergency_contact_phone': '+502 4455-9999',
                },
            )
            workers.append(w)

        self.ok(f'{len(workers)} trabajadores')

        # ── 3. WorkLogs ───────────────────────────────────────────────────────
        # Registros desde inicio de fase_acabados (1-ago-2026) hasta hoy
        log_start = datetime.date(2026, 8, 1)
        log_end   = datetime.date(2026, 10, 20)
        active_workers = workers[:7]  # los primeros 7 en obra

        logs_created = 0
        current = log_start
        while current <= log_end:
            if current.weekday() < 6:  # lun–sáb
                for w in active_workers:
                    _, created = WorkLog.objects.get_or_create(
                        worker=w,
                        project=project,
                        date=current,
                        defaults={
                            'regular_hours':  8,
                            'overtime_hours': 1 if current.weekday() == 5 else 0,
                            'notes':          '',
                            'created_by':     supervisor,
                        },
                    )
                    if created:
                        logs_created += 1
            current += datetime.timedelta(days=1)

        self.ok(f'{logs_created} registros de asistencia')

        # ── 4. Tasks ──────────────────────────────────────────────────────────
        tasks_data = [
            # (phase, title, status, priority, due_date)
            (fase_cimientos, 'Replanteo y trazo topográfico',       'done',        'high',     datetime.date(2026, 3, 15)),
            (fase_cimientos, 'Excavación y nivelación de terreno',  'done',        'high',     datetime.date(2026, 3, 25)),
            (fase_cimientos, 'Armado y colado de cimientos',        'done',        'critical', datetime.date(2026, 4, 20)),
            (fase_cimientos, 'Columnas primer nivel',               'done',        'high',     datetime.date(2026, 5, 10)),
            (fase_paredes,   'Levantado de block primer nivel',     'done',        'high',     datetime.date(2026, 6, 10)),
            (fase_paredes,   'Colado de losa primer nivel',         'done',        'critical', datetime.date(2026, 6, 30)),
            (fase_paredes,   'Levantado de block segundo nivel',    'done',        'high',     datetime.date(2026, 7, 20)),
            (fase_paredes,   'Colado de losa segundo nivel',        'done',        'critical', datetime.date(2026, 7, 28)),
            (fase_acabados,  'Instalación eléctrica primer nivel',  'done',        'high',     datetime.date(2026, 8, 20)),
            (fase_acabados,  'Instalación hidráulica y drenajes',   'in_progress', 'high',     datetime.date(2026, 10, 30)),
            (fase_acabados,  'Repello y cernido de paredes',        'in_progress', 'medium',   datetime.date(2026, 11, 10)),
            (fase_acabados,  'Azulejado de baños y cocina',         'pending',     'medium',   datetime.date(2026, 11, 20)),
            (fase_acabados,  'Pintura interior primera mano',       'pending',     'low',      datetime.date(2026, 12, 1)),
            (fase_exteriores,'Cerramiento perimetral',              'pending',     'medium',   datetime.date(2026, 12, 5)),
            (fase_exteriores,'Jardinería y áreas verdes',           'pending',     'low',      datetime.date(2026, 12, 12)),
        ]

        for phase, title, status, priority, due_date in tasks_data:
            Task.objects.get_or_create(
                project=project,
                title=title,
                defaults={
                    'phase':        phase,
                    'assigned_to':  supervisor,
                    'created_by':   pm,
                    'status':       status,
                    'priority':     priority,
                    'due_date':     due_date,
                    'completed_at': timezone.now() if status == 'done' else None,
                },
            )

        self.ok(f'{len(tasks_data)} tareas')

        # ── 5. Suppliers ──────────────────────────────────────────────────────
        # categories válidas: materials, equipment, subcontractor,
        #                     services, tools, transport, other
        suppliers_data = [
            ('Disagro S.A.',               'materials',     'Luis Morales',    'ventas@disagro.com',          '+502 2429-7000', '1234567-8', 4),
            ('Cementos Progreso (CEMPRO)', 'materials',     'Ana Cifuentes',   'clientes@cempro.com',         '+502 2390-7000', '8765432-1', 5),
            ('IMPROSA',                    'materials',     'Jorge Salazar',   'ventas@improsa.com.gt',       '+502 2440-5050', '2345678-9', 4),
            ('Ferretería El Constructor',  'tools',         'Marco Ruiz',      'info@elconstructor.com.gt',   '+502 7832-4444', '3456789-0', 4),
            ('Distribuidora Eléctrica GT', 'subcontractor', 'Pedro Archila',   'ventas@distelectrica.com.gt', '+502 2380-1234', '4567890-1', 5),
            ('Alquileres Palencia',        'equipment',     'Sandra López',    'alquileres@palencia.com.gt',  '+502 7857-8888', '5678901-2', 3),
            ('Pinturas Kativo GT',         'materials',     'Roberto Castro',  'ventas@kativo.com.gt',        '+502 2381-5500', '6789012-3', 4),
        ]

        for name, category, contact, email, phone, nit, rating in suppliers_data:
            Supplier.objects.get_or_create(
                name=name,
                defaults={
                    'category':       category,
                    'contact_person': contact,
                    'email':          email,
                    'phone':          phone,
                    'nit':            nit,
                    'rating':         rating,
                    'is_active':      True,
                },
            )

        self.ok(f'{len(suppliers_data)} proveedores')

        # ── 6. Inventario ─────────────────────────────────────────────────────
        cat_mat, _ = InventoryCategory.objects.get_or_create(
            name='Materiales de construcción',
            defaults={'color': '#FF6B35', 'description': 'Cemento, block, arena, piedrín, varilla'},
        )
        cat_her, _ = InventoryCategory.objects.get_or_create(
            name='Herramientas',
            defaults={'color': '#6B8CFF', 'description': 'Herramientas manuales y de poder'},
        )
        cat_eqp, _ = InventoryCategory.objects.get_or_create(
            name='Equipos y maquinaria',
            defaults={'color': '#4A9E6B', 'description': 'Mezcladoras, vibradores, andamios'},
        )
        cat_acb, _ = InventoryCategory.objects.get_or_create(
            name='Acabados',
            defaults={'color': '#F59E0B', 'description': 'Pintura, azulejo, piso, molduras'},
        )

        # units válidas: unit, m2, m3, ml, kg, lb, ton, l, bag, roll, box, gal
        products_data = [
            ('Cemento UGC 42.5 kg',        'CEM-UGC-001', cat_mat, 'bag',  42.50,  350, 50),
            ('Arena de río',               'MAT-ARE-001', cat_mat, 'm3',  180.00,   80, 10),
            ('Piedrín 3/4"',               'MAT-PIE-001', cat_mat, 'm3',  220.00,   60, 10),
            ('Block 15×20×40 cm',          'MAT-BLK-001', cat_mat, 'unit',  3.50, 3500,500),
            ('Varilla corrugada 3/8" × 6m','MAT-VAR-038', cat_mat, 'unit', 35.00,  400, 80),
            ('Varilla corrugada 1/2" × 6m','MAT-VAR-050', cat_mat, 'unit', 58.00,  200, 40),
            ('Pintura Kativo Látex blanco', 'ACB-PIN-001', cat_acb, 'gal',  98.00,   60, 10),
            ('Azulejo 30×30 blanco mate',   'ACB-AZU-001', cat_acb, 'm2',   95.00,  120, 20),
            ('Mezcladora 1 saco',           'EQP-MEZ-001', cat_eqp, 'unit',4500.00,  2,  1),
            ('Andamio tubo 1.5 m sección',  'EQP-AND-001', cat_eqp, 'unit', 650.00,  20,  4),
            ('Piocho de 5 lb',              'HER-PIO-001', cat_her, 'unit', 120.00,  12,  4),
            ('Pala cuadrada',               'HER-PAL-001', cat_her, 'unit',  95.00,  15,  4),
        ]

        products = {}
        for name, sku, category, unit, price, stock, min_stock in products_data:
            p, _ = Product.objects.get_or_create(
                sku=sku,
                defaults={
                    'name':             name,
                    'category':         category,
                    'unit':             unit,
                    'unit_price_gtq':   price,
                    'stock_quantity':   stock,
                    'min_stock_alert':  min_stock,
                    'is_active':        True,
                },
            )
            products[sku] = p

        self.ok(f'{len(products)} productos')

        # Movimientos de stock (solo si no existen para este proyecto)
        if not StockMovement.objects.filter(project=project).exists():
            movements = [
                ('CEM-UGC-001', 'out', 120, 'Fase cimientos — colado'),
                ('MAT-ARE-001', 'out',  30, 'Fase cimientos — mezcla'),
                ('MAT-PIE-001', 'out',  25, 'Fase cimientos — colado losa'),
                ('MAT-BLK-001', 'out',1200, 'Fase paredes — primer nivel'),
                ('MAT-VAR-038', 'out', 150, 'Fase paredes — armado'),
                ('MAT-VAR-050', 'out',  80, 'Fase cimientos — vigas'),
                ('CEM-UGC-001', 'in',  200, 'Reposición inventario'),
                ('ACB-AZU-001', 'in',  120, 'Compra azulejo baños y cocina'),
                ('ACB-PIN-001', 'in',   60, 'Compra pintura primera mano'),
            ]
            for sku, mov_type, qty, notes in movements:
                if sku in products:
                    p = products[sku]
                    StockMovement.objects.create(
                        product=p,
                        project=project,
                        movement_type=mov_type,
                        quantity=qty,
                        notes=notes,
                        unit_price_gtq=p.unit_price_gtq,
                        performed_by=supervisor,
                    )
            self.ok(f'{len(movements)} movimientos de stock')
        else:
            self.stdout.write('  · Movimientos de stock ya existen, omitidos.')

        # ── 7. Expenses ───────────────────────────────────────────────────────
        # categories: materials, labor, equipment, subcontractor,
        #             permits, transportation, utilities, other
        expenses_data = [
            # (category, description, amount, phase, date, status, approved)
            ('materials',     'Cemento UGC — 240 sacos fase cimientos',           10_200, fase_cimientos, datetime.date(2026, 3, 20), 'approved', True),
            ('materials',     'Arena y piedrín — fase cimientos',                  9_500, fase_cimientos, datetime.date(2026, 4, 5),  'approved', True),
            ('materials',     'Varilla 3/8" y 1/2" — armado estructura',          18_600, fase_cimientos, datetime.date(2026, 4, 10), 'approved', True),
            ('materials',     'Block 15×20×40 — 1200 unidades fase paredes',       4_200, fase_paredes,   datetime.date(2026, 5, 28), 'approved', True),
            ('labor',         'Cuadrilla albanilería extra — fase paredes',        12_000, fase_paredes,   datetime.date(2026, 6, 15), 'approved', True),
            ('permits',       'Licencia construcción Municipalidad Guatemala',      8_500, fase_cimientos, datetime.date(2026, 3, 12), 'approved', True),
            ('subcontractor', 'Instalación eléctrica primer nivel',               22_000, fase_acabados,  datetime.date(2026, 8, 25), 'approved', True),
            ('equipment',     'Alquiler mezcladora 1 saco — 45 días',              4_050, fase_paredes,   datetime.date(2026, 6, 1),  'approved', True),
            ('materials',     'Azulejo 30×30 baños y cocina — 120 m²',            11_400, fase_acabados,  datetime.date(2026, 9, 10), 'approved', True),
            ('materials',     'Pintura Kativo látex interior — 60 galones',         5_880, fase_acabados,  datetime.date(2026, 10, 5), 'pending',  False),
            ('transportation','Flete de materiales — septiembre 2026',              2_400, fase_acabados,  datetime.date(2026, 9, 28), 'pending',  False),
        ]

        for category, desc, amount, phase, exp_date, status, approved in expenses_data:
            Expense.objects.get_or_create(
                project=project,
                description=desc,
                defaults={
                    'phase':        phase,
                    'category':     category,
                    'amount_gtq':   amount,
                    'expense_date': exp_date,
                    'submitted_by': supervisor,
                    'approved_by':  pm if approved else None,
                    'approved_at':  timezone.make_aware(
                        datetime.datetime.combine(
                            exp_date + datetime.timedelta(days=2),
                            datetime.time(10, 0),
                        )
                    ) if approved else None,
                    'status':       status,
                },
            )

        self.ok(f'{len(expenses_data)} gastos')

        # ── 8. Facturas ───────────────────────────────────────────────────────
        milestones = list(project.milestones.order_by('order'))
        invoices_created = 0

        if len(milestones) >= 1:
            _, created = Invoice.objects.get_or_create(
                invoice_number='GRU-2026-001',
                defaults={
                    'project':        project,
                    'milestone':      milestones[0],
                    'title':          'Factura — Hito 1: Cimientos completados',
                    'description':    'Cobro por hito de cimientos y estructura según contrato.',
                    'amount_gtq':     milestones[0].amount_gtq,
                    'tax_percentage': '12.00',
                    'issue_date':     datetime.date(2026, 5, 22),
                    'due_date':       datetime.date(2026, 6, 5),
                    'paid_at':        timezone.make_aware(datetime.datetime(2026, 5, 28, 14, 30)),
                    'status':         'paid',
                    'created_by':     pm,
                },
            )
            if created:
                invoices_created += 1

        if len(milestones) >= 2:
            _, created = Invoice.objects.get_or_create(
                invoice_number='GRU-2026-002',
                defaults={
                    'project':        project,
                    'milestone':      milestones[1],
                    'title':          'Factura — Hito 2: Paredes y losa completados',
                    'description':    'Cobro por hito de levantado de paredes y losa de concreto.',
                    'amount_gtq':     milestones[1].amount_gtq,
                    'tax_percentage': '12.00',
                    'issue_date':     datetime.date(2026, 8, 2),
                    'due_date':       datetime.date(2026, 8, 16),
                    'paid_at':        timezone.make_aware(datetime.datetime(2026, 8, 10, 11, 0)),
                    'status':         'paid',
                    'created_by':     pm,
                },
            )
            if created:
                invoices_created += 1

        if len(milestones) >= 3:
            _, created = Invoice.objects.get_or_create(
                invoice_number='GRU-2026-003',
                defaults={
                    'project':        project,
                    'milestone':      milestones[2],
                    'title':          'Factura — Hito 3: Instalaciones y acabados',
                    'description':    'Factura pendiente de aprobación del cliente.',
                    'amount_gtq':     milestones[2].amount_gtq,
                    'tax_percentage': '12.00',
                    'issue_date':     datetime.date(2026, 10, 15),
                    'due_date':       datetime.date(2026, 10, 29),
                    'status':         'sent',
                    'created_by':     pm,
                },
            )
            if created:
                invoices_created += 1

        self.ok(f'{invoices_created} facturas')

        # ── 9. Órdenes de cambio ──────────────────────────────────────────────
        # status: draft, submitted, in_review, approved, rejected, withdrawn
        # reason: scope_change, owner_request, unforeseen_condition, design_error, other
        # approval status: pending, company_approved, client_approved, fully_approved, rejected

        co1, co1_created = ChangeOrder.objects.get_or_create(
            project=project,
            number=1,
            defaults={
                'phase':                fase_acabados,
                'title':               'Ampliación de puntos eléctricos — Cocina',
                'description':         (
                    'Se requieren 4 tomacorrientes adicionales en la isla de cocina '
                    'y 2 circuitos extra para electrodomésticos de alto consumo.'
                ),
                'reason':              'owner_request',
                'amount_gtq':          8_500,
                'schedule_days_impact': 3,
                'requested_by':        pm,
                'status':              'approved',
                'submitted_at':        timezone.make_aware(datetime.datetime(2026, 8, 15, 9, 0)),
                'company_notes':       'Aprobado por gerencia. Materiales disponibles en inventario.',
                'client_notes':        'Conforme con la cotización presentada.',
            },
        )
        if co1_created:
            ChangeOrderApproval.objects.get_or_create(
                change_order=co1,
                defaults={
                    'status':              'fully_approved',
                    'company_approved_by': pm,
                    'company_approved_at': timezone.make_aware(datetime.datetime(2026, 8, 16, 10, 0)),
                    'company_notes':       'Aprobado internamente.',
                    'client_approved_at':  timezone.make_aware(datetime.datetime(2026, 8, 17, 15, 0)),
                    'client_notes':        'De acuerdo, proceder con los cambios.',
                },
            )

        co2, co2_created = ChangeOrder.objects.get_or_create(
            project=project,
            number=2,
            defaults={
                'phase':                fase_acabados,
                'title':               'Ventana adicional en dormitorio principal',
                'description':         (
                    'Apertura de vano y colocación de ventana tipo francés 1.20×1.80 m '
                    'en pared este del dormitorio principal para mejorar ventilación cruzada.'
                ),
                'reason':              'owner_request',
                'amount_gtq':          5_200,
                'schedule_days_impact': 2,
                'requested_by':        supervisor,
                'status':              'in_review',
                'submitted_at':        timezone.make_aware(datetime.datetime(2026, 10, 10, 11, 0)),
                'company_notes':       'Revisado y aprobado por gerencia. Pendiente firma del cliente.',
            },
        )
        if co2_created:
            ChangeOrderApproval.objects.get_or_create(
                change_order=co2,
                defaults={
                    'status':              'company_approved',
                    'company_approved_by': pm,
                    'company_approved_at': timezone.make_aware(datetime.datetime(2026, 10, 12, 9, 0)),
                    'company_notes':       'Aprobado internamente. Esperando firma del cliente.',
                },
            )

        self.ok('2 órdenes de cambio')

        # ── 10. Documentos ────────────────────────────────────────────────────
        # types: contract, blueprint, specification, report, permit, other
        docs_data = [
            ('contract',      'Contrato de construcción',              fase_cimientos, 'Contrato_Residencia_v1.pdf',       1240, '1'),
            ('blueprint',     'Planos arquitectónicos — Planta baja',  fase_cimientos, 'Planos_PlantaBaja_v1.dwg',         4800, '1'),
            ('blueprint',     'Planos estructurales — Cimientos',      fase_cimientos, 'Planos_Estructurales_v1.dwg',      3600, '1'),
            ('permit',        'Licencia de construcción municipal',    fase_cimientos, 'Licencia_Construccion_2026.pdf',    890, '1'),
            ('specification', 'Especificaciones técnicas de acabados', fase_acabados,  'Specs_Acabados_v2.pdf',            1560, '2'),
            ('report',        'Informe de avance — Septiembre 2026',   fase_acabados,  'Informe_Avance_Sep2026.pdf',        640, '1'),
        ]

        for doc_type, title, phase, filename, size_kb, version in docs_data:
            Document.objects.get_or_create(
                project=project,
                title=title,
                defaults={
                    'phase':        phase,
                    'document_type': doc_type,
                    'description':  f'Documento {doc_type}: {title}',
                    'file_url':     f'https://storage.grucore.com/demo/{filename}',
                    'file_name':    filename,
                    'file_size_kb': size_kb,
                    'version':      version,
                    'uploaded_by':  pm,
                    'tags':         [doc_type],
                    'is_archived':  False,
                },
            )

        self.ok(f'{len(docs_data)} documentos')

        # ── 11. RFIs ──────────────────────────────────────────────────────────
        # status: open, in_review, answered, closed
        # priority: low, medium, high, urgent
        RFI.objects.get_or_create(
            project=project,
            number=1,
            defaults={
                'phase':        fase_acabados,
                'subject':      'Especificación de refuerzo en vigas de amarre — 2do nivel',
                'description':  (
                    'El plano E-03 no especifica el diámetro de los estribos en las vigas '
                    'de amarre del segundo nivel. Se solicita aclaración antes de proceder.'
                ),
                'submitted_by': supervisor,
                'assigned_to':  pm,
                'status':       'answered',
                'priority':     'high',
                'due_date':     datetime.date(2026, 8, 10),
                'answer':       (
                    'Usar estribos No.2 @ 0.15m en zona de confinamiento y @ 0.20m '
                    'en zona central. Ver detalle en plano revisado E-03B.'
                ),
                'answered_by':  pm,
                'answered_at':  timezone.make_aware(datetime.datetime(2026, 8, 9, 16, 0)),
            },
        )

        RFI.objects.get_or_create(
            project=project,
            number=2,
            defaults={
                'phase':        fase_acabados,
                'subject':      'Confirmación de formato de azulejo — Baño principal',
                'description':  (
                    'El cliente solicitó cambiar el azulejo de 30×30 a 60×60 en el baño '
                    'principal. Se requiere aprobación y ajuste de cotización.'
                ),
                'submitted_by': supervisor,
                'assigned_to':  pm,
                'status':       'open',
                'priority':     'medium',
                'due_date':     datetime.date(2026, 10, 28),
            },
        )

        self.ok('2 RFIs')

        # ── 12. Submittals ────────────────────────────────────────────────────
        # status: pending, submitted, in_review, approved,
        #         approved_with_comments, rejected, resubmit
        Submittal.objects.get_or_create(
            project=project,
            number=1,
            defaults={
                'phase':          fase_cimientos,
                'title':          'Diseño de mezcla de concreto fc=210 kg/cm²',
                'description':    'Diseño de mezcla según norma ACI 318. Laboratorio certificado INFOM.',
                'submitted_by':   supervisor,
                'reviewed_by':    pm,
                'status':         'approved',
                'file_url':       'https://storage.grucore.com/demo/S001_DiseniMezcla.pdf',
                'review_notes':   'Aprobado sin observaciones. Proceder con la mezcla indicada.',
                'review_date':    datetime.date(2026, 3, 25),
            },
        )

        Submittal.objects.get_or_create(
            project=project,
            number=2,
            defaults={
                'phase':        fase_acabados,
                'title':        'Fichas técnicas luminarias y tomacorrientes',
                'description':  'Fichas técnicas de dispositivos eléctricos adicionales según CO-001.',
                'submitted_by': supervisor,
                'status':       'in_review',
                'file_url':     'https://storage.grucore.com/demo/S002_FichasTecnicas.pdf',
            },
        )

        self.ok('2 submittals')

        # ── 13. Punch Items ───────────────────────────────────────────────────
        # status: open, in_progress, resolved, closed
        # priority: low, medium, high, critical
        punch_data = [
            ('Fisura superficial en pared noreste dormitorio 2',   'Dormitorio 2 — pared noreste', 'high'),
            ('Nivelación pendiente en piso del área de servicio',  'Área de servicio — piso',      'medium'),
            ('Marco de ventana sala sin sellado perimetral',       'Sala — ventana principal',     'medium'),
            ('Toma de corriente doble sin tapa en corredor',       'Corredor segundo nivel',        'low'),
            ('Pintura de rodapié faltante en gradas',              'Gradas — rodapié',              'low'),
        ]

        for desc, location, priority in punch_data:
            PunchItem.objects.get_or_create(
                project=project,
                description=desc,
                defaults={
                    'phase':       fase_acabados,
                    'location':    location,
                    'assigned_to': supervisor,
                    'created_by':  supervisor,
                    'status':      'open',
                    'priority':    priority,
                    'due_date':    datetime.date(2026, 11, 15),
                },
            )

        self.ok(f'{len(punch_data)} punch items')

        # ── 14. Mensajes de proyecto ──────────────────────────────────────────
        if not ProjectMessage.objects.filter(project=project).exists():
            msgs = [
                (pm,         '2026-08-05 09:15',
                 'Buenos días equipo. Iniciamos la fase de instalaciones y acabados. '
                 'Prioridad esta semana: instalación eléctrica primer nivel.'),
                (supervisor, '2026-08-05 10:02',
                 'Entendido. El electricista inicia mañana a las 7am. '
                 'Tenemos todo el material en bodega.'),
                (pm,         '2026-09-12 08:30',
                 'Revisar avance de hidráulica y drenajes. El fontanero reporta '
                 'que necesita 2 días adicionales en el área de cocina.'),
                (supervisor, '2026-09-12 09:45',
                 'Confirmado. La demora es por el ajuste de la trampa de grasa. '
                 'Impacto mínimo al cronograma general.'),
                (pm,         '2026-10-08 11:00',
                 'CO-002 pendiente de firma del cliente. Coordinar visita para '
                 'revisar muestra de ventana tipo francés.'),
                (supervisor, '2026-10-09 07:55',
                 'La cliente visitó la obra ayer. Le gustó la propuesta. '
                 'Confirmará esta semana por correo.'),
                (pm,         '2026-10-15 16:30',
                 'Punch list activa con 5 ítems. Resolver los de prioridad alta '
                 'antes del 20 de octubre.'),
                (supervisor, '2026-10-16 08:20',
                 'La fisura en dormitorio 2 fue revisada por el maestro de obras. '
                 'Es superficial — solo requiere resane y pintura.'),
            ]

            for author, dt_str, body in msgs:
                ProjectMessage.objects.create(
                    project=project,
                    author=author,
                    body=body,
                    attachments=[],
                )

            self.ok(f'{len(msgs)} mensajes de proyecto')
        else:
            self.stdout.write('  · Mensajes ya existen, omitidos.')

        # ── 15. Notificaciones ────────────────────────────────────────────────
        # types: milestone_approved, milestone_paid, progress_update,
        #        document_uploaded, rfi_answered, change_order_submitted,
        #        change_order_approved, message_received, system
        notifs_data = [
            (pm,         'milestone_approved',      'Hito 3 aprobado por empresa',
             'El hito "Instalaciones y acabados" fue aprobado. Factura GRU-2026-003 emitida.'),
            (supervisor, 'rfi_answered',             'RFI #001 respondida',
             'La consulta sobre estribos de vigas fue respondida. Revisa el detalle en plano E-03B.'),
            (pm,         'change_order_submitted',   'CO-002 requiere acción',
             'La orden de cambio "Ventana dormitorio principal" está en revisión por el cliente.'),
            (supervisor, 'change_order_approved',    'CO-001 aprobada',
             'La orden de cambio "Puntos eléctricos cocina" fue aprobada por ambas partes.'),
            (pm,         'document_uploaded',        'Nuevo submittal pendiente',
             'Submittal S-002 "Fichas técnicas luminarias" requiere revisión técnica.'),
        ]

        for recipient, notif_type, title, body in notifs_data:
            Notification.objects.get_or_create(
                recipient=recipient,
                title=title,
                defaults={
                    'sender':            pm,
                    'notification_type': notif_type,
                    'body':              body,
                    'project':           project,
                    'is_read':           False,
                },
            )

        self.ok(f'{len(notifs_data)} notificaciones')

        # ── Resumen ───────────────────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS(
            f'\n✅  Seed ERP completo → {project.name}\n'
            '     Workers · WorkLogs · Tasks · Suppliers · Inventario\n'
            '     Gastos · Facturas · Órdenes de cambio · Documentos\n'
            '     RFIs · Submittals · Punch items · Mensajes · Notificaciones'
        ))
