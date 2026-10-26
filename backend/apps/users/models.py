from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN           = 'admin',              'Administrador'
    PROJECT_MANAGER = 'project_manager',    'Director de proyectos'
    SITE_SUPERVISOR = 'site_supervisor',    'Supervisor de obra'
    TEAM_MEMBER     = 'team_member',        'Miembro del equipo'
    CONTRACTOR      = 'contractor',         'Contratista externo'
    CLIENT_PORTAL   = 'client_portal',      'Portal cliente'
    VIEWER          = 'viewer',             'Observador'


class Currency(models.TextChoices):
    GTQ = 'GTQ', 'Quetzal (Q)'
    USD = 'USD', 'Dólar ($)'


class Language(models.TextChoices):
    ES = 'es', 'Español'
    EN = 'en', 'English'


class User(AbstractUser):
    """
    Usuario personalizado. Extiende AbstractUser para agregar rol,
    preferencias de idioma y moneda, y foto de perfil.
    """
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.TEAM_MEMBER,
        verbose_name='Rol',
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name='Teléfono',
    )
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True, blank=True,
        verbose_name='Foto de perfil',
    )
    avatar_url = models.URLField(
        blank=True,
        verbose_name='Foto de perfil (URL externa)',
    )
    preferred_language = models.CharField(
        max_length=5,
        choices=Language.choices,
        default=Language.ES,
        verbose_name='Idioma preferido',
    )
    preferred_currency = models.CharField(
        max_length=3,
        choices=Currency.choices,
        default=Currency.GTQ,
        verbose_name='Moneda preferida',
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return self.get_full_name() or self.email

    @property
    def full_name(self):
        return self.get_full_name() or self.username

    @property
    def is_internal(self):
        """True si el usuario tiene acceso al panel ERP interno."""
        return self.role in [
            Role.ADMIN,
            Role.PROJECT_MANAGER,
            Role.SITE_SUPERVISOR,
            Role.TEAM_MEMBER,
            Role.CONTRACTOR,
            Role.VIEWER,
        ]

    @property
    def is_client(self):
        """True si el usuario solo tiene acceso al portal de cliente."""
        return self.role == Role.CLIENT_PORTAL
