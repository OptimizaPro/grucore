from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0002_alter_punchitem_options_alter_rfi_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='punchitem',
            name='category',
            field=models.CharField(
                choices=[
                    ('correction',     'Corrección'),
                    ('observation',    'Observación'),
                    ('non_conformity', 'No conformidad'),
                    ('risk',           'Riesgo'),
                    ('other',          'Otro'),
                ],
                default='correction',
                max_length=20,
                verbose_name='Categoría',
            ),
        ),
    ]
