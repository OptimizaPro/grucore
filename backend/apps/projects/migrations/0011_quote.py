from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0010_project_note'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Quote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('revision', models.PositiveSmallIntegerField(default=1, verbose_name='Revisión')),
                ('status', models.CharField(
                    choices=[
                        ('draft',             'Borrador'),
                        ('sent',              'Enviada'),
                        ('changes_requested', 'Cambios solicitados'),
                        ('approved',          'Aprobada'),
                        ('rejected',          'Rechazada'),
                    ],
                    default='draft',
                    max_length=30,
                    verbose_name='Estado',
                )),
                ('valid_until', models.DateField(blank=True, null=True, verbose_name='Válida hasta')),
                ('notes', models.TextField(blank=True, verbose_name='Notas / Condiciones')),
                ('discount_pct', models.DecimalField(decimal_places=2, default=0, max_digits=5, verbose_name='Descuento (%)')),
                ('tax_pct', models.DecimalField(decimal_places=2, default=12, max_digits=5, verbose_name='IVA (%)')),
                ('client_comment', models.TextField(blank=True, verbose_name='Comentario del cliente')),
                ('sent_at', models.DateTimeField(blank=True, null=True)),
                ('decided_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='quotes',
                    to='projects.project',
                    verbose_name='Proyecto',
                )),
                ('created_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='quotes_created',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Creada por',
                )),
            ],
            options={
                'verbose_name': 'Cotización',
                'verbose_name_plural': 'Cotizaciones',
                'ordering': ['-revision', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='QuoteLineItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(
                    choices=[
                        ('materials', 'Materiales'),
                        ('labor',     'Mano de obra'),
                        ('equipment', 'Equipos'),
                        ('other',     'Otros'),
                    ],
                    default='other',
                    max_length=20,
                    verbose_name='Categoría',
                )),
                ('description', models.CharField(max_length=500, verbose_name='Descripción')),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Cantidad')),
                ('unit', models.CharField(blank=True, max_length=50, verbose_name='Unidad')),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=14, verbose_name='Precio unitario')),
                ('order', models.PositiveSmallIntegerField(default=0, verbose_name='Orden')),
                ('quote', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='line_items',
                    to='projects.quote',
                    verbose_name='Cotización',
                )),
            ],
            options={
                'verbose_name': 'Partida de cotización',
                'verbose_name_plural': 'Partidas de cotización',
                'ordering': ['order', 'id'],
            },
        ),
    ]
