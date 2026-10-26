import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('projects', '0006_task_project_cancelled_completed'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pipeline',
            fields=[
                ('id',          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name',        models.CharField(max_length=200, verbose_name='Nombre')),
                ('description', models.TextField(blank=True, verbose_name='Descripción')),
                ('is_default',  models.BooleanField(default=False, verbose_name='Por defecto')),
                ('created_at',  models.DateTimeField(auto_now_add=True)),
                ('updated_at',  models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name':        'Pipeline',
                'verbose_name_plural': 'Pipelines',
                'ordering':            ['name'],
            },
        ),
        migrations.CreateModel(
            name='PipelineStage',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pipeline',   models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='stages', to='crm.pipeline', verbose_name='Pipeline')),
                ('name',       models.CharField(max_length=150, verbose_name='Nombre')),
                ('order',      models.PositiveIntegerField(default=0, verbose_name='Orden')),
                ('color',      models.CharField(default='#8A95A5', max_length=7, verbose_name='Color')),
                ('is_won',     models.BooleanField(default=False, verbose_name='Es ganado')),
                ('is_lost',    models.BooleanField(default=False, verbose_name='Es perdido')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name':        'Etapa del pipeline',
                'verbose_name_plural': 'Etapas del pipeline',
                'ordering':            ['pipeline', 'order'],
                'unique_together':     {('pipeline', 'order')},
            },
        ),
        migrations.CreateModel(
            name='Lead',
            fields=[
                ('id',                   models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pipeline',             models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='leads', to='crm.pipeline', verbose_name='Pipeline')),
                ('stage',                models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='leads', to='crm.pipelinestage', verbose_name='Etapa')),
                ('full_name',            models.CharField(max_length=300, verbose_name='Nombre completo')),
                ('email',                models.EmailField(blank=True, verbose_name='Email')),
                ('phone',                models.CharField(blank=True, max_length=50, verbose_name='Teléfono')),
                ('company',              models.CharField(blank=True, max_length=300, verbose_name='Empresa')),
                ('city',                 models.CharField(blank=True, max_length=150, verbose_name='Ciudad')),
                ('source',               models.CharField(choices=[('instagram', 'Instagram'), ('facebook', 'Facebook'), ('meta_ads', 'Meta Ads'), ('linkedin', 'LinkedIn'), ('youtube', 'YouTube'), ('tiktok', 'TikTok'), ('organic_search', 'Búsqueda orgánica'), ('referral', 'Referido'), ('widget', 'Widget web'), ('direct', 'Directo'), ('other', 'Otro')], default='other', max_length=20, verbose_name='Fuente')),
                ('service_type',         models.CharField(choices=[('construction', 'Construcción'), ('renovation', 'Remodelación'), ('commercial', 'Comercial'), ('residential', 'Residencial'), ('other', 'Otro')], default='other', max_length=20, verbose_name='Tipo de servicio')),
                ('notes',                models.TextField(blank=True, verbose_name='Notas')),
                ('estimated_value_gtq',  models.DecimalField(blank=True, decimal_places=2, max_digits=14, null=True, verbose_name='Valor estimado (GTQ)')),
                ('assigned_to',          models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_leads', to=settings.AUTH_USER_MODEL, verbose_name='Asignado a')),
                ('converted_project',    models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='source_lead', to='projects.project', verbose_name='Proyecto convertido')),
                ('converted_at',         models.DateTimeField(blank=True, null=True, verbose_name='Fecha de conversión')),
                ('status',               models.CharField(choices=[('active', 'Activo'), ('won', 'Ganado'), ('lost', 'Perdido'), ('archived', 'Archivado')], default='active', max_length=20, verbose_name='Estado')),
                ('created_at',           models.DateTimeField(auto_now_add=True)),
                ('updated_at',           models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name':        'Lead',
                'verbose_name_plural': 'Leads',
                'ordering':            ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='LeadActivity',
            fields=[
                ('id',            models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('lead',          models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='activities', to='crm.lead', verbose_name='Lead')),
                ('user',          models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, verbose_name='Usuario')),
                ('activity_type', models.CharField(choices=[('note', 'Nota'), ('call', 'Llamada'), ('email', 'Email'), ('meeting', 'Reunión'), ('stage_change', 'Cambio de etapa'), ('conversion', 'Conversión a proyecto')], max_length=20, verbose_name='Tipo de actividad')),
                ('content',       models.TextField(verbose_name='Contenido')),
                ('created_at',    models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name':        'Actividad de lead',
                'verbose_name_plural': 'Actividades de lead',
                'ordering':            ['-created_at'],
            },
        ),
    ]
