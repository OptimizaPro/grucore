from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0003_punchitem_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='document',
            name='visible_to_client',
            field=models.BooleanField(default=False, verbose_name='Visible al cliente'),
        ),
    ]
