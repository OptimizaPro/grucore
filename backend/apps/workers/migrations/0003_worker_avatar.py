from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workers', '0002_worklog_start_end_time'),
    ]

    operations = [
        migrations.AddField(
            model_name='worker',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='workers/avatars/', verbose_name='Foto'),
        ),
    ]
