from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cms', '0004_service_page_images'),
        ('media_assets', '0002_add_context_field'),
    ]

    operations = [
        # Fix: rename residential_construction → residential in existing ServicePage rows
        migrations.RunSQL(
            sql="UPDATE cms_servicepage SET slug = 'residential' WHERE slug = 'residential_construction';",
            reverse_sql="UPDATE cms_servicepage SET slug = 'residential_construction' WHERE slug = 'residential';",
        ),

        # Actualizar choices en ServicePage.slug (solo metadatos, sin cambio de columna)
        migrations.AlterField(
            model_name='servicepage',
            name='slug',
            field=models.CharField(
                choices=[
                    ('residential',    'Construcción Residencial'),
                    ('remodeling',     'Remodelación Interior'),
                    ('commercial',     'Proyectos Comerciales'),
                    ('design_build',   'Diseño y Construcción'),
                    ('industrial',     'Construcción Industrial'),
                    ('kitchens_baths', 'Cocinas y Baños'),
                ],
                max_length=60,
                unique=True,
                verbose_name='Servicio',
            ),
        ),

        # Nuevo modelo ProjectPage
        migrations.CreateModel(
            name='ProjectPage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('slug', models.CharField(
                    choices=[
                        ('residencia-los-palmerales',         'Residencia Los Palmerales'),
                        ('oficinas-corporativas-torre-norte', 'Oficinas Corporativas Torre Norte'),
                        ('restaurante-costa-del-este',        'Restaurante Costa del Este'),
                        ('bodega-industrial-zona-franca',     'Bodega Industrial Zona Franca'),
                        ('remodelacion-casa-zona-15',         'Remodelación Casa Zona 15'),
                        ('clinica-medica-pradera',            'Clínica Médica Pradera'),
                    ],
                    max_length=100,
                    unique=True,
                    verbose_name='Proyecto',
                )),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('after_image', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='project_afters',
                    to='media_assets.mediaasset',
                    verbose_name='Imagen "Después"',
                )),
                ('before_image', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='project_befores',
                    to='media_assets.mediaasset',
                    verbose_name='Imagen "Antes"',
                )),
                ('cover_image', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='project_covers',
                    to='media_assets.mediaasset',
                    verbose_name='Imagen de portada',
                )),
            ],
            options={
                'verbose_name': 'Imágenes de proyecto',
                'verbose_name_plural': 'Imágenes por proyecto',
                'ordering': ['slug'],
            },
        ),
    ]
