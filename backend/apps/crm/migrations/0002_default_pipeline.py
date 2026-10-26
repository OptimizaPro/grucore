from django.db import migrations


def create_default_pipeline(apps, schema_editor):
    Pipeline      = apps.get_model('crm', 'Pipeline')
    PipelineStage = apps.get_model('crm', 'PipelineStage')

    pipeline = Pipeline.objects.create(
        name='Pipeline Grucore',
        is_default=True,
    )

    stages = [
        {'order': 1, 'name': 'Nuevo contacto',     'color': '#8A95A5', 'is_won': False, 'is_lost': False},
        {'order': 2, 'name': 'Contactado',          'color': '#6B8CFF', 'is_won': False, 'is_lost': False},
        {'order': 3, 'name': 'Visita de diagnóstico', 'color': '#A78BFA', 'is_won': False, 'is_lost': False},
        {'order': 4, 'name': 'Propuesta enviada',   'color': '#FF6B35', 'is_won': False, 'is_lost': False},
        {'order': 5, 'name': 'Negociación',         'color': '#F59E0B', 'is_won': False, 'is_lost': False},
        {'order': 6, 'name': 'Ganado — Proyecto',   'color': '#4A9E6B', 'is_won': True,  'is_lost': False},
        {'order': 7, 'name': 'Perdido',             'color': '#f87171', 'is_won': False, 'is_lost': True},
    ]

    for s in stages:
        PipelineStage.objects.create(pipeline=pipeline, **s)


def remove_default_pipeline(apps, schema_editor):
    Pipeline = apps.get_model('crm', 'Pipeline')
    Pipeline.objects.filter(name='Pipeline Grucore', is_default=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('crm', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_pipeline, remove_default_pipeline),
    ]
