from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='CompanySettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logo',       models.ImageField(blank=True, null=True, upload_to='brand/', verbose_name='Logo (fondo oscuro)')),
                ('logo_light', models.ImageField(blank=True, null=True, upload_to='brand/', verbose_name='Logo (fondo claro)')),
                ('name',       models.CharField(default='Grucore', max_length=200, verbose_name='Nombre de empresa')),
                ('tagline',    models.CharField(blank=True, default='Construcción y Remodelación Premium', max_length=300, verbose_name='Tagline')),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Configuración de empresa',
                'verbose_name_plural': 'Configuración de empresa',
            },
        ),
    ]
