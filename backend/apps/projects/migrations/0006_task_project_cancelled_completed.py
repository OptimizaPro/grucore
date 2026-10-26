from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0005_add_cover_photo_to_project'),
    ]

    operations = [
        # Add project FK to Task
        migrations.AddField(
            model_name='task',
            name='project',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tasks',
                to='projects.project',
                verbose_name='Proyecto',
            ),
        ),
        # Make phase optional (SET_NULL instead of CASCADE)
        migrations.AlterField(
            model_name='task',
            name='phase',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='phase_tasks',
                to='projects.phase',
                verbose_name='Fase',
            ),
        ),
        # Add completed_at
        migrations.AddField(
            model_name='task',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True, verbose_name='Completado el'),
        ),
        # Add cancelled + urgent to choices
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending',     'Pendiente'),
                    ('in_progress', 'En progreso'),
                    ('review',      'En revisión'),
                    ('done',        'Completado'),
                    ('blocked',     'Bloqueado'),
                    ('cancelled',   'Cancelado'),
                ],
                default='pending',
                max_length=20,
                verbose_name='Estado de la tarea',
            ),
        ),
        migrations.AlterField(
            model_name='task',
            name='priority',
            field=models.CharField(
                choices=[
                    ('low',      'Baja'),
                    ('medium',   'Media'),
                    ('high',     'Alta'),
                    ('critical', 'Crítica'),
                    ('urgent',   'Urgente'),
                ],
                default='medium',
                max_length=10,
                verbose_name='Prioridad',
            ),
        ),
    ]
