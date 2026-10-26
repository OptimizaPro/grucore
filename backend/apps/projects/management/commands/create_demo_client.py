"""
Management command: create_demo_client
Crea un cliente de prueba completo para explorar el portal de cliente.

Uso:
    python manage.py create_demo_client
    python manage.py create_demo_client --reset   # borra y recrea

Credenciales generadas:
    Email:    cliente@demo.grucore.com
    Password: Demo1234!
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
import datetime

DEMO_EMAIL    = 'cliente@demo.grucore.com'
DEMO_PASSWORD = 'Demo1234!'


class Command(BaseCommand):
    help = 'Crea un cliente demo con proyecto, fases, hitos y bitácora de obra'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Elimina el cliente demo existente antes de recrearlo',
        )

    def handle(self, *args, **options):
        from apps.users.models import User
        from apps.projects.models import (
            Client, Project, Phase, ProgressUpdate, ProgressPhoto,
            PaymentMilestone, MilestoneEvidence, MilestoneApproval,
            MilestoneStatus, ApprovalStatus,
        )

        # ── Reset ──────────────────────────────────────────────────────────────
        if options['reset']:
            User.objects.filter(email=DEMO_EMAIL).delete()
            self.stdout.write('  Demo anterior eliminado.')

        if User.objects.filter(email=DEMO_EMAIL).exists():
            self.stdout.write(self.style.WARNING(
                f'El usuario {DEMO_EMAIL} ya existe. Usa --reset para recrearlo.'
            ))
            return

        # ── 1. Usuario del portal ──────────────────────────────────────────────
        user = User.objects.create_user(
            username='cliente_demo',
            email=DEMO_EMAIL,
            password=DEMO_PASSWORD,
            first_name='Mildred',
            last_name='Ciani',
            role='client_portal',
            phone='+502 5555-1234',
            preferred_language='es',
            preferred_currency='GTQ',
        )
        self.stdout.write(f'  ✓ Usuario: {DEMO_EMAIL} / {DEMO_PASSWORD}')

        # ── 2. Perfil de cliente ───────────────────────────────────────────────
        client = Client.objects.create(
            name='Mildred Ciani',
            email=DEMO_EMAIL,
            phone='+502 5555-1234',
            company='Inversiones Ciani S.A.',
            nit='1234567-8',
            address='15 Calle 10-56, Zona 10, Guatemala City',
            portal_user=user,
            preferred_language='es',
            preferred_currency='GTQ',
        )
        self.stdout.write(f'  ✓ Cliente: {client.name}')

        # ── 3. Director de proyecto (admin) ───────────────────────────────────
        pm, _ = User.objects.get_or_create(
            username='pm_demo',
            defaults={
                'email': 'pm@grucore.com',
                'first_name': 'Roberto',
                'last_name': 'Castillo',
                'role': 'project_manager',
            },
        )
        if _:
            pm.set_password('PM1234!')
            pm.save()

        # ── 4. Proyecto ───────────────────────────────────────────────────────
        project = Project.objects.create(
            client=client,
            project_manager=pm,
            created_by=pm,
            name='Residencia Ciani — Zona 15',
            slug=slugify('residencia-ciani-zona-15'),
            description=(
                'Construcción de residencia unifamiliar de dos niveles. '
                'Área total: 320 m². Incluye piscina, terraza techada y jardín.'
            ),
            project_type='residential',
            status='active',
            address='Condominio Las Cumbres, Lote 42, Zona 15',
            city='Ciudad de Guatemala',
            department='Guatemala',
            start_date=datetime.date(2026, 3, 10),
            estimated_end=datetime.date(2026, 12, 15),
            total_budget_gtq=1_850_000,
            exchange_rate_snapshot='7.75',
            is_public_portfolio=False,
        )
        self.stdout.write(f'  ✓ Proyecto: {project.name}')

        # ── 5. Fases ──────────────────────────────────────────────────────────
        fase_cimientos = Phase.objects.create(
            project=project, name='Cimientos y estructura',
            order=1, status='completed',
            start_date=datetime.date(2026, 3, 10),
            end_date=datetime.date(2026, 5, 20),
            budget_allocated_gtq=370_000,
        )
        fase_paredes = Phase.objects.create(
            project=project, name='Levantado de paredes y losa',
            order=2, status='completed',
            start_date=datetime.date(2026, 5, 21),
            end_date=datetime.date(2026, 7, 30),
            budget_allocated_gtq=480_000,
        )
        fase_acabados = Phase.objects.create(
            project=project, name='Instalaciones y acabados interiores',
            order=3, status='active',
            start_date=datetime.date(2026, 8, 1),
            budget_allocated_gtq=620_000,
        )
        fase_exteriores = Phase.objects.create(
            project=project, name='Exteriores y entrega',
            order=4, status='draft',
            budget_allocated_gtq=380_000,
        )
        self.stdout.write(f'  ✓ 4 fases creadas')

        # ── 6. Bitácora de progreso ───────────────────────────────────────────
        updates = [
            dict(
                date=datetime.date(2026, 10, 14),
                progress_pct=62,
                weather='Parcialmente nublado', temperature=22,
                labor_count=18,
                activities=['Instalación eléctrica 2do nivel', 'Repello interior sala-comedor', 'Colocación de ventanas PVC'],
                materials=['Cable THHN #12', 'Repello premezclado', 'Marcos PVC blancos'],
                notes='Avance satisfactorio en instalación eléctrica. Se completó el 80% del tendido del 2do nivel. Inicio de repello interior en sala y comedor, listos para primera capa.',
            ),
            dict(
                date=datetime.date(2026, 10, 7),
                progress_pct=58,
                weather='Soleado', temperature=25,
                labor_count=21,
                activities=['Instalación fontanería 2do nivel', 'Colocación puertas principales', 'Inicio repello fachada'],
                materials=['Tubo PVC 1/2"', 'Puertas de madera sólida', 'Impermeabilizante fachada'],
                notes='Semana productiva. Fontanería del 2do nivel completada al 90%. Instalación de puertas principales. Se inició el repello de fachada frontal.',
            ),
            dict(
                date=datetime.date(2026, 9, 30),
                progress_pct=53,
                weather='Lluvioso', temperature=19,
                labor_count=14,
                activities=['Colado losa entrepiso 2do nivel', 'Curado de concreto'],
                materials=['Concreto 4000 PSI', 'Varilla #4', 'Aditivo curador'],
                notes='Lluvia intensa limitó actividades a la tarde. Se completó colado de losa entrepiso. Curado iniciado correctamente.',
            ),
        ]
        for u_data in updates:
            activities = u_data.pop('activities')
            materials  = u_data.pop('materials')
            pu = ProgressUpdate.objects.create(
                project=project, phase=fase_acabados,
                created_by=pm,
                activities=activities,
                materials=materials,
                **u_data,
            )
            # Foto de referencia pública (Unsplash)
            ProgressPhoto.objects.create(
                update=pu,
                photo_url='https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60',
                caption=f'Avance {pu.progress_pct}% — {pu.date}',
            )
        self.stdout.write(f'  ✓ 3 entradas de bitácora creadas')

        # ── 7. Hitos de pago ──────────────────────────────────────────────────

        # Hito 1 — Pagado
        h1 = PaymentMilestone.objects.create(
            project=project, phase=fase_cimientos,
            name='Anticipo — Inicio de obra',
            description='30% del contrato al inicio. Cubre movilización, cimientos y primera semana de estructura.',
            order=1, amount_gtq=555_000,
            progress_required_pct=0,
            status=MilestoneStatus.PAID,
            due_date=datetime.date(2026, 3, 10),
            paid_at=timezone.make_aware(datetime.datetime(2026, 3, 11, 10, 30)),
        )
        apr1 = MilestoneApproval.objects.create(
            milestone=h1,
            status=ApprovalStatus.FULLY_APPROVED,
            company_approved_by=pm,
            company_approved_at=timezone.make_aware(datetime.datetime(2026, 3, 10, 14, 0)),
            company_notes='Anticipo recibido. Obra iniciada.',
            client_approved_at=timezone.make_aware(datetime.datetime(2026, 3, 10, 16, 45)),
            client_notes='Confirmado por el cliente.',
        )

        # Hito 2 — Pagado
        h2 = PaymentMilestone.objects.create(
            project=project, phase=fase_paredes,
            name='2do Desembolso — Losa y paredes',
            description='25% al completar cimientos y levantado de paredes del primer nivel.',
            order=2, amount_gtq=462_500,
            progress_required_pct=35,
            status=MilestoneStatus.PAID,
            due_date=datetime.date(2026, 6, 15),
            paid_at=timezone.make_aware(datetime.datetime(2026, 6, 20, 9, 0)),
        )
        MilestoneApproval.objects.create(
            milestone=h2,
            status=ApprovalStatus.FULLY_APPROVED,
            company_approved_by=pm,
            company_approved_at=timezone.make_aware(datetime.datetime(2026, 6, 18, 10, 0)),
            client_approved_at=timezone.make_aware(datetime.datetime(2026, 6, 19, 11, 30)),
        )

        # Hito 3 — Requiere firma del cliente (awaiting_approval)
        h3 = PaymentMilestone.objects.create(
            project=project, phase=fase_acabados,
            name='3er Desembolso — Instalaciones y acabados',
            description='25% al completar instalaciones eléctricas, fontanería y primera capa de acabados interiores.',
            order=3, amount_gtq=462_500,
            progress_required_pct=60,
            status=MilestoneStatus.AWAITING_APPROVAL,
            due_date=datetime.date(2026, 10, 31),
        )
        # Evidencia fotográfica del hito
        MilestoneEvidence.objects.create(
            milestone=h3,
            photo_url='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=60',
            caption='Instalación eléctrica 2do nivel completada',
            uploaded_by=pm,
        )
        MilestoneEvidence.objects.create(
            milestone=h3,
            photo_url='https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=60',
            caption='Repello interior sala — lista para segunda capa',
            uploaded_by=pm,
        )
        # Aprobación: constructora ya firmó, cliente pendiente
        MilestoneApproval.objects.create(
            milestone=h3,
            status=ApprovalStatus.COMPANY_APPROVED,
            company_approved_by=pm,
            company_approved_at=timezone.make_aware(datetime.datetime(2026, 10, 15, 9, 0)),
            company_notes='Instalaciones verificadas en sitio. Avance del 62% confirmado.',
        )

        # Hito 4 — Pendiente
        PaymentMilestone.objects.create(
            project=project, phase=fase_exteriores,
            name='Liquidación final — Entrega de obra',
            description='20% restante a la entrega formal del proyecto con acta de recepción.',
            order=4, amount_gtq=370_000,
            progress_required_pct=100,
            status=MilestoneStatus.PENDING,
            due_date=datetime.date(2026, 12, 15),
        )

        self.stdout.write(f'  ✓ 4 hitos de pago creados (1 requiere tu firma)')

        # ── Resumen final ─────────────────────────────────────────────────────
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('━' * 50))
        self.stdout.write(self.style.SUCCESS('  Cliente demo creado exitosamente'))
        self.stdout.write(self.style.SUCCESS('━' * 50))
        self.stdout.write(f'  URL:       http://localhost:3001/portal')
        self.stdout.write(f'  Email:     {DEMO_EMAIL}')
        self.stdout.write(f'  Password:  {DEMO_PASSWORD}')
        self.stdout.write(self.style.SUCCESS('━' * 50))
