from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='worklog',
            name='start_time',
            field=models.TimeField(blank=True, null=True, verbose_name='Hora de inicio'),
        ),
        migrations.AddField(
            model_name='worklog',
            name='end_time',
            field=models.TimeField(blank=True, null=True, verbose_name='Hora de fin'),
        ),
        migrations.AlterField(
            model_name='worklog',
            name='regular_hours',
            field=models.DecimalField(
                decimal_places=2, default=8, max_digits=5,
                verbose_name='Horas regulares',
            ),
        ),
        migrations.AlterField(
            model_name='worklog',
            name='overtime_hours',
            field=models.DecimalField(
                decimal_places=2, default=0, max_digits=5,
                verbose_name='Horas extra',
            ),
        ),
        migrations.AlterModelOptions(
            name='worklog',
            options={
                'ordering': ['-date', '-start_time'],
                'verbose_name': 'Jornada de trabajo',
                'verbose_name_plural': 'Jornadas de trabajo',
            },
        ),
    ]
