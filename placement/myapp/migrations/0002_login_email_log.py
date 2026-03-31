# Generated migration for LoginEmailLog model

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='LoginEmailLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email_address', models.EmailField(max_length=254)),
                ('email_subject', models.CharField(default='🔐 Login Confirmation - SSSIT Placement Portal', max_length=255)),
                ('email_message_id', models.CharField(blank=True, help_text='IMAP Message ID for deletion', max_length=255, null=True)),
                ('sent_at', models.DateTimeField(auto_now_add=True)),
                ('is_deleted', models.BooleanField(default=False, help_text='Soft delete flag')),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('login_time', models.CharField(blank=True, max_length=50)),
                ('user_ip', models.CharField(blank=True, max_length=50)),
                ('browser_info', models.CharField(blank=True, max_length=255)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='login_email_logs', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-sent_at'],
            },
        ),
        migrations.AddIndex(
            model_name='loginemaillog',
            index=models.Index(fields=['user', '-sent_at'], name='myapp_login_user_id_sent_at_idx'),
        ),
        migrations.AddIndex(
            model_name='loginemaillog',
            index=models.Index(fields=['is_deleted', '-sent_at'], name='myapp_login_is_deleted_sent_at_idx'),
        ),
    ]
