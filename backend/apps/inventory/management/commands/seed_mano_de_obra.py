from django.core.management.base import BaseCommand
from apps.inventory.models import InventoryCategory, Product


ITEMS = [
    {
        'name': 'Albañil (jornada)',
        'description': 'Mano de obra de albañil por jornada de 8 horas.',
        'sku': 'MO-ALBANIL-JOR',
        'unit': 'unit',
        'unit_price_gtq': '350.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Maestro de obra (jornada)',
        'description': 'Supervisión y ejecución de maestro de obra por jornada.',
        'sku': 'MO-MAESTRO-JOR',
        'unit': 'unit',
        'unit_price_gtq': '500.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Ayudante de construcción (jornada)',
        'description': 'Ayudante general de construcción por jornada de 8 horas.',
        'sku': 'MO-AYUDANTE-JOR',
        'unit': 'unit',
        'unit_price_gtq': '200.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Electricista (jornada)',
        'description': 'Instalación y mantenimiento eléctrico por jornada.',
        'sku': 'MO-ELECTR-JOR',
        'unit': 'unit',
        'unit_price_gtq': '450.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Plomero (jornada)',
        'description': 'Instalación y reparación de tubería por jornada.',
        'sku': 'MO-PLOMERO-JOR',
        'unit': 'unit',
        'unit_price_gtq': '400.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Soldador (jornada)',
        'description': 'Soldadura estructural y metálica por jornada.',
        'sku': 'MO-SOLDADOR-JOR',
        'unit': 'unit',
        'unit_price_gtq': '550.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Carpintero (jornada)',
        'description': 'Trabajos de carpintería en obra por jornada.',
        'sku': 'MO-CARPINT-JOR',
        'unit': 'unit',
        'unit_price_gtq': '400.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Pintor (jornada)',
        'description': 'Aplicación de pintura y acabados por jornada.',
        'sku': 'MO-PINTOR-JOR',
        'unit': 'unit',
        'unit_price_gtq': '300.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Instalación de pisos (m²)',
        'description': 'Colocación de pisos cerámicos, porcelanato o similares, por m².',
        'sku': 'MO-PISOS-M2',
        'unit': 'm2',
        'unit_price_gtq': '85.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Instalación de drywall (m²)',
        'description': 'Construcción e instalación de tabiques de drywall, por m².',
        'sku': 'MO-DRYWALL-M2',
        'unit': 'm2',
        'unit_price_gtq': '95.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Operador de maquinaria (jornada)',
        'description': 'Operación de retroexcavadora, minicargador u otra maquinaria pesada, por jornada.',
        'sku': 'MO-MAQUINARIA-JOR',
        'unit': 'unit',
        'unit_price_gtq': '650.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
    {
        'name': 'Técnico en impermeabilización (jornada)',
        'description': 'Aplicación de sistemas impermeabilizantes en losas y cubiertas, por jornada.',
        'sku': 'MO-IMPERM-JOR',
        'unit': 'unit',
        'unit_price_gtq': '420.00',
        'min_stock_alert': '0',
        'supplier_name': '',
    },
]


class Command(BaseCommand):
    help = 'Crea la categoría "Mano de Obra" y la puebla con ítems de ejemplo.'

    def handle(self, *args, **options):
        category, created = InventoryCategory.objects.get_or_create(
            name='Mano de Obra',
            defaults={
                'description': 'Servicios de mano de obra para proyectos de construcción.',
                'color': '#6B8CFF',
                'tracks_stock': False,
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Categoría "Mano de Obra" creada (tracks_stock=False).'))
        else:
            # Ensure the flag is correct even if category pre-existed
            if category.tracks_stock:
                category.tracks_stock = False
                category.save(update_fields=['tracks_stock'])
                self.stdout.write(self.style.WARNING('  Categoría ya existía — tracks_stock actualizado a False.'))
            else:
                self.stdout.write('  Categoría "Mano de Obra" ya existía — se reutiliza.')

        created_count = 0
        skipped_count = 0
        for item in ITEMS:
            _, was_created = Product.objects.get_or_create(
                sku=item['sku'],
                defaults={**item, 'category': category},
            )
            if was_created:
                created_count += 1
            else:
                skipped_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'✓ {created_count} producto(s) creado(s), {skipped_count} omitido(s) (ya existían).'
            )
        )
