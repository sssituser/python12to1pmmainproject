# Generated migration for FacultyProfile field changes

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0015_facultyachievement_facultycoursehistory_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='facultyprofile',
            name='first_name',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='facultyprofile',
            name='last_name',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
