from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0011_quote'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Add quote_number to Quote
        migrations.AddField(
            model_name='quote',
            name='quote_number',
            field=models.CharField(blank=True, max_length=30, unique=True, verbose_name='Número de cotización'),
        ),

        # QuoteTemplate
        migrations.CreateModel(
            name='QuoteTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Nombre')),
                ('description', models.TextField(blank=True, verbose_name='Descripción')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='quote_templates_created',
                    to=settings.AUTH_USER_MODEL,
                    verbose_name='Creada por',
                )),
            ],
            options={
                'verbose_name': 'Plantilla de cotización',
                'verbose_name_plural': 'Plantillas de cotización',
                'ordering': ['name'],
            },
        ),

        # QuoteTemplateLineItem
        migrations.CreateModel(
            name='QuoteTemplateLineItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category', models.CharField(
                    choices=[('materials','Materiales'),('labor','Mano de obra'),('equipment','Equipos'),('other','Otros')],
                    default='other', max_length=20, verbose_name='Categoría',
                )),
                ('description', models.CharField(max_length=500, verbose_name='Descripción')),
                ('quantity', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Cantidad')),
                ('unit', models.CharField(blank=True, max_length=50, verbose_name='Unidad')),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=14, verbose_name='Precio referencia')),
                ('order', models.PositiveSmallIntegerField(default=0, verbose_name='Orden')),
                ('template', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='line_items',
                    to='projects.quotetemplate',
                    verbose_name='Plantilla',
                )),
            ],
            options={
                'verbose_name': 'Partida de plantilla',
                'verbose_name_plural': 'Partidas de plantilla',
                'ordering': ['order', 'id'],
            },
        ),
    ]
