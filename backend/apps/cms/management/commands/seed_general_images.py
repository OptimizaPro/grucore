"""
seed_general_images
───────────────────
Registra en MediaAsset las imágenes generales de la app:
  - Sección before/after del home
  - Imágenes de proyectos del portfolio (projects-data.ts)

Uso:
    python manage.py seed_general_images
    python manage.py seed_general_images --force
"""

from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError

from apps.media_assets.models import MediaAsset

User = get_user_model()

IMAGE_MAP = [
    # ── Home: sección before/after ───────────────────────────────────────────
    {'name': 'Home — Edificio Antes',   'file': 'antes-edificio.jpg',   'alt_es': 'Edificio antes de remodelación',  'context': 'Home / Before-After — Antes'},
    {'name': 'Home — Edificio Después', 'file': 'despues-edificio.png', 'alt_es': 'Edificio después de remodelación','context': 'Home / Before-After — Después'},

    # ── Portfolio: Residencia Los Palmerales ─────────────────────────────────
    {'name': 'Palmerales — Portada/Después', 'file': 'palmerales-despues.png', 'alt_es': 'Residencia Los Palmerales terminada', 'context': 'Portfolio / Palmerales — Portada y Después'},
    {'name': 'Palmerales — Antes',           'file': 'palmerales-antes.jpg',   'alt_es': 'Residencia Los Palmerales antes',    'context': 'Portfolio / Palmerales — Antes'},

    # ── Portfolio: Oficinas Torre Norte ──────────────────────────────────────
    {'name': 'Oficinas Torre Norte — Antes',   'file': 'oficinas-antes.jpg',    'alt_es': 'Oficinas Torre Norte antes de remodelación', 'context': 'Portfolio / Oficinas Torre Norte — Antes'},
    {'name': 'Oficinas Torre Norte — Después', 'file': 'oficinas-despues.avif', 'alt_es': 'Oficinas Torre Norte después de remodelación','context': 'Portfolio / Oficinas Torre Norte — Después'},

    # ── Portfolio: Restaurante Costa del Este ────────────────────────────────
    {'name': 'Restaurante Costa del Este — Antes',   'file': 'restaurante-antes.jpg',    'alt_es': 'Restaurante Costa del Este antes',  'context': 'Portfolio / Restaurante Costa del Este — Antes'},
    {'name': 'Restaurante Costa del Este — Después', 'file': 'restaurante-despues.avif', 'alt_es': 'Restaurante Costa del Este después', 'context': 'Portfolio / Restaurante Costa del Este — Después'},

    # ── Portfolio: Bodega Industrial Zona Franca ─────────────────────────────
    {'name': 'Bodega Industrial — Portada', 'file': 'bodega-industrial.jpg', 'alt_es': 'Bodega industrial zona franca',   'context': 'Portfolio / Bodega Industrial — Portada'},
    {'name': 'Bodega Industrial — Antes',   'file': 'bodega-antes.jpg',      'alt_es': 'Bodega antes de construcción',   'context': 'Portfolio / Bodega Industrial — Antes'},
    {'name': 'Bodega Industrial — Después', 'file': 'bodega-despues.jpg',    'alt_es': 'Bodega después de construcción', 'context': 'Portfolio / Bodega Industrial — Después'},

    # ── Portfolio: Remodelación Casa Zona 15 ─────────────────────────────────
    {'name': 'Remodelación Zona 15 — Antes', 'file': 'remodelacion-cocina-antes.png', 'alt_es': 'Cocina antes de remodelación', 'context': 'Portfolio / Remodelación Zona 15 — Antes'},

    # ── Portfolio: Clínica Médica La Pradera ─────────────────────────────────
    {'name': 'Clínica La Pradera — Portada/Después', 'file': 'clinica-medica.jpg', 'alt_es': 'Clínica médica La Pradera',    'context': 'Portfolio / Clínica La Pradera — Portada y Después'},
    {'name': 'Clínica La Pradera — Antes',           'file': 'clinica-antes.jpg',  'alt_es': 'Clínica antes de construcción','context': 'Portfolio / Clínica La Pradera — Antes'},
]


class Command(BaseCommand):
    help = 'Seed MediaAsset con imágenes generales (home, portfolio).'

    def add_arguments(self, parser):
        default_source = Path(settings.BASE_DIR) / 'fixtures' / 'service_images'
        parser.add_argument(
            '--source', type=str, default=str(default_source),
            help='Directorio con las imágenes fuente.',
        )
        parser.add_argument(
            '--force', action='store_true',
            help='Re-sube aunque el asset ya exista.',
        )

    def handle(self, *args, **options):
        source  = Path(options['source'])
        force   = options['force']

        if not source.exists():
            raise CommandError(f'Directorio fuente no encontrado: {source}')

        uploader = User.objects.filter(is_superuser=True).first()
        created = skipped = 0

        for entry in IMAGE_MAP:
            filepath = source / entry['file']

            if not filepath.exists():
                self.stdout.write(self.style.WARNING(f'  WARN  {entry["file"]} no encontrado, se omite.'))
                continue

            existing = MediaAsset.objects.filter(name=entry['name']).first()

            if existing and not force:
                self.stdout.write(f'  SKIP  {entry["name"]}')
                skipped += 1
                continue

            if existing and force:
                existing.file.delete(save=False)
                with open(filepath, 'rb') as fh:
                    existing.file.save(filepath.name, File(fh), save=False)
                existing.alt_es  = entry['alt_es']
                existing.context = entry.get('context', '')
                existing.save()
                self.stdout.write(self.style.SUCCESS(f'  UPDATE  {entry["name"]}'))
            else:
                asset = MediaAsset(
                    name=entry['name'],
                    alt_es=entry['alt_es'],
                    alt_en=entry['alt_es'],
                    context=entry.get('context', ''),
                    uploaded_by=uploader,
                )
                with open(filepath, 'rb') as fh:
                    asset.file.save(filepath.name, File(fh), save=False)
                asset.save()
                created += 1
                self.stdout.write(self.style.SUCCESS(f'  CREATE  {entry["name"]}'))

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Listo. Creados: {created} | Omitidos: {skipped}'
        ))
