"""
test_email
──────────
Envía un correo de prueba para verificar la configuración de Brevo SMTP.

Uso:
    python manage.py test_email --to nelson@grucore.com
    python manage.py test_email --to tu@email.com --subject "Test ERP"
"""

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Envía un correo de prueba para verificar la configuración SMTP (Brevo).'

    def add_arguments(self, parser):
        parser.add_argument('--to',      type=str, required=True, help='Destinatario del correo de prueba.')
        parser.add_argument('--subject', type=str, default='[Grucore] Correo de prueba SMTP', help='Asunto del correo.')

    def handle(self, *args, **options):
        to      = options['to']
        subject = options['subject']

        self.stdout.write(f'  FROM    {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(f'  TO      {to}')
        self.stdout.write(f'  HOST    {settings.EMAIL_HOST}:{settings.EMAIL_PORT}')
        self.stdout.write(f'  USER    {settings.EMAIL_HOST_USER or "(vacío)"}')
        self.stdout.write('')

        try:
            send_mail(
                subject=subject,
                message=(
                    'Este es un correo de prueba enviado desde Grucore ERP.\n\n'
                    'Si lo recibiste, la configuración de Brevo SMTP es correcta.\n\n'
                    f'Host: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}\n'
                    f'From: {settings.DEFAULT_FROM_EMAIL}'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f'  OK  Correo enviado a {to}'))
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f'  ERROR  {exc}'))
            self.stdout.write('')
            self.stdout.write('  Verifica estas variables de entorno:')
            self.stdout.write('    EMAIL_HOST_USER     → email registrado en Brevo')
            self.stdout.write('    EMAIL_HOST_PASSWORD → SMTP API Key de Brevo')
            self.stdout.write('    DEFAULT_FROM_EMAIL  → debe coincidir con el sender verificado en Brevo')
