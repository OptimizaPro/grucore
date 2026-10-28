from django.db import models
from django.conf import settings


class MediaAsset(models.Model):
    """
    Recurso multimedia (imagen) cuyo almacenamiento se enruta automáticamente:
      - DEV  (USE_S3=False) → filesystem local /media/assets/...
      - PROD (USE_S3=True)  → Supabase Storage bucket vía django-storages S3Boto3

    La propiedad `.url` devuelve siempre la URL pública correcta
    independientemente del backend activo.
    """

    file = models.ImageField(
        upload_to='assets/%Y/%m/',
        verbose_name='Archivo',
        help_text='JPG, PNG o WebP. En producción se almacena en Supabase Storage.',
    )
    name = models.CharField(
        max_length=200, blank=True,
        verbose_name='Nombre descriptivo',
        help_text='Nombre de referencia interno. Se auto-completa con el nombre del archivo.',
    )
    alt_es = models.CharField(max_length=200, blank=True, verbose_name='Texto alt (ES)')
    alt_en = models.CharField(max_length=200, blank=True, verbose_name='Texto alt (EN)')
    context = models.CharField(
        max_length=200, blank=True,
        verbose_name='Contexto de uso',
        help_text='Ej: "Servicios / Cocinas — Portada", "Home / Before-After". Referencia libre para saber dónde se usa.',
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        verbose_name='Subido por',
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Subido el')

    class Meta:
        verbose_name        = 'Recurso multimedia'
        verbose_name_plural = 'Recursos multimedia'
        ordering            = ['-uploaded_at']

    def __str__(self):
        return self.name or (self.file.name.split('/')[-1] if self.file else '—')

    @property
    def url(self) -> str:
        """URL pública del archivo (CDN Supabase en prod, /media/ en dev)."""
        return self.file.url if self.file else ''

    def save(self, *args, **kwargs):
        if not self.name and self.file:
            # Auto-poblar nombre con el basename del archivo
            self.name = self.file.name.split('/')[-1]
        super().save(*args, **kwargs)
