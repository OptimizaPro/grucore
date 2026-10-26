"""
manage.py sat_inventory_report [--date YYYY-MM-DD] [--output path/to/file.csv]

Genera el Libro de Inventarios para declaración ante SAT Guatemala.

IMPORTANTE: El formato exacto, los campos requeridos y la periodicidad de
presentación deben validarse con el contador/asesor fiscal de la empresa
según el régimen fiscal vigente y las resoluciones SAT actuales.
Este comando genera un archivo con los datos base — el formato legal
puede requerir ajustes.

Referencia base: Decreto 10-2012 (Ley de Actualización Tributaria),
Art. 21 — obligación de llevar inventario valorado.
Validar resoluciones SAT vigentes antes de presentar.
"""
import csv
import datetime
import os
from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Genera reporte de inventario para SAT Guatemala (Libro de Inventarios).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            default=None,
            help='Fecha de corte del inventario (YYYY-MM-DD). Default: hoy.',
        )
        parser.add_argument(
            '--output',
            type=str,
            default=None,
            help='Ruta del archivo CSV de salida. Default: sat_inventory_YYYY-MM-DD.csv en directorio actual.',
        )
        parser.add_argument(
            '--include-zero',
            action='store_true',
            help='Incluir productos con stock cero.',
        )

    def handle(self, *args, **options):
        from apps.inventory.models import Product, InventoryCategory

        # ── Fecha de corte ────────────────────────────────────────────────────
        date_str = options['date']
        if date_str:
            try:
                report_date = datetime.date.fromisoformat(date_str)
            except ValueError:
                raise CommandError(f'Fecha inválida: "{date_str}". Use formato YYYY-MM-DD.')
        else:
            report_date = datetime.date.today()

        include_zero = options['include_zero']

        # ── Archivo de salida ─────────────────────────────────────────────────
        output_path = options['output'] or f'sat_inventory_{report_date}.csv'
        output_path = os.path.abspath(output_path)

        # ── Consulta de productos ─────────────────────────────────────────────
        qs = Product.objects.filter(is_active=True).select_related('category').order_by(
            'category__name', 'name'
        )
        if not include_zero:
            qs = qs.filter(stock_quantity__gt=Decimal('0'))

        # Filtrar solo productos con gestión de stock
        products = [p for p in qs if self._tracks_stock(p)]

        if not products:
            self.stdout.write(self.style.WARNING('No hay productos en inventario con stock activo.'))
            return

        # ── Totales ───────────────────────────────────────────────────────────
        total_value = sum(
            (p.stock_quantity * p.unit_price_gtq) for p in products
        )

        # ── Generar CSV ───────────────────────────────────────────────────────
        with open(output_path, 'w', newline='', encoding='utf-8-sig') as f:
            writer = csv.writer(f)

            # Encabezado del reporte
            writer.writerow([])
            writer.writerow(['LIBRO DE INVENTARIOS — GRUCORE'])
            writer.writerow([f'Fecha de corte: {report_date}'])
            writer.writerow([
                'IMPORTANTE: Formato pendiente validación contador/asesor SAT. '
                'Verificar resoluciones vigentes antes de presentar.'
            ])
            writer.writerow([])

            # Columnas
            writer.writerow([
                'N°',
                'SKU',
                'Descripción',
                'Categoría',
                'Unidad',
                'Cantidad',
                'Costo Unitario (GTQ)',
                'Valor Total (GTQ)',
                'Precio Venta Unitario (GTQ)',
            ])

            current_category = None
            row_num = 1

            for product in products:
                cat_name = product.category.name if product.category else 'Sin categoría'

                # Subtotal por categoría
                if cat_name != current_category:
                    if current_category is not None:
                        writer.writerow([])
                    current_category = cat_name
                    writer.writerow([f'--- {cat_name.upper()} ---'])

                value = product.stock_quantity * product.unit_price_gtq
                writer.writerow([
                    row_num,
                    product.sku or '',
                    product.name,
                    cat_name,
                    product.get_unit_display(),
                    f'{product.stock_quantity:.3f}',
                    f'{product.unit_price_gtq:.2f}',
                    f'{value:.2f}',
                    f'{product.unit_price_gtq:.2f}',
                ])
                row_num += 1

            # Totales finales
            writer.writerow([])
            writer.writerow(['', '', '', '', '', f'TOTAL PRODUCTOS: {len(products)}', '', f'{total_value:.2f}'])
            writer.writerow([])
            writer.writerow(['Generado por Grucore ERP', f'Fecha de generación: {datetime.datetime.now():%Y-%m-%d %H:%M}'])
            writer.writerow(['PENDIENTE VALIDACIÓN CONTADOR — No presentar sin revisión fiscal'])

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Reporte generado: {output_path}\n'
                f'  Productos incluidos: {len(products)}\n'
                f'  Valor total inventario: Q {total_value:,.2f}\n'
                f'\n  ⚠  PENDIENTE VALIDACIÓN CONTADOR antes de presentar a SAT.\n'
            )
        )

    @staticmethod
    def _tracks_stock(product):
        try:
            if product.category_id and not product.category.tracks_stock:
                return False
        except Exception:
            pass
        return True
