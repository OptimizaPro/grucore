"""
Uso: python manage.py fix_project_client --project 1 --user "Mildred Ciani"

Crea un registro Client vinculado al usuario portal y lo asigna al proyecto.
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from apps.projects.models import Project, Client

User = get_user_model()


class Command(BaseCommand):
    help = 'Crea/vincula un Client desde un usuario portal y lo asigna a un proyecto'

    def add_arguments(self, parser):
        parser.add_argument('--project', type=int, required=True, help='ID del proyecto')
        parser.add_argument('--user',    type=str, required=True, help='Nombre completo del usuario portal')

    def handle(self, *args, **options):
        project_id = options['project']
        user_name  = options['user'].strip()

        # ── Buscar proyecto ────────────────────────────────────────────────────
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            raise CommandError(f'No existe el proyecto con id={project_id}')

        # ── Buscar usuario por nombre ──────────────────────────────────────────
        parts   = user_name.split()
        users   = User.objects.filter(
            first_name__icontains=parts[0],
            last_name__icontains=parts[-1] if len(parts) > 1 else parts[0],
        )
        if not users.exists():
            all_users = list(User.objects.values_list('first_name', 'last_name', 'email'))
            raise CommandError(
                f'No se encontró usuario "{user_name}".\n'
                f'Usuarios disponibles: {all_users}'
            )
        if users.count() > 1:
            raise CommandError(f'Múltiples coincidencias: {list(users.values("id","first_name","last_name"))}')

        portal_user = users.first()

        # ── Obtener o crear el registro Client ────────────────────────────────
        client, created = Client.objects.get_or_create(
            portal_user=portal_user,
            defaults={
                'name':  portal_user.get_full_name() or user_name,
                'email': portal_user.email or '',
                'phone': getattr(portal_user, 'phone', '') or '',
            },
        )

        if created:
            self.stdout.write(f'  → Registro Client creado para {client.name}')
        else:
            self.stdout.write(f'  → Client existente encontrado: {client.name}')

        # ── Asignar al proyecto ────────────────────────────────────────────────
        old_name = project.client.name if project.client else '(ninguno)'
        project.client = client
        project.save(update_fields=['client'])

        self.stdout.write(self.style.SUCCESS(
            f'✓ Proyecto "{project.name}" actualizado:\n  {old_name} → {client.name}'
        ))
