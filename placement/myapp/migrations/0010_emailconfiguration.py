from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0009_course_courseenrollment_coursetopic_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('provider_name', models.CharField(default='Gmail SMTP', max_length=100)),
                ('email_host', models.CharField(default='smtp.gmail.com', max_length=255)),
                ('email_port', models.PositiveIntegerField(default=587)),
                ('email_host_user', models.EmailField(max_length=254)),
                ('email_host_password', models.CharField(max_length=255)),
                ('email_use_tls', models.BooleanField(default=True)),
                ('email_use_ssl', models.BooleanField(default=False)),
                ('default_from_email', models.EmailField(blank=True, max_length=254)),
                ('is_active', models.BooleanField(default=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]
