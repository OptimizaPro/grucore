from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Supplier',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=300, verbose_name='Nombre')),
                ('category', models.CharField(
                    choices=[
                        ('materials', 'Materiales'),
                        ('equipment', 'Equipos y maquinaria'),
                        ('subcontractor', 'Subcontratista'),
                        ('services', 'Servicios'),
                        ('tools', 'Herramientas'),
                        ('transport', 'Transporte'),
                        ('other', 'Otro'),
                    ],
                    default='other',
                    max_length=20,
                    verbose_name='Categoría',
                )),
                ('contact_person', models.CharField(blank=True, max_length=200, verbose_name='Persona de contacto')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='Correo electrónico')),
                ('phone', models.CharField(blank=True, max_length=50, verbose_name='Teléfono')),
                ('nit', models.CharField(blank=True, max_length=50, verbose_name='NIT')),
                ('address', models.TextField(blank=True, verbose_name='Dirección')),
                ('website', models.URLField(blank=True, verbose_name='Sitio web')),
                ('notes', models.TextField(blank=True, verbose_name='Notas')),
                ('rating', models.PositiveSmallIntegerField(
                    default=0,
                    help_text='0 = sin rating, 1–5 estrellas',
                    verbose_name='Rating (0–5)',
                )),
                ('is_active', models.BooleanField(default=True, verbose_name='Activo')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Creado el')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Actualizado el')),
            ],
            options={
                'verbose_name': 'Proveedor',
                'verbose_name_plural': 'Proveedores',
                'ordering': ['name'],
            },
        ),
    ]
