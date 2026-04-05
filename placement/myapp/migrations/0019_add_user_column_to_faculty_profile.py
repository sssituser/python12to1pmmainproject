# Generated migration to add user column to faculty profile

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0018_merge_20260405_0257'),
    ]

    operations = [
        migrations.AddField(
            model_name='facultyprofile',
            name='user',
            field=models.OneToOneField(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.CASCADE, 
                related_name='faculty_profile', 
                to='myapp.user'
            ),
        ),
    ]
