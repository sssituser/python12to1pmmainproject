# Generated manually to add user field to LeaveRequest

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0021_add_course_foreign_key'),
    ]

    operations = [
        migrations.AddField(
            model_name='leaverequest',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='myapp.user'),
        ),
    ]
