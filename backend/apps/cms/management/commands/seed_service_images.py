"""
seed_service_images
───────────────────
Popula MediaAsset + ServicePage para los 6 servicios usando las imágenes
almacenadas en backend/fixtures/service_images/.

Uso:
    python manage.py seed_service_images
    python manage.py seed_service_images --source /ruta/alternativa
    python manage.py seed_service_images --force   # re-sube aunque ya exista
"""

import shutil
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError

from apps.cms.models import ServicePage
from apps.media_assets.models import MediaAsset

User = get_user_model()

# ── Mapeo servicio → archivos ────────────────────────────────────────────────
SERVICE_MAP = {
    'residential_construction': {
        'label':  'Construcción Residencial',
        'cover':  'residencial-despues.png',
        'before': 'residencial-antes.webp',
        'after':  'residencial-despues.png',
    },
    'remodeling': {
        'label':  'Remodelación Interior',
        'cover':  'remodelacion-despues.png',
        'before': 'remodelacion-antes.webp',
        'after':  'remodelacion-despues.png',
    },
    'commercial': {
        'label':  'Proyectos Comerciales',
        'cover':  'comercial-despues.png',
        'before': 'comercial-antes.webp',
        'after':  'comercial-despues.png',
    },
    'design_build': {
        'label':  'Diseño y Construcción',
        'cover':  'design-build-despues.jpg',
        'before': 'design-build-antes.png',
        'after':  'design-build-despues.jpg',
    },
    'industrial': {
        'label':  'Construcción Industrial',
        'cover':  'industrial-despues.png',
        'before': 'industrial-antes.webp',
        'after':  'industrial-despues.png',
    },
    'kitchens_baths': {
        'label':  'Cocinas y Baños',
        'cover':  'cocina-despues.jpg',
        'before': 'cocina-antes.png',
        'after':  'cocina-despues.jpg',
    },
}


class Command(BaseCommand):
    help = 'Seed MediaAsset + ServicePage con las imágenes de los servicios.'

    def add_arguments(self, parser):
        default_source = Path(settings.BASE_DIR) / 'fixtures' / 'service_images'
        parser.add_argument(
            '--source',
            type=str,
            default=str(default_source),
            help='Directorio con las imágenes fuente (default: fixtures/service_images/).',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-sube imágenes aunque el ServicePage ya exista.',
        )

    def handle(self, *args, **options):
        source = Path(options['source'])
        force  = options['force']

        if not source.exists():
            raise CommandError(f'Directorio fuente no encontrado: {source}')

        # Usar el primer superuser como uploader, o None si no hay
        uploader = User.objects.filter(is_superuser=True).first()

        created_assets   = 0
        created_services = 0
        skipped          = 0

        for slug, data in SERVICE_MAP.items():
            # Si ya existe y no forzamos, skip
            existing = ServicePage.objects.filter(slug=slug).first()
            if existing and not force:
                self.stdout.write(f'  SKIP  {data["label"]} (ya existe, usa --force para reemplazar)')
                skipped += 1
                continue

            assets = {}
            for role in ('cover', 'before', 'after'):
                filename = data[role]
                filepath = source / filename

                if not filepath.exists():
                    self.stdout.write(
                        self.style.WARNING(f'  WARN  {filename} no encontrado, se omite.')
                    )
                    assets[role] = None
                    continue

                # Nombre descriptivo: "Cocinas y Baños — Después"
                role_label = {'cover': 'Portada', 'before': 'Antes', 'after': 'Después'}[role]
                asset_name = f'{data["label"]} — {role_label}'
                context    = f'Servicios / {data["label"]} — {role_label}'

                # Reusar si ya existe un asset con ese nombre (evita duplicados en --force)
                asset = MediaAsset.objects.filter(name=asset_name).first()
                if asset and force:
                    asset.file.delete(save=False)
                    with open(filepath, 'rb') as fh:
                        asset.file.save(filepath.name, File(fh), save=False)
                    asset.context = context
                    asset.save()
                elif not asset:
                    asset = MediaAsset(
                        name=asset_name,
                        alt_es=f'{data["label"]} — {role_label}',
                        alt_en=f'{data["label"]} — {role_label}',
                        context=context,
                        uploaded_by=uploader,
                    )
                    with open(filepath, 'rb') as fh:
                        asset.file.save(filepath.name, File(fh), save=False)
                    asset.save()
                    created_assets += 1

                assets[role] = asset

            # Crear o actualizar ServicePage
            service_page, created = ServicePage.objects.update_or_create(
                slug=slug,
                defaults={
                    'cover_image':  assets.get('cover'),
                    'before_image': assets.get('before'),
                    'after_image':  assets.get('after'),
                },
            )
            if created:
                created_services += 1

            status = 'CREATE' if created else 'UPDATE'
            self.stdout.write(
                self.style.SUCCESS(f'  {status}  {data["label"]}')
            )

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Listo. Assets creados: {created_assets} | '
            f'Servicios procesados: {created_services + (len(SERVICE_MAP) - skipped - created_services)} | '
            f'Omitidos: {skipped}'
        ))
