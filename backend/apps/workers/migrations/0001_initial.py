from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('projects', '0006_task_project_cancelled_completed'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Worker',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100, verbose_name='Nombre')),
                ('last_name', models.CharField(max_length=100, verbose_name='Apellidos')),
                ('dpi', models.CharField(blank=True, max_length=20, verbose_name='DPI')),
                ('phone', models.CharField(blank=True, max_length=20, verbose_name='Teléfono')),
                ('emergency_contact_name', models.CharField(blank=True, max_length=200, verbose_name='Contacto de emergencia')),
                ('emergency_contact_phone', models.CharField(blank=True, max_length=20, verbose_name='Teléfono de emergencia')),
                ('position', models.CharField(
                    choices=[
                        ('peon', 'Peón'), ('oficial', 'Oficial'), ('maestro_obras', 'Maestro de obras'),
                        ('albanil', 'Albañil'), ('electricista', 'Electricista'), ('fontanero', 'Fontanero'),
                        ('soldador', 'Soldador'), ('carpintero', 'Carpintero'), ('supervisor', 'Supervisor'),
                        ('otro', 'Otro'),
                    ],
                    default='peon', max_length=20, verbose_name='Cargo',
                )),
                ('daily_rate_gtq', models.DecimalField(
                    decimal_places=2, default=0, max_digits=10,
                    validators=[django.core.validators.MinValueValidator(0)],
                    verbose_name='Tarifa diaria (GTQ)',
                )),
                ('hire_date', models.DateField(blank=True, null=True, verbose_name='Fecha de ingreso')),
                ('status', models.CharField(
                    choices=[('active', 'Activo'), ('inactive', 'Inactivo')],
                    default='active', max_length=10, verbose_name='Estado',
                )),
                ('notes', models.TextField(blank=True, verbose_name='Notas')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='created_workers',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Registrado por',
                )),
                ('current_project', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='workers',
                    to='projects.project',
                    verbose_name='Proyecto actual',
                )),
            ],
            options={
                'verbose_name': 'Trabajador',
                'verbose_name_plural': 'Trabajadores',
                'ordering': ['last_name', 'first_name'],
            },
        ),
        migrations.CreateModel(
            name='WorkLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(verbose_name='Fecha')),
                ('regular_hours', models.DecimalField(
                    decimal_places=1, default=8, max_digits=5,
                    validators=[django.core.validators.MinValueValidator(0)],
                    verbose_name='Horas regulares',
                )),
                ('overtime_hours', models.DecimalField(
                    decimal_places=1, default=0, max_digits=5,
                    validators=[django.core.validators.MinValueValidator(0)],
                    verbose_name='Horas extra',
                )),
                ('notes', models.TextField(blank=True, verbose_name='Observaciones')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='created_work_logs',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('project', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='work_logs',
                    to='projects.project',
                    verbose_name='Proyecto',
                )),
                ('worker', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='work_logs',
                    to='workers.worker',
                    verbose_name='Trabajador',
                )),
            ],
            options={
                'verbose_name': 'Jornada de trabajo',
                'verbose_name_plural': 'Jornadas de trabajo',
                'ordering': ['-date'],
            },
        ),
        migrations.AddConstraint(
            model_name='worklog',
            constraint=models.UniqueConstraint(
                fields=['worker', 'date', 'project'],
                name='unique_worker_date_project',
            ),
        ),
    ]
