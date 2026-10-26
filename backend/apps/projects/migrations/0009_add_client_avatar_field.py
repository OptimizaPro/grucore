from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0008_add_contact_avatar_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='client',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='clients/avatars/', verbose_name='Avatar'),
        ),
    ]
