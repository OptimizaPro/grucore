from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0009_add_client_avatar_field'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectNote',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('body',       models.TextField(verbose_name='Contenido')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('project',    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notes', to='projects.project', verbose_name='Proyecto')),
                ('author',     models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='project_notes', to=settings.AUTH_USER_MODEL, verbose_name='Autor')),
            ],
            options={
                'verbose_name':        'Nota interna',
                'verbose_name_plural': 'Notas internas',
                'ordering':            ['-created_at'],
            },
        ),
    ]
