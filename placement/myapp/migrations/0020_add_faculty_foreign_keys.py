# Generated migration to add foreign key relationships to faculty-related tables

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0019_add_user_column_to_faculty_profile'),
    ]

    operations = [
        # Add faculty_profile_id to FacultyAchievement
        migrations.AddField(
            model_name='facultyachievement',
            name='faculty_profile',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.CASCADE, 
                related_name='achievements', 
                to='myapp.facultyprofile'
            ),
        ),
        
        # Add faculty_profile_id to FacultyResearch
        migrations.AddField(
            model_name='facultyresearch',
            name='faculty_profile',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.CASCADE, 
                related_name='research_projects', 
                to='myapp.facultyprofile'
            ),
        ),
        
        # Add faculty_profile_id to FacultyCourseHistory
        migrations.AddField(
            model_name='facultycoursehistory',
            name='faculty_profile',
            field=models.ForeignKey(
                blank=True, 
                null=True, 
                on_delete=django.db.models.deletion.CASCADE, 
                related_name='course_history', 
                to='myapp.facultyprofile'
            ),
        ),
    ]
