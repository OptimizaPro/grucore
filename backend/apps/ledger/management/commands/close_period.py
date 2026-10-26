"""
manage.py close_period --year YYYY --month M [--dry-run] [--lock]

Flujo de cierre mensual:
1. Preflight — valida estado del período y advierte sobre borrdaores
2. Genera entradas de depreciación para todos los activos activos
3. Cierra el período (estado → closed)
4. Opcional: bloquea el período (estado → locked) con --lock
5. Registra todo en PeriodCloseLog
"""
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction


class Command(BaseCommand):
    help = 'Cierre mensual de período contable: genera depreciaciones y cierra el período.'

    def add_arguments(self, parser):
        parser.add_argument('--year',    type=int, required=True,  help='Año del período (ej. 2026)')
        parser.add_argument('--month',   type=int, required=True,  help='Mes del período (1–12)')
        parser.add_argument('--dry-run', action='store_true',      help='Simula sin guardar cambios')
        parser.add_argument('--lock',    action='store_true',      help='Bloquea el período tras cerrar')
        parser.add_argument('--user',    type=str, default=None,   help='Username del usuario que cierra (default: primer superusuario)')

    def handle(self, *args, **options):
        from django.contrib.auth import get_user_model
        from apps.ledger.models import AccountingPeriod, PeriodCloseLog, PeriodState
        from apps.ledger.models import JournalEntry, EntryState

        year     = options['year']
        month    = options['month']
        dry_run  = options['dry_run']
        do_lock  = options['lock']
        username = options['user']

        if not (1 <= month <= 12):
            raise CommandError('El mes debe estar entre 1 y 12.')

        # ── Resolver usuario ──────────────────────────────────────────────────
        User = get_user_model()
        if username:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                raise CommandError(f'Usuario "{username}" no encontrado.')
        else:
            user = User.objects.filter(is_superuser=True).first()
            if not user:
                raise CommandError('No hay superusuarios. Use --user <username>.')

        # ── Obtener período ───────────────────────────────────────────────────
        try:
            period = AccountingPeriod.objects.get(year=year, month=month)
        except AccountingPeriod.DoesNotExist:
            raise CommandError(f'No existe el período {year}-{str(month).zfill(2)}. Créalo en el admin primero.')

        if period.state == PeriodState.LOCKED:
            raise CommandError(f'El período {period} ya está BLOQUEADO. No se puede volver a cerrar.')

        if period.state == PeriodState.CLOSED and not do_lock:
            raise CommandError(f'El período {period} ya está CERRADO. Usa --lock si deseas bloquearlo.')

        self.stdout.write(f'\n{"[DRY-RUN] " if dry_run else ""}Cerrando período {period.label} ({period})...\n')

        # ── Preflight checks ──────────────────────────────────────────────────
        draft_entries = JournalEntry.objects.filter(
            period=period, state=EntryState.DRAFT
        ).count()
        if draft_entries:
            self.stdout.write(
                self.style.WARNING(f'  ⚠  {draft_entries} asiento(s) en BORRADOR en este período.')
            )
        else:
            self.stdout.write(self.style.SUCCESS('  ✓  Sin asientos en borrador.'))

        # Facturas proveedor no registradas en el período
        from apps.purchasing.models import SupplierInvoice, SupplierInvoiceStatus
        draft_spi = SupplierInvoice.objects.filter(
            accounting_period=period,
            status=SupplierInvoiceStatus.DRAFT,
        ).count()
        if draft_spi:
            self.stdout.write(
                self.style.WARNING(f'  ⚠  {draft_spi} factura(s) de proveedor en BORRADOR en este período.')
            )
        else:
            self.stdout.write(self.style.SUCCESS('  ✓  Sin facturas de proveedor en borrador.'))

        # ── Generar entradas de depreciación ──────────────────────────────────
        from apps.assets.models import FixedAsset, AssetStatus
        import datetime

        # Activos activos con fecha de inicio de depreciación ≤ fin del período
        period_end = datetime.date(year, month, _last_day(year, month))
        active_assets = FixedAsset.objects.filter(
            status=AssetStatus.ACTIVE,
            depreciation_method='straight_line',
        ).exclude(
            depreciation_entries__accounting_period=period  # ya tiene entrada
        )
        # También activos con método distinto — se avisa pero no se genera automáticamente
        non_sl_assets = FixedAsset.objects.filter(
            status=AssetStatus.ACTIVE,
        ).exclude(depreciation_method='straight_line').count()
        if non_sl_assets:
            self.stdout.write(
                self.style.WARNING(
                    f'  ⚠  {non_sl_assets} activo(s) con método distinto a línea recta — '
                    f'depreciación no generada automáticamente (requiere importe manual).'
                )
            )

        depr_generated = 0
        depr_skipped   = 0
        for asset in active_assets:
            dep_start = asset.depreciation_start_date
            if dep_start is None or dep_start > period_end:
                depr_skipped += 1
                continue
            if asset.net_book_value_gtq <= asset.residual_value_gtq:
                depr_skipped += 1
                continue
            if not dry_run:
                entry = asset.generate_depreciation_entry(period, user)
                if entry:
                    depr_generated += 1
                else:
                    depr_skipped += 1
            else:
                monthly = asset.monthly_depreciation_gtq
                if monthly and monthly > Decimal('0'):
                    depr_generated += 1
                    self.stdout.write(
                        f'    [DRY] Depreciación {asset.asset_number}: Q {monthly:,.2f}'
                    )
                else:
                    depr_skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'  ✓  Depreciaciones: {depr_generated} generada(s), {depr_skipped} omitida(s).'
            )
        )

        if dry_run:
            self.stdout.write(self.style.WARNING('\n[DRY-RUN] Sin cambios guardados.\n'))
            return

        # ── Cerrar período ────────────────────────────────────────────────────
        with transaction.atomic():
            if period.state == PeriodState.OPEN:
                period.close(user)
                self.stdout.write(self.style.SUCCESS(f'  ✓  Período {period} CERRADO.'))

            if do_lock:
                period.lock(user)
                self.stdout.write(self.style.SUCCESS(f'  ✓  Período {period} BLOQUEADO.'))

            PeriodCloseLog.objects.create(
                period                         = period,
                action                         = 'lock' if do_lock else 'close',
                performed_by                   = user,
                depreciation_entries_generated = depr_generated,
                journal_entries_draft_warnings = draft_entries,
                notes                          = f'Cierre{"+ bloqueo" if do_lock else ""} ejecutado por manage.py close_period.',
            )

        self.stdout.write(self.style.SUCCESS(f'\n✓ Cierre de {period.label} completado.\n'))


def _last_day(year, month):
    import calendar
    return calendar.monthrange(year, month)[1]
