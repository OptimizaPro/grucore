from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('inventory', '0001_initial'),
        ('projects', '0012_quote_templates'),
    ]

    operations = [
        migrations.AddField(
            model_name='quotelineitem',
            name='product',
            field=models.ForeignKey(
                blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='quote_line_items',
                to='inventory.product',
                verbose_name='Producto de inventario',
            ),
        ),
    ]
