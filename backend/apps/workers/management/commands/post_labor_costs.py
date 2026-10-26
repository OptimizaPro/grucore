"""
Management command: post_labor_costs
------------------------------------
Contabiliza las jornadas de trabajo de un período dado usando PostingService.

Uso:
    python manage.py post_labor_costs --year 2025 --month 3
    python manage.py post_labor_costs --year 2025 --month 3 --dry-run

Requisitos previos:
    - AccountMapping configurado para las claves:
        direct_labor_expense, igss_patronal_liab, payroll_liability
    - AccountingPeriod abierto para el año/mes indicado

NOTA: Solo contabiliza jornadas cuyo date pertenece al mes indicado.
"""
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Contabiliza costo laboral (WorkLogs) de un período en el libro mayor'

    def add_arguments(self, parser):
        parser.add_argument('--year',    type=int, required=True,  help='Año del período (ej: 2025)')
        parser.add_argument('--month',   type=int, required=True,  help='Mes del período (1-12)')
        parser.add_argument('--dry-run', action='store_true',      help='Simula sin crear asientos')
        parser.add_argument('--user-id', type=int, default=None,   help='ID del usuario que autoriza (por defecto primer superusuario)')

    def handle(self, *args, **options):
        year    = options['year']
        month   = options['month']
        dry_run = options['dry_run']
        user_id = options['user_id']

        if not (1 <= month <= 12):
            raise CommandError('--month debe estar entre 1 y 12.')

        User = get_user_model()

        # Resolver usuario autorizador
        if user_id:
            try:
                auth_user = User.objects.get(pk=user_id)
            except User.DoesNotExist:
                raise CommandError(f'Usuario con id={user_id} no encontrado.')
        else:
            auth_user = User.objects.filter(is_superuser=True).order_by('id').first()
            if not auth_user:
                raise CommandError('No hay superusuario. Use --user-id para especificar el usuario autorizador.')

        # Resolver período contable
        from apps.ledger.models import AccountingPeriod, PeriodStatus
        try:
            period = AccountingPeriod.objects.get(year=year, month=month)
        except AccountingPeriod.DoesNotExist:
            raise CommandError(
                f'No existe AccountingPeriod para {year}-{month:02d}. '
                f'Créelo en el admin antes de ejecutar este comando.'
            )
        if period.status == PeriodStatus.CLOSED:
            raise CommandError(f'El período {period} está cerrado. No se puede contabilizar en períodos cerrados.')

        # Obtener jornadas del período
        from apps.workers.models import WorkLog
        worklogs = list(
            WorkLog.objects
            .select_related('worker', 'project')
            .filter(date__year=year, date__month=month)
        )

        if not worklogs:
            self.stdout.write(self.style.WARNING(
                f'No hay jornadas de trabajo en {year}-{month:02d}. Nada que contabilizar.'
            ))
            return

        # Resumen previo
        gross_total = sum(wl.gross_pay    for wl in worklogs)
        igss_total  = sum(wl.igss_patronal for wl in worklogs)
        total_cost  = sum(wl.total_cost    for wl in worklogs)

        projects = {wl.project for wl in worklogs}
        self.stdout.write(
            f'\nPeríodo:      {year}-{month:02d}  ({period})\n'
            f'Jornadas:     {len(worklogs)}\n'
            f'Proyectos:    {len(projects)}\n'
            f'Salario bruto:{gross_total:>14.2f} GTQ\n'
            f'IGSS patronal:{igss_total:>14.2f} GTQ\n'
            f'Costo total:  {total_cost:>14.2f} GTQ\n'
        )

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN — no se crearon asientos.'))
            return

        # Ejecutar posting
        from apps.ledger.services import PostingService
        try:
            entries = PostingService.post_worklog_batch(worklogs, period, auth_user)
        except Exception as exc:
            raise CommandError(f'Error al contabilizar: {exc}')

        self.stdout.write(self.style.SUCCESS(
            f'Contabilizado correctamente. {len(entries)} asiento(s) creado(s).'
        ))
        for e in entries:
            self.stdout.write(f'  · {e.number}  {e.description[:60]}')
