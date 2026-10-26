from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0006_task_project_cancelled_completed'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectContact',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name',       models.CharField(max_length=200, verbose_name='Nombre')),
                ('role',       models.CharField(blank=True, max_length=200, verbose_name='Cargo')),
                ('company',    models.CharField(blank=True, max_length=200, verbose_name='Empresa')),
                ('email',      models.EmailField(blank=True, verbose_name='Email')),
                ('phone',      models.CharField(blank=True, max_length=30, verbose_name='Teléfono')),
                ('avatar_url', models.URLField(blank=True, verbose_name='Avatar URL')),
                ('order',      models.PositiveSmallIntegerField(default=0, verbose_name='Orden')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project',    models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='contacts',
                    to='projects.project',
                    verbose_name='Proyecto',
                )),
            ],
            options={
                'verbose_name':        'Contacto del proyecto',
                'verbose_name_plural': 'Contactos del proyecto',
                'ordering':            ['order', 'created_at'],
            },
        ),
    ]
