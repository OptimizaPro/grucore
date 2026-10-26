from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.projects.models import Client

User = get_user_model()


class Command(BaseCommand):
    help = 'Sincroniza el nombre del registro Client con el nombre del usuario portal vinculado'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, required=True, help='Email del usuario portal')
        parser.add_argument('--name',  type=str, required=True, help='Nombre correcto para el cliente')

    def handle(self, *args, **options):
        email    = options['email']
        new_name = options['name']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            self.stderr.write(f'No existe usuario con email {email}')
            return

        try:
            client = user.client_profile
        except Client.DoesNotExist:
            self.stderr.write(f'El usuario {email} no tiene un Client vinculado')
            return

        old_name     = client.name
        client.name  = new_name
        client.email = user.email
        client.save(update_fields=['name', 'email'])

        self.stdout.write(self.style.SUCCESS(
            f'OK: "{old_name}" → "{client.name}"'
        ))
