"""
create_cms_manager
──────────────────
Crea el grupo "CMS Manager" con permisos exclusivos sobre:
  - Recursos multimedia (MediaAsset)
  - Páginas, Secciones, Bloques, ServicePage, MarqueeItem (CMS)
  - Proyectos de portafolio (PortfolioProject, PortfolioImage)

Opcionalmente crea un usuario y lo asigna al grupo.

Uso:
    # Solo crear / actualizar el grupo
    python manage.py create_cms_manager

    # Crear grupo + usuario
    python manage.py create_cms_manager --email cms@grucore.com --password S3guro!

    # Forzar actualización de permisos del grupo existente
    python manage.py create_cms_manager --force
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand

User = get_user_model()

GROUP_NAME = 'CMS Manager'

# (app_label, model, [codenames])  — None = todos (add, change, delete, view)
PERMISSIONS = [
    ('media_assets', 'mediaasset',       None),
    ('cms',          'page',             None),
    ('cms',          'section',          None),
    ('cms',          'block',            None),
    ('cms',          'servicepage',      None),
    ('cms',          'marqueeitem',      None),
    ('portfolio',    'portfolioproject', None),
    ('portfolio',    'portfolioimage',   None),
]


def _get_perms(app_label: str, model: str, actions) -> list[Permission]:
    try:
        ct = ContentType.objects.get(app_label=app_label, model=model)
    except ContentType.DoesNotExist:
        return []
    if actions is None:
        actions = ['add', 'change', 'delete', 'view']
    return list(Permission.objects.filter(
        content_type=ct,
        codename__in=[f'{a}_{model}' for a in actions],
    ))


class Command(BaseCommand):
    help = 'Crea el grupo CMS Manager y opcionalmente un usuario para gestionar el CMS.'

    def add_arguments(self, parser):
        parser.add_argument('--email',    type=str, help='Email del usuario CMS a crear.')
        parser.add_argument('--password', type=str, help='Contraseña del usuario CMS.')
        parser.add_argument('--force',    action='store_true',
                            help='Actualiza permisos aunque el grupo ya exista.')

    def handle(self, *args, **options):
        email    = options.get('email')
        password = options.get('password')
        force    = options['force']

        # ── 1. Crear / obtener grupo ──────────────────────────────────────────
        group, created = Group.objects.get_or_create(name=GROUP_NAME)
        if created:
            self.stdout.write(self.style.SUCCESS(f'  CREATE  Grupo "{GROUP_NAME}"'))
        elif force:
            self.stdout.write(f'  UPDATE  Grupo "{GROUP_NAME}" (--force)')
        else:
            self.stdout.write(f'  EXISTS  Grupo "{GROUP_NAME}" (usa --force para actualizar permisos)')

        # ── 2. Asignar permisos ───────────────────────────────────────────────
        if created or force:
            all_perms = []
            for app_label, model, actions in PERMISSIONS:
                perms = _get_perms(app_label, model, actions)
                all_perms.extend(perms)
                if perms:
                    self.stdout.write(f'    + {app_label}.{model} ({len(perms)} permisos)')
                else:
                    self.stdout.write(
                        self.style.WARNING(f'    ⚠ {app_label}.{model} — ContentType no encontrado')
                    )

            group.permissions.set(all_perms)
            self.stdout.write(self.style.SUCCESS(
                f'  Total: {len(all_perms)} permisos asignados al grupo'
            ))

        # ── 3. Crear usuario (opcional) ───────────────────────────────────────
        if email and password:
            if User.objects.filter(email=email).exists():
                user = User.objects.get(email=email)
                user.groups.add(group)
                self.stdout.write(
                    self.style.WARNING(f'  EXISTS  Usuario {email} ya existe — añadido al grupo')
                )
            else:
                username = email.split('@')[0]
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    is_staff=True,      # necesario para acceder al admin
                    is_superuser=False,
                )
                user.groups.add(group)
                self.stdout.write(self.style.SUCCESS(
                    f'  CREATE  Usuario {email} creado como staff y asignado a "{GROUP_NAME}"'
                ))
        elif email or password:
            self.stdout.write(self.style.WARNING(
                '  ⚠ Debes pasar --email Y --password juntos para crear un usuario.'
            ))

        # ── Resumen ───────────────────────────────────────────────────────────
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Listo. Accesos del grupo CMS Manager:'))
        self.stdout.write('  · /admin/media_assets/mediaasset/  — Recursos multimedia')
        self.stdout.write('  · /admin/cms/page/                 — Páginas CMS')
        self.stdout.write('  · /admin/cms/section/              — Secciones')
        self.stdout.write('  · /admin/cms/block/                — Bloques')
        self.stdout.write('  · /admin/cms/servicepage/          — Imágenes por servicio')
        self.stdout.write('  · /admin/cms/marqueeitem/          — Ticker')
        self.stdout.write('  · /admin/portfolio/portfolioproject/ — Proyectos portafolio')
        self.stdout.write('  · /admin/portfolio/portfolioimage/   — Galería portafolio')
        self.stdout.write('')
        self.stdout.write('  Sin acceso a: Proyectos ERP, CRM, Finanzas, Compras, Workers, Usuarios')
