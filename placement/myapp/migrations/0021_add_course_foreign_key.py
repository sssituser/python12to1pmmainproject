# Generated migration to add course foreign key to FacultyCourseHistory

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0020_add_faculty_foreign_keys'),
    ]

    operations = [
        # Add course_id to FacultyCourseHistory
        migrations.AddField(
            model_name='facultycoursehistory',
            name='course',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.CASCADE, 
                related_name='faculty_course_history', 
                to='myapp.course'
            ),
        ),
    ]
