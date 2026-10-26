from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='inventorycategory',
            name='tracks_stock',
            field=models.BooleanField(
                default=True,
                verbose_name='Gestiona stock',
                help_text='Desactivar en categorías de servicios (mano de obra, etc.) que no requieren control de inventario.',
            ),
        ),
    ]
